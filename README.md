# OFFICELL — Servicio Técnico & Banca

Sitio web oficial de **OFFICELL**, Danlí, El Paraíso, Honduras. Ofrece reparación profesional de celulares y computadoras, venta de equipos, recargas de diamantes Free Fire, servicios de agentes bancarios y un blog de consejos tecnológicos.

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
├── tienda.html                                 ← Catálogo + Diamantes Free Fire + carrito + checkout
├── taller.html                                 ← Rastreo público de órdenes de reparación (por código)
├── seguimiento.html                            ← Rastreo público de pedidos de tienda web
├── contacto.html                               ← Página de contacto
├── agentes-bancarios.html                      ← Servicios de agentes bancarios (Atlántida, BAC, etc.)
├── ganar-dinero.html                           ← Ingresos extra / referidos
├── blog.html                                   ← Índice del blog
├── sobre-nosotros.html                         ← Historia y equipo de OFFICELL
├── politica-privacidad.html                    ← Política de privacidad
│
├── — Paneles admin (requieren contraseña) ———
├── admin-taller.html                           ← Gestión de órdenes de reparación
├── admin-productos.html                        ← Gestión de inventario y pedidos de tienda
│
├── — Herramientas internas ——————————————————
├── qr-diamantes-ff.html                        ← Hoja de 30 QR de Free Fire para imprimir
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
├── img/                                        ← Imágenes de productos
├── sitemap.xml                                 ← Mapa del sitio para motores de búsqueda
├── robots.txt                                  ← Directivas para rastreadores
├── favicon.ico                                 ← Ícono del sitio (navegador)
├── favicon-192.png                             ← Ícono para dispositivos móviles / PWA
└── LOGO_OFFICELL.png                           ← Logo oficial
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

## Paneles administrativos

### `admin-taller.html` — Gestión del taller
- Crear, actualizar y cancelar órdenes de reparación
- Imprimir recibos en formato A4 y 80mm térmico (con QR)
- Imprimir plantillas en blanco para llenar a mano
- Los recibos incluyen código de seguimiento y QR para el cliente

### `admin-productos.html` — Tienda y pedidos
- Gestionar inventario de productos (agregar, editar, activar/desactivar)
- Ver y gestionar pedidos de la tienda web (cambiar estado, ver ID de juego Free Fire)

### `admin-keyson.html` — Auditoría de conversaciones de WhatsApp
- Panel de solo lectura para revisar las conversaciones del asistente Keyson
- Búsqueda de clientes por nombre/número y filtro por período (7/30/90 días o todo)

**Acceso a ambos paneles (los tres: taller, productos y keyson):**
- Login por contraseña contra `POST /admin/login`; el servidor devuelve un **JWT**
- Las peticiones autenticadas envían el token como header `Authorization: Bearer <jwt>` (helper `authHeaders()`)
- **Backend/API:** `https://officell-ia-production.up.railway.app/api/tienda`
- La contraseña **no está en el código fuente** — la verifica el servidor en Railway
- La sesión se guarda en `sessionStorage` (`oc_admin_jwt`); un `401` (token expirado) cierra sesión y pide volver a ingresar

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
