import API from "./api";

const AuthService = {
  login: (data) => {
    return API.post("/login", data)
      .then(({ data }) => {
        console.log("ini data", data);
        setHeadersAndStorage(data);

        return data;
      })
      .catch((err) => {
        console.log("error", err);

        throw err;
      });
  },

  register: (data) => {
    return API.post("/register", data)
      .then(({ data }) => {
        setHeadersAndStorage(data);

        return data;
      })
      .catch((err) => {
        console.log("error", err);

        throw err;
      });
  },
  logout: () => {
    API.defaults.headers["Authorization"] = ``;
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  },

  updateProfile: (data) => {
    const headers = {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    };
    return API.patch("/user/update", data, headers)
      .then(({ data }) => {
        console.log("ini data auth service", data);
        localStorage.setItem("user", JSON.stringify(data.user));
        return data;
      })
      .catch((err) => {
        console.log("error", err);

        throw err;
      });
  },
};

const setHeadersAndStorage = ({ userWithToken }) => {
  API.defaults.headers["Authorization"] = `Bearer ${userWithToken.token}`;
  localStorage.setItem("user", JSON.stringify(userWithToken.user));
  localStorage.setItem("token", userWithToken.token);
};

export default AuthService;
