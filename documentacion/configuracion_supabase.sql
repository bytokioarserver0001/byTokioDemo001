-- Crear tabla de perfiles para manejar roles
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  username text,
  role text default 'cliente' check (role in ('superadmin', 'admin', 'cliente', 'usuario')),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Habilitar Row Level Security (RLS)
alter table profiles enable row level security;

-- Política: Los usuarios pueden ver su propio perfil
create policy "Usuarios pueden ver su propio perfil" 
  on profiles for select 
  using (auth.uid() = id);

-- Política: Solo superadmins pueden ver todos los perfiles
create policy "Superadmins ven todo" 
  on profiles for all 
  using (
    exists (
      select 1 from profiles 
      where id = auth.uid() and role = 'superadmin'
    )
  );

-- Función para crear perfil automáticamente al registrarse
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, username, role)
  values (new.id, new.email, new.raw_user_meta_data->>'username', 'cliente');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger para ejecutar la función anterior
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
