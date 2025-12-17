import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type CreateSubjectDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubjectCreated: () => void;
};

const CreateSubjectDialog = ({ open, onOpenChange, onSubjectCreated }: CreateSubjectDialogProps) => {
  const [subjectName, setSubjectName] = useState("");
  const [semester, setSemester] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim() || !semester.trim()) return;

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a subject",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("subjects").insert({
      name: subjectName,
      semester: semester,
      user_id: user.id,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create subject",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Subject created successfully",
      });
      setSubjectName("");
      setSemester("");
      onSubjectCreated();
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Subject</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subjectName">Subject Name</Label>
            <Input
              id="subjectName"
              placeholder="e.g., Mathematics, Physics"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="semester">Semester</Label>
            <Input
              id="semester"
              placeholder="e.g., 1, 2, Fall 2024"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Create Subject"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSubjectDialog;
