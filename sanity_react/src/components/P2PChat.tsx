import { useEffect, useMemo, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { MessageSquare, Send, X, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { API_CONFIG } from '@/lib/api-config';
import { getAvatarUrl, getCharacterAvatar, getImageUrl } from '@/lib/utils';
import { cn } from '@/utils/cn';

interface P2PMessage {
  _id?: string;
  room: string;
  message: string;
  sender: string;
  senderId?: string | null;
  sender_logo?: string;
  createdAt?: string;
}

interface Contact {
  username: string;
  avatarUrl?: string;
}

interface P2PChatProps {
  initialRecipient?: string;
  initialOpen?: boolean;
  showFloatingButton?: boolean;
}

const CONTACTS_STORAGE_KEY = 'p2p-chat-contacts';
const UNREAD_STORAGE_KEY = 'p2p-chat-unread';

const normalizeUsername = (value: string): string => value.trim().toLowerCase();

const buildDirectRoomId = (currentUser: string, peerUser: string): string => {
  const pair = [normalizeUsername(currentUser), normalizeUsername(peerUser)].sort();
  return `dm:${pair[0]}:${pair[1]}`;
};

const getPeerFromRoom = (room: string, currentUser: string): string | null => {
  if (!room?.startsWith('dm:')) return null;
  const [_, left, right] = room.split(':');
  const normalizedCurrent = normalizeUsername(currentUser);
  if (!left || !right) return null;
  return left === normalizedCurrent ? right : left;
};

const isValidRecipient = (recipient: string, currentUsername?: string): boolean => {
  const normalizedRecipient = normalizeUsername(recipient);
  if (!normalizedRecipient) return false;
  if (!currentUsername) return false;
  return normalizedRecipient !== normalizeUsername(currentUsername);
};

export function P2PChat({
  initialRecipient,
  initialOpen = false,
  showFloatingButton = true,
}: P2PChatProps) {
  const { user, isAuthenticated } = useAuth();

  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(initialOpen);
  const [isConnected, setIsConnected] = useState(false);
  const [recipientInput, setRecipientInput] = useState('');
  const [activeRecipient, setActiveRecipient] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<P2PMessage[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [unreadByContact, setUnreadByContact] = useState<Record<string, number>>({});
  const [recipientFocused, setRecipientFocused] = useState(false);
  const prefilledRecipientAppliedRef = useRef(false);

  const myUsername = user?.username || user?.email?.split('@')[0] || '';
  const myAvatar = getAvatarUrl(user?.profilePic || user?.image, myUsername || user?.id || user?._id || 'me');
  const isPanelOpen = showFloatingButton ? open : true;

  const currentRoom = useMemo(() => {
    if (!isValidRecipient(activeRecipient, myUsername)) return null;
    return buildDirectRoomId(myUsername, activeRecipient);
  }, [activeRecipient, myUsername]);

  const totalUnread = useMemo(
    () => Object.values(unreadByContact).reduce((sum, count) => sum + count, 0),
    [unreadByContact],
  );

  const openRef = useRef(open);
  const activeRecipientRef = useRef(activeRecipient);
  const myUsernameRef = useRef(myUsername);
  const myIdRef = useRef<string | null>(user?.id || user?._id || null);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    if (!showFloatingButton) {
      setOpen(true);
      openRef.current = true;
    }
  }, [showFloatingButton]);

  useEffect(() => {
    activeRecipientRef.current = activeRecipient;
  }, [activeRecipient]);

  useEffect(() => {
    myUsernameRef.current = myUsername;
    myIdRef.current = user?.id || user?._id || null;
  }, [myUsername, user?.id, user?._id]);

  const filteredContacts = useMemo(() => {
    const query = normalizeUsername(recipientInput);
    if (!query) return contacts.slice(0, 6);
    return contacts
      .filter((contact) => normalizeUsername(contact.username).includes(query))
      .slice(0, 6);
  }, [contacts, recipientInput]);

  useEffect(() => {
    const raw = localStorage.getItem(CONTACTS_STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as Contact[];
      if (Array.isArray(parsed)) setContacts(parsed);
    } catch {
      localStorage.removeItem(CONTACTS_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem(UNREAD_STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as Record<string, number>;
      if (parsed && typeof parsed === 'object') {
        setUnreadByContact(parsed);
      }
    } catch {
      localStorage.removeItem(UNREAD_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(UNREAD_STORAGE_KEY, JSON.stringify(unreadByContact));
  }, [unreadByContact]);

  useEffect(() => {
    const socket = io(API_CONFIG.SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    socket.on('chat message', (incoming: P2PMessage) => {
      if (!incoming.room?.startsWith('dm:')) return;

      const currentUser = myUsernameRef.current;
      const normalizedCurrentUser = normalizeUsername(currentUser);
      const senderNormalized = normalizeUsername(incoming.sender || '');
      const peerFromSender = senderNormalized && senderNormalized !== normalizedCurrentUser ? senderNormalized : null;
      const peerFromRoom = getPeerFromRoom(incoming.room, currentUser);
      const peerNormalized = peerFromSender || peerFromRoom;

      if (!peerNormalized) return;

      setContacts((prev) => {
        const alreadyExists = prev.some((contact) => normalizeUsername(contact.username) === peerNormalized);
        if (alreadyExists) return prev;

        const next = [
          { username: incoming.sender || peerNormalized, avatarUrl: getImageUrl(incoming.sender_logo) },
          ...prev,
        ].slice(0, 20);
        localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(next));
        return next;
      });

      const activeNormalized = normalizeUsername(activeRecipientRef.current || '');
      const isOpenCurrentThread =
        openRef.current &&
        !!activeNormalized &&
        activeNormalized === peerNormalized &&
        incoming.room === buildDirectRoomId(currentUser, activeRecipientRef.current);

      if (isOpenCurrentThread) {
        setMessages((prev) => [...prev, incoming]);
        return;
      }

      const isFromMe =
        (!!incoming.senderId && incoming.senderId === myIdRef.current) ||
        senderNormalized === normalizedCurrentUser;

      if (!isFromMe) {
        setUnreadByContact((prev) => ({
          ...prev,
          [peerNormalized]: (prev[peerNormalized] || 0) + 1,
        }));
      }
    });

    socket.on('chat history', (history: P2PMessage[]) => {
      const safeHistory = (history || []).filter((msg) => msg.room?.startsWith('dm:'));
      setMessages(safeHistory);
      setIsLoadingHistory(false);

      setContacts((prev) => {
        const known = new Set(prev.map((contact) => normalizeUsername(contact.username)));
        const next = [...prev];
        let changed = false;

        safeHistory.forEach((msg) => {
          const normalizedSender = normalizeUsername(msg.sender || '');
          if (!normalizedSender || normalizedSender === normalizeUsername(myUsernameRef.current)) return;
          if (known.has(normalizedSender)) return;

          known.add(normalizedSender);
          next.push({ username: msg.sender, avatarUrl: getImageUrl(msg.sender_logo) });
          changed = true;
        });

        if (changed) {
          localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(next));
          return next;
        }

        return prev;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!currentRoom || !open || !socketRef.current) return;
    setIsLoadingHistory(true);
    setMessages([]);
    socketRef.current.emit('join room', currentRoom);
    socketRef.current.emit('get history', currentRoom);
  }, [currentRoom, open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const saveContact = (username: string, avatarUrl?: string) => {
    const normalized = normalizeUsername(username);
    if (!normalized || normalized === normalizeUsername(myUsername)) return;

    setContacts((prev) => {
      if (prev.some((contact) => normalizeUsername(contact.username) === normalized)) return prev;
      const next = [{ username: username.trim(), avatarUrl: getImageUrl(avatarUrl) }, ...prev].slice(0, 20);
      localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const clearUnreadFor = (username: string) => {
    const normalized = normalizeUsername(username);
    if (!normalized) return;
    setUnreadByContact((prev) => {
      if (!prev[normalized]) return prev;
      const next = { ...prev };
      delete next[normalized];
      return next;
    });
  };

  const startDirectChat = (recipient: string) => {
    if (!isValidRecipient(recipient, myUsername)) {
      setError("Enter another user's username for direct chat.");
      return;
    }

    const normalizedRecipient = recipient.trim();
    setActiveRecipient(normalizedRecipient);
    setRecipientInput(normalizedRecipient);
    setError(null);
    saveContact(normalizedRecipient);
    clearUnreadFor(normalizedRecipient);
  };

  useEffect(() => {
    if (!initialRecipient || prefilledRecipientAppliedRef.current) return;
    if (!myUsername) return;

    if (isValidRecipient(initialRecipient, myUsername)) {
      prefilledRecipientAppliedRef.current = true;
      startDirectChat(initialRecipient);
    }
  }, [initialRecipient, myUsername]);

  const sendDirectMessage = () => {
    const trimmed = messageInput.trim();
    if (!trimmed || !socketRef.current || !currentRoom) return;

    const sender = myUsername || 'Anonymous';
    const senderId = user?.id || user?._id || null;

    socketRef.current.emit('chat message', {
      room: currentRoom,
      message: trimmed,
      sender,
      senderId,
      sender_logo: myAvatar,
    });

    setMessageInput('');
    setError(null);
  };

  const onRecipientSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    startDirectChat(recipientInput);
  };

  const onMessageSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    sendDirectMessage();
  };

  return (
    <>
      {showFloatingButton && (
        <button
          onClick={() => setOpen((prev) => !prev)}
          className={cn(
            'fixed bottom-6 left-6 z-50 h-14 w-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300',
            'bg-gradient-to-br from-[#0EA5E9] to-[#0284C7] hover:scale-110 active:scale-95',
          )}
          aria-label="Toggle direct chat"
        >
          {open ? <X className="h-6 w-6 text-white" /> : <MessageSquare className="h-6 w-6 text-white" />}
          {!open && totalUnread > 0 && (
            <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {totalUnread > 99 ? '99+' : totalUnread}
            </span>
          )}
        </button>
      )}

      <div
        className={cn(
          showFloatingButton
            ? 'fixed bottom-24 left-6 z-50 w-80 md:w-96'
            : 'relative w-full',
          'rounded-2xl shadow-2xl flex flex-col overflow-hidden',
          'bg-[#13111C] border border-[#2d2640] transition-all duration-300 origin-bottom-left',
          isPanelOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-90 pointer-events-none',
        )}
        style={showFloatingButton ? { maxHeight: '70vh', minHeight: '420px' } : { minHeight: '420px' }}
      >
        <div className="flex items-center justify-between px-4 py-3 bg-[#1a1628] border-b border-[#2d2640] shrink-0">
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="h-4 w-4 text-green-400" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-400 animate-pulse" />
            )}
            <span className="text-white font-semibold text-sm">Direct Chat</span>
          </div>
          {activeRecipient && (
            <span className="text-xs text-[#7dd3fc] truncate max-w-[140px]">
              @{activeRecipient}
            </span>
          )}
        </div>

        {!isAuthenticated ? (
          <div className="flex-1 flex items-center justify-center text-center px-6">
            <p className="text-sm text-gray-400">Sign in to start one-to-one chats.</p>
          </div>
        ) : (
          <>
            <form onSubmit={onRecipientSubmit} className="px-3 py-3 border-b border-[#2d2640] bg-[#171425]">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    value={recipientInput}
                    onChange={(event) => setRecipientInput(event.target.value)}
                    onFocus={() => setRecipientFocused(true)}
                    onBlur={() => setTimeout(() => setRecipientFocused(false), 120)}
                    placeholder="Recipient username"
                    className="w-full bg-[#2d2640] text-white placeholder-gray-500 text-sm rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                  />
                  {recipientFocused && filteredContacts.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#171425] border border-[#2d2640] rounded-xl shadow-xl overflow-hidden z-20">
                      {filteredContacts.map((contact) => (
                        <button
                          key={contact.username}
                          type="button"
                          onClick={() => startDirectChat(contact.username)}
                          className="w-full px-3 py-2 text-left text-sm transition-colors flex items-center gap-2 text-gray-300 hover:bg-[#2d2640]"
                        >
                          <div className="h-6 w-6 rounded-full overflow-hidden border border-[#3b3252] bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                            <img
                              src={getAvatarUrl(contact.avatarUrl, contact.username)}
                              alt={contact.username}
                              className="h-full w-full object-cover"
                              onError={(event) => {
                                event.currentTarget.src = getCharacterAvatar(contact.username);
                              }}
                            />
                          </div>
                          <span className="flex-1 truncate">@{contact.username}</span>
                          {unreadByContact[normalizeUsername(contact.username)] > 0 && (
                            <span className="h-5 min-w-5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                              {unreadByContact[normalizeUsername(contact.username)] > 99
                                ? '99+'
                                : unreadByContact[normalizeUsername(contact.username)]}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  className="h-9 px-3 rounded-xl bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-xs font-medium"
                >
                  Start
                </button>
              </div>
              {error && <p className="mt-1 text-[11px] text-amber-400">{error}</p>}
            </form>

            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 scrollbar-thin scrollbar-thumb-[#2d2640]">
              {!activeRecipient ? (
                <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                  Choose a recipient to start a private chat.
                </div>
              ) : isLoadingHistory ? (
                <div className="h-full flex items-center justify-center text-gray-500 text-sm">Loading chat…</div>
              ) : messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-500 text-sm">No messages yet.</div>
              ) : (
                messages.map((message, index) => {
                  const isMine = (user?.id || user?._id) && message.senderId === (user?.id || user?._id);
                  const avatarSrc = isMine
                    ? myAvatar
                    : getAvatarUrl(message.sender_logo, message.sender || message.senderId || index);

                  return (
                    <div
                      key={message._id ?? `${message.createdAt}-${index}`}
                      className={cn('flex gap-2', isMine ? 'flex-row-reverse' : 'flex-row')}
                    >
                      <div className="h-7 w-7 rounded-full overflow-hidden border border-[#3b3252] bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] flex items-center justify-center text-white text-xs font-bold shrink-0">
                        <img
                          src={avatarSrc}
                          alt={message.sender}
                          className="h-full w-full object-cover"
                          onError={(event) => {
                            event.currentTarget.src = getCharacterAvatar(message.sender || message.senderId || index);
                          }}
                        />
                      </div>

                      <div className={cn('max-w-[75%] flex flex-col gap-0.5', isMine ? 'items-end' : 'items-start')}>
                        {!isMine && <span className="text-[10px] text-gray-400 px-1">{message.sender}</span>}
                        <div
                          className={cn(
                            'rounded-2xl px-3 py-2 text-sm leading-snug break-words',
                            isMine ? 'bg-[#0EA5E9] text-white rounded-tr-sm' : 'bg-[#1f1a2e] text-gray-100 rounded-tl-sm',
                          )}
                        >
                          {message.message}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={onMessageSubmit} className="shrink-0 border-t border-[#2d2640] px-3 py-3 bg-[#1a1628]">
              <div className="flex items-center gap-2">
                <input
                  value={messageInput}
                  onChange={(event) => setMessageInput(event.target.value)}
                  placeholder={activeRecipient ? `Message @${activeRecipient}...` : 'Select recipient first...'}
                  disabled={!activeRecipient}
                  className="flex-1 bg-[#2d2640] text-white placeholder-gray-500 text-sm rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#0EA5E9] transition-all disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim() || !activeRecipient}
                  className={cn(
                    'h-9 w-9 rounded-xl flex items-center justify-center transition-all',
                    messageInput.trim() && activeRecipient
                      ? 'bg-[#0EA5E9] hover:bg-[#0284C7] text-white active:scale-95'
                      : 'bg-[#2d2640] text-gray-600 cursor-not-allowed',
                  )}
                  aria-label="Send direct message"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </>
  );
}

export default P2PChat;
