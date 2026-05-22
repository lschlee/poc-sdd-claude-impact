<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan
at `specs/001-next-visit-priority/plan.md`.
<!-- SPECKIT END -->

## Run locally (WSL2 → Windows default browser)

1. From the project root in WSL: `pnpm dev` (Next.js dev server on port 3000).
2. Open the Windows default browser pointed at the dev server:
   - `explorer.exe http://localhost:3000` — recommended; uses Windows' default browser.
   - Or `cmd.exe /c start http://localhost:3000` — equivalent fallback.
   - Or just paste `http://localhost:3000` into the Windows browser manually.

WSL2's built-in `localhost` forwarding makes the dev server reachable from Windows
without extra config. If `localhost:3000` ever fails to connect from Windows
(e.g. corporate VPN or `localhostForwarding=false` in `.wslconfig`), bind Next
explicitly and use the WSL IP:

```bash
pnpm exec next dev -H 0.0.0.0 -p 3000
hostname -I   # take the first IP, e.g. 172.19.159.119 → http://172.19.159.119:3000
```

For E2E tests, Playwright is configured to start the dev server itself —
`pnpm test:e2e` is enough; do not start `pnpm dev` separately.
