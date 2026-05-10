import React, { useState, useEffect, useRef } from "react";

/* ══════════════════════════════════════════════════════════════
   🎨 DENTALL THEME CONFIG
   Change ONLY these 3 values to retheme the entire site.
   ══════════════════════════════════════════════════════════════ */
const THEME = {
  primary:     '#C8102E',   // main brand crimson
  primaryDark: '#8B0017',   // deep wine red
  secondary:   '#0F172A',   // midnight slate (luxury contrast)
};
 
function applyTheme(theme) {
  const r = document.documentElement;
  r.style.setProperty('--primary',      theme.primary);
  r.style.setProperty('--primary-dark', theme.primaryDark);
  r.style.setProperty('--secondary',    theme.secondary);
}
 
/* ══════════════════════════════════════════════════════════════
   COPY EVERYTHING BELOW INTO YOUR const css = ` ... ` STRING
   ══════════════════════════════════════════════════════════════ */
 
const css = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,700;0,9..144,900;1,9..144,700&family=DM+Sans:wght@300;400;500;700&display=swap');
 
*, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
 

:root {
 
  --primary:      #C8102E;
  --primary-dark: #8B0017;
  --secondary:    #0F172A;

  --primary-light:  color-mix(in srgb, var(--primary) 10%, #fff);
  --primary-pale:   color-mix(in srgb, var(--primary) 5%,  #fff);
  --primary-muted:  color-mix(in srgb, var(--primary) 8%, transparent);

  --text-dark:  #111827;
  --text-mid:   #4B5563;
  --text-light: #9CA3AF;

  --white:      #FFFFFF;
  --off-white:  #F9FAFB;
  --bg-main:    #FFFFFF;
  --bg-soft:    #F3F4F6;
  --bg-card:    #FFFFFF;

  --mid-gray:     #9CA3AF;
  --light-gray:   #F3F4F6;
  --border-light: #E5E7EB;
  --border-mid:   #D1D5DB;

  --shadow-soft:  0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-hover: 0 4px 16px rgba(0,0,0,0.10);
  --glow:         none;
 
  --success: #00C896;
  --danger:  #FF6B35;
  --warning: #FBBF24;
}
 

@keyframes bg-shimmer   { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
@keyframes pulse-glow   { 0%,100%{box-shadow:0 0 0 0 rgba(0,0,0,0)} 50%{box-shadow:0 0 24px 8px rgba(0,0,0,.12)} }
@keyframes shimmer-text { 0%{background-position:-200% center} 100%{background-position:200% center} }
@keyframes float-hero   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
@keyframes bob          { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(6px)} }
@keyframes vglow        { 0%,100%{opacity:.6} 50%{opacity:1} }
@keyframes play-pulse   { 0%{box-shadow:0 0 0 0 rgba(0,0,0,.3)} 70%{box-shadow:0 0 0 28px rgba(0,0,0,0)} 100%{box-shadow:0 0 0 0 rgba(0,0,0,0)} }
@keyframes scanline     { 0%{top:-2px;opacity:0} 5%{opacity:1} 95%{opacity:1} 100%{top:100%;opacity:0} }
@keyframes blink        { 0%,100%{opacity:1} 50%{opacity:.2} }
@keyframes ring-pulse   { 0%,100%{box-shadow:0 0 0 0 var(--primary-muted)} 50%{box-shadow:0 0 0 12px transparent} }
@keyframes marquee-scroll { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
@keyframes spin         { to{transform:rotate(360deg)} }
@keyframes fadeIn       { from{opacity:0} to{opacity:1} }
@keyframes zoomIn       { from{transform:scale(0.8);opacity:0} to{transform:scale(1);opacity:1} }
@keyframes pop          { from{transform:scale(0);opacity:0} to{transform:scale(1);opacity:1} }
@keyframes pulseGlow    { 0%,100%{transform:scale(1);opacity:.7} 50%{transform:scale(1.08);opacity:1} }
 

html { scroll-behavior:smooth; }
body {
  background:var(--bg-main); color:var(--text-dark);
  font-family:'DM Sans',sans-serif; overflow-x:hidden;
}
 

@media(pointer:fine){
  body { cursor:none; }
  .dentall-cursor-dot,.dentall-cursor-ring { pointer-events:none; position:fixed; border-radius:50%; z-index:99999; transform:translate(-50%,-50%); transition:width .2s,height .2s; }
  .dentall-cursor-dot  { width:10px; height:10px; background:var(--primary); }
  .dentall-cursor-ring { width:32px; height:32px; border:1.5px solid color-mix(in srgb,var(--primary) 50%,transparent); z-index:99998; transition:left .1s ease,top .1s ease; }
  button,a,input { cursor:none !important; }
}
@media(pointer:coarse){ .dentall-cursor-dot,.dentall-cursor-ring { display:none; } }
 

.dn-nav {
  position:fixed; top:0; left:0; width:100%; z-index:100;
  padding:1rem clamp(1.2rem,4vw,3rem); display:flex; justify-content:space-between; align-items:center;
  background:rgba(255,255,255,0.97); backdrop-filter:blur(16px);
  border-bottom:1px solid var(--border-light);
  box-shadow:var(--shadow-soft);
}
.dn-logo {
  font-family:'Fraunces',serif; font-size:1.5rem; font-weight:900; letter-spacing:.05em;
  color:var(--primary);
}
.dn-nav-links { display:flex; gap:2rem; align-items:center; }
.dn-nav-links a { color:var(--text-mid); text-decoration:none; font-size:.8rem; letter-spacing:.1em; text-transform:uppercase; font-weight:600; transition:all .3s; }
.dn-nav-links a:hover { color:var(--primary); }
.dn-nav-cta {
  background:var(--primary); color:#fff; border:none; padding:.6rem 1.5rem;
  font-family:'DM Sans',sans-serif; font-size:.78rem; font-weight:700; letter-spacing:.1em;
  text-transform:uppercase; border-radius:4px; transition:all .3s;
}
.dn-nav-cta:hover { background:var(--primary-dark); }
 

.dn-hamburger { display:none; flex-direction:column; gap:5px; background:none; border:none; padding:4px; }
.dn-hamburger span { display:block; width:24px; height:2px; background:var(--text-dark); border-radius:2px; transition:all .3s; }
.dn-hamburger.open span:nth-child(1) { transform:translateY(7px) rotate(45deg); }
.dn-hamburger.open span:nth-child(2) { opacity:0; }
.dn-hamburger.open span:nth-child(3) { transform:translateY(-7px) rotate(-45deg); }
 

.dn-drawer {
  position:fixed; top:0; left:0; width:100%; height:100%; z-index:99;
  background:var(--white); display:flex; flex-direction:column; justify-content:center; align-items:center;
  gap:2.5rem; transform:translateX(100%); transition:transform .4s cubic-bezier(.77,0,.18,1);
}
.dn-drawer.open { transform:translateX(0); }
.dn-drawer a { font-size:1.4rem; font-family:'Fraunces',serif; color:var(--text-dark); text-decoration:none; }
.dn-drawer button.dn-nav-cta { padding:1rem 3rem; font-size:.88rem; }
 
@media(max-width:768px){
  .dn-nav { padding:.85rem 1.2rem; }
  .dn-nav-links { display:none; }
  .dn-hamburger { display:flex; }
}
 

.dn-hero {
  min-height:100vh; display:grid; grid-template-columns:1fr 1fr;
  align-items:center; gap:3rem;
  padding:5rem max(1.5rem,calc((100vw - 1280px)/2)) 1.5rem;
  background:var(--white); border-bottom:1px solid var(--border-light);
}
.dn-hero-bg { display:none; }
.dn-hero::before { display:none; }
.dn-hero-content { position:relative; z-index:2; padding-right:3rem; }
.dn-hero-tag {
  display:inline-flex; align-items:center; gap:.6rem; font-size:.72rem;
  letter-spacing:.3em; text-transform:uppercase; font-weight:700; margin-bottom:1.5rem;
  color:var(--primary);
}
.dn-hero-tag::before { content:''; display:block; width:32px; height:2px; background:var(--primary); border-radius:2px; }
.dn-h1 { font-family:'Fraunces',serif; font-size:clamp(2.4rem,4.5vw,4.6rem); font-weight:900; line-height:1.0; letter-spacing:-.03em; color:var(--text-dark); margin-bottom:1.2rem; }
.dn-h1 em { color:var(--primary); font-style:italic; }
.dn-hero-sub { font-size:.92rem; color:var(--text-mid); line-height:1.7; max-width:440px; margin-bottom:1.8rem; font-weight:400; }
.dn-hero-ctas { display:flex; gap:1rem; align-items:center; flex-wrap:wrap; }
 
.dn-btn-primary {
  background:var(--primary); color:#fff; border:none; padding:1rem 2.2rem;
  font-family:'DM Sans',sans-serif; font-size:.88rem; font-weight:700; letter-spacing:.08em; text-transform:uppercase;
  border-radius:4px; transition:background .2s;
}
.dn-btn-primary:hover { background:var(--primary-dark); }
 
.dn-btn-ghost {
  background:transparent; border:1.5px solid var(--primary); color:var(--primary);
  padding:1rem 2.2rem; font-family:'DM Sans',sans-serif; font-size:.88rem; font-weight:600;
  letter-spacing:.08em; text-transform:uppercase; border-radius:4px; transition:all .2s;
}
.dn-btn-ghost:hover { background:var(--primary); color:#fff; }
 
.dn-hero-image-wrap { position:relative; z-index:2; display:flex; justify-content:center; align-items:center; }
.dn-hero-img { width:300px; filter:drop-shadow(0 24px 60px var(--primary-muted)) drop-shadow(0 8px 20px rgba(0,0,0,.12)); animation:float-hero 4s ease-in-out infinite; }
.dn-hero-badge {
  position:absolute; bottom:2rem; left:1rem; background:var(--white);
  border:1px solid var(--border-mid); border-radius:12px; padding:.9rem 1.2rem;
  display:flex; align-items:center; gap:.7rem; box-shadow:var(--shadow-soft);
}
.dn-badge-label { font-size:.68rem; color:var(--text-light); text-transform:uppercase; letter-spacing:.1em; }
.dn-badge-val   { font-size:.9rem; font-weight:600; color:var(--text-dark); }
.dn-scroll-hint {
  position:absolute; bottom:2rem; left:50%; transform:translateX(-50%);
  display:flex; flex-direction:column; align-items:center; gap:.5rem;
  color:var(--text-light); font-size:.65rem; letter-spacing:.2em; text-transform:uppercase;
  animation:bob 2.5s ease-in-out infinite;
}
.dn-scroll-hint::after { content:''; display:block; width:1px; height:40px; background:var(--border-mid); }
 
@media(max-width:960px){
  .dn-hero { grid-template-columns:1fr; padding:5rem 1.5rem 2rem; text-align:center; gap:1.5rem; }
  .dn-hero-bg { display:none; }
  .dn-hero-content { padding-right:0; }
  .dn-hero-tag { justify-content:center; }
  .dn-hero-sub { margin:0 auto 2rem; }
  .dn-hero-ctas { justify-content:center; }
  .dn-hero-image-wrap { margin-top:1rem; }
  .dn-hero-img { width:200px; }
  .dn-hero-badge { position:static; margin-top:1.2rem; justify-content:center; }
  .dn-scroll-hint { display:none; }
}
@media(max-width:480px){
  .dn-hero { padding:5.5rem 1.2rem 3rem; }
  .dn-h1 { font-size:clamp(2.2rem,10vw,3rem); }
  .dn-hero-sub { font-size:.9rem; }
  .dn-hero-ctas { flex-direction:column; align-items:center; width:100%; }
  .dn-btn-primary,.dn-btn-ghost { width:100%; text-align:center; }
}
 

.dn-pack-banner {
  background:var(--secondary);
  padding:4rem max(1.5rem,calc((100vw - 1280px)/2)); position:relative; overflow:hidden;
  min-height:100vh; display:flex; align-items:center;
}
.dn-pack-inner { position:relative; z-index:2; display:grid; grid-template-columns:1fr auto; gap:3rem; align-items:center; max-width:1100px; margin:0 auto; width:100%; }
.dn-pack-label { font-size:.65rem; letter-spacing:.32em; text-transform:uppercase; color:rgba(255,255,255,.6); font-weight:600; margin-bottom:.7rem; }
.dn-pack-title { font-family:'Fraunces',serif; font-size:clamp(1.6rem,3vw,2.8rem); font-weight:900; color:#fff; line-height:1.15; margin-bottom:1rem; }
.dn-pack-title em { font-style:italic; color:rgba(255,255,255,.9); }
.dn-pack-desc { font-size:.9rem; color:rgba(255,255,255,.75); line-height:1.8; max-width:520px; font-weight:300; }
.dn-pack-math { display:flex; flex-direction:column; gap:1rem; background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.15); border-radius:8px; padding:2rem 2.5rem; min-width:260px; backdrop-filter:blur(8px); }
.dn-pack-math-row { display:flex; justify-content:space-between; align-items:center; gap:2rem; font-size:.82rem; color:rgba(255,255,255,.7); }
.dn-pack-math-row strong { color:#fff; font-weight:600; }
.dn-pack-math-divider { height:1px; background:rgba(255,255,255,.15); }
.dn-pack-math-total { display:flex; justify-content:space-between; align-items:baseline; gap:2rem; }
.dn-pack-math-total-label { font-size:.78rem; letter-spacing:.1em; text-transform:uppercase; color:rgba(255,255,255,.8); font-weight:600; }
.dn-pack-math-price { font-family:'Fraunces',serif; font-size:2rem; font-weight:900; color:#fff; }
.dn-pack-math-price span { font-size:.75rem; font-family:'DM Sans',sans-serif; color:rgba(255,255,255,.5); font-weight:400; margin-left:.3rem; }
.dn-pack-timeline { display:flex; margin-top:1.5rem; border:1px solid rgba(255,255,255,.15); border-radius:4px; overflow:hidden; }
.dn-pack-month { flex:1; text-align:center; padding:.6rem .3rem; font-size:.62rem; color:rgba(255,255,255,.5); letter-spacing:.08em; text-transform:uppercase; border-right:1px solid rgba(255,255,255,.1); }
.dn-pack-month:last-child { border-right:none; }
.dn-pack-month.change { background:rgba(255,255,255,.1); color:#fff; font-weight:600; }
.dn-pack-month.change::before { content:'🔄'; display:block; font-size:.8rem; margin-bottom:.2rem; }
.dn-pack-timeline-label { font-size:.65rem; color:rgba(255,255,255,.4); text-align:center; margin-top:.5rem; letter-spacing:.12em; text-transform:uppercase; }
.dn-pack-perks { display:flex; gap:2rem; flex-wrap:wrap; margin-top:1.5rem; }
.dn-pack-perk { display:flex; align-items:center; gap:.5rem; font-size:.78rem; color:rgba(255,255,255,.75); }
.dn-pack-perk-dot { width:6px; height:6px; border-radius:50%; background:rgba(255,255,255,.6); flex-shrink:0; }
@media(max-width:900px){ .dn-pack-banner{padding:3rem 1.5rem;} .dn-pack-inner{grid-template-columns:1fr;gap:2rem;} .dn-pack-math{min-width:unset;} }
@media(max-width:480px){ .dn-pack-banner{padding:2.5rem 1.2rem;} .dn-pack-perks{gap:1rem;} }
 

.dn-video-section { padding:3rem max(1.5rem,calc((100vw - 1280px)/2)); background:#0D0D0D; position:relative; overflow:hidden; min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; }
.dn-video-label { font-size:.65rem; letter-spacing:.32em; text-transform:uppercase; color:var(--primary); font-weight:700; margin-bottom:.8rem; position:relative; z-index:2; text-align:center; }
.dn-video-title { font-family:'Fraunces',serif; font-size:clamp(1.8rem,3vw,3rem); color:#fff; font-weight:900; line-height:1.15; margin-bottom:3rem; text-align:center; position:relative; z-index:2; }
.dn-video-title em { color:var(--primary); font-style:italic; }
.dn-video-placeholder { position:relative; z-index:2; width:100%; max-width:900px; margin:0 auto; aspect-ratio:16/9; border-radius:4px; overflow:hidden; background:#1A1A1A; border:1px solid rgba(255,255,255,0.08); box-shadow:0 24px 60px rgba(0,0,0,.5); cursor:pointer; }
.dn-video-grid { position:absolute; inset:0; background-image:linear-gradient(var(--primary-muted) 1px,transparent 1px),linear-gradient(90deg,color-mix(in srgb,var(--accent) 4%,transparent) 1px,transparent 1px); background-size:40px 40px; }
.dn-video-glow { display:none; }
.dn-video-corner { position:absolute; width:24px; height:24px; border-color:var(--primary); border-style:solid; opacity:.8; }
.dn-video-corner-tl { top:16px; left:16px; border-width:2px 0 0 2px; }
.dn-video-corner-tr { top:16px; right:16px; border-width:2px 2px 0 0; }
.dn-video-corner-bl { bottom:16px; left:16px; border-width:0 0 2px 2px; }
.dn-video-corner-br { bottom:16px; right:16px; border-width:0 2px 2px 0; }
.dn-video-play-btn { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:88px; height:88px; border-radius:50%; background:var(--primary); border:none; display:flex; align-items:center; justify-content:center; transition:transform .2s,background .2s; z-index:10; }
.dn-video-play-btn:hover { transform:translate(-50%,-50%) scale(1.12); }
.dn-play-icon { width:0; height:0; border-style:solid; border-width:12px 0 12px 22px; border-color:transparent transparent transparent #fff; margin-left:4px; }
.dn-video-caption { position:absolute; bottom:1.5rem; left:50%; transform:translateX(-50%); white-space:nowrap; font-size:.68rem; letter-spacing:.25em; text-transform:uppercase; color:rgba(255,255,255,.35); }
.dn-video-scanline { position:absolute; top:0; left:0; width:100%; height:2px; background:rgba(200,16,46,.3); animation:scanline 4s linear infinite; }
.dn-video-duration { position:absolute; top:1.2rem; right:5rem; font-size:.65rem; color:rgba(255,255,255,.3); }
.dn-video-live { position:absolute; top:1.2rem; left:1.5rem; display:flex; align-items:center; gap:.4rem; font-size:.62rem; color:rgba(255,255,255,.4); letter-spacing:.15em; text-transform:uppercase; }
.dn-video-live::before { content:''; width:6px; height:6px; border-radius:50%; background:var(--primary); animation:blink 1.5s ease-in-out infinite; }
@media(max-width:768px){ .dn-video-section{padding:3.5rem 1.2rem 4rem;} }
@media(max-width:480px){ .dn-video-section{padding:3rem 1rem 3.5rem;} .dn-video-play-btn{width:64px;height:height:64px;} }
 

.dn-scroll-stage { position:relative; height:600vh; background:var(--white); }
.dn-sticky-canvas { position:sticky; top:0; height:100vh; width:100%; display:flex; align-items:center; justify-content:center; overflow:hidden; background:var(--white); }
.dn-brush-scene { position:relative; width:100%; height:100%; display:flex; align-items:center; justify-content:center; }
#dn-brush-wrapper { position:relative; transform-origin:center center; display:flex; align-items:center; justify-content:center; }

/* ── Scroll-stage intro & hint ── */
.dn-scroll-intro {
  position:absolute; left:max(1.5rem,calc((100vw - 1280px)/2 + 1.5rem)); top:50%;
  transform:translateY(-50%); width:210px;
  opacity:0; transition:opacity .7s ease; pointer-events:none; z-index:10;
}
.dn-scroll-intro.visible { opacity:1; }
.dn-scroll-intro-tag { font-size:.58rem; letter-spacing:.28em; text-transform:uppercase; color:var(--primary); font-weight:700; margin-bottom:.65rem; }
.dn-scroll-intro-title { font-family:'Fraunces',serif; font-size:1.45rem; font-weight:900; color:var(--text-dark); line-height:1.15; margin-bottom:.7rem; }
.dn-scroll-intro-title em { color:var(--primary); font-style:italic; }
.dn-scroll-intro-desc { font-size:.75rem; color:var(--text-mid); line-height:1.7; margin-bottom:1rem; }
.dn-scroll-intro-steps { display:flex; flex-direction:column; gap:.55rem; }
.dn-scroll-intro-step { display:flex; align-items:center; gap:.75rem; padding:.45rem .65rem; border-left:2px solid var(--border-mid); transition:border-color .3s; }
.dn-scroll-intro-step:hover { border-color:var(--primary); }
.dn-scroll-intro-num { font-family:'Fraunces',serif; font-size:.95rem; font-weight:900; color:var(--primary); min-width:1.6rem; }
.dn-scroll-intro-name { font-size:.76rem; color:var(--text-mid); font-weight:500; }

.dn-scroll-stats {
  position:absolute; right:max(1.5rem,calc((100vw - 1280px)/2 + 1.5rem)); top:50%;
  transform:translateY(-50%); display:flex; flex-direction:column; gap:1.4rem;
  opacity:0; transition:opacity .7s ease; pointer-events:none; z-index:10;
}
.dn-scroll-stats.visible { opacity:1; }
.dn-scroll-stat-item { text-align:right; }
.dn-scroll-stat-num { font-family:'Fraunces',serif; font-size:1.7rem; font-weight:900; color:var(--primary); line-height:1; }
.dn-scroll-stat-label { font-size:.6rem; letter-spacing:.1em; text-transform:uppercase; color:var(--text-light); margin-top:.2rem; }
.dn-scroll-stat-bar { height:2px; background:var(--border-mid); border-radius:2px; margin-top:.35rem; overflow:hidden; }
.dn-scroll-stat-fill { height:100%; background:var(--primary); border-radius:2px; }

.dn-scroll-down-cue {
  position:absolute; bottom:2.2rem; left:50%; transform:translateX(-50%);
  display:flex; flex-direction:column; align-items:center; gap:.5rem;
  opacity:0; transition:opacity .7s ease; pointer-events:none; z-index:20;
}
.dn-scroll-down-cue.visible { opacity:1; }
.dn-scroll-down-cue-text { font-size:.58rem; letter-spacing:.22em; text-transform:uppercase; color:var(--text-light); }
.dn-scroll-down-cue-line { width:1px; height:36px; background:linear-gradient(to bottom,var(--border-mid),transparent); animation:bob 2s ease-in-out infinite; }
.dn-scroll-down-cue-arrow { width:0; height:0; border-left:5px solid transparent; border-right:5px solid transparent; border-top:6px solid var(--primary); opacity:.7; animation:bob 2s ease-in-out infinite; }

@media(max-width:900px){ .dn-scroll-intro,.dn-scroll-stats { display:none; } }
@media(max-width:768px){ .dn-scroll-down-cue { bottom:12vh; } }
#dn-brush-img { width:220px; filter:drop-shadow(0 30px 60px var(--primary-muted)) drop-shadow(0 8px 20px rgba(0,0,0,.1)); display:block; }
@media(max-width:768px){ #dn-brush-img{width:140px;} }
.dn-img-highlight { position:absolute; border-radius:50%; border:2px solid var(--primary); opacity:0; pointer-events:none; transition:opacity .5s; animation:ring-pulse 2.2s ease-in-out infinite; }
.dn-img-highlight.active { opacity:1; }
.dn-feature-panel { position:absolute; width:220px; opacity:0; transition:opacity .6s ease,transform .6s ease; pointer-events:none; transform:translateY(12px); }
.dn-feature-panel.left { right:calc(50% + 160px); text-align:right; }
.dn-feature-panel.right { left:calc(50% + 160px); }
.dn-feature-panel.visible { opacity:1; transform:translateY(0); }
.dn-fp-tag { font-size:.6rem; letter-spacing:.28em; text-transform:uppercase; color:var(--primary); margin-bottom:.4rem; font-weight:700; }
.dn-fp-title { font-family:'Fraunces',serif; font-size:1.3rem; font-weight:700; color:var(--text-dark); line-height:1.15; margin-bottom:.5rem; }
.dn-fp-desc { font-size:.78rem; color:var(--text-mid); line-height:1.7; font-weight:400; }
.dn-fp-line { position:absolute; top:28px; height:1px; background:var(--primary); opacity:0; transition:opacity .6s,width .6s; width:0; }
.dn-feature-panel.left  .dn-fp-line { left:100%; }
.dn-feature-panel.right .dn-fp-line { right:100%; }
.dn-feature-panel.visible .dn-fp-line { opacity:1; width:50px; }
.dn-mobile-feature-card { display:none; position:absolute; top:6vh; left:50%; transform:translateX(-50%); background:rgba(255,255,255,.97); border:1px solid var(--border-mid); border-left:3px solid var(--primary); border-radius:4px; padding:.9rem 1.2rem; width:calc(100% - 3rem); max-width:320px; box-shadow:var(--shadow-soft); opacity:0; transition:opacity .4s ease; z-index:10; }
.dn-mobile-feature-card.visible { opacity:1; }
.dn-mobile-fp-tag { font-size:.58rem; letter-spacing:.25em; text-transform:uppercase; color:var(--primary); font-weight:700; margin-bottom:.3rem; }
.dn-mobile-fp-title { font-family:'Fraunces',serif; font-size:1rem; font-weight:700; color:var(--text-dark); margin-bottom:.25rem; }
.dn-mobile-fp-desc { font-size:.74rem; color:var(--text-mid); line-height:1.6; font-weight:400; }
@media(max-width:768px){ .dn-feature-panel{display:none;} .dn-mobile-feature-card{display:block;} }
#dn-phase-label { position:absolute; bottom:6vh; left:50%; transform:translateX(-50%); text-align:center; opacity:0; transition:opacity .5s; pointer-events:none; }
#dn-phase-label.visible { opacity:1; }
.dn-pl-step { font-size:.6rem; letter-spacing:.3em; text-transform:uppercase; color:var(--primary); font-weight:700; margin-bottom:.2rem; }
.dn-pl-name { font-family:'Fraunces',serif; font-size:1.6rem; font-weight:700; color:var(--text-dark); }
@media(max-width:768px){ #dn-phase-label{bottom:5vh;} .dn-pl-name{font-size:1.2rem;} }
#dn-progress-dots { position:fixed; right:1.5rem; top:50%; transform:translateY(-50%); display:flex; flex-direction:column; gap:.7rem; z-index:50; }
.dn-dot { width:6px; height:6px; border-radius:50%; border:1.5px solid var(--text-light); transition:all .3s; }
.dn-dot.active { background:var(--primary); border-color:var(--primary); transform:scale(1.5); box-shadow:0 0 8px var(--primary-muted); }
@media(max-width:768px){ #dn-progress-dots{right:.8rem;} }
 

/* ── Hygiene Cap Section ── */
.dn-cap-section {
  padding:5rem max(1.5rem,calc((100vw - 1280px)/2));
  background:var(--white); border-top:1px solid var(--border-light);
  display:grid; grid-template-columns:1fr 1fr; gap:5rem; align-items:center;
}
.dn-cap-tag { font-size:.63rem; letter-spacing:.3em; text-transform:uppercase; color:var(--primary); font-weight:700; margin-bottom:.9rem; }
.dn-cap-title { font-family:'Fraunces',serif; font-size:clamp(1.9rem,3vw,3rem); font-weight:900; color:var(--text-dark); line-height:1.1; margin-bottom:1rem; }
.dn-cap-title em { color:var(--primary); font-style:italic; }
.dn-cap-desc { font-size:.88rem; color:var(--text-mid); line-height:1.8; margin-bottom:1.8rem; max-width:440px; }
.dn-cap-points { display:flex; flex-direction:column; gap:.9rem; }
.dn-cap-point { display:flex; align-items:flex-start; gap:.9rem; }
.dn-cap-point-icon { width:32px; height:32px; border-radius:8px; background:var(--primary-muted); display:flex; align-items:center; justify-content:center; font-size:.95rem; flex-shrink:0; margin-top:.05rem; }
.dn-cap-point-body { }
.dn-cap-point-title { font-size:.82rem; font-weight:700; color:var(--text-dark); margin-bottom:.2rem; }
.dn-cap-point-desc { font-size:.76rem; color:var(--text-mid); line-height:1.6; }

.dn-cap-images { display:grid; grid-template-columns:1fr 1fr; grid-template-rows:1fr 1fr; gap:.9rem; }
.dn-cap-img-main  { grid-column:1; grid-row:1/3; }
.dn-cap-img-side-top    { grid-column:2; grid-row:1; }
.dn-cap-img-side-bottom { grid-column:2; grid-row:2; }
.dn-cap-img { width:100%; object-fit:contain; background:var(--off-white); display:block; transition:transform .35s cubic-bezier(.4,0,.2,1),box-shadow .35s; }

/* Cap-on-brush: tall left — rounded on the right side, sharp on the left */
.dn-cap-img-main {
  height:100%; min-height:320px; object-fit:contain;
  border-radius: 20px 80px 80px 20px;
  box-shadow: 8px 12px 40px rgba(200,16,46,.10), 0 2px 8px rgba(0,0,0,.07);
}
.dn-cap-img-main:hover { transform:scale(1.025) translateX(-4px); box-shadow:12px 20px 56px rgba(200,16,46,.16), 0 4px 12px rgba(0,0,0,.1); }

/* Open cap: top right — big radius on top + outer corners */
.dn-cap-img-side-top {
  aspect-ratio:1/1;
  border-radius: 16px 72px 16px 72px;
  box-shadow: 0 8px 28px rgba(0,0,0,.08);
}
.dn-cap-img-side-top:hover { transform:translateY(-5px) scale(1.03); box-shadow:0 18px 44px rgba(0,0,0,.13); }

/* Closed cap: bottom right — mirror of top */
.dn-cap-img-side-bottom {
  aspect-ratio:1/1;
  border-radius: 72px 16px 72px 16px;
  box-shadow: 0 8px 28px rgba(0,0,0,.08);
}
.dn-cap-img-side-bottom:hover { transform:translateY(5px) scale(1.03); box-shadow:0 18px 44px rgba(0,0,0,.13); }
.dn-cap-badge { display:inline-flex; align-items:center; gap:.5rem; background:var(--primary-muted); border:1px solid color-mix(in srgb,var(--primary) 20%,transparent); border-radius:20px; padding:.35rem .9rem; font-size:.68rem; color:var(--primary); font-weight:700; margin-top:1.8rem; }
.dn-cap-badge::before { content:''; width:7px; height:7px; border-radius:50%; background:var(--primary); }

@media(max-width:960px){ .dn-cap-section{grid-template-columns:1fr;gap:2.5rem;padding:4rem 1.5rem;} .dn-cap-desc{max-width:100%;} }
@media(max-width:600px){ .dn-cap-section{padding:3rem 1.2rem;} .dn-cap-images{grid-template-columns:1fr; grid-template-rows:auto auto auto;} .dn-cap-img-main{grid-column:1;grid-row:1;min-height:220px;} .dn-cap-img-side-top{grid-column:1;grid-row:2;} .dn-cap-img-side-bottom{grid-column:1;grid-row:3;} }

.dn-features-grid { padding:3rem max(1.5rem,calc((100vw - 1280px)/2)); background:var(--off-white); border-top:1px solid var(--border-light); min-height:100vh; display:flex; flex-direction:column; justify-content:center; }
.dn-section-label { font-size:.63rem; letter-spacing:.3em; text-transform:uppercase; color:var(--primary); font-weight:700; margin-bottom:.8rem; }
.dn-section-title {
    font-family: 'Fraunces', serif;
    font-size: clamp(2rem, 4vw, 3.2rem);
    font-weight: 900;
    color: var(--text-dark);

    line-height: 1.1;
    letter-spacing: -0.5px;

    max-width: 600px;

    margin: 0 auto 1rem;
    text-align: center;
}
.dn-section-title em { color:var(--primary); font-style:italic; }
.dn-features-inner { display:grid; grid-template-columns:1fr 1fr 1fr; gap:2px; background:var(--border-mid); border:2px solid var(--border-mid); border-radius:12px; overflow:hidden; }
.dn-feat-card { background:var(--white); padding:1.4rem 1.5rem; opacity:0; transform:translateY(24px); transition:opacity .6s,transform .6s,box-shadow .3s; position:relative; overflow:hidden; }
.dn-feat-card::before { content:''; position:absolute; bottom:0; left:0; width:0; height:2px; background:var(--primary); transition:width .4s; }
.dn-feat-card:hover::before { width:100%; }
.dn-feat-card.visible { opacity:1; transform:translateY(0); }
.dn-feat-num { font-family:'Fraunces',serif; font-size:1.8rem; font-weight:900; color:var(--primary-muted); line-height:1; margin-bottom:.4rem; }
.dn-feat-icon { font-size:1.5rem; margin-bottom:.7rem; }
.dn-feat-title { font-size:.93rem; font-weight:700; color:var(--text-dark); margin-bottom:.5rem; }
.dn-feat-text { font-size:.8rem; color:var(--text-mid); line-height:1.7; font-weight:400; }
@media(max-width:900px){ .dn-features-inner{grid-template-columns:1fr 1fr;} }
@media(max-width:600px){ .dn-features-inner{grid-template-columns:1fr;} .dn-features-grid{padding:4rem 1.5rem;} }
@media(max-width:480px){ .dn-features-grid{padding:3.5rem 1.2rem;} .dn-feat-card{padding:1.8rem 1.4rem;} }

/* ── Merged Feature + Patient Cards ── */
.dn-merged-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:1.5rem; }
.dn-merged-card { border-radius:18px; overflow:hidden; border:1.5px solid var(--border-mid); background:var(--white); opacity:0; transform:translateY(24px); transition:opacity .6s,transform .6s,box-shadow .3s,border-color .3s; }
.dn-merged-card.visible { opacity:1; transform:translateY(0); }
.dn-merged-card:hover { box-shadow:0 20px 56px rgba(0,0,0,.1); border-color:var(--primary); }
.dn-merged-features { padding:2.2rem 2rem; display:flex; flex-direction:column; justify-content:center; height:100%; }
.dn-merged-feat-item { padding:0; border-bottom:none; }
.dn-merged-feat-item:last-child { border-bottom:none; }
.dn-merged-feat-header { display:flex; align-items:center; gap:.75rem; margin-bottom:.65rem; }
.dn-merged-feat-num { font-family:'Fraunces',serif; font-size:2.2rem; font-weight:900; color:var(--primary-muted); min-width:3rem; line-height:1; }
.dn-merged-feat-icon { font-size:1.6rem; }
.dn-merged-feat-title { font-size:1rem; font-weight:700; color:var(--text-dark); }
.dn-merged-feat-text { font-size:.82rem; color:var(--text-mid); line-height:1.75; padding-left:3.75rem; }
.dn-merged-patient { padding:1.4rem 1.5rem 1.6rem; background:var(--secondary); position:relative; overflow:hidden; }
.dn-merged-patient-glow { position:absolute; width:150px; height:150px; border-radius:50%; opacity:0; filter:blur(50px); top:-30px; right:-20px; transition:opacity .4s; pointer-events:none; }
.dn-merged-card:hover .dn-merged-patient-glow { opacity:.35; }
.dn-merged-patient-icon { width:46px; height:46px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:1.45rem; margin-bottom:.7rem; position:relative; z-index:1; }
.dn-merged-patient-badge { display:inline-flex; align-items:center; gap:.3rem; border-radius:4px; padding:.18rem .55rem; font-size:.52rem; font-weight:700; letter-spacing:.12em; text-transform:uppercase; margin-bottom:.5rem; position:relative; z-index:1; }
.dn-merged-patient-divider { width:24px; height:2px; border-radius:2px; margin:.6rem 0; position:relative; z-index:1; }
.dn-merged-patient-title { font-family:'Fraunces',serif; font-size:1.05rem; font-weight:900; color:#fff; line-height:1.2; margin-bottom:.45rem; position:relative; z-index:1; }
.dn-merged-patient-text { font-size:.72rem; color:rgba(255,255,255,.62); line-height:1.7; position:relative; z-index:1; }
@media(max-width:580px){ .dn-merged-grid{grid-template-columns:1fr;} }

/* ── Patient Conditions Highlight Section ── */
.dn-patient-section { padding:4rem max(1.5rem,calc((100vw - 1280px)/2)); background:var(--secondary); border-top:1px solid rgba(255,255,255,.06); min-height:100vh; display:flex; flex-direction:column; justify-content:center; }
.dn-patient-section-label { font-size:.63rem; letter-spacing:.3em; text-transform:uppercase; color:rgba(255,255,255,.45); font-weight:700; margin-bottom:.8rem; }
.dn-patient-section-title { font-family:'Fraunces',serif; font-size:clamp(1.5rem,2.6vw,2.4rem); font-weight:900; color:#fff; margin-bottom:.6rem; max-width:520px; line-height:1.15; }
.dn-patient-section-title em { color:var(--primary); font-style:italic; }
.dn-patient-section-sub { font-size:.85rem; color:rgba(255,255,255,.48); margin-bottom:2.8rem; max-width:540px; line-height:1.75; }
.dn-patient-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1.5rem; }
.dn-patient-card { border-radius:20px; overflow:hidden; border:1.5px solid rgba(255,255,255,.08); background:rgba(255,255,255,.04); padding:2rem 1.8rem 2.4rem; position:relative; transition:transform .3s,box-shadow .3s,border-color .3s; }
.dn-patient-card:hover { transform:translateY(-7px); box-shadow:0 30px 72px rgba(0,0,0,.45); }
.dn-patient-card-glow { position:absolute; width:240px; height:240px; border-radius:50%; opacity:.1; filter:blur(68px); top:-55px; right:-35px; transition:opacity .45s; pointer-events:none; }
.dn-patient-card:hover .dn-patient-card-glow { opacity:.28; }
.dn-patient-card-accent { position:absolute; top:0; left:0; right:0; height:4px; border-radius:20px 20px 0 0; }
.dn-patient-card-icon { width:64px; height:64px; border-radius:16px; display:flex; align-items:center; justify-content:center; font-size:2rem; margin-bottom:1.1rem; position:relative; z-index:1; }
.dn-patient-card-badge { display:inline-flex; align-items:center; gap:.45rem; border-radius:5px; padding:.32rem .85rem; font-size:.6rem; font-weight:700; letter-spacing:.14em; text-transform:uppercase; margin-bottom:.9rem; position:relative; z-index:1; }
.dn-patient-card-divider { width:36px; height:3px; border-radius:2px; margin:.8rem 0 1.1rem; position:relative; z-index:1; }
.dn-patient-card-title { font-family:'Fraunces',serif; font-size:1.15rem; font-weight:900; color:#fff; line-height:1.25; margin-bottom:.75rem; position:relative; z-index:1; }
.dn-patient-card-text { font-size:.78rem; color:rgba(255,255,255,.56); line-height:1.78; position:relative; z-index:1; }
@media(max-width:900px){ .dn-patient-grid{grid-template-columns:1fr 1fr;} }
@media(max-width:580px){ .dn-patient-grid{grid-template-columns:1fr;} .dn-patient-section{padding:3rem 1.2rem;} }

.dn-social { padding:3rem 0; background:var(--white); overflow:hidden; min-height:100vh; display:flex; flex-direction:column; justify-content:center; }
.dn-social-header { padding:0 max(1.5rem,calc((100vw - 1280px)/2)) 1.5rem; text-align:center; }
.dn-social-header .dn-section-title { margin:0 auto; }
.dn-reviews-track-wrapper { position:relative; width:100%; overflow:hidden; padding:1rem 0 2rem; }
.dn-reviews-track-wrapper::before,.dn-reviews-track-wrapper::after { content:''; position:absolute; top:0; bottom:0; width:80px; z-index:2; pointer-events:none; }
.dn-reviews-track-wrapper::before { left:0; background:linear-gradient(to right,var(--white),transparent); }
.dn-reviews-track-wrapper::after  { right:0; background:linear-gradient(to left,var(--white),transparent); }
.dn-reviews-scroll-track { display:flex; gap:1.5rem; width:max-content; animation:marquee-scroll 30s linear infinite; will-change:transform; }
.dn-reviews-track-wrapper:hover .dn-reviews-scroll-track { animation-play-state:paused; }
.dn-review-card { background:var(--off-white); border:1px solid var(--primary-muted); padding:2rem; text-align:left; position:relative; flex:0 0 300px; border-radius:12px; transition:transform .3s,box-shadow .3s; }
.dn-review-card:hover { transform:translateY(-6px); box-shadow:0 16px 48px var(--primary-muted); }
.dn-review-card::before { content:'“'; position:absolute; top:1.2rem; right:1.5rem; font-family:'Fraunces',serif; font-size:3rem; color:var(--primary); opacity:.2; line-height:1; }
.dn-stars { color:var(--warning); font-size:.85rem; margin-bottom:.8rem; }
.dn-review-text { font-size:.82rem; color:var(--text-mid); line-height:1.75; margin-bottom:1.2rem; }
.dn-review-author { font-size:.76rem; color:var(--text-dark); font-weight:700; }
.dn-stats-row { display:flex; justify-content:center; gap:3rem; flex-wrap:wrap; padding:1.5rem max(1.5rem,calc((100vw - 1280px)/2)) 0; border-top:1px solid var(--border-light); }
.dn-stat-num { font-family:'Fraunces',serif; font-size:2.8rem; font-weight:900; color:var(--primary); line-height:1.1; }
.dn-stat-label { font-size:.7rem; color:var(--text-light); letter-spacing:.12em; text-transform:uppercase; margin-top:.3rem; }
@media(max-width:900px){ .dn-social{padding:4rem 0;} .dn-social-header{padding:0 1.5rem 2rem;} .dn-stats-row{gap:2rem;padding:2.5rem 1.5rem 0;} .dn-review-card{flex:0 0 260px;} }
@media(max-width:480px){ .dn-social{padding:3rem 0;} .dn-social-header{padding:0 1.2rem 1.5rem;} .dn-stats-row{gap:1.5rem;padding:2rem 1.2rem 0;} .dn-review-card{flex:0 0 240px;} }

.dn-write-review { padding:4rem max(1.5rem,calc((100vw - 1280px)/2)); background:var(--white); border-top:1px solid var(--border-light); }
.dn-write-review-inner { max-width:700px; margin:0 auto; }
.dn-write-review-card { background:var(--off-white); border:1px solid var(--border-light); border-radius:16px; padding:2.5rem; box-shadow:var(--shadow-soft); }
.dn-star-picker { display:flex; gap:.3rem; margin:.6rem 0 1.4rem; }
.dn-star-btn { background:none; border:none; font-size:2.2rem; cursor:pointer; color:var(--border-mid); transition:color .12s,transform .12s; line-height:1; padding:0 .1rem; }
.dn-star-btn.lit { color:var(--warning); transform:scale(1.1); }
.dn-review-form-row { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
.dn-review-field { display:flex; flex-direction:column; gap:.35rem; margin-bottom:1rem; }
.dn-review-field label { font-size:.68rem; color:var(--text-light); text-transform:uppercase; letter-spacing:.1em; font-weight:700; }
.dn-review-field input,.dn-review-field textarea { background:var(--white); border:1.5px solid var(--border-mid); color:var(--text-dark); padding:.75rem 1rem; font-family:'DM Sans',sans-serif; font-size:.88rem; border-radius:8px; outline:none; transition:border-color .2s; resize:vertical; }
.dn-review-field input:focus,.dn-review-field textarea:focus { border-color:var(--primary); }
.dn-review-submit-btn { width:100%; padding:1rem; background:linear-gradient(135deg,var(--primary),var(--primary-dark)); color:#fff; border:none; border-radius:10px; font-family:'DM Sans',sans-serif; font-size:.95rem; font-weight:700; cursor:pointer; transition:opacity .2s,transform .15s; letter-spacing:.04em; }
.dn-review-submit-btn:disabled { opacity:.55; cursor:not-allowed; }
.dn-review-submit-btn:not(:disabled):hover { transform:translateY(-2px); box-shadow:0 8px 24px var(--primary-muted); }
.dn-review-success { text-align:center; padding:2.5rem 1rem; }
@media(max-width:600px){ .dn-review-form-row{grid-template-columns:1fr;} .dn-write-review-card{padding:1.5rem;} .dn-write-review{padding:3rem 1.2rem;} }

.dn-order { padding:3rem max(1.5rem,calc((100vw - 1280px)/2)) 4rem; background:var(--off-white); border-top:1px solid var(--border-light); }
.dn-order-title { font-family:'Fraunces',serif; font-size:clamp(1.4rem,2.2vw,2.2rem); font-weight:900; color:var(--text-dark); line-height:1.1; margin-bottom:.5rem; }
.dn-order-title em { color:var(--primary); font-style:italic; }
.dn-order-desc { font-size:.82rem; color:var(--text-mid); line-height:1.7; margin-bottom:.8rem; }
.dn-include-item { display:flex; align-items:center; gap:.8rem; font-size:.82rem; color:var(--text-mid); padding:.6rem 0; border-bottom:1px solid var(--primary-muted); }
.dn-check { color:var(--success); font-size:.82rem; font-weight:700; }

/* ── Order header strip ── */
.dn-order-header { text-align:center; margin-bottom:2rem; }
.dn-order-header-info { display:inline-block; }
.dn-order-perk-chips { display:flex; flex-wrap:wrap; gap:.4rem; justify-content:center; margin-top:.8rem; }
.dn-order-perk-chip { display:inline-flex; align-items:center; gap:.3rem; background:var(--white); border:1px solid var(--border-mid); border-radius:20px; padding:.22rem .65rem; font-size:.63rem; color:var(--text-mid); }

/* ── Big product cards ── */
.dn-products-big-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1.2rem; }

.dn-big-card { background:var(--white); border:1.5px solid var(--border-mid); border-radius:16px; padding:1.6rem 1.5rem; display:flex; flex-direction:column; gap:.55rem; position:relative; overflow:hidden; transition:transform .3s,box-shadow .3s,border-color .3s; }
.dn-big-card:hover { transform:translateY(-5px); box-shadow:0 16px 48px var(--primary-muted); border-color:var(--primary); }
.dn-big-card.featured { border-color:var(--primary); background:linear-gradient(160deg,#fff 50%,var(--primary-pale)); }
.dn-big-card-ribbon { position:absolute; top:0; right:0; background:var(--primary); color:#fff; font-size:.52rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase; padding:.28rem .8rem; border-radius:0 16px 0 10px; }
.dn-big-card-icon { font-size:2.2rem; }
.dn-big-card-name { font-family:'Fraunces',serif; font-size:1.15rem; font-weight:900; color:var(--text-dark); line-height:1.1; }
.dn-big-card-sub { font-size:.67rem; color:var(--text-light); }
.dn-big-card-price { font-family:'Fraunces',serif; font-size:2rem; font-weight:900; color:var(--primary); line-height:1; margin:.1rem 0; }
.dn-big-card-price-note { font-size:.6rem; color:var(--text-light); }
.dn-big-card-divider { height:1px; background:var(--border-light); margin:.2rem 0; }
.dn-big-card-perks { display:flex; flex-direction:column; gap:.38rem; flex:1; }
.dn-big-card-perk { display:flex; align-items:center; gap:.45rem; font-size:.73rem; color:var(--text-mid); }
.dn-big-card-perk-check { color:var(--success); flex-shrink:0; }
.dn-big-card-btn { margin-top:.7rem; width:100%; background:var(--primary); color:#fff; border:none; padding:.75rem; font-family:'DM Sans',sans-serif; font-size:.78rem; font-weight:700; letter-spacing:.08em; text-transform:uppercase; border-radius:8px; transition:background .2s; }
.dn-big-card-btn:hover { background:var(--primary-dark); }
.dn-big-card.featured .dn-big-card-btn { box-shadow:0 6px 20px var(--primary-muted); }

@media(max-width:960px){ .dn-products-big-grid{grid-template-columns:1fr 1fr;} .dn-order-header{flex-direction:column;gap:1rem;} }
@media(max-width:640px){ .dn-products-big-grid{grid-template-columns:1fr;} .dn-order{padding:2rem 1.2rem;} }
.dn-form-card { background:var(--white); border:1px solid var(--primary-muted); padding:2.5rem; box-shadow:var(--shadow-soft); border-radius:12px; }
.dn-form-title { font-family:'Fraunces',serif; font-size:1.4rem; color:var(--text-dark); margin-bottom:1.8rem; font-weight:700; }
.dn-field { margin-bottom:1.1rem; }
.dn-field label { display:block; font-size:.68rem; letter-spacing:.15em; text-transform:uppercase; color:var(--text-light); margin-bottom:.5rem; font-weight:700; }
.dn-field input, .dn-field select { width:100%; background:var(--off-white); border:1.5px solid var(--border-mid); color:var(--text-dark); padding:.75rem 1rem; font-family:'DM Sans',sans-serif; font-size:.86rem; outline:none; transition:border-color .3s,box-shadow .3s; border-radius:8px; }
.dn-field input:focus, .dn-field select:focus { border-color:var(--primary); box-shadow:0 0 0 3px var(--primary-muted); }
.dn-field input::placeholder { color:var(--text-light); }
.dn-field input.error { border-color:var(--danger); }
.dn-field-row { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
.dn-qty-selector { display:flex; align-items:center; }
.dn-qty-btn { background:var(--light-gray); border:1px solid var(--border-mid); color:var(--text-dark); width:40px; height:44px; font-size:1.2rem; display:flex; align-items:center; justify-content:center; transition:background .2s; }
.dn-qty-btn:hover { background:var(--primary-muted); color:var(--primary); }
.dn-qty-val { background:var(--off-white); border:1px solid var(--border-mid); border-left:none; border-right:none; color:var(--text-dark); width:50px; height:44px; text-align:center; font-size:.95rem; font-family:'DM Sans',sans-serif; display:flex; align-items:center; justify-content:center; }
.dn-pack-select { display:grid; grid-template-columns:1fr 1fr; gap:.8rem; margin-bottom:1.2rem; }
.dn-pack-option { border:1.5px solid var(--border-mid); border-radius:4px; padding:.9rem; cursor:pointer; transition:all .2s; background:var(--off-white); text-align:center; }
.dn-pack-option:hover { border-color:var(--primary); background:var(--primary-muted); }
.dn-pack-option.selected { border-color:var(--primary); background:var(--primary-muted); box-shadow:0 0 0 3px var(--primary-muted); }
.dn-pack-option-name { font-size:.75rem; font-weight:700; color:var(--text-dark); margin-bottom:.2rem; }
.dn-pack-option-detail { font-size:.65rem; color:var(--text-mid); }
.dn-pack-option-price { font-family:'Fraunces',serif; font-size:1.1rem; color:var(--primary); font-weight:900; margin-top:.3rem; }
.dn-pack-option-badge { display:inline-block; background:var(--primary); color:#fff; font-size:.55rem; font-weight:700; letter-spacing:.08em; padding:.15rem .4rem; border-radius:3px; text-transform:uppercase; margin-top:.3rem; }
.dn-order-total { display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-mid); padding-top:1.2rem; margin-top:1.2rem; }
.dn-total-label { font-size:.73rem; letter-spacing:.12em; text-transform:uppercase; color:var(--text-light); font-weight:700; }
.dn-total-price { font-family:'Fraunces',serif; font-size:1.8rem; color:var(--primary); font-weight:900; }
.dn-submit-btn { width:100%; margin-top:1.5rem; background:var(--primary); color:#fff; border:none; padding:1.1rem; font-family:'DM Sans',sans-serif; font-size:.88rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase; border-radius:4px; transition:background .2s; }
.dn-submit-btn:hover { background:var(--primary-dark); }
.dn-trust-badges { display:flex; gap:1.5rem; margin-top:1.1rem; justify-content:center; flex-wrap:wrap; }
.dn-trust-b { font-size:.66rem; color:var(--text-light); }
.dn-trust-b span { color:var(--success); margin-right:.2rem; }
 

.dn-shipping-box { background:color-mix(in srgb,var(--success) 6%,transparent); border:1px solid color-mix(in srgb,var(--success) 25%,transparent); border-radius:8px; padding:.9rem 1.1rem; margin-bottom:1rem; }
.dn-shipping-loading { font-size:.78rem; color:var(--text-light); display:flex; align-items:center; gap:.5rem; }
.dn-shipping-loading::before { content:''; display:inline-block; width:12px; height:12px; border:2px solid color-mix(in srgb,var(--success) 30%,transparent); border-top-color:var(--success); border-radius:50%; animation:spin .7s linear infinite; }
.dn-shipping-result { display:flex; justify-content:space-between; align-items:center; }
.dn-shipping-name   { font-size:.78rem; color:var(--text-mid); }
.dn-shipping-charge { font-size:.9rem; font-weight:700; color:var(--success); }
.dn-shipping-eta    { font-size:.68rem; color:var(--text-light); margin-top:.2rem; }
.dn-shipping-free   { font-size:.78rem; color:var(--success); font-weight:700; }
 
@media(max-width:960px){ .dn-order{grid-template-columns:1fr;gap:2.5rem;padding:4rem 1.5rem;} }
@media(max-width:480px){ .dn-order{padding:3rem 1.2rem;} .dn-field-row{grid-template-columns:1fr;} }
 

.dn-footer { border-top:1px solid var(--border-light); padding:2rem max(1.5rem,calc((100vw - 1280px)/2 + 1.5rem)); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; background:var(--white); }
.dn-footer-logo { font-family:'Fraunces',serif; font-size:1.1rem; letter-spacing:.08em; font-weight:900; color:var(--primary); }
.dn-footer-copy { font-size:.71rem; color:var(--text-light); }
.dn-footer-links { display:flex; gap:2rem; }
.dn-footer-links a { font-size:.71rem; color:var(--text-light); text-decoration:none; transition:color .3s; }
.dn-footer-links a:hover { color:var(--primary); }
@media(max-width:600px){ .dn-footer{flex-direction:column;text-align:center;padding:1.8rem 1.5rem;gap:.8rem;} }
@media(max-width:480px){ .dn-footer{padding:1.5rem 1.2rem;} .dn-footer-links{gap:1.2rem;} }
 

.dn-toast { position:fixed; bottom:2rem; left:50%; transform:translateX(-50%) translateY(100px); background:var(--secondary); color:#fff; padding:.9rem 1.8rem; font-weight:600; font-size:.84rem; z-index:9999; transition:transform .35s ease; white-space:nowrap; border-radius:4px; box-shadow:var(--shadow-hover); }
.dn-toast.show { transform:translateX(-50%) translateY(0); }
 

.dn-video-modal { position:fixed; inset:0; z-index:9999; display:flex; align-items:center; justify-content:center; }
.dn-video-backdrop { position:absolute; inset:0; background:rgba(0,0,0,.75); backdrop-filter:blur(12px); animation:fadeIn .4s ease; }
.dn-video-container { position:relative; width:80%; max-width:900px; aspect-ratio:16/9; background:#000; border-radius:8px; overflow:hidden; z-index:2; transform:scale(0.9); animation:zoomIn .4s ease forwards; }
.dn-video-close { position:absolute; top:10px; right:14px; background:rgba(0,0,0,.6); border:none; color:#fff; font-size:1.2rem; padding:6px 10px; cursor:pointer; z-index:10; border-radius:4px; }
 
/* ══════════════════════════════════════════════════════════════
   CART
   ══════════════════════════════════════════════════════════════ */
.dn-cart-btn { position:relative; background:none; border:2px solid var(--primary); color:var(--primary); padding:.5rem 1rem; border-radius:20px; font-family:'DM Sans',sans-serif; font-size:.78rem; font-weight:700; letter-spacing:.08em; text-transform:uppercase; transition:all .3s; display:flex; align-items:center; gap:.5rem; }
.dn-cart-btn:hover { background:var(--primary-muted); }
.dn-cart-badge { background:var(--primary); color:#fff; border-radius:50%; width:18px; height:18px; font-size:.6rem; font-weight:700; display:flex; align-items:center; justify-content:center; }
.dn-cart-overlay { position:fixed; inset:0; background:rgba(0,0,0,.45); z-index:200; opacity:0; pointer-events:none; transition:opacity .35s; backdrop-filter:blur(4px); }
.dn-cart-overlay.open { opacity:1; pointer-events:all; }
.dn-cart-drawer { position:fixed; top:0; right:0; height:100%; width:min(400px,100vw); background:var(--white); z-index:201; display:flex; flex-direction:column; transform:translateX(100%); transition:transform .4s cubic-bezier(.77,0,.18,1); box-shadow:-4px 0 24px rgba(0,0,0,.1); }
.dn-cart-drawer.open { transform:translateX(0); }
.dn-cart-head { display:flex; justify-content:space-between; align-items:center; padding:1.4rem 1.6rem; border-bottom:1px solid var(--border-light); }
.dn-cart-title { font-family:'Fraunces',serif; font-size:1.2rem; color:var(--text-dark); font-weight:900; }
.dn-cart-close { background:none; border:none; font-size:1.2rem; color:var(--text-mid); padding:.2rem .5rem; border-radius:2px; transition:all .2s; }
.dn-cart-body { flex:1; overflow-y:auto; padding:1.2rem 1.6rem; }
.dn-cart-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; gap:1rem; color:var(--text-light); }
.dn-cart-empty-icon { font-size:3rem; opacity:.4; }
.dn-cart-empty-text { font-size:.85rem; }
.dn-cart-item { display:grid; grid-template-columns:auto 1fr auto; gap:1rem; align-items:center; padding:1rem 0; border-bottom:1px solid var(--border-mid); }
.dn-cart-item-icon { width:48px; height:48px; background:var(--primary-muted); border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:1.4rem; }
.dn-cart-item-name  { font-size:.86rem; font-weight:600; color:var(--text-dark); margin-bottom:.2rem; }
.dn-cart-item-price { font-size:.78rem; color:var(--primary); font-weight:700; }
.dn-cart-item-actions { display:flex; align-items:center; gap:.4rem; }
.dn-cart-qty-btn { background:var(--light-gray); border:1px solid var(--border-mid); color:var(--text-dark); width:28px; height:28px; font-size:.9rem; display:flex; align-items:center; justify-content:center; border-radius:2px; transition:background .2s; }
.dn-cart-qty-btn:hover { background:var(--primary-muted); color:var(--primary); }
.dn-cart-qty-val { width:24px; text-align:center; font-size:.85rem; font-weight:700; color:var(--text-dark); }
.dn-cart-remove { background:none; border:none; color:var(--text-light); font-size:.85rem; padding:.2rem; margin-left:.2rem; transition:color .2s; }
.dn-cart-remove:hover { color:var(--danger); }
.dn-cart-foot { padding:1.4rem 1.6rem; border-top:1px solid var(--border-mid); background:var(--off-white); }
.dn-cart-subtotal { display:flex; justify-content:space-between; margin-bottom:.5rem; }
.dn-cart-subtotal-label { font-size:.78rem; text-transform:uppercase; letter-spacing:.1em; color:var(--text-light); font-weight:700; }
.dn-cart-subtotal-val { font-family:'Fraunces',serif; font-size:1.3rem; color:var(--primary); font-weight:900; }
.dn-cart-total-row { display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-mid); padding-top:.8rem; margin-bottom:1rem; }
.dn-cart-total-label { font-size:.8rem; font-weight:700; color:var(--text-dark); text-transform:uppercase; letter-spacing:.08em; }
.dn-cart-total-val { font-family:'Fraunces',serif; font-size:1.5rem; color:var(--primary); font-weight:900; }
.dn-cart-checkout-btn { width:100%; background:var(--primary); color:#fff; border:none; padding:1rem; font-family:'DM Sans',sans-serif; font-size:.88rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase; border-radius:4px; transition:background .2s; }
.dn-cart-checkout-btn:hover { background:var(--primary-dark); }
.dn-add-cart-btn { margin-top:.8rem; width:100%; background:transparent; border:1.5px solid var(--primary); color:var(--primary); padding:.55rem 1rem; font-family:'DM Sans',sans-serif; font-size:.75rem; font-weight:700; letter-spacing:.08em; text-transform:uppercase; border-radius:4px; transition:all .2s; }
.dn-add-cart-btn:hover { background:var(--primary); color:#fff; }
 
/* ══════════════════════════════════════════════════════════════
   PAYMENT MODAL
   ══════════════════════════════════════════════════════════════ */
.dn-pay-overlay { position:fixed; inset:0; z-index:500; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,.7); backdrop-filter:blur(10px); animation:fadeIn .3s ease; }
.dn-pay-modal { background:var(--white); width:100%; max-width:520px; max-height:92vh; overflow-y:auto; border-radius:4px; box-shadow:var(--shadow-hover); animation:zoomIn .35s cubic-bezier(.34,1.56,.64,1); position:relative; }
.dn-pay-header { background:var(--secondary); padding:1.8rem 2rem 1.5rem; display:flex; justify-content:space-between; align-items:flex-start; }
.dn-pay-header-left { color:#fff; }
.dn-pay-secure-tag { display:inline-flex; align-items:center; gap:.4rem; font-size:.6rem; letter-spacing:.2em; text-transform:uppercase; color:rgba(255,255,255,.65); font-weight:600; margin-bottom:.5rem; }
.dn-pay-secure-tag::before { content:'🔒'; font-size:.7rem; }
.dn-pay-modal-title { font-family:'Fraunces',serif; font-size:1.5rem; font-weight:900; color:#fff; line-height:1.1; }
.dn-pay-close { background:rgba(255,255,255,.15); border:none; color:#fff; width:32px; height:32px; border-radius:50%; font-size:1rem; display:flex; align-items:center; justify-content:center; transition:background .2s; }
.dn-pay-close:hover { background:rgba(255,255,255,.3); }
.dn-pay-body { padding:2rem; }
.dn-pay-order-summary { background:var(--primary-muted); border:1px solid var(--primary-muted); border-radius:8px; padding:1rem 1.2rem; margin-bottom:1.8rem; }
.dn-pay-summary-label { font-size:.62rem; letter-spacing:.2em; text-transform:uppercase; color:var(--primary); font-weight:700; margin-bottom:.8rem; }
.dn-pay-summary-row { display:flex; justify-content:space-between; align-items:center; font-size:.82rem; color:var(--text-mid); padding:.3rem 0; }
.dn-pay-summary-row.total { border-top:1px solid var(--border-mid); margin-top:.5rem; padding-top:.8rem; }
.dn-pay-summary-row.total span:first-child { font-weight:600; color:var(--text-dark); font-size:.85rem; }
.dn-pay-summary-row.total span:last-child { font-family:'Fraunces',serif; font-size:1.2rem; color:var(--primary); font-weight:900; }
.dn-pay-section-label { font-size:.62rem; letter-spacing:.2em; text-transform:uppercase; color:var(--text-light); font-weight:600; margin-bottom:1rem; display:flex; align-items:center; gap:.5rem; }
.dn-pay-section-label::after { content:''; flex:1; height:1px; background:var(--border-mid); }
.dn-pay-pincode-row { display:flex; gap:.6rem; margin-bottom:1.4rem; }
.dn-pay-pincode-row input { flex:1; background:var(--off-white); border:1.5px solid var(--border-mid); color:var(--text-dark); padding:.75rem 1rem; font-family:'DM Sans',sans-serif; font-size:.9rem; outline:none; transition:border-color .3s; border-radius:8px; }
.dn-pay-pincode-row input:focus { border-color:var(--primary); box-shadow:0 0 0 3px var(--primary-muted); }
.dn-pay-pincode-check { background:var(--primary); color:#fff; border:none; padding:.75rem 1.1rem; font-family:'DM Sans',sans-serif; font-size:.75rem; font-weight:700; letter-spacing:.08em; text-transform:uppercase; border-radius:4px; white-space:nowrap; transition:background .2s; }
.dn-pay-pincode-check:hover { opacity:.9; }
.dn-pay-pincode-check:disabled { opacity:.5; cursor:not-allowed; }
.dn-shipping-info-box { background:color-mix(in srgb,var(--success) 7%,transparent); border:1px solid color-mix(in srgb,var(--success) 30%,transparent); border-radius:8px; padding:.8rem 1rem; margin-bottom:1.2rem; }
.dn-shipping-info-row { display:flex; justify-content:space-between; align-items:center; font-size:.8rem; }
.dn-shipping-info-courier { color:var(--text-mid); }
.dn-shipping-info-price { font-weight:700; color:var(--success); }
.dn-shipping-info-eta { font-size:.7rem; color:var(--text-light); margin-top:.3rem; }
.dn-pay-field { margin-bottom:1.1rem; }
.dn-pay-field label { display:block; font-size:.62rem; letter-spacing:.15em; text-transform:uppercase; color:var(--text-light); margin-bottom:.45rem; font-weight:600; }
.dn-pay-field input { width:100%; background:var(--off-white); border:1.5px solid var(--border-mid); color:var(--text-dark); padding:.75rem 1rem; font-family:'DM Sans',sans-serif; font-size:.9rem; outline:none; transition:border-color .3s,box-shadow .3s; border-radius:8px; }
.dn-pay-field input:focus { border-color:var(--primary); box-shadow:0 0 0 3px var(--primary-muted); }
.dn-pay-field input::placeholder { color:var(--text-light); }
.dn-pay-field-row { display:grid; grid-template-columns:1fr 1fr; gap:.8rem; }
.dn-razorpay-btn { width:100%; background:linear-gradient(135deg,#072654 0%,#0A3875 50%,#1A5EB8 100%); color:#fff; border:none; padding:1.1rem; font-family:'DM Sans',sans-serif; font-size:.9rem; font-weight:700; letter-spacing:.12em; text-transform:uppercase; border-radius:30px; margin-top:1.5rem; transition:all .3s; box-shadow:0 8px 28px rgba(7,38,84,0.4); display:flex; align-items:center; justify-content:center; gap:.7rem; }
.dn-razorpay-btn:hover { transform:translateY(-2px); box-shadow:0 16px 40px rgba(7,38,84,.5); }
.dn-razorpay-btn:disabled { opacity:.6; cursor:not-allowed; transform:none; }
.dn-razorpay-logo { font-size:.7rem; background:rgba(255,255,255,.15); padding:.2rem .5rem; border-radius:4px; letter-spacing:.05em; }
.dn-pay-footer-badges { display:flex; justify-content:center; gap:1.5rem; margin-top:1rem; flex-wrap:wrap; }
.dn-pay-badge { font-size:.62rem; color:var(--text-light); display:flex; align-items:center; gap:.3rem; }
.dn-pay-success { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:3.5rem 2rem; text-align:center; min-height:360px; }
.dn-pay-success-icon { width:72px; height:72px; border-radius:50%; background:#22c55e; display:flex; align-items:center; justify-content:center; font-size:2rem; margin-bottom:1.5rem; animation:pop .5s cubic-bezier(.34,1.56,.64,1); }
.dn-pay-success-title { font-family:'Fraunces',serif; font-size:1.8rem; font-weight:900; color:var(--text-dark); margin-bottom:.7rem; }
.dn-pay-success-sub { font-size:.88rem; color:var(--text-mid); line-height:1.7; max-width:320px; }
.dn-pay-success-ref { background:var(--primary-muted); border:1px solid var(--primary-muted); border-radius:8px; padding:.7rem 1.2rem; margin:1.5rem 0; font-size:.78rem; color:var(--primary); font-weight:700; letter-spacing:.08em; }
.dn-pay-success-awb { background:color-mix(in srgb,var(--success) 8%,transparent); border:1px solid color-mix(in srgb,var(--success) 20%,transparent); border-radius:8px; padding:.7rem 1.2rem; margin-bottom:1.5rem; font-size:.78rem; color:var(--success); font-weight:700; }
.dn-pay-done-btn { background:var(--primary); color:#fff; border:none; padding:.9rem 2.5rem; font-family:'DM Sans',sans-serif; font-size:.82rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase; border-radius:4px; transition:background .2s; }
.dn-pay-done-btn:hover { background:var(--primary-dark); }
 
/* ══════════════════════════════════════════════════════════════
   TRACKING
   ══════════════════════════════════════════════════════════════ */
.dn-tracking-section { padding:.8rem max(1.5rem,calc((100vw - 1280px)/2)); background:var(--off-white); border-top:1px solid var(--border-light); }
.dn-tracking-card { background:var(--white); border:1px solid var(--border-light); border-radius:8px; padding:.7rem 1.1rem; max-width:680px; margin:0 auto; box-shadow:var(--shadow-soft); }
.dn-tracking-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:.6rem; flex-wrap:wrap; gap:.5rem; }
.dn-tracking-order-id { font-size:.62rem; color:var(--text-light); text-transform:uppercase; letter-spacing:.12em; margin-bottom:.15rem; }
.dn-tracking-awb { font-family:'Fraunces',serif; font-size:1rem; font-weight:700; color:var(--text-dark); }
.dn-tracking-status-badge { background:color-mix(in srgb,var(--success) 12%,transparent); border:1px solid color-mix(in srgb,var(--success) 30%,transparent); color:var(--success); font-size:.62rem; font-weight:700; letter-spacing:.08em; text-transform:uppercase; padding:.25rem .7rem; border-radius:20px; }
.dn-tracking-progress { display:flex; align-items:center; margin-bottom:.7rem; }
.dn-track-step { display:flex; flex-direction:column; align-items:center; flex:1; }
.dn-track-step-dot { width:20px; height:20px; border-radius:50%; border:2px solid var(--border-mid); background:var(--white); display:flex; align-items:center; justify-content:center; font-size:.58rem; color:var(--text-light); transition:all .3s; margin-bottom:.25rem; }
.dn-track-step.done   .dn-track-step-dot { background:var(--success); border-color:var(--success); color:#fff; }
.dn-track-step.active .dn-track-step-dot { background:var(--primary); border-color:var(--primary); color:#fff; }
.dn-track-step-label { font-size:.52rem; color:var(--text-light); text-transform:uppercase; letter-spacing:.06em; text-align:center; }
.dn-track-step.done .dn-track-step-label, .dn-track-step.active .dn-track-step-label { color:var(--text-dark); font-weight:600; }
.dn-track-line { flex:1; height:1px; background:var(--border-mid); margin-top:-.85rem; transition:background .3s; }
.dn-track-line.done { background:linear-gradient(90deg,var(--success),#0EA5E9); }
.dn-tracking-events { margin-top:.6rem; }
.dn-tracking-event { display:flex; gap:.7rem; padding:.5rem 0; border-bottom:1px solid var(--border-mid); }
.dn-tracking-event:last-child { border-bottom:none; }
.dn-event-dot { width:7px; height:7px; border-radius:50%; background:var(--primary); flex-shrink:0; margin-top:.25rem; }
.dn-event-dot.old { background:var(--border-mid); }
.dn-event-text { font-size:.76rem; color:var(--text-dark); margin-bottom:.1rem; }
.dn-event-time { font-size:.62rem; color:var(--text-light); }
.dn-tracking-lookup { display:flex; gap:.6rem; margin-bottom:.7rem; }
.dn-tracking-lookup input { flex:1; background:var(--off-white); border:1.5px solid var(--border-mid); color:var(--text-dark); padding:.5rem .8rem; font-family:'DM Sans',sans-serif; font-size:.82rem; outline:none; border-radius:6px; transition:border-color .3s; }
.dn-tracking-lookup input:focus { border-color:var(--primary); box-shadow:0 0 0 2px var(--primary-muted); }
.dn-tracking-lookup button { background:var(--primary); color:#fff; border:none; padding:.5rem 1.1rem; font-family:'DM Sans',sans-serif; font-size:.75rem; font-weight:700; border-radius:4px; transition:background .2s; white-space:nowrap; }
.dn-tracking-lookup button:hover { background:var(--primary-dark); }

@media(max-width:768px){
  .dn-tracking-section { padding:.8rem 1.2rem; }
  .dn-tracking-card { padding:.6rem 1rem; }
  .dn-tracking-lookup { flex-direction:column; }
  .dn-tracking-lookup button { width:100%; }
  .dn-track-step-label { font-size:.46rem; }
}
@media(max-width:540px){
  .dn-pay-overlay { align-items:flex-end; }
  .dn-pay-modal { max-width:100%; max-height:96vh; border-radius:8px 8px 0 0; margin:0; }
  .dn-pay-field-row { grid-template-columns:1fr; }
  .dn-pay-body { padding:1.2rem; }
  .dn-tracking-section { padding:.7rem 1rem; }
}

/* ── Product Cards ── */
.dn-product-card {
  background:var(--white); border:1.5px solid var(--border-mid); border-radius:8px;
  padding:1.2rem 1.4rem; box-shadow:var(--shadow-soft);
  display:flex; align-items:center; gap:1.2rem;
  transition:border-color .2s,box-shadow .2s;
}
.dn-product-card:hover { border-color:var(--primary); box-shadow:var(--shadow-hover); }
.dn-product-icon {
  width:50px; height:50px; flex-shrink:0; background:var(--off-white);
  border:1px solid var(--border-light); border-radius:8px;
  display:flex; align-items:center; justify-content:center; font-size:1.5rem;
}
.dn-product-info { flex:1; min-width:0; }
.dn-product-name { font-weight:700; font-size:.9rem; color:var(--text-dark); }
.dn-product-badge {
  background:var(--primary); color:#fff; font-size:.5rem; font-weight:700;
  letter-spacing:.08em; padding:.15rem .45rem; border-radius:3px; text-transform:uppercase;
  vertical-align:middle; margin-left:.4rem;
}
.dn-product-sub { font-size:.72rem; color:var(--text-light); margin:.2rem 0 .4rem; }
.dn-product-perks { display:flex; gap:.6rem; flex-wrap:wrap; }
.dn-product-perk { font-size:.65rem; color:var(--text-mid); }
.dn-product-action { text-align:right; flex-shrink:0; }
.dn-product-price {
  font-family:'Fraunces',serif; font-size:1.3rem; font-weight:900;
  color:var(--primary); margin-bottom:.5rem; white-space:nowrap;
}
@media(max-width:600px){
  .dn-product-card { flex-direction:column; align-items:flex-start; gap:.8rem; }
  .dn-product-action { width:100%; display:flex; justify-content:space-between; align-items:center; }
  .dn-product-price { margin-bottom:0; }
}
@media(max-width:480px){
  .dn-product-card { padding:1rem 1.1rem; }
  .dn-product-action .dn-btn-primary { width:auto; font-size:.72rem; padding:.5rem .9rem; }
}
`;

/* ─── CONSTANTS ────────────────────────────────────────────────── */
const SINGLE_PRICE    = 599;
const FAMILY_PACK_PRICE = 5990;
const KID_PRICE         = 399;   
// const RAZORPAY_KEY_ID = "rzp_test_SlG1HvlDp3i5Fw"; // ← replace with your key

const FEATURES = [
  { num:"01", icon:"🦷", title:"Nano Bristle Technology", text:"10,000 micro-filaments per cm² with varying stiffness — hard on plaque, gentle on enamel and gums." },
  { num:"02", icon:"✋", title:"Ergonomic Red Grip", text:"Dual-material TPE inlay provides non-slip control and reduces wrist strain during the full two-minute brush." },
  { num:"03", icon:"🔬", title:"Anti-Bacterial Materials", text:"Medical-grade polypropylene inhibits bacteria build-up between bristle tufts, keeping each brush hygienic longer." },
  { num:"04", icon:"💧", title:"Easy-Rinse Design", text:"Open bristle cluster spacing allows water to flow through freely, washing away toothpaste and debris completely." },
];
const PATIENT_CONDITIONS = [
  { icon:'❤️', group:'Heart Patients',  color:'#E8294A', colorBg:'rgba(232,41,74,.14)', colorBadge:'rgba(232,41,74,.22)', colorText:'#FF8099',
    title:'Safe for blood thinners & anticoagulants',
    text:'Ultra-soft nano bristles apply zero shear force on gum tissue — eliminating bleeding risk for patients on warfarin, aspirin, or post-cardiac surgery medication.' },
  { icon:'🫘', group:'Renal Patients',   color:'#3B82F6', colorBg:'rgba(59,130,246,.14)', colorBadge:'rgba(59,130,246,.22)', colorText:'#93C5FD',
    title:'Reduces systemic bacterial load',
    text:'Anti-bacterial medical-grade PP suppresses oral pathogens at source — critical for kidney disease and dialysis patients where oral bacteria directly raise systemic infection risk.' },
  { icon:'😁', group:'Braces Wearers',  color:'#A855F7', colorBg:'rgba(168,85,247,.14)', colorBadge:'rgba(168,85,247,.22)', colorText:'#D8B4FE',
    title:'Cleans around brackets & wires',
    text:'10,000 micro-filaments per cm² reach into the tight gaps between brackets and under arch-wires, preventing the demineralisation that causes white spots.' },
];

const REVIEWS = [
  { text:"The red grip is so comfortable — I never feel like I'm pressing too hard. My dentist noticed my gums are healthier after just 2 months.", author:"Arjun M.", city:"Mumbai" },
  { text:"My dentist actually noticed a difference at my last checkup. Less plaque, healthier gums. She asked what I'd changed — I showed her DENTALL.", author:"Priya S.", city:"Bangalore" },
  { text:"The bristles are incredibly soft yet my teeth feel polished clean. It's the only toothbrush I've used that doesn't leave my gums sore.", author:"Riya K.", city:"Chennai" },
  { text:"We got the family pack for all four of us. The schedule is genius — every 4 months we simply swap and we've never missed a replacement since.", author:"Vikram T.", city:"Pune" },
  { text:"Worth every rupee. My kids actually look forward to brushing now. The red design is fun and the bristles are gentle enough for them.", author:"Sunita R.", city:"Delhi" },
  { text:"Switched from an electric brush and honestly the clean feels just as thorough. The ergonomic handle makes all the difference.", author:"Karthik N.", city:"Hyderabad" },
];

const PRODUCTS = [
  {
    id:    'single-brush',
    icon:  '🪥',
    name:  'Single Brush',
    sub:   '1 brush · lasts 4 months',
    price: SINGLE_PRICE,
    badge: null,
    perks: ['Nano bristle head', 'Ergonomic grip', 'Anti-bacterial PP'],
  },
  {
    id:    'family-pack',
    icon:  '🦷',
    name:  'Family Pack',
    sub:   '12 brushes · 1 year · 4 people',
    price: FAMILY_PACK_PRICE,
    badge: 'Best Value',
    perks: ['Covers a family of 4', 'Change every 4 months', 'Free shipping'],
  },
  {
    id:    'kids-brush',
    icon:  '🌈',
    name:  "Kids' Brush",
    sub:   '1 brush · ultra-soft · ages 3–12',
    price: KID_PRICE,
    badge: 'New',
    perks: ['Extra-soft bristles', 'Compact head', 'Fun grip colours'],
  },
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
//         color: "var(--primary)"
//       }
//     };

//     const rzp = new window.Razorpay(options);
//     rzp.open();

//   } catch (err) {
//     console.error(err);
//     alert("Payment failed to initialize");
//   }
// };

//   return (
//     <section className="dn-tracking-section" id="tracking">
//       <div style={{textAlign:'center',fontSize:'.58rem',letterSpacing:'.28em',textTransform:'uppercase',color:'var(--primary)',fontWeight:700,marginBottom:'.3rem'}}>Track your order</div>
//       <div style={{textAlign:'center',fontFamily:'Fraunces,serif',fontSize:'1.1rem',fontWeight:900,color:'var(--text-dark)',marginBottom:'.7rem'}}>Where's my package?</div>

//       <div className="dn-tracking-card">
//         <div className="dn-tracking-lookup">
//           <input
//             value={orderId}
//             onChange={e => setOrderId(e.target.value)}
//             placeholder="Enter your order ID (e.g. 42)"
//             onKeyDown={e => e.key === 'Enter' && fetchTracking(orderId)}
//           />
//           <button onClick={() => fetchTracking(orderId)} disabled={loading || !orderId}>
//             {loading ? 'Loading…' : 'Track →'}
//           </button>
//         </div>

//         {error && (
//           <div style={{color:'var(--primary-dark)',fontSize:'.82rem',marginBottom:'1rem',padding:'.8rem',background:'rgba(255,61,87,.06)',borderRadius:'8px',border:'1px solid rgba(255,61,87,.2)'}}>
//             ⚠ {error}
//           </div>
//         )}

//         {trackData && (
//           <>
//             <div className="dn-tracking-header">
//               <div>
//                 <div className="dn-tracking-order-id">Order #{trackData.order_id || orderId}</div>
//                 <div className="dn-tracking-awb">AWB: {trackData.awb_code || '—'}</div>
//               </div>
//               <div className="dn-tracking-status-badge">{currentStatus || 'Processing'}</div>
//             </div>

//             {/* Progress bar */}
//             <div className="dn-tracking-progress">
//               {['Ordered','Picked up','In transit','Out for delivery','Delivered'].map((step, i, arr) => (
//                 <React.Fragment key={step}>
//                   <div className={`dn-track-step ${getStepStatus(step, currentStatus)}`}>
//                     <div className="dn-track-step-dot">{getStepStatus(step, currentStatus) === 'done' ? '✓' : i + 1}</div>
//                     <div className="dn-track-step-label">{step}</div>
//                   </div>
//                   {i < arr.length - 1 && (
//                     <div className={`dn-track-line ${getStepStatus(arr[i+1], currentStatus) !== '' ? 'done' : ''}`} />
//                   )}
//                 </React.Fragment>
//               ))}
//             </div>

//             {/* Estimated delivery */}
//             {trackData.etd && (
//               <div style={{background:'rgba(255,92,0,0.06)',border:'1px solid rgba(255,92,0,.15)',borderRadius:'8px',padding:'.8rem 1rem',marginBottom:'1.5rem',fontSize:'.82rem',color:'var(--text-mid)'}}>
//                 📦 Estimated delivery: <strong style={{color:'var(--primary)'}}>{trackData.etd}</strong>
//               </div>
//             )}

//             {/* Event log */}
//             {trackData.tracking_data?.length > 0 && (
//               <div className="dn-tracking-events">
//                 <div style={{fontSize:'.65rem',letterSpacing:'.2em',textTransform:'uppercase',color:'var(--text-light)',fontWeight:700,marginBottom:'.8rem'}}>Activity</div>
//                 {trackData.tracking_data.map((ev, i) => (
//                   <div key={i} className="dn-tracking-event">
//                     <div className={`dn-event-dot ${i > 0 ? 'old' : ''}`} />
//                     <div>
//                       <div className="dn-event-text">{ev.activity || ev.status}</div>
//                       <div className="dn-event-time">{ev.date} — {ev.location}</div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </>
//         )}

//         {!trackData && !loading && !error && (
//           <div style={{textAlign:'center',padding:'2rem',color:'var(--text-light)',fontSize:'.85rem'}}>
//             Enter your order ID above to see live tracking updates
//           </div>
//         )}
//       </div>
//     </section>
//   );
 }

/* ─── REVIEW FORM SECTION ────────────────────────────────────── */
function ReviewFormSection({ onSubmitSuccess }) {
  const [form, setForm]         = useState({ name: '', email: '', rating: 0, text: '' });
  const [hovered, setHovered]   = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error, setError]       = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.rating === 0) return setError('Please select a star rating.');
    if (!form.text.trim()) return setError('Please write a short review.');
    setSubmitting(true); setError('');
    try {
      const res  = await fetch('/api/reviews', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name: form.name, email: form.email, rating: form.rating, text: form.text }),
      });
      const ct   = res.headers.get('content-type') || '';
      const data = ct.includes('application/json') ? await res.json() : {};
      if (!res.ok) throw new Error(data.error || `Server error (${res.status}) — is the server running?`);
      setSuccess(true);
      onSubmitSuccess?.();
    } catch (err) { setError(err.message); }
    finally { setSubmitting(false); }
  };

  const displayRating = hovered || form.rating;

  return (
    <section className="dn-write-review" id="write-review">
      <div className="dn-write-review-inner">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="dn-section-label">Share your experience</div>
          <div className="dn-section-title" style={{ fontSize: 'clamp(1.3rem,2vw,2rem)' }}>
            Leave a <em>review</em>
          </div>
          <p style={{ color: 'var(--text-light)', fontSize: '.88rem', marginTop: '.5rem' }}>
            Your feedback helps thousands of families make the right choice.
          </p>
        </div>

        <div className="dn-write-review-card">
          {success ? (
            <div className="dn-review-success">
              <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎉</div>
              <div className="dn-section-title" style={{ fontSize: '1.5rem' }}>Thank you!</div>
              <p style={{ color: 'var(--text-light)', fontSize: '.9rem', marginTop: '.6rem', lineHeight: 1.7 }}>
                Your review has been submitted and is awaiting moderation.<br />
                We really appreciate you taking the time!
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '.5rem' }}>
                <div style={{ fontSize: '.68rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 700 }}>
                  Your rating
                </div>
                <div className="dn-star-picker">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      type="button"
                      className={`dn-star-btn${displayRating >= n ? ' lit' : ''}`}
                      onMouseEnter={() => setHovered(n)}
                      onMouseLeave={() => setHovered(0)}
                      onClick={() => set('rating', n)}
                    >★</button>
                  ))}
                </div>
              </div>

              <div className="dn-review-form-row">
                <div className="dn-review-field">
                  <label>Your name</label>
                  <input
                    required
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    placeholder="Priya S."
                    maxLength={100}
                  />
                </div>
                <div className="dn-review-field">
                  <label>Email address</label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                    placeholder="priya@example.com"
                    maxLength={150}
                  />
                </div>
              </div>

              <div className="dn-review-field">
                <label>Your review</label>
                <textarea
                  required
                  rows={4}
                  value={form.text}
                  onChange={e => set('text', e.target.value)}
                  placeholder="What did you love about DENTALL? How has it helped your oral health?"
                  maxLength={1000}
                />
                <div style={{ textAlign: 'right', fontSize: '.68rem', color: 'var(--text-light)' }}>
                  {form.text.length}/1000
                </div>
              </div>

              {error && (
                <div style={{ color: '#e53935', fontSize: '.82rem', marginBottom: '.8rem', padding: '.6rem .9rem', background: 'rgba(229,57,53,.06)', borderRadius: 6 }}>
                  ⚠ {error}
                </div>
              )}

              <button className="dn-review-submit-btn" type="submit" disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit Review →'}
              </button>
              <p style={{ textAlign: 'center', color: 'var(--text-light)', fontSize: '.72rem', marginTop: '.8rem' }}>
                Reviews are moderated before appearing on the site · Your email is never published
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

/* ─── SHIPMENT DETAILS PAGE ───────────────────────────────────── */
function ShipmentPage({ onClose }) {
  const [awbInput, setAwbInput]     = useState('');
  const [orderInput, setOrderInput] = useState('');
  const [data, setData]             = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  useEffect(() => {
    const hash      = window.location.hash;
    const queryPart = hash.includes('?') ? hash.split('?')[1] : '';
    const params    = new URLSearchParams(queryPart);
    const awb       = params.get('awb');
    const order     = params.get('order');
    if (awb)   { setAwbInput(awb);     fetchByAWB(awb); }
    if (order) { setOrderInput(order); fetchByOrder(order); }
  }, []);

  const fetchByOrder = async (id) => {
    if (!id) return;
    setLoading(true); setError(''); setData(null);
    try {
      const res = await fetch(`/api/track/${id}`);
      if (!res.ok) throw new Error('Order not found');
      setData(await res.json());
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const fetchByAWB = async (awb) => {
    if (!awb) return;
    setLoading(true); setError(''); setData(null);
    try {
      const res = await fetch(`/api/shipment/awb/${encodeURIComponent(awb)}`);
      if (!res.ok) throw new Error('Shipment not found');
      setData(await res.json());
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const STATUS_STEPS = ['Ordered', 'Picked up', 'In transit', 'Out for delivery', 'Delivered'];
  const STATUS_MAP   = {
    'PICKUP SCHEDULED': 1, 'PICKUP GENERATED': 1,
    'IN TRANSIT': 2,       'SHIPPED': 2,
    'OUT FOR DELIVERY': 3,
    'DELIVERED': 4,
  };
  const currentStep = STATUS_MAP[(data?.shipment_status || '').toUpperCase()] ?? 0;
  const isDelivered = currentStep === 4;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9000,
      background: 'var(--bg-main)',
      overflowY: 'auto',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary), var(--primary-dark), var(--secondary))',
        padding: '1.5rem 2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 10,
        borderBottom: '2px solid rgba(255,255,255,0.15)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {onClose && (
            <button onClick={onClose} style={{
              background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff',
              width: 36, height: 36, borderRadius: '50%', fontSize: '1rem', cursor: 'pointer',
            }}>←</button>
          )}
          <div>
            <div style={{ fontSize: '.65rem', letterSpacing: '.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,.65)', marginBottom: 2 }}>Dentall</div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: '1.3rem', fontWeight: 900, color: '#fff' }}>Shipment Details</div>
          </div>
        </div>
        <div style={{ fontSize: '1.5rem' }}>📦</div>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Search bar */}
        <div style={{
          background: 'var(--white)', border: '1px solid var(--border-light)',
          borderRadius: 12, padding: '1.5rem', marginBottom: '1.5rem',
          boxShadow: 'var(--shadow-soft)',
        }}>
          <div style={{ fontSize: '.65rem', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--text-light)', fontWeight: 700, marginBottom: '1rem' }}>
            Track your shipment
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '.68rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 700, marginBottom: '.4rem' }}>
                Order ID
              </label>
              <div style={{ display: 'flex', gap: '.5rem' }}>
                <input
                  value={orderInput}
                  onChange={e => setOrderInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 42"
                  onKeyDown={e => e.key === 'Enter' && fetchByOrder(orderInput)}
                  style={{ flex: 1, background: 'var(--off-white)', border: '1.5px solid var(--border-mid)', color: 'var(--text-dark)', padding: '.65rem .9rem', fontFamily: "'DM Sans',sans-serif", fontSize: '.86rem', borderRadius: 8, outline: 'none' }}
                />
                <button
                  onClick={() => fetchByOrder(orderInput)}
                  disabled={loading || !orderInput}
                  style={{ background: 'linear-gradient(135deg,var(--primary),var(--primary-dark))', color: '#fff', border: 'none', padding: '.65rem 1rem', borderRadius: 8, fontFamily: "'DM Sans',sans-serif", fontSize: '.78rem', fontWeight: 700, cursor: 'pointer', opacity: (!orderInput || loading) ? 0.5 : 1 }}>
                  Track
                </button>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '.68rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 700, marginBottom: '.4rem' }}>
                AWB / Tracking No.
              </label>
              <div style={{ display: 'flex', gap: '.5rem' }}>
                <input
                  value={awbInput}
                  onChange={e => setAwbInput(e.target.value)}
                  placeholder="e.g. SR1234567"
                  onKeyDown={e => e.key === 'Enter' && fetchByAWB(awbInput)}
                  style={{ flex: 1, background: 'var(--off-white)', border: '1.5px solid var(--border-mid)', color: 'var(--text-dark)', padding: '.65rem .9rem', fontFamily: "'DM Sans',sans-serif", fontSize: '.86rem', borderRadius: 8, outline: 'none' }}
                />
                <button
                  onClick={() => fetchByAWB(awbInput)}
                  disabled={loading || !awbInput}
                  style={{ background: 'linear-gradient(135deg,var(--primary),var(--primary-dark))', color: '#fff', border: 'none', padding: '.65rem 1rem', borderRadius: 8, fontFamily: "'DM Sans',sans-serif", fontSize: '.78rem', fontWeight: 700, cursor: 'pointer', opacity: (!awbInput || loading) ? 0.5 : 1 }}>
                  Track
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-light)' }}>
            <div style={{ width: 40, height: 40, border: '3px solid var(--border-mid)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 1rem' }} />
            Fetching shipment data from Shiprocket…
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ background: 'rgba(255,61,87,.06)', border: '1px solid rgba(255,61,87,.2)', borderRadius: 8, padding: '1rem 1.2rem', color: 'var(--text-dark)', fontSize: '.85rem', marginBottom: '1rem' }}>
            ⚠ {error}
          </div>
        )}

        {/* Results */}
        {data && !loading && (
          <>
            <div style={{
              background: isDelivered
                ? 'linear-gradient(135deg, rgba(0,212,180,.08), rgba(0,212,180,.03))'
                : 'linear-gradient(135deg, var(--primary-muted), rgba(67,85,99,.04))',
              border: `1px solid ${isDelivered ? 'rgba(0,212,180,.3)' : 'var(--border-mid)'}`,
              borderRadius: 12, padding: '1.5rem', marginBottom: '1rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '.65rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 4 }}>
                    Order #{data.order_id || orderInput}
                  </div>
                  <div style={{ fontFamily: "'Fraunces', serif", fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: 4 }}>
                    AWB: {data.awb_code || '—'}
                  </div>
                  {data.courier_name && (
                    <div style={{ fontSize: '.8rem', color: 'var(--text-mid)' }}>via {data.courier_name}</div>
                  )}
                </div>
                <div style={{
                  background: isDelivered ? 'rgba(0,212,180,.12)' : 'var(--primary-muted)',
                  border: `1px solid ${isDelivered ? 'rgba(0,212,180,.3)' : 'var(--primary-muted)'}`,
                  color: isDelivered ? 'var(--success)' : 'var(--primary-dark)',
                  fontSize: '.72rem', fontWeight: 700, letterSpacing: '.1em',
                  textTransform: 'uppercase', padding: '.45rem 1rem', borderRadius: 20,
                }}>
                  {isDelivered ? '✓ Delivered' : (data.shipment_status || 'Processing')}
                </div>
              </div>

              {/* Progress steps */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {STATUS_STEPS.map((step, i, arr) => {
                  const done   = i < currentStep;
                  const active = i === currentStep;
                  return (
                    <React.Fragment key={step}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%',
                          background: done ? 'var(--success)' : active ? 'var(--primary)' : 'var(--white)',
                          border: `2px solid ${done ? 'var(--success)' : active ? 'var(--primary)' : 'var(--border-mid)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '.7rem', color: (done || active) ? '#fff' : 'var(--text-light)',
                          marginBottom: '.4rem', fontWeight: 700,
                          boxShadow: active ? '0 0 0 4px var(--primary-muted)' : 'none',
                        }}>
                          {done ? '✓' : i + 1}
                        </div>
                        <div style={{ fontSize: '.55rem', color: (done || active) ? 'var(--text-dark)' : 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '.06em', textAlign: 'center', fontWeight: (done || active) ? 600 : 400, lineHeight: 1.3 }}>
                          {step}
                        </div>
                      </div>
                      {i < arr.length - 1 && (
                        <div style={{ flex: 1, height: 2, background: done ? 'var(--success)' : 'var(--border-mid)', marginTop: '-1.2rem', transition: 'background .3s' }} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Meta grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px,1fr))', gap: '1rem', marginBottom: '1rem' }}>
              {[
                { label: 'Courier', value: data.courier_name || '—' },
                { label: 'Estimated delivery', value: data.etd || '—' },
                { label: 'Order date', value: data.order_date ? new Date(data.order_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—' },
                { label: 'Customer', value: data.customer_name || '—' },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: 'var(--white)', border: '1px solid var(--border-light)', borderRadius: 10, padding: '1rem' }}>
                  <div style={{ fontSize: '.65rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: '.9rem', fontWeight: 600, color: 'var(--text-dark)' }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Activity timeline */}
            {data.tracking_data?.length > 0 && (
              <div style={{ background: 'var(--white)', border: '1px solid var(--border-light)', borderRadius: 12, padding: '1.5rem' }}>
                <div style={{ fontSize: '.65rem', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--text-light)', fontWeight: 700, marginBottom: '1.2rem' }}>
                  Activity log
                </div>
                <div>
                  {data.tracking_data.map((ev, i) => (
                    <div key={i} style={{ display: 'flex', gap: '1rem', paddingBottom: i < data.tracking_data.length - 1 ? '1rem' : 0 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 16, flexShrink: 0 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: i === 0 ? 'var(--primary)' : 'var(--border-mid)', marginTop: 4, flexShrink: 0 }} />
                        {i < data.tracking_data.length - 1 && (
                          <div style={{ width: 1, flex: 1, background: 'var(--border-light)', marginTop: 4 }} />
                        )}
                      </div>
                      <div style={{ paddingBottom: i < data.tracking_data.length - 1 ? '0.5rem' : 0 }}>
                        <div style={{ fontSize: '.85rem', fontWeight: i === 0 ? 600 : 400, color: i === 0 ? 'var(--text-dark)' : 'var(--text-mid)', marginBottom: 2 }}>
                          {ev.activity || ev.status}
                        </div>
                        <div style={{ fontSize: '.72rem', color: 'var(--text-light)' }}>
                          {ev.date}{ev.location ? ` — ${ev.location}` : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {!data && !loading && !error && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-light)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: .4 }}>📦</div>
            <div style={{ fontSize: '.88rem' }}>Enter your Order ID or AWB number above to see live shipment details from Shiprocket</div>
          </div>
        )}
      </div>
    </div>
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
  const [featVisible, setFeatVisible] = useState(Array(4).fill(false));

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
  const [showShipment, setShowShipment]   = useState(false);
  const [dbReviews, setDbReviews]         = useState([]);

  const fetchReviews = () => {
    fetch('/api/reviews')
      .then(r => r.ok ? r.json() : [])
      .then(data => { if (Array.isArray(data) && data.length > 0) setDbReviews(data); })
      .catch(() => {});
  };

  useEffect(() => { fetchReviews(); }, []);

  /* ── Modal pincode (in payment modal) ── */
  const [modalShipping, setModalShipping]       = useState(null);
  const [modalShipLoading, setModalShipLoading] = useState(false);

  const packPrice = selectedPack === 'family' ? FAMILY_PACK_PRICE : SINGLE_PRICE;
  const cartSubtotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const cartShipping = modalShipping?.charge ?? 0;
  const cartTotal    = cartSubtotal + cartShipping;
  const orderTotal   = packPrice * qty;


  /* ── inject CSS ── */
  useEffect(() => {
    const tag = document.createElement('style');
    tag.textContent = css;
    document.head.appendChild(tag);
    return () => document.head.removeChild(tag);
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
  const fetchModalShipping = async (pin) => {
  if (!pin || pin.length !== 6) return;
  setModalShipLoading(true);
  try {
    const res = await fetch('/api/shipping-cost', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pincode: pin, weight: 0.5 }),
    });
    const data = await res.json();
    setModalShipping({
      charge:  data.shipping_charge ?? 0,
      courier: data.courier_name    ?? 'Standard',
      eta:     data.estimated_delivery ?? '',
    });
  } catch {
    setModalShipping({ charge: 0, courier: 'Standard', eta: '' });
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
      image:       '/image/green.png',
      order_id:    rzpOrderId,
      prefill: {
        name:    (form.fname + ' ' + form.lname).trim(),
        email:   form.email,
        contact: form.phone,
      },
      notes: {
        address: form.address,
        pincode: form.pincode,
      },
      theme: { color: 'var(--primary)' },
 
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
                pincode: form.pincode,
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
  <div className="dn-cart-foot" style={{ padding: '1.2rem 1.6rem' }}>

    {/* Subtotal */}
    <div className="dn-cart-subtotal">
      <span className="dn-cart-subtotal-label">Subtotal</span>
      <span className="dn-cart-subtotal-val">₹{cartSubtotal.toLocaleString('en-IN')}</span>
    </div>

    {/* Total */}
    <div className="dn-cart-total-row" style={{ marginTop: '.8rem' }}>
      <span className="dn-cart-total-label">Total</span>
      <span className="dn-cart-total-val">₹{cartSubtotal.toLocaleString('en-IN')}
        <span style={{ fontSize: '.65rem', color: 'var(--text-light)', fontWeight: 400 }}> + shipping</span>
      </span>
    </div>

    {/* Checkout button — no form validation here, just open modal */}
    <button
      className="dn-cart-checkout-btn"
      onClick={() => {
        setCartOpen(false);
        setShowPayment(true);
      }}
    >
      Proceed to Checkout →
    </button>
    <p style={{ textAlign: 'center', fontSize: '.65rem', color: 'var(--text-light)', marginTop: '.6rem' }}>
      🔒 Razorpay · 🚚 Shiprocket · ↩ 30-day returns
    </p>
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
          <a href="#shipment"      onClick={e=>{e.preventDefault();setShowShipment(true);}}>Shipment</a>
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
        <a href="#shipment"      onClick={e=>{e.preventDefault();setShowShipment(true);}}>Shipment</a>
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

            {/* ── Left intro panel ── */}
            <div className={`dn-scroll-intro ${phaseIdx === -1 ? 'visible' : ''}`}>
              <div className="dn-scroll-intro-tag">Product Anatomy</div>
              <div className="dn-scroll-intro-title">Three parts.<br/><em>One perfect</em> clean.</div>
              <div className="dn-scroll-intro-desc">Scroll down to discover how each component of DENTALL's design works in harmony for a superior clean.</div>
              <div className="dn-scroll-intro-steps">
                {[['01','Bristle Head'],['02','Grip Body'],['03','Handle Base']].map(([num,name])=>(
                  <div key={num} className="dn-scroll-intro-step">
                    <span className="dn-scroll-intro-num">{num}</span>
                    <span className="dn-scroll-intro-name">{name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right stats panel ── */}
            <div className={`dn-scroll-stats ${phaseIdx === -1 ? 'visible' : ''}`}>
              {[
                { num:'99.3%', label:'Plaque removed',    fill:'99' },
                { num:'10K+',  label:'Micro-filaments/cm²', fill:'85' },
                { num:'4 mo',  label:'Replacement cycle', fill:'70' },
              ].map(s=>(
                <div key={s.label} className="dn-scroll-stat-item">
                  <div className="dn-scroll-stat-num">{s.num}</div>
                  <div className="dn-scroll-stat-label">{s.label}</div>
                  <div className="dn-scroll-stat-bar">
                    <div className="dn-scroll-stat-fill" style={{width:`${s.fill}%`}} />
                  </div>
                </div>
              ))}
            </div>

            {/* ── Scroll-down cue ── */}
            <div className={`dn-scroll-down-cue ${phaseIdx === -1 ? 'visible' : ''}`}>
              <div className="dn-scroll-down-cue-text">Scroll to explore</div>
              <div className="dn-scroll-down-cue-line" />
              <div className="dn-scroll-down-cue-arrow" />
            </div>

            <div className={`dn-mobile-feature-card ${mobilePanel?'visible':''}`}>
              {mobilePanel && <>
                <div className="dn-mobile-fp-tag">{mobilePanel.tag}</div>
                <div className="dn-mobile-fp-title">{mobilePanel.title}</div>
                <div className="dn-mobile-fp-desc">{mobilePanel.desc}</div>
              </>}
            </div>
            <div id="dn-brush-wrapper" style={{transform:`scale(${brushTransform.scale}) translateY(${brushTransform.ty}px) rotate(${brushTransform.rot}deg)`}}>
              <img id="dn-brush-img" src="image/green.png" alt="DENTALL brush detail" onError={e=>{e.target.style.opacity=0;}}/>
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

      {/* ── Hygiene Cap Section ── */}
      <section className="dn-cap-section" id="hygiene-cap">
        {/* Left: text */}
        <div>
          <div className="dn-cap-tag">Included in every order</div>
          <h2 className="dn-cap-title">Hygiene cap that<br/><em>travels with you.</em></h2>
          <p className="dn-cap-desc">
            Every DENTALL brush ships with a precision-fit transparent travel cap. Snap it on in seconds — your bristles stay protected from bathroom germs, bags, and surfaces wherever you go.
          </p>
          <div className="dn-cap-points">
            {[
              { icon:'🛡️', title:'Germ shield', desc:'Sealed clip design blocks airborne bacteria and contact contamination between uses.' },
              { icon:'✈️', title:'Travel ready', desc:'Slim, lightweight, and TSA-friendly. Fits flush so it never catches in your bag.' },
              { icon:'🔒', title:'Snap-lock closure', desc:'One-hand open and close. The hinged clip stays shut even upside down.' },
              { icon:'♻️', title:'BPA-free polypropylene', desc:'Same hygienic-grade plastic as the handle. Safe, durable, and recyclable.' },
            ].map(pt => (
              <div key={pt.title} className="dn-cap-point">
                <div className="dn-cap-point-icon">{pt.icon}</div>
                <div className="dn-cap-point-body">
                  <div className="dn-cap-point-title">{pt.title}</div>
                  <div className="dn-cap-point-desc">{pt.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="dn-cap-badge">Included free with every brush</div>
        </div>

        {/* Right: images */}
        <div className="dn-cap-images">
          <img src="src\assets\brush cap.png" alt="Cap on brush"       className="dn-cap-img dn-cap-img-main"        />
          <img src="src\assets\cap open.png" alt="Hygiene cap open"   className="dn-cap-img dn-cap-img-side dn-cap-img-side-top"    />
          <img src="src\assets\cap close.png" alt="Hygiene cap closed" className="dn-cap-img dn-cap-img-side dn-cap-img-side-bottom" />
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section className="dn-features-grid" id="features-grid">
        <div className="dn-section-label">What sets us apart</div>
        <div className="dn-section-title">Engineered for <em>every tooth</em>, every day.</div>
        <div className="dn-merged-grid">
          {[[0],[1],[2],[3]].map((indices, cardIdx) => (
            <div
              key={cardIdx}
              ref={el=>{featRefs.current[cardIdx]=el}}
              data-idx={cardIdx}
              className={`dn-merged-card ${featVisible[cardIdx]?'visible':''}`}
              style={{transitionDelay:`${cardIdx*0.12}s`}}
            >
              <div className="dn-merged-features">
                {indices.map(fi => (
                  <div key={fi} className="dn-merged-feat-item">
                    <div className="dn-merged-feat-header">
                      <span className="dn-merged-feat-num">{FEATURES[fi].num}</span>
                      <span className="dn-merged-feat-icon">{FEATURES[fi].icon}</span>
                      <span className="dn-merged-feat-title">{FEATURES[fi].title}</span>
                    </div>
                    <div className="dn-merged-feat-text">{FEATURES[fi].text}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Patient Conditions ── */}
      <section className="dn-patient-section" id="patient-conditions">
        <div className="dn-patient-section-label">Especially designed for</div>
        <div className="dn-patient-section-title">Made for <em>sensitive</em> health needs.</div>
        <p className="dn-patient-section-sub">DENTALL's nano-bristle engineering goes beyond everyday cleaning — built for patients who need gentler, safer oral care every single day.</p>
        <div className="dn-patient-grid">
          {PATIENT_CONDITIONS.map((p, i) => (
            <div key={i} className="dn-patient-card">
              <div className="dn-patient-card-accent" style={{background:p.color}}/>
              <div className="dn-patient-card-glow" style={{background:p.color}}/>
              <div className="dn-patient-card-icon" style={{background:p.colorBg}}>{p.icon}</div>
              <div className="dn-patient-card-badge" style={{background:p.colorBadge,color:p.colorText}}>{p.group}</div>
              <div className="dn-patient-card-divider" style={{background:p.color}}/>
              <div className="dn-patient-card-title">{p.title}</div>
              <div className="dn-patient-card-text">{p.text}</div>
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
            {(() => {
              const list = dbReviews.length
                ? dbReviews.map(r => ({ text: r.review_text, author: r.customer_name, city: '', rating: r.rating }))
                : REVIEWS.map(r => ({ ...r, rating: 5 }));
              return [...list, ...list, ...list].map((r, i) => (
                <div key={i} className="dn-review-card">
                  <div className="dn-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                  <div className="dn-review-text">"{r.text}"</div>
                  <div className="dn-review-author">
                    {r.author}
                    {r.city && <span style={{color:'var(--text-light)',fontWeight:400}}> — {r.city}</span>}
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
        {/* <div className="dn-stats-row">
          {[['99.3%','Plaque removed'],['12K+','Happy customers'],['4.9','Average rating'],['200+','Dentist partners']].map(([n,l])=>(
            <div key={l} className="dn-stat">
              <div className="dn-stat-num">{n}</div>
              <div className="dn-stat-label">{l}</div>
            </div>
          ))}
        </div> */}
      </section>

      {/* ── Write a Review ── */}
      <ReviewFormSection onSubmitSuccess={fetchReviews} />

      {/* ── Order ── */}
      <section className="dn-order" id="order">

        {/* Small centred info header */}
        <div className="dn-order-header">
          <div className="dn-section-label">Ready to upgrade?</div>
          <div className="dn-order-title">Choose your pack. <em>Start smiling better.</em></div>
          <div className="dn-order-desc" style={{maxWidth:520,margin:'0 auto .6rem'}}>Free shipping across India · 30-day return guarantee · Razorpay secured</div>
          <div className="dn-order-perk-chips">
            {['✓ Dentist recommended','✓ 12K+ happy customers','✓ Change every 4 months','✓ BPA-free materials','✓ Free shipping'].map(c=>(
              <span key={c} className="dn-order-perk-chip">{c}</span>
            ))}
          </div>
        </div>

        {/* Big product cards */}
        <div className="dn-products-big-grid">
          {PRODUCTS.map(p => (
            <div key={p.id} className={`dn-big-card ${p.badge==='Best Value'?'featured':''}`}>
              {p.badge && <div className="dn-big-card-ribbon">{p.badge}</div>}
              <div className="dn-big-card-icon">{p.icon}</div>
              <div className="dn-big-card-name">{p.name}</div>
              <div className="dn-big-card-sub">{p.sub}</div>
              <div className="dn-big-card-price">₹{p.price.toLocaleString('en-IN')}</div>
              <div className="dn-big-card-price-note">
                {p.id==='family-pack' ? '≈ ₹499/person/year' : p.id==='kids-brush' ? 'Ultra-soft for ages 3–12' : 'Single brush · 4-month use'}
              </div>
              <div className="dn-big-card-divider"/>
              <div className="dn-big-card-perks">
                {p.perks.map(pk=>(
                  <div key={pk} className="dn-big-card-perk">
                    <span className="dn-big-card-perk-check">✓</span>{pk}
                  </div>
                ))}
              </div>
              <button className="dn-big-card-btn"
                onClick={()=>addToCart({id:p.id,name:p.name,price:p.price,icon:p.icon})}>
                + Add to Cart
              </button>
            </div>
          ))}
        </div>

        <p style={{textAlign:'center',fontSize:'.68rem',color:'var(--text-light)'}}>
          🔒 Razorpay secured · 🚚 Shiprocket delivery · ↩ 30-day returns
        </p>
      </section>

      {/* ── Tracking ── */}
      <TrackingSection />

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
                <button className="dn-pay-done-btn" onClick={()=>{closePayment();setShowShipment(true);}}>View Shipment Details →</button>
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
                    <span style={{color: modalShipping?.charge===0?'var(--accent)':'var(--text-dark)',fontWeight:600}}>
                      {modalShipping ? (modalShipping.charge===0 ? 'FREE' : `₹${modalShipping.charge}`) : '—'}
                    </span>
                  </div>
                  <div className="dn-pay-summary-row total">
                    <span>Total</span>
                    <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* ── Delivery Details Form — shown here, not in cart ── */}
<div className="dn-pay-section-label">Delivery Details</div>

<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.8rem', marginBottom: '.8rem' }}>
  {[['fname','First Name','Arjun'], ['lname','Last Name','Sharma']].map(([key, lbl, ph]) => (
    <div className="dn-pay-field" key={key} style={{ marginBottom: 0 }}>
      <label>{lbl}</label>
      <input
        value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        placeholder={ph}
        style={{ borderColor: errors[key] ? 'var(--danger)' : '' }}
      />
    </div>
  ))}
</div>

<div className="dn-pay-field">
  <label>Email</label>
  <input
    type="email" value={form.email}
    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
    placeholder="arjun@email.com"
    style={{ borderColor: errors.email ? 'var(--danger)' : '' }}
  />
</div>

<div className="dn-pay-field">
  <label>Phone</label>
  <input
    type="tel" value={form.phone}
    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
    placeholder="+91 98765 43210"
    style={{ borderColor: errors.phone ? 'var(--danger)' : '' }}
  />
</div>

<div className="dn-pay-field">
  <label>Address</label>
  <input
    value={form.address}
    onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
    placeholder="Flat no, Street"
    style={{ borderColor: errors.address ? 'var(--danger)' : '' }}
  />
</div>

<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.8rem' }}>
  <div className="dn-pay-field">
    <label>City</label>
    <input
      value={form.city}
      onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
      placeholder="Chennai"
      style={{ borderColor: errors.city ? 'var(--danger)' : '' }}
    />
  </div>
  <div className="dn-pay-field">
    <label>Pincode</label>
    <input
      value={form.pincode}
      onChange={e => {
        const v = e.target.value.replace(/\D/g,'').slice(0,6);
        setForm(f => ({ ...f, pincode: v }));
        if (v.length === 6) fetchModalShipping(v);
      }}
      placeholder="600001"
      style={{ borderColor: errors.pincode ? 'var(--danger)' : '' }}
    />
  </div>
</div>

{modalShipLoading && (
  <div className="dn-shipping-loading" style={{marginBottom:'1rem'}}>Checking shipping rates…</div>
)}
{modalShipping && !modalShipLoading && (
  <div className="dn-shipping-info-box" style={{marginBottom:'1rem'}}>
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

<div className="dn-pay-field">
  <label>State</label>
  <select
    value={form.state}
    onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
    style={{ borderColor: errors.state ? 'var(--danger)' : '' }}
  >
    <option value="">Select state</option>
    {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
  </select>
</div>

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

      {/* ── Shipment Page ── */}
      {showShipment && <ShipmentPage onClose={() => setShowShipment(false)} />}

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

    </>
  );
}