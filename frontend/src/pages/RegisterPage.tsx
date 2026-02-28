import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Brain, Loader2, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { register as registerApi } from "@/api/auth";
import { useAuthStore } from "@/stores/authStore";

interface FieldErrors {
  username?: string | string[];
  email?: string | string[];
  password?: string | string[];
}

function errorText(val: string | string[] | undefined): string | null {
  if (!val) return null;
  return Array.isArray(val) ? val[0] : val;
}

export default function RegisterPage() {
  const { t } = useTranslation("pages");
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});
    setGlobalError(null);

    // Client-side validation
    if (password !== confirmPassword) {
      setFieldErrors({ password: t("register.errors.passwordMismatch") });
      return;
    }
    if (password.length < 8) {
      setFieldErrors({ password: t("register.errors.passwordTooShort") });
      return;
    }

    setLoading(true);
    try {
      const { data } = await registerApi({ username, email, password });
      setAuth(data.user, data.tokens);
      navigate("/", { replace: true });
    } catch (err: any) {
      if (err?.response?.data?.errors) {
        setFieldErrors(err.response.data.errors);
      } else {
        setGlobalError(t("register.errors.generic"));
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
          <p className="text-sm text-gray-500">{t("register.subtitle")}</p>
        </div>

        {/* Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          {globalError && (
            <div className="flex items-center gap-2 bg-red-900/20 border border-red-800/30 rounded-lg p-3 mb-4 text-sm text-red-300">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {globalError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">{t("register.usernameLabel")}</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input w-full"
                autoComplete="username"
                autoFocus
                required
              />
              {errorText(fieldErrors.username) && (
                <p className="text-xs text-red-400 mt-1">
                  {errorText(fieldErrors.username)}
                </p>
              )}
            </div>
            <div>
              <label className="label">{t("register.emailLabel")}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input w-full"
                autoComplete="email"
                required
              />
              {errorText(fieldErrors.email) && (
                <p className="text-xs text-red-400 mt-1">
                  {errorText(fieldErrors.email)}
                </p>
              )}
            </div>
            <div>
              <label className="label">{t("register.passwordLabel")}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input w-full"
                autoComplete="new-password"
                required
              />
              {errorText(fieldErrors.password) && (
                <p className="text-xs text-red-400 mt-1">
                  {errorText(fieldErrors.password)}
                </p>
              )}
            </div>
            <div>
              <label className="label">
                {t("register.confirmPasswordLabel")}
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input w-full"
                autoComplete="new-password"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {t("register.submitButton")}
            </button>
          </form>
        </div>

        {/* Links */}
        <div className="text-center mt-6 space-y-2">
          <p className="text-sm text-gray-500">
            {t("register.hasAccount")}{" "}
            <Link
              to="/login"
              className="text-primary-400 hover:text-primary-300 transition-colors"
            >
              {t("register.loginLink")}
            </Link>
          </p>
          <Link
            to="/landing"
            className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
          >
            {t("register.backToHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
