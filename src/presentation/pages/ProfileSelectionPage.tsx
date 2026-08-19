import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, User, Baby, Users, Trash2, ChevronRight, History } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ProfileRepository } from '../../data/repositories/profileRepository';
import { HealthProfile } from '../../domain/entities/user';
import { cn } from '../../lib/utils';
import { Link, useNavigate } from 'react-router-dom';

export default function ProfileSelectionPage() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<HealthProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteProfileId, setDeleteProfileId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadProfiles();
    }
  }, [user]);

  const loadProfiles = async () => {
    try {
      const data = await ProfileRepository.getProfiles(user!.uid);
      setProfiles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectProfile = (profile: HealthProfile) => {
    // Armazenar perfil selecionado no session storage para persistência simples nesta fase
    sessionStorage.setItem('selectedProfile', JSON.stringify(profile));
    navigate('/scan');
  };

  const viewHistory = (e: React.MouseEvent, profile: HealthProfile) => {
    e.stopPropagation();
    sessionStorage.setItem('selectedProfile', JSON.stringify(profile));
    navigate('/history');
  };

  const handleDelete = (e: React.MouseEvent, profileId: string) => {
    e.stopPropagation();
    setDeleteProfileId(profileId);
  };

  const confirmDelete = async () => {
    if (!deleteProfileId) return;
    const profileId = deleteProfileId;
    setDeleteProfileId(null);
    try {
      await ProfileRepository.deleteProfile(user!.uid, profileId);
      loadProfiles();
    } catch (err) {
      console.error(err);
    }
  };
    const appLang = localStorage.getItem('safelabel_lang') || 'pt';

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 font-sans text-slate-800 dark:text-slate-100 transition-colors">
        <div className="max-w-md mx-auto">
          <header className="mb-8 mt-4">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">
              {appLang === 'en' ? 'Who is scanning?' : appLang === 'es' ? '¿Quién va a usar?' : 'Quem vai usar?'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              {appLang === 'en' ? 'Select a profile to scan labels safely.' : appLang === 'es' ? 'Seleccione un perfil para escanear etiquetas con seguridad.' : 'Selecione um perfil para escanear rótulos com segurança.'}
            </p>
          </header>
   
          <div className="grid gap-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <>
                {profiles.map((profile, idx) => (
                  <motion.div
                    key={profile.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => selectProfile(profile)}
                    className="group relative bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-white/10 flex items-center gap-4 cursor-pointer hover:border-blue-200 dark:hover:border-blue-900 hover:shadow-md transition-all"
                  >
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg",
                      profile.type === 'self' && "bg-blue-500",
                      profile.type === 'child' && "bg-orange-400",
                      profile.type === 'other' && "bg-emerald-500"
                    )}>
                      {profile.type === 'self' ? <User size={28} /> : 
                       profile.type === 'child' ? <Baby size={28} /> : 
                       <Users size={28} />}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-800 dark:text-white text-lg">{profile.name}</h3>
                      <p className="text-slate-400 dark:text-slate-555 text-sm">
                        {profile.conditions.length + profile.allergies.length}{' '}
                        {appLang === 'en'
                          ? (profile.conditions.length + profile.allergies.length === 1 ? 'active restriction' : 'active restrictions')
                          : appLang === 'es'
                            ? (profile.conditions.length + profile.allergies.length === 1 ? 'restricción activa' : 'restricciones activas')
                            : (profile.conditions.length + profile.allergies.length === 1 ? 'restrição ativa' : 'restrições ativas')
                        }
                      </p>
                    </div>
   
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={(e) => viewHistory(e, profile)}
                        className="p-2 text-slate-300 dark:text-slate-600 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                        title={appLang === 'en' ? 'View History' : appLang === 'es' ? 'Ver Historial' : 'Ver Histórico'}
                      >
                        <History size={18} />
                      </button>
                      <button 
                        onClick={(e) => handleDelete(e, profile.id)}
                        className="p-2 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-rose-450 transition-colors"
                        title={appLang === 'en' ? 'Delete Profile' : appLang === 'es' ? 'Eliminar Perfil' : 'Excluir Perfil'}
                      >
                        <Trash2 size={18} />
                      </button>
                      <ChevronRight className="text-slate-300 dark:text-slate-600 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
                    </div>
                  </motion.div>
                ))}
   
                <Link
                  to="/create-profile"
                  className="flex items-center justify-center gap-3 p-5 rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/10 text-slate-400 dark:text-slate-500 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full border-2 border-dashed border-current flex items-center justify-center">
                    <Plus size={20} />
                  </div>
                  <span className="font-semibold text-sm">
                    {appLang === 'en' ? 'Add New Profile' : appLang === 'es' ? 'Añadir Nuevo Perfil' : 'Adicionar Novo Perfil'}
                  </span>
                </Link>
              </>
            )}
          </div>
        </div>
 
      {deleteProfileId && (
        <AnimatePresence>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-slate-100 dark:border-white/10 text-center text-slate-800 dark:text-slate-100"
            >
              <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-450 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} />
              </div>
              <h3 className="text-base font-black text-slate-800 dark:text-white mb-2">
                Excluir Perfil?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                Deseja realmente confirmar a exclusão deste perfil de saúde? Essa ação é permanente.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setDeleteProfileId(null)}
                  className="py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-200 font-bold rounded-xl text-xs transition-all active:scale-95"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="py-3 bg-rose-600 hover:bg-rose-550 text-white font-bold rounded-xl text-xs transition-all active:scale-95 shadow-md shadow-rose-600/10"
                >
                  Excluir
                </button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}

    </div>
  );
}
