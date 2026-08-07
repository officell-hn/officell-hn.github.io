# MEJORAS_WEB.md — OFFICELL Admin Panel
> Última revisión: 2026-07-30

---

## ✅ Mejora aplicada — revisión 2026-07-30

| Archivo | Línea aprox. | Problema | Fix aplicado |
|---|---|---|---|
| `admin-productos.html` | 555 (`renderProductos`) | **UX / RENDIMIENTO (pestaña Productos sin paginación)**: la tabla de inventario renderizaba **TODOS** los productos de una sola vez (`renderProductos` no paginaba), a diferencia de Pedidos (`17b`, 20/pág) y del Taller (25/pág), que sí paginan. Para una tienda de celulares el inventario crece a decenas o cientos de SKU, cada fila con `<img>` thumbnail → DOM grande, scroll pesado y render lento en móviles de gama baja. | Paginación client-side de **25 productos por página** (`POR_PAGINA_PRODUCTOS = 25`), reusando el mismo patrón probado de Pedidos: `renderProductos(prods, resetPagina=true)` guarda el set en `productosFiltrados` y vuelve a página 1 en cada filtro/búsqueda/recarga; `cambiarPaginaProductos()` navega sin resetear; `renderPaginacionProductos()` pinta la barra `◀ Anterior · Página X de Y (N productos) · Siguiente ▶` (id `#pag-productos`), oculta con ≤25 resultados. Los toggles, editar y eliminar siguen operando por `id`/`data-id`, no por índice de fila, así que la paginación no los afecta. `filtrarTabla()` y `eliminarProducto()` (que llama `filtrarTabla()`) resetean a página 1 — consistente con Pedidos. |

**Notas de la revisión 2026-07-30:** revisados `admin-taller.html`, `admin-productos.html`, `admin-keyson.html`, `config.js` y las páginas funcionales de cliente (`tienda.html`, `seguimiento.html`). **Sin bugs críticos ni de lógica JS.**
- **Autenticación correcta** en los tres paneles: login → `POST /admin/login` → JWT → `Authorization: Bearer` vía `authHeaders()`. `apiFetch()` maneja `401` (alerta + `doLogout()`) en taller/productos; keyson hace `logout()` en `401` en cada GET. **Ningún** fetch usa `x-admin-token` ni auth incorrecta.
- Sin `getElementById` a IDs inexistentes (verificado por script en los 3 admin). Sin variables CSS ni referencias DOM rotas. Sin funciones duplicadas ni código muerto nuevo. Escape HTML unificado en `config.js` (escapa también `'`).
- Columna nueva "Venta permanente" (`reposicion`, commit `3e15bb5`): coherente — header y `colspan=11` cuadran (11 columnas), el toggle reusa `toggleCampo` y actualiza el estado local correctamente.
- El único hallazgo accionable fue la falta de paginación en la tabla de Productos, ya corregida arriba.

### Mejoras identificadas — pendientes (revisión 2026-07-30)

**M1 (Media). Exportar inventario de productos a CSV.**
`admin-productos.html` ya imprime el inventario a PDF (`imprimirInventario()`, respeta filtros), pero no exporta CSV. El Taller sí tiene botón CSV (`exportarCSV()`, con BOM UTF-8 para Excel y escape de celdas). Propuesta: replicar `exportarCSV()` en Productos sobre `productosFiltrados` (columnas: Nombre, Categoría, Condición, Precio, Costo, Stock, En Web, Destacado, Venta permanente) — reutilizar el mismo helper `celda()` y el prefijo `﻿`. Bajo riesgo, patrón ya existente en el repo.

**M2 (Baja). Exportar pedidos a CSV.**
La pestaña Pedidos no tiene export. Útil para conciliar ventas del mes (código, cliente, teléfono, game_id, total, método, estado, fecha). Mismo patrón `exportarCSV()`. Prioridad baja: el volumen de pedidos web es menor y ya hay seguimiento por código.

> Última revisión: 2026-07-23

---

## ✅ Correcciones — revisión 2026-07-23

