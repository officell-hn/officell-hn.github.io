# MEJORAS_WEB.md — OFFICELL Admin Panel
> Última revisión: 2026-06-11

---

## ✅ Bugs corregidos — revisión 2026-06-11

| Archivo | Línea aprox. | Problema | Fix aplicado |
|---|---|---|---|
| `admin-taller.html` | 818 | **CRÍTICO**: `imprimirPlantilla()` usaba `.then()` en `QRCode.toDataURL(...)` dentro de un bloque `async/try/finally`. El `finally` corría inmediatamente después de registrar el callback `.then()`, antes de que el QR se generara. Resultado: el botón volvía a "🖨️ Plantilla" y se rehabilitaba mientras la ventana de impresión aún no había abierto. El usuario podía creer que falló y clickear de nuevo, creando órdenes dobles. | Convertido a `const qrDataUrl = await QRCode.toDataURL(...)`. El `finally` ahora corre después de que todo el flujo de impresión completa. |
| `admin-taller.html` | 1059 | **BUG**: El listener de "cerrar al click fuera" para `overlayEstado` solo hacía `this.classList.remove('open')`, sin llamar a `cerrarModalEstado()`. Si el admin abría un modal de estado con pago adelantado, marcaba el checkbox y el monto, luego cerraba clickeando fuera: al abrir la siguiente orden, el checkbox y el monto del adelanto anterior seguían activos. Podía registrar un pago adelantado sin querer en la orden equivocada. | Separado el listener de `overlayEstado` del loop. Ahora llama directamente a `cerrarModalEstado()` que resetea todos los campos de adelanto. |
| `admin-keyson.html` | 404 | **BUG**: `init()` se llamaba dos veces al cargar la página: una vez por `window.addEventListener('load', ...)` y otra vez por código inline al final del script. Resultado: `cargarStats()` y `cargarClientes()` se ejecutaban dos veces en cada carga, causando doble consumo de API. | Removida la llamada inline duplicada; el listener `load` es suficiente. |

---

## ✅ Bugs corregidos — revisión 2026-06-04

| Archivo | Línea aprox. | Problema | Fix aplicado |
|---|---|---|---|
| `admin-taller.html` | 696 | **CRÍTICO**: `actualizarEstado()` deshabilitaba el botón "Guardar Cambios" ANTES de validar el monto de pago adelantado. Si la validación fallaba, el `return` dejaba el botón bloqueado permanentemente (sin `finally`). El admin no podía guardar sin recargar la página. | Movidas las lecturas y validación de pago adelantado ANTES de la línea que deshabilita el botón. Ahora el `return` temprano es seguro. |
| `admin-taller.html` | 1044 | **BUG**: `esc()` no escapaba el carácter `&`. Nombres como "Pedro & María" podían renderizar mal en la tabla o en la vista de detalle. | Agregado `.replace(/&/g,'&amp;')` como primer paso en la cadena de reemplazos (debe ir primero para no re-escapar los `&` ya generados). |
| `admin-productos.html` | 511 | **BUG AUTH**: `cargarProductos()` usaba `fetch()` directamente en lugar de `apiFetch()`. Si el JWT expiraba mientras el admin tenía la pestaña abierta y hacía refresh manual, el 401 mostraba "Error" genérico en la tabla sin cerrar sesión automáticamente. | Reemplazado `fetch()` por `apiFetch()`. |
| `admin-productos.html` | 881 | **BUG AUTH**: `guardarProducto()` (crear/editar producto) usaba `fetch()` directamente. Un 401 mostraba el error por toast pero no forzaba logout. | Reemplazado `fetch()` por `apiFetch()`. |
| `tienda.html` | 803–838 | **BUG UX**: Al completar un pedido exitosamente, los botones "Confirmar pedido" quedaban deshabilitados y con texto "⏳ Enviando...". Si el cliente agregaba productos y abría el checkout nuevamente en la misma sesión, todos los botones de confirmación estaban bloqueados. | Los botones ahora guardan su texto original en `data-originalText` antes de deshabilitarse. El bloque `finally` siempre (no solo en fallo) re-habilita y restaura el texto de cada botón. |

