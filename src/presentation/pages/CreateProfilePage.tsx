import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Save, ShieldAlert, HeartPulse } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ProfileRepository } from '../../data/repositories/profileRepository';
import { cn } from '../../lib/utils';
import { translateItem } from '../../lib/translations';

const COMMON_CONDITIONS = [
  "Síndrome de G6PD",
  "Diabetes Tipo 1",
  "Diabetes Tipo 2",
  "Celiaquia (Glúten)",
  "Fenilcetonúria",
];

const COMMON_ALLERGIES = [
  "Lactose / Leite",
  "Ovos",
  "Amendoim / Nozes",
  "Frutos do Mar",
  "Soja",
  "Trigo",
];

export default function CreateProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [type, setType] = useState<'self' | 'child' | 'other'>('self');
  const [conditions, setConditions] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const appLang = localStorage.getItem('safelabel_lang') || 'pt';

  const toggleItem = (item: string, list: string[], setList: (val: string[]) => void) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setValidationError(
        appLang === 'en' ? "Please provide a name for the profile." :
        appLang === 'es' ? "Por favor, indique un nombre para el perfil." :
        "Por favor, informe um nome para o perfil."
      );
      return;
    }
    setValidationError(null);
    setLoading(true);
    try {
      await ProfileRepository.createProfile(user!.uid, {
        parentUid: user!.uid,
        name: name.trim(),
        type,
        conditions,
        allergies,
      });
      navigate('/');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 font-sans text-slate-800 dark:text-slate-100 transition-colors">
      <div className="max-w-md mx-auto">
        <header className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-white/10 text-slate-600 dark:text-slate-300 active:scale-95 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">
            {appLang === 'en' ? 'New Profile' : appLang === 'es' ? 'Nuevo Perfil' : 'Novo Perfil'}
          </h1>
        </header>

        <div className="space-y-8 pb-24">
          {/* Nome e Tipo */}
          <section className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-white/10 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
                {appLang === 'en' ? 'Identification' : appLang === 'es' ? 'Identificación' : 'Identificação'}
              </label>
              <input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={
                  appLang === 'en' ? "e.g. John, Mary..." :
                  appLang === 'es' ? "Ej: Juanito, María..." :
                  "Ex: Joãozinho, Maria..."
                }
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-150 dark:border-white/5 rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 dark:focus:border-blue-500 transition-all outline-none text-slate-800 dark:text-slate-100 font-semibold"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
                {appLang === 'en' ? 'Who is this profile for?' : appLang === 'es' ? '¿Para quién es este perfil?' : 'Para quem é este perfil?'}
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'self', label: appLang === 'en' ? 'For me' : appLang === 'es' ? 'Para mí' : 'Para mim' },
                  { id: 'child', label: appLang === 'en' ? 'My child' : appLang === 'es' ? 'Mi hijo/a' : 'Meu filho' },
                  { id: 'other', label: appLang === 'en' ? 'Others' : appLang === 'es' ? 'Otros' : 'Outros' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setType(opt.id as any)}
                    className={cn(
                      "py-3 rounded-2xl text-xs font-bold transition-all border-2",
                      type === opt.id 
                        ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/10" 
                        : "bg-slate-50 dark:bg-slate-800 border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-750"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Condições Clínicas */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <HeartPulse className="text-blue-500 w-5 h-5" />
              <label className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                {appLang === 'en' ? 'Clinical Conditions' : appLang === 'es' ? 'Condiciones Clínicas' : 'Condições Clínicas'}
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              {COMMON_CONDITIONS.map((cond) => (
                <button
                  key={cond}
                  onClick={() => toggleItem(cond, conditions, setConditions)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all border",
                    conditions.includes(cond)
                      ? "bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-300"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-blue-200 dark:hover:border-blue-900"
                  )}
                >
                  {translateItem(cond, appLang)}
                </button>
              ))}
            </div>
          </section>

          {/* Alergias */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <ShieldAlert className="text-orange-500 w-5 h-5" />
              <label className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                {appLang === 'en' ? 'Food Allergies' : appLang === 'es' ? 'Alergias Alimentarias' : 'Alergias Alimentares'}
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              {COMMON_ALLERGIES.map((alg) => (
                <button
                  key={alg}
                  onClick={() => toggleItem(alg, allergies, setAllergies)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all border",
                    allergies.includes(alg)
                      ? "bg-orange-100 border-orange-300 text-orange-700 dark:bg-orange-950/40 dark:border-orange-800 dark:text-orange-300"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-orange-200 dark:hover:border-orange-900"
                  )}
                >
                  {translateItem(alg, appLang)}
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Botão Flutuante de Salvar */}
        <div className="fixed bottom-6 left-0 right-0 px-6 max-w-md mx-auto space-y-3">
          {validationError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2 shadow-lg">
              <ShieldAlert size={14} className="text-rose-500 animate-bounce" />
              {validationError}
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/15 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 
              (appLang === 'en' ? 'Saving...' : appLang === 'es' ? 'Guardando...' : 'Salvando...') : 
              <><Save size={20} /> {appLang === 'en' ? 'Save Profile' : appLang === 'es' ? 'Guardar Perfil' : 'Salvar Perfil'}</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
