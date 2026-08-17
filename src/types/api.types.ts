export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    timestamp?: string;
}

/** Forma de respuesta de todos los listados paginados de la API. */
export interface PaginatedResult<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface ApiError {
    statusCode: number;
    message: string | string[];
    error: string;
    timestamp?: string;
}
