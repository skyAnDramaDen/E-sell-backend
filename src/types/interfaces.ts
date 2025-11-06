export interface RegisterRequestBody {
    name: string;
    email: string;
    password: string;
}

export interface UserDTO {
    id: string;
    name: string;
    email: string;
}

export interface AuthResponse {
    token?: string;
    message: string;
    user?: UserDTO;
}

export interface LoginRequestBody {
    email: string;
    password: string;
}