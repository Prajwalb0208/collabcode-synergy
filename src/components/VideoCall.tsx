
import React, { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Video, VideoOff, Mic, MicOff, PhoneOff, ScreenShare, MessageCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { socketService } from "@/services/socketService";

interface VideoCallProps {
  onChatToggle?: () => void;
  isChatOpen?: boolean;
  roomId?: string;
}

const VideoCall: React.FC<VideoCallProps> = ({ onChatToggle, isChatOpen, roomId }) => {
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [collaborators, setCollaborators] = useState<{id: string, name: string, color: string, cameraOn: boolean}[]>([]);
  
  // Initialize webcam on component mount
  useEffect(() => {
    if (isCameraOn) {
      startWebcam();
    }
    
    // Track collaborators
    socketService.on("user-joined", (data) => {
      setCollaborators(prev => {
        if (prev.some(c => c.id === data.userId)) {
          return prev;
        }
        return [...prev, {
          id: data.userId,
          name: data.name,
          color: getRandomColor(),
          cameraOn: false
        }];
      });
    });
    
    socketService.on("user-left", (data) => {
      setCollaborators(prev => prev.filter(c => c.id !== data.userId));
    });
    
    return () => {
      stopWebcam();
    };
  }, []);
  
  const getRandomColor = () => {
    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"];
    return colors[Math.floor(Math.random() * colors.length)];
  };
  
  const startWebcam = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: isMicOn 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      setStream(mediaStream);
      setIsCameraOn(true);
      
      toast({
        title: "Camera turned on",
        duration: 1500
      });
    } catch (error) {
      console.error("Error accessing webcam:", error);
      setIsCameraOn(false);
      
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
    setIsMicOn(!isMicOn);
    
    // If we have an active stream, toggle the audio tracks
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = !isMicOn;
      });
    } else if (!isMicOn && !stream) {
      // If turning mic on and no stream exists yet
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setStream(audioStream);
      } catch (error) {
        console.error("Error accessing microphone:", error);
      }
    }
    
    toast({
      title: isMicOn ? "Microphone muted" : "Microphone unmuted",
      duration: 1500
    });
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      stopWebcam();
      if (isCameraOn) {
        await startWebcam();
      }
      setIsScreenSharing(false);
    } else {
      try {
        // @ts-ignore - TypeScript might not recognize getDisplayMedia
        const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        
        if (stream) {
          stopWebcam();
        }
        
        if (videoRef.current) {
          videoRef.current.srcObject = displayStream;
        }
        
        setStream(displayStream);
        setIsScreenSharing(true);
        
        // Automatically stop screen sharing when the user ends it
        displayStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
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
        toast({
          title: "Screen sharing failed",
          description: "Could not access your screen",
          variant: "destructive"
        });
      }
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

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-4 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Current user's video */}
        <div className="aspect-video bg-muted rounded-lg overflow-hidden relative flex items-center justify-center">
          {isCameraOn ? (
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
                <AvatarFallback style={{ backgroundColor: "#8b5cf6" }}>
                  YOU
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">You</span>
              <span className="text-xs text-muted-foreground mt-1">Camera off</span>
            </div>
          )}
          <div className="absolute bottom-2 left-2 bg-background/70 backdrop-blur-sm rounded px-2 py-1 text-xs font-medium">
            You {isMicOn ? '🎤' : '🔇'}
          </div>
        </div>

        {/* Collaborators */}
        {collaborators.map(user => (
          <div key={user.id} className="aspect-video bg-muted rounded-lg overflow-hidden relative flex items-center justify-center">
            {user.cameraOn ? (
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                {/* This would be a video element from a peer connection in a real implementation */}
                <span className="sr-only">Video of {user.name}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <Avatar className="h-16 w-16 mb-2">
                  <AvatarFallback style={{ backgroundColor: user.color }}>
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{user.name}</span>
                <span className="text-xs text-muted-foreground mt-1">Camera off</span>
              </div>
            )}
            <div className="absolute bottom-2 left-2 bg-background/70 backdrop-blur-sm rounded px-2 py-1 text-xs font-medium">
              {user.name}
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-center gap-3">
          <Button 
            variant={isCameraOn ? "default" : "outline"} 
            size="icon" 
            onClick={toggleCamera} 
            className="rounded-full h-12 w-12"
          >
            {isCameraOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </Button>
          <Button 
            variant={isMicOn ? "default" : "outline"} 
            size="icon" 
            onClick={toggleMic} 
            className="rounded-full h-12 w-12"
          >
            {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </Button>
          <Button 
            variant={isScreenSharing ? "default" : "outline"} 
            size="icon" 
            onClick={toggleScreenShare} 
            className="rounded-full h-12 w-12"
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