| Archivo | Línea aprox. | Problema | Fix aplicado |
|---|---|---|---|
| `README.md` | 112–116 | **DOC DESACTUALIZADA (auth)**: la sección "Acceso a ambos paneles" describía el mecanismo de autenticación **anterior**, ya eliminado del código: decía que los paneles se protegen con un header `x-admin-token` y que la sesión se guarda en `localStorage` (`oc_admin_token`). El código real (los tres paneles + `config.js`) usa **JWT**: login contra `POST /admin/login`, header `Authorization: Bearer <jwt>` vía `authHeaders()`, y sesión en `sessionStorage` (`oc_admin_jwt`). Cualquiera que leyera el README para entender/mantener la auth quedaba mal informado (buscaría un header y un storage que no existen). No hay ningún `x-admin-token` ni `oc_admin_token` en el código — solo en esta doc. | Reescrita la sección con el flujo real (login → JWT → `Authorization: Bearer`, `sessionStorage` `oc_admin_jwt`, `401` cierra sesión). |
| `README.md` | 108–110 | **DOC INCOMPLETA**: `admin-keyson.html` (panel de auditoría de conversaciones de WhatsApp) no estaba documentado entre los paneles administrativos, pese a existir y estar mantenido. | Agregada subsección `admin-keyson.html` (solo lectura: búsqueda de clientes + filtro por período). |

**Notas de la revisión 2026-07-23:** revisados los tres paneles (`admin-taller.html`, `admin-productos.html`, `admin-keyson.html`), `config.js`, y las páginas funcionales de cliente (`seguimiento.html`, `tienda.html`, `taller.html`). **Sin bugs críticos ni de lógica JS este ciclo.** Autenticación correcta en todo el admin (Bearer JWT vía `authHeaders()`; `apiFetch()` maneja 401 en taller/productos; keyson hace `logout()` en 401). Sin fetch con auth incorrecta (ningún `x-admin-token` en código). Sin variables CSS ni referencias DOM rotas. Sin funciones duplicadas ni código muerto nuevo (los hallazgos de código muerto de ciclos previos siguen resueltos). El checkout de `tienda.html` previene doble-submit y preserva el carrito si la API falla; paginación/filtros del admin sobreviven a mutaciones (corregido en ciclos 2026-07-02/09). El único hallazgo fue documentación de auth desactualizada en el README, ya corregida arriba. Las mejoras no críticas pendientes siguen listadas más abajo (paginación keyson, export en keyson, etc. — ninguna urgente).

> Última revisión: 2026-07-16

---

## ✅ Bugs corregidos — revisión 2026-07-16

| Archivo | Línea aprox. | Problema | Fix aplicado |
|---|---|---|---|
| `admin-productos.html` | 824 (`agregarCampoImagen`) | **BUG RENDERIZADO/ATRIBUTO**: la función construye cada campo de URL de imagen con `value="${valor}"` inyectando el valor sin escapar dentro de un atributo HTML delimitado por comillas dobles. Al **editar** un producto, `setImagenesValue()` → `agregarCampoImagen(u)` vuelca las URLs guardadas en el formulario. Una URL almacenada que contenga una comilla doble (`"`) cierra el atributo `value` prematuramente: el campo queda truncado o se inyectan atributos espurios, y al guardar se perdería/corrompería la URL de la imagen. Es exactamente la misma clase de bug de comillas-en-atributos que el proyecto ya corrigió en los `onclick` (apostrofes en `confirmarPago`, `abrirConversacion`), pero la ruta de imágenes quedó sin cubrir. | Escapado el valor con la función canónica: `value="${escHtml(valor)}"`. `escHtml()` (config.js) escapa `"` → `&quot;`, así el atributo sobrevive intacto y `dataset`/`.value` recuperan el valor original. Sin cambios de comportamiento para URLs normales. |
| `taller.html` | 448 (`buscarOrden`) | **HARDENING RENDERIZADO**: en la vista pública de seguimiento del taller, `buscarOrden()` escapa con `esc()` todos los campos que provienen del backend (`equipo`, `cliente_nombre`, `codigo_seguimiento`, `estado_desc`, `notas`…) **excepto** `${formatTipo(o.tipo_servicio)}`, que se interpolaba crudo en el `innerHTML`. `formatTipo()` devuelve etiquetas seguras de un mapa fijo, pero para un `tipo_servicio` desconocido cae al fallback `t.charAt(0).toUpperCase()+t.slice(1)` — el valor crudo del servidor. Inconsistente con el resto de la función y con `seguimiento.html`. | Envuelto en la función canónica: `${esc(formatTipo(o.tipo_servicio))}`. Ahora los 100% de los campos interpolados de esa vista pasan por `esc()`. Sin cambios visibles para los tipos conocidos. |
| `README.md` | 113–116 | **DOC DESACTUALIZADA**: la sección "Acceso a ambos paneles" describía un esquema de auth que ya no existe: "contraseña enviada como header `x-admin-token`" y "sesión en `localStorage` (`oc_admin_token`)". El sistema migró hace tiempo a JWT: la contraseña va a `POST /admin/login`, el backend responde un JWT que viaja en `Authorization: Bearer <jwt>` (helper `authHeaders()`), y la sesión se guarda en `sessionStorage` con la clave `oc_admin_jwt`. Un mantenedor futuro que confiara en el README buscaría un header y una clave de storage inexistentes. | Reescrita la sección para reflejar el flujo real (login → JWT → header `Authorization: Bearer` → `sessionStorage`/`oc_admin_jwt`). Cambio de documentación únicamente. |

