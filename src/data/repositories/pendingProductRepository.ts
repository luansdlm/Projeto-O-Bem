import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  doc, 
  updateDoc, 
  getDoc,
  setDoc,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { PendingProduct } from '../../domain/entities/pendingProduct';
import { ProductRepository } from './productRepository';

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
  console.error('Firestore Error in PendingProductRepository: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export class PendingProductRepository {
  private static getCollection() {
    return collection(db, 'pending_products');
  }

  static async submitPendingProduct(product: Omit<PendingProduct, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const path = 'pending_products';
    try {
      const col = this.getCollection();
      const docRef = await addDoc(col, {
        ...product,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log(`[PendingProductRepository] Novo produto enviado com ID: ${docRef.id}`);
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
      return '';
    }
  }

  static async getPendingProducts(statusFilter?: 'pending' | 'approved' | 'rejected'): Promise<PendingProduct[]> {
    const path = 'pending_products';
    try {
      const col = this.getCollection();
      let q = query(col, orderBy('createdAt', 'desc'));
      
      if (statusFilter) {
        q = query(col, where('status', '==', statusFilter), orderBy('createdAt', 'desc'));
      }
      
      const snapshot = await getDocs(q);
      const list: PendingProduct[] = [];
      
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          barcode: data.barcode,
          name: data.name,
          brand: data.brand || '',
          model: data.model || '',
          category: data.category || 'alimento',
          country: data.country || 'Brasil',
          language: data.language || 'Português',
          ingredientsText: data.ingredientsText,
          ingredientsOriginal: data.ingredientsOriginal || '',
          nutritionalInfo: data.nutritionalInfo || '',
          frontImageBase64: data.frontImageBase64 || '',
          status: data.status || 'pending',
          submittedBy: data.submittedBy,
          submittedByEmail: data.submittedByEmail || '',
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as PendingProduct);
      });
      
      return list;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  }

  static async approvePendingProduct(id: string): Promise<void> {
    const path = `pending_products/${id}`;
    try {
      const pendingDocRef = doc(db, 'pending_products', id);
      const snapshot = await getDoc(pendingDocRef);
      if (!snapshot.exists()) {
        throw new Error('Produto pendente não encontrado.');
      }
      
      const data = snapshot.data();
      
      // 1. Atualiza o status no pending_products
      await updateDoc(pendingDocRef, {
        status: 'approved',
        updatedAt: serverTimestamp()
      });
      
      // 2. Salva o produto na coleção principal 'products'
      const productRepo = new ProductRepository();
      await productRepo.saveProduct({
        barcode: data.barcode,
        name: data.name,
        brand: data.brand || '',
        model: data.model || '',
        country: data.country || 'Brasil',
        language: data.language || 'Português',
        ingredientsText: data.ingredientsText,
        ingredientsOriginal: data.ingredientsOriginal || '',
        nutritionalInfo: data.nutritionalInfo || '',
        // Também salvamos a foto da frente na coleção de produtos para que o app a renderize!
        frontImage: data.frontImageBase64 || ''
      } as any); // Adiciona frontImage para ilustrar o produto no app
      
      console.log(`[PendingProductRepository] Produto ${id} aprovado com sucesso.`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }

  static async rejectPendingProduct(id: string): Promise<void> {
    const path = `pending_products/${id}`;
    try {
      const pendingDocRef = doc(db, 'pending_products', id);
      await updateDoc(pendingDocRef, {
        status: 'rejected',
        updatedAt: serverTimestamp()
      });
      console.log(`[PendingProductRepository] Produto ${id} rejeitado.`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }
}
