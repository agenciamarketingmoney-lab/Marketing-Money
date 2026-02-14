import { GoogleGenAI, Type } from "@google/genai";
import { DailyMetrics, AIInsight } from "../types";

export const generateMarketingInsights = async (metrics: DailyMetrics[]): Promise<AIInsight> => {
  // Garantir que estamos pegando a chave no momento da execução
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === "undefined") {
    console.warn("Nexus AI: Chave de inteligência não configurada. Operando em modo analítico manual.");
    return {
      summary: "O sistema Nexus está aguardando a ativação da camada de inteligência artificial para este projeto.",
      alerts: ["Módulo de IA em modo de espera."],
      opportunities: ["Analise os gráficos de performance para insights manuais."]
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const model = 'gemini-3-flash-preview';
    
    const prompt = `Analise estas métricas de marketing do último período:
      ${JSON.stringify(metrics)}
      
      Forneça um resumo estratégico profissional para uma agência de marketing, focando em ROAS, CPC e taxas de conversão.
      Inclua alertas específicos (se alguma métrica estiver caindo) e oportunidades de crescimento.`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: 'Resumo executivo da performance' },
            alerts: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: 'Lista de alertas críticos ou avisos técnicos'
            },
            opportunities: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: 'Lista de oportunidades estratégicas para escala ou melhoria'
            }
          },
          required: ['summary', 'alerts', 'opportunities']
        }
      }
    });

    const text = response.text || '{}';
    return JSON.parse(text) as AIInsight;
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      summary: "Não foi possível gerar insights automáticos devido a uma falha na conexão com a Nexus AI.",
      alerts: ["Erro de comunicação com o servidor de inteligência."],
      opportunities: ["Revisar dados diretamente nos dashboards."]
    };
  }
};