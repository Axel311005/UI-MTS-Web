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
  export const formatMoney = (v: any) => `$${toNumber(v).toFixed(2)}`;