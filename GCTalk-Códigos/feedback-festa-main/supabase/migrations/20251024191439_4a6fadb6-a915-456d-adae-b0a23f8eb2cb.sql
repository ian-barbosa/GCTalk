-- Add foreign key from comments to profiles
ALTER TABLE public.comments 
ADD CONSTRAINT comments_user_id_fkey_profiles 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;

-- Add foreign key from feedback to profiles  
ALTER TABLE public.feedback 
ADD CONSTRAINT feedback_user_id_fkey_profiles 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;