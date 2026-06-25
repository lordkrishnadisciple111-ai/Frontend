import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import SkeletonLoader from '../components/SkeletonLoader';
import { chatService } from '../services/chatService';
import { useStore } from '../store/useStore';
import type { ChatMessage, Conversation } from '../store/useStore';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export default function Chat() {
  const user = useStore((s) => s.user);
  const token = useStore((s) => s.token);
  const conversations = useStore((s) => s.conversations);
  const setConversations = useStore((s) => s.setConversations);
  const activeMessages = useStore((s) => s.activeMessages);
  const setActiveMessages = useStore((s) => s.setActiveMessages);
  const activeContactId = useStore((s) => s.activeContactId);
  const setActiveContactId = useStore((s) => s.setActiveContactId);
  const addMessage = useStore((s) => s.addMessage);
  const typingUsers = useStore((s) => s.typingUsers);
  const setTyping = useStore((s) => s.setTyping);
  const addNotification = useStore((s) => s.addNotification);

  const [loading, setLoading] = useState(true);
  const [messageInput, setMessageInput] = useState('');
  const [searchParams] = useSearchParams();
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const loadConversations = async () => {
      try {
        const res = await chatService.getConversations();
        if (res.success) setConversations(res.data as Conversation[]);
      } finally {
        setLoading(false);
      }
    };
    loadConversations();
  }, [setConversations]);

  useEffect(() => {
    const contactParam = searchParams.get('contact');
    if (contactParam) setActiveContactId(contactParam);
  }, [searchParams, setActiveContactId]);

  useEffect(() => {
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('receive_message', (msg: ChatMessage) => {
      if (msg.sender === activeContactId || msg.recipient === activeContactId) {
        addMessage(msg);
      }
      addNotification({ type: 'message', content: msg.message });
    });

    socket.on('typing_indicator', ({ senderId, isTyping }: { senderId: string; isTyping: boolean }) => {
      setTyping(senderId, isTyping);
    });

    socket.on('notification', (payload: unknown) => {
      addNotification(payload);
    });

    socketRef.current = socket;
    return () => { socket.disconnect(); };
  }, [token, activeContactId, addMessage, setTyping, addNotification]);

  useEffect(() => {
    if (!activeContactId) return;

    const loadHistory = async () => {
      const res = await chatService.getHistory(activeContactId);
      if (res.success) setActiveMessages(res.data as ChatMessage[]);
      await chatService.markAsSeen(activeContactId);
    };
    loadHistory();
  }, [activeContactId, setActiveMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages]);

  const sendMessage = () => {
    if (!messageInput.trim() || !activeContactId || !socketRef.current) return;

    socketRef.current.emit('send_message', {
      recipientId: activeContactId,
      message: messageInput.trim(),
    });
    setMessageInput('');

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socketRef.current.emit('typing_stop', { recipientId: activeContactId });
  };

  const handleTyping = () => {
    if (!activeContactId || !socketRef.current) return;
    socketRef.current.emit('typing_start', { recipientId: activeContactId });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit('typing_stop', { recipientId: activeContactId });
    }, 2000);
  };

  const activeContact = conversations.find((c) => c.contact._id === activeContactId)?.contact;

  if (loading) return <SkeletonLoader count={2} type="text" />;

  return (
    <div className="page chat-page">
      <div className="chat-container glass">
        <div className="chat-sidebar">
          <h3>Messages</h3>
          {conversations.map((conv) => (
            <div
              key={conv.contact._id}
              className={`chat-contact ${activeContactId === conv.contact._id ? 'active' : ''}`}
              onClick={() => setActiveContactId(conv.contact._id)}
            >
              <div className="contact-avatar">{conv.contact.name[0]}</div>
              <div className="contact-info">
                <span className="contact-name">{conv.contact.name}</span>
                <span className="contact-last">{conv.lastMessage || 'Start chatting'}</span>
              </div>
              {conv.unreadCount > 0 && (
                <span className="unread-badge">{conv.unreadCount}</span>
              )}
            </div>
          ))}
        </div>

        <div className="chat-main">
          {activeContactId && activeContact ? (
            <>
              <div className="chat-header">
                <span>{activeContact.name}</span>
                <span className="contact-role">{activeContact.role}</span>
              </div>

              <div className="chat-messages">
                {activeMessages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`chat-bubble ${msg.sender === user?.id ? 'sent' : 'received'}`}
                  >
                    <p>{msg.message}</p>
                    <span className="msg-time">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {msg.sender === user?.id && (
                        <span className="seen-status">{msg.seen ? ' ✓✓' : ' ✓'}</span>
                      )}
                    </span>
                  </div>
                ))}
                {typingUsers.has(activeContactId) && (
                  <div className="typing-indicator">typing...</div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="chat-input-area">
                <input
                  value={messageInput}
                  onChange={(e) => {
                    setMessageInput(e.target.value);
                    handleTyping();
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                />
                <button className="btn btn-primary" onClick={sendMessage}>Send</button>
              </div>
            </>
          ) : (
            <div className="chat-empty">
              <p>Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
