import React, { useState, useEffect, useRef } from "react";

/* ─── CSS ────────────────────────────────────────────────────── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,700;0,9..144,900;1,9..144,700&family=DM+Sans:wght@300;400;500;700&display=swap');

*, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }

:root {
  --brown-rich:    #3B1A08;
  --brown-dark:    #5C2A0E;
  --brown-mid:     #8B4513;
  --brown-warm:    #A0522D;
  --brown-caramel: #C68B3A;
  --brown-honey:   #D4A017;
  --brown-light:   #E8C47A;
  --brown-cream:   #FDF6E3;
  --neon-orange:   #FF5C00;
  --hot-coral:     #FF3D57;
  --electric-teal: #00D4B4;
  --vivid-violet:  #7C3AED;
  --acid-lime:     #84CC16;
  --sky-blue:      #0EA5E9;
  --sunshine:      #FBBF24;
  --magenta:       #EC4899;
  --crimson:        var(--neon-orange);
  --crimson-dark:   var(--brown-dark);
  --crimson-deep:   var(--brown-rich);
  --crimson-light:  #FF7A1A;
  --crimson-pale:   #FFF3E8;
  --crimson-muted:  rgba(255,92,0,0.09);
  --amber:          var(--brown-caramel);
  --ember:          var(--neon-orange);
  --rust:           var(--brown-warm);
  --gold:           var(--brown-honey);
  --white:       #FFFBF5;
  --off-white:   #FFF6EA;
  --light-gray:  #F5EDDC;
  --mid-gray:    #E8D5B0;
  --text-dark:   #1C0D02;
  --text-mid:    #4A2C10;
  --text-light:  #8A6040;
}

@keyframes bg-shimmer {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes ember-float {
  0%   { transform: translateY(0px) rotate(0deg); opacity:0.5; }
  33%  { opacity:0.85; }
  100% { transform: translateY(-60px) rotate(25deg); opacity:0; }
}
@keyframes pulse-glow {
  0%,100% { box-shadow: 0 0 0 0 rgba(192,57,43,0); }
  50%      { box-shadow: 0 0 24px 8px rgba(224,80,42,0.22); }
}
@keyframes shimmer-text {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}
@keyframes halo-spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

html { scroll-behavior:smooth; }
body { 
  background:var(--white); color:var(--text-dark); font-family:'DM Sans',sans-serif; overflow-x:hidden;
  background-image: 
    radial-gradient(ellipse at 15% 10%, rgba(255,92,0,0.10) 0%, transparent 45%),
    radial-gradient(ellipse at 85% 80%, rgba(0,212,180,0.08) 0%, transparent 45%),
    radial-gradient(ellipse at 50% 50%, rgba(124,58,237,0.04) 0%, transparent 60%);
}

@media(pointer:fine){
  body { cursor:none; }
  .dentall-cursor-dot, .dentall-cursor-ring { pointer-events:none; position:fixed; border-radius:50%; z-index:9999; transform:translate(-50%,-50%); transition:width .2s,height .2s; }
  .dentall-cursor-dot { width:10px; height:10px; background:linear-gradient(135deg,#FF5C00,#FF3D57); box-shadow: 0 0 10px rgba(255,92,0,0.7); }
  .dentall-cursor-ring { width:32px; height:32px; border:1.5px solid rgba(255,92,0,.5); z-index:9998; transition:left .1s ease,top .1s ease; }
  button,a,input { cursor:none !important; }
}
@media(pointer:coarse){ .dentall-cursor-dot,.dentall-cursor-ring { display:none; } }

.dn-nav {
  position:fixed; top:0; left:0; width:100%; z-index:100;
  padding:1.1rem 3rem; display:flex; justify-content:space-between; align-items:center;
  background:rgba(255,251,245,0.94); backdrop-filter:blur(22px);
  border-bottom:3px solid;
  border-image: linear-gradient(90deg, #FF5C00, #00D4B4, #7C3AED) 1;
  box-shadow: 0 4px 30px rgba(255,92,0,0.12), 0 1px 0 rgba(0,212,180,0.1);
}
.dn-logo { font-family:'Fraunces',serif; font-size:1.5rem; font-weight:900; letter-spacing:.05em; 
  background: linear-gradient(135deg, #8B4513 0%, #FF5C00 50%, #D4A017 100%);
  -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
}
.dn-nav-links { display:flex; gap:2rem; align-items:center; }
.dn-nav-links a { color:var(--text-mid); text-decoration:none; font-size:.8rem; letter-spacing:.1em; text-transform:uppercase; font-weight:600; transition:all .3s; }
.dn-nav-links a:hover { color:#FF5C00; text-shadow: 0 0 20px rgba(255,92,0,0.4); }
.dn-nav-cta {
  background:linear-gradient(135deg,#FF5C00 0%,#FF3D57 50%,#7C3AED 100%); 
  color:#fff; border:none; padding:.6rem 1.5rem;
  font-family:'DM Sans',sans-serif; font-size:.78rem; font-weight:700; letter-spacing:.1em;
  text-transform:uppercase; border-radius:30px; transition:all .3s;
  box-shadow: 0 4px 20px rgba(255,92,0,0.4);
}
.dn-nav-cta:hover { transform:translateY(-2px) scale(1.04); box-shadow: 0 8px 28px rgba(255,92,0,0.55), 0 0 30px rgba(124,58,237,0.25); }

.dn-hamburger { display:none; flex-direction:column; gap:5px; background:none; border:none; padding:4px; }
.dn-hamburger span { display:block; width:24px; height:2px; background:var(--text-dark); border-radius:2px; transition:all .3s; }
.dn-hamburger.open span:nth-child(1) { transform:translateY(7px) rotate(45deg); }
.dn-hamburger.open span:nth-child(2) { opacity:0; }
.dn-hamburger.open span:nth-child(3) { transform:translateY(-7px) rotate(-45deg); }

.dn-drawer {
  position:fixed; top:0; left:0; width:100%; height:100%; z-index:99;
  background:var(--white); display:flex; flex-direction:column; justify-content:center; align-items:center;
  gap:2.5rem; transform:translateX(100%); transition:transform .4s cubic-bezier(.77,0,.18,1);
  background-image: radial-gradient(ellipse at 30% 30%, rgba(255,92,0,0.08) 0%, transparent 60%),
                    radial-gradient(ellipse at 70% 70%, rgba(0,212,180,0.06) 0%, transparent 60%);
}
.dn-drawer.open { transform:translateX(0); }
.dn-drawer a { font-size:1.4rem; font-family:'Fraunces',serif; color:var(--text-dark); text-decoration:none; }
.dn-drawer button.dn-nav-cta { padding:1rem 3rem; font-size:.88rem; }

@media(max-width:768px){
  .dn-nav { padding:1rem 1.4rem; }
  .dn-nav-links { display:none; }
  .dn-hamburger { display:flex; }
}

.dn-hero {
  min-height:100vh; display:grid; grid-template-columns:1fr 1fr;
  align-items:center; padding:8rem 5rem 4rem; position:relative; overflow:hidden;
  background: linear-gradient(145deg, #FFFBF5 0%, #FFF3E0 40%, #FFF8F5 70%, #F0FDF9 100%);
}
.dn-hero-bg { position:absolute; right:-5%; top:0; width:55%; height:100%; z-index:0;
  background:linear-gradient(135deg,rgba(255,92,0,0.07) 0%,rgba(0,212,180,0.06) 50%,rgba(124,58,237,0.05) 100%);
  clip-path:polygon(15% 0%,100% 0%,100% 100%,0% 100%);
}
.dn-hero::before {
  content:'';
  position:absolute; inset:0; z-index:1; pointer-events:none;
  background-image: 
    radial-gradient(circle at 75% 25%, rgba(255,92,0,0.14) 0%, transparent 35%),
    radial-gradient(circle at 25% 75%, rgba(0,212,180,0.10) 0%, transparent 35%),
    radial-gradient(circle at 80% 80%, rgba(124,58,237,0.08) 0%, transparent 30%);
  animation: bg-shimmer 8s ease-in-out infinite;
  background-size: 200% 200%;
}
.dn-hero-content { position:relative; z-index:2; padding-right:3rem; }
.dn-hero-tag {
  display:inline-flex; align-items:center; gap:.6rem; font-size:.72rem;
  letter-spacing:.3em; text-transform:uppercase; font-weight:700; margin-bottom:1.5rem;
  background: linear-gradient(90deg, #FF5C00, #7C3AED);
  -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
}
.dn-hero-tag::before { content:''; display:block; width:32px; height:3px; background:linear-gradient(90deg,#FF5C00,#00D4B4); border-radius:2px; }
.dn-h1 { font-family:'Fraunces',serif; font-size:clamp(2.8rem,5.5vw,5.5rem); font-weight:900; line-height:1.0; letter-spacing:-.03em; color:var(--text-dark); margin-bottom:1.5rem; }
.dn-h1 em { color:#FF5C00; font-style:italic; }
.dn-hero-sub { font-size:1rem; color:var(--text-mid); line-height:1.75; max-width:440px; margin-bottom:2.5rem; font-weight:400; }
.dn-hero-ctas { display:flex; gap:1rem; align-items:center; flex-wrap:wrap; }
.dn-btn-primary { 
  background:linear-gradient(135deg,#FF5C00 0%,#FF3D57 50%,#7C3AED 100%); 
  color:#fff; border:none; padding:1rem 2.2rem; font-family:'DM Sans',sans-serif; font-size:.88rem; font-weight:700; letter-spacing:.08em; text-transform:uppercase; border-radius:30px; 
  transition:all .3s; position:relative; overflow:hidden;
  box-shadow: 0 8px 28px rgba(255,92,0,0.4), 0 2px 8px rgba(124,58,237,0.2);
}
.dn-btn-primary::after {
  content:''; position:absolute; inset:0;
  background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%);
  background-size: 200% 100%; background-position: -200% 0;
  transition: background-position 0.6s;
}
.dn-btn-primary:hover::after { background-position: 200% 0; }
.dn-btn-primary:hover { transform:translateY(-3px) scale(1.03); box-shadow:0 18px 44px rgba(255,92,0,0.5), 0 4px 16px rgba(124,58,237,0.3); }
.dn-btn-ghost { background:transparent; border:2.5px solid #FF5C00; color:#FF5C00; padding:1rem 2.2rem; font-family:'DM Sans',sans-serif; font-size:.88rem; font-weight:600; letter-spacing:.08em; text-transform:uppercase; border-radius:30px; transition:all .3s; }
.dn-btn-ghost:hover { background:linear-gradient(135deg,rgba(255,92,0,0.08),rgba(0,212,180,0.08)); border-color:#00D4B4; color:#00D4B4; }
.dn-hero-image-wrap { position:relative; z-index:2; display:flex; justify-content:center; align-items:center; }
.dn-hero-img { width:300px; filter:drop-shadow(0 24px 60px rgba(255,92,0,.28)) drop-shadow(0 8px 20px rgba(124,58,237,.18)); animation:float-hero 4s ease-in-out infinite; }
@keyframes float-hero { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
.dn-hero-badge { position:absolute; bottom:2rem; left:1rem; background:#fff; border:1px solid var(--mid-gray); border-radius:12px; padding:.9rem 1.2rem; display:flex; align-items:center; gap:.7rem; box-shadow:0 8px 30px rgba(0,0,0,.08); }
.dn-badge-label { font-size:.68rem; color:var(--text-light); text-transform:uppercase; letter-spacing:.1em; }
.dn-badge-val { font-size:.9rem; font-weight:600; color:var(--text-dark); }
.dn-scroll-hint { position:absolute; bottom:2rem; left:50%; transform:translateX(-50%); display:flex; flex-direction:column; align-items:center; gap:.5rem; color:var(--text-light); font-size:.65rem; letter-spacing:.2em; text-transform:uppercase; animation:bob 2.5s ease-in-out infinite; }
.dn-scroll-hint::after { content:''; display:block; width:1px; height:40px; background:linear-gradient(to bottom,var(--ember),transparent); }
@keyframes bob { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(6px)} }

@media(max-width:900px){
  .dn-hero { grid-template-columns:1fr; padding:7rem 1.5rem 4rem; text-align:center; }
  .dn-hero-bg { display:none; }
  .dn-hero-content { padding-right:0; }
  .dn-hero-tag { justify-content:center; }
  .dn-hero-sub { margin:0 auto 2rem; }
  .dn-hero-ctas { justify-content:center; }
  .dn-hero-image-wrap { margin-top:2.5rem; }
  .dn-hero-img { width:220px; }
  .dn-hero-badge { position:static; margin-top:1.5rem; justify-content:center; }
  .dn-scroll-hint { display:none; }
}

.dn-pack-banner {
  background: linear-gradient(135deg, #3B1A08 0%, #8B4513 25%, #FF5C00 55%, #FF3D57 75%, #7C3AED 100%);
  padding: 4rem 5rem; position: relative; overflow: hidden;
}
.dn-pack-banner::before {
  content: ''; position: absolute; inset: 0;
  background: repeating-linear-gradient(45deg, transparent, transparent 30px, rgba(255,255,255,.04) 30px, rgba(255,255,255,.04) 31px);
}
.dn-pack-inner { position: relative; z-index: 2; display: grid; grid-template-columns: 1fr auto; gap: 3rem; align-items: center; max-width: 1100px; margin: 0 auto; }
.dn-pack-label { font-size: .65rem; letter-spacing: .32em; text-transform: uppercase; color: rgba(255,255,255,.6); font-weight: 600; margin-bottom: .7rem; }
.dn-pack-title { font-family: 'Fraunces', serif; font-size: clamp(1.6rem, 3vw, 2.8rem); font-weight: 900; color: #fff; line-height: 1.15; margin-bottom: 1rem; }
.dn-pack-title em { font-style: italic; color: rgba(255,220,220,1); }
.dn-pack-desc { font-size: .9rem; color: rgba(255,255,255,.75); line-height: 1.8; max-width: 520px; font-weight: 300; }
.dn-pack-math { display: flex; flex-direction: column; gap: 1rem; background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.15); border-radius: 8px; padding: 2rem 2.5rem; min-width: 260px; backdrop-filter: blur(8px); }
.dn-pack-math-row { display: flex; justify-content: space-between; align-items: center; gap: 2rem; font-size: .82rem; color: rgba(255,255,255,.7); }
.dn-pack-math-row strong { color: #fff; font-weight: 600; }
.dn-pack-math-divider { height: 1px; background: rgba(255,255,255,.15); }
.dn-pack-math-total { display: flex; justify-content: space-between; align-items: baseline; gap: 2rem; }
.dn-pack-math-total-label { font-size: .78rem; letter-spacing: .1em; text-transform: uppercase; color: rgba(255,255,255,.8); font-weight: 600; }
.dn-pack-math-price { font-family: 'Fraunces', serif; font-size: 2rem; font-weight: 900; color: #fff; }
.dn-pack-math-price span { font-size: .75rem; font-family: 'DM Sans', sans-serif; color: rgba(255,255,255,.5); font-weight: 400; margin-left: .3rem; }
.dn-pack-timeline { display: flex; gap: 0; margin-top: 1.5rem; border: 1px solid rgba(255,255,255,.15); border-radius: 4px; overflow: hidden; }
.dn-pack-month { flex: 1; text-align: center; padding: .6rem .3rem; font-size: .62rem; color: rgba(255,255,255,.5); letter-spacing: .08em; text-transform: uppercase; border-right: 1px solid rgba(255,255,255,.1); }
.dn-pack-month:last-child { border-right: none; }
.dn-pack-month.change { background: rgba(255,255,255,.1); color: #fff; font-weight: 600; }
.dn-pack-month.change::before { content: '🔄'; display: block; font-size: .8rem; margin-bottom: .2rem; }
.dn-pack-timeline-label { font-size: .65rem; color: rgba(255,255,255,.4); text-align: center; margin-top: .5rem; letter-spacing: .12em; text-transform: uppercase; }
.dn-pack-perks { display: flex; gap: 2rem; flex-wrap: wrap; margin-top: 1.5rem; }
.dn-pack-perk { display: flex; align-items: center; gap: .5rem; font-size: .78rem; color: rgba(255,255,255,.75); }
.dn-pack-perk-dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,220,220,.8); flex-shrink: 0; }

@media(max-width:900px){
  .dn-pack-banner { padding: 3.5rem 1.5rem; }
  .dn-pack-inner { grid-template-columns: 1fr; gap: 2rem; }
  .dn-pack-math { min-width: unset; }
}

.dn-video-section { padding:5rem 5rem 6rem; background:linear-gradient(135deg,#1C0D02 0%,#3B1A08 30%,#5C2A0E 60%,#1C0D02 100%); position:relative; overflow:hidden; }
.dn-video-label { font-size:.65rem; letter-spacing:.32em; text-transform:uppercase; color:#FF5C00; font-weight:700; margin-bottom:.8rem; position:relative; z-index:2; text-align:center; }
.dn-video-title { font-family:'Fraunces',serif; font-size:clamp(1.8rem,3vw,3rem); color:#fff; font-weight:900; line-height:1.15; margin-bottom:3rem; text-align:center; position:relative; z-index:2; }
.dn-video-title em { color:#FF5C00; font-style:italic; }
.dn-video-placeholder { position:relative; z-index:2; width:100%; max-width:900px; margin:0 auto; aspect-ratio:16/9; border-radius:12px; overflow:hidden; background:linear-gradient(135deg,#1C0D02 0%,#3B1A08 40%,#1C0D02 100%); border:1px solid rgba(255,92,0,.3); box-shadow:0 0 0 1px rgba(255,92,0,.12), 0 40px 80px rgba(0,0,0,.6); cursor:pointer; }
.dn-video-grid { position:absolute; inset:0; background-image:linear-gradient(rgba(255,92,0,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,180,.04) 1px,transparent 1px); background-size:40px 40px; }
.dn-video-glow { position:absolute; top:50%; left:50%; width:400px; height:400px; background:radial-gradient(circle,rgba(255,92,0,.30) 0%,rgba(124,58,237,.12) 40%,transparent 70%); transform:translate(-50%,-50%); animation:vglow 3s ease-in-out infinite; }
@keyframes vglow { 0%,100%{opacity:.6} 50%{opacity:1} }
.dn-video-corner { position:absolute; width:24px; height:24px; border-color:#FF5C00; border-style:solid; opacity:.8; }
.dn-video-corner-tl { top:16px; left:16px; border-width:2px 0 0 2px; }
.dn-video-corner-tr { top:16px; right:16px; border-width:2px 2px 0 0; }
.dn-video-corner-bl { bottom:16px; left:16px; border-width:0 0 2px 2px; }
.dn-video-corner-br { bottom:16px; right:16px; border-width:0 2px 2px 0; }
.dn-video-play-btn { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:88px; height:88px; border-radius:50%; background:linear-gradient(135deg,#FF5C00,#7C3AED); border:none; display:flex; align-items:center; justify-content:center; animation:play-pulse 2.5s ease-out infinite; transition:transform .3s; z-index:10; }
.dn-video-play-btn:hover { transform:translate(-50%,-50%) scale(1.12); }
@keyframes play-pulse { 0%{box-shadow:0 0 0 0 rgba(255,92,0,.5)} 70%{box-shadow:0 0 0 28px rgba(255,92,0,0)} 100%{box-shadow:0 0 0 0 rgba(255,92,0,0)} }
.dn-play-icon { width:0; height:0; border-style:solid; border-width:12px 0 12px 22px; border-color:transparent transparent transparent #fff; margin-left:4px; }
.dn-video-caption { position:absolute; bottom:1.5rem; left:50%; transform:translateX(-50%); white-space:nowrap; font-size:.68rem; letter-spacing:.25em; text-transform:uppercase; color:rgba(255,255,255,.35); }
.dn-video-scanline { position:absolute; top:0; left:0; width:100%; height:2px; background:rgba(200,16,46,.3); animation:scanline 4s linear infinite; }
@keyframes scanline { 0%{top:-2px;opacity:0} 5%{opacity:1} 95%{opacity:1} 100%{top:100%;opacity:0} }
.dn-video-duration { position:absolute; top:1.2rem; right:5rem; font-size:.65rem; color:rgba(255,255,255,.3); }
.dn-video-live { position:absolute; top:1.2rem; left:1.5rem; display:flex; align-items:center; gap:.4rem; font-size:.62rem; color:rgba(255,255,255,.4); letter-spacing:.15em; text-transform:uppercase; }
.dn-video-live::before { content:''; width:6px; height:6px; border-radius:50%; background:var(--crimson); animation:blink 1.5s ease-in-out infinite; }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:.2} }
@media(max-width:768px){ .dn-video-section { padding:4rem 1.2rem 4.5rem; } }

.dn-scroll-stage { position:relative; height:600vh; background:var(--white); }
.dn-sticky-canvas { position:sticky; top:0; height:100vh; width:100%; display:flex; align-items:center; justify-content:center; overflow:hidden; background:var(--white); }
.dn-brush-scene { position:relative; width:100%; height:100%; display:flex; align-items:center; justify-content:center; }
#dn-brush-wrapper { position:relative; transform-origin:center center; display:flex; align-items:center; justify-content:center; }
#dn-brush-img { width:220px; filter:drop-shadow(0 30px 60px rgba(255,92,0,.22)) drop-shadow(0 8px 20px rgba(124,58,237,.15)); display:block; }
@media(max-width:768px){ #dn-brush-img { width:140px; } }
.dn-img-highlight { position:absolute; border-radius:50%; border:2px solid #FF5C00; opacity:0; pointer-events:none; transition:opacity .5s; animation:ring-pulse 2.2s ease-in-out infinite; }
@keyframes ring-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(255,92,0,.3)} 50%{box-shadow:0 0 0 12px rgba(255,92,0,0)} }
.dn-img-highlight.active { opacity:1; }
.dn-feature-panel { position:absolute; width:220px; opacity:0; transition:opacity .6s ease,transform .6s ease; pointer-events:none; transform:translateY(12px); }
.dn-feature-panel.left { right:calc(50% + 160px); text-align:right; }
.dn-feature-panel.right { left:calc(50% + 160px); }
.dn-feature-panel.visible { opacity:1; transform:translateY(0); }
.dn-fp-tag { font-size:.6rem; letter-spacing:.28em; text-transform:uppercase; color:#FF5C00; margin-bottom:.4rem; font-weight:700; }
.dn-fp-title { font-family:'Fraunces',serif; font-size:1.3rem; font-weight:700; color:var(--text-dark); line-height:1.15; margin-bottom:.5rem; }
.dn-fp-desc { font-size:.78rem; color:var(--text-mid); line-height:1.7; font-weight:400; }
.dn-fp-line { position:absolute; top:28px; height:2px; background:linear-gradient(90deg,#FF5C00,#00D4B4); opacity:0; transition:opacity .6s,width .6s; width:0; }
.dn-feature-panel.left .dn-fp-line { left:100%; background:linear-gradient(to right,transparent,#FF5C00); }
.dn-feature-panel.right .dn-fp-line { right:100%; background:linear-gradient(to left,transparent,#FF5C00); }
.dn-feature-panel.visible .dn-fp-line { opacity:1; width:50px; }
.dn-mobile-feature-card { display: none; position: absolute; top: 6vh; left: 50%; transform: translateX(-50%); background: rgba(255,255,255,0.97); border: 1px solid var(--mid-gray); border-left: 3px solid #FF5C00; border-radius: 4px; padding: .9rem 1.2rem; width: calc(100% - 3rem); max-width: 320px; box-shadow: 0 4px 20px rgba(0,0,0,.07); opacity: 0; transition: opacity .4s ease; z-index: 10; }
.dn-mobile-feature-card.visible { opacity: 1; }
.dn-mobile-fp-tag { font-size: .58rem; letter-spacing: .25em; text-transform: uppercase; color: #FF5C00; font-weight: 700; margin-bottom: .3rem; }
.dn-mobile-fp-title { font-family: 'Fraunces', serif; font-size: 1rem; font-weight: 700; color: var(--text-dark); margin-bottom: .25rem; }
.dn-mobile-fp-desc { font-size: .74rem; color: var(--text-mid); line-height: 1.6; font-weight: 400; }
@media(max-width:768px){ .dn-feature-panel { display:none; } .dn-mobile-feature-card { display: block; } }
#dn-phase-label { position:absolute; bottom:6vh; left:50%; transform:translateX(-50%); text-align:center; opacity:0; transition:opacity .5s; pointer-events:none; }
#dn-phase-label.visible { opacity:1; }
.dn-pl-step { font-size:.6rem; letter-spacing:.3em; text-transform:uppercase; color:#FF5C00; font-weight:700; margin-bottom:.2rem; }
.dn-pl-name { font-family:'Fraunces',serif; font-size:1.6rem; font-weight:700; color:var(--text-dark); }
@media(max-width:768px){ #dn-phase-label { bottom:5vh; } .dn-pl-name { font-size:1.2rem; } }
#dn-progress-dots { position:fixed; right:1.5rem; top:50%; transform:translateY(-50%); display:flex; flex-direction:column; gap:.7rem; z-index:50; }
.dn-dot { width:6px; height:6px; border-radius:50%; border:1.5px solid var(--text-light); transition:all .3s; }
.dn-dot.active { background:#FF5C00; border-color:#FF5C00; transform:scale(1.5); box-shadow: 0 0 8px rgba(255,92,0,0.5); }
@media(max-width:768px){ #dn-progress-dots { right:.8rem; } }

.dn-features-grid { padding:6rem 5rem; background:var(--off-white); border-top:3px solid; border-image: linear-gradient(90deg,#FF5C00,#00D4B4,#7C3AED) 1; }
.dn-section-label { font-size:.63rem; letter-spacing:.3em; text-transform:uppercase; color:#FF5C00; font-weight:700; margin-bottom:.8rem; }
.dn-section-title { font-family:'Fraunces',serif; font-size:clamp(1.8rem,3vw,2.8rem); font-weight:900; color:var(--text-dark); margin-bottom:3rem; max-width:480px; line-height:1.2; }
.dn-section-title em { color:#FF5C00; font-style:italic; background: linear-gradient(90deg, #FF5C00, #FF3D57, #7C3AED, #FF5C00); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; animation: shimmer-text 3s linear infinite; }
.dn-features-inner { display:grid; grid-template-columns:1fr 1fr 1fr; gap:2px; background:var(--mid-gray); border:2px solid var(--mid-gray); border-radius:12px; overflow:hidden; }
.dn-feat-card { background:var(--white); padding:2.5rem 2rem; opacity:0; transform:translateY(24px); transition:opacity .6s,transform .6s,box-shadow .3s; position:relative; overflow:hidden; }
.dn-feat-card::before { content:''; position:absolute; bottom:0; left:0; width:0; height:4px; background:linear-gradient(90deg,#FF5C00,#00D4B4,#7C3AED); transition:width .5s; }
.dn-feat-card:hover::before { width:100%; }
.dn-feat-card.visible { opacity:1; transform:translateY(0); }
.dn-feat-num { font-family:'Fraunces',serif; font-size:3rem; font-weight:900; color:rgba(255,92,0,.1); line-height:1; margin-bottom:.8rem; }
.dn-feat-icon { font-size:1.5rem; margin-bottom:.7rem; }
.dn-feat-title { font-size:.93rem; font-weight:700; color:var(--text-dark); margin-bottom:.5rem; }
.dn-feat-text { font-size:.8rem; color:var(--text-mid); line-height:1.7; font-weight:400; }
@media(max-width:900px){ .dn-features-inner { grid-template-columns:1fr 1fr; } }
@media(max-width:600px){ .dn-features-inner { grid-template-columns:1fr; } .dn-features-grid { padding:5rem 1.4rem; } }

.dn-social { padding:6rem 0 6rem; background:var(--white); overflow:hidden; }
.dn-social-header { padding: 0 5rem 3rem; text-align:center; }
.dn-social-header .dn-section-title { margin: 0 auto; }
.dn-reviews-track-wrapper { position: relative; width: 100%; overflow: hidden; padding: 1rem 0 2rem; }
.dn-reviews-track-wrapper::before,.dn-reviews-track-wrapper::after { content: ''; position: absolute; top: 0; bottom: 0; width: 80px; z-index: 2; pointer-events: none; }
.dn-reviews-track-wrapper::before { left: 0; background: linear-gradient(to right, var(--white), transparent); }
.dn-reviews-track-wrapper::after  { right: 0; background: linear-gradient(to left, var(--white), transparent); }
.dn-reviews-scroll-track { display: flex; gap: 1.5rem; width: max-content; animation: marquee-scroll 30s linear infinite; will-change: transform; }
.dn-reviews-track-wrapper:hover .dn-reviews-scroll-track { animation-play-state: paused; }
@keyframes marquee-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
.dn-review-card { background: var(--off-white); border: 1px solid rgba(255,92,0,0.18); padding: 2rem; text-align: left; position: relative; flex: 0 0 300px; border-radius: 12px; transition: transform .3s, box-shadow .3s; }
.dn-review-card:hover { transform: translateY(-6px); box-shadow: 0 16px 48px rgba(255,92,0,.15); }
.dn-review-card::before { content: '\u201C'; position: absolute; top: 1.2rem; right: 1.5rem; font-family: 'Fraunces', serif; font-size: 3rem; color: #FF5C00; opacity: .2; line-height: 1; }
.dn-stars { color:#FBBF24; font-size:.85rem; margin-bottom:.8rem; }
.dn-review-text { font-size:.82rem; color:var(--text-mid); line-height:1.75; margin-bottom:1.2rem; }
.dn-review-author { font-size:.76rem; color:var(--text-dark); font-weight:700; }
.dn-stats-row { display:flex; justify-content:center; gap:4rem; flex-wrap:wrap; padding: 3rem 5rem 0; border-top:2px solid; border-image: linear-gradient(90deg,#FF5C00,#00D4B4,#7C3AED) 1; margin: 0 3rem; }
.dn-stat-num { font-family:'Fraunces',serif; font-size:2.8rem; font-weight:900; color:#FF5C00; line-height:1.1; }
.dn-stat-label { font-size:.7rem; color:var(--text-light); letter-spacing:.12em; text-transform:uppercase; margin-top:.3rem; }
@media(max-width:900px){ .dn-social { padding: 5rem 0; } .dn-social-header { padding: 0 1.4rem 2.5rem; } .dn-stats-row { gap:2.5rem; padding: 2.5rem 1.4rem 0; margin: 0 1rem; } .dn-review-card { flex: 0 0 260px; } }

.dn-order { padding:6rem 5rem; display:grid; grid-template-columns:1fr 1fr; gap:5rem; align-items:start; background: linear-gradient(135deg, rgba(255,92,0,0.04) 0%, rgba(0,212,180,0.03) 50%, rgba(124,58,237,0.03) 100%); border-top:3px solid; border-image: linear-gradient(90deg,#FF5C00,#00D4B4) 1; position:relative; overflow:hidden; }
.dn-order-title { font-family:'Fraunces',serif; font-size:clamp(1.8rem,3vw,3.2rem); font-weight:900; color:var(--text-dark); line-height:1.1; margin-bottom:1.2rem; }
.dn-order-title em { color:#FF5C00; font-style:italic; }
.dn-order-desc { font-size:.88rem; color:var(--text-mid); line-height:1.8; margin-bottom:2rem; }
.dn-price-row { display:flex; align-items:baseline; gap:1rem; margin-bottom:1.5rem; flex-wrap:wrap; }
.dn-price-main { font-family:'Fraunces',serif; font-size:2.8rem; color:#FF5C00; font-weight:900; }
.dn-price-badge { background:linear-gradient(135deg,#FF5C00,#FF3D57); color:#fff; font-size:.66rem; font-weight:700; letter-spacing:.1em; padding:.3rem .7rem; text-transform:uppercase; border-radius:20px; }
.dn-include-item { display:flex; align-items:center; gap:.8rem; font-size:.82rem; color:var(--text-mid); padding:.6rem 0; border-bottom:1px solid rgba(255,92,0,.1); }
.dn-check { color:#00D4B4; font-size:.82rem; font-weight:700; }
.dn-form-card { background:var(--white); border:1px solid rgba(255,92,0,0.15); padding:2.5rem; box-shadow:0 8px 40px rgba(255,92,0,.08); border-radius:12px; }
.dn-form-title { font-family:'Fraunces',serif; font-size:1.4rem; color:var(--text-dark); margin-bottom:1.8rem; font-weight:700; }
.dn-field { margin-bottom:1.1rem; }
.dn-field label { display:block; font-size:.68rem; letter-spacing:.15em; text-transform:uppercase; color:var(--text-light); margin-bottom:.5rem; font-weight:700; }
.dn-field input, .dn-field select { width:100%; background:var(--off-white); border:1.5px solid var(--mid-gray); color:var(--text-dark); padding:.75rem 1rem; font-family:'DM Sans',sans-serif; font-size:.86rem; outline:none; transition:border-color .3s,box-shadow .3s; border-radius:8px; }
.dn-field input:focus, .dn-field select:focus { border-color:#FF5C00; box-shadow:0 0 0 3px rgba(255,92,0,.12); }
.dn-field input::placeholder { color:var(--text-light); }
.dn-field input.error { border-color:#FF3D57; }
.dn-field-row { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
.dn-qty-selector { display:flex; align-items:center; }
.dn-qty-btn { background:var(--light-gray); border:1px solid var(--mid-gray); color:var(--text-dark); width:40px; height:44px; font-size:1.2rem; display:flex; align-items:center; justify-content:center; transition:background .2s; }
.dn-qty-btn:hover { background:rgba(255,92,0,0.1); color:#FF5C00; }
.dn-qty-val { background:var(--off-white); border:1px solid var(--mid-gray); border-left:none; border-right:none; color:var(--text-dark); width:50px; height:44px; text-align:center; font-size:.95rem; font-family:'DM Sans',sans-serif; display:flex; align-items:center; justify-content:center; }
.dn-pack-select { display: grid; grid-template-columns: 1fr 1fr; gap: .8rem; margin-bottom: 1.2rem; }
.dn-pack-option { border: 1.5px solid var(--mid-gray); border-radius: 4px; padding: .9rem; cursor: pointer; transition: all .2s; background: var(--off-white); text-align: center; }
.dn-pack-option:hover { border-color: #FF5C00; background: rgba(255,92,0,0.05); }
.dn-pack-option.selected { border-color: #FF5C00; background: rgba(255,92,0,0.07); box-shadow: 0 0 0 3px rgba(255,92,0,0.15); }
.dn-pack-option-name { font-size: .75rem; font-weight: 700; color: var(--text-dark); margin-bottom: .2rem; }
.dn-pack-option-detail { font-size: .65rem; color: var(--text-mid); }
.dn-pack-option-price { font-family: 'Fraunces', serif; font-size: 1.1rem; color: #FF5C00; font-weight: 900; margin-top: .3rem; }
.dn-pack-option-badge { display: inline-block; background: linear-gradient(135deg,#FF5C00,#7C3AED); color: #fff; font-size: .55rem; font-weight: 700; letter-spacing: .08em; padding: .15rem .4rem; border-radius: 10px; text-transform: uppercase; margin-top: .3rem; }
.dn-order-total { display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--mid-gray); padding-top:1.2rem; margin-top:1.2rem; }
.dn-total-label { font-size:.73rem; letter-spacing:.12em; text-transform:uppercase; color:var(--text-light); font-weight:700; }
.dn-total-price { font-family:'Fraunces',serif; font-size:1.8rem; color:#FF5C00; font-weight:900; }
.dn-submit-btn { width:100%; margin-top:1.5rem; background:linear-gradient(135deg,#FF5C00 0%,#FF3D57 40%,#7C3AED 100%); color:#fff; border:none; padding:1.1rem; font-family:'DM Sans',sans-serif; font-size:.88rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase; border-radius:30px; transition:all .3s; box-shadow: 0 8px 28px rgba(255,92,0,0.4); position:relative; overflow:hidden; }
.dn-submit-btn:hover { transform:translateY(-2px); box-shadow:0 16px 40px rgba(255,92,0,.5); }
.dn-trust-badges { display:flex; gap:1.5rem; margin-top:1.1rem; justify-content:center; flex-wrap:wrap; }
.dn-trust-b { font-size:.66rem; color:var(--text-light); }
.dn-trust-b span { color:#00D4B4; margin-right:.2rem; }

/* ── SHIPPING COST BOX ── */
.dn-shipping-box { background: rgba(0,212,180,0.06); border: 1px solid rgba(0,212,180,0.25); border-radius: 8px; padding: .9rem 1.1rem; margin-bottom: 1rem; }
.dn-shipping-loading { font-size: .78rem; color: var(--text-light); display: flex; align-items: center; gap: .5rem; }
.dn-shipping-loading::before { content: ''; display: inline-block; width: 12px; height: 12px; border: 2px solid rgba(0,212,180,.3); border-top-color: #00D4B4; border-radius: 50%; animation: spin .7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.dn-shipping-result { display: flex; justify-content: space-between; align-items: center; }
.dn-shipping-name { font-size: .78rem; color: var(--text-mid); }
.dn-shipping-charge { font-size: .9rem; font-weight: 700; color: #00D4B4; }
.dn-shipping-eta { font-size: .68rem; color: var(--text-light); margin-top: .2rem; }
.dn-shipping-free { font-size: .78rem; color: #00D4B4; font-weight: 700; }

@media(max-width:900px){ .dn-order { grid-template-columns:1fr; gap:3rem; padding:5rem 1.4rem; } }
@media(max-width:480px){ .dn-field-row { grid-template-columns:1fr; } }

.dn-footer { border-top:3px solid; border-image: linear-gradient(90deg,#FF5C00,#00D4B4,#7C3AED) 1; padding:2.2rem 3rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; background:linear-gradient(135deg,var(--off-white) 0%,var(--white) 100%); }
.dn-footer-logo { font-family:'Fraunces',serif; font-size:1.1rem; letter-spacing:.08em; font-weight:900; background: linear-gradient(135deg, #8B4513 0%, #FF5C00 50%, #D4A017 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
.dn-footer-copy { font-size:.71rem; color:var(--text-light); }
.dn-footer-links { display:flex; gap:2rem; }
.dn-footer-links a { font-size:.71rem; color:var(--text-light); text-decoration:none; transition:color .3s; }
.dn-footer-links a:hover { color:#FF5C00; }
@media(max-width:600px){ .dn-footer { flex-direction:column; text-align:center; padding:2rem 1.4rem; } }

.dn-toast { position:fixed; bottom:2rem; left:50%; transform:translateX(-50%) translateY(100px); background:linear-gradient(135deg,#FF5C00,#7C3AED); color:#fff; padding:1rem 2rem; font-weight:600; font-size:.88rem; z-index:9999; transition:transform .4s cubic-bezier(.34,1.56,.64,1); white-space:nowrap; border-radius:30px; box-shadow:0 8px 32px rgba(255,92,0,.45); }
.dn-toast.show { transform:translateX(-50%) translateY(0); }

.dn-video-modal { position:fixed; inset:0; z-index:9999; display:flex; align-items:center; justify-content:center; }
.dn-video-backdrop { position:absolute; inset:0; background:rgba(0,0,0,0.75); backdrop-filter:blur(12px); animation:fadeIn 0.4s ease; }
.dn-video-container { position:relative; width:80%; max-width:900px; aspect-ratio:16/9; background:#000; border-radius:8px; overflow:hidden; z-index:2; transform:scale(0.9); animation:zoomIn 0.4s ease forwards; }
.dn-video-close { position:absolute; top:10px; right:14px; background:rgba(0,0,0,0.6); border:none; color:#fff; font-size:1.2rem; padding:6px 10px; cursor:pointer; z-index:10; border-radius:4px; }
@keyframes fadeIn { from{opacity:0} to{opacity:1} }
@keyframes zoomIn { from{transform:scale(0.8);opacity:0} to{transform:scale(1);opacity:1} }

.dn-cart-btn { position:relative; background:none; border:2px solid #FF5C00; color:#FF5C00; padding:.5rem 1rem; border-radius:20px; font-family:'DM Sans',sans-serif; font-size:.78rem; font-weight:700; letter-spacing:.08em; text-transform:uppercase; transition:all .3s; display:flex; align-items:center; gap:.5rem; }
.dn-cart-btn:hover { background:rgba(255,92,0,0.08); }
.dn-cart-badge { background:linear-gradient(135deg,#FF5C00,#FF3D57); color:#fff; border-radius:50%; width:18px; height:18px; font-size:.6rem; font-weight:700; display:flex; align-items:center; justify-content:center; }
.dn-cart-overlay { position:fixed; inset:0; background:rgba(0,0,0,.45); z-index:200; opacity:0; pointer-events:none; transition:opacity .35s; backdrop-filter:blur(4px); }
.dn-cart-overlay.open { opacity:1; pointer-events:all; }
.dn-cart-drawer { position:fixed; top:0; right:0; height:100%; width:400px; max-width:100vw; background:var(--white); z-index:201; display:flex; flex-direction:column; transform:translateX(100%); transition:transform .4s cubic-bezier(.77,0,.18,1); box-shadow:-12px 0 60px rgba(255,92,0,.15); }
.dn-cart-drawer.open { transform:translateX(0); }
.dn-cart-head { display:flex; justify-content:space-between; align-items:center; padding:1.4rem 1.6rem; border-bottom:2px solid; border-image: linear-gradient(90deg,#FF5C00,#00D4B4) 1; }
.dn-cart-title { font-family:'Fraunces',serif; font-size:1.2rem; color:var(--text-dark); font-weight:900; }
.dn-cart-close { background:none; border:none; font-size:1.2rem; color:var(--text-mid); padding:.2rem .5rem; border-radius:2px; transition:all .2s; }
.dn-cart-body { flex:1; overflow-y:auto; padding:1.2rem 1.6rem; }
.dn-cart-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; gap:1rem; color:var(--text-light); }
.dn-cart-empty-icon { font-size:3rem; opacity:.4; }
.dn-cart-empty-text { font-size:.85rem; }
.dn-cart-item { display:grid; grid-template-columns:auto 1fr auto; gap:1rem; align-items:center; padding:1rem 0; border-bottom:1px solid var(--mid-gray); }
.dn-cart-item-icon { width:48px; height:48px; background:rgba(255,92,0,0.08); border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:1.4rem; }
.dn-cart-item-name { font-size:.86rem; font-weight:600; color:var(--text-dark); margin-bottom:.2rem; }
.dn-cart-item-price { font-size:.78rem; color:#FF5C00; font-weight:700; }
.dn-cart-item-actions { display:flex; align-items:center; gap:.4rem; }
.dn-cart-qty-btn { background:var(--light-gray); border:1px solid var(--mid-gray); color:var(--text-dark); width:28px; height:28px; font-size:.9rem; display:flex; align-items:center; justify-content:center; border-radius:2px; transition:background .2s; }
.dn-cart-qty-btn:hover { background:rgba(255,92,0,0.1); color:#FF5C00; }
.dn-cart-qty-val { width:24px; text-align:center; font-size:.85rem; font-weight:700; color:var(--text-dark); }
.dn-cart-remove { background:none; border:none; color:var(--text-light); font-size:.85rem; padding:.2rem; margin-left:.2rem; transition:color .2s; }
.dn-cart-remove:hover { color:#FF3D57; }
.dn-cart-foot { padding:1.4rem 1.6rem; border-top:1px solid var(--mid-gray); background:var(--off-white); }
.dn-cart-subtotal { display:flex; justify-content:space-between; margin-bottom:.5rem; }
.dn-cart-subtotal-label { font-size:.78rem; text-transform:uppercase; letter-spacing:.1em; color:var(--text-light); font-weight:700; }
.dn-cart-subtotal-val { font-family:'Fraunces',serif; font-size:1.3rem; color:#FF5C00; font-weight:900; }
.dn-cart-shipping-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:.5rem; font-size:.78rem; color:var(--text-mid); }
.dn-cart-shipping-val { font-weight:600; color:#00D4B4; }
.dn-cart-total-row { display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--mid-gray); padding-top:.8rem; margin-bottom:1rem; }
.dn-cart-total-label { font-size:.8rem; font-weight:700; color:var(--text-dark); text-transform:uppercase; letter-spacing:.08em; }
.dn-cart-total-val { font-family:'Fraunces',serif; font-size:1.5rem; color:#FF5C00; font-weight:900; }
.dn-cart-checkout-btn { width:100%; background:linear-gradient(135deg,#FF5C00 0%,#FF3D57 40%,#7C3AED 100%); color:#fff; border:none; padding:1rem; font-family:'DM Sans',sans-serif; font-size:.88rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase; border-radius:30px; transition:all .3s; box-shadow: 0 6px 24px rgba(255,92,0,0.35); }
.dn-cart-checkout-btn:hover { transform:translateY(-2px); box-shadow:0 12px 36px rgba(255,92,0,.5); }
.dn-add-cart-btn { margin-top:.8rem; width:100%; background:transparent; border:2px solid #FF5C00; color:#FF5C00; padding:.55rem 1rem; font-family:'DM Sans',sans-serif; font-size:.75rem; font-weight:700; letter-spacing:.08em; text-transform:uppercase; border-radius:20px; transition:all .3s; }
.dn-add-cart-btn:hover { background:linear-gradient(135deg,#FF5C00,#7C3AED); color:#fff; border-color:transparent; }

/* ── PAYMENT MODAL ── */
.dn-pay-overlay { position:fixed; inset:0; z-index:500; display:flex; align-items:center; justify-content:center; background:rgba(26,10,7,.7); backdrop-filter:blur(10px); animation:fadeIn .3s ease; }
.dn-pay-modal { background:var(--white); width:100%; max-width:520px; max-height:92vh; overflow-y:auto; border-radius:4px; box-shadow:0 32px 80px rgba(139,58,42,.3); animation:zoomIn .35s cubic-bezier(.34,1.56,.64,1); position:relative; }
.dn-pay-header { background:linear-gradient(135deg,#3B1A08 0%,#8B4513 30%,#FF5C00 65%,#7C3AED 100%); padding:1.8rem 2rem 1.5rem; display:flex; justify-content:space-between; align-items:flex-start; }
.dn-pay-header-left { color:#fff; }
.dn-pay-secure-tag { display:inline-flex; align-items:center; gap:.4rem; font-size:.6rem; letter-spacing:.2em; text-transform:uppercase; color:rgba(255,255,255,.65); font-weight:600; margin-bottom:.5rem; }
.dn-pay-secure-tag::before { content:'🔒'; font-size:.7rem; }
.dn-pay-modal-title { font-family:'Fraunces',serif; font-size:1.5rem; font-weight:900; color:#fff; line-height:1.1; }
.dn-pay-close { background:rgba(255,255,255,.15); border:none; color:#fff; width:32px; height:32px; border-radius:50%; font-size:1rem; display:flex; align-items:center; justify-content:center; transition:background .2s; }
.dn-pay-close:hover { background:rgba(255,255,255,.3); }
.dn-pay-body { padding:2rem; }
.dn-pay-order-summary { background:rgba(255,92,0,0.05); border:1px solid rgba(255,92,0,.15); border-radius:8px; padding:1rem 1.2rem; margin-bottom:1.8rem; }
.dn-pay-summary-label { font-size:.62rem; letter-spacing:.2em; text-transform:uppercase; color:#FF5C00; font-weight:700; margin-bottom:.8rem; }
.dn-pay-summary-row { display:flex; justify-content:space-between; align-items:center; font-size:.82rem; color:var(--text-mid); padding:.3rem 0; }
.dn-pay-summary-row.total { border-top:1px solid rgba(192,57,43,.15); margin-top:.5rem; padding-top:.8rem; }
.dn-pay-summary-row.total span:first-child { font-weight:600; color:var(--text-dark); font-size:.85rem; }
.dn-pay-summary-row.total span:last-child { font-family:'Fraunces',serif; font-size:1.2rem; color:#FF5C00; font-weight:900; }
.dn-pay-section-label { font-size:.62rem; letter-spacing:.2em; text-transform:uppercase; color:var(--text-light); font-weight:600; margin-bottom:1rem; display:flex; align-items:center; gap:.5rem; }
.dn-pay-section-label::after { content:''; flex:1; height:1px; background:var(--mid-gray); }

/* ── PINCODE SHIPPING ROW ── */
.dn-pay-pincode-row { display: flex; gap: .6rem; margin-bottom: 1.4rem; }
.dn-pay-pincode-row input { flex: 1; background:var(--off-white); border:1.5px solid var(--mid-gray); color:var(--text-dark); padding:.75rem 1rem; font-family:'DM Sans',sans-serif; font-size:.9rem; outline:none; transition:border-color .3s; border-radius:8px; }
.dn-pay-pincode-row input:focus { border-color:#FF5C00; box-shadow:0 0 0 3px rgba(255,92,0,.12); }
.dn-pay-pincode-check { background:linear-gradient(135deg,#FF5C00,#00D4B4); color:#fff; border:none; padding:.75rem 1.1rem; font-family:'DM Sans',sans-serif; font-size:.75rem; font-weight:700; letter-spacing:.08em; text-transform:uppercase; border-radius:8px; white-space:nowrap; transition:all .2s; }
.dn-pay-pincode-check:hover { opacity:.9; }
.dn-pay-pincode-check:disabled { opacity:.5; cursor:not-allowed; }
.dn-shipping-info-box { background: rgba(0,212,180,0.07); border:1px solid rgba(0,212,180,0.3); border-radius:8px; padding:.8rem 1rem; margin-bottom:1.2rem; }
.dn-shipping-info-row { display:flex; justify-content:space-between; align-items:center; font-size:.8rem; }
.dn-shipping-info-courier { color:var(--text-mid); }
.dn-shipping-info-price { font-weight:700; color:#00D4B4; }
.dn-shipping-info-eta { font-size:.7rem; color:var(--text-light); margin-top:.3rem; }

.dn-pay-field { margin-bottom:1.1rem; }
.dn-pay-field label { display:block; font-size:.62rem; letter-spacing:.15em; text-transform:uppercase; color:var(--text-light); margin-bottom:.45rem; font-weight:600; }
.dn-pay-field input { width:100%; background:var(--off-white); border:1.5px solid var(--mid-gray); color:var(--text-dark); padding:.75rem 1rem; font-family:'DM Sans',sans-serif; font-size:.9rem; outline:none; transition:border-color .3s,box-shadow .3s; border-radius:8px; }
.dn-pay-field input:focus { border-color:#FF5C00; box-shadow:0 0 0 3px rgba(255,92,0,.12); }
.dn-pay-field input::placeholder { color:var(--text-light); }
.dn-pay-field-row { display:grid; grid-template-columns:1fr 1fr; gap:.8rem; }
.dn-upi-wrap { display:flex; gap:.6rem; }
.dn-upi-wrap input { flex:1; }
.dn-upi-verify { background:linear-gradient(135deg,#FF5C00,#00D4B4); color:#fff; border:none; padding:.75rem 1.1rem; font-family:'DM Sans',sans-serif; font-size:.75rem; font-weight:700; text-transform:uppercase; border-radius:8px; white-space:nowrap; transition:all .2s; }
.dn-razorpay-btn { width:100%; background:linear-gradient(135deg,#072654 0%,#0A3875 50%,#1A5EB8 100%); color:#fff; border:none; padding:1.1rem; font-family:'DM Sans',sans-serif; font-size:.9rem; font-weight:700; letter-spacing:.12em; text-transform:uppercase; border-radius:30px; margin-top:1.5rem; transition:all .3s; box-shadow:0 8px 28px rgba(7,38,84,0.4); display:flex; align-items:center; justify-content:center; gap:.7rem; }
.dn-razorpay-btn:hover { transform:translateY(-2px); box-shadow:0 16px 40px rgba(7,38,84,.5); }
.dn-razorpay-btn:disabled { opacity:.6; cursor:not-allowed; transform:none; }
.dn-razorpay-logo { font-size:.7rem; background:rgba(255,255,255,.15); padding:.2rem .5rem; border-radius:4px; letter-spacing:.05em; }
.dn-pay-footer-badges { display:flex; justify-content:center; gap:1.5rem; margin-top:1rem; flex-wrap:wrap; }
.dn-pay-badge { font-size:.62rem; color:var(--text-light); display:flex; align-items:center; gap:.3rem; }
.dn-pay-success { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:3.5rem 2rem; text-align:center; min-height:360px; }
.dn-pay-success-icon { width:72px; height:72px; border-radius:50%; background:linear-gradient(135deg,#28a745,#20c74b); display:flex; align-items:center; justify-content:center; font-size:2rem; margin-bottom:1.5rem; box-shadow:0 12px 32px rgba(40,167,69,.3); animation:pop .5s cubic-bezier(.34,1.56,.64,1); }
@keyframes pop { from{transform:scale(0);opacity:0} to{transform:scale(1);opacity:1} }
.dn-pay-success-title { font-family:'Fraunces',serif; font-size:1.8rem; font-weight:900; color:var(--text-dark); margin-bottom:.7rem; }
.dn-pay-success-sub { font-size:.88rem; color:var(--text-mid); line-height:1.7; max-width:320px; }
.dn-pay-success-ref { background:rgba(255,92,0,0.08); border:1px solid rgba(255,92,0,.2); border-radius:8px; padding:.7rem 1.2rem; margin:1.5rem 0; font-size:.78rem; color:#FF5C00; font-weight:700; letter-spacing:.08em; }
.dn-pay-success-awb { background:rgba(0,212,180,0.08); border:1px solid rgba(0,212,180,.2); border-radius:8px; padding:.7rem 1.2rem; margin-bottom:1.5rem; font-size:.78rem; color:#00D4B4; font-weight:700; }
.dn-pay-done-btn { background:linear-gradient(135deg,#FF5C00,#7C3AED); color:#fff; border:none; padding:.9rem 2.5rem; font-family:'DM Sans',sans-serif; font-size:.82rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase; border-radius:30px; transition:all .3s; box-shadow: 0 6px 20px rgba(255,92,0,0.35); }
.dn-pay-done-btn:hover { transform:translateY(-2px); box-shadow:0 12px 32px rgba(255,92,0,.5); }

/* ── TRACKING PAGE ── */
.dn-tracking-section { padding: 6rem 5rem; background: var(--off-white); border-top:3px solid; border-image: linear-gradient(90deg,#FF5C00,#00D4B4,#7C3AED) 1; }
.dn-tracking-card { background: var(--white); border:1px solid rgba(255,92,0,0.15); border-radius:12px; padding: 2.5rem; max-width:680px; margin: 0 auto; box-shadow: 0 8px 40px rgba(255,92,0,.06); }
.dn-tracking-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
.dn-tracking-order-id { font-size:.68rem; color:var(--text-light); text-transform:uppercase; letter-spacing:.15em; margin-bottom:.3rem; }
.dn-tracking-awb { font-family:'Fraunces',serif; font-size:1.3rem; font-weight:700; color:var(--text-dark); }
.dn-tracking-status-badge { background:linear-gradient(135deg,rgba(0,212,180,.12),rgba(0,212,180,.06)); border:1px solid rgba(0,212,180,.3); color:#00D4B4; font-size:.72rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase; padding:.4rem .9rem; border-radius:20px; }
.dn-tracking-progress { display: flex; align-items: center; margin-bottom: 2.5rem; }
.dn-track-step { display: flex; flex-direction: column; align-items: center; flex: 1; }
.dn-track-step-dot { width:28px; height:28px; border-radius:50%; border:2px solid var(--mid-gray); background:var(--white); display:flex; align-items:center; justify-content:center; font-size:.7rem; color:var(--text-light); transition:all .3s; margin-bottom:.5rem; }
.dn-track-step.done .dn-track-step-dot { background:linear-gradient(135deg,#00D4B4,#0EA5E9); border-color:#00D4B4; color:#fff; }
.dn-track-step.active .dn-track-step-dot { background:linear-gradient(135deg,#FF5C00,#FF3D57); border-color:#FF5C00; color:#fff; animation:pulse-glow 1.5s ease-in-out infinite; }
.dn-track-step-label { font-size:.6rem; color:var(--text-light); text-transform:uppercase; letter-spacing:.08em; text-align:center; }
.dn-track-step.done .dn-track-step-label,.dn-track-step.active .dn-track-step-label { color:var(--text-dark); font-weight:600; }
.dn-track-line { flex:1; height:2px; background:var(--mid-gray); margin-top:-1.1rem; transition:background .3s; }
.dn-track-line.done { background:linear-gradient(90deg,#00D4B4,#0EA5E9); }
.dn-tracking-events { margin-top:1.5rem; }
.dn-tracking-event { display:flex; gap:1rem; padding:.8rem 0; border-bottom:1px solid var(--mid-gray); }
.dn-tracking-event:last-child { border-bottom:none; }
.dn-event-dot { width:8px; height:8px; border-radius:50%; background:#FF5C00; flex-shrink:0; margin-top:.3rem; }
.dn-event-dot.old { background:var(--mid-gray); }
.dn-event-text { font-size:.8rem; color:var(--text-dark); margin-bottom:.2rem; }
.dn-event-time { font-size:.68rem; color:var(--text-light); }
.dn-tracking-lookup { display: flex; gap: .8rem; margin-bottom: 2rem; }
.dn-tracking-lookup input { flex:1; background:var(--off-white); border:1.5px solid var(--mid-gray); color:var(--text-dark); padding:.75rem 1rem; font-family:'DM Sans',sans-serif; font-size:.9rem; outline:none; border-radius:8px; transition:border-color .3s; }
.dn-tracking-lookup input:focus { border-color:#FF5C00; box-shadow:0 0 0 3px rgba(255,92,0,.12); }
.dn-tracking-lookup button { background:linear-gradient(135deg,#FF5C00,#7C3AED); color:#fff; border:none; padding:.75rem 1.5rem; font-family:'DM Sans',sans-serif; font-size:.82rem; font-weight:700; border-radius:8px; transition:all .2s; white-space:nowrap; }
.dn-tracking-lookup button:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(255,92,0,.35); }

@media(max-width:540px){
  .dn-pay-modal { max-height:100vh; border-radius:0; }
  .dn-pay-field-row { grid-template-columns:1fr; }
  .dn-tracking-section { padding: 5rem 1.4rem; }
}
  @keyframes pulseGlow {
  0%,100% {
    transform: scale(1);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.08);
    opacity: 1;
  }
}
`;

/* ─── CONSTANTS ────────────────────────────────────────────────── */
const SINGLE_PRICE    = 599;
const FAMILY_PACK_PRICE = 5990;
// const RAZORPAY_KEY_ID = "rzp_test_SlG1HvlDp3i5Fw"; // ← replace with your key

const FEATURES = [
  { num:"01", icon:"🦷", title:"Nano Bristle Technology", text:"10,000 micro-filaments per cm² with varying stiffness — hard on plaque, gentle on enamel and gums." },
  { num:"02", icon:"✋", title:"Ergonomic Red Grip", text:"Dual-material TPE inlay provides non-slip control and reduces wrist strain during the full two-minute brush." },
  { num:"03", icon:"🔬", title:"Anti-Bacterial Materials", text:"Medical-grade polypropylene inhibits bacteria build-up between bristle tufts, keeping each brush hygienic longer." },
  { num:"04", icon:"💧", title:"Easy-Rinse Design", text:"Open bristle cluster spacing allows water to flow through freely, washing away toothpaste and debris completely." },
  { num:"05", icon:"🩺", title:"Dentist Recommended", text:"Clinically tested and recommended by over 200 dental professionals across India for daily home care." },
  { num:"06", icon:"♻️", title:"Replaceable Head System", text:"Swap only the bristle head every 3 months. The durable handle lasts years, reducing plastic waste by 70%." },
];
const REVIEWS = [
  { text:"The red grip is so comfortable — I never feel like I'm pressing too hard. My dentist noticed my gums are healthier after just 2 months.", author:"Arjun M.", city:"Mumbai" },
  { text:"My dentist actually noticed a difference at my last checkup. Less plaque, healthier gums. She asked what I'd changed — I showed her DENTALL.", author:"Priya S.", city:"Bangalore" },
  { text:"The bristles are incredibly soft yet my teeth feel polished clean. It's the only toothbrush I've used that doesn't leave my gums sore.", author:"Riya K.", city:"Chennai" },
  { text:"We got the family pack for all four of us. The schedule is genius — every 4 months we simply swap and we've never missed a replacement since.", author:"Vikram T.", city:"Pune" },
  { text:"Worth every rupee. My kids actually look forward to brushing now. The red design is fun and the bristles are gentle enough for them.", author:"Sunita R.", city:"Delhi" },
  { text:"Switched from an electric brush and honestly the clean feels just as thorough. The ergonomic handle makes all the difference.", author:"Karthik N.", city:"Hyderabad" },
];
const PHASES = [
  { name:'Brush Overview',  step:'Introducing' },
  { name:'The Bristle Head', step:'Part 01' },
  { name:'The Grip Body',    step:'Part 02' },
  { name:'The Handle Base',  step:'Part 03' },
];
const MOBILE_PANELS = {
  1: { tag:'01 — Bristle Head',   title:'Ultra-Soft Nano Bristles',  desc:'10,000 micro-filaments per cm² reach between teeth and below the gumline, removing 99.3% of plaque.' },
  2: { tag:'02 — Ergonomic Handle', title:'Precision Grip Zone',       desc:'Dual-material soft-touch grip contoured to the hand. Red TPE inlay provides non-slip control at every angle.' },
  3: { tag:'03 — Handle End',      title:'Anti-Slip Base',             desc:'The flared end provides stability on wet surfaces and an ergonomic rest point for the palm.' },
};

const INDIA_STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Puducherry','Chandigarh','Jammu and Kashmir','Ladakh'];

/* ─── HELPERS ─────────────────────────────────────────────────── */
function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, mn, mx) { return Math.max(mn, Math.min(mx, v)); }
function easeInOut(t) { return t < .5 ? 2*t*t : -1+(4-2*t)*t; }


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

function BrushColorShowcase() {
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
          height: 600,
          paddingTop: 70,
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

        {/* Color label */}
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(255,255,255,0.88)',
            backdropFilter: 'blur(12px)',
            border: `1px solid ${BRUSH_COLORS[active].dot}30`,
            borderRadius: 30,
            padding: '0.5rem 1.4rem',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: BRUSH_COLORS[active].dot,
            transition: 'all 0.4s ease',
            boxShadow: `0 8px 24px ${BRUSH_COLORS[active].dot}20`,
            whiteSpace: 'nowrap',
            zIndex: 5,
          }}
        >
          {BRUSH_COLORS[active].label}
        </div>

        {/* Brush images */}
        {BRUSH_COLORS.map((c, i) => (
          <img
            key={i}
            src="image/brush.png"
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

/* ─── TRACKING COMPONENT ──────────────────────────────────────── */
function TrackingSection() {
  const [orderId, setOrderId]         = useState('');
  const [trackData, setTrackData]     = useState(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');

  // Auto-load from URL param  e.g. /track?order=42
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('order');
    if (id) { setOrderId(id); fetchTracking(id); }
  }, []);

  const fetchTracking = async (id) => {
    setLoading(true); setError(''); setTrackData(null);
    try {
      const res = await fetch(`/api/track/${id}`);
      if (!res.ok) throw new Error('Order not found');
      const data = await res.json();
      setTrackData(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Map Shiprocket status to progress steps
  const getStepStatus = (stepName, currentStatus) => {
    const order = ['PENDING','PICKUP SCHEDULED','IN TRANSIT','OUT FOR DELIVERY','DELIVERED'];
    const statusMap = {
      'PICKUP SCHEDULED': 1, 'PICKUP GENERATED': 1,
      'IN TRANSIT': 2, 'SHIPPED': 2,
      'OUT FOR DELIVERY': 3,
      'DELIVERED': 4,
    };
    const current = statusMap[currentStatus?.toUpperCase()] ?? 0;
    const steps   = { 'Ordered':0, 'Picked up':1, 'In transit':2, 'Out for delivery':3, 'Delivered':4 };
    const idx     = steps[stepName] ?? 0;
    if (idx < current)  return 'done';
    if (idx === current) return 'active';
    return '';
  };

  const currentStatus = trackData?.shipment_status || '';
//   const handlePayment = async () => {
//   try {
//     const res = await fetch('/api/create-order', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         amount: totalAmount * 100
//       })
//     });

//     const order = await res.json();

//     console.log("ORDER RESPONSE:", order);

//     if (!order.orderId) {
//       alert("Order ID missing!");
//       return;
//     }

//     const options = {
//       key: "rzp_test_SlG1HvlDp3i5Fw",
//       amount: order.amount,
//       currency: "INR",
//       order_id: order.orderId,
//       name: "Dentall",
//       description: "Test Transaction",

//       handler: function (response) {
//         console.log("PAYMENT SUCCESS:", response);
//         alert("Payment Successful!");
//       },

//       theme: {
//         color: "#FF5C00"
//       }
//     };

//     const rzp = new window.Razorpay(options);
//     rzp.open();

//   } catch (err) {
//     console.error(err);
//     alert("Payment failed to initialize");
//   }
// };

  return (
    <section className="dn-tracking-section" id="tracking">
      <div className="dn-section-label">Track your order</div>
      <div className="dn-section-title" style={{margin:'0 auto 2rem',textAlign:'center'}}>Where's my package?</div>

      <div className="dn-tracking-card">
        <div className="dn-tracking-lookup">
          <input
            value={orderId}
            onChange={e => setOrderId(e.target.value)}
            placeholder="Enter your order ID (e.g. 42)"
            onKeyDown={e => e.key === 'Enter' && fetchTracking(orderId)}
          />
          <button onClick={() => fetchTracking(orderId)} disabled={loading || !orderId}>
            {loading ? 'Loading…' : 'Track →'}
          </button>
        </div>

        {error && (
          <div style={{color:'#FF3D57',fontSize:'.82rem',marginBottom:'1rem',padding:'.8rem',background:'rgba(255,61,87,.06)',borderRadius:'8px',border:'1px solid rgba(255,61,87,.2)'}}>
            ⚠ {error}
          </div>
        )}

        {trackData && (
          <>
            <div className="dn-tracking-header">
              <div>
                <div className="dn-tracking-order-id">Order #{trackData.order_id || orderId}</div>
                <div className="dn-tracking-awb">AWB: {trackData.awb_code || '—'}</div>
              </div>
              <div className="dn-tracking-status-badge">{currentStatus || 'Processing'}</div>
            </div>

            {/* Progress bar */}
            <div className="dn-tracking-progress">
              {['Ordered','Picked up','In transit','Out for delivery','Delivered'].map((step, i, arr) => (
                <React.Fragment key={step}>
                  <div className={`dn-track-step ${getStepStatus(step, currentStatus)}`}>
                    <div className="dn-track-step-dot">{getStepStatus(step, currentStatus) === 'done' ? '✓' : i + 1}</div>
                    <div className="dn-track-step-label">{step}</div>
                  </div>
                  {i < arr.length - 1 && (
                    <div className={`dn-track-line ${getStepStatus(arr[i+1], currentStatus) !== '' ? 'done' : ''}`} />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Estimated delivery */}
            {trackData.etd && (
              <div style={{background:'rgba(255,92,0,0.06)',border:'1px solid rgba(255,92,0,.15)',borderRadius:'8px',padding:'.8rem 1rem',marginBottom:'1.5rem',fontSize:'.82rem',color:'var(--text-mid)'}}>
                📦 Estimated delivery: <strong style={{color:'#FF5C00'}}>{trackData.etd}</strong>
              </div>
            )}

            {/* Event log */}
            {trackData.tracking_data?.length > 0 && (
              <div className="dn-tracking-events">
                <div style={{fontSize:'.65rem',letterSpacing:'.2em',textTransform:'uppercase',color:'var(--text-light)',fontWeight:700,marginBottom:'.8rem'}}>Activity</div>
                {trackData.tracking_data.map((ev, i) => (
                  <div key={i} className="dn-tracking-event">
                    <div className={`dn-event-dot ${i > 0 ? 'old' : ''}`} />
                    <div>
                      <div className="dn-event-text">{ev.activity || ev.status}</div>
                      <div className="dn-event-time">{ev.date} — {ev.location}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {!trackData && !loading && !error && (
          <div style={{textAlign:'center',padding:'2rem',color:'var(--text-light)',fontSize:'.85rem'}}>
            Enter your order ID above to see live tracking updates
          </div>
        )}
      </div>
    </section>
  );
}

/* ─── APP ──────────────────────────────────────────────────────── */
export default function DentallApp() {
  const [cursorPos, setCursorPos]     = useState({ x:-100, y:-100 });
  const [cursorBig, setCursorBig]     = useState(false);
  const [drawerOpen, setDrawerOpen]   = useState(false);

  const scrollStageRef = useRef(null);
  const [brushTransform, setBrushTransform] = useState({ scale:1, ty:0, rot:-6 });
  const [phaseIdx, setPhaseIdx]       = useState(-1);
  const [dotIdx, setDotIdx]           = useState(0);
  const [activeRings, setActiveRings] = useState([false,false,false]);
  const [visiblePanels, setVisiblePanels]   = useState([]);
  const [mobilePanelPhase, setMobilePanelPhase] = useState(0);

  const featRefs = useRef([]);
  const [featVisible, setFeatVisible] = useState(Array(6).fill(false));

  const [selectedPack, setSelectedPack] = useState('family');
  const [qty, setQty]     = useState(1);
  const [form, setForm]   = useState({ fname:'', lname:'', email:'', phone:'', address:'', city:'', state:'', pincode:'' });
  const [errors, setErrors] = useState({});
  const [toast, setToast]   = useState({ show:false, msg:'' });
  const [showVideo, setShowVideo] = useState(false);

  /* ── Cart ── */
  const [cartOpen, setCartOpen]   = useState(false);
  const [cartItems, setCartItems] = useState([]);

  /* ── Shipping (live from Shiprocket) ── */
  const [shippingCharge, setShippingCharge]     = useState(null);
  const [shippingCourier, setShippingCourier]   = useState('');
  const [shippingEta, setShippingEta]           = useState('');
  const [shippingLoading, setShippingLoading]   = useState(false);
  const [shippingPincode, setShippingPincode]   = useState('');

  /* ── Payment modal ── */
  const [showPayment, setShowPayment]     = useState(false);
  const [payProcessing, setPayProcessing] = useState(false);
  const [paySuccess, setPaySuccess]       = useState(false);
  const [successOrder, setSuccessOrder]   = useState({ orderId:'', awb:'' });

  /* ── Modal pincode (in payment modal) ── */
  const [modalPincode, setModalPincode]         = useState('');
  const [modalShipping, setModalShipping]       = useState(null);
  const [modalShipLoading, setModalShipLoading] = useState(false);

  const packPrice = selectedPack === 'family' ? FAMILY_PACK_PRICE : SINGLE_PRICE;
  const cartSubtotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const cartShipping = modalShipping?.charge ?? 0;
  const cartTotal    = cartSubtotal + cartShipping;
  const orderTotal   = packPrice * qty;

  const [leadPopup, setLeadPopup] = useState(false);
  const [leadForm, setLeadForm]   = useState({ name:'', email:'', phone:'' });
  const [leadSent, setLeadSent]   = useState(false);

  /* ── inject CSS ── */
  useEffect(() => {
    const tag = document.createElement('style');
    tag.textContent = css;
    document.head.appendChild(tag);
    return () => document.head.removeChild(tag);
  }, []);

  // { lead popup first 15s  and  it comes afetr  every 30 sec}
  useEffect(() => {
  let interval;

  const firstTimer = setTimeout(() => {
    setLeadPopup(true);

    interval = setInterval(() => {
      setLeadPopup(true);
    }, 60000);

  }, 15000);

  return () => {
    clearTimeout(firstTimer);
    clearInterval(interval);
  };
}, []);

  /* ── Load Razorpay script once ── */
  useEffect(() => {
    if (document.getElementById('rzp-script')) return;
    const s = document.createElement('script');
    s.id = 'rzp-script';
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    document.head.appendChild(s);
  }, []);

  /* ── Custom cursor ── */
  useEffect(() => {
    const move = e => setCursorPos({ x:e.clientX, y:e.clientY });
    const over = e => { if (['BUTTON','A','INPUT','SELECT'].includes(e.target.tagName)) setCursorBig(true); };
    const out  = () => setCursorBig(false);
    window.addEventListener('mousemove', move);
    document.addEventListener('mouseover', over);
    document.addEventListener('mouseout', out);
    return () => {
      window.removeEventListener('mousemove', move);
      document.removeEventListener('mouseover', over);
      document.removeEventListener('mouseout', out);
    };
  }, []);

  /* ── Scroll stage ── */
  useEffect(() => {
    const onScroll = () => {
      const stage = scrollStageRef.current;
      if (!stage) return;
      const rect   = stage.getBoundingClientRect();
      const stageH = stage.offsetHeight - window.innerHeight;
      const scrolled  = -rect.top;
      const progress  = clamp(scrolled / stageH, 0, 1);
      const isMobile  = window.innerWidth <= 768;
      let scale = 1, ty = 0, rot = -6;
      let rings = [false,false,false], panels = [], phase = -1, dot = 0, mobilePhase = 0;
      if (progress < 0.08) {
        const maxScale = isMobile ? 1.2 : 1.05;
        scale = lerp(isMobile ? 0.9 : .85, maxScale, easeInOut(progress/0.08));
        rot = lerp(-10,-6,progress/0.08); dot=0;
      } else if (progress < 0.18) {
        const t=(progress-0.08)/0.1;
        const maxS = isMobile ? 1.6 : 2.0; const maxTY = isMobile ? 60 : 150;
        scale=lerp(isMobile ? 1.2 : 1.05, maxS, easeInOut(t)); ty=lerp(0, maxTY, easeInOut(t)); rot=lerp(-6,0,t); dot=1;
      } else if (progress < 0.35) {
        scale= isMobile ? 1.6 : 2.0; ty= isMobile ? 60 : 150; rot=0;
        rings=[true,false,false]; phase=1; dot=1; mobilePhase=1;
        if ((progress-0.18)/0.17 > 0.2) panels=['fp-head','fp-head2'];
      } else if (progress < 0.45) {
        const t=(progress-0.35)/0.1;
        scale=lerp(isMobile ? 1.6 : 2.0, 1.0, easeInOut(t)); ty=lerp(isMobile ? 60 : 150, 0, easeInOut(t)); rot=lerp(0,-4,t); dot=1;
      } else if (progress < 0.52) {
        const t=(progress-0.45)/0.07;
        const maxS2 = isMobile ? 1.5 : 1.7;
        scale=lerp(1.0, maxS2, easeInOut(t)); rot=lerp(-4,2,t); dot=2;
      } else if (progress < 0.70) {
        scale= isMobile ? 1.5 : 1.7; rot=2;
        rings=[false,true,false]; phase=2; dot=2; mobilePhase=2;
        if ((progress-0.52)/0.18 > 0.2) panels=['fp-body','fp-body2'];
      } else if (progress < 0.79) {
        const t=(progress-0.70)/0.09;
        scale=lerp(isMobile ? 1.5 : 1.7, 1.0, easeInOut(t)); rot=lerp(2,-6,t); dot=2;
      } else if (progress < 0.87) {
        const t=(progress-0.79)/0.08;
        const maxS3 = isMobile ? 1.7 : 2.2; const minTY = isMobile ? -80 : -160;
        scale=lerp(1.0, maxS3, easeInOut(t)); ty=lerp(0, minTY, easeInOut(t)); rot=lerp(-6,0,t); dot=3;
      } else {
        scale= isMobile ? 1.7 : 2.2; ty= isMobile ? -80 : -160; rot=0;
        rings=[false,false,true]; phase=3; dot=3; mobilePhase=3;
        if ((progress-0.87)/0.13 > 0.2) panels=['fp-handle','fp-handle2'];
      }
      setBrushTransform({ scale, ty, rot });
      setActiveRings(rings); setPhaseIdx(phase); setDotIdx(dot);
      setVisiblePanels(panels); setMobilePanelPhase(mobilePhase);
    };
    window.addEventListener('scroll', onScroll, { passive:true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Intersection observer for feat cards ── */
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        const idx = parseInt(e.target.dataset.idx, 10);
        if (e.isIntersecting) setFeatVisible(prev => { const n=[...prev]; n[idx]=true; return n; });
      });
    }, { threshold:.15 });
    featRefs.current.forEach(el => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  /* ── Cart helpers ── */
  const addToCart = (item) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...item, qty: 1 }];
    });
    setCartOpen(true);
    showToast(`${item.name} added to cart!`);
  };
  const updateCartQty = (id, delta) =>
    setCartItems(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
  const removeFromCart = (id) => setCartItems(prev => prev.filter(i => i.id !== id));
  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);

  const showToast = (msg) => {
    setToast({ show:true, msg });
    setTimeout(() => setToast({ show:false, msg:'' }), 3500);
  };

  /* ── Fetch live shipping cost from Shiprocket via backend ── */
  const fetchShippingCost = async (pincode) => {
    if (!pincode || pincode.length !== 6) return;
    setShippingLoading(true);
    try {
      const res  = await fetch('/api/shipping-cost', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ pincode, weight: 0.5 }),
      });
      const data = await res.json();
      setShippingCharge(data.shipping_charge ?? 0);
      setShippingCourier(data.courier_name    ?? 'Standard');
      setShippingEta(data.estimated_delivery  ?? '');
    } catch {
      setShippingCharge(0);
    } finally {
      setShippingLoading(false);
    }
  };

  /* Fetch shipping inside payment modal */
  const fetchModalShipping = async () => {
    if (!modalPincode || modalPincode.length !== 6) return;
    setModalShipLoading(true);
    try {
      const res  = await fetch('/api/shipping-cost', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ pincode: modalPincode, weight: 0.5 }),
      });
      const data = await res.json();
      setModalShipping({
        charge:   data.shipping_charge ?? 0,
        courier:  data.courier_name    ?? 'Standard',
        eta:      data.estimated_delivery ?? '',
      });
    } catch {
      setModalShipping({ charge:0, courier:'Standard', eta:'' });
    } finally {
      setModalShipLoading(false);
    }
  };

  /* ── Razorpay payment flow ──     secrued payment handled on 7/5/26*/
  const handleRazorpayCheckout = async () => {
  if (cartItems.length === 0) return;
  setPayProcessing(true);
 
  try {
    // Step 1 — create order on backend.
    // Server computes amount from its own catalogue — client amount is ignored.
    const orderRes = await fetch('/api/create-order', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cartItems,                                  // server re-validates these
        shippingCharge: modalShipping?.charge ?? 0, // server caps this safely
      }),
    });
 
    if (!orderRes.ok) {
      const err = await orderRes.json().catch(() => ({}));
      showToast(err.error || 'Could not create order. Please try again.');
      setPayProcessing(false);
      return;
    }
 
    // Server returns keyId — never hardcoded in frontend
    const { orderId: rzpOrderId, amount, keyId, computedTotal } = await orderRes.json();
 
    if (!rzpOrderId || !keyId) {
      showToast('Order creation failed. Please try again.');
      setPayProcessing(false);
      return;
    }
 
    // Step 2 — open Razorpay checkout
    const options = {
      key:         keyId,          // ← from server, not hardcoded
      amount,                      // ← server-computed paise amount
      currency:    'INR',
      name:        'DENTALL',
      description: 'Professional toothbrushes',
      image:       '/image/brush.png',
      order_id:    rzpOrderId,
      prefill: {
        name:    (form.fname + ' ' + form.lname).trim(),
        email:   form.email,
        contact: form.phone,
      },
      notes: {
        address: form.address,
        pincode: modalPincode || form.pincode,
      },
      theme: { color: '#FF5C00' },
 
      handler: async (response) => {
        // Step 3 — verify on backend
        try {
          const verifyRes = await fetch('/api/verify-payment', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              customerDetails: {
                name:    (form.fname + ' ' + form.lname).trim(),
                email:   form.email,
                phone:   form.phone,
                address: form.address,
                city:    form.city,
                state:   form.state,
                pincode: modalPincode || form.pincode,
              },
              cartItems,
              shippingCharge: modalShipping?.charge ?? 0,
              // NOTE: totalAmount is NOT sent — server computes it from
              // cartItems + shippingCharge using its own catalogue prices.
            }),
          });
 
          const result = await verifyRes.json();
 
          if (!verifyRes.ok) {
            showToast(result.error || 'Verification failed. Contact support with your payment ID.');
            setPayProcessing(false);
            return;
          }
 
          if (result.success) {
            setSuccessOrder({ orderId: result.orderId, awb: result.awb });
            setPaySuccess(true);
            setCartItems([]);
            setModalShipping(null);
          } else {
            showToast('Payment verification failed. Please contact support.');
          }
        } catch (verifyErr) {
          console.error('Verify error:', verifyErr);
          showToast('Verification error. Please contact support with your payment ID.');
        } finally {
          setPayProcessing(false);
        }
      },
 
      modal: {
        ondismiss: () => {
          setPayProcessing(false);
          showToast('Payment cancelled.');
        },
      },
    };
 
    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (resp) => {
      showToast('Payment failed: ' + (resp.error?.description || 'Unknown error'));
      setPayProcessing(false);
    });
    rzp.open();
 
  } catch (e) {
    console.error('Checkout error:', e);
    showToast('Something went wrong. Please try again.');
    setPayProcessing(false);
  }
}

  const closePayment = () => {
    setShowPayment(false);
    setPaySuccess(false);
    setPayProcessing(false);
    setModalShipping(null);
    setModalPincode('');
  };

  /* ── Order form (direct, not cart) ── */
  const changeQty   = d => setQty(q => Math.max(1, Math.min(10, q + d)));
  const handleField = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const placeOrder = () => {
    const errs = {};
    ['fname','email','phone','address','city','state','pincode'].forEach(k => {
      if (!form[k].trim()) errs[k] = true;
    });
    setErrors(errs);
    if (Object.keys(errs).length) return;
    // Add to cart and open payment
    const item = selectedPack === 'family'
      ? { id:'family-pack', name:'Family Pack (12 brushes)', price: FAMILY_PACK_PRICE, icon:'🦷' }
      : { id:'single-brush', name:'Single Brush',            price: SINGLE_PRICE,      icon:'🪥' };
    // Add qty copies
    setCartItems([{ ...item, qty }]);
    setShowPayment(true);
  };

  const scrollTo = id => {
    document.getElementById(id)?.scrollIntoView({ behavior:'smooth' });
    setDrawerOpen(false);
  };

  const mobilePanel = mobilePanelPhase > 0 ? MOBILE_PANELS[mobilePanelPhase] : null;
  // ADD THIS INSTEAD
const inputStyle = {
  width: '100%',
  padding: '.75rem 1rem',
  border: '2px solid #E8D5B0',
  borderRadius: '8px',
  fontFamily: 'DM Sans,sans-serif',
  fontSize: '.9rem',
  marginBottom: '.8rem',
  boxSizing: 'border-box',
  outline: 'none',
  background: '#FFFFFF',           // ← pure white, not cream
  color: '#1C0D02',
  display: 'block',
  WebkitAppearance: 'none',
};
  /* ─── RENDER ─────────────────────────────────────────────────── */
  return (
    <>
      <div className="dentall-cursor-dot"  style={{ left:cursorPos.x, top:cursorPos.y, width:cursorBig?18:10, height:cursorBig?18:10 }} />
      <div className="dentall-cursor-ring" style={{ left:cursorPos.x, top:cursorPos.y }} />

      <div className={`dn-toast ${toast.show?'show':''}`}>{toast.msg}</div>

      {/* ── Cart Overlay & Drawer ── */}
      <div className={`dn-cart-overlay ${cartOpen?'open':''}`} onClick={()=>setCartOpen(false)} />
      <div className={`dn-cart-drawer ${cartOpen?'open':''}`}>
        <div className="dn-cart-head">
          <div className="dn-cart-title">
            Your Cart {cartCount > 0 && <span style={{color:'var(--text-light)',fontSize:'.82rem',fontWeight:400}}>({cartCount})</span>}
          </div>
          <button className="dn-cart-close" onClick={()=>setCartOpen(false)}>✕</button>
        </div>
        <div className="dn-cart-body">
          {cartItems.length === 0 ? (
            <div className="dn-cart-empty">
              <div className="dn-cart-empty-icon">🛒</div>
              <div className="dn-cart-empty-text">Your cart is empty</div>
            </div>
          ) : (
            cartItems.map(item => (
              <div key={item.id} className="dn-cart-item">
                <div className="dn-cart-item-icon">{item.icon}</div>
                <div>
                  <div className="dn-cart-item-name">{item.name}</div>
                  <div className="dn-cart-item-price">₹{(item.price * item.qty).toLocaleString('en-IN')}</div>
                </div>
                <div className="dn-cart-item-actions">
                  <button className="dn-cart-qty-btn" onClick={()=>updateCartQty(item.id,-1)}>−</button>
                  <div className="dn-cart-qty-val">{item.qty}</div>
                  <button className="dn-cart-qty-btn" onClick={()=>updateCartQty(item.id,1)}>+</button>
                  <button className="dn-cart-remove" onClick={()=>removeFromCart(item.id)}>✕</button>
                </div>
              </div>
            ))
          )}
        </div>
        {cartItems.length > 0 && (
          <div className="dn-cart-foot">
            <div className="dn-cart-subtotal">
              <span className="dn-cart-subtotal-label">Subtotal</span>
              <span className="dn-cart-subtotal-val">₹{cartSubtotal.toLocaleString('en-IN')}</span>
            </div>
            {/* Live shipping in cart — asks for pincode */}
            <div style={{marginBottom:'.8rem'}}>
              <div style={{fontSize:'.68rem',color:'var(--text-light)',textTransform:'uppercase',letterSpacing:'.1em',fontWeight:700,marginBottom:'.4rem'}}>Delivery pincode</div>
              <div style={{display:'flex',gap:'.5rem'}}>
                <input
                  value={shippingPincode}
                  onChange={e => setShippingPincode(e.target.value.replace(/\D/g,'').slice(0,6))}
                  placeholder="6-digit pincode"
                  style={{flex:1,background:'var(--off-white)',border:'1.5px solid var(--mid-gray)',color:'var(--text-dark)',padding:'.5rem .8rem',fontFamily:'DM Sans,sans-serif',fontSize:'.82rem',outline:'none',borderRadius:'8px'}}
                />
                <button
                  onClick={()=>fetchShippingCost(shippingPincode)}
                  disabled={shippingLoading || shippingPincode.length !== 6}
                  style={{background:'linear-gradient(135deg,#FF5C00,#00D4B4)',color:'#fff',border:'none',padding:'.5rem .9rem',fontFamily:'DM Sans,sans-serif',fontSize:'.72rem',fontWeight:700,borderRadius:'8px',cursor:'pointer',opacity:(shippingLoading||shippingPincode.length!==6)?0.5:1}}>
                  {shippingLoading ? '…' : 'Check'}
                </button>
              </div>
              {shippingCharge !== null && !shippingLoading && (
                <div style={{marginTop:'.5rem',display:'flex',justifyContent:'space-between',fontSize:'.78rem'}}>
                  <span style={{color:'var(--text-mid)'}}>{shippingCourier} {shippingEta && `· ${shippingEta} days`}</span>
                  <span style={{fontWeight:700,color: shippingCharge === 0 ? '#00D4B4' : 'var(--text-dark)'}}>
                    {shippingCharge === 0 ? 'FREE' : `₹${shippingCharge}`}
                  </span>
                </div>
              )}
            </div>
            {shippingCharge !== null && (
              <div className="dn-cart-total-row">
                <span className="dn-cart-total-label">Total</span>
                <span className="dn-cart-total-val">₹{(cartSubtotal + shippingCharge).toLocaleString('en-IN')}</span>
              </div>
            )}
            <button className="dn-cart-checkout-btn" onClick={()=>{setCartOpen(false);setShowPayment(true);}}>
              Checkout →
            </button>
          </div>
        )}
      </div>

      {/* ── Nav ── */}
      <nav className="dn-nav">
        <div className="dn-logo">DENTALL</div>
        <div className="dn-nav-links">
          <a href="#features-grid" onClick={e=>{e.preventDefault();scrollTo('features-grid')}}>Features</a>
          <a href="#social"        onClick={e=>{e.preventDefault();scrollTo('social')}}>Reviews</a>
          <a href="#tracking"      onClick={e=>{e.preventDefault();scrollTo('tracking')}}>Track</a>
          <a href="#order"         onClick={e=>{e.preventDefault();scrollTo('order')}}>Order</a>
          <button className="dn-cart-btn" onClick={()=>setCartOpen(o=>!o)}>
            🛒 Cart {cartCount > 0 && <span className="dn-cart-badge">{cartCount}</span>}
          </button>
          <button className="dn-nav-cta" onClick={()=>scrollTo('order')}>Order Now</button>
        </div>
        <button className={`dn-hamburger ${drawerOpen?'open':''}`} onClick={()=>setDrawerOpen(o=>!o)} aria-label="Menu">
          <span/><span/><span/>
        </button>
      </nav>

      <div className={`dn-drawer ${drawerOpen?'open':''}`}>
        <a href="#features-grid" onClick={e=>{e.preventDefault();scrollTo('features-grid')}}>Features</a>
        <a href="#social"        onClick={e=>{e.preventDefault();scrollTo('social')}}>Reviews</a>
        <a href="#tracking"      onClick={e=>{e.preventDefault();scrollTo('tracking')}}>Track Order</a>
        <a href="#order"         onClick={e=>{e.preventDefault();scrollTo('order')}}>Order</a>
        <button className="dn-cart-btn" style={{fontSize:'1rem',padding:'.8rem 2rem'}} onClick={()=>{setDrawerOpen(false);setCartOpen(true);}}>
          🛒 Cart {cartCount > 0 && <span className="dn-cart-badge">{cartCount}</span>}
        </button>
        <button className="dn-nav-cta" onClick={()=>scrollTo('order')}>Family Pack — ₹5,990</button>
      </div>

      {/* ── Hero ── */}
<section className="dn-hero" id="hero">
  <div className="dn-hero-bg" />
  <div className="dn-hero-content">
    <div className="dn-hero-tag">Professional Dental Care</div>
    <h1 className="dn-h1">Brush with<br/><em>Confidence</em><br/>Every Day.</h1>
    <p className="dn-hero-sub">DENTALL's precision-engineered bristle system and ergonomic grip deliver a dentist-quality clean — every single morning. Starting at just ₹599 per brush.</p>
    <div className="dn-hero-ctas">
      <button className="dn-btn-primary" onClick={()=>scrollTo('order')}>Shop Now — from ₹599</button>
      <button className="dn-btn-ghost"   onClick={()=>scrollTo('scroll-stage')}>Explore Features</button>
    </div>
  </div>
  <div className="dn-hero-image-wrap">
    <BrushColorShowcase />
    <div className="dn-hero-badge">
      <div style={{fontSize:'1.3rem'}}>🦷</div>
      <div>
        <div className="dn-badge-label">Dentist Rating</div>
        <div className="dn-badge-val">★★★★★ 4.9 / 5.0</div>
      </div>
    </div>
  </div>
  <div className="dn-scroll-hint">Scroll to explore</div>
</section>

      {/* ── Family Pack Banner ── */}
      <section className="dn-pack-banner" id="family-pack">
        <div className="dn-pack-inner">
          <div>
            <div className="dn-pack-label">The smart way to stock up</div>
            <h2 className="dn-pack-title">One pack.<br/><em>A full year</em> of fresh smiles for the whole family.</h2>
            <p className="dn-pack-desc">
              Dentists recommend replacing your toothbrush every <strong style={{color:'#fff'}}>4 months</strong> — that's 3 brushes per person per year.
              Our Family Pack of <strong style={{color:'#fff'}}>12 brushes</strong> covers a family of 4 for a full year — no reordering, no forgetting.
            </p>
            <div className="dn-pack-perks" style={{marginTop:'1.5rem'}}>
              {['12 brushes in one box','Covers 4 people × 12 months','Change every 4 months','Free shipping included','Never run out mid-year'].map(p=>(
                <div key={p} className="dn-pack-perk"><div className="dn-pack-perk-dot"/> {p}</div>
              ))}
            </div>
            <div style={{marginTop:'1.5rem'}}>
              <div className="dn-pack-timeline-label" style={{color:'rgba(255,255,255,.5)',marginBottom:'.5rem'}}>Replace schedule — all year covered</div>
              <div className="dn-pack-timeline">
                {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m,i)=>(
                  <div key={m} className={`dn-pack-month ${[0,3,6,9].includes(i)?'change':''}`}>
                    {![0,3,6,9].includes(i) && m}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div>
            <div className="dn-pack-math">
              <div className="dn-pack-math-row"><span>Per brush</span><strong>₹50</strong></div>
              <div className="dn-pack-math-row"><span>Family pack (12 brushes)</span><strong>₹599</strong></div>
              <div className="dn-pack-math-row"><span>Per person per year</span><strong>₹150</strong></div>
              <div className="dn-pack-math-divider"/>
              <div className="dn-pack-math-total">
                <div className="dn-pack-math-total-label">Family pack total</div>
                <div className="dn-pack-math-price">₹599 <span>/ year</span></div>
              </div>
              <button className="dn-submit-btn" style={{margin:'1rem 0 0',fontSize:'.82rem'}} onClick={()=>scrollTo('order')}>Order Family Pack →</button>
              <button className="dn-add-cart-btn" style={{background:'rgba(255,255,255,.1)',borderColor:'rgba(255,255,255,.4)',color:'#fff',marginTop:'.6rem'}}
                onClick={()=>addToCart({id:'family-pack',name:'Family Pack (12 brushes)',price:5990,icon:'🦷'})}>
                🛒 Add to Cart
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Video ── */}
      <section className="dn-video-section" id="video">
        <div className="dn-video-label">See it in action</div>
        <h2 className="dn-video-title">Two minutes.<br/><em>A lifetime</em> of better oral health.</h2>
        <div className="dn-video-placeholder" onClick={()=>setShowVideo(true)}>
          <div className="dn-video-grid"/><div className="dn-video-glow"/><div className="dn-video-scanline"/>
          <div className="dn-video-corner dn-video-corner-tl"/><div className="dn-video-corner dn-video-corner-tr"/>
          <div className="dn-video-corner dn-video-corner-bl"/><div className="dn-video-corner dn-video-corner-br"/>
          <div className="dn-video-live">Product Film</div>
          <div className="dn-video-duration">1:52</div>
          <button className="dn-video-play-btn" aria-label="Play video"><div className="dn-play-icon"/></button>
          <div className="dn-video-caption">DENTALL Pro — Product Story</div>
        </div>
      </section>

      {/* ── Scroll Stage ── */}
      <section id="scroll-stage" ref={scrollStageRef} className="dn-scroll-stage">
        <div className="dn-sticky-canvas">
          <div className="dn-brush-scene">
            <div className={`dn-mobile-feature-card ${mobilePanel?'visible':''}`}>
              {mobilePanel && <>
                <div className="dn-mobile-fp-tag">{mobilePanel.tag}</div>
                <div className="dn-mobile-fp-title">{mobilePanel.title}</div>
                <div className="dn-mobile-fp-desc">{mobilePanel.desc}</div>
              </>}
            </div>
            <div id="dn-brush-wrapper" style={{transform:`scale(${brushTransform.scale}) translateY(${brushTransform.ty}px) rotate(${brushTransform.rot}deg)`}}>
              <img id="dn-brush-img" src="image/brush.png" alt="DENTALL brush detail" onError={e=>{e.target.style.opacity=0;}}/>
              <div className={`dn-img-highlight ${activeRings[0]?'active':''}`} style={{width:70,height:70,top:'2%',left:'50%',transform:'translate(-50%,0)'}}/>
              <div className={`dn-img-highlight ${activeRings[1]?'active':''}`} style={{width:80,height:80,top:'45%',left:'50%',transform:'translate(-50%,-50%)'}}/>
              <div className={`dn-img-highlight ${activeRings[2]?'active':''}`} style={{width:70,height:70,bottom:'8%',left:'50%',transform:'translate(-50%,0)'}}/>
            </div>
            <div id="dn-phase-label" className={phaseIdx >= 0 ? 'visible' : ''}>
              <div className="dn-pl-step">{phaseIdx>=0?PHASES[phaseIdx].step:''}</div>
              <div className="dn-pl-name">{phaseIdx>=0?PHASES[phaseIdx].name:''}</div>
            </div>
            <div className={`dn-feature-panel right ${visiblePanels.includes('fp-head')?'visible':''}`} style={{top:'18%'}}>
              <div className="dn-fp-line"/><div className="dn-fp-tag">01 — Bristle Head</div>
              <div className="dn-fp-title">Ultra-Soft Nano Bristles</div>
              <div className="dn-fp-desc">10,000 micro-filaments per cm² reach between teeth and below the gumline, removing 99.3% of plaque.</div>
            </div>
            <div className={`dn-feature-panel left ${visiblePanels.includes('fp-head2')?'visible':''}`} style={{top:'40%'}}>
              <div className="dn-fp-line"/><div className="dn-fp-tag">01b — Tongue Cleaner</div>
              <div className="dn-fp-title">Integrated Tongue Cleaner</div>
              <div className="dn-fp-desc">Reverse-side ribbed texture eliminates odour-causing bacteria — no separate tool needed.</div>
            </div>
            <div className={`dn-feature-panel left ${visiblePanels.includes('fp-body')?'visible':''}`} style={{top:'28%'}}>
              <div className="dn-fp-line"/><div className="dn-fp-tag">02 — Ergonomic Handle</div>
              <div className="dn-fp-title">Precision Grip Zone</div>
              <div className="dn-fp-desc">Dual-material soft-touch grip contoured to the hand. Red TPE inlay provides non-slip control.</div>
            </div>
            <div className={`dn-feature-panel right ${visiblePanels.includes('fp-body2')?'visible':''}`} style={{top:'52%'}}>
              <div className="dn-fp-line"/><div className="dn-fp-tag">02b — Durability</div>
              <div className="dn-fp-title">Long-Life Construction</div>
              <div className="dn-fp-desc">Medical-grade polypropylene resists bacteria. Replace only the head every 3 months.</div>
            </div>
            <div className={`dn-feature-panel right ${visiblePanels.includes('fp-handle')?'visible':''}`} style={{top:'38%'}}>
              <div className="dn-fp-line"/><div className="dn-fp-tag">03 — Handle End</div>
              <div className="dn-fp-title">Anti-Slip Base</div>
              <div className="dn-fp-desc">The flared end provides stability on wet surfaces and an ergonomic rest point for the palm.</div>
            </div>
            <div className={`dn-feature-panel left ${visiblePanels.includes('fp-handle2')?'visible':''}`} style={{top:'58%'}}>
              <div className="dn-fp-line"/><div className="dn-fp-tag">03b — Branding</div>
              <div className="dn-fp-title">Dentall Certified</div>
              <div className="dn-fp-desc">BPA-free, ISO 9001 certified. Each brush is quality tested for consistent bristle density.</div>
            </div>
          </div>
        </div>
      </section>

      <div id="dn-progress-dots">
        {[0,1,2,3].map(i=><div key={i} className={`dn-dot ${dotIdx===i?'active':''}`}/>)}
      </div>

      {/* ── Features Grid ── */}
      <section className="dn-features-grid" id="features-grid">
        <div className="dn-section-label">What sets us apart</div>
        <div className="dn-section-title">Engineered for <em>every tooth</em>, every day.</div>
        <div className="dn-features-inner">
          {FEATURES.map((f,i)=>(
            <div key={i} ref={el=>{featRefs.current[i]=el}} data-idx={i}
              className={`dn-feat-card ${featVisible[i]?'visible':''}`}
              style={{transitionDelay:`${i*0.07}s`}}>
              <div className="dn-feat-num">{f.num}</div>
              <div className="dn-feat-icon">{f.icon}</div>
              <div className="dn-feat-title">{f.title}</div>
              <div className="dn-feat-text">{f.text}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="dn-social" id="social">
        <div className="dn-social-header">
          <div className="dn-section-label">Customer voices</div>
          <div className="dn-section-title">Trusted by <em>12,000+</em> households</div>
        </div>
        <div className="dn-reviews-track-wrapper">
          <div className="dn-reviews-scroll-track">
            {[...REVIEWS,...REVIEWS,...REVIEWS].map((r,i)=>(
              <div key={i} className="dn-review-card">
                <div className="dn-stars">★★★★★</div>
                <div className="dn-review-text">"{r.text}"</div>
                <div className="dn-review-author">{r.author} <span style={{color:'var(--text-light)',fontWeight:400}}>— {r.city}</span></div>
              </div>
            ))}
          </div>
        </div>
        <div className="dn-stats-row">
          {[['99.3%','Plaque removed'],['12K+','Happy customers'],['4.9','Average rating'],['200+','Dentist partners']].map(([n,l])=>(
            <div key={l} className="dn-stat">
              <div className="dn-stat-num">{n}</div>
              <div className="dn-stat-label">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Tracking ── */}
      <TrackingSection />

      {/* ── Order ── */}
      <section className="dn-order" id="order">
        <div>
          <div className="dn-section-label">Ready to upgrade?</div>
          <div className="dn-order-title">Clean that <em>lasts</em><br/>all day long.</div>
          <div className="dn-order-desc">Free shipping across India. 30-day return guarantee. The family pack includes 12 brushes — everything a family of 4 needs for a full year.</div>
          <div>
            {['12 brushes — 1 full year for 4 people','Change every 4 months — dentist-recommended','₹599 per brush, ₹5,990 for the family pack','Hygienic travel cap included','Free shipping & 30-day returns'].map(item=>(
              <div key={item} className="dn-include-item"><span className="dn-check">✓</span>{item}</div>
            ))}
          </div>
        </div>
        <div>
          <div className="dn-form-card">
            <div className="dn-form-title">Place Your Order</div>

            {/* Pack selector */}
            <div className="dn-field">
              <div className="dn-pack-select">
                <div className={`dn-pack-option ${selectedPack==='family'?'selected':''}`} onClick={()=>setSelectedPack('family')}>
                  <div className="dn-pack-option-name">Family Pack</div>
                  <div className="dn-pack-option-detail">12 brushes · 1 year · 4 people</div>
                  <div className="dn-pack-option-price">₹5,990</div>
                  <div className="dn-pack-option-badge">Best Value</div>
                  <button className="dn-add-cart-btn" onClick={e=>{e.stopPropagation();addToCart({id:'family-pack',name:'Family Pack (12 brushes)',price:5990,icon:'🦷'});}}>+ Add to Cart</button>
                </div>
                <div className={`dn-pack-option ${selectedPack==='single'?'selected':''}`} onClick={()=>setSelectedPack('single')}>
                  <div className="dn-pack-option-name">Single Brush</div>
                  <div className="dn-pack-option-detail">1 brush · 4 months</div>
                  <div className="dn-pack-option-price">₹599</div>
                  <button className="dn-add-cart-btn" onClick={e=>{e.stopPropagation();addToCart({id:'single-brush',name:'Single Brush',price:599,icon:'🪥'});}}>+ Add to Cart</button>
                </div>
              </div>
            </div>

            {/* Customer info */}
            <div className="dn-field-row">
              <div className="dn-field">
                <label>First Name</label>
                <input name="fname" value={form.fname} onChange={handleField} placeholder="Arjun" className={errors.fname?'error':''}/>
              </div>
              <div className="dn-field">
                <label>Last Name</label>
                <input name="lname" value={form.lname} onChange={handleField} placeholder="Sharma"/>
              </div>
            </div>
            <div className="dn-field">
              <label>Email Address</label>
              <input name="email" type="email" value={form.email} onChange={handleField} placeholder="arjun@email.com" className={errors.email?'error':''}/>
            </div>
            <div className="dn-field">
              <label>Phone Number</label>
              <input name="phone" type="tel" value={form.phone} onChange={handleField} placeholder="+91 98765 43210" className={errors.phone?'error':''}/>
            </div>
            <div className="dn-field">
              <label>Delivery Address</label>
              <input name="address" value={form.address} onChange={handleField} placeholder="Flat no, Street" className={errors.address?'error':''}/>
            </div>
            <div className="dn-field-row">
              <div className="dn-field">
                <label>City</label>
                <input name="city" value={form.city} onChange={handleField} placeholder="Chennai" className={errors.city?'error':''}/>
              </div>
              <div className="dn-field">
                <label>Pincode</label>
                <input name="pincode" value={form.pincode} onChange={e=>{
                  const v=e.target.value.replace(/\D/g,'').slice(0,6);
                  setForm(f=>({...f,pincode:v}));
                  if(v.length===6) fetchShippingCost(v);
                }} placeholder="600001" className={errors.pincode?'error':''}/>
              </div>
            </div>
            <div className="dn-field">
              <label>State</label>
              <select name="state" value={form.state} onChange={handleField} className={errors.state?'error':''} style={{width:'100%',background:'var(--off-white)',border:'1.5px solid var(--mid-gray)',color:'var(--text-dark)',padding:'.75rem 1rem',fontFamily:'DM Sans,sans-serif',fontSize:'.86rem',outline:'none',borderRadius:'8px'}}>
                <option value="">Select state</option>
                {INDIA_STATES.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Live shipping cost preview */}
            {shippingLoading && (
              <div className="dn-shipping-box">
                <div className="dn-shipping-loading">Fetching shipping rates…</div>
              </div>
            )}
            {shippingCharge !== null && !shippingLoading && (
              <div className="dn-shipping-box">
                <div className="dn-shipping-result">
                  <div>
                    <div className="dn-shipping-name">{shippingCourier}</div>
                    {shippingEta && <div className="dn-shipping-eta">Estimated delivery in {shippingEta} days</div>}
                  </div>
                  <div className={shippingCharge===0?'dn-shipping-free':'dn-shipping-charge'}>
                    {shippingCharge === 0 ? 'FREE' : `₹${shippingCharge}`}
                  </div>
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="dn-field">
              <label>Quantity</label>
              <div className="dn-qty-selector">
                <button className="dn-qty-btn" onClick={()=>changeQty(-1)}>−</button>
                <div className="dn-qty-val">{qty}</div>
                <button className="dn-qty-btn" onClick={()=>changeQty(1)}>+</button>
              </div>
            </div>

            <div className="dn-order-total">
              <div>
                <div className="dn-total-label">Total</div>
                <div style={{fontSize:'.68rem',color:'var(--text-light)',marginTop:'.2rem'}}>
                  {selectedPack==='family'?`${qty} × 12 brushes`:`${qty} × 1 brush`}
                  {shippingCharge !== null && ` + ₹${shippingCharge} shipping`}
                </div>
              </div>
              <div className="dn-total-price">
                ₹{(orderTotal + (shippingCharge??0) * qty).toLocaleString('en-IN')}
              </div>
            </div>
            <button className="dn-submit-btn" onClick={placeOrder}>Pay with Razorpay →</button>
            <div className="dn-trust-badges">
              <div className="dn-trust-b"><span>🔒</span>Razorpay Secured</div>
              <div className="dn-trust-b"><span>🚚</span>Shiprocket Delivery</div>
              <div className="dn-trust-b"><span>↩</span>30-Day Return</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="dn-footer">
        <div className="dn-footer-logo">DENTALL</div>
        <div className="dn-footer-copy">© 2025 Dentall. All rights reserved.</div>
        <div className="dn-footer-links">
          <a href="#">Privacy</a><a href="#">Terms</a><a href="#">Contact</a>
        </div>
      </footer>

      {/* ── Payment Modal ── */}
      {showPayment && (
        <div className="dn-pay-overlay" onClick={e=>{if(e.target.className==='dn-pay-overlay')closePayment();}}>
          <div className="dn-pay-modal">
            <div className="dn-pay-header">
              <div className="dn-pay-header-left">
                <div className="dn-pay-secure-tag">Secure Checkout</div>
                <div className="dn-pay-modal-title">Complete Your Order</div>
              </div>
              <button className="dn-pay-close" onClick={closePayment}>✕</button>
            </div>

            {paySuccess ? (
              <div className="dn-pay-success">
                <div className="dn-pay-success-icon">✓</div>
                <div className="dn-pay-success-title">Order Placed!</div>
                <p className="dn-pay-success-sub">Your DENTALL brushes will be shipped within 24 hours. Check your email for the receipt.</p>
                <div className="dn-pay-success-ref">Order ID: DNT-{successOrder.orderId}</div>
                {successOrder.awb && (
                  <div className="dn-pay-success-awb">
                    AWB / Tracking: {successOrder.awb}
                    <div style={{fontSize:'.68rem',marginTop:'.3rem',color:'rgba(0,212,180,.7)'}}>
                      Use this number in the Track section above
                    </div>
                  </div>
                )}
                <button className="dn-pay-done-btn" onClick={()=>{closePayment();scrollTo('tracking');}}>Track My Order →</button>
              </div>
            ) : (
              <div className="dn-pay-body">
                {/* Order summary */}
                <div className="dn-pay-order-summary">
                  <div className="dn-pay-summary-label">Order Summary</div>
                  {cartItems.map(item=>(
                    <div key={item.id} className="dn-pay-summary-row">
                      <span>{item.icon} {item.name} × {item.qty}</span>
                      <span>₹{(item.price*item.qty).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                  <div className="dn-pay-summary-row">
                    <span>Shipping</span>
                    <span style={{color: modalShipping?.charge===0?'#00D4B4':'var(--text-dark)',fontWeight:600}}>
                      {modalShipping ? (modalShipping.charge===0 ? 'FREE' : `₹${modalShipping.charge}`) : '—'}
                    </span>
                  </div>
                  <div className="dn-pay-summary-row total">
                    <span>Total</span>
                    <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Pincode for live shipping inside modal */}
                <div className="dn-pay-section-label">Delivery pincode</div>
                <div className="dn-pay-pincode-row">
                  <input
                    value={modalPincode}
                    onChange={e=>setModalPincode(e.target.value.replace(/\D/g,'').slice(0,6))}
                    placeholder="Enter 6-digit delivery pincode"
                  />
                  <button
                    className="dn-pay-pincode-check"
                    onClick={fetchModalShipping}
                    disabled={modalShipLoading || modalPincode.length!==6}>
                    {modalShipLoading ? 'Checking…' : 'Get Rates'}
                  </button>
                </div>

                {modalShipping && (
                  <div className="dn-shipping-info-box">
                    <div className="dn-shipping-info-row">
                      <span className="dn-shipping-info-courier">{modalShipping.courier}</span>
                      <span className="dn-shipping-info-price">
                        {modalShipping.charge===0 ? 'FREE' : `₹${modalShipping.charge}`}
                      </span>
                    </div>
                    {modalShipping.eta && (
                      <div className="dn-shipping-info-eta">Estimated delivery in {modalShipping.eta} business days</div>
                    )}
                  </div>
                )}

                {/* Pay via Razorpay */}
                <div className="dn-pay-section-label" style={{marginTop:'1rem'}}>Payment</div>
                <p style={{fontSize:'.82rem',color:'var(--text-mid)',lineHeight:1.6,marginBottom:'1rem'}}>
                  Clicking the button below will open the Razorpay secure payment window where you can pay by card, UPI, net banking, or wallet.
                </p>

                <button
                  className="dn-razorpay-btn"
                  onClick={handleRazorpayCheckout}
                  disabled={payProcessing || cartItems.length===0}>
                  {payProcessing
                    ? '⏳ Opening Razorpay…'
                    : <>Pay ₹{cartTotal.toLocaleString('en-IN')} <span className="dn-razorpay-logo">via Razorpay</span></>}
                </button>

                <div className="dn-pay-footer-badges">
                  <span className="dn-pay-badge">🔒 256-bit SSL</span>
                  <span className="dn-pay-badge">🛡️ PCI DSS Compliant</span>
                  <span className="dn-pay-badge">↩ 30-Day Returns</span>
                  <span className="dn-pay-badge">🚚 Shiprocket Delivery</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Video Modal ── */}
      {showVideo && (
        <div className="dn-video-modal" onClick={()=>setShowVideo(false)}>
          <div className="dn-video-backdrop"/>
          <div className="dn-video-container" onClick={e=>e.stopPropagation()}>
            <button className="dn-video-close" onClick={()=>setShowVideo(false)}>✕</button>
            <iframe width="100%" height="100%"
              src="https://www.youtube.com/embed/y7_2sUZiBbc?autoplay=1&mute=1"
              title="Dentall Product Video" frameBorder="0"
              allow="autoplay; encrypted-media" allowFullScreen/>
          </div>
        </div>
      )}
      {/* ── Lead Capture Popup ── */}
      {leadPopup && !leadSent && (
  <div
    style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,.6)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backdropFilter: 'blur(8px)'
    }}
    onClick={() => setLeadPopup(false)}
  >
    <div
      style={{
        background: '#ffffff',
        boxShadow: '0 40px 100px rgba(0,0,0,.5)',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '420px',
        overflow: 'hidden',
        boxShadow: '0 32px 80px rgba(0,0,0,.3)',
        margin: '1rem'
      }}
      onClick={(e) => e.stopPropagation()}
    >

      {/* HEADER */}
      <div style={{
        background: 'linear-gradient(135deg,#FF5C00,#7C3AED)',
        padding: '2rem',
        textAlign: 'center',
        position: 'relative'
      }}>
        <button
          onClick={() => setLeadPopup(false)}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'rgba(255,255,255,.2)',
            border: 'none',
            color: '#fff',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            fontSize: '1rem',
            cursor: 'pointer'
          }}
        >
          ✕
        </button>

        <div style={{ fontSize: '2.5rem' }}>🦷</div>
        <h2 style={{ color: '#fff', margin: '.5rem 0 0', fontFamily: 'Georgia,serif' }}>
          Get 10% Off!
        </h2>
        <p style={{ color: 'rgba(255,255,255,.85)', margin: '.3rem 0 0', fontSize: '.88rem' }}>
          Subscribe for your exclusive welcome discount
        </p>
      </div>

      {/* BODY */}
      <div style={{ padding: '1.5rem' }}>
        <input
          value={leadForm.name}
          onChange={e => setLeadForm(f => ({ ...f, name: e.target.value }))}
          placeholder="Your name"
          style={inputStyle}
        />

        <input
          value={leadForm.email}
          onChange={e => setLeadForm(f => ({ ...f, email: e.target.value }))}
          placeholder="Email address *"
          type="email"
          style={inputStyle}
        />

        <input
          value={leadForm.phone}
          onChange={e => setLeadForm(f => ({ ...f, phone: e.target.value }))}
          placeholder="Phone (optional)"
          style={inputStyle}
        />

        <button
          onClick={async () => {
            if (!leadForm.email.includes('@')) {
              alert('Please enter a valid email');
              return;
            }

           await fetch('/api/capture-lead', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(leadForm)
            });

            setLeadSent(true);
            setTimeout(() => setLeadPopup(false), 3000);
          }}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg,#FF5C00,#7C3AED)',
            color: '#fff',
            border: 'none',
            padding: '1rem',
            borderRadius: '30px',
            fontWeight: 700,
            fontSize: '.9rem',
            cursor: 'pointer',
            letterSpacing: '.05em'
          }}
        >
          Claim My 10% Off →
        </button>

        <p style={{ textAlign: 'center', fontSize: '.7rem', color: '#8A6040', marginTop: '.8rem' }}>
          No spam. Unsubscribe anytime.
        </p>
      </div>

    </div>
  </div>
)}

      {leadPopup && leadSent && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.6)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'#FFFBF5',borderRadius:'16px',padding:'3rem',textAlign:'center',maxWidth:'360px',margin:'1rem'}}>
            <div style={{fontSize:'3rem'}}>🎉</div>
            <h2 style={{color:'#FF5C00',fontFamily:'Georgia,serif'}}>You're in!</h2>
            <p style={{color:'#4A2C10'}}>Check your email for your <strong>10% off code</strong>. Happy brushing!</p>
          </div>
        </div>
      )}

    </>
  );
}