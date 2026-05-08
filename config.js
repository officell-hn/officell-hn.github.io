// config.js — Configuración global del sitio OFFICELL
// Cambiar aquí afecta a todas las páginas que incluyan este archivo

const OFFICELL_CONFIG = {
  // URL base de la API backend (Railway)
  API: 'https://officell-ia-production.up.railway.app/api/tienda',

  // WhatsApp principal del negocio
  WHATSAPP: '50493323393',
  WHATSAPP_URL: 'https://wa.me/50493323393',

  // Datos del negocio
  NOMBRE: 'OFFICELL',
  SLOGAN: 'Tu celular como nuevo — garantizado',
  UBICACION: 'Danlí, Honduras',

  // Colores de marca
  COLORES: {
    azul:    '#185FA5',
    blanco:  '#FFFFFF',
    naranja: '#EF9F27'
  }
};

// Exponer como variable global
if (typeof window !== 'undefined') {
  window.OFFICELL_CONFIG = OFFICELL_CONFIG;
  window.API = OFFICELL_CONFIG.API; // compatibilidad con código existente
}
