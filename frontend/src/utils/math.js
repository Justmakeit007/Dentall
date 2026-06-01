/* ─── HELPERS ─────────────────────────────────────────────────── */
export function lerp(a, b, t) { return a + (b - a) * t; }
export function clamp(v, mn, mx) { return Math.max(mn, Math.min(mx, v)); }
export function easeInOut(t) { return t < .5 ? 2*t*t : -1+(4-2*t)*t; }
