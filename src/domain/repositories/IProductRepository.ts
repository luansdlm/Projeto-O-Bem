import { Product } from '../entities/product';

export interface IProductRepository {
  /**
   * Busca um produto cadastrado globalmente pelo seu código de barras.
   * @param barcode Código de barras físico ou EAN do produto.
   * @returns O objeto de Produto ou null se não for encontrado.
   */
  getProductByBarcode(barcode: string): Promise<Product | null>;

  /**
   * Busca um produto cadastrado globalmente pelo seu nome e marca (aproximação/OCR).
   * @param name Nome do produto extraído.
   * @param brand Marca exata ou aproximada do produto.
   * @returns O objeto de Produto ou null se não for encontrado.
   */
  findProductByNameAndBrand(name: string, brand?: string): Promise<Product | null>;

  /**
   * Salva ou atualiza um produto na base de dados global.
   * @param product Instância do produto a ser salva.
   */
  saveProduct(product: Omit<Product, 'lastProcessed'>): Promise<void>;
}
