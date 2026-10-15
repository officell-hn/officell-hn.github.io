# Para Claude — sitio web de OFFICELL

## Antes de hacer nada: leé el buzón

Adonias trabaja con Claude en **tres lugares** (Mac, PC del negocio, iPhone) y las
sesiones no se ven entre sí. Se comunican por `COORDINACION_CLAUDE.md` del repo
**officell-ia**. Al empezar, **siempre**, aunque no haya commits nuevos:

```
gh api repos/officell-hn/officell-ia/contents/COORDINACION_CLAUDE.md -H "Accept: application/vnd.github.raw"
```

1. Leé los mensajes **Para:** tu máquina (o "todos") que **no** estén ✅.
2. Marcá cada uno `📬 leído <fecha>` en cuanto lo leas (en el repo officell-ia).
3. Todo lo que hagas se comparte ahí. (Regla de Adonias, 14-oct-2026.)

## Este repo

- **Repo PÚBLICO**: nunca subir contraseñas, tokens ni datos financieros.
- HTML/CSS/JS puro, sin build. Cada push a `main` se publica en GitHub Pages.
- Paneles admin: JWT `Authorization: Bearer` + `sessionStorage oc_admin_jwt`.
  Backend: `https://officell-ia-production.up.railway.app/api/tienda`.
- Escapar con `escHtml()`/`esc()` (de `config.js`) todo dato del backend que vaya a
  `innerHTML`. Bitácora: `MEJORAS_WEB.md`. Pendientes: `PENDIENTES.md` en officell-ia.
