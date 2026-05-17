import { h, render } from 'https://esm.sh/preact@10.29.2';
import { useState, useEffect, useReducer, useRef, useCallback } from 'https://esm.sh/preact@10.29.2/hooks';
import htm from 'https://esm.sh/htm@3.1.1';
import t from './i18n.js';
import Confetti from './confetti.js';

const html = htm.bind(h);

/* ── helpers ── */

function hasSetPoint(score, otherScore, target) {
  return score < 99 && score + 1 >= target && (score + 1 - otherScore) >= 2;
}

function checkWinner(score, otherScore, target) {
  return score >= target && (score - otherScore) >= 2;
}

function checkDeadlock(scoreRed, scoreBlue) {
  return scoreRed === 99 && scoreBlue === 99;
}

function getLang() {
  try { return localStorage.getItem('volei-lang') || 'pt'; } catch { return 'pt'; }
}

function setLang(v) {
  try { localStorage.setItem('volei-lang', v); } catch {}
}

/* ── reducer ── */

const initialState = {
  scoreRed: 0,
  scoreBlue: 0,
  targetPoints: 12,
  history: [],
  winner: null,
  showOverlay: false,
  settingsOpen: false,
  lang: getLang(),
  fullscreenOn: false,
  deadlock: false,
  showResetConfirm: false,
  toast: null,
  updateWaiting: false,
  fullscreenHint: false
};

function reducer(state, action) {
  switch (action.type) {
    case 'SCORE': {
      if (state.winner || state.showOverlay || state.deadlock || state.settingsOpen) return state;
      const team = action.team;
      if (team === 'red' && state.scoreRed >= 99) return state;
      if (team === 'blue' && state.scoreBlue >= 99) return state;
      const newHistory = [...state.history, { red: state.scoreRed, blue: state.scoreBlue }];
      let newRed = state.scoreRed, newBlue = state.scoreBlue;
      if (team === 'red') newRed++;
      else newBlue++;
      if (checkWinner(newRed, newBlue, state.targetPoints)) {
        return { ...state, scoreRed: newRed, scoreBlue: newBlue, history: newHistory, winner: team, showOverlay: true };
      }
      if (checkDeadlock(newRed, newBlue)) {
        return { ...state, scoreRed: newRed, scoreBlue: newBlue, history: newHistory, deadlock: true };
      }
      return { ...state, scoreRed: newRed, scoreBlue: newBlue, history: newHistory };
    }
    case 'UNDO': {
      if (state.history.length === 0 || state.showOverlay || state.deadlock || state.settingsOpen) return state;
      const prev = state.history[state.history.length - 1];
      return { ...state, history: state.history.slice(0, -1), scoreRed: prev.red, scoreBlue: prev.blue, winner: null };
    }
    case 'HIDE_OVERLAY':
      return { ...state, showOverlay: false, winner: null, scoreRed: 0, scoreBlue: 0, history: [], deadlock: false };
    case 'TOGGLE_SETTINGS':
      if (state.showOverlay || state.deadlock) return state;
      return { ...state, settingsOpen: !state.settingsOpen, showResetConfirm: false };
    case 'SET_TARGET': {
      const v = Math.max(3, Math.min(99, action.value));
      return { ...state, targetPoints: v };
    }
    case 'CHECK_WIN_AFTER_TARGET': {
      const { scoreRed, scoreBlue, targetPoints } = state;
      if (checkWinner(scoreRed, scoreBlue, targetPoints)) return { ...state, winner: 'red', showOverlay: true, settingsOpen: false };
      if (checkWinner(scoreBlue, scoreRed, targetPoints)) return { ...state, winner: 'blue', showOverlay: true, settingsOpen: false };
      return state;
    }
    case 'SET_LANG':
      setLang(action.value);
      return { ...state, lang: action.value };
    case 'TOGGLE_FULLSCREEN':
      return { ...state, fullscreenOn: !state.fullscreenOn };
    case 'SET_FULLSCREEN':
      return { ...state, fullscreenOn: action.value };
    case 'SHOW_FULLSCREEN_HINT':
      return { ...state, fullscreenHint: true };
    case 'HIDE_FULLSCREEN_HINT':
      return { ...state, fullscreenHint: false };
    case 'RESET':
      return { ...state, scoreRed: 0, scoreBlue: 0, history: [], winner: null, showOverlay: false, deadlock: false, showResetConfirm: false, settingsOpen: false };
    case 'SHOW_RESET_CONFIRM':
      return { ...state, showResetConfirm: true };
    case 'HIDE_RESET_CONFIRM':
      return { ...state, showResetConfirm: false };
    case 'DISMISS_DEADLOCK':
      return { ...state, deadlock: false, scoreRed: 0, scoreBlue: 0, history: [], winner: null };
    case 'SET_TOAST':
      return { ...state, toast: action.value };
    case 'CLEAR_TOAST':
      return { ...state, toast: null };
    case 'SET_UPDATE_WAITING':
      return { ...state, updateWaiting: action.value };
    default:
      return state;
  }
}

