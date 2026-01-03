
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { InspectionResult } from "../types";

export const analyzePCB = async (base64Image: string): Promise<InspectionResult> => {
  // Always create a new instance right before making an API call 
  // to ensure it uses the latest environment configuration
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `Analyze this electronic component/PCB image for manufacturing defects. 
  Identify components and look for:
  - Solder bridges or shorts
  - Missing components (pads without parts)
  - Burnt or discolored areas
  - Component misalignment (rotation/offset)
  - Poor solder joints (cold joints, insufficient wetting)
  
  Provide a detailed technical report in JSON format. If the unit is scrap, explain why.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/jpeg' } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: { type: Type.STRING, description: "Pass or Fail status" },
            summary: { type: Type.STRING, description: "Executive summary of the inspection" },
            defects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  component: { type: Type.STRING },
                  type: { type: Type.STRING },
                  confidence: { type: Type.NUMBER },
                  description: { type: Type.STRING },
                  severity: { type: Type.STRING },
                  location: {
                     type: Type.OBJECT,
                     properties: {
                       x: { type: Type.NUMBER },
                       y: { type: Type.NUMBER },
                       width: { type: Type.NUMBER },
                       height: { type: Type.NUMBER }
                     },
                     required: ["x", "y", "width", "height"]
                  }
                },
                required: ["component", "type", "confidence", "description", "severity", "location"]
              }
            }
          },
          required: ["status", "summary", "defects"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    
    const parsed = JSON.parse(text) as InspectionResult;
    return {
      ...parsed,
      timestamp: new Date().toISOString(),
      image: base64Image
    };
  } catch (error: any) {
    if (error.message?.includes("API key not valid")) {
      throw new Error("System Configuration Error: The AI core is not currently active.");
    }
    throw error;
  }
};

export const searchReference = async (query: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Find technical reference and standard IPC-A-610 criteria for the following defect: ${query}`,
    config: {
      tools: [{ googleSearch: {} }]
    }
  });
  
  return {
    text: response.text,
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};
