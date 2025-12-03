import { AseguradoraApi } from '../api/aseguradora.api';
import type { Aseguradora } from '../types/aseguradora.interface';
import type {
  PaginationParams,
  PaginatedResponse,
} from '@/shared/types/pagination';
import { EstadoActivo } from '@/shared/types/status';

export const getAseguradoraAction = async (
  params?: PaginationParams
): Promise<Aseguradora[] | PaginatedResponse<Aseguradora>> => {
  try {
    const queryParams = params
      ? {
          limit: params.limit,
          offset: params.offset,
        }
      : undefined;

    const response = await AseguradoraApi.get<any>('/', {
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
          const totalResponse = await AseguradoraApi.get<any>('/', {
            params: {
              limit: 10000, // Límite muy alto para obtener todos
              offset: 0,
            },
          });
          
          let allAseguradoras: Aseguradora[] = [];
          if (Array.isArray(totalResponse.data)) {
            allAseguradoras = totalResponse.data;
          } else if (
            totalResponse.data &&
            typeof totalResponse.data === 'object' &&
            'data' in totalResponse.data
          ) {
            allAseguradoras = (totalResponse.data as any).data || [];
          }
          
          // Filtrar solo activos y ordenar
          const allActivos = allAseguradoras.filter(
            (a) => a.activo === EstadoActivo.ACTIVO
          );
          allActivos.sort((a, b) => {
            return (b.idAseguradora || 0) - (a.idAseguradora || 0); // DESC
          });
          
          const total = allActivos.length;
          
          // Filtrar y ordenar la página actual
          const currentActivos = (response.data as Aseguradora[]).filter(
            (a) => a.activo === EstadoActivo.ACTIVO
          );
          currentActivos.sort((a, b) => {
            return (b.idAseguradora || 0) - (a.idAseguradora || 0); // DESC
          });
          
          return {
            data: currentActivos,
            total: total,
          };
        } catch (totalError) {
          // Si falla obtener el total, usar lógica de fallback
          const currentActivos = (response.data as Aseguradora[]).filter(
            (a) => a.activo === EstadoActivo.ACTIVO
          );
          currentActivos.sort((a, b) => {
            return (b.idAseguradora || 0) - (a.idAseguradora || 0); // DESC
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
        const allData = (response.data.data || []) as Aseguradora[];
        const total = response.data.total ?? 0;
        
        // Filtrar solo activos y ordenar
        const activos = allData.filter((a) => a.activo === EstadoActivo.ACTIVO);
        activos.sort((a, b) => {
          return (b.idAseguradora || 0) - (a.idAseguradora || 0); // DESC
        });
        
        // Obtener el total real de activos si el backend no lo proporciona correctamente
        let totalActivos = total;
        if (total === 0 || total === allData.length) {
          try {
            const totalResponse = await AseguradoraApi.get<any>('/', {
              params: {
                limit: 10000,
                offset: 0,
              },
            });
            
            let allAseguradoras: Aseguradora[] = [];
            if (Array.isArray(totalResponse.data)) {
              allAseguradoras = totalResponse.data;
            } else if (
              totalResponse.data &&
              typeof totalResponse.data === 'object' &&
              'data' in totalResponse.data
            ) {
              allAseguradoras = (totalResponse.data as any).data || [];
            }
            
            totalActivos = allAseguradoras.filter(
              (a) => a.activo === EstadoActivo.ACTIVO
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
      const allData = response.data as Aseguradora[];
      const activos = allData.filter((a) => a.activo === EstadoActivo.ACTIVO);
      activos.sort((a, b) => {
        return (b.idAseguradora || 0) - (a.idAseguradora || 0); // DESC
      });
      return activos;
    }

    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data
    ) {
      const allData = (response.data.data || []) as Aseguradora[];
      const activos = allData.filter((a) => a.activo === EstadoActivo.ACTIVO);
      activos.sort((a, b) => {
        return (b.idAseguradora || 0) - (a.idAseguradora || 0); // DESC
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
