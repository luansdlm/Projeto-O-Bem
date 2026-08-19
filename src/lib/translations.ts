// Dicionário de Traduções Projeto OBem AI para Acessibilidade Multilíngue (PT, EN, ES)

export interface TranslationSchema {
  common: {
    back: string;
    save: string;
    cancel: string;
    loading: string;
    error: string;
    confirm: string;
  };
  navigation: {
    dashboard: string;
    scanner: string;
    history: string;
    filters: string;
  };
  dashboard: {
    activeProtection: string;
    welcomeMsg: string;
    profileSelector: string;
    activeFilters: string;
    manageFilters: string;
    settingsTitle: string;
    signatureSection: string;
    proPlan: string;
    paymentStatus: string;
    inDay: string;
    preferencesSection: string;
    appLanguage: string;
    screenMode: string;
    light: string;
    dark: string;
    fontSize: string;
    normal: string;
    large: string;
    extraLarge: string;
    footerText: string;
    scopeTitle: string;
    scopeDesc: string;
    addProfile: string;
    editProfile: string;
    noProfiles: string;
    quickStats: string;
    scansCount: string;
    scansTotal: string;
    myProfiles: string;
    deleteProfile: string;
    conditions: string;
    allergies: string;
    addConditionMsg: string;
    addAllergyMsg: string;
    profileTypeLabel: string;
    profileSelf: string;
    profileDependent: string;
    profilePet: string;
  };
  scanner: {
    headerProfile: string;
    manualInput: string;
    manualInputDesc: string;
    eanPlaceholder: string;
    searchBtn: string;
    frameHint: string;
    capturing: string;
    ocrProcessing: string;
    ocrDesc: string;
    retryCamera: string;
    captureGallery: string;
    notRegistered: string;
    notRegisteredDesc: string;
    alertTitleGreen: string;
    alertTitleYellow: string;
    alertTitleRed: string;
    offlineSource: string;
    onlineSource: string;
    scopeNotice: string;
    scopeWarning: string;
    matchedIngredients: string;
  };
}

export type SupportedLanguages = 'pt' | 'en' | 'es' | 'zh' | 'ja' | 'ko' | 'fr' | 'de' | 'it';

