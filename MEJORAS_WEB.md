# MEJORAS_WEB.md — OFFICELL Admin Panel
> Última revisión: 2026-06-04

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

### ~~0. [SEGURIDAD] XSS almacenado en `tienda.html` — nombres y descripciones de productos sin escapar~~ ✅ APLICADO
**Fix 2026-05-28:** `escHtml()` agregada a tienda.html y aplicada a `p.nombre`, `p.descripcion`, `p.categoria_web` en `renderProductos()` (ambas secciones: Diamantes FF y productos normales).

### ~~0b. [SEGURIDAD] XSS por inyección en atributo `onclick` de categorías (`tienda.html`)~~ ✅ APLICADO
**Fix 2026-05-28:** botones de categoría usan `data-cat="${escHtml(c.categoria)}"` y `onclick="filtrarCategoria(this.dataset.cat,this)"` — valor nunca interpolado directamente en JS.

### ~~0c. [SEGURIDAD] XSS por URL de imagen en `onclick` de thumbnails (`tienda.html`)~~ ✅ APLICADO
**Fix 2026-05-28:** thumbnails usan `onclick="switchImg('${pid}',${i})"` — función nueva que lee la URL desde `mapaProductos` por índice. URL nunca aparece en el HTML. Además `src="${escHtml(u)}"` para atributo img.

### ~~0d. Botones de "Confirmar pedido" quedan permanentemente deshabilitados si la API falla~~ ✅ APLICADO
**Fix 2026-05-28:** bloque `finally` en `confirmarPedido()` re-habilita botones si `!codigo` (pedido no completado): `btn.disabled=false`, `btn.style.opacity=''`, `btn.textContent='✅ Confirmar pedido'`.

### 1. Manejo de sesión expirada (401) en todas las páginas admin
**Archivos:** `admin-taller.html`, `admin-productos.html`  
**Problema:** Cuando el JWT expira, los fetch protegidos devuelven 401 pero solo se muestra "Error: undefined" o se redirige sin mensaje claro. El `verificarToken()` de admin-taller solo cubre el auto-login inicial; las llamadas posteriores (guardar orden, actualizar estado, etc.) no interceptan 401 de forma centralizada.  
**Solución propuesta:** Crear un wrapper `apiFetch()` que reemplace a `fetch()` en todas las llamadas autenticadas. Si recibe 401, llama automáticamente a `logout()` mostrando "Sesión expirada — vuelve a ingresar".

```javascript
async function apiFetch(url, opts = {}) {
  const r = await fetch(url, opts);
  if (r.status === 401) {
    logout(); // o doLogout()
    throw new Error('Sesión expirada');
  }
  return r;
}
```

---

### 2. Campo de búsqueda en tabla de órdenes del taller
**Archivo:** `admin-taller.html`  
**Problema:** No existe campo de búsqueda por texto. Con muchas órdenes, encontrar una por nombre de cliente o equipo requiere scroll manual o usar el filtro de estado (que es por categoría, no por texto).  
**Solución propuesta:** Agregar `<input>` de búsqueda en el toolbar que filtre localmente sobre `ORDENES` por `equipo`, `cliente_nombre`, `cliente_telefono` y `codigo_seguimiento`.

```html
<input type="text" id="buscarOrden" placeholder="🔍 Buscar cliente, equipo o código..."
  oninput="buscarEnOrdenes(this.value)"
  style="padding:0.45rem 1rem;border-radius:8px;border:1px solid var(--border);background:var(--card);color:var(--text);min-width:220px">
```

---

### ~~3. `filtrarPedidos()` no busca por `codigo_seguimiento`~~ ✅ YA RESUELTO
**Fix verificado 2026-06-04:** El código actual en `filtrarPedidos()` ya incluye `(p.codigo_seguimiento||'').toLowerCase().includes(q)` en el filtro. La búsqueda por código funciona correctamente.

---

## 🟡 Media prioridad (mejora de usabilidad significativa)

### 4. Botón "Guardar" no se deshabilita durante `actualizarEstado()`
**Archivo:** `admin-taller.html`, función `actualizarEstado()` (~línea 659)  
**Problema:** El botón "Guardar Cambios" del modal de estado no se deshabilita durante el fetch. Si el admin hace doble click puede enviar la actualización dos veces.  
**Solución propuesta:** Mismo patrón que `guardarOrden()`: deshabilitar botón al inicio, rehabilitar en `finally`.

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

### 7. Imagen en miniatura del carrito usa `imagen_url` sin `alt` escapado
**Archivo:** `tienda.html`, función `renderCarrito()` (~línea 645)  
**Problema:** `alt="${item.nombre}"` no escapa HTML. Si el nombre del producto contiene `"` o `>`, puede romper el atributo o causar XSS menor.  
**Solución propuesta:** Usar una función `esc()` (ya existe en otros archivos del sitio) para escapar `item.nombre` antes de insertarlo en atributos HTML de carrito.

---

### 8. Thumbnails de miniaturas en `renderProductos` tienen XSS potencial en onclick
**Archivo:** `tienda.html`, ~línea 541  
**Problema:** Las URLs de imágenes se insertan directamente en `onclick="document.getElementById(...).src='${u}'"`. Si una URL contiene comilla simple, rompe el atributo onclick o puede usarse para inyección JS.  
**Solución propuesta:** Usar `mapaProductos` para almacenar los arreglos de imágenes por ID y referenciar índice en onclick, en lugar de embed directo de URL.

---

## 🟢 Baja prioridad (nice to have)

### 9. Ordenación de columnas en tablas admin
**Archivos:** `admin-taller.html`, `admin-productos.html`  
Actualmente las tablas no tienen ordenación por columna. Agregar click en `<th>` para ordenar por ese campo mejoraría la navegación para el administrador.

---

### 10. Confirmación antes de logout
**Archivos:** `admin-taller.html`, `admin-productos.html`  
Si el admin hace click en "Salir" accidentalmente mientras edita, pierde el trabajo sin confirmación. Agregar `if (!confirm('¿Cerrar sesión?')) return;` en `logout()` / `doLogout()`.

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

## 🟢 Hallazgos 2026-06-04 (baja prioridad / código muerto)

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
**Problema:** Existen dos funciones de escape con nombres distintos y comportamientos ligeramente distintos en el proyecto. `taller.html` (público) tiene la versión más completa (escapa `&`, `<`, `>`, `"`, `'`). La de admin-taller.html ahora escapa `&` (fix 2026-06-04) pero sigue sin escapar `'`.  
**Solución a largo plazo:** Unificar en un solo `config.js` o un archivo `utils.js` compartido con la función completa.

---

*Generado automáticamente por revisión de código — OFFICELL Admin*
