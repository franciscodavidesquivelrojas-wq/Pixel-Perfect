export interface Project {
  id: string;
  name: string;
  client: string;
  status: 'En progreso' | 'Revisión' | 'Atrasado' | 'Planificado';
  deliveryDate: string;
  members: string[];
  color: string;
  category?: string;
}

export interface ClientFinancialRow {
  id_cliente: string;
  nombre_cliente: string;
  esquema_cobro: 'por_hora' | 'fijo';
  nombre_proyecto: string;
  horas_totales: number;
  horas_admin: number;
  tarifa_pactada: number;
  costos_directos: number;
  facturado_mes: number;
  estatus_pago: 'pagado' | 'pendiente';
}

export interface Activity {
  id: string;
  title: string;
  time: string;
  duration: string;
  minutes: number;
  savedIn: string | null;
  type: 'figma' | 'slack' | 'meet' | 'other';
}

export interface Feedback {
  id: string;
  clientName: string;
  feedback: string;
  avatar: string;
  status: 'happy' | 'action';
  project: string;
  date: string;
  avatarBg?: string;
}

export interface AlertItem {
  id: string;
  client: string;
  project: string;
  description: string;
  stage: string;
  status: 'Revisión' | 'Crítico';
  avatarBg?: string;
  avatar?: string;
}
