## Dependencies

This project is split into [frontend](./client/README.md) and [backend](./server/README.md). 
Below is a breakdown of the key dependencies, their roles, and notes on tooling.

### Frontend

#### Runtime / Production Dependencies

| Package | Purpose |
|--------|---------|
| `react`, `react-dom` | Core UI library and rendering. |
| `@heroui/*` (accordion, alert, button, chip, code, dropdown, input, kbd, link, navbar, radio, select, snippet, switch, system, table, tabs, theme, toast, use-theme, etc.) | Design system / accessible UI components for consistent look-and-feel. |
| `tailwind-variants` | Utility for composing and managing Tailwind CSS variant-based styles. |
| `tailwindcss` | Utility-first CSS framework for styling. |
| `@tanstack/react-query` | Data fetching, caching, and synchronization abstraction. |
| `openapi-fetch`, `openapi-react-query` | OpenAPI-driven client scaffolding and integration with React Query for typed API consumption. |
| `@emotion/styled` | CSS-in-JS helper (used where dynamic styling beyond Tailwind is needed). |
| `clsx` | Conditional class name composition. |
| `date-fns` | Date utilities for formatting and manipulation. |
| `framer-motion` | Animation and transition primitives. |
| `i18next`, `react-i18next` | Internationalization/localization. |
| `@internationalized/date`, `@react-aria/visually-hidden`, `@react-types/shared` | Accessibility and internationalized date handling (supporting HeroUI’s needs). |
| `@mui/x-tree-view` | Tree view UI component (likely for hierarchical product/category display). |

#### Development / Tooling Dependencies

| Package | Purpose |
|--------|---------|
| `vite` | Fast dev server and build bundler. |
| `vitest` | Unit / integration testing framework. |
| `typescript` | Static typing for safety and maintainability. |
| `eslint` + plugins (`@typescript-eslint`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-tailwindcss`, `eslint-plugin-import`, `eslint-plugin-jsx-a11y`, `eslint-plugin-node`, `eslint-plugin-prettier`, `eslint-plugin-react-refresh`, `eslint-plugin-unused-imports`) | Code quality, consistency, linting. |
| `prettier` | Opinionated code formatting. |
| `openapi-typescript` | Generates TypeScript types from OpenAPI schema (used in `generate:api`). |
| `vite-tsconfig-paths` | Resolves path aliases in Vite based on tsconfig. |
| `@vitejs/plugin-react` | React integration for Vite. |
| `postcss`, `autoprefixer` | CSS processing pipeline required by Tailwind. |
| `@types/*` (React, React DOM, Node) | Type definitions to support TypeScript usage of external libraries. |

### Backend (Go)

#### Direct Dependencies

| Module | Purpose |
|--------|---------|
| `github.com/go-fuego/fuego` | Background job/workflow orchestration. |
| `github.com/google/uuid` | UUID generation. |
| `github.com/joho/godotenv` | Loading `.env` files for configuration in development. |
| `gorm.io/gorm`, `gorm.io/driver/sqlite` | ORM and SQLite driver for persistence. |

#### Indirect / Transitive Dependencies (examples of notable ones)

These are pulled in by the above modules and support things like validation, OpenAPI handling, JWT auth, localization, and more.

- `github.com/getkin/kin-openapi`, `github.com/go-openapi/*` family — OpenAPI parsing and utilities.  
- `github.com/go-playground/validator/v10` + localization tooling — Input validation with translations.  
- `github.com/golang-jwt/jwt/v5` — JWT handling for authentication/authorization.  
- `github.com/gorilla/schema` — Decoding form/query parameters.  
- `github.com/mattn/go-sqlite3` — SQLite driver (cgo-backed).  
- `golang.org/x/crypto`, `golang.org/x/text` — Crypto utilities and internationalization support.  
- `gopkg.in/yaml.v3` — YAML parsing (likely for config or schema diffs).  

(There are additional `indirect` modules for MIME type detection, deep copying, semantic helpers, and OpenAPI diffing; they are managed transitively.)

### Notes

- **Separation of concerns:** Frontend handles UI, typing, and API consumption via OpenAPI-generated types; backend encapsulates business logic, persistence, and background processing with Fuego.  
- **API contract:** The frontend uses `openapi-typescript` and `openapi-react-query`/`openapi-fetch` to stay in sync with the OpenAPI schema, reducing drift.  
- **Validation & Localization:** Backend bundles validation and translation tooling (e.g., `validator/v10`, universal-translator) to provide user-friendly error messages.  
- **Reproducibility:** Versions are mostly pinned; ensure the appropriate lockfiles (`package-lock.json` or equivalent) and Go module files are committed for consistent installs.  
- **Performance & Developer DX:** Vite + Vitest on the frontend for rapid iteration; Go’s compiled binaries and Fuego for efficient background work on the backend.

