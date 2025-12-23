'use client';
import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

export default function TicketMessages({ ticket, onSendMessage, currentUserId }) {
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [ticket?.messages]);

  const scrollToBottom = () => {
    messagesEndRef?.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!newMessage?.trim()) return;

    try {
      setSending(true);
      await onSendMessage(newMessage);
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-[600px]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Conversation</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {ticket?.messages?.length > 0 ? (
          <>
            {ticket?.messages?.map(message => {
              const isCurrentUser = message?.senderId === currentUserId;
              const isAgent = message?.senderType === 'support_agent';
              
              return (
                <div
                  key={message?.id}
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] ${isCurrentUser ? 'order-2' : 'order-1'}`}>
                    <div
                      className={`rounded-lg px-4 py-3 ${
                        isCurrentUser
                          ? 'bg-blue-600 text-white'
                          : isAgent
                          ? 'bg-green-50 text-gray-900 border border-green-200' :'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {!isCurrentUser && (
                        <div className="flex items-center mb-1">
                          <span className="text-xs font-medium">
                            {isAgent ? 'Support Agent' : message?.sender?.fullName || 'User'}
                          </span>
                        </div>
                      )}
                      <p className="text-sm whitespace-pre-wrap">{message?.message}</p>
                    </div>
                    <div
                      className={`text-xs text-gray-500 mt-1 ${
                        isCurrentUser ? 'text-right' : 'text-left'
                      }`}
                    >
                      {formatDate(message?.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            No messages yet. Start the conversation below.
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-gray-200">
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e?.target?.value)}
            placeholder="Type your message..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={sending || ticket?.status === 'closed'}
          />
          <button
            type="submit"
            disabled={sending || !newMessage?.trim() || ticket?.status === 'closed'}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </form>
        {ticket?.status === 'closed' && (
          <p className="text-sm text-gray-500 mt-2">
            This ticket is closed. Contact support to reopen if needed.
          </p>
        )}
      </div>
    </div>
  );
}

TicketMessages.propTypes = {
  ticket: PropTypes?.shape({
    id: PropTypes?.string?.isRequired,
    status: PropTypes?.string?.isRequired,
    messages: PropTypes?.arrayOf(
      PropTypes?.shape({
        id: PropTypes?.string?.isRequired,
        senderId: PropTypes?.string,
        senderType: PropTypes?.string?.isRequired,
        message: PropTypes?.string?.isRequired,
        createdAt: PropTypes?.string?.isRequired,
        sender: PropTypes?.shape({
          fullName: PropTypes?.string
        })
      })
    )
  })?.isRequired,
  onSendMessage: PropTypes?.func?.isRequired,
  currentUserId: PropTypes?.string?.isRequired
};