'use client';

import { useEffect } from 'react';
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
import { BED_STATUS_COLOR, BED_STATUS_LABEL, getBedStatus, Hospital } from '@/types';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
});

interface MapViewProps {
  hospitals: Hospital[];
  patientLocation: [number, number] | null;
  recommendedIds: string[];
  selectedHospitalId?: string | null;
  onHospitalClick?: (hospital: Hospital) => void;
}

const DEFAULT_CENTER: [number, number] = [-6.2088, 106.8456];
const DEFAULT_ZOOM = 11;
const CARTO_DARK_MATTER_URL =
  'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const CARTO_ATTRIBUTION = '&copy; <a href="https://carto.com">CARTO</a>';

function toLeafletLatLng([lng, lat]: [number, number]): [number, number] {
  return [lat, lng];
}

function createHospitalIcon(hospital: Hospital, isRecommended: boolean): L.DivIcon {
  const color = BED_STATUS_COLOR[getBedStatus(hospital)];
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

function MapCamera({
  hospitals,
  patientLocation,
  selectedHospitalId,
}: {
  hospitals: Hospital[];
  patientLocation: [number, number] | null;
  selectedHospitalId: string | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!patientLocation) return;
    map.flyTo(toLeafletLatLng(patientLocation), 13, { duration: 1.2 });
  }, [map, patientLocation]);

  useEffect(() => {
    if (!selectedHospitalId) return;

    const selectedHospital = hospitals.find((hospital) => hospital.id === selectedHospitalId);
    if (!selectedHospital) return;

    map.flyTo(toLeafletLatLng(selectedHospital.coordinates), 14, { duration: 0.9 });
  }, [hospitals, map, selectedHospitalId]);

  return null;
}

export default function MapView({
  hospitals,
  patientLocation,
  recommendedIds,
  selectedHospitalId = null,
  onHospitalClick,
}: MapViewProps) {
  const recommendedHospitals = hospitals.filter((hospital) => recommendedIds.includes(hospital.id));
  const patientLatLng = patientLocation ? toLeafletLatLng(patientLocation) : null;

  return (
    <section className="relative h-full flex-1 overflow-hidden bg-[#07101f]">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        zoomControl
        className="h-full w-full"
      >
        <TileLayer url={CARTO_DARK_MATTER_URL} attribution={CARTO_ATTRIBUTION} />
        <MapCamera
          hospitals={hospitals}
          patientLocation={patientLocation}
          selectedHospitalId={selectedHospitalId}
        />

        {hospitals.map((hospital) => {
          const status = getBedStatus(hospital);
          const isRecommended = recommendedIds.includes(hospital.id);

          return (
            <Marker
              key={hospital.id}
              position={toLeafletLatLng(hospital.coordinates)}
              icon={createHospitalIcon(hospital, isRecommended)}
              eventHandlers={{
                click: () => onHospitalClick?.(hospital),
              }}
            >
              <Popup>
                <div className="space-y-1 text-sm">
                  <div className="font-bold">{hospital.name}</div>
                  <div>{hospital.shortName}</div>
                  <div>
                    {BED_STATUS_LABEL[status]} · {hospital.bedsAvailable}/{hospital.totalBeds}{' '}
                    bed
                  </div>
                  <div>{hospital.level}</div>
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
                color: '#0ea5e9',
                fillColor: '#0ea5e9',
                fillOpacity: 0.12,
                opacity: 0.8,
                weight: 1.5,
              }}
            />
            <Marker position={patientLatLng} icon={createPatientIcon()}>
              <Popup>Lokasi pasien</Popup>
            </Marker>
            {recommendedHospitals.map((hospital) => (
              <Polyline
                key={`route-${hospital.id}`}
                positions={[patientLatLng, toLeafletLatLng(hospital.coordinates)]}
                pathOptions={{
                  color: '#14b8a6',
                  dashArray: '8 6',
                  opacity: 0.9,
                  weight: 2,
                }}
              />
            ))}
          </>
        ) : null}
      </MapContainer>

      <div className="absolute bottom-5 left-5 z-[500] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]/90 p-3 text-xs text-[var(--color-text)] shadow-xl shadow-black/20 backdrop-blur">
        <div className="mb-2 font-semibold">Status Kapasitas</div>
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
