# Berumen Sports Admin

Aplicación demo para administrar arbitrajes de una liga de fútbol. Construida con React + Vite + TypeScript.

## Setup

1. Crear proyecto en Firebase y habilitar Authentication (email/password) y Firestore.
2. Copiar `.env.example` a `.env` y llenar las variables de Firebase y el ID de liga.
3. Instalar dependencias:

```bash
npm install
```

4. Ejecutar en desarrollo:

```bash
npm run dev
```

## Deploy

Al hacer push a `main` se ejecuta GitHub Actions que compila y publica en GitHub Pages.

## Scripts

- `npm run dev` – entorno de desarrollo
- `npm run build` – compila a producción
- `npm run preview` – vista previa local

## Firestore

Incluye reglas básicas en `firestore.rules` e índices en `firestore.indexes.json`.
