import { impuestoApi } from '../api/impuesto.api';
import type { Impuesto } from '../types/impuesto.interface';
import type {
  PaginationParams,
  PaginatedResponse,
} from '@/shared/types/pagination';
import { EstadoActivo } from '@/shared/types/status';

const coerceActivo = (raw: any): EstadoActivo => {
  if (raw === true) return EstadoActivo.ACTIVO;
  if (raw === false) return EstadoActivo.INACTIVO;
  const s = String(raw).toUpperCase();
  return s === EstadoActivo.INACTIVO
    ? EstadoActivo.INACTIVO
    : EstadoActivo.ACTIVO;
};

const normalize = (i: any): Impuesto => ({
  ...(i as Impuesto),
  activo: coerceActivo((i as any)?.activo ?? (i as any)?.estado),
});

export const getImpuestoAction = async (
  params?: PaginationParams
): Promise<Impuesto[] | PaginatedResponse<Impuesto>> => {
  try {
    const queryParams = params
      ? {
          limit: params.limit,
          offset: params.offset,
        }
      : undefined;

    const response = await impuestoApi.get<any>('/', {
      params: queryParams,
    });

    // Si hay parámetros de paginación, el backend DEBE devolver un objeto con data y total
    if (params?.limit !== undefined || params?.offset !== undefined) {
      const limit = params.limit || 10;
      const offset = params.offset || 0;

      // Si el backend devuelve un array cuando se espera paginación, necesitamos obtener el total
      if (Array.isArray(response.data)) {
        // SIEMPRE obtener el total real del backend cuando devuelve un array
        try {
          const totalResponse = await impuestoApi.get<any>('/', {
            params: {
              limit: 10000, // Límite muy alto para obtener todos
              offset: 0,
            },
          });
          
          let allImpuestos: any[] = [];
          if (Array.isArray(totalResponse.data)) {
            allImpuestos = totalResponse.data;
          } else if (
            totalResponse.data &&
            typeof totalResponse.data === 'object' &&
            'data' in totalResponse.data
          ) {
            allImpuestos = (totalResponse.data as any).data || [];
          }
          
          // Normalizar, filtrar solo activos y ordenar
          const allNormalized = allImpuestos.map(normalize);
          const allActivos = allNormalized.filter(
            (item) => item?.activo === EstadoActivo.ACTIVO
          );
          allActivos.sort((a, b) => {
            const dateA = new Date(a.fechaCreacion || 0).getTime();
            const dateB = new Date(b.fechaCreacion || 0).getTime();
            return dateB - dateA; // DESC
          });
          
          const total = allActivos.length;
          
          // Normalizar, filtrar y ordenar la página actual
          const currentNormalized = (response.data as any[]).map(normalize);
          const currentActivos = currentNormalized.filter(
            (item) => item?.activo === EstadoActivo.ACTIVO
          );
          currentActivos.sort((a, b) => {
            const dateA = new Date(a.fechaCreacion || 0).getTime();
            const dateB = new Date(b.fechaCreacion || 0).getTime();
            return dateB - dateA; // DESC
          });
          
          return {
            data: currentActivos,
            total: total,
          };
        } catch (totalError) {
          // Si falla obtener el total, usar lógica de fallback
          const currentNormalized = (response.data as any[]).map(normalize);
          const currentActivos = currentNormalized.filter(
            (item) => item?.activo === EstadoActivo.ACTIVO
          );
          currentActivos.sort((a, b) => {
            const dateA = new Date(a.fechaCreacion || 0).getTime();
            const dateB = new Date(b.fechaCreacion || 0).getTime();
            return dateB - dateA; // DESC
          });
          
          if (currentActivos.length < limit) {
            const calculatedTotal = offset + currentActivos.length;
            return {
              data: currentActivos,
              total: calculatedTotal,
            };
          }
          const estimatedTotal = offset + currentActivos.length + 1;
          return {
            data: currentActivos,
            total: estimatedTotal,
          };
        }
      }
      
      // Si el backend devuelve un objeto con data y total, usarlo directamente
      if (
        response.data &&
        typeof response.data === 'object' &&
        'data' in response.data
      ) {
        const allData = (response.data.data || []) as any[];
        const total = response.data.total ?? 0;
        
        // Normalizar, filtrar solo activos y ordenar
        const normalized = allData.map(normalize);
        const activos = normalized.filter(
          (item) => item?.activo === EstadoActivo.ACTIVO
        );
        activos.sort((a, b) => {
          const dateA = new Date(a.fechaCreacion || 0).getTime();
          const dateB = new Date(b.fechaCreacion || 0).getTime();
          return dateB - dateA; // DESC
        });
        
        // Obtener el total real de activos si el backend no lo proporciona correctamente
        let totalActivos = total;
        if (total === 0 || total === allData.length) {
          try {
            const totalResponse = await impuestoApi.get<any>('/', {
              params: {
                limit: 10000,
                offset: 0,
              },
            });
            
            let allImpuestos: any[] = [];
            if (Array.isArray(totalResponse.data)) {
              allImpuestos = totalResponse.data;
            } else if (
              totalResponse.data &&
              typeof totalResponse.data === 'object' &&
              'data' in totalResponse.data
            ) {
              allImpuestos = (totalResponse.data as any).data || [];
            }
            
            const allNormalized = allImpuestos.map(normalize);
            totalActivos = allNormalized.filter(
              (item) => item?.activo === EstadoActivo.ACTIVO
            ).length;
          } catch (error) {
            totalActivos = total;
          }
        }
        
        return {
          data: activos,
          total: totalActivos,
        };
      }
    }

    // Sin paginación, devolver array directamente
    if (Array.isArray(response.data)) {
      const allData = response.data as any[];
      const normalized = allData.map(normalize);
      const activos = normalized.filter(
        (item) => item?.activo === EstadoActivo.ACTIVO
      );
      activos.sort((a, b) => {
        const dateA = new Date(a.fechaCreacion || 0).getTime();
        const dateB = new Date(b.fechaCreacion || 0).getTime();
        return dateB - dateA; // DESC
      });
      return activos;
    }

    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data
    ) {
      const allData = (response.data.data || []) as any[];
      const normalized = allData.map(normalize);
      const activos = normalized.filter(
        (item) => item?.activo === EstadoActivo.ACTIVO
      );
      activos.sort((a, b) => {
        const dateA = new Date(a.fechaCreacion || 0).getTime();
        const dateB = new Date(b.fechaCreacion || 0).getTime();
        return dateB - dateA; // DESC
      });
      return {
        data: activos,
        total: response.data.total ?? activos.length,
      };
    }

    return [];
  } catch (error) {
    throw error;
  }
};
