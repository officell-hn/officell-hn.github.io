# PROGRESO — OFFICELL WEB
**Sitio:** https://officell-hn.github.io  
**Stack:** HTML estático + CSS + JS vanilla. Sin framework. GitHub Pages desde `main`.  
**Repo:** https://github.com/officell-hn/officell-hn.github.io (público)

---

## Estado actual (2026-05-28)

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
- [ ] Implementar búsqueda de texto en tabla de órdenes del taller
- [ ] Exportar órdenes del taller a CSV

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
