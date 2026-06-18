import { Project, Activity, Feedback, AlertItem, ClientFinancialRow } from './types';

export const INITIAL_FINANCIALS: ClientFinancialRow[] = [
  {
    id_cliente: 'c1',
    nombre_cliente: 'InnovaTech',
    esquema_cobro: 'fijo',
    nombre_proyecto: 'Rediseño E-commerce',
    horas_totales: 45,
    horas_admin: 10,
    tarifa_pactada: 1500000, // CLP
    costos_directos: 150000,
    facturado_mes: 1500000,
    estatus_pago: 'pagado'
  },
  {
    id_cliente: 'c2',
    nombre_cliente: 'FitLife Pro',
    esquema_cobro: 'por_hora',
    nombre_proyecto: 'App Mobile Fitness',
    horas_totales: 60,
    horas_admin: 8,
    tarifa_pactada: 30000, // 30.000 CLP / hr
    costos_directos: 80000,
    facturado_mes: 1800000,
    estatus_pago: 'pendiente'
  },
  {
    id_cliente: 'c3',
    nombre_cliente: 'Nexus Cloud',
    esquema_cobro: 'fijo',
    nombre_proyecto: 'Branding Corporativo',
    horas_totales: 30,
    horas_admin: 12,
    tarifa_pactada: 800000,
    costos_directos: 50000,
    facturado_mes: 800000,
    estatus_pago: 'pendiente'
  },
  {
    id_cliente: 'c4',
    nombre_cliente: 'SaaSify',
    esquema_cobro: 'por_hora',
    nombre_proyecto: 'SaaS Dashboard',
    horas_totales: 40,
    horas_admin: 5,
    tarifa_pactada: 35000,
    costos_directos: 120000,
    facturado_mes: 1400000,
    estatus_pago: 'pagado'
  }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'Rediseño Web E-commerce',
    client: 'InnovaTech',
    status: 'En progreso',
    deliveryDate: '15 Oct',
    members: ['JD', 'ML'],
    color: '#674bb5', // Violet
  },
  {
    id: 'p2',
    name: 'App Mobile Fitness',
    client: 'FitLife Pro',
    status: 'Revisión',
    deliveryDate: '22 Oct',
    members: ['AR'],
    color: '#006b5f', // Teal
  },
  {
    id: 'p3',
    name: 'Branding Corporativo',
    client: 'Nexus Cloud',
    status: 'Atrasado',
    deliveryDate: '05 Oct (Vencido)',
    members: ['PM', 'LC'],
    color: '#a43b2f', // Coral / Red
  },
];

export const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: 'act1',
    title: 'Diseño UI Proyecto X',
    time: '09:00 - 11:30',
    duration: '2h 30m',
    minutes: 150,
    savedIn: null,
    type: 'figma',
  },
  {
    id: 'act2',
    title: 'Reunión de Sincronización',
    time: '11:30 - 12:00',
    duration: '30m',
    minutes: 30,
    savedIn: 'Reuniones',
    type: 'slack',
  },
];

export const INITIAL_FEEDBACKS: Feedback[] = [
  {
    id: 'f1',
    clientName: 'Marcos A.',
    feedback: 'Me encanta cómo quedó el flujo de onboarding. ¡La retroalimentación ha sido maravillosa!',
    avatar: 'MA',
    status: 'happy',
    project: 'SaaS Dashboard',
    date: 'Ayer',
    avatarBg: '#62fae3',
  },
  {
    id: 'f2',
    clientName: 'Lucía S.',
    feedback: 'Proyecto entregado antes de tiempo y con una calidad excepcional. ¡Muy profesionales!',
    avatar: 'LS',
    status: 'happy',
    project: 'E-commerce Redesign',
    date: 'Hace 3 días',
    avatarBg: '#62fae3',
  },
];

export const INITIAL_ALERTS: AlertItem[] = [
  {
    id: 'a1',
    client: 'InnovaTech Corp',
    project: 'Rediseño Web E-commerce',
    description: 'El alcance original parece haberse desbordado. Necesitamos revisar las nuevas peticiones de diseño de pantallas adicionales.',
    stage: 'Hito: Diseño UI',
    status: 'Crítico',
    avatar: 'IT',
    avatarBg: '#ff7f6e',
  },
  {
    id: 'a2',
    client: 'TechCorp Inc.',
    project: 'App Branding',
    description: 'Esperando feedback final desde hace 5 días. Riesgo de retraso en el lanzamiento.',
    stage: 'Hito: Branding Final',
    status: 'Revisión',
    avatar: 'TC',
    avatarBg: '#ff7f6e',
  },
];
