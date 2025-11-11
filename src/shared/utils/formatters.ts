export const formatDate = (iso: any) => {
    if (!iso) return '—';
    const d = iso instanceof Date ? iso : new Date(iso);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('es-ES');
  };
  export const toNumber = (v: any) => {
    if (v === null || v === undefined || v === '') return 0;
    const n = typeof v === 'number' ? v : parseFloat(v);
    return isNaN(n) ? 0 : n;
  };
  export const formatLocalMoney = (
  value: any,
  locale: string = 'es-NI', // Español de Nicaragua
  currency: string = 'NIO'  // Córdobas
): string => {
  const n = toNumber(value);
  return n.toLocaleString(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  });
};


  export const formatMoney = (
    value: any,
    monedaDescripcion?: string
  ): string => {
    const desc = (monedaDescripcion || '').toString().trim().toUpperCase();

    if (desc === 'CORDOBAS' || desc === 'CÓRDOBAS' || desc === 'CNY' || desc === 'NIO') {
      return formatLocalMoney(value, 'es-NI', 'NIO');
    }

    if (desc === 'DOLARES' || desc === 'DÓLARES' || desc === 'USD' || desc === 'DOLAR') {
      return formatLocalMoney(value, 'en-US', 'USD');
    }

    // Fallback: if caller didn't provide a description, keep old default (Córdobas)
    if (!monedaDescripcion) {
      return formatLocalMoney(value, 'es-NI', 'NIO');
    }

    // If descripcion looks like a 3-letter ISO currency code, try to use it with en-US
    const maybeIso = desc;
    if (maybeIso.length === 3) {
      try {
        return formatLocalMoney(value, 'en-US', maybeIso);
      } catch (e) {
        // ignore and fallback
      }
    }

    // Final fallback: Córdoba
    return formatLocalMoney(value, 'es-NI', 'NIO');
  };