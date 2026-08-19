import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Scan, 
  History as HistoryIcon, 
  ShieldAlert, 
  User, 
  Baby, 
  Users, 
  Plus, 
  LogOut, 
  ChevronDown, 
  ChevronUp,
  UserPlus,
  Check, 
  HeartPulse, 
  Save, 
  X,
  Sparkles,
  Edit3,
  Trash2,
  Menu,
  Settings,
  CreditCard,
  Type,
  Languages,
  Globe,
  Sun,
  Moon,
  Filter,
  Search,
  XCircle,
  CheckCircle2,
  AlertCircle,
  Info,
  Heart,
  Award,
  Copy,
  Gift,
  LifeBuoy
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AccountEditModal } from '../components/AccountEditModal';
import { SupportModal } from '../components/SupportModal';
import { ProfileRepository } from '../../data/repositories/profileRepository';
import { HealthProfile } from '../../domain/entities/user';
import { cn } from '../../lib/utils';
import { getTranslations, translateItem } from '../../lib/translations';

const COMMON_CONDITIONS = [
  "Diabetes",
  "Doença Celíaca",
  "Hipertensão",
  "Síndrome de G6PD",
  "Fenilcetonúria",
  "Hipotireoidismo",
  "Insuficiência Renal",
];

const COMMON_ALLERGIES = [
  "Amendoim",
  "Glúten",
  "Leite",
  "Ovos",
  "Frutos do Mar",
  "Soja",
  "Castanhas",
  "Trigo",
  "Gergelim",
  "Parabenos",
  "Sulfatos",
  "Fragrâncias",
  "Níquel",
  "Formaldeído",
  "Lanolina",
  "Corantes Artificiais",
  "Tartrazina",
  "Amarelo Crepúsculo",
  "Vermelho 40",
  "Azul Brilhante",
  "Azul Patente V",
  "Eritrosina",
  "Penicilina",
  "AINEs (Ibuprofeno/Aspirina)",
  "Ibuprofeno",
  "Aspirina",
  "Nimesulida",
  "Cetoprofeno",
  "Diclofenaco",
  "Sulfas",
  "Sulfadiazina",
  "Sulfametoxazol",
  "Dipirona",
  "Amoxicilina",
  "Anestésicos Locais",
  "Lidocaína",
  "Prilocaína",
  "Benzocaína",
  "Contraste Iodado",
];

export const GROUP_MAPPINGS: Record<string, string[]> = {
  "AINEs (Ibuprofeno/Aspirina)": ["Ibuprofeno", "Aspirina", "Nimesulida", "Cetoprofeno", "Diclofenaco"],
  "Corantes Artificiais": ["Tartrazina", "Amarelo Crepúsculo", "Vermelho 40", "Azul Brilhante", "Azul Patente V", "Eritrosina"],
  "Sulfas": ["Sulfadiazina", "Sulfametoxazol"],
  "Anestésicos Locais": ["Lidocaína", "Prilocaína", "Benzocaína"],
};

export const MEMBER_TO_GROUP: Record<string, string> = {
  "Ibuprofeno": "AINEs (Ibuprofeno/Aspirina)",
  "Aspirina": "AINEs (Ibuprofeno/Aspirina)",
  "Nimesulida": "AINEs (Ibuprofeno/Aspirina)",
  "Cetoprofeno": "AINEs (Ibuprofeno/Aspirina)",
  "Diclofenaco": "AINEs (Ibuprofeno/Aspirina)",
  "Tartrazina": "Corantes Artificiais",
  "Amarelo Crepúsculo": "Corantes Artificiais",
  "Vermelho 40": "Corantes Artificiais",
  "Azul Brilhante": "Corantes Artificiais",
  "Azul Patente V": "Corantes Artificiais",
  "Eritrosina": "Corantes Artificiais",
  "Sulfadiazina": "Sulfas",
  "Sulfametoxazol": "Sulfas",
  "Lidocaína": "Anestésicos Locais",
  "Prilocaína": "Anestésicos Locais",
  "Benzocaína": "Anestésicos Locais",
};

export const FILTER_TAXONOMY = [
  {
    key: 'conditions_health',
    title: 'Condições de Saúde',
    description: {
      pt: 'Ative condições que bloqueiam componentes específicos de forma permanente.',
      en: 'Activate conditions that permanently block specific components.',
      es: 'Active las condiciones que bloquean permanentemente componentes específicos.'
    },
    items: ["Diabetes", "Doença Celíaca", "Hipertensão", "Síndrome de G6PD", "Fenilcetonúria", "Hipotireoidismo", "Insuficiência Renal"],
    type: 'conditions'
  },
  {
    key: 'allergies_food',
    title: 'Alergias e Intolerâncias Alimentares',
    description: {
      pt: 'Selecione ingredientes que causam reações adversas na digestão.',
      en: 'Select ingredients that cause adverse reactions/digestive issues.',
      es: 'Seleccione ingredientes que causan reacciones de hipersensibilidad.'
    },
    items: ["Amendoim", "Glúten", "Leite", "Ovos", "Frutos do Mar", "Soja", "Castanhas", "Trigo", "Gergelim"],
    type: 'allergies'
  },
  {
    key: 'allergies_contact',
    title: 'Alergias de Contato (Cosméticos)',
    description: {
      pt: 'Selecione substâncias irritantes comuns em cosméticos, produtos de higiene e corantes.',
      en: 'Select chemical irritants common in cosmetics, hygiene products and artificial dyes.',
      es: 'Seleccione sustancias químicas irritantes en cosméticos, aseo y colorantes.'
    },
    items: ["Parabenos", "Sulfatos", "Fragrâncias", "Níquel", "Formaldeído", "Lanolina", "Corantes Artificiais", "Tartrazina", "Amarelo Crepúsculo", "Vermelho 40", "Azul Brilhante", "Azul Patente V", "Eritrosina"],
    type: 'allergies'
  },
  {
    key: 'allergies_meds',
    title: 'Alergias a Medicamentos',
    description: {
      pt: 'Selecione medicamentos e classes terapêuticas que causam reações adversas.',
      en: 'Select medications and drug classes that cause adverse allergic reactions.',
      es: 'Seleccione medicamentos y clases de medicamentos que causan reacciones.'
    },
    items: ["Penicilina", "AINEs (Ibuprofeno/Aspirina)", "Ibuprofeno", "Aspirina", "Nimesulida", "Cetoprofeno", "Diclofenaco", "Sulfas", "Sulfadiazina", "Sulfametoxazol", "Dipirona", "Amoxicilina", "Anestésicos Locais", "Lidocaína", "Prilocaína", "Benzocaína", "Contraste Iodado"],
    type: 'allergies'
  }
];

