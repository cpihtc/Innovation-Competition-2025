-- Rename class_id to subject_id in students table for consistency
ALTER TABLE public.students RENAME COLUMN class_id TO subject_id;

-- Update the foreign key constraint name for clarity
ALTER TABLE public.students 
DROP CONSTRAINT students_class_id_fkey;

ALTER TABLE public.students 
ADD CONSTRAINT students_subject_id_fkey 
FOREIGN KEY (subject_id) 
REFERENCES public.subjects(id) 
ON DELETE CASCADE;