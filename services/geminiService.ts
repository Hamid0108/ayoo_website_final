import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateStoreInsights = async (storeName: string, category: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `I am a merchant owner of a store called "${storeName}" which is a "${category}". 
      Give me 3 brief, bulleted tips on how to increase sales for this specific type of business. 
      Keep it professional and encouraging.`,
    });
    return response.text || "No insights available.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Could not generate insights at this time.";
  }
};

export const suggestCategories = async (storeCategory: string): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `List 5 common product categories for a "${storeCategory}" shop.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });
    
    if (response.text) {
      return JSON.parse(response.text);
    }
    return [];
  } catch (error) {
    console.error("Gemini Error:", error);
    return ["General", "Sale", "New"];
  }
};

export const generateProductDescription = async (productName: string, categoryName: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Write a short, catchy product description (max 2 sentences) for a product named "${productName}" in the category "${categoryName}".`,
    });
    return response.text || "";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "";
  }
};
