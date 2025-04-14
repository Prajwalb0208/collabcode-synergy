
import React, { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  ScreenShare, 
  MessageCircle, 
  Copy, 
  Share2 
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { socketService } from "@/services/socketService";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

interface VideoCallProps {
  onChatToggle?: () => void;
  isChatOpen?: boolean;
  roomId?: string;
}

interface RemoteUser {
  id: string;
  name: string;
  avatar?: string;
  color: string;
  cameraOn: boolean;
  micOn: boolean;
  screenSharing?: boolean;
}

const VideoCall: React.FC<VideoCallProps> = ({ onChatToggle, isChatOpen, roomId }) => {
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<RemoteUser[]>([]);
  const { user } = useAuth();
  const [permissionError, setPermissionError] = useState<string | null>(null);
  
  // Initialize video call setup
  useEffect(() => {
    if (!roomId || !user) return;
    
    // Listen for user events
    socketService.on("user-joined", (data) => {
      setRemoteUsers(prev => {
        if (prev.some(u => u.id === data.userId)) {
          return prev;
        }
        return [...prev, {
          id: data.userId,
          name: data.userName || `User-${data.userId.slice(0, 4)}`,
          avatar: data.userAvatar,
          color: getRandomColor(),
          cameraOn: false,
          micOn: false,
          screenSharing: false
        }];
      });
      
      // Notify about new user
      toast({
        title: "User joined",
        description: `${data.userName || 'A new user'} joined the room`,
        duration: 3000
      });
    });
    
    socketService.on("user-left", (data) => {
      setRemoteUsers(prev => prev.filter(u => u.id !== data.userId));
      
      // Notify about user leaving
      toast({
        title: "User left",
        description: `${data.userName || 'A user'} left the room`,
        duration: 3000
      });
    });
    
    socketService.on("media-state-change", (data) => {
      setRemoteUsers(prev => 
        prev.map(u => 
          u.id === data.userId 
            ? { 
                ...u, 
                cameraOn: data.cameraOn, 
                micOn: data.micOn,
                screenSharing: data.screenSharing || false
              } 
            : u
        )
      );
    });
    
    return () => {
      socketService.off("user-joined");
      socketService.off("user-left");
      socketService.off("media-state-change");
      stopAllMedia();
    };
  }, [roomId, user]);
  
  // Clean up all media on unmount
  useEffect(() => {
    return () => {
      stopAllMedia();
    };
  }, []);
  
  const getRandomColor = () => {
    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const stopAllMedia = () => {
    stopWebcam();
  };
  
  const startWebcam = async () => {
    try {
      setPermissionError(null);
      // Request camera permission only when button is clicked
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: isMicOn 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      setStream(mediaStream);
      setIsCameraOn(true);
      
      // Notify other users
      if (roomId) {
        socketService.emit("media-state-change", { 
          roomId, 
          userId: user?.id, 
          userName: user?.name,
          cameraOn: true, 
          micOn: isMicOn,
          screenSharing: isScreenSharing
        });
      }
      
      toast({
        title: "Camera turned on",
        duration: 1500
      });
    } catch (error) {
      console.error("Error accessing webcam:", error);
      setIsCameraOn(false);
      setPermissionError("Camera access denied. Please check your browser permissions and try again.");
      
      toast({
        title: "Camera access denied",
        description: "Please check your browser permissions",
        variant: "destructive",
        duration: 3000
      });
    }
  };
  
  const stopWebcam = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    // Notify other users
    if (roomId && isCameraOn) {
      socketService.emit("media-state-change", { 
        roomId, 
        userId: user?.id, 
        userName: user?.name,
        cameraOn: false, 
        micOn: isMicOn,
        screenSharing: isScreenSharing
      });
    }
  };

  const toggleCamera = async () => {
    if (isCameraOn) {
      stopWebcam();
      setIsCameraOn(false);
      toast({
        title: "Camera turned off",
        duration: 1500
      });
    } else {
      await startWebcam();
    }
  };

  const toggleMic = async () => {
    try {
      setPermissionError(null);
      if (isMicOn) {
        // Turn off microphone
        if (stream) {
          stream.getAudioTracks().forEach(track => {
            track.stop();
          });
          
          // If camera is still on, restart stream without audio
          if (isCameraOn) {
            try {
              const videoOnlyStream = await navigator.mediaDevices.getUserMedia({ 
                video: true, 
                audio: false 
              });
              
              if (videoRef.current) {
                videoRef.current.srcObject = videoOnlyStream;
              }
              setStream(videoOnlyStream);
            } catch (error) {
              console.error("Error restarting camera:", error);
            }
          }
        }
        
        setIsMicOn(false);
        
        // Notify other users
        if (roomId) {
          socketService.emit("media-state-change", { 
            roomId, 
            userId: user?.id, 
            userName: user?.name,
            cameraOn: isCameraOn, 
            micOn: false,
            screenSharing: isScreenSharing
          });
        }
        
        toast({
          title: "Microphone turned off",
          duration: 1500
        });
      } else {
        // Turn on microphone
        try {
          let newStream;
          
          if (isCameraOn && stream) {
            // If camera is on, add audio to existing stream
            newStream = await navigator.mediaDevices.getUserMedia({ 
              video: true, 
              audio: true 
            });
          } else {
            // Just audio if camera is off
            newStream = await navigator.mediaDevices.getUserMedia({ 
              audio: true 
            });
          }
          
          if (videoRef.current && isCameraOn) {
            videoRef.current.srcObject = newStream;
          }
          
          setStream(prevStream => {
            // Stop old stream tracks
            if (prevStream) {
              prevStream.getTracks().forEach(track => track.stop());
            }
            return newStream;
          });
          
          setIsMicOn(true);
          
          // Notify other users
          if (roomId) {
            socketService.emit("media-state-change", { 
              roomId, 
              userId: user?.id,
              userName: user?.name,
              cameraOn: isCameraOn, 
              micOn: true,
              screenSharing: isScreenSharing
            });
          }
          
          toast({
            title: "Microphone turned on",
            duration: 1500
          });
        } catch (error) {
          console.error("Error accessing microphone:", error);
          setPermissionError("Microphone access denied. Please check your browser permissions and try again.");
          toast({
            title: "Microphone access denied",
            description: "Please check your browser permissions",
            variant: "destructive",
            duration: 3000
          });
        }
      }
    } catch (error) {
      console.error("Error toggling microphone:", error);
      setPermissionError("Error toggling microphone. Please check your browser permissions and try again.");
    }
  };

  const toggleScreenShare = async () => {
    try {
      setPermissionError(null);
      if (isScreenSharing) {
        stopWebcam();
        if (isCameraOn) {
          await startWebcam();
        }
        setIsScreenSharing(false);
        
        // Notify other users about screen sharing ended
        if (roomId) {
          socketService.emit("media-state-change", { 
            roomId, 
            userId: user?.id,
            userName: user?.name,
            cameraOn: isCameraOn, 
            micOn: isMicOn,
            screenSharing: false
          });
        }
      } else {
        try {
          const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
          
          if (stream) {
            stopWebcam();
          }
          
          if (videoRef.current) {
            videoRef.current.srcObject = displayStream;
          }
          
          setStream(displayStream);
          setIsScreenSharing(true);
          
          // Notify other users about screen sharing started
          if (roomId) {
            socketService.emit("media-state-change", { 
              roomId, 
              userId: user?.id,
              userName: user?.name,
              cameraOn: isCameraOn, 
              micOn: isMicOn,
              screenSharing: true
            });
          }
          
          // Automatically stop screen sharing when the user ends it
          displayStream.getVideoTracks()[0].onended = () => {
            setIsScreenSharing(false);
            
            // Notify other users screen sharing ended
            if (roomId) {
              socketService.emit("media-state-change", { 
                roomId, 
                userId: user?.id,
                userName: user?.name,
                cameraOn: isCameraOn, 
                micOn: isMicOn,
                screenSharing: false
              });
            }
            
            if (isCameraOn) {
              startWebcam();
            }
          };
          
          toast({
            title: "Screen sharing started",
            duration: 1500
          });
        } catch (error) {
          console.error("Error sharing screen:", error);
          setPermissionError("Screen sharing access denied. Please check your browser permissions and try again.");
          toast({
            title: "Screen sharing failed",
            description: "Could not access your screen",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error("Error toggling screen share:", error);
      setPermissionError("Error sharing screen. Please check your browser permissions and try again.");
    }
  };

  const endCall = () => {
    stopWebcam();
    setIsCameraOn(false);
    setIsMicOn(false);
    toast({
      title: "Call ended",
      description: "You left the video call",
      duration: 2000
    });
  };

  const copyRoomId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      toast({
        title: "Session code copied",
        description: "Share this code with others to join your session",
        duration: 2000
      });
    }
  };

  const handleShareLink = () => {
    if (roomId) {
      const shareUrl = `${window.location.origin}/room/${roomId}`;
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Session link copied",
        description: "Share this link with others to join your session",
        duration: 2000
      });
    }
  };

  // Define max allowed participants
  const MAX_PARTICIPANTS = 10;
  const showParticipantsWarning = remoteUsers.length >= MAX_PARTICIPANTS - 1;

  // Count all participants (including screen shares as separate entities)
  const screenShareCount = remoteUsers.filter(user => user.screenSharing).length;
  const totalParticipantsDisplay = remoteUsers.length + (isScreenSharing ? 1 : 0);

  return (
    <div className="flex flex-col h-full">
      {permissionError && (
        <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 px-4 py-2 text-sm">
          {permissionError}
        </div>
      )}
      
      {showParticipantsWarning && (
        <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-4 py-2 text-sm">
          Maximum participants reached ({MAX_PARTICIPANTS} users)
        </div>
      )}
      
      <div className="bg-primary/10 p-3 flex items-center justify-between">
        <div>
          <div className="text-xs text-muted-foreground">Session Code</div>
          <div className="font-mono font-medium">{roomId}</div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={copyRoomId}>
            <Copy className="h-4 w-4 mr-1" />
            Copy Code
          </Button>
          <Button variant="ghost" size="sm" onClick={handleShareLink}>
            <Share2 className="h-4 w-4 mr-1" />
            Share Link
          </Button>
        </div>
      </div>
      
      <div className="p-2 border-b border-border/50">
        <div className="text-sm flex items-center gap-2">
          <span className="font-medium">Participants: {remoteUsers.length + 1}</span>
          {screenShareCount > 0 && (
            <Badge variant="outline" className="text-xs">
              {screenShareCount} screen{screenShareCount > 1 ? 's' : ''} shared
            </Badge>
          )}
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Current user's video */}
        <div className="aspect-video bg-muted rounded-lg overflow-hidden relative flex items-center justify-center">
          {isCameraOn || isScreenSharing ? (
            <video 
              ref={videoRef}
              autoPlay 
              muted 
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center">
              <Avatar className="h-16 w-16 mb-2">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-primary">
                  {user?.name?.substring(0, 2).toUpperCase() || "YOU"}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{user?.name || "You"}</span>
              <span className="text-xs text-muted-foreground mt-1">
                {isScreenSharing ? "Screen sharing" : "Camera off"}
              </span>
            </div>
          )}
          <div className="absolute bottom-2 left-2 flex gap-1.5">
            {isCameraOn && (
              <Badge variant="secondary" className="bg-blue-500/80 text-white">
                <Video className="h-3 w-3 mr-1" />
                Camera
              </Badge>
            )}
            {isMicOn && (
              <Badge variant="secondary" className="bg-green-500/80 text-white">
                <Mic className="h-3 w-3 mr-1" />
                Mic
              </Badge>
            )}
            {isScreenSharing && (
              <Badge variant="secondary" className="bg-purple-500/80 text-white">
                <ScreenShare className="h-3 w-3 mr-1" />
                Screen
              </Badge>
            )}
            {!isCameraOn && !isMicOn && !isScreenSharing && (
              <Badge variant="secondary" className="bg-gray-500/80 text-white">
                You
              </Badge>
            )}
          </div>
        </div>

        {/* If user is screen sharing, show it as a separate tile (Google Meet style) */}
        {isScreenSharing && (
          <div className="aspect-video bg-muted rounded-lg overflow-hidden relative flex items-center justify-center border-2 border-purple-500">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm font-medium">Your screen</p>
                <p className="text-xs text-muted-foreground">Everyone can see your screen</p>
              </div>
            </div>
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="bg-purple-500/80 text-white">
                <ScreenShare className="h-3 w-3 mr-1" />
                Your screen
              </Badge>
            </div>
          </div>
        )}

        {/* Remote users */}
        {remoteUsers.map(remoteUser => (
          <div key={remoteUser.id} className="aspect-video bg-muted rounded-lg overflow-hidden relative flex items-center justify-center">
            {remoteUser.cameraOn ? (
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                {/* This would be a video element from a peer connection in a real implementation */}
                <Avatar className="h-16 w-16">
                  <AvatarImage src={remoteUser.avatar} />
                  <AvatarFallback style={{ backgroundColor: remoteUser.color }}>
                    {remoteUser.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <Avatar className="h-16 w-16 mb-2">
                  <AvatarImage src={remoteUser.avatar} />
                  <AvatarFallback style={{ backgroundColor: remoteUser.color }}>
                    {remoteUser.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{remoteUser.name}</span>
                <span className="text-xs text-muted-foreground mt-1">Camera off</span>
              </div>
            )}
            <div className="absolute bottom-2 left-2 flex gap-1.5">
              {remoteUser.cameraOn && (
                <Badge variant="secondary" className="bg-blue-500/80 text-white">
                  <Video className="h-3 w-3 mr-1" />
                  Camera
                </Badge>
              )}
              {remoteUser.micOn && (
                <Badge variant="secondary" className="bg-green-500/80 text-white">
                  <Mic className="h-3 w-3 mr-1" />
                  Mic
                </Badge>
              )}
              {!remoteUser.cameraOn && !remoteUser.micOn && (
                <Badge variant="secondary" className="bg-gray-500/80 text-white">
                  {remoteUser.name}
                </Badge>
              )}
            </div>
          </div>
        ))}
        
        {/* Show screen shares as separate tiles for remote users (Google Meet style) */}
        {remoteUsers.filter(user => user.screenSharing).map(user => (
          <div key={`${user.id}-screen`} className="aspect-video bg-muted rounded-lg overflow-hidden relative flex items-center justify-center border-2 border-purple-500">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm font-medium">{user.name}'s screen</p>
                <p className="text-xs text-muted-foreground">Screen sharing</p>
              </div>
            </div>
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="bg-purple-500/80 text-white">
                <ScreenShare className="h-3 w-3 mr-1" />
                Shared screen
              </Badge>
            </div>
          </div>
        ))}
        
        {/* Placeholder tiles if there are no remote users */}
        {remoteUsers.length === 0 && !isScreenSharing && (
          <div className="aspect-video bg-muted/50 rounded-lg flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <p>Waiting for others to join</p>
              <p className="text-xs mt-2">Share the session link to invite people</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-center gap-3">
          <Button 
            variant={isCameraOn ? "default" : "outline"} 
            size="icon" 
            onClick={toggleCamera} 
            className={`rounded-full h-12 w-12 ${isCameraOn ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
          >
            {isCameraOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </Button>
          <Button 
            variant={isMicOn ? "default" : "outline"} 
            size="icon" 
            onClick={toggleMic} 
            className={`rounded-full h-12 w-12 ${isMicOn ? 'bg-green-600 hover:bg-green-700' : ''}`}
          >
            {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </Button>
          <Button 
            variant={isScreenSharing ? "default" : "outline"} 
            size="icon" 
            onClick={toggleScreenShare} 
            className={`rounded-full h-12 w-12 ${isScreenSharing ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
          >
            <ScreenShare className="h-5 w-5" />
          </Button>
          <Button 
            variant={isChatOpen ? "default" : "outline"}
            size="icon" 
            onClick={onChatToggle}
            className="rounded-full h-12 w-12"
          >
            <MessageCircle className="h-5 w-5" />
          </Button>
          <Button 
            variant="destructive" 
            size="icon" 
            onClick={endCall} 
            className="rounded-full h-12 w-12"
          >
            <PhoneOff className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
