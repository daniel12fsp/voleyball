export type I18nLang = 'pt' | 'en'

export const LANG_KEY = 'volei-lang:v1'

export const messages = {
  pt: {
    red: 'VERMELHO',
    blue: 'AZUL',
    setTo: (n: number) => `VENCE EM ${n} PONTOS`,
    setPoint: 'PONTO DO SET',
    redWins: 'VERMELHO GANHOU',
    blueWins: 'AZUL GANHOU',
    settings: 'Configurações',
    targetPoints: 'Pontos meta',
    language: 'Idioma',
    fullscreen: 'Tela cheia',
    reset: 'Reiniciar',
    resetConfirm: 'Tem certeza que deseja reiniciar?',
    confirm: 'Sim',
    cancel: 'Cancelar',
    undo: 'Desfazer',
    hold: 'SEGURE',
    deadlock: 'Empate sem vencedor possível. Reinicie o set.',
    invalidTarget: 'Meta inválida para o placar atual. Reinicie o set.',
    newSet: 'Novo set',
    installHint: 'Instale este app para uso offline em tela cheia',
    installFullscreen: 'Instale o app para modo tela cheia',
    readyOffline: 'Pronto para uso offline',
    updateAvailable: 'Atualização disponível',
    reload: 'Recarregar',
    installAction: 'Instalar',
    loadFailed: 'Falha ao carregar o app.',
    retry: 'Tentar novamente',
  },
  en: {
    red: 'RED',
    blue: 'BLUE',
    setTo: (n: number) => `WIN AT ${n} POINTS`,
    setPoint: 'SET POINT',
    redWins: 'RED WINS',
    blueWins: 'BLUE WINS',
    settings: 'Settings',
    targetPoints: 'Target points',
    language: 'Language',
    fullscreen: 'Fullscreen',
    reset: 'Reset',
    resetConfirm: 'Are you sure you want to reset?',
    confirm: 'Yes',
    cancel: 'Cancel',
    undo: 'Undo',
    hold: 'HOLD',
    deadlock: 'No winner possible. Please reset the set.',
    invalidTarget: 'Invalid target for the current score. Reset the set.',
    newSet: 'New set',
    installHint: 'Install this app for fullscreen offline use',
    installFullscreen: 'Install app for fullscreen mode',
    readyOffline: 'Ready offline',
    updateAvailable: 'Update available',
    reload: 'Reload',
    installAction: 'Install',
    loadFailed: 'App failed to load.',
    retry: 'Retry',
  },
} as const

export const loadLang = (): I18nLang => {
  try {
    const saved = localStorage.getItem(LANG_KEY)
    return saved === 'en' ? 'en' : 'pt'
  } catch {
    return 'pt'
  }
}

export const saveLang = (lang: I18nLang): void => {
  try {
    localStorage.setItem(LANG_KEY, lang)
  } catch {
    // ignore
  }
}
