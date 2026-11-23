# FoodRescue

FoodRescue es una aplicación web en español que permite a los restaurantes registrar donaciones de alimentos y consultar las donaciones de su cuenta.

## Decisiones de diseño vs. sugerencias del IS

1. **Seguridad.** El sistema propuso guardar las donaciones por usuario con Supabase Auth y seguridad a nivel de fila (RLS). Acepté la propuesta y limité los permisos de inserción para impedir que el navegador envíe `restaurante_id`. La base de datos lo asigna con `auth.uid()`. Esto impide que un restaurante registre o lea donaciones a nombre de otra cuenta. Verifiqué en la migración que se habilita RLS y se definen las políticas “Leer donaciones propias” y “Registrar donaciones propias”.
2. **Escalabilidad.** El sistema propuso conservar las donaciones en `localStorage`. Decidí usar Supabase para que las donaciones persistan entre visitas y pertenezcan a una cuenta. Para la primera versión usaré el plan gratuito, que incluye hasta 50,000 usuarios activos mensuales, 500 MB de base de datos y 5 GB de transferencia saliente. Si FoodRescue supera esos límites, se deberá evaluar el plan Pro y su costo mensual. [Planes de Supabase](https://supabase.com/pricing)

## Cómo probar la app

1. Crea una cuenta o inicia sesión.
2. Registra una donación.
3. Recarga la página.
4. Comprueba que la donación sigue apareciendo en la lista.
