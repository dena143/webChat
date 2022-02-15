import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faSmile, faImage } from "@fortawesome/free-regular-svg-icons";
import {
  faSpinner,
  faEllipsisV,
  faUserPlus,
  faSignOutAlt,
  faTrash,
  faCaretDown,
  faUpload,
  faTimes,
  faBell,
} from "@fortawesome/free-solid-svg-icons";

import "./App.scss";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Chat from "./components/Chat/Chat";
import ProtectedRoute from "./components/Router/ProtectedRoute";

library.add(
  faSmile,
  faImage,
  faSpinner,
  faEllipsisV,
  faUserPlus,
  faSignOutAlt,
  faTrash,
  faCaretDown,
  faUpload,
  faTimes,
  faBell
);

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route
            exact
            path="/"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route render={() => <h1>404 page not found</h1>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
