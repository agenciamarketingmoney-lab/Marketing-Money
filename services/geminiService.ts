
import { GoogleGenAI, Type } from "@google/genai";
import { DailyMetrics, AIInsight } from "../types";

// Always use a named parameter and obtain the API key from process.env.API_KEY directly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateMarketingInsights = async (metrics: DailyMetrics[]): Promise<AIInsight> => {
  const model = 'gemini-3-flash-preview';
  
  const prompt = `Analyze these marketing metrics for the last period:
    ${JSON.stringify(metrics)}
    
    Provide a professional strategic summary for a marketing agency, focusing on ROAS, CPC, and conversion rates.
    Include specific alerts (if any metrics are dropping) and growth opportunities.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: 'Executive summary of performance' },
            alerts: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: 'List of critical alerts or technical warnings'
            },
            opportunities: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: 'List of strategic opportunities to scale or improve'
            }
          },
          required: ['summary', 'alerts', 'opportunities']
        }
      }
    });

    // response.text is a property, not a method.
    return JSON.parse(response.text || '{}') as AIInsight;
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      summary: "Não foi possível gerar insights automáticos no momento.",
      alerts: ["Verifique a conexão com as APIs de anúncios."],
      opportunities: ["Revisar segmentação de público manualmente."]
    };
  }
};
