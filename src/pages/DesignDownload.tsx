
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import MainLayout from '@/layouts/MainLayout';
import html2canvas from 'html2canvas';

const DesignDownload = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const mockupRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!mockupRef.current) return;
    
    setIsGenerating(true);
    
    try {
      const canvas = await html2canvas(mockupRef.current, {
        scale: 2,
        backgroundColor: null,
        logging: false
      });
      
      const link = document.createElement('a');
      link.download = 'collabcode-design.png';
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Design Downloaded",
        description: "Your design mockup has been downloaded successfully.",
      });
    } catch (error) {
      console.error("Error generating mockup:", error);
      toast({
        title: "Download Failed",
        description: "There was a problem generating your design mockup.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <MainLayout>
      <div className="container max-w-6xl py-8">
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Design Export</h1>
            <Button 
              onClick={handleDownload} 
              disabled={isGenerating}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              {isGenerating ? "Generating..." : "Download Design"}
            </Button>
          </div>

          <Card className="p-6 bg-background border shadow-md">
            <div ref={mockupRef} className="w-full bg-white rounded-lg p-8">
              {/* Mockup Content */}
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-2">CollabCode Synergy Design</h2>
                <p className="text-muted-foreground">UI Components &amp; Interface Design</p>
              </div>
              
              {/* Editor mockup */}
              <div className="border rounded-md overflow-hidden mb-6">
                <div className="bg-zinc-800 text-white p-2 text-sm flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                    <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  </div>
                  <div>main.js</div>
                  <div></div>
                </div>
                <div className="bg-zinc-900 p-4 text-emerald-400 font-mono text-sm">
                  <p><span className="text-purple-400">import</span> React <span className="text-purple-400">from</span> <span className="text-yellow-300">'react'</span>;</p>
                  <p>&nbsp;</p>
                  <p><span className="text-purple-400">const</span> <span className="text-blue-400">App</span> = () =&gt; {`{`}</p>
                  <p>&nbsp;&nbsp;<span className="text-purple-400">return</span> (</p>
                  <p>&nbsp;&nbsp;&nbsp;&nbsp;&lt;<span className="text-blue-400">div</span>&gt;</p>
                  <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Hello World!</p>
                  <p>&nbsp;&nbsp;&nbsp;&nbsp;&lt;/<span className="text-blue-400">div</span>&gt;</p>
                  <p>&nbsp;&nbsp;);</p>
                  <p>{`}`};</p>
                  <p>&nbsp;</p>
                  <p><span className="text-purple-400">export</span> <span className="text-purple-400">default</span> App;</p>
                </div>
              </div>
              
              {/* Component mockups */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="border rounded p-3">
                  <div className="font-medium mb-2">Buttons</div>
                  <div className="flex gap-2 flex-wrap">
                    <div className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Primary</div>
                    <div className="bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm">Secondary</div>
                    <div className="bg-red-600 text-white px-3 py-1 rounded text-sm">Danger</div>
                  </div>
                </div>
                <div className="border rounded p-3">
                  <div className="font-medium mb-2">Form Controls</div>
                  <div className="flex flex-col gap-2">
                    <div className="h-8 bg-gray-100 rounded border w-full"></div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-sm border bg-blue-600"></div>
                      <div className="text-sm">Checkbox</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Color palette */}
              <div className="border rounded p-3">
                <div className="font-medium mb-2">Color Palette</div>
                <div className="flex gap-2">
                  <div className="h-8 w-8 rounded-full bg-blue-600"></div>
                  <div className="h-8 w-8 rounded-full bg-green-500"></div>
                  <div className="h-8 w-8 rounded-full bg-purple-600"></div>
                  <div className="h-8 w-8 rounded-full bg-red-500"></div>
                  <div className="h-8 w-8 rounded-full bg-yellow-500"></div>
                  <div className="h-8 w-8 rounded-full bg-gray-900"></div>
                  <div className="h-8 w-8 rounded-full bg-gray-100 border"></div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default DesignDownload;
