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

### 5. Paginación en tabla de órdenes del taller
**Archivo:** `admin-taller.html`  
**Problema:** Si el taller acumula 200+ órdenes, la tabla renderiza todo en DOM de una vez. Puede volverse lenta.  
**Solución propuesta:** Paginación simple de 25 órdenes por página con botones Anterior/Siguiente. Alternativa más simple: limitar la carga a las últimas 100 órdenes por defecto y agregar botón "Ver todas".

---

### 6. Exportar órdenes del taller a CSV
**Archivo:** `admin-taller.html`  
**Problema:** Solo existe impresión de recibo individual o plantilla. No hay forma de exportar el listado de órdenes (ej. para reportes semanales en Excel).  
**Solución propuesta:** Botón "⬇️ CSV" en el toolbar que genere un CSV del listado actual (respetando el filtro activo) y lo descargue vía `Blob` + `URL.createObjectURL`.

---

### 7. `imprimir()` en admin-taller no tiene `.catch()` en QRCode.toDataURL
**Archivo:** `admin-taller.html`, función `imprimir()` (~línea 954)  
**Problema:** `imprimir()` usa `QRCode.toDataURL(...).then(qrDataUrl => { ... })` sin `.catch()`. Si la librería QRCode falla (por ej. código muy largo), la promesa rechaza silenciosamente y la ventana de impresión nunca se abre. No hay feedback al usuario.  
**Solución:** Agregar `.catch(err => alert('Error generando QR: ' + err.message))` al final de la cadena de promesas, o convertir a `async function imprimir(...)` con try/catch como ya se hizo con `imprimirPlantilla`.

---

### 8. `populateCatFilter` duplica opciones en el datalist del modal
**Archivo:** `admin-productos.html`, función `populateCatFilter()` (~línea 539)  
**Problema:** El datalist `#cats-list` se reconstruye concatenando las categorías del backend con opciones hardcodeadas fijas (`otros`, `accesorios`, `cargadores`, etc.). Si el backend ya tiene esas categorías, aparecen duplicadas en el autocompletado.  
**Solución:** Usar `new Set([...cats, 'otros', 'accesorios', 'cargadores', 'carcasas', 'cables'])` para deduplicar antes de generar las `<option>`.

---

### 9. `abrirModalEditar` serializa producto completo en atributo onclick
**Archivo:** `admin-productos.html`, `renderProductos()` (~línea 577)  
**Problema:** `onclick="abrirModalEditar(${JSON.stringify(p).replace(/"/g,'&quot;')})"` embeds el objeto completo del producto en el HTML. Aunque `JSON.stringify` escapa la mayoría de caracteres especiales, este patrón es frágil y puede romperse con descripciones largas o caracteres exóticos. Es difícil de mantener.  
**Solución:** Guardar el ID en `data-id` y buscar el producto en `todosProductos`:
```html
onclick="abrirModalEditar('${escHtml(p.id)}')"
```
```javascript
function abrirModalEditar(id) {
  const p = todosProductos.find(x => x.id === id);
  if (!p) return;
  // resto del código igual
}
```

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

### 13. Variable CSS `--azul` no definida en `tienda.html`
**Archivo:** `tienda.html`, ~línea 155  
**Problema:** `.pago-tab.active` usa `var(--azul,#185FA5)` pero `--azul` no está en el `:root` de tienda.html (sí está en admin-productos.html). El CSS usa siempre el valor de fallback `#185FA5`, por lo que funciona visualmente, pero es confuso y frágil.  
**Solución:** Agregar `--azul: #185FA5;` al bloque `:root` de tienda.html, o reemplazar `var(--azul,#185FA5)` por el literal.

---

### 14. `previewImg()` es un wrapper trivial innecesario en `admin-productos.html`
**Archivo:** `admin-productos.html`, ~línea 847  
```javascript
function previewImg() { actualizarPreviews(); }
```
Esta función solo llama a `actualizarPreviews()`. El único lugar donde se llama es `abrirModalEditar()`. Puede reemplazarse directamente por `actualizarPreviews()` para eliminar indirección.

---

### 15. Regla CSS vacía `.cat-datalist {}` en `admin-productos.html`
**Archivo:** `admin-productos.html`, ~línea 226  
```css
.cat-datalist { }
```
Regla vacía sin propiedades — residuo de una clase que se planificó y no se implementó. Puede eliminarse sin efecto.

---

### 16. `esc()` de `admin-taller.html` y `escHtml()` de `admin-productos.html` son inconsistentes
**Archivos:** Ambos admin  
**Problema:** Existen dos funciones de escape con nombres distintos y comportamientos ligeramente distintos en el proyecto. `taller.html` (público) tiene la versión más completa (escapa `&`, `<`, `>`, `"`, `'`). La de admin-taller.html escapa `&`, `<`, `>`, `"` pero no `'`.  
**Solución a largo plazo:** Unificar en un solo `config.js` o un archivo `utils.js` compartido con la función completa.

---

### 17. `admin-keyson.html` — `authHeaders()` incluye Content-Type en todas las peticiones
**Archivo:** `admin-keyson.html`, ~línea 195  
```javascript
function authHeaders() {
  return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}` };
}
```
Los requests GET (cargarStats, cargarClientes, abrirConversacion) no tienen body, por lo que incluir `Content-Type: application/json` es innecesario. No causa errores pero es semánticamente incorrecto.  
**Solución:** Separar los headers según el tipo de request, o solo devolver `Authorization` y agregar `Content-Type` manualmente en los requests POST/PUT.

---

### 18. `seguimiento.html` — QR de seguimiento usa servicio externo
**Archivo:** `seguimiento.html`, ~línea 153  
```html
<img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=...">
```
El QR se genera enviando la URL de seguimiento a un servicio de terceros (qrserver.com). Depende de disponibilidad externa y comparte la URL con ese servidor.  
**Solución:** Incluir la librería `qrcode.min.js` (ya disponible en admin-taller.html vía CDN) y generar el QR localmente con `QRCode.toDataURL()`.

---

*Generado automáticamente por revisión de código — OFFICELL Admin*
