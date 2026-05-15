import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { MessageCircle, X, Send, Wifi, WifiOff, Hash, ChevronDown } from 'lucide-react';
import { useSocket } from '@/context/SocketContext';
import { useAuth } from '@/context/AuthContext';
import { getAvatarUrl, getCharacterAvatar, getImageUrl } from '@/lib/utils';
import { cn } from '@/utils/cn';

// ─── Predefined rooms ─────────────────────────────────────────────────────────

const ROOMS = [
  { id: 'general', label: 'General' },
  { id: 'tournaments', label: 'Tournaments' },
  { id: 'teams', label: 'Teams' },
  { id: 'off-topic', label: 'Off-Topic' },
];

interface MentionContext {
  query: string;
  start: number;
  end: number;
}

interface MentionSuggestion {
  name: string;
  avatarUrl?: string;
}

const findMentionContext = (text: string, cursorPosition: number): MentionContext | null => {
  const uptoCursor = text.slice(0, cursorPosition);
  const match = uptoCursor.match(/(?:^|\s)@([a-zA-Z0-9._-]*)$/);
  if (!match) return null;

  const atIndex = uptoCursor.lastIndexOf('@');
  if (atIndex === -1) return null;

  return {
    query: match[1] ?? '',
    start: atIndex,
    end: cursorPosition,
  };
};

const isUserMentioned = (message: string, username?: string): boolean => {
  if (!username) return false;
  const normalizedUsername = username.toLowerCase();

  const regex = /@([a-zA-Z0-9._-]+)/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(message)) !== null) {
    if ((match[1] ?? '').toLowerCase() === normalizedUsername) {
      return true;
    }
  }

  return false;
};

const renderMessageWithMentions = (text: string, currentUsername?: string): ReactNode => {
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let mentionIndex = 0;

  const regex = /@([a-zA-Z0-9._-]+)/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const start = match.index;
    const end = regex.lastIndex;
    const mentionText = match[0];
    const mentionedUser = (match[1] ?? '').toLowerCase();
    const isSelfMention = !!currentUsername && mentionedUser === currentUsername.toLowerCase();

    if (start > lastIndex) {
      parts.push(text.slice(lastIndex, start));
    }

    parts.push(
      <span
        key={`mention-${mentionIndex}`}
        className={cn(
          'font-medium',
          isSelfMention ? 'text-amber-300 bg-amber-500/20 px-1 rounded' : 'text-[#c4b5fd]',
        )}
      >
        {mentionText}
      </span>,
    );

    lastIndex = end;
    mentionIndex += 1;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
};

const getMessageAvatarUrl = (message: import('@/context/SocketContext').ChatMessage): string | undefined => {
  return getImageUrl(message.sender_logo || message.senderAvatar || message.profilePic || message.image);
};

// ─── Single message bubble ─────────────────────────────────────────────────────

