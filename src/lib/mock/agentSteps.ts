import { AgentStep } from '@/types';

export const mockAgentSteps: AgentStep[] = [
  {
    id: 1,
    name: 'Data Retrieval',
    icon: 'Database',
    color: '#3b82f6',
    description: 'Mengambil data kapasitas & lokasi rumah sakit...',
    durationMs: 1000,
    status: 'idle',
  },
  {
    id: 2,
    name: 'Spatial Analysis',
    icon: 'MapPin',
    color: '#10b981',
    description: 'Menghitung jarak pasien ke RS (PostGIS routing)...',
    durationMs: 1000,
    status: 'idle',
  },
  {
    id: 3,
    name: 'Visualization',
    icon: 'BarChart2',
    color: '#f59e0b',
    description: 'Membuat overlay rute pada peta WebGIS...',
    durationMs: 1000,
    status: 'idle',
  },
  {
    id: 4,
    name: 'Report Generator',
    icon: 'FileText',
    color: '#8b5cf6',
    description: 'Menyusun rekomendasi RS berdasarkan skor optimal...',
    durationMs: 1000,
    status: 'idle',
  },
];
