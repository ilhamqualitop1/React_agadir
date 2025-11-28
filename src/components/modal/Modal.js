import React, { useState, useEffect } from "react";
import AuthLoginForm from "../auth/auth-login-form";
import AuthRegisterForm from "../auth/auth-register-form";
import AuthPasswordForm from "../auth/auth-password-form";

const Modal = ({ isOpen, onClose, mode }) => {
  const [formType, setFormType] = useState(mode);

  useEffect(() => {
    setFormType(mode);
  }, [mode]);

  const handleClose = () => {
    setFormType(null);
    onClose();
  };

  if (!isOpen || !formType) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-floating">
        <button
          className="absolute right-4 top-4 text-xl text-slate-500 transition hover:text-slate-800"
          onClick={handleClose}
          aria-label="Fermer la fenêtre"
        >
          ×
        </button>

        <div className="mb-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
            Espace sécurisé
          </p>
          <h3 className="mt-2 text-2xl font-bold text-slate-900">
            {formType === "forget-password"
              ? "Réinitialiser le mot de passe"
              : "Connexion"}
          </h3>
        </div>

        {formType === "signup" ? (
          <AuthRegisterForm />
        ) : formType === "forget-password" ? (
          <AuthPasswordForm onChangeMode={setFormType} />
        ) : (
          <AuthLoginForm onForgetPassword={setFormType} />
        )}
      </div>
    </div>
  );
};

export default Modal;
