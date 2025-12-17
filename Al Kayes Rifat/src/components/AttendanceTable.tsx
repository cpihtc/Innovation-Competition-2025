import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addDays, subDays } from "date-fns";

type Student = {
  id: string;
  name: string;
  roll_number: string | null;
};

type AttendanceTableProps = {
  subjectId: string;
  students: Student[];
  onUpdate: () => void;
};

const AttendanceTable = ({ subjectId, students, onUpdate }: AttendanceTableProps) => {
  const { toast } = useToast();
  const [dates, setDates] = useState<Date[]>([]);
  const [attendance, setAttendance] = useState<Record<string, Record<string, boolean>>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initialize with 7 days centered on today
    const today = new Date();
    const initialDates: Date[] = [];
    for (let i = -3; i <= 3; i++) {
      initialDates.push(addDays(today, i));
    }
    setDates(initialDates);
    loadAttendance(initialDates);
  }, [students]);

  const loadAttendance = async (datesToLoad: Date[]) => {
    if (students.length === 0) return;

    const dateStrings = datesToLoad.map(d => format(d, 'yyyy-MM-dd'));
    
    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .in("student_id", students.map(s => s.id))
      .in("date", dateStrings);

    if (!error && data) {
      const attendanceMap: Record<string, Record<string, boolean>> = {};
      
      data.forEach((record) => {
        if (!attendanceMap[record.student_id]) {
          attendanceMap[record.student_id] = {};
        }
        attendanceMap[record.student_id][record.date] = record.present;
      });
      
      setAttendance(attendanceMap);
    }
  };

  const toggleAttendance = async (studentId: string, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const currentValue = attendance[studentId]?.[dateStr];
    const newValue = currentValue === undefined ? true : !currentValue;

    // Optimistic update
    setAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [dateStr]: newValue,
      },
    }));

    // Save to database
    setLoading(true);
    
    // Delete existing record
    await supabase
      .from("attendance")
      .delete()
      .eq("student_id", studentId)
      .eq("date", dateStr);

    // Insert new record
    const { error } = await supabase.from("attendance").insert({
      student_id: studentId,
      date: dateStr,
      present: newValue,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save attendance",
        variant: "destructive",
      });
      // Revert optimistic update
      loadAttendance(dates);
    }
    
    setLoading(false);
  };

  const addNextDay = () => {
    const nextDate = addDays(dates[dates.length - 1], 1);
    const newDates = [...dates, nextDate];
    setDates(newDates);
    loadAttendance([nextDate]);
  };

  const addPreviousDay = () => {
    const prevDate = subDays(dates[0], 1);
    const newDates = [prevDate, ...dates];
    setDates(newDates);
    loadAttendance([prevDate]);
  };

  return (
    <div className="border rounded-lg bg-card overflow-hidden">
      <div className="flex">
        {/* Fixed Student Column */}
        <div className="flex-shrink-0 border-r bg-muted/30">
          <div className="h-16 border-b flex items-center justify-center px-4 font-semibold bg-muted sticky top-0 z-10">
            <div className="text-left w-full">
              <div>Roll No.</div>
              <div className="text-xs font-normal text-muted-foreground">Student Name</div>
            </div>
          </div>
          <div>
            {students.map((student) => (
              <div
                key={student.id}
                className="h-14 border-b px-4 flex flex-col justify-center"
              >
                <div className="font-medium text-sm">
                  {student.roll_number || "—"}
                </div>
                <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                  {student.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scrollable Date Columns */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="w-full">
            <div className="flex">
              {/* Previous Day Button */}
              <div className="flex-shrink-0 w-12 border-r">
                <div className="h-16 border-b flex items-center justify-center sticky top-0 z-10 bg-muted">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={addPreviousDay}
                    className="h-8 w-8"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>
                {students.map((student) => (
                  <div key={student.id} className="h-14 border-b"></div>
                ))}
              </div>

              {/* Date Columns */}
              {dates.map((date) => {
                const dateStr = format(date, 'yyyy-MM-dd');
                const isToday = dateStr === format(new Date(), 'yyyy-MM-dd');
                
                return (
                  <div key={dateStr} className="flex-shrink-0 border-r w-28">
                    <div className={`h-16 border-b flex flex-col items-center justify-center px-2 sticky top-0 z-10 ${isToday ? 'bg-primary/10' : 'bg-muted'}`}>
                      <div className="font-semibold text-sm">
                        {format(date, 'MMM dd')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(date, 'EEE')}
                      </div>
                    </div>
                    <div>
                      {students.map((student) => {
                        const isPresent = attendance[student.id]?.[dateStr];
                        
                        return (
                          <div
                            key={student.id}
                            className={`h-14 border-b flex items-center justify-center cursor-pointer hover:bg-accent/50 transition-colors ${
                              isPresent === true
                                ? "bg-primary/10"
                                : isPresent === false
                                ? "bg-destructive/10"
                                : ""
                            }`}
                            onClick={() => toggleAttendance(student.id, date)}
                          >
                            <Checkbox
                              checked={isPresent === true}
                              onCheckedChange={() => toggleAttendance(student.id, date)}
                              className="h-5 w-5"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Next Day Button */}
              <div className="flex-shrink-0 w-12">
                <div className="h-16 border-b flex items-center justify-center sticky top-0 z-10 bg-muted">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={addNextDay}
                    className="h-8 w-8"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                {students.map((student) => (
                  <div key={student.id} className="h-14 border-b"></div>
                ))}
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default AttendanceTable;
