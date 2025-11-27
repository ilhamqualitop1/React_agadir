// import { useCallback, useState } from "react";
// import { useAuthContext } from "../../auth/hooks/use-auth-context";

// const defaultData = {
//   email: null,
//   password: null,
//   name: null,
//   firstname: null,
// };

// export default function AuthRegisterForm() {
//   const { register } = useAuthContext();

//   const [defaulValues, setDefaultValues] = useState(defaultData);

//   const [error, setError] = useState("");
//   const [message, setMessage] = useState("");
//   const [isLoading, setIsLoading] = useState(false);

//   const handelChangeInput = useCallback((event) => {
//     const { name, value } = event.target;

//     setDefaultValues((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   }, []);

//   const onRegister = useCallback(
//     async (e) => {
//       e.preventDefault();
//       setIsLoading(true);
//       try {
//         const res = await register(defaulValues);

//         setMessage(res.message);

//         setDefaultValues(defaultData);
//       } catch (err) {
//         if (err.response) {
//           setError(err.response.data.message);
//         } else {
//           setError("Une erreur inconnue s'est produite.");
//         }
//       } finally {
//         setIsLoading(false);
//       }
//     },

//     // eslint-disable-next-line
//     [defaulValues]
//   );

//   return (
//     <>
//       <h2>Inscription</h2>

//       {error && <p className="error">{error}</p>}
//       {message && <p className="message">{message}</p>}

//       {isLoading ? (
//         <div className="loading-spinner">
//           <div className="spinner"></div>
//           <p>Chargement...</p>
//         </div>
//       ) : (
//         <form onSubmit={onRegister}>
//           <label>Nom</label>
//           <input
//             type="text"
//             name="name"
//             placeholder="Votre nom"
//             value={defaulValues.name}
//             onChange={handelChangeInput}
//             required
//           />
//           <label>Prénom</label>
//           <input
//             type="text"
//             placeholder="Votre prénom"
//             name="firstname"
//             value={defaulValues.firstname}
//             onChange={handelChangeInput}
//             required
//           />
//           <label>Email</label>
//           <input
//             type="email"
//             name="email"
//             placeholder="Votre email"
//             value={defaulValues.email}
//             onChange={handelChangeInput}
//             required
//           />
//           <label>Mot de passe</label>
//           <input
//             type="password"
//             name="password"
//             placeholder="Votre mot de passe"
//             value={defaulValues.password}
//             onChange={handelChangeInput}
//             required
//           />

//           <button type="submit" className="btn">
//             S'inscrire
//           </button>
//         </form>
//       )}
//     </>
//   );
// }
