import api from './api';

export interface DashboardStats {
    totalLeads: number;
    pipelineValue: number;
    activeTasks: number;
    tasksDueToday: number;
    recentActivity: {
        id: string;
        name: string;
        budget: number;
        status: string;
        createdAt: string;
        creator: {
            name: string;
        };
    }[];
}

export const statsService = {
    getStats: async (): Promise<DashboardStats> => {
        const response = await api.get<DashboardStats>('/stats');
        return response.data;
    }
};
