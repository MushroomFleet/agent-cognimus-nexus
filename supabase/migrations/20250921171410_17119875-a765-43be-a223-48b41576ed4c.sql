-- Fix function search path security issue
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, user_type, display_name)
    VALUES (
        NEW.id, 
        CASE 
            WHEN NEW.email LIKE '%@oragenai.com' THEN 'admin'::public.user_type
            ELSE 'guest'::public.user_type
        END,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
    );
    RETURN NEW;
END;
$$;