import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Student = {
  id: string;
  name: string;
};

type AttendanceRecord = {
  student_id: string;
  present: boolean;
};

type AttendanceViewProps = {
  subjectId: string;
  students: Student[];
};

const AttendanceView = ({ subjectId, students }: AttendanceViewProps) => {
  const { toast } = useToast();
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    loadTodayAttendance();
  }, [students]);

  const loadTodayAttendance = async () => {
    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .in(
        "student_id",
        students.map((s) => s.id)
      )
      .eq("date", today);

    if (!error && data) {
      const attendanceMap: Record<string, boolean> = {};
      data.forEach((record) => {
        attendanceMap[record.student_id] = record.present;
      });
      setAttendance(attendanceMap);
    }
  };

  const toggleAttendance = (studentId: string) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === undefined ? true : !prev[studentId],
    }));
  };

  const saveAttendance = async () => {
    setLoading(true);
    const records: AttendanceRecord[] = Object.entries(attendance).map(([studentId, present]) => ({
      student_id: studentId,
      date: today,
      present,
    }));

    // Delete existing attendance for today
    await supabase
      .from("attendance")
      .delete()
      .in(
        "student_id",
        students.map((s) => s.id)
      )
      .eq("date", today);

    // Insert new attendance
    const { error } = await supabase.from("attendance").insert(
      records.map((r) => ({
        ...r,
        date: today,
      }))
    );

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save attendance",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Attendance saved successfully",
      });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <p className="text-lg font-medium">Date: {new Date(today).toLocaleDateString()}</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {students.map((student) => {
          const isPresent = attendance[student.id];
          return (
            <Card
              key={student.id}
              className={`cursor-pointer transition-all ${
                isPresent === true
                  ? "border-primary bg-primary/5"
                  : isPresent === false
                  ? "border-destructive bg-destructive/5"
                  : "border-border"
              }`}
              onClick={() => toggleAttendance(student.id)}
            >
              <CardContent className="flex items-center justify-between p-4">
                <span className="font-medium">{student.name}</span>
                {isPresent === true ? (
                  <div className="bg-primary text-primary-foreground rounded-full p-1">
                    <Check className="w-4 h-4" />
                  </div>
                ) : isPresent === false ? (
                  <div className="bg-destructive text-destructive-foreground rounded-full p-1">
                    <X className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-muted-foreground" />
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {students.length > 0 && (
        <div className="flex justify-center pt-4">
          <Button size="lg" onClick={saveAttendance} disabled={loading}>
            {loading ? "Saving..." : "Save Attendance"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default AttendanceView;
