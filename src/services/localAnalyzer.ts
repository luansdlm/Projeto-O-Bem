import { HealthProfile } from '../domain/entities/user';
import { Product } from '../domain/entities/product';
import { AnalysisResult } from '../domain/repositories/aiRepository';

// Dicionário de sinônimos e palavras-chave de risco em português
const riskDictionary: Record<string, string[]> = {
  // Alergias comuns
  'leite': ['leite', 'lactose', 'soro de leite', 'caseina', 'caseína', 'manteiga', 'nata', 'iogurte', 'queijo', 'coalho', 'derivado de leite'],
  'ovo': ['ovo', 'gema', 'clara', 'albumina', 'ovos', 'gema de ovo', 'clara de ovo', 'lecitina de ovo'],
  'glúten': ['trigo', 'glúten', 'gluten', 'centeio', 'cevada', 'aveia', 'malte', 'farinha de trigo', 'sêmola'],
  'gluten': ['trigo', 'glúten', 'gluten', 'centeio', 'cevada', 'aveia', 'malte', 'farinha de trigo', 'sêmola'],
  'soja': ['soja', 'lecitina de soja', 'óleo de soja', 'oleo de soja', 'proteína de soja', 'proteina de soja'],
  'amendoim': ['amendoim', 'pasta de amendoim', 'oleo de amendoim', 'óleo de amendoim'],
  'castanha': ['castanha', 'nozes', 'amêndoa', 'amendoas', 'avelã', 'pistache', 'macadâmia', 'oleaginosas', 'caju'],
  'peixe': ['peixe', 'atum', 'sardinha', 'salmão', 'bacalhau', 'pescado'],
  'crustáceo': ['camarão', 'camarao', 'caranguejo', 'lagosta', 'siri', 'crustaceo', 'crustáceos'],

  // Condições especiais
  'g6pd': [
    // Corantes proibidos / restritos para G6PD
    'azul brilhante', 'azul de metileno', 'azul patente', 'azul indigotina', 'indigotina', 'ci 42090',
    'amarelo crepúsculo', 'amarelo tartrazina', 'tartrazina', 'ci 19140', 'ci 15985',
    'vermelho 40', 'vermelho allura', 'allura', 'ci 16035',
    'eritrosina', 'ins 127', 'ins127', 'vermelho 3', 'erythrosine', 'red 3', 'ci 45430',
    'corante artificial', 'corante sintético', 'corantes artificiais', 'corantes sintéticos',
    // Sulfas e conservantes
    'sulfito', 'metabissulfito', 'bissulfito', 'enxofre',
    // Leguminosas proibidas para G6PD
    'fava', 'favas', 'vicia faba', 'feijão faba',
    // Outros
    'naftalina', 'mentol', 'canfora', 'cânfora'
  ],
  'diabetes': ['açúcar', 'acucar', 'sacarose', 'maltodextrina', 'frutose', 'xarope de milho', 'glicose', 'dextrose', 'açúcar invertido', 'mel'],
  'hipertensão': ['sódio', 'sodio', 'sal', 'cloreto de sódio', 'cloreto de sodio', 'glutamato monossódico', 'bicarbonato de sódio'],
  'celíacos': ['trigo', 'glúten', 'gluten', 'centeio', 'cevada', 'aveia', 'malte', 'farinha de trigo'],
  'celiaco': ['trigo', 'glúten', 'gluten', 'centeio', 'cevada', 'aveia', 'malte', 'farinha de trigo'],

  // Sinonímia dos novos itens desmembrados (AINEs e Corantes)
  'ibuprofeno': ['ibuprofeno', 'advil', 'alivium', 'motrin', 'ibuprofen'],
  'aspirina': ['aspirina', 'aas', 'ácido acetilsalicílico', 'acido acetilsalicilico', 'acetylsalicylic acid', 'asfina'],
  'nimesulida': ['nimesulida', 'nimesulide', 'scaflog'],
  'cetoprofeno': ['cetoprofeno', 'profenid', 'ketoprofen'],
  'diclofenaco': ['diclofenaco', 'voltaren', 'cataflam', 'diclofenac'],
  'tartrazina': ['tartrazina', 'amarelo 5', 'amarelo n 5', 'tartrazine', 'ci 19140', 'yellow 5'],
  'amarelo crepúsculo': ['crepúsculo', 'crepusculo', 'amarelo 6', 'amarelo n 6', 'sunset yellow', 'ci 15985', 'yellow 6'],
  'vermelho 40': ['vermelho 40', 'vermelho allura', 'allura red', 'red 40', 'ci 16035', 'vermelho allura ac'],
  'azul brilhante': ['azul brilhante', 'azul 1', 'brilliant blue', 'blue 1', 'ci 42090', 'azul brilhante fcf'],
  'azul patente v': ['patente v', 'patent blue', 'ci 42051', 'azul patente v'],
  'eritrosina': ['eritrosina', 'vermelho 3', 'erythrosine', 'red 3', 'ci 45430'],
  'sulfadiazina': ['sulfadiazina', 'sulfadiazine'],
  'sulfametoxazol': ['sulfametoxazol', 'sulfamethoxazole', 'bactrim'],
  'lidocaína': ['lidocaína', 'lidocaina', 'xylocaina', 'xilocaína', 'lidocaine'],
  'prilocaína': ['prilocaína', 'prilocaina', 'prilocaine'],
  'benzocaína': ['benzocaína', 'benzocaina', 'benzocaine']
};

