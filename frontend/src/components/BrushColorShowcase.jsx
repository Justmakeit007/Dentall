import { useEffect, useRef, useState } from "react";

/* ─── BRUSH COLOR SHOWCASE ─────────────────────────────────── */
const BRUSH_COLORS = [
  {
    name: 'Red',
    image: 'image/brush.png',
    dot: '#E8294A',
    label: 'Red',
  },
  {
  name: 'Mint Green',
  image: 'image/green.png',
  dot: '#A8D6AE',
  label: 'Mint Green',
},
{
  name: 'Lavender Violet',
  image: 'image/violet.png',
  dot: '#C5B1E3',
  label: 'Lavender Violet',
},
{
  name: 'Sky Blue',
  image: 'image/blue.png',
  dot: '#A9D3EA',
  label: 'Sky Blue',
},
];

export default function BrushColorShowcase() {
  const [active, setActive] = useState(0);
  const [previous, setPrevious] = useState(null);
  const [isSwapping, setIsSwapping] = useState(false);
  const activeRef = useRef(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!isSwapping) return undefined;
    const timer = setTimeout(() => {
      setPrevious(null);
      setIsSwapping(false);
    }, 920);

    return () => clearTimeout(timer);
  }, [isSwapping]);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

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

  useEffect(() => {
    startAutoSwitch();

    return () => clearInterval(intervalRef.current);
  }, []);

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
            width: 220,
            maxWidth: '70vw',
            filter: `
              drop-shadow(0 26px 54px ${color.dot}35)
              drop-shadow(0 10px 24px rgba(17,24,39,.18))
            `,
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
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.2rem',
      }}
    >
      <style>{`
        @keyframes brushSwapIn {
          0% {
            opacity: 0;
            transform: translateX(170px) rotateY(-68deg) rotateZ(10deg) scale(.9);
          }
          58% {
            opacity: 1;
            transform: translateX(-16px) rotateY(12deg) rotateZ(-2deg) scale(1.02);
          }
          100% {
            opacity: 1;
            transform: translateX(0) rotateY(0deg) rotateZ(0deg) scale(1);
          }
        }

        @keyframes brushSwapOut {
          0% {
            opacity: 1;
            transform: translateX(0) rotateY(0deg) rotateZ(0deg) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateX(-170px) rotateY(72deg) rotateZ(-10deg) scale(.86);
          }
        }

        @keyframes brushFloatSoft {
          0%, 100% { transform: translateY(0) translateZ(40px); }
          50% { transform: translateY(-13px) translateZ(40px); }
        }
      `}</style>

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
            background: `radial-gradient(circle, ${BRUSH_COLORS[active].dot}26 0%, ${BRUSH_COLORS[active].dot}10 42%, transparent 72%)`,
            filter: 'blur(70px)',
            transition: 'background 0.45s ease, transform 0.45s ease, opacity 0.45s ease',
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

        {previous !== null && renderBrush(previous, 'outgoing')}
        {renderBrush(active, isSwapping ? 'incoming' : 'idle')}
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
            onClick={() => handleColorSelect(i)}
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
            aria-pressed={i === active}
          />
        ))}
      </div>
    </div>
  );
}
