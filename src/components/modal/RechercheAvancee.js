import React, { useState } from "react";
import Modal from "react-modal";
import "./RechercheAvancee.css";

Modal.setAppElement("#root");

const RechercheAvancee = ({ onSearch, isOpen, onClose }) => {
  const [nature, setNature] = useState("");
  const [num, setNum] = useState("");
  const [indice, setIndice] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ nature, num, indice });
    onClose();
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onRequestClose={onClose}
        contentLabel="Recherche Avancée"
        className="modal"
        overlayClassName="overlay"
      >
        <h2>Rechercher un titre foncier</h2>
        <form onSubmit={handleSubmit}>
          <label>Nature:</label>
          <select value={nature} onChange={(e) => setNature(e.target.value)}>
            <option value="">  </option>
            <option value="T">T</option>
            <option value="R">R</option>
          </select>

          <label>Numéro:</label>
          <input value={num} onChange={(e) => setNum(e.target.value)} />

          <label>Indice:</label>
          <input value={indice} onChange={(e) => setIndice(e.target.value)} />

          <button type="submit">Rechercher</button>
        </form>
        <button onClick={onClose}>Fermer</button>
      </Modal>
    </>
  );
};

export default RechercheAvancee;
