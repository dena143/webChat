import React from "react";

import "./Message.scss";

const Message = ({ user, chat, message, index }) => {
  const determineMargin = () => {
    if (index + 1 === chat.Messages.length) return;
    return message.fromUserId === chat.Messages[index + 1].fromUserId
      ? "mb-3"
      : "mb-20";
  };
  return (
    <div
      className={`message ${determineMargin()} ${
        message.fromUserId === user.id ? "creator" : ""
      }`}
    >
      <div
        className={message.fromUserId === user.id ? "owner" : "other-person"}
      >
        {message.fromUserId !== user.id ? (
          <h6 className="mb-0">
            {message.User.firstname} {message.User.lastName}
          </h6>
        ) : null}

        {message.type === "text" ? (
          <p className="mb-0">{message.message}</p>
        ) : (
          <img src={message.message} alt="user upload" />
        )}
      </div>
    </div>
  );
};

export default Message;
