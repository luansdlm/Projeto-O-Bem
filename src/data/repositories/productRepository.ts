import { 
  doc, 
  getDoc, 
  setDoc,
  serverTimestamp,
  collection,
  query,
  getDocs
} from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { Product } from '../../domain/entities/product';
import { IProductRepository } from '../../domain/repositories/IProductRepository';
import { isRailsEnabled } from '../../lib/config';
import { apiClient } from '../../services/apiClient';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export class ProductRepository implements IProductRepository {
  private getDocRef(barcode: string) {
    return doc(db, 'products', barcode);
  }

  private registerBarcodeInCache(barcode: string) {
    try {
      const listKey = 'safe_cached_product_barcodes';
      const list: string[] = JSON.parse(localStorage.getItem(listKey) || '[]');
      if (!list.includes(barcode)) {
        list.push(barcode);
        localStorage.setItem(listKey, JSON.stringify(list));
      }
    } catch (_) {}
  }

  private getCachedProducts(): Product[] {
    const products: Product[] = [];
    try {
      const listKey = 'safe_cached_product_barcodes';
      const list: string[] = JSON.parse(localStorage.getItem(listKey) || '[]');
      for (const barcode of list) {
        const cached = localStorage.getItem(`safe_product_${barcode}`);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            parsed.lastProcessed = new Date(parsed.lastProcessed);
            products.push(parsed);
          } catch (_) {}
        }
      }
    } catch (_) {}
    return products;
  }

  async getProductByBarcode(barcode: string): Promise<Product | null> {
    const path = `products/${barcode}`;
    const cacheKey = `safe_product_${barcode}`;

    if (isRailsEnabled()) {
      try {
        const token = await auth.currentUser?.getIdToken();
        const product = await apiClient.getProduct(barcode, token);
        if (product) {
          localStorage.setItem(cacheKey, JSON.stringify(product));
          this.registerBarcodeInCache(barcode);
        }
        return product;
      } catch (error) {
        console.warn("[ProductRepository] Erro ao obter produto no Rails. Tentando cache local:", error);
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            parsed.lastProcessed = new Date(parsed.lastProcessed);
            return parsed;
          } catch (_) {}
        }
        return null;
      }
    }

    try {
      const docRef = this.getDocRef(barcode);
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) {
        return null;
      }
      const data = snapshot.data();
      const product: Product = {
        barcode: data.barcode,
        name: data.name,
        brand: data.brand || "",
        model: data.model || "",
        country: data.country || "",
        language: data.language || "",
        ingredientsText: data.ingredientsText,
        ingredientsOriginal: data.ingredientsOriginal || "",
        nutritionalInfo: data.nutritionalInfo || "",
        frontImage: data.frontImage || "",
        lastProcessed: data.lastProcessed?.toDate() || new Date()
      };

      // Guard in cache
      localStorage.setItem(cacheKey, JSON.stringify(product));
      this.registerBarcodeInCache(barcode);

      return product;
    } catch (error) {
      console.warn("[ProductRepository] Erro ao obter produto na nuvem. Tentando cache local de redundância:", error);
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          parsed.lastProcessed = new Date(parsed.lastProcessed);
          return parsed;
        } catch (_) {}
      }
      return null;
    }
  }

  async findProductByNameAndBrand(name: string, brand?: string): Promise<Product | null> {
    const cleanName = name.toLowerCase().trim();
    const cleanBrand = brand?.toLowerCase().trim() || "";

    const isMatch = (p: Product) => {
      const pName = (p.name || "").toLowerCase().trim();
      const pBrand = (p.brand || "").toLowerCase().trim();
      const nameMatches = pName === cleanName || pName.includes(cleanName) || cleanName.includes(pName);
      const brandMatches = !cleanBrand || !pBrand || pBrand === cleanBrand || pBrand.includes(cleanBrand) || cleanBrand.includes(pBrand);
      return nameMatches && (brandMatches || pName === cleanName);
    };

    try {
      const colRef = collection(db, 'products');
      const q = query(colRef);
      const snapshot = await getDocs(q);

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const product: Product = {
          barcode: data.barcode,
          name: data.name,
          brand: data.brand || "",
          model: data.model || "",
          country: data.country || "",
          language: data.language || "",
          ingredientsText: data.ingredientsText,
          ingredientsOriginal: data.ingredientsOriginal || "",
          nutritionalInfo: data.nutritionalInfo || "",
          frontImage: data.frontImage || "",
          lastProcessed: data.lastProcessed?.toDate() || new Date()
        };

        localStorage.setItem(`safe_product_${product.barcode}`, JSON.stringify(product));
        this.registerBarcodeInCache(product.barcode);

        if (isMatch(product)) {
          return product;
        }
      }
      return null;
    } catch (error) {
      console.warn("[ProductRepository] Erro ao buscar produto via Firestore, utilizando fallback de cache OCR local:", error);
      const cachedList = this.getCachedProducts();
      for (const p of cachedList) {
        if (isMatch(p)) {
          return p;
        }
      }
      return null;
    }
  }

  async saveProduct(product: Omit<Product, 'lastProcessed'>): Promise<void> {
    const path = `products/${product.barcode}`;
    const cacheKey = `safe_product_${product.barcode}`;

    const productWithDate: Product = {
      ...product,
      lastProcessed: new Date()
    };
    localStorage.setItem(cacheKey, JSON.stringify(productWithDate));
    this.registerBarcodeInCache(product.barcode);

    if (isRailsEnabled()) {
      try {
        const token = await auth.currentUser?.getIdToken();
        await apiClient.saveProduct(product, token);
      } catch (error) {
        console.warn("[ProductRepository] Erro ao registrar produto no Rails. Cadastrado localmente para contingência:", error);
      }
      return;
    }

    try {
      const docRef = this.getDocRef(product.barcode);
      await setDoc(docRef, {
        ...product,
        lastProcessed: serverTimestamp()
      });
    } catch (error) {
      console.warn("[ProductRepository] Erro ao registrar produto na nuvem. Cadastrado localmente para contingência:", error);
    }
  }
}
