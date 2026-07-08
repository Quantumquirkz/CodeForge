# 6 Damas en Esquina

Proyecto académico para la asignatura de Inteligencia Artificial.

## Qué incluye

- Motor de juego en TypeScript.
- Modelado del espacio de estados para el juego de 6 damas en esquina.
- Búsqueda heurística tipo A*.
- Minimax con poda alfa-beta.
- Interfaz web interactiva para jugar, analizar y visualizar movimientos.

## Supuestos formales usados

- El tablero es de 8x8.
- Cada color inicia con 6 fichas en formación triangular de esquina.
- Las fichas solo avanzan hacia la esquina opuesta de su objetivo.
- Un movimiento consiste en un salto recto hacia delante, sobre una ficha o una cadena contigua de fichas, y aterriza en la primera casilla vacía después de esa cadena.
- Las fichas saltadas permanecen en el tablero.

## Desarrollo local

```bash
cd 6ladies
npm install
npm run dev
```

## Pruebas

```bash
npm run test
```

## Build de producción

```bash
npm run build
```
