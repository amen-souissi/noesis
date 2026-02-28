import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Brain, Loader2, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { login as loginApi } from "@/api/auth";
import { getMe } from "@/api/auth";
import { useAuthStore } from "@/stores/authStore";

export default function LoginPage() {
  const { t } = useTranslation("pages");
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname || "/";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data: tokens } = await loginApi({ username, password });
      // Temporarily set tokens to make the getMe call work
      useAuthStore.getState().setTokens(tokens);
      const { data: user } = await getMe();
      setAuth(user, tokens);
      navigate(from, { replace: true });
    } catch (err: any) {
      if (err?.response?.status === 401) {
        setError(t("login.errors.invalidCredentials"));
      } else {
        setError(t("login.errors.generic"));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/landing" className="inline-flex items-center gap-2.5 mb-4">
            <Brain className="w-9 h-9 text-primary-500" />
            <span className="text-2xl font-bold text-white">Noesis</span>
          </Link>
          <p className="text-sm text-gray-500">{t("login.subtitle")}</p>
        </div>

        {/* Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          {error && (
            <div className="flex items-center gap-2 bg-red-900/20 border border-red-800/30 rounded-lg p-3 mb-4 text-sm text-red-300">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">{t("login.usernameLabel")}</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input w-full"
                autoComplete="username"
                autoFocus
                required
              />
            </div>
            <div>
              <label className="label">{t("login.passwordLabel")}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input w-full"
                autoComplete="current-password"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {t("login.submitButton")}
            </button>
          </form>
        </div>

        {/* Links */}
        <div className="text-center mt-6 space-y-2">
          <p className="text-sm text-gray-500">
            {t("login.noAccount")}{" "}
            <Link
              to="/register"
              className="text-primary-400 hover:text-primary-300 transition-colors"
            >
              {t("login.createAccount")}
            </Link>
          </p>
          <Link
            to="/landing"
            className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
          >
            {t("login.backToHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
