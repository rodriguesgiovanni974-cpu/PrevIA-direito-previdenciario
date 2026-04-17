-- Extensões
create extension if not exists "uuid-ossp";

-- CLIENTES
create table clientes (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  cpf text unique,
  telefone text,
  email text,
  data_nascimento date,
  sexo char(1) check (sexo in ('M', 'F')),
  created_at timestamptz default now()
);

-- CASOS
create table casos (
  id uuid primary key default uuid_generate_v4(),
  cliente_id uuid references clientes(id) on delete cascade,
  tipo_beneficio text not null,
  fase text not null default 'triagem',
  numero_processo text,
  tribunal text,
  probabilidade_exito integer check (probabilidade_exito between 0 and 100),
  score_risco integer check (score_risco between 0 and 100),
  salario_medio numeric(10,2),
  tempo_contribuicao_anos numeric(5,2),
  atividade_especial boolean default false,
  anos_especial integer,
  observacoes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- MOVIMENTAÇÕES
create table movimentacoes (
  id uuid primary key default uuid_generate_v4(),
  caso_id uuid references casos(id) on delete cascade,
  descricao text not null,
  descricao_simples text,
  data_movimentacao timestamptz not null,
  notificado_cliente boolean default false,
  created_at timestamptz default now()
);

-- PETIÇÕES
create table peticoes (
  id uuid primary key default uuid_generate_v4(),
  caso_id uuid references casos(id) on delete cascade,
  tipo text not null,
  conteudo text not null,
  status text default 'rascunho' check (status in ('rascunho','revisao','aprovada','protocolada')),
  created_at timestamptz default now()
);

-- PERÍCIAS
create table pericias (
  id uuid primary key default uuid_generate_v4(),
  caso_id uuid references casos(id) on delete cascade,
  data_hora timestamptz not null,
  local text not null,
  lembrete_enviado boolean default false,
  resultado text check (resultado in ('aprovada','negada','pendente')),
  created_at timestamptz default now()
);

-- MONITORAMENTOS (processos sendo acompanhados pelo agente)
create table monitoramentos (
  id uuid primary key default uuid_generate_v4(),
  caso_id uuid references casos(id) on delete cascade,
  numero_processo text not null,
  tribunal text not null,
  ultima_consulta timestamptz default now(),
  ativo boolean default true,
  created_at timestamptz default now()
);

-- Updated_at automático
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger casos_updated_at
  before update on casos
  for each row execute function set_updated_at();

-- RLS
alter table clientes enable row level security;
alter table casos enable row level security;
alter table movimentacoes enable row level security;
alter table peticoes enable row level security;
alter table pericias enable row level security;
alter table monitoramentos enable row level security;

-- Políticas (acesso total autenticado — refinar por escritório depois)
create policy "acesso autenticado" on clientes for all using (auth.role() = 'authenticated');
create policy "acesso autenticado" on casos for all using (auth.role() = 'authenticated');
create policy "acesso autenticado" on movimentacoes for all using (auth.role() = 'authenticated');
create policy "acesso autenticado" on peticoes for all using (auth.role() = 'authenticated');
create policy "acesso autenticado" on pericias for all using (auth.role() = 'authenticated');
create policy "acesso autenticado" on monitoramentos for all using (auth.role() = 'authenticated');
