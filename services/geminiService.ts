import { GoogleGenAI, Type } from "@google/genai";
import { InvestmentInsight, Brand } from '../types';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fetchBrandInsight = async (brand: Brand): Promise<InvestmentInsight> => {
  const modelId = "gemini-2.5-flash";

  const prompt = `
    Act as a senior automotive investment analyst attending the Guangzhou Auto Show.
    Analyze the brand "${brand.name}" (Stock Code: ${brand.stockCode || 'N/A'}).
    
    Focus on:
    1. Their latest key model displayed (${brand.models.length > 0 ? brand.models[0].name : 'Generic'}).
    2. Market sentiment regarding their NEV transition or luxury positioning.
    3. A short, punchy verdict for an investor.

    Provide the response in JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            brandName: { type: Type.STRING },
            analysis: { type: Type.STRING },
            sentiment: { type: Type.STRING, enum: ['Bullish', 'Neutral', 'Bearish'] }
          },
          required: ['brandName', 'analysis', 'sentiment']
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as InvestmentInsight;

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      brandName: brand.name,
      analysis: "AI Analysis currently unavailable. Check network connection or API key.",
      sentiment: 'Neutral'
    };
  }
};
