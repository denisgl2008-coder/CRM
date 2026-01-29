import api from './api';

export interface Company {
    id: string;
    name: string;
    email: string;
    phone: string;
    website: string;
    industry: string;
    address?: string;
    assignedTo?: string;
    creator?: { name: string };
    assignee?: { id: string, name: string; avatarUrl?: string };
    createdAt?: string;
}

export interface CreateCompanyDTO {
    name: string;
    email?: string;
    phone?: string;
    website?: string;
    industry?: string;
    address?: string;
    assignedTo?: string;
}

export const companiesService = {
    getAll: async (): Promise<Company[]> => {
        const response = await api.get<Company[]>('/companies');
        return response.data;
    },

    create: async (data: CreateCompanyDTO): Promise<Company> => {
        const response = await api.post<Company>('/companies', data);
        return response.data;
    },

    update: async (id: string, data: Partial<CreateCompanyDTO>): Promise<Company> => {
        const response = await api.patch<Company>(`/companies/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/companies/${id}`);
    }
};
