/**
 * Plan card presets shared with Charis OS. OS sends only these preset names (never colours,
 * images or URLs) and has already resolved "auto" to a concrete choice.
 */
export const ACCENTS = {
  blue: { from: '#60a5fa', to: '#2563eb', glow: 'rgba(59,130,246,0.30)', text: '#1d4ed8' },
  violet: { from: '#a78bfa', to: '#7c3aed', glow: 'rgba(139,92,246,0.32)', text: '#6d28d9' },
  emerald: { from: '#34d399', to: '#059669', glow: 'rgba(16,185,129,0.28)', text: '#047857' },
  amber: { from: '#fbbf24', to: '#d97706', glow: 'rgba(245,158,11,0.32)', text: '#b45309' },
  rose: { from: '#fb7185', to: '#e11d48', glow: 'rgba(244,63,94,0.28)', text: '#be123c' },
  slate: { from: '#94a3b8', to: '#475569', glow: 'rgba(100,116,139,0.25)', text: '#334155' },
};
const ARTWORK = new Set(['none', 'rocket', 'crown', 'gem', 'leaf', 'shield', 'building', 'sparkles', 'gift']);

/** Unknown values from a newer OS fall back to safe defaults. */
export const accentFor = (name) => ACCENTS[name] || ACCENTS.blue;
export const artworkFor = (name) => (ARTWORK.has(name) ? name : 'rocket');
