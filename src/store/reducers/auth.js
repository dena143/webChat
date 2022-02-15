import { LOGIN, REGISTER, LOGOUT, UPDATE_PROFILE } from "../types/index";

const initialState = {
  user: JSON.parse(localStorage.getItem("user")) || {},
  token: localStorage.getItem("token") || "",
  // isLoggedIn: localStorage.getItem("user") ? true : false, // cara pertama
  isLoggedIn: !!localStorage.getItem("user"),

  // user: {},
  // token: "",
  // isLoggedIn: false,
};

const authReducer = (state = initialState, actions) => {
  const { type, payload } = actions;

  switch (type) {
    case LOGIN:
      return {
        ...state,
        user: payload.userWithToken.user,
        token: payload.userWithToken.token,
        isLoggedIn: true,
      };
    case REGISTER:
      return {
        ...state,
        user: payload.userWithToken.user,
        token: payload.userWithToken.token,
        isLoggedIn: true,
      };

    case LOGOUT:
      return {
        ...state,
        user: {},
        token: "",
        isLoggedIn: false,
      };
    case UPDATE_PROFILE:
      return {
        ...state,
        user: payload.user,
      };

    default: {
      return state;
    }
  }
};

export default authReducer;
