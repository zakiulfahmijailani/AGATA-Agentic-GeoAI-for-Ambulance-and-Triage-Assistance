'use client';

import { ResponsiveSankey } from '@nivo/sankey';
import type { HospitalIndex, HospitalPillarVariables } from '@/lib/types';

interface HospitalSankeyChartProps {
  hospitalIndex: HospitalIndex;
  pillarVariables?: HospitalPillarVariables | null;
}

interface HospitalSankeyNode {
  id: string;
  color: string;
}

interface HospitalSankeyLink {
  source: string;
  target: string;
  value: number;
}

const nodes: HospitalSankeyNode[] = [
  { id: 'Neon DB', color: '#0D2137' },
  { id: 'Routing Engine', color: '#1A3A5C' },
  { id: 'Case Input', color: '#00B4B4' },
  { id: 'Available Beds', color: '#D9E6F2' },
  { id: 'ICU Availability', color: '#D9E6F2' },
  { id: 'On-Duty Specialists', color: '#D9F2EF' },
  { id: 'Facility Type (Hospital A/B/C)', color: '#D9F2EF' },
  { id: 'Estimated Travel Time', color: '#E9EEF3' },
  { id: 'Route Viability', color: '#E9EEF3' },
  { id: 'Severity Level Match', color: '#FCE3D1' },
  { id: 'Bed Readiness', color: '#E75D5D' },
  { id: 'Clinical Match', color: '#F28E2B' },
  { id: 'Spatial Accessibility', color: '#8A6BE8' },
  { id: 'Severity Match', color: '#E0A21D' },
  { id: 'AGATA Index', color: '#00B4B4' },
];

export default function HospitalSankeyChart({
  hospitalIndex: hi,
  pillarVariables,
}: HospitalSankeyChartProps) {
  const pv: HospitalPillarVariables = pillarVariables ?? {
    hospital_id: hi.hospital_id,
    available_beds: Number((hi.p1_bed_readiness * 0.55).toFixed(3)),
    icu_availability: Number((hi.p1_bed_readiness * 0.45).toFixed(3)),
    specialist_on_duty: Number((hi.p2_clinical_match * 0.55).toFixed(3)),
    facility_tier_score: Number((hi.p2_clinical_match * 0.45).toFixed(3)),
    travel_time_score: Number((hi.p3_spatial_access * 0.55).toFixed(3)),
    route_viability: Number((hi.p3_spatial_access * 0.45).toFixed(3)),
    severity_match: Number(hi.p4_severity_fit.toFixed(3)),
  };

  const rawLinks: HospitalSankeyLink[] = [
    { source: 'Neon DB', target: 'Available Beds', value: pv.available_beds },
    { source: 'Neon DB', target: 'ICU Availability', value: pv.icu_availability },
    { source: 'Neon DB', target: 'On-Duty Specialists', value: pv.specialist_on_duty },
    { source: 'Neon DB', target: 'Facility Type (Hospital A/B/C)', value: pv.facility_tier_score },
    { source: 'Routing Engine', target: 'Estimated Travel Time', value: pv.travel_time_score },
    { source: 'Routing Engine', target: 'Route Viability', value: pv.route_viability },
    { source: 'Case Input', target: 'Severity Level Match', value: pv.severity_match },
    { source: 'Available Beds', target: 'Bed Readiness', value: pv.available_beds },
    { source: 'ICU Availability', target: 'Bed Readiness', value: pv.icu_availability },
    { source: 'On-Duty Specialists', target: 'Clinical Match', value: pv.specialist_on_duty },
    { source: 'Facility Type (Hospital A/B/C)', target: 'Clinical Match', value: pv.facility_tier_score },
    { source: 'Estimated Travel Time', target: 'Spatial Accessibility', value: pv.travel_time_score },
    { source: 'Route Viability', target: 'Spatial Accessibility', value: pv.route_viability },
    {
      source: 'Severity Level Match',
      target: 'Severity Match',
      value: pv.severity_match,
    },
    { source: 'Bed Readiness', target: 'AGATA Index', value: hi.p1_bed_readiness * 0.3 },
    { source: 'Clinical Match', target: 'AGATA Index', value: hi.p2_clinical_match * 0.3 },
    { source: 'Spatial Accessibility', target: 'AGATA Index', value: hi.p3_spatial_access * 0.25 },
    { source: 'Severity Match', target: 'AGATA Index', value: hi.p4_severity_fit * 0.15 },
  ];

  const links = rawLinks.filter((l) => typeof l.value === 'number' && l.value > 0 && !isNaN(l.value));

  return (
    <div>
      <div className="h-[480px] min-w-[820px] rounded-md border border-slate-200 bg-white">
        <ResponsiveSankey<HospitalSankeyNode, HospitalSankeyLink>
          data={{ nodes, links }}
          margin={{ top: 20, right: 160, bottom: 40, left: 160 }}
          align="justify"
          colors={{ datum: 'color' }}
          nodeOpacity={1}
          nodeThickness={18}
          nodeInnerPadding={4}
          nodeSpacing={24}
          nodeBorderWidth={0}
          linkOpacity={0.4}
          linkHoverOpacity={0.7}
          enableLinkGradient={true}
          labelPosition="outside"
          labelOrientation="horizontal"
          labelPadding={12}
          labelTextColor={{ from: 'color', modifiers: [['darker', 1.4]] }}
          nodeTooltip={(node) => (
            <div
              style={{
                padding: '8px 12px',
                background: '#0D2137',
                borderRadius: 6,
                color: '#fff',
                fontSize: 12,
              }}
            >
              <strong style={{ color: node.node.color }}>{node.node.id}</strong>:{' '}
              {typeof node.node.value === 'number' ? node.node.value.toFixed(3) : node.node.value}
            </div>
          )}
        />
      </div>
      <p className="mt-2 text-center text-xs italic text-slate-400">
        * Illustrative data. This visualization represents the AGATA Index scoring logic.
      </p>
    </div>
  );
}
