import { IProductRepository } from '../domain/repositories/IProductRepository';
import { Product } from '../domain/entities/product';
import { HealthProfile } from '../domain/entities/user';
import { AnalysisResult, IAIRepository } from '../domain/repositories/aiRepository';
import { analyzeIngredientsLocally } from './localAnalyzer';

export class ProductService {
  private productRepo: IProductRepository;
  private aiRepo?: IAIRepository;

  /**
   * Padrão Inversão de Dependência (D de SOLID):
   * O serviço depende exclusivamente de abstrações (interfaces) e não de implementações concretas de banco de dados
   * ou SDKs específicos de inteligência artificial.
   */
  constructor(productRepo: IProductRepository, aiRepo?: IAIRepository) {
    this.productRepo = productRepo;
    this.aiRepo = aiRepo;
  }

  /**
   * Fluxo Orquestrador:
   * 1. Consulta o banco global utilizando o repositório injetado.
   * 2. Se o produto existir, fazemos análise de ingredientes instantânea localmente (Offline / R$ 0).
   * 3. Se o produto não for encotrado e houver imagem e repositório de IA configurados:
   *    a. Realiza o escaneamento/leitura inteligente via IA.
   *    b. Salva o produto descoberto dinamicamente no banco para otimizar futuras consultas da comunidade.
   *    c. Retorna os resultados classificados.
   */
  async processScan(
    barcode: string, 
    profile: HealthProfile, 
    imageBase64?: string
  ): Promise<{ result: AnalysisResult; isFromDatabase: boolean }> {
    
    // 1. Tenta buscar da base global (seja Firebase, Supabase ou outro)
    const existingProduct = await this.productRepo.getProductByBarcode(barcode);

    if (existingProduct) {
      console.log(`[ProductService] Produto ${barcode} encontrado na base de dados global! Executando análise local.`);
      // Retorna análise por cruzamento offline usando nosso analisador de regras estruturadas
      const analysisResult = analyzeIngredientsLocally(existingProduct, profile);
      return {
        result: analysisResult,
        isFromDatabase: true
      };
    }

    // 2. Fallback: Produto não localizado no banco. Se houver imagem, ativamos a IA
    if (!imageBase64 || !this.aiRepo) {
      throw new Error(`Produto com o código de barras ${barcode} não foi encontrado na base global, e nenhuma imagem ou serviço de IA está disponível para análise.`);
    }

    console.log(`[ProductService] Produto ${barcode} não localizado localmente. Disparando análise de IA.`);
    
    // Executa análise de scanner inteligente (via Gemini ou similar)
    const aiAnalysis = await this.aiRepo.analyzeIngredients(imageBase64, profile);

    // 3. Cadastra o novo produto no banco global de forma assíncrona/segura para a comunidade se beneficiar depois
    const newProduct: Omit<Product, 'lastProcessed'> = {
      barcode,
      name: aiAnalysis.detectedProductName || "Produto Desconhecido",
      brand: aiAnalysis.detectedBrand || "",
      model: aiAnalysis.detectedModel || "",
      country: aiAnalysis.detectedCountry || "Brasil",
      language: aiAnalysis.detectedLanguage || "Português",
      ingredientsText: aiAnalysis.translatedIngredients,
      ingredientsOriginal: aiAnalysis.identifiedIngredients?.join(", ") || "",
      nutritionalInfo: aiAnalysis.detectedNutritionalInfo || ""
    };

    try {
      await this.productRepo.saveProduct(newProduct);
      console.log(`[ProductService] Produto ${barcode} catalogado com sucesso via IA na base global.`);
    } catch (saveError) {
      // Falha ao catalogar no banco não deve impedir que o usuário receba a análise atual
      console.warn(`[ProductService] Erro não-bloqueante ao registrar produto na base global:`, saveError);
    }

    return {
      result: aiAnalysis,
      isFromDatabase: false
    };
  }
}