---

## ✅ Bugs corregidos — revisión 2026-05-28

| Archivo | Línea aprox. | Problema | Fix aplicado |
|---|---|---|---|
| `admin-taller.html` | 500 | **CRÍTICO**: `cargarOrdenes()` enviaba `?estado=filtroActual` a la API cuando había un filtro activo, reemplazando `ORDENES` con solo ese subconjunto. Al hacer "Todos", `filtrar()` mostraba solo esas órdenes. Las stats mostraban conteos incorrectos. | Se eliminó el parámetro de la URL; el filtrado es ahora puramente client-side. `ORDENES` siempre tiene el set completo. |
| `admin-taller.html` | 556 | **BUG**: `renderStats(ordenes)` recibía un parámetro pero calculaba todo desde el global `ORDENES` (el parámetro era dead code). | Corregido para usar el parámetro recibido. |
| `admin-taller.html` | 889, 976 | **CRASH**: `window.open()` no tenía null-check en `imprimir()` ni en `imprimirPlantilla()`. Con popups bloqueados, `win.document.write(...)` arrojaba `TypeError` y rompía el flujo de impresión. (admin-productos.html sí tenía el check; taller no.) | Agregado `if (!win) { alert(...); return; }` en ambas funciones. |
| `admin-taller.html` | 703 | **FALLA SILENCIOSA**: El fetch de adelanto se hacía `await` pero la respuesta nunca se leía. Un error del servidor (401, 500) pasaba invisible — la orden se actualizaba pero el pago no se registraba. | Agregado `const da = await ra.json(); if (!da.ok) alert(...)`. |
| `tienda.html` | 425 | **CRASH EN CARGA**: `JSON.parse(localStorage.getItem('officell_carrito'))` sin try/catch. Si localStorage contenía JSON corrupto, la excepción se lanzaba en tiempo de evaluación del script, dejando `carrito` indefinido y toda la tienda rota. | Envuelto en IIFE con try/catch, retorna `[]` en caso de error. |
| `admin-productos.html` | 540 | **IMAGEN ROTA**: El thumbnail de la tabla de productos usaba `p.imagen_url` como `src` directamente. Para productos con múltiples imágenes, el campo es un JSON array `["url1","url2"]`, que el browser no puede cargar como URL. | Agregado parseo JSON para extraer la primera URL antes de asignarla al `src`. |
| `admin-productos.html` | 930 | **CRASH**: `JSON.parse(p.productos)` dentro de `renderPedidos` sin try/catch. Un registro con JSON malformado crasheaba el `.map()` completo dejando la tabla de pedidos vacía sin mensaje de error. | Envuelto en try/catch; retorna `[]` en caso de error de parseo. |

---

## ✅ Bugs corregidos — revisión 2026-05-14

| Archivo | Línea aprox. | Problema | Fix aplicado |
|---|---|---|---|
| `admin-productos.html` | 971 | **CRÍTICO**: `eliminarPedido` usaba `localStorage.getItem('adminJwt')` → siempre enviaba `null` como Bearer token, causando 401 en todas las eliminaciones de pedidos | Reemplazado por `authHeaders()` |
| `admin-productos.html` | 489, 257–258 | `showTab()` usaba `event.currentTarget` implícito (deprecated, falla en Firefox strict mode) | Pasado `this` desde onclick; función acepta `btn` como parámetro |
| `admin-taller.html` | 723–731 | `cancelarOrden()` no verificaba respuesta de la API; fallaba silenciosamente si el servidor devolvía error | Agregado `r.json()` + `if (!d.ok) throw` |
| `admin-productos.html` | 889 | `colspan="9"` en tabla de pedidos que tiene 10 columnas (celda de carga no ocupaba todo el ancho) | Corregido a `colspan="10"` |
| `tienda.html` | 644 | `renderCarrito()` usaba `item.imagen_url` directamente como `src`; si el campo es JSON array `["url1","url2"]`, la imagen del carrito se rompía | Parseo de JSON array para extraer primera URL |
| Todo el sitio (20 páginas) | — | Links de Hondubet apuntaban a sección casino en lugar de sección deporte | Todos los hrefs actualizados a la sección deporte (commit `2695368`) |

