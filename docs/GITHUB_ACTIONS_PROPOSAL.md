# GitHub Actions Deployment Proposal

## Overview

Currently, deployment is handled manually via the local `npm run release` script, which uses `standard-version` for versioning and `firebase deploy` for hosting. To improve reliability, consistency, and collaboration, moving this process to a CI/CD pipeline using GitHub Actions is recommended.

## Proposed Workflow

### 1. Continuous Integration (CI) - `ci.yml`

**Trigger:** Push to any branch, Pull Requests.

**Steps:**

1.  **Checkout Code**: Clone the repository.
2.  **Setup Node.js**: Install Node.js environment.
3.  **Install Dependencies**: `npm ci`
4.  **Lint & Type Check**: `npm run lint` (if available) & `npx tsc --noEmit`
5.  **Run Tests**: `npm run test:run`

**Benefit:** Ensures no broken code is merged into `main`.

### 2. Continuous Deployment (CD) - `release.yml`

**Trigger:** Push to `main` (only if passing CI) OR Manual Dispatch.

**Steps:**

1.  **Checkout Code**: Clone the repository.
2.  **Setup Node.js**: Install Node.js environment.
3.  **Install Dependencies**: `npm ci`
4.  **Build**: `npm run build`
5.  **Deploy to Firebase**:
    - Use `firebase-tools` or a dedicated action like `FirebaseExtended/action-hosting-deploy`.
    - Requires `FIREBASE_TOKEN` secret in GitHub repository settings.

### 3. Automated Versioning (Optional but Recommended)

Instead of running `standard-version` locally, the CI can handle it:

1.  **Analyze Commits**: Check for conventional commits (feat, fix, breaking change).
2.  **Bump Version**: Update `package.json` and generate `CHANGELOG.md`.
3.  **Create Tag**: Push new tag to repo.
4.  **Create Release**: Create GitHub Release.

## Implementation Plan

1.  **Generate Firebase Token**: Run `firebase login:ci` locally to get a token.
2.  **Add Secrets**: Add `FIREBASE_TOKEN` and `GEMINI_API_KEY` (for build time env vars) to GitHub Repo Secrets.
3.  **Create Workflow Files**:
    - `.github/workflows/ci.yml`
    - `.github/workflows/deploy.yml`

## Example `deploy.yml`

```yaml
name: Deploy to Firebase Hosting on merge
on:
  push:
    branches:
      - main
jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT_ADVENTURE_CRAFT }}
          channelId: live
          projectId: adventure-craft
```

_Note: For official Firebase Hosting action, a Service Account is preferred over a generic token for better security control._
