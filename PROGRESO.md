# PROGRESO — OFFICELL WEB
**Sitio:** https://officell-hn.github.io  
**Stack:** HTML estático + CSS + JS vanilla. Sin framework. GitHub Pages desde `main`.  
**Repo:** https://github.com/officell-hn/officell-hn.github.io (público)

---

## Estado actual (2026-06-12)

### Páginas principales
| Página | Estado |
|--------|--------|
| `index.html` | ✅ Activa |
| `tienda.html` | ✅ Activa — carrito funcional |
| `admin-productos.html` | ✅ Activa |
| `admin-taller.html` | ✅ Activa |
| `taller.html` | ✅ Activa |
| `agentes-bancarios.html` | ✅ Activa |
| Blog SEO | ✅ 5+ artículos, sitemap actualizado |

---

## Últimos cambios (historial reciente)

| Fecha | Cambio |
|-------|--------|
| 2026-06-23 | Horario corregido a **8:30 AM – 5:30 PM** (era 8:30–5:00) en todo el sitio: `index.html`, `contacto.html`, `sobre-nosotros.html`, `agentes-bancarios.html`, `como-enviar-recibir-remesas-honduras.html` (display + meta descriptions + schema.org `openingHoursSpecification` `closes` 17:30). Dato real confirmado por Adonias. También unificado en el prompt de Keyson (repo IA). (commits `d402d4f`, `4e5320d`) |
| 2026-06-18 | SEO/Search Console: vinculada la propiedad de Search Console `https://officell-hn.github.io/` con Google Analytics (`G-Z5D12EC06P`) → reportes de "Consultas" y "Páginas orgánicas" dentro de Analytics. **Diagnóstico sitemap "No se ha podido obtener":** el archivo está OK — responde 200, XML válido (24 URLs), sin BOM, Googlebot permitido, 0 redirecciones, robots.txt apunta bien, páginas públicas sin `noindex`. El error es del lado de Google (propiedad nueva, sitemap en cola con baja prioridad; "Última lectura" vacía = aún no lo ha leído). **No es un problema de código.** Vía recomendada mientras se resuelve solo: indexación manual por "Inspección de URLs" → "Solicitar indexación" de las páginas clave, y revisar Indexación → Páginas para ver el estado real. Reenviar el sitemap repetidamente NO ayuda. |
| 2026-06-12 | admin-taller: paginación 25/pág + export CSV (respeta filtros) + filtro de fechas Hoy/7días/Mes (commits `9ba63ad`, `4ba228c`) |
| 2026-06-12 | Limpiezas ítems 13-15 de MEJORAS_WEB: `--azul` en tienda, wrapper `previewImg()` eliminado, regla CSS vacía (commit `28a1002`) |
| 2026-06-12 | Verificados ya resueltos: #7 catch QR, #8 dedup datalist, #9 editar por data-id, #17 authHeadersPost, #18 QR local — solo quedan #16 (unificar esc) y #12 (backend ping) |
| 2026-05 | Fix renderCarrito — parsea `imagen_url` como JSON array |
| 2026-05 | Links Hondubet cambiados de casino → deporte en 20 páginas |
| 2026-05 | Fix cancelarOrden verifica `d.ok` correctamente |
| 2026-05 | Fix bugs críticos admin y tienda (revisión semanal) |
| 2026-05 | Admin: ocultar cancelados por defecto + botón eliminar permanente |
| 2026-05 | Prevenir pedidos duplicados y flujo `pendiente_pago` |
| 2026-05 | Banners publicitarios Hondubet en todo el sitio |
| 2026-05 | 5 nuevos artículos blog + noindex admin + sitemap AdSense |
| 2026-05 | Admin taller: sección pago adelantado en modal de estado |

---

## Pendientes conocidos

- [ ] Revisar rendimiento en móvil (imágenes pesadas en tienda)
- [x] Validar que todos los links de Hondubet apuntan a deporte (no casino) — corregido 2026-05
- [ ] SEO: continuar con más artículos de blog para AdSense
- [ ] Evaluar si agregar más categorías a la tienda
- [x] Implementar búsqueda de texto en tabla de órdenes del taller — verificado 2026-06-11 (campo `#buscarOrden`)
- [x] Exportar órdenes del taller a CSV — implementado 2026-06-12 (botón ⬇️ CSV, respeta filtros)
- [x] Paginación en tabla de órdenes del taller — implementado 2026-06-12 (25 por página)

---

## Reglas del proyecto

- **Sin npm, sin build tools** — solo HTML, CSS y JS puro
- **Deploy automático** desde `main` vía GitHub Pages
- **Repo público** — no incluir en este archivo: contraseñas, API keys, datos financieros
- Confirmar antes de hacer `git push` a `main`

---

## Cómo retomar el trabajo

1. Abrir `C:\Users\Officell2\Desktop\Proyecto OFFICELL\OFFICELL WEB\`
2. Revisar este archivo para contexto
3. `git log --oneline -10` para ver últimos cambios
4. Editar directamente los HTML — no hay servidor de desarrollo necesario
