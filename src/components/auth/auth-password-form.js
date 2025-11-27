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

  return (
    <>
      {error && <p className="error">{error}</p>}
      {message && <p className="message">{message}</p>}

      {isLoading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Chargement...</p>
        </div>
      ) : verifyOTP ? (
        <form onSubmit={onChangePassword}>
          <label>Code de vérification</label>
          <input
            type="text"
            placeholder="Entrez votre code"
            value={defaulValues.otp}
            name="otp"
            onChange={handelChangeInput}
            required
          />

          <label>Nouvelle mot de passe</label>
          <input
            type="password"
            name="password"
            value={defaulValues.password}
            onChange={handelChangeInput}
            placeholder="Nouveau mot de passe"
            required
          />

          <button type="submit" className="btn">
            Vérifier
          </button>
        </form>
      ) : (
        <form onSubmit={onVerifyEmail} className="forgot-password-form">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={defaulValues.email}
            onChange={handelChangeInput}
            placeholder="Votre email"
            required
          />
          <button type="submit">Envoyer le code</button>
        </form>
      )}
    </>
  );
}
