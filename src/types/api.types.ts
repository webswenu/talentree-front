export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    timestamp?: string;
}

export interface ApiError {
    statusCode: number;
    message: string | string[];
    error: string;
    timestamp?: string;
}
