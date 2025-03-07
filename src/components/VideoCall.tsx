
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Video, VideoOff, Mic, MicOff, PhoneOff, ScreenShare } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const VideoCall: React.FC = () => {
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  const collaborators = [
    { id: 1, name: "Alice Chen", avatar: "", color: "#3b82f6", status: "active", cameraOn: true },
    { id: 2, name: "Bob Smith", avatar: "", color: "#10b981", status: "active", cameraOn: false },
    { id: 3, name: "You", avatar: "", color: "#8b5cf6", status: "active", cameraOn: isCameraOn }
  ];

  const toggleCamera = () => {
    setIsCameraOn(!isCameraOn);
    toast({
      title: isCameraOn ? "Camera turned off" : "Camera turned on",
      duration: 1500
    });
  };

  const toggleMic = () => {
    setIsMicOn(!isMicOn);
    toast({
      title: isMicOn ? "Microphone muted" : "Microphone unmuted",
      duration: 1500
    });
  };

  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    toast({
      title: isScreenSharing ? "Screen sharing stopped" : "Screen sharing started",
      duration: 1500
    });
  };

  const endCall = () => {
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
        {collaborators.map(user => (
          <div key={user.id} className="aspect-video bg-muted rounded-lg overflow-hidden relative flex items-center justify-center">
            {user.cameraOn ? (
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                {/* This would be a video element in a real implementation */}
                <span className="sr-only">Video of {user.name}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <Avatar className="h-16 w-16 mb-2">
                  <AvatarImage src={user.avatar} />
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
