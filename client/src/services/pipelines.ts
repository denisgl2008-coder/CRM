
import api from './api';

export interface PipelineStage {
    id: string;
    title: string; // frontend component expects 'title' but DB has 'name'. We can map this.
    color: string;
    bgColor: string;
}

export interface Pipeline {
    id: string;
    name: string;
    templateType: string;
    stages: {
        id: string;
        name: string;
        orderIndex: number;
        color: string;
        bgColor: string;
    }[];
}

export const pipelinesService = {
    get: async () => {
        const { data } = await api.get<Pipeline | null>('/pipelines');
        return data;
    },

    save: async (stages: any[], templateName?: string) => {
        const { data } = await api.post<Pipeline>('/pipelines', { stages, templateName });
        return data;
    }
};
