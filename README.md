# Courses Tracker Client

Cliente web para el proyecto **Courses Tracker**.

Esta aplicación consume una API REST usando únicamente **HTML, CSS y JavaScript vanilla** con `fetch()`.

## Tecnologías

- HTML
- CSS
- JavaScript vanilla
- Fetch API

No se utilizan frameworks ni librerías externas.

## Configuracion del backend

El frontend decide automaticamente que backend usar:

- si se abre en local (`localhost`, `127.0.0.1` o `file://`), usa `http://localhost:3000`
- si esta desplegado, usa `https://coursetracker-backend.vercel.app`

La logica vive en [js/config.js](/home/pablo/Documents/Sem5/WD/CourseTracker/coursetracker-frontend/js/config.js:1).

## Override manual

Si quieres apuntar temporalmente a otro backend, puedes abrir el frontend con un query param como este:

```text
?apiBaseUrl=http://localhost:3000
```

Ese valor se guarda en `localStorage` para siguientes visitas.

Si quieres volver al comportamiento automatico, ejecuta en la consola del navegador:

```js
window.CourseTrackerConfig.resetApiBaseUrlOverride();
location.reload();
```

## Nota de CORS

Si el backend esta desplegado en Vercel, asegúrate de que `CORS_ORIGIN` permita tanto tu frontend desplegado como tus orígenes locales de desarrollo, por ejemplo:

```env
CORS_ORIGIN=https://tu-frontend.vercel.app,http://localhost:5500,http://127.0.0.1:5500
```
