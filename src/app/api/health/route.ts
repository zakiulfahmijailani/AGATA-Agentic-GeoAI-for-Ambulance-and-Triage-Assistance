import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const result = await sql`
      SELECT
        COUNT(*) AS total,
        COALESCE(SUM(capacity), 0) AS capacity,
        COALESCE(SUM(available_beds), 0) AS available_beds,
        PostGIS_Version() AS postgis_version
      FROM hospitals
    `;

    return NextResponse.json({
      success: true,
      status: 'connected',
      database: 'neon + postgis',
      hospital_count: Number(result[0].total),
      hospitals_count: Number(result[0].total),
      capacity: Number(result[0].capacity),
      available_beds: Number(result[0].available_beds),
      postgis_version: result[0].postgis_version,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, status: 'disconnected', error: String(error) },
      { status: 500 },
    );
  }
}
