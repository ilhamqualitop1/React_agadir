import React, { useState } from "react";
import "./Home.css";
import logo from "../../images/logo agadir.png";
import Modal from "../../components/modal/Modal";

function Home({
  title = "COMMUNE D'AGADIR",
  subtitle = "GEO-PORTAIL",
  logoSrc = logo,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState(null);

  const authButtons = [
    { label: "Se connecter", mode: "login" },
    // { label: "S'inscrire", mode: "signup" },
  ];

  const handleOpenModal = (mode) => {
    // Reset modal mode first to allow re-triggering the same one
    if (modalMode === mode) {
      setModalMode(null); // Reset
      setTimeout(() => {
        setModalMode(mode);
        setIsModalOpen(true);
      }, 10); // Wait a bit
    } else {
      setModalMode(mode);
      setIsModalOpen(true);
    }
  };

  return (
    <div className="home-container">
      <div className="background-overlay"></div>
      <img src={logoSrc} alt="Logo" className="logo" />

      <div className="home-content">
        <h1>{title}</h1>
        <h2>{subtitle}</h2>

        <div className="home-buttons">
          {authButtons.map((btn, idx) => (
            <button
              key={idx}
              className="btn"
              onClick={() => handleOpenModal(btn.mode)}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
        }}
        mode={modalMode}
      />
    </div>
  );
}

export default Home;
