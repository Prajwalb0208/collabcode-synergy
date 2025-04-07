
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AIAssistant from "@/components/AIAssistant";
import CollaborationPanel from "@/components/CollaborationPanel";
import VideoCall from "@/components/VideoCall";
import Chat from "@/components/Chat";
import { CodeFile, VisiblePanels } from "../types";

interface CollaborationSidebarProps {
  visiblePanels: VisiblePanels;
  isChatOpen: boolean;
  toggleChat: () => void;
  roomId: string;
  isRoomOwner: boolean;
  currentFile: CodeFile;
}

const CollaborationSidebar: React.FC<CollaborationSidebarProps> = ({
  visiblePanels,
  isChatOpen,
  toggleChat,
  roomId,
  isRoomOwner,
  currentFile
}) => {
  return (
    <>
      <ResizableHandle withHandle />
      <ResizablePanel 
        defaultSize={30} 
        minSize={25}
        className="flex flex-col gap-4 relative"
      >
        <ResizablePanelGroup direction="vertical">
          {visiblePanels.videos && (
            <ResizablePanel 
              defaultSize={60} 
              minSize={30}
              className="border-t border-l border-r rounded-t-lg overflow-hidden"
            >
              <VideoCall onChatToggle={toggleChat} isChatOpen={isChatOpen} />
            </ResizablePanel>
          )}
          
          {visiblePanels.ai && (
            <>
              {visiblePanels.videos && <ResizableHandle withHandle />}
              <ResizablePanel 
                defaultSize={40} 
                minSize={20} 
                className="border rounded-b-lg overflow-hidden relative"
              >
                <Tabs defaultValue="ai" className="h-full flex flex-col">
                  <div className="border-b px-3">
                    <TabsList className="bg-transparent h-12">
                      <TabsTrigger value="ai" className="data-[state=active]:bg-background">
                        AI Assistant
                      </TabsTrigger>
                      <TabsTrigger value="collaboration" className="data-[state=active]:bg-background">
                        Collaboration
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  <TabsContent value="ai" className="flex-1 m-0 p-0 overflow-hidden">
                    <AIAssistant code={currentFile.content} />
                  </TabsContent>
                  <TabsContent value="collaboration" className="flex-1 m-0 p-0 overflow-hidden">
                    <CollaborationPanel 
                      isOwner={isRoomOwner} 
                      roomId={roomId} 
                    />
                  </TabsContent>
                </Tabs>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
        
        <div className={`
          absolute inset-y-0 right-0 w-80 bg-background border-l shadow-lg transform transition-transform duration-300 z-30
          ${isChatOpen ? 'translate-x-0' : 'translate-x-full'}
        `}>
          <Chat onClose={toggleChat} />
        </div>
      </ResizablePanel>
    </>
  );
};

export default CollaborationSidebar;
