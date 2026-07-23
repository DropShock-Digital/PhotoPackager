# Contributing to PhotoPackager

Thanks for helping improve PhotoPackager.

## Before opening a change

- Search existing issues first.
- Keep changes focused and explain the user problem they solve.
- Do not commit client photos, generated packages, credentials, local databases, build artifacts, or private AI context.
- Discuss large interface, storage, or deployment changes in an issue before implementation.

## Development checks

```bash
python -m pytest -v
cd frontend
npm ci
npm run lint
npm run build
```

Docker changes should also pass:

```bash
docker build -t photopackager-local .
```

## Pull requests

Include:

1. What changed and why.
2. How it was tested.
3. Screenshots for visible interface changes.
4. Any privacy, compatibility, or migration impact.

By contributing, you agree that your contribution may be distributed under the repository's MIT License.
