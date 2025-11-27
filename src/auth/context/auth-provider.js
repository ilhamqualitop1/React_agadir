import { useCallback, useEffect, useMemo, useReducer } from "react";
import axios from "../../utils/axios";
import { AuthContext } from "./auth-context";

const initialState = {
  accessToken: null,
  loading: true,
};

const reducer = (state, action) => {
  if (action.type === "INITIAL") {
    return {
      loading: false,
      accessToken: action.payload.accessToken,
    };
  }
  if (action.type === "LOGIN") {
    return {
      ...state,
      accessToken: action.payload.accessToken,
    };
  }
  if (action.type === "REGISTER") {
    return {
      ...state,
      accessToken: action.payload.accessToken,
    };
  }
  if (action.type === "LOGOUT") {
    return {
      ...state,
      accessToken: null,
    };
  }
  return state;
};

const STORAGE_KEY = "accessToken";

export default function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // inialize
  const initialize = useCallback(() => {
    const accessToken = sessionStorage.getItem(STORAGE_KEY);

    if (accessToken) {
      dispatch({
        type: "INITIAL",
        payload: {
          accessToken,
        },
      });
    } else {
      dispatch({
        type: "INITIAL",
        payload: {
          accessToken: null,
        },
      });
    }
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  //   Login
  const login = useCallback(async (data) => {
    const url = "/auth/login";
    const response = await axios.post(url, data);

    return response.data;

    // const { accessToken, user } = response.data;

    // sessionStorage.setItem(STORAGE_KEY, accessToken);

    // dispatch({
    //   type: "LOGIN",
    //   payload: {
    //     user,
    //   },
    // });
  }, []);

  // verify login otp
  const verifyLoginOtp = useCallback(async (data) => {
    const url = "/auth/verify-otp";

    const response = await axios.post(url, data);

    const { accessToken } = response.data;

    sessionStorage.setItem(STORAGE_KEY, accessToken);

    dispatch({
      type: "LOGIN",
      payload: {
        accessToken,
      },
    });
  }, []);

  const register = useCallback(async (data) => {
    const url = "/auth/register";
    const response = await axios.post(url, data);

    return response.data;
  }, []);

  //   logout
  const logout = useCallback(async () => {

    sessionStorage.setItem(STORAGE_KEY, null);
    dispatch({
      type: "LOGOUT",
    });
  }, []);

  const checkAuthenticated = state.accessToken !== "null"
    ? "authenticated"
    : "unauthenticated";

  const status = state.loading ? "loading" : checkAuthenticated;

  console.log(state.accessToken)

  const memoizedValue = useMemo(
    () => ({
      token: state.accessToken,
      loading: status === "loading",
      authenticated: status === "authenticated",
      unauthenticated: status === "unauthenticated",

      login,
      verifyLoginOtp,
      register,
      logout,
    }),
    [login, verifyLoginOtp, register, logout, status, state.accessToken]
  );

  return (
    <AuthContext.Provider value={memoizedValue}>
      {children}
    </AuthContext.Provider>
  );
}
