# Repository Guidelines

## Project Structure & Module Organization

This repository is currently a minimal workspace with one local agent skill:

- `.agents/skills/crear_prompt_estructurado/SKILL.md`: Spanish instructions for creating structured prompts using role, context, task, and output format.
- `AGENTS.md`: repository-wide contributor guidance.

There are no application source directories, tests, assets, or dependency manifests yet. Keep each additional skill in `.agents/skills/<skill_name>/SKILL.md`. When adding application code, document its directory layout and entry points here.

## Build, Test, and Development Commands

No build, development server, test runner, formatter, or linter is configured. Do not assume commands such as `npm install`, `npm test`, or `make build` are available.

Useful inspection commands from the repository root:

- `ls -la`: inspect the workspace, including hidden directories.
- `rg --files --hidden -g '!.git'`: list repository files, including agent instructions.
- `cat .agents/skills/crear_prompt_estructurado/SKILL.md`: review the existing skill.

Add verified setup and validation commands when introducing a toolchain.

## Coding Style & Naming Conventions

Use clear Markdown headings, short paragraphs, and actionable instructions. Preserve YAML front matter in skill files, including `name` and `description`. Follow the existing lowercase, underscore-separated skill directory naming pattern, such as `crear_prompt_estructurado`.

Keep the existing skill's Spanish language consistent when editing it. No language-specific indentation or automated formatting rules are established; document these when source code is introduced.

## Testing Guidelines

No automated tests or coverage requirements exist. For documentation changes, review Markdown structure, file paths, examples, and consistency between skill metadata and instructions. For skill behavior changes, manually try a representative prompt and check that the output follows the stated format. Document automated test commands and naming conventions when adding tests.

## Commit & Pull Request Guidelines

No Git metadata is present in this workspace, so historical commit conventions cannot be established. Use concise, imperative commit subjects, for example `Document structured prompt workflow`.

Pull requests should describe the purpose, changed files, and validation performed. Link relevant issues when available; include sample input and output for skill behavior changes. Never commit credentials or private user data.

## Application Structure and Local Development

The Spanish donation interface starts at `index.html`. `src/app.js` handles the form and list; `src/donations.js` validates records and reads and writes them in Supabase. `src/styles.css` defines responsive presentation. Use two-space indentation in JavaScript and native ES modules; no framework or build step is required. The earlier minimal-workspace description predates this application.

Serve the repository through a static HTTP server; ES modules require HTTP rather than opening the HTML file directly. If a working Python 3 installation is available, use `python3 -m http.server 8000` and visit `http://localhost:8000`. Supabase stores donations by account. Python could not run in the implementation environment because its system launcher requires unavailable Apple developer tools; no server command was verified here.

No automated test runner is configured. Before testing, verify that public.donaciones does not already exist and apply the migration in supabase/migrations. Test with two authenticated accounts and without a session. Confirm that each account sees only its own donations after reload and renewed login, and that API requests cannot update or delete donations or supply another owner. Also verify invalid inputs, network failures, and switching accounts while a request is pending. Failed writes preserve the form. Legacy localStorage data is left in the browser and excluded from the account history. Expired donations retain their original status in this version.

## Authentication

`src/auth.js` independently loads supabase-js v2.49.8 from jsDelivr, using only the project's publishable key. Email confirmation must be disabled for immediate signup sessions. Registration inserts into the existing `perfiles` table; login and restored sessions read the user's name through RLS. Do not modify SQL or donation storage for authentication changes.

Manually test new signup, duplicate email, short password, incorrect login password, reload persistence, local signout, failed profile operations, CDN/network failure, and donation regression. Real signup tests create accounts and profiles in Supabase. No browser/runtime or successful project connection was available in the implementation environment; these integration checks remain pending.
