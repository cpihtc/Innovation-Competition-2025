-- Rename classes table to subjects and add semester
ALTER TABLE public.classes RENAME TO subjects;

-- Add semester column
ALTER TABLE public.subjects ADD COLUMN semester TEXT NOT NULL DEFAULT '1';

-- Update the foreign key name in students table (for clarity)
-- Note: The FK constraint still works after renaming, but we'll update comments

COMMENT ON TABLE public.subjects IS 'Subjects table for tracking different courses/subjects by semester';
COMMENT ON COLUMN public.subjects.semester IS 'Semester number or name (e.g., "1", "2", "Fall 2024", etc.)';

-- Update policies names for clarity (policies still work with renamed table)
DROP POLICY IF EXISTS "Users can view their own classes" ON public.subjects;
DROP POLICY IF EXISTS "Users can create their own classes" ON public.subjects;
DROP POLICY IF EXISTS "Users can update their own classes" ON public.subjects;
DROP POLICY IF EXISTS "Users can delete their own classes" ON public.subjects;

-- Recreate policies with updated names
CREATE POLICY "Users can view their own subjects"
  ON public.subjects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subjects"
  ON public.subjects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subjects"
  ON public.subjects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subjects"
  ON public.subjects FOR DELETE
  USING (auth.uid() = user_id);

-- Update students table policies to reference subjects
DROP POLICY IF EXISTS "Users can view students in their classes" ON public.students;
DROP POLICY IF EXISTS "Users can add students to their classes" ON public.students;
DROP POLICY IF EXISTS "Users can update students in their classes" ON public.students;
DROP POLICY IF EXISTS "Users can delete students from their classes" ON public.students;

-- Recreate with updated names and comments
CREATE POLICY "Users can view students in their subjects"
  ON public.students FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.subjects
      WHERE subjects.id = students.class_id
      AND subjects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add students to their subjects"
  ON public.students FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.subjects
      WHERE subjects.id = students.class_id
      AND subjects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update students in their subjects"
  ON public.students FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.subjects
      WHERE subjects.id = students.class_id
      AND subjects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete students from their subjects"
  ON public.students FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.subjects
      WHERE subjects.id = students.class_id
      AND subjects.user_id = auth.uid()
    )
  );

-- Update attendance policies
DROP POLICY IF EXISTS "Users can view attendance for their students" ON public.attendance;
DROP POLICY IF EXISTS "Users can mark attendance for their students" ON public.attendance;
DROP POLICY IF EXISTS "Users can update attendance for their students" ON public.attendance;

CREATE POLICY "Users can view attendance for their students"
  ON public.attendance FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.students
      JOIN public.subjects ON subjects.id = students.class_id
      WHERE students.id = attendance.student_id
      AND subjects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can mark attendance for their students"
  ON public.attendance FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.students
      JOIN public.subjects ON subjects.id = students.class_id
      WHERE students.id = attendance.student_id
      AND subjects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update attendance for their students"
  ON public.attendance FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.students
      JOIN public.subjects ON subjects.id = students.class_id
      WHERE students.id = attendance.student_id
      AND subjects.user_id = auth.uid()
    )
  );