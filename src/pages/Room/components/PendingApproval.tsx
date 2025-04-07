
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";
import MainLayout from "@/layouts/MainLayout";

const PendingApproval: React.FC = () => {
  return (
    <MainLayout>
      <div className="container py-12">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Waiting for approval</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <ShieldAlert className="h-4 w-4" />
              <AlertTitle>Access Pending</AlertTitle>
              <AlertDescription>
                Your request to join this room is waiting for approval from the room owner.
              </AlertDescription>
            </Alert>
            <Button 
              variant="outline" 
              className="w-full mt-4" 
              onClick={() => window.location.href = "/rooms"}
            >
              Back to Rooms
            </Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default PendingApproval;
