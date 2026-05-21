# MEJORAS_WEB.md — OFFICELL Admin Panel
> Revisión semanal: 2026-05-21

---

## ✅ Bugs corregidos esta semana

| Archivo | Línea aprox. | Problema | Fix aplicado |
|---|---|---|---|
| `admin-taller.html` | 512–518 | **CRÍTICO**: `filtrar()` filtraba localmente sobre `ORDENES`, pero `ORDENES` podía estar ya reducido a un subconjunto por el último `cargarOrdenes()` (que usa `filtroActual` al hacer el fetch). Ejemplo: filtrar "Recibido" → clic "Actualizar" → `ORDENES` ahora solo tiene recibidos → filtrar "Todos" → tabla mostraba solo recibidos. | `filtrar()` ahora llama a `cargarOrdenes()` directamente; el filtro del servidor siempre parte del estado fresco |
| `admin-taller.html` | 1004 | `esc()` no escapaba `&` → nombres con `&` (ej. "Baterías & Repuestos") generaban HTML roto en la tabla y los recibos de impresión | Agregado `.replace(/&/g,'&amp;')` como primer paso, igual que `escHtml()` en admin-productos |
| `admin-taller.html` | 889, 976 | `imprimirPlantilla()` e `imprimir()` no verificaban si la ventana popup fue bloqueada → crash de JS `"Cannot set property of null"` cuando el navegador bloquea popups | Agregado `if (!win) { alert(...); return; }` en ambas funciones |
| `admin-taller.html` | 659 | **`actualizarEstado()` sin protección contra doble submit**: el botón "Guardar Cambios" no se deshabilitaba durante el fetch → doble clic enviaba la actualización dos veces (pendiente semana anterior) | Botón se deshabilita al iniciar y se restaura en `finally` |
| `admin-productos.html` | 1017 | `filtrarPedidos()` no buscaba por `codigo_seguimiento` → buscar "PED-0521-xxxx" no encontraba nada (pendiente semana anterior) | Agregado `(p.codigo_seguimiento\|\|'').toLowerCase().includes(q)` al filtro |
| `admin-productos.html` | 930 | `JSON.parse(p.productos)` sin try-catch → si la DB devuelve un string JSON malformado, `renderPedidos()` lanzaba excepción y la tabla quedaba en estado de carga permanente | Envuelto en try/catch, `prods` queda `[]` si falla |
| `tienda.html` | 649, 656, 692 | **XSS**: `item.nombre` se insertaba directo en `innerHTML` (`renderCarrito()`, `abrirCheckout()`) y en atributo `alt` sin escapar → un nombre con `<`, `>` o `"` podía romper el HTML o ejecutar JS (self-XSS vía datos del admin) | Agregada función `esc()` al archivo; usada en todas las interpolaciones de nombre en el carrito y resumen de pedido |

---

## 🔴 Alta prioridad (funcionalidad crítica o UX muy afectada)

### 1. Manejo de sesión expirada (401) en todas las páginas admin
**Archivos:** `admin-taller.html`, `admin-productos.html`  
**Problema:** Cuando el JWT expira, los fetch protegidos devuelven 401 pero solo se muestra "Error: undefined" o la operación falla silenciosamente. No hay redirección al login ni mensaje claro de "sesión expirada".  
**Solución propuesta:** Crear un wrapper `apiFetch()` que reemplace a `fetch()` en todas las llamadas autenticadas. Si recibe 401, llama a `logout()` mostrando mensaje.

```javascript
async function apiFetch(url, opts = {}) {
  const r = await fetch(url, opts);
  if (r.status === 401) {
    logout(); // o doLogout()
    throw new Error('Sesión expirada — vuelve a ingresar');
  }
  return r;
}
```

---

### 2. Campo de búsqueda en tabla de órdenes del taller
**Archivo:** `admin-taller.html`  
**Problema:** No existe campo de búsqueda por texto. Con muchas órdenes, encontrar una por nombre de cliente, equipo o código requiere scroll manual o filtro por estado.  
**Solución propuesta:** Agregar `<input>` en el toolbar que filtre localmente sobre `ORDENES` por `equipo`, `cliente_nombre`, `cliente_telefono` y `codigo_seguimiento`. El filtro de texto y el de estado deben ser combinables.

```html
<input type="text" id="buscarOrden" placeholder="🔍 Buscar cliente, equipo o código..."
  oninput="buscarEnOrdenes(this.value)"
  style="padding:0.45rem 1rem;border-radius:8px;border:1px solid var(--border);background:var(--card);color:var(--text);min-width:220px">
```

