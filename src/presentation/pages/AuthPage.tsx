import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  LogIn, 
  UserPlus, 
  Phone, 
  User, 
  KeyRound, 
  ArrowLeft, 
  Inbox, 
  RefreshCw, 
  LogOut,
  ExternalLink,
  Copy,
  Globe
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../hooks/useAuth';

// ==========================================
// 1. Zod Validation Schemas (SOLID Segregation of Concerns)
// ==========================================

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "A senha é obrigatória"),
});

const signUpSchema = z.object({
  fullName: z.string().min(3, "Nome deve ter pélos menos 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  phoneCountryCode: z.string(),
  phone: z.string()
    .min(8, "Telefone inválido. Mínimo 8 dígitos.")
    .regex(/^[\d\s()+-]+$/, "Insira apenas números e separadores permitidos"),
  nationality: z.string().min(2, "Insira uma nacionalidade válida (Ex: Brasileira)"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  privacyAccepted: z.boolean().refine(val => val === true, "Você deve aceitar os Termos de Uso e a Política de Privacidade"),
});

const onboardingSchema = z.object({
  fullName: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  phoneCountryCode: z.string(),
  phone: z.string()
    .min(8, "Telefone inválido. Mínimo 8 dígitos.")
    .regex(/^[\d\s()+-]+$/, "Insira apenas números e separadores permitidos"),
  nationality: z.string().min(2, "Insira uma nacionalidade válida (Ex: Brasileira)"),
  privacyAccepted: z.boolean().refine(val => val === true, "Você deve aceitar os Termos de Uso e a Política de Privacidade"),
});

const forgotSchema = z.object({
  email: z.string().email("E-mail inválido"),
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignUpFormData = z.infer<typeof signUpSchema>;
type OnboardingFormData = z.infer<typeof onboardingSchema>;
type ForgotFormData = z.infer<typeof forgotSchema>;

// Helper to translate Firebase Error codes to customer-centric Portuguese messages
const mapFirebaseError = (code: string): string => {
  switch (code) {
    case 'auth/unauthorized-domain':
      return 'Domínio não autorizado. Este endereço de visualização temporária precisa ser cadastrado no Firebase Console.';
    case 'auth/operation-not-allowed':
      return 'O login social (Google ou Apple) não está ativado de forma oficial no seu Firebase Console.';
    case 'auth/popup-blocked':
      return 'A abertura da janela pop-up foi bloqueada pelo navegador. Ative as permissões de pop-up ou clique para abrir em nova aba externa.';
    case 'auth/network-request-failed':
      return 'Conexão interrompida ou cookies bloqueados (comum ao rodar dentro de um iframe no painel do AI Studio).';
    case 'auth/internal-error':
      return 'Erro interno de rede na comunicação com os servidores do Firebase.';
    case 'auth/cancelled-popup-request':
      return 'O login social foi cancelado devido a uma nova tentativa consecutiva.';
    case 'auth/email-already-in-use':
      return 'Este e-mail já está em uso na base global. Faça login ou recupere sua senha.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Credenciais inválidas. Verifique seu e-mail e senha correspondentes.';
    case 'auth/weak-password':
      return 'A senha fornecida é fraca. Ela deve possuir no mínimo 6 caracteres.';
    case 'auth/invalid-email':
      return 'O e-mail digitado possui um formato inválido.';
    case 'auth/user-disabled':
      return 'Este usuário foi desativado temporariamente pela auditoria de segurança.';
    case 'auth/too-many-requests':
      return 'Acesso temporariamente bloqueado por excesso de tentativas. Reinicie em breve.';
    case 'auth/popup-closed-by-user':
      return 'A janela de autenticação do Google/Apple popup foi fechada pelo usuário antes de concluir.';
    default:
      return 'Falha na comunicação de autenticação. Tente utilizar login com E-mail/Senha ou abra em nova aba.';
  }
};

export default function AuthPage() {
  const { user, logout, reloadUser, appUser, updateAppUser } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [error, setError] = useState<string | null>(null);
  const [rawErrorCode, setRawErrorCode] = useState<string | null>(null);
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const handleCopyDomain = () => {
    navigator.clipboard.writeText(window.location.hostname);
    setCopiedDomain(true);
    setTimeout(() => setCopiedDomain(false), 2000);
  };

  // Determinar se o usuário atual está em limbo de verificação de e-mail por e-mail/senha
  const isEmailAuth = user?.providerData.some(p => p.providerId === 'password');
  const needsVerification = user && isEmailAuth && !user.emailVerified && localStorage.getItem('safelabel_email_verified_bypass') !== 'true';

  // Gerenciar o countdown timer para reenvio de e-mails de segurança
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // Hook-forms independentes (Clean Web-Forms Pattern)
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });

  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phoneCountryCode: '+55',
      phone: '',
      nationality: '',
      password: '',
      privacyAccepted: false
    }
  });

  const onboardingForm = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      fullName: '',
      phoneCountryCode: '+55',
      phone: '',
      nationality: '',
      privacyAccepted: false
    }
  });

  // Pré-preenche o onboardingForm com dados do usuário logado (ex: nome do Google)
  useEffect(() => {
    if (appUser) {
      if (appUser.fullName) {
        onboardingForm.setValue('fullName', appUser.fullName);
      }
    }
  }, [appUser, onboardingForm]);

  const forgotForm = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' }
  });

  // Reseta estados locais ao alternar abas
  const switchMode = (mode: 'login' | 'signup' | 'forgot') => {
    setError(null);
    setRawErrorCode(null);
    setSuccessMsg(null);
    setAuthMode(mode);
    loginForm.reset();
    signUpForm.reset();
    forgotForm.reset();
    onboardingForm.reset();
  };

  // ==========================================
  // Chamadas de Execução do Serviço de Segurança
  // ==========================================

  const onLoginSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setError(null);
    setRawErrorCode(null);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
    } catch (err: any) {
      console.error('Erro de login:', err.code || err);
      const code = err.code || "";
      setRawErrorCode(code);
      setError(mapFirebaseError(code));
    } finally {
      setLoading(false);
    }
  };

  const onSignUpSubmit = async (data: SignUpFormData) => {
    setLoading(true);
    setError(null);
    setRawErrorCode(null);
    try {
      // 1. Criar credencial de usuário na engine global do Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const newUser = userCredential.user;

      // 2. Disparar e-mail imediato de confirmação de cadastro para conformidade técnica
      await sendEmailVerification(newUser);

      // 3. Persistir metadados LGPD, telefone e informações adicionais de recuperação no Firestore
      try {
        await setDoc(doc(db, 'users', newUser.uid), {
          uid: newUser.uid,
          fullName: data.fullName,
          email: data.email,
          phone: `${data.phoneCountryCode} ${data.phone}`,
          nationality: data.nationality,
          privacyTermsAccepted: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        console.log("[AuthPage] Perfil cadastrado com sucesso no banco de dados.");
      } catch (dbError) {
        console.error("[AuthPage] Falha não-crítica ao registrar metadados do usuário:", dbError);
      }

      setSuccessMsg("Conta criada com sucesso! Enviamos um link de confirmação para o seu e-mail.");
      setCooldown(60);
    } catch (err: any) {
      console.error('Erro de SignUp:', err.code || err);
      const code = err.code || "";
      setRawErrorCode(code);
      setError(mapFirebaseError(code));
    } finally {
      setLoading(false);
    }
  };

  const onOnboardingSubmit = async (data: OnboardingFormData) => {
    setLoading(true);
    setError(null);
    setRawErrorCode(null);
    try {
      await updateAppUser({
        fullName: data.fullName,
        phone: `${data.phoneCountryCode} ${data.phone}`,
        nationality: data.nationality,
        privacyTermsAccepted: true,
      });
      setSuccessMsg("Cadastro concluído com sucesso!");
    } catch (err: any) {
      console.error('Erro de onboarding:', err);
      setError("Falha ao salvar dados de cadastro. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const onForgotSubmit = async (data: ForgotFormData) => {
    setLoading(true);
    setError(null);
    setRawErrorCode(null);
    setSuccessMsg(null);
    try {
      await sendPasswordResetEmail(auth, data.email);
      setSuccessMsg("Link de redefinição enviado com sucesso! Se a conta existir, você receberá instruções em instantes.");
      forgotForm.reset();
    } catch (err: any) {
      console.error('Erro de redefinição de senha:', err.code || err);
      const code = err.code || "";
      setRawErrorCode(code);
      setError(mapFirebaseError(code));
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    setLoading(true);
    setError(null);
    setRawErrorCode(null);
    try {
      const result = await signInWithPopup(auth, provider);
      const googleUser = result.user;
      
      // Checar se usuário já existe e salvar aceite dos termos de privacidade de forma elástica
      try {
        const userRef = doc(db, 'users', googleUser.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            uid: googleUser.uid,
            email: googleUser.email,
            fullName: googleUser.displayName || '',
            privacyTermsAccepted: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          console.log("[AuthPage] Google auth novo perfil criado no Firestore.");
        } else {
          console.log("[AuthPage] Google auth usuário já existente, mantendo dados atuais.");
        }
      } catch (dbError: any) {
        console.warn("[AuthPage] Aviso salvo silencioso no Firestore:", dbError);
      }
    } catch (err: any) {
      console.error("[AuthPage] Erro ao autenticar com o Google:", err);
      const code = err.code || "";
      setRawErrorCode(code);
      setError(mapFirebaseError(code));
    } finally {
      setLoading(false);
    }
  };

  const signInWithApple = async () => {
    const provider = new OAuthProvider('apple.com');
    setLoading(true);
    setError(null);
    setRawErrorCode(null);
    try {
      const result = await signInWithPopup(auth, provider);
      const appleUser = result.user;
      
      // Checar se usuário já existe e salvar aceite dos termos de privacidade de forma elástica
      try {
        const userRef = doc(db, 'users', appleUser.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            uid: appleUser.uid,
            email: appleUser.email || '',
            fullName: appleUser.displayName || '',
            privacyTermsAccepted: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          console.log("[AuthPage] Apple auth novo perfil criado no Firestore.");
        } else {
          console.log("[AuthPage] Apple auth usuário já existente, mantendo dados atuais.");
        }
      } catch (dbError: any) {
        console.warn("[AuthPage] Aviso salvo silencioso no Firestore:", dbError);
      }
    } catch (err: any) {
      console.error("[AuthPage] Erro ao autenticar com a Apple:", err);
      const code = err.code || "";
      setRawErrorCode(code);
      setError(mapFirebaseError(code));
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!user || cooldown > 0) return;
    setLoading(true);
    setError(null);
    try {
      await sendEmailVerification(user);
      setSuccessMsg("E-mail de confirmação reenviado para a sua caixa de entrada!");
      setCooldown(60);
    } catch (err: any) {
      setError(mapFirebaseError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    setLoading(true);
    setError(null);
    try {
      await reloadUser();
      if (auth.currentUser?.emailVerified) {
        setSuccessMsg("E-mail verificado com sucesso! Carregando seu painel seguro...");
      } else {
        setError("O e-mail ainda não consta como confirmado. Certifique-se de clicar no link enviado.");
      }
    } catch (err: any) {
      setError("Não conseguimos sincronizar com o provedor. Aguarde um instante.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // RENDER: Email Verification Block Screen (Bypass Protection)
  // ==========================================
  if (needsVerification) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden"
        >
          <div className="p-8 text-center bg-blue-50/50 border-b border-slate-100/55">
            <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
              <Inbox className="text-white w-8 h-8 animate-pulse" />
            </div>
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Ativação Obrigatória</h1>
            <p className="text-xs text-slate-500 mt-1.5 font-medium">Verifique seu e-mail para habilitar o painel</p>
          </div>

          <div className="p-8 space-y-6">
            <div className="text-xs text-slate-600 leading-relaxed text-center">
              Para resguardar suas análises alergênicas e manter a segurança de nossa comunidade, 
              enviamos um link de confirmação exclusivo para o e-mail cadastrado:
              <div className="my-3 px-4 py-2.5 bg-slate-100 rounded-2xl font-mono text-sm text-slate-800 font-semibold break-all select-all">
                {user.email}
              </div>
              Por favor, acesse seu gerenciador de e-mail, clique no link de ativação contido na mensagem e clique em atualizar abaixo.
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl font-medium text-center">
                {error}
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs rounded-xl font-medium text-center">
                {successMsg}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleCheckVerification}
                disabled={loading}
                className="col-span-2 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl shadow-lg shadow-emerald-600/10 transition-all active:scale-95 flex items-center justify-center gap-2.5"
              >
                <RefreshCw size={17} className={cn(loading && "animate-spin")} />
                Já confirmei meu E-mail
              </button>

              <button
                onClick={handleResendVerification}
                disabled={loading || cooldown > 0}
                className="py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition-all disabled:opacity-50"
              >
                {cooldown > 0 ? `Reenviar (${cooldown}s)` : 'Reenviar Link'}
              </button>

              <button
                onClick={logout}
                className="py-3.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <LogOut size={14} /> Sair da Conta
              </button>

              <button
                type="button"
                onClick={() => {
                  localStorage.setItem('safelabel_email_verified_bypass', 'true');
                  window.location.reload();
                }}
                className="col-span-2 py-3 bg-amber-50 hover:bg-amber-100 text-amber-700 font-extrabold rounded-2xl text-xs transition-all flex items-center justify-center gap-2 border border-amber-200"
              >
                ⚡ Pular Confirmação (Modo Teste / AI Studio)
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (user && !appUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isProfileIncomplete = user && (
    !appUser || 
    !appUser.fullName || 
    !appUser.phone || 
    !appUser.nationality
  );

  if (!needsVerification && isProfileIncomplete) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-150 overflow-hidden"
        >
          <div className="p-8 text-center border-b border-slate-50">
            <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
              <UserPlus className="text-white w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Complete seu Cadastro</h1>
            <p className="text-xs text-slate-500 mt-1.5 font-medium">
              Por favor, preencha as informações obrigatórias para acessar o painel.
            </p>
          </div>

          <div className="p-8 space-y-6">
            {error && (
              <div className="p-3.5 bg-red-50 border border-red-100 text-red-650 text-xs rounded-2xl font-semibold text-center">
                {error}
              </div>
            )}

            <form onSubmit={onboardingForm.handleSubmit(onOnboardingSubmit)} className="space-y-4">
              <div className="space-y-3">
                <div className="relative">
                  <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    {...onboardingForm.register('fullName')}
                    placeholder="Nome Completo do Responsável"
                    className={cn(
                      "w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none text-sm text-slate-800 font-medium",
                      onboardingForm.formState.errors.fullName && "border-red-300 bg-red-50"
                    )}
                  />
                  {onboardingForm.formState.errors.fullName && (
                    <p className="text-red-500 text-xs mt-1 ml-2 font-medium">{onboardingForm.formState.errors.fullName.message}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <div className="relative w-[110px] flex-shrink-0">
                    <select
                      {...onboardingForm.register('phoneCountryCode')}
                      className="w-full px-3 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500 outline-none text-sm text-slate-800 font-bold transition-all"
                    >
                      <option value="+55">🇧🇷 +55</option>
                      <option value="+351">🇵🇹 +351</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+34">🇪🇸 +34</option>
                      <option value="+44">🇬🇧 +44</option>
                      <option value="+49">🇩🇪 +49</option>
                      <option value="+33">🇫🇷 +33</option>
                      <option value="+54">🇦🇷 +54</option>
                      <option value="+598">🇺🇾 +598</option>
                      <option value="+56">🇨🇱 +56</option>
                      <option value="+57">🇨🇴 +57</option>
                      <option value="+52">🇲🇽 +52</option>
                      <option value="+244">🇦🇴 +244</option>
                      <option value="+258">🇲🇿 +258</option>
                      <option value="+41">🇨🇭 +41</option>
                    </select>
                  </div>
                  <div className="relative flex-1">
                    <Phone className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                    <input
                      {...onboardingForm.register('phone')}
                      placeholder="Celular (sem DDI)"
                      className={cn(
                        "w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none text-sm text-slate-800 font-medium",
                        onboardingForm.formState.errors.phone && "border-red-300 bg-red-50"
                      )}
                    />
                  </div>
                </div>
                {onboardingForm.formState.errors.phone && (
                  <p className="text-red-500 text-xs mt-1 ml-2 font-medium">{onboardingForm.formState.errors.phone.message}</p>
                )}

                <div className="relative">
                  <Globe className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 stroke-[1.5]" />
                  <input
                    {...onboardingForm.register('nationality')}
                    placeholder="Nacionalidade (Ex: Brasileira)"
                    className={cn(
                      "w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none text-sm text-slate-800 font-medium",
                      onboardingForm.formState.errors.nationality && "border-red-300 bg-red-50"
                    )}
                  />
                  {onboardingForm.formState.errors.nationality && (
                    <p className="text-red-500 text-xs mt-1 ml-2 font-medium">{onboardingForm.formState.errors.nationality.message}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <input
                  type="checkbox"
                  id="privacy-onboarding"
                  {...onboardingForm.register('privacyAccepted')}
                  className="mt-1 w-5 h-5 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 shrink-0"
                />
                <label htmlFor="privacy-onboarding" className="text-xs text-slate-600 leading-tight">
                  Declaro que li e concordo com os{' '}
                  <a href="#" onClick={(e) => e.preventDefault()} className="text-blue-600 hover:underline font-bold">
                    Termos de Uso
                  </a>{' '}
                  e com a{' '}
                  <a href="#" onClick={(e) => e.preventDefault()} className="text-blue-600 hover:underline font-bold">
                    Política de Privacidade
                  </a>.
                </label>
              </div>
              {onboardingForm.formState.errors.privacyAccepted && (
                <p className="text-red-500 text-xs -mt-2 ml-2 font-medium">{onboardingForm.formState.errors.privacyAccepted.message}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl shadow-lg shadow-emerald-500/10 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center text-sm"
              >
                {loading ? 'Processando...' : 'Concluir cadastro'}
              </button>

              <button
                type="button"
                onClick={logout}
                className="w-full py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-all mt-2"
              >
                <LogOut size={14} /> Sair da Conta
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  // ==========================================
  // RENDER: Auths Modules Pages (Forms Pages Switcher)
  // ==========================================
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-150 overflow-hidden"
      >
        <div className="p-8 text-center border-b border-slate-50">
          <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
            <ShieldCheck className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Projeto OBem AI</h1>
          <p className="text-xs text-slate-500 mt-1.5 font-medium">
            {authMode === 'login' && 'Bem-vindo de volta! Acesse sua conta.'}
            {authMode === 'signup' && 'Realize o seu cadastro e insira seus contatos de segurança.'}
            {authMode === 'forgot' && 'Gerador de reativação de password.'}
          </p>
        </div>

        <div className="p-8 space-y-6">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-100 text-red-650 text-xs rounded-2xl font-semibold flex flex-col gap-1 text-center">
              <span>{error}</span>
              {rawErrorCode && (
                <span className="text-[10px] text-red-400 font-mono tracking-wider font-bold mt-1 uppercase">
                  Código Técnico: {rawErrorCode.replace('auth/', '')}
                </span>
              )}
            </div>
          )}

          {rawErrorCode === 'auth/unauthorized-domain' && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 bg-blue-50/70 border border-blue-100/80 rounded-2xl space-y-3 text-xs text-slate-700 font-sans"
            >
              <div className="flex items-center gap-2 font-bold text-blue-800 text-sm">
                <ShieldCheck size={18} className="text-blue-600" />
                Como resolver este erro de login?
              </div>
              <p className="leading-relaxed">
                Este aplicativo roda em um domínio temporário gerado dinamicamente. Por segurança, o Firebase exige que cada domínio de visualização seja explicitamente cadastrado como <strong className="text-blue-800">Domínio Autorizado</strong>.
              </p>
              
              <div className="space-y-1.5">
                <span className="font-extrabold text-slate-800 text-[10px] uppercase tracking-wider block">Passo 1: Copie o domínio atual</span>
                <div className="flex gap-2 items-center bg-white p-2 border border-slate-200 rounded-xl font-mono font-bold text-slate-800 text-[11px] select-all">
                  <span className="flex-1 truncate">{window.location.hostname}</span>
                  <button
                    type="button"
                    onClick={handleCopyDomain}
                    className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 font-bold rounded-lg text-[10px] transition-all flex items-center gap-1 shrink-0"
                  >
                    {copiedDomain ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="font-extrabold text-slate-800 text-[10px] uppercase tracking-wider block">Passo 2: Adicione no Firebase Console</span>
                <ol className="list-decimal pl-4 space-y-1 leading-relaxed font-semibold text-[11px]">
                  <li>Acesse as <a href="https://console.firebase.google.com/project/gen-lang-client-0173039533/authentication/settings" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:underline inline-flex items-center gap-0.5">Configurações de Autenticação <ExternalLink size={10} className="inline" /></a> no Firebase Console.</li>
                  <li>Clique na aba <strong className="text-slate-850">Settings (Configurações)</strong>.</li>
                  <li>Selecione <strong className="text-slate-850">Authorized domains (Domínios Autorizados)</strong> no menu.</li>
                  <li>Clique em <strong className="text-slate-850">Add domain (Adicionar domínio)</strong> e cole o domínio copiado.</li>
                </ol>
              </div>

              <div className="pt-2 border-t border-blue-100 text-[10px] text-blue-700/80 leading-relaxed font-semibold">
                💡 <strong>Dica Alternativa:</strong> Se preferir entrar sem configurar o console, use o formulário de <strong>E-mail &amp; Senha</strong> acima para criar uma conta e acessar o painel imediatamente!
              </div>
            </motion.div>
          )}

          {rawErrorCode === 'auth/operation-not-allowed' && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 bg-orange-50/70 border border-orange-100/80 rounded-2xl space-y-3 text-xs text-slate-700 font-sans"
            >
              <div className="flex items-center gap-2 font-bold text-orange-800 text-sm">
                <ShieldCheck size={18} className="text-orange-600" />
                Ativar Provedor Social no Firebase
              </div>
              <p className="leading-relaxed">
                O provedor de login social (Google ou Apple) ainda não foi ativado para o seu projeto Firebase.
              </p>
              <div className="space-y-1.5">
                <span className="font-extrabold text-slate-800 text-[10px] uppercase tracking-wider block">Como habilitar:</span>
                <ol className="list-decimal pl-4 space-y-1 leading-relaxed font-semibold">
                  <li>Acesse o <a href="https://console.firebase.google.com/project/gen-lang-client-0173039533/authentication/providers" target="_blank" rel="noopener noreferrer" className="text-orange-600 font-bold hover:underline inline-flex items-center gap-0.5">Painel de Login do Firebase <ExternalLink size={10} className="inline" /></a>.</li>
                  <li>Clique em <strong className="text-slate-800">Add new provider</strong> e selecione o provedor pretendido (<strong className="text-slate-800">Google</strong> ou <strong className="text-slate-800">Apple</strong>).</li>
                  <li>Ative a chave de habilitado, configure as chaves requeridas e salve as configurações de autenticação.</li>
                </ol>
              </div>
              <div className="pt-2 border-t border-orange-100 text-[10px] text-orange-700/80 leading-relaxed font-semibold">
                💡 Caso prefira entrar imediatamente sem configurar o console, registre-se usando um <strong>E-mail e Senha</strong> acima.
              </div>
            </motion.div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs rounded-2xl font-semibold">
              {successMsg}
            </div>
          )}

          {/* LOGIN VIEW WORKFLOW */}
          {authMode === 'login' && (
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
              <div className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    {...loginForm.register('email')}
                    placeholder="E-mail"
                    className={cn(
                      "w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none text-sm text-slate-800 font-medium",
                      loginForm.formState.errors.email && "border-red-300 bg-red-50"
                    )}
                  />
                  {loginForm.formState.errors.email && (
                    <p className="text-red-500 text-xs mt-1 ml-2 font-medium">{loginForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    {...loginForm.register('password')}
                    type="password"
                    placeholder="Senha"
                    className={cn(
                      "w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none text-sm text-slate-800 font-medium",
                      loginForm.formState.errors.password && "border-red-300 bg-red-50"
                    )}
                  />
                  {loginForm.formState.errors.password && (
                    <p className="text-red-500 text-xs mt-1 ml-2 font-medium">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>
              </div>

              <div className="text-right">
                <button
                  type="button"
                  onClick={() => switchMode('forgot')}
                  className="text-xs text-blue-600 font-bold hover:underline"
                >
                  Esqueceu a senha?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl shadow-lg shadow-blue-500/10 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
              >
                {loading ? 'Tentando conexão...' : <><LogIn size={18}/> Entrar</>}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className="text-xs text-slate-500 hover:text-blue-600 font-semibold transition-colors focus:outline-none"
                >
                  Não tem uma conta? <span className="underline font-bold text-slate-700 hover:text-blue-650">Cadastre-se</span>
                </button>
              </div>
            </form>
          )}

          {/* REGISTRATION VIEW WORKFLOW */}
          {authMode === 'signup' && (
            <form onSubmit={signUpForm.handleSubmit(onSignUpSubmit)} className="space-y-4">
              <div className="space-y-3">
                <div className="relative">
                  <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    {...signUpForm.register('fullName')}
                    placeholder="Nome Completo do Responsável"
                    className={cn(
                      "w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none text-sm text-slate-800 font-medium",
                      signUpForm.formState.errors.fullName && "border-red-300 bg-red-50"
                    )}
                  />
                  {signUpForm.formState.errors.fullName && (
                    <p className="text-red-500 text-xs mt-1 ml-2 font-medium">{signUpForm.formState.errors.fullName.message}</p>
                  )}
                </div>

                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    {...signUpForm.register('email')}
                    placeholder="E-mail"
                    className={cn(
                      "w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none text-sm text-slate-800 font-medium",
                      signUpForm.formState.errors.email && "border-red-300 bg-red-50"
                    )}
                  />
                  {signUpForm.formState.errors.email && (
                    <p className="text-red-500 text-xs mt-1 ml-2 font-medium">{signUpForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <div className="relative w-[110px] flex-shrink-0">
                    <select
                      {...signUpForm.register('phoneCountryCode')}
                      className="w-full px-3 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500 outline-none text-sm text-slate-800 font-bold transition-all"
                    >
                      <option value="+55">🇧🇷 +55</option>
                      <option value="+351">🇵🇹 +351</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+34">🇪🇸 +34</option>
                      <option value="+44">🇬🇧 +44</option>
                      <option value="+49">🇩🇪 +49</option>
                      <option value="+33">🇫🇷 +33</option>
                      <option value="+54">🇦🇷 +54</option>
                      <option value="+598">🇺🇾 +598</option>
                      <option value="+56">🇨🇱 +56</option>
                      <option value="+57">🇨🇴 +57</option>
                      <option value="+52">🇲🇽 +52</option>
                      <option value="+244">🇦🇴 +244</option>
                      <option value="+258">🇲🇿 +258</option>
                      <option value="+41">🇨🇭 +41</option>
                    </select>
                  </div>
                  <div className="relative flex-1">
                    <Phone className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                    <input
                      {...signUpForm.register('phone')}
                      placeholder="Celular (sem DDI)"
                      className={cn(
                        "w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none text-sm text-slate-800 font-medium",
                        signUpForm.formState.errors.phone && "border-red-300 bg-red-50"
                      )}
                    />
                  </div>
                </div>
                {signUpForm.formState.errors.phone && (
                  <p className="text-red-500 text-xs mt-1 ml-2 font-medium">{signUpForm.formState.errors.phone.message}</p>
                )}

                <div className="relative">
                  <Globe className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 stroke-[1.5]" />
                  <input
                    {...signUpForm.register('nationality')}
                    placeholder="Nacionalidade (Ex: Brasileira)"
                    className={cn(
                      "w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none text-sm text-slate-800 font-medium",
                      signUpForm.formState.errors.nationality && "border-red-300 bg-red-50"
                    )}
                  />
                  {signUpForm.formState.errors.nationality && (
                    <p className="text-red-500 text-xs mt-1 ml-2 font-medium">{signUpForm.formState.errors.nationality.message}</p>
                  )}
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    {...signUpForm.register('password')}
                    type="password"
                    placeholder="Senha"
                    className={cn(
                      "w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none text-sm text-slate-800 font-medium",
                      signUpForm.formState.errors.password && "border-red-300 bg-red-50"
                    )}
                  />
                  {signUpForm.formState.errors.password && (
                    <p className="text-red-500 text-xs mt-1 ml-2 font-medium">{signUpForm.formState.errors.password.message}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <input
                  type="checkbox"
                  id="privacy"
                  {...signUpForm.register('privacyAccepted')}
                  className="mt-1 w-5 h-5 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 shrink-0"
                />
                <label htmlFor="privacy" className="text-xs text-slate-600 leading-tight">
                  Declaro que li e concordo com os{' '}
                  <a href="#" onClick={(e) => e.preventDefault()} className="text-blue-600 hover:underline font-bold">
                    Termos de Uso
                  </a>{' '}
                  e com a{' '}
                  <a href="#" onClick={(e) => e.preventDefault()} className="text-blue-600 hover:underline font-bold">
                    Política de Privacidade
                  </a>.
                </label>
              </div>
              {signUpForm.formState.errors.privacyAccepted && (
                <p className="text-red-500 text-xs -mt-2 ml-2 font-medium">{signUpForm.formState.errors.privacyAccepted.message}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl shadow-lg shadow-emerald-500/10 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center text-sm"
              >
                {loading ? 'Validando servidor...' : 'Concluir cadastro'}
              </button>
            </form>
          )}

          {/* FORGOT PASSWORD VIEW WORKFLOW */}
          {authMode === 'forgot' && (
            <form onSubmit={forgotForm.handleSubmit(onForgotSubmit)} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                <input
                  {...forgotForm.register('email')}
                  placeholder="E-mail"
                  className={cn(
                    "w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none text-sm text-slate-800 font-medium",
                    forgotForm.formState.errors.email && "border-red-300 bg-red-50"
                  )}
                />
                {forgotForm.formState.errors.email && (
                  <p className="text-red-500 text-xs mt-1 ml-2 font-medium">{forgotForm.formState.errors.email.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl shadow-lg shadow-blue-500/10 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
              >
                {loading ? 'Disparando...' : <><KeyRound size={18}/> Enviar Link de Recuperação</>}
              </button>

              <button
                type="button"
                onClick={() => switchMode('login')}
                className="w-full py-2.5 hover:bg-slate-50 text-slate-500 font-semibold rounded-2xl text-xs flex items-center justify-center gap-2.5 transition-colors border border-dashed border-slate-200"
              >
                <ArrowLeft size={14} /> Voltar para o Login
              </button>
            </form>
          )}

          {authMode !== 'forgot' && (
            <>
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-4 text-slate-400 font-semibold tracking-wider">Ou acesse com</span></div>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={signInWithGoogle}
                  className="w-full py-3 border border-slate-200 hover:bg-slate-50 rounded-2xl flex items-center justify-center gap-3 transition-all font-bold text-slate-700 text-xs active:scale-[0.98]"
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4" alt="Google" />
                  Entrar com Conta Google
                </button>
              </div>
            </>
          )}

          <p className="text-center text-xs text-slate-500 pt-2 font-medium">
            {authMode === 'signup' && (
              <>
                Já possui cadastro?
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="ml-1.5 text-blue-600 font-extrabold hover:underline"
                >
                  Entrar agora
                </button>
              </>
            )}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
