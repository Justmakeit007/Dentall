/* ─── CONSTANTS ────────────────────────────────────────────────── */
export const SINGLE_PRICE    = 49;
export const FAMILY_PACK_PRICE = 599;
// const RAZORPAY_KEY_ID = "rzp_test_SlG1HvlDp3i5Fw"; // ← replace with your key

export const FEATURES = [
  { num:"01", icon:"🦷", title:"Nano Bristle Technology", text:"10,000 micro-filaments per cm² with varying stiffness — hard on plaque, gentle on enamel and gums." },
  { num:"02", icon:"✋", title:"Ergonomic Red Grip", text:"Dual-material TPE inlay provides non-slip control and reduces wrist strain during the full two-minute brush." },
  { num:"03", icon:"🔬", title:"Anti-Bacterial Materials", text:"Medical-grade polypropylene inhibits bacteria build-up between bristle tufts, keeping each brush hygienic longer." },
  { num:"04", icon:"💧", title:"Easy-Rinse Design", text:"Open bristle cluster spacing allows water to flow through freely, washing away toothpaste and debris completely." },
];
export const PATIENT_CONDITIONS = [
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

export const REVIEWS = [
  { text:"The red grip is so comfortable — I never feel like I'm pressing too hard. My dentist noticed my gums are healthier after just 2 months.", author:"Arjun M.", city:"Mumbai" },
  { text:"My dentist actually noticed a difference at my last checkup. Less plaque, healthier gums. She asked what I'd changed — I showed her DENTALL.", author:"Priya S.", city:"Bangalore" },
  { text:"The bristles are incredibly soft yet my teeth feel polished clean. It's the only toothbrush I've used that doesn't leave my gums sore.", author:"Riya K.", city:"Chennai" },
  { text:"We got the family pack for all four of us. The schedule is genius — every 4 months we simply swap and we've never missed a replacement since.", author:"Vikram T.", city:"Pune" },
  { text:"Worth every rupee. My kids actually look forward to brushing now. The red design is fun and the bristles are gentle enough for them.", author:"Sunita R.", city:"Delhi" },
  { text:"Switched from an electric brush and honestly the clean feels just as thorough. The ergonomic handle makes all the difference.", author:"Karthik N.", city:"Hyderabad" },
];

export const PRODUCTS = [
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
    id:    'wholesale',
    name:  'Wholesale',
    icon:  '🏭',
    sub:   'Bulk orders · clinics, retailers & distributors',
    price: 0,
    badge: 'Wholesale',
    perks: ['MOQ: 100 brushes', 'Custom branding available', 'Best volume pricing'],
  },
];
export const PHASES = [
  { name:'Brush Overview',  step:'Introducing' },
  { name:'The Bristle Head', step:'Part 01' },
  { name:'The Grip Body',    step:'Part 02' },
  { name:'The Handle Base',  step:'Part 03' },
];
export const MOBILE_PANELS = {
  1: { tag:'01 — Bristle Head',   title:'Ultra-Soft Nano Bristles',  desc:'10,000 micro-filaments per cm² reach between teeth and below the gumline, removing 99.3% of plaque.' },
  2: { tag:'02 — Ergonomic Handle', title:'Precision Grip Zone',       desc:'Dual-material soft-touch grip contoured to the hand. Red TPE inlay provides non-slip control at every angle.' },
  3: { tag:'03 — Handle End',      title:'Anti-Slip Base',             desc:'The flared end provides stability on wet surfaces and an ergonomic rest point for the palm.' },
};

export const INDIA_STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Puducherry','Chandigarh','Jammu and Kashmir','Ladakh'];
