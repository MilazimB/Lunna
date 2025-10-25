
import { GoogleGenAI } from "@google/genai";
import { CardinalMoonPhase } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getLunarLore(phase: CardinalMoonPhase, date: Date): Promise<string> {
    const month = date.toLocaleString('default', { month: 'long' });
    const prompt = `Tell me about the cultural, mythological, and agricultural significance of the ${phase} in the month of ${month}. Focus on historical traditions and folklore. Keep the response to about 3-4 paragraphs.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error('Error fetching lunar lore:', error);
        throw new Error('Failed to retrieve information from the cosmos. Please try again later.');
    }
}