**Notas de la revisión 2026-07-16:** revisados los 5 archivos con lógica de API (`admin-taller.html`, `admin-productos.html`, `admin-keyson.html`, `taller.html`, `tienda.html`, `seguimiento.html`, `index.html`) + `config.js`. **Autenticación:** correcta y consistente en todo el panel — cero rastros de `x-admin-token` o tokens legacy en el código; todos los fetch autenticados usan `authHeaders()` con Bearer JWT y `apiFetch()`/checks de 401 cierran sesión limpiamente. **Endpoints públicos** (taller/servicios, taller/orden, pedido, productos, categorías) no requieren auth — correcto. **CSS/DOM:** sin variables ni referencias a elementos inexistentes detectadas; paginación, filtros, export CSV/PDF, spinners de carga y estados de error/éxito presentes en todos los paneles. **Escape HTML:** unificado en `config.js`; los 2 huecos restantes (arriba) ahora cubiertos. No se encontraron bugs que rompan funcionalidad — los hallazgos son hardening de escape y una doc desactualizada.

---

## ✅ Bugs corregidos — revisión 2026-07-09

| Archivo | Línea aprox. | Problema | Fix aplicado |
|---|---|---|---|
| `admin-productos.html` | 917 (`cargarPedidos`) | **BUG UX (pérdida de filtro)**: `confirmarPago()`, `cambiarEstadoPedido()` y `eliminarPedido()` re-fetchean la lista con `cargarPedidos()`, que renderizaba `renderPedidos(todosPedidos)` — el set COMPLETO — ignorando la búsqueda activa en `#buscar-ped`. Flujo roto típico: el admin busca "María", encuentra su pedido pendiente, hace clic en **✅ Confirmar pago**, y la tabla salta a mostrar TODOS los pedidos, perdiendo la búsqueda justo después de actuar. Es exactamente la misma clase de bug que ya se corrigió en `eliminarProducto()` (rev. 2026-07-02, cambiado a `filtrarTabla()`), pero la pestaña Pedidos quedó sin arreglar. | `cargarPedidos()` ahora, tras actualizar `todosPedidos`, respeta la búsqueda activa: `const q = ...buscar-ped.value.trim(); if (q) filtrarPedidos(); else renderPedidos(todosPedidos);`. El toggle "Ver cancelados" ya se re-aplica dentro de `renderPedidos()`, así que ambos filtros sobreviven a la acción. |
| `admin-productos.html` | 519 (`cargarProductos`) | **BUG UX (pérdida de filtro)**: misma clase en la pestaña Productos. `guardarProducto()` (crear/editar) y el botón ↻ recargan vía `cargarProductos()`, que hacía `renderProductos(todosProductos)`. Editar un producto con un filtro de búsqueda o categoría activo reseteaba la tabla a todos los productos. `eliminarProducto()` sí preservaba el filtro (`filtrarTabla()`), quedando inconsistente con crear/editar/recargar. | `cargarProductos()` ahora corre `updateStats()` + `populateCatFilter()` sobre el set completo (correcto) y luego renderiza respetando el filtro: `const hayFiltro = buscar-prod.value.trim() \|\| filtro-cat.value; if (hayFiltro) filtrarTabla(); else renderProductos(todosProductos);`. Todo el admin queda consistente: los filtros sobreviven a mutaciones y a la recarga manual. |

