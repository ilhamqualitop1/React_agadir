import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axios";
import { useNavigate } from "react-router-dom";

export default function AdminUserTable() {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    firstname: "",
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      navigate("/login");
      return;
    }

    const user = JSON.parse(storedUser);

    if (user.role !== "admin") {
      navigate("/mapcomponent");
      return;
    }

    setIsAdmin(true);
    fetchUsers();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get("/admin/users");
      setUsers(res.data);
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs :", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editId) {
        await axiosInstance.put(`/admin/users/${editId}`, formData);
      } else {
        await axiosInstance.post("/admin/users", formData);
      }

      setFormData({
  firstname: user.firstname,
  lastname: user.lastname,   // 🔥 correction ici
  email: user.email,
  password: "",
  role: user.role,
});

      setEditId(null);
      fetchUsers();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement :", error);
    }
  };

  const handleEdit = (user) => {
    setEditId(user.id);
    setFormData({
  firstname: user.firstname,
  lastname: user.lastname,   // 🔥 correction ici
  email: user.email,
  password: "",
  role: user.role,
});

  };

  const handleDelete = async (id) => {
    if (!window.confirm("Confirmer la suppression ?")) return;

    await axiosInstance.delete(`/admin/users/${id}`);
    fetchUsers();
  };

  if (!isAdmin) return <p>Accès refusé — réservé à l’administrateur.</p>;
  if (loading) return <p>Chargement des utilisateurs...</p>;

  return (
    <div className="admin-container">
      <h2>Gestion des utilisateurs</h2>

      <form onSubmit={handleSubmit} className="admin-form">
        <input
          type="text"
          placeholder="Nom"
          value={formData.firstname}
          onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
          required
        />

        <input
          type="text"
          placeholder="Prénom"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />

        {!editId && (
          <input
            type="password"
            placeholder="Mot de passe"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
        )}

        <select
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
        >
          <option value="user">Utilisateur</option>
          <option value="admin">Administrateur</option>
        </select>

        <button type="submit">{editId ? "Modifier" : "Ajouter"}</button>
      </form>

      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nom</th>
            <th>Prénom</th>
            <th>Email</th>
            <th>Rôle</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.firstname}</td>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>
                <button onClick={() => handleEdit(u)}>Modifier</button>
                <button onClick={() => handleDelete(u.id)}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
