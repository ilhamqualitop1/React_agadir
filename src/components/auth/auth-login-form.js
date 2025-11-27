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

  return (
    <>
      <h2>Connexion</h2>
      {error && <p className="error">{error}</p>}

      {isLoading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Chargement...</p>
        </div>
      ) : verifyOTP ? (
        <form onSubmit={onVerifyLoginOTP}>
          <label>Code de vérification</label>
          <input
            type="text"
            name="otp"
            value={defaulValues.otp}
            onChange={handelChangeInput}
            placeholder="Entrez votre code OTP"
            required
          />
          <button type="submit" className="btn">
            Vérifier
          </button>
        </form>
      ) : (
        <form onSubmit={onLogin}>
          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="Votre email"
            value={defaulValues.email || ""}
            onChange={handelChangeInput}
            required
          />

          <label>Mot de passe</label>
          <input
            type="password"
            name="password"
            placeholder="Votre mot de passe"
            value={defaulValues.password || ""}
            onChange={handelChangeInput}
            required
          />

          <a
            onClick={() => onForgetPassword("forget-password")}
            className="forgot-password"
          >
            Mot de passe oublié ?
          </a>

          <button type="submit" className="btn">
            Se connecter
          </button>
        </form>
      )}
    </>
  );
}
