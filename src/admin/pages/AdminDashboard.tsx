import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../AdminLayout';
import { 
  Activity, 
  AlertTriangle, 
  Target, 
  Settings, 
  CheckCircle2, 
  XCircle, 
  Database, 
  Megaphone, 
  Terminal, 
  LifeBuoy, 
  Send, 
  Clock, 
  FileText, 
  Check, 
  Mail, 
  User, 
  ExternalLink,
  RefreshCw
} from 'lucide-react';

export default function AdminDashboard() {
  const { token, logout } = useAdminAuth();
  const [activeTab, setActiveTab] = useState('logs');
  
  const [logs, setLogs] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [prompts, setPrompts] = useState<any>({ generalInstructions: '', strictMode: true });
  
  // Support Tickets State
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [replySuccess, setReplySuccess] = useState(false);
  const [supportFilter, setSupportFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved' | 'closed'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const handleManualRefresh = async () => {
    if (!token) return;
    setRefreshing(true);
    try {
      await Promise.all([
        fetchData('logs', setLogs),
        fetchData('reports', setReports),
        fetchData('campaigns', setCampaigns),
        fetchData('prompts', setPrompts),
        fetchData('tickets', setTickets)
      ]);
    } catch (err) {
      console.error("Error refreshing dashboard data:", err);
    } finally {
      setTimeout(() => setRefreshing(false), 600);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchData('logs', setLogs);
    fetchData('reports', setReports);
    fetchData('campaigns', setCampaigns);
    fetchData('prompts', setPrompts);
    fetchData('tickets', setTickets);
  }, [token]);

  const fetchData = async (endpoint: string, setter: any) => {
    try {
      const res = await fetch(`/api/admin/${endpoint}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401) {
        alert("Sua sessão de administrador expirou ou é inválida. Por favor, faça login novamente.");
        logout();
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setter(data);
      } else {
        console.error(`Erro ${res.status} ao buscar ${endpoint}`);
      }
    } catch (err) {
      console.error(`Error fetching ${endpoint}:`, err);
    }
  };

  const updateReportStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/admin/reports/${id}/validate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status })
      });
      if (res.status === 401) {
        alert("Sua sessão expirou. Faça login novamente.");
        logout();
        return;
      }
      fetchData('reports', setReports);
    } catch (err) {
      console.error(err);
    }
  };

  const updateTicketStatus = async (ticketId: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.status === 401) {
        alert("Sua sessão expirou. Faça login novamente.");
        logout();
        return;
      }
      if (res.ok) {
        fetchData('tickets', (updatedTickets: any[]) => {
          setTickets(updatedTickets);
          const updated = updatedTickets.find(t => t.id === ticketId);
          if (updated) setSelectedTicket(updated);
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendReply = async (ticketId: string) => {
    if (!replyMessage.trim()) return;
    setReplyLoading(true);
    setReplySuccess(false);
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: replyMessage })
      });
      if (res.status === 401) {
        alert("Sua sessão expirou. Faça login novamente.");
        logout();
        return;
      }
      if (res.ok) {
        setReplyMessage('');
        setReplySuccess(true);
        fetchData('tickets', (updatedTickets: any[]) => {
          setTickets(updatedTickets);
          const updated = updatedTickets.find(t => t.id === ticketId);
          if (updated) setSelectedTicket(updated);
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReplyLoading(false);
    }
  };

  const savePrompts = async () => {
    try {
      const res = await fetch(`/api/admin/prompts`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(prompts)
      });
      if (res.status === 401) {
        alert("Sua sessão expirou. Faça login novamente.");
        logout();
        return;
      }
      alert("Prompts atualizados com sucesso no Proxy Server-Side.");
    } catch (err) {
      console.error(err);
    }
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'logs':
        return (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600" />
              Auditoria de Tokens e IA
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 rounded-tl-xl">Ação (Gateway)</th>
                    <th className="py-3 px-4">Tokens Consumidos</th>
                    <th className="py-3 px-4">Eficiência</th>
                    <th className="py-3 px-4 rounded-tr-xl">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-medium text-slate-700">{log.action}</td>
                      <td className="py-3 px-4 text-slate-600">{log.tokens}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${log.tokens > 1000 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {log.tokens > 1000 ? 'Alto Custo' : 'Otimizado'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'reports':
        return (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              Validação Manual de Divergências
            </h3>
            <div className="space-y-4">
              {reports.map(report => (
                <div key={report.id} className="flex items-start justify-between p-4 border border-slate-200 rounded-xl bg-slate-50">
                  <div>
                    <h4 className="font-semibold text-slate-800">{report.product}</h4>
                    <p className="text-sm text-slate-600 mt-1"><strong>Divergência reportada:</strong> {report.divergence}</p>
                    <p className="text-xs text-slate-400 mt-2">Enviado em: {new Date(report.date).toLocaleDateString()}</p>
                    <div className="mt-2">
                      <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full ${report.status === 'pending' ? 'bg-amber-100 text-amber-700' : report.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {report.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  {report.status === 'pending' && (
                    <div className="flex gap-2">
                      <button onClick={() => updateReportStatus(report.id, 'approved')} className="p-2 bg-white border border-emerald-200 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors" title="Aprovar Moderação">
                        <CheckCircle2 className="w-5 h-5" />
                      </button>
                      <button onClick={() => updateReportStatus(report.id, 'rejected')} className="p-2 bg-white border border-rose-200 text-rose-600 rounded-lg hover:bg-rose-50 transition-colors" title="Rejeitar">
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {reports.length === 0 && <p className="text-sm text-slate-500">Nenhuma denúncia pendente.</p>}
            </div>
          </div>
        );
      case 'tickets': {
        const filteredTickets = tickets.filter(t => supportFilter === 'all' || t.status === supportFilter);
        return (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col lg:flex-row gap-6 min-h-[600px]">
            {/* Left Side: Ticket list */}
            <div className="w-full lg:w-80 flex-shrink-0 flex flex-col border-r border-slate-100 lg:pr-4">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-blue-600" />
                Tickets de Suporte
              </h3>
              
              {/* Filter Tabs */}
              <div className="flex flex-wrap gap-1 mb-4 border-b border-slate-100 pb-3">
                {(['all', 'open', 'in_progress', 'resolved', 'closed'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setSupportFilter(f)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                      supportFilter === f
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/10'
                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                    }`}
                  >
                    {f === 'all' ? 'Todos' : f === 'open' ? 'Abertos' : f === 'in_progress' ? 'Em Progresso' : f === 'resolved' ? 'Resolvidos' : 'Fechados'}
                  </button>
                ))}
              </div>

              {/* Tickets Cards List */}
              <div className="flex-1 overflow-y-auto space-y-2 max-h-[500px] pr-1">
                {filteredTickets.map(ticket => {
                  const isSelected = selectedTicket?.id === ticket.id;
                  return (
                    <div
                      key={ticket.id}
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setReplySuccess(false);
                      }}
                      className={`p-3 rounded-xl border transition-all cursor-pointer text-left ${
                        isSelected
                          ? 'border-blue-500 bg-blue-500/5 shadow-sm'
                          : 'border-slate-100 hover:border-slate-250 bg-slate-50/50 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-mono text-[10px] font-black text-slate-400">
                          {ticket.id}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                          ticket.status === 'open' 
                            ? 'bg-red-100 text-red-700' 
                            : ticket.status === 'in_progress'
                            ? 'bg-amber-100 text-amber-700'
                            : ticket.status === 'resolved'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-150 text-slate-650'
                        }`}>
                          {ticket.status === 'open' ? 'Aberto' : ticket.status === 'in_progress' ? 'Em Progresso' : ticket.status === 'resolved' ? 'Resolvido' : 'Fechado'}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-800 text-xs truncate">
                        {ticket.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-medium truncate mb-2">
                        {ticket.category}
                      </p>
                      <p className="text-[11px] text-slate-600 line-clamp-2">
                        {ticket.details}
                      </p>
                      <div className="flex items-center justify-between mt-3 text-[9px] text-slate-400 font-bold">
                        <span className="flex items-center gap-1">
                          <Clock size={10} />
                          {new Date(ticket.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {ticket.attachments && ticket.attachments.length > 0 && (
                          <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-extrabold">
                            +{ticket.attachments.length} Anexo
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
                {filteredTickets.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-8 font-bold">
                    Nenhum ticket encontrado.
                  </p>
                )}
              </div>
            </div>

            {/* Right Side: Ticket Details and Actions */}
            <div className="flex-1 flex flex-col justify-start min-h-[500px]">
              {selectedTicket ? (
                <div className="space-y-6 text-left">
                  {/* Selected Ticket Header */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">
                          {selectedTicket.id}
                        </span>
                        <h3 className="text-base font-black text-slate-900">
                          {selectedTicket.name}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 font-bold flex items-center gap-1.5 mt-1">
                        <Mail size={12} className="text-slate-400" />
                        {selectedTicket.email}
                      </p>
                    </div>

                    {/* Status Select action */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500">Status:</span>
                      <select
                        value={selectedTicket.status}
                        onChange={(e) => updateTicketStatus(selectedTicket.id, e.target.value)}
                        className="text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:border-blue-500 text-slate-800 outline-none"
                      >
                        <option value="open">🔴 Aberto</option>
                        <option value="in_progress">🟡 Em Progresso</option>
                        <option value="resolved">🟢 Resolvido</option>
                        <option value="closed">⚪ Fechado</option>
                      </select>
                    </div>
                  </div>

                  {/* Problem Details */}
                  <div className="bg-slate-50/50 rounded-2xl border border-slate-100 p-5 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
                        Detalhes do Problema
                      </span>
                      <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                        {selectedTicket.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 font-bold whitespace-pre-wrap leading-relaxed">
                      {selectedTicket.details}
                    </p>

                    {/* Attachments Section */}
                    {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                      <div className="pt-3 border-t border-slate-100 space-y-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                          Anexos Enviados ({selectedTicket.attachments.length})
                        </span>
                        <div className="flex flex-wrap gap-3">
                          {selectedTicket.attachments.map((file: any, idx: number) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-150 text-xs font-bold"
                            >
                              {file.type === 'application/pdf' ? (
                                <FileText size={18} className="text-red-500 shrink-0" />
                              ) : (
                                <img
                                  src={file.content}
                                  alt="attachment-preview"
                                  className="w-8 h-8 rounded-lg object-cover shrink-0 cursor-pointer"
                                  onClick={() => {
                                    const w = window.open();
                                    if (w) {
                                      w.document.write(`<img src="${file.content}" style="max-width:100%; max-height:100%; margin:auto; display:block;" />`);
                                    }
                                  }}
                                />
                              )}
                              <div className="min-w-0 text-left">
                                <p className="text-[11px] text-slate-700 truncate max-w-[120px]">
                                  {file.name}
                                </p>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const link = document.createElement('a');
                                    link.href = file.content;
                                    link.download = file.name;
                                    link.click();
                                  }}
                                  className="text-[9px] text-blue-600 hover:underline flex items-center gap-0.5"
                                >
                                  Baixar <ExternalLink size={8} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Conversation & Replies History */}
                  <div className="space-y-3">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-wider block">
                      Histórico de Atendimento
                    </span>
                    <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                      {/* Ticket creation system event */}
                      <div className="flex items-center gap-2 text-[10px] text-slate-450 font-bold pl-2 border-l-2 border-slate-200 py-1">
                        <Clock size={11} />
                        <span>Chamado registrado às {new Date(selectedTicket.createdAt).toLocaleTimeString()} em {new Date(selectedTicket.createdAt).toLocaleDateString()}</span>
                      </div>

                      {selectedTicket.replies && selectedTicket.replies.map((reply: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex flex-col space-y-1.5 p-3.5 bg-blue-50/40 rounded-2xl border border-blue-50/60 max-w-[85%] ml-auto"
                        >
                          <div className="flex items-center justify-between text-[10px] font-bold text-blue-650">
                            <span className="flex items-center gap-1">
                              <User size={10} /> Suporte Técnico (Admin)
                            </span>
                            <span>{new Date(reply.timestamp).toLocaleDateString('pt-BR')} {new Date(reply.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-xs text-slate-700 font-bold leading-relaxed text-left">
                            {reply.message}
                          </p>
                          <span className="text-[9px] font-extrabold text-emerald-600 flex items-center gap-0.5 justify-end">
                            <Check size={10} /> Respondido por e-mail
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reply Form */}
                  <div className="border-t border-slate-100 pt-4 space-y-3">
                    <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1">
                      <Mail size={13} className="text-blue-500" />
                      Responder ao Usuário (Envia e-mail para {selectedTicket.email})
                    </label>
                    
                    {replySuccess && (
                      <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-2 animate-fade-in">
                        <CheckCircle2 size={16} />
                        <span>Sua resposta foi salva e enviada com sucesso para o e-mail do usuário!</span>
                      </div>
                    )}

                    <div className="relative">
                      <textarea
                        rows={3}
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        placeholder="Digite sua resposta aqui para dar andamento ou resolver o problema..."
                        className="w-full text-xs p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-blue-500 text-slate-800 resize-none pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => handleSendReply(selectedTicket.id)}
                        disabled={replyLoading || !replyMessage.trim()}
                        className="absolute bottom-4 right-4 p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl transition-all cursor-pointer shadow-sm"
                        title="Enviar resposta"
                      >
                        {replyLoading ? (
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Send size={14} />
                        )}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold leading-normal">
                      * Ao clicar em responder, o status do ticket será automaticamente alterado para <strong className="text-emerald-650">RESOLVIDO</strong> e o sistema enviará uma notificação com a sua resposta para a caixa de entrada do usuário.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400 gap-3">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 border border-slate-100">
                    <LifeBuoy size={32} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-700">Nenhum Ticket Selecionado</h4>
                    <p className="text-xs text-slate-400 max-w-xs mt-1">
                      Selecione um chamado de suporte na lista ao lado para ver os detalhes, anexos, histórico e responder por e-mail.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      }
      case 'campaigns':
        return (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-indigo-600" />
              Gestão de Campanhas (Ads)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {campaigns.map(camp => (
                <div key={camp.id} className="p-5 border border-slate-200 rounded-xl">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-slate-800">{camp.name}</h4>
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-md">Ativa</span>
                  </div>
                  <p className="text-sm text-slate-600"><strong>Segmento Alvo:</strong> {camp.segment}</p>
                  <button className="mt-4 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors">
                    Ajustar Segmentação
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      case 'prompts':
        return (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-slate-700" />
              Configuração Proxy Gemini (Server-Side)
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Instruções Globais (System Prompt)</label>
                <textarea 
                  className="w-full h-40 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={prompts.generalInstructions}
                  onChange={(e) => setPrompts({...prompts, generalInstructions: e.target.value})}
                />
                <p className="text-xs text-slate-500 mt-2">Modifica o comportamento base de todas as chamadas de OCR e IA.</p>
              </div>
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  id="strictMode" 
                  checked={prompts.strictMode}
                  onChange={(e) => setPrompts({...prompts, strictMode: e.target.checked})}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="strictMode" className="text-sm font-medium text-slate-700">Strict Moderation Mode (Bloqueia inconclusivos)</label>
              </div>
              <button 
                onClick={savePrompts}
                className="mt-4 bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 px-6 rounded-xl transition-colors"
              >
                Implantar Configurações no Gateway
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900">Painel de Governança & Administração</h2>
          <p className="text-xs text-slate-500 font-medium mt-1">Gerencie auditorias de IA, moderação de produtos, campanhas ativas e tickets de suporte de usuários.</p>
        </div>
        <button
          onClick={handleManualRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer border border-blue-500"
        >
          <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Sincronizando...' : 'Atualizar Dados'}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <nav className="flex flex-col gap-2">
            <button 
              onClick={() => setActiveTab('logs')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'logs' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <Activity className="w-5 h-5" /> Auditoria de Tokens
            </button>
            <button 
              onClick={() => setActiveTab('reports')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'reports' ? 'bg-rose-50 text-rose-700' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <AlertTriangle className="w-5 h-5" /> Moderação Manual
            </button>
            <button 
              onClick={() => setActiveTab('tickets')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'tickets' ? 'bg-sky-50 text-sky-700' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <LifeBuoy className="w-5 h-5" /> Tickets de Suporte
            </button>
            <button 
              onClick={() => setActiveTab('campaigns')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'campaigns' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <Target className="w-5 h-5" /> Ad Campaigns
            </button>
            <button 
              onClick={() => setActiveTab('prompts')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'prompts' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <Settings className="w-5 h-5" /> Proxy AI Prompts
            </button>
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1">
          {renderTab()}
        </div>

      </div>
    </div>
  );
}
