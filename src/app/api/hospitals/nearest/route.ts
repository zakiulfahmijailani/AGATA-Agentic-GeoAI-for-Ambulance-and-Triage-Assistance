import { neon } from '@neondatabase/serverless';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const radius = searchParams.get('radius') ?? '10000';
  const limit = searchParams.get('limit') ?? '3';

  if (!lat || !lng) {
    return NextResponse.json(
      { success: false, error: 'lat and lng parameters are required' },
      { status: 400 },
    );
  }

  try {
    const sql = neon(process.env.DATABASE_URL!);

    const hospitals = await sql`
      SELECT
        id,
        name,
        address,
        phone,
        zone,
        lat,
        lng,
        capacity,
        available_beds,
        er_status,
        trauma_level,
        operator,
        operator_type,
        website,
        osm_id,
        ROUND(
          (ST_Distance(
            location::geography,
            ST_Point(${parseFloat(lng)}, ${parseFloat(lat)})::geography
          ) / 1000)::numeric,
          2
        )::double precision AS distance_km
      FROM hospitals
      WHERE ST_DWithin(
        location::geography,
        ST_Point(${parseFloat(lng)}, ${parseFloat(lat)})::geography,
        ${parseInt(radius)}
      )
      ORDER BY distance_km
      LIMIT ${parseInt(limit)}
    `;

    return NextResponse.json({
      success: true,
      count: hospitals.length,
      hospitals,
      patient: { lat: parseFloat(lat), lng: parseFloat(lng) },
      radius_km: parseInt(radius) / 1000,
      data: hospitals,
    });
  } catch (error) {
    console.error('[API /hospitals/nearest] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Database query failed' },
      { status: 500 },
    );
  }
}
