import React, { useState } from "react";
import "./chatbox.css";
import ChatboxIcon from "./icons/chatbox-icon.svg";

const Chatbox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [content, setContent] = useState("");

  const toggleState = () => {
    setIsOpen(!isOpen);
  };

  const onSendButton = () => {
    if (userInput === "") {
      return;
    }

    const newUserMessage = { name: "User", message: userInput };
    // setMessages([...messages, newUserMessage]);
    setUserInput("");

    //Assuming you have a backend server running at 'http://127.0.0.1:5000/predict'
    fetch("http://127.0.0.1:5000/predict", {
      method: "POST",
      body: JSON.stringify({ message: userInput }),
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        const newSamMessage = { name: "Sam", message: data.answer };
        setMessages([...messages, newUserMessage, newSamMessage]);
      })
      .catch((error) => {
        console.error("Error:", error);
      });

    messages.forEach((item) => {
      console.log("print" + JSON.stringify(item));
    });
  };

  const handleInputChange = (event) => {
    setUserInput(event.target.value);
  };

  const updateChatText = () => {
    const chatmessage = document.querySelector(".chatbox__messages");
    setContent("");
    // const newContent = "<p>This is dynamically added content!</p>";
    messages
      .slice()
      .reverse()
      .forEach(function (item, index) {
        if (item.name === "Sam") {
          let html =
            "<div class='messages__item messages__item--visitor'>" +
            item.message +
            "</div>";
          setContent((prevContent) => prevContent + html);
        } else {
          let html =
            "<div class='messages__item messages__item--operator'>" +
            item.message +
            "</div>";
          setContent((prevContent) => prevContent + html);
        }
        // console.log(item.name, item.message);
      });
  };

  React.useEffect(() => {
    updateChatText();
    console.log("hello");
  }, [messages]);

  return (
    <div className="container">
      <div className="chatbox">
        <div className={`chatbox__support ${isOpen ? "chatbox--active" : ""}`}>
          <div className="chatbox__header">
            <div className="chatbox__image--header">
              <img
                src="https://img.icons8.com/color/48/000000/circled-user-female-skin-type-5--v1.png"
                alt="chatimage"
              />
            </div>
            <div className="chatbox__content--header">
              <h4 className="chatbox__heading--header">Chat support</h4>
              <p className="chatbox__description--header">
                Hi. My name is Sam. How can I help you?
              </p>
            </div>
          </div>
          <div
            className="chatbox__messages"
            dangerouslySetInnerHTML={{ __html: content }}
          >
            {/* {messages.map((item, index) => {
              return (
                <div
                  key={index}
                  className={`messages__item ${
                    item.name === "Sam"
                      ? "messages__item--visitor"
                      : "messages__item--operator"
                  }`}
                >
                  {item.message}
                </div>
              );
            })} */}
          </div>
          <div className="chatbox__footer">
            <input
              type="text"
              placeholder="Write a message..."
              value={userInput}
              onChange={handleInputChange}
            />
            <button
              className="chatbox__send--footer send__button"
              onClick={onSendButton}
            >
              Send
            </button>
          </div>
        </div>
        <div className="chatbox__button">
          <button onClick={toggleState}>
            <img src={ChatboxIcon} alt="chatbox-icon" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbox;