/* ── components ── */

function Scoreboard({ state, dispatch, tx }) {
  const setPointRed = !state.winner && hasSetPoint(state.scoreRed, state.scoreBlue, state.targetPoints);
  const setPointBlue = !state.winner && hasSetPoint(state.scoreBlue, state.scoreRed, state.targetPoints);

  const scoreRed = (e) => {
    e.preventDefault();
    if (navigator.vibrate) navigator.vibrate(50);
    dispatch({ type: 'SCORE', team: 'red' });
  };
  const scoreBlue = (e) => {
    e.preventDefault();
    if (navigator.vibrate) navigator.vibrate(50);
    dispatch({ type: 'SCORE', team: 'blue' });
  };

  return html`
    <div class="scoreboard">
      <div class="side side-red" onPointerDown=${scoreRed}>
        <span class="score">${state.scoreRed}</span>
        ${setPointRed && html`<span class="set-point">${tx.setPoint}</span>`}
      </div>
      <div class="divider"></div>
      <div class="side side-blue" onPointerDown=${scoreBlue}>
        <span class="score">${state.scoreBlue}</span>
        ${setPointBlue && html`<span class="set-point">${tx.setPoint}</span>`}
      </div>
      <div class="top-bar">
        <span class="set-label">${tx.setTo(state.targetPoints)}</span>
        <button class="settings-btn" onClick=${() => dispatch({ type: 'TOGGLE_SETTINGS' })} aria-label=${tx.settings}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </button>
      </div>
    </div>
  `;
}

function SettingsModal({ state, dispatch, tx }) {
  const [targetVal, setTargetVal] = useState(state.targetPoints);

  useEffect(() => {
    setTargetVal(state.targetPoints);
  }, [state.targetPoints, state.settingsOpen]);

  const close = () => dispatch({ type: 'TOGGLE_SETTINGS' });
  const applyTarget = () => {
    dispatch({ type: 'SET_TARGET', value: targetVal });
    dispatch({ type: 'CHECK_WIN_AFTER_TARGET' });
  };

  return html`
    <div class="modal-overlay" onPointerDown=${close}>
      <div class="modal" onPointerDown=${(e) => e.stopPropagation()}>
        <button class="modal-close" onClick=${close} aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <h2 class="modal-title">${tx.settings}</h2>
        <div class="modal-row">
          <label>${tx.targetPoints}</label>
          <input type="number" min="3" max="99" value=${targetVal}
            onInput=${(e) => setTargetVal(parseInt(e.target.value) || 3)}
            onChange=${applyTarget} />
        </div>
        <div class="modal-row">
          <label>${tx.language}</label>
          <button class="modal-btn"
            onClick=${() => dispatch({ type: 'SET_LANG', value: state.lang === 'pt' ? 'en' : 'pt' })}>
            ${state.lang === 'pt' ? 'PT' : 'EN'}
          </button>
        </div>
        <div class="modal-row">
          <label>${tx.fullscreen}</label>
          <button class="modal-btn"
            onClick=${() => dispatch({ type: 'TOGGLE_FULLSCREEN' })}>
            ${state.fullscreenOn ? 'ON' : 'OFF'}
          </button>
        </div>
        <hr />
        <button class="modal-btn reset-btn"
          onClick=${() => dispatch({ type: 'SHOW_RESET_CONFIRM' })}>
          ${tx.reset}
        </button>
        ${state.showResetConfirm && html`
          <div class="confirm-overlay" onPointerDown=${(e) => e.stopPropagation()}>
            <div class="confirm-box">
              <p>${tx.resetConfirm}</p>
              <button class="modal-btn" onClick=${() => dispatch({ type: 'RESET' })}>${tx.confirm}</button>
              <button class="modal-btn" onClick=${() => dispatch({ type: 'HIDE_RESET_CONFIRM' })}>${tx.cancel}</button>
            </div>
          </div>
        `}
      </div>
    </div>
  `;
}

