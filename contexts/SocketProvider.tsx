import { createContext, useContext, useEffect, useState, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { io } from "socket.io-client";

import { endPoints } from "../services/ENV";

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return {
    ...context,
    socketId: context.socket?.id || null,
  };
};

const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);
  const [token, setToken] = useState(null);

  const initializeSocket = (authToken) => {
    if (!authToken) return;

    const newSocket = io(endPoints.SOCKET_BASE_URL, {
      auth: { token: authToken },
      transports: ["websocket"],
      reconnectionAttempts: 15,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5,
      timeout: 20000,
    });

    // Connection events
    newSocket.on("connect", () => {
      console.log("Socket connected successfully");
      setIsConnected(true);
      setSocket(newSocket);

      if (newSocket.id) {
        AsyncStorage.setItem("socketId", newSocket.id);
        console.log("SocketId saved:", newSocket.id);
      }
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
      setSocket(null);
      AsyncStorage.removeItem("socketId");
    });

    // Error handling
    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setIsConnected(false);
    });

    newSocket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    // Reconnection events
    newSocket.on("reconnect", (attemptNumber) => {
      console.log("Reconnected after", attemptNumber, "attempts");
      setIsConnected(true);
    });

    newSocket.on("reconnect_error", (error) => {
      console.error("Reconnection error:", error);
    });

    socketRef.current = newSocket;
  };

  useEffect(() => {
    const fetchTokenAndConnect = async () => {
      try {
        console.log("connect");
        const storedToken = await AsyncStorage.getItem("token");
        if (storedToken) {
          setToken(storedToken);
          initializeSocket(storedToken);
        } else {
          console.log("No token found in AsyncStorage");
        }
      } catch (err) {
        console.error("Failed to get token from AsyncStorage:", err);
      }
    };

    fetchTokenAndConnect();

    // Clean up on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      setSocket(null);
      setIsConnected(false);
    };
  }, []);

  const socketValue = {
    socket,
    isConnected,
    socketId: socket?.id || null,
  };

  return (
    <SocketContext.Provider value={socketValue}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
