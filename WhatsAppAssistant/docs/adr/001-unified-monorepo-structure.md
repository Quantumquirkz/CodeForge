# ADR 001: Estructura unificada monorepo

## Estado

Aceptado

## Contexto

El proyecto tenia dos estructuras paralelas: Chat-Enhancer (frontend + backend mock) y backend (backend real). El frontend estaba dentro de Chat-Enhancer. Esto generaba confusion y duplicacion.

## Decision

Unificar en monorepo con frontend/, backend/, shared/. Un solo comando npm run dev con concurrently.

## Consecuencias

- Positivas: Estructura clara, sin duplicados
- El backend debe cumplir el contrato en shared/schema.ts
