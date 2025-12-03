import { RecepcionApi } from '../api/recepcion.api';
import type { Recepcion } from '../types/recepcion.interface';
import type {
  PaginationParams,
  PaginatedResponse,
} from '@/shared/types/pagination';

export const getRecepcionAction = async (
  params?: PaginationParams
): Promise<Recepcion[] | PaginatedResponse<Recepcion>> => {
  try {
    const queryParams = params
      ? {
          limit: params.limit,
          offset: params.offset,
        }
      : undefined;

    const response = await RecepcionApi.get<any>('/', {
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
          const totalResponse = await RecepcionApi.get<any>('/', {
            params: {
              limit: 10000, // Límite muy alto para obtener todos
              offset: 0,
            },
          });
          
          let allRecepciones: Recepcion[] = [];
          if (Array.isArray(totalResponse.data)) {
            allRecepciones = totalResponse.data;
          } else if (
            totalResponse.data &&
            typeof totalResponse.data === 'object' &&
            'data' in totalResponse.data
          ) {
            allRecepciones = (totalResponse.data as any).data || [];
          }
          
          // Ordenar todos
          allRecepciones.sort((a, b) => {
            const dateA = new Date(a.fechaRecepcion || 0).getTime();
            const dateB = new Date(b.fechaRecepcion || 0).getTime();
            return dateB - dateA; // DESC
          });
          
          const total = allRecepciones.length;
          
          // Ordenar la página actual
          const currentData = response.data as Recepcion[];
          currentData.sort((a, b) => {
            const dateA = new Date(a.fechaRecepcion || 0).getTime();
            const dateB = new Date(b.fechaRecepcion || 0).getTime();
            return dateB - dateA; // DESC
          });
          
          return {
            data: currentData,
            total: total,
          };
        } catch (totalError) {
          // Si falla obtener el total, usar lógica de fallback
          const currentData = response.data as Recepcion[];
          currentData.sort((a, b) => {
            const dateA = new Date(a.fechaRecepcion || 0).getTime();
            const dateB = new Date(b.fechaRecepcion || 0).getTime();
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
        const allData = (response.data.data || []) as Recepcion[];
        const total = response.data.total ?? 0;
        
        // Ordenar
        allData.sort((a, b) => {
          const dateA = new Date(a.fechaRecepcion || 0).getTime();
          const dateB = new Date(b.fechaRecepcion || 0).getTime();
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
      const allData = response.data as Recepcion[];
      allData.sort((a, b) => {
        const dateA = new Date(a.fechaRecepcion || 0).getTime();
        const dateB = new Date(b.fechaRecepcion || 0).getTime();
        return dateB - dateA; // DESC
      });
      return allData;
    }

    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data
    ) {
      const allData = (response.data.data || []) as Recepcion[];
      allData.sort((a, b) => {
        const dateA = new Date(a.fechaRecepcion || 0).getTime();
        const dateB = new Date(b.fechaRecepcion || 0).getTime();
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
