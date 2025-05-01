
import io, { Socket } from "socket.io-client";

// Socket service for real-time communication
class SocketService {
  private socket: Socket | null = null;
  private roomId: string | null = null;
  private userId: string | null = null;
  private isScreenSharing: boolean = false;

  // Connect to the socket server with room and user info
  connect(roomId: string, userId: string, userName?: string, userAvatar?: string) {
    if (this.socket) {
      this.disconnect();
    }

    // Get backend URL from environment or use fallback
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
    
    this.socket = io(backendUrl, {
      query: {
        roomId,
        userId,
        userName,
        userAvatar
      },
      transports: ["websocket"],
      autoConnect: true
    });

    this.roomId = roomId;
    this.userId = userId;

    this.socket.on("connect", () => {
      console.log("Socket connected");
      // Join the room
      this.socket.emit("join-room", { roomId, userId, userName, userAvatar });
      // Announce user joined
      this.emit("user-joined", { roomId, userId, userName, userAvatar });
    });

    this.socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    this.socket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    return this.socket;
  }

  // Disconnect from the socket server
  disconnect() {
    if (this.socket) {
      // Announce user left
      if (this.roomId && this.userId) {
        this.emit("user-left", { roomId: this.roomId, userId: this.userId });
      }
      
      this.socket.disconnect();
      this.socket = null;
      this.roomId = null;
      this.userId = null;
      this.isScreenSharing = false;
    }
  }

  // Send a message through the socket
  emit(eventName: string, data: any) {
    if (this.socket) {
      this.socket.emit(eventName, data);
    } else {
      console.warn("Socket not connected, unable to emit event:", eventName);
    }
  }

  // Listen for socket events
  on(eventName: string, callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on(eventName, callback);
    } else {
      console.warn("Socket not connected, unable to listen for event:", eventName);
    }
  }

  // Remove event listener
  off(eventName: string, callback?: (data: any) => void) {
    if (this.socket) {
      this.socket.off(eventName, callback);
    }
  }

  // Send cursor position update to other users
  emitCursorPosition(line: number, column: number, fileName: string, userName?: string) {
    if (!this.roomId || !this.userId) {
      console.warn("Room ID or User ID not set, unable to emit cursor position");
      return;
    }
    
    this.emit("cursor-position", {
      roomId: this.roomId,
      userId: this.userId,
      userName,
      line,
      column,
      fileName,
      timestamp: new Date()
    });
  }

  // Send mouse position for live cursor
  emitMousePosition(x: number, y: number, userName?: string) {
    if (!this.roomId || !this.userId) {
      console.warn("Room ID or User ID not set, unable to emit mouse position");
      return;
    }
    
    this.emit("mouse-position", {
      roomId: this.roomId,
      userId: this.userId,
      userName: userName || this.userId,
      x,
      y,
      timestamp: new Date()
    });
  }

  // Send code changes to other users
  emitCodeChange(code: string, fileName: string, language: string) {
    if (!this.roomId || !this.userId) {
      console.warn("Room ID or User ID not set, unable to emit code change");
      return;
    }
    
    this.emit("code-change", {
      roomId: this.roomId,
      userId: this.userId,
      code,
      fileName,
      language,
      timestamp: new Date()
    });
  }

  // Send chat message
  sendChatMessage(text: string, userName?: string) {
    if (!this.roomId || !this.userId) {
      console.warn("Room ID or User ID not set, unable to send chat message");
      return;
    }
    
    this.emit("chat-message", {
      roomId: this.roomId,
      userId: this.userId,
      userName,
      text,
      timestamp: new Date()
    });
  }

  // Start screen sharing
  startScreenShare() {
    if (!this.roomId || !this.userId) {
      console.warn("Room ID or User ID not set, unable to start screen share");
      return;
    }
    
    this.isScreenSharing = true;
    this.emit("screen-share-start", {
      roomId: this.roomId,
      userId: this.userId,
      timestamp: new Date()
    });
  }
  
  // Stop screen sharing
  stopScreenShare() {
    if (!this.roomId || !this.userId) {
      console.warn("Room ID or User ID not set, unable to stop screen share");
      return;
    }
    
    this.isScreenSharing = false;
    this.emit("screen-share-stop", {
      roomId: this.roomId,
      userId: this.userId,
      timestamp: new Date()
    });
  }
  
  // Check if user is currently screen sharing
  isUserScreenSharing() {
    return this.isScreenSharing;
  }

  // Request access to a room
  requestAccess(userId: string, userName?: string, userAvatar?: string) {
    if (!this.roomId) {
      console.warn("Room ID not set, unable to request access");
      return;
    }
    
    this.emit("access-request", {
      roomId: this.roomId,
      userId,
      userName,
      userAvatar,
      timestamp: new Date()
    });
  }

  // Respond to an access request
  respondToAccessRequest(userId: string, approved: boolean) {
    if (!this.roomId) {
      console.warn("Room ID not set, unable to respond to access request");
      return;
    }
    
    this.emit("access-response", {
      roomId: this.roomId,
      userId,
      approved,
      timestamp: new Date()
    });
  }

  // Check if socket is connected
  isConnected() {
    return this.socket && this.socket.connected;
  }

  // Get current room ID
  getCurrentRoomId() {
    return this.roomId;
  }

  // Get current user ID
  getCurrentUserId() {
    return this.userId;
  }
}

// Create a singleton instance
export const socketService = new SocketService();
