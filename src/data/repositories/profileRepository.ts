import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  deleteDoc, 
  doc,
  updateDoc
} from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { HealthProfile } from '../../domain/entities/user';
import { isRailsEnabled } from '../../lib/config';
import { apiClient } from '../../services/apiClient';

export class ProfileRepository {
  private static getCollection(userId: string) {
    return collection(db, 'users', userId, 'profiles');
  }

  static async createProfile(userId: string, data: Omit<HealthProfile, 'id'>): Promise<string> {
    const cacheKey = `safe_profile_list_${userId}`;
    const localId = 'local_' + Math.random().toString(36).substring(2, 9);
    const newProfile: HealthProfile = { id: localId, ...data };

    let cachedList: HealthProfile[] = [];
    try {
      cachedList = JSON.parse(localStorage.getItem(cacheKey) || '[]');
    } catch (_) {}
    cachedList.push(newProfile);
    localStorage.setItem(cacheKey, JSON.stringify(cachedList));

    if (isRailsEnabled()) {
      try {
        const token = await auth.currentUser?.getIdToken();
        const actualId = await apiClient.createProfile(data, token);
        newProfile.id = actualId;
        try {
          const listWithRealId = cachedList.map(p => p.id === localId ? newProfile : p);
          localStorage.setItem(cacheKey, JSON.stringify(listWithRealId));
        } catch (_) {}
        return actualId;
      } catch (error) {
        console.warn("[ProfileRepository] Erro ao cadastrar perfil no Rails, mantido localmente:", error);
        return localId;
      }
    }

    try {
      const col = this.getCollection(userId);
      const docRef = await addDoc(col, data);
      
      const actualId = docRef.id;
      newProfile.id = actualId;
      try {
        const listWithRealId = cachedList.map(p => p.id === localId ? newProfile : p);
        localStorage.setItem(cacheKey, JSON.stringify(listWithRealId));
      } catch (_) {}

      return actualId;
    } catch (error) {
      console.warn("[ProfileRepository] Erro ao cadastrar perfil no Firestore, mantido localmente:", error);
      return localId;
    }
  }

  static async getProfiles(userId: string): Promise<HealthProfile[]> {
    const col = this.getCollection(userId);
    const cacheKey = `safe_profile_list_${userId}`;

    if (isRailsEnabled()) {
      try {
        const token = await auth.currentUser?.getIdToken();
        const list = await apiClient.getProfiles(token);
        localStorage.setItem(cacheKey, JSON.stringify(list));
        return list;
      } catch (error) {
        console.warn("[ProfileRepository] Erro ao buscar perfis no Rails. Utilizando fallback local:", error);
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          try {
            return JSON.parse(cached);
          } catch (_) {}
        }
      }
    }

    try {
      const snapshot = await getDocs(col);
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as HealthProfile));
      
      localStorage.setItem(cacheKey, JSON.stringify(list));
      return list;
    } catch (error) {
      console.warn("[ProfileRepository] Erro ao buscar perfis na nuvem. Utilizando fallback local:", error);
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch (_) {}
      }
      
      // Se não possui nenhum perfil local criado, cria perfil inicial padrão resiliente
      const defaultProfile: HealthProfile = {
        id: 'p_default',
        parentUid: userId,
        name: 'Geral',
        type: 'self',
        conditions: [],
        allergies: []
      };
      localStorage.setItem(cacheKey, JSON.stringify([defaultProfile]));
      return [defaultProfile];
    }
  }

  static async deleteProfile(userId: string, profileId: string) {
    const cacheKey = `safe_profile_list_${userId}`;
    
    let cachedList: HealthProfile[] = [];
    try {
      cachedList = JSON.parse(localStorage.getItem(cacheKey) || '[]');
    } catch (_) {}
    const filtered = cachedList.filter(p => p.id !== profileId);
    localStorage.setItem(cacheKey, JSON.stringify(filtered));

    if (isRailsEnabled()) {
      try {
        if (!profileId.startsWith('local_')) {
          const token = await auth.currentUser?.getIdToken();
          await apiClient.deleteProfile(profileId, token);
        }
      } catch (error) {
        console.warn("[ProfileRepository] Erro ao excluir perfil no Rails. Excluído apenas localmente:", error);
      }
      return;
    }

    try {
      if (!profileId.startsWith('local_')) {
        const docRef = doc(db, 'users', userId, 'profiles', profileId);
        await deleteDoc(docRef);
      }
    } catch (error) {
      console.warn("[ProfileRepository] Erro ao excluir perfil na nuvem. Excluído apenas localmente:", error);
    }
  }

  static async updateProfile(userId: string, profileId: string, data: Partial<Omit<HealthProfile, 'id' | 'parentUid'>>): Promise<void> {
    const cacheKey = `safe_profile_list_${userId}`;

    let cachedList: HealthProfile[] = [];
    try {
      cachedList = JSON.parse(localStorage.getItem(cacheKey) || '[]');
    } catch (_) {}
    const updated = cachedList.map(p => p.id === profileId ? { ...p, ...data } : p);
    localStorage.setItem(cacheKey, JSON.stringify(updated));

    if (isRailsEnabled()) {
      try {
        if (!profileId.startsWith('local_')) {
          const token = await auth.currentUser?.getIdToken();
          await apiClient.updateProfile(profileId, data, token);
        }
      } catch (error) {
        console.warn("[ProfileRepository] Erro ao atualizar perfil no Rails. Atualizado apenas localmente:", error);
      }
      return;
    }

    try {
       if (!profileId.startsWith('local_')) {
         const docRef = doc(db, 'users', userId, 'profiles', profileId);
         await updateDoc(docRef, data);
       }
    } catch (error) {
      console.warn("[ProfileRepository] Erro ao atualizar perfil na nuvem. Atualizado apenas localmente:", error);
    }
  }
}
