import axios from 'axios';

const API_Base = 'http://127.0.0.1:8000';

export const analyzeSpec = async (spec) => {
    try {
        const response = await axios.post(`${API_Base}/analyze`, spec);
        return response.data;
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
}

export const generateCode = async (spec) => {
    try {
        const response = await axios.post(`${API_Base}/generate-code`, spec);
        return response.data;
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
}

export const generateFloorplan = async (graph) => {
    try {
        const response = await axios.post(`${API_Base}/generate-floorplan`, graph);
        return response.data;
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
}
// AI Features
export const analyzeWithAI = async (spec) => {
    try {
        const response = await axios.post(`${API_Base}/ai/analyze`, spec);
        return response.data;
    } catch (error) {
        console.error("AI Analysis failed:", error);
        throw error;
    }
};

export const optimizeWithAI = async (spec, goal) => {
    try {
        const response = await axios.post(`${API_Base}/ai/optimize`, spec, { params: { goal } });
        return response.data;
    } catch (error) {
        console.error("AI Optimization failed:", error);
        throw error;
    }
};
