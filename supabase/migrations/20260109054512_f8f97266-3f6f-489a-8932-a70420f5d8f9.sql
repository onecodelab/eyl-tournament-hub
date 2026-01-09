-- Insert admin role for the current admin user
INSERT INTO public.user_roles (user_id, role)
VALUES ('573ebe07-10f4-45d9-8cad-cac6dd6eab25', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;