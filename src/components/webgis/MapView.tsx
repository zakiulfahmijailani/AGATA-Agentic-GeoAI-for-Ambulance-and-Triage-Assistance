'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import type { GeoJSONSource, Map as MapboxMap, Marker } from 'mapbox-gl';
import { Ambulance, Building2 } from 'lucide-react';
import { createRoot, type Root } from 'react-dom/client';
import {
  BED_STATUS_COLOR,
  BED_STATUS_LABEL,
  getBedStatus,
  Hospital,
} from '@/types';

interface MapViewProps {
  hospitals: Hospital[];
  patientLocation: [number, number] | null;
  recommendedIds: string[];
  selectedHospitalId?: string | null;
  onHospitalClick?: (hospital: Hospital) => void;
}

const MAP_CENTER: [number, number] = [106.8456, -6.2088];
const MAP_ZOOM = 11;
const MAP_STYLE = 'mapbox://styles/mapbox/dark-v11';
const ROUTE_SOURCE_ID = 'agata-routes';
const RADIUS_SOURCE_ID = 'agata-patient-radius';

interface MarkerWithRoot {
  marker: Marker;
  root: Root;
}

function isUsableToken(token: string | undefined): token is string {
  return Boolean(token && token.startsWith('pk.') && token !== 'pk.your_mapbox_public_token_here');
}

function markerColor(hospital: Hospital): string {
  return BED_STATUS_COLOR[getBedStatus(hospital)];
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function getMapSource(map: MapboxMap, sourceId: string): GeoJSONSource | null {
  const source = map.getSource(sourceId);
  return source && 'setData' in source ? (source as GeoJSONSource) : null;
}

function createRadiusPolygon(
  center: [number, number],
  radiusKm: number,
): GeoJSON.Feature<GeoJSON.Polygon> {
  const [lng, lat] = center;
  const points: [number, number][] = [];
  const earthRadiusKm = 6371;

  for (let index = 0; index <= 64; index += 1) {
    const angle = (index / 64) * Math.PI * 2;
    const latOffset = (radiusKm / earthRadiusKm) * (180 / Math.PI);
    const lngOffset = latOffset / Math.cos((lat * Math.PI) / 180);
    points.push([lng + lngOffset * Math.cos(angle), lat + latOffset * Math.sin(angle)]);
  }

  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [points],
    },
  };
}

function createRouteData(
  hospitals: Hospital[],
  recommendedIds: string[],
  patientLocation: [number, number] | null,
): GeoJSON.FeatureCollection<GeoJSON.LineString> {
  if (!patientLocation) {
    return { type: 'FeatureCollection', features: [] };
  }

  const recommended = hospitals.filter((hospital) => recommendedIds.includes(hospital.id));
  return {
    type: 'FeatureCollection',
    features: recommended.map((hospital) => ({
      type: 'Feature',
      properties: { id: hospital.id },
      geometry: {
        type: 'LineString',
        coordinates: [patientLocation, hospital.coordinates],
      },
    })),
  };
}

function coordinateToFallbackPosition([lng, lat]: [number, number]) {
  const minLng = 106.72;
  const maxLng = 106.92;
  const minLat = -6.33;
  const maxLat = -6.12;
  const left = ((lng - minLng) / (maxLng - minLng)) * 100;
  const top = ((maxLat - lat) / (maxLat - minLat)) * 100;

  return {
    left: `${Math.min(96, Math.max(4, left))}%`,
    top: `${Math.min(96, Math.max(4, top))}%`,
  };
}

function HospitalMarkerIcon({ color }: { color: string }) {
  return (
    <div
      className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-slate-950 text-sm font-black text-slate-950 shadow-lg"
      style={{ backgroundColor: color, boxShadow: `0 0 18px ${color}66` }}
    >
      +
    </div>
  );
}

function PatientMarkerIcon() {
  return (
    <div className="relative flex h-9 w-9 items-center justify-center">
      <span className="absolute h-9 w-9 rounded-full bg-sky-400/30 marker-pulse" />
      <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-sky-400 text-slate-950 shadow-lg shadow-sky-500/40">
        <Ambulance className="h-4 w-4" />
      </span>
    </div>
  );
}

