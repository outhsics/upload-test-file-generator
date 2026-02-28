# Contributing

Thanks for contributing.

## Development Setup

```bash
pnpm install
pnpm run dev
```

## Commit Guidelines

- Use clear, scoped commit messages.
- Keep PRs small and focused.
- Update docs when behavior changes.

## Before Opening PR

```bash
pnpm run icons:generate
pnpm run build:mac
cargo check --manifest-path src-tauri/Cargo.toml
```

## Pull Request Requirements

- Describe what changed and why.
- Include screenshots/GIF for UI changes.
- Mention platform impact (macOS/Windows).