function WinnerOverlay({ state, dispatch, tx }) {
  const isRed = state.winner === 'red';
  const colorClass = isRed ? 'win-red' : 'win-blue';
  const winText = isRed ? tx.redWins : tx.blueWins;
  const first = isRed ? state.scoreRed : state.scoreBlue;
  const second = isRed ? state.scoreBlue : state.scoreRed;

  return html`
    <div class="winner-overlay ${colorClass}" onPointerDown=${() => dispatch({ type: 'HIDE_OVERLAY' })}>
      <${Confetti} />
      <div class="winner-content">
        <span class="winner-text">${winText}</span>
        <span class="winner-score">${first} – ${second}</span>
      </div>
    </div>
  `;
}

function UndoButton({ state, dispatch, tx }) {
  const visible = !state.winner && !state.showOverlay && !state.deadlock && !state.settingsOpen && state.history.length > 0;
  if (!visible) return null;
  return html`
    <button class="undo-btn" onClick=${() => dispatch({ type: 'UNDO' })}>${tx.undo}</button>
  `;
}

function DeadlockDialog({ dispatch, tx }) {
  return html`
    <div class="deadlock-overlay">
      <div class="deadlock-box">
        <p>${tx.deadlock}</p>
        <button class="modal-btn" onClick=${() => dispatch({ type: 'DISMISS_DEADLOCK' })}>${tx.newSet}</button>
      </div>
    </div>
  `;
}

function Toast({ type, tx, onInstall, onReload, onDismiss }) {
  if (type === 'offline') {
    return html`<div class="toast offline-toast">${tx.readyOffline}</div>`;
  }
  if (type === 'install') {
    return html`
      <div class="toast install-toast">
        <span>${tx.install}</span>
        <button class="toast-btn" onClick=${onInstall}>${tx.reload}</button>
        <button class="toast-close" onClick=${onDismiss} aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    `;
  }
  if (type === 'update') {
    return html`
      <div class="toast update-toast">
        <span>${tx.updateAvailable}</span>
        <button class="toast-btn" onClick=${onReload}>${tx.reload}</button>
      </div>
    `;
  }
  return null;
}

