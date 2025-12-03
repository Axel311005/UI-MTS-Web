import { clasificacionItemApi } from '../api/clasificacionItem.api';
import type { ClasificacionItem } from '../types/clasificacionItem.interface';
import type {
  PaginationParams,
  PaginatedResponse,
} from '@/shared/types/pagination';
import { EstadoActivo } from '@/shared/types/status';

export const getClasificacionItemsAction = async (
  params?: PaginationParams
): Promise<ClasificacionItem[] | PaginatedResponse<ClasificacionItem>> => {
  try {
    const queryParams = params
      ? {
          limit: params.limit,
          offset: params.offset,
        }
      : undefined;

    const response = await clasificacionItemApi.get<any>('/', {
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
          const totalResponse = await clasificacionItemApi.get<any>('/', {
            params: {
              limit: 10000, // Límite muy alto para obtener todos
              offset: 0,
            },
          });
          
          let allClasificaciones: ClasificacionItem[] = [];
          if (Array.isArray(totalResponse.data)) {
            allClasificaciones = totalResponse.data;
          } else if (
            totalResponse.data &&
            typeof totalResponse.data === 'object' &&
            'data' in totalResponse.data
          ) {
            allClasificaciones = (totalResponse.data as any).data || [];
          }
          
          // Filtrar solo activos
          const allActivos = allClasificaciones.filter(
            (item) => item?.activo === EstadoActivo.ACTIVO
          );
          
          const total = allActivos.length;
          
          // Filtrar la página actual
          const currentActivos = (response.data as ClasificacionItem[]).filter(
            (item) => item?.activo === EstadoActivo.ACTIVO
          );
          
          return {
            data: currentActivos,
            total: total,
          };
        } catch (totalError) {
          // Si falla obtener el total, usar lógica de fallback
          const currentActivos = (response.data as ClasificacionItem[]).filter(
            (item) => item?.activo === EstadoActivo.ACTIVO
          );
          
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
        const allData = (response.data.data || []) as ClasificacionItem[];
        const total = response.data.total ?? 0;
        
        // Filtrar solo activos
        const activos = allData.filter(
          (item) => item?.activo === EstadoActivo.ACTIVO
        );
        
        // Obtener el total real de activos si el backend no lo proporciona correctamente
        let totalActivos = total;
        if (total === 0 || total === allData.length) {
          try {
            const totalResponse = await clasificacionItemApi.get<any>('/', {
              params: {
                limit: 10000,
                offset: 0,
              },
            });
            
            let allClasificaciones: ClasificacionItem[] = [];
            if (Array.isArray(totalResponse.data)) {
              allClasificaciones = totalResponse.data;
            } else if (
              totalResponse.data &&
              typeof totalResponse.data === 'object' &&
              'data' in totalResponse.data
            ) {
              allClasificaciones = (totalResponse.data as any).data || [];
            }
            
            totalActivos = allClasificaciones.filter(
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
      const allData = response.data as ClasificacionItem[];
      const activos = allData.filter(
        (item) => item?.activo === EstadoActivo.ACTIVO
      );
      return activos;
    }

    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data
    ) {
      const allData = (response.data.data || []) as ClasificacionItem[];
      const activos = allData.filter(
        (item) => item?.activo === EstadoActivo.ACTIVO
      );
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
