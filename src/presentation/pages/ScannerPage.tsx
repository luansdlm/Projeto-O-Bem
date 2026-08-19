import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  RotateCcw, 
  ThumbsUp, 
  TriangleAlert, 
  Octagon, 
  ArrowLeft,
  Loader2,
  ScanLine,
  Image as ImageIcon,
  Search,
  Globe,
  Database,
  Barcode,
  Keyboard,
  Sparkles,
  Info,
  Check,
  FileText,
  Upload
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { HealthProfile } from '../../domain/entities/user';
import { GeminiService } from '../../services/geminiService';
import { AnalysisResult } from '../../domain/repositories/aiRepository';
import RedAlertIcon from '../components/RedAlertIcon';
import { cn } from '../../lib/utils';

import { useAuth } from '../hooks/useAuth';
import { ScanRepository } from '../../data/repositories/scanRepository';
import { ProductRepository } from '../../data/repositories/productRepository';
import { PendingProductRepository } from '../../data/repositories/pendingProductRepository';
import { analyzeIngredientsLocally } from '../../services/localAnalyzer';
import { getTranslations } from '../../lib/translations';

const productRepository = new ProductRepository();

export default function ScannerPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [appLang] = useState(() => localStorage.getItem('safelabel_lang') || 'pt');
  const [appFontSize] = useState(() => localStorage.getItem('safelabel_font_size') || 'normal');
  const t = getTranslations(appLang);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isStartingScanner = useRef(false);
  const isStoppingScanner = useRef(false);
  
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<HealthProfile | null>(null);

  // Estados dos fluxos de Banco de Dados Global / Busca Offline / Manual
  const [barcodeQuery, setBarcodeQuery] = useState("");
  const [isSearchingBarcode, setIsSearchingBarcode] = useState(false);
  const [barcodeError, setBarcodeError] = useState<string | null>(null);
  const [activeBarcode, setActiveBarcode] = useState<string | null>(null);
  const [isSavedGlobally, setIsSavedGlobally] = useState(false);
  const [loadedOffline, setLoadedOffline] = useState(false);

  // Forçar digitação manual em caso de falha de lente/câmera física
  const [showManualInput, setShowManualInput] = useState(false);

  // Vinculação de código de barras pós-análise por IA
  const [showLinkBarcodeScanner, setShowLinkBarcodeScanner] = useState(false);
  const [manualLinkBarcode, setManualLinkBarcode] = useState("");
  const [linkBarcodeError, setLinkBarcodeError] = useState<string | null>(null);
  const [isSearchingBarcodeWithPhoto, setIsSearchingBarcodeWithPhoto] = useState(false);
  const linkScannerRef = useRef<Html5Qrcode | null>(null);
  const linkFileInputRef = useRef<HTMLInputElement>(null);

  // Erro de permissão ou de inicialização da câmera física
  const [cameraPermissionError, setCameraPermissionError] = useState<string | null>(null);

  // Onboarding visual dinâmico
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return localStorage.getItem('safelabel_hide_onboarding') !== 'true';
  });
  
  useEffect(() => {
    if (showOnboarding) {
      const timer = setTimeout(() => {
        setShowOnboarding(false);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [showOnboarding]);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    if (checked) {
      localStorage.setItem('safelabel_hide_onboarding', 'true');
    } else {
      localStorage.removeItem('safelabel_hide_onboarding');
    }
  };

  // Novo fluxo de Cadastro Simplificado na Mesma Tela (Diretriz 4)
  const [showNewProductCard, setShowNewProductCard] = useState(false);
  const [newProductName, setNewProductName] = useState("");

  // Módulo de Mineração de Dados de Produtos (Alimentação da Base de Dados)
  const [isDataMiningActive, setIsDataMiningActive] = useState(false);
  const [miningStep, setMiningStep] = useState(1); // 1: Barcode, 2: Foto Frente, 3: Foto Ingredientes, 4: Revisão da Extração
  const [miningFrontImage, setMiningFrontImage] = useState<string | null>(null);
  const [miningIngredientsImage, setMiningIngredientsImage] = useState<string | null>(null);
  const [miningCategory, setMiningCategory] = useState<'alimento' | 'medicamento' | 'beleza' | 'outro'>('alimento');
  const [miningProductName, setMiningProductName] = useState("");
  const [miningProductBrand, setMiningProductBrand] = useState("");
  const [miningProductModel, setMiningProductModel] = useState("");
  const [miningIngredientsText, setMiningIngredientsText] = useState("");
  const [miningIngredientsOriginal, setMiningIngredientsOriginal] = useState("");
  const [miningNutritionalInfo, setMiningNutritionalInfo] = useState("");
  const [isMiningProcessing, setIsMiningProcessing] = useState(false);
  const [miningSuccess, setMiningSuccess] = useState(false);
  const [miningError, setMiningError] = useState<string | null>(null);

  const hasActiveFilters = !!(
    (selectedProfile?.conditions && selectedProfile.conditions.length > 0) ||
    (selectedProfile?.allergies && selectedProfile.allergies.length > 0)
  );

  // Helper para identificar substâncias violadas com base no perfil (Diretriz 2)
  const getMatchedSubstances = (res: AnalysisResult): string[] => {
    if (!selectedProfile) return [];
    const lowerIngredients = (res.translatedIngredients || "").toLowerCase();
    const lowerReason = (res.reason || "").toLowerCase();
    const matched: string[] = [];

    selectedProfile.allergies.forEach(allergy => {
      const parts = allergy.split('/');
      parts.forEach(part => {
        const cleanPart = part.trim().toLowerCase();
        if (cleanPart.length > 2) {
          if (lowerIngredients.includes(cleanPart) || lowerReason.includes(cleanPart)) {
            matched.push(part.trim());
          }
        }
      });
    });

    selectedProfile.conditions.forEach(cond => {
      const lowerCond = cond.toLowerCase();
      if (lowerCond.includes("g6pd") && (lowerIngredients.includes("g6pd") || lowerReason.includes("g6pd") || lowerIngredients.includes("tartrazina") || lowerIngredients.includes("allura") || lowerIngredients.includes("corante"))) {
        matched.push("G6PD");
      } else if (lowerCond.includes("diabetes") && (lowerIngredients.includes("açúcar") || lowerIngredients.includes("acucar") || lowerIngredients.includes("sacarose") || lowerReason.includes("diabetes") || lowerReason.includes("açúcar") || lowerReason.includes("sugar"))) {
        matched.push(appLang === 'en' ? "Sugar" : appLang === 'es' ? "Azúcar" : "Açúcar");
      } else if (lowerCond.includes("celiaquia") && (lowerIngredients.includes("glúten") || lowerIngredients.includes("gluten") || lowerReason.includes("glúten") || lowerReason.includes("gluten"))) {
        matched.push(appLang === 'en' ? "Gluten" : appLang === 'es' ? "Gluten" : "Glúten");
      }
    });

    const uniqueMatches = Array.from(new Set(matched));
    if (uniqueMatches.length === 0) {
      if (selectedProfile.allergies.length > 0) {
        uniqueMatches.push(selectedProfile.allergies[0].split('/')[0].trim());
      } else if (selectedProfile.conditions.length > 0) {
        uniqueMatches.push(selectedProfile.conditions[0]);
      } else {
        uniqueMatches.push(appLang === 'en' ? "RESTRICTED SUBSTANCE" : appLang === 'es' ? "SUSTANCIA RESTRINGIDA" : "SUBSTÂNCIA RESTRITA");
      }
    }
    return uniqueMatches;
  };

  // Obter textos de UI formatados de forma amigável, informativa e segura (Diretriz 2)
  const getUXWritingForStatus = (status: 'green' | 'yellow' | 'red', matchedSubstances: string[]) => {
    const listString = matchedSubstances.join(", ");
    
    if (status === 'green') {
      if (appLang === 'en') {
        return {
          ui: "All clear. Safe to consume."
        };
      }
      if (appLang === 'es') {
        return {
          ui: "Todo limpio. Seguro para consumir."
        };
      }
      return {
        ui: "Tudo limpo. Seguro para consumir."
      };
    }

    if (status === 'yellow') {
      if (appLang === 'en') {
        return {
          ui: (
            <span>
              Attention. Contains <strong className="font-extrabold uppercase text-amber-600 dark:text-amber-400">{listString}</strong>.
            </span>
          )
        };
      }
      if (appLang === 'es') {
        return {
          ui: (
            <span>
              Atención. Contiene <strong className="font-extrabold uppercase text-amber-600 dark:text-amber-400">{listString}</strong>.
            </span>
          )
        };
      }
      return {
        ui: (
          <span>
            Atenção. Contém <strong className="font-extrabold uppercase text-amber-600 dark:text-amber-400">{listString}</strong>.
          </span>
        )
      };
    }

    // red
    if (appLang === 'en') {
      return {
        ui: (
          <span>
            Avoid. Contains <strong className="font-extrabold uppercase text-rose-600 dark:text-rose-400">{listString}</strong>.
          </span>
        )
      };
    }
    if (appLang === 'es') {
      return {
        ui: (
          <span>
            Evite. Contiene <strong className="font-extrabold uppercase text-rose-600 dark:text-rose-450">{listString}</strong>.
          </span>
        )
      };
    }
    return {
      ui: (
        <span>
          Evite. Contém <strong className="font-extrabold uppercase text-rose-600 dark:text-rose-450">{listString}</strong>.
        </span>
      )
    };
  };

  // Handler para Salvar e Analisar Novo Produto (Diretriz 4)
  const handleSaveAndAnalyzeNewProduct = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeBarcode || !newProductName.trim() || !selectedProfile || !user) return;

    if (capturedImage) {
      setIsAnalyzing(true);
      try {
        const aiService = new GeminiService();
        const analysis = await aiService.analyzeIngredients(capturedImage, selectedProfile, appLang);
        analysis.detectedProductName = newProductName.trim();

        await ScanRepository.addScan(user.uid, selectedProfile.id, {
          productName: newProductName.trim(),
          status: analysis.status,
          reason: analysis.reason,
          ingredients: analysis.translatedIngredients
        });

        await productRepository.saveProduct({
          barcode: activeBarcode,
          name: newProductName.trim(),
          brand: analysis.detectedBrand || "",
          model: analysis.detectedModel || "",
          country: analysis.detectedCountry || "Brasil",
          language: analysis.detectedLanguage || "Português",
          ingredientsText: analysis.translatedIngredients || "",
          ingredientsOriginal: analysis.identifiedIngredients?.join(", ") || "",
          nutritionalInfo: analysis.detectedNutritionalInfo || ""
        });

        setIsSavedGlobally(true);
        setResult(analysis);
        setShowNewProductCard(false);
      } catch (err) {
        console.error("Erro ao salvar e analisar:", err);
        alert("Ocorreu um erro ao analisar. Tente tirar a foto novamente.");
      } finally {
        setIsAnalyzing(false);
      }
    } else {
      alert(appLang === 'en' ? 
        "Barcode and name cached! Now, please point the camera to the list of ingredients and tap the capture button." : 
        appLang === 'es' ? 
        "¡Código y nombre guardados! Ahora, apunte la cámara a la lista de ingredientes y capture la foto." : 
        "Código e Nome registrados! Agora, por favor, aponte a câmera para a lista de ingredientes e toque no botão de tirar foto (câmera) para concluir a análise!"
      );
    }
  };

  // Processa as imagens de mineração (Frente + Ingredientes) via Gemini
  const handleProcessMiningImages = async () => {
    if (!miningFrontImage || !miningIngredientsImage || !selectedProfile) {
      setMiningError("Faltam fotos da frente da embalagem ou da lista de ingredientes.");
      return;
    }

    setIsMiningProcessing(true);
    setMiningError(null);

    try {
      const aiService = new GeminiService();

      // 1. Analisa a parte frontal
      console.log("[DataMining] Analisando imagem frontal do produto...");
      const frontData = await aiService.analyzeFrontLabel(miningFrontImage, appLang);

      // 2. Analisa os ingredientes (traseira/lateral)
      console.log("[DataMining] Analisando imagem de ingredientes...");
      const backData = await aiService.analyzeBackLabel(miningIngredientsImage, selectedProfile, appLang);

      // 3. Atualiza os estados de revisão com os dados extraídos pela IA
      setMiningProductName(frontData.productName || "");
      setMiningProductBrand(frontData.brand || "");
      setMiningProductModel(frontData.model || "");
      setMiningCategory(frontData.category || "alimento");
      setMiningIngredientsText(backData.translatedIngredients || "");
      setMiningIngredientsOriginal(backData.identifiedIngredients?.join(", ") || "");
      setMiningNutritionalInfo(backData.detectedNutritionalInfo || "");

      // Avança para a etapa de revisão
      setMiningStep(4);
    } catch (err: any) {
      console.error("[DataMining] Erro no processamento de mineração de imagens:", err);
      setMiningError("Não foi possível processar ou extrair as informações das imagens. Por favor, tente tirar fotos mais nítidas e iluminadas.");
    } finally {
      setIsMiningProcessing(false);
    }
  };

  // Envia o produto minerado para aprovação do administrador
  const handleSubmitMiningProduct = async () => {
    if (!miningProductName.trim() || !miningIngredientsText.trim() || !user) {
      setMiningError("O nome do produto e a lista de ingredientes são obrigatórios.");
      return;
    }

    setIsMiningProcessing(true);
    setMiningError(null);

    try {
      const barcodeToSubmit = activeBarcode || "";
      
      await PendingProductRepository.submitPendingProduct({
        barcode: barcodeToSubmit,
        name: miningProductName.trim(),
        brand: miningProductBrand.trim(),
        model: miningProductModel.trim(),
        category: miningCategory,
        country: "Brasil",
        language: "Português",
        ingredientsText: miningIngredientsText.trim(),
        ingredientsOriginal: miningIngredientsOriginal.trim(),
        nutritionalInfo: miningNutritionalInfo.trim(),
        // Apenas a imagem da frente da embalagem é armazenada para ilustrar o produto e otimizar custos.
        frontImageBase64: miningFrontImage || "",
        status: "pending",
        submittedBy: user.uid,
        submittedByEmail: user.email || ""
      });

      setMiningSuccess(true);
    } catch (err: any) {
      console.error("[DataMining] Erro ao enviar produto para aprovação:", err);
      setMiningError("Ocorreu um erro ao registrar as informações na nuvem. Verifique sua conexão.");
    } finally {
      setIsMiningProcessing(false);
    }
  };

  // Converte arquivo de imagem para Base64
  const handleImageUpload = (file: File, callback: (base64: string) => void) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      callback(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Reseta todos os estados do assistente de mineração
  const resetMiningWizard = () => {
    setIsDataMiningActive(false);
    setMiningStep(1);
    setMiningFrontImage(null);
    setMiningIngredientsImage(null);
    setMiningCategory('alimento');
    setMiningProductName("");
    setMiningProductBrand("");
    setMiningProductModel("");
    setMiningIngredientsText("");
    setMiningIngredientsOriginal("");
    setMiningNutritionalInfo("");
    setMiningSuccess(false);
    setMiningError(null);
  };

  // Inicializar o perfil
  useEffect(() => {
    const saved = sessionStorage.getItem('selectedProfile');
    if (!saved) {
      navigate('/');
      return;
    }
    setSelectedProfile(JSON.parse(saved));
  }, [navigate]);

  // Efeito para ligar/desligar o Scanner de Código de Barras ao Vivo na câmera unificada
  useEffect(() => {
    const isScanningActive = !capturedImage && !result && !isAnalyzing && !showLinkBarcodeScanner && !isDataMiningActive;

    if (isScanningActive) {
      const timer = setTimeout(() => {
        startBarcodeScanner();
      }, 300);

      return () => {
        clearTimeout(timer);
        stopBarcodeScanner();
      };
    } else {
      stopBarcodeScanner();
    }
  }, [capturedImage, result, isAnalyzing, showLinkBarcodeScanner, isDataMiningActive]);

  // Efeito para inicializar o leitor de códigos de barras para vínculo de produto novo
  useEffect(() => {
    if (showLinkBarcodeScanner) {
      const timer = setTimeout(() => {
        const targetEl = document.getElementById('link-barcode-scanner-target');
        if (!targetEl) return;

        const scanner = new Html5Qrcode("link-barcode-scanner-target");
        linkScannerRef.current = scanner;

        const config = {
          fps: 15,
          aspectRatio: 1.0
        };

        scanner.start(
          { facingMode: "environment" },
          config,
          (decodedText) => {
            handleLinkBarcodeWithCode(decodedText);
          },
          () => {}
        ).then(() => {
          setLinkBarcodeError(null);
        }).catch(err => {
          console.error("Erro ao iniciar leitor de barras de vínculo:", err);
          setLinkBarcodeError("Câmera indisponível para o leitor automático secundário. Use a digitação manual abaixo.");
        });
      }, 500);

      return () => {
        clearTimeout(timer);
        if (linkScannerRef.current) {
          const activeScanner = linkScannerRef.current;
          if (activeScanner.isScanning) {
            activeScanner.stop().catch(err => console.error(err));
          }
          linkScannerRef.current = null;
        }
      };
    }
  }, [showLinkBarcodeScanner]);

  // Efeito principal de acessibilidade nativa
  useEffect(() => {
    // A acessibilidade de leitura é delegada nativamente aos leitores de tela dos sistemas operacionais (iOS VoiceOver / Android TalkBack)
    // garantindo conformidade com os padrões de usabilidade e semântica HTML.
  }, [result, appLang]);

  const startBarcodeScanner = async () => {
    const scannerBox = document.getElementById('barcode-scanner-target');
    if (!scannerBox) return;

    if (scannerRef.current || isStartingScanner.current) {
      console.log("Scanner já inicializado ou inicialização em progresso, ignorando.");
      return;
    }

    isStartingScanner.current = true;
    setCameraPermissionError(null);

    try {
      const scanner = new Html5Qrcode("barcode-scanner-target");
      const config = {
        fps: 15, // Leituras e frame rate rápidos
        aspectRatio: 1.0
      };

      await scanner.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          handleBarcodeScannedSuccessfully(decodedText);
        },
        () => {
          // scanner passivo sem detecção de códigos comerciais
        }
      );

      scannerRef.current = scanner;
      setCameraPermissionError(null);
    } catch (err: any) {
      console.error("Erro ao iniciar câmera de código de barras:", err);
      const errMsg = err?.toString() || "";
      if (errMsg.includes("NotAllowedError") || errMsg.includes("Permission denied") || errMsg.includes("not allowed")) {
        setCameraPermissionError("Acesso à câmera bloqueado. Se você estiver usando o preview do AI Studio, por favor clique em 'Abrir em nova aba' (no botão do painel superior) para que o navegador possa solicitar e conceder a permissão de câmera de forma segura. Caso contrário, verifique e autorize o acesso à câmera nas configurações do seu navegador ou celular.");
      } else if (errMsg.includes("Timeout") || errMsg.includes("AbortError") || errMsg.includes("Could not start")) {
        setCameraPermissionError("Houve um tempo limite ao iniciar a câmera. Isso pode ocorrer se outro aplicativo ou aba estiver utilizando a câmera. Feche outros apps e tente novamente.");
      } else {
        setCameraPermissionError("Acesso à câmera indisponível no momento. Conceda permissão no seu navegador ou use a digitação manual de código de barras clicando no ícone de teclado no cabeçalho superior.");
      }
    } finally {
      isStartingScanner.current = false;
    }
  };

  const stopBarcodeScanner = async () => {
    if (isStoppingScanner.current) return;
    isStoppingScanner.current = true;

    try {
      if (scannerRef.current) {
        const activeScanner = scannerRef.current;
        if (activeScanner.isScanning) {
          await activeScanner.stop();
        }
      }
    } catch (e) {
      console.error("Erro ao fechar scanner:", e);
    } finally {
      scannerRef.current = null;
      isStoppingScanner.current = false;
    }
  };

  const capturePhoto = () => {
    const video = document.querySelector('#barcode-scanner-target video') as HTMLVideoElement;
    if (video && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = video.videoWidth;
        canvasRef.current.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        stopBarcodeScanner();
        
        // Iniciar análise do produto automaticamente
        analyzeProduct(dataUrl);
      }
    } else {
      alert("Vídeo de câmera indisponível para captura rápida.");
    }
  };

  const handleBarcodeScannedSuccessfully = async (code: string) => {
    const cleanCode = code.replace(/\D/g, '');
    if (cleanCode.length !== 13) return;

    if (!selectedProfile || !user || isSearchingBarcode) return;

    if (window.navigator?.vibrate) {
      window.navigator.vibrate(100);
    }

    setIsSearchingBarcode(true);
    setBarcodeError(null);
    setBarcodeQuery(code);

    try {
      await stopBarcodeScanner();

      const product = await productRepository.getProductByBarcode(code);
      
      if (product) {
        // Produto existe offline! Executar checagem instantânea de alérgenos
        const localAnalysis = analyzeIngredientsLocally(product, selectedProfile);
        
        // Registrar atividade histórica no Firestore do Usuário
        await ScanRepository.addScan(user.uid, selectedProfile.id, {
          productName: product.name || "Produto Desconhecido",
          status: localAnalysis.status,
          reason: localAnalysis.reason,
          ingredients: product.ingredientsText
        });

        setResult(localAnalysis);
        setActiveBarcode(product.barcode);
        setIsSavedGlobally(true);
        setLoadedOffline(true);
      } else {
        setActiveBarcode(code);
        setShowNewProductCard(true);
        setNewProductName("");
        setBarcodeError(null);
      }
    } catch (err) {
      console.error("Erro ao buscar código de barras ao vivo:", err);
      setBarcodeError("Erro de comunicação ao consultar base.");
    } finally {
      setIsSearchingBarcode(false);
    }
  };

  const handleBarcodeSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!barcodeQuery.trim() || !selectedProfile || !user) return;

    setIsSearchingBarcode(true);
    setBarcodeError(null);
    try {
      const product = await productRepository.getProductByBarcode(barcodeQuery.trim());
      
      if (product) {
        const localAnalysis = analyzeIngredientsLocally(product, selectedProfile);
        
        await ScanRepository.addScan(user.uid, selectedProfile.id, {
          productName: product.name || "Produto Desconhecido",
          status: localAnalysis.status,
          reason: localAnalysis.reason,
          ingredients: product.ingredientsText
        });

        await stopBarcodeScanner();

        setResult(localAnalysis);
        setActiveBarcode(product.barcode);
        setIsSavedGlobally(true);
        setLoadedOffline(true);
      } else {
        setActiveBarcode(barcodeQuery.trim());
        setShowNewProductCard(true);
        setNewProductName("");
        setBarcodeError(null);
      }
    } catch (err) {
      console.error("Erro na busca por código digitado:", err);
      setBarcodeError("Erro ao consultar base offline.");
    } finally {
      setIsSearchingBarcode(false);
    }
  };

  const analyzeProduct = async (imageOverride?: string) => {
    const imgSource = imageOverride || capturedImage;
    if (!imgSource || !selectedProfile || !user) return;
    
    setIsAnalyzing(true);
    try {
      const aiService = new GeminiService();

      // Diretriz 4: Atalho no fluxo caso seja o card de Novo Produto Ativo com nome customizado
      if (showNewProductCard && newProductName.trim()) {
        const analysis = await aiService.analyzeIngredients(imgSource, selectedProfile, appLang);
        analysis.detectedProductName = newProductName.trim();

        await ScanRepository.addScan(user.uid, selectedProfile.id, {
          productName: newProductName.trim(),
          status: analysis.status,
          reason: analysis.reason,
          ingredients: analysis.translatedIngredients
        });

        const finalBarcode = activeBarcode || `temp_${Date.now()}`;
        await productRepository.saveProduct({
          barcode: finalBarcode,
          name: newProductName.trim(),
          brand: analysis.detectedBrand || "",
          model: analysis.detectedModel || "",
          country: analysis.detectedCountry || "Brasil",
          language: analysis.detectedLanguage || "Português",
          ingredientsText: analysis.translatedIngredients || "",
          ingredientsOriginal: analysis.identifiedIngredients?.join(", ") || "",
          nutritionalInfo: analysis.detectedNutritionalInfo || ""
        });

        setIsSavedGlobally(true);
        setResult(analysis);
        setShowNewProductCard(false);
        return;
      }

      // 1. OCR Rápido para identificar se a embalagem já está registrada pelo nome/marca/barcodes visíveis
      const ocrResult = await aiService.recognizeProductFromImage(imgSource);
      let matchedProduct = null;

      if (ocrResult.barcode) {
        matchedProduct = await productRepository.getProductByBarcode(ocrResult.barcode);
      }

      if (!matchedProduct && ocrResult.productName) {
        matchedProduct = await productRepository.findProductByNameAndBrand(ocrResult.productName, ocrResult.brand);
      }

      // 2. Se o produto foi achado no banco, rodamos regras offline instantâneas sem gastar tokens extras de IA
      if (matchedProduct) {
        const localAnalysis = analyzeIngredientsLocally(matchedProduct, selectedProfile);

        await ScanRepository.addScan(user.uid, selectedProfile.id, {
          productName: matchedProduct.name || "Produto Desconhecido",
          status: localAnalysis.status,
          reason: localAnalysis.reason,
          ingredients: matchedProduct.ingredientsText
        });

        setResult(localAnalysis);
        setActiveBarcode(matchedProduct.barcode);
        setIsSavedGlobally(true);
        setLoadedOffline(true);
        return;
      }

      // 3. Fallback: Se não existe na base, fazemos a análise generativa completa via IA
      const analysis = await aiService.analyzeIngredients(imgSource, selectedProfile, appLang);
      
      const isIdentified = analysis.detectedProductName && 
                           analysis.detectedProductName.trim() !== "" && 
                           analysis.detectedProductName.toLowerCase() !== "produto desconhecido" && 
                           analysis.detectedProductName.toLowerCase() !== "desconhecido" &&
                           analysis.detectedProductName.toLowerCase() !== "não identificado" &&
                           !analysis.reason.toLowerCase().includes("fora do escopo") &&
                           analysis.category !== "outro";

      const unknownProdLabel = appLang === 'en' ? 'Unknown Product' : appLang === 'es' ? 'Producto Desconocido' : 'Produto Desconhecido';

      // Registrar no histórico local ou na nuvem APENAS se devidamente identificado
      if (isIdentified) {
        await ScanRepository.addScan(user.uid, selectedProfile.id, {
          productName: analysis.detectedProductName || unknownProdLabel,
          status: analysis.status,
          reason: analysis.reason,
          ingredients: analysis.translatedIngredients
        });
      } else {
        const outOfScopeMsg = appLang === 'en' 
          ? `This item is outside of the clinical scope of analysis or was not fully identified by Projeto OBem AI. No entry has been added to your history. ${analysis.reason}`
          : appLang === 'es'
          ? `Este artículo está fuera del alcance clínico de análisis o no fue totalmente identificado por Projeto OBem AI. No se ha agregado ningún registro a su historial. ${analysis.reason}`
          : `Este item está fora do escopo clínico de leitura ou não foi completamente identificado pelo Projeto OBem AI. Nenhum registro foi adicionado ao seu histórico. ${analysis.reason}`;
        analysis.reason = outOfScopeMsg;
      }

      // Se obtivemos um código de barras pelo OCR ou anteriormente pelo scanner,
      // salva automaticamente no acervo de produtos se identificado
      const finalBarcode = activeBarcode || ocrResult.barcode;
      if (finalBarcode && isIdentified) {
        await productRepository.saveProduct({
          barcode: finalBarcode,
          name: analysis.detectedProductName || unknownProdLabel,
          brand: analysis.detectedBrand || "",
          model: analysis.detectedModel || "",
          country: analysis.detectedCountry || "Brasil",
          language: analysis.detectedLanguage || "Português",
          ingredientsText: analysis.translatedIngredients || "",
          ingredientsOriginal: analysis.identifiedIngredients?.join(", ") || "",
          nutritionalInfo: analysis.detectedNutritionalInfo || ""
        });
        setIsSavedGlobally(true);
        setActiveBarcode(finalBarcode);
      }

      setResult(analysis);
    } catch (err) {
      console.error(err);
      if (!navigator.onLine) {
        alert(
          appLang === 'en' 
            ? 'We could not see well. Need more light or to get closer.\n\nOffline Mode: If the product is not in the database, to generate complete info, prioritize capturing the ingredients and verify if all items were properly captured to help the app improve.' 
            : appLang === 'es' 
            ? 'No pudimos ver bien. Necesita más luz o acercarse.\n\nModo Offline: Si el producto no se encuentra en la base de datos, para generar información completa, priorice la captura de los ingredientes y verifique si todos los elementos fueron capturados correctamente para ayudar a mejorar la aplicación.' 
            : 'Não conseguimos ver bem. Precisa de mais luz ou de se aproximar.\n\nModo Offline: Caso o produto não se encontre no banco de dados, para gerar uma informação completa priorize a captura dos ingredientes e verifique se todos os itens foram devidamente capturados para ajudar o app a melhorar.'
        );
      } else {
        alert("Ocorreu um erro ao conectar-se à IA. Tente novamente.");
      }
      resetScanner();
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLinkBarcodeWithCode = async (code: string) => {
    if (!result || !user || !selectedProfile) return;

    if (window.navigator?.vibrate) {
      window.navigator.vibrate(100);
    }

    try {
      // Parar scanner
      if (linkScannerRef.current) {
        if (linkScannerRef.current.isScanning) {
          await linkScannerRef.current.stop();
        }
        linkScannerRef.current = null;
      }
      setShowLinkBarcodeScanner(false);

      // Salvar produto com o novo barcode vinculado
      await productRepository.saveProduct({
        barcode: code.trim(),
        name: result.detectedProductName || "Produto Desconhecido",
        brand: result.detectedBrand || "",
        model: result.detectedModel || "",
        country: result.detectedCountry || "Brasil",
        language: result.detectedLanguage || "Português",
        ingredientsText: result.translatedIngredients || "",
        ingredientsOriginal: result.identifiedIngredients?.join(", ") || "",
        nutritionalInfo: result.detectedNutritionalInfo || ""
      });

      // Atualizar estados
      setActiveBarcode(code.trim());
      setIsSavedGlobally(true);
      setLinkBarcodeError(null);
      setManualLinkBarcode("");
      
      alert(`Código ${code} de barras vinculado com sucesso ao produto virtual!`);
    } catch (err) {
      console.error("Erro ao vincular código:", err);
      alert("Houve um erro ao vincular o código de barras.");
    }
  };

  const captureLinkBarcodePhoto = async () => {
    const video = document.querySelector('#link-barcode-scanner-target video') as HTMLVideoElement;
    if (video && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = video.videoWidth;
        canvasRef.current.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');

        setIsSearchingBarcodeWithPhoto(true);
        setLinkBarcodeError(null);
        try {
          const aiService = new GeminiService();
          const ocrResult = await aiService.recognizeProductFromImage(dataUrl);
          if (ocrResult.barcode) {
            await handleLinkBarcodeWithCode(ocrResult.barcode);
          } else {
            setLinkBarcodeError("Não foi possível detectar um código de barras legível nesta foto. Aproxime mais o código ou digite-o no campo abaixo.");
          }
        } catch (err) {
          console.error("Erro ao fazer OCR do código de barras:", err);
          setLinkBarcodeError("Erro ao processar imagem para ler o código.");
        } finally {
          setIsSearchingBarcodeWithPhoto(false);
        }
      }
    } else {
      setLinkBarcodeError("Vídeo da câmera indisponível para captura rápida.");
    }
  };

  const handleLinkBarcodeFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        setIsSearchingBarcodeWithPhoto(true);
        setLinkBarcodeError(null);
        try {
          const aiService = new GeminiService();
          const ocrResult = await aiService.recognizeProductFromImage(reader.result as string);
          if (ocrResult.barcode) {
            await handleLinkBarcodeWithCode(ocrResult.barcode);
          } else {
            setLinkBarcodeError("Não foi encontrado código de barras na imagem enviada. Tente outra imagem ou digite manualmente.");
          }
        } catch (err) {
          console.error("Erro ao ler código da imagem enviada:", err);
          setLinkBarcodeError("Erro ao ler imagem enviada.");
        } finally {
          setIsSearchingBarcodeWithPhoto(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const resetScanner = () => {
    setCapturedImage(null);
    setResult(null);
    setIsAnalyzing(false);
    setBarcodeQuery("");
    setBarcodeError(null);
    setActiveBarcode(null);
    setIsSavedGlobally(false);
    setLoadedOffline(false);
    setShowManualInput(false);
    setCameraPermissionError(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
        stopBarcodeScanner();
        
        // Iniciar análise automaticamente para fotos enviadas da galeria também
        analyzeProduct(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={cn("relative w-full h-screen bg-black overflow-hidden font-sans text-white", appFontSize === 'xl' ? "accessibility-xl" : appFontSize === 'lg' ? "accessibility-lg" : "")}>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        accept="image/*" 
        className="hidden" 
      />
      <input 
        type="file" 
        ref={linkFileInputRef} 
        onChange={handleLinkBarcodeFileUpload} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Header Fixo */}
      <div className="absolute top-0 left-0 right-0 z-50 p-6 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
        <button 
          onClick={() => navigate('/')}
          className="p-2.5 bg-black/40 backdrop-blur-md rounded-full text-white border border-white/10 active:scale-95 transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        
        <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          <p className="text-white text-xs font-bold uppercase tracking-wider">
            {t.scanner.headerProfile}: <span className="text-blue-300">{selectedProfile?.name}</span>
          </p>
        </div>

        <button 
          onClick={() => setShowManualInput(prev => !prev)}
          className={cn(
            "p-2.5 backdrop-blur-md rounded-full border active:scale-95 transition-all",
            showManualInput ? "bg-white text-black border-white" : "bg-black/40 text-white border-white/10"
          )}
          title={t.scanner.manualInput}
        >
          <Keyboard size={20} />
        </button>
      </div>

      {/* Main Viewport */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden flex items-center justify-center">
        {!capturedImage ? (
          <>
            {cameraPermissionError ? (
              /* painel de ajuda visual quando permissão de câmera é negada */
              <div className="absolute inset-0 z-30 bg-zinc-950 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 bg-red-500/10 rounded-3xl flex items-center justify-center text-red-500 mb-5 border border-red-500/20 shadow-lg">
                  <Octagon size={32} />
                </div>
                <h3 className="text-white text-sm font-extrabold mb-3 uppercase tracking-wider">
                  {cameraPermissionError.includes("tempo limite") || cameraPermissionError.includes("Timeout") ? (appLang === 'en' ? "Camera Connection Timeout" : appLang === 'es' ? "Tiempo Límite de Conexión" : "Tempo Limite de Inicialização") : (appLang === 'en' ? "Camera Access Blocked" : appLang === 'es' ? "Acceso de Cámara Bloqueado" : "Acesso à Câmera Bloqueado")}
                </h3>
                <p className="text-zinc-400 text-xs leading-relaxed max-w-xs mb-8">
                  {cameraPermissionError}
                </p>
                
                <div className="flex flex-col gap-3 w-full max-w-[280px]">
                  <button
                    onClick={() => {
                      setCameraPermissionError(null);
                      startBarcodeScanner();
                    }}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-emerald-950/20"
                  >
                    <RotateCcw size={15} /> {t.scanner.retryCamera}
                  </button>

                  <button
                    onClick={() => {
                      setShowManualInput(true);
                      setCameraPermissionError(null);
                    }}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <Keyboard size={15} /> {t.scanner.manualInput}
                  </button>

                  <button
                    onClick={() => {
                      fileInputRef.current?.click();
                    }}
                    className="w-full py-3 bg-zinc-900 border border-white/10 hover:bg-zinc-800 text-zinc-200 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <ImageIcon size={15} /> {t.scanner.captureGallery}
                  </button>
                </div>
              </div>
            ) : (
              /* Câmera unificada: Scanner de Barras e Visualizador de Fotos Integrados */
              <div className="w-full h-full relative bg-zinc-950 flex items-center justify-center">
                <div id="barcode-scanner-target" className="w-full h-full object-cover" />
                
                {/* Linhas e Alinhador do Scanner em Real-Time */}
                <div className="absolute inset-0 flex flex-col pointer-events-none z-10">
                  <div className="bg-black/40 flex-1 w-full transition-all duration-300"></div>
                  <div className="flex w-full h-[320px]">
                    <div className="bg-black/40 flex-1 h-full transition-all duration-300"></div>
                    <div className="w-[300px] sm:w-[340px] h-full relative">
                      <div className="absolute -top-1 -left-1 w-10 h-10 border-t-4 border-l-4 border-white/80 rounded-tl-[24px]"></div>
                      <div className="absolute -top-1 -right-1 w-10 h-10 border-t-4 border-r-4 border-white/80 rounded-tr-[24px]"></div>
                      <div className="absolute -bottom-1 -left-1 w-10 h-10 border-b-4 border-l-4 border-white/80 rounded-bl-[24px]"></div>
                      <div className="absolute -bottom-1 -right-1 w-10 h-10 border-b-4 border-r-4 border-white/80 rounded-br-[24px]"></div>
                      
                      {/* Linha de laser inteligente */}
                      {isAnalyzing ? (
                        <motion.div 
                          animate={{ top: ['5%', '95%', '5%'] }}
                          transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
                          className="absolute left-2 right-2 h-[3px] bg-white shadow-[0_0_20px_rgba(255,255,255,1)]"
                        />
                      ) : (
                        <motion.div 
                          animate={{ top: ['15%', '85%', '15%'] }}
                          transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                          className="absolute left-4 right-4 h-0.5 bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.9)]"
                        />
                      )}
                    </div>
                    <div className="bg-black/40 flex-1 h-full transition-all duration-300"></div>
                  </div>
                  <div className="bg-black/40 flex-1 w-full transition-all duration-300"></div>
                </div>

                {/* Overlays de status e instrução na área segura */}
                <div className="absolute bottom-36 left-0 right-0 px-6 flex flex-col items-center pointer-events-auto z-30">
                  {isAnalyzing ? (
                    <div className="flex flex-col items-center gap-2 bg-black/60 px-6 py-3 rounded-full backdrop-blur-md border border-white/10">
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                      <p className="text-white text-sm font-bold tracking-wide">
                        {appLang === 'en' ? 'Analyzing security...' : appLang === 'es' ? 'Analizando seguridad...' : 'A analisar a segurança...'}
                      </p>
                    </div>
                  ) : (
                    <AnimatePresence>
                      {showOnboarding && (
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 20 }}
                          className="flex flex-col items-center gap-2 bg-black/70 p-4 rounded-3xl backdrop-blur-md border border-white/10 shadow-lg w-full max-w-[320px]"
                        >
                          <ScanLine className="w-8 h-8 text-blue-400" />
                          <p className="text-white/95 text-[13px] text-center font-semibold leading-relaxed">
                            {appLang === 'en' ? 'Point at ingredients, barcode or front box. We read for you.' : 
                             appLang === 'es' ? 'Apunte a ingredientes, código de barras o frente de caja. Leemos por ti.' : 
                             'Aponte para os ingredientes, código de barras ou frente da caixa. Nós lemos por si.'}
                          </p>
                          <label className="flex items-center gap-2 mt-1 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-white/5 transition-colors">
                            <input 
                              type="checkbox" 
                              className="w-4 h-4 rounded border-gray-400 bg-white/10 text-blue-600 focus:ring-blue-500 accent-blue-500"
                              onChange={handleCheckboxChange}
                              defaultChecked={localStorage.getItem('safelabel_hide_onboarding') !== 'true'}
                            />
                            <span className="text-xs text-zinc-300 font-medium">Exibir na próxima vez?</span>
                          </label>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              </div>
            )}
            
            {/* Input Manual Dropdown */}
            <AnimatePresence>
              {showManualInput && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="absolute top-24 left-6 right-6 z-[60] bg-zinc-950/95 backdrop-blur-xl p-5 rounded-3xl border border-white/20 flex flex-col gap-3 shadow-2xl"
                >
                  <p className="text-xs font-extrabold text-blue-400 uppercase tracking-widest flex items-center gap-1">
                    <Keyboard size={14} /> {t.scanner.manualInput}
                  </p>
                  <p className="text-xs leading-relaxed text-zinc-400">
                    {t.scanner.manualInputDesc}
                  </p>
                  <form onSubmit={handleBarcodeSearch} className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-3 text-white/40">
                        <Search size={16} />
                      </span>
                      <input 
                        type="text" 
                        placeholder={t.scanner.eanPlaceholder} 
                        value={barcodeQuery}
                        onChange={(e) => setBarcodeQuery(e.target.value.replace(/\D/g, ""))}
                        className="w-full pl-9 pr-3 py-2.5 bg-white/10 rounded-xl text-white text-xs outline-none focus:bg-white/20 font-mono placeholder-white/30"
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={isSearchingBarcode || !barcodeQuery.trim()}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold rounded-xl text-xs flex items-center gap-1 transition-all"
                    >
                      {isSearchingBarcode ? <Loader2 size={12} className="animate-spin" /> : t.scanner.searchBtn}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {showNewProductCard && (
              <div className="absolute bottom-32 left-6 right-6 z-[80] bg-zinc-950/95 backdrop-blur-2xl border border-blue-500/35 p-6 rounded-3xl shadow-2xl flex flex-col gap-4 animate-fade-in text-white">
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="text-amber-400" size={16} />
                    <p className="text-xs font-black text-amber-400 uppercase tracking-widest leading-none">
                      {appLang === 'en' ? 'Product Not Registered' : appLang === 'es' ? 'Producto No Registrado' : 'Produto Não Cadastrado!'}
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      setShowNewProductCard(false);
                      setBarcodeError(null);
                    }}
                    className="text-white/40 hover:text-white font-bold text-xs p-1"
                    type="button"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex flex-col gap-2.5">
                  <p className="text-xs leading-relaxed text-zinc-300">
                    {appLang === 'en' 
                      ? `The barcode ${activeBarcode} is not in our database. Help the community by submitting this product through our AI-assisted data mining process!` 
                      : appLang === 'es'
                      ? `El código ${activeBarcode} no está en nuestro sistema. ¡Colabore con la comunidad enviándolo con asistencia de Inteligência Artificial!`
                      : `O código de barras ${activeBarcode} não foi encontrado. Alimente nosso banco de dados utilizando nosso minerador inteligente com Inteligência Artificial!`}
                  </p>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-1">
                    <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
                      <span>CÓDIGO:</span>
                      <span className="text-white font-bold">{activeBarcode}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      setShowNewProductCard(false);
                      setIsDataMiningActive(true);
                      setMiningStep(2); // Vai direto para tirar a foto da frente
                    }}
                    className="w-full mt-2 py-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-amber-500/10"
                  >
                    <Sparkles size={14} />
                    <span>{appLang === 'en' ? 'Start AI Mining Flow' : appLang === 'es' ? 'Iniciar Minería con IA' : 'Mineração Inteligente com IA'}</span>
                  </button>
                  
                  <button 
                    onClick={() => {
                      // Fallback tradicional caso prefiram
                      setShowNewProductCard(false);
                      setIsDataMiningActive(true);
                      setMiningStep(2);
                    }}
                    className="w-full py-2 bg-white/10 hover:bg-white/15 text-white/80 rounded-xl text-[11px] font-medium text-center transition-all"
                  >
                    {appLang === 'en' ? 'I want to submit' : appLang === 'es' ? 'Quiero enviar' : 'Sim, quero cadastrar o produto'}
                  </button>
                </div>
              </div>
            )}

            {/* OVERLAY COMPLETO DO ASSISTENTE DE MINERAÇÃO DE PRODUTOS */}
            <AnimatePresence>
              {isDataMiningActive && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[100] bg-zinc-950 overflow-y-auto flex flex-col text-white"
                >
                  {/* Cabeçalho Fixo do Wizard */}
                  <div className="sticky top-0 bg-zinc-950/90 backdrop-blur-md z-30 px-6 py-4 border-b border-white/5 flex items-center justify-between">
                    <button 
                      onClick={resetMiningWizard}
                      className="p-1 text-zinc-400 hover:text-white transition-all flex items-center gap-1.5 text-xs font-bold"
                    >
                      <ArrowLeft size={16} />
                      <span>{appLang === 'en' ? 'Cancel' : appLang === 'es' ? 'Cancelar' : 'Sair'}</span>
                    </button>
                    <div className="text-center">
                      <h3 className="text-xs font-black uppercase tracking-widest text-amber-400">
                        {appLang === 'en' ? 'Product Mining' : appLang === 'es' ? 'Minería de Productos' : 'Mineração de Produtos'}
                      </h3>
                      <p className="text-[10px] text-zinc-500">Projeto OBem AI</p>
                    </div>
                    <div className="w-12" /> {/* Espaçador */}
                  </div>

                  {/* Barra de Progresso Visual */}
                  {!miningSuccess && (
                    <div className="px-6 pt-4 pb-2 bg-zinc-900/40">
                      <div className="flex justify-between text-[10px] text-zinc-400 font-bold uppercase mb-2">
                        <span className={cn(miningStep >= 2 ? "text-amber-400" : "text-zinc-500")}>Frente</span>
                        <span className={cn(miningStep >= 3 ? "text-amber-400" : "text-zinc-500")}>Ingredientes</span>
                        <span className={cn(miningStep >= 4 ? "text-amber-400" : "text-zinc-500")}>Revisão IA</span>
                        <span>Fim</span>
                      </div>
                      <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-400 transition-all duration-300" 
                          style={{ width: `${(miningStep / 4) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Conteúdo Principal Flexível */}
                  <div className="flex-1 p-6 flex flex-col gap-6 max-w-xl mx-auto w-full">
                    
                    {miningError && (
                      <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 p-4 rounded-2xl text-xs flex gap-2.5">
                        <TriangleAlert className="shrink-0 text-rose-400" size={16} />
                        <div>
                          <p className="font-extrabold">{appLang === 'en' ? 'System Error' : appLang === 'es' ? 'Error del Sistema' : 'Erro no Processamento'}</p>
                          <p className="opacity-90">{miningError}</p>
                        </div>
                      </div>
                    )}

                    {/* ETAPA 2: FOTO DA FRENTE DA EMBALAGEM */}
                    {miningStep === 2 && !miningSuccess && (
                      <div className="flex-1 flex flex-col justify-between gap-6 animate-fade-in">
                        <div className="space-y-4">
                          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl">
                            <h4 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                              <Camera size={14} /> Passo 1 de 3: Frente da Embalagem
                            </h4>
                            <p className="text-xs text-zinc-300 leading-relaxed">
                              Tire ou carregue uma foto nítida da frente do produto. Ela servirá para ilustrar o produto no app e a IA extrair automaticamente o nome, a marca e a categoria.
                            </p>
                          </div>

                          <div className="flex flex-col items-center justify-center">
                            {miningFrontImage ? (
                              <div className="relative w-full aspect-square max-w-xs rounded-3xl overflow-hidden border-2 border-amber-400/40 shadow-2xl">
                                <img src={miningFrontImage} className="w-full h-full object-cover" alt="Front packaging preview" />
                                <button 
                                  onClick={() => setMiningFrontImage(null)}
                                  className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/80 hover:bg-black backdrop-blur-md rounded-full text-[11px] font-black uppercase text-amber-400 tracking-wider shadow-lg"
                                >
                                  Tirar outra
                                </button>
                              </div>
                            ) : (
                              <label className="w-full aspect-[4/3] max-w-sm rounded-3xl border-2 border-dashed border-white/10 hover:border-amber-400/30 bg-white/5 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all hover:bg-white/10 p-6">
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  className="hidden" 
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleImageUpload(file, setMiningFrontImage);
                                  }}
                                />
                                <Upload className="text-amber-400 animate-pulse" size={28} />
                                <div className="text-center">
                                  <p className="text-xs font-bold text-white mb-1">Tirar foto ou Carregar Imagem</p>
                                  <p className="text-[10px] text-zinc-500">Selecione uma foto da frente do produto</p>
                                </div>
                              </label>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <button 
                            onClick={resetMiningWizard}
                            className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl text-xs text-center transition-all"
                          >
                            Cancelar
                          </button>
                          <button 
                            disabled={!miningFrontImage}
                            onClick={() => setMiningStep(3)}
                            className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-zinc-950 font-extrabold rounded-xl text-xs text-center transition-all flex items-center justify-center gap-1.5"
                          >
                            <span>Continuar</span>
                            <Check size={14} />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ETAPA 3: FOTO DA LISTA DE INGREDIENTES */}
                    {miningStep === 3 && !miningSuccess && (
                      <div className="flex-1 flex flex-col justify-between gap-6 animate-fade-in">
                        <div className="space-y-4">
                          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl">
                            <h4 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                              <FileText size={14} /> Passo 2 de 3: Lista de Ingredientes
                            </h4>
                            <p className="text-xs text-zinc-300 leading-relaxed">
                              Agora capture a foto da lista de ingredientes (geralmente atrás ou na lateral da embalagem). 
                              A IA extrairá as substâncias e descartará a imagem para reduzir custos.
                            </p>
                          </div>

                          <div className="flex flex-col items-center justify-center">
                            {miningIngredientsImage ? (
                              <div className="relative w-full aspect-square max-w-xs rounded-3xl overflow-hidden border-2 border-amber-400/40 shadow-2xl">
                                <img src={miningIngredientsImage} className="w-full h-full object-cover" alt="Ingredients list preview" />
                                <button 
                                  onClick={() => setMiningIngredientsImage(null)}
                                  className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/80 hover:bg-black backdrop-blur-md rounded-full text-[11px] font-black uppercase text-amber-400 tracking-wider shadow-lg"
                                >
                                  Tirar outra
                                </button>
                              </div>
                            ) : (
                              <label className="w-full aspect-[4/3] max-w-sm rounded-3xl border-2 border-dashed border-white/10 hover:border-amber-400/30 bg-white/5 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all hover:bg-white/10 p-6">
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  className="hidden" 
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleImageUpload(file, setMiningIngredientsImage);
                                  }}
                                />
                                <Upload className="text-amber-400 animate-pulse" size={28} />
                                <div className="text-center">
                                  <p className="text-xs font-bold text-white mb-1">Tirar foto da Lista de Ingredientes</p>
                                  <p className="text-[10px] text-zinc-500">Selecione uma foto do verso com os ingredientes</p>
                                </div>
                              </label>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <button 
                            disabled={isMiningProcessing}
                            onClick={() => setMiningStep(2)}
                            className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl text-xs text-center transition-all disabled:opacity-40"
                          >
                            Voltar
                          </button>
                          <button 
                            disabled={!miningIngredientsImage || isMiningProcessing}
                            onClick={handleProcessMiningImages}
                            className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-zinc-950 font-extrabold rounded-xl text-xs text-center transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/10"
                          >
                            {isMiningProcessing ? (
                              <>
                                <Loader2 size={14} className="animate-spin" />
                                <span>Lendo Rótulo...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles size={14} />
                                <span>Extrair com IA</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ETAPA DE PROCESSAMENTO GLOBAL (LOADING SCREEN) */}
                    {isMiningProcessing && miningStep === 3 && (
                      <div className="fixed inset-0 z-50 bg-zinc-950/90 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                        <div className="relative w-24 h-24 mb-6">
                          <div className="absolute inset-0 rounded-full border-4 border-amber-400/20 border-t-amber-400 animate-spin" />
                          <div className="absolute inset-4 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400">
                            <Sparkles size={28} className="animate-pulse" />
                          </div>
                        </div>
                        <h4 className="text-sm font-extrabold text-amber-400 uppercase tracking-widest mb-2">Processamento de Mineração IA</h4>
                        <p className="text-xs text-zinc-300 max-w-sm leading-relaxed">
                          A inteligência artificial do Gemini está lendo as fotos, tabelando a lista de ingredientes, identificando marca/nome e estruturando os metadados...
                        </p>
                        <p className="text-[10px] text-zinc-500 mt-4 italic font-mono">Descartando foto de ingredientes em cache para otimização...</p>
                      </div>
                    )}

                    {/* ETAPA 4: REVISÃO DOS DADOS EXTRAÍDOS PELA IA */}
                    {miningStep === 4 && !miningSuccess && (
                      <div className="flex-1 flex flex-col justify-between gap-6 animate-fade-in pb-10">
                        <div className="space-y-5">
                          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl">
                            <h4 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                              <Sparkles size={14} /> Extração Concluída! Revise as Informações
                            </h4>
                            <p className="text-xs text-zinc-300 leading-relaxed">
                              A IA estruturou os metadados abaixo. Você pode editar ou complementar qualquer campo antes de enviar para aprovação do administrador do app.
                            </p>
                          </div>

                          <div className="flex gap-4 items-center bg-white/5 border border-white/10 p-3 rounded-2xl">
                            {miningFrontImage && (
                              <img src={miningFrontImage} className="w-16 h-16 object-cover rounded-xl border border-white/10" alt="Produto" />
                            )}
                            <div>
                              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Foto de Embalagem</p>
                              <p className="text-xs text-zinc-300 font-medium">Esta imagem será guardada na nuvem para ilustrar o produto. A de ingredientes já foi descartada!</p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            {/* Nome do Produto */}
                            <div className="space-y-1">
                              <label className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider">Nome do Produto *</label>
                              <input 
                                type="text"
                                value={miningProductName}
                                onChange={(e) => setMiningProductName(e.target.value)}
                                className="w-full px-3 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-amber-400/40"
                                placeholder="Ex: Chocolate Meio Amargo"
                              />
                            </div>

                            {/* Marca e Categoria em Grid */}
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider">Marca *</label>
                                <input 
                                  type="text"
                                  value={miningProductBrand}
                                  onChange={(e) => setMiningProductBrand(e.target.value)}
                                  className="w-full px-3 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-amber-400/40"
                                  placeholder="Ex: Nestlé"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider">Categoria *</label>
                                <select 
                                  value={miningCategory}
                                  onChange={(e: any) => setMiningCategory(e.target.value)}
                                  className="w-full px-3 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-amber-400/40"
                                >
                                  <option value="alimento">Alimento</option>
                                  <option value="medicamento">Medicamento</option>
                                  <option value="beleza">Cosmético / Beleza</option>
                                  <option value="outro">Outro</option>
                                </select>
                              </div>
                            </div>

                            {/* Sabor / Variante */}
                            <div className="space-y-1">
                              <label className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider">Sabor / Modelo / Variante</label>
                              <input 
                                type="text"
                                value={miningProductModel}
                                onChange={(e) => setMiningProductModel(e.target.value)}
                                className="w-full px-3 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-amber-400/40"
                                placeholder="Ex: 70% Cacau Mint"
                              />
                            </div>

                            {/* Ingredientes Extraídos */}
                            <div className="space-y-1">
                              <label className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider">Ingredientes Extraídos (IA) *</label>
                              <textarea 
                                value={miningIngredientsText}
                                onChange={(e) => setMiningIngredientsText(e.target.value)}
                                rows={4}
                                className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-amber-400/40 resize-y font-sans"
                                placeholder="Lista de ingredientes limpa e traduzida..."
                              />
                            </div>

                            {/* Ingredientes Originais */}
                            <div className="space-y-1">
                              <label className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider">Ingredientes no Idioma Original</label>
                              <textarea 
                                value={miningIngredientsOriginal}
                                onChange={(e) => setMiningIngredientsOriginal(e.target.value)}
                                rows={2}
                                className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-amber-400/40 resize-y font-sans"
                                placeholder="Ingredientes exatamente como impressos no rótulo..."
                              />
                            </div>

                            {/* Tabela Nutricional */}
                            <div className="space-y-1">
                              <label className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider">Tabela Nutricional (IA)</label>
                              <textarea 
                                value={miningNutritionalInfo}
                                onChange={(e) => setMiningNutritionalInfo(e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-amber-400/40 resize-y font-sans"
                                placeholder="Informações nutricionais identificadas..."
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                          <button 
                            disabled={isMiningProcessing}
                            onClick={() => setMiningStep(3)}
                            className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl text-xs text-center transition-all disabled:opacity-40"
                          >
                            Voltar
                          </button>
                          <button 
                            disabled={isMiningProcessing || !miningProductName.trim() || !miningIngredientsText.trim()}
                            onClick={handleSubmitMiningProduct}
                            className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-zinc-950 font-extrabold rounded-xl text-xs text-center transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/10"
                          >
                            {isMiningProcessing ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Check size={14} />
                            )}
                            <span>Concluir Cadastro</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* SUCESSO ABSOLUTO (PRODUTO ENVIADO PARA MODERAÇÃO) */}
                    {miningSuccess && (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 animate-fade-in gap-6">
                        <div className="w-20 h-20 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center text-green-400 shadow-xl shadow-green-950/10">
                          <Check size={38} className="animate-bounce" />
                        </div>

                        <div className="space-y-2">
                          <h4 className="text-lg font-black text-white">Cadastro Enviado!</h4>
                          <p className="text-xs text-zinc-300 max-w-sm leading-relaxed">
                            O produto foi inserido com sucesso na nossa fila de mineração de dados global!
                          </p>
                          <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
                            Por motivos de segurança e integridade, as informações passarão por uma revisão e aprovação do **administrador do sistema** antes de ficarem visíveis publicamente.
                          </p>
                        </div>

                        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 w-full max-w-sm flex gap-3.5 items-center">
                          {miningFrontImage && (
                            <img src={miningFrontImage} className="w-12 h-12 object-cover rounded-xl border border-white/10" alt="Thumb" />
                          )}
                          <div className="text-left flex-1 min-w-0">
                            <p className="text-xs font-bold text-white truncate">{miningProductName}</p>
                            <p className="text-[10px] text-zinc-500 font-mono truncate">Código: {activeBarcode}</p>
                          </div>
                        </div>

                        <button 
                          onClick={resetMiningWizard}
                          className="w-full max-w-xs mt-4 py-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold rounded-xl text-xs text-center transition-all shadow-lg"
                        >
                          Voltar ao Scanner
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <img src={capturedImage} className="w-full h-full object-cover" alt="Captured Product Card" />
        )}

        <canvas ref={canvasRef} className="hidden" />

        {/* Loading Overlay */}
        <AnimatePresence>
          {isAnalyzing && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-lg flex flex-col items-center justify-center z-[60] text-center p-8"
            >
              <Loader2 className="w-14 h-14 text-blue-500 animate-spin mb-6" />
              <h2 className="text-white text-xl font-bold mb-2">{t.scanner.ocrProcessing}</h2>
              <p className="text-slate-400 max-w-sm text-xs leading-relaxed">
                {t.scanner.ocrDesc}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result Sheet */}
        <AnimatePresence>
          {result && (
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={cn(
                "absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 rounded-t-[40px] z-[70] shadow-[0_-20px_50px_rgba(0,0,0,0.5)] max-h-[85vh] overflow-y-auto text-slate-800 dark:text-slate-100 border-t-8 transition-colors duration-200",
                 !hasActiveFilters && "border-sky-500 dark:border-sky-600",
                 hasActiveFilters && result.status === 'green' && "border-emerald-500",
                 hasActiveFilters && result.status === 'yellow' && "border-amber-500",
                 hasActiveFilters && result.status === 'red' && "border-rose-500"
              )}
            >
              <div className="p-8 pb-10 relative">
                <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-slate-800/40 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full" />
                    <span className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-widest">{appLang === 'en' ? 'Analysis Result' : appLang === 'es' ? 'Resultado' : 'Resultado da Análise'}</span>
                  </div>
                  <button 
                    onClick={resetScanner}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-350 hover:text-slate-800 dark:hover:text-white rounded-full text-xs font-bold transition-all active:scale-95 border border-slate-200/50 dark:border-slate-700/50"
                  >
                    <ArrowLeft size={14} />
                    <span>{appLang === 'en' ? 'Back' : appLang === 'es' ? 'Volver' : 'Voltar'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-4 mb-5">
                  <div className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all",
                    !hasActiveFilters && "bg-sky-500 shadow-sky-200/50 dark:shadow-none",
                    hasActiveFilters && result.status === 'green' && "bg-emerald-500 shadow-emerald-200/50 dark:shadow-none",
                    hasActiveFilters && result.status === 'yellow' && "bg-amber-500 shadow-amber-200/50 dark:shadow-none",
                    hasActiveFilters && result.status === 'red' && "bg-rose-500 shadow-rose-200/50 dark:shadow-none"
                  )}>
                    {!hasActiveFilters ? <Info size={32} /> :
                     result.status === 'green' ? <ThumbsUp size={31} /> :
                     result.status === 'yellow' ? <TriangleAlert size={31} /> :
                     <RedAlertIcon size={31} />}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight leading-none mb-1">
                      {!hasActiveFilters ? (
                        appLang === 'en' ? 'Análise Geral' :
                        appLang === 'es' ? 'Análisis General' :
                        'Análise Geral'
                      ) : (
                        result.status === 'green' ? t.scanner.alertTitleGreen :
                        result.status === 'yellow' ? t.scanner.alertTitleYellow :
                        t.scanner.alertTitleRed
                      )}
                    </h2>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      {loadedOffline ? (
                        <span className="bg-emerald-100 dark:bg-emerald-950/50 text-emerald-850 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full flex items-center gap-1 text-xs uppercase tracking-wide">
                          <Database size={12} /> {t.scanner.offlineSource}
                        </span>
                      ) : (
                        <span className="bg-gradient-to-r from-blue-105 to-indigo-100 dark:from-blue-950/40 dark:to-indigo-950/45 text-indigo-900 dark:text-indigo-300 font-bold px-2 py-0.5 rounded-full flex items-center gap-1 text-xs uppercase tracking-wide">
                          <Globe size={12} /> {t.scanner.onlineSource}
                        </span>
                      )}

                      {result.category === 'alimento' && (
                        <span className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800/30 text-emerald-850 dark:text-emerald-350 font-extrabold px-2 py-0.5 rounded-full text-xs uppercase tracking-wide flex items-center gap-1">
                          🍎 {appLang === 'en' ? 'Food' : appLang === 'es' ? 'Alimento' : 'Alimento'}
                        </span>
                      )}
                      {result.category === 'medicamento' && (
                        <span className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-150 dark:border-indigo-800/30 text-indigo-850 dark:text-indigo-350 font-extrabold px-2 py-0.5 rounded-full text-xs uppercase tracking-wide flex items-center gap-1">
                          💊 {appLang === 'en' ? 'Medicine' : appLang === 'es' ? 'Medicamento' : 'Medicamento'}
                        </span>
                      )}
                      {result.category === 'beleza' && (
                        <span className="bg-pink-50 dark:bg-pink-950/20 border border-pink-150 dark:border-pink-800/30 text-pink-850 dark:text-pink-350 font-extrabold px-2 py-0.5 rounded-full text-xs uppercase tracking-wide flex items-center gap-1">
                          🧴 {appLang === 'en' ? 'Beauty / Hygiene' : appLang === 'es' ? 'Belleza / Higiene' : 'Beleza / Higiene'}
                        </span>
                      )}
                      {result.category === 'outro' && (
                        <span className="bg-slate-50 dark:bg-slate-800/25 border border-slate-150 dark:border-slate-700/40 text-slate-650 dark:text-slate-350 font-extrabold px-2 py-0.5 rounded-full text-xs uppercase tracking-wide flex items-center gap-1">
                          📦 {appLang === 'en' ? 'Out of Scope' : appLang === 'es' ? 'Fuera de Escopo' : 'Fora de Escopo'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Alerta explícito de ausência de restrições de saúde filtrando o produto */}
                {(!hasActiveFilters) && (
                  <div className="bg-sky-50 dark:bg-sky-950/20 border border-sky-150 dark:border-sky-800/30 p-3.5 rounded-2xl mb-4 flex items-start gap-2.5">
                    <Info size={16} className="text-sky-600 dark:text-sky-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-sky-800 dark:text-sky-300">
                        {appLang === 'en' ? 'Displaying general product data' :
                         appLang === 'es' ? 'Exhibiendo datos generales del producto' :
                         'Exibindo dados gerais do produto'}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-normal mt-0.5">
                        {appLang === 'en' ? 'Your profile has no active restrictions. To receive personalized health and allergy alerts during reads, configure the options in your Profile / Filters.' :
                         appLang === 'es' ? 'Su perfil no posee restricciones activas. Para recibir alertas personalizadas de salud y alergias durante las lecturas, configure las opciones en su Perfil / Filtros.' :
                         'Seu perfil não possui restrições ativas. Para receber alertas personalizados de saúde e alergias durante as leituras, configure as opções no seu Perfil / Filtros.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Alerta de proteção ativa focado nas restrições / alérgenos do perfil (Diretriz 2) */}
                {hasActiveFilters && (
                  (() => {
                    const substances = getMatchedSubstances(result);
                    const safeTexts = getUXWritingForStatus(result.status, substances);
                    return (
                      <div className={cn(
                        "p-4 rounded-2xl mb-4 flex items-start gap-2.5 border transition-colors",
                        result.status === 'green' ? "bg-emerald-100 dark:bg-emerald-900 border-emerald-200 dark:border-emerald-700 text-emerald-900 dark:text-emerald-100" :
                        result.status === 'yellow' ? "bg-amber-100 dark:bg-amber-900 border-amber-200 dark:border-amber-700 text-amber-900 dark:text-amber-100" :
                        "bg-rose-100 dark:bg-rose-900 border-rose-200 dark:border-rose-700 text-rose-900 dark:text-rose-100"
                      )}>
                        {result.status === 'green' ? (
                          <ThumbsUp size={16} className="text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                        ) : result.status === 'yellow' ? (
                          <TriangleAlert size={16} className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                        ) : (
                          <RedAlertIcon size={16} className="mt-0.5 flex-shrink-0" />
                        )}
                        <div>
                          <p className="text-xs font-semibold leading-normal">
                            {safeTexts.ui}
                          </p>
                        </div>
                      </div>
                    );
                  })()
                )}


                {/* Resumo da Justificativa */}
                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl mb-6 border border-slate-100 dark:border-slate-700/30">
                  <p className="text-slate-700 dark:text-slate-200 leading-relaxed text-sm font-medium">
                    {result.reason}
                  </p>
                </div>

                {/* Detalhes do Produto Extraídos */}
                <div className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-2xl mb-6 border border-slate-100 dark:border-slate-700/30 space-y-3">
                  <p className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest border-b border-slate-200/60 dark:border-slate-705/30 pb-1.5">
                    {appLang === 'en' ? 'Cataloged Info' : appLang === 'es' ? 'Información Catalogada' : 'Informações Catalogadas'}
                  </p>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-xs">{appLang === 'en' ? 'Product:' : appLang === 'es' ? 'Producto:' : 'Produto:'}</span>
                    <span className="text-slate-800 dark:text-slate-100 font-bold">{result.detectedProductName || "Desconhecido"}</span>
                  </div>
                  {(result.detectedBrand || result.detectedModel) && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-xs">{appLang === 'en' ? 'Brand/Model:' : appLang === 'es' ? 'Marca/Modelo:' : 'Marca/Modelo:'}</span>
                      <span className="text-slate-800 dark:text-slate-100 font-bold text-right max-w-[200px] truncate">
                        {[result.detectedBrand, result.detectedModel].filter(Boolean).join(" - ")}
                      </span>
                    </div>
                  )}
                  {result.detectedCountry && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-xs">{appLang === 'en' ? 'Origin:' : appLang === 'es' ? 'Origen:' : 'Origem:'}</span>
                      <span className="text-slate-850 dark:text-slate-200 font-bold bg-blue-50 dark:bg-blue-950/45 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full text-xs">
                        {result.detectedCountry}
                      </span>
                    </div>
                  )}
                  {activeBarcode && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-xs">{appLang === 'en' ? 'Barcode:' : appLang === 'es' ? 'Código de Barras:' : 'Código de Barras:'}</span>
                      <span className="text-slate-800 dark:text-slate-100 font-mono font-bold bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded">
                        {activeBarcode}
                      </span>
                    </div>
                  )}
                </div>

                {/* ingredientes e infos nutricionais */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center text-xs border-b border-slate-100 dark:border-slate-800/40 pb-2">
                    <span className="text-slate-505 dark:text-slate-400 font-bold uppercase tracking-wider text-xs">{appLang === 'en' ? 'Detected Language:' : appLang === 'es' ? 'Idioma Detectado:' : 'Idioma Detectado:'}</span>
                    <span className="text-slate-800 dark:text-slate-100 font-bold bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">{result.detectedLanguage}</span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-slate-505 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">{appLang === 'en' ? 'Translated Ingredients:' : appLang === 'es' ? 'Ingredientes Traducidos:' : 'Ingredientes Traducidos:'}</span>
                    <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/40">
                      {result.translatedIngredients}
                    </p>
                  </div>

                  {result.detectedNutritionalInfo && (
                    <div className="flex flex-col pt-1">
                      <span className="text-slate-550 dark:text-slate-405 text-xs font-bold uppercase tracking-wider mb-1.5">{appLang === 'en' ? 'Nutritional Fact Sheet / Info:' : appLang === 'es' ? 'Tabla de Información Nutricional:' : 'Tabela / Informação Nutricional:'}</span>
                      <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/40 whitespace-pre-line font-mono">
                        {result.detectedNutritionalInfo}
                      </p>
                    </div>
                  )}
                </div>

                {/* Seção de Vínculo de Código de Barras (Casos virtuais/IA sem barcode cadastrado) */}
                {!activeBarcode && (
                  <div className="bg-amber-50/50 dark:bg-amber-950/20 p-5 rounded-3xl border border-amber-200/60 dark:border-amber-800/30 mb-6 space-y-4">
                    <p className="text-xs font-black text-amber-850 dark:text-amber-300 uppercase tracking-widest flex items-center gap-1.5">
                      <Barcode size={15} className="text-amber-600" /> {appLang === 'en' ? 'Link Barcode' : appLang === 'es' ? 'Vincular Código de Barras' : 'Vincular Código de Barras'}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-normal font-medium">
                      {appLang === 'en' ? 'This AI product does not have a registered barcode yet. Link it now to make it a globally unique record!' : appLang === 'es' ? 'Este producto digital de IA no tiene un código de barras registrado. Vincúlelo ahora para que sea un registro global único.' : 'Este produto virtual criado por IA ainda não possui um código de barras físico registrado. Vincule-o agora para torná-lo um registro único compartilhável no acervo global!'}
                    </p>
                    <button 
                      onClick={async () => {
                        await stopBarcodeScanner();
                        setShowLinkBarcodeScanner(true);
                      }}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <Camera size={14} /> {appLang === 'en' ? 'Register by Camera / Scan' : appLang === 'es' ? 'Registrar por Cámara / Escaneo' : 'Cadastrar por Câmera / Escanear'}
                    </button>
                  </div>
                )}

                {isSavedGlobally && (
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-100/70 dark:border-emerald-800/30 mb-8 text-xs text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-2">
                    <span>{appLang === 'en' ? `✓ This product is successfully saved in the global database ${activeBarcode ? `with code ${activeBarcode}` : ""}` : appLang === 'es' ? `✓ Este producto ha sido guardado exitosamente en nuestra base mundial ${activeBarcode ? `con código ${activeBarcode}` : ""}` : `✓ Este produto está registrado com sucesso na base de dados global ${activeBarcode ? `com o código ${activeBarcode}` : ""}!`}</span>
                  </div>
                )}

                {/* Completeness Card (Missing Info Fallback) */}
                {(!result.detectedProductName || !result.detectedBrand || result.detectedProductName === 'Desconhecido') && (
                  <div className="bg-sky-50 dark:bg-sky-900/20 p-5 rounded-3xl mb-6 border border-sky-100 dark:border-sky-800/30 shadow-sm">
                    <p className="text-sky-800 dark:text-sky-300 text-[13px] font-semibold mb-4 leading-snug flex items-start gap-2">
                      <Camera className="w-5 h-5 flex-shrink-0 text-sky-500 mt-0.5" />
                      {appLang === 'en' ? 'Help us get to know this product better. Photograph the front of the package.' :
                       appLang === 'es' ? 'Ayúdanos a conocer mejor este producto. Fotografíe el frente del empaque.' :
                       'Ajude-nos a conhecer melhor este produto. Fotografe a frente da embalagem.'}
                    </p>
                    <button 
                      onClick={resetScanner}
                      className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white text-sm font-bold rounded-2xl flex justify-center items-center gap-2 transition-colors shadow-lg shadow-sky-500/25 active:scale-95"
                    >
                      {appLang === 'en' ? 'Photograph Front' : 
                       appLang === 'es' ? 'Fotografiar Frente' : 
                       'Fotografar Frente'}
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={resetScanner}
                    className="py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-705 text-slate-700 dark:text-slate-200 font-bold rounded-2xl active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <RotateCcw size={15} /> {appLang === 'en' ? 'New Scan' : appLang === 'es' ? 'Nuevo Escaneo' : 'Novo Scan'}
                  </button>
                  <button 
                    onClick={() => navigate('/')}
                    className="py-4 bg-blue-600 hover:bg-blue-750 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 active:scale-95 transition-all text-center"
                  >
                    {appLang === 'en' ? 'Done' : appLang === 'es' ? 'Completado' : 'Concluído'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Barra de Ações Inferior Flutuante (sem a faixa preta, integrada sobre o vídeo em tempo real) */}
      {!result && !capturedImage && (
        <div className="absolute bottom-8 left-0 right-0 z-20 flex items-center justify-between px-10 bg-transparent">
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-4 bg-black/40 backdrop-blur-md text-white/85 hover:text-white rounded-full border border-white/10 transition-all active:scale-95 shadow-lg"
            title={t.scanner.captureGallery}
          >
            <ImageIcon size={24} />
          </button>
          
          <button 
            type="button"
            onClick={capturePhoto}
            className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-all border-4 border-blue-500/20"
          >
            <div className="w-16 h-16 bg-white border-2 border-slate-200 rounded-full flex items-center justify-center animate-pulse">
              <Camera size={29} className="text-slate-800" />
            </div>
          </button>

          <button 
            type="button"
            onClick={() => setShowManualInput(prev => !prev)}
            className={cn(
              "p-4 backdrop-blur-md rounded-full border transition-all active:scale-95 shadow-lg",
              showManualInput ? "bg-blue-600 text-white border-blue-500/50" : "bg-black/40 text-white/85 hover:text-white border-white/10"
            )}
            title={t.scanner.manualInput}
          >
            <Keyboard size={24} />
          </button>
        </div>
      )}

      {/* Modal/Overlay de Leitura para Vincular Código de Barras */}
      <AnimatePresence>
        {showLinkBarcodeScanner && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[90] flex flex-col justify-between p-6 text-white"
          >
            {/* Header */}
            <div className="flex items-center gap-4 pb-4 border-b border-white/10 mt-4">
              <button 
                onClick={() => setShowLinkBarcodeScanner(false)}
                className="flex items-center gap-1.5 p-2 bg-white/10 rounded-full text-white/80 hover:text-white hover:bg-white/20 active:scale-95 transition-all text-xs font-bold"
                title={appLang === 'en' ? 'Back' : appLang === 'es' ? 'Volver' : 'Voltar'}
              >
                <ArrowLeft size={16} />
                <span>{appLang === 'en' ? 'Back' : appLang === 'es' ? 'Volver' : 'Voltar'}</span>
              </button>
              <div className="flex-1">
                <p className="text-xs font-black text-blue-400 uppercase tracking-widest leading-none mb-1">
                  {appLang === 'en' ? 'Registration Process' : appLang === 'es' ? 'Proceso de Registro' : 'Procedimento de Cadastro'}
                </p>
                <h3 className="text-sm font-extrabold text-white leading-none">
                  {appLang === 'en' ? 'Link Barcode' : appLang === 'es' ? 'Vincular Código de Barras' : 'Vincular Código de Barras'}
                </h3>
              </div>
            </div>

            {/* Câmera scanner inline ou Captura manual */}
            <div className="flex-1 my-6 flex flex-col justify-center items-center relative rounded-3xl overflow-hidden bg-zinc-950 border border-white/10 min-h-[300px]">
              <div id="link-barcode-scanner-target" className="absolute inset-0 w-full h-full object-cover" />
              
              {/* Laser overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 p-6">
                <div className="w-full max-w-[280px] h-32 border border-blue-500/30 rounded-2xl relative bg-black/10">
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
                  
                  <motion.div 
                    animate={{ top: ['15%', '85%', '15%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="absolute left-3 right-3 h-0.5 bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]"
                  />
                </div>
                <p className="text-white/80 text-xs font-bold bg-black/70 px-3 py-1.5 mt-4 rounded-full border border-white/10 uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping" />
                  {appLang === 'en' ? 'Position barcode inside framing' : appLang === 'es' ? 'Oriente hacia el código de barras' : 'Aponte a câmera para o código de barras'}
                </p>
              </div>

              {/* Botões de captura e/ou galeria flutuando sobre o leitor */}
              <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2.5 px-4 pointer-events-auto">
                <button
                  type="button"
                  onClick={captureLinkBarcodePhoto}
                  disabled={isSearchingBarcodeWithPhoto}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSearchingBarcodeWithPhoto ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                  <span>{appLang === 'en' ? 'Capture Code' : appLang === 'es' ? 'Capturar Código' : 'Tirar Foto do Código'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => linkFileInputRef.current?.click()}
                  disabled={isSearchingBarcodeWithPhoto}
                  className="px-4 py-2.5 bg-zinc-900 border border-white/20 hover:bg-zinc-800 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
                >
                  <ImageIcon size={14} />
                  <span>{appLang === 'en' ? 'Gallery' : appLang === 'es' ? 'Galería' : 'Carregar da Galeria'}</span>
                </button>
              </div>

              {/* Loading Overlay do link via OCR */}
              {isSearchingBarcodeWithPhoto && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-30 text-center p-4">
                  <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-3" />
                  <p className="text-xs font-bold text-white">{appLang === 'en' ? 'Parsing barcode image...' : appLang === 'es' ? 'Analizando código...' : 'Analisando imagem do código...'}</p>
                </div>
              )}
            </div>

            {/* Fallback de entrada Manual */}
            <div className="bg-zinc-900 border border-white/10 p-5 rounded-3xl space-y-3 mb-2">
              <p className="text-xs text-zinc-300 font-medium leading-relaxed">
                {appLang === 'en' ? 'If the scanner fails to auto-read the package, type the barcode number below to link:' : appLang === 'es' ? 'Si el lector não descodifica, digite o número abaixo:' : 'Caso o leitor não consiga ler automaticamente o código de barras, insira os dígitos abaixo para vincular:'}
              </p>
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (manualLinkBarcode.trim()) {
                    handleLinkBarcodeWithCode(manualLinkBarcode);
                  }
                }}
                className="flex gap-2"
              >
                <input 
                  type="text"
                  placeholder="Ex: 7891234567890"
                  value={manualLinkBarcode}
                  onChange={(e) => setManualLinkBarcode(e.target.value.replace(/\D/g, ""))}
                  className="flex-1 p-3 bg-white/10 rounded-xl text-xs outline-none border border-white/5 focus:border-blue-500 font-mono text-white"
                />
                <button 
                  type="submit"
                  disabled={!manualLinkBarcode.trim()}
                  className="px-5 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-45 text-white text-xs font-bold rounded-xl transition-all"
                >
                  {appLang === 'en' ? 'Link' : appLang === 'es' ? 'Vincular' : 'Vincular'}
                </button>
              </form>
              {linkBarcodeError && (
                <p className="text-xs text-rose-400 text-center font-bold">{linkBarcodeError}</p>
              )}
            </div>

            {/* Botão de Cancelar e Retornar à tela de Informações à jusante */}
            <button 
              onClick={() => setShowLinkBarcodeScanner(false)}
              className="w-full py-3.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-black uppercase tracking-wider rounded-2xl transition-all border border-white/5 active:scale-95 flex items-center justify-center gap-1.5"
            >
              <ArrowLeft size={16} /> {appLang === 'en' ? 'Cancel & Return to Product' : appLang === 'es' ? 'Cancelar y Volver' : 'Cancelar e Retornar ao Produto'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
