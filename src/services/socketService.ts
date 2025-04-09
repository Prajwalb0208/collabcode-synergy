
import { io, Socket } from "socket.io-client";
import { toast } from "@/components/ui/use-toast";
import { CodeFile } from "@/pages/Room/types";

class SocketService {
  private socket: Socket | null = null;
  private roomId: string | null = null;
  private userId: string | null = null;
  private isConnected: boolean = false;
  private eventHandlers: Record<string, Function[]> = {};
  private connectedUsers: { userId: string; name: string }[] = [];

  constructor() {
    // Initialize a real socket connection
    try {
      this.socket = io(import.meta.env.VITE_SOCKET_URL || "https://socket-server-dev.lovable.app");
      
      this.socket.on("connect", () => {
        this.isConnected = true;
        this.triggerEvent("connect", {});
        console.log("Connected to socket server");
      });
      
      this.socket.on("disconnect", () => {
        this.isConnected = false;
        this.triggerEvent("disconnect", {});
        console.log("Disconnected from socket server");
      });
      
      this.socket.on("user-joined", (data) => {
        this.connectedUsers.push(data);
        this.triggerEvent("user-joined", data);
      });
      
      this.socket.on("user-left", (data) => {
        this.connectedUsers = this.connectedUsers.filter(u => u.userId !== data.userId);
        this.triggerEvent("user-left", data);
      });
      
      this.socket.on("code-change", (data) => {
        this.triggerEvent("code-change", data);
      });
      
      this.socket.on("cursor-move", (data) => {
        this.triggerEvent("cursor-move", data);
      });
      
      this.socket.on("file-update", (data) => {
        this.triggerEvent("file-update", data);
      });
      
      this.socket.on("file-selected", (data) => {
        this.triggerEvent("file-selected", data);
      });
      
      this.socket.on("folder-update", (data) => {
        this.triggerEvent("folder-update", data);
      });
      
      this.socket.on("access-request", (data) => {
        this.triggerEvent("access-request", data);
      });
      
      this.socket.on("access-response", (data) => {
        this.triggerEvent("access-response", data);
      });
    } catch (error) {
      console.error("Socket initialization error:", error);
      this.fallbackToMockBehavior();
    }
  }

  private fallbackToMockBehavior() {
    console.warn("Falling back to mock socket behavior");
    this.eventHandlers = {
      "code-change": [],
      "cursor-move": [],
      "user-joined": [],
      "user-left": [],
      "file-update": [],
      "file-selected": [],
      "folder-update": [],
      "access-request": [],
      "access-response": [],
      "connect": [],
      "disconnect": [],
      "error": []
    };
    
    // Simulate connection
    setTimeout(() => {
      this.isConnected = true;
      this.triggerEvent("connect", {});
    }, 1000);
  }

  // Connect to a specific room
  connect(roomId: string, userId: string) {
    this.roomId = roomId;
    this.userId = userId;
    
    if (this.socket && this.isConnected) {
      this.socket.emit("join-room", { roomId, userId });
      
      toast({
        title: "Connected to session",
        description: `You've joined collaboration room ${roomId}`,
      });
    }
    
    return this;
  }
  
  // Disconnect from the current room
  disconnect() {
    if (this.socket && this.isConnected && this.roomId && this.userId) {
      this.socket.emit("leave-room", { roomId: this.roomId, userId: this.userId });
    }
    
    this.roomId = null;
    this.userId = null;
    
    toast({
      title: "Disconnected from session",
      description: "You've left the collaboration room",
    });
    
    return this;
  }

  // Generic emit method for any event
  emit(event: string, data: any) {
    if (!this.isConnected || !this.roomId) return;
    
    if (this.socket) {
      this.socket.emit(event, { ...data, roomId: this.roomId });
    } else {
      // Mock implementation for testing
      setTimeout(() => {
        this.triggerEvent(event, data);
      }, 100);
    }
  }

  // Emit code changes to other users
  emitCodeChange(code: string, file: string, language: string) {
    if (!this.isConnected || !this.roomId) return;
    
    if (this.socket) {
      this.socket.emit("code-change", { 
        code, 
        file, 
        language, 
        roomId: this.roomId, 
        timestamp: new Date().toISOString() 
      });
    } else {
      // Mock implementation
      setTimeout(() => {
        this.triggerEvent("code-change", { code, file, language });
      }, 100);
    }
  }

  // Emit cursor position to other users
  emitCursorPosition(x: number, y: number) {
    if (!this.isConnected || !this.roomId || !this.userId) return;
    
    if (this.socket) {
      this.socket.emit("cursor-move", { 
        x, 
        y, 
        userId: this.userId, 
        roomId: this.roomId 
      });
    }
  }

  // Request access to a room
  requestAccess(userId: string, userName: string) {
    if (!this.isConnected || !this.roomId) return;
    
    if (this.socket) {
      this.socket.emit("access-request", { 
        userId, 
        userName,
        roomId: this.roomId 
      });
    }
  }

  // Respond to access request
  respondToAccessRequest(requesterId: string, approved: boolean) {
    if (!this.isConnected || !this.roomId || !this.userId) return;
    
    if (this.socket) {
      this.socket.emit("access-response", { 
        requesterId, 
        approved, 
        roomId: this.roomId,
        responderId: this.userId
      });
    }
  }

  // Register event handlers
  on(event: string, callback: Function) {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }
    this.eventHandlers[event].push(callback);
    return this;
  }

  // Helper function to trigger events for the mock implementation
  private triggerEvent(event: string, data: any) {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event].forEach(callback => callback(data));
    }
  }
  
  // Get connected users
  getConnectedUsers() {
    return this.connectedUsers;
  }
  
  // Check if connected to a room
  isConnectedToRoom() {
    return this.isConnected && this.roomId !== null;
  }
  
  // Get current room ID
  getCurrentRoomId() {
    return this.roomId;
  }
}

// Export a singleton instance
export const socketService = new SocketService();
