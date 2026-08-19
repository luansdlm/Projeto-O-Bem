/**
 * Projeto OBem AI - Configurações Gerais de Integração
 * Permite alternar facilmente entre o Firebase nativo temporário do AI Studio
 * e o Backend de Produção em Ruby on Rails de forma totalmente transparente!
 */

export const BACKEND_TYPE = 'firebase' as 'firebase' | 'rails'; // Mude para 'rails' para usar o backend Ruby

export const RAILS_API_URL = (import.meta as any).env?.VITE_BACKEND_URL || 'http://localhost:3000/api/v1';

export const isRailsEnabled = (): boolean => {
  return BACKEND_TYPE === 'rails';
};
