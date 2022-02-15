import { useEffect } from "react";
import io from "socket.io-client";

import {
  fetchChats,
  onlineFriends,
  offlineFriend,
  onlineFriend,
  setSocket,
  receivedMessage,
  senderTyping,
  createChat,
  addUserToGroup,
  leaveCurrentChat,
  deleteCurrentChat,
} from "../../../store/actions/chat";

function useSocket(user, dispatch) {
  var connectionOptions = {
    "force new connection": true,
    reconnectionAttempts: "Infinity",
    timeout: 10000,
    transports: ["websocket"],
  };
  useEffect(() => {
    dispatch(fetchChats())
      .then((res) => {
        const socket = io(
          "http://localhost:3001",
          connectionOptions
          // {
          // //   transports: ["websocket", "polling", "flashsocket"]
          //   ,}
        );

        dispatch(setSocket(socket));

        socket.emit("join", user);

        socket.on("typing", (sender) => {
          console.log("event", sender);
          // dispatch
          dispatch(senderTyping(sender));
        });

        socket.on("friends", (friends) => {
          console.log("Friends", friends);
          dispatch(onlineFriends(friends));
        });

        socket.on("online", (user) => {
          console.log("Online", user);
          dispatch(onlineFriend(user));
        });

        socket.on("offline", (user) => {
          console.log("Offline", user);
          dispatch(offlineFriend(user));
        });

        socket.on("received", (message) => {
          // dispatch received message
          dispatch(receivedMessage({ message, userId: user.id }));
          console.log("ini received message", message);
        });

        socket.on("new-chat", (chat) => {
          // dispatch new chat
          dispatch(createChat(chat));
          console.log("ini received new chat", chat);
        });

        socket.on("added-user-to-group", (group) => {
          dispatch(addUserToGroup(group));
        });

        socket.on("remove-user-from-chat", (data) => {
          data.currentUserId = user.id;
          dispatch(leaveCurrentChat(data));
        });

        socket.on("delete-chat", (chatId) => {
          dispatch(deleteCurrentChat(chatId));
        });
      })
      .catch((err) => console.log(err));
  }, [dispatch]);
}

export default useSocket;
