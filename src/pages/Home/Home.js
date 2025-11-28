import React, { useState } from "react";
import logo from "../../images/logo agadir.png";
import heroImage from "../../images/5f05984cd4666-agadir.jpg";
import Modal from "../../components/modal/Modal";

function Home({
  title = "COMMUNE D'AGADIR",
  subtitle = "GEO-PORTAIL",
  logoSrc = logo,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState(null);

  const authButtons = [{ label: "Se connecter", mode: "login" }];

  const handleOpenModal = (mode) => {
    if (modalMode === mode) {
      setModalMode(null);
      setTimeout(() => {
        setModalMode(mode);
        setIsModalOpen(true);
      }, 10);
    } else {
      setModalMode(mode);
      setIsModalOpen(true);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Ville d'Agadir"
          className="absolute inset-0 h-full w-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900/70 to-brand-primary/50" />
        <div className="absolute -left-40 -top-20 h-96 w-96 rounded-full bg-brand-primary/30 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-cyan-300/30 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen items-center justify-center px-6">
        <div className="absolute left-6 top-6 flex items-center gap-3 rounded-full bg-white/10 px-4 py-2 backdrop-blur">
          <img src={logoSrc} alt="Logo" className="h-12 w-12 rounded-full border border-white/30" />
          <div className="text-sm text-white/80">
            <p className="font-semibold">Commune d'Agadir</p>
            <p>Portail géospatial</p>
          </div>
        </div>

        <div className="flex max-w-4xl flex-col items-center gap-10 text-center">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.5em] text-white/70">Géodata & Cartographie</p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold leading-tight drop-shadow">
              {title}
            </h1>
            <h2 className="font-display text-3xl sm:text-4xl text-white/90">{subtitle}</h2>
            <p className="mx-auto max-w-2xl text-lg text-white/80">
              Visualisez, importez et collaborez autour des données territoriales d'Agadir avec un
              environnement cartographique réactif.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            {authButtons.map((btn) => (
              <button
                key={btn.mode}
                className="group inline-flex items-center gap-3 rounded-full bg-white/10 px-6 py-3 text-lg font-semibold text-white ring-1 ring-white/40 shadow-lg backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/20 hover:shadow-2xl"
                onClick={() => handleOpenModal(btn.mode)}
              >
                <span>{btn.label}</span>
                <span className="text-xl transition group-hover:translate-x-1">→</span>
              </button>
            ))}
          </div>
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
