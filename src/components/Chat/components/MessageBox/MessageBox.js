import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Message from "../Message/Message";
import "./MessageBox.scss";
import { paginateMessages } from "../../../../store/actions/chat";

const MessageBox = ({ chat }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.authReducer.user);
  const scrollBottom = useSelector((state) => state.chatReducer.scrollBottom);
  const senderTyping = useSelector((state) => state.chatReducer.senderTyping);
  const [loading, setLoading] = useState(false);
  const [scrollUp, setScrollUp] = useState(0);

  const msgBox = useRef();

  const scrollManual = (value) => {
    msgBox.current.scrollTop = value;
  };

  const handleInfiniteScroll = (e) => {
    console.log("ini scrollTop", e.target.scrollTop);
    if (e.target.scrollTop === 0) {
      setLoading(true);
      console.log("ini chat di handleInfiniteScroll", chat);
      const pagination = chat.pagination;
      const page = typeof pagination === "undefined" ? 1 : pagination.page;

      // dispatch
      dispatch(paginateMessages(chat.id, parseInt(page) + 1))
        .then((res) => {
          if (res) {
            setScrollUp(scrollUp + 1);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.log("ini error pas handleInfininteScroll", err);
          setLoading(false);
        });
    }
  };

  useEffect(() => {
    setTimeout(() => {
      scrollManual(Math.ceil(msgBox.current.scrollHeight * 0.1));
    }, 100);
  }, [scrollUp]);

  useEffect(() => {
    if (
      senderTyping.typing &&
      msgBox.current.scrollTop > msgBox.current.scrollHeight * 0.3
    ) {
      setTimeout(() => {
        scrollManual(msgBox.current.scrollHeight);
      }, 100);
    }
  }, [senderTyping]);

  useEffect(() => {
    if (!senderTyping.typing) {
      setTimeout(() => {
        scrollManual(msgBox.current.scrollHeight);
      }, 100);
    }
  }, [scrollBottom]);

  return (
    <div onScroll={handleInfiniteScroll} id="msg-box" ref={msgBox}>
      {loading ? (
        <p className="loader mb-0">
          <FontAwesomeIcon icon="spinner" className="fa-spin" />
        </p>
      ) : null}
      {chat.Messages.map((message, index) => {
        return (
          <Message
            user={user}
            chat={chat}
            message={message}
            index={index}
            key={message.id}
          />
        );
      })}
      {senderTyping.typing === true && senderTyping.chatId === chat.id ? (
        <div className="message">
          <div className="other-person">
            <p className="mb-0">
              {senderTyping.fromUser.firstName} {senderTyping.fromUser.lastName}{" "}
              ...
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default MessageBox;
