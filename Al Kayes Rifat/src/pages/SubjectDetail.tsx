import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AttendanceTable from "@/components/AttendanceTable";
import AddStudentDialog from "@/components/AddStudentDialog";

type Student = {
  id: string;
  name: string;
  roll_number: string | null;
  created_at: string;
};

const SubjectDetail = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [subjectName, setSubjectName] = useState("");
  const [semester, setSemester] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);

  useEffect(() => {
    loadSubjectData();
  }, [subjectId]);

  const loadSubjectData = async () => {
    setLoading(true);
    
    // Load subject info
    const { data: subjectData, error: subjectError } = await supabase
      .from("subjects")
      .select("*")
      .eq("id", subjectId)
      .single();

    if (subjectError) {
      toast({
        title: "Error",
        description: "Failed to load subject",
        variant: "destructive",
      });
      navigate("/dashboard");
      return;
    }

    setSubjectName(subjectData.name);
    setSemester(subjectData.semester);

    // Load students
    const { data: studentsData, error: studentsError } = await supabase
      .from("students")
      .select("*")
      .eq("subject_id", subjectId)
      .order("roll_number");

    if (studentsError) {
      toast({
        title: "Error",
        description: "Failed to load students",
        variant: "destructive",
      });
    } else {
      setStudents(studentsData || []);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/20">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary">{subjectName}</h1>
              <p className="text-sm text-muted-foreground">Semester: {semester}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Students & Attendance</h2>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Student
          </Button>
        </div>

        {students.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">No students yet. Add your first student!</p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Student
            </Button>
          </div>
        ) : (
          <AttendanceTable 
            subjectId={subjectId!} 
            students={students}
            onUpdate={loadSubjectData}
          />
        )}
      </div>

      <AddStudentDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        subjectId={subjectId!}
        onStudentAdded={loadSubjectData}
      />
    </div>
  );
};

export default SubjectDetail;