function maskEmail(email?: string): string {
  if (!email) return '';
  const parts = email.split('@');
  if (parts.length !== 2) return email;
  const [local, domain] = parts;
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local.slice(0, 2)}***${local.slice(-1)}@${domain}`;
}

function maskPhone(phone?: string): string {
  if (!phone) return '';
  const trimmed = phone.trim();
  const parts = trimmed.split(' ');
  if (parts.length > 1) {
    const code = parts[0];
    const rest = parts.slice(1).join(' ');
    if (rest.length <= 4) return `${code} ****`;
    return `${code} ${rest.slice(0, 2)}****${rest.slice(-2)}`;
  }
  if (trimmed.length <= 4) return trimmed;
  return `${trimmed.slice(0, 2)}****${trimmed.slice(-2)}`;
}

function maskName(name?: string): string {
  if (!name) return '';
  const trimmed = name.trim();
  const parts = trimmed.split(' ');
  return parts.map((p, idx) => {
    if (idx === 0) return p;
    if (p.length <= 2) return '*';
    return `${p[0]}***${p.slice(-1)}`;
  }).join(' ');
}

export default function DashboardPage() {
  const { user, appUser, logout, updateAppUser } = useAuth();
  const navigate = useNavigate();

  const [profiles, setProfiles] = useState<HealthProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<HealthProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // UI state managers
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [restrictionsOpen, setRestrictionsOpen] = useState(false);
  const [savingRestrictions, setSavingRestrictions] = useState(false);

  // Accessibility and App Preferences state
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const [accountEditOpen, setAccountEditOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [appLang, setAppLang] = useState(() => localStorage.getItem('safelabel_lang') || 'pt');
  const [appTheme, setAppTheme] = useState(() => localStorage.getItem('safelabel_theme') || 'light');
  const [appFontSize, setAppFontSize] = useState(() => localStorage.getItem('safelabel_font_size') || 'normal');

  // About & Solidarity Donation state managers
  const [aboutOpen, setAboutOpen] = useState(false);
  const [isPremium, setIsPremium] = useState(() => localStorage.getItem('projeto_obem_ai_premium') === 'true');
  const [selectedDonationAmount, setSelectedDonationAmount] = useState<number>(20);
  const [donationStep, setDonationStep] = useState<'info' | 'pix' | 'success'>('info');
  const [pixCopied, setPixCopied] = useState(false);



  const t = getTranslations(appLang);

  useEffect(() => {
    if (appTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('safelabel_theme', appTheme);
  }, [appTheme]);

  useEffect(() => {
    localStorage.setItem('safelabel_lang', appLang);
  }, [appLang]);

  useEffect(() => {
    localStorage.setItem('safelabel_font_size', appFontSize);
  }, [appFontSize]);

  // Unified profile create/edit modal states
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<HealthProfile | null>(null);
  const [modalTitle, setModalTitle] = useState('');
  const [modalConditions, setModalConditions] = useState<string[]>([]);
  const [modalAllergies, setModalAllergies] = useState<string[]>([]);
  const [savingProfileModal, setSavingProfileModal] = useState(false);

  // Temporal states for editing active profile's clinical filters
  const [tempConditions, setTempConditions] = useState<string[]>([]);
  const [tempAllergies, setTempAllergies] = useState<string[]>([]);
  
  // Search and expand/collapse states for "Filtro de Restrições" quick drawer
  const [restrictionsSearchText, setRestrictionsSearchText] = useState('');
  const [restrictionsExpanded, setRestrictionsExpanded] = useState<Record<string, boolean>>({});

  // Search and expand/collapse states for profile creating/editing Modal
  const [modalSearchText, setModalSearchText] = useState('');
  const [modalExpanded, setModalExpanded] = useState<Record<string, boolean>>({});
  const [deleteProfileId, setDeleteProfileId] = useState<string | null>(null);
  const [customAlert, setCustomAlert] = useState<{ title: string; message: string; type: 'error' | 'success' | 'info' } | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync profile data and state fallbacks
  useEffect(() => {
    if (user) {
      loadProfiles();
    }
  }, [user]);

  const loadProfiles = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await ProfileRepository.getProfiles(user.uid);
      
      let active: HealthProfile | null = null;
      const cached = sessionStorage.getItem('selectedProfile');
      
      if (data.length === 0) {
        // Safe database fallback: create a default profile on-the-fly to guarantee pristine operations (Clean Code design)
        const defaultProfile = {
          parentUid: user.uid,
          name: user.displayName || user.email?.split('@')[0] || "Meu Perfil",
          type: 'self' as const,
          conditions: [],
          allergies: [],
        };
        const newId = await ProfileRepository.createProfile(user.uid, defaultProfile);
        const created: HealthProfile = { id: newId, ...defaultProfile };
        setProfiles([created]);
        active = created;
      } else {
        setProfiles(data);
        if (cached) {
          const parsedCache = JSON.parse(cached) as HealthProfile;
          // Verify that cached profile still exists in active array
          const stillExists = data.find(p => p.id === parsedCache.id);
          active = stillExists ? stillExists : data[0];
        } else {
          active = data[0];
        }
      }

      selectProfile(active);
    } catch (err) {
      console.error("Erro ao carregar perfis seguros no painel:", err);
    } finally {
      setLoading(false);
    }
  };

  const selectProfile = (profile: HealthProfile) => {
    setSelectedProfile(profile);
    setTempConditions(profile.conditions || []);
    setTempAllergies(profile.allergies || []);
    sessionStorage.setItem('selectedProfile', JSON.stringify(profile));
    setProfileMenuOpen(false);
  };

  const handleToggleCondition = (cond: string) => {
    if (tempConditions.includes(cond)) {
      setTempConditions(tempConditions.filter(c => c !== cond));
    } else {
      setTempConditions([...tempConditions, cond]);
      // Regra de Negócio: Se selecionar "Doença Celíaca" ou equivalente, ativa automaticamente o Glúten
      if (cond === "Doença Celíaca" || cond === "Celiaquia (Glúten)") {
        if (!tempAllergies.includes("Glúten")) {
          setTempAllergies(prev => [...prev, "Glúten"]);
        }
      }
    }
  };

  const handleToggleAllergy = (alg: string) => {
    let next: string[];
    const isGroup = alg in GROUP_MAPPINGS;
    const isMember = alg in MEMBER_TO_GROUP;

    if (tempAllergies.includes(alg)) {
      // Deselecting alg
      next = tempAllergies.filter(a => a !== alg);
      if (isGroup) {
        // If it's a group, also deselect all members
        const members = GROUP_MAPPINGS[alg];
        next = next.filter(a => !members.includes(a));
      } else if (isMember) {
        // If it's a member, also deselect its parent group
        const group = MEMBER_TO_GROUP[alg];
        next = next.filter(a => a !== group);
      }
    } else {
      // Selecting alg
      next = [...tempAllergies, alg];
      if (isGroup) {
        // If it's a group, also select all members
        const members = GROUP_MAPPINGS[alg];
        members.forEach(m => {
          if (!next.includes(m)) next.push(m);
        });
      } else if (isMember) {
        // If it's a member, check if all other members of its group are also selected
        const group = MEMBER_TO_GROUP[alg];
        const members = GROUP_MAPPINGS[group];
        const allSelected = members.every(m => m === alg || tempAllergies.includes(m));
        if (allSelected && !next.includes(group)) {
          next.push(group);
        }
      }
    }
    setTempAllergies(next);
  };

  const saveEditedRestrictions = async () => {
    if (!user || !selectedProfile) return;
    setSavingRestrictions(true);
    try {
      const updatedData = {
        conditions: tempConditions,
        allergies: tempAllergies,
      };
      await ProfileRepository.updateProfile(user.uid, selectedProfile.id, updatedData);
      
      // Update local state directly
      const updatedProfile = {
        ...selectedProfile,
        ...updatedData
      };
      
      setSelectedProfile(updatedProfile);
      setProfiles(prev => prev.map(p => p.id === selectedProfile.id ? updatedProfile : p));
      sessionStorage.setItem('selectedProfile', JSON.stringify(updatedProfile));
      
      setRestrictionsOpen(false);
    } catch (err) {
      console.error("Erro ao salvar atualizações de restrição:", err);
      setCustomAlert({
        title: appLang === 'en' ? 'Connection Error' : appLang === 'es' ? 'Error de Conexión' : 'Problema de Conexão',
        message: appLang === 'en'
          ? 'There was a network issue when saving restriction settings.'
          : appLang === 'es'
            ? 'Hubo un problema de red al guardar la configuración de restricciones.'
            : 'Houve um problema de rede ao salvar as configurações de restrição.',
        type: 'error'
      });
    } finally {
      setSavingRestrictions(false);
    }
  };

  // Profile modal action handlers
  const openCreateProfileModal = () => {
    setEditingProfile(null);
    setModalTitle('');
    setModalConditions([]);
    setModalAllergies([]);
    setProfileModalOpen(true);
    setProfileMenuOpen(false);
  };

  const openEditProfileModal = (e: React.MouseEvent, profile: HealthProfile) => {
    e.stopPropagation();
    setEditingProfile(profile);
    setModalTitle(profile.name);
    setModalConditions(profile.conditions || []);
    setModalAllergies(profile.allergies || []);
    setProfileModalOpen(true);
    setProfileMenuOpen(false);
  };

  const handleDeleteProfile = (e: React.MouseEvent, profileId: string) => {
    e.stopPropagation();
    if (profiles.length <= 1) {
      setCustomAlert({
        title: appLang === 'en' ? 'Profile Management' : appLang === 'es' ? 'Gestión de Perfil' : 'Aviso sobre Perfil',
        message: appLang === 'en' 
          ? 'You must keep at least one health profile configured.' 
          : appLang === 'es' 
            ? 'Debe mantener al menos um perfil configurado en su cuenta.' 
            : 'Você deve manter pelo menos um perfil de saúde ou restrições configurado.',
        type: 'info'
      });
      return;
    }
    setDeleteProfileId(profileId);
  };

  const confirmDeleteProfile = async () => {
    if (!deleteProfileId) return;
    const profileId = deleteProfileId;
    setDeleteProfileId(null);
    try {
      if (!user) return;
      await ProfileRepository.deleteProfile(user.uid, profileId);
      const updated = profiles.filter(p => p.id !== profileId);
      setProfiles(updated);
      if (selectedProfile?.id === profileId) {
        selectProfile(updated[0]);
      }
      setCustomAlert({
        title: appLang === 'en' ? 'Success' : appLang === 'es' ? 'Éxito' : 'Sucesso',
        message: appLang === 'en' ? 'Profile deleted successfully.' : appLang === 'es' ? 'Perfil eliminado con éxito.' : 'Perfil excluído com sucesso.',
        type: 'success'
      });
    } catch (err) {
      console.error("Erro ao excluir perfil:", err);
      setCustomAlert({
        title: appLang === 'en' ? 'Error' : appLang === 'es' ? 'Error' : 'Erro',
        message: appLang === 'en' ? 'Could not delete health profile.' : appLang === 'es' ? 'No se pudo eliminar el perfil.' : 'Não foi possível excluir o perfil de saúde.',
        type: 'error'
      });
    }
  };

  const saveProfileModal = async () => {
    if (!modalTitle.trim()) {
      setCustomAlert({
        title: appLang === 'en' ? 'Invalid Title' : appLang === 'es' ? 'Título Requerido' : 'Nome Necessário',
        message: appLang === 'en' ? 'Please type a title/name for the profile.' : appLang === 'es' ? 'Por favor ingrese un nombre para el perfil.' : 'Por favor, digite um título ou nome para o perfil.',
        type: 'info'
      });
      return;
    }
    if (!user) return;

    setSavingProfileModal(true);
    try {
      if (editingProfile) {
        const updatedData = {
          name: modalTitle.trim(),
          conditions: modalConditions,
          allergies: modalAllergies,
        };
        await ProfileRepository.updateProfile(user.uid, editingProfile.id, updatedData);
        
        const updatedProfile = {
          ...editingProfile,
          ...updatedData
        };

        setProfiles(prev => prev.map(p => p.id === editingProfile.id ? updatedProfile : p));
        if (selectedProfile?.id === editingProfile.id) {
          setSelectedProfile(updatedProfile);
          setTempConditions(modalConditions);
          setTempAllergies(modalAllergies);
          sessionStorage.setItem('selectedProfile', JSON.stringify(updatedProfile));
        }
      } else {
        const newProfile = {
          parentUid: user.uid,
          name: modalTitle.trim(),
          type: 'self' as const,
          conditions: modalConditions,
          allergies: modalAllergies,
        };
        const newId = await ProfileRepository.createProfile(user.uid, newProfile);
        const created: HealthProfile = { id: newId, ...newProfile };
        setProfiles(prev => [...prev, created]);
        selectProfile(created);
      }
      setProfileModalOpen(false);
    } catch (err) {
      console.error("Erro ao salvar perfil em modal:", err);
      setCustomAlert({
        title: appLang === 'en' ? 'Sync Error' : appLang === 'es' ? 'Error de sincronización' : 'Erro de Sincronização',
        message: appLang === 'en' ? 'Error syncing information.' : appLang === 'es' ? 'Error al sincronizar con el servidor.' : 'Erro ao sincronizar informações.',
        type: 'error'
      });
    } finally {
      setSavingProfileModal(false);
    }
  };

  const handleToggleModalCondition = (cond: string) => {
    if (modalConditions.includes(cond)) {
      setModalConditions(modalConditions.filter(c => c !== cond));
    } else {
      setModalConditions([...modalConditions, cond]);
      // Regra de Negócio: Se selecionar "Doença Celíaca" ou equivalente, ativa automaticamente o Glúten
      if (cond === "Doença Celíaca" || cond === "Celiaquia (Glúten)") {
        if (!modalAllergies.includes("Glúten")) {
          setModalAllergies(prev => [...prev, "Glúten"]);
        }
      }
    }
  };

  const handleToggleModalAllergy = (alg: string) => {
    let next: string[];
    const isGroup = alg in GROUP_MAPPINGS;
    const isMember = alg in MEMBER_TO_GROUP;

    if (modalAllergies.includes(alg)) {
      // Deselecting alg
      next = modalAllergies.filter(a => a !== alg);
      if (isGroup) {
        // If it's a group, also deselect all members
        const members = GROUP_MAPPINGS[alg];
        next = next.filter(a => !members.includes(a));
      } else if (isMember) {
        // If it's a member, also deselect its parent group
        const group = MEMBER_TO_GROUP[alg];
        next = next.filter(a => a !== group);
      }
    } else {
      // Selecting alg
      next = [...modalAllergies, alg];
      if (isGroup) {
        // If it's a group, also select all members
        const members = GROUP_MAPPINGS[alg];
        members.forEach(m => {
          if (!next.includes(m)) next.push(m);
        });
      } else if (isMember) {
        // If it's a member, check if all other members of its group are also selected
        const group = MEMBER_TO_GROUP[alg];
        const members = GROUP_MAPPINGS[group];
        const allSelected = members.every(m => m === alg || modalAllergies.includes(m));
        if (allSelected && !next.includes(group)) {
          next.push(group);
        }
      }
    }
    setModalAllergies(next);
  };

  const getProfileIcon = (type: 'self' | 'child' | 'other', size: number = 24) => {
    return <User size={size} />;
  };

  const getProfileColorClass = (type: 'self' | 'child' | 'other') => {
    return "bg-blue-600 text-white shadow-blue-500/25";
  };

  return (
    <div className={cn("min-h-screen bg-slate-50 dark:bg-slate-950 font-sans pb-32 flex flex-col relative text-slate-850 dark:text-slate-100", appFontSize === 'xl' ? "accessibility-xl" : appFontSize === 'lg' ? "accessibility-lg" : "")}>
      
      {/* HEADER PRINCIPAL */}
      <header className="px-6 py-5 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-white/10 flex items-center justify-between sticky top-0 z-40 shadow-sm text-slate-800 dark:text-slate-100">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSettingsMenuOpen(true)}
            className="p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full active:scale-95 transition-all animate-none"
            title={t.dashboard.settingsTitle}
          >
            <Menu size={22} className="stroke-[2.2]" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-md shadow-blue-600/10">
              <ShieldAlert size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-black text-slate-800 dark:text-white tracking-tight leading-none mb-0.5 flex items-center gap-1.5">
                Projeto OBem AI
                {isPremium && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-[8px] font-black text-white rounded-full uppercase tracking-widest scale-95 shadow-sm shadow-amber-500/15">
                    <Sparkles size={9} className="text-white shrink-0" /> Premium
                  </span>
                )}
              </h1>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse animate-none" /> {t.dashboard.activeProtection}
              </p>
            </div>
          </div>
        </div>

        {/* BOTAO DE MENU DE PERFIL NO CANTO SUPERIOR DIREITO (USER REQUEST) */}
        {selectedProfile && (
          <div className="relative" ref={dropdownRef}>
            <button
              id="profileMenuBtn"
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100/80 dark:hover:bg-slate-705 border border-slate-150 dark:border-white/10 rounded-2xl flex items-center gap-2.5 transition-all text-left"
            >
              <div className={cn(
                "w-7 h-7 rounded-xl flex items-center justify-center text-xs ml-[-4px]",
                getProfileColorClass(selectedProfile.type)
              )}>
                {getProfileIcon(selectedProfile.type, 15)}
              </div>
              <div className="hidden sm:block font-sans">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-205 leading-none">{selectedProfile.name}</p>
              </div>
              <ChevronDown size={14} className={cn("text-slate-500 dark:text-slate-400 transition-transform duration-250", profileMenuOpen && "rotate-180")} />
            </button>

            {/* DROPDOWN MENU PARA SWITCH DE PERFIL */}
            <AnimatePresence>
              {profileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2.5 w-72 bg-white dark:bg-slate-900 border border-slate-150 dark:border-white/10 rounded-3xl shadow-xl z-50 p-3 space-y-2 overflow-hidden text-slate-800 dark:text-slate-100 font-sans"
                >
                  <p className="text-xs uppercase font-black tracking-widest text-slate-500 dark:text-slate-350 px-3 py-1.5 border-b border-slate-100 dark:border-white/5 mb-1">
                    {t.dashboard.profileSelector}
                  </p>
                  
                  <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                    {profiles.map((prof) => (
                      <div
                        key={prof.id}
                        onClick={() => selectProfile(prof)}
                        className={cn(
                          "w-full text-left p-2 rounded-2xl flex items-center justify-between transition-colors cursor-pointer group hover:bg-slate-50 dark:hover:bg-slate-800",
                          selectedProfile.id === prof.id ? "bg-blue-50/50 hover:bg-blue-50 dark:bg-blue-950/40 dark:hover:bg-blue-950/60" : ""
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className={cn(
                            "w-7 h-7 rounded-lg flex items-center justify-center text-white flex-shrink-0",
                            getProfileColorClass(prof.type)
                          )}>
                            {getProfileIcon(prof.type, 13)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">{prof.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-mono">
                              {(prof.conditions?.length || 0) + (prof.allergies?.length || 0)} {appLang === 'en' ? 'restrictions' : appLang === 'es' ? 'restricciones' : 'restrições'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0 ml-1">
                          {/* Botão de Edição */}
                          <button
                            onClick={(e) => openEditProfileModal(e, prof)}
                            className="p-2 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-xl"
                            title={t.dashboard.editProfile}
                          >
                            <Edit3 size={15} />
                          </button>

                          {/* Botão de Exclusão */}
                          {profiles.length > 1 && (
                            <button
                              onClick={(e) => handleDeleteProfile(e, prof.id)}
                              className="p-2 text-slate-500 hover:text-rose-600 dark:hover:text-rose-450 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl"
                              title={t.common.cancel}
                            >
                              <Trash2 size={15} />
                            </button>
                          )}

                          {selectedProfile.id === prof.id && (
                            <Check size={14} className="text-blue-600 dark:text-blue-400 ml-0.5 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-slate-100 dark:border-white/5 pt-2 space-y-1 mt-1">
                    <button
                      onClick={openCreateProfileModal}
                      className="w-full text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 py-2.5 px-3 rounded-2xl flex items-center gap-2 transition-colors"
                    >
                      <Plus size={15} /> {t.dashboard.addProfile}
                    </button>

                    <button
                      onClick={logout}
                      className="w-full text-xs font-bold text-rose-650 dark:text-rose-400 hover:bg-rose-50/30 dark:hover:bg-rose-950/20 py-2.5 px-3 rounded-2xl flex items-center gap-2 transition-colors"
                    >
                      <LogOut size={15} /> {appLang === 'en' ? 'Sign Out' : appLang === 'es' ? 'Cerrar Sesión' : 'Sair do App'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </header>

      {/* DASHBOARD PRINCIPAL - SEÇÃO CENTRAL DE DESTAQUE */}
      <main className="flex-1 p-6 flex flex-col items-center">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-400 dark:text-slate-400 font-medium mt-3 font-mono">{t.common.loading}</p>
          </div>
        ) : selectedProfile ? (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-lg space-y-6"
          >
            {/* Mensagem de Boas-Vindas */}
            <div className="text-center py-2 mt-4 font-sans">
              <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight leading-tight">
                {appLang === 'en' ? 'Hello' : appLang === 'es' ? 'Hola' : 'Olá'}, {user?.displayName?.split(' ')[0] || "User"}!
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium leading-relaxed">
                {t.dashboard.welcomeMsg}
              </p>
            </div>

            {/* STATUS E FILTROS DE RESTRIÇÃO ATIVOS NO SCANNER */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-150 dark:border-white/10 shadow-lg space-y-5 text-slate-800 dark:text-slate-100 font-sans">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="text-blue-600 dark:text-blue-400" size={20} />
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">{t.dashboard.activeFilters}</h3>
                </div>
                {/* Indicador de título de perfil sutil no canto para fins informativos */}
                <span className="text-xs text-slate-500 dark:text-slate-400 font-extrabold max-w-[120px] truncate">
                  {appLang === 'en' ? 'Profile' : appLang === 'es' ? 'Perfil' : 'Perfil'}: {selectedProfile.name}
                </span>
              </div>

              {(!selectedProfile.conditions || selectedProfile.conditions.length === 0) && 
               (!selectedProfile.allergies || selectedProfile.allergies.length === 0) ? (
                /* Caso de Restrição Zero (User Request: quando não houver restrição... deve haver informação) */
                <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800/30 rounded-2xl space-y-2">
                  <p className="text-xs text-emerald-800 dark:text-emerald-450 font-bold leading-relaxed">
                    {appLang === 'en' ? 'No health restrictions or allergies are applied to this active profile.' : appLang === 'es' ? 'Ninguna restricción de salud o alergia está aplicada a este perfil activo.' : 'Nenhuma restrição de saúde ou alergia está aplicada a este perfil ativo.'}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-normal">
                    {appLang === 'en' ? 'The scanner will display product ingredient lists and details informatively without clinical blocks.' : appLang === 'es' ? 'El escáner funcionará mostrando de forma informativa la lista de ingredientes sin bloqueos de salud.' : 'O scanner funcionará exibindo livremente as informações sobre ingredientes e dados nutricionais dos produtos de forma totalmente informativa.'}
                  </p>
                  <button
                    onClick={() => {
                      setTempConditions(selectedProfile.conditions || []);
                      setTempAllergies(selectedProfile.allergies || []);
                      setRestrictionsOpen(true);
                    }}
                    className="mt-1 text-xs font-black text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1.5 transition-colors"
                  >
                    <Plus size={13} /> {t.dashboard.manageFilters}
                  </button>
                </div>
              ) : (
                /* Mostrar quais as restrições estão ativas */
                <div className="space-y-4">
                  {selectedProfile.conditions && selectedProfile.conditions.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-xs uppercase tracking-wider font-extrabold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <HeartPulse size={12} className="text-blue-500" /> {t.dashboard.conditions}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedProfile.conditions.map((cond) => (
                          <span key={cond} className="bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold px-3 py-1 rounded-xl text-xs font-sans">
                            {translateItem(cond, appLang)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedProfile.allergies && selectedProfile.allergies.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-xs uppercase tracking-wider font-extrabold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <ShieldAlert size={12} className="text-orange-500" /> {t.dashboard.allergies}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedProfile.allergies.map((alg) => (
                          <span key={alg} className="bg-orange-50/70 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-900/40 text-orange-700 dark:text-orange-300 font-semibold px-3 py-1 rounded-xl text-xs font-sans">
                            {translateItem(alg, appLang)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setTempConditions(selectedProfile.conditions || []);
                        setTempAllergies(selectedProfile.allergies || []);
                        setRestrictionsOpen(true);
                      }}
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 hover:underline"
                    >
                      {t.dashboard.manageFilters} →
                    </button>
                  </div>
                </div>
              )}

              {/* Informação sobre escopo do aplicativo - consumíveis */}
              <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-white/5 p-3.5 rounded-2xl text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-1">
                <p className="font-extrabold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                  <Sparkles size={13} className="text-blue-600 dark:text-blue-400 animate-none" /> {t.dashboard.scopeTitle}
                </p>
                <p>
                  {t.dashboard.scopeDesc}
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-150 dark:border-white/10 text-slate-800 dark:text-slate-200">
            <X size={40} className="text-slate-400 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 text-sm">{appLang === 'en' ? 'Database session issues. Please sign out and sign back in.' : appLang === 'es' ? 'Problemas con la sesión local. Por favor reinicie su sesión.' : 'Houve uma instabilidade de cadastro. Por favor, reinicie seu login.'}</p>
          </div>
        )}
      </main>

      {/* DRAWER / POPUP IN-PLACE PARA FILTRO DE RESTRIÇÕES (ACCESSIBILITY FIRST) */}
      <AnimatePresence>
        {restrictionsOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center p-4"
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-slate-800"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="text-blue-600" size={20} />
                  <div>
                    <h3 className="text-lg font-black tracking-tight text-slate-800">Filtro de Restrições</h3>
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-none mt-1">
                      Ajuste Rápido: {selectedProfile?.name}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setRestrictionsOpen(false)}
                  className="p-2 hover:bg-slate-100 active:scale-95 rounded-full text-slate-400 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* BARRA DE BUSCA GLOBAL (TOPO FIXED) */}
              <div className="px-6 pt-4 pb-2 border-b border-slate-100 dark:border-white/5 bg-white dark:bg-slate-950">
                <div className="relative">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-505 pointer-events-none" />
                  <input
                    type="text"
                    value={restrictionsSearchText}
                    onChange={(e) => setRestrictionsSearchText(e.target.value)}
                    placeholder={appLang === 'en' ? "Search ingredients or conditions..." : appLang === 'es' ? "Buscar ingredientes o condiciones..." : "Buscar alérgenos ou condições..."}
                    className="w-full pl-11 pr-10 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-white/5 focus:border-blue-500 dark:focus:border-blue-500 rounded-2xl outline-none text-sm font-semibold text-slate-800 dark:text-slate-100 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm"
                    style={{ minHeight: '44px' }}
                  />
                  {restrictionsSearchText && (
                    <button
                      type="button"
                      onClick={() => setRestrictionsSearchText('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 dark:text-slate-505 hover:text-slate-600 transition-colors"
                      style={{ minWidth: '36px', minHeight: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-white dark:bg-slate-950">
                
                {/* Avisos de Restrições Vinculadas / Diretrizes Acadêmicas */}
                {(tempConditions.includes("Doença Celíaca") || tempConditions.includes("Diabetes") || tempConditions.includes("Hipertensão")) && (
                  <div className="p-4 bg-amber-55/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl space-y-1.5 text-xs font-semibold text-amber-900 dark:text-amber-300">
                    <p className="font-bold flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-sm">
                      <AlertCircle size={15} /> 
                      {appLang === 'en' ? 'Scientific & Medical Guidelines' : appLang === 'es' ? 'Directrices Científicas y Médicas' : 'Diretrizes Científicas / Oficiais'}
                    </p>
                    <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-400 leading-relaxed">
                      {tempConditions.includes("Doença Celíaca") && (
                        <li>
                          {appLang === 'en' ? 'Celiac Disease: Gluten is automatically blocked based on official scientific guidelines.' : 
                           appLang === 'es' ? 'Enfermedad Celíaca: El gluten está bloqueado automáticamente según directrices científicas.' : 
                           'Doença Celíaca: O Glúten é bloqueado automaticamente com base em diretrizes científicas/oficiais para proteger as vilosidades intestinais.'}
                        </li>
                      )}
                      {tempConditions.includes("Diabetes") && (
                        <li>
                          {appLang === 'en' ? 'Diabetes: High-glycemic ingredients (sugars, starch syrups, maltodextrin) are flagged.' : 
                           appLang === 'es' ? 'Diabetes: Ingredientes de alto índice glucémico (azúcar, jarabes, maltodextrina) son alertados.' : 
                           'Diabetes: Açúcares adicionados e carboidratos de alta absorção são escrutinados para evitar picos glicêmicos.'}
                        </li>
                      )}
                      {tempConditions.includes("Hipertensão") && (
                        <li>
                          {appLang === 'en' ? 'Hypertension: Sodium and sodium-based preservatives are scrutinized to support blood pressure safety.' : 
                           appLang === 'es' ? 'Hypertension: Sodio y conservantes de sodio son analizados para mayor seguridad de su presión arterial.' : 
                           'Hipertensão: Componentes com alto teor de sódio e conservantes sódicos são alertados para saúde cardiovascular.'}
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Renderização das categorias com Taxonomia, Busca Global, Alto Contraste e Acessibilidade */}
                {FILTER_TAXONOMY.map((category) => {
                  const filtered = category.items.filter(item => {
                    const label = translateItem(item, appLang);
                    return label.toLowerCase().includes(restrictionsSearchText.toLowerCase()) || 
                           item.toLowerCase().includes(restrictionsSearchText.toLowerCase());
                  });

                  if (restrictionsSearchText && filtered.length === 0) return null;

                  const isExpanded = !!restrictionsExpanded[category.key];
                  const showAll = !!restrictionsSearchText || isExpanded;
                  
                  const visibleItems = showAll ? filtered : filtered.slice(0, 4);
                  const hasMore = filtered.length > 4;

                  return (
                    <div key={category.key} className="space-y-3 pb-4 border-b border-slate-100 dark:border-white/5 last:border-0 last:pb-0">
                      <div className="flex items-center gap-1.5 justify-between">
                        <span className="text-xs uppercase font-extrabold tracking-wider text-slate-450 dark:text-slate-400 flex items-center gap-1.5">
                          {category.type === 'conditions' ? (
                            <HeartPulse size={13} className="text-blue-500" />
                          ) : (
                            <ShieldAlert size={13} className="text-orange-500" />
                          )}
                          {category.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-normal">
                        {category.description[appLang as 'pt' | 'en' | 'es'] || category.description.pt}
                      </p>

                      <div className="flex flex-wrap gap-2.5 pt-1">
                        {visibleItems.map((item) => {
                          const isCondition = category.type === 'conditions';
                          const isChecked = isCondition 
                            ? tempConditions.includes(item) 
                            : tempAllergies.includes(item);

                          const isLinkedGluten = !isCondition && item === "Glúten" && tempConditions.includes("Doença Celíaca");

                          return (
                            <button
                              key={item}
                              type="button"
                              onClick={() => {
                                if (isCondition) {
                                  handleToggleCondition(item);
                                } else {
                                  handleToggleAllergy(item);
                                }
                              }}
                              className={cn(
                                "px-4 py-3 rounded-2xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 min-h-[44px]",
                                isChecked || isLinkedGluten
                                  ? (isCondition 
                                      ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/10" 
                                      : "bg-orange-600 border-orange-600 text-white shadow-md shadow-orange-500/10")
                                  : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-650 dark:border-white/5 dark:text-slate-350 dark:bg-slate-900 dark:hover:bg-slate-805"
                              )}
                              title={item}
                              style={{ touchAction: 'manipulation' }}
                            >
                              {(isChecked || isLinkedGluten) && <Check size={14} className="stroke-[3]" />}
                              {translateItem(item, appLang)}
                              {isLinkedGluten && (
                                <span className="text-[9px] font-black uppercase tracking-widest bg-amber-500/30 text-amber-900 dark:text-white px-1.5 py-0.5 rounded-md leading-none">
                                  Vínculo Cél.
                                </span>
                              )}
                            </button>
                          );
                        })}

                        {/* Ação de Expansão: Botão translúcido e menor ao lado do último chip */}
                        {hasMore && !restrictionsSearchText && (
                          <button
                            type="button"
                            onClick={() => {
                              setRestrictionsExpanded(prev => ({
                                ...prev,
                                [category.key]: !isExpanded
                              }));
                            }}
                            className="px-4 py-3 min-h-[44px] rounded-2xl text-xs font-extrabold flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 dark:bg-slate-900 border border-dashed border-slate-200 dark:border-white/10 dark:text-slate-350 transition-all active:scale-95"
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp size={13} />
                                {appLang === 'en' ? 'Show Less' : appLang === 'es' ? 'Ver Menos' : 'Ver menos'}
                              </>
                            ) : (
                              <>
                                <Plus size={13} />
                                {appLang === 'en' ? `More (${filtered.length - 4})` : appLang === 'es' ? `Más (${filtered.length - 4})` : `Mais (${filtered.length - 4})`}
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
                <button
                  onClick={() => setRestrictionsOpen(false)}
                  className="flex-1 py-3.5 bg-slate-200 hover:bg-slate-300/80 active:scale-[0.98] transition-all text-slate-700 font-bold text-xs rounded-2xl"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveEditedRestrictions}
                  disabled={savingRestrictions}
                  className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all text-white font-extrabold text-xs rounded-2xl shadow-md shadow-blue-500/10 flex items-center justify-center gap-1.5"
                >
                  {savingRestrictions ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <><Save size={15} /> Aplicar Filtro</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* MODAL UNIFICADO PARA CRIAR/EDITAR PERFIS DIRETAMENTE NO DASHBOARD (USER REQUEST) */}
        {profileModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center p-4 sm:items-center"
          >
            <motion.div 
              initial={{ y: "100%", scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: "100%", scale: 0.95 }}
              className="bg-white dark:bg-slate-950 rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden max-h-[85vh] flex flex-col text-slate-800 dark:text-slate-100"
            >
              <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
                    <UserPlus size={20} className="stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight text-slate-800 dark:text-white">
                      {editingProfile ? "Editar Perfil" : "Novo Perfil de Restrições"}
                    </h3>
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-none mt-1">
                      {editingProfile ? "Ajustar perfil existente" : "Criar nova configuração protetiva"}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setProfileModalOpen(false);
                    setModalSearchText('');
                  }}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-900 active:scale-95 rounded-full text-slate-400 dark:text-slate-505 transition-colors"
                  style={{ minWidth: '44px', minHeight: '44px' }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Título do Perfil e Busca Global de Elementos */}
              <div className="p-6 pb-2 border-b border-slate-100 dark:border-white/5 bg-white dark:bg-slate-950 space-y-4">
                {/* Título do Perfil */}
                <div className="space-y-2">
                  <label className="block text-xs uppercase font-extrabold tracking-wider text-slate-400 dark:text-slate-500">Título do Perfil</label>
                  <input
                    type="text"
                    value={modalTitle}
                    onChange={(e) => setModalTitle(e.target.value)}
                    placeholder="Ex: Minhas Restrições, Geral, Adulto..."
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-white/5 focus:bg-white focus:border-blue-500 dark:focus:border-blue-500 rounded-2xl outline-none text-sm font-semibold transition-all shadow-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-550"
                  />
                </div>

                {/* BARRA DE BUSCA GLOBAL */}
                <div className="relative">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-505 pointer-events-none" />
                  <input
                    type="text"
                    value={modalSearchText}
                    onChange={(e) => setModalSearchText(e.target.value)}
                    placeholder={appLang === 'en' ? "Search ingredients or conditions..." : appLang === 'es' ? "Buscar ingredientes o condiciones..." : "Buscar alérgenos ou condições..."}
                    className="w-full pl-11 pr-10 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-white/5 focus:border-blue-500 dark:focus:border-blue-500 rounded-2xl outline-none text-sm font-semibold text-slate-800 dark:text-slate-100 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm"
                    style={{ minHeight: '44px' }}
                  />
                  {modalSearchText && (
                    <button
                      type="button"
                      onClick={() => setModalSearchText('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 dark:text-slate-505 hover:text-slate-650 transition-colors"
                      style={{ minWidth: '36px', minHeight: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-white dark:bg-slate-950">
                
                {/* Avisos de Restrições Vinculadas / Diretrizes Acadêmicas */}
                {(modalConditions.includes("Doença Celíaca") || modalConditions.includes("Diabetes") || modalConditions.includes("Hipertensão")) && (
                  <div className="p-4 bg-amber-55/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl space-y-1.5 text-xs font-semibold text-amber-900 dark:text-amber-300">
                    <p className="font-bold flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-sm">
                      <AlertCircle size={15} /> 
                      {appLang === 'en' ? 'Scientific & Medical Guidelines' : appLang === 'es' ? 'Directrices Científicas y Médicas' : 'Diretrizes Científicas / Oficiais'}
                    </p>
                    <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-400 leading-relaxed">
                      {modalConditions.includes("Doença Celíaca") && (
                        <li>
                          {appLang === 'en' ? 'Celiac Disease: Gluten is automatically blocked based on official scientific guidelines.' : 
                           appLang === 'es' ? 'Enfermedad Celíaca: El gluten está bloqueado automáticamente según directrices científicas.' : 
                           'Doença Celíaca: O Glúten é bloqueado automaticamente com base em diretrizes científicas/oficiais para proteger as vilosidades intestinais.'}
                        </li>
                      )}
                      {modalConditions.includes("Diabetes") && (
                        <li>
                          {appLang === 'en' ? 'Diabetes: High-glycemic ingredients (sugars, starch syrups, maltodextrin) are flagged.' : 
                           appLang === 'es' ? 'Diabetes: Ingredientes de alto índice glucémico (azúcar, jarabes, maltodextrina) son alertados.' : 
                           'Diabetes: Açúcares adicionados e carboidratos de alta absorção são escrutinados para evitar picos glicêmicos.'}
                        </li>
                      )}
                      {modalConditions.includes("Hipertensão") && (
                        <li>
                          {appLang === 'en' ? 'Hypertension: Sodium and sodium-based preservatives are scrutinized to support blood pressure safety.' : 
                           appLang === 'es' ? 'Hypertension: Sodio y conservantes de sodio son analizados para mayor seguridad de su presión arterial.' : 
                           'Hipertensão: Componentes com alto teor de sódio e conservantes sódicos são alertados para saúde cardiovascular.'}
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Renderização das categorias com Taxonomia, Busca Global, Alto Contraste e Acessibilidade */}
                {FILTER_TAXONOMY.map((category) => {
                  const filtered = category.items.filter(item => {
                    const label = translateItem(item, appLang);
                    return label.toLowerCase().includes(modalSearchText.toLowerCase()) || 
                           item.toLowerCase().includes(modalSearchText.toLowerCase());
                  });

                  if (modalSearchText && filtered.length === 0) return null;

                  const isExpanded = !!modalExpanded[category.key];
                  const showAll = !!modalSearchText || isExpanded;
                  
                  const visibleItems = showAll ? filtered : filtered.slice(0, 4);
                  const hasMore = filtered.length > 4;

                  return (
                    <div key={category.key} className="space-y-3 pb-4 border-b border-slate-100 dark:border-white/5 last:border-0 last:pb-0">
                      <div className="flex items-center gap-1.5 justify-between">
                        <span className="text-xs uppercase font-extrabold tracking-wider text-slate-450 dark:text-slate-400 flex items-center gap-1.5">
                          {category.type === 'conditions' ? (
                            <HeartPulse size={13} className="text-blue-500" />
                          ) : (
                            <ShieldAlert size={13} className="text-orange-500" />
                          )}
                          {category.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-normal">
                        {category.description[appLang as 'pt' | 'en' | 'es'] || category.description.pt}
                      </p>

                      <div className="flex flex-wrap gap-2.5 pt-1">
                        {visibleItems.map((item) => {
                          const isCondition = category.type === 'conditions';
                          const isChecked = isCondition 
                            ? modalConditions.includes(item) 
                            : modalAllergies.includes(item);

                          const isLinkedGluten = !isCondition && item === "Glúten" && modalConditions.includes("Doença Celíaca");

                          return (
                            <button
                              key={item}
                              type="button"
                              onClick={() => {
                                if (isCondition) {
                                  handleToggleModalCondition(item);
                                } else {
                                  handleToggleModalAllergy(item);
                                }
                              }}
                              className={cn(
                                "px-4 py-3 rounded-2xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 min-h-[44px]",
                                isChecked || isLinkedGluten
                                  ? (isCondition 
                                      ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/10" 
                                      : "bg-orange-600 border-orange-600 text-white shadow-md shadow-orange-500/10")
                                  : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-655 dark:border-white/5 dark:text-slate-350 dark:bg-slate-900 dark:hover:bg-slate-805"
                              )}
                              title={item}
                              style={{ touchAction: 'manipulation' }}
                            >
                              {(isChecked || isLinkedGluten) && <Check size={14} className="stroke-[3]" />}
                              {translateItem(item, appLang)}
                              {isLinkedGluten && (
                                <span className="text-[9px] font-black uppercase tracking-widest bg-amber-500/30 text-amber-900 dark:text-white px-1.5 py-0.5 rounded-md leading-none">
                                  Vínculo Cél.
                                </span>
                              )}
                            </button>
                          );
                        })}

                        {/* Ação de Expansão: Botão translúcido e menor ao lado do último chip */}
                        {hasMore && !modalSearchText && (
                          <button
                            type="button"
                            onClick={() => {
                              setModalExpanded(prev => ({
                                ...prev,
                                [category.key]: !isExpanded
                              }));
                            }}
                            className="px-4 py-3 min-h-[44px] rounded-2xl text-xs font-extrabold flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 dark:bg-slate-900 border border-dashed border-slate-200 dark:border-white/10 dark:text-slate-350 transition-all active:scale-95"
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp size={13} />
                                {appLang === 'en' ? 'Show Less' : appLang === 'es' ? 'Ver Menos' : 'Ver menos'}
                              </>
                            ) : (
                              <>
                                <Plus size={13} />
                                {appLang === 'en' ? `More (${filtered.length - 4})` : appLang === 'es' ? `Más (${filtered.length - 4})` : `Mais (${filtered.length - 4})`}
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-900 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setProfileModalOpen(false);
                    setModalSearchText('');
                  }}
                  className="flex-1 py-4 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-705 active:scale-[0.98] transition-all text-slate-705 dark:text-slate-300 font-bold text-xs rounded-2xl min-h-[44px]"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    saveProfileModal();
                    setModalSearchText('');
                  }}
                  disabled={savingProfileModal}
                  className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all text-white font-extrabold text-xs rounded-2xl shadow-md shadow-blue-500/10 flex items-center justify-center gap-1.5 min-h-[44px]"
                >
                  {savingProfileModal ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <><Save size={15} /> Salvar Perfil</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MENU HAMBURGUER LATERAL (SANDWICH MENU) */}
      <AnimatePresence>
        {settingsMenuOpen && (
          <>
            {/* Backdrop com fade-in */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSettingsMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 pointer-events-auto"
            />
            {/* Gaveta lateral que desliza do canto esquerdo */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 left-0 w-[320px] max-w-[85vw] bg-white dark:bg-slate-900 z-50 shadow-2xl overflow-y-auto flex flex-col border-r border-slate-100 dark:border-white/10 p-6 text-slate-800 dark:text-slate-100 font-sans"
            >
              <div className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                    <ShieldAlert size={16} />
                  </div>
                  <span className="font-extrabold text-slate-900 dark:text-white tracking-tight text-sm">
                    {appLang === 'en' ? 'Configurações Projeto OBem AI' : appLang === 'es' ? 'Ajustes Projeto OBem AI' : 'Ajustes Projeto OBem AI'}
                  </span>
                </div>
                <button
                  onClick={() => setSettingsMenuOpen(false)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* CONTEÚDO */}
              <div className="flex-1 py-6 space-y-6">
                
                {/* 1. CADASTRO / CONTA / PAGAMENTO */}
                <div className="space-y-3">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-505">
                    {appLang === 'en' ? 'Subscription & Account' : appLang === 'es' ? 'Suscripción y Cuenta' : 'Cadastro e Assinatura'}
                  </span>
                  
                  {/* Informações Pessoais (LGPD Compliant & Direct Display per User Request) */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-white/5 flex flex-col gap-2.5 font-sans">
                    <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-200/40 dark:border-white/5">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">
                        {appLang === 'en' ? 'Profile Owner' : appLang === 'es' ? 'Propietario' : 'Titular da Conta'}
                      </span>
                      <span className="font-bold text-slate-705 dark:text-slate-300">
                        {appUser?.fullName || user?.displayName || '---'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-200/40 dark:border-white/5">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">
                        {appLang === 'en' ? 'Primary Email' : appLang === 'es' ? 'Email Principal' : 'E-mail Principal'}
                      </span>
                      <span className="font-bold text-slate-705 dark:text-slate-300">
                        {appUser?.email || user?.email || '---'}
                      </span>
                    </div>

                    {appUser?.alternativeEmail && (
                      <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-200/40 dark:border-white/5">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">
                          {appLang === 'en' ? 'Recovery Email' : appLang === 'es' ? 'Email Recuperación' : 'E-mail Recuperação'}
                        </span>
                        <span className="font-bold text-slate-600 dark:text-slate-400">
                          {appUser.alternativeEmail}
                        </span>
                      </div>
                    )}

                    {appUser?.phone && (
                      <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-200/40 dark:border-white/5">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">
                          {appLang === 'en' ? 'Security Phone' : appLang === 'es' ? 'Tel. de Seguridad' : 'Celular e Segurança'}
                        </span>
                        <span className="font-bold text-slate-705 dark:text-slate-300">
                          {appUser.phone}
                        </span>
                      </div>
                    )}

                    {appUser?.nationality && (
                      <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-200/40 dark:border-white/5">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase flex items-center gap-1">
                          <Globe size={10} className="text-slate-400" />
                          {appLang === 'en' ? 'Nationality' : appLang === 'es' ? 'Nacionalidad' : 'Nacionalidade'}
                        </span>
                        <span className="font-bold text-slate-705 dark:text-slate-300">
                          {appUser.nationality}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase flex items-center gap-1.5">
                        <CreditCard size={11} className="text-blue-500" />
                        {appLang === 'en' ? 'Plan:' : appLang === 'es' ? 'Plan:' : 'Plano:'}
                      </span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        {appLang === 'en' ? 'Pro Global Plan' : appLang === 'es' ? 'Plan Pro Global' : 'Plano Pro Internacional'}
                      </span>
                    </div>

                    <div className="mt-1 pb-1 border-t border-slate-200/50 dark:border-white/5 pt-2 flex justify-between items-center">
                      <span className="text-[10px] text-slate-400 uppercase font-black">
                        {appLang === 'en' ? 'Payments:' : appLang === 'es' ? 'Pagos:' : 'Status/Fatura:'}
                      </span>
                      <span className="bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {appLang === 'en' ? 'Active' : appLang === 'es' ? 'Al día' : 'Em Dia'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSettingsMenuOpen(false);
                        setAccountEditOpen(true);
                      }}
                      className="mt-3.5 w-full py-3 bg-blue-50 hover:bg-blue-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-blue-650 dark:text-slate-250 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm border border-blue-100 dark:border-white/5"
                    >
                      <Edit3 size={13} className="text-blue-500 dark:text-slate-400" />
                      {appLang === 'en' ? 'Manage Account & Billing' : appLang === 'es' ? 'Gestionar Cuenta y Factura' : 'Gerenciar Conta & Faturamento'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSettingsMenuOpen(false);
                        setSupportOpen(true);
                      }}
                      className="mt-2 w-full py-3 bg-indigo-50 hover:bg-indigo-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-indigo-650 dark:text-slate-250 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm border border-indigo-100 dark:border-white/5"
                    >
                      <LifeBuoy size={13} className="text-indigo-500 dark:text-slate-400" />
                      {appLang === 'en' ? 'Support & Help Center' : appLang === 'es' ? 'Soporte y Ayuda' : 'Suporte & Central de Ajuda'}
                    </button>
                  </div>
                </div>



                {/* 2. CONFIGURAÇÕES: IDIOMA, TELA, FONTE, ACESSIBILIDADE */}
                <div className="space-y-4">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-505">
                    {appLang === 'en' ? 'Preferences Settings' : appLang === 'es' ? 'Configuración de Preferencias' : 'Configuração de Preferências'}
                  </span>

                  {/* IDIOMA */}
                  <div className="space-y-1.5 font-sans">
                    <label className="text-xs font-bold text-slate-705 dark:text-slate-200 flex items-center gap-2">
                      <Languages size={14} className="text-slate-500" /> {appLang === 'en' ? 'App Language:' : appLang === 'es' ? 'Idioma del App:' : 'Idioma do App:'}
                    </label>
                    <select
                      value={appLang}
                      onChange={(e) => {
                        const newLang = e.target.value;
                        setAppLang(newLang);
                        localStorage.setItem('safelabel_lang', newLang);
                      }}
                      className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-white/10 rounded-xl font-bold outline-none border-slate-150 focus:border-blue-500 text-slate-800 dark:text-slate-100"
                    >
                      <option value="pt" className="dark:bg-slate-900">🇧🇷 Português (BR)</option>
                      <option value="en" className="dark:bg-slate-900">🇺🇸 English (US)</option>
                      <option value="es" className="dark:bg-slate-900">🇪🇸 Español (ES)</option>
                      <option value="zh" className="dark:bg-slate-900">🇨🇳 中文 (简体)</option>
                      <option value="ja" className="dark:bg-slate-900">🇯🇵 日本語 (JP)</option>
                      <option value="ko" className="dark:bg-slate-900">🇰🇷 한국어 (KR)</option>
                      <option value="fr" className="dark:bg-slate-900">🇫🇷 Français (FR)</option>
                      <option value="de" className="dark:bg-slate-900">🇩🇪 Deutsch (DE)</option>
                      <option value="it" className="dark:bg-slate-900">🇮🇹 Italiano (IT)</option>
                    </select>
                  </div>

                  {/* MODO DE ANÁLISE / MODO DE TELA (SWITCH TON/OFF TRANSITION) */}
                  <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-white/5 pb-3">
                    <div className="space-y-0.5">
                      <label className="text-xs font-bold text-slate-705 dark:text-slate-200 flex items-center gap-2">
                        {appTheme === 'dark' ? <Moon size={14} className="text-blue-500" /> : <Sun size={14} className="text-amber-500" />} 
                        {appTheme === 'dark' 
                          ? (appLang === 'en' ? 'Dark Mode' : appLang === 'es' ? 'Modo Oscuro' : 'Modo Escuro')
                          : (appLang === 'en' ? 'Light Mode' : appLang === 'es' ? 'Modo Claro' : 'Modo Claro')}
                      </label>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500">
                        {appLang === 'en' ? 'Toggle dark eye-care palette' : appLang === 'es' ? 'Alternar paleta oscura o clara' : 'Alternar visualização clara ou escura'}
                      </p>
                    </div>
                    <button
                      id="themeSwitchBtn"
                      onClick={() => setAppTheme(appTheme === 'dark' ? 'light' : 'dark')}
                      className={cn(
                        "w-11 h-6 rounded-full p-0.5 transition-all flex items-center",
                        appTheme === 'dark' ? "bg-blue-600 justify-end" : "bg-slate-200 dark:bg-slate-705 justify-start"
                      )}
                    >
                      <motion.div layout className="w-5 h-5 bg-white rounded-full shadow" />
                    </button>
                  </div>

                  {/* TAMANHO DA FONTE */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-705 dark:text-slate-205 flex items-center gap-2">
                      <Type size={14} className="text-slate-500" /> {appLang === 'en' ? 'Font Size:' : appLang === 'es' ? 'Tamaño de Letra:' : 'Tamanho da Fonte:'}
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {['normal', 'lg', 'xl'].map((sz) => (
                        <button
                          key={sz}
                          onClick={() => setAppFontSize(sz)}
                          className={cn(
                            "py-2 text-[10px] uppercase font-black rounded-lg border",
                            appFontSize === sz 
                              ? "bg-blue-600 border-blue-600 text-white" 
                              : "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-750"
                          )}
                        >
                          {sz === 'normal' 
                            ? (appLang === 'en' ? 'Normal' : appLang === 'es' ? 'Normal' : 'Normal') 
                            : sz === 'lg' 
                              ? (appLang === 'en' ? 'Large' : appLang === 'es' ? 'Grande' : 'Grande') 
                              : (appLang === 'en' ? 'Very Lg.' : appLang === 'es' ? 'Muy Gr.' : 'Muito G.')}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

              </div>

              {/* FOOTER */}
              <div className="border-t border-slate-100 dark:border-white/5 pt-4 flex flex-col gap-2 font-mono">
                <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center font-bold">Projeto OBem AI 1.0.0 Alpha • Secure Client</p>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 
        =======================================================
        BARRA DE NAVEGAÇÃO INFERIOR CUSTOMIZADA (ACCESSIBILITY FIRST FOR ALL AGES)
        =======================================================
      */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-slate-100 via-white/95 to-white/70 dark:from-slate-950 dark:via-slate-900/95 dark:to-slate-900/70 backdrop-blur-md border-t border-slate-150/40 dark:border-white/10 z-30 shadow-[0_-12px_40px_rgba(0,0,0,0.06)] flex justify-center text-slate-400 dark:text-slate-400">
        <div className="w-full max-w-md grid grid-cols-3 items-center relative gap-2 font-sans">
          
          {/* LADO ESQUERDO: FILTRO DE RESTRIÇÕES & BUSCA (ACCESSIBILITY) */}
          <div className="flex items-center justify-center gap-1 sm:gap-3">
            {/* FILTROS */}
            <button
              onClick={() => {
                setTempConditions(selectedProfile?.conditions || []);
                setTempAllergies(selectedProfile?.allergies || []);
                setRestrictionsOpen(true);
              }}
              className="flex flex-col items-center justify-center gap-1.5 p-2 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 rounded-2xl text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all font-medium active:scale-95 min-w-[50px] min-h-[48px]"
              title={t.dashboard.manageFilters}
            >
              <Filter size={22} className="stroke-[2.2]" />
              <span className="text-[10px] font-extrabold uppercase tracking-wide whitespace-nowrap font-sans">
                {appLang === 'en' ? 'Filters' : appLang === 'es' ? 'Filtros' : 'Filtros'}
              </span>
            </button>

            {/* BOTÃO DE BUSCA (ANTIGO CATÁLOGO) */}
            <button
              onClick={() => navigate('/search')}
              className="flex flex-col items-center justify-center gap-1.5 p-2 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 rounded-2xl text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all font-medium active:scale-95 min-w-[50px] min-h-[48px]"
              title={appLang === 'en' ? 'Search' : appLang === 'es' ? 'Buscar' : 'Busca'}
            >
              <Search size={22} className="stroke-[2.2]" />
              <span className="text-[10px] font-extrabold uppercase tracking-wide whitespace-nowrap font-sans">
                {appLang === 'en' ? 'Search' : appLang === 'es' ? 'Buscar' : 'Busca'}
              </span>
            </button>
          </div>

          {/* CENTRO: BOTÃO ESCANEAR SUPER PROEMINENTE (ACCESSIBILITY AGES 5+) */}
          <div className="flex justify-center -mt-8 relative z-40">
            <button
              id="mainScanBtn"
              onClick={() => navigate('/scan')}
              className="w-24 h-24 bg-gradient-to-tr from-blue-700 to-blue-500 rounded-full flex flex-col items-center justify-center shadow-xl shadow-blue-500/35 border-4 border-white dark:border-slate-900 select-none duration-150 transition-all active:scale-90 hover:brightness-110 cursor-pointer"
            >
              {/* Outer Pulsing visual effect for quick scanning indicator */}
              <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 dark:border-blue-400/20 animate-ping pointer-events-none" />
              <Scan size={36} className="text-white ml-[1px] stroke-[2.5]" />
              <span className="text-[9px] font-black uppercase text-white tracking-widest leading-none mt-1">
                {appLang === 'en' ? 'SCAN' : appLang === 'es' ? 'ESCANEAR' : 'ESCANEAR'}
              </span>
            </button>
          </div>

          {/* LADO DIREITO: HISTÓRICO DE PRODUTOS & SOBRE */}
          <div className="flex items-center justify-center gap-1 sm:gap-3">
            {/* HISTÓRICO DE PRODUTOS */}
            <button
              onClick={() => navigate('/history')}
              className="flex flex-col items-center justify-center gap-1.5 p-2 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 rounded-2xl text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all font-medium active:scale-95 min-w-[50px] min-h-[48px]"
              title={appLang === 'en' ? 'Clinical History' : appLang === 'es' ? 'Historial Clínico' : 'Histórico Clínico'}
            >
              <HistoryIcon size={22} className="stroke-[2.2]" />
              <span className="text-[10px] font-extrabold uppercase tracking-wide whitespace-nowrap font-sans">
                {appLang === 'en' ? 'History' : appLang === 'es' ? 'Historial' : 'Histórico'}
              </span>
            </button>

            {/* BOTÃO SOBRE */}
            <button
              onClick={() => {
                setDonationStep('info');
                setAboutOpen(true);
              }}
              className="flex flex-col items-center justify-center gap-1.5 p-2 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 rounded-2xl text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all font-medium active:scale-95 min-w-[50px] min-h-[48px]"
              title={appLang === 'en' ? 'About App' : appLang === 'es' ? 'Sobre el App' : 'Sobre o App'}
            >
              <Info size={22} className="stroke-[2.2]" />
              <span className="text-[10px] font-extrabold uppercase tracking-wide whitespace-nowrap font-sans">
                {appLang === 'en' ? 'About' : appLang === 'es' ? 'Sobre' : 'Sobre'}
              </span>
            </button>
          </div>

        </div>
      </div>

      {/* 
        =======================================================
        ALERTAS E POPUPS DE CONFIRMAÇÃO CUSTOMIZADOS
        =======================================================
      */}
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
              className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-slate-100 dark:border-white/10 text-center"
            >
              <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/30 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} />
              </div>
              <h3 className="text-base font-black text-slate-800 dark:text-white mb-2">
                {appLang === 'en' ? 'Delete Profile?' : appLang === 'es' ? '¿Eliminar Perfil?' : 'Excluir Perfil?'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                {appLang === 'en' 
                  ? 'Are you sure you want to delete this profile? This action is permanent and cannot be undone.' 
                  : appLang === 'es' 
                    ? '¿Está seguro de que desea eliminar este perfil? Esta acción es permanente y no se puede deshacer.' 
                    : 'Deseja realmente confirmar a exclusão deste perfil? Essa ação é permanente e removerá todas as restrições associadas.'}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setDeleteProfileId(null)}
                  className="py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-200 font-bold rounded-xl text-xs transition-all active:scale-95"
                >
                  {appLang === 'en' ? 'Cancel' : appLang === 'es' ? 'Cancelar' : 'Cancelar'}
                </button>
                <button
                  onClick={confirmDeleteProfile}
                  className="py-3 bg-rose-600 hover:bg-rose-550 text-white font-bold rounded-xl text-xs transition-all active:scale-95 shadow-md shadow-rose-600/10"
                >
                  {appLang === 'en' ? 'Delete' : appLang === 'es' ? 'Eliminar' : 'Excluir'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}

      {customAlert && (
        <AnimatePresence>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 font-sans"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-slate-100 dark:border-white/10 text-center"
            >
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4",
                customAlert.type === 'error' ? "bg-rose-50 dark:bg-rose-950/30 text-rose-600" :
                customAlert.type === 'success' ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600" :
                "bg-blue-50 dark:bg-blue-950/30 text-blue-600"
              )}>
                {customAlert.type === 'error' ? <XCircle size={24} /> :
                 customAlert.type === 'success' ? <CheckCircle2 size={24} /> :
                 <AlertCircle size={24} />}
              </div>
              <h3 className="text-base font-black text-slate-800 dark:text-white mb-2">
                {customAlert.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                {customAlert.message}
              </p>
              <button
                onClick={() => setCustomAlert(null)}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all active:scale-95 shadow-md shadow-blue-600/10"
              >
                  {appLang === 'en' ? 'OK' : appLang === 'es' ? 'Aceptar' : 'Entendido'}
              </button>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}
      {/* MODAL SOBRE O APP & APELO SOLIDÁRIO */}
      <AnimatePresence>
        {aboutOpen && (
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
              className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 dark:border-white/10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 rounded-xl flex items-center justify-center">
                    <Info size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800 dark:text-white leading-none">
                      {appLang === 'en' ? 'About OBem AI' : appLang === 'es' ? 'Sobre el Proyecto' : 'Sobre o Projeto OBem AI'}
                    </h3>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-1">
                      {appLang === 'en' ? 'History, references & solidarity' : appLang === 'es' ? 'Historial, referencias y solidaridad' : 'História, referências e solidariedade'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setAboutOpen(false)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 dark:text-slate-505 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Dynamic Scrollable Body */}
              <div className="p-6 overflow-y-auto space-y-5 text-slate-600 dark:text-slate-350 leading-relaxed text-xs">
                {donationStep === 'info' && (
                  <>
                    <section className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Award size={14} className="text-blue-500" />
                        {appLang === 'en' ? 'History & Core Purpose' : appLang === 'es' ? 'Historia y Propósito' : 'História e Propósito do Atendimento'}
                      </h4>
                      <p>
                        {appLang === 'en' 
                          ? 'OBem AI arose from a latent social demand: democratize and simplify food and chemical ingredient label checking for children, diabetic patient networks, hypertensive elders, and families dealing with allergy restrictions.' 
                          : appLang === 'es' 
                          ? 'El Proyecto OBem AI nace de la necesidad de devolver autonomía al hacer las compras a personas hipertensas, celíacas, diabéticas y con alergias severas, reduciendo la brecha de comprensión de etiquetas impresas.' 
                          : 'O Projeto OBem AI nasceu de uma necessidade social latente: devolver segurança e total autonomia no momento das compras para mães atípicas, hipertensos, diabéticos, celíacos e alérgicos severos, decodificando com IA aqueles ingredientes perigosos camuflados em letras miúdas.'}
                      </p>
                    </section>

                    <section className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Globe size={14} className="text-blue-500" />
                        {appLang === 'en' ? 'Scientific & Regulatory References' : appLang === 'es' ? 'Referencias Científicas' : 'Referências e Limiares Científicos'}
                      </h4>
                      <p>
                        {appLang === 'en'
                          ? 'The safety evaluation filters are structured based on strict global regulatory parameters established by food safety organizations, including:'
                          : appLang === 'es'
                          ? 'La evaluación e identificación de alérgenos y aditivos se realiza cruzando datos con los parámetros oficiales de:'
                          : 'A identificações de aditivos perigosos, excesso de conservantes ou alérgenos camuflados nesta plataforma são baseadas em pesquisas bibliográficas e diretrizes estabelecidas de:'}
                      </p>
                      <ul className="list-disc list-inside space-y-1 pl-1 ml-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        <li><strong>ANVISA</strong> (Agência Nacional de Vigilância Sanitária - RDC 727/2022)</li>
                        <li><strong>WHO/OMS</strong> (World Health Organization - Sodium Intake Limits)</li>
                        <li><strong>FDA</strong> (U.S. Food and Drug Administration Standards)</li>
                        <li><strong>SBD/SBC</strong> (Sociedade Brasileira de Diabetes e de Cardiologia)</li>
                        <li>
                          <a 
                            href="https://single-market-economy.ec.europa.eu/sectors/cosmetics/cosmetic-ingredient-database_en" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            <strong>CosIng / European Commission</strong> (Cosmetic Ingredient Database)
                          </a>
                        </li>
                      </ul>
                    </section>

                    {/* Critical Health Warning Container - High Contrast Accent */}
                    <div className="bg-rose-50/70 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-2xl p-4 flex gap-3 text-rose-800 dark:text-rose-300">
                      <ShieldAlert size={20} className="text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <h5 className="font-extrabold uppercase text-[10px] tracking-wide mb-1 flex items-center gap-1">
                          {appLang === 'en' ? 'Critical Health Disclaimer' : appLang === 'es' ? 'Descargo de Responsabilidad Médica' : 'Aviso Crítico de Saúde e Caráter Educativo'}
                        </h5>
                        <p className="text-[11px] leading-relaxed font-sans">
                          {appLang === 'en'
                            ? 'OBem AI is an informational tool aiming for cognitive aid. It DOES NOT substitute, in any circumstance, qualified medical diagnosis, nutritionist guidelines, or manufacturer label instructions.'
                            : appLang === 'es'
                            ? 'Este software es de carácter educativo e informativo. NO sustituye bajo ninguna circunstancia el consejo médico profesional ni la lectura directa de las advertencias físicas del fabricante.'
                            : 'O Projeto OBem AI é uma aplicação puramente informativa de suporte cognitivo acelerado. Ele NÃO substitui, sob nenhuma circunstância, a consulta a um médico clínico, o diagnóstico profissional por especialistas, a prescrição de nutricionistas ou a devida leitura direta das embalagens físicas dos fabricantes.'}
                        </p>
                      </div>
                    </div>

                    {/* Donation & Collaboration Call to Action */}
                    <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/15 dark:from-amber-950/20 dark:to-orange-950/25 border border-amber-100 dark:border-amber-900/20 rounded-2xl p-4 space-y-3.5 shadow-sm text-slate-800 dark:text-slate-200">
                      <div className="flex items-start gap-2.5">
                        <Gift size={20} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 animate-bounce" />
                        <div>
                          <h5 className="font-extrabold text-[11px] uppercase tracking-wider text-amber-800 dark:text-amber-300 leading-none mb-1">
                            {appLang === 'en' ? 'Support the Project: Solidarity Donation' : appLang === 'es' ? 'Donación Solidaria Colectiva' : 'Colaboração com Doação Solidária'}
                          </h5>
                          <p className="text-[11px] leading-relaxed text-slate-600 dark:text-amber-200/80">
                            {appLang === 'en'
                              ? 'To keep processing OCR labels safely, pay cloud storage fees, and maintain search engines for vulnerable communities, we rely on spontaneous support.'
                              : appLang === 'es'
                              ? 'Para continuar procesando imágenes mediante IA avanzada, almacenar registros clínicos de forma segura y libre de anuncios, dependemos de donaciones comunitárias.'
                              : 'Para manter o aplicativo OBem AI ativo no ar, custear o poder computacional de inteligência artificial de alta qualidade e expandi-lo sem anúncios comerciais, convidamos você a colaborar.'}
                          </p>
                        </div>
                      </div>

                      <div className="p-3 bg-white/70 dark:bg-slate-900/60 rounded-xl space-y-2 border border-amber-200/30">
                        <p className="text-xs font-bold text-center text-amber-900 dark:text-amber-200">
                          {appLang === 'en' ? '🎁 Activating Premium Tier Features!' : appLang === 'es' ? '🎁 ¡Habilitando Beneficios Premium!' : '🎁 Ative Benefícios Premium temporários!'}
                        </p>
                        <p className="text-[10px] text-center text-slate-500 dark:text-slate-400">
                          {appLang === 'en'
                            ? 'Solidary donators temporarily unlock instant OCR reads, extra clinical slots, advanced searching, and voice assistants.'
                            : appLang === 'es'
                            ? 'Los donantes solidarios obtienen temporalmente búsquedas ilimitadas, más perfiles familiares y lectura por voz.'
                            : 'Doadores solidários ganham leituras ilimitadas de OCR, maior cota de busca do catálogo, mais perfis clínicos familiares simultâneos e voz por sintetização ativa.'}
                        </p>

                        {/* Presets Grid */}
                        <div className="grid grid-cols-3 gap-2 pt-2">
                          {[10, 20, 50].map((val) => (
                            <button
                              key={val}
                              onClick={() => setSelectedDonationAmount(val)}
                              className={cn(
                                "py-2 px-1 rounded-lg font-black text-xs border transition-all text-center",
                                selectedDonationAmount === val 
                                  ? "bg-amber-500 border-amber-600 text-white shadow-sm" 
                                  : "bg-slate-50 dark:bg-slate-800 border-slate-205 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-amber-950/20"
                              )}
                            >
                              R$ {val},00
                            </button>
                          ))}
                        </div>

                        {/* Trigger button */}
                        <button
                          onClick={() => setDonationStep('pix')}
                          className="w-full mt-2.5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-transform"
                        >
                          <Heart size={14} className="fill-white" />
                          {appLang === 'en' ? `Donate R$ ${selectedDonationAmount},00` : appLang === 'es' ? `Donar R$ ${selectedDonationAmount},00` : `Colaborar com R$ ${selectedDonationAmount},00`}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {donationStep === 'pix' && (
                  <div className="space-y-4 py-3 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/40 text-amber-600 rounded-2xl flex items-center justify-center">
                      <Gift size={24} className="animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-800 dark:text-white">
                        {appLang === 'en' ? 'Solidarity Pix Copy & Paste' : appLang === 'es' ? 'Copia y Pega tu Pix Solidario' : 'Pix Solidário Gerado'}
                      </h4>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                        {appLang === 'en' ? `Support OBem AI with a donation of R$ ${selectedDonationAmount},00` : appLang === 'es' ? `Apoya el app con una donación de R$ ${selectedDonationAmount},00` : `Obrigado por ajudar com sua contribuição de R$ ${selectedDonationAmount},00`}
                      </p>
                    </div>

                    {/* QR Code Simulation container */}
                    <div className="p-3 bg-white rounded-2xl border border-slate-100 flex items-center justify-center w-36 h-36 shadow-sm">
                      <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900">
                        {/* Styled simulated QR Code */}
                        <path fill="currentColor" d="M10,10 h20 v20 h-20 z M15,15 h10 v10 h-10 z M70,10 h20 v20 h-20 z M75,15 h10 v10 h-10 z M10,70 h20 v20 h-20 z M15,75 h10 v10 h-10 z M40,20 h10 v10 h-10 z M50,40 h15 v5 h-15 z M45,45 h5 v15 h-5 z M50,55 h10 v10 h-10 z M40,65 h10 v15 h-10 z M65,70 h15 v5 h-15 z M70,75 h10 v15 h-10 z M55,30 h10 v10 h-10 z" />
                      </svg>
                    </div>

                    {/* Copy Key Box */}
                    <div className="w-full max-w-sm space-y-2">
                      <p className="text-[10px] text-left uppercase font-extrabold tracking-wider text-slate-400 dark:text-slate-500 pl-1 leading-none">Chave Pix Copia e Cola</p>
                      <div className="flex gap-2 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-150 dark:border-white/10 rounded-xl items-center justify-between">
                        <span className="text-[10px] font-mono select-all truncate text-slate-700 dark:text-slate-300 pl-2">
                          pix-solidario-{selectedDonationAmount}rs-obem-ai-studio@obem.ai.br
                        </span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(`pix-solidario-${selectedDonationAmount}rs-obem-ai-studio@obem.ai.br`);
                            setPixCopied(true);
                            setTimeout(() => setPixCopied(false), 2000);
                          }}
                          className="p-2 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-200 hover:text-blue-500 rounded-lg hover:shadow-sm flex items-center gap-1 leading-none shrink-0"
                          title="Copiar Pix"
                        >
                          <Copy size={12} />
                          <span className="text-[9px] font-bold uppercase">{pixCopied ? 'Copiado!' : 'Copiar'}</span>
                        </button>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-sans max-w-xs px-2">
                      {appLang === 'en'
                        ? 'This is a secure simulation for community support in the AI Studio workspace. Confirming triggers the celebratory success modal.'
                        : appLang === 'es'
                        ? 'Esta es una simulación de recaudación comunitaria. Al confirmar se activarán los privilegios premium en este navegador.'
                        : 'Esta ferramenta simula de forma fidedigna o recebimento da doação de caridade no ecossistema e habilita as funções estendidas neste navegador e conta.'}
                    </p>

                    {/* Actions */}
                    <div className="w-full grid grid-cols-2 gap-3 pt-2">
                      <button
                        onClick={() => setDonationStep('info')}
                        className="py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-755 text-slate-600 dark:text-slate-300 font-bold rounded-xl text-xs transition-colors"
                      >
                        {appLang === 'en' ? 'Back' : appLang === 'es' ? 'Volver' : 'Atrás / Voltar'}
                      </button>
                      <button
                        onClick={() => {
                          localStorage.setItem('projeto_obem_ai_premium', 'true');
                          setIsPremium(true);
                          setDonationStep('success');
                        }}
                        className="py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:brightness-110 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1 shadow-md shadow-emerald-600/10 active:scale-95 transition-transform"
                      >
                        <CheckCircle2 size={14} />
                        {appLang === 'en' ? 'Confirm Donation' : appLang === 'es' ? 'Confirmar Donación' : 'Registrar Doação'}
                      </button>
                    </div>
                  </div>
                )}

                {donationStep === 'success' && (
                  <div className="space-y-4 py-5 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-yellow-400 text-white rounded-full flex items-center justify-center shadow-lg shadow-amber-500/25 animate-bounce">
                      <Sparkles size={32} />
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="text-base font-black text-slate-800 dark:text-white uppercase tracking-tight">
                        {appLang === 'en' ? 'Thank You So Much!' : appLang === 'es' ? '¡Muchísimas Gracias!' : 'Muito Obrigado pelo Apoio!'}
                      </h4>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-black">
                        {appLang === 'en' ? '✨ Solidarity Premium Unlocked' : appLang === 'es' ? '✨ Premium Solidario Desbloqueado' : '✨ Recursos Premium Solidário Ativados!'}
                      </p>
                    </div>

                    <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 max-w-sm">
                      {appLang === 'en'
                        ? 'Awesome! Your donation simulation was registered successfully. You have unlocked unlimited scans, faster advanced OCR search logic, and the special golden supporter badge.'
                        : appLang === 'es'
                        ? '¡Fantástico! Registramos la donación con éxito. Se han activado escaneos de OCR de alta prioridad, perfiles ilimitados y el sello dorado de patrocinador en tu cuenta.'
                        : 'Parabéns! Sua ação solidária foi registrada com sucesso no sistema. Já liberamos velocidade máxima de leitura do OCR, maior capacidade de busca e o selo dourado de apoiador premium que brilha em seu cabeçalho.'}
                    </p>

                    <button
                      onClick={() => setAboutOpen(false)}
                      className="w-full max-w-xs py-3 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl text-xs shadow-md shadow-blue-600/10 active:scale-95 transition-all"
                    >
                      {appLang === 'en' ? 'Close & Access Premium' : appLang === 'es' ? 'Cerrar y Disfrutar' : 'Concluir e Explorar App'}
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom bar of modal (Close actions) */}
              {donationStep !== 'success' && (
                <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-800/20 text-center text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                  Projeto OBem AI v1.0.0 Alpha • {appLang === 'en' ? 'Community Driven AI Tools' : appLang === 'es' ? 'Solidaridad Digital Familiar' : 'Parceria Solidária Digital'}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL DE EDIÇÃO DE CONTA, SEGURANÇA E FATURAMENTO */}
      <AnimatePresence>
        {accountEditOpen && (
          <AccountEditModal
            isOpen={accountEditOpen}
            onClose={() => setAccountEditOpen(false)}
            appUser={appUser}
            appLang={appLang}
            onUpdateUser={updateAppUser}
          />
        )}
      </AnimatePresence>

      {/* MODAL DE SUPORTE E AJUDA */}
      <AnimatePresence>
        {supportOpen && (
          <SupportModal
            isOpen={supportOpen}
            onClose={() => setSupportOpen(false)}
            appUser={appUser}
            appLang={appLang}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
