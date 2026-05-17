import { h } from 'https://esm.sh/preact@10.29.2';
import htm from 'https://esm.sh/htm@3.1.1';
import { useState, useEffect } from 'https://esm.sh/preact@10.29.2/hooks';

const html = htm.bind(h);

const COLORS = ['#e94560', '#0f3460', '#ffd700', '#ffffff', '#fca311', '#00d2ff'];

function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}

export default function Confetti() {
  const [pieces] = useState(() =>
    Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: randomBetween(-150, 150),
      y: randomBetween(-180, -60),
      rot: randomBetween(0, 720),
      delay: randomBetween(0, 0.8),
      size: randomBetween(4, 9),
      color: COLORS[i % COLORS.length]
    }))
  );

  useEffect(() => {
    const s = document.createElement('style');
    s.textContent = pieces
      .map(p => `
        @keyframes c${p.id} {
          0%   { transform: translate(0,0) rotate(0deg) scale(1); opacity:1; }
          100% { transform: translate(${p.x}px,${p.y}px) rotate(${p.rot}deg) scale(0.3); opacity:0; }
        }
      `)
      .join('\n');
    document.head.appendChild(s);
    return () => document.head.removeChild(s);
  }, []);

  return html`
    <div class="confetti">
      ${pieces.map(p => html`
        <span key=${p.id} class="confetti-piece"
          style=${{ '--size': p.size + 'px', '--color': p.color, animation: `c${p.id} 1.8s ease-out ${p.delay}s forwards` }} />
      `)}
    </div>
  `;
}
