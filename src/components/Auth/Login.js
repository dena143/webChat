import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";

import loginImage from "../../assets/images/login.svg";
import "./Auth.scss";
import AuthService from "../../services/authServices";
import { login } from "../../store/actions/auth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const history = useNavigate();

  const submitForm = async (e) => {
    try {
      e.preventDefault();
      await dispatch(login({ email, password }));
      await history("/");
    } catch (error) {
      console.log(error);
    }

    // dispatch(login({ email, password })).then(() => history("/"));
  };

  return (
    <div id="auth-container">
      <div id="auth-card">
        <div className="card-shadow">
          <div id="image-section">
            <img src={loginImage} alt="login" />
          </div>
          <div id="form-section">
            <h2>Annyeong !</h2>
            <form onSubmit={submitForm}>
              <div className="input-field mb-1">
                <input
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  required="required"
                  type="text"
                  placeholder="email"
                />
              </div>
              <div className="input-field mb-2">
                <input
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  required="required"
                  type="password"
                  placeholder="password"
                />
              </div>
              <button>Login</button>
              <p>
                Don't you have an account? let's register{" "}
                <Link to="/register">here</Link>{" "}
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