export const TRANSLATIONS: Record<SupportedLanguages, TranslationSchema> = {
  pt: {
    common: {
      back: "Voltar",
      save: "Salvar",
      cancel: "Cancelar",
      loading: "Carregando...",
      error: "Ocorreu um erro",
      confirm: "Confirmar"
    },
    navigation: {
      dashboard: "Início",
      scanner: "Escanear",
      history: "Histórico",
      filters: "Filtros"
    },
    dashboard: {
      activeProtection: "Proteção Ativa",
      welcomeMsg: "Escolha um perfil de saúde para monitorar alertas",
      profileSelector: "Selecione o perfil de saúde",
      activeFilters: "Filtros Clínicos Ativos",
      manageFilters: "Ajustar Filtros de Restrição",
      settingsTitle: "Ajustes Projeto OBem AI",
      signatureSection: "Sua Assinatura e Cadastro",
      proPlan: "Plano Pro Internacional",
      paymentStatus: "Status Pagamento:",
      inDay: "Em Dia",
      preferencesSection: "Configuração de Preferências",
      appLanguage: "Idioma do App:",
      screenMode: "Modo de Tela:",
      light: "Claro",
      dark: "Escuro",
      fontSize: "Tamanho da Fonte:",
      normal: "Normal",
      large: "Grande",
      extraLarge: "Muito G.",
      footerText: "Projeto OBem AI 1.0.0 Alpha • Local Sync",
      scopeTitle: "Limitação de Escopo Coberto",
      scopeDesc: "O aplicativo limita-se a analisar e identificar alimentos, medicamentos e produtos de beleza, higiene ou maquiagem que possam impactar a sua saúde ou de seus dependentes.",
      addProfile: "Adicionar Perfil",
      editProfile: "Editar Perfil",
      noProfiles: "Nenhum perfil de saúde encontrado",
      quickStats: "Estatísticas Rápidas",
      scansCount: "Varreduras de segurança realizadas",
      scansTotal: "Histórico total",
      myProfiles: "Meus Perfis sob Proteção",
      deleteProfile: "Excluir Perfil",
      conditions: "Condições de Saúde",
      allergies: "Alergias e Restrições",
      addConditionMsg: "Insira condições de saúde ou intolerâncias do perfil",
      addAllergyMsg: "Insira alergias graves ou ingredientes indesejados",
      profileTypeLabel: "Tipo de Perfil",
      profileSelf: "Pessoal",
      profileDependent: "Dependente",
      profilePet: "Pet"
    },
    scanner: {
      headerProfile: "Perfil sob Proteção",
      manualInput: "Entrada Manual (EAN)",
      manualInputDesc: "Se a foto não focar ou falhar, digite o código de barras abaixo:",
      eanPlaceholder: "Ex: 7891000345...",
      searchBtn: "Buscar Código",
      frameHint: "Aproxime ou foque no texto dos ingredientes",
      capturing: "Capturando...",
      ocrProcessing: "Análise Laboratorial do Rótulo...",
      ocrDesc: "A extrair a lista oficial de substâncias, conferindo contra o registro de risco clínico do perfil...",
      retryCamera: "Tentar Câmera Novamente",
      captureGallery: "Escolher Foto da Galeria",
      notRegistered: "Código não Catalogado",
      notRegisteredDesc: "Este código não está em nossa base offline. Tire uma foto nítida do rótulo e lista de ingredientes do produto para catalogá-lo agora mesmo!",
      alertTitleGreen: "Sinal Verde!",
      alertTitleYellow: "Sinal de Atenção!",
      alertTitleRed: "Sinal de Alerta / Perigo!",
      offlineSource: "Consulta Local",
      onlineSource: "Consulta na Nuvem",
      scopeNotice: "Produto Seguro sob Condições",
      scopeWarning: "Alerta de risco identificado ao perfil!",
      matchedIngredients: "Substâncias Alérgicas/Nocivas:"
    }
  },
  en: {
    common: {
      back: "Back",
      save: "Save",
      cancel: "Cancel",
      loading: "Loading...",
      error: "An error occurred",
      confirm: "Confirm"
    },
    navigation: {
      dashboard: "Home",
      scanner: "Scan",
      history: "History",
      filters: "Filters"
    },
    dashboard: {
      activeProtection: "Active Protection",
      welcomeMsg: "Select a health profile to monitor alerts",
      profileSelector: "Select health profile",
      activeFilters: "Active Clinical Filters",
      manageFilters: "Adjust Restriction Filters",
      settingsTitle: "Configurações Projeto OBem AI",
      signatureSection: "Your Subscription & Account",
      proPlan: "International Pro Plan",
      paymentStatus: "Payment Status:",
      inDay: "Active",
      preferencesSection: "App Preferences",
      appLanguage: "App Language:",
      screenMode: "Screen Mode:",
      light: "Light",
      dark: "Dark",
      fontSize: "Font Size:",
      normal: "Normal",
      large: "Large",
      extraLarge: "X-Large",
      footerText: "Projeto OBem AI 1.0.0 Alpha • Local Sync",
      scopeTitle: "Covered Scope Limitations",
      scopeDesc: "This app is strictly limited to scanning and analyzing food, drugs, and beauty/personal hygiene/makeups that could impact public or specific user health.",
      addProfile: "Add Profile",
      editProfile: "Edit Profile",
      noProfiles: "No health profiles found",
      quickStats: "Quick Insights",
      scansCount: "Security scans successfully completed",
      scansTotal: "Total scans history",
      myProfiles: "My Monitored Profiles",
      deleteProfile: "Delete Profile",
      conditions: "Medical Conditions",
      allergies: "Allergies & Restrictions",
      addConditionMsg: "Add medical conditions or health intolerances",
      addAllergyMsg: "Add severe allergies or bad substances",
      profileTypeLabel: "Profile Type",
      profileSelf: "Self",
      profileDependent: "Dependent",
      profilePet: "Pet"
    },
    scanner: {
      headerProfile: "Protected Profile",
      manualInput: "Manual Input (EAN)",
      manualInputDesc: "If barcode reading fails, type the commercial barcode digits below:",
      eanPlaceholder: "Ex: 7891000345...",
      searchBtn: "Search Barcode",
      frameHint: "Fit the ingredients list text inside frame",
      capturing: "Capturing...",
      ocrProcessing: "Laboratory Label Analysis...",
      ocrDesc: "Parsing official list of medical ingredients & checking flags against user profile risk metrics...",
      retryCamera: "Retry Camera Connection",
      captureGallery: "Upload Label Image",
      notRegistered: "Unlisted Barcode",
      notRegisteredDesc: "This barcode isn't listed locally yet. Please take an unobstructed photo of the ingredients list to catalog and analyze it on the fly!",
      alertTitleGreen: "Green Signal!",
      alertTitleYellow: "Warning Signal!",
      alertTitleRed: "Danger Signal!",
      offlineSource: "Local Copy",
      onlineSource: "Web Core Engine",
      scopeNotice: "Completely Safe Ingredients",
      scopeWarning: "Risk alerts flagged inside label!",
      matchedIngredients: "Indicated Sensitivities / Allergens:"
    }
  },
  es: {
    common: {
      back: "Volver",
      save: "Guardar",
      cancel: "Cancelar",
      loading: "Cargando...",
      error: "Ocurrió un erro",
      confirm: "Confirmar"
    },
    navigation: {
      dashboard: "Inicio",
      scanner: "Escanear",
      history: "Historial",
      filters: "Filtros"
    },
    dashboard: {
      activeProtection: "Protección Activa",
      welcomeMsg: "Elija un perfil de salud para monitorear alertas",
      profileSelector: "Seleccione el perfil de salud",
      activeFilters: "Filtros Clínicos Activos",
      manageFilters: "Ajustar Filtros de Restricción",
      settingsTitle: "Ajustes Projeto OBem AI",
      signatureSection: "Su Suscripción y Cuenta",
      proPlan: "Plan Pro Internacional",
      paymentStatus: "Estado de Pago:",
      inDay: "Al Día",
      preferencesSection: "Ajustes de Preferencias",
      appLanguage: "Idioma del App:",
      screenMode: "Modo de Pantalla:",
      light: "Claro",
      dark: "Oscuro",
      fontSize: "Tamaño de Fuente:",
      normal: "Normal",
      large: "Grande",
      extraLarge: "Muy Grande",
      footerText: "Projeto OBem AI 1.0.0 Alpha • Sincro Local",
      scopeTitle: "Limitación del Alcance Cubierto",
      scopeDesc: "La aplicación se limita a detectar y alertar sobre alimentos, medicamentos y cosméticos, higiene o maquillaje que puedan comprometer la salud del usuario.",
      addProfile: "Añadir Perfil",
      editProfile: "Editar Perfil",
      noProfiles: "Ningún perfil de salud encontrado",
      quickStats: "Estadísticas Rápidas",
      scansCount: "Análisis de seguridad realizados con éxito",
      scansTotal: "Historial total",
      myProfiles: "Mis Perfiles Protegidos",
      deleteProfile: "Eliminar Perfil",
      conditions: "Condiciones de Salud",
      allergies: "Alergias e Restricciones",
      addConditionMsg: "Agregar condiciones de salud o intolerancias del perfil",
      addAllergyMsg: "Agregar alergias críticas o ingredientes excluidos",
      profileTypeLabel: "Tipo de Perfil",
      profileSelf: "Personal",
      profileDependent: "Dependiente",
      profilePet: "Mascota"
    },
    scanner: {
      headerProfile: "Perfil Protegido",
      manualInput: "Entrada Manual (EAN)",
      manualInputDesc: "Si la lectura del código falla, ingrese los dígitos correspondientes debajo:",
      eanPlaceholder: "Ej: 7891000345...",
      searchBtn: "Buscar Código",
      frameHint: "Enfoque sobre el cuadro de texto de los ingredientes",
      capturing: "Capturando...",
      ocrProcessing: "Análisis Clínico del Rótulo...",
      ocrDesc: "Extrayendo el listado químico de componentes contra los perfiles patológicos indicados...",
      retryCamera: "Volver a Iniciar Cámara",
      captureGallery: "Seleccionar Foto de la Galería",
      notRegistered: "Código no Catalogado",
      notRegisteredDesc: "Este código no figura localmente. ¡Haga una captura directa del reverso del empaque con ingredientes para diagnosticarlo de inmediato!",
      alertTitleGreen: "¡Sinal Verde!",
      alertTitleYellow: "¡Señal de Atención!",
      alertTitleRed: "¡Señal de Riesgo Clínico!",
      offlineSource: "Consulta Local",
      onlineSource: "Consulta en la Nube",
      scopeNotice: "Ingredientes Seguros",
      scopeWarning: "¡Sustancias no compatibles identificadas!",
      matchedIngredients: "Ingredientes Críticos Indicados:"
    }
  },
  zh: {
    common: {
      back: "返回",
      save: "保存",
      cancel: "取消",
      loading: "加载中...",
      error: "发生错误",
      confirm: "确认"
    },
    navigation: {
      dashboard: "首页",
      scanner: "扫描",
      history: "历史",
      filters: "筛选"
    },
    dashboard: {
      activeProtection: "主动防护",
      welcomeMsg: "选择健康档案以监控临床警报",
      profileSelector: "选择所属健康档案",
      activeFilters: "激活的临床筛选器",
      manageFilters: "调整健康限制筛选器",
      settingsTitle: "Projeto OBem AI 配置设置",
      signatureSection: "您的订阅与账户",
      proPlan: "国际专业版方案",
      paymentStatus: "付款状态:",
      inDay: "正常/已激活",
      preferencesSection: "基本偏好设置",
      appLanguage: "应用语言:",
      screenMode: "显示模式:",
      light: "日间模式",
      dark: "暗黑护眼",
      fontSize: "显示字号:",
      normal: "标准",
      large: "大字",
      extraLarge: "非常大",
      footerText: "Projeto OBem AI 1.0.0 Alpha • 本地数据同步",
      scopeTitle: "可控分析范围限制",
      scopeDesc: "此应用严格限制于分析和处理可能影响健康的食品、药品及美容彩妆/个人卫生清洁用品。",
      addProfile: "创建新档案",
      editProfile: "编辑健康档案",
      noProfiles: "未发现可用的健康档案",
      quickStats: "实时统计概览",
      scansCount: "已完成的产品成分安全核糖校验",
      scansTotal: "累计扫描总量",
      myProfiles: "受监控健康档案",
      deleteProfile: "删除此健康档案",
      conditions: "医学病症/不耐受",
      allergies: "严重过敏或避免化学成分",
      addConditionMsg: "请输入档案关联者的病理性质或不耐受情况",
      addAllergyMsg: "请输入严重的过敏源或要特别规避的成分关键字",
      profileTypeLabel: "关系分类",
      profileSelf: "个人本人",
      profileDependent: "家属成员",
      profilePet: "宠物"
    },
    scanner: {
      headerProfile: "当前受护健康档案",
      manualInput: "手动输入网格条码 (EAN)",
      manualInputDesc: "如果镜头发虚、失焦，可在下方手动输入常规产品商品码：",
      eanPlaceholder: "例: 7891000345...",
      searchBtn: "查询条形码",
      frameHint: "请将配料表/包装成分文本对齐聚焦于框内",
      capturing: "捕获图像中...",
      ocrProcessing: "AI 临床安全光谱检测中...",
      ocrDesc: "正在解析产品中包含的化学配方，比对本健康档案的严重敏感源警告限制...",
      retryCamera: "重新启动相机传感器",
      captureGallery: "从相册加载包装图片",
      notRegistered: "未收录条码产品",
      notRegisteredDesc: "此产品条码未预装在本地离线数据库。请拍摄一张清晰的背面配料成分图，AI 将立即为您整理、存储并计算诊断！",
      alertTitleGreen: "安全绿灯！",
      alertTitleYellow: "注意预警！",
      alertTitleRed: "严重风险警告！",
      offlineSource: "本地高速比对",
      onlineSource: "云脑核心架构分析",
      scopeNotice: "成分安全无任何冲突",
      scopeWarning: "查出当前健康档案冲突的禁忌成分！",
      matchedIngredients: "已触发的临床敏感源/不合规化学配方:"
    }
  },
  ja: {
    common: {
      back: "戻る",
      save: "保存",
      cancel: "キャンセル",
      loading: "読み込み中...",
      error: "エラーが発生しました",
      confirm: "確定"
    },
    navigation: {
      dashboard: "ホーム",
      scanner: "スキャン",
      history: "履歴",
      filters: "制限"
    },
    dashboard: {
      activeProtection: "アクティブ保護",
      welcomeMsg: "警告を監視するための健康プロファイルを選択",
      profileSelector: "プロファイルを選択",
      activeFilters: "有効な臨床フィルター",
      manageFilters: "制限フィルターをカスタマイズ",
      settingsTitle: "Projeto OBem AI 設定",
      signatureSection: "サブスクリプションとアカウント",
      proPlan: "グローバルプロプラン",
      paymentStatus: "お支払いステータス:",
      inDay: "有効",
      preferencesSection: "アプリの環境設定",
      appLanguage: "アプリ言語:",
      screenMode: "画面表示:",
      light: "ライトモード",
      dark: "目に優しいダーク",
      fontSize: "フォントサイズ:",
      normal: "標準",
      large: "大",
      extraLarge: "極大",
      footerText: "Projeto OBem AI 1.0.0 Alpha • ローカル同期中",
      scopeTitle: "サポート分析限界 de の制限",
      scopeDesc: "当アプリは健康に不利益を及ぼす恐れのある食品、医薬品、医薬部外品/美容化粧品の判定に特化しています。",
      addProfile: "プロフィール作成",
      editProfile: "プロフィール編集",
      noProfiles: "登録済み健康プロファイルがありません",
      quickStats: "クイック分析データ",
      scansCount: "実施された原材料安全性検証回数",
      scansTotal: "スキャン検証トータル",
      myProfiles: "見守り中プロフィール一覧",
      deleteProfile: "このプロフィールを削除",
      conditions: "医学的所見/疾患",
      allergies: "アレルギー・除外成分",
      addConditionMsg: "プロフィールの持病、体質、または不耐症を入力",
      addAllergyMsg: "重篤なアレルギー源または避けたい添加物等を入力",
      profileTypeLabel: "プロフィールタイプ",
      profileSelf: "本人",
      profileDependent: "被扶養者/家族",
      profilePet: "ペット"
    },
    scanner: {
      headerProfile: "アクティブ見守りプロフィール",
      manualInput: "JAN/EANコード手動入力",
      manualInputDesc: "ピントが合わない場合、以下にバーコード番号を直接入力できます：",
      eanPlaceholder: "例: 7891000345...",
      searchBtn: "コードで検索",
      frameHint: "枠内に原材料表示名が収まるように撮影してください",
      capturing: "写真を解析中...",
      ocrProcessing: "AI 臨床成分スクリーニング...",
      ocrDesc: "原材料表記の一部始終を化学的に解析し、ご登録いただいた特定リスク体質と照合します...",
      retryCamera: "カメラ接続をリトライ",
      captureGallery: "画像ライブラリから取得",
      notRegistered: "未登録バーコード製品",
      notRegisteredDesc: "このバーコード製品はまだオフライン共有データベースに登録されていません。背面にある原材料表示のクリアな全体写真を撮影してください。AIがすぐに判定・追加します！",
      alertTitleGreen: "安全確認信号",
      alertTitleYellow: "警告注意の必要あり",
      alertTitleRed: "危険排除・警告！",
      offlineSource: "ローカル照合分析",
      onlineSource: "クラウドAI分析エンジン",
      scopeNotice: "アレルゲン・除外成分不検出",
      scopeWarning: "推奨されない制限対象の含有を検知！",
      matchedIngredients: "一致したアレルギー源・制限対象成分リスト:"
    }
  },
  ko: {
    common: {
      back: "이전",
      save: "저장",
      cancel: "취소",
      loading: "불러오는 중...",
      error: "오류가 발생했습니다",
      confirm: "확인"
    },
    navigation: {
      dashboard: "홈",
      scanner: "스캔",
      history: "기록",
      filters: "필터링"
    },
    dashboard: {
      activeProtection: "활성 모니터링",
      welcomeMsg: "이상 경고를 감시할 건강 프로필 선택",
      profileSelector: "모니터링 대상 프로필 선택",
      activeFilters: "활성화된 임상 필터",
      manageFilters: "건강 이상 제한 항목 관리",
      settingsTitle: "Projeto OBem AI 설정 변경",
      signatureSection: "정기구독 및 계정 관리",
      proPlan: "글로벌 프로 멤버십",
      paymentStatus: "결제 상태:",
      inDay: "정상 유지",
      preferencesSection: "애플리케이션 환경 설정",
      appLanguage: "시스템 언어:",
      screenMode: "화면 테마:",
      light: "일반 라이트",
      dark: "야간 다크모드",
      fontSize: "텍스트 배율:",
      normal: "보통",
      large: "크게",
      extraLarge: "아주 크게",
      footerText: "Projeto OBem AI 1.0.0 Alpha • 로컬 샌드박스 동기화",
      scopeTitle: "허용 모니터링 경계 한계",
      scopeDesc: "이 앱은 인체 및 라이프에 밀접한 식품, 제약류, 화장품 및 위생 헤어케어 제품에 대한 식별로 엄격하게 범위가 한정되어 있습니다.",
      addProfile: "신규 프로필 등록",
      editProfile: "의학 프로필 수정",
      noProfiles: "등록된 모니터링 프로필이 없습니다",
      quickStats: "신속 임상 통계",
      scansCount: "안전 검수 통과 완료된 제품군 수",
      scansTotal: "스캔 진단 총량 기록",
      myProfiles: "관리 및 모니터링 대상 프로필",
      deleteProfile: "프로필 삭제",
      conditions: "의학 질병 / 신체 요건",
      allergies: "알레르기원 및 회피 성분명",
      addConditionMsg: "해당 프로필 대상의 기저질환 혹은 특이 불내증 기록",
      addAllergyMsg: "치명적인 유발 물질이나 피하고자 하는 화학 단어 기입",
      profileTypeLabel: "프로필 관계",
      profileSelf: "나 본인",
      profileDependent: "피보호 가족",
      profilePet: "반려동물"
    },
    scanner: {
      headerProfile: "기저질환 실시간 필터 대상 프로필",
      manualInput: "바코드 코드 직접 입력 (EAN)",
      manualInputDesc: "자동 카메라 초점이 인식을 방해할 시, 하단에 JAN/EAN 자릿수를 직접 입력하세요:",
      eanPlaceholder: "예: 7891000345...",
      searchBtn: "식별 번호 조회",
      frameHint: "원재료 표 및 알레르기 유발 표시 부분을 카메라 원형에 맞추세요",
      capturing: "이미지 수집 중...",
      ocrProcessing: "인공지능 약학/영양소 역추적 중...",
      ocrDesc: "표기 사항 텍스트를 고속 OCR로 파싱하여 환자 기저질환과 유해한 알갱이 성분을 대조합니다...",
      retryCamera: "하드웨어 장치 재연결",
      captureGallery: "기기 사진첩 폴더에서 업로드",
      notRegistered: "아카이브 미등재 바코드",
      notRegisteredDesc: "해당 코드는 로컬 사전식 라이브러리에 신규 제품입니다. 뒷면의 상세 성분/원재료 글씨가 선명하도록 촬영해 주시면 AI가 즉각 등재하고 진단합니다!",
      alertTitleGreen: "안전성 적합 (안심)",
      alertTitleYellow: "복용 성분 주의 확인",
      alertTitleRed: "접촉/섭취 즉시 차단!",
      offlineSource: "샌드박스 로컬 대조",
      onlineSource: "클라우드 뉴럴 네트워크 분석",
      scopeNotice: "건강 위협 화학성분 없음",
      scopeWarning: "이 프로필 기저 질환에 안전하지 않은 성분 발견!",
      matchedIngredients: "검출 위험 물질 및 알레르기 성분 일체:"
    }
  },
  fr: {
    common: {
      back: "Retour",
      save: "Enregistrer",
      cancel: "Annuler",
      loading: "Chargement...",
      error: "Erreur survenue",
      confirm: "Confirmer"
    },
    navigation: {
      dashboard: "Accueil",
      scanner: "Scanner",
      history: "Historique",
      filters: "Filtres"
    },
    dashboard: {
      activeProtection: "Protection Active",
      welcomeMsg: "Sélectionnez un profil pour surveiller les alertes",
      profileSelector: "Sélectionnez le profil médical",
      activeFilters: "Filtres Cliniques Actifs",
      manageFilters: "Ajuster les restrictions de santé",
      settingsTitle: "Réglages Projeto OBem AI",
      signatureSection: "Votre abonnement et compte",
      proPlan: "Plan International Pro",
      paymentStatus: "Statut du paiement :",
      inDay: "À jour",
      preferencesSection: "Préférences de l'application",
      appLanguage: "Langue de l'application :",
      screenMode: "Style d'affichage :",
      light: "Clair",
      dark: "Sombre",
      fontSize: "Taille de police :",
      normal: "Normale",
      large: "Grande",
      extraLarge: "Très grande",
      footerText: "Projeto OBem AI 1.0.0 Alpha • Synchronisation Locale",
      scopeTitle: "Limitation du champ d'évaluation",
      scopeDesc: "Cette application se concentre exclusivement sur l'analyse et l'identification des produits alimentaires, pharmaceutiques et cosmétiques/hygiène pouvant altérer la santé.",
      addProfile: "Créer un Profil",
      editProfile: "Modifier le Profil",
      noProfiles: "Aucun profil médical trouvé",
      quickStats: "Données analytiques rapides",
      scansCount: "Vérifications de sécurité clinique accomplies",
      scansTotal: "Historique total des scans",
      myProfiles: "Profils médicaux protégés",
      deleteProfile: "Supprimer le profil",
      conditions: "Pathologies & Intolérances",
      allergies: "Allergies & Substances Exclues",
      addConditionMsg: "Inscrire les pathologies cliniques ou déficiences de ce profil",
      addAllergyMsg: "Inscrire les allergies majeures ou produits chimiques à bannir",
      profileTypeLabel: "Type de Profil",
      profileSelf: "Moi-même",
      profileDependent: "Dépendant",
      profilePet: "Animal"
    },
    scanner: {
      headerProfile: "Profil médical sous surveillance",
      manualInput: "Saisie Manuelle (EAN)",
      manualInputDesc: "Si la caméra ne parvient pas à ajuster la netteté, saisissez les chiffres ci-dessous :",
      eanPlaceholder: "Ex: 7891000345...",
      searchBtn: "Rechercher",
      frameHint: "Cadrez soigneusement la formulation ou liste d'ingrédients",
      capturing: "Instantané en cours...",
      ocrProcessing: "Analyse Clinique des Composants...",
      ocrDesc: "Extraction de la liste d'ingrédients et comparaison immédiate avec le profil de risque clinique...",
      retryCamera: "Relancer la Caméra",
      captureGallery: "Choisir depuis la galerie photo",
      notRegistered: "Code Barre Non Répertorié",
      notRegisteredDesc: "Ce produit n'est pas encore enregistré. Prenez une photo nette de la liste d'ingrédients ou du verso pour une analyse instantanée par notre IA !",
      alertTitleGreen: "Signal Vert !",
      alertTitleYellow: "Prudence (Vigilance) !",
      alertTitleRed: "Danger (Non conforme) !",
      offlineSource: "Scan Hors Ligne",
      onlineSource: "Analyse Cloud IA",
      scopeNotice: "Composition exempte de risques",
      scopeWarning: "Sustance à risque identifiée pour ce profil !",
      matchedIngredients: "Allergènes ou contre-indications détectés :"
    }
  },
  de: {
    common: {
      back: "Zurück",
      save: "Speichern",
      cancel: "Abbrechen",
      loading: "Ladevorgang...",
      error: "Fehler aufgetreten",
      confirm: "Bestätigen"
    },
    navigation: {
      dashboard: "Home",
      scanner: "Scannen",
      history: "Verlauf",
      filters: "Restriktionen"
    },
    dashboard: {
      activeProtection: "Aktiver Gesundheitsschutz",
      welcomeMsg: "Wählen Sie ein Gesundheitsprofil zur Überwachung",
      profileSelector: "Gesundheitsprofil auswählen",
      activeFilters: "Aktive klinische Filter",
      manageFilters: "Einschränkungsregeln konfigurieren",
      settingsTitle: "Projeto OBem AI Einstellungen",
      signatureSection: "Ihr Abonnement und Account",
      proPlan: "Internationaler Pro-Tarif",
      paymentStatus: "Zahlungsstatus:",
      inDay: "Aktiviert",
      preferencesSection: "Persönliche Präferenzen",
      appLanguage: "Sprachwahl:",
      screenMode: "Bildschirmmodus:",
      light: "Standard Hell",
      dark: "Augen-Schutz Dunkel",
      fontSize: "Textgröße:",
      normal: "Standard",
      large: "Großschrift",
      extraLarge: "Übergröße",
      footerText: "Projeto OBem AI 1.0.0 Alpha • Lokale Synchronisierung",
      scopeTitle: "Abdeckungsbegrenzung der App",
      scopeDesc: "Die Anwendung konzentriert sich streng auf Lebensmittel, Medizinprodukte sowie Hygiene- und Kosmetikartikel, die sich auf die Gesundheit auswirken können.",
      addProfile: "Profil anlegen",
      editProfile: "Profil mutieren",
      noProfiles: "Keine klinischen Profile gefunden",
      quickStats: "Echtzeit-Statistiken",
      scansCount: "Sicherheitskontrollen erfolgreich durchgeführt",
      scansTotal: "Gesamter Scanverlauf",
      myProfiles: "Meine geschützten Profile",
      deleteProfile: "Dieses Profil löschen",
      conditions: "Klinische Befunde & Intoleranzen",
      allergies: "Allergien & Ausschlussstoffe",
      addConditionMsg: "Krankheiten, Befunde oder Mängel dieses Profils eintragen",
      addAllergyMsg: "Spezifische schwere Allergene oder Schadstoffwarnungen eingeben",
      profileTypeLabel: "Profilkategorie",
      profileSelf: "Ich selbst",
      profileDependent: "Angehörige",
      profilePet: "Haustier"
    },
    scanner: {
      headerProfile: "Aufsicht für Profil",
      manualInput: "Manuelle Barcode-Eingabe (EAN)",
      manualInputDesc: "Sollte das Fokussieren fehlschlagen, tippen Sie den Code manuell ein:",
      eanPlaceholder: "Z.B. 7891000345...",
      searchBtn: "Code suchen",
      frameHint: "Inhaltsstoffe gut ausgeleuchtet im Zielrahmen zentrieren",
      capturing: "Aufzeichnung läuft...",
      ocrProcessing: "Zutaten-Scans & Abgleich...",
      ocrDesc: "Analysiert die Formulierung fachgerecht auf Inhaltsstoffe und vergleicht sie mit den Profilrestriktionen...",
      retryCamera: "Kamerasystem neu starten",
      captureGallery: "Import aus Fotobibliothek",
      notRegistered: "Unbekannter Barcode-Eintrag",
      notRegisteredDesc: "Dieser Code ist nicht im System. Fotografieren Sie die komplette Zutatenliste auf der Rückseite scharf, damit die KI das Produkt catalogisieren und sofort bewerten kann!",
      alertTitleGreen: "Grünes Signal !",
      alertTitleYellow: "Warnsignal (Achtung) !",
      alertTitleRed: "Gefahrensignal (Stopp) !",
      offlineSource: "Lokaler Datenbestand",
      onlineSource: "Cloud-AI Auswertung",
      scopeNotice: "Keine konträren Stoffe gefunden",
      scopeWarning: "Gesundheitsschädliche Substanz für dieses Profil entdeckt!",
      matchedIngredients: "Gefundene Allergene / Verstöße:"
    }
  },
  it: {
    common: {
      back: "Indietro",
      save: "Salva",
      cancel: "Annulla",
      loading: "Caricamento...",
      error: "Errore riscontrato",
      confirm: "Conferma"
    },
    navigation: {
      dashboard: "Home",
      scanner: "Scansione",
      history: "Cronologia",
      filters: "Restrizioni"
    },
    dashboard: {
      activeProtection: "Protezione Sanitaria Attiva",
      welcomeMsg: "Seleziona un profilo medico per le segnalazioni",
      profileSelector: "Scegli il profilo di riferimento",
      activeFilters: "Filtri Clinici Attivi su Profilo",
      manageFilters: "Modifica i filtri di intolleranza",
      settingsTitle: "Impostazioni Projeto OBem AI",
      signatureSection: "Il tuo Abbonamento e Account",
      proPlan: "Abbonamento Pro Internazionale",
      paymentStatus: "Stato dei pagamenti:",
      inDay: "In regola",
      preferencesSection: "Impostazioni Preferite",
      appLanguage: "Lingua dell'App:",
      screenMode: "Formato Schermo:",
      light: "Luminoso",
      dark: "Oscuro Protezione Occhi",
      fontSize: "Dimensione Testi:",
      normal: "Normale",
      large: "Grande",
      extraLarge: "Molto Grande",
      footerText: "Projeto OBem AI 1.0.0 Alpha • Sincro Locale Offline",
      scopeTitle: "Disposizioni e Limiti dell'Analisi",
      scopeDesc: "L'applicazione si limita esclusivamente all'analisi di alimentari, medicinali e cosmetici/igiene che possono intaccare la tua salute.",
      addProfile: "Nuovo Profilo",
      editProfile: "Modifica Profilo",
      noProfiles: "Nessun profilo clinico configurato",
      quickStats: "Scheda di controllo clinico",
      scansCount: "Controlli di sicurezza completati con successo",
      scansTotal: "Totale storico scansioni",
      myProfiles: "I miei profili sotto protezione",
      deleteProfile: "Elimina profilo",
      conditions: "Condizioni Cliniche & Malattie",
      allergies: "Allergie & Ingredienti da Evitare",
      addConditionMsg: "Parametri medici o intolleranze particolari di questo profilo",
      addAllergyMsg: "Allergeni primari o sostanze biochimiche da escludere",
      profileTypeLabel: "Relazione Profilo",
      profileSelf: "Io Personale",
      profileDependent: "Familiare a carico",
      profilePet: "Animale domestico"
    },
    scanner: {
      headerProfile: "Profilo in sorveglianza",
      manualInput: "Inserimento Codice (EAN)",
      manualInputDesc: "Se la fotocamera non inquadra bene o è fissa, digita il codice a barre:",
      eanPlaceholder: "Es: 7891000345...",
      searchBtn: "Verifica Codice",
      frameHint: "Centra l'elenco degli ingredienti o la tabella nutrizionale",
      capturing: "Scatto in corso...",
      ocrProcessing: "Analisi Clinica di Ingredienti...",
      ocrDesc: "Scomposizione delle molecole degli ingredienti e confronto con le malattie/allergie attive...",
      retryCamera: "Riavvia la Fotocamera",
      captureGallery: "Scegli un'immagine dalla galleria",
      notRegistered: "Codice Non Identificato",
      notRegisteredDesc: "Questo codice non è presente in database. Realizza una foto chiara degli ingredienti sul retro: l'IA li caricherà e valuterà istantaneamente !",
      alertTitleGreen: "Semaforo Verde (Sicuro) !",
      alertTitleYellow: "Semaforo Giallo (Vigilare) !",
      alertTitleRed: "Semaforo Rosso (Pericolo !) !",
      offlineSource: "Database Locale",
      onlineSource: "Rilevamento Cloud IA",
      scopeNotice: "Sostanze prive di pericoli per te",
      scopeWarning: "Sostanza a rischio evidenziata negli ingredienti !",
      matchedIngredients: "Allergeni o sostanze critiche trovate:"
    }
  }
};

