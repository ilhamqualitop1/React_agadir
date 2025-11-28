/* eslint-disable jsx-a11y/anchor-is-valid */
import { useCallback, useState } from "react";
import { useAuthContext } from "../../auth/hooks/use-auth-context";
import { useNavigate } from "react-router-dom";

export default function AuthLoginForm({ onForgetPassword }) {
  const navigate = useNavigate();
  const { login, verifyLoginOtp } = useAuthContext();

  const [defaulValues, setDefaultValues] = useState({
    email: null,
    password: null,
    otp: null,
  });

  const [verifyOTP, setVerifyOTP] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handelChangeInput = useCallback((event) => {
    const { name, value } = event.target;
    setDefaultValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const onLogin = useCallback(
    async (e) => {
      e.preventDefault();
      setIsLoading(true);
      setError("");
      try {
        await login(defaulValues);
        setVerifyOTP(true);
      } catch (err) {
        setError(err.response?.data?.message || "Erreur lors de la connexion");
      } finally {
        setIsLoading(false);
      }
    },
    [defaulValues, login]
  );

  const onVerifyLoginOTP = useCallback(
    async (e) => {
      e.preventDefault();
      setIsLoading(true);
      try {
        const res = await verifyLoginOtp(defaulValues);

        // 🔹 Stockage des infos utilisateur
        localStorage.setItem("token", res.accessToken);
        localStorage.setItem("user", JSON.stringify(res.user));
        localStorage.setItem("role", res.user.role);

        // 🔹 Redirection selon rôle
        if (res.user.role === "admin") {
          navigate("/dashboard/users", { replace: true });
        } else {
          navigate("/mapcomponent", { replace: true });
        }
      } catch (err) {
        console.error("Erreur OTP:", err);
        setError("Code OTP invalide ou expiré.");
      } finally {
        setIsLoading(false);
      }
    },
    [defaulValues, verifyLoginOtp, navigate]
  );

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/15";
  const buttonClass =
    "w-full rounded-xl bg-brand-primary px-4 py-3 text-white font-semibold shadow-lg shadow-brand-primary/20 transition hover:-translate-y-0.5 hover:bg-brand-primaryDark focus:outline-none";

  return (
    <div className="space-y-6">
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center gap-3 py-6">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-brand-primary" />
          <p className="text-sm text-slate-500">Chargement...</p>
        </div>
      ) : verifyOTP ? (
        <form onSubmit={onVerifyLoginOTP} className="space-y-4">
          <label className="block text-left text-sm font-semibold text-slate-700">
            Code de vérification
          </label>
          <input
            type="text"
            name="otp"
            value={defaulValues.otp}
            onChange={handelChangeInput}
            placeholder="Entrez votre code OTP"
            required
            className={inputClass}
          />
          <button type="submit" className={buttonClass}>
            Vérifier
          </button>
        </form>
      ) : (
        <form onSubmit={onLogin} className="space-y-4">
          <label className="block text-left text-sm font-semibold text-slate-700">
            Email
          </label>
          <input
            type="email"
            name="email"
            placeholder="Votre email"
            value={defaulValues.email || ""}
            onChange={handelChangeInput}
            required
            className={inputClass}
          />

          <label className="block text-left text-sm font-semibold text-slate-700">
            Mot de passe
          </label>
          <input
            type="password"
            name="password"
            placeholder="Votre mot de passe"
            value={defaulValues.password || ""}
            onChange={handelChangeInput}
            required
            className={inputClass}
          />

          <a
            onClick={() => onForgetPassword("forget-password")}
            className="block text-right text-sm font-semibold text-brand-primary hover:text-brand-primaryDark"
          >
            Mot de passe oublié ?
          </a>

          <button type="submit" className={buttonClass}>
            Se connecter
          </button>
        </form>
      )}
    </div>
  );
}
