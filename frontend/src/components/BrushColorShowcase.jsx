import { useEffect, useRef, useState } from "react";
import "../styles/hero.css";

/* ─── BRUSH COLOR SHOWCASE ─────────────────────────────────── */
const BRUSH_COLORS = [
  { name: 'Red',              image: 'image/brush.png',  dot: '#E8294A', label: 'Red'              },
  { name: 'Mint Green',       image: 'image/green.png',  dot: '#A8D6AE', label: 'Mint Green'       },
  { name: 'Lavender Violet',  image: 'image/violet.png', dot: '#C5B1E3', label: 'Lavender Violet'  },
  { name: 'Sky Blue',         image: 'image/blue.png',   dot: '#A9D3EA', label: 'Sky Blue'         },
];

export default function BrushColorShowcase({ paused = false }) {
  const [active, setActive]       = useState(0);
  const [previous, setPrevious]   = useState(null);
  const [isSwapping, setIsSwapping] = useState(false);

  const activeRef    = useRef(0);
  const intervalRef  = useRef(null);
  const containerRef = useRef(null);
  const pausedRef    = useRef(paused);

  /* clear the outgoing brush after animation */
  useEffect(() => {
    if (!isSwapping) return undefined;
    const timer = setTimeout(() => {
      setPrevious(null);
      setIsSwapping(false);
    }, 920);
    return () => clearTimeout(timer);
  }, [isSwapping]);

  useEffect(() => { activeRef.current = active; }, [active]);

  const swapToColor = (idx) => {
    if (idx === activeRef.current) return;
    setPrevious(activeRef.current);
    setActive(idx);
    activeRef.current = idx;
    setIsSwapping(true);
  };

  const startAutoSwitch = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      swapToColor((activeRef.current + 1) % BRUSH_COLORS.length);
    }, 2600);
  };

  /* Pause/resume when the parent signals the drawer is open */
  useEffect(() => {
    pausedRef.current = paused;
    if (paused) {
      clearInterval(intervalRef.current);
    } else {
      startAutoSwitch();
    }
  }, [paused]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Also pause when the showcase is scrolled fully out of the viewport */
  useEffect(() => {
    startAutoSwitch();

    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      return () => clearInterval(intervalRef.current);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !pausedRef.current) {
          startAutoSwitch();
        } else {
          clearInterval(intervalRef.current);
        }
      },
      { threshold: 0 }
    );
    observer.observe(el);

    return () => {
      clearInterval(intervalRef.current);
      observer.disconnect();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleColorSelect = (idx) => {
    swapToColor(idx);
    startAutoSwitch();
  };

  const renderBrush = (idx, state) => {
    const color = BRUSH_COLORS[idx];
    return (
      <div
        key={`${state}-${idx}`}
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transformStyle: 'preserve-3d',
          animation:
            state === 'incoming'
              ? 'brushSwapIn 0.92s cubic-bezier(.16,1,.3,1) both'
              : state === 'outgoing'
                ? 'brushSwapOut 0.78s cubic-bezier(.7,0,.2,1) both'
                : 'none',
          zIndex: state === 'outgoing' ? 2 : 3,
          pointerEvents: 'none',
        }}
      >
        <img
          src={color.image}
          alt={color.name}
          style={{
            filter: `drop-shadow(0 26px 54px ${color.dot}35) drop-shadow(0 10px 24px rgba(17,24,39,.18))`,
            backfaceVisibility: 'hidden',
            transform: 'translateZ(40px)',
            animation: state === 'outgoing' ? 'none' : 'brushFloatSoft 4.5s ease-in-out infinite',
            transition: 'filter 0.35s ease',
          }}
        />
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.2rem' }}
    >
      {/* Showcase stage */}
      <div className="dn-showcase-stage">
        {/* colour glow */}
        <div style={{
          position: 'absolute',
          width: 240, height: 240,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${BRUSH_COLORS[active].dot}26 0%, ${BRUSH_COLORS[active].dot}10 42%, transparent 72%)`,
          filter: 'blur(70px)',
          transition: 'background 0.45s ease',
          animation: 'pulseGlow 3s ease-in-out infinite',
        }} />

        {/* colour label */}
        <div
          className="dn-showcase-color-label"
          style={{
            border: `1.5px solid ${BRUSH_COLORS[active].dot}40`,
            color: BRUSH_COLORS[active].dot,
            boxShadow: `0 6px 20px ${BRUSH_COLORS[active].dot}25`,
          }}
        >
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: BRUSH_COLORS[active].dot,
            display: 'inline-block', flexShrink: 0,
            boxShadow: `0 0 6px ${BRUSH_COLORS[active].dot}`,
          }} />
          {BRUSH_COLORS[active].label}
        </div>

        {previous !== null && renderBrush(previous, 'outgoing')}
        {renderBrush(active, isSwapping ? 'incoming' : 'idle')}
      </div>

      {/* colour dot selectors — fixed box size so no layout shifts occur */}
      <div style={{ display: 'flex', gap: '0.9rem', alignItems: 'center', justifyContent: 'center', marginTop: '-1rem', height: '36px' }}>
        {BRUSH_COLORS.map((c, i) => (
          <button
            key={i}
            onClick={() => handleColorSelect(i)}
            title={c.name}
            style={{
              width:        26,
              height:       26,
              borderRadius: '50%',
              background:   c.dot,
              border:       i === active ? '3px solid white' : '2px solid transparent',
              cursor:       'pointer',
              transition:   'transform 0.35s cubic-bezier(.4,0,.2,1), box-shadow 0.35s cubic-bezier(.4,0,.2,1), border 0.35s cubic-bezier(.4,0,.2,1)',
              transform:    i === active ? 'scale(1.22)' : 'scale(1)',
              boxShadow:    i === active ? `0 0 22px ${c.dot}` : '0 4px 10px rgba(0,0,0,0.15)',
              outline:      'none',
              flexShrink:   0,
            }}
            aria-label={c.name}
            aria-pressed={i === active}
          />
        ))}
      </div>
    </div>
  );
}