**Notas de la revisión 2026-07-09:** revisados `admin-taller.html`, `admin-productos.html`, `admin-keyson.html` y `config.js`. Autenticación correcta en todos (`authHeaders()` con Bearer JWT, `apiFetch()` maneja 401; keyson hace `logout()` en 401). Sin variables CSS ni referencias DOM rotas detectadas. Escape HTML unificado en `config.js` (escapa también `'`). Los dos hallazgos fueron pérdida de filtro tras mutación/recarga (misma raíz), ya corregidos arriba.

---

## ✅ Bugs corregidos — revisión 2026-07-02

| Archivo | Línea aprox. | Problema | Fix aplicado |
|---|---|---|---|
| `admin-taller.html` | 1092 | **BUG RENDERIZADO**: `imprimir()` construía el HTML del recibo inyectando campos de datos del usuario (`o.cliente_nombre`, `o.cliente_telefono`, `o.equipo`, `o.tipo_servicio`, `o.problema`, `o.notas`) directamente en el template string sin escapar. Si algún campo contenía `<` o `>` (p.ej., equipo "Samsung <A54>", nombre "O'Brien & Hijos"), el HTML del recibo se renderizaba malformado — el texto desaparecía o el layout se rompía. La misma función sí usaba `esc()` en otros contextos (`verDetalle()`) pero no en la ruta de impresión. | Aplicado `esc()` en los 6 campos de usuario: `cliente_nombre`, `cliente_telefono`, `equipo`, `tipo_servicio`, `problema` y `notas`. Campos seguros (números, fechas, estado desde mapa fijo) no modificados. |
| `admin-productos.html` | 757 | **BUG UX**: `eliminarProducto()` llamaba a `renderProductos(todosProductos)` directamente después de eliminar un producto. Si el admin tenía activo un filtro de búsqueda o categoría, al borrar el producto la tabla saltaba a mostrar TODOS los productos (ignorando el filtro), desorientando al usuario y requiriendo re-filtrar manualmente. | Cambiado `renderProductos(todosProductos)` por `filtrarTabla()`, que re-aplica el filtro activo (`buscar-prod` + `filtro-cat`) sobre `todosProductos` actualizado. `updateStats()` y `populateCatFilter()` siguen recibiendo `todosProductos` completo, correcto. |
| `admin-keyson.html` | 199 | **CÓDIGO MUERTO**: `authHeadersPost()` estaba definida (devuelve headers con `Content-Type` + `Authorization`) pero nunca se llamaba en ningún punto del archivo. La página Keyson es de solo lectura (solo GET) y todas sus peticiones usan `authHeaders()`. La función colgaba sin uso desde al menos la revisión 2026-06-18. | Eliminada la función. Sin impacto funcional. |

---

## Mejoras identificadas en revisión 2026-07-02

### ~~P1. `filtrarPedidos()` no busca por `game_id`~~ ✅ APLICADA 2026-07-04

La búsqueda de Pedidos no incluía el campo `game_id` (ID de jugador de Free Fire), así que
no se podía localizar un pedido de recarga por el ID del jugador.
**Fix aplicado** en `filtrarPedidos()` (admin-productos.html): se agregó
`String(p.game_id||'').toLowerCase().includes(q)` al `.filter()` — con `String()` por si
el backend devuelve el ID como número (`.toLowerCase()` directo sobre número lanzaría error).

---

---

## ✅ Bugs corregidos — revisión 2026-06-25

