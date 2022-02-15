const socketIo = require("socket.io");

const { sequelize, Message } = require("../models");

const users = new Map();
const userSockets = new Map();

const getChatters = async (userId) => {
  try {
    const [result, metadata] =
      await sequelize.query(`SELECT "cu"."userId" FROM "ChatUsers" as cu
      INNER JOIN (SELECT "c"."id" FROM "Chats" as c where exists(
         SELECT "u"."id" FROM "Users" as u INNER JOIN "ChatUsers" ON u.id = "ChatUsers"."userId" WHERE "u"."id" = ${parseInt(
           userId
         )} AND "c"."id" = "ChatUsers"."chatId"
      )) as cj on cj.id = "cu"."chatId"
      where "cu"."userId" != ${parseInt(userId)}`);

    return result.length > 0 ? result.map((e) => e.userId) : [];
  } catch (error) {
    console.log(error);
    return [];
  }
};

const SocketServer = (server) => {
  const corsOptions = {
    origin: "*",
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Content-Length",
      "X-Requested-With",
      "Accept",
    ],
    methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  };

  const io = socketIo(server, corsOptions);

  try {
    io.on("connection", (socket) => {
      socket.on("join", async (user) => {
        console.log("this user join", user.firstName);
        let sockets = [];

        if (users.has(user.id)) {
          const existingUser = users.get(user.id);
          existingUser.sockets = [...existingUser.sockets, ...[socket.id]];
          users.set(user.id, existingUser);
          sockets = [...existingUser.sockets, ...[socket.id]];
          userSockets.set(socket.id, user.id);
        } else {
          users.set(user.id, { id: user.id, sockets: [socket.id] });
          sockets.push(socket.id);
          userSockets.set(socket.id, user.id);
        }

        const onlineFriends = []; // id's

        const chatters = await getChatters(user.id); // query

        console.log("ini chatters", chatters);

        // notify his friends that user in now online
        for (let i = 0; i < chatters.length; i++) {
          if (users.has(chatters[i])) {
            const chatter = users.get(chatters[i]);
            chatter.sockets.forEach((socket) => {
              try {
                io.to(socket).emit("online", user);
              } catch (error) {}
            });
            onlineFriends.push(chatter.id);
          }
        }

        // send notify to user socket which of his friends are online
        sockets.forEach((socket) => {
          try {
            io.to(socket).emit("friends", onlineFriends);
          } catch (error) {}
        });
      });

      socket.on("message", async (message) => {
        let sockets = [];

        if (users.has(message.fromUser.id)) {
          sockets = users.get(message.fromUser.id).sockets;
        }

        message.toUserId.forEach((id) => {
          if (users.has(id)) {
            sockets = [...sockets, users.get(id).sockets];
          }
        });

        try {
          const msg = {
            type: message.type,
            fromUserId: message.fromUser.id,
            chatId: message.chatId,
            message: message.message,
          };

          const newMessage = await Message.create(msg);

          message.User = message.fromUser;
          message.fromUserId = message.fromUser.id;
          message.id = newMessage.id;
          message.message = newMessage.dataValues.message;
          delete message.fromUser;

          sockets.forEach((socket) => {
            io.to(socket).emit("received", message);
          });
        } catch (error) {
          console.log("Ini pas save message", error);
        }
      });

      socket.on("typing", (message) => {
        message.toUserId.forEach((id) => {
          if (users.has(id)) {
            users.get(id).sockets.forEach((socket) => {
              io.to(socket).emit("typing", message);
            });
          }
        });
      });

      socket.on("add-chat", (chat) => {
        try {
          let online = "offline";

          if (users.has(chat[1].Users[0].id)) {
            online = "online";
            chat[0].Users[0].status = "online";

            users.get(chat[1].Users[0].id).sockets.forEach((socket) => {
              io.to(socket).emit("new-chat", chat[0]);
            });
          }

          if (users.has(chat[0].Users[0].id)) {
            chat[1].Users[0].status = online;

            users.get(chat[0].Users[0].id).sockets.forEach((socket) => {
              io.to(socket).emit("new-chat", chat[1]);
            });
          }
        } catch (error) {
          console.log(error);
        }
      });

      socket.on("add-user-to-group", ({ chat, newChatter }) => {
        if (users.has(newChatter.id)) {
          newChatter.status = "online";
        }

        // notify old users
        chat.Users.forEach((user, index) => {
          if (users.has(user.id)) {
            chat.Users[index].status = "online";
            users.get(user.id).sockets.forEach((socket) => {
              try {
                io.to(socket).emit("added-user-to-group", {
                  chat,
                  chatters: [newChatter],
                });
              } catch (error) {}
            });
          }
        });

        // send to new chatter
        if (users.has(newChatter.id)) {
          users.get(newChatter.id).sockets.forEach((socket) => {
            try {
              io.to(socket).emit("added-user-to-group", {
                chat,
                chatters: [chat.Users],
              });
            } catch (error) {
              console.log(error.message);
            }
          });
        }
      });

      socket.on("leave-current-chat", (data) => {
        const { chatId, userId, currentUserId, notifyUsers } = data;

        notifyUsers.forEach((id) => {
          if (users.has(id)) {
            users.get(id).sockets.forEach((socket) => {
              try {
                io.to(socket).emit("remove-user-from-chat", {
                  chatId,
                  userId,
                  currentUserId,
                });
              } catch (error) {
                console.log(error.message);
              }
            });
          }
        });
      });

      socket.on("delete-chat", (data) => {
        const { chatId, notifyUsers } = data;

        notifyUsers.forEach((id) => {
          if (users.has(id)) {
            users.get(id).sockets.forEach((socket) => {
              try {
                io.to(socket).emit("delete-chat", parseInt(chatId));
              } catch (error) {
                console.log(error.message);
              }
            });
          }
        });
      });

      socket.on("disconnect", async () => {
        if (userSockets.has(socket.id)) {
          const user = users.get(userSockets.get(socket.id));

          if (user.sockets.length > 1) {
            user.sockets = user.sockets.filter((el) => {
              if (el !== socket.id) return true;

              userSockets.delete(el);
              return false;
            });

            users.set(user.id, user);
          } else {
            const chatters = await getChatters(user.id);

            for (let i = 0; i < chatters.length; i++) {
              if (users.has(chatters[i])) {
                users.get(chatters[i]).sockets.forEach((socket) => {
                  try {
                    io.to(socket).emit("offline", user);
                  } catch (error) {}
                });
              }
            }

            userSockets.delete(socket.id);
            users.delete(user.id);
          }
        }
      });
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = SocketServer;
