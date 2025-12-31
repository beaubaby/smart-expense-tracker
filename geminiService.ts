
import { GoogleGenAI, Type } from "@google/genai";
import { Category } from "./types";
import { DEFAULT_CURRENCY } from "./constants";

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
            Target Currency for conversion: ${DEFAULT_CURRENCY}.
            1. Find the amount and original currency in the image.
            2. Convert that amount to ${DEFAULT_CURRENCY} using a recent approximate exchange rate from your knowledge.
            3. Identify the category (one of: ${Object.values(Category).join(', ')}).
            4. Extract date and description.
            Return valid JSON.`,
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
            convertedAmount: { type: Type.NUMBER, description: `Amount in ${DEFAULT_CURRENCY}` },
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
    console.error("Error parsing receipt:", error);
    throw error;
  }
};

export const getConversionRate = async (from: string, to: string) => {
  if (from === to) return 1;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `What is the current approximate exchange rate from ${from} to ${to}? Return only a number.`,
    });
    const rate = parseFloat(response.text.trim());
    return isNaN(rate) ? 1 : rate;
  } catch (error) {
    console.error("Error fetching rate:", error);
    return 1;
  }
};