| Archivo | Línea aprox. | Problema | Fix aplicado |
|---|---|---|---|
| `admin-taller.html` | 125 (CSS) | **BUG ANIMACIÓN**: `copiarCodigo()` aplicaba `animation:fadeIn 0.2s ease` en el toast de "¡Código copiado!" pero `@keyframes fadeIn` nunca fue definida en el bloque `<style>`. El toast aparecía sin animación. | Agregado `@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}` después de `@keyframes spin`. |
| `admin-keyson.html` | 188 | **BUG CONFIG**: La URL de la API estaba hardcodeada directamente: `const API = 'https://...'`. Los demás archivos admin usan `OFFICELL_CONFIG.API` vía `config.js` para que un cambio de endpoint solo requiera editar un archivo. Si Railway cambia la URL, `admin-keyson.html` quedaría roto mientras los demás se actualizan solos. | Agregado `<script src="config.js"></script>` y cambiado a `const API = (typeof OFFICELL_CONFIG !== 'undefined') ? OFFICELL_CONFIG.API : 'https://...'`. |
| `admin-keyson.html` | 195 | **BUG AUTH**: `authHeaders()` siempre devolvía `{ 'Authorization': 'Bearer ' }` — incluso cuando `TOKEN` era `''` (antes del login). Enviaba una cabecera con bearer vacío en lugar de omitirla, lo cual podía activar parsing inesperado en el backend. `authHeadersPost()` tenía el mismo problema. | `authHeaders()` cambiado a retornar `{}` si TOKEN es falsy. `authHeadersPost()` retorna solo Content-Type si TOKEN es falsy. Comportamiento ahora consistente con `admin-taller.html` y `admin-productos.html`. |
| `seguimiento.html` | 141 | **BUG URL**: Al construir la URL del QR de seguimiento, se hacía `'?codigo=' + p.codigo` sin `encodeURIComponent()`. Si el backend alguna vez devuelve códigos con caracteres especiales (espacios, `+`, `#`), la URL del QR quedaría malformada y el escaneo llevaría a una página de error. | Cambiado a `'?codigo=' + encodeURIComponent(p.codigo)`. |
| `admin-productos.html` | 972 / 996 | **BUG JS**: `confirmarPago(id, nombre)` recibía el nombre del cliente como string literal dentro del atributo `onclick`, delimitado con comillas simples: `onclick="confirmarPago('id','O'Brien')"`. Un apostrofe en el nombre (muy común en Honduras: "María O'Brien", "Café El Buen") cerraba el string JS prematuramente, generando `SyntaxError` en el onclick y dejando ese botón de confirmación de pago completamente inoperativo. `escHtml()` no escapa `'`. | Quitado el parámetro `nombre` del onclick. La función ahora solo recibe `id` (UUID sin caracteres problemáticos) y busca el nombre internamente: `const ped = todosPedidos.find(p => p.id === id); const nombre = ped?.nombre_cliente || '—';`. |

---

## ✅ Bugs corregidos — revisión 2026-06-18

