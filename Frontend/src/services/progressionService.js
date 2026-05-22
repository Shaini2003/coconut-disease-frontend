// Frontend/src/services/progressionService.js
import axios from 'axios';

export const getProgressionReport = async (oldScore, newScore) => {
    const response = await axios.post('/api/progression/calculate', {
        oldImageScore: oldScore,
        newImageScore: newScore
    });
    return response.data;
};