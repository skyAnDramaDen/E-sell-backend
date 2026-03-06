export interface RegisterRequestBody {
    username: string;
    email: string;
    password: string;
}

export interface UserDTO {
    id: string;
    username: string;
    email: string;
    phoneNumber: string;
}

export interface AuthResponse {
    token?: string;
    message: string;
    user?: UserDTO;
    success: boolean;
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

export interface ProductAndSellerResponseBody {
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
    location: string | null;
    sellerName: string;
    sellerPhoneNumber: string;
    message?: string;
    images: string[]
    success: boolean;
}

export interface Listing {
    product: Product;
    images: string[];
}

export type Listings = Listing[] | { message: string, success: boolean };

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

export interface MessageAndSuccessResponseBody {
    message: string;
    success: boolean;
}

export type Products = Product[];

export interface User {
    id: string;
    username?: string | null | undefined;
    email: string;
    password: string;
    role: "user" | "admin" | "moderator";
    createdAt: Date;
    updatedAt: Date;
    products?: Product[];
    phoneNumber?: string | null;
    profileImageUri?: string | null;
}

export interface EditUserResponseBody {
    success: boolean;
    message?: any;
    user?: User;
}

export interface GetUserResponseBody {
    user?: User;
    success: boolean;
}

export interface EditUserPayload {
    user: UserDTO;
    formData: FormData;
}