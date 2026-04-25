# OFFICELL Servicio Técnico

Sitio web oficial de **OFFICELL**, el servicio técnico de referencia en Danlí, El Paraíso, Honduras. Ofrece reparación profesional de celulares y computadoras, venta de equipos, servicios de agentes bancarios y un blog de consejos tecnológicos.

---

## Sitio en vivo

**https://officell-hn.github.io**

Desplegado automáticamente por GitHub Pages desde la rama `main`. Cada `git push origin main` publica los cambios en minutos, sin pasos adicionales.

---

## Stack

- **HTML / CSS / JS estático puro** — sin framework, sin build tool, sin npm.
- CSS y JS escritos directamente (inline) dentro de cada archivo `.html`.
- **CDN externos:**
  - Google Fonts (Bebas Neue, DM Sans)
  - Google AdSense (`ca-pub-2940299212538219`)
  - Google Analytics (`G-Z5D12EC06P`)
- **Deploy:** GitHub Pages — rama `main` → producción automática.

No se requiere ninguna instalación para trabajar en este proyecto.

---

## Estructura del proyecto

```
/
├── index.html                                  ← Página principal (hero, servicios, ubicación)
├── tienda.html                                 ← Catálogo de teléfonos y accesorios
├── agentes-bancarios.html                      ← Servicios de agentes bancarios (Atlántida, BHD, etc.)
├── ganar-dinero.html                           ← Ingresos extra / referidos
├── blog.html                                   ← Índice del blog
├── sobre-nosotros.html                         ← Historia y equipo de OFFICELL
├── politica-privacidad.html                    ← Política de privacidad
├── admin-productos.html                        ← Panel interno de administración (ver sección abajo)
│
├── — Artículos del blog (SEO) ——————————————
├── 5-senales-bateria-danada.html
├── como-desbloquear-celular-operadora-honduras.html
├── como-enviar-recibir-remesas-honduras.html
├── como-hacer-respaldo-celular.html
├── como-proteger-celular-de-virus.html
├── como-saber-si-pantalla-es-original.html
├── cuanto-cuesta-reparar-pantalla-celular.html
├── iphone-vs-samsung-reparacion.html
├── que-hacer-celular-mojado.html
│
├── img/                                        ← Imágenes de productos (19 archivos)
├── sitemap.xml                                 ← Mapa del sitio para motores de búsqueda
├── robots.txt                                  ← Directivas para rastreadores
├── favicon.ico                                 ← Ícono del sitio (navegador)
├── favicon-192.png                             ← Ícono para dispositivos móviles / PWA
├── LOGO_OFFICELL.png                           ← Logo oficial
└── OFFICELL_Web.html                           ← Draft / versión de trabajo alternativa (no publicada en nav)
```

---

## Cómo trabajar localmente

```bash
# 1. Clonar el repositorio
git clone https://github.com/officell-hn/officell-hn.github.io.git
cd officell-hn.github.io

# 2. Abrir en el navegador
#    Opción A — abrir directamente el archivo:
open index.html        # macOS
start index.html       # Windows

#    Opción B — servidor local (recomendado para evitar restricciones CORS):
python -m http.server 8000
# Luego visitar http://localhost:8000

# 3. Editar los archivos .html con cualquier editor de texto.

# 4. Publicar cambios
git add nombre-del-archivo.html
git commit -m "Descripción del cambio"
git push origin main
```

No hay dependencias que instalar. Los cambios en `main` se publican solos en GitHub Pages.

---

## Panel administrativo

`admin-productos.html` es un panel interno para gestionar el catálogo de productos y pedidos.

- **Acceso:** protegido por contraseña. El token se envía como header `x-admin-token` en cada petición.
- **Backend:** la validación y los datos viven en una API externa en Railway:
  `https://officell-ia-production.up.railway.app/api/tienda`
- **Sesión:** el token válido se guarda en `localStorage` (`oc_admin_token`) para mantener la sesión entre visitas.
- La contraseña **no está almacenada en el código fuente** — la verifica el servidor.

---

## Mantenimiento — puntos clave

- **Nueva página:** al agregar un archivo `.html` nuevo, actualizar `sitemap.xml` con la URL y fecha, y agregar el enlace en el menú de navegación de todas las páginas que corresponda.
- **Imágenes:** colocarlas en la carpeta `img/`. Optimizar el tamaño antes de subir (preferir `.webp` cuando sea posible) para mejorar la velocidad de carga y el SEO.
- **Sin build:** no hay proceso de compilación. Lo que se sube es lo que se sirve.
- **CSS global:** como cada página tiene su propio CSS inline, los cambios de estilo global deben aplicarse manualmente en cada archivo afectado.

---

## Contacto y datos del negocio

| Campo | Dato |
|---|---|
| **Dirección** | Barrio El Centro, frente a Óptica Rivera Visión, Danlí, El Paraíso, Honduras |
| **WhatsApp** | [+504 9332-3393](https://wa.me/50493323393) |
| **Teléfono fijo** | 2709-9294 |

Atención al cliente disponible 24/7 a través del asistente IA **KEYSON** vía WhatsApp.