```javascript
let textoBusqueda = '';
function buscarEnOrdenes(val) {
  textoBusqueda = val.toLowerCase();
  const lista = ORDENES.filter(o =>
    (!filtroActual || o.estado === filtroActual) &&
    (!textoBusqueda ||
      (o.equipo||'').toLowerCase().includes(textoBusqueda) ||
      (o.cliente_nombre||'').toLowerCase().includes(textoBusqueda) ||
      (o.cliente_telefono||'').toLowerCase().includes(textoBusqueda) ||
      (o.codigo_seguimiento||'').toLowerCase().includes(textoBusqueda))
  );
  renderTabla(lista);
}
```

---

## 🟡 Media prioridad (mejora de usabilidad significativa)

### 3. Paginación en tabla de órdenes del taller
**Archivo:** `admin-taller.html`  
**Problema:** Con 200+ órdenes la tabla renderiza todo en DOM de una vez; puede volverse lenta y difícil de navegar.  
**Solución propuesta:** Paginación simple de 25 órdenes por página con botones Anterior/Siguiente, o limitar carga a las últimas 100 por defecto con botón "Ver todas".

---

### 4. Exportar órdenes del taller a CSV
**Archivo:** `admin-taller.html`  
**Problema:** No hay forma de exportar el listado de órdenes para reportes semanales en Excel.  
**Solución propuesta:** Botón "⬇️ CSV" en el toolbar que descargue el listado actual (respetando filtro activo) vía `Blob` + `URL.createObjectURL`.

---

### 5. XSS en thumbnails de miniaturas de productos en tienda.html
**Archivo:** `tienda.html`, ~línea 541  
**Problema:** Las URLs de imágenes secundarias se insertan en `onclick="document.getElementById(...).src='${u}'"`. Una URL con comilla simple puede romper el handler o ejecutar código.  
**Solución propuesta:** Almacenar los arrays de imágenes en `mapaProductos` y referenciar por `[pid][índice]` en onclick, evitando embed de URLs en atributos.

---

### 6. `cancelarOrden()` sin protección contra doble-click
**Archivo:** `admin-taller.html`, ~línea 719  
**Problema:** El botón `✕` no se deshabilita mientras el DELETE está en vuelo; doble clic puede enviar dos solicitudes de cancelación.  
**Solución propuesta:** Deshabilitar el botón antes del fetch y rehabilitar en `finally`. Como el botón se genera en `renderTabla()`, la forma más limpia es pasar una referencia:

```javascript
async function cancelarOrden(id, btn) {
  const o = ORDENES.find(x => x.id === id);
  if (!confirm(`¿Cancelar la orden de "${o?.equipo}"?`)) return;
  if (btn) { btn.disabled = true; btn.textContent = '...'; }
  try {
    // ...fetch DELETE...
    await cargarOrdenes();
  } catch(e) {
    alert('Error: ' + e.message);
    if (btn) { btn.disabled = false; btn.textContent = '✕'; }
  }
}
```
Y en `renderTabla()`: `onclick="cancelarOrden('${o.id}',this)"`.

---

## 🟢 Baja prioridad (nice to have)

### 7. Ordenación de columnas en tablas admin
**Archivos:** `admin-taller.html`, `admin-productos.html`  
Agregar click en `<th>` para ordenar por ese campo mejoraría la navegación.

---

### 8. Confirmación antes de logout
**Archivos:** `admin-taller.html`, `admin-productos.html`  
Si el admin hace click en "Salir" accidentalmente mientras edita, pierde el trabajo sin confirmación. Agregar `if (!confirm('¿Cerrar sesión?')) return;` en `logout()` / `doLogout()`.

---

### 9. Filtro de rango de fechas en órdenes del taller
**Archivo:** `admin-taller.html`  
Actualmente solo se filtra por estado. Un filtro de fecha de entrada (ej. "esta semana", "este mes") ayudaría para reportes rápidos.

---

### 10. `auto-login` de admin-productos verifica consultando la lista de productos
**Archivo:** `admin-productos.html`, ~línea 471  
El auto-login hace un fetch a `${API}/admin/productos` para verificar el JWT. Si hay muchos productos, esto es innecesariamente costoso. Sería más eficiente un endpoint `/admin/ping` o `/admin/me`.  
*(Requiere cambio en backend Railway.)*

---

*Generado automáticamente por revisión de código — OFFICELL Admin*
