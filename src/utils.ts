/**
 * Formats a number to Chilean Pesos (CLP) style.
 * Example: 1500000 -> $1.500.000
 */
export const formatCLP = (value: number): string => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

/**
 * Calculates the Effective Hourly Rate (TER) for a project/row.
 * Formula: TER = [Ingreso Bruto - Costos Directos - 15.3% (Reserva de Impuestos)] / (horas_totales + horas_admin)
 */
export const calculateTER = (
  ingresoBruto: number,
  costosDirectos: number,
  horasTotales: number,
  horasAdmin: number
): number => {
  const totalHoras = horasTotales + horasAdmin;
  if (totalHoras === 0) return 0;
  
  // Apply 15.3% tax estimate reserve
  const impuestos = ingresoBruto * 0.153;
  const netoReal = ingresoBruto - costosDirectos - impuestos;
  
  return netoReal / totalHoras;
};

/**
 * Classifies clients based on Pareto ABC Analysis.
 * Clientes A: High Profitability (top contributors, approx top 20% that yield majority of income)
 * Clientes B: Medium profitability/contributions
 * Clientes C: Low yield or "vampires of time" (low revenue, high administrative/total hours)
 */
export interface ParetoItem {
  nombre_cliente: string;
  ingresos: number;
  horasReales: number;
  ter: number;
  category: 'A' | 'B' | 'C';
  percentageOfRevenue: number;
}

export const getParetoCategorization = (rows: any[]): ParetoItem[] => {
  if (rows.length === 0) return [];

  // Group by client
  const clientMap: { [key: string]: { ingresos: number; horas: number; costos: number } } = {};
  rows.forEach((row) => {
    const key = row.nombre_cliente;
    if (!clientMap[key]) {
      clientMap[key] = { ingresos: 0, horas: 0, costos: 0 };
    }
    clientMap[key].ingresos += row.facturado_mes;
    clientMap[key].horas += (row.horas_totales + row.horas_admin);
    clientMap[key].costos += row.costos_directos;
  });

  const totalRevenue = Object.values(clientMap).reduce((sum, c) => sum + c.ingresos, 0);

  // Convert to array and sort descending by ingresos
  const clientsArray = Object.keys(clientMap).map((name) => {
    const c = clientMap[name];
    const imp = c.ingresos * 0.153;
    const ter = c.horas > 0 ? (c.ingresos - c.costos - imp) / c.horas : 0;
    return {
      nombre_cliente: name,
      ingresos: c.ingresos,
      horasReales: c.horas,
      ter,
      percentageOfRevenue: totalRevenue > 0 ? (c.ingresos / totalRevenue) * 100 : 0
    };
  });

  clientsArray.sort((a, b) => b.ingresos - a.ingresos);

  // Apply Pareto ABC logic:
  // Sort descending, cumulative percentage triggers Category
  // Category A: Cumulative sum of revenue <= 75% - 80%
  // Category B: Cumulative sum up to 95%
  // Category C: Low revenue, high effort (Vampire)
  let cumulativePercentage = 0;
  return clientsArray.map((client) => {
    cumulativePercentage += client.percentageOfRevenue;
    let category: 'A' | 'B' | 'C' = 'B';
    
    // Core threshold or high-risk of vampire (if TER is extremely low relative to others)
    if (cumulativePercentage <= 75) {
      category = 'A'; // Elite / Rentabilidad alta
    } else if (cumulativePercentage > 95 || client.ter < 10000) {
      category = 'C'; // Vampiro de tiempo/Bajo rendimiento
    } else {
      category = 'B'; // Rendimiento medio
    }

    return {
      ...client,
      category
    };
  });
};
