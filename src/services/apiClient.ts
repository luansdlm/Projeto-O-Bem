import { RAILS_API_URL } from '../lib/config';
import { AppUser, HealthProfile, ScanRecord } from '../domain/entities/user';
import { Product } from '../domain/entities/product';

class ApiClient {
  private getHeaders(token?: string): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  // --- USERS SECTION ---
  async syncUser(uid: string, email: string, privacyTermsAccepted: boolean, token?: string): Promise<AppUser> {
    const res = await fetch(`${RAILS_API_URL}/users/sync`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify({ uid, email, privacy_terms_accepted: privacyTermsAccepted }),
    });
    if (!res.ok) throw new Error('Falha ao sincronizar usuário com back-end Rails.');
    const data = await res.json();
    return {
      uid: data.uid,
      email: data.email,
      privacyTermsAccepted: data.privacy_terms_accepted,
      fullName: data.full_name,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  // --- PROFILES SECTION ---
  async getProfiles(token?: string): Promise<HealthProfile[]> {
    const res = await fetch(`${RAILS_API_URL}/profiles`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Falha ao obter perfis de saúde.');
    const data = await res.json();
    return data.map((item: any) => ({
      id: String(item.id),
      parentUid: item.user_uid,
      name: item.name,
      type: item.profile_type || 'self',
      conditions: item.conditions || [],
      allergies: item.allergies || [],
    }));
  }

  async createProfile(data: Omit<HealthProfile, 'id'>, token?: string): Promise<string> {
    const res = await fetch(`${RAILS_API_URL}/profiles`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify({
        name: data.name,
        profile_type: data.type,
        conditions: data.conditions,
        allergies: data.allergies,
      }),
    });
    if (!res.ok) throw new Error('Falha ao criar perfil de saúde no Rails.');
    const result = await res.json();
    return String(result.id);
  }

  async updateProfile(profileId: string, data: Partial<Omit<HealthProfile, 'id' | 'parentUid'>>, token?: string): Promise<void> {
    const res = await fetch(`${RAILS_API_URL}/profiles/${profileId}`, {
      method: 'PUT',
      headers: this.getHeaders(token),
      body: JSON.stringify({
        name: data.name,
        profile_type: data.type,
        conditions: data.conditions,
        allergies: data.allergies,
      }),
    });
    if (!res.ok) throw new Error('Falha ao atualizar perfil de saúde no Rails.');
  }

  async deleteProfile(profileId: string, token?: string): Promise<void> {
    const res = await fetch(`${RAILS_API_URL}/profiles/${profileId}`, {
      method: 'DELETE',
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Falha ao excluir perfil de saúde no Rails.');
  }

  // --- PRODUCTS SECTION ---
  async getProduct(barcode: string, token?: string): Promise<Product | null> {
    const res = await fetch(`${RAILS_API_URL}/products/${barcode}`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('Erro ao buscar produto.');
    const data = await res.json();
    return {
      barcode: data.barcode,
      name: data.name,
      brand: data.brand || '',
      model: data.model || '',
      country: data.country || '',
      language: data.language || '',
      ingredientsText: data.ingredients_text,
      ingredientsOriginal: data.ingredients_original || '',
      nutritionalInfo: data.nutritional_info || '',
      lastProcessed: data.last_processed ? new Date(data.last_processed) : undefined,
    };
  }

  async saveProduct(product: Omit<Product, 'lastProcessed'>, token?: string): Promise<void> {
    const res = await fetch(`${RAILS_API_URL}/products`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify({
        barcode: product.barcode,
        name: product.name,
        brand: product.brand,
        model: product.model,
        country: product.country,
        language: product.language,
        ingredients_text: product.ingredientsText,
        ingredients_original: product.ingredientsOriginal,
        nutritional_info: product.nutritionalInfo,
      }),
    });
    if (!res.ok) throw new Error('Falha ao salvar produto no Rails.');
  }

  // --- SCANS SECTION ---
  async getScans(profileId: string, token?: string): Promise<ScanRecord[]> {
    const res = await fetch(`${RAILS_API_URL}/profiles/${profileId}/scans`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Falha ao carregar histórico de escaneamentos.');
    const data = await res.json();
    return data.map((item: any) => ({
      id: String(item.id),
      productName: item.product_name,
      status: item.status,
      reason: item.reason,
      timestamp: new Date(item.created_at),
      ingredients: item.ingredients,
      userRating: item.user_rating,
      userComment: item.user_comment,
    }));
  }

  async createScan(profileId: string, data: Omit<ScanRecord, 'id' | 'timestamp'>, token?: string): Promise<string> {
    const res = await fetch(`${RAILS_API_URL}/profiles/${profileId}/scans`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify({
        product_name: data.productName,
        status: data.status,
        reason: data.reason,
        ingredients: data.ingredients,
        user_rating: data.userRating,
        user_comment: data.userComment,
      }),
    });
    if (!res.ok) throw new Error('Falha ao registrar leitura no Rails.');
    const result = await res.json();
    return String(result.id);
  }

  async updateScanEvaluation(profileId: string, scanId: string, rating: number, comment: string, token?: string): Promise<void> {
    const res = await fetch(`${RAILS_API_URL}/profiles/${profileId}/scans/${scanId}`, {
      method: 'PUT',
      headers: this.getHeaders(token),
      body: JSON.stringify({
        user_rating: rating,
        user_comment: comment,
      }),
    });
    if (!res.ok) throw new Error('Falha ao classificar leitura no Rails.');
  }

  async deleteScan(profileId: string, scanId: string, token?: string): Promise<void> {
    const res = await fetch(`${RAILS_API_URL}/profiles/${profileId}/scans/${scanId}`, {
      method: 'DELETE',
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Falha ao remover escaneamento no Rails.');
  }

  // --- GEMINI PROXY ANALYSIS ---
  async analyzeWithGemini(
    imageBase64: string, 
    profile: HealthProfile, 
    token?: string
  ): Promise<any> {
    const res = await fetch(`${RAILS_API_URL}/gemini/analyze`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify({
        image_base64: imageBase64,
        profile: {
          name: profile.name,
          conditions: profile.conditions,
          allergies: profile.allergies,
        }
      }),
    });
    if (!res.ok) throw new Error('Falha na análise inteligente via Gemini.');
    return res.json();
  }

  async recognizeProduct(imageBase64: string, token?: string): Promise<any> {
    const res = await fetch(`${RAILS_API_URL}/gemini/recognize`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify({ image_base64: imageBase64 }),
    });
    if (!res.ok) throw new Error('Erro no reconhecimento rápido de rótulo.');
    return res.json();
  }
}

export const apiClient = new ApiClient();
