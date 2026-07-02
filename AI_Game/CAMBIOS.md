# Correcciones aplicadas al Juego de 6 Damas en Esquina

## 1. Mostrar el ganador
- Nuevo modulo `src/engine/outcome.ts`: evalua el fin de partida con motivo
  (formacion completada, repeticion triple o bloqueo mutuo) y **adjudica** las
  partidas estancadas: gana quien tenga mas fichas en su meta; si empatan,
  quien este mas cerca; si tambien empatan, tablas.
- Nuevo componente `WinnerBanner`: aviso grande sobre el tablero con el
  ganador (o empate), el motivo y un boton "Jugar de nuevo".

## 2. IA vs IA y Humano vs IA funcionando bien
- **Humano vs IA:** la IA ahora responde AUTOMATICAMENTE despues de la jugada
  del humano (antes habia que pulsar un boton); hay indicador "La IA esta
  pensando…" y el tablero se bloquea mientras piensa.
- **IA vs IA:** el boton Jugar IA inicia/pausa la partida automatica.
- **Regla de bloqueo:** en un juego de solo saltos un jugador puede quedarse
  sin jugadas; ahora pasa el turno (`passTurn`) en vez de congelar la partida.
- **Fin garantizado:** repeticion triple de posicion o bloqueo mutuo terminan
  la partida con adjudicacion (verificado: todas las partidas IA vs IA
  terminan con resultado; profundidad mayor le gana a profundidad menor; la
  IA gana 9/10 contra un jugador aleatorio).

## 3. Grafica mejorada (`HeuristicChartCard`)
- Escala dinamica ajustada a los datos (antes fija -100..100: las lineas se
  veian planas), linea de cero, relleno de area por serie, etiquetas de
  valores en el eje, valor actual de cada color en la leyenda y pie de
  grafica con el numero de jugadas.

## 4. A* y Minimax bien implementados
- **A*** (`astar.ts`): nueva heuristica ADMISIBLE `admissibleMovesToGoal`
  (cota 2k-1 por alternancia de turnos) => con peso 1, A* es optimo.
  Por defecto se usa **A* ponderado (peso 2)**: encuentra el plan completo
  (27 jugadas, ~26 000 nodos, ~2.5 s) con garantia formal de costo <= 2x el
  optimo. La heuristica informativa original se conserva para ordenar nodos.
  Presupuesto por defecto subido de 3000/5000 a 30000 (antes nunca llegaba
  a la meta desde la apertura).
- **Minimax** (`minimax.ts`): profundizacion iterativa con limite de tiempo,
  penalizacion creciente por repetir posiciones ya vistas (anti-ciclos) y
  pase de turno dentro de la busqueda cuando un jugador esta bloqueado.
  Se mantienen la poda alfa-beta, el ordenamiento de jugadas y la tabla de
  transposicion.

## Correcciones de tipos (errores preexistentes que `tsc` detectaba)
- `mirroredIndex` estaba definido dos veces (board.ts y rules.ts).
- Handlers de los selects en `App.tsx` con tipos incompatibles.
- `children` obligatorio en `Button` aunque el Header lo usa solo con icono.

## Pruebas
- 4 pruebas nuevas en `rules.test.ts` (pase de turno, admisibilidad de la
  heuristica, adjudicacion, repeticion triple). Total: 16/16 pasan.
- `npx tsc --noEmit` sin errores y `npm run build` exitoso.
