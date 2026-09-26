# Charitas IT Issue & FAQ System

Production-oriented internal IT Issue & FAQ platform for Charitas built with a **React + TypeScript** frontend and **Google Apps Script** as the production backend, utilizing **Google Sheets** for persistence.

## Architecture

```text
Local Development:
Vite -> React + TypeScript -> AppAdapter -> MockAdapter -> Mock Data

Production Web App:
GAS Web App (doGet) -> HtmlService -> React Bundle -> AppAdapter -> AppsScriptAdapter -> google.script.run -> GAS Services -> Google Sheets
```

## Quick Start

```bash
# Install dependencies
npm install

# Typecheck
npm run typecheck

# Build bundle
npm run build

# Run tests
npm test

# Local development server
npm run dev
```
