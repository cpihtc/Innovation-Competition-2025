-- Add roll_number column to students table
ALTER TABLE public.students 
ADD COLUMN roll_number text;

-- Create index for faster roll number lookups
CREATE INDEX idx_students_roll_number ON public.students(roll_number);