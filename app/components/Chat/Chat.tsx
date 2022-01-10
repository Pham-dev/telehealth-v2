import { useRef, useEffect, useState } from 'react';
import useChatContext from '../Base/ChatProvider/useChatContext/useChatContext';
import { Icon } from '../Icon';
import { ChatMessage } from './ChatMessage/ChatMessage';
import ChatInput from './ChatInput/ChatInput';
import MediaMessage from './ChatMediaMessage/ChatMediaMessage';

export interface ChatProps {
  close?: () => void;
  userName: string;
  userRole: string;
  inputPlaceholder?: string;
  showHeader?: boolean;
}

const providerName = 'Dr. Josefina Santos';
const patientName = 'Sarah Cooper';

export const Chat = ({ inputPlaceholder, showHeader, userName, userRole }: ChatProps) => {

  const messageListRef = useRef(null);
  const { messages, isChatWindowOpen, setIsChatWindowOpen, conversation } = useChatContext();

  // Scrolls to the bottom of the dummy div in chat
  useEffect(() => {
    if (isChatWindowOpen) {
      messageListRef.current.scrollIntoView({behavior: 'smooth'});
    }
  }, [isChatWindowOpen, messages]);

  return (
    <>
      <div className="relative flex flex-col items-center h-full w-full">
        {showHeader && (
          <div className="relative bg-primary text-white rounded-t p-2 text-center w-full">
            Chat with {patientName}
            {isChatWindowOpen && (
              <button
                className="absolute right-3"
                type="button"
                onClick={() => setIsChatWindowOpen(!isChatWindowOpen)}
              >
                <Icon name="close" />
              </button>
            )}
          </div>
        )}
        <div className="bg-white flex-grow w-full p-3 overflow-auto pb-16 mb-2">
          {messages.map((message, i) => {
            if (message.type === 'text') {
              return <ChatMessage 
                        key={i} 
                        isSelf={message.author === userName ? true : false} 
                        name={message.author ===  userName ? userName : message.author} 
                        content={message.body}
                        role={userRole}
                    />
            }
            if (message.type === 'media') {
              return <MediaMessage
                      key={i} 
                      media={message.attachedMedia}
                      isSelf={message.author === userName ? true : false}
                      name={message.author ===  userName ? userName : message.author}
                    />
            }
          })}
          <div className="bottom-scroll" ref={messageListRef} />
        </div>
        <ChatInput conversation={conversation} isChatWindowOpen={isChatWindowOpen} inputPlaceholder={inputPlaceholder}/>
      </div>
    </>
  );
};
