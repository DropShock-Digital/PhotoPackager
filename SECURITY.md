# Security Policy

PhotoPackager processes photos and metadata, so privacy and file-handling issues are security issues.

## Reporting a vulnerability

Please use GitHub's private **Report a vulnerability** option for this repository. Do not include credentials, private photos, client information, or proof-of-concept data in a public issue.

Include the affected version or commit, the impact, reproduction steps using non-sensitive sample data, and any suggested mitigation. We will acknowledge a well-formed report as capacity allows; this open-source project does not promise a specific response or remediation deadline.

## Deployment boundary

The included web/API stack is intended for local development and controlled environments. It does not provide production-ready authentication, authorization, multi-tenant isolation, or retention controls by default. Do not expose it directly to the public internet without adding those controls in isolated infrastructure.

## Supported versions

Security fixes target the latest commit on the default branch. Older snapshots and unofficial packaged builds are not supported.
