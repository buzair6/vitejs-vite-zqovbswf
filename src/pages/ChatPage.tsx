// src/pages/ChatPage.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChatGroup } from '../types';

interface ChatPageProps {
    groups: ChatGroup[];
    createGroup: (name: string) => ChatGroup | null;
}

function ChatPage({ groups, createGroup }: ChatPageProps) {
    const [newGroupName, setNewGroupName] = useState('');

    const handleCreateGroup = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newGroupName.trim()) return;
        const newGroup = createGroup(newGroupName);
        if (newGroup) {
            setNewGroupName(''); // Clear input on success
        } else {
            alert("Failed to create group. Name might be empty.");
        }
    };

    // Sort groups by last activity (most recent first)
    const sortedGroups = [...groups].sort((a, b) =>
        (b.lastActivity ? new Date(b.lastActivity).getTime() : 0) -
        (a.lastActivity ? new Date(a.lastActivity).getTime() : 0)
    );

    return (
        <div className="chat-page"> {/* Use specific page wrapper */}
            <div className="page-header">
                 <h2>Chat Groups</h2>
            </div>

            {/* Form to create a new group */}
            <form onSubmit={handleCreateGroup} className="create-group-form">
                <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="Enter new group name..."
                    aria-label="New Group Name"
                    required
                />
                <button type="submit" className="button-small">+ Create Group</button>
            </form>

            {/* List of existing groups */}
            <h3>Existing Groups</h3>
            {sortedGroups.length === 0 ? (
                 <p className="no-data" style={{gridColumn: 'initial'}}>No chat groups found. Create one above!</p>
            ) : (
                <ul className="chat-group-list">
                    {sortedGroups.map(group => (
                        <li key={group.id}>
                             {/* Link to the specific group chat page */}
                            <Link to={`/chat/${group.id}`}>
                                {group.name}
                            </Link>
                            {group.lastActivity && (
                                <span className="last-activity">
                                    Last activity: {new Date(group.lastActivity).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default ChatPage;