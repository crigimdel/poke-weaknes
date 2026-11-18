# Poke Weakness

Web app instalable (PWA) para saber las debilidades de un Pokémon y qué tipo es el mejor para vencerlo.

- Busca por nombre (en inglés, con autocompletado) o elige 1–2 tipos.
- Muestra debilidades (x4, x2), resistencias, inmunidades y avisos de habilidades (Levitación, Absorbe Agua…).
- "Mejor tipo para vencerlo" ordena los tipos súper eficaces priorizando los que además resisten los ataques del rival.
- Funciona sin conexión para la selección por tipos y los Pokémon ya consultados.

## Probar en local

```
npx serve .
```

y abre `http://localhost:3000`.

## Instalar en el móvil

La instalación requiere HTTPS. Lo más sencillo es publicarla gratis en GitHub Pages, Netlify o Vercel (son archivos estáticos, no hace falta compilar). Después, en el móvil:

- **Android (Chrome):** botón "Instalar" de la app o menú ⋮ → "Instalar aplicación".
- **iPhone (Safari):** botón Compartir → "Añadir a pantalla de inicio".

## Iconos

`node tools/make-icons.js` regenera los PNG de `icons/`.

Al cambiar archivos de la app, sube `VERSION` en `sw.js` para que los móviles reciban la nueva versión.
