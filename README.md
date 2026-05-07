# Shibli Scholarship Evaluation System

## Local Development

```bash
npm install
npm run dev
```

## Deploy to Cloudflare Pages via GitHub

1. Push this folder to a GitHub repository
2. Go to https://dash.cloudflare.com → Pages → Create a project
3. Connect your GitHub account and select the repository
4. Set build settings:
   - **Framework preset:** Vite
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
5. Click Save and Deploy

Cloudflare will auto-deploy on every push to main.

## Demo Login Codes

| Role       | Password     |
|------------|--------------|
| Student    | SCHOLAR2024  |
| Supervisor | SUPER2024    |
| Admin      | ADMIN2024    |
