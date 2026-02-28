# Security Policy

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **Do not** open a public issue for security vulnerabilities.
2. Email the maintainers with a description of the vulnerability and steps to reproduce.
3. Allow a reasonable time for a fix before disclosing publicly.

We will acknowledge your report and keep you informed of the progress.

## Security Considerations

- **Secrets**: Never commit API keys, passwords, or tokens. Use environment variables or `.env` files (which are gitignored).
- **Dependencies**: Keep Python and Node dependencies up to date. Run `pip audit` and `npm audit` periodically.
- **Django**: Use `DEBUG=False` in production. Configure `ALLOWED_HOSTS` and `CSRF_TRUSTED_ORIGINS` appropriately.
- **CORS**: The backend uses `django-cors-headers`; ensure origins are correctly configured for production.
