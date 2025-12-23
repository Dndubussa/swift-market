'use client';

import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

export default function VendorChatPanel({ vendorName, orderId, initialMessages, onSendMessage }) {
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef?.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (newMessage?.trim() && !isSending) {
      setIsSending(true);
      const message = {
        id: Date.now()?.toString(),
        text: newMessage,
        sender: 'buyer',
        timestamp: new Date()?.toISOString(),
        read: false,
      };
      setMessages([...messages, message]);
      onSendMessage(message);
      setNewMessage('');
      setTimeout(() => setIsSending(false), 500);
    }
  };

  const handleKeyPress = (e) => {
    if (e?.key === 'Enter' && !e?.shiftKey) {
      e?.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden flex flex-col h-[500px]">
      <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-foreground/20 rounded-full flex items-center justify-center">
            <Icon name="ChatBubbleLeftRightIcon" size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold">{vendorName}</p>
            <p className="text-xs opacity-90">Order #{orderId}</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
          <span className="text-xs">Online</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20">
        {messages?.map((message) => (
          <div
            key={message?.id}
            className={`flex ${message?.sender === 'buyer' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] rounded-lg px-4 py-2 ${
                message?.sender === 'buyer' ?'bg-primary text-primary-foreground' :'bg-card border border-border text-foreground'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap break-words">{message?.text}</p>
              <div className="flex items-center justify-end space-x-2 mt-1">
                <p className="text-xs opacity-70">
                  {new Date(message.timestamp)?.toLocaleTimeString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                {message?.sender === 'buyer' && (
                  <Icon
                    name={message?.read ? 'CheckCircleIcon' : 'CheckIcon'}
                    size={14}
                    variant={message?.read ? 'solid' : 'outline'}
                    className="opacity-70"
                  />
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t border-border p-4 bg-card">
        <div className="flex items-end space-x-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e?.target?.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-sm resize-none"
            rows="2"
          />
          <button
            onClick={handleSend}
            disabled={!newMessage?.trim() || isSending}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            aria-label="Send message"
          >
            <Icon name="PaperAirplaneIcon" size={20} />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Average response time: <span className="font-medium text-foreground">2-3 hours</span>
        </p>
      </div>
    </div>
  );
}

VendorChatPanel.propTypes = {
  vendorName: PropTypes?.string?.isRequired,
  orderId: PropTypes?.string?.isRequired,
  initialMessages: PropTypes?.arrayOf(
    PropTypes?.shape({
      id: PropTypes?.string?.isRequired,
      text: PropTypes?.string?.isRequired,
      sender: PropTypes?.oneOf(['buyer', 'vendor'])?.isRequired,
      timestamp: PropTypes?.string?.isRequired,
      read: PropTypes?.bool?.isRequired,
    })
  )?.isRequired,
  onSendMessage: PropTypes?.func?.isRequired,
};