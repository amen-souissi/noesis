# Architecture Frontend — Application Éducative MiniLLM

## Vue d'ensemble

Application React pédagogique pour apprendre le fonctionnement d'un LLM (Large Language Model).
Navigation de type cours guidé : Introduction → Entraînement (8 étapes) → Génération (5 étapes) → Playground.

## Stack technique

- **React 18** + TypeScript + Vite
- **Tailwind CSS** (dark theme)
- **Zustand** (state management + persist)
- **React Router v6** (lazy loading)
- **Recharts** (graphiques)
- **KaTeX** (formules mathématiques)
- **Lucide React** (icônes)

## Structure des dossiers

```
src/
├── lib/                     # Utilitaires et données
│   ├── glossary.ts          # Registre des 25+ termes vulgarisés
│   ├── exampleData.ts       # Données précompilées "Le chat"
│   ├── pipelineSteps.ts     # Définitions des 16 sections du cours
│   └── utils.ts             # Utilitaires (cn, etc.)
│
├── types/                   # Types TypeScript
│   ├── glossary.ts          # GlossaryEntry
│   ├── progress.ts          # CourseSection, LearningProgress
│   ├── config.ts            # ModelConfig, ChatSession, ChatMessage, etc.
│   └── training.ts          # TrainingMessage, WeightSnapshot
│
├── stores/                  # Zustand stores
│   ├── progressStore.ts     # Progression du cours (persist localStorage)
│   ├── exampleStore.ts      # Phrase exemple partagée
│   ├── chatStore.ts         # État du chat
│   └── trainingStore.ts     # État de l'entraînement (WebSocket)
│
├── hooks/                   # Hooks React
│   ├── useProgress.ts       # Auto-marque section visitée au mount
│   ├── useTraining.ts       # WebSocket training + store
│   └── useWebSocket.ts      # Hook WebSocket générique
│
├── components/
│   ├── layout/              # Shell de l'application
│   │   ├── AppShell.tsx     # Layout principal avec sidebar
│   │   ├── Sidebar.tsx      # Table des matières du cours
│   │   └── LearningProgress.tsx # Barre de progression
│   │
│   ├── educational/         # Composants pédagogiques réutilisables
│   │   ├── VulgarizedTerm.tsx      # Terme inline avec infobulle
│   │   ├── StepExplainer.tsx       # Layout d'une étape de pipeline
│   │   ├── DeepDiveSection.tsx     # Section dépliable avec KaTeX
│   │   ├── ConcreteCalculation.tsx # Carte de calcul concret
│   │   ├── ExampleSentenceBanner.tsx # Bandeau phrase exemple
│   │   ├── ModuleDocLink.tsx       # Lien vers la documentation
│   │   ├── PhaseHeader.tsx         # Header de phase (Training/Gen)
│   │   └── StepNavigation.tsx      # Navigation Précédent/Suivant
│   │
│   ├── visualizations/      # Visualisations interactives
│   │   ├── TokenGrid.tsx          # Grille char↔ID
│   │   ├── EmbeddingMatrix.tsx    # Matrice de vecteurs colorée
│   │   ├── PositionalWaves.tsx    # Courbes sin/cos (Recharts)
│   │   ├── AttentionHeatmap.tsx   # Heatmap Canvas
│   │   ├── FFNDiagram.tsx         # Diagramme SVG expansion/compression
│   │   ├── LossComparison.tsx     # Barres prédictions (Recharts)
│   │   ├── GradientFlow.tsx       # Animation flux de gradients
│   │   ├── OptimizerViz.tsx       # Visualisation Adam
│   │   ├── SoftmaxBar.tsx         # Distribution + slider température
│   │   ├── AutoregressiveLoop.tsx # Animation pas-à-pas
│   │   └── ArchitectureDiagram.tsx # Diagramme interactif SVG
│   │
│   └── playground/           # Composants du terrain de jeu
│       ├── PlaygroundConfig.tsx    # Config avec VulgarizedTerm
│       ├── PlaygroundData.tsx      # Upload + stats corpus
│       ├── PlaygroundTraining.tsx  # Entraînement avec annotations
│       └── PlaygroundChat.tsx      # Chat avec contexte éducatif
│
├── pages/
│   ├── IntroductionPage.tsx       # Page d'accueil du cours
│   ├── PlaygroundPage.tsx         # 4 onglets interactifs
│   ├── training-steps/            # 8 étapes d'entraînement
│   └── generation-steps/          # 5 étapes de génération
│
├── api/                     # Clients API (Axios)
│   ├── config.ts            # CRUD configurations
│   ├── data.ts              # Upload/gestion données
│   ├── training.ts          # Start/stop/pause entraînement
│   └── generation.ts        # Chat et génération de texte
│
└── __tests__/               # Tests Vitest
    ├── setup.ts             # Configuration testing-library
    ├── lib/                 # Tests utilitaires
    ├── stores/              # Tests stores
    ├── components/          # Tests composants
    └── pages/               # Tests d'intégration pages
```

