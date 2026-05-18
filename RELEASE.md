# Release process

Use SemVer tags in the format `vMAJOR.MINOR.PATCH` (for example `v1.2.0`).

## End-to-End Release Steps

1. Sync your local repository with `main`.
   ```bash
   git checkout main
   git pull origin main
   ```

2. Create a new branch for the release preparation.
   ```bash
   git checkout -b release/x-y-z
   ```

3. Update dependencies
   ```bash
   # Client
   cd client
   npm update
   npm install

   # Server
   cd ../server
   go get -u ./...
   go mod tidy
   cd ..
   ```
   This updates dependency versions where allowed and refreshes lockfiles (`package-lock.json`, `go.sum`).

4. Check security issues and decide how to handle findings.
   ```bash
   cd client
   npm audit
   ```
   If fixes are available and safe, apply them and re-test:
   ```bash
   npm audit fix
   ```

5. Bump the version in `client/package.json` to the target release version. Also run `npm install` to update `package-lock.json`.

6. Run quality checks and fix all blocking issues before releasing.
   ```bash
   # Client
   cd client
   npm run lint
   npm test
   npm run build

   # Server
   cd ../server
   make lint
   make test
   make build
   cd ..
   ```

7. Commit the release preparation changes (version bump, lockfile changes, and any fixes).
   ```bash
   git add -A
   git commit -m "Prepare release vX.Y.Z"
   ```

8. Push the release preparation branch and create a pull request to `main`.
   ```bash
   git push origin release/x-y-z
   ```
   After the PR is approved and merged, pull the latest `main` to your local repository.
   ```bash
   git checkout main
   git pull origin main
   ```

9. Create and push an **annotated** tag.
   ```bash
   git tag -a vX.Y.Z -m "product-database vX.Y.Z: short summary"
   git push origin main
   git push origin vX.Y.Z
   ```

10. Wait for [release.yml](./.github/workflows/release.yml) to run.
   The workflow generates release notes and creates the GitHub release as a **draft**.

11. Open the draft release in GitHub and review everything manually.
   Check generated notes, included commits, and attached artifacts.

12. Publish the draft release manually when verification is complete.