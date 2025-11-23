
import { Injectable } from '@angular/core';
import { GoogleGenAI, Type } from '@google/genai';

declare var process: any;

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private ai: GoogleGenAI;
  private modelName = 'gemini-2.5-flash';

  constructor() {
    let apiKey = '';
    try {
      // Use dot notation to allow build tools to replace process.env.API_KEY with the actual string
      apiKey = process.env.API_KEY;
    } catch (e) {
      console.warn('API Key not found in environment variables');
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  async researchBankingFormat(query: string): Promise<{ text: string, sources: string[] }> {
    // Legacy support or for generic queries
    try {
      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: `Explain the banking account format for: ${query}. Include details about IBAN structure, local routing codes, and validation rules if applicable. Be concise.`,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });

      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.map((c: any) => c.web?.uri)
        .filter((u: any) => !!u) || [];

      // Deduplicate sources
      const uniqueSources = [...new Set(sources)] as string[];

      return {
        text: response.text || 'No information found.',
        sources: uniqueSources
      };
    } catch (error) {
      console.error('Search failed', error);
      throw error;
    }
  }

  async validateIban(iban: string): Promise<any> {
    try {
      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: `Validate this IBAN: ${iban}. 
        1. Check if the structure and checksum conform to standard IBAN rules (Mod-97). 
        2. Identify the bank details including Name, BIC, Branch, Address, City, Zip and Country.
        3. Explain any errors or details.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isValid: { type: Type.BOOLEAN },
              bankName: { type: Type.STRING },
              bic: { type: Type.STRING },
              branch: { type: Type.STRING },
              address: { type: Type.STRING },
              city: { type: Type.STRING },
              zip: { type: Type.STRING },
              country: { type: Type.STRING },
              details: { type: Type.STRING, description: "A concise explanation of the format, check digits, and breakdown." }
            },
            required: ["isValid", "country", "details"]
          }
        }
      });

      return JSON.parse(response.text || '{}');
    } catch (error) {
      console.error('Gemini IBAN validation failed', error);
      throw error;
    }
  }
}