| Archivo | Línea aprox. | Problema | Fix aplicado |
|---|---|---|---|
| `admin-keyson.html` | 252 | **BUG AUTH**: `cargarStats()` usaba `fetch()` directo. Un JWT expirado devolvía HTTP 401 pero solo hacía `if (!r.ok) return` sin cerrar sesión. El admin veía stats en blanco sin saber por qué, y el resto de la UI seguía bloqueada. | Agregado `if (r.status === 401) { logout(); return; }` antes del check de `!r.ok`. |
| `admin-keyson.html` | 335 | **BUG AUTH**: `abrirConversacion()` usaba `fetch()` directo para cargar los mensajes. Misma situación: 401 silencioso, mensajes no cargaban, sesión no cerraba. | Agregado `if (r.status === 401) { logout(); return; }` después del fetch de conversación. |
| `admin-keyson.html` | 278 | **BUG JS**: `cargarClientes()` construía el onclick como `onclick="abrirConversacion('${esc(c.client_phone)}','${esc(c.nombre||'')}')"`. La función `esc()` no escapa comillas simples (`'`). Un cliente con nombre como "O'Brien" o "Tía María" generaba HTML con onclick roto que arrojaba `SyntaxError` al hacer clic y dejaba ese cliente inaccesible. | Cambiado a atributos `data-*`: `data-phone` y `data-nombre`, con `onclick="abrirConversacion(this.dataset.phone,this.dataset.nombre)"`. El HTML encoda `"` correctamente y `dataset` decodifica el valor original. También corregido el marcado de cliente activo: de `el.onclick.toString().includes(phone)` (frágil) a `el.dataset.phone === phone` (exacto). |
| `admin-taller.html` | 341–352 | **BUG DATOS**: El select `#fTipoServicioEd` del modal de edición no tenía la opción `"diagnostico"`. Las órdenes creadas con tipo "Solo Diagnóstico" (valor `diagnostico`) al abrirse en edición no encontraban la opción en el select, quedaban en "Reparación General" (primera opción por defecto), y al guardar sobreescribían silenciosamente el tipo de servicio con `"reparacion"`. | Agregado `<option value="diagnostico">Solo Diagnóstico</option>` al select de edición. Agregado también `<option value="otro">Otro</option>` al select de creación para paridad. |
| `admin-productos.html` | 1033 | **CRASH JS**: `filtrarPedidos()` hacía `p.id.toLowerCase()` sin guardia. Si un pedido de la API llegaba sin campo `id` (NULL en BD o campo ausente), `.toLowerCase()` sobre `undefined` lanzaba `TypeError`, abortaba el `.filter()` completo y dejaba la tabla de pedidos vacía sin mensaje de error. | Cambiado a `(p.id||'').toLowerCase().includes(q)`. |
| `admin-productos.html` | 490 | **BUG SESIÓN**: El bloque `.catch()` del auto-login solo hacía `TOKEN = ''` pero no llamaba a `sessionStorage.removeItem('oc_admin_jwt')`. Ante un error de red transitorio al cargar la página, el JWT corrupto/inaccesible quedaba en sessionStorage. Al recargar se reintentaba la verificación fallida indefinidamente — el admin no podía entrar al panel sin abrir DevTools y limpiar manualmente. | Agregado `sessionStorage.removeItem('oc_admin_jwt')` en el catch. |

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

### 19. `tienda.html` — el QR del modal de confirmación usa servicio externo (`api.qrserver.com`)
**Detectado 2026-07-16.** En `confirmarPedido()` (≈línea 914), tras registrar el pedido el QR de seguimiento
se genera con `https://api.qrserver.com/v1/create-qr-code/?...&data=<trackUrl>`. Esto:
1. **Envía la URL de seguimiento del cliente a un tercero** (privacidad).
2. Añade una **dependencia externa** — si qrserver.com está caído o bloqueado, el cliente ve un QR roto.

`seguimiento.html` ya se migró a generación local con `qrcode.min.js` + `QRCode.toCanvas()` (ítem #18,
rev. 2026-06-25), y `admin-taller.html` usa `QRCode.toDataURL()` para sus recibos. `tienda.html` quedó
como el único punto que aún depende del servicio externo.
**Solución propuesta:** cargar `qrcode.min.js` (mismo CDN que ya usan taller/seguimiento) en `tienda.html`
y reemplazar el `<img src="api.qrserver.com…">` por un `<canvas>` generado con
`QRCode.toCanvas(el, trackUrl, {width:300, margin:1})`, con fallback al `<img>` externo si la librería no
cargó. Alinea las tres páginas con QR bajo el mismo enfoque local.

---

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

### ~~11. Filtro de rango de fechas en órdenes del taller~~ ✅ IMPLEMENTADA 2026-06-12
**Fix aplicado:** Selector `#filtroFecha` en el toolbar con rangos sobre `fecha_entrada`: Todas / Hoy / Últimos 7 días / Este mes (fechas calculadas en zona horaria Honduras). Se combina con el filtro de estado, la búsqueda, la paginación y el export CSV (todos operan sobre `listaFiltrada`). Probado con DOM simulado incluyendo bordes de rango y órdenes sin fecha.

---

