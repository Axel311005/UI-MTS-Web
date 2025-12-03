// Caché del token decodificado con TTL (Time To Live)
interface TokenCache {
  token: string;
  decoded: any;
  expirationTime: number;
  cachedAt: number;
}

let tokenCache: TokenCache | null = null;
const CACHE_TTL = 10000; // Cachear por 10 segundos

// Caché de verificación de expiración
interface ExpirationCheckCache {
  token: string;
  isExpired: boolean;
  checkedAt: number;
}

let lastExpirationCheck: ExpirationCheckCache | null = null;
const EXPIRATION_CHECK_CACHE_TTL = 5000; // Cachear verificación por 5 segundos

/**
 * Limpia el caché del token (llamar cuando se actualiza el token)
 */
export const clearTokenCache = (): void => {
  tokenCache = null;
  lastExpirationCheck = null;
};

/**
 * Limpia el caché de verificación de expiración
 */
export const clearExpirationCache = (): void => {
  lastExpirationCheck = null;
};

/**
 * Actualiza el caché de verificación de expiración
 */
export const updateExpirationCache = (
  token: string,
  isExpired: boolean,
  checkedAt: number
): void => {
  lastExpirationCheck = {
    token,
    isExpired,
    checkedAt,
  };
};

/**
 * Decodifica un token JWT sin verificar la firma
 * Utiliza caché para evitar decodificaciones repetidas del mismo token
 */
const decodeTokenCached = (token: string): any | null => {
  if (!token) return null;
  const now = Date.now();

  // Si el token cambió, el caché expiró, o no hay caché, decodificar de nuevo
  if (
    !tokenCache ||
    tokenCache.token !== token ||
    now - tokenCache.cachedAt > CACHE_TTL
  ) {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        tokenCache = null;
        return null;
      }

      const payload = parts[1];
      const decoded = JSON.parse(atob(payload));

      // Extraer exp si existe
      const expirationTime = decoded.exp ? decoded.exp * 1000 : 0;

      // Guardar en caché
      tokenCache = {
        token,
        decoded,
        expirationTime,
        cachedAt: now,
      };
    } catch (error) {
      tokenCache = null;
      console.error('Error al decodificar token:', error);
      return null;
    }
  }

  return tokenCache.decoded;
};

/**
 * Verifica si un token JWT está vencido
 */
export const isTokenExpired = (token: string): boolean => {
  if (!token) return true;

  try {
    const decoded = decodeTokenCached(token);
    if (!decoded || !decoded.exp) {
      return true; // Si no tiene exp, considerarlo vencido por seguridad
    }

    // Usar el tiempo de expiración del caché si está disponible
    const expirationTime = tokenCache?.expirationTime || decoded.exp * 1000;
    const currentTime = Date.now();

    // Considerar vencido si falta menos de 1 minuto (margen de seguridad)
    // Esto evita problemas de sincronización de reloj y da tiempo para refrescar
    return currentTime >= expirationTime - 60000;
  } catch (error) {
    console.error('Error al verificar expiración del token:', error);
    return true;
  }
};

/**
 * Obtiene el tiempo restante del token en milisegundos
 */
export const getTokenTimeRemaining = (token: string): number => {
  if (!token) return 0;

  try {
    const decoded = decodeTokenCached(token);
    if (!decoded || !decoded.exp) {
      return 0;
    }

    const expirationTime = tokenCache?.expirationTime || decoded.exp * 1000;
    const currentTime = Date.now();
    const remaining = expirationTime - currentTime;

    return remaining > 0 ? remaining : 0;
  } catch (error) {
    return 0;
  }
};

/**
 * Obtiene la fecha de expiración del token
 */
export const getTokenExpirationDate = (token: string): Date | null => {
  if (!token) return null;

  try {
    const decoded = decodeTokenCached(token);
    if (!decoded || !decoded.exp) {
      return null;
    }

    const expirationTime = tokenCache?.expirationTime || decoded.exp * 1000;
    return new Date(expirationTime);
  } catch (error) {
    return null;
  }
};

/**
 * Obtiene la fecha de inicio de sesión (iat del token)
 */
export const getTokenIssuedAt = (token: string): Date | null => {
  if (!token) return null;

  try {
    const decoded = decodeTokenCached(token);
    if (!decoded || !decoded.iat) {
      return null;
    }

    const issuedAt = decoded.iat * 1000;
    return new Date(issuedAt);
  } catch (error) {
    return null;
  }
};

/**
 * Verifica si un endpoint es público (no requiere token)
 */
export const isPublicEndpoint = (url: string): boolean => {
  if (!url) return false;

  const publicEndpoints = [
    '/auth/login',
    '/auth/register',
    '/catalogo',
    '/cotizacion',
    '/cita',
    '/seguimiento',
  ];

  return publicEndpoints.some((endpoint) => url.includes(endpoint));
};

// Exportar para uso en interceptores
export { lastExpirationCheck, EXPIRATION_CHECK_CACHE_TTL };
