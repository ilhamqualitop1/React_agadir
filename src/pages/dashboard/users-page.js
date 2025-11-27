import React, { useEffect, useState } from "react";
import styled from "styled-components";
import axiosInstance from "../../utils/axios";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    id: null,
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    role: "user",
  });

  // ===============================
  // 🔹 Charger les utilisateurs
  // ===============================
  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get("/admin/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Erreur chargement utilisateurs :", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ===============================
  // 🔹 Ouvrir modal création
  // ===============================
  const openCreateModal = () => {
    setFormData({
      id: null,
      firstname: "",
      lastname: "",
      email: "",
      password: "",
      role: "user",
    });
    setIsModalOpen(true);
  };

  // ===============================
  // 🔹 Ouvrir modal modification
  // ===============================
  const openEditModal = (user) => {
    setFormData({
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      password: "",
      role: user.role,
    });
    setIsModalOpen(true);
  };

  // ===============================
  // 🔹 Gestion des inputs
  // ===============================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ===============================
  // 🔹 Soumission formulaire
  // ===============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (formData.id) {
        // 🔹 Mise à jour → ne pas envoyer password vide
        const dataToSend = { ...formData };
        if (!dataToSend.password) delete dataToSend.password;

        await axiosInstance.put(`/admin/users/${formData.id}`, dataToSend);
      } else {
        // 🔹 Création → password obligatoire
        await axiosInstance.post("/admin/users", formData);
      }

      setIsModalOpen(false);
      fetchUsers(); // 🔥 Refresh propre
    } catch (error) {
      console.error("Erreur enregistrement utilisateur :", error);
    }
  };

  // ===============================
  // 🔹 Suppression utilisateur
  // ===============================
  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous supprimer cet utilisateur ?")) return;

    try {
      await axiosInstance.delete(`/admin/users/${id}`);
      fetchUsers();
    } catch (error) {
      console.error("Erreur suppression :", error);
    }
  };

  return (
    <Container>
      <Header>
        <h3>Gestion des utilisateurs</h3>
        <Button onClick={openCreateModal}>Créer un utilisateur</Button>
      </Header>

      <Table>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Prénom</th>
            <th>Email</th>
            <th>Rôle</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.firstname}</td>
              <td>{user.lastname}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>

              <td style={{ display: "flex", gap: "8px" }}>
                <ActionButton onClick={() => openEditModal(user)}>
                  Modifier
                </ActionButton>

                <DeleteButton onClick={() => handleDelete(user.id)}>
                  Supprimer
                </DeleteButton>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* ===============================
          🔹 Modal Formulaire
      =============================== */}
      {isModalOpen && (
        <Overlay>
          <Modal>
            <h3>{formData.id ? "Modifier" : "Créer"} un utilisateur</h3>

            <Form onSubmit={handleSubmit}>
              <Input
                name="firstname"
                placeholder="Nom"
                value={formData.firstname}
                onChange={handleChange}
                required
              />

              <Input
                name="lastname"
                placeholder="Prénom"
                value={formData.lastname}
                onChange={handleChange}
                required
              />

              <Input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />

              <Input
                type="password"
                name="password"
                placeholder="Mot de passe"
                value={formData.password}
                onChange={handleChange}
                required={!formData.id}   // 🔥 correction importante
              />

              <Select name="role" value={formData.role} onChange={handleChange}>
                <option value="user">Utilisateur</option>
                <option value="admin">Admin</option>
              </Select>

              <ModalButtons>
                <Button type="submit">Enregistrer</Button>
                <DeleteButton type="button" onClick={() => setIsModalOpen(false)}>
                  Annuler
                </DeleteButton>
              </ModalButtons>
            </Form>
          </Modal>
        </Overlay>
      )}
    </Container>
  );
};

export default UsersPage;

/* ======================================
   🔥 Styled Components (identique)
====================================== */

const Container = styled.div`
  padding: 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 12px;
    border: 1px solid #ddd;
  }
  th {
    background: #f2f2f2;
  }
`;

const Button = styled.button`
  padding: 10px 14px;
  background: #2b6cb0;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
`;

const ActionButton = styled(Button)`
  background: #4a5568;
`;

const DeleteButton = styled(Button)`
  background: #e53e3e;
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);

  display: flex;
  justify-content: center;
  align-items: center;
`;

const Modal = styled.div`
  background: white;
  width: 400px;
  padding: 25px;
  border-radius: 10px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const Input = styled.input`
  padding: 12px;
  margin: 8px 0;
  border-radius: 6px;
  border: 1px solid #ccc;
`;

const Select = styled.select`
  padding: 12px;
  margin: 8px 0;
  border-radius: 6px;
  border: 1px solid #ccc;
`;

const ModalButtons = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
`;
