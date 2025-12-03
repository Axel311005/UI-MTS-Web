import { existenciaBodegaApi } from "../api/existenciaBodega.api";
import type { ExistenciaBodega } from "../types/existenciaBodega.interface";
import type { PaginationParams, PaginatedResponse } from '@/shared/types/pagination';

export const getExistenciaBodegasAction = async (
  params?: PaginationParams
): Promise<ExistenciaBodega[] | PaginatedResponse<ExistenciaBodega>> => {
  try {
    const queryParams = params
      ? {
          limit: params.limit,
          offset: params.offset,
        }
      : undefined;

    const response = await existenciaBodegaApi.get<any>('/', {
      params: queryParams,
    });

    // Función para filtrar existencias donde item y bodega estén activos
    const filterActivos = (existencias: ExistenciaBodega[]): ExistenciaBodega[] => {
      return existencias.filter((existencia) => {
        const itemActivo = existencia.item?.activo === 'ACTIVO' || (typeof existencia.item?.activo === 'boolean' && existencia.item?.activo === true);
        const bodegaActiva = existencia.bodega?.activo === 'ACTIVO' || (typeof existencia.bodega?.activo === 'boolean' && existencia.bodega?.activo === true);
        return itemActivo && bodegaActiva;
      });
    };

    // Si hay parámetros de paginación, el backend DEBE devolver un objeto con data y total
    if (params?.limit !== undefined || params?.offset !== undefined) {
      const limit = params.limit || 10;
      const offset = params.offset || 0;

      // Si el backend devuelve un array cuando se espera paginación, necesitamos obtener el total
      if (Array.isArray(response.data)) {
        // SIEMPRE obtener el total real del backend cuando devuelve un array
        try {
          const totalResponse = await existenciaBodegaApi.get<any>('/', {
            params: {
              limit: 10000, // Límite muy alto para obtener todos
              offset: 0,
            },
          });
          
          let allExistencias: ExistenciaBodega[] = [];
          if (Array.isArray(totalResponse.data)) {
            allExistencias = totalResponse.data;
          } else if (
            totalResponse.data &&
            typeof totalResponse.data === 'object' &&
            'data' in totalResponse.data
          ) {
            allExistencias = (totalResponse.data as any).data || [];
          }
          
          // Filtrar solo activos
          const allActivos = filterActivos(allExistencias);
          const total = allActivos.length;
          
          // Filtrar la página actual
          const currentActivos = filterActivos(response.data as ExistenciaBodega[]);
          
          return {
            data: currentActivos,
            total: total,
          };
        } catch (totalError) {
          // Si falla obtener el total, usar lógica de fallback
          const currentActivos = filterActivos(response.data as ExistenciaBodega[]);
          
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
        const allData = (response.data.data || []) as ExistenciaBodega[];
        const total = response.data.total ?? 0;
        
        // Filtrar solo activos
        const activos = filterActivos(allData);
        
        // Obtener el total real de activos si el backend no lo proporciona correctamente
        let totalActivos = total;
        if (total === 0 || total === allData.length) {
          try {
            const totalResponse = await existenciaBodegaApi.get<any>('/', {
              params: {
                limit: 10000,
                offset: 0,
              },
            });
            
            let allExistencias: ExistenciaBodega[] = [];
            if (Array.isArray(totalResponse.data)) {
              allExistencias = totalResponse.data;
            } else if (
              totalResponse.data &&
              typeof totalResponse.data === 'object' &&
              'data' in totalResponse.data
            ) {
              allExistencias = (totalResponse.data as any).data || [];
            }
            
            totalActivos = filterActivos(allExistencias).length;
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
      const allData = response.data as ExistenciaBodega[];
      const activos = filterActivos(allData);
      return activos;
    }

    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data
    ) {
      const allData = (response.data.data || []) as ExistenciaBodega[];
      const activos = filterActivos(allData);
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
