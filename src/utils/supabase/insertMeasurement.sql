
-- This is a reference SQL function for inserting measurements without RLS restriction
-- You should run this SQL in the Supabase SQL editor to create the function

CREATE OR REPLACE FUNCTION public.insertar_medicion_progreso(
  p_cliente_id UUID,
  p_peso NUMERIC,
  p_grasa_corporal NUMERIC,
  p_masa_muscular NUMERIC,
  p_notas TEXT,
  p_fecha DATE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id UUID;
BEGIN
  -- Insert the measurement record directly, bypassing RLS
  INSERT INTO public.progreso (
    cliente_id,
    peso,
    grasa_corporal,
    masa_muscular,
    notas,
    fecha
  ) VALUES (
    p_cliente_id,
    p_peso,
    p_grasa_corporal,
    p_masa_muscular,
    p_notas,
    p_fecha
  )
  RETURNING id INTO v_id;
  
  -- Return the inserted record ID
  RETURN jsonb_build_object('id', v_id);
END;
$$;

-- To allow the function to be called by any authenticated user
GRANT EXECUTE ON FUNCTION public.insertar_medicion_progreso TO PUBLIC;
