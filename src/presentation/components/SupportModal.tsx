import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { X, Paperclip, Trash2, AlertCircle, CheckCircle2, UploadCloud, FileText } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  appUser: any;
  appLang: string;
}

interface AttachedFile {
  name: string;
  type: string;
  size: number;
  content: string; // Base64
}

export function SupportModal({ isOpen, onClose, appUser, appLang }: SupportModalProps) {
  const [name, setName] = useState(appUser?.fullName || '');
  const [email, setEmail] = useState(appUser?.email || '');
  const [category, setCategory] = useState('Erro no Scanner');
  const [details, setDetails] = useState('');
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [generatedId, setGeneratedId] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const processFiles = (files: FileList) => {
    setErrorMsg('');
    const newAttachments = [...attachments];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Limit to 5MB
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Cada arquivo deve ter no máximo 5MB.');
        return;
      }

      // Check format (PDF or images)
      const isImage = file.type.startsWith('image/');
      const isPdf = file.type === 'application/pdf';
      if (!isImage && !isPdf) {
        setErrorMsg('Apenas arquivos PDF ou imagens (PNG, JPG, JPEG, WEBP) são permitidos.');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        newAttachments.push({
          name: file.name,
          type: file.type,
          size: file.size,
          content: reader.result as string
        });
        setAttachments([...newAttachments]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !details.trim()) {
      setErrorMsg('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          category,
          details,
          attachments
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setSuccess(true);
        setGeneratedId(data.ticket.id);
        // Reset form
        setDetails('');
        setAttachments([]);
      } else {
        setErrorMsg(data.error || 'Erro ao enviar a solicitação. Tente novamente.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Falha na conexão com o servidor. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 dark:border-white/10 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white">
              <UploadCloud size={16} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">
                Central de Suporte & Ajuda
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Conte-nos seu problema e responderemos em seu e-mail
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {success ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center justify-center py-8 text-center space-y-4"
            >
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-650 dark:text-emerald-450 rounded-full flex items-center justify-center">
                <CheckCircle2 size={36} />
              </div>
              <div className="space-y-2">
                <h4 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Chamado Aberto com Sucesso!
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                  Sua solicitação foi registrada com o número de ticket abaixo. Nossa equipe analisará e enviará a resposta para o seu e-mail <strong className="text-slate-750 dark:text-slate-300">{email}</strong>.
                </p>
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2.5 rounded-2xl border border-slate-200/50 dark:border-white/5 font-mono text-xs font-black text-blue-650 dark:text-blue-400 select-all tracking-wider">
                ID: {generatedId}
              </div>
              <button
                onClick={() => {
                  setSuccess(false);
                  onClose();
                }}
                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold rounded-xl transition-all shadow-sm"
              >
                Entendido
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-slate-800 dark:text-slate-100">
              {errorMsg && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fade-in">
                  <AlertCircle size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Nome */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-705 dark:text-slate-300">
                  Seu Nome *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome completo"
                  className="w-full text-xs p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200/50 dark:border-white/10 rounded-xl font-bold outline-none border-slate-150 focus:border-blue-500 text-slate-800 dark:text-slate-100"
                />
              </div>

              {/* E-mail */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-705 dark:text-slate-300">
                  E-mail de Contato *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@email.com"
                  className="w-full text-xs p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200/50 dark:border-white/10 rounded-xl font-bold outline-none border-slate-150 focus:border-blue-500 text-slate-800 dark:text-slate-100"
                />
              </div>

              {/* Categoria */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-705 dark:text-slate-300">
                  Tipo de Problema *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200/50 dark:border-white/10 rounded-xl font-bold outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100"
                >
                  <option value="Erro no Scanner">📷 Erro no Scanner / Câmera</option>
                  <option value="Dificuldade de Leitura / Acessibilidade">👓 Acessibilidade / Redimensionamento</option>
                  <option value="Erro de Tradução / OCR">🌐 Tradução de Rótulo ou Ingredientes</option>
                  <option value="Conta & Cobrança">💳 Conta, Plano ou Faturamento</option>
                  <option value="Outro">💬 Outro Problema</option>
                </select>
              </div>

              {/* Detalhes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-705 dark:text-slate-300">
                  Relate os Detalhes *
                </label>
                <textarea
                  required
                  rows={4}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Descreva detalhadamente o problema que você está enfrentando..."
                  className="w-full text-xs p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200/50 dark:border-white/10 rounded-xl font-bold outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100 resize-none"
                />
              </div>

              {/* Anexos */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-705 dark:text-slate-300">
                  Inserir Anexos (PDF ou Imagem - Até 5MB)
                </label>
                
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2",
                    isDragging 
                      ? "border-blue-500 bg-blue-500/5" 
                      : "border-slate-200/80 dark:border-white/10 hover:border-slate-350 dark:hover:border-white/20 bg-slate-50/50 dark:bg-slate-800/20"
                  )}
                >
                  <UploadCloud size={24} className="text-slate-400 dark:text-slate-500" />
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Arraste ou clique para anexar
                    </p>
                    <p className="text-[10px] text-slate-400">
                      PDF, PNG, JPG, JPEG ou WEBP (Max: 5MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*,application/pdf"
                    multiple
                    className="hidden"
                  />
                </div>

                {/* Lista de Anexos */}
                {attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {attachments.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200/40 dark:border-white/5"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {file.type === 'application/pdf' ? (
                            <FileText size={16} className="text-red-500 shrink-0" />
                          ) : (
                            <img
                              src={file.content}
                              alt="preview"
                              className="w-8 h-8 rounded-lg object-cover shrink-0"
                            />
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                              {file.name}
                            </p>
                            <p className="text-[9px] text-slate-450 dark:text-slate-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(idx)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Botão de Envio */}
              <button
                type="submit"
                disabled={loading}
                className={cn(
                  "w-full py-3.5 mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-blue-500/10",
                  loading && "opacity-70 cursor-not-allowed"
                )}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Enviando Chamado...</span>
                  </>
                ) : (
                  <span>Enviar Chamado de Suporte</span>
                )}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
