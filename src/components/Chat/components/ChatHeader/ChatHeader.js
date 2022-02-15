import React, { Fragment, useState } from "react";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import ChatService from "../../../../services/chatService";
import Modal from "../../../Modal/Modal";
import { userStatus } from "../../../../utils/helpers";
import "./ChatHeader.scss";

const ChatHeader = ({ chat }) => {
  const socket = useSelector((state) => state.chatReducer.socket);
  const [showChatOptions, setShowChatOptions] = useState(false);
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [showLeaveChatModal, setShowLeaveChatModal] = useState(false);
  const [showDeleteChatModal, setDeleteChatModal] = useState(false);
  const [sugestions, setSugestions] = useState([]);

  const searchFriends = (e) => {
    // chat service
    console.log("masuk search friends");
    ChatService.searchUsers(e.target.value).then((res) => setSugestions(res));
  };

  const addNewFriend = (id) => {
    ChatService.addFriendToGroupChat(id, chat.id)
      .then((data) => {
        // emit
        console.log("masuk friend list component add new friend", data);
        socket.emit("add-user-to-group", data);
        setShowAddFriendModal(false);
      })
      .catch((e) => console.log(e));
  };

  const leaveChat = () => {
    ChatService.leaveCurrentChat(chat.id)
      .then((data) => {
        socket.emit("leave-current-chat", data);
      })
      .catch((e) => console.log(e));
  };

  const deleteChat = () => {
    ChatService.deleteCurrentChat(chat.id).then((data) => {
      socket.emit("delete-chat", data);
    });
  };

  return (
    <Fragment>
      <div id="chatter">
        {chat.Users.map((user) => {
          return (
            <div className="chatter-info" key={user.id}>
              <h3>
                {" "}
                {user.firstName} {user.lastName}
              </h3>
              <div className="chatter-status">
                <span className={`online-status ${userStatus(user)}`}></span>
              </div>
            </div>
          );
        })}
      </div>
      <FontAwesomeIcon
        onClick={() => setShowChatOptions(!showChatOptions)}
        icon={["fas", "ellipsis-v"]}
        className="fa-icon"
      />
      {showChatOptions ? (
        <div id="settings">
          <div onClick={() => setShowAddFriendModal(true)}>
            <FontAwesomeIcon icon={["fas", "user-plus"]} className="fa-icon" />
            <p>Add user to chat</p>
          </div>
          {chat.type === "group" ? (
            <div onClick={() => leaveChat()}>
              <FontAwesomeIcon
                icon={["fas", "sign-out-alt"]}
                className="fa-icon"
              />
              <p>Leave chat</p>
            </div>
          ) : null}

          {chat.type === "dual" ? (
            <div onClick={() => deleteChat()}>
              <FontAwesomeIcon icon={["fas", "trash"]} className="fa-icon" />
              <p>Delete chat</p>
            </div>
          ) : null}
        </div>
      ) : null}

      {showAddFriendModal && (
        <Modal onClick={() => setShowAddFriendModal(false)}>
          <Fragment key="header">
            <h3 className="mb-0">Add friend to group chat</h3>
          </Fragment>
          <Fragment key="body">
            <p>Find new friends by typing name of user bellow</p>
            <input
              onInput={(e) => searchFriends(e)}
              type="text"
              placeholder="Search..."
            />
            <div id="suggestions">
              {sugestions.map((user) => {
                return (
                  <div key={user.id} className="suggestion">
                    <p className="mb-0">
                      {user.firstName} {user.lastName}
                    </p>
                    <button onClick={() => addNewFriend(user.id)}>Add</button>
                  </div>
                );
              })}
            </div>
          </Fragment>
        </Modal>
      )}
    </Fragment>
  );
};

export default ChatHeader;