/* ── App ── */

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const tx = t[state.lang];
  const installPromptRef = useRef(null);
  const updateSWRef = useRef(null);
  const overlayTimerRef = useRef(null);

  // Overlay auto-dismiss timer
  useEffect(() => {
    if (state.showOverlay) {
      overlayTimerRef.current = setTimeout(() => {
        dispatch({ type: 'HIDE_OVERLAY' });
      }, 3000);
      return () => clearTimeout(overlayTimerRef.current);
    }
  }, [state.showOverlay]);

  // Fullscreen change listener
  useEffect(() => {
    const handler = () => {
      const isFull = !!document.fullscreenElement;
      if (!isFull && state.fullscreenOn) {
        dispatch({ type: 'SET_FULLSCREEN', value: false });
        dispatch({ type: 'SHOW_FULLSCREEN_HINT' });
      }
    };
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, [state.fullscreenOn]);

  // Fullscreen toggle effect
  useEffect(() => {
    if (state.fullscreenOn && !document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {
        dispatch({ type: 'SHOW_FULLSCREEN_HINT' });
      });
    } else if (!state.fullscreenOn && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }, [state.fullscreenOn]);

  // Wake Lock
  useEffect(() => {
    let wakeLock = null;
    let videoEl = null;

    async function requestWakeLock() {
      if ('wakeLock' in navigator) {
        try {
          wakeLock = await navigator.wakeLock.request('screen');
          wakeLock.addEventListener('release', () => { wakeLock = null; });
        } catch {}
      } else {
        if (!videoEl) {
          videoEl = document.createElement('video');
          videoEl.muted = true;
          videoEl.loop = true;
          videoEl.playsInline = true;
          videoEl.src = 'data:video/mp4;base64,AAAAHGZ0eXBNNFYgAAACAGlzb21pc28yYXZjMQAAAAhmcmVlAAAGF21kYXQAAAKgBgX//6ncRem9AAAItW1vdgAAAHBjb2RlYwAGAAEAAAAMY29scmMABAAQAAQABAAAAAcAEAABAAAABAAH2mRlc2MAABAAIAAEAAQAAAAHAAAAAQAAAAIAAAAKABAACAAEAAQAAAD2AgAAAgAAAABhZHRhAAEAAAAKbHN0Y2VjAAIAAWZlYWQAAAABAAAAAQAAAAEBAAAIAAABAAgAAAAKZnJlZQAAAgAAAAARc3RzYwAAAAEAAAABAAAABWlzb21pAAAAFmNvbG9yX3ByaW1hcmllcwAAAAFjY29scgAAAAJqcGN0AAAAACYAAQA0AAAAAQAAAAEAAAABAAAAAgAAAAEAAAABAAAAAQAAAAIAAAABAAAAAQAAAQAAAAEAAAABAAAAAQAAAAltZGF0YQAAAAA=';
          videoEl.style.display = 'none';
          document.body.appendChild(videoEl);
        }
        try { videoEl.play(); } catch {}
      }
    }

    requestWakeLock();
    const visHandler = () => {
      if (document.visibilityState === 'visible') requestWakeLock();
    };
    document.addEventListener('visibilitychange', visHandler);
    return () => {
      document.removeEventListener('visibilitychange', visHandler);
      if (wakeLock) wakeLock.release().catch(() => {});
      if (videoEl) { videoEl.pause(); videoEl.remove(); }
    };
  }, []);

  // Service Worker
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const showToast = (type) => {
      dispatch({ type: 'SET_TOAST', value: type });
      if (type === 'offline') {
        setTimeout(() => dispatch({ type: 'CLEAR_TOAST' }), 3000);
      }
    };

    navigator.serviceWorker.register('/service-worker.js', { scope: '/' }).then(reg => {
      updateSWRef.current = reg;

      if (reg.waiting) {
        dispatch({ type: 'SET_UPDATE_WAITING', value: true });
        showToast('update');
      }

      reg.addEventListener('updatefound', () => {
        const installing = reg.installing;
        if (!installing) return;
        installing.addEventListener('statechange', () => {
          if (installing.state === 'installed' && navigator.serviceWorker.controller) {
            dispatch({ type: 'SET_UPDATE_WAITING', value: true });
            showToast('update');
          }
          if (installing.state === 'activated') {
            showToast('offline');
          }
        });
      });

      if (reg.active && navigator.serviceWorker.controller) {
        caches.match('/index.html').then(r => {
          if (r) showToast('offline');
        });
      }
    });

    const beforeInstallHandler = (e) => {
      e.preventDefault();
      installPromptRef.current = e;
      if (!localStorage.getItem('volei-install-dismissed')) {
        showToast('install');
      }
    };
    window.addEventListener('beforeinstallprompt', beforeInstallHandler);

    window.addEventListener('appinstalled', () => {
      dispatch({ type: 'CLEAR_TOAST' });
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', beforeInstallHandler);
    };
  }, []);

  const handleInstall = useCallback(() => {
    if (installPromptRef.current) {
      installPromptRef.current.prompt();
      installPromptRef.current.userChoice.then(() => {
        installPromptRef.current = null;
        dispatch({ type: 'CLEAR_TOAST' });
      });
    }
  }, []);

  const handleReload = useCallback(() => {
    if (updateSWRef.current && updateSWRef.current.waiting) {
      updateSWRef.current.waiting.postMessage('SKIP_WAITING');
    }
    window.location.reload();
  }, []);

  const handleInstallDismiss = useCallback(() => {
    try { localStorage.setItem('volei-install-dismissed', '1'); } catch {}
    dispatch({ type: 'CLEAR_TOAST' });
  }, []);

  const handlePageInteraction = useCallback(() => {
    if (state.toast === 'install') {
      handleInstallDismiss();
    }
  }, [state.toast, handleInstallDismiss]);

  return html`
    <div>
      <div class="app" onPointerDown=${handlePageInteraction}>
        <${Scoreboard} state=${state} dispatch=${dispatch} tx=${tx} />
        ${state.settingsOpen && html`<${SettingsModal} state=${state} dispatch=${dispatch} tx=${tx} />`}
        <${UndoButton} state=${state} dispatch=${dispatch} tx=${tx} />
        ${state.toast && html`
          <${Toast} type=${state.toast} tx=${tx} onInstall=${handleInstall}
            onReload=${handleReload} onDismiss=${handleInstallDismiss} />
        `}
        ${state.fullscreenHint && html`
          <div class="fullscreen-hint">
            <span>${tx.installFullscreen}</span>
            <button class="toast-close" onClick=${() => dispatch({ type: 'HIDE_FULLSCREEN_HINT' })}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        `}
      </div>
      ${state.showOverlay && state.winner && html`<${WinnerOverlay} state=${state} dispatch=${dispatch} tx=${tx} />`}
      ${state.deadlock && html`<${DeadlockDialog} dispatch=${dispatch} tx=${tx} />`}
    </div>
  `;
}

render(html`<${App} />`, document.getElementById('root'));