## Patterns clés

### VulgarizedTerm
Terme pédagogique inline utilisé partout. Affiche le terme accessible avec infobulle
montrant le terme scientifique, la définition et le lien doc.

```tsx
<VulgarizedTerm termKey="learning_rate" />
// → "Vitesse d'apprentissage" avec tooltip "Learning Rate"

<VulgarizedTerm termKey="d_model">la taille des vecteurs</VulgarizedTerm>
// → Override du texte affiché
```

### StepExplainer
Layout réutilisable pour chaque étape du pipeline. Compose automatiquement :
PhaseHeader + badge étape + ExampleSentenceBanner + explication + calcul + viz + deep dive + nav.

```tsx
<StepExplainer
  sectionId="training/tokenization"
  phase="training"
  stepNumber={1}
  totalSteps={8}
  title="Tokenisation"
  subtitle="Du texte aux nombres"
  explanation={<>...</>}
  calculation={<ConcreteCalculation>...</ConcreteCalculation>}
  visualization={<TokenGrid ... />}
  deepDive={<DeepDiveSection formulas={[...]} />}
/>
```

### Données précompilées
Les pages éducatives utilisent `exampleData.ts` (données statiques pour "Le chat").
Pas de dépendance API — les visualisations fonctionnent instantanément.

### Progression
`useProgress(sectionId)` dans chaque page marque la section visitée au mount.
Le store persiste en localStorage via Zustand persist.

## Routes

| Route | Page | Phase |
|---|---|---|
| `/` | IntroductionPage | Découvrir |
| `/training/tokenization` | TokenizationStep | Entraînement |
| `/training/embedding` | EmbeddingStep | Entraînement |
| `/training/positional-encoding` | PositionalEncodingStep | Entraînement |
| `/training/attention` | AttentionStep | Entraînement |
| `/training/feedforward` | FeedForwardStep | Entraînement |
| `/training/loss` | LossStep | Entraînement |
| `/training/backpropagation` | BackpropagationStep | Entraînement |
| `/training/optimizer` | OptimizerStep | Entraînement |
| `/generation/prompt` | PromptTokenizationStep | Génération |
| `/generation/forward-pass` | ForwardPassStep | Génération |
| `/generation/softmax` | SoftmaxTemperatureStep | Génération |
| `/generation/sampling` | TokenSamplingStep | Génération |
| `/generation/autoregressive` | AutoregressiveLoopStep | Génération |
| `/playground` | PlaygroundPage | Pratiquer |
| `/docs` | DocumentationHub | Référence |
| `/docs/:slug` | ModuleDetail | Référence |

## Commandes

```bash
npm run dev          # Serveur de développement (port 5173)
npm run build        # Build production
npm run test         # Lancer les tests
npm run test:watch   # Tests en mode watch
```
