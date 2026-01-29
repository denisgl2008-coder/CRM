import api from './api';

export interface Product {
    id: string;
    sku: string;
    name: string;
    description?: string;
    price: number;
    currency: string;
    category?: string;
    stock?: number;
    isActive: boolean;
    unit?: string;
}

export interface CreateProductDTO {
    sku: string;
    name: string;
    description?: string;
    price: number;
    category?: string;
    stock?: number;
}

export const productsService = {
    getAll: async (): Promise<Product[]> => {
        const response = await api.get<Product[]>('/products');
        return response.data;
    },

    create: async (data: CreateProductDTO): Promise<Product> => {
        const response = await api.post<Product>('/products', data);
        return response.data;
    }
};
