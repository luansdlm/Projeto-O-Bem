import { IAIRepository, AnalysisResult } from "../domain/repositories/aiRepository";
import { HealthProfile } from "../domain/entities/user";
import { isRailsEnabled } from "../lib/config";
import { apiClient } from "./apiClient";
import { auth } from "../lib/firebase";

export class GeminiService implements IAIRepository {
  constructor() {
    // Não precisa inicializar GoogleGenAI no cliente browser!
    // As chamadas serão delegadas de forma segura para o proxy no servidor Express
  }

  async recognizeProductFromImage(imageBase64: string): Promise<{ barcode?: string; productName?: string; brand?: string; isSupportedCategory?: boolean }> {
    if (isRailsEnabled()) {
      try {
        const token = await auth.currentUser?.getIdToken();
        const result = await apiClient.recognizeProduct(imageBase64, token);
        return {
          barcode: result.barcode || "",
          productName: result.productName || "",
          brand: result.brand || "",
          isSupportedCategory: result.isSupportedCategory !== false
        };
      } catch (error) {
        console.warn("Erro no OCR rápido via Rails backend. Tentando prosseguir offline:", error);
        return {};
      }
    }

    try {
      const response = await fetch('/api/gemini/recognize-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ imageBase64 })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP error ${response.status}`);
      }

      const parsed = await response.json();
      return {
        barcode: parsed.barcode || "",
        productName: parsed.productName || "",
        brand: parsed.brand || "",
        isSupportedCategory: parsed.isSupportedCategory !== false
      };
    } catch (error) {
      console.warn("Erro no OCR rápido de produto via servidor:", error);
      return {};
    }
  }

  async analyzeIngredients(imageBase64: string, profile: HealthProfile, language?: string): Promise<AnalysisResult> {
    if (isRailsEnabled()) {
      try {
        const token = await auth.currentUser?.getIdToken();
        const result = await apiClient.analyzeWithGemini(imageBase64, profile, token);
        return result as AnalysisResult;
      } catch (error) {
        console.error("Erro na análise inteligente via Rails:", error);
        throw new Error("Falha ao processar imagem do rótulo no Rails backend.");
      }
    }

    try {
      const response = await fetch('/api/gemini/analyze-ingredients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ imageBase64, profile, language })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP error ${response.status}`);
      }

      return await response.json() as AnalysisResult;
    } catch (error) {
      console.error("Erro na análise Gemini via servidor:", error);
      throw new Error("Falha ao processar imagem do rótulo. Verifique a conexão e tente novamente.");
    }
  }

  async analyzeFrontLabel(imageBase64: string, language?: string): Promise<{ productName?: string; brand?: string; model?: string; category?: 'alimento' | 'medicamento' | 'beleza' | 'outro' }> {
    try {
      const response = await fetch('/api/gemini/analyze-front-label', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ imageBase64, language })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP error ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erro na análise do rótulo frontal via servidor:", error);
      return {};
    }
  }

  async analyzeBackLabel(
    imageBase64: string, 
    profile: HealthProfile, 
    language?: string
  ): Promise<{ 
    status: 'green' | 'yellow' | 'red'; 
    reason: string; 
    riskCriticality: 'high' | 'medium' | 'low'; 
    identifiedIngredients: string[]; 
    translatedIngredients: string; 
    detectedLanguage: string; 
    detectedNutritionalInfo?: string 
  }> {
    try {
      const response = await fetch('/api/gemini/analyze-back-label', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ imageBase64, profile, language })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP error ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erro na análise do rótulo de ingredientes via servidor:", error);
      throw new Error("Falha ao processar imagem de ingredientes.");
    }
  }
}
