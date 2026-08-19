import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { AppUser } from '../../domain/entities/user';
import { isRailsEnabled } from '../../lib/config';
import { apiClient } from '../../services/apiClient';

interface AuthContextType {
  user: User | null;
  appUser: AppUser | null;
  loading: boolean;
  logout: () => Promise<void>;
  reloadUser: () => Promise<void>;
  updateAppUser: (newAppUserData: Partial<AppUser>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setLoading(true);
      try {
        if (u) {
          const cacheKey = `safe_label_user_${u.uid}`;
          let data: any = null;

          if (isRailsEnabled()) {
            try {
              const idToken = await u.getIdToken();
              const railUser = await apiClient.syncUser(u.uid, u.email || "", true, idToken);
              setAppUser(railUser);
              localStorage.setItem(cacheKey, JSON.stringify(railUser));
            } catch (railsError) {
              console.warn("[AuthSinc] Falha ao sincronizar com o Rails, utilizando contingência local:", railsError);
              const cached = localStorage.getItem(cacheKey);
              if (cached) {
                try {
                  setAppUser(JSON.parse(cached));
                } catch (_) {}
              } else {
                setAppUser({
                  uid: u.uid,
                  email: u.email || "",
                  privacyTermsAccepted: true,
                  createdAt: new Date(),
                  updatedAt: new Date()
                } as AppUser);
              }
            }
          } else {
            try {
              const userDoc = await getDoc(doc(db, 'users', u.uid));
              if (userDoc.exists()) {
                data = userDoc.data();
                localStorage.setItem(cacheKey, JSON.stringify(data));
              }
            } catch (dbError) {
              console.warn("[AuthSinc] Banco de dados offline ou inacessível. Tentando carregar cache local de contingência.");
              const cached = localStorage.getItem(cacheKey);
              if (cached) {
                try {
                  data = JSON.parse(cached);
                  console.log("[AuthSinc] Dados do usuário carregados resilientemente do cache local do navegador.");
                } catch (_) {}
              }
            }

            if (data) {
              // Safe date parsing helper
              const parseDate = (val: any): Date => {
                if (!val) return new Date();
                if (typeof val.toDate === 'function') return val.toDate();
                if (val instanceof Date) return val;
                const parsed = new Date(val);
                return isNaN(parsed.getTime()) ? new Date() : parsed;
              };

              setAppUser({
                ...data,
                uid: u.uid,
                createdAt: parseDate(data.createdAt),
                updatedAt: parseDate(data.updatedAt),
              } as AppUser);
            } else {
              // Se o documento ainda não existir no Firestore, criamos um estado temporário em memória para o AppUser
              setAppUser({
                uid: u.uid,
                email: u.email || "",
                privacyTermsAccepted: true,
                createdAt: new Date(),
                updatedAt: new Date()
              } as AppUser);
            }
          }
          setUser(u);
        } else {
          setUser(null);
          setAppUser(null);
        }
      } catch (err) {
        console.error("Erro inesperado na sincronização de autenticação:", err);
      } finally {
        setLoading(false);
      }
    });
  }, []);

  const updateAppUser = async (newAppUserData: Partial<AppUser>) => {
    if (!user) return;
    const cacheKey = `safe_label_user_${user.uid}`;

    if (!isRailsEnabled()) {
      await setDoc(doc(db, 'users', user.uid), {
        ...newAppUserData,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    }

    const updated = {
      ...appUser,
      ...newAppUserData,
      updatedAt: new Date(),
    } as AppUser;

    setAppUser(updated);
    localStorage.setItem(cacheKey, JSON.stringify(updated));
  };

  const logout = async () => {
    setUser(null);
    setAppUser(null);
    await signOut(auth);
  };

  const reloadUser = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      // Use Object.assign to create a shallow copy with a new reference
      // so React state triggers update
      const updatedUser = Object.create(
        Object.getPrototypeOf(auth.currentUser),
        Object.getOwnPropertyDescriptors(auth.currentUser)
      );
      setUser(updatedUser);
    }
  };

  return (
    <AuthContext.Provider value={{ user, appUser, loading, logout, reloadUser, updateAppUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
