import { neon } from '@neondatabase/serverless';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const limit = searchParams.get('limit') ?? '5';

  try {
    const sql = neon(process.env.DATABASE_URL!);

    // Jika ada koordinat pasien → query terdekat + hitung jarak
    if (lat && lng) {
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
          ) AS distance_km
        FROM hospitals
        ORDER BY distance_km
        LIMIT ${parseInt(limit)}
      `;
      return NextResponse.json({ success: true, data: hospitals });
    }

    // Tanpa koordinat → return semua RS
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
        ST_X(location::geometry) AS lng
      FROM hospitals
      ORDER BY zone, name
    `;
    return NextResponse.json({ success: true, data: hospitals });

  } catch (error) {
    console.error('[API /hospitals] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Database query failed' },
      { status: 500 }
    );
  }
}