function MessageBubble({
  message,
  isOwn,
  currentUsername,
  avatarUrl,
}: {
  message: import('@/context/SocketContext').ChatMessage;
  isOwn: boolean;
  currentUsername?: string;
  avatarUrl?: string;
}) {
  const time = message.createdAt
    ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';
  const isMentioned = !isOwn && isUserMentioned(message.message, currentUsername);

  return (
    <div className={cn('flex gap-2 mb-3', isOwn ? 'flex-row-reverse' : 'flex-row')}>
      {/* Avatar */}
      <div className="h-7 w-7 rounded-full overflow-hidden border border-[#3b3252] bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] flex items-center justify-center text-white text-xs font-bold shrink-0">
        <img
          src={getAvatarUrl(avatarUrl, message.sender || message.senderId || message._id || 'user')}
          alt={message.sender || 'User avatar'}
          className="h-full w-full object-cover"
          onError={(event) => {
            event.currentTarget.src = getCharacterAvatar(message.sender || message.senderId || message._id || 'user');
          }}
        />
      </div>

      {/* Bubble */}
      <div className={cn('max-w-[75%] flex flex-col gap-0.5', isOwn ? 'items-end' : 'items-start')}>
        {!isOwn && (
          <span className="text-[10px] text-gray-400 px-1">{message.sender}</span>
        )}
        <div
          className={cn(
            'rounded-2xl px-3 py-2 text-sm leading-snug break-words',
            isOwn
              ? 'bg-[#7C3AED] text-white rounded-tr-sm'
              : 'bg-[#1f1a2e] text-gray-100 rounded-tl-sm',
            isMentioned && 'ring-1 ring-amber-400/70',
          )}
        >
          {renderMessageWithMentions(message.message, currentUsername)}
        </div>
        {time && (
          <span className="text-[9px] text-gray-500 px-1">{time}</span>
        )}
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export function GlobalChat() {
  const { isConnected, joinRoom, currentRoom, messages, sendMessage, loadingHistory } = useSocket();
  const { user } = useAuth();

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [roomPickerOpen, setRoomPickerOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [mentionUnread, setMentionUnread] = useState(0);
  const [caretPosition, setCaretPosition] = useState(0);
  const [activeMentionIndex, setActiveMentionIndex] = useState(0);
  const [mentionError, setMentionError] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevMsgCount = useRef(0);
  const myId = user?.id || user?._id;
  const currentUsername = user?.username || user?.email?.split('@')[0] || undefined;
  const myAvatarUrl = getImageUrl(user?.profilePic || user?.image);

  const participantSuggestions = useMemo(() => {
    const seen = new Set<string>();
    const entries: MentionSuggestion[] = [];

    const addName = (value?: string, avatarUrl?: string) => {
      if (!value?.trim()) return;
      const normalized = value.trim().toLowerCase();
      if (seen.has(normalized)) return;
      seen.add(normalized);
      entries.push({
        name: value.trim(),
        avatarUrl: getImageUrl(avatarUrl),
      });
    };

    messages.forEach((message) => {
      addName(message.sender, message.sender_logo || message.senderAvatar || message.profilePic || message.image);
    });
    addName(currentUsername, myAvatarUrl);

    return entries;
  }, [messages, currentUsername, myAvatarUrl]);

  const mentionContext = useMemo(
    () => findMentionContext(input, caretPosition),
    [input, caretPosition],
  );

  const mentionSuggestions = useMemo(() => {
    if (!mentionContext) return [];

    const query = mentionContext.query.toLowerCase();
    return participantSuggestions
      .filter((participant) => participant.name.toLowerCase() !== (currentUsername ?? '').toLowerCase())
      .filter((participant) => participant.name.toLowerCase().startsWith(query))
      .slice(0, 6);
  }, [mentionContext, participantSuggestions, currentUsername]);

  const hasMentionSuggestions = !!mentionContext && mentionSuggestions.length > 0;

  useEffect(() => {
    setActiveMentionIndex(0);
  }, [mentionContext?.query, currentRoom]);

  // Auto-join general on first open
  useEffect(() => {
    if (open && !currentRoom) {
      joinRoom('general');
    }
  }, [open, currentRoom, joinRoom]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      setUnread(0);
      setMentionUnread(0);
    } else {
      const newMessages = messages.slice(prevMsgCount.current);
      if (newMessages.length > 0) {
        setUnread((value) => value + newMessages.length);

        const mentionsForMe = newMessages.filter(
          (message) =>
            message.senderId !== myId &&
            isUserMentioned(message.message, currentUsername),
        ).length;

        if (mentionsForMe > 0) {
          setMentionUnread((value) => value + mentionsForMe);
        }
      }
    }

    prevMsgCount.current = messages.length;
  }, [messages, open, myId, currentUsername]);

  // Focus input when opening
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setUnread(0);
      setMentionUnread(0);
    }
  }, [open]);

  const applyMention = (username: string) => {
    if (!mentionContext) return;

    const beforeMention = input.slice(0, mentionContext.start);
    const afterMention = input.slice(mentionContext.end);
    const nextValue = `${beforeMention}@${username} ${afterMention}`;
    const nextCursor = `${beforeMention}@${username} `.length;

    setInput(nextValue);
    setCaretPosition(nextCursor);
    setMentionError(null);

    requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(nextCursor, nextCursor);
    });
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    setInput(nextValue);
    setCaretPosition(event.target.selectionStart ?? event.target.value.length);

    if (mentionError && !isUserMentioned(nextValue, currentUsername)) {
      setMentionError(null);
    }
  };

  const syncCaret = () => {
    if (!inputRef.current) return;
    setCaretPosition(inputRef.current.selectionStart ?? input.length);
  };

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || !currentRoom) return;

    if (isUserMentioned(trimmed, currentUsername)) {
      setMentionError("You can't mention yourself.");
      return;
    }

    const sender = user?.username || user?.email?.split('@')[0] || 'Anonymous';
    const senderId = user?.id || user?._id || null;
    const senderLogo = getImageUrl(user?.profilePic || user?.image);

    sendMessage(trimmed, sender, senderId, senderLogo);
    setInput('');
    setCaretPosition(0);
    setMentionError(null);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (hasMentionSuggestions) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveMentionIndex((index) => (index + 1) % mentionSuggestions.length);
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveMentionIndex((index) => (index - 1 + mentionSuggestions.length) % mentionSuggestions.length);
        return;
      }

      if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
        applyMention(mentionSuggestions[activeMentionIndex].name);
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        setCaretPosition(input.length);
        return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const currentRoomLabel = ROOMS.find((r) => r.id === currentRoom)?.label ?? currentRoom ?? 'General';

  return (
    <>
      {/* ── Floating toggle button ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300',
          'bg-gradient-to-br from-[#7C3AED] to-[#5B21B6] hover:scale-110 active:scale-95',
          mentionUnread > 0 && !open && 'ring-2 ring-amber-400 ring-offset-2 ring-offset-[#0f0b18]',
        )}
        aria-label="Toggle chat"
      >
        {open ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <>
            <MessageCircle className="h-6 w-6 text-white" />
            {unread > 0 && (
              <span className={cn(
                'absolute -top-1 -right-1 h-5 min-w-5 px-1 text-white text-[10px] font-bold rounded-full flex items-center justify-center',
                mentionUnread > 0 ? 'bg-amber-500' : 'bg-red-500',
              )}>
                {mentionUnread > 0 ? `@${mentionUnread > 9 ? '9+' : mentionUnread}` : (unread > 99 ? '99+' : unread)}
              </span>
            )}
          </>
        )}
      </button>

      {/* ── Chat panel ── */}
      <div
        className={cn(
          'fixed bottom-24 right-6 z-50 w-80 md:w-96 rounded-2xl shadow-2xl flex flex-col overflow-hidden',
          'bg-[#13111C] border border-[#2d2640]',
          'transition-all duration-300 origin-bottom-right',
          open ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-90 pointer-events-none',
        )}
        style={{ maxHeight: '70vh', minHeight: '420px' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#1a1628] border-b border-[#2d2640] shrink-0">
          <div className="flex items-center gap-2">
            {/* Connection indicator */}
            {isConnected ? (
              <Wifi className="h-4 w-4 text-green-400" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-400 animate-pulse" />
            )}
            <span className="text-white font-semibold text-sm">Global Chat</span>
          </div>

          {/* Room picker */}
          <div className="relative">
            <button
              onClick={() => setRoomPickerOpen((v) => !v)}
              className="flex items-center gap-1 bg-[#2d2640] hover:bg-[#3d3550] text-gray-300 text-xs px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <Hash className="h-3 w-3" />
              {currentRoomLabel}
              <ChevronDown className="h-3 w-3" />
            </button>

            {roomPickerOpen && (
              <div className="absolute right-0 top-full mt-1 bg-[#1a1628] border border-[#2d2640] rounded-xl shadow-xl overflow-hidden z-10 min-w-[130px]">
                {ROOMS.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      joinRoom(r.id);
                      setRoomPickerOpen(false);
                    }}
                    className={cn(
                      'w-full text-left px-3 py-2 text-xs flex items-center gap-1.5 transition-colors',
                      currentRoom === r.id
                        ? 'bg-[#7C3AED] text-white'
                        : 'text-gray-300 hover:bg-[#2d2640]',
                    )}
                  >
                    <Hash className="h-3 w-3 shrink-0" />
                    {r.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-0 scrollbar-thin scrollbar-thumb-[#2d2640]">
          {loadingHistory ? (
            <div className="flex items-center justify-center h-full text-gray-500 text-sm">
              Loading history…
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 text-sm gap-2 mt-8">
              <MessageCircle className="h-8 w-8 opacity-30" />
              <span>No messages yet. Say hi!</span>
            </div>
          ) : (
            messages.map((msg, i) => {
              const resolvedAvatarUrl = msg.senderId === myId ? myAvatarUrl : getMessageAvatarUrl(msg);
              return (
                <MessageBubble
                  key={msg._id ?? `${i}-${msg.createdAt}`}
                  message={msg}
                  isOwn={!!myId && msg.senderId === myId}
                  currentUsername={currentUsername}
                  avatarUrl={resolvedAvatarUrl}
                />
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="shrink-0 border-t border-[#2d2640] px-3 py-3 bg-[#1a1628]">
          {!user && (
            <p className="text-center text-xs text-gray-500 mb-2">
              You're chatting as <span className="text-[#a78bfa]">Anonymous</span>
            </p>
          )}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              {hasMentionSuggestions && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#171425] border border-[#2d2640] rounded-xl shadow-xl overflow-hidden z-20">
                  {mentionSuggestions.map((participant, index) => (
                    <button
                      key={participant.name}
                      type="button"
                      onMouseDown={(event) => {
                        event.preventDefault();
                        applyMention(participant.name);
                      }}
                      className={cn(
                        'w-full px-3 py-2 text-left text-sm transition-colors flex items-center gap-2',
                        index === activeMentionIndex
                          ? 'bg-[#7C3AED] text-white'
                          : 'text-gray-300 hover:bg-[#2d2640]',
                      )}
                    >
                      <div className="h-6 w-6 rounded-full overflow-hidden border border-[#3b3252] bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                        <img
                          src={getAvatarUrl(participant.avatarUrl, participant.name || 'participant')}
                          alt={participant.name}
                          className="h-full w-full object-cover"
                          onError={(event) => {
                            event.currentTarget.src = getCharacterAvatar(participant.name || 'participant');
                          }}
                        />
                      </div>
                      <span className="text-[#c4b5fd] font-medium">@{participant.name}</span>
                    </button>
                  ))}
                </div>
              )}
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onClick={syncCaret}
                onKeyUp={syncCaret}
                onSelect={syncCaret}
                placeholder={`Message #${currentRoomLabel.toLowerCase()}…`}
                maxLength={500}
                className="w-full bg-[#2d2640] text-white placeholder-gray-500 text-sm rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#7C3AED] transition-all"
              />
              {mentionError && (
                <p className="mt-1 text-[11px] text-amber-400">{mentionError}</p>
              )}
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || !currentRoom}
              className={cn(
                'h-9 w-9 rounded-xl flex items-center justify-center transition-all',
                input.trim() && currentRoom
                  ? 'bg-[#7C3AED] hover:bg-[#6D28D9] text-white active:scale-95'
                  : 'bg-[#2d2640] text-gray-600 cursor-not-allowed',
              )}
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default GlobalChat;
