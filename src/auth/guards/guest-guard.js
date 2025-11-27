import { Outlet, useNavigate } from "react-router-dom";
import { useAuthContext } from "../hooks/use-auth-context";
import { useCallback, useEffect } from "react";

export default function GuestGuard() {
  const navigate = useNavigate();

  const { authenticated } = useAuthContext();

  const check = useCallback(() => {
    if (authenticated) {
      navigate("/mapcomponent", { replace: true });
    }
  }, [authenticated, navigate]);

  useEffect(() => {
    check();
  }, [check]);

  return <Outlet />;

  //   return <>{children}</>;
}