export default function MapView({
  hospitals,
  patientLocation,
  recommendedIds,
  selectedHospitalId = null,
  onHospitalClick,
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const hospitalMarkersRef = useRef<Map<string, MarkerWithRoot>>(new Map());
  const patientMarkerRef = useRef<MarkerWithRoot | null>(null);
  const [fallbackMode, setFallbackMode] = useState(false);

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const recommendedHospitals = useMemo(
    () => hospitals.filter((hospital) => recommendedIds.includes(hospital.id)),
    [hospitals, recommendedIds],
  );

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!isUsableToken(token)) {
      setFallbackMode(true);
      return;
    }

    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: MAP_STYLE,
      center: MAP_CENTER,
      zoom: MAP_ZOOM,
    });

    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right');
    map.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    map.on('load', () => {
      map.addSource(ROUTE_SOURCE_ID, {
        type: 'geojson',
        data: createRouteData(hospitals, recommendedIds, patientLocation),
      });
      map.addLayer({
        id: ROUTE_SOURCE_ID,
        type: 'line',
        source: ROUTE_SOURCE_ID,
        paint: {
          'line-color': '#14b8a6',
          'line-width': 2,
          'line-opacity': 0.9,
          'line-dasharray': [2, 1],
        },
      });

      map.addSource(RADIUS_SOURCE_ID, {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: patientLocation ? [createRadiusPolygon(patientLocation, 5)] : [],
        },
      });
      map.addLayer({
        id: `${RADIUS_SOURCE_ID}-fill`,
        type: 'fill',
        source: RADIUS_SOURCE_ID,
        paint: {
          'fill-color': '#0ea5e9',
          'fill-opacity': 0.08,
        },
      });
      map.addLayer({
        id: `${RADIUS_SOURCE_ID}-line`,
        type: 'line',
        source: RADIUS_SOURCE_ID,
        paint: {
          'line-color': '#0ea5e9',
          'line-width': 1.5,
          'line-opacity': 0.75,
        },
      });
    });

    return () => {
      hospitalMarkersRef.current.forEach(({ marker, root }) => {
        root.unmount();
        marker.remove();
      });
      hospitalMarkersRef.current.clear();
      if (patientMarkerRef.current) {
        patientMarkerRef.current.root.unmount();
        patientMarkerRef.current.marker.remove();
        patientMarkerRef.current = null;
      }
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    hospitalMarkersRef.current.forEach(({ marker, root }) => {
      root.unmount();
      marker.remove();
    });
    hospitalMarkersRef.current.clear();

    hospitals.forEach((hospital) => {
      const color = markerColor(hospital);
      const element = document.createElement('button');
      element.type = 'button';
      element.className = `hospital-marker ${recommendedIds.includes(hospital.id) ? 'is-recommended' : ''}`;
      element.setAttribute('aria-label', hospital.name);
      element.addEventListener('click', () => onHospitalClick?.(hospital));

      const root = createRoot(element);
      root.render(<HospitalMarkerIcon color={color} />);

      const popup = new mapboxgl.Popup({ offset: 24 }).setHTML(
        `<strong>${escapeHtml(hospital.shortName)}</strong><br/>${escapeHtml(
          BED_STATUS_LABEL[getBedStatus(hospital)],
        )} · ${hospital.bedsAvailable}/${hospital.totalBeds} bed · ${escapeHtml(hospital.level)}`,
      );

      const marker = new mapboxgl.Marker({ element })
        .setLngLat(hospital.coordinates)
        .setPopup(popup)
        .addTo(map);

      hospitalMarkersRef.current.set(hospital.id, { marker, root });
    });
  }, [hospitals, onHospitalClick, recommendedIds]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (patientMarkerRef.current) {
      patientMarkerRef.current.root.unmount();
      patientMarkerRef.current.marker.remove();
      patientMarkerRef.current = null;
    }

    if (patientLocation) {
      const element = document.createElement('div');
      const root = createRoot(element);
      root.render(<PatientMarkerIcon />);
      const marker = new mapboxgl.Marker({ element }).setLngLat(patientLocation).addTo(map);
      patientMarkerRef.current = { marker, root };

      map.flyTo({
        center: patientLocation,
        zoom: 13,
        duration: 1200,
        essential: true,
      });
    }

    const routeSource = getMapSource(map, ROUTE_SOURCE_ID);
    routeSource?.setData(createRouteData(hospitals, recommendedIds, patientLocation));

    const radiusSource = getMapSource(map, RADIUS_SOURCE_ID);
    radiusSource?.setData({
      type: 'FeatureCollection',
      features: patientLocation ? [createRadiusPolygon(patientLocation, 5)] : [],
    });
  }, [hospitals, patientLocation, recommendedIds]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedHospitalId) return;

    const hospital = hospitals.find((item) => item.id === selectedHospitalId);
    if (!hospital) return;

    map.flyTo({
      center: hospital.coordinates,
      zoom: 14,
      duration: 900,
      essential: true,
    });
  }, [hospitals, selectedHospitalId]);

  return (
    <section className="relative h-full flex-1 overflow-hidden bg-[#07101f]">
      <div ref={mapContainerRef} className="h-full w-full" />

      {fallbackMode ? (
        <div className="absolute inset-0 overflow-hidden bg-[#07101f]">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.08)_1px,transparent_1px)] bg-[size:44px_44px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.12),transparent_55%)]" />
          {patientLocation ? (
            <div className="absolute h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-400/60 bg-sky-400/10" style={coordinateToFallbackPosition(patientLocation)} />
          ) : null}
          {patientLocation
            ? recommendedHospitals.map((hospital) => {
                const patientPosition = coordinateToFallbackPosition(patientLocation);
                const hospitalPosition = coordinateToFallbackPosition(hospital.coordinates);
                return (
                  <svg key={`route-${hospital.id}`} className="pointer-events-none absolute inset-0 h-full w-full">
                    <line
                      x1={patientPosition.left}
                      y1={patientPosition.top}
                      x2={hospitalPosition.left}
                      y2={hospitalPosition.top}
                      stroke="#14b8a6"
                      strokeWidth="2"
                      strokeDasharray="8 4"
                    />
                  </svg>
                );
              })
            : null}
          {hospitals.map((hospital) => {
            const color = markerColor(hospital);
            const isRecommended = recommendedIds.includes(hospital.id);
            return (
              <button
                key={hospital.id}
                type="button"
                onClick={() => onHospitalClick?.(hospital)}
                className={`hospital-marker absolute -translate-x-1/2 -translate-y-1/2 ${isRecommended ? 'is-recommended' : ''}`}
                style={coordinateToFallbackPosition(hospital.coordinates)}
                title={`${hospital.shortName}: ${hospital.bedsAvailable}/${hospital.totalBeds} bed`}
              >
                <HospitalMarkerIcon color={color} />
              </button>
            );
          })}
          {patientLocation ? (
            <div className="absolute -translate-x-1/2 -translate-y-1/2" style={coordinateToFallbackPosition(patientLocation)}>
              <PatientMarkerIcon />
            </div>
          ) : null}
          <div className="absolute left-5 top-5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]/90 px-3 py-2 text-xs text-[var(--color-text-muted)] backdrop-blur">
            Mapbox token belum dikonfigurasi
          </div>
        </div>
      ) : null}

      <div className="absolute bottom-5 left-5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]/90 p-3 text-xs text-[var(--color-text)] shadow-xl shadow-black/20 backdrop-blur">
        <div className="mb-2 flex items-center gap-2 font-semibold">
          <Building2 className="h-3.5 w-3.5 text-sky-300" />
          Status Kapasitas
        </div>
        <div className="space-y-1.5">
          {(['available', 'limited', 'full'] as const).map((status) => (
            <div key={status} className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: BED_STATUS_COLOR[status] }}
              />
              <span>{BED_STATUS_LABEL[status]}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
