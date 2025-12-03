import { compraApi } from '../api/compra.api';
import type { Compra } from '../types/Compra.interface';
import type { PaginationParams, PaginatedResponse } from '@/shared/types/pagination';

export const getComprasAction = async (
  params?: PaginationParams
): Promise<Compra[] | PaginatedResponse<Compra>> => {
  try {
    // El backend solo acepta limit, offset y q en los query params
    const queryParams = params
      ? {
          limit: params.limit,
          offset: params.offset,
        }
      : undefined;

    const response = await compraApi.get<any>('/', {
      params: queryParams,
    });

    // Función para filtrar compras anuladas
    const filterAnuladas = (compras: Compra[]): Compra[] => {
      return compras.filter((compra) => {
        const isAnulado = compra.anulado === true;
        const isEstadoAnulado =
          typeof compra.estado === 'string' &&
          compra.estado.toUpperCase() === 'ANULADA';
        return !isAnulado && !isEstadoAnulado;
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
          const totalResponse = await compraApi.get<any>('/', {
            params: {
              limit: 10000, // Límite muy alto para obtener todos
              offset: 0,
            },
          });
          
          let allCompras: Compra[] = [];
          if (Array.isArray(totalResponse.data)) {
            allCompras = totalResponse.data;
          } else if (
            totalResponse.data &&
            typeof totalResponse.data === 'object' &&
            'data' in totalResponse.data
          ) {
            allCompras = (totalResponse.data as any).data || [];
          }
          
          // Filtrar solo no anuladas y ordenar
          const allValidas = filterAnuladas(allCompras);
          allValidas.sort((a, b) => {
            const dateA = new Date(a.fecha).getTime();
            const dateB = new Date(b.fecha).getTime();
            return dateB - dateA; // DESC
          });
          
          const total = allValidas.length;
          
          // Filtrar y ordenar la página actual
          const currentValidas = filterAnuladas(response.data as Compra[]);
          currentValidas.sort((a, b) => {
            const dateA = new Date(a.fecha).getTime();
            const dateB = new Date(b.fecha).getTime();
            return dateB - dateA; // DESC
          });
          
          return {
            data: currentValidas,
            total: total,
          };
        } catch (totalError) {
          // Si falla obtener el total, usar lógica de fallback
          const currentValidas = filterAnuladas(response.data as Compra[]);
          currentValidas.sort((a, b) => {
            const dateA = new Date(a.fecha).getTime();
            const dateB = new Date(b.fecha).getTime();
            return dateB - dateA; // DESC
          });
          
          if (currentValidas.length < limit) {
            const calculatedTotal = offset + currentValidas.length;
            return {
              data: currentValidas,
              total: calculatedTotal,
            };
          }
          // Si tenemos exactamente 'limit' elementos, asumimos que hay más
          const estimatedTotal = offset + currentValidas.length + 1;
          return {
            data: currentValidas,
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
        const allData = (response.data.data || []) as Compra[];
        const total = response.data.total ?? 0;
        
        // Filtrar solo no anuladas y ordenar
        const validas = filterAnuladas(allData);
        validas.sort((a, b) => {
          const dateA = new Date(a.fecha).getTime();
          const dateB = new Date(b.fecha).getTime();
          return dateB - dateA; // DESC
        });
        
        // Obtener el total real de no anuladas si el backend no lo proporciona correctamente
        let totalValidas = total;
        if (total === 0 || total === allData.length) {
          // Si el total es 0 o igual al total sin filtrar, obtener el total real
          try {
            const totalResponse = await compraApi.get<any>('/', {
              params: {
                limit: 10000,
                offset: 0,
              },
            });
            
            let allCompras: Compra[] = [];
            if (Array.isArray(totalResponse.data)) {
              allCompras = totalResponse.data;
            } else if (
              totalResponse.data &&
              typeof totalResponse.data === 'object' &&
              'data' in totalResponse.data
            ) {
              allCompras = (totalResponse.data as any).data || [];
            }
            
            totalValidas = filterAnuladas(allCompras).length;
          } catch (error) {
            // Si falla, usar el total proporcionado
            totalValidas = total;
          }
        }
        
        return {
          data: validas,
          total: totalValidas,
        };
      }
    }

    // Sin paginación, devolver array directamente
    if (Array.isArray(response.data)) {
      const allData = response.data as Compra[];
      const validas = filterAnuladas(allData);
      validas.sort((a, b) => {
        const dateA = new Date(a.fecha).getTime();
        const dateB = new Date(b.fecha).getTime();
        return dateB - dateA; // DESC
      });
      return validas;
    }

    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data
    ) {
      const allData = (response.data.data || []) as Compra[];
      const validas = filterAnuladas(allData);
      validas.sort((a, b) => {
        const dateA = new Date(a.fecha).getTime();
        const dateB = new Date(b.fecha).getTime();
        return dateB - dateA; // DESC
      });
      return {
        data: validas,
        total: response.data.total ?? validas.length,
      };
    }

    return [];
  } catch (error) {
    throw error;
  }
};


