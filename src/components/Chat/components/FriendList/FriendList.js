import React, { useState, Fragment } from "react";
import { useSelector, useDispatch } from "react-redux";

import Modal from "../../../Modal/Modal";
import Friend from "../Friend/Friend";
import ChatService from "../../../../services/chatService";
import { setCurrentChat } from "../../../../store/actions/chat";
import "./FriendList.scss";

const FriendList = () => {
  const dispatch = useDispatch();
  const chats = useSelector((state) => state.chatReducer.chats);
  const socket = useSelector((state) => state.chatReducer.socket);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [sugestions, setSugestions] = useState([]);
  const openChat = (chat) => {
    dispatch(setCurrentChat(chat));
  };

  const searchFriends = (e) => {
    // chat service
    console.log("masuk search friends");
    ChatService.searchUsers(e.target.value).then((res) => setSugestions(res));
  };

  const addNewFriend = (id) => {
    ChatService.createChat(id)
      .then((chat) => {
        // emit
        console.log("masuk friend list component add new friend", chat);
        socket.emit("add-chat", chat);
        setShowFriendsModal(false);
      })
      .catch((e) => console.log(e));
  };

  return (
    <div id="friends" className="shadow-light">
      <div id="title">
        <h3 className="m-0">Friends</h3>
        <button onClick={() => setShowFriendsModal(true)}>Add</button>
      </div>
      <hr />
      <div id="friends-box">
        {chats.length > 0 ? (
          chats.map((chat) => {
            return (
              <Friend click={() => openChat(chat)} chat={chat} key={chat.id} />
            );
          })
        ) : (
          <p id="no-chat">No friends added</p>
        )}
      </div>
      {showFriendsModal && (
        <Modal onClick={() => setShowFriendsModal(false)}>
          <Fragment key="header">
            <h3 className="mb-0">Create new chat</h3>
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
    </div>
  );
};

export default FriendList;
