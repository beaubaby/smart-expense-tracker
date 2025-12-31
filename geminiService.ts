
import { GoogleGenAI, Type } from "@google/genai";
import { Category } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const parseReceiptImage = async (base64Image: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image,
            },
          },
          {
            text: `Extract expense details. 
            Supported Currencies: NZD, THB.
            Rule: If the currency is THB, divide the amount by 20 to get the NZD value.
            Return JSON with originalAmount, originalCurrency (NZD or THB), convertedAmount (in NZD), category, date (YYYY-MM-DD), and description.
            Valid categories: ${Object.values(Category).join(', ')}.`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            originalAmount: { type: Type.NUMBER },
            originalCurrency: { type: Type.STRING },
            convertedAmount: { type: Type.NUMBER },
            category: { type: Type.STRING },
            date: { type: Type.STRING },
            description: { type: Type.STRING }
          },
          required: ["originalAmount", "originalCurrency", "convertedAmount", "category", "date", "description"]
        }
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error parsing receipt with Gemini:", error);
    throw error;
  }
};
