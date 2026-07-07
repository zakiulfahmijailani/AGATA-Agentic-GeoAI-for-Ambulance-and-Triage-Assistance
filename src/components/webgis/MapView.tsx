'use client';

import { useEffect, useMemo, useState } from 'react';
import L from 'leaflet';
import {
  Circle,
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
  ER_STATUS_COLOR,
  ER_STATUS_LABEL,
  Hospital,
  HospitalFilters,
  HospitalsApiResponse,
  ZONE_LABEL,
} from '@/types';
import FilterPanel from './FilterPanel';

type LeafletDefaultIconPrototype = L.Icon.Default & {
  _getIconUrl?: unknown;
};

delete (L.Icon.Default.prototype as LeafletDefaultIconPrototype)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
});

interface MapViewProps {
  filters: HospitalFilters;
  patientLocation: [number, number] | null;
  recommendedIds: number[];
  selectedHospitalId?: number | null;
  onFiltersChange: (filters: HospitalFilters) => void;
  onHospitalClick?: (hospital: Hospital) => void;
  onHospitalsChange?: (hospitals: Hospital[]) => void;
}

const DEFAULT_CENTER: [number, number] = [-6.2088, 106.8456];
const DEFAULT_ZOOM = 12;
const CARTO_POSITRON_URL =
  'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
const CARTO_ATTRIBUTION =
  '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://openstreetmap.org">OpenStreetMap</a>';

function toLeafletLatLng(hospital: Hospital): [number, number] {
  return [hospital.lat, hospital.lng];
}

function toPatientLatLng([lng, lat]: [number, number]): [number, number] {
  return [lat, lng];
}

function createHospitalIcon(hospital: Hospital, isRecommended: boolean): L.DivIcon {
  const color = ER_STATUS_COLOR[hospital.er_status];
  const size = isRecommended ? 40 : 30;

  return L.divIcon({
    className: 'agata-leaflet-icon',
    html: `<div class="agata-hospital-marker${
      isRecommended ? ' is-recommended' : ''
    }" style="--marker-color: ${color};">+</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

function createPatientIcon(): L.DivIcon {
  return L.divIcon({
    className: 'agata-leaflet-icon',
    html: '<div class="agata-patient-marker"><span></span><strong>+</strong></div>',
    iconSize: [42, 42],
    iconAnchor: [21, 21],
    popupAnchor: [0, -20],
  });
}

function buildHospitalsUrl(filters: HospitalFilters): string {
  const params = new URLSearchParams();
  if (filters.zone !== 'All') params.set('zone', filters.zone);
  if (filters.traumaLevel !== 'All') params.set('trauma_level', String(filters.traumaLevel));
  if (filters.erStatus !== 'All') params.set('er_status', filters.erStatus);
  const query = params.toString();
  return query ? `/api/hospitals?${query}` : '/api/hospitals';
}

function MapCamera({
  hospitals,
  patientLocation,
  selectedHospitalId,
}: {
  hospitals: Hospital[];
  patientLocation: [number, number] | null;
  selectedHospitalId: number | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!patientLocation) return;
    map.flyTo(toPatientLatLng(patientLocation), 13, { duration: 1.2 });
  }, [map, patientLocation]);

  useEffect(() => {
    if (!selectedHospitalId) return;

    const selectedHospital = hospitals.find((hospital) => hospital.id === selectedHospitalId);
    if (!selectedHospital) return;

    map.flyTo(toLeafletLatLng(selectedHospital), 14, { duration: 0.9 });
  }, [hospitals, map, selectedHospitalId]);

  return null;
}

export default function MapView({
  filters,
  patientLocation,
  recommendedIds,
  selectedHospitalId = null,
  onFiltersChange,
  onHospitalClick,
  onHospitalsChange,
}: MapViewProps) {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const recommendedHospitals = useMemo(
    () => hospitals.filter((hospital) => recommendedIds.includes(hospital.id)),
    [hospitals, recommendedIds],
  );
  const patientLatLng = patientLocation ? toPatientLatLng(patientLocation) : null;

  useEffect(() => {
    const controller = new AbortController();

    async function loadHospitals() {
      setIsLoading(true);
      try {
        const response = await fetch(buildHospitalsUrl(filters), {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error('Hospital API request failed');

        const data = (await response.json()) as HospitalsApiResponse;
        setHospitals(data.hospitals);
        setTotal(data.total);
        onHospitalsChange?.(data.hospitals);
      } catch (error) {
        if (!controller.signal.aborted) {
          setHospitals([]);
          setTotal(0);
          onHospitalsChange?.([]);
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void loadHospitals();

    return () => controller.abort();
  }, [filters, onHospitalsChange]);

  return (
    <section className="relative h-full flex-1 overflow-hidden bg-surface">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        zoomControl
        className="h-full w-full"
      >
        <TileLayer url={CARTO_POSITRON_URL} attribution={CARTO_ATTRIBUTION} />
        <MapCamera
          hospitals={hospitals}
          patientLocation={patientLocation}
          selectedHospitalId={selectedHospitalId}
        />

        {hospitals.map((hospital) => {
          const isRecommended = recommendedIds.includes(hospital.id);

          return (
            <Marker
              key={hospital.id}
              position={toLeafletLatLng(hospital)}
              icon={createHospitalIcon(hospital, isRecommended)}
              eventHandlers={{
                click: () => onHospitalClick?.(hospital),
              }}
            >
              <Popup>
                <div className="space-y-1 text-sm">
                  <div className="font-bold">{hospital.name}</div>
                  <div>Zone {ZONE_LABEL[hospital.zone]}</div>
                  <div>Trauma Level {hospital.trauma_level}</div>
                  <div>
                    ER {ER_STATUS_LABEL[hospital.er_status]} - {hospital.available_beds}/
                    {hospital.capacity} bed
                  </div>
                  {hospital.operator ? <div>{hospital.operator}</div> : null}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {patientLatLng ? (
          <>
            <Circle
              center={patientLatLng}
              radius={5000}
              pathOptions={{
                  color: '#00B4B4',
                  fillColor: '#00B4B4',
                fillOpacity: 0.12,
                opacity: 0.8,
                weight: 1.5,
              }}
            />
            <Marker position={patientLatLng} icon={createPatientIcon()}>
              <Popup>Patient location</Popup>
            </Marker>
            {recommendedHospitals.map((hospital) => (
              <Polyline
                key={`route-${hospital.id}`}
                positions={[patientLatLng, toLeafletLatLng(hospital)]}
                pathOptions={{
                  color: '#00B4B4',
                  dashArray: '8 6',
                  opacity: 0.9,
                  weight: 2,
                }}
              />
            ))}
          </>
        ) : null}
      </MapContainer>

      <FilterPanel
        filters={filters}
        total={total}
        isLoading={isLoading}
        onChange={onFiltersChange}
      />

      <div className="info legend absolute bottom-5 left-5 z-[500] rounded-lg border border-[var(--color-border)] bg-card p-3 text-xs text-[var(--color-text-primary)] shadow-md">
        <div className="mb-2 font-semibold">Status ER</div>
        <div className="space-y-1.5">
          {(['AVAILABLE', 'BUSY', 'FULL'] as const).map((status) => (
            <div key={status} className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: ER_STATUS_COLOR[status] }}
              />
              <span>{ER_STATUS_LABEL[status]}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
