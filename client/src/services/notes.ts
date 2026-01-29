import api from './api';

export interface Note {
    id: string;
    content: string;
    type?: string;
    createdAt: string;
    author?: {
        name: string;
        avatarUrl?: string;
    };
}

export interface CreateNoteDTO {
    content: string;
    contactId?: string;
    leadId?: string;
    companyId?: string;
}

export const notesService = {
    getAll: async (params: { contactId?: string; leadId?: string; companyId?: string }): Promise<Note[]> => {
        const response = await api.get<Note[]>('/notes', { params });
        return response.data;
    },

    create: async (data: CreateNoteDTO): Promise<Note> => {
        const response = await api.post<Note>('/notes', data);
        return response.data;
    }
};
