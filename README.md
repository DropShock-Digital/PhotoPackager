<p align="center">
  <img src="assets/PhotoPackager_Patch.png" alt="PhotoPackager" width="220">
</p>

<h1 align="center">PhotoPackager</h1>

<p align="center"><strong>Turn a folder of photos into organized, client-ready delivery packages.</strong></p>

<p align="center">
  <a href="https://github.com/DropShock-Digital/PhotoPackager/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/DropShock-Digital/PhotoPackager/actions/workflows/ci.yml/badge.svg"></a>
  <a href="LICENSE"><img alt="MIT License" src="https://img.shields.io/badge/license-MIT-0ea5e9"></a>
  <img alt="Python 3.12" src="https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white">
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=111827">
</p>

PhotoPackager automates the repetitive work between a finished shoot and a clean delivery. It can preserve originals, create optimized or compressed copies, apply an EXIF policy, and produce downloadable ZIP packages through a desktop workflow, command line, web interface, or MCP tools.

> **Project status:** Public beta. The core packaging workflow is functional, but the interfaces and configuration may still change.

## What it does

- Organizes a shoot into predictable delivery folders.
- Creates JPG and WebP variants at configurable quality levels.
- Preserves, selectively removes, or strips EXIF metadata.
- Builds ZIP packages for client delivery.
- Supports dry runs before writing output.
- Offers CLI, FastAPI, Celery/Redis, React, and MCP entry points over the same packaging engine.

PhotoPackager does **not** replace a DAM, gallery host, backup system, or delivery contract. It prepares files; you remain responsible for retaining originals and confirming the package before delivery.

## Quick start with Docker

Docker is the simplest way to run the complete web workflow:

```bash
git clone https://github.com/DropShock-Digital/PhotoPackager.git
cd PhotoPackager
docker compose up --build
```

Open <http://localhost:5601>. The Compose stack runs the web/API service, Redis, and the background worker.

## Local development

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
npm run dev
```

### Command line

```bash
python photo_packager_cli.py --help
```

## Privacy and deployment

Photo files may contain faces, locations, camera identifiers, and client information.

- Run PhotoPackager locally when practical.
- Generated packages and temporary uploads are intentionally excluded from Git.
- Review EXIF settings and inspect every package before sharing it.
- Keep originals outside PhotoPackager's output directory and in your normal backup system.
- **Do not expose the included web/API service directly to the public internet.** It does not provide production-ready authentication, authorization, retention controls, or hardened multi-tenant isolation.

If you deploy it for a team, put it in isolated infrastructure and add authentication, access controls, encrypted transport, storage lifecycle rules, monitoring, and backups.

## Repository map

| Path | Purpose |
| --- | --- |
| `photo_packager.py` | Core packaging workflow |
| `photo_packager_cli.py` | Command-line interface |
| `main.py` | FastAPI web/API entry point |
| `worker.py` | Celery background worker |
| `mcp_tools.py` | MCP-facing tools |
| `frontend/` | React web interface |
| `tests/` | Automated test suite |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Please report security concerns through the process in [SECURITY.md](SECURITY.md), not in a public issue.

## License

PhotoPackager is available under the [MIT License](LICENSE).

Built by [DropShock Digital](https://dropshockdigital.com) and Steven Seagondollar.
