# Product Database

## Project Structure

```
product-database/
├── server/     # Go server API (GORM, Fuego)
├── client/     # Vite + React frontend
├── docs/        # Documentation (OpenAPI, Database)
```

---

## Development Setup

```sh
# Clone repository
git clone git@github.com:sec-o-simple/product-database.git
cd product-database

```

This is a monorepo. Each subproject (`server`, `client`) has its own setup instructions.

**Please refer to the individual README files** in `./server` and `./client` for detailed installation and development guidance:

- [`server/README.md`](./server/README.md)
- [`client/README.md`](./client/README.md)

## Branching policy

When working on new features or fixing bugs, create a new branch based on main
and give it a meaningful name. Rebase or merge main regularly into your branch
in order to prevent large merge conflicts.

Naming examples:

- feat/navigation-redesign
- fix/excessive-loading-time

Regularly rebase or merge `main` into your branch to stay up to date.
