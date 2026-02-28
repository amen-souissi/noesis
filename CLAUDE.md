# Noesis — Project Conventions

## Overview

Interactive educational application to learn how LLMs work.
LLM engine from scratch (NumPy) + Django backend + React frontend.

## Architecture

```
noesis/
├── modules/          # LLM engine (NumPy) — DO NOT MODIFY
├── autograd/         # Backpropagation engine
├── optim/            # Adam optimizer
├── training/         # Data loader
├── config.py         # Config dataclass
├── backend/          # Django REST + WebSocket (Channels/Daphne)
│   ├── api/views/    # REST endpoints
│   ├── api/services/ # EngineService (singleton), TrainingService (background thread)
│   └── api/models.py # ModelConfig, TrainingData, TrainingRun, etc.
├── frontend/         # React 18 + TypeScript + Vite + Tailwind
│   └── src/
│       ├── pages/              # Educational pages + playground
│       ├── components/         # Reusable components
│       │   ├── educational/   # VulgarizedTerm, StepExplainer, etc.
│       │   ├── visualizations/ # TokenGrid, AttentionHeatmap, etc.
│       │   └── playground/    # Educational wrappers for functional pages
│       ├── lib/               # Glossary, example data, pipeline steps
│       ├── stores/             # Zustand (training, chat, progress, example)
│       ├── hooks/              # useWebSocket, useTraining, useProgress
│       └── api/                # Axios client
└── docker-compose.yml          # redis + backend + frontend
```

## Frontend Conventions

- **Language**: French for user-facing content, English for variable/component names
- **Styling**: Tailwind CSS utility classes, dark theme (gray-950), no shadcn/ui
- **CSS components**: `.card`, `.btn-primary`, `.btn-secondary`, `.input`, `.label` (in index.css)
- **Primary color**: sky blue (primary-500: #0ea5e9)
- **State**: Zustand (simple stores, no Redux)
- **API**: Axios with base `/api`, types in `src/types/`
- **Tests**: Vitest + @testing-library/react, files in `src/__tests__/`
- **Alias**: `@/` → `src/` (configured in vite.config.ts and tsconfig.json)
- **Icons**: lucide-react only
- **Math formulas**: KaTeX (import katex, no wrapper component)
- **Flow diagrams**: React Flow (reactflow)
- **Charts**: Recharts for data visualization
- **Canvas**: Native Canvas API for perf-critical visualizations (attention heatmaps, weight matrices)

## Key Patterns

### VulgarizedTerm

Inline component for technical terms. Displays simplified term with tooltip showing scientific term.
Registry key in `src/lib/glossary.ts`. Usage: `<VulgarizedTerm termKey="learning_rate" />`

### StepExplainer

Standard layout for each step of the educational pipeline. Contains: explanation, concrete calculation, visualization, KaTeX deep dive, prev/next navigation.

### useProgress hook

Automatically marks a section as visited on mount. Usage: `useProgress('training/tokenization')`

### Example data

`src/lib/exampleData.ts` contains precompiled data for "Le chat". Educational pages use this static data; the Playground uses the real APIs.

## Commands

```bash
# Frontend
cd frontend && npm run dev          # Dev server (port 5173)
cd frontend && npm run test         # Vitest
cd frontend && npm run build        # Production build

# Docker
docker compose up                   # Start everything
docker compose up backend frontend  # Without minillm
docker compose logs -f backend     # Backend logs

# Backend
cd backend && python manage.py migrate
cd backend && python manage.py seed_presets
```

## Important Notes

- The LLM engine (modules/, autograd/, optim/) must NEVER be modified
- Backend imports the engine via PYTHONPATH=/app (Docker) or PYTHONPATH=. (local)
- EngineService and TrainingService are singletons — one model in memory
- model_lock protects concurrent access to the model during training
- WebSocket broadcasts are non-blocking (threading.Thread in \_broadcast)
- Docker memory limit: 4G on backend to avoid OOM
