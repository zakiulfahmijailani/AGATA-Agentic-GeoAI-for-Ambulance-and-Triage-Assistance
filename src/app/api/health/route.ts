import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const result = await sql`
      SELECT COUNT(*) AS total, PostGIS_Version() AS postgis_version
      FROM hospitals
    `;
    return NextResponse.json({
      success: true,
      status: 'connected',
      database: 'neon + postgis',
      hospitals_count: result[0].total,
      postgis_version: result[0].postgis_version,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, status: 'disconnected', error: String(error) },
      { status: 500 }
    );
  }
}
