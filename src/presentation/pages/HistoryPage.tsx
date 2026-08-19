import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Search, 
  Calendar, 
  ThumbsUp, 
  TriangleAlert, 
  Octagon, 
  Star,
  MessageSquare,
  Trash2,
  Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ScanRepository } from '../../data/repositories/scanRepository';
import { HealthProfile, ScanRecord } from '../../domain/entities/user';
import { cn } from '../../lib/utils';
import RedAlertIcon from '../components/RedAlertIcon';
import { format } from 'date-fns';
import { ptBR, es, enUS } from 'date-fns/locale';

export default function HistoryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedProfile, setSelectedProfile] = useState<HealthProfile | null>(null);
  const [history, setHistory] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'green' | 'yellow' | 'red'>('all');
  const [deleteScanId, setDeleteScanId] = useState<string | null>(null);

  const appLang = localStorage.getItem('safelabel_lang') || 'pt';

  const getDateLocale = () => {
    if (appLang === 'en') return enUS;
    if (appLang === 'es') return es;
    return ptBR;
  };

  const getDateFormat = () => {
    if (appLang === 'en') return "MMM dd, HH:mm";
    if (appLang === 'es') return "dd 'de' MMM, HH:mm";
    return "dd 'de' MMM, HH:mm";
  };

  const t = {
    title: appLang === 'en' ? 'History' : appLang === 'es' ? 'Historial' : 'Histórico',
    searchPlaceholder: appLang === 'en' ? 'Search products...' : appLang === 'es' ? 'Buscar productos...' : 'Buscar produtos...',
    noScans: appLang === 'en' ? 'No scans found.' : appLang === 'es' ? 'Ningún escaneo encontrado.' : 'Nenhum escaneamento encontrado.',
    deleteTooltip: appLang === 'en' ? 'Delete from History' : appLang === 'es' ? 'Eliminar del Historial' : 'Excluir do Histórico',
    accuracyQuestion: appLang === 'en' ? 'How accurate was the analysis?' : appLang === 'es' ? '¿Qué tan precisa fue la lectura?' : 'O quão precisa foi a análise?',
    commentPlaceholder: appLang === 'en' ? 'Any errors or observations?...' : appLang === 'es' ? '¿Algún error u observación?...' : 'Algum erro ou observação?...',
    cancel: appLang === 'en' ? 'Cancel' : appLang === 'es' ? 'Cancelar' : 'Cancelar',
    save: appLang === 'en' ? 'Save' : appLang === 'es' ? 'Salvar' : 'Salvar',
    rated: appLang === 'en' ? 'RATED' : appLang === 'es' ? 'EVALUADO' : 'AVALIADO',
    rateButton: appLang === 'en' ? 'Rate accuracy' : appLang === 'es' ? 'Evaluar precisión' : 'Avaliar precisão',
    deleteModalTitle: appLang === 'en' ? 'Delete Record?' : appLang === 'es' ? '¿Eliminar Registro?' : 'Excluir Registro?',
    deleteModalDesc: appLang === 'en' ? 'Are you sure you want to remove this item from your history? This action is permanent.' : appLang === 'es' ? '¿Really wish to remove this record from history? This is permanent.' : 'Deseja realmente remover este item do histórico? Esta ação é permanente.',
    deleteConfirm: appLang === 'en' ? 'Delete' : appLang === 'es' ? 'Eliminar' : 'Excluir'
  };

  useEffect(() => {
    const saved = sessionStorage.getItem('selectedProfile');
    if (!saved) {
      navigate('/');
      return;
    }
    const profile = JSON.parse(saved);
    setSelectedProfile(profile);
    loadHistory(profile.id);
  }, [navigate, user]);

  const loadHistory = async (profileId: string) => {
    if (!user) return;
    try {
      const data = await ScanRepository.getHistory(user.uid, profileId);
      setHistory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTrigger = (scanId: string) => {
    setDeleteScanId(scanId);
  };

  const confirmDeleteScan = async () => {
    if (!deleteScanId || !user || !selectedProfile) return;
    const scanId = deleteScanId;
    setDeleteScanId(null);
    try {
      await ScanRepository.deleteScan(user.uid, selectedProfile.id, scanId);
      setHistory(prev => prev.filter(s => s.id !== scanId));
    } catch (err) {
      console.error(err);
    }
  };

  const [evaluatingId, setEvaluatingId] = useState<string | null>(null);
  const [tempRating, setTempRating] = useState(0);
  const [tempComment, setTempComment] = useState('');

  const submitEvaluation = async (scanId: string) => {
    if (!user || !selectedProfile) return;
    try {
      await ScanRepository.updateEvaluation(
        user.uid, 
        selectedProfile.id, 
        scanId, 
        tempRating, 
        tempComment
      );
      setEvaluatingId(null);
      loadHistory(selectedProfile.id);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.productName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans p-6 text-slate-800 dark:text-slate-100 transition-colors">
      <div className="max-w-md mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')}
              className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-white/10 text-slate-600 dark:text-slate-300"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-white">{t.title}</h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">
                {selectedProfile?.name}
              </p>
            </div>
          </div>
        </header>

        {/* Search and Filter */}
        <div className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
            <input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-white/10 focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-all text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>
          <button 
            onClick={() => {
              const order: ('all' | 'green' | 'yellow' | 'red')[] = ['all', 'green', 'yellow', 'red'];
              const next = order[(order.indexOf(filterStatus) + 1) % order.length];
              setFilterStatus(next);
            }}
            className={cn(
              "p-3 rounded-2xl border transition-all",
              filterStatus === 'all' ? "bg-white dark:bg-slate-900 border-slate-100 dark:border-white/10 text-slate-400 dark:text-slate-500" :
              filterStatus === 'green' ? "bg-emerald-50 dark:bg-emerald-950/25 border-emerald-200 dark:border-emerald-800/30 text-emerald-600 dark:text-emerald-400" :
              filterStatus === 'yellow' ? "bg-amber-50 dark:bg-amber-950/25 border-amber-200 dark:border-amber-800/30 text-amber-600 dark:text-amber-400" :
              "bg-rose-50 dark:bg-rose-950/25 border-rose-200 dark:border-rose-800/30 text-rose-600 dark:text-rose-400"
            )}
          >
            <Filter size={20} />
          </button>
        </div>

        <div className="space-y-4 pb-12">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-white/10">
              <p className="text-slate-400 dark:text-slate-500 text-sm">{t.noScans}</p>
            </div>
          ) : (
            filteredHistory.map((scan, idx) => (
              <motion.div
                key={scan.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-white/10 space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm",
                      scan.status === 'green' ? "bg-emerald-500 shadow-emerald-250/20 dark:shadow-none" :
                      scan.status === 'yellow' ? "bg-amber-500 shadow-amber-250/20 dark:shadow-none" :
                      "bg-rose-500 shadow-rose-250/20 dark:shadow-none"
                    )}>
                      {scan.status === 'green' ? <ThumbsUp size={18} /> :
                       scan.status === 'yellow' ? <TriangleAlert size={18} /> :
                       <RedAlertIcon size={18} />}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-white leading-tight">{scan.productName}</h3>
                      <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold mt-1">
                        <Calendar size={12} />
                        {format(scan.timestamp, getDateFormat(), { locale: getDateLocale() })}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDeleteTrigger(scan.id!)}
                    className="p-2.5 text-slate-400 hover:text-rose-650 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all active:scale-95"
                    title={t.deleteTooltip}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <p className={cn(
                  "text-sm leading-relaxed p-4 rounded-2xl border transition-all duration-200",
                  scan.status === 'green' ? "bg-emerald-50/20 dark:bg-emerald-950/5 border-emerald-100/40 dark:border-emerald-900/10 text-slate-600 dark:text-slate-300" :
                  scan.status === 'yellow' ? "bg-amber-50/20 dark:bg-amber-950/5 border-amber-100/40 dark:border-amber-900/10 text-slate-600 dark:text-slate-300" :
                  "bg-rose-50/20 dark:bg-rose-950/5 border-rose-100/40 dark:border-rose-900/10 text-slate-600 dark:text-slate-300"
                )}>
                  {scan.reason}
                </p>

                {/* Avaliação Individual */}
                <div className="pt-4 border-t border-slate-100 dark:border-white/5">
                   {evaluatingId === scan.id ? (
                     <div className="space-y-3 bg-blue-50/20 dark:bg-blue-950/10 p-4 rounded-2xl border border-blue-100/40 dark:border-blue-900/10">
                       <p className="text-xs font-bold text-blue-600 uppercase tracking-tighter">{t.accuracyQuestion}</p>
                       <div className="flex gap-2">
                         {[1,2,3,4,5].map((star) => (
                           <button 
                            key={star} 
                            onClick={() => setTempRating(star)}
                            className="focus:outline-none"
                           >
                             <Star 
                               size={24} 
                               className={cn(
                                 "transition-all active:scale-125",
                                 tempRating >= star ? "text-amber-400 fill-amber-400" : "text-slate-300"
                               )}
                             />
                           </button>
                         ))}
                       </div>
                       <textarea 
                        value={tempComment}
                        onChange={(e) => setTempComment(e.target.value)}
                        placeholder={t.commentPlaceholder}
                        className="w-full p-3 bg-white dark:bg-slate-900 rounded-xl border border-blue-100 dark:border-white/10 text-sm outline-none focus:border-blue-400 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-colors"
                        rows={2}
                       />
                       <div className="flex gap-2">
                        <button 
                          onClick={() => setEvaluatingId(null)}
                          className="flex-1 py-2 text-slate-500 dark:text-slate-400 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          {t.cancel}
                        </button>
                        <button 
                          disabled={tempRating === 0}
                          onClick={() => submitEvaluation(scan.id!)}
                          className="flex-1 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg shadow-md shadow-blue-500/10 disabled:opacity-50"
                        >
                          {t.save}
                        </button>
                       </div>
                     </div>
                   ) : (
                     <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                          {[1,2,3,4,5].map((star) => (
                            <Star 
                              key={star}
                              size={16} 
                              className={cn(
                                "transition-colors",
                                (scan.userRating || 0) >= star ? "text-amber-400 fill-amber-400" : "text-slate-200 dark:text-slate-700"
                              )}
                            />
                          ))}
                        </div>
                        {scan.userComment ? (
                          <div className="flex items-center gap-1 text-blue-500 text-xs font-bold bg-blue-50 dark:bg-blue-950/40 px-2 py-1 rounded-full">
                            <MessageSquare size={12} />
                            {t.rated}
                          </div>
                        ) : (
                          <button 
                            onClick={() => {
                              setEvaluatingId(scan.id!);
                              setTempRating(scan.userRating || 0);
                              setTempComment(scan.userComment || '');
                            }}
                            className="text-slate-400 hover:text-blue-500 text-xs font-bold flex items-center gap-1 transition-colors group"
                          >
                            <Star size={14} className="group-hover:fill-blue-500 transition-all" />
                            {t.rateButton}
                          </button>
                        )}
                     </div>
                   )}
                </div>
                {scan.userComment && !evaluatingId && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic mt-2 border-l-2 border-slate-100 dark:border-white/5 pl-3">
                    "{scan.userComment}"
                  </p>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>

      {deleteScanId && (
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
              <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/30 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} />
              </div>
              <h3 className="text-base font-black text-slate-800 dark:text-white mb-2">
                {t.deleteModalTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                {appLang === 'en' ? 'Are you sure you want to remove this item from your history? This action is permanent.' : appLang === 'es' ? '¿Realmente desea eliminar este elemento del historial? Esta acción es permanente.' : 'Deseja realmente remover este item do histórico? Esta ação é permanente.'}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setDeleteScanId(null)}
                  className="py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-200 font-bold rounded-xl text-xs transition-all active:scale-95"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={confirmDeleteScan}
                  className="py-3 bg-rose-600 hover:bg-rose-550 text-white font-bold rounded-xl text-xs transition-all active:scale-95 shadow-md shadow-rose-600/10"
                >
                  {t.deleteConfirm}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}

    </div>
  );
}
