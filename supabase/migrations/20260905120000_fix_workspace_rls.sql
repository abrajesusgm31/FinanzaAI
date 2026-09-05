-- 1. Asegurar que created_by sea automático y seguro
ALTER TABLE public.workspaces 
ALTER COLUMN created_by SET DEFAULT auth.uid();

-- 2. Corregir política de INSERT para ser más robusta
DROP POLICY IF EXISTS "Usuarios pueden crear workspaces" ON public.workspaces;

CREATE POLICY "Usuarios pueden crear workspaces" 
ON public.workspaces 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);
