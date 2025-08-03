// Tipos para respuestas de API y manejo de errores

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    code?: string;
}

export interface ErrorResponse {
    error: string;
    code: string;
    timestamp: number;
}

export interface SuccessResponse<T = any> {
    success: true;
    data: T;
}

export interface FailureResponse {
    success: false;
    error: string;
    code: string;
}
