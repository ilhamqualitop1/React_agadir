import { useCallback, useState } from "react";
import axiosInstance from "../../utils/axios";

export default function AuthPasswordForm({ onChangeMode }) {
  const [defaulValues, setDefaultValues] = useState({
    email: null,
    password: null,
    otp: null,
  });

  const [verifyOTP, setVerifyOTP] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handelChangeInput = useCallback((event) => {
    const { name, value } = event.target;

    setDefaultValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const onVerifyEmail = useCallback(
    async (e) => {
      e.preventDefault();
      setIsLoading(true);
      try {
        const response = await axiosInstance.post("/auth/forgot-password", {
          email: defaulValues.email,
        });

        console.log("Réponse reçue :", response.data);

        setMessage(response.data.message);

        setVerifyOTP(true);
      } catch (err) {
        console.error(
          "Erreur API forgot-password :",
          err.response ? err.response.data : err
        );

        if (err.response) {
          setError(err.response.data.message);
        } else {
          setError(
            "Erreur lors de la demande de réinitialisation du mot de passe."
          );
        }
      } finally {
        setIsLoading(false);
      }
    },
    [defaulValues]
  );

  const onChangePassword = useCallback(
    async (e) => {
      e.preventDefault();
      setIsLoading(true);

      try {
        const response = await axiosInstance.post(
          "/auth/reset-password",
          defaulValues
        );

        setMessage(response.data.message);

        setDefaultValues({
          email: null,
          password: null,
          otp: null,
        });

        onChangeMode("login");
      } catch (err) {
        if (err.response) {
          setError(err.response.data.message);
        } else {
          setError("Erreur lors du changement de mot de passe.");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [defaulValues]
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
      {message && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
          {message}
        </p>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center gap-3 py-6">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-brand-primary" />
          <p className="text-sm text-slate-500">Chargement...</p>
        </div>
      ) : verifyOTP ? (
        <form onSubmit={onChangePassword} className="space-y-4">
          <label className="block text-left text-sm font-semibold text-slate-700">
            Code de vérification
          </label>
          <input
            type="text"
            placeholder="Entrez votre code"
            value={defaulValues.otp}
            name="otp"
            onChange={handelChangeInput}
            required
            className={inputClass}
          />

          <label className="block text-left text-sm font-semibold text-slate-700">
            Nouveau mot de passe
          </label>
          <input
            type="password"
            name="password"
            value={defaulValues.password}
            onChange={handelChangeInput}
            placeholder="Nouveau mot de passe"
            required
            className={inputClass}
          />

          <button type="submit" className={buttonClass}>
            Vérifier
          </button>
        </form>
      ) : (
        <form onSubmit={onVerifyEmail} className="space-y-4">
          <label className="block text-left text-sm font-semibold text-slate-700">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={defaulValues.email}
            onChange={handelChangeInput}
            placeholder="Votre email"
            required
            className={inputClass}
          />
          <button type="submit" className={buttonClass}>
            Envoyer le code
          </button>
        </form>
      )}
    </div>
  );
}
