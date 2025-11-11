export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total?: number;
  limit?: number;
  offset?: number;
}

