import { AuthContext } from "./auth-context";

export function AuthConsumer({ children }) {
  return (
    <AuthContext.Consumer>
      {(auth) => (auth.loading ? "loading" : children)}
    </AuthContext.Consumer>
  );
}
