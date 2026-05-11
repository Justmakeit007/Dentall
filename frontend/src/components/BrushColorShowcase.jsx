import { useEffect, useRef, useState } from "react";

/* ─── BRUSH COLOR SHOWCASE ─────────────────────────────────── */
const BRUSH_COLORS = [
  {
    name: 'Crimson Red',
    filter: 'none',
    dot: '#E8294A',
    label: 'Signature Red',
  },
  {
    name: 'Ocean Blue',
    filter: 'hue-rotate(200deg) saturate(1.4)',
    dot: '#1A72E8',
    label: 'Ocean Blue',
  },
  {
    name: 'Forest Green',
    filter: 'hue-rotate(100deg) saturate(1.3) brightness(0.95)',
    dot: '#22A85A',
    label: 'Forest Green',
  },
  {
    name: 'Midnight Black',
    filter: 'grayscale(0.9) brightness(0.35)',
    dot: '#2C2C2C',
    label: 'Midnight Black',
  },
];

export default function BrushColorShowcase() {
  const [active, setActive] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    startAutoSlide();

    return () => clearInterval(timerRef.current);
  }, []);

  const startAutoSlide = () => {
    timerRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % BRUSH_COLORS.length);
    }, 2800);
  };

  const handleClick = (idx) => {
    clearInterval(timerRef.current);

    setActive(idx);

    startAutoSlide();
  };

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.2rem',
      }}
    >
      {/* Showcase */}
      <div
        style={{
          position: 'relative',
          width: 320,
          height: 460,
          paddingTop: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          perspective: '1200px',
        }}
      >
        {/* Dynamic color glow */}
        <div
          style={{
            position: 'absolute',
            width: 240,
            height: 240,
            borderRadius: '50%',
            background: `${BRUSH_COLORS[active].dot}25`,
            filter: 'blur(70px)',
            transition: 'all 0.7s ease',
            animation: 'pulseGlow 3s ease-in-out infinite',
          }}
        />

        {/* Color label — right side of brush, vertically centred */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            right: -16,
            transform: 'translateY(-50%) translateX(100%)',
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(12px)',
            border: `1.5px solid ${BRUSH_COLORS[active].dot}40`,
            borderRadius: 30,
            padding: '0.45rem 1.1rem',
            fontSize: '0.68rem',
            fontWeight: 700,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: BRUSH_COLORS[active].dot,
            transition: 'all 0.4s ease',
            boxShadow: `0 6px 20px ${BRUSH_COLORS[active].dot}25`,
            whiteSpace: 'nowrap',
            zIndex: 5,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <span style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: BRUSH_COLORS[active].dot,
            display: 'inline-block',
            flexShrink: 0,
            boxShadow: `0 0 6px ${BRUSH_COLORS[active].dot}`,
          }} />
          {BRUSH_COLORS[active].label}
        </div>

        {/* Brush images */}
        {BRUSH_COLORS.map((c, i) => (
          <img
            key={i}
            src="image/green.png"
            alt={c.name}
            style={{
              position: 'absolute',
              width: 220,

              filter: `
                ${c.filter}
                drop-shadow(0 24px 60px ${c.dot}35)
                drop-shadow(0 8px 20px rgba(0,0,0,.15))
              `,

              opacity: i === active ? 1 : 0,

              transform:
                i === active
                  ? 'rotateY(0deg) scale(1)'
                  : 'rotateY(-90deg) scale(0.82)',

              transformOrigin: 'center center',

              transition: `
                opacity 0.65s ease,
                transform 0.8s cubic-bezier(.4,0,.2,1)
              `,

              backfaceVisibility: 'hidden',

              animation:
                i === active
                  ? 'float-hero 4s ease-in-out infinite'
                  : 'none',

              zIndex: i === active ? 2 : 1,
            }}
          />
        ))}
      </div>

      {/* Color selectors */}
      <div
        style={{
          display: 'flex',
          gap: '0.9rem',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '-1rem',
        }}
      >
        {BRUSH_COLORS.map((c, i) => (
          <button
            key={i}
            onClick={() => handleClick(i)}
            title={c.name}
            style={{
              width: i === active ? 30 : 20,
              height: i === active ? 30 : 20,
              borderRadius: '50%',
              background: c.dot,

              border:
                i === active
                  ? '3px solid white'
                  : '2px solid transparent',

              cursor: 'pointer',

              transition:
                'all 0.35s cubic-bezier(.4,0,.2,1)',

              transform:
                i === active
                  ? 'scale(1.18)'
                  : 'scale(1)',

              boxShadow:
                i === active
                  ? `0 0 22px ${c.dot}`
                  : '0 4px 10px rgba(0,0,0,0.15)',

              outline: 'none',
            }}
            aria-label={c.name}
          />
        ))}
      </div>
    </div>
  );
}
