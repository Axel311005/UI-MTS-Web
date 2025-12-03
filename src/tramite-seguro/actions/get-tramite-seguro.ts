import { TramiteSeguroApi } from '../api/tramiteSeguro.api';
import type { TramiteSeguro } from '../types/tramiteSeguro.interface';
import type {
  PaginationParams,
  PaginatedResponse,
} from '@/shared/types/pagination';

export const getTramiteSeguroAction = async (
  params?: PaginationParams
): Promise<TramiteSeguro[] | PaginatedResponse<TramiteSeguro>> => {
  try {
    const queryParams = params
      ? {
          limit: params.limit,
          offset: params.offset,
        }
      : undefined;

    const response = await TramiteSeguroApi.get<any>('/', {
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
          const totalResponse = await TramiteSeguroApi.get<any>('/', {
            params: {
              limit: 10000, // Límite muy alto para obtener todos
              offset: 0,
            },
          });
          
          let allTramites: TramiteSeguro[] = [];
          if (Array.isArray(totalResponse.data)) {
            allTramites = totalResponse.data;
          } else if (
            totalResponse.data &&
            typeof totalResponse.data === 'object' &&
            'data' in totalResponse.data
          ) {
            allTramites = (totalResponse.data as any).data || [];
          }
          
          // Ordenar todos
          allTramites.sort((a, b) => {
            const dateA = new Date(a.fechaInicio || 0).getTime();
            const dateB = new Date(b.fechaInicio || 0).getTime();
            return dateB - dateA; // DESC
          });
          
          const total = allTramites.length;
          
          // Ordenar la página actual
          const currentData = response.data as TramiteSeguro[];
          currentData.sort((a, b) => {
            const dateA = new Date(a.fechaInicio || 0).getTime();
            const dateB = new Date(b.fechaInicio || 0).getTime();
            return dateB - dateA; // DESC
          });
          
          return {
            data: currentData,
            total: total,
          };
        } catch (totalError) {
          // Si falla obtener el total, usar lógica de fallback
          const currentData = response.data as TramiteSeguro[];
          currentData.sort((a, b) => {
            const dateA = new Date(a.fechaInicio || 0).getTime();
            const dateB = new Date(b.fechaInicio || 0).getTime();
            return dateB - dateA; // DESC
          });
          
          if (currentData.length < limit) {
            const calculatedTotal = offset + currentData.length;
            return {
              data: currentData,
              total: calculatedTotal,
            };
          }
          const estimatedTotal = offset + currentData.length + 1;
          return {
            data: currentData,
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
        const allData = (response.data.data || []) as TramiteSeguro[];
        const total = response.data.total ?? 0;
        
        // Ordenar
        allData.sort((a, b) => {
          const dateA = new Date(a.fechaInicio || 0).getTime();
          const dateB = new Date(b.fechaInicio || 0).getTime();
          return dateB - dateA; // DESC
        });
        
        return {
          data: allData,
          total: total,
        };
      }
    }

    // Sin paginación, devolver array directamente
    if (Array.isArray(response.data)) {
      const allData = response.data as TramiteSeguro[];
      allData.sort((a, b) => {
        const dateA = new Date(a.fechaInicio || 0).getTime();
        const dateB = new Date(b.fechaInicio || 0).getTime();
        return dateB - dateA; // DESC
      });
      return allData;
    }

    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data
    ) {
      const allData = (response.data.data || []) as TramiteSeguro[];
      allData.sort((a, b) => {
        const dateA = new Date(a.fechaInicio || 0).getTime();
        const dateB = new Date(b.fechaInicio || 0).getTime();
        return dateB - dateA; // DESC
      });
      return {
        data: allData,
        total: response.data.total ?? allData.length,
      };
    }

    return [];
  } catch (error) {
    throw error;
  }
};
