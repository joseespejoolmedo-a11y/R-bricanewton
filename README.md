# Rúbrica — Editor + Evaluación (nota 0–10)

App estática (HTML/CSS/JS) para evaluar con rúbricas de 4 niveles con pesos, plantillas editables, importación “pegar desde texto”, roster de alumnos y sincronización opcional a Google Sheets (Apps Script).

## Cómo publicar en GitHub Pages
1. Crea un repo nuevo y sube estos archivos (o arrastra el ZIP).
2. En **Settings → Pages**: Source = `Deploy from a branch`, Branch = `main` (root).
3. Abre la URL que te muestra (algo como `https://tuusuario.github.io/tu-repo/`).

## Google Sheets (opcional)
- Publica el roster como CSV y pégalo en **Ajustes**.
- Si quieres registrar automáticamente, crea un **Apps Script** Web App que reciba los datos (ver conversación original).

## Estructura
- `index.html` — página principal
- `styles.css` — estilos
- `app.js` — lógica
- `.nojekyll` — evita que Pages ignore rutas
