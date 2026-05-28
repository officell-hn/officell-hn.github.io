# MEJORAS_WEB.md — OFFICELL Admin Panel
> Última revisión: 2026-05-28

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

### 0. [SEGURIDAD] XSS almacenado en `tienda.html` — nombres y descripciones de productos sin escapar
**Archivo:** `tienda.html`, líneas ~550–552  
**Problema:** En `renderProductos()`, los campos `p.nombre`, `p.descripcion` y `p.categoria_web` se insertan directamente en `container.innerHTML` sin escapar:
```js
<div class="producto-nombre">${p.nombre}</div>
<div class="producto-desc">${p.descripcion}</div>
```
Si la base de datos contiene HTML malicioso en esos campos (por compromiso del backend o del panel admin), se ejecuta JS en el browser de cualquier visitante. El admin panel (`admin-productos.html`) sí usa `escHtml()` para los mismos campos — hay inconsistencia.  
**Solución:** Aplicar la función `escHtml` (ya existe en admin-productos.html, replicarla en tienda.html o importarla) a todos los campos interpolados en `renderProductos()`.

### 0b. [SEGURIDAD] XSS por inyección en atributo `onclick` de categorías (`tienda.html`)
**Archivo:** `tienda.html`, línea ~452  
**Problema:** Los botones de filtro de categoría se generan como:
```js
onclick="filtrarCategoria('${c.categoria}',this)"
```
`c.categoria` viene de la API sin escapar. Una comilla simple en el valor rompe el atributo JS (error de sintaxis). Un valor como `x',this);maliciousCode();//` ejecutaría código arbitrario.  
**Solución:** Usar `escHtml(c.categoria)` y almacenar el valor real en `data-cat`, leyéndolo con `this.dataset.cat` desde la función.

### 0c. [SEGURIDAD] XSS por URL de imagen en `onclick` de thumbnails (`tienda.html`)
**Archivo:** `tienda.html`, línea ~541  
**Problema:** El switcher de miniaturas genera:
```js
onclick="document.getElementById('imgmain-${pid}').src='${u}'"
```
Si la URL contiene `'` (raro pero posible en URLs mal formadas del backend), rompe el atributo o permite inyección JS.  
**Solución:** Almacenar las URLs en `mapaProductos[p.id].imagenes` e indexar por posición: `onclick="switchImg('${pid}',${i})"`, leyendo la URL desde el mapa en la función.

### 0d. Botones de "Confirmar pedido" quedan permanentemente deshabilitados si la API falla
**Archivo:** `tienda.html`, línea ~783  
**Problema:** En `confirmarPedido()`, los botones se deshabilitan antes del fetch. El flag `_pedidoEnvio` se resetea en `finally`, pero los botones (`btn.disabled = true; btn.textContent = '⏳ Enviando...'`) nunca se rehabilitan si la API retorna error. El usuario debe recargar la página.  
**Solución:** En el bloque `finally`, rehabilitar los botones:
```js
finally {
  _pedidoEnvio = false;
  document.querySelectorAll('[onclick*="confirmarPedido"]').forEach(btn => {
    btn.disabled = false;
    btn.style.opacity = '';
    // restaurar texto original según contexto
  });
}
```

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

### 3. `filtrarPedidos()` no busca por `codigo_seguimiento`
**Archivo:** `admin-productos.html`, línea ~1018  
**Problema:** La búsqueda de pedidos filtra por `p.id`, `nombre_cliente`, `telefono_cliente` y `email_cliente`, pero **no** por `p.codigo_seguimiento`. Cuando el admin busca por código (ej. "PED-0514-1234"), no encuentra nada.  
**Solución propuesta:** Agregar `(p.codigo_seguimiento||'').toLowerCase().includes(q)` al filtro.

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

*Generado automáticamente por revisión de código — OFFICELL Admin*
