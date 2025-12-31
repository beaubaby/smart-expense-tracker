
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
            text: `Extract the expense details from this receipt or screenshot.
            Target conversion currency: ${DEFAULT_CURRENCY}.
            1. Identify the original amount and currency in the image.
            2. Convert the amount to ${DEFAULT_CURRENCY} using a recent approximate exchange rate.
            3. Extract date, category, and description. 
            Valid categories: ${Object.values(Category).join(', ')}.
            Return as valid JSON.`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            originalAmount: { type: Type.NUMBER, description: "The amount as shown on the receipt" },
            originalCurrency: { type: Type.STRING, description: "The currency code found (e.g., THB, USD, NZD)" },
            convertedAmount: { type: Type.NUMBER, description: `The amount converted to ${DEFAULT_CURRENCY}` },
            category: { type: Type.STRING, description: "The categorized type of expense" },
            date: { type: Type.STRING, description: "YYYY-MM-DD" },
            description: { type: Type.STRING, description: "Short summary of the expense" }
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

export const getConversionRate = async (fromCurrency: string, toCurrency: string): Promise<number> => {
  if (fromCurrency === toCurrency) return 1;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `What is the approximate current exchange rate from ${fromCurrency} to ${toCurrency}? Return only the numeric value as a single number string.`,
    });
    const rate = parseFloat(response.text.trim());
    return isNaN(rate) ? 1 : rate;
  } catch (error) {
    console.error("Error fetching conversion rate:", error);
    return 1;
  }
};
