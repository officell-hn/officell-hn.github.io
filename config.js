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
  SLOGAN: 'Tecnología, Banca y Más.',
  UBICACION: 'Danlí, Honduras',

  // Cloudinary — subida de fotos de producto desde el panel (9-ago-2026).
  // Antes había que hostear cada foto por fuera y pegar el link a mano; con esto
  // se sube desde la cámara del teléfono y la URL se llena sola.
  // CLOUD_NAME y UPLOAD_PRESET salen del panel de Cloudinary (el preset debe ser
  // "Unsigned" — es lo único que permite subir desde el navegador sin exponer el
  // API secret). Mientras estén vacíos, el botón de subir no aparece y se sigue
  // pudiendo pegar URLs a mano.
  CLOUDINARY: {
    CLOUD_NAME:    'rnk4ftug',
    UPLOAD_PRESET: 'officell_productos',
    CARPETA:       'productos'
  },

  // Colores de marca (logo nuevo, 7-ago-2026). Base grafito + blanco;
  // los cuatro del isotipo se usan como acento, no como fondos grandes.
  COLORES: {
    grafito: '#25282A',
    blanco:  '#FFFFFF',
    magenta: '#C6007E',
    cian:    '#59C7F2',
    ambar:   '#FDB913',
    verde:   '#00A74A'
  }
};

// Escape HTML para prevenir XSS al insertar datos del servidor via innerHTML.
// Función canónica compartida — usar esc() o escHtml() (alias) en todas las páginas.
function escHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

// Exponer como variable global
if (typeof window !== 'undefined') {
  window.OFFICELL_CONFIG = OFFICELL_CONFIG;
  window.API = OFFICELL_CONFIG.API; // compatibilidad con código existente
  window.escHtml = escHtml;
  window.esc = escHtml; // alias — ambos nombres apuntan a la misma función completa
}
