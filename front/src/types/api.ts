export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface ApiValidationError {
  campo: string;
  mensagem: string;
}

export interface ApiErrorResponse {
  detail?: string;
  erros?: ApiValidationError[];
}
