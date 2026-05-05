import { useState, useEffect, useRef } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

  :root {
    --bg: #080810;
    --surface: #0f0f1a;
    --surface2: #13131f;
    --border: rgba(255,255,255,0.07);
    --text: #f0f0ff;
    --muted: #8888aa;
    --accent: #6c63ff;
    --accent2: #ff6b6b;
    --accent3: #00d4aa;
    --grad1: linear-gradient(135deg, #6c63ff 0%, #ff6b6b 100%);
    --grad2: linear-gradient(135deg, #00d4aa 0%, #6c63ff 100%);
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    overflow-x: hidden;
  }

  .font-display { font-family: 'Syne', sans-serif; }

  /* NAV */
  .nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    padding: 20px 40px;
    display: flex; align-items: center; justify-content: space-between;
    background: rgba(8,8,16,0.8);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
    transition: all 0.3s;
  }
  .nav-logo {
    font-family: 'Syne', sans-serif;
    font-size: 1.4rem; font-weight: 800;
    background: var(--grad1); -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    letter-spacing: -0.5px;
  }
  .nav-links { display: flex; gap: 32px; list-style: none; }
  .nav-links a {
    color: var(--muted); text-decoration: none; font-size: 0.9rem; font-weight: 500;
    transition: color 0.2s; letter-spacing: 0.3px;
  }
  .nav-links a:hover { color: var(--text); }
  .nav-cta {
    padding: 10px 22px; border-radius: 8px;
    background: var(--grad1); color: #fff; border: none;
    font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 0.9rem;
    cursor: pointer; transition: opacity 0.2s, transform 0.2s;
  }
  .nav-cta:hover { opacity: 0.85; transform: translateY(-1px); }

  /* HERO */
  .hero {
    min-height: 100vh;
    display: flex; align-items: center; justify-content: center;
    position: relative; overflow: hidden;
    padding: 120px 40px 80px;
    text-align: center;
  }
  .hero-bg {
    position: absolute; inset: 0; z-index: 0;
    background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(108,99,255,0.18) 0%, transparent 70%),
                radial-gradient(ellipse 50% 40% at 80% 80%, rgba(255,107,107,0.1) 0%, transparent 60%),
                radial-gradient(ellipse 40% 40% at 10% 70%, rgba(0,212,170,0.08) 0%, transparent 60%);
  }
  .hero-grid {
    position: absolute; inset: 0; z-index: 0; opacity: 0.04;
    background-image: linear-gradient(var(--border) 1px, transparent 1px),
                      linear-gradient(90deg, var(--border) 1px, transparent 1px);
    background-size: 60px 60px;
  }
  .hero-content { position: relative; z-index: 1; max-width: 860px; }
  .hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 8px 18px; border-radius: 100px;
    background: rgba(108,99,255,0.12); border: 1px solid rgba(108,99,255,0.3);
    font-size: 0.82rem; color: #a89fff; font-weight: 500; margin-bottom: 32px;
    animation: fadeUp 0.6s ease both;
  }
  .hero-badge-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--accent3); box-shadow: 0 0 8px var(--accent3);
    animation: pulse 2s ease infinite;
  }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }
  .hero h1 {
    font-family: 'Syne', sans-serif;
    font-size: clamp(2.4rem, 6vw, 4.4rem);
    font-weight: 800; line-height: 1.1;
    letter-spacing: -1.5px; margin-bottom: 24px;
    animation: fadeUp 0.6s 0.1s ease both;
  }
  .hero h1 .grad {
    background: var(--grad1); -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .hero p {
    font-size: 1.15rem; color: var(--muted); line-height: 1.7;
    max-width: 560px; margin: 0 auto 40px;
    animation: fadeUp 0.6s 0.2s ease both;
  }
  .hero-actions {
    display: flex; gap: 14px; justify-content: center; flex-wrap: wrap;
    animation: fadeUp 0.6s 0.3s ease both;
  }
  .btn-primary {
    padding: 14px 32px; border-radius: 10px;
    background: var(--grad1); color: #fff; border: none;
    font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 1rem;
    cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 4px 24px rgba(108,99,255,0.35);
    text-decoration: none; display: inline-block;
  }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(108,99,255,0.45); }
  .btn-secondary {
    padding: 14px 32px; border-radius: 10px;
    background: transparent; color: var(--text); border: 1px solid var(--border);
    font-family: 'DM Sans', sans-serif; font-weight: 500; font-size: 1rem;
    cursor: pointer; transition: border-color 0.2s, background 0.2s;
    text-decoration: none; display: inline-block;
  }
  .btn-secondary:hover { border-color: rgba(255,255,255,0.2); background: rgba(255,255,255,0.04); }
  .hero-stats {
    display: flex; gap: 48px; justify-content: center; margin-top: 64px;
    animation: fadeUp 0.6s 0.4s ease both;
  }
  .hero-stat { text-align: center; }
  .hero-stat-num {
    font-family: 'Syne', sans-serif; font-size: 1.8rem; font-weight: 800;
    background: var(--grad1); -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .hero-stat-label { font-size: 0.82rem; color: var(--muted); margin-top: 4px; }

  @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }

  /* SECTIONS */
  section { padding: 100px 40px; }
  .container { max-width: 1100px; margin: 0 auto; }
  .section-tag {
    display: inline-block; padding: 5px 14px; border-radius: 100px;
    background: rgba(108,99,255,0.1); border: 1px solid rgba(108,99,255,0.25);
    font-size: 0.78rem; font-weight: 600; color: #a89fff; letter-spacing: 1.5px;
    text-transform: uppercase; margin-bottom: 16px;
  }
  .section-title {
    font-family: 'Syne', sans-serif; font-size: clamp(1.8rem, 4vw, 2.8rem);
    font-weight: 800; letter-spacing: -0.8px; line-height: 1.15; margin-bottom: 16px;
  }
  .section-sub { color: var(--muted); line-height: 1.7; max-width: 540px; font-size: 1.05rem; }

  /* ABOUT */
  .about { background: var(--surface); }
  .about-inner {
    display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center;
  }
  .about-visual {
    position: relative; border-radius: 20px; overflow: hidden;
    background: var(--surface2); border: 1px solid var(--border);
    aspect-ratio: 1; display: flex; align-items: center; justify-content: center;
  }
  .about-visual-inner {
    width: 80%; height: 80%; border-radius: 16px;
    background: linear-gradient(135deg, rgba(108,99,255,0.15), rgba(255,107,107,0.1));
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px;
    border: 1px solid rgba(108,99,255,0.2);
  }
  .about-logo-big {
    font-family: 'Syne', sans-serif; font-size: 3rem; font-weight: 800;
    background: var(--grad1); -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .about-tagline { font-size: 0.9rem; color: var(--muted); }
  .about-pillars { display: flex; flex-direction: column; gap: 16px; margin-top: 32px; }
  .about-pillar {
    padding: 16px 20px; border-radius: 12px;
    background: var(--surface2); border: 1px solid var(--border);
    display: flex; align-items: center; gap: 14px;
    transition: border-color 0.2s;
  }
  .about-pillar:hover { border-color: rgba(108,99,255,0.3); }
  .pillar-icon {
    width: 40px; height: 40px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center; font-size: 1.2rem;
    flex-shrink: 0;
  }
  .pillar-icon.purple { background: rgba(108,99,255,0.15); }
  .pillar-icon.coral  { background: rgba(255,107,107,0.15); }
  .pillar-icon.teal   { background: rgba(0,212,170,0.15); }
  .pillar-title { font-weight: 600; font-size: 0.95rem; margin-bottom: 2px; }
  .pillar-desc  { font-size: 0.82rem; color: var(--muted); }

  /* SERVICES */
  .services-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 56px; }
  .service-card {
    padding: 32px; border-radius: 16px;
    background: var(--surface); border: 1px solid var(--border);
    transition: transform 0.25s, border-color 0.25s, box-shadow 0.25s;
    position: relative; overflow: hidden;
  }
  .service-card::before {
    content: ''; position: absolute; inset: 0; opacity: 0; transition: opacity 0.3s;
    background: radial-gradient(ellipse at 0% 0%, rgba(108,99,255,0.08) 0%, transparent 70%);
  }
  .service-card:hover { transform: translateY(-6px); border-color: rgba(108,99,255,0.3); box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
  .service-card:hover::before { opacity: 1; }
  .service-icon {
    width: 52px; height: 52px; border-radius: 14px; margin-bottom: 20px;
    display: flex; align-items: center; justify-content: center; font-size: 1.5rem;
  }
  .service-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 1.1rem; margin-bottom: 10px; }
  .service-desc  { color: var(--muted); font-size: 0.9rem; line-height: 1.65; margin-bottom: 20px; }
  .service-tags  { display: flex; flex-wrap: wrap; gap: 6px; }
  .stag {
    padding: 4px 10px; border-radius: 100px; font-size: 0.75rem; font-weight: 500;
    background: rgba(255,255,255,0.06); color: var(--muted);
  }

  /* PROCESS */
  .process { background: var(--surface); }
  .process-steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; margin-top: 56px; position: relative; }
  .process-steps::before {
    content: ''; position: absolute; top: 36px; left: 10%; right: 10%; height: 1px;
    background: linear-gradient(90deg, transparent, var(--accent), transparent);
    opacity: 0.3; z-index: 0;
  }
  .process-step { text-align: center; position: relative; z-index: 1; }
  .step-num {
    width: 72px; height: 72px; border-radius: 50%; margin: 0 auto 20px;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.4rem;
    background: var(--surface2); border: 2px solid rgba(108,99,255,0.4);
    color: var(--accent); position: relative;
    box-shadow: 0 0 24px rgba(108,99,255,0.15);
  }
  .step-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 1rem; margin-bottom: 8px; }
  .step-desc  { font-size: 0.85rem; color: var(--muted); line-height: 1.6; }

  /* PROJECTS */
  .projects-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; margin-top: 56px; }
  .project-card {
    border-radius: 20px; overflow: hidden;
    background: var(--surface); border: 1px solid var(--border);
    transition: transform 0.25s, box-shadow 0.25s;
  }
  .project-card:hover { transform: translateY(-4px); box-shadow: 0 24px 60px rgba(0,0,0,0.35); }
  .project-thumb {
    height: 220px; position: relative; overflow: hidden;
    display: flex; align-items: center; justify-content: center;
  }
  .project-thumb-bg1 { background: linear-gradient(135deg, #1a1040 0%, #0d0d20 100%); }
  .project-thumb-bg2 { background: linear-gradient(135deg, #0d2020 0%, #0d0d20 100%); }
  .project-thumb-overlay {
    position: absolute; inset: 0;
    background: radial-gradient(ellipse at center, rgba(108,99,255,0.2) 0%, transparent 70%);
  }
  .project-label {
    position: absolute; top: 16px; right: 16px;
    padding: 5px 12px; border-radius: 100px; font-size: 0.75rem; font-weight: 600;
  }
  .label-progress { background: rgba(255,200,0,0.15); color: #ffc800; border: 1px solid rgba(255,200,0,0.3); }
  .label-concept  { background: rgba(0,212,170,0.15); color: var(--accent3); border: 1px solid rgba(0,212,170,0.3); }
  .project-icon { font-size: 3rem; position: relative; z-index: 1; }
  .project-body { padding: 24px; }
  .project-name  { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 1.15rem; margin-bottom: 8px; }
  .project-desc  { font-size: 0.87rem; color: var(--muted); line-height: 1.6; margin-bottom: 16px; }
  .project-stack { display: flex; flex-wrap: wrap; gap: 6px; }

  /* WHY US */
  .why { background: var(--surface); }
  .why-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 56px; }
  .why-card {
    padding: 32px; border-radius: 16px;
    background: var(--bg); border: 1px solid var(--border);
    transition: border-color 0.25s, transform 0.25s;
    text-align: center;
  }
  .why-card:hover { border-color: rgba(108,99,255,0.35); transform: translateY(-4px); }
  .why-icon { font-size: 2.2rem; margin-bottom: 16px; }
  .why-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 1.05rem; margin-bottom: 10px; }
  .why-desc  { font-size: 0.88rem; color: var(--muted); line-height: 1.65; }

  /* CTA */
  .cta-section {
    text-align: center; position: relative; overflow: hidden;
    background: linear-gradient(135deg, rgba(108,99,255,0.1) 0%, rgba(255,107,107,0.05) 100%);
    border-top: 1px solid var(--border);
  }
  .cta-section::before {
    content: ''; position: absolute; top: -50%; left: 50%; transform: translateX(-50%);
    width: 600px; height: 400px; border-radius: 50%;
    background: radial-gradient(ellipse, rgba(108,99,255,0.12) 0%, transparent 70%);
    pointer-events: none;
  }
  .cta-section .section-title { max-width: 640px; margin: 0 auto 16px; }
  .cta-section .section-sub   { max-width: 480px; margin: 0 auto 40px; }
  .cta-actions { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
  .cta-note { margin-top: 20px; font-size: 0.83rem; color: var(--muted); }

  /* FOOTER */
  .footer {
    padding: 40px; border-top: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
    flex-wrap: wrap; gap: 16px;
  }
  .footer-logo {
    font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.1rem;
    background: var(--grad1); -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .footer-links { display: flex; gap: 24px; list-style: none; }
  .footer-links a { color: var(--muted); text-decoration: none; font-size: 0.87rem; transition: color 0.2s; }
  .footer-links a:hover { color: var(--text); }
  .footer-copy { color: var(--muted); font-size: 0.82rem; }

  /* MOBILE */
  @media (max-width: 768px) {
    .nav { padding: 16px 20px; }
    .nav-links { display: none; }
    section { padding: 72px 20px; }
    .about-inner { grid-template-columns: 1fr; gap: 40px; }
    .about-visual { display: none; }
    .services-grid { grid-template-columns: 1fr; }
    .process-steps { grid-template-columns: 1fr 1fr; }
    .process-steps::before { display: none; }
    .projects-grid { grid-template-columns: 1fr; }
    .why-grid { grid-template-columns: 1fr; }
    .hero-stats { gap: 28px; flex-wrap: wrap; }
    .footer { flex-direction: column; text-align: center; padding: 32px 20px; }
    .footer-links { flex-wrap: wrap; justify-content: center; }
  }
`;

const services = [
  {
    icon: "🌐", color: "rgba(108,99,255,0.15)", title: "Web Development",
    desc: "Blazing-fast, conversion-optimised websites and web apps built with modern frameworks. From landing pages to full-scale platforms.",
    tags: ["React", "Next.js", "Node.js", "CMS"]
  },
  {
    icon: "🛒", color: "rgba(255,107,107,0.15)", title: "E-commerce Solutions",
    desc: "End-to-end online stores designed to convert browsers into buyers. Custom storefronts with seamless checkout experiences.",
    tags: ["Shopify", "WooCommerce", "Stripe", "Analytics"]
  },
  {
    icon: "🤖", color: "rgba(0,212,170,0.15)", title: "AI & Automation",
    desc: "Intelligent tools that work for your business 24/7. Automate repetitive tasks, qualify leads, and deliver smarter customer experiences.",
    tags: ["AI Chatbots", "Workflows", "API Integration", "Data"]
  },
  {
    icon: "📣", color: "rgba(255,200,0,0.1)", title: "Digital Growth",
    desc: "High-converting landing pages, ad creatives, and funnels designed to bring in customers and grow your revenue.",
    tags: ["Landing Pages", "Ads", "Funnels", "SEO"]
  },
  {
    icon: "⚡", color: "rgba(108,99,255,0.15)", title: "Performance Optimisation",
    desc: "Speed up your existing platform. Better Core Web Vitals, lower bounce rates, and better search rankings — measurable impact.",
    tags: ["Speed Audit", "CDN", "Lighthouse", "Core Web Vitals"]
  },
  {
    icon: "🔗", color: "rgba(0,212,170,0.15)", title: "Systems & Integrations",
    desc: "Connect your tools so they work together. CRM, payments, analytics, email — we wire it all up so your team can move faster.",
    tags: ["CRM", "Zapier", "APIs", "Webhooks"]
  },
];

const steps = [
  { num: "01", title: "Discover", desc: "We learn your goals, audience, and constraints. No assumptions, just listening." },
  { num: "02", title: "Strategise", desc: "We map out the fastest path to a working product that actually solves the problem." },
  { num: "03", title: "Build", desc: "Clean, fast, and scalable code. You get progress updates — no black-box development." },
  { num: "04", title: "Launch & Grow", desc: "We ship, measure, and keep improving. Your growth is the benchmark." },
];

const projects = [
  {
    name: "Client Project — In Progress", bg: "project-thumb-bg1",
    icon: "🚀", label: "label-progress", labelText: "In Progress",
    desc: "Our first real client engagement. We are building a modern web presence and digital growth system tailored to their market. Details coming soon.",
    stack: ["Web Dev", "Strategy", "Design"]
  },
  {
    name: "JMI Internal Platform", bg: "project-thumb-bg2",
    icon: "⚙️", label: "label-concept", labelText: "Coming Soon",
    desc: "A suite of tools to help small businesses launch and manage their digital presence — designed with simplicity first.",
    stack: ["React", "AI", "Automation"]
  },
];

const whyUs = [
  { icon: "⚡", title: "Fast Delivery", desc: "We move with urgency. Most projects are scoped and started within 48 hours. No endless back-and-forth." },
  { icon: "🎯", title: "Results First", desc: "We build to convert, not to impress. Every decision is tied to a business outcome." },
  { icon: "💡", title: "Smart Solutions", desc: "From AI to automation, we use the right technology — not the most expensive one." },
  { icon: "💰", title: "Startup Pricing", desc: "Professional quality at a price that makes sense for growing businesses." },
  { icon: "📱", title: "Mobile-First Always", desc: "Over 60% of traffic is mobile. Every product we ship is built mobile-first from day one." },
  { icon: "🤝", title: "Real Partnership", desc: "We are invested in your success. You get a dedicated team that actually cares." },
];

export default function App() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <style>{styles}</style>

      {/* NAV */}
      <nav className="nav" style={scrolled ? { boxShadow: "0 8px 40px rgba(0,0,0,0.4)" } : {}}>
        <div className="nav-logo font-display">JMI</div>
        <ul className="nav-links">
          {["about","services","process","projects","why-us"].map(id => (
            <li key={id}>
              <a href={`#${id}`} onClick={e => { e.preventDefault(); scrollTo(id); }}>
                {id.replace("-"," ").replace(/\b\w/g, c => c.toUpperCase())}
              </a>
            </li>
          ))}
        </ul>
        <button className="nav-cta" onClick={() => scrollTo("contact")}>Get Started →</button>
      </nav>

      {/* HERO */}
      <section className="hero" id="hero">
        <div className="hero-bg" />
        <div className="hero-grid" />
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            Now working with our first client
          </div>
          <h1 className="font-display">
            We Build Digital Products<br />That <span className="grad">Drive Growth</span>
          </h1>
          <p>
            JMI helps businesses grow through fast, modern digital solutions — websites, 
            e-commerce, AI tools, and automation. Simple. Smart. Scalable.
          </p>
          <div className="hero-actions">
            <a href="#contact" className="btn-primary" onClick={e => { e.preventDefault(); scrollTo("contact"); }}>
              Start a Project →
            </a>
            <a href="#services" className="btn-secondary" onClick={e => { e.preventDefault(); scrollTo("services"); }}>
              View Services
            </a>
          </div>
          <div className="hero-stats">
            {[["Web • Mobile","Platforms"],["AI & Auto","Specialisms"],["Fast","Delivery"],["1st Client","Live Project"]].map(([n,l]) => (
              <div className="hero-stat" key={l}>
                <div className="hero-stat-num">{n}</div>
                <div className="hero-stat-label">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="about" id="about">
        <div className="container">
          <div className="about-inner">
            <div className="about-visual">
              <div className="about-visual-inner">
                <div className="about-logo-big font-display">JMI</div>
                <div className="about-tagline">Just Make It</div>
                <div style={{fontSize:"0.78rem",color:"var(--muted)",textAlign:"center",padding:"0 16px",lineHeight:1.6}}>
                  Fast · Smart · Scalable
                </div>
              </div>
            </div>
            <div>
              <div className="section-tag">About Us</div>
              <h2 className="section-title font-display">
                We Build Products.<br />Businesses Grow.
              </h2>
              <p className="section-sub">
                Just Make It (JMI) is a tech startup that turns business goals into powerful 
                digital products. We specialise in websites, e-commerce, AI tools, and 
                automation — all designed to increase customers, improve efficiency, and 
                deliver real results.
              </p>
              <div className="about-pillars">
                {[
                  { icon:"🌐", cls:"purple", title:"Web & Mobile", desc:"Modern, responsive digital experiences that convert visitors into customers." },
                  { icon:"🤖", cls:"teal",   title:"AI-Powered Tools", desc:"Intelligent systems that work smarter, faster, and cheaper than manual processes." },
                  { icon:"⚡", cls:"coral",  title:"Business Automation", desc:"Streamlined workflows that save time and scale with your business." },
                ].map(p => (
                  <div className="about-pillar" key={p.title}>
                    <div className={`pillar-icon ${p.cls}`}>{p.icon}</div>
                    <div>
                      <div className="pillar-title">{p.title}</div>
                      <div className="pillar-desc">{p.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services">
        <div className="container">
          <div className="section-tag">What We Do</div>
          <h2 className="section-title font-display">Services Built for Growth</h2>
          <p className="section-sub">Everything you need to compete and win online — under one roof, without the agency price tag.</p>
          <div className="services-grid">
            {services.map(s => (
              <div className="service-card" key={s.title}>
                <div className="service-icon" style={{background: s.color}}>{s.icon}</div>
                <div className="service-title font-display">{s.title}</div>
                <div className="service-desc">{s.desc}</div>
                <div className="service-tags">{s.tags.map(t => <span className="stag" key={t}>{t}</span>)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="process" id="process">
        <div className="container">
          <div style={{textAlign:"center",marginBottom:0}}>
            <div className="section-tag">How We Work</div>
            <h2 className="section-title font-display">Simple. Fast. Focused.</h2>
            <p className="section-sub" style={{margin:"0 auto"}}>
              Four focused steps from idea to live product. No bloat. No delays.
            </p>
          </div>
          <div className="process-steps">
            {steps.map(s => (
              <div className="process-step" key={s.num}>
                <div className="step-num font-display">{s.num}</div>
                <div className="step-title font-display">{s.title}</div>
                <div className="step-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROJECTS */}
      <section id="projects">
        <div className="container">
          <div className="section-tag">Our Work</div>
          <h2 className="section-title font-display">Projects & Case Studies</h2>
          <p className="section-sub">We just started — and we're already building. Here's what's in motion.</p>
          <div className="projects-grid">
            {projects.map(p => (
              <div className="project-card" key={p.name}>
                <div className={`project-thumb ${p.bg}`}>
                  <div className="project-thumb-overlay" />
                  <span className="project-icon">{p.icon}</span>
                  <span className={`project-label ${p.label}`}>{p.labelText}</span>
                </div>
                <div className="project-body">
                  <div className="project-name font-display">{p.name}</div>
                  <div className="project-desc">{p.desc}</div>
                  <div className="project-stack">{p.stack.map(t => <span className="stag" key={t}>{t}</span>)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="why" id="why-us">
        <div className="container">
          <div style={{textAlign:"center"}}>
            <div className="section-tag">Why JMI</div>
            <h2 className="section-title font-display">The JMI Difference</h2>
            <p className="section-sub" style={{margin:"0 auto"}}>
              We combine startup speed with agency quality — and we care about your growth as much as you do.
            </p>
          </div>
          <div className="why-grid">
            {whyUs.map(w => (
              <div className="why-card" key={w.title}>
                <div className="why-icon">{w.icon}</div>
                <div className="why-title font-display">{w.title}</div>
                <div className="why-desc">{w.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section" id="contact">
        <div className="container" style={{position:"relative",zIndex:1}}>
          <div className="section-tag">Let's Build</div>
          <h2 className="section-title font-display">
            Ready to Grow Your Business<br />with Technology?
          </h2>
          <p className="section-sub">
            Whether you need a new website, an AI tool, or a full digital strategy — 
            we're ready to build it with you. DM us and let's talk.
          </p>
          <div className="cta-actions">
            <a href="https://instagram.com/justmakeit_jmi" target="_blank" rel="noreferrer" className="btn-primary">
              DM on Instagram →
            </a>
            <a href="mailto:hello@justmakeit.dev" className="btn-secondary">
              Send an Email
            </a>
          </div>
          <p className="cta-note">⚡ Typically respond within 24 hours · No commitments, just a conversation</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-logo font-display">Just Make It</div>
        <ul className="footer-links">
          {[["#about","About"],["#services","Services"],["#process","Process"],["#projects","Work"],["#contact","Contact"]].map(([href,label]) => (
            <li key={label}><a href={href} onClick={e=>{e.preventDefault();scrollTo(href.slice(1))}}>{label}</a></li>
          ))}
        </ul>
        <div className="footer-copy">© 2025 Just Make It. Fast. Smart. Scalable.</div>
      </footer>
    </>
  );
}






















































































