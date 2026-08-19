import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  deleteDoc, 
  doc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { ScanRecord } from '../../domain/entities/user';
import { isRailsEnabled } from '../../lib/config';
import { apiClient } from '../../services/apiClient';

export class ScanRepository {
  private static getCollection(userId: string, profileId: string) {
    return collection(db, 'users', userId, 'profiles', profileId, 'scans');
  }

  static async addScan(userId: string, profileId: string, data: Omit<ScanRecord, 'id' | 'timestamp'>): Promise<string> {
    const cacheKey = `safe_scan_history_${userId}_${profileId}`;
    const localId = 'local_scan_' + Math.random().toString(36).substring(2, 9);
    
    const newRecord: ScanRecord = {
      ...data,
      id: localId,
      timestamp: new Date()
    };

    let cachedList: ScanRecord[] = [];
    try {
      cachedList = JSON.parse(localStorage.getItem(cacheKey) || '[]');
    } catch (_) {}
    cachedList.unshift(newRecord);
    localStorage.setItem(cacheKey, JSON.stringify(cachedList));

    if (isRailsEnabled()) {
      try {
        const token = await auth.currentUser?.getIdToken();
        const actualId = await apiClient.createScan(profileId, data, token);
        newRecord.id = actualId;
        try {
          const listWithRealId = cachedList.map(r => r.id === localId ? newRecord : r);
          localStorage.setItem(cacheKey, JSON.stringify(listWithRealId));
        } catch (_) {}
        return actualId;
      } catch (error) {
        console.warn("[ScanRepository] Erro ao registrar escaneamento no Rails. Mantido offline:", error);
        return localId;
      }
    }

    try {
      const col = this.getCollection(userId, profileId);
      const docRef = await addDoc(col, {
        ...data,
        timestamp: serverTimestamp()
      });
      
      const actualId = docRef.id;
      newRecord.id = actualId;
      try {
        const listWithRealId = cachedList.map(r => r.id === localId ? newRecord : r);
        localStorage.setItem(cacheKey, JSON.stringify(listWithRealId));
      } catch (_) {}

      return actualId;
    } catch (error) {
      console.warn("[ScanRepository] Erro ao registrar escaneamento na nuvem. Mantido offline:", error);
      return localId;
    }
  }

  static async getHistory(userId: string, profileId: string): Promise<ScanRecord[]> {
    const col = this.getCollection(userId, profileId);
    const cacheKey = `safe_scan_history_${userId}_${profileId}`;

    if (isRailsEnabled()) {
      try {
        const token = await auth.currentUser?.getIdToken();
        const list = await apiClient.getScans(profileId, token);
        localStorage.setItem(cacheKey, JSON.stringify(list));
        return list;
      } catch (error) {
        console.warn("[ScanRepository] Erro ao obter histórico do Rails, carregando contingência offline:", error);
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          try {
            const parsedList = JSON.parse(cached) as ScanRecord[];
            return parsedList.map(r => ({
              ...r,
              timestamp: new Date(r.timestamp)
            }));
          } catch (_) {}
        }
        return [];
      }
    }

    try {
      const q = query(col, orderBy('timestamp', 'desc'));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      } as ScanRecord));

      localStorage.setItem(cacheKey, JSON.stringify(list));
      return list;
    } catch (error) {
      console.warn("[ScanRepository] Erro ao obter histórico da nuvem, carregando contingência offline:", error);
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsedList = JSON.parse(cached) as ScanRecord[];
          return parsedList.map(r => ({
            ...r,
            timestamp: new Date(r.timestamp)
          }));
        } catch (_) {}
      }
      return [];
    }
  }

  static async updateEvaluation(userId: string, profileId: string, scanId: string, rating: number, comment: string) {
    const cacheKey = `safe_scan_history_${userId}_${profileId}`;
    
    let cachedList: ScanRecord[] = [];
    try {
      cachedList = JSON.parse(localStorage.getItem(cacheKey) || '[]');
    } catch (_) {}
    const updated = cachedList.map(r => r.id === scanId ? { ...r, userRating: rating, userComment: comment } : r);
    localStorage.setItem(cacheKey, JSON.stringify(updated));

    if (isRailsEnabled()) {
      try {
        if (!scanId.startsWith('local_scan_')) {
          const token = await auth.currentUser?.getIdToken();
          await apiClient.updateScanEvaluation(profileId, scanId, rating, comment, token);
        }
      } catch (error) {
        console.warn("[ScanRepository] Erro ao salvar avaliação no Rails, aplicada em cache local:", error);
      }
      return;
    }

    try {
      if (!scanId.startsWith('local_scan_')) {
        const docRef = doc(db, 'users', userId, 'profiles', profileId, 'scans', scanId);
        await updateDoc(docRef, {
          userRating: rating,
          userComment: comment
        });
      }
    } catch (error) {
      console.warn("[ScanRepository] Erro ao salvar avaliação na nuvem, aplicada em cache local:", error);
    }
  }

  static async deleteScan(userId: string, profileId: string, scanId: string) {
    const cacheKey = `safe_scan_history_${userId}_${profileId}`;
    
    let cachedList: ScanRecord[] = [];
    try {
      cachedList = JSON.parse(localStorage.getItem(cacheKey) || '[]');
    } catch (_) {}
    const filtered = cachedList.filter(r => r.id !== scanId);
    localStorage.setItem(cacheKey, JSON.stringify(filtered));

    if (isRailsEnabled()) {
      try {
        if (!scanId.startsWith('local_scan_')) {
          const token = await auth.currentUser?.getIdToken();
          await apiClient.deleteScan(profileId, scanId, token);
        }
      } catch (error) {
        console.warn("[ScanRepository] Erro ao remover escaneamento no Rails, feito somente em cache local:", error);
      }
      return;
    }

    try {
      if (!scanId.startsWith('local_scan_')) {
        const docRef = doc(db, 'users', userId, 'profiles', profileId, 'scans', scanId);
        await deleteDoc(docRef);
      }
    } catch (error) {
      console.warn("[ScanRepository] Erro ao remover escaneamento na nuvem, feito somente em cache local:", error);
    }
  }
}
