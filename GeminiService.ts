
import { GoogleGenAI, Type } from '@google/genai';
import type { MenuItem, SpecialDish } from './types.ts';

// IMPORTANT: This assumes the API_KEY is set in the environment.
// Do not add any UI or logic to handle the API key in the app.
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY, vertexai: true });

export const generateChefSpecials = async (menuItems: MenuItem[]): Promise<SpecialDish[]> => {
    const availableItems = menuItems.filter(item => item.stock > 0);
    if (availableItems.length === 0) {
        throw new Error("No items in stock to generate specials from.");
    }

    const inventoryList = availableItems.map(item => `${item.name} (Category: ${item.category}, Stock: ${item.stock})`).join(', ');

    const prompt = `
        You are an expert executive chef for a modern restaurant. Your task is to create three exciting "Chef's Specials" for today's menu.

        Analyze the following list of currently available inventory items:
        ${inventoryList}

        Based on this inventory, generate three unique and appealing special dishes. For each dish, provide:
        1. A creative and enticing name.
        2. A brief, mouth-watering description (20-30 words).
        3. A suggested price in Indian Rupees (INR) (as a number).
        4. A list of key ingredients used from the inventory.

        Your response must be a valid JSON array, adhering to the provided schema. Do not include any text or markdown formatting outside of the JSON structure.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { role: 'user', parts: [{ text: prompt }] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING, description: "The creative name of the special dish." },
                            description: { type: Type.STRING, description: "A brief, appealing description of the dish." },
                            price: { type: Type.NUMBER, description: "The suggested price for the dish." },
                            ingredients: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING },
                                description: "List of key ingredients used."
                            },
                        },
                        required: ["name", "description", "price", "ingredients"]
                    },
                },
            },
        });

        const jsonText = response.text.trim();
        const specials = JSON.parse(jsonText) as SpecialDish[];
        return specials;

    } catch (error) {
        console.error("Error generating chef specials:", error);
        if (error instanceof Error) {
             throw new Error(`Failed to generate specials from AI: ${error.message}`);
        }
        throw new Error("An unknown error occurred while communicating with the AI.");
    }
};
