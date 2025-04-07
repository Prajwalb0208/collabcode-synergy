
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";
import MainLayout from "@/layouts/MainLayout";

interface AccessRequestProps {
  roomId: string;
  onRequestAccess: () => void;
}

const AccessRequest: React.FC<AccessRequestProps> = ({ roomId, onRequestAccess }) => {
  return (
    <MainLayout>
      <div className="container py-12">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Access Required</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <ShieldAlert className="h-4 w-4" />
              <AlertTitle>Permission Required</AlertTitle>
              <AlertDescription>
                You need permission to join this room. Request access from the room owner.
              </AlertDescription>
            </Alert>
            <div className="flex gap-4 mt-4">
              <Button 
                variant="default" 
                className="flex-1" 
                onClick={onRequestAccess}
              >
                Request Access
              </Button>
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={() => window.location.href = "/rooms"}
              >
                Back to Rooms
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AccessRequest;