export function getTranslations(lang: string | null): TranslationSchema {
  const normalized = (lang || 'pt').substring(0, 2).toLowerCase();
  if (normalized === 'zh') return TRANSLATIONS.zh;
  if (normalized === 'ja') return TRANSLATIONS.ja;
  if (normalized === 'ko') return TRANSLATIONS.ko;
  if (normalized === 'fr') return TRANSLATIONS.fr;
  if (normalized === 'de') return TRANSLATIONS.de;
  if (normalized === 'it') return TRANSLATIONS.it;
  if (normalized === 'en') return TRANSLATIONS.en;
  if (normalized === 'es') return TRANSLATIONS.es;
  return TRANSLATIONS.pt;
}

export const HEALTH_ITEMS_TRANSLATIONS: Record<string, Record<string, string>> = {
  // Conditions
  "Síndrome de G6PD": {
    pt: "Síndrome de G6PD",
    en: "G6PD Deficiency",
    es: "Deficiencia de G6PD",
    zh: "G6PD 缺乏症",
    ja: "G6PD 欠sn症",
    ko: "G6PD 결립증",
    fr: "Déficit en G6PD",
    de: "G6PD-Mangel",
    it: "Deficit di G6PD"
  },
  "Diabetes Tipo 1": {
    pt: "Diabetes Tipo 1",
    en: "Type 1 Diabetes",
    es: "Diabetes Tipo 1",
    zh: "1 型糖尿病",
    ja: "1型糖尿病",
    ko: "1형 당뇨병",
    fr: "Diabète de type 1",
    de: "Typ-1-Diabetes",
    it: "Diabete Tipo 1"
  },
  "Diabetes Tipo 2": {
    pt: "Diabetes Tipo 2",
    en: "Type 2 Diabetes",
    es: "Diabetes Tipo 2",
    zh: "2 型糖尿病",
    ja: "2型糖尿病",
    ko: "2형 당뇨병",
    fr: "Diabète de type 2",
    de: "Typ-2-Diabetes",
    it: "Diabete Tipo 2"
  },
  "Celiaquia (Glúten)": {
    pt: "Celiaquia (Glúten)",
    en: "Celiac Disease (Gluten)",
    es: "Celiaquía (Gluten)",
    zh: "乳糜泻（麸质）",
    ja: "セリアック病 (グルテン)",
    ko: "셀리악병 (글루텐)",
    fr: "Maladie Cœliaque (Gluten)",
    de: "Zöliakie (Gluten)",
    it: "Celiachia (Glutine)"
  },
  "Fenilcetonúria": {
    pt: "Fenilcetonúria",
    en: "Phenylketonuria (PKU)",
    es: "Fenilcetonuria",
    zh: "苯丙酮尿症",
    ja: "フェニルケトン尿症",
    ko: "페닐케톤뇨증",
    fr: "Phénylcétonurie",
    de: "Phenylketonurie",
    it: "Fenilchetonuria"
  },
  "Diabetes": {
    pt: "Diabetes",
    en: "Diabetes",
    es: "Diabetes",
    zh: "糖尿病",
    ja: "糖尿病",
    ko: "당뇨병",
    fr: "Diabète",
    de: "Diabetes",
    it: "Diabete"
  },
  "Doença Celíaca": {
    pt: "Doença Celíaca",
    en: "Celiac Disease",
    es: "Enfermedad Celíaca",
    zh: "乳糜泻",
    ja: "セリアック病",
    ko: "셀리악병",
    fr: "Maladie Cœliaque",
    de: "Zöliakie",
    it: "Celiachia"
  },
  "Hipertensão": {
    pt: "Hipertensão",
    en: "Hypertension",
    es: "Hipertensión",
    zh: "高血压",
    ja: "高血圧",
    ko: "고혈압",
    fr: "Hypertension",
    de: "Bluthochdruck",
    it: "Ipertensione"
  },
  "Hipotireoidismo": {
    pt: "Hipotireoidismo",
    en: "Hypothyroidism",
    es: "Hipotiroidismo",
    fr: "Hypothyroïdie",
    de: "Schilddrüsenunterfunktion",
    it: "Ipotiroidismo"
  },
  "Insuficiência Renal": {
    pt: "Insuficiência Renal",
    en: "Kidney Insufficiency",
    es: "Insuficiencia Renal",
    fr: "Insuffisance rénale",
    de: "Niereninsuffizienz",
    it: "Insufficienza renale"
  },
  // Allergies - Foods
  "Lactose / Leite": {
    pt: "Lactose / Leite",
    en: "Lactose / Milk",
    es: "Lactosa / Leche",
    zh: "乳糖 / 牛奶",
    ja: "乳糖 / 牛乳",
    ko: "유당 / 우유",
    fr: "Lactose / Lait",
    de: "Laktose / Milch",
    it: "Lattosio / Latte"
  },
  "Ovos": {
    pt: "Ovos",
    en: "Eggs",
    es: "Huevos",
    zh: "鸡蛋",
    ja: "卵",
    ko: "계란",
    fr: "Œufs",
    de: "Eier",
    it: "Uova"
  },
  "Amendoim / Nozes": {
    pt: "Amendoim / Nozes",
    en: "Peanuts / Tree Nuts",
    es: "Maní / Nueces",
    zh: "花生 / 坚果",
    ja: "ピーナッツ / ナッツ類",
    ko: "땅콩 / 견과류",
    fr: "Arachides / Fruits à coque",
    de: "Erdnüsse / Schalenfrüchte",
    it: "Arachidi / Frutta a guscio"
  },
  "Frutos do Mar": {
    pt: "Frutos do Mar",
    en: "Seafood / Shellfish",
    es: "Mariscos",
    zh: "海鲜",
    ja: "シーフード / 甲殻類",
    ko: "해산물 / 갑각류",
    fr: "Fruits de Mer",
    de: "Meeresfrüchte",
    it: "Frutti di Mare"
  },
  "Soja": {
    pt: "Soja",
    en: "Soy",
    es: "Soya/Soja",
    zh: "大豆",
    ja: "大豆",
    ko: "대두",
    fr: "Soja",
    de: "Soja",
    it: "Soia"
  },
  "Trigo": {
    pt: "Trigo",
    en: "Wheat",
    es: "Trigo",
    zh: "小麦",
    ja: "小麦",
    ko: "밀",
    fr: "Blé",
    de: "Weizen",
    it: "Frumento/Grano"
  },
  "Amendoim": {
    pt: "Amendoim",
    en: "Peanuts",
    es: "Maní",
    zh: "花生",
    ja: "落花生",
    ko: "땅콩",
    fr: "Cacahuètes",
    de: "Erdnüsse",
    it: "Arachidi"
  },
  "Glúten": {
    pt: "Glúten",
    en: "Gluten",
    es: "Gluten",
    zh: "面筋",
    ja: "グルテン",
    ko: "글루텐",
    fr: "Gluten",
    de: "Gluten",
    it: "Glutine"
  },
  "Leite": {
    pt: "Leite",
    en: "Milk / Dairy",
    es: "Leche / Lácteos",
    zh: "牛奶",
    ja: "牛乳",
    ko: "우유",
    fr: "Lait",
    de: "Milch",
    it: "Latte"
  },
  "Castanhas": {
    pt: "Castanhas / Nozes",
    en: "Tree Nuts",
    es: "Nueces y Frutos Secos",
    fr: "Noix / Fruits à coque",
    de: "Nüsse",
    it: "Noci"
  },
  "Gergelim": {
    pt: "Gergelim",
    en: "Sesame",
    es: "Sésamo / Ajonjolí",
    fr: "Sésame",
    de: "Sesam",
    it: "Sesamo"
  },
  // Allergies - Cosmetics / Contacts
  "Parabenos": {
    pt: "Parabenos",
    en: "Parabens",
    es: "Parabenos",
    fr: "Parabènes",
    de: "Parabene",
    it: "Parabeni"
  },
  "Sulfatos": {
    pt: "Sulfatos",
    en: "Sulfates",
    es: "Sulfatos",
    fr: "Sulfates",
    de: "Sulfate",
    it: "Solfati"
  },
  "Fragrâncias": {
    pt: "Fragrâncias",
    en: "Fragrances / Perfumes",
    es: "Fragrancias / Perfumes",
    fr: "Parfums / Fragrances",
    de: "Duftstoffe",
    it: "Profumi / Fragranze"
  },
  "Níquel": {
    pt: "Níquel",
    en: "Nickel",
    es: "Níquel",
    fr: "Nickel",
    de: "Nickel",
    it: "Nichel"
  },
  "Formaldeído": {
    pt: "Formaldeído",
    en: "Formaldehyde",
    es: "Formaldehído",
    fr: "Formaldéhyde",
    de: "Formaldehyd",
    it: "Formaldeide"
  },
  "Lanolina": {
    pt: "Lanolina",
    en: "Lanolin",
    es: "Lanolina",
    fr: "Lanolines",
    de: "Lanolin",
    it: "Lanolina"
  },
  "Corantes Artificiais": {
    pt: "Corantes Artificiais",
    en: "Artificial Dyes",
    es: "Colorantes Artificiales",
    fr: "Colorants Artificiels",
    de: "Künstliche Farbstoffe",
    it: "Coloranti Artificiali"
  },
  "Tartrazina": {
    pt: "Tartrazina / Amarelo 5",
    en: "Tartrazine / Yellow 5",
    es: "Tartrazina / Amarillo 5",
    fr: "Tartrazine",
    de: "Tartrazin",
    it: "Tartrazina"
  },
  "Amarelo Crepúsculo": {
    pt: "Amarelo Crepúsculo / Amarelo 6",
    en: "Sunset Yellow / Yellow 6",
    es: "Amarillo Crepúsculo / Amarillo 6",
    fr: "Jaune orangé S",
    de: "Gelborange S",
    it: "Giallo tramonto"
  },
  "Vermelho 40": {
    pt: "Vermelho 40 (Allura Red)",
    en: "Allura Red / Red 40",
    es: "Rojo Allura / Rojo 40",
    fr: "Rouge allura AC",
    de: "Allurarot AC",
    it: "Rosso allura E129"
  },
  "Azul Brilhante": {
    pt: "Azul Brilhante / Azul 1",
    en: "Brilliant Blue / Blue 1",
    es: "Azul Brillante / Azul 1",
    fr: "Bleu brillant FCF",
    de: "Brillantblau FCF",
    it: "Blu brillante FCF"
  },
  "Azul Patente V": {
    pt: "Azul Patente V",
    en: "Patent Blue V",
    es: "Azul Patente V",
    fr: "Bleu patente V",
    de: "Patentblau V",
    it: "Blu patente V"
  },
  "Eritrosina": {
    pt: "Eritrosina / Vermelho 3",
    en: "Erythrosine / Red 3",
    es: "Eritrosina / Rojo 3",
    fr: "Érythrosine",
    de: "Erythrosin",
    it: "Eritrosina"
  },
  // Allergies - Medication / Drugs
  "Penicilina": {
    pt: "Penicilina",
    en: "Penicillin",
    es: "Penicilina",
    fr: "Pénicilline",
    de: "Penicillin",
    it: "Penicillina"
  },
  "AINEs (Ibuprofeno/Aspirina)": {
    pt: "AINEs (Fármacos Anti-inflamatórios)",
    en: "NSAIDs (Anti-inflammatory Drugs)",
    es: "AINEs (Antiinflamatorios)",
    fr: "AINS (Anti-inflammatoires)",
    de: "NSAID (Entzündungshemmer)",
    it: "FANS (Antinfiammatori)"
  },
  "Ibuprofeno": {
    pt: "Ibuprofeno",
    en: "Ibuprofen",
    es: "Ibuprofeno",
    fr: "Ibuprofène",
    de: "Ibuprofen",
    it: "Ibuprofene"
  },
  "Aspirina": {
    pt: "Aspirina (Ácido Acetilsalicílico)",
    en: "Aspirin (Acetylsalicylic Acid)",
    es: "Aspirina (Ácido Acetilsalicílico)",
    fr: "Aspirine",
    de: "Aspirin",
    it: "Aspirina"
  },
  "Nimesulida": {
    pt: "Nimesulida",
    en: "Nimesulide",
    es: "Nimesulida",
    fr: "Nimésulide",
    de: "Nimesulid",
    it: "Nimesulide"
  },
  "Cetoprofeno": {
    pt: "Cetoprofeno",
    en: "Ketoprofen",
    es: "Ketoprofeno",
    fr: "Kétoprofène",
    de: "Ketoprofen",
    it: "Ketoprofene"
  },
  "Diclofenaco": {
    pt: "Diclofenaco",
    en: "Diclofenac",
    es: "Diclofenaco",
    fr: "Diclofénac",
    de: "Diclofenac",
    it: "Diclofenac"
  },
  "Sulfas": {
    pt: "Sulfas (Grupo Geral)",
    en: "Sulfa Drugs (General Group)",
    es: "Sulfas (Grupo General)",
    fr: "Sulfamides (Groupe général)",
    de: "Sulfonamide (Allgemeine Gruppe)",
    it: "Sulfamidici (Gruppo generale)"
  },
  "Sulfadiazina": {
    pt: "Sulfadiazina",
    en: "Sulfadiazine",
    es: "Sulfadiazina",
    fr: "Sulfadiazine",
    de: "Sulfadizin",
    it: "Sulfadiazina"
  },
  "Sulfametoxazol": {
    pt: "Sulfametoxazol",
    en: "Sulfamethoxazole",
    es: "Sulfamethoxazole",
    fr: "Sulfaméthoxazole",
    de: "Sulfamethoxazol",
    it: "Sulfametossazolo"
  },
  "Dipirona": {
    pt: "Dipirona",
    en: "Dipyrone / Metamizole",
    es: "Dipirona / Metamizol",
    fr: "Métamizole",
    de: "Metamizol",
    it: "Metamizolo"
  },
  "Amoxicilina": {
    pt: "Amoxicilina",
    en: "Amoxicillin",
    es: "Amoxicilina",
    fr: "Amoxicilline",
    de: "Amoxicillin",
    it: "Amoxicillina"
  },
  "Anestésicos Locais": {
    pt: "Anestésicos Locais (Grupo)",
    en: "Local Anesthetics (Group)",
    es: "Anestésicos Locales (Grupo)",
    fr: "Anesthésiques Locaux",
    de: "Lokalanästhetika",
    it: "Anestetici Locali"
  },
  "Lidocaína": {
    pt: "Lidocaína",
    en: "Lidocaine",
    es: "Lidocaína",
    fr: "Lidocaïne",
    de: "Lidocain",
    it: "Lidocaina"
  },
  "Prilocaína": {
    pt: "Prilocaína",
    en: "Prilocaine",
    es: "Prilocaína",
    fr: "Prilocaine",
    de: "Prilocain",
    it: "Prilocaina"
  },
  "Benzocaína": {
    pt: "Benzocaína",
    en: "Benzocaine",
    es: "Benzocaína",
    fr: "Benzocaïne",
    de: "Benzocain",
    it: "Benzocaina"
  },
  "Contraste Iodado": {
    pt: "Contraste Iodado",
    en: "Iodinated Contrast",
    es: "Contraste Yodado",
    fr: "Contraste Iodé",
    de: "Jodhaltiges Kontrastmittel",
    it: "Mezzo di Contrasto Iodato"
  }
};

export function translateItem(item: string, lang: string): string {
  const targetLang = (lang || 'pt').substring(0, 2).toLowerCase();
  const trans = HEALTH_ITEMS_TRANSLATIONS[item];
  if (trans) {
    return trans[targetLang] || trans['pt'] || item;
  }
  return item;
}
