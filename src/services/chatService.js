import API from "./api";

const ChatService = {
  fetchChats: () => {
    return API.get("/chat")
      .then(({ data }) => {
        return data;
      })
      .catch((err) => {
        throw err;
      });
  },

  uploadImage: (data) => {
    const headers = {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    };
    return API.post("/chat/image-upload", data, headers)
      .then(({ data }) => {
        return data.url;
      })
      .catch((err) => {
        throw err;
      });
  },

  paginateMessages: (id, page) => {
    return API.get("/chat/messages", {
      params: {
        id,
        page,
      },
    })
      .then(({ data }) => {
        return data;
      })
      .catch((err) => {
        throw err;
      });
  },

  searchUsers: (term) => {
    return API.get("/user/search-users", {
      params: {
        term,
      },
    })
      .then(({ data }) => {
        return data;
      })
      .catch((err) => {
        throw err;
      });
  },

  createChat: (partnerId) => {
    return API.post("/chat/create", {
      partnerId,
    })
      .then(({ data }) => {
        console.log("masuk chat service", data);
        return data;
      })
      .catch((err) => {
        throw err;
      });
  },

  addFriendToGroupChat: (userId, chatId) => {
    return API.post("/chat/add-user-to-group", {
      userId,
      chatId,
    })
      .then(({ data }) => {
        console.log("masuk chat service", data);
        return data;
      })
      .catch((err) => {
        throw err;
      });
  },

  leaveCurrentChat: (chatId) => {
    return API.post("/chat/leave-current-chat", {
      chatId,
    })
      .then(({ data }) => {
        console.log("masuk chat service", data);
        return data;
      })
      .catch((err) => {
        throw err;
      });
  },

  deleteCurrentChat: (chatId) => {
    return API.delete(`/chat/${chatId}`)
      .then(({ data }) => {
        console.log("masuk chat service", data);
        return data;
      })
      .catch((err) => {
        throw err;
      });
  },
};

export default ChatService;
