# Architecture Refactor Plan

## Current state

Project Brain is now organized around a file-protocol-first architecture:

- `core`
- `protocol`
- `infra-fs`
- `mode-embedded`
- `app`

## Refactor target

- Keep core domain logic transport-agnostic.
- Keep protocol definitions pure and reusable.
- Keep infra adapters isolated in `infra-fs`.
- Keep CLI focused on repository-local memory workflows.
