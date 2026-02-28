import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import AppShell from "./components/layout/AppShell";
import RequireAuth from "./components/auth/RequireAuth";
import { Loader2 } from "lucide-react";

// Pages publiques
const LandingPage = lazy(() => import("./pages/LandingPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));

// Pages éducatives
const IntroductionPage = lazy(() => import("./pages/IntroductionPage"));

// Rappels Mathématiques
const VectorsMatricesPage = lazy(
  () => import("./pages/math-refresher/VectorsMatricesPage"),
);
const MatrixProductPage = lazy(
  () => import("./pages/math-refresher/MatrixProductPage"),
);
const SpecialFunctionsPage = lazy(
  () => import("./pages/math-refresher/SpecialFunctionsPage"),
);
const DerivativesPage = lazy(
  () => import("./pages/math-refresher/DerivativesPage"),
);

// Pipeline Entraînement
const TokenizationStep = lazy(
  () => import("./pages/training-steps/TokenizationStep"),
);
const EmbeddingStep = lazy(
  () => import("./pages/training-steps/EmbeddingStep"),
);
const PositionalEncodingStep = lazy(
  () => import("./pages/training-steps/PositionalEncodingStep"),
);
const AttentionStep = lazy(
  () => import("./pages/training-steps/AttentionStep"),
);
const FeedForwardStep = lazy(
  () => import("./pages/training-steps/FeedForwardStep"),
);
const LossStep = lazy(() => import("./pages/training-steps/LossStep"));
const BackpropagationStep = lazy(
  () => import("./pages/training-steps/BackpropagationStep"),
);
const OptimizerStep = lazy(
  () => import("./pages/training-steps/OptimizerStep"),
);
const TrainingRecapPage = lazy(
  () => import("./pages/training-steps/TrainingRecapPage"),
);

// Pipeline Génération
const PromptTokenizationStep = lazy(
  () => import("./pages/generation-steps/PromptTokenizationStep"),
);
const ForwardPassStep = lazy(
  () => import("./pages/generation-steps/ForwardPassStep"),
);
const SoftmaxTemperatureStep = lazy(
  () => import("./pages/generation-steps/SoftmaxTemperatureStep"),
);
const TokenSamplingStep = lazy(
  () => import("./pages/generation-steps/TokenSamplingStep"),
);
const AutoregressiveLoopStep = lazy(
  () => import("./pages/generation-steps/AutoregressiveLoopStep"),
);

// Aller plus loin
const BeyondStatisticsPage = lazy(() => import("./pages/BeyondStatisticsPage"));

// Playground & Référence
const PlaygroundPage = lazy(() => import("./pages/PlaygroundPage"));
const DocumentationHub = lazy(() => import("./pages/DocumentationHub"));
const ModuleDetail = lazy(() => import("./pages/ModuleDetail"));

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Routes publiques (pas de sidebar) */}
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Routes protégées (avec sidebar) */}
          <Route element={<RequireAuth />}>
            <Route element={<AppShell />}>
              {/* Découvrir */}
              <Route path="/" element={<IntroductionPage />} />

              {/* Rappels Mathématiques */}
              <Route
                path="/math/vectors-matrices"
                element={<VectorsMatricesPage />}
              />
              <Route
                path="/math/matrix-product"
                element={<MatrixProductPage />}
              />
              <Route
                path="/math/special-functions"
                element={<SpecialFunctionsPage />}
              />
              <Route path="/math/derivatives" element={<DerivativesPage />} />

              {/* Pipeline Entraînement */}
              <Route
                path="/training/tokenization"
                element={<TokenizationStep />}
              />
              <Route path="/training/embedding" element={<EmbeddingStep />} />
              <Route
                path="/training/positional-encoding"
                element={<PositionalEncodingStep />}
              />
              <Route path="/training/attention" element={<AttentionStep />} />
              <Route
                path="/training/feedforward"
                element={<FeedForwardStep />}
              />
              <Route path="/training/loss" element={<LossStep />} />
              <Route
                path="/training/backpropagation"
                element={<BackpropagationStep />}
              />
              <Route path="/training/optimizer" element={<OptimizerStep />} />
              <Route path="/training/recap" element={<TrainingRecapPage />} />

              {/* Pipeline Génération */}
              <Route
                path="/generation/prompt"
                element={<PromptTokenizationStep />}
              />
              <Route
                path="/generation/forward-pass"
                element={<ForwardPassStep />}
              />
              <Route
                path="/generation/softmax"
                element={<SoftmaxTemperatureStep />}
              />
              <Route
                path="/generation/sampling"
                element={<TokenSamplingStep />}
              />
              <Route
                path="/generation/autoregressive"
                element={<AutoregressiveLoopStep />}
              />

              {/* Aller plus loin */}
              <Route path="/deeper/beyond" element={<BeyondStatisticsPage />} />

              {/* Pratiquer */}
              <Route path="/playground" element={<PlaygroundPage />} />

              {/* Référence */}
              <Route path="/docs" element={<DocumentationHub />} />
              <Route path="/docs/:slug" element={<ModuleDetail />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
