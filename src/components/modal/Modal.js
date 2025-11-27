import React, { useState, useEffect } from "react";
import "./Modal.css";
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
    <div className="modal-overlay">
      <div className="modal-content">
        {formType === "signup" ? (
          <AuthRegisterForm />
        ) : formType === "forget-password" ? (
          <AuthPasswordForm onChangeMode={setFormType} />
        ) : (
          <AuthLoginForm onForgetPassword={setFormType} />
        )}

        <button className="close-btn" onClick={handleClose}>
          ✖
        </button>
      </div>
    </div>
  );
};

export default Modal;
