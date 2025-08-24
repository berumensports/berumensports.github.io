# Gestor de modales

Este proyecto utiliza un administrador único de modales accesibles.

## API básica
```js
import { Modal } from './js/modal-manager.js';
Modal.init(); // una sola vez
```

### Abrir
```js
Modal.open('#template-id');            // modal centrado o sheet en móvil
Modal.sheet('#template-id');           // sheet forzado
Modal.open(nodo, {title:'Título'});    // contenido dinámico
```

### Cerrar
```js
Modal.close();      // cierra el más reciente
Modal.close(id);    // cierra por id
Modal.closeAll();
```

### Eventos
```js
Modal.on('open', fn);
Modal.on('afterOpen', fn);
Modal.on('beforeClose', fn);
Modal.on('afterClose', fn);
```

## Atributos declarativos
- `[data-modal-open="#id"]` abre un modal.
- `[data-modal-sheet="#id"]` abre como sheet.
- `[data-modal-close]` cierra el modal actual.

Los modales deben existir como `<template>` o `<div data-modal-id="...">` para ser descubiertos.

## Buenas prácticas
- Mantén el contenido principal dentro de `<div id="modal-root"></div>`.
- Evita listeners duplicados; `Modal.init()` es idempotente.
- Usa tokens de diseño (`--surface`, `--text`, etc.) para estilos internos.
- Recuerda que todos los modales se cierran al cambiar de ruta o cerrar sesión.
