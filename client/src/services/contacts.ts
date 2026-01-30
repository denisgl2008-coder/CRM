import api from './api';

export interface Contact {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    position: string;
    companyId?: string;
    assignedTo?: string; // New field
    company?: { name: string };
    creator?: { name: string };
    assignee?: { id: string, name: string; avatarUrl?: string }; // Relation
    createdAt: string;
    updatedAt: string; // Add modification date
}

export interface CreateContactDTO {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    position?: string;
    companyId?: string;
    assignedTo?: string;
}

export const contactsService = {
    getAll: async (): Promise<Contact[]> => {
        const response = await api.get<Contact[]>('/contacts');
        return response.data;
    },

    create: async (data: CreateContactDTO): Promise<Contact> => {
        const response = await api.post<Contact>('/contacts', data);
        return response.data;
    },

    update: async (id: string, data: Partial<CreateContactDTO>): Promise<Contact> => {
        const response = await api.put<Contact>(`/contacts/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/contacts/${id}`);
    }
};
