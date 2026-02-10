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

export interface ListingResponseBody {
    product?: Product;
    message?: string;
    error?: string | undefined;
    images?: string[]
    success?: boolean;
}

export interface Listing {
    product: Product;
    images: string[];
}

export type Listings = Listing[] | { message: string };

export interface Product {
    id: string;
    name: string;
    description: string;
    condition: string;
    price: number;
    availability: boolean;
    topCategoryId: string;
    topCategory: string;
    subCategoryId: string;
    subCategory: string;
    lowestCategoryId?: string | null;
    lowestCategory?: string | null;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    user?: User;
    location?: string | null;
}

export type Products = Product[];

export interface User {
    id: string;
    name: string;
    email: string;
    password: string;
    role: "user" | "admin" | "moderator";
    createdAt: Date;
    updatedAt: Date;
    products?: Product[];
}
