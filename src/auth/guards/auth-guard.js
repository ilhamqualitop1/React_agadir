import { Outlet, useNavigate } from "react-router-dom";
import { useAuthContext } from "../hooks/use-auth-context";
import { useCallback, useEffect, useState } from "react";

export default function AuthGuard() {
  const navigate = useNavigate();

  const { authenticated } = useAuthContext();

  const [checked, setChecked] = useState(false);

  const check = useCallback(() => {
    if (!authenticated) {
      navigate("/");
    } else {
      setChecked(true);
    }
  }, [authenticated, navigate]);

  useEffect(() => {
    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!checked) {
    return null;
  }

  return <Outlet />;

  //   return <>{children}</>;
}
