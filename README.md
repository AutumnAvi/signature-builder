# Autumn Lake Email Signature Builder

A web app that helps Autumn Lake Healthcare employees rebuild their Outlook email signature using GitHub-hosted images, so that when they forward emails into Asana, the signature images don't appear as attachments on the task.

## How it works

1. **Upload a screenshot** of your current email signature
2. **AI reads** your signature text automatically (name, title, phone, email, etc.)
3. **Upload your logo/badge images** — they get stored on GitHub so they load as URLs, not attachments
4. **Download your new signature** as an HTML file and paste it into Outlook

---

## Setup (Windows)

### Prerequisites

- [Node.js 18+](https://nodejs.org/) — download and install the LTS version
- A GitHub account with access to the AutumnAvi/Assets repository
- An Anthropic API key

### 1. Clone or download this project

If you have Git:
```powershell
git clone <repo-url>
cd signature-builder
```

Or download the ZIP from GitHub and extract it.

### 2. Install dependencies

Open PowerShell in the project folder and run:
```powershell
npm install
```

### 3. Configure environment variables

Copy the example env file:
```powershell
Copy-Item .env.local.example .env.local
```

Then open `.env.local` in Notepad (or any text editor) and fill in your values:

```powershell
notepad .env.local
```

You need:

| Variable | How to get it |
|----------|---------------|
| `ANTHROPIC_API_KEY` | Go to [console.anthropic.com](https://console.anthropic.com) → API Keys → Create Key → copy it |
| `GITHUB_TOKEN` | Go to github.com → Settings → Developer Settings → Personal Access Tokens → Tokens (classic) → Generate new token (classic) → check "repo" scope → copy it |
| `GITHUB_REPO_OWNER` | Already set to `AutumnAvi` |
| `GITHUB_REPO_NAME` | Already set to `Assets` |

### 4. Start the app

```powershell
npm run dev
```

Open your browser to [http://localhost:3000](http://localhost:3000)

---

## Windows-specific notes

- **PowerShell** is used for all commands above — Command Prompt (cmd.exe) will also work for `npm` commands
- **Line endings**: `.env.local` should use Windows (CRLF) or Unix (LF) line endings — both work
- **Firewall**: If Windows Firewall prompts you when starting the dev server, click "Allow access"
- **Port conflict**: If port 3000 is in use, Next.js will automatically try 3001, 3002, etc.

---

## Deploying for the whole team

To deploy so anyone on staff can use it without installing anything:

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com), connect your GitHub repo
3. Add all four environment variables in the Vercel dashboard under Project → Settings → Environment Variables
4. Deploy — Vercel gives you a public URL you can share

---

## Tech stack

- **Next.js 15** (App Router)
- **React 19**
- **Tailwind CSS v4**
- **Anthropic SDK** (Claude Vision for reading signatures)
- **GitHub Contents API** (for hosting images)
