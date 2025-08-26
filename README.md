# Berumen Sports Admin

SPA simple para administrar liga Berumen usando Firebase y GitHub Pages.

## Configuración
1. Crea un proyecto Firebase y habilita Email/Password en Auth.
2. Configura Firestore y copia las reglas de `firestore.rules` e índices de `firestore.indexes.json`.
3. Edita `src/data/firebase.js` con tu `firebaseConfig` (usa storageBucket `<project-id>.appspot.com`).
4. Despliega el repositorio en GitHub Pages (asegúrate de que `index.html` y la carpeta `assets/` estén en la raíz).
5. Crea el primer usuario en Auth y agrega documento `users/{uid}` con `{ role: "admin", ligaId: "BERUMEN" }`.

## Desarrollo
```
# instalar dependencias
npm install firebase
# ejecutar con un servidor estático
npx serve .
```

## Uso
- Login con correo/contraseña.
- Dashboard con botón de prueba de escritura.
- Módulos de equipos, árbitros, partidos, cobros y reportes básicos.