---

## 🔴 Alta prioridad (funcionalidad crítica o UX muy afectada)

### ~~1. Manejo de sesión expirada (401) en todas las páginas admin~~ ✅ IMPLEMENTADO
**Verificado 2026-06-11:** `apiFetch()` existe y funciona en `admin-taller.html` (línea 438) y `admin-productos.html` (línea 433). Todas las llamadas autenticadas usan el wrapper. Cuando hay 401, muestra "Sesión expirada" y llama a `doLogout()`.

---

### ~~2. Campo de búsqueda en tabla de órdenes del taller~~ ✅ IMPLEMENTADO
**Verificado 2026-06-11:** El toolbar de `admin-taller.html` ya tiene el campo `#buscarOrden` con `oninput="buscarEnOrdenes()"` y la función `buscarEnOrdenes()` / `aplicarFiltros()` filtra por equipo, cliente, teléfono y código de seguimiento. Funciona correctamente.

---

### ~~3. `filtrarPedidos()` no busca por `codigo_seguimiento`~~ ✅ YA RESUELTO
**Fix verificado 2026-06-04:** El código actual en `filtrarPedidos()` ya incluye `(p.codigo_seguimiento||'').toLowerCase().includes(q)` en el filtro. La búsqueda por código funciona correctamente.

---

## 🟡 Media prioridad (mejora de usabilidad significativa)

### ~~4. Botón "Guardar" no se deshabilita durante `actualizarEstado()`~~ ✅ IMPLEMENTADO
**Verificado 2026-06-11:** Línea ~706 de `admin-taller.html`: `if (btnGuardar) { btnGuardar.disabled = true; btnGuardar.textContent = '⏳ Guardando...'; }` y el `finally` lo rehabilita. El patrón anti-doble-click está implementado.

---

### ~~5. Paginación en tabla de órdenes del taller~~ ✅ IMPLEMENTADA 2026-06-12
**Fix aplicado:** Paginación client-side de 25 órdenes por página. Barra `◀ Anterior · Página X de Y (N órdenes) · Siguiente ▶` bajo la tabla, oculta con ≤25 resultados. `aplicarFiltros()` guarda `listaFiltrada` y resetea a página 1 en cada cambio de filtro/búsqueda; `renderTabla()` renderiza solo el slice de la página actual; `verificarToken()` ahora pasa por `aplicarFiltros()` para mantener el estado sincronizado. Probado con DOM simulado (60 órdenes: navegación, clamp en extremos, reset por búsqueda).

---

### ~~6. Exportar órdenes del taller a CSV~~ ✅ IMPLEMENTADA 2026-06-12
**Fix aplicado:** Botón "⬇️ CSV" en el toolbar. `exportarCSV()` exporta `listaFiltrada` (respeta filtro de estado y búsqueda activos) vía `Blob` + `URL.createObjectURL`. Escapado RFC-4180 (comas, comillas, saltos de línea), BOM `\uFEFF` para que Excel detecte UTF-8, nombre `ordenes_taller_YYYY-MM-DD.csv` con fecha Honduras. Columnas: Código, Equipo, Cliente, Teléfono, Estado, Fecha Entrada, Entrega Estimada, Precio, Notas. Probado con DOM simulado.

---

### ~~7. `imprimir()` en admin-taller no tiene `.catch()` en QRCode.toDataURL~~ ✅ YA RESUELTO
**Verificado 2026-06-12:** La cadena de promesas de `imprimir()` (~línea 1021) ya termina con `.catch(err => { console.error(...); alert('Error al generar el QR del recibo. Intenta de nuevo.'); })`. Se corrigió junto con el fix de `imprimirPlantilla` sin registrarse en este MD.

