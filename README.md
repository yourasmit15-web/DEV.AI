# DEV.AI — Multi-Model AI Coding Agent

> A polished desktop-style AI coding workspace built with Next.js, React, TypeScript, Tailwind CSS, Framer Motion, Lucide and Monaco Editor.

## ✨ Highlights

- Multi-model selector: Claude 3.5 Sonnet, GPT-4o, DeepSeek-V3 and Gemini 1.5 Pro
- Architect / Code / Debug operating modes
- Interactive workspace file tree
- Agent chat with concise execution summaries
- Planning → Execution → Validation → Success workflow
- Live terminal simulation and Diff Viewer
- Monaco-powered live code canvas
- Copy-to-clipboard code action
- Real-time mock token and cost telemetry
- Server-side `/api/agent` seam for real orchestration
- Responsive dark IDE interface with micro-animations

## 🧱 Architecture

```text
Browser UI → Next.js App Router → /api/agent → Agent Orchestrator
                                      ├── Model Adapters
                                      ├── Tool Executor
                                      └── Isolated Sandbox
                                           ↓
                                    Streaming Events → UI
```

The current implementation includes a deterministic mock orchestration layer so the interface works without provider credentials. It intentionally displays execution summaries instead of private model chain-of-thought.

## 🚀 Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## 🔐 Production Integration

Keep model credentials server-side. Never use `NEXT_PUBLIC_` for provider secrets. For a real coding agent, connect `/api/agent` to authenticated orchestration, provider adapters, streaming events, and an isolated sandbox with permissions, timeouts, resource limits and audit logging.

## ☁️ Deployment

This is a standard Next.js application and can be deployed to Vercel or another Node-compatible platform. Configure provider environment variables on the hosting platform only after replacing the mock orchestration layer with production adapters.

## License

Add the license appropriate for your project before distributing it publicly.
