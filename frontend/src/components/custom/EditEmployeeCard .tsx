import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from 'lucide-react';

interface EditEmployeeCardProps {
  closeForm: () => void;
}

const EditEmployeeCard = ({ closeForm }: EditEmployeeCardProps) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <Card className="w-full max-w-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Edit Employee</CardTitle>
            <CardDescription>Update employee information</CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full" 
            onClick={closeForm}
          >
            <X size={18} />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add the form fields here when you're ready */}
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button variant="outline" onClick={closeForm}>Cancel</Button>
          <Button variant="outline" disabled>Save Changes</Button> 
        </CardFooter>
      </Card>
    </div>
  );
};

export default EditEmployeeCard;
