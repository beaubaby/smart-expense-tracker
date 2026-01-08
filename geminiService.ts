
import { GoogleGenAI, Type } from "@google/genai";
import { Category } from "./types";

const API_KEY = process.env.API_KEY;

export const isGeminiAvailable = !!API_KEY;

export const parseReceiptImage = async (base64Image: string) => {
  if (!API_KEY) {
    throw new Error("GEMINI_API_KEY_MISSING");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

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

    const textOutput = response.text || '{}';
    return JSON.parse(textOutput);
  } catch (error) {
    console.error("Error parsing receipt with Gemini:", error);
    throw error;
  }
};
