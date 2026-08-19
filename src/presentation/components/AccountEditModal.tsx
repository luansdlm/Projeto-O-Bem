import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  User, 
  Mail, 
  Lock, 
  Phone, 
  Globe, 
  CreditCard, 
  Save, 
  AlertTriangle, 
  CheckCircle2, 
  Eye, 
  EyeOff,
  ShieldAlert
} from 'lucide-react';
import { auth } from '../../lib/firebase';
import { updateEmail, updatePassword } from 'firebase/auth';
import { AppUser } from '../../domain/entities/user';
import { cn } from '../../lib/utils';

// Credit card brand detector helper
const getCardType = (num: string) => {
  const clean = num.replace(/\D/g, '');
  if (clean.startsWith('4')) return 'visa';
  if (/^5[1-5]/.test(clean)) return 'mastercard';
  if (/^3[47]/.test(clean)) return 'amex';
  return 'generic';
};

interface AccountEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  appUser: AppUser | null;
  appLang: string;
  onUpdateUser: (updatedData: Partial<AppUser>) => Promise<void>;
}

export const AccountEditModal: React.FC<AccountEditModalProps> = ({
  isOpen,
  onClose,
  appUser,
  appLang,
  onUpdateUser
}) => {
  // Tabs
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'payment'>('profile');

  // Fields and States
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [alternativeEmail, setAlternativeEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [nationality, setNationality] = useState('');
  
  // Security
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Billing / Credit Card
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardFocused, setCardFocused] = useState(false);

  // Utility states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Load current values
  useEffect(() => {
    if (appUser) {
      setFullName(appUser.fullName || '');
      setEmail(appUser.email || '');
      setAlternativeEmail(appUser.alternativeEmail || '');
      setPhone(appUser.phone || '');
      setNationality(appUser.nationality || '');

      // Load fake billing mock from localstorage to make it feel real
      const mockBilling = localStorage.getItem(`billing_${appUser.uid}`);
      if (mockBilling) {
        try {
          const parsed = JSON.parse(mockBilling);
          setCardNumber(parsed.cardNumber || '');
          setCardName(parsed.cardName || '');
          setCardExpiry(parsed.cardExpiry || '');
          setCardCvv(parsed.cardCvv || '');
        } catch (_) {}
      } else {
        // default mock values for display so the card isn't empty
        setCardNumber('4000 1234 5678 9010');
        setCardName(appUser.fullName || 'CARDHOLDER NAME');
        setCardExpiry('12/29');
        setCardCvv('123');
      }
    }
  }, [appUser, isOpen]);

  if (!isOpen) return null;

  // Language Dictionary
  const dict: Record<string, Record<string, string>> = {
    title: {
      pt: "Editar Conta e Assinatura",
      en: "Edit Account & Subscription",
      es: "Editar Cuenta y Suscripción"
    },
    tabProfile: {
      pt: "Dados Pessoais",
      en: "Personal Data",
      es: "Datos Personales"
    },
    tabSecurity: {
      pt: "Segurança & Tráfego",
      en: "Security",
      es: "Seguridad"
    },
    tabPayment: {
      pt: "Faturamento & Pro",
      en: "Billing & Pro",
      es: "Facturación y Pro"
    },
    fullNameField: {
      pt: "Nome Completo",
      en: "Full Name",
      es: "Nombre Completo"
    },
    emailField: {
      pt: "E-mail Principal",
      en: "Primary Email",
      es: "Correo Principal"
    },
    recoveryEmailField: {
      pt: "E-mail de Recuperação",
      en: "Recovery Email",
      es: "Correo de Recuperación"
    },
    phoneField: {
      pt: "Celular / Telefone",
      en: "Security Phone",
      es: "Teléfono / Celular"
    },
    nationalityField: {
      pt: "Nacionalidade",
      en: "Nationality",
      es: "Nacionalidad"
    },
    newPasswordField: {
      pt: "Nova Senha (deixe em branco se não desejar alterar)",
      en: "New Password (leave blank to keep current)",
      es: "Nueva Contraseña (dejar en blanco para mantener actual)"
    },
    saveBtn: {
      pt: "Salvar Alterações",
      en: "Save Changes",
      es: "Guardar Cambios"
    },
    saving: {
      pt: "Aguarde, salvando...",
      en: "Saving, please wait...",
      es: "Guardando, por favor espere..."
    },
    recentLoginWarning: {
      pt: "Por segurança de dados, mudar E-mail ou Senha pode exigir reautenticação recente.",
      en: "For security reasons, changing Email or Password may require recent log in.",
      es: "Por razones de seguridad, cambiar Email o Contraseña puede requerir reinicio de sesión."
    },
    proPlanTitle: {
      pt: "Seu Plano Premium Projeto OBem AI",
      en: "Your Projeto OBem AI Pro Plan",
      es: "Su Plan Premium Projeto OBem AI"
    },
    proPlanDesc: {
      pt: "Ativo e coberto pelo faturamento Pro Internacional em dia.",
      en: "Active globally, covered by international Pro billing.",
      es: "Activo y con facturación internacional pro al día."
    },
    cardNameLabel: {
      pt: "Nome no Cartão",
      en: "Name on Card",
      es: "Nombre en Tarjeta"
    },
    cardNumberLabel: {
      pt: "Número do Cartão",
      en: "Card Number",
      es: "Número de Tarjeta"
    },
    cardExpiryLabel: {
      pt: "Validade",
      en: "Expiration Date",
      es: "Vencimiento"
    },
    successMsgAll: {
      pt: "Cadastro, senha e pagamento sincronizados com sucesso!",
      en: "Profile, password, and billing synchronized successfully!",
      es: "¡Perfil, contraseña y facturación sincronizados con éxito!"
    }
  };

  const getLabel = (key: string) => {
    const lang = (appLang || 'pt').substring(0, 2).toLowerCase();
    const trans = dict[key];
    if (trans) {
      return trans[lang] || trans['pt'] || key;
    }
    return key;
  };

  // Mask Inputs
  const handleCardNumberChange = (value: string) => {
    const rawDigits = value.replace(/\D/g, '').substring(0, 16);
    const formatted = rawDigits.match(/.{1,4}/g)?.join(' ') || rawDigits;
    setCardNumber(formatted);
  };

  const handleExpiryChange = (value: string) => {
    const raw = value.replace(/\D/g, '').substring(0, 4);
    if (raw.length > 2) {
      setCardExpiry(`${raw.substring(0, 2)}/${raw.substring(2)}`);
    } else {
      setCardExpiry(raw);
    }
  };

  const handlePhoneChange = (value: string) => {
    // Basic formatting
    setPhone(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("Usuário não autenticado");

      // 1. If Password changed
      if (password.trim().length > 0) {
        if (password.trim().length < 6) {
          throw new Error(
            appLang === 'en' ? "Password must exceed 6 letters" :
            appLang === 'es' ? "La contraseña debe superar los 6 caracteres" :
            "A nova senha precisa ter pelo menos 6 caracteres"
          );
        }
        try {
          await updatePassword(currentUser, password.trim());
        } catch (pwError: any) {
          console.error(pwError);
          if (pwError.code === 'auth/requires-recent-login') {
            throw new Error(
              appLang === 'en' ? "Sensitive change requires logging in again prior to modification." :
              appLang === 'es' ? "Cambio sensible requiere ingresar credenciales nuevamente." :
              "Por segurança, esta alteração sensível exige que você faça login novamente antes de prosseguir."
            );
          }
          throw pwError;
        }
      }

      // 2. If Email changed in the input, try modifying in firebase auth
      const originalEmail = appUser?.email || currentUser.email || '';
      if (email.trim().toLowerCase() !== originalEmail.trim().toLowerCase()) {
        try {
          await updateEmail(currentUser, email.trim().toLowerCase());
        } catch (emailError: any) {
          console.error(emailError);
          if (emailError.code === 'auth/requires-recent-login') {
            throw new Error(
              appLang === 'en' ? "Sensitive change requires logging in again prior to modification." :
              appLang === 'es' ? "Cambio sensible requiere ingresar credenciales de nuevo." :
              "Por segurança, a alteração do e-mail exige que você faça login novamente antes de trocar."
            );
          }
          throw emailError;
        }
      }

      // 3. Update Firestore fields
      await onUpdateUser({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        alternativeEmail: alternativeEmail.trim().toLowerCase(),
        phone: phone.trim(),
        nationality: nationality.trim(),
      });

      // 4. Update Billing locally
      const billingData = {
        cardNumber,
        cardName,
        cardExpiry,
        cardCvv
      };
      localStorage.setItem(`billing_${currentUser.uid}`, JSON.stringify(billingData));

      // Show success
      setSuccessMsg(getLabel('successMsgAll'));
      setPassword(''); // clear password field
      setTimeout(() => {
        onClose();
        setSuccessMsg(null);
      }, 2500);

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Erro ao atualizar dados.");
    } finally {
      setLoading(false);
    }
  };

  const cardType = getCardType(cardNumber);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Main card panel */}
      <motion.div 
        initial={{ scale: 0.95, y: 15, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 15, opacity: 0 }}
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden shadow-2xl border border-slate-100 dark:border-white/10 z-50 max-h-[90vh] flex flex-col font-sans"
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/40 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h2 className="text-md font-bold text-slate-800 dark:text-white">{getLabel('title')}</h2>
              <p className="text-xs text-slate-500 font-extrabold tracking-wide uppercase">Projeto OBem AI Global Pro</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/30 px-4 pt-2">
          {[
            { id: 'profile', label: getLabel('tabProfile'), icon: <User size={14} /> },
            { id: 'security', label: getLabel('tabSecurity'), icon: <Lock size={14} /> },
            { id: 'payment', label: getLabel('tabPayment'), icon: <CreditCard size={14} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-3.5 text-xs font-bold transition-all border-b-2 -mb-[1px]",
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-2xl flex items-start gap-2.5 text-red-600 dark:text-red-400 text-xs font-medium leading-relaxed">
              <AlertTriangle size={16} className="shrink-0 mt-0.5 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl flex items-start gap-2.5 text-emerald-600 dark:text-emerald-400 text-xs font-medium leading-relaxed">
              <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-500" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: DADOS PESSOAIS */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  {getLabel('fullNameField')}
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-150 dark:border-white/5 rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 transition-all font-semibold outline-none text-sm text-slate-800 dark:text-slate-100"
                    placeholder="João Silva"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  {getLabel('emailField')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-150 dark:border-white/5 rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 transition-all font-semibold outline-none text-sm text-slate-800 dark:text-slate-100"
                    placeholder="exemplo@gmail.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  {getLabel('recoveryEmailField')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={alternativeEmail}
                    onChange={(e) => setAlternativeEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-150 dark:border-white/5 rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 transition-all font-semibold outline-none text-sm text-slate-800 dark:text-slate-100"
                    placeholder="recuperacao@gmail.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  {getLabel('phoneField')}
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-150 dark:border-white/5 rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 transition-all font-semibold outline-none text-sm text-slate-800 dark:text-slate-100"
                    placeholder="+55 11 99999-9999"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  {getLabel('nationalityField')}
                </label>
                <div className="relative">
                  <Globe className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-150 dark:border-white/5 rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 transition-all font-semibold outline-none text-sm text-slate-800 dark:text-slate-100"
                    placeholder="Brasileira"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SEGURANÇA */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-2xl text-amber-700 dark:text-amber-400 text-xs flex gap-2.5 leading-normal">
                <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                <p>{getLabel('recentLoginWarning')}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  {getLabel('newPasswordField')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-150 dark:border-white/5 rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 transition-all font-semibold outline-none text-sm text-slate-800 dark:text-slate-100"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FATURAMENTO & PRO */}
          {activeTab === 'payment' && (
            <div className="space-y-6">
              {/* PLAN SUMMARY */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-5 rounded-3xl text-white shadow-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full">
                    {appLang === 'en' ? 'Active Plan' : appLang === 'es' ? 'Plan Activo' : 'PlanoAtivo'}
                  </span>
                  <span className="text-xs font-bold text-emerald-350">
                    {appLang === 'en' ? '● In Day / Premium' : appLang === 'es' ? '● Al Día' : '● Pago em Dia'}
                  </span>
                </div>
                <h3 className="text-lg font-black">{getLabel('proPlanTitle')}</h3>
                <p className="text-xs text-blue-100">{getLabel('proPlanDesc')}</p>
              </div>

              {/* DYNAMIC CARD DISPLAY (INTEGRATION DESIGN ARTWORK) */}
              <div className="perspective-1000 flex justify-center py-2 h-[170px]">
                <div className="relative w-full max-w-[340px] h-full bg-slate-950 dark:bg-slate-950/80 rounded-[22px] p-5 text-white flex flex-col justify-between shadow-xl border border-white/10 overflow-hidden font-mono text-sm">
                  {/* Card Background accents */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

                  {/* Toprow chip & brand */}
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="w-10 h-7 bg-amber-400/80 rounded-md shadow-md border border-amber-300 flex items-center justify-center pointer-events-none">
                        <div className="grid grid-cols-3 gap-[1px] w-full px-1">
                          <div className="h-3 bg-amber-600/20 rounded" />
                          <div className="h-3 bg-amber-600/20 rounded" />
                          <div className="h-3 bg-amber-600/20 rounded" />
                        </div>
                      </div>
                      <span className="text-xs tracking-normal font-sans text-slate-400 uppercase font-bold">Projeto OBem AI SECURE</span>
                    </div>
                    {/* Brand icon representation */}
                    <div className="flex items-center gap-1.5 font-sans font-black text-xs italic tracking-tighter">
                      {cardType === 'visa' && <span className="text-blue-400 text-sm font-bold">VISA</span>}
                      {cardType === 'mastercard' && <span className="text-orange-400 text-sm font-bold">MasterCard</span>}
                      {cardType === 'amex' && <span className="text-teal-400 text-sm font-bold">AMEX</span>}
                      {cardType === 'generic' && <span className="text-slate-400 text-sm font-bold">CARD</span>}
                    </div>
                  </div>

                  {/* Card values info dynamic */}
                  <div className="space-y-4">
                    <div className="text-base tracking-[0.16em] text-slate-200">
                      {cardNumber || '•••• •••• •••• ••••'}
                    </div>

                    <div className="flex justify-between items-end">
                      <div className="space-y-0.5">
                        <div className="text-xs text-slate-405 font-sans uppercase font-extrabold tracking-wider">HOLDER</div>
                        <div className="text-xs uppercase font-semibold tracking-wide text-slate-100 truncate max-w-[180px]">
                          {cardName || 'CARDHOLDER NAME'}
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="space-y-0.5">
                          <div className="text-xs text-slate-405 font-sans uppercase font-extrabold tracking-wider">EXPIRY</div>
                          <div className="text-xs font-semibold text-slate-100">
                            {cardExpiry || '12/29'}
                          </div>
                        </div>

                        <div className="space-y-0.5">
                          <div className="text-xs text-slate-405 font-sans uppercase font-extrabold tracking-wider">CVV</div>
                          <div className="text-xs font-semibold text-slate-100">
                            {'•••'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD FORM FIELDS */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    {getLabel('cardNameLabel')}
                  </label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-150 dark:border-white/5 rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 transition-all font-semibold outline-none text-sm text-slate-800 dark:text-slate-100"
                    placeholder="CARLOS R SILVA"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    {getLabel('cardNumberLabel')}
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => handleCardNumberChange(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-150 dark:border-white/5 rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 transition-all font-semibold outline-none text-sm text-slate-800 dark:text-slate-100"
                    placeholder="4000 1234 5678 9010"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    {getLabel('cardExpiryLabel')}
                  </label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => handleExpiryChange(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-150 dark:border-white/5 rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 transition-all font-semibold outline-none text-sm text-slate-800 dark:text-slate-100"
                    placeholder="MM/AA"
                    maxLength={5}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    CVV
                  </label>
                  <input
                    type="password"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').substring(0, 4))}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-150 dark:border-white/5 rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 transition-all font-semibold outline-none text-sm text-slate-800 dark:text-slate-100"
                    placeholder="123"
                    maxLength={4}
                  />
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Footer actions */}
        <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold rounded-2xl text-xs transition-colors"
          >
            {appLang === 'en' ? 'Cancel' : appLang === 'es' ? 'Cancelar' : 'Cancelar'}
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-2xl text-xs shadow-lg shadow-blue-500/10 flex items-center gap-2 transition-all"
          >
            {loading ? (
              <span>{getLabel('saving')}</span>
            ) : (
              <>
                <Save size={14} />
                <span>{getLabel('saveBtn')}</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
