import { neon } from '@neondatabase/serverless';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const radius = searchParams.get('radius') ?? '10000'; // default 10km dalam meter
  const limit = searchParams.get('limit') ?? '3';

  if (!lat || !lng) {
    return NextResponse.json(
      { success: false, error: 'Parameter lat dan lng wajib diisi' },
      { status: 400 }
    );
  }

  try {
    const sql = neon(process.env.DATABASE_URL!);

    const hospitals = await sql`
      SELECT
        id,
        name,
        short_name,
        address,
        zone,
        beds_available,
        total_beds,
        level,
        phone,
        specializations,
        ST_Y(location::geometry) AS lat,
        ST_X(location::geometry) AS lng,
        ROUND(
          (ST_Distance(
            location::geography,
            ST_Point(${parseFloat(lng)}, ${parseFloat(lat)})::geography
          ) / 1000)::numeric,
          2
        ) AS distance_km,
        CASE
          WHEN beds_available >= 5 THEN 'available'
          WHEN beds_available >= 1 THEN 'limited'
          ELSE 'full'
        END AS bed_status
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
      patient: { lat: parseFloat(lat), lng: parseFloat(lng) },
      radius_km: parseInt(radius) / 1000,
      data: hospitals,
    });

  } catch (error) {
    console.error('[API /hospitals/nearest] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Database query failed' },
      { status: 500 }
    );
  }
}
