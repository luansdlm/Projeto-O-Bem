import { HealthProfile } from '../entities/user';

export interface AnalysisResult {
  status: 'green' | 'yellow' | 'red';
  reason: string;
  category?: 'alimento' | 'medicamento' | 'beleza' | 'outro';
  identifiedIngredients: string[];
  translatedIngredients: string;
  detectedLanguage: string;
  detectedProductName?: string;
  riskCriticality: 'high' | 'medium' | 'low';
  detectedBrand?: string;
  detectedModel?: string;
  detectedCountry?: string;
  detectedNutritionalInfo?: string;
}

export interface IAIRepository {
  analyzeIngredients(
    imageBase64: string, 
    profile: HealthProfile,
    language?: string
  ): Promise<AnalysisResult>;
}
