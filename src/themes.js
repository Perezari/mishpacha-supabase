// ═══════════════════════════════════════════════════════
//  Theme Registry v5
//
//  CHILD THEMES (3 concepts):
//  ─ SUNNY  "Sunny Quest"     — warm coral/orange + teal
//  ─ COSMIC "Cosmic Adventure" — deep purple + stars + electric blue
//  ─ FOREST "Magic Forest"    — rich green + gold + violet
//
//  PARENT THEMES (5 options):
//  ─ C (default) modern clean
//  ─ A pastel pink, B comic bold, D adventure, E candy
// ═══════════════════════════════════════════════════════

const THEMES = {

  /* ══════════════════════════════════════════════════════
     CHILD CONCEPT 1 — "Sunny Quest"
     Warm coral + teal + golden yellow.
     Happy, energetic, clear contrast.
  ══════════════════════════════════════════════════════ */
  SUNNY: {
    id: 'SUNNY', name: 'Sunny Quest ☀️', label: 'סאני', isGame: true,
    font: "'Heebo', sans-serif",
    // Backgrounds
    bgGrad:      'linear-gradient(170deg, #FF7043 0%, #FF8A65 35%, #FFA040 65%, #FFD54F 100%)',
    cardBg:      '#FFFFFF',
    panelBg:     'rgba(255,255,255,.93)',
    sheetBg:     '#FFFBF0',
    // Colors
    primary:   '#FF5722',   // deep coral
    secondary: '#00BCD4',   // cyan-teal
    accent:    '#FFD600',   // golden yellow
    success:   '#00C853',
    danger:    '#FF1744',
    warning:   '#FF9800',
    purple:    '#7C4DFF',
    // Text
    text:      '#1A1A2E',
    textMid:   '#3D3D5C',
    textLight: '#8888A8',
    textOnPrimary: '#fff',
    // Shapes
    radius: '20px', btnRadius: '50px', inputRadius: '14px', chipRadius: '50px',
    // Shadows
    shadow:    '0 6px 24px rgba(255,87,34,.18)',
    cardShadow:'0 4px 20px rgba(0,0,0,.08)',
    btnShadow: '0 6px 20px rgba(255,87,34,.45)',
    successShadow: '0 6px 20px rgba(0,200,83,.40)',
    // Borders
    border: 'none', cardBorder: 'none',
    // Gradients
    headerGrad:  'linear-gradient(135deg, #FF5722 0%, #FF9800 100%)',
    coinGrad:    'linear-gradient(145deg, #FFD700, #FF9800)',
    progressGrad:'linear-gradient(90deg, #FF5722, #FFD600)',
    successGrad: 'linear-gradient(135deg, #00C853, #69F0AE)',
    navBg:       'rgba(255,255,255,.95)',
    inputBg:     '#FFF8F0',
    progressBg:  'rgba(0,0,0,.08)',
    // Coin
    coinBg: 'linear-gradient(145deg, #FFD700 0%, #FF9800 50%, #FFE082 100%)',
  },

  /* ══════════════════════════════════════════════════════
     CHILD CONCEPT 2 — "Cosmic Adventure"
     Deep space purple + electric cyan + gold stars.
     Mysterious, exciting, premium feel.
  ══════════════════════════════════════════════════════ */
  COSMIC: {
    id: 'COSMIC', name: 'Cosmic Adventure 🚀', label: 'קוסמי', isGame: true,
    font: "'Heebo', sans-serif",
    bgGrad:      'linear-gradient(170deg, #1A0533 0%, #2D1B69 35%, #0D47A1 70%, #1565C0 100%)',
    cardBg:      'rgba(255,255,255,.07)',
    panelBg:     'rgba(255,255,255,.10)',
    sheetBg:     'rgba(255,255,255,.06)',
    primary:   '#7C4DFF',
    secondary: '#00E5FF',
    accent:    '#FFD600',
    success:   '#00E676',
    danger:    '#FF1744',
    warning:   '#FFAB40',
    purple:    '#EA80FC',
    text:      '#FFFFFF',
    textMid:   'rgba(255,255,255,.82)',
    textLight: 'rgba(255,255,255,.55)',
    textOnPrimary: '#fff',
    radius: '20px', btnRadius: '50px', inputRadius: '14px', chipRadius: '50px',
    shadow:    '0 6px 24px rgba(0,0,0,.4)',
    cardShadow:'0 4px 20px rgba(0,0,0,.35)',
    btnShadow: '0 6px 20px rgba(124,77,255,.6)',
    successShadow: '0 6px 20px rgba(0,230,118,.4)',
    border: '1px solid rgba(255,255,255,.12)', cardBorder: '1px solid rgba(255,255,255,.12)',
    headerGrad:  'linear-gradient(135deg, #4A148C 0%, #7C4DFF 50%, #00E5FF 100%)',
    coinGrad:    'linear-gradient(145deg, #FFD700, #FF9800)',
    progressGrad:'linear-gradient(90deg, #7C4DFF, #00E5FF)',
    successGrad: 'linear-gradient(135deg, #00E676, #69F0AE)',
    navBg:       'rgba(20,5,50,.95)',
    inputBg:     'rgba(255,255,255,.10)',
    progressBg:  'rgba(255,255,255,.12)',
    coinBg: 'linear-gradient(145deg, #FFD700 0%, #FF9800 50%, #FFE082 100%)',
  },

  /* ══════════════════════════════════════════════════════
     CHILD CONCEPT 3 — "Magic Forest"
     Rich emerald + violet + gold.
     Enchanted, warm, adventurous.
  ══════════════════════════════════════════════════════ */
  FOREST: {
    id: 'FOREST', name: 'Magic Forest 🌿', label: 'יער', isGame: true,
    font: "'Heebo', sans-serif",
    bgGrad:      'linear-gradient(170deg, #1B5E20 0%, #2E7D32 30%, #388E3C 60%, #558B2F 100%)',
    cardBg:      'rgba(255,255,255,.96)',
    panelBg:     'rgba(255,255,255,.94)',
    sheetBg:     '#F1FFF4',
    primary:   '#2E7D32',
    secondary: '#AB47BC',
    accent:    '#FFD600',
    success:   '#00C853',
    danger:    '#FF3D57',
    warning:   '#FF9800',
    purple:    '#7B1FA2',
    text:      '#1B2A1B',
    textMid:   '#2D4A2D',
    textLight: '#5A7A5A',
    textOnPrimary: '#fff',
    radius: '20px', btnRadius: '50px', inputRadius: '14px', chipRadius: '50px',
    shadow:    '0 6px 24px rgba(46,125,50,.22)',
    cardShadow:'0 4px 20px rgba(0,0,0,.08)',
    btnShadow: '0 6px 20px rgba(46,125,50,.45)',
    successShadow: '0 6px 20px rgba(0,200,83,.40)',
    border: 'none', cardBorder: 'none',
    headerGrad:  'linear-gradient(135deg, #1B5E20 0%, #558B2F 50%, #AB47BC 100%)',
    coinGrad:    'linear-gradient(145deg, #FFD700, #FF9800)',
    progressGrad:'linear-gradient(90deg, #2E7D32, #AB47BC)',
    successGrad: 'linear-gradient(135deg, #00C853, #69F0AE)',
    navBg:       'rgba(255,255,255,.97)',
    inputBg:     '#F1FFF4',
    progressBg:  'rgba(0,0,0,.08)',
    coinBg: 'linear-gradient(145deg, #FFD700 0%, #FF9800 50%, #FFE082 100%)',
  },

  /* ══════════════════════════════════════════════════════
     PARENT THEMES (unchanged, used by parent UI)
  ══════════════════════════════════════════════════════ */
  C: {
    id: 'C', name: 'מודרני ונקי ✨', label: 'Style C',
    font: "'Heebo', sans-serif",
    bgGrad: 'linear-gradient(145deg,#F4F6FF 0%,#E8FFF9 60%,#FFF4F0 100%)',
    card: '#FFFFFF', sheetBg: '#F4F6FF', panelBg: '#fff',
    primary: '#5E60CE', secondary: '#48CAE4', accent: '#F77F00',
    purple: '#9B5DE5', danger: '#EF476F', success: '#06D6A0', warning: '#FFD166',
    text: '#1E1E3F', textLight: '#7070A0', textMid: '#4040A0',
    textOnPrimary: '#fff',
    border: 'none', cardBorder: 'none',
    shadow: '0 2px 16px rgba(94,96,206,.10)', cardShadow: '0 2px 16px rgba(94,96,206,.10)',
    btnShadow: '0 4px 16px rgba(94,96,206,.30)', successShadow: '0 4px 16px rgba(6,214,160,.30)',
    radius: '14px', btnRadius: '10px', inputRadius: '10px', tabRadius: '8px', chipRadius: '50px',
    headerGrad: 'linear-gradient(135deg,#5E60CE 0%,#48CAE4 100%)',
    progressGrad: 'linear-gradient(90deg, #5E60CE, #48CAE4)',
    successGrad: 'linear-gradient(135deg,#06D6A0,#4ECDC4)',
    progressBg: '#EEF2FF', navBg: '#FFFFFF', inputBg: '#F4F6FF',
    coinBg: 'linear-gradient(145deg,#FFD700,#FF9800)',
    coinGrad: 'linear-gradient(145deg,#FFD700,#FF9800)',
  },
  A: {
    id: 'A', name: 'פסטל ורדרד 🌸', label: 'Style A',
    font: "'Heebo', sans-serif",
    bgGrad: 'linear-gradient(145deg,#FFE4EE,#EAF9F2,#EEE4FF)',
    card: '#fff', sheetBg: '#FEF0F8', panelBg: '#fff',
    primary: '#FF85A1', secondary: '#6DCFA0', accent: '#FFCC80',
    purple: '#C4A8E8', danger: '#FF6B6B', success: '#6DCFA0', warning: '#FFCC80',
    text: '#5C4070', textLight: '#AE98BE', textMid: '#7A6090', textOnPrimary: '#fff',
    border: 'none', cardBorder: 'none',
    shadow: '0 4px 20px rgba(200,160,220,.18)', cardShadow: '0 4px 20px rgba(200,160,220,.18)',
    btnShadow: '0 4px 14px rgba(255,133,161,.40)', successShadow: '0 4px 14px rgba(109,207,160,.40)',
    radius: '16px', btnRadius: '50px', inputRadius: '12px', tabRadius: '12px', chipRadius: '50px',
    headerGrad: 'linear-gradient(135deg,#FFB3C8,#C4A8E8)',
    progressGrad: 'linear-gradient(90deg,#FF85A1,#C4A8E8)',
    successGrad: 'linear-gradient(135deg,#6DCFA0,#A8E6C4)',
    progressBg: '#F5E8FF', navBg: '#fff', inputBg: '#FEF0F8',
    coinBg: 'linear-gradient(145deg,#FFD700,#FF9800)', coinGrad: 'linear-gradient(145deg,#FFD700,#FF9800)',
  },
  B: {
    id: 'B', name: 'קומיקס בולד 💥', label: 'Style B',
    font: "'Heebo', sans-serif",
    bgGrad: 'linear-gradient(145deg,#FFFDE6,#FFF0E4)',
    card: '#fff', sheetBg: '#FFFFF0', panelBg: '#fff',
    primary: '#FF3D57', secondary: '#00C851', accent: '#FF9800',
    purple: '#651FFF', danger: '#FF3D57', success: '#00C851', warning: '#FF9800',
    text: '#1A1A2E', textLight: '#777', textMid: '#444', textOnPrimary: '#fff',
    border: '2.5px solid #1A1A2E', cardBorder: '2.5px solid #1A1A2E',
    shadow: '4px 4px 0px #1A1A2E', cardShadow: '4px 4px 0px #1A1A2E',
    btnShadow: '3px 3px 0px #CC0022', successShadow: '3px 3px 0px #007A30',
    radius: '10px', btnRadius: '8px', inputRadius: '8px', tabRadius: '6px', chipRadius: '50px',
    headerGrad: 'linear-gradient(135deg,#FF3D57,#651FFF)',
    progressGrad: 'linear-gradient(90deg,#FF3D57,#FF9800)',
    successGrad: 'linear-gradient(135deg,#00C851,#69F0AE)',
    progressBg: '#FFF9C4', navBg: '#fff', inputBg: '#FFFFF0',
    coinBg: 'linear-gradient(145deg,#FFD700,#FF9800)', coinGrad: 'linear-gradient(145deg,#FFD700,#FF9800)',
  },
  D: {
    id: 'D', name: 'מסע אוצרות 🗺️', label: 'Style D',
    font: "'Heebo', sans-serif",
    bgGrad: 'linear-gradient(145deg,#FEF9EC,#FFF3E0)',
    card: '#FFFDF5', sheetBg: '#FFF8E1', panelBg: '#FFFDF5',
    primary: '#C8581A', secondary: '#2E8B57', accent: '#D4A017',
    purple: '#7B3F8C', danger: '#C0392B', success: '#2E8B57', warning: '#D4A017',
    text: '#3E2000', textLight: '#9E7040', textMid: '#6E4010', textOnPrimary: '#fff',
    border: '2px solid #C8A870', cardBorder: '2px solid #D4A017',
    shadow: '3px 3px 0px rgba(200,168,112,.45)', cardShadow: '3px 3px 0px rgba(200,168,112,.45)',
    btnShadow: '3px 3px 0px #8C3A00', successShadow: '3px 3px 0px #1B6640',
    radius: '8px', btnRadius: '8px', inputRadius: '6px', tabRadius: '6px', chipRadius: '50px',
    headerGrad: 'linear-gradient(135deg,#5C2800,#C8581A)',
    progressGrad: 'linear-gradient(90deg,#C8581A,#D4A017)',
    successGrad: 'linear-gradient(135deg,#2E8B57,#69F0AE)',
    progressBg: '#FFF8DC', navBg: '#FFFDF5', inputBg: '#FFF8E1',
    coinBg: 'linear-gradient(145deg,#FFD700,#FF9800)', coinGrad: 'linear-gradient(145deg,#FFD700,#FF9800)',
  },
  E: {
    id: 'E', name: 'ממתקים 🍭', label: 'Style E',
    font: "'Heebo', sans-serif",
    bgGrad: 'linear-gradient(145deg,#FFE4F5,#E0FAFF)',
    card: '#fff', sheetBg: '#FFF0FA', panelBg: '#fff',
    primary: '#FF4DA6', secondary: '#00D4C8', accent: '#FFB800',
    purple: '#CC44DD', danger: '#FF4444', success: '#00D4C8', warning: '#FFB800',
    text: '#330033', textLight: '#885588', textMid: '#552255', textOnPrimary: '#fff',
    border: 'none', cardBorder: 'none',
    shadow: '0 6px 24px rgba(255,77,166,.16)', cardShadow: '0 6px 24px rgba(255,77,166,.16)',
    btnShadow: '0 4px 16px rgba(255,77,166,.38)', successShadow: '0 4px 16px rgba(0,212,200,.38)',
    radius: '20px', btnRadius: '50px', inputRadius: '16px', tabRadius: '16px', chipRadius: '50px',
    headerGrad: 'linear-gradient(135deg,#FF4DA6,#CC44DD,#00D4C8)',
    progressGrad: 'linear-gradient(90deg,#FF4DA6,#CC44DD)',
    successGrad: 'linear-gradient(135deg,#00D4C8,#69F0AE)',
    progressBg: '#FFE4F5', navBg: '#fff', inputBg: '#FFF0FA',
    coinBg: 'linear-gradient(145deg,#FFD700,#FF9800)', coinGrad: 'linear-gradient(145deg,#FFD700,#FF9800)',
  },
};

export default THEMES;
