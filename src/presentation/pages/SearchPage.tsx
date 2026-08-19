import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Search, 
  Columns3, 
  X, 
  Check, 
  Info, 
  Scale, 
  Database, 
  Globe, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle,
  Maximize2,
  Trash2
} from 'lucide-react';
import { Product } from '../../domain/entities/product';
import { ProductRepository } from '../../data/repositories/productRepository';
import { cn } from '../../lib/utils';

// Pre-seeded products representing different categories (food, hygiene, medicine)
const PRE_SEEDED_PRODUCTS: Product[] = [
  {
    barcode: "7891000100201",
    name: "Pão Integral de Forma Premium",
    brand: "Nortene Alimentos",
    model: "Sem glúten & Zero Açúcar",
    country: "Brasil",
    language: "pt",
    ingredientsText: "Farinha de trigo integral, água filtrada, fibra de aveia, fermento biológico seco, sal marinho iodado, óleo extra virgem de girassol, edulcorante natural eritritol.",
    ingredientsOriginal: "",
    nutritionalInfo: "Calorias: 112 kcal por porção (50g)\nSódio: 130mg\nAçúcares: 0.2g\nGorduras Totais: 1.6g\nFibras: 4.8g\nProteínas: 5.2g"
  },
  {
    barcode: "7892000200302",
    name: "Iogurte Grego Natural Triplo Zero",
    brand: "Lactea Fit",
    model: "Zero Lactose & Desnatado",
    country: "Brasil",
    language: "pt",
    ingredientsText: "Leite integral pasteurizado reconstituído, proteínas lácteas concentradas de soro de leite, enzima lactase purificada, fermentos lácteos ativos selecionados (LPC-40).",
    ingredientsOriginal: "",
    nutritionalInfo: "Calorias: 78 kcal por pote (130g)\nSódio: 55mg\nAçúcares: 3.8g\nGorduras Totais: 0.1g\nProteínas: 11.5g\nCálcio: 240mg"
  },
  {
    barcode: "7893000300403",
    name: "Chocolate Amargo Orgânico 85%",
    brand: "Cacau Puro Sul",
    model: "Vegan & High Cocoa",
    country: "Equador",
    language: "pt",
    ingredientsText: "Massa de cacau orgânica, manteiga de cacau de prensa a frio, açúcar demerara orgânico em pequena proporção, extrato natural de fava de baunilha de Madagascar.",
    ingredientsOriginal: "",
    nutritionalInfo: "Calorias: 165 kcal por porção (25g)\nSódio: 0.8mg\nAçúcares: 2.1g\nGorduras Totais: 14g\nFibras: 3.2g\nProteínas: 2.4g"
  },
  {
    barcode: "7894000400504",
    name: "Creme Dental Clareador Herbal",
    brand: "Hygia Bio",
    model: "Menta & Carvão Ativo",
    country: "Alemanha",
    language: "pt",
    ingredientsText: "Monofluorfosfato de Sódio (1450 ppm), Carbonato de Cálcio refinado, Água desmineralizada, Glicerina vegetal, Extrato de Menta Piperita, Carvão vegetal ativado em pó.",
    ingredientsOriginal: "",
    nutritionalInfo: "Flúor Ativo: 1450 ppm\nSódio: N/A\nAçúcares: 0g\nGorduras Totais: 0g\nNível de Abrasividade: RDA 80 (Moderado)"
  },
  {
    barcode: "7895000500605",
    name: "Protetor Solar Facial Ultra FPS 60",
    brand: "DermaShield",
    model: "Toque Seco & Oil Free",
    country: "França",
    language: "pt",
    ingredientsText: "Água termal purificada, Dióxido de Titânio microparticulado, Avobenzona, Octisalato, Glicerina hidratante, Dimeticona protetora, Álcool Cetílico espessante, Sílica antibrilho.",
    ingredientsOriginal: "",
    nutritionalInfo: "Fator de Proteção Solar (FPS): 60\nPPD (Proteção UVA): 24\nSódio: N/A\nAçúcares: 0g\nGorduras Totais: 0g"
  },
  {
    barcode: "7896000600706",
    name: "Comprimidos de Paracetamol 500mg",
    brand: "Sanofi Pharma",
    model: "Analgésico & Antitérmico",
    country: "Brasil",
    language: "pt",
    ingredientsText: "Paracetamol (princípio ativo 500mg), amido de milho pregelatinizado, dióxido de silício coloidal, estearato de magnésio vegetal, povidona K30 de alta solubilidade.",
    ingredientsOriginal: "",
    nutritionalInfo: "Dosagem Princípio Ativo: 500mg por comprimido\nSódio no Componente: 0mg\nAçúcares: 0g\nUso: Adulto e Pediátrico acima de 12 anos"
  },
  {
    barcode: "7897000700807",
    name: "Cereal de Aveia & Mel em Flocos",
    brand: "Campo Verde",
    model: "Integral e Crocante",
    country: "Argentina",
    language: "pt",
    ingredientsText: "Aveia integral em flocos prensados, mel silvestre de abelhas purificado, flocos de arroz crocantes, extrato de malte de cevada, óleo de palma sustentável RSPO, sal iodado.",
    ingredientsOriginal: "",
    nutritionalInfo: "Calorias: 142 kcal por porção (40g)\nSódio: 68mg\nAçúcares: 9.3g\nGorduras Totais: 3.1g\nFibras: 3.5g\nProteínas: 3.0g"
  },
  {
    barcode: "7898000800908",
    name: "Sabonete Líquido Vegano Sensitive",
    brand: "AromaFlora",
    model: "Hipoalergênico & Camomila",
    country: "Brasil",
    language: "pt",
    ingredientsText: "Extrato concentrado de Camomila Romana, Lauril Éter Sulfosuccinato de Sódio suave, Cocamidopropil Betaína, Glicerina vegetal bidestilada, Ácido Cítrico, Conservante natural benzoato de sódio.",
    ingredientsOriginal: "",
    nutritionalInfo: "pH Fisiológico: 5.5\nSódio: N/A\nAçúcares: 0g\nGorduras Totais: 0g\nLivre de parabenos, sulfatos e corantes sintéticos."
  }
];

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [allProducts, setAllProducts] = useState<Product[]>(PRE_SEEDED_PRODUCTS);
  const [searchResults, setSearchResults] = useState<Product[]>(PRE_SEEDED_PRODUCTS);
  const [selectedForCompare, setSelectedForCompare] = useState<Product[]>([]);
  const [expandedIngredientsIdx, setExpandedIngredientsIdx] = useState<Record<string, boolean>>({});
  const [expandedNutritionalIdx, setExpandedNutritionalIdx] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [compareModalOpen, setCompareModalOpen] = useState(false);

  const appLang = localStorage.getItem('safelabel_lang') || 'pt';

  // Text translations local mapping for high accessibility
  const t = {
    title: appLang === 'en' ? 'Global Catalog' : appLang === 'es' ? 'Catálogo Global' : 'Catálogo de Produtos',
    subtitle: appLang === 'en' ? 'Search & Free Comparative Tool' : appLang === 'es' ? 'Buscador y Comparador Libre' : 'Busca Global e Comparação Livre',
    description: appLang === 'en' ? 'Strictly neutral access. No clinical warnings are showing here. Consult and compare lists.' : appLang === 'es' ? 'Acceso estrictamente neutro. No se muestran advertencias aquí. Consulte y compare.' : 'Espaço neutro e informativo sem recomendações clínicas ou alertas baseados no perfil. Acesse livremente.',
    placeholder: appLang === 'en' ? 'Search by product, brand or ingredient...' : appLang === 'es' ? 'Buscar por producto, marca o ingrediente...' : 'Buscar por produto, marca ou ingrediente...',
    barcode: appLang === 'en' ? 'Barcode' : appLang === 'es' ? 'Código de barras' : 'Código de Barras',
    ingredients: appLang === 'en' ? 'Ingredients List' : appLang === 'es' ? 'Lista de Ingredientes' : 'Lista de Ingredientes',
    nutritional: appLang === 'en' ? 'Nutritional Fact Sheet / Info' : appLang === 'es' ? 'Tabla de Información Nutricional' : 'Informações / Tabela Nutricional',
    noResults: appLang === 'en' ? 'No products matches.' : appLang === 'es' ? 'No se encontraron productos.' : 'Nenhum produto encontrado.',
    addCompare: appLang === 'en' ? 'Add to compare' : appLang === 'es' ? 'Agregar a comparación' : 'Adicionar à comparação',
    addedCompare: appLang === 'en' ? 'In comparison' : appLang === 'es' ? 'En comparación' : 'Na comparação',
    selectedItems: appLang === 'en' ? 'products selected' : appLang === 'es' ? 'productos seleccionados' : 'produtos selecionados',
    compareNow: appLang === 'en' ? 'Compare Now' : appLang === 'es' ? 'Comparar Agora' : 'Comparar Agora',
    limitMessage: appLang === 'en' ? 'You can only compare up to 3 products at a time.' : appLang === 'es' ? 'Solo puedes comparar hasta 3 productos a la vez.' : 'Você só pode comparar até 3 produtos por vez.',
    compareTitle: appLang === 'en' ? 'Side-by-Side Comparison' : appLang === 'es' ? 'Comparación Lado a Lado' : 'Comparação Lado a Lado',
    calories: appLang === 'en' ? 'Calories' : appLang === 'es' ? 'Calorías' : 'Calorias',
    sodium: appLang === 'en' ? 'Sodium' : appLang === 'es' ? 'Sódio' : 'Sódio',
    sugars: appLang === 'en' ? 'Sugars' : appLang === 'es' ? 'Azúcares' : 'Açúcares',
    fats: appLang === 'en' ? 'Fats' : appLang === 'es' ? 'Gorduras' : 'Gorduras',
    remove: appLang === 'en' ? 'Remove' : appLang === 'es' ? 'Quitar' : 'Remover',
    close: appLang === 'en' ? 'Close' : appLang === 'es' ? 'Cerrar' : 'Fechar',
    brand: appLang === 'en' ? 'Brand / Line' : appLang === 'es' ? 'Marca / Línea' : 'Marca / Linha',
  };

  // Toast utility
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Load any created products from Firestore and merge
  useEffect(() => {
    const fetchCreatedProducts = async () => {
      try {
        const repo = new ProductRepository();
        // Since getCachedProducts is private, we will query custom scanned items from localStorage or try to get Firestore products
        const storedBarcodesKey = 'safe_cached_product_barcodes';
        const barcodes: string[] = JSON.parse(localStorage.getItem(storedBarcodesKey) || '[]');
        
        const loaded: Product[] = [];
        for (const code of barcodes) {
          const cached = localStorage.getItem(`safe_product_${code}`);
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              loaded.push(parsed);
            } catch (_) {}
          }
        }

        if (loaded.length > 0) {
          // Merge unique barcodes
          const merged = [...PRE_SEEDED_PRODUCTS];
          for (const item of loaded) {
            if (!merged.some(p => p.barcode === item.barcode)) {
              merged.push(item);
            }
          }
          setAllProducts(merged);
          setSearchResults(merged);
        }
      } catch (err) {
        console.error("Error loading products catalog:", err);
      }
    };

    fetchCreatedProducts();
  }, []);

  // Handle Search Filtering
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults(allProducts);
      return;
    }

    const queryLower = searchTerm.toLowerCase().trim();
    const filtered = allProducts.filter(product => {
      const nameMatch = (product.name || '').toLowerCase().includes(queryLower);
      const brandMatch = (product.brand || '').toLowerCase().includes(queryLower);
      const barcodeMatch = (product.barcode || '').includes(queryLower);
      const ingredientsMatch = (product.ingredientsText || '').toLowerCase().includes(queryLower);
      const modelMatch = (product.model || '').toLowerCase().includes(queryLower);
      
      return nameMatch || brandMatch || barcodeMatch || ingredientsMatch || modelMatch;
    });

    setSearchResults(filtered);
  }, [searchTerm, allProducts]);

  // Collapsible Toggles
  const toggleIngredients = (barcode: string) => {
    setExpandedIngredientsIdx(prev => ({
      ...prev,
      [barcode]: !prev[barcode]
    }));
  };

  const toggleNutritional = (barcode: string) => {
    setExpandedNutritionalIdx(prev => ({
      ...prev,
      [barcode]: !prev[barcode]
    }));
  };

  // Add/Remove from Comparison
  const handleToggleCompare = (product: Product, event: React.MouseEvent) => {
    event.stopPropagation();
    
    const isSelected = selectedForCompare.some(p => p.barcode === product.barcode);
    if (isSelected) {
      setSelectedForCompare(prev => prev.filter(p => p.barcode !== product.barcode));
    } else {
      if (selectedForCompare.length >= 3) {
        showToast(t.limitMessage);
        return;
      }
      setSelectedForCompare(prev => [...prev, product]);
    }
  };

  const handleRemoveFromCompare = (barcode: string) => {
    setSelectedForCompare(prev => prev.filter(p => p.barcode !== barcode));
  };

  // Nutritional parser to strip calories, sodium, sugars, and fats to aid premium tabular comparison of generic text
  const getParsedNutrient = (product: Product, keys: string[]): string => {
    const text = product.nutritionalInfo || '';
    if (!text) return 'N/E'; // Não Especificado
    const lines = text.split('\n');
    for (const line of lines) {
      for (const key of keys) {
        if (line.toLowerCase().includes(key.toLowerCase())) {
          // Extract everything after colon or simple text match
          const part = line.split(':');
          if (part.length > 1) {
            return part[1].trim();
          }
          return line.trim();
        }
      }
    }
    // Fallback search inside ingredients or raw string if simple match fails
    return 'N/E';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans p-6 text-slate-800 dark:text-slate-100 transition-colors pb-32">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* TOP HEADER SECTION */}
        <header className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')}
              className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 active:scale-95 transition-all w-11 h-11 flex items-center justify-center"
              title={appLang === 'en' ? 'Back' : appLang === 'es' ? 'Volver' : 'Voltar'}
              aria-label={appLang === 'en' ? 'Back' : appLang === 'es' ? 'Volver' : 'Voltar'}
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-white leading-tight">{t.title}</h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mt-0.5">
                {t.subtitle}
              </p>
            </div>
          </div>
        </header>

        {/* NEUTRALITY INFO NOTICE */}
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 p-4 rounded-2xl flex gap-3">
          <Info className="text-blue-500 dark:text-blue-400 shrink-0 mt-0.5" size={18} />
          <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed font-medium">
            {t.description}
          </p>
        </div>

        {/* SEARCH BAR (PROMINENT INPUT - UX WRITING PLACEHOLDER) */}
        <div className="relative">
          <Search className="absolute left-4 top-3.5 text-slate-400 dark:text-slate-500 w-5 h-5" />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t.placeholder}
            className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-250/60 dark:border-white/10 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm text-slate-900 dark:text-white placeholder-slate-450 dark:placeholder-slate-550 shadow-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-650 dark:hover:text-slate-200"
              aria-label="Clear Search"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* SEARCH RESULTS / PRODUCTS LIST */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
              {searchResults.length} {searchResults.length === 1 ? (appLang === 'en' ? 'Product' : 'Produto') : (appLang === 'en' ? 'Products' : 'Produtos')}
            </span>
          </div>

          {searchResults.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 py-12 px-6 rounded-3xl border border-slate-100 dark:border-white/5 text-center flex flex-col items-center justify-center shadow-sm">
              <span className="text-4xl mb-3">🔍</span>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold">{t.noResults}</p>
            </div>
          ) : (
            searchResults.map((product) => {
              const barcode = product.barcode;
              const isSelected = selectedForCompare.some(p => p.barcode === barcode);
              const isIngExpanded = !expandedIngredientsIdx[barcode]; // Default expanded or collapsed
              const isNutExpanded = !!expandedNutritionalIdx[barcode];

              return (
                <div 
                  key={barcode}
                  className="bg-white dark:bg-slate-900 border border-slate-150/85 dark:border-white/5 hover:border-blue-500/50 dark:hover:border-blue-400/50 rounded-3xl p-5 shadow-sm transition-all duration-200"
                >
                  {/* Top product meta */}
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <div className="space-y-1">
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-550 dark:text-slate-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        {product.brand || "Marca Global"}
                      </span>
                      <h3 className="text-base font-extrabold text-slate-800 dark:text-white leading-tight mt-1">
                        {product.name}
                      </h3>
                      {product.model && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          {product.model}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-1.5 text-xs text-slate-405 dark:text-slate-450 pt-1">
                        <span className="font-sans uppercase text-[10px] font-extrabold tracking-wider">{t.barcode}:</span>
                        <code className="bg-slate-50 dark:bg-slate-950 font-mono text-[11px] font-bold text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">
                          {barcode}
                        </code>
                      </div>
                    </div>

                    {/* COMPARISON ACTION BUTTON */}
                    <button
                      onClick={(e) => handleToggleCompare(product, e)}
                      className={cn(
                        "px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all outline-none border shadow-xs whitespace-nowrap active:scale-95",
                        isSelected 
                          ? "bg-blue-600 dark:bg-blue-600 text-white border-blue-600 dark:border-blue-600 hover:bg-blue-700 hover:border-blue-700" 
                          : "bg-slate-50 dark:bg-slate-800 text-slate-650 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-751 hover:text-blue-600 dark:hover:text-blue-400"
                      )}
                      title={isSelected ? t.addedCompare : t.addCompare}
                    >
                      {isSelected ? <Check size={13} className="stroke-[2.5]" /> : <Scale size={13} />}
                      <span>{isSelected ? t.addedCompare : t.addCompare}</span>
                    </button>
                  </div>

                  {/* COLLAPSIBLE REGION: INGREDIENTS LIST */}
                  <div className="border-t border-slate-100 dark:border-white/5 py-3">
                    <button 
                      onClick={() => toggleIngredients(barcode)}
                      className="w-full flex items-center justify-between text-xs font-extrabold text-slate-600 dark:text-slate-350 uppercase tracking-widest outline-none py-1.5 hover:text-blue-600 dark:hover:text-blue-450 transition-colors"
                    >
                      <span>{t.ingredients}</span>
                      {isIngExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>
                    
                    <AnimatePresence initial={false}>
                      {isIngExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50/70 dark:bg-slate-950/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-812/30 mt-2">
                            {product.ingredientsText}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* COLLAPSIBLE REGION: NUTRITIONAL SHEET */}
                  {product.nutritionalInfo && (
                    <div className="border-t border-slate-100 dark:border-white/5 pt-3">
                      <button 
                        onClick={() => toggleNutritional(barcode)}
                        className="w-full flex items-center justify-between text-xs font-extrabold text-slate-600 dark:text-slate-350 uppercase tracking-widest outline-none py-1.5 hover:text-blue-600 dark:hover:text-blue-450 transition-colors"
                      >
                        <span>{t.nutritional}</span>
                        {isNutExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </button>
                      
                      <AnimatePresence initial={false}>
                        {isNutExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50/70 dark:bg-slate-950/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-812/30 whitespace-pre-line font-mono mt-2">
                              {product.nutritionalInfo}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>

      </div>

      {/* 
        =======================================================
        BOTTOM FLOATING BAR (GOOGLE MATERIAL DESIGN STYLE)
        =======================================================
      */}
      <AnimatePresence>
        {selectedForCompare.length > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 p-4 md:p-6 bg-white/95 dark:bg-slate-900/95 border-t border-slate-200/80 dark:border-white/10 shadow-[0_-15px_30px_rgba(0,0,0,0.08)] backdrop-blur-md z-40 flex justify-center text-slate-800 dark:text-white"
          >
            <div className="w-full max-w-xl flex items-center justify-between gap-4 font-sans">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-950/50 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Columns3 size={20} className="stroke-[2]" />
                </div>
                <div>
                  <p className="text-sm font-black dark:text-white leading-tight">
                    {selectedForCompare.length} de 3
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold tracking-wide uppercase">
                    {t.selectedItems}
                  </p>
                </div>
              </div>

              {/* ACTION TOGGLES / LIST OF ICONS TO REMOVE DIRECTLY */}
              <div className="hidden sm:flex items-center gap-2 max-w-[200px] truncate">
                {selectedForCompare.map(p => (
                  <div 
                    key={p.barcode}
                    className="relative shrink-0 group"
                    title={`${p.name} (${p.brand})`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate p-1 max-w-[60px]">
                      {p.name.substring(0, 3)}..
                    </div>
                    <button
                      onClick={() => handleRemoveFromCompare(p.barcode)}
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-slate-500 hover:bg-rose-500 dark:bg-slate-700 dark:hover:bg-rose-600 text-white flex items-center justify-center shadow-xs transition-colors"
                      aria-label="Remove item"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3">
                {/* CLEAR ALL */}
                <button
                  onClick={() => setSelectedForCompare([])}
                  className="px-3 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                >
                  {appLang === 'en' ? 'Clear' : appLang === 'es' ? 'Limpiar' : 'Limpar'}
                </button>

                <button
                  onClick={() => setCompareModalOpen(true)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold uppercase tracking-wider rounded-2xl shadow-md transition-all active:scale-95 flex items-center gap-2"
                >
                  <Scale size={14} className="stroke-[2.5]" />
                  <span>{t.compareNow}</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 
        =======================================================
        MICRO-TOAST ALERTA AMIGÁVEL (UP TO 3 PRODUCTS LIMIT)
        =======================================================
      */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-24 left-4 right-4 md:left-auto md:right-6 md:w-80 bg-zinc-900 text-white px-5 py-3.5 rounded-3xl z-50 flex items-center gap-3 shadow-lg border border-white/10 dark:border-slate-800"
          >
            <AlertCircle className="text-blue-400 shrink-0" size={18} />
            <p className="text-xs font-bold leading-normal">{toastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 
        =======================================================
        MODAL: SIDE-BY-SIDE COMPARISON (MOBILE-OPTIMIZED WITH HORIZONTAL SCROLL)
        =======================================================
      */}
      <AnimatePresence>
        {compareModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-6"
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] md:max-h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-white/10"
            >
              
              {/* MODAL HEADER */}
              <div className="px-6 py-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50 dark:bg-slate-850/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-850/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center shadow-xs">
                    <Scale size={20} className="stroke-[2]" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-slate-800 dark:text-white leading-tight">
                      {t.compareTitle}
                    </h2>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                      {selectedForCompare.length} {selectedForCompare.length === 1 ? 'Produto Selecionado' : 'Produtos Selecionados'}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => setCompareModalOpen(false)}
                  className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-710 text-slate-500 dark:text-slate-400 hover:text-slate-750 dark:hover:text-white rounded-full transition-colors active:scale-95"
                  aria-label={t.close}
                >
                  <X size={18} />
                </button>
              </div>

              {/* MODAL COMPARISON TABLE (SCROLL HORIZONTAL) */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-755">
                  <table className="w-full min-w-[650px] border-collapse text-left text-xs font-sans table-fixed">
                    <thead>
                      <tr className="border-b border-slate-150 dark:border-white/10 bg-slate-50/70 dark:bg-slate-800/10">
                        {/* Empty corner header cell for attributes label */}
                        <th className="w-48 p-4 font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Especificações
                        </th>
                        
                        {/* 1, 2, or 3 products headers */}
                        {selectedForCompare.map(p => (
                          <th 
                            key={p.barcode} 
                            className="p-4 align-top font-sans text-slate-900 dark:text-slate-50 border-l border-slate-100 dark:border-white/5 relative"
                          >
                            <div className="space-y-1.5 pr-6">
                              <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-550 dark:text-slate-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                {p.brand || "Marca"}
                              </span>
                              <h4 className="font-extrabold text-sm line-clamp-2 leading-tight">
                                {p.name}
                              </h4>
                              {p.model && (
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                                  {p.model}
                                </p>
                              )}
                              <p className="font-mono text-[10px] text-slate-400 dark:text-slate-550">
                                {p.barcode}
                              </p>
                            </div>

                            {/* REMOVE COLUMN BUTTON */}
                            <button
                              onClick={() => handleRemoveFromCompare(p.barcode)}
                              className="absolute top-4 right-4 p-1 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 dark:bg-slate-800 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors"
                              title={t.remove}
                            >
                              <X size={14} />
                            </button>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      
                      {/* BRAND ROW */}
                      <tr className="hover:bg-slate-50/40 dark:hover:bg-slate-850/10">
                        <td className="p-4 font-bold text-slate-500 dark:text-slate-400 bg-slate-50/10 dark:bg-slate-900/10">
                          {t.brand}
                        </td>
                        {selectedForCompare.map(p => (
                          <td key={p.barcode} className="p-4 border-l border-slate-100 dark:border-white/5 text-slate-800 dark:text-slate-205 font-medium">
                            {p.brand || '---'}
                          </td>
                        ))}
                      </tr>

                      {/* CALORIES ROW */}
                      <tr className="hover:bg-slate-50/40 dark:hover:bg-slate-850/10">
                        <td className="p-4 font-bold text-slate-500 dark:text-slate-400 bg-slate-50/10 dark:bg-slate-900/10 flex items-center gap-1.5">
                          🔥 {t.calories}
                        </td>
                        {selectedForCompare.map(p => {
                          const nutrientVal = getParsedNutrient(p, ['caloria', 'calorie', 'energético', 'kcal']);
                          return (
                            <td key={p.barcode} className="p-4 border-l border-slate-100 dark:border-white/5 font-semibold text-slate-900 dark:text-slate-100">
                              {nutrientVal}
                            </td>
                          );
                        })}
                      </tr>

                      {/* SODIUM ROW */}
                      <tr className="hover:bg-slate-50/40 dark:hover:bg-slate-850/10">
                        <td className="p-4 font-bold text-slate-500 dark:text-slate-400 bg-slate-50/10 dark:bg-slate-900/10 flex items-center gap-1.5">
                          🧂 {t.sodium}
                        </td>
                        {selectedForCompare.map(p => {
                          const nutrientVal = getParsedNutrient(p, ['sódio', 'sodium', 'sodio']);
                          return (
                            <td key={p.barcode} className="p-4 border-l border-slate-100 dark:border-white/5 font-semibold text-slate-900 dark:text-slate-100">
                              {nutrientVal}
                            </td>
                          );
                        })}
                      </tr>

                      {/* SUGARS ROW */}
                      <tr className="hover:bg-slate-50/40 dark:hover:bg-slate-850/10">
                        <td className="p-4 font-bold text-slate-500 dark:text-slate-400 bg-slate-50/10 dark:bg-slate-900/10 flex items-center gap-1.5">
                          🍬 {t.sugars}
                        </td>
                        {selectedForCompare.map(p => {
                          const nutrientVal = getParsedNutrient(p, ['açúcar', 'sugar', 'acucar', 'açúcares', 'azucar']);
                          return (
                            <td key={p.barcode} className="p-4 border-l border-slate-100 dark:border-white/5 font-semibold text-slate-900 dark:text-slate-100">
                              {nutrientVal}
                            </td>
                          );
                        })}
                      </tr>

                      {/* FATS ROW */}
                      <tr className="hover:bg-slate-50/40 dark:hover:bg-slate-850/10">
                        <td className="p-4 font-bold text-slate-500 dark:text-slate-400 bg-slate-50/10 dark:bg-slate-900/10 flex items-center gap-1.5">
                          🥑 {t.fats}
                        </td>
                        {selectedForCompare.map(p => {
                          const nutrientVal = getParsedNutrient(p, ['gordura', 'fat', 'grasas', 'lipid']);
                          return (
                            <td key={p.barcode} className="p-4 border-l border-slate-100 dark:border-white/5 font-semibold text-slate-900 dark:text-slate-100">
                              {nutrientVal}
                            </td>
                          );
                        })}
                      </tr>

                      {/* INGREDIENTS CELL - COMPREHENSIVE TEXT */}
                      <tr className="hover:bg-slate-50/40 dark:hover:bg-slate-850/10">
                        <td className="p-4 font-bold text-slate-500 dark:text-slate-400 bg-slate-50/10 dark:bg-slate-900/10 align-top">
                          📝 {t.ingredients}
                        </td>
                        {selectedForCompare.map(p => (
                          <td 
                            key={p.barcode} 
                            className="p-4 border-l border-slate-100 dark:border-white/5 text-slate-650 dark:text-slate-300 leading-relaxed align-top text-[11px] max-h-56 overflow-y-auto"
                          >
                            <div className="bg-slate-50/80 dark:bg-slate-950/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/40">
                              {p.ingredientsText}
                            </div>
                          </td>
                        ))}
                      </tr>

                      {/* FULL NUTRITIONAL FACT SHEET TEXT */}
                      <tr className="hover:bg-slate-50/40 dark:hover:bg-slate-850/10">
                        <td className="p-4 font-bold text-slate-500 dark:text-slate-400 bg-slate-50/10 dark:bg-slate-900/10 align-top">
                          📊 {t.nutritional}
                        </td>
                        {selectedForCompare.map(p => (
                          <td 
                            key={p.barcode} 
                            className="p-4 border-l border-slate-100 dark:border-white/5 text-slate-650 dark:text-slate-300 font-mono text-[11px] leading-relaxed align-top"
                          >
                            {p.nutritionalInfo ? (
                              <div className="bg-slate-50/80 dark:bg-slate-950/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/40 whitespace-pre-line">
                                {p.nutritionalInfo}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">---</span>
                            )}
                          </td>
                        ))}
                      </tr>

                    </tbody>
                  </table>
                </div>
              </div>

              {/* MODAL FOOTER ACTIONS */}
              <div className="px-6 py-4 border-t border-slate-100 dark:border-white/5 flex justify-end bg-slate-50 dark:bg-slate-850/40">
                <button
                  onClick={() => setCompareModalOpen(false)}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold uppercase tracking-wider rounded-2xl shadow-md transition-all active:scale-95"
                >
                  {t.close}
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
