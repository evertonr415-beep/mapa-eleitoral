-- VotoForte v34 — Lideranças -> Eleitores georreferenciados
-- Estrutura aditiva para a preview. Não remove nem altera registros existentes.

begin;

alter table public.perfis_usuarios drop constraint if exists perfis_usuarios_role_check;
alter table public.perfis_usuarios
  add constraint perfis_usuarios_role_check
  check (role = any (array['master'::text,'adm'::text,'vereador'::text,'lideranca'::text]));

alter table public.liderancas
  add column if not exists usuario_id uuid references public.perfis_usuarios(id) on delete set null;

create unique index if not exists liderancas_usuario_id_uidx
  on public.liderancas(usuario_id) where usuario_id is not null;
create unique index if not exists liderancas_id_usuario_uidx
  on public.liderancas(id, usuario_id);
create unique index if not exists liderancas_id_vereador_uidx
  on public.liderancas(id, vereador_id);

create table if not exists public.eleitores (
  id uuid primary key default gen_random_uuid(),
  lideranca_id uuid not null,
  lideranca_usuario_id uuid not null,
  vereador_id uuid not null,
  cadastrado_por uuid not null references public.perfis_usuarios(id) on delete restrict,
  nome text not null check (char_length(btrim(nome)) between 2 and 120),
  whatsapp text,
  bairro text,
  logradouro text,
  numero text,
  cep text,
  lat double precision not null check (lat between -90 and 90),
  lng double precision not null check (lng between -180 and 180),
  observacoes text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  constraint eleitores_lideranca_usuario_fk
    foreign key (lideranca_id, lideranca_usuario_id)
    references public.liderancas(id, usuario_id)
    on update cascade on delete cascade,
  constraint eleitores_lideranca_vereador_fk
    foreign key (lideranca_id, vereador_id)
    references public.liderancas(id, vereador_id)
    on update cascade on delete cascade
);

create index if not exists eleitores_lideranca_idx on public.eleitores(lideranca_id);
create index if not exists eleitores_lideranca_usuario_idx on public.eleitores(lideranca_usuario_id);
create index if not exists eleitores_vereador_idx on public.eleitores(vereador_id);

alter table public.eleitores enable row level security;
grant select, insert, update, delete on public.eleitores to authenticated;

create policy "liderancas_select_linked_user"
  on public.liderancas for select to authenticated
  using (usuario_id = (select auth.uid()));

create policy "eleitores_select_authorized"
  on public.eleitores for select to authenticated
  using (
    app_private.can_act_for_user(vereador_id)
    or lideranca_usuario_id = (select auth.uid())
  );

create policy "eleitores_insert_authorized"
  on public.eleitores for insert to authenticated
  with check (
    (app_private.can_act_for_user(vereador_id) or lideranca_usuario_id = (select auth.uid()))
    and cadastrado_por = (select auth.uid())
  );

create policy "eleitores_update_authorized"
  on public.eleitores for update to authenticated
  using (
    app_private.can_act_for_user(vereador_id)
    or lideranca_usuario_id = (select auth.uid())
  )
  with check (
    (app_private.can_act_for_user(vereador_id) or lideranca_usuario_id = (select auth.uid()))
    and cadastrado_por = (select auth.uid())
  );

create policy "eleitores_delete_authorized"
  on public.eleitores for delete to authenticated
  using (
    app_private.can_act_for_user(vereador_id)
    or lideranca_usuario_id = (select auth.uid())
  );

create trigger eleitores_set_updated_at
  before update on public.eleitores
  for each row execute function app_private.set_updated_at();

commit;
