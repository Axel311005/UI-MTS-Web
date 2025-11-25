/**
 * Lista de categorías para generar códigos SKU de items
 * Formato: XXX-00000 (código + guion + 5 dígitos)
 *
 * Incluye categorías para PRODUCTOS (repuestos) y SERVICIOS (taller)
 * Ordenadas alfabéticamente por código
 */

export interface CodigoItemCategoria {
  codigo: string; // Código de 3 letras (ej: "MTR")
  nombre: string; // Nombre completo (ej: "Motor")
  tipo: 'PRODUCTO' | 'SERVICIO'; // Tipo de item
}

export const CODIGO_ITEM_CATEGORIAS: CodigoItemCategoria[] = [
  // PRODUCTOS - Repuestos
  { codigo: 'ACE', nombre: 'Aceite', tipo: 'PRODUCTO' },
  { codigo: 'ACT', nombre: 'Actuador', tipo: 'PRODUCTO' },
  { codigo: 'ALT', nombre: 'Alternador', tipo: 'PRODUCTO' },
  { codigo: 'AMR', nombre: 'Amortiguador', tipo: 'PRODUCTO' },
  { codigo: 'BDA', nombre: 'Bomba de Agua', tipo: 'PRODUCTO' },
  { codigo: 'BOM', nombre: 'Bomba', tipo: 'PRODUCTO' },
  { codigo: 'BTR', nombre: 'Batería', tipo: 'PRODUCTO' },
  { codigo: 'BUL', nombre: 'Bujía', tipo: 'PRODUCTO' },
  { codigo: 'CAB', nombre: 'Cable', tipo: 'PRODUCTO' },
  { codigo: 'CHP', nombre: 'Chapa', tipo: 'PRODUCTO' },
  { codigo: 'CJA', nombre: 'Caja de Cambios', tipo: 'PRODUCTO' },
  { codigo: 'CON', nombre: 'Conector', tipo: 'PRODUCTO' },
  { codigo: 'COR', nombre: 'Correa', tipo: 'PRODUCTO' },
  { codigo: 'CRS', nombre: 'Cristal', tipo: 'PRODUCTO' },
  { codigo: 'DIR', nombre: 'Dirección', tipo: 'PRODUCTO' },
  { codigo: 'EMB', nombre: 'Embrague', tipo: 'PRODUCTO' },
  { codigo: 'ESP', nombre: 'Espejo', tipo: 'PRODUCTO' },
  { codigo: 'FAR', nombre: 'Farol', tipo: 'PRODUCTO' },
  { codigo: 'FDA', nombre: 'Filtro De Aire', tipo: 'PRODUCTO' },
  { codigo: 'FDC', nombre: 'Filtro De Combustible', tipo: 'PRODUCTO' },
  { codigo: 'FDO', nombre: 'Filtro De Óleo', tipo: 'PRODUCTO' },
  { codigo: 'FLT', nombre: 'Filtro', tipo: 'PRODUCTO' },
  { codigo: 'FRN', nombre: 'Freno', tipo: 'PRODUCTO' },
  { codigo: 'FUS', nombre: 'Fusible', tipo: 'PRODUCTO' },
  { codigo: 'GOL', nombre: 'Golpe', tipo: 'PRODUCTO' },
  { codigo: 'LMP', nombre: 'Lámpara', tipo: 'PRODUCTO' },
  { codigo: 'LLN', nombre: 'Llanta', tipo: 'PRODUCTO' },
  { codigo: 'LUB', nombre: 'Lubricante', tipo: 'PRODUCTO' },
  { codigo: 'MTR', nombre: 'Motor', tipo: 'PRODUCTO' },
  { codigo: 'OTR', nombre: 'Otro Repuesto', tipo: 'PRODUCTO' },
  { codigo: 'PAR', nombre: 'Parabrisas', tipo: 'PRODUCTO' },
  { codigo: 'PDK', nombre: 'Pastillas De Freno', tipo: 'PRODUCTO' },
  { codigo: 'PIT', nombre: 'Pintura', tipo: 'PRODUCTO' },
  { codigo: 'RDP', nombre: 'Radiador de Agua', tipo: 'PRODUCTO' },
  { codigo: 'REL', nombre: 'Relé', tipo: 'PRODUCTO' },
  { codigo: 'RIN', nombre: 'Rin', tipo: 'PRODUCTO' },
  { codigo: 'SEN', nombre: 'Sensor', tipo: 'PRODUCTO' },
  { codigo: 'SUS', nombre: 'Suspensión', tipo: 'PRODUCTO' },
  { codigo: 'TEN', nombre: 'Tensor', tipo: 'PRODUCTO' },
  { codigo: 'TER', nombre: 'Termostato', tipo: 'PRODUCTO' },
  { codigo: 'TRM', nombre: 'Transmisión', tipo: 'PRODUCTO' },

  // SERVICIOS - Taller
  { codigo: 'ACH', nombre: 'Alineación de Chasis', tipo: 'SERVICIO' },
  { codigo: 'AJF', nombre: 'Ajuste de Frenos', tipo: 'SERVICIO' },
  { codigo: 'ALN', nombre: 'Alineación', tipo: 'SERVICIO' },
  { codigo: 'BLN', nombre: 'Balanceo', tipo: 'SERVICIO' },
  { codigo: 'CAL', nombre: 'Calibración', tipo: 'SERVICIO' },
  { codigo: 'CVL', nombre: 'Calibración de Válvulas', tipo: 'SERVICIO' },
  { codigo: 'CBB', nombre: 'Cambio de Batería', tipo: 'SERVICIO' },
  { codigo: 'CBF', nombre: 'Cambio de Filtros', tipo: 'SERVICIO' },
  { codigo: 'CBL', nombre: 'Cambio de Llantas', tipo: 'SERVICIO' },
  { codigo: 'CBR', nombre: 'Cambio de Aceite', tipo: 'SERVICIO' },
  { codigo: 'CLM', nombre: 'Climatización', tipo: 'SERVICIO' },
  { codigo: 'DES', nombre: 'Desmontaje', tipo: 'SERVICIO' },
  { codigo: 'DGN', nombre: 'Diagnóstico', tipo: 'SERVICIO' },
  { codigo: 'EGB', nombre: 'Engrase de Balineras', tipo: 'SERVICIO' },
  { codigo: 'ELC', nombre: 'Eléctrico', tipo: 'SERVICIO' },
  { codigo: 'EMC', nombre: 'Electromecánica', tipo: 'SERVICIO' },
  {
    codigo: 'ESC',
    nombre: 'Escaneado y Reparación Eléctrica',
    tipo: 'SERVICIO',
  },
  { codigo: 'INS', nombre: 'Instalación', tipo: 'SERVICIO' },
  { codigo: 'KCP', nombre: 'Kit de Cunas del Poste', tipo: 'SERVICIO' },
  { codigo: 'LCB', nombre: 'Limpieza de Carburador', tipo: 'SERVICIO' },
  { codigo: 'LMT', nombre: 'Limpieza', tipo: 'SERVICIO' },
  { codigo: 'MEC', nombre: 'Mecánico', tipo: 'SERVICIO' },
  { codigo: 'MNT', nombre: 'Mantenimiento', tipo: 'SERVICIO' },
  { codigo: 'MTR', nombre: 'Motor', tipo: 'SERVICIO' },
  { codigo: 'OTR', nombre: 'Otro Servicio', tipo: 'SERVICIO' },
  { codigo: 'OVR', nombre: 'Overhaul', tipo: 'SERVICIO' },
  { codigo: 'PTC', nombre: 'Pintura y Carrocería', tipo: 'SERVICIO' },
  { codigo: 'PRU', nombre: 'Prueba', tipo: 'SERVICIO' },
  { codigo: 'RCM', nombre: 'Revisión Completa del Motor', tipo: 'SERVICIO' },
  { codigo: 'RFR', nombre: 'Rectificación de Frenos', tipo: 'SERVICIO' },
  { codigo: 'RLS', nombre: 'Revisión de Luces', tipo: 'SERVICIO' },
  { codigo: 'RPR', nombre: 'Reparación', tipo: 'SERVICIO' },
  {
    codigo: 'RPS',
    nombre: 'Revisión Profunda de Suspensión',
    tipo: 'SERVICIO',
  },
  { codigo: 'RVS', nombre: 'Revisión', tipo: 'SERVICIO' },
  { codigo: 'SER', nombre: 'Servicio General', tipo: 'SERVICIO' },
  { codigo: 'SUS', nombre: 'Suspensión y Dirección', tipo: 'SERVICIO' },
  { codigo: 'THD', nombre: 'Tecnología Hidráulica', tipo: 'SERVICIO' },
  { codigo: 'TRN', nombre: 'Transmisión', tipo: 'SERVICIO' },
];