---

### ~~8. `populateCatFilter` duplica opciones en el datalist del modal~~ ✅ YA RESUELTO
**Verificado 2026-06-12:** La función ya deduplica con `const todas = [...new Set([...cats, ...base])].sort()` antes de regenerar el datalist (~línea 541), con comentario "sin duplicar las opciones base".

---

### ~~9. `abrirModalEditar` serializa producto completo en atributo onclick~~ ✅ YA RESUELTO
**Verificado 2026-06-12:** El botón editar ahora usa `data-id="${p.id}"` con `onclick="abrirModalEditarPorId(this.dataset.id)"` (~línea 578), y `abrirModalEditarPorId(id)` busca el producto en `todosProductos` antes de llamar a `abrirModalEditar(p)`. El objeto ya no se serializa en el HTML.

---

## 🟢 Baja prioridad (nice to have)

### ~~10. Confirmación antes de logout~~ ✅ IMPLEMENTADO
**Verificado 2026-06-11:** Ambos archivos tienen `if (!confirm('¿Cerrar sesión?')) return;` en la función `logout()`.

---

### 11. Filtro de rango de fechas en órdenes del taller
**Archivo:** `admin-taller.html`  
Actualmente solo se filtra por estado. Un filtro de fecha de entrada (ej. "esta semana", "este mes") ayudaría para reportes rápidos.

---

### 12. `auto-login` de admin-productos verifica consultando la lista de productos
**Archivo:** `admin-productos.html`, ~línea 471  
El auto-login hace un fetch a `${API}/admin/productos` solo para verificar el JWT. Si la lista de productos es grande esto es costoso. Sería más eficiente tener un endpoint `/admin/ping` o `/admin/me` que solo devuelva `{ok: true}`.  
*(Requiere cambio en backend Railway.)*

---

### ~~13. Variable CSS `--azul` no definida en `tienda.html`~~ ✅ IMPLEMENTADA 2026-06-12
**Fix aplicado:** Agregado `--azul:#185FA5;` al bloque `:root` de tienda.html.

---

### ~~14. `previewImg()` es un wrapper trivial innecesario en `admin-productos.html`~~ ✅ IMPLEMENTADA 2026-06-12
**Fix aplicado:** `abrirModalEditar()` llama directamente a `actualizarPreviews()`; el wrapper `previewImg()` fue eliminado (0 referencias restantes).

---

### ~~15. Regla CSS vacía `.cat-datalist {}` en `admin-productos.html`~~ ✅ IMPLEMENTADA 2026-06-12
**Fix aplicado:** Regla vacía y su comentario eliminados.

---

### 16. `esc()` de `admin-taller.html` y `escHtml()` de `admin-productos.html` son inconsistentes
**Archivos:** Ambos admin  
**Problema:** Existen dos funciones de escape con nombres distintos y comportamientos ligeramente distintos en el proyecto. `taller.html` (público) tiene la versión más completa (escapa `&`, `<`, `>`, `"`, `'`). La de admin-taller.html escapa `&`, `<`, `>`, `"` pero no `'`.  
**Solución a largo plazo:** Unificar en un solo `config.js` o un archivo `utils.js` compartido con la función completa.

---

### ~~17. `admin-keyson.html` — `authHeaders()` incluye Content-Type en todas las peticiones~~ ✅ YA RESUELTO
**Verificado 2026-06-12:** Ya existen `authHeaders()` (solo Authorization, usada en los GET) y `authHeadersPost()` (con Content-Type) separadas — la solución propuesta está aplicada.

---

### ~~18. `seguimiento.html` — QR de seguimiento usa servicio externo~~ ✅ YA RESUELTO
**Verificado 2026-06-12:** `seguimiento.html` ya carga `qrcode.min.js` desde CDN (línea 82) y genera el QR localmente con `QRCode.toCanvas()` (línea 163). No queda referencia a qrserver.com.

---

*Generado automáticamente por revisión de código — OFFICELL Admin*
