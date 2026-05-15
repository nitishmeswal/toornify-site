import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { io, type Socket } from 'socket.io-client';
import { API_CONFIG } from '@/lib/api-config';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  _id?: string;
  room: string;
  message: string;
  sender: string;
  senderId?: string | null;
  sender_logo?: string;
  senderAvatar?: string;
  profilePic?: string;
  image?: string;
  createdAt?: string;
}

interface SocketContextType {
  /** Whether the socket is currently connected */
  isConnected: boolean;
  /** Join a chat room and load its history */
  joinRoom: (room: string) => void;
  /** Leave the current room */
  leaveRoom: () => void;
  /** The room the socket is currently in */
  currentRoom: string | null;
  /** Messages in the current room */
  messages: ChatMessage[];
  /** Send a message to the current room */
  sendMessage: (message: string, sender: string, senderId?: string | null, senderLogo?: string) => void;
  /** Whether the history is being loaded */
  loadingHistory: boolean;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const SocketContext = createContext<SocketContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function SocketProvider({ children }: { children: ReactNode }) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Initialise socket once on mount
  useEffect(() => {
    const socket = io(API_CONFIG.SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Incoming chat message for current room
    socket.on('chat message', (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    });

    // Full history when (re-)joining a room
    socket.on('chat history', (history: ChatMessage[]) => {
      setMessages(history);
      setLoadingHistory(false);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const joinRoom = useCallback((room: string) => {
    if (!socketRef.current) return;
    setMessages([]);
    setLoadingHistory(true);
    setCurrentRoom(room);
    socketRef.current.emit('join room', room);
    socketRef.current.emit('get history', room);
  }, []);

  const leaveRoom = useCallback(() => {
    setCurrentRoom(null);
    setMessages([]);
  }, []);

  const sendMessage = useCallback(
    (message: string, sender: string, senderId?: string | null, senderLogo?: string) => {
      if (!socketRef.current || !currentRoom) return;
      socketRef.current.emit('chat message', {
        room: currentRoom,
        message,
        sender,
        senderId: senderId ?? null,
        sender_logo: senderLogo ?? null,
      });
    },
    [currentRoom],
  );

  return (
    <SocketContext.Provider
      value={{
        isConnected,
        joinRoom,
        leaveRoom,
        currentRoom,
        messages,
        sendMessage,
        loadingHistory,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSocket(): SocketContextType {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used inside <SocketProvider>');
  return ctx;
}

export default SocketContext;
