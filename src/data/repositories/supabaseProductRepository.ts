import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { IProductRepository } from '../../domain/repositories/IProductRepository';
import { Product } from '../../domain/entities/product';

export class SupabaseProductRepository implements IProductRepository {
  private client: SupabaseClient;

  // Seguindo SOLID, injetamos a dependência externa (o client) ou passamos chaves de configuração
  constructor(clientOrUrl?: SupabaseClient | string, anonKey?: string) {
    if (clientOrUrl && typeof clientOrUrl !== 'string') {
      this.client = clientOrUrl;
    } else {
      const url = typeof clientOrUrl === 'string' ? clientOrUrl : 'https://mock-your-project.supabase.co';
      const key = anonKey || 'mock-anon-key-12345';
      this.client = createClient(url, key);
    }
  }

  async getProductByBarcode(barcode: string): Promise<Product | null> {
    const { data, error } = await this.client
      .from('products')
      .select('*')
      .eq('barcode', barcode)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Registro não encontrado em Postgrest
        return null;
      }
      console.error('Supabase getProductByBarcode error:', error);
      throw new Error(`Erro ao buscar produto no Supabase: ${error.message}`);
    }

    if (!data) return null;

    // Convertendo o modelo de persistência relacional do Supabase de volta para a Entidade de Negócio
    return {
      barcode: data.barcode,
      name: data.name,
      brand: data.brand || "",
      model: data.model || "",
      country: data.country || "",
      language: data.language || "",
      ingredientsText: data.ingredients_text, // mapeia cobrinha/snake_case para camelCase
      ingredientsOriginal: data.ingredients_original || "",
      nutritionalInfo: data.nutritional_info || "",
      lastProcessed: data.last_processed ? new Date(data.last_processed) : new Date()
    };
  }

  async findProductByNameAndBrand(name: string, brand?: string): Promise<Product | null> {
    const { data, error } = await this.client
      .from('products')
      .select('*');
    
    if (error || !data) return null;

    const cleanName = name.toLowerCase().trim();
    const cleanBrand = brand?.toLowerCase().trim() || "";

    for (const item of data) {
      const pName = (item.name || "").toLowerCase().trim();
      const pBrand = (item.brand || "").toLowerCase().trim();

      const nameMatches = pName === cleanName || pName.includes(cleanName) || cleanName.includes(pName);
      const brandMatches = !cleanBrand || !pBrand || pBrand === cleanBrand || pBrand.includes(cleanBrand) || cleanBrand.includes(pBrand);

      if (nameMatches && (brandMatches || pName === cleanName)) {
        return {
          barcode: item.barcode,
          name: item.name,
          brand: item.brand || "",
          model: item.model || "",
          country: item.country || "",
          language: item.language || "",
          ingredientsText: item.ingredients_text,
          ingredientsOriginal: item.ingredients_original || "",
          nutritionalInfo: item.nutritional_info || "",
          lastProcessed: item.last_processed ? new Date(item.last_processed) : new Date()
        };
      }
    }
    return null;
  }

  async saveProduct(product: Omit<Product, 'lastProcessed'>): Promise<void> {
    const { error } = await this.client
      .from('products')
      .upsert({
        barcode: product.barcode,
        name: product.name,
        brand: product.brand,
        model: product.model,
        country: product.country,
        language: product.language,
        ingredients_text: product.ingredientsText, // Snake_case persistencial
        ingredients_original: product.ingredientsOriginal,
        nutritional_info: product.nutritionalInfo,
        last_processed: new Date().toISOString()
      }, { onConflict: 'barcode' });

    if (error) {
      console.error('Supabase saveProduct error:', error);
      throw new Error(`Erro ao salvar produto no Supabase: ${error.message}`);
    }
  }
}
