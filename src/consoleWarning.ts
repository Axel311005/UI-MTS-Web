/**
 * Muestra un mensaje de advertencia estilo Facebook/Instagram
 * cuando alguien abre la consola del navegador
 * 
 * Este mensaje se ejecuta siempre (desarrollo y producción)
 * para disuadir a usuarios de copiar/pegar código malicioso
 */
export function showConsoleWarning(): void {
  if (typeof window !== 'undefined') {
    const style1 = 'color: red; font-size: 40px; font-weight: bold;';
    const style2 = 'font-size: 18px;';
    
    console.log('%c¡DETENTE!', style1);
    console.log(
      '%cEsta herramienta del navegador es para desarrolladores.\n' +
        'Si alguien te pidió pegar algo aquí para obtener funciones especiales,\n' +
        'es una estafa y podrían acceder a tu cuenta.',
      style2
    );
  }
}

