export interface ApiResponse<T = any> {
  status: number;
  errors: string[];
  data: T;
}
