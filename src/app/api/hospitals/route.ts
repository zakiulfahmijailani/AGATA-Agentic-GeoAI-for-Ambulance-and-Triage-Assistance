import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const zoneRaw = searchParams.get('zone');
  const traumaLevelRaw = searchParams.get('trauma_level');
  const erStatusRaw = searchParams.get('er_status');
  const limitRaw = searchParams.get('limit') ?? '500';
  const parsedLat = lat ? Number(lat) : null;
  const parsedLng = lng ? Number(lng) : null;
  const parsedLimit = Number(limitRaw);
  const parsedTraumaLevel =
    traumaLevelRaw && traumaLevelRaw !== 'All' ? Number(traumaLevelRaw) : null;
  const latNumber = parsedLat !== null && Number.isFinite(parsedLat) ? parsedLat : null;
  const lngNumber = parsedLng !== null && Number.isFinite(parsedLng) ? parsedLng : null;
  const zone = zoneRaw && zoneRaw !== 'All' ? zoneRaw : null;
  const traumaLevel =
    parsedTraumaLevel !== null && [1, 2, 3].includes(parsedTraumaLevel)
      ? parsedTraumaLevel
      : null;
  const erStatus = erStatusRaw && erStatusRaw !== 'All' ? erStatusRaw : null;
  const limit = Number.isFinite(parsedLimit) ? Math.min(Math.max(parsedLimit, 1), 500) : 500;

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
        CASE
          WHEN ${latNumber}::double precision IS NULL OR ${lngNumber}::double precision IS NULL THEN NULL
          ELSE ROUND(
            (ST_Distance(
              location::geography,
              ST_Point(${lngNumber}, ${latNumber})::geography
            ) / 1000)::numeric,
            2
          )::double precision
        END AS distance_km
      FROM hospitals
      WHERE (${zone}::text IS NULL OR zone = ${zone})
        AND (${traumaLevel}::int IS NULL OR trauma_level = ${traumaLevel})
        AND (${erStatus}::text IS NULL OR er_status = ${erStatus})
      ORDER BY
        CASE
          WHEN ${latNumber}::double precision IS NULL OR ${lngNumber}::double precision IS NULL THEN 0
          ELSE ST_Distance(
            location::geography,
            ST_Point(${lngNumber}, ${latNumber})::geography
          )
        END,
        zone,
        name
      LIMIT ${limit}
    `;

    const totalResult = await sql`
      SELECT COUNT(*) AS total
      FROM hospitals
      WHERE (${zone}::text IS NULL OR zone = ${zone})
        AND (${traumaLevel}::int IS NULL OR trauma_level = ${traumaLevel})
        AND (${erStatus}::text IS NULL OR er_status = ${erStatus})
    `;

    return NextResponse.json({
      hospitals,
      total: Number(totalResult[0].total),
    });
  } catch (error) {
    console.error('[API /hospitals] Error:', error);
    return NextResponse.json(
      { hospitals: [], total: 0, error: 'Database query failed' },
      { status: 500 },
    );
  }
}
