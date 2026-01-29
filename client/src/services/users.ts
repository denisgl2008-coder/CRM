import api from './api';

export interface User {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string; // Optional if you have avatars
}

export const usersService = {
    getAll: async () => {
        const response = await api.get<User[]>('/users');
        return response.data;
    }
};
