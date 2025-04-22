// src/pages/GroupChatPage.tsx
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChatGroup, ChatMessage } from '../types';

interface GroupChatPageProps {
    groups: ChatGroup[]; // Need groups to find the name
    messages: ChatMessage[];
    sendMessage: (groupId: string, text: string) => void;
}

function GroupChatPage({ groups, messages, sendMessage }: GroupChatPageProps) {
  const { groupId } = useParams<{ groupId: string }>(); // Get groupId from URL
  const navigate = useNavigate();
  const [newMessage, setNewMessage] = useState('');
  const messageListRef = useRef<HTMLDivElement>(null);

  // Find the current group details
  const currentGroup = useMemo(() => {
      if (!groupId) return undefined;
      return groups.find(g => g.id === groupId);
  }, [groups, groupId]);

  // Memoize filtered messages for performance
  const activeMessages = useMemo(() => {
    if (!groupId) return [];
    return messages
        .filter(msg => msg.groupId === groupId)
        .sort((a, b) => a.timestamp - b.timestamp); // Sort oldest first
  }, [groupId, messages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [activeMessages]);

  // Handle Message Sending
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !groupId) return;
    sendMessage(groupId, newMessage);
    setNewMessage('');
  };

  // Redirect if group ID is invalid or group doesn't exist
  useEffect(() => {
      if (!groupId || (groups.length > 0 && !currentGroup)) {
          console.warn(`Group with ID ${groupId} not found. Redirecting to chat list.`);
          navigate('/chat');
      }
  }, [groupId, currentGroup, groups, navigate]);


  if (!groupId || !currentGroup) {
    // Display loading or redirecting state
    return <div className="group-chat-page"><p>Loading chat or group not found...</p></div>;
  }

  // --- Render ---
  return (
    <div className="group-chat-page">
        {/* Simple Header */}
        <div className="page-header">
            <h2>{currentGroup.name}</h2>
            <div className="page-header-actions">
                <Link to="/chat" className="button-link button-small">Back to Groups</Link>
                {/* Placeholder for adding users */}
                <button type="button" className='button-small' onClick={() => alert('Add User functionality not implemented in demo.')} title="Add User (Demo)">
                    Add User
                </button>
            </div>
        </div>

        {/* Message List */}
        <div className="message-list" ref={messageListRef}>
            {activeMessages.length === 0 && (
                <p style={{ textAlign: 'center', color: '#888', marginTop: '2rem' }}>
                    No messages yet. Be the first!
                </p>
            )}
            {activeMessages.map(msg => (
                <div key={msg.id} className={`message-item ${msg.sender === 'You' ? 'sent' : 'received'}`}>
                    <div className="message-content">
                        {msg.sender !== 'You' && <span className="message-sender">{msg.sender}</span>}
                        {msg.text}
                        <div className="message-meta">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                </div>
            ))}
        </div>

        {/* Message Input Form */}
        <form className="message-input-area" onSubmit={handleSendMessage}>
            <input
                type="text"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
            />
            <button type="submit" disabled={!newMessage.trim()}>Send</button>
        </form>
    </div>
  );
}

export default GroupChatPage;