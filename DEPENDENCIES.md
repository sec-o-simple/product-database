## Dependencies

This project is split into [frontend](./client/README.md) and [backend](./server/README.md). Below is a breakdown of core dependencies, their roles, and notes on tooling.

### Frontend

#### Runtime / Production Dependencies

| Package | Purpose |
|--------|---------|
| `react`, `react-dom` | UI library and rendering. |
| `@heroui/*` | Accessible, composable design system components for the frontend. |
| `tailwind-variants` | Composition of Tailwind CSS variant-based styles. |
| `tailwindcss` | Utility-first styling framework. |
| `@tanstack/react-query` | Data fetching, caching, and synchronization. |
| `openapi-fetch`, `openapi-react-query` | OpenAPI-driven typed client integration with React Query. |
| `date-fns` | Date manipulation and formatting. |
| `i18next`, `react-i18next` | Internationalization and localization. |
| `@internationalized/date`, `@react-aria/visually-hidden`, `@react-types/shared` | Accessibility and localized date handling. |
| `@mui/x-tree-view` | Hierarchical tree view UI component. |

#### Development / Tooling Dependencies

| Package | Purpose |
|--------|---------|
| `vite` | Development server and bundler. |
| `vitest` | Testing framework. |
| `typescript` | Static typing and compile-time checks. |
| `eslint` + plugins | Linting and code quality enforcement. |
| `prettier` | Code formatting. |
| `openapi-typescript` | Generation of TypeScript types from OpenAPI schemas. |
| `vite-tsconfig-paths` | Path alias resolution in Vite from tsconfig. |
| `@vitejs/plugin-react` | React integration for Vite. |
| `postcss`, `autoprefixer` | CSS processing for Tailwind. |
| `@types/*` | Type definitions for third-party libraries. |

### Backend (Go)

#### Direct Dependencies

| Module | Purpose |
|--------|---------|
| `github.com/go-fuego/fuego` | Background job and workflow orchestration. |
| `github.com/google/uuid` | UUID generation. |
| `github.com/joho/godotenv` | Environment configuration loading. |
| `gorm.io/gorm`, `gorm.io/driver/sqlite` | ORM layer and SQLite persistence driver. |

#### Indirect / Transitive Dependencies (notable examples)

| Module / Family | Purpose |
|-----------------|---------|
| `github.com/getkin/kin-openapi`, `github.com/go-openapi/*` | OpenAPI parsing and utilities. |
| `github.com/go-playground/validator/v10` + localization | Input validation with translations. |
| `github.com/golang-jwt/jwt/v5` | JWT handling. |
| `github.com/gorilla/schema` | Decoding form/query parameters. |
| `github.com/mattn/go-sqlite3` | SQLite driver. |
| `golang.org/x/crypto`, `golang.org/x/text` | Cryptography and internationalization support. |
| `gopkg.in/yaml.v3` | YAML parsing. |