### ~~12. `auto-login` de admin-productos verifica consultando la lista de productos~~ ✅ IMPLEMENTADA 2026-06-25
**Fix aplicado:** Backend IA — nuevo `GET /api/tienda/admin/ping` (`authAdmin`) que solo devuelve `{ok:true}` sin descargar datos (commit IA `eb03e16`). Frontend — el auto-login de `admin-productos.html` ahora llama a `${API}/admin/ping` en vez de `/admin/productos` (commit web `267ab6c`).  
**⚠️ ORDEN DE DEPLOY:** desplegar primero el backend IA en Railway y verificar que `/admin/ping` responde; recién entonces pushear el cambio del web. Si el web se despliega antes, el auto-login daría 404.

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

### ~~17b. `admin-productos.html` — sección Pedidos sin paginación~~ ✅ IMPLEMENTADA 2026-06-25
**Fix aplicado:** Paginación client-side de 20 pedidos por página (`POR_PAGINA_PEDIDOS = 20`), mismo patrón que taller. Barra `◀ Anterior · Página X de Y (N pedidos) · Siguiente ▶` bajo la tabla, oculta con ≤20 resultados. `renderPedidos(pedidos, resetPagina=true)` guarda el set en `pedidosFiltrados` y vuelve a página 1 en cada filtro/búsqueda/toggle; `cambiarPaginaPedidos()` navega sin resetear. Respeta el orden (pendientes de pago primero) y el filtro de cancelados. (commit `d3cdee1`)

---

### ~~17c. `admin-keyson.html` — `init()` tiene lógica de UI duplicada al llamarse desde `login()`~~ ✅ IMPLEMENTADA 2026-06-25
**Fix aplicado:** `init()` dividido en `cargarDatos()` (solo los fetch: `cargarStats()` + `cargarClientes()`) e `init()` (restaura sesión guardada con UI, auto-login). `login()` ahora llama `cargarDatos()` directamente tras mostrar el panel; el listener `load` llama solo a `init()`. Eliminada la lógica de UI duplicada y el doble seteo de TOKEN. (commit `f0cfaee`)

---

### ~~17d. `seguimiento.html` — no redirige a `taller.html` cuando se ingresa un código de taller~~ ✅ IMPLEMENTADA 2026-06-25
**Fix aplicado:** En el mensaje de "código no encontrado", `seguimiento.html` ahora ofrece un enlace directo a `taller.html?codigo=...` con el código ya cargado (taller.html autocarga el parámetro y busca solo). Se usó el enfoque seguro sin heurística de prefijo (el formato de los códigos de tienda se genera en el backend y no se puede verificar desde el front), mostrando la sugerencia como ayuda secundaria sin afirmar nada incorrecto. (commit `53b1219`)

---

### ~~16. `esc()` de `admin-taller.html` y `escHtml()` de `admin-productos.html` son inconsistentes~~ ✅ IMPLEMENTADA 2026-06-25
**Fix aplicado:** Una sola función canónica de escape HTML en `config.js` (escapa `&`, `<`, `>`, `"`, `'` con guarda null/undefined), expuesta como `window.escHtml` y alias `window.esc`. Eliminadas las 7 definiciones locales duplicadas (admin-keyson, admin-productos, admin-taller, seguimiento, taller, tienda, index). `index.html` ahora también carga `config.js`. Corrige de paso el bug de seguridad de los admin que no escapaban la comilla simple. (commit `e5285d8`)

---

### ~~17. `admin-keyson.html` — `authHeaders()` incluye Content-Type en todas las peticiones~~ ✅ YA RESUELTO
**Verificado 2026-06-12:** Ya existen `authHeaders()` (solo Authorization, usada en los GET) y `authHeadersPost()` (con Content-Type) separadas — la solución propuesta está aplicada.

---

### ~~18. `seguimiento.html` — QR de seguimiento usa servicio externo~~ ✅ YA RESUELTO
**Verificado 2026-06-12:** `seguimiento.html` ya carga `qrcode.min.js` desde CDN (línea 82) y genera el QR localmente con `QRCode.toCanvas()` (línea 163). No queda referencia a qrserver.com.

---

*Generado automáticamente por revisión de código — OFFICELL Admin*
