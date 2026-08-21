# PhotoPackager

<p align="center">
  <img src="assets/readme/photopackager-banner-concept.png" alt="Illustrative PhotoPackager concept: an abstract aperture-and-package mark beside unlabeled archival photo sleeves and a sealed delivery packet." width="100%">
</p>

<p align="center"><strong>Turn a folder of photos into organized, client-ready delivery packages.</strong></p>

<p align="center">
  <a href="https://github.com/DropShock-Digital/PhotoPackager/actions/workflows/ci.yml"><img alt="CI workflow" src="https://github.com/DropShock-Digital/PhotoPackager/actions/workflows/ci.yml/badge.svg"></a>
  <a href="LICENSE"><img alt="MIT License" src="https://img.shields.io/badge/license-MIT-0ea5e9"></a>
  <img alt="Python 3.11+" src="https://img.shields.io/badge/Python-3.11%2B-3776AB?logo=python&logoColor=white">
</p>

> **Review copy only.** This is a proposed replacement for `README.md` on branch `docs/readme-brand-draft`. It does not replace the primary README, existing official logo, or project visibility.

> **Visual concept:** The banner and embedded mark are original Codex-OAuth generated concepts. They are illustrative—not a product screenshot, client delivery, or official logo replacement—and remain review-only until approved.

PhotoPackager prepares a finished shoot for delivery. It can preserve originals, create optimized or compressed copies, apply an EXIF policy, and produce ZIP packages through desktop, command-line, web, or MCP entry points.

> **Project status:** Public beta. The core packaging workflow is functional; interfaces and configuration may still change.

<table>
<tr>
<td width="50%" valign="top">

### It helps with

- Predictable delivery folders
- JPG and WebP variants
- EXIF preserve/remove/strip policy
- ZIP package creation
- Dry runs before output is written
- CLI, web, worker, and MCP paths over one engine

</td>
<td width="50%" valign="top">

### It does not replace

- A digital asset manager
- A gallery host
- Your backup system
- A delivery contract
- Your review before client delivery

</td>
</tr>
</table>

## Start with the full local workflow

**Requirements:** Docker for the simplest full web workflow.

```bash
git clone https://github.com/DropShock-Digital/PhotoPackager.git
cd PhotoPackager
docker compose up --build
```

Open <http://localhost:5601>. The Compose stack starts the web/API service, Redis, and the background worker.

<details>
<summary><strong>Local development, CLI, and verification</strong></summary>

### Backend and tests

```bash
python3.12 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt -r requirements-dev.txt
python -m pytest -v
```

### Frontend

```bash
cd frontend
npm ci
npm run lint
npm run build
```

### Command line

```bash
python app.py cli --help
```
</details>

## Keep photo data private

Photo files can contain faces, locations, camera identifiers, and client information.

- Run PhotoPackager locally when practical.
- Generated packages and temporary uploads are intentionally excluded from Git.
- Review EXIF settings and inspect every package before sharing it.
- Keep originals outside the output directory and in your normal backup system.
- Do **not** expose the included web/API service directly to the public Internet.

The included stack does not provide production-ready authentication, authorization, multi-tenant isolation, or retention controls by default. Team deployment requires isolated infrastructure plus authentication, access controls, encrypted transport, storage lifecycle rules, monitoring, and backups.

## Know where to look

| Path | Role |
| --- | --- |
| `job.py` and `image_processing.py` | Core packaging workflow |
| `app.py` | Desktop/command-line launcher |
| `main.py` | FastAPI web/API entry point |
| `worker.py` | Celery background worker |
| `mcp_tools.py` | MCP-facing tools |
| `frontend/` | React web interface |
| `tests/` | Automated test suite |

## Contributing and security

See [CONTRIBUTING.md](CONTRIBUTING.md). Report security concerns through [SECURITY.md](SECURITY.md), not in a public issue. Do not commit client photos, generated packages, credentials, local databases, build artifacts, or private AI context.

## License

PhotoPackager is available under the [MIT License](LICENSE).

Built by [DropShock Digital](https://dropshockdigital.com) and Steven Seagondollar.
