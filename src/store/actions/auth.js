import AuthService from "../../services/authServices";
import { LOGIN, REGISTER, LOGOUT, UPDATE_PROFILE } from "../types/index";

export const login = (params) => (dispatch) => {
  return AuthService.login(params)
    .then((data) => {
      dispatch({ type: LOGIN, payload: data });
    })
    .catch((err) => {
      console.log(err);
    });
};

export const register = (params) => (dispatch) => {
  return AuthService.register(params)
    .then((data) => {
      dispatch({ type: REGISTER, payload: data });
    })
    .catch((err) => {
      console.log(err);
    });
};

export const logout = () => (dispatch) => {
  AuthService.logout();
  dispatch({ type: LOGOUT });
};

export const updateProfile = (params) => (dispatch) => {
  return AuthService.updateProfile(params)
    .then((data) => {
      dispatch({ type: UPDATE_PROFILE, payload: data });
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
};
