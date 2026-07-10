import { AgentStep } from '@/types';

export const mockAgentSteps: AgentStep[] = [
  {
    id: 1,
    name: 'Data Retrieval',
    icon: 'Database',
    color: '#3b82f6',
    description: 'Retrieving hospital capacity and location data...',
    durationMs: 1000,
    status: 'idle',
  },
  {
    id: 2,
    name: 'Route & Travel Analysis',
    icon: 'MapPin',
    color: '#10b981',
    description: 'Computing route viability and estimated travel time as AGATA Index inputs...',
    durationMs: 1000,
    status: 'idle',
  },
  {
    id: 3,
    name: 'Visualization',
    icon: 'BarChart2',
    color: '#f59e0b',
    description: 'Creating route overlays on the WebGIS map...',
    durationMs: 1000,
    status: 'idle',
  },
  {
    id: 4,
    name: 'Report Generator',
    icon: 'FileText',
    color: '#8b5cf6',
    description: 'Compiling hospital recommendations based on the optimal score...',
    durationMs: 1000,
    status: 'idle',
  },
];