export function analyzeIngredientsLocally(product: Product, profile: HealthProfile): AnalysisResult {
  const ingredientsLower = product.ingredientsText.toLowerCase();
  const matchedRisks: string[] = [];
  const matchedAllergensAndConditions: string[] = [];

  // 1. Verificar alergias do perfil do usuário
  profile.allergies.forEach(allergy => {
    const allergyKey = allergy.toLowerCase().trim();
    // Procurar por regras específicas no dicionário
    const keywords = riskDictionary[allergyKey] || [allergyKey];
    
    const foundKeywords = keywords.filter(keyword => {
      // Usar regex simples para evitar correspondências parciais com palavras normais
      const regex = new RegExp(`\\b${keyword}\\b|${keyword}`, 'i');
      return regex.test(ingredientsLower);
    });

    if (foundKeywords.length > 0) {
      matchedRisks.push(...foundKeywords);
      matchedAllergensAndConditions.push(`Alergia a ${allergy}`);
    }
  });

  // 2. Verificar condições do perfil do usuário
  profile.conditions.forEach(condition => {
    let conditionKey = condition.toLowerCase().trim();
    if (conditionKey.includes('g6pd')) {
      conditionKey = 'g6pd';
    } else if (conditionKey.includes('celíac') || conditionKey.includes('celiac')) {
      conditionKey = 'celíacos';
    } else if (conditionKey.includes('diabet')) {
      conditionKey = 'diabetes';
    } else if (conditionKey.includes('hiperten')) {
      conditionKey = 'hipertensão';
    }

    const keywords = riskDictionary[conditionKey] || [conditionKey];

    const foundKeywords = keywords.filter(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b|${keyword}`, 'i');
      return regex.test(ingredientsLower);
    });

    if (foundKeywords.length > 0) {
      matchedRisks.push(...foundKeywords);
      matchedAllergensAndConditions.push(`Condição ${condition}`);
    }
  });

  // Determinar status, criticality e justificativa
  let status: 'green' | 'yellow' | 'red' = 'green';
  let riskCriticality: 'high' | 'medium' | 'low' = 'low';
  let reason = 'Produto seguro para consumo com base no perfil indicado!';

  const hasNoRestrictions = (!profile.conditions || profile.conditions.length === 0) && (!profile.allergies || profile.allergies.length === 0);
  if (hasNoRestrictions) {
    reason = 'Nenhuma restrição de saúde ou alergia está configurada no seu perfil ativo. Exibindo as informações gerais e a tabela nutricional do produto de forma livre.';
  } else if (matchedRisks.length > 0) {
    // Se contiver algum alérgeno direto, status vermelho
    const hasRedAllergen = matchedAllergensAndConditions.some(label => label.startsWith('Alergia'));
    const containsProhibitedG6PD = profile.conditions && profile.conditions.some(c => c.toLowerCase().includes('g6pd')) && 
                                   matchedRisks.some(r => riskDictionary['g6pd'].includes(r));

    if (hasRedAllergen || containsProhibitedG6PD) {
      status = 'red';
      riskCriticality = 'high';
      reason = `PERIGO DETECTADO: Este produto contém ingredientes inadequados para ${profile.name} devido a: ${matchedAllergensAndConditions.join(', ')}. Ingredientes identificados de risco: ${Array.from(new Set(matchedRisks)).join(', ')}.`;
    } else {
      // Outros alérgenos indiretos / condições como excesso de açúcar ou sódio
      status = 'yellow';
      riskCriticality = 'medium';
      reason = `ATENÇÃO: Recomenda-se cautela. Ingredientes identificados que exigem atenção para ${profile.name}: ${Array.from(new Set(matchedRisks)).join(', ')}.`;
    }
  }

  return {
    status,
    reason,
    identifiedIngredients: product.ingredientsOriginal ? product.ingredientsOriginal.split(', ') : [],
    translatedIngredients: product.ingredientsText,
    detectedLanguage: product.language || 'Não indicado',
    detectedProductName: product.name,
    riskCriticality,
    detectedBrand: product.brand,
    detectedModel: product.model,
    detectedCountry: product.country,
    detectedNutritionalInfo: product.nutritionalInfo
  };
}
