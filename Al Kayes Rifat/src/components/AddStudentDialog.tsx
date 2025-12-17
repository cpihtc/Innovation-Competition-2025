import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type AddStudentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjectId: string;
  onStudentAdded: () => void;
};

const AddStudentDialog = ({ open, onOpenChange, subjectId, onStudentAdded }: AddStudentDialogProps) => {
  const [studentName, setStudentName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [bulkData, setBulkData] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) return;

    setLoading(true);
    const { error } = await supabase.from("students").insert({
      name: studentName,
      roll_number: rollNumber.trim() || null,
      subject_id: subjectId,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add student",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Student added successfully",
      });
      setStudentName("");
      setRollNumber("");
      onStudentAdded();
      onOpenChange(false);
    }
    setLoading(false);
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkData.trim()) return;

    setLoading(true);
    
    // Parse the bulk data
    const lines = bulkData.trim().split('\n');
    const students = lines.map(line => {
      // Split by tab or multiple spaces
      const parts = line.split(/[\t]+/).map(p => p.trim()).filter(Boolean);
      
      if (parts.length >= 2) {
        return {
          roll_number: parts[0],
          name: parts.slice(1).join(' '),
          subject_id: subjectId,
        };
      } else if (parts.length === 1) {
        // Just name, no roll number
        return {
          name: parts[0],
          subject_id: subjectId,
        };
      }
      return null;
    }).filter(Boolean);

    if (students.length === 0) {
      toast({
        title: "Error",
        description: "No valid student data found",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("students").insert(students);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add students",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `${students.length} student(s) added successfully`,
      });
      setBulkData("");
      onStudentAdded();
      onOpenChange(false);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Students</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="single" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single">Single Student</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Import</TabsTrigger>
          </TabsList>
          
          <TabsContent value="single">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rollNumber">Roll Number (Optional)</Label>
                <Input
                  id="rollNumber"
                  placeholder="e.g., 780150"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="studentName">Student Name</Label>
                <Input
                  id="studentName"
                  placeholder="Enter student name"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Adding..." : "Add Student"}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="bulk">
            <form onSubmit={handleBulkSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bulkData">Paste Student Data</Label>
                <Textarea
                  id="bulkData"
                  placeholder="Paste student data here (format: ROLL_NUMBER[TAB]STUDENT_NAME)&#10;Example:&#10;780150	MAHFUG MIYA&#10;780158	MD. AMINUL ISLAM"
                  value={bulkData}
                  onChange={(e) => setBulkData(e.target.value)}
                  className="min-h-[300px] font-mono text-sm"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Format: Roll number and name separated by tab. One student per line.
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Importing..." : "Import Students"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AddStudentDialog;
