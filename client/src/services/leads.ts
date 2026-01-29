import api from './api';

export interface Lead {
    id: string;
    name: string;
    budget?: number;
    currency?: string;
    status: string;
    contactId?: string;
    contact?: {
        firstName: string;
        lastName: string;
    };
    createdAt: string;
}

export interface CreateLeadDTO {
    name: string;
    budget?: number;
    currency?: string;
    status?: string;
    contactId?: string;
}

export const leadsService = {
    getAll: async (): Promise<Lead[]> => {
        const response = await api.get<Lead[]>('/leads');
        return response.data;
    },

    create: async (data: CreateLeadDTO): Promise<Lead> => {
        const response = await api.post<Lead>('/leads', data);
        return response.data;
    },

    update: async (id: string, data: Partial<CreateLeadDTO>): Promise<Lead> => {
        const response = await api.patch<Lead>(`/leads/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/leads/${id}`);
    }
};
