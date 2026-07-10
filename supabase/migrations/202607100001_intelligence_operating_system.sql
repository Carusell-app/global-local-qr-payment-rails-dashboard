create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists source_registry (
  id text primary key,
  canonical_name text not null,
  aliases text[] not null default '{}',
  domain text not null,
  source_type text not null,
  trust_tier int not null check (trust_tier between 1 and 4),
  countries_covered text[] not null default '{}',
  languages text[] not null default '{}',
  topics text[] not null default '{}',
  ingestion_method text not null,
  feed_url text,
  endpoint_url text,
  crawl_frequency_minutes int not null default 720,
  parser_config jsonb not null default '{}'::jsonb,
  rate_limit_per_minute int not null default 6,
  enabled boolean not null default true,
  last_successful_fetch timestamptz,
  consecutive_failures int not null default 0,
  freshness_status text not null default 'unknown',
  provenance jsonb not null default '{}'::jsonb,
  confidence numeric not null default 0.5,
  last_verified_at timestamptz,
  review_status text not null default 'approved',
  change_history jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists source_candidates (
  id text primary key,
  canonical_name text not null,
  domain text not null,
  discovered_from_source_id text references source_registry(id),
  discovered_url text not null,
  candidate_type text not null default 'unknown',
  countries_covered text[] not null default '{}',
  languages text[] not null default '{}',
  topics text[] not null default '{}',
  evaluation jsonb not null default '{}'::jsonb,
  auto_activation_eligible boolean not null default false,
  provenance jsonb not null default '{}'::jsonb,
  confidence numeric not null default 0.1,
  last_verified_at timestamptz,
  review_status text not null default 'pending',
  change_history jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists source_fetch_state (
  source_id text primary key references source_registry(id),
  etag text,
  last_modified text,
  last_fetch_at timestamptz,
  next_fetch_after timestamptz,
  lease_owner text,
  lease_expires_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists ingestion_runs (
  id text primary key,
  job_type text not null,
  status text not null,
  source_id text references source_registry(id),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  documents_fetched int not null default 0,
  documents_created int not null default 0,
  duplicates int not null default 0,
  events_created int not null default 0,
  errors int not null default 0,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists ingestion_errors (
  id text primary key,
  ingestion_run_id text references ingestion_runs(id),
  source_id text references source_registry(id),
  url text,
  error_message text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists raw_documents (
  id text primary key,
  source_id text not null references source_registry(id),
  canonical_url text not null,
  normalized_url text not null,
  title text not null,
  publisher text,
  author text,
  publication_timestamp timestamptz,
  update_timestamp timestamptz,
  event_date date,
  language text,
  clean_text text not null,
  excerpt text,
  source_type text,
  original_country text,
  content_hash text not null,
  raw_snapshot text,
  provenance jsonb not null default '{}'::jsonb,
  confidence numeric not null default 0.5,
  last_verified_at timestamptz,
  review_status text not null default 'pending',
  change_history jsonb not null default '[]'::jsonb,
  search_tsv tsvector not null default ''::tsvector,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_id, normalized_url),
  unique (content_hash)
);

create table if not exists normalized_documents (
  id text primary key,
  raw_document_id text not null references raw_documents(id),
  document_type text not null,
  canonical_url text not null,
  title text not null,
  publication_timestamp timestamptz,
  affected_countries text[] not null default '{}',
  payment_rails text[] not null default '{}',
  companies text[] not null default '{}',
  regulators text[] not null default '{}',
  currencies text[] not null default '{}',
  topics text[] not null default '{}',
  clean_text text not null,
  excerpt text,
  content_hash text not null,
  provenance jsonb not null default '{}'::jsonb,
  confidence numeric not null default 0.5,
  last_verified_at timestamptz,
  review_status text not null default 'pending',
  change_history jsonb not null default '[]'::jsonb,
  search_tsv tsvector not null default ''::tsvector,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists story_clusters (
  id text primary key,
  canonical_name text not null,
  aliases text[] not null default '{}',
  primary_document_id text references normalized_documents(id),
  canonical_url text,
  earliest_publication_at timestamptz,
  authoritative_source_id text references source_registry(id),
  document_ids text[] not null default '{}',
  supporting_sources jsonb not null default '[]'::jsonb,
  conflicting_claims jsonb not null default '[]'::jsonb,
  provenance jsonb not null default '{}'::jsonb,
  confidence numeric not null default 0.5,
  last_verified_at timestamptz,
  review_status text not null default 'pending',
  change_history jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists news_items (
  id text primary key,
  story_cluster_id text references story_clusters(id),
  canonical_name text not null,
  canonical_url text,
  summary text,
  publisher text,
  publication_timestamp timestamptz,
  event_date date,
  affected_countries text[] not null default '{}',
  payment_rails text[] not null default '{}',
  companies text[] not null default '{}',
  event_type text,
  business_impact text,
  recommended_bd_action text,
  provenance jsonb not null default '{}'::jsonb,
  confidence numeric not null default 0.5,
  last_verified_at timestamptz,
  review_status text not null default 'pending',
  change_history jsonb not null default '[]'::jsonb,
  search_tsv tsvector not null default ''::tsvector,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists intelligence_events (
  id text primary key,
  canonical_name text not null,
  aliases text[] not null default '{}',
  event_type text not null,
  summary text not null,
  announcement_date timestamptz,
  event_date date,
  affected_countries text[] not null default '{}',
  origin_country text,
  destination_country text,
  payment_rails text[] not null default '{}',
  companies text[] not null default '{}',
  regulators text[] not null default '{}',
  currencies text[] not null default '{}',
  qr_mode text,
  use_cases text[] not null default '{}',
  previous_state text,
  new_state text,
  commercial_impact text,
  recommended_bd_action text,
  unresolved_questions text[] not null default '{}',
  provenance jsonb not null default '{}'::jsonb,
  confidence numeric not null default 0.5,
  confidence_reasons text[] not null default '{}',
  last_verified_at timestamptz,
  review_status text not null default 'pending',
  change_history jsonb not null default '[]'::jsonb,
  search_tsv tsvector not null default ''::tsvector,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists event_evidence (
  id text primary key,
  event_id text not null references intelligence_events(id) on delete cascade,
  source_id text references source_registry(id),
  source_url text not null,
  title text,
  evidence_text text,
  published_at timestamptz,
  trust_tier int,
  created_at timestamptz not null default now()
);

create table if not exists regions (
  id text primary key,
  canonical_name text not null,
  aliases text[] not null default '{}',
  provenance jsonb not null default '{}'::jsonb,
  confidence numeric not null default 0.5,
  last_verified_at timestamptz,
  review_status text not null default 'approved',
  change_history jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists currencies (
  id text primary key,
  canonical_name text not null,
  aliases text[] not null default '{}',
  code text not null unique,
  symbol text,
  provenance jsonb not null default '{}'::jsonb,
  confidence numeric not null default 0.5,
  last_verified_at timestamptz,
  review_status text not null default 'approved',
  change_history jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists countries (
  id text primary key,
  canonical_name text not null,
  aliases text[] not null default '{}',
  iso2 text,
  iso3 text,
  region_id text references regions(id),
  currency_id text references currencies(id),
  coordinates jsonb not null default '{}'::jsonb,
  provenance jsonb not null default '{}'::jsonb,
  confidence numeric not null default 0.5,
  last_verified_at timestamptz,
  review_status text not null default 'pending',
  change_history jsonb not null default '[]'::jsonb,
  search_tsv tsvector not null default ''::tsvector,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists payment_rails (
  id text primary key,
  canonical_name text not null,
  aliases text[] not null default '{}',
  country_id text references countries(id),
  rail_type text[] not null default '{}',
  operator_name text,
  regulator_name text,
  status text not null default 'unknown',
  qr_standard text,
  qr_modes text[] not null default '{}',
  use_cases text[] not null default '{}',
  provenance jsonb not null default '{}'::jsonb,
  confidence numeric not null default 0.5,
  last_verified_at timestamptz,
  review_status text not null default 'pending',
  change_history jsonb not null default '[]'::jsonb,
  search_tsv tsvector not null default ''::tsvector,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists companies (
  id text primary key,
  canonical_name text not null,
  aliases text[] not null default '{}',
  company_type text not null default 'unknown',
  website text,
  countries text[] not null default '{}',
  provenance jsonb not null default '{}'::jsonb,
  confidence numeric not null default 0.5,
  last_verified_at timestamptz,
  review_status text not null default 'pending',
  change_history jsonb not null default '[]'::jsonb,
  search_tsv tsvector not null default ''::tsvector,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists company_aliases (
  id text primary key,
  company_id text not null references companies(id) on delete cascade,
  alias text not null,
  provenance jsonb not null default '{}'::jsonb,
  confidence numeric not null default 0.5,
  last_verified_at timestamptz,
  review_status text not null default 'pending',
  change_history jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, alias)
);

create table if not exists regulators (
  id text primary key,
  canonical_name text not null,
  aliases text[] not null default '{}',
  country_id text references countries(id),
  website text,
  provenance jsonb not null default '{}'::jsonb,
  confidence numeric not null default 0.5,
  last_verified_at timestamptz,
  review_status text not null default 'pending',
  change_history jsonb not null default '[]'::jsonb,
  search_tsv tsvector not null default ''::tsvector,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists corridors (
  id text primary key,
  canonical_name text not null,
  aliases text[] not null default '{}',
  origin_country_id text references countries(id),
  destination_country_id text references countries(id),
  status text not null default 'unknown',
  directionality text not null default 'unknown',
  rails text[] not null default '{}',
  operators text[] not null default '{}',
  use_cases text[] not null default '{}',
  qr_modes text[] not null default '{}',
  settlement_model text,
  fx_model text,
  launch_date date,
  effective_date date,
  provenance jsonb not null default '{}'::jsonb,
  confidence numeric not null default 0.5,
  last_verified_at timestamptz,
  review_status text not null default 'pending',
  change_history jsonb not null default '[]'::jsonb,
  search_tsv tsvector not null default ''::tsvector,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists corridor_participants (
  id text primary key,
  corridor_id text not null references corridors(id) on delete cascade,
  participant_type text not null,
  participant_id text,
  canonical_name text not null,
  role text,
  provenance jsonb not null default '{}'::jsonb,
  confidence numeric not null default 0.5,
  last_verified_at timestamptz,
  review_status text not null default 'pending',
  change_history jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists entity_relationships (
  id text primary key,
  from_entity_type text not null,
  from_entity_id text not null,
  to_entity_type text not null,
  to_entity_id text not null,
  relationship_type text not null,
  status text not null default 'active',
  start_date date,
  end_date date,
  provenance jsonb not null default '{}'::jsonb,
  confidence numeric not null default 0.5,
  last_verified_at timestamptz,
  review_status text not null default 'pending',
  change_history jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists regulatory_requirements (
  id text primary key,
  canonical_name text not null,
  aliases text[] not null default '{}',
  country_id text references countries(id),
  regulator_id text references regulators(id),
  requirement_type text not null,
  applies_to text[] not null default '{}',
  status text not null default 'unknown',
  effective_date date,
  summary text not null,
  provenance jsonb not null default '{}'::jsonb,
  confidence numeric not null default 0.5,
  last_verified_at timestamptz,
  review_status text not null default 'pending',
  change_history jsonb not null default '[]'::jsonb,
  search_tsv tsvector not null default ''::tsvector,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists market_snapshots (
  id text primary key,
  country_id text references countries(id),
  snapshot_date date not null default current_date,
  rail_maturity numeric,
  merchant_coverage numeric,
  regulatory_openness numeric,
  psp_access numeric,
  cross_border_readiness numeric,
  crypto_compatibility numeric,
  payload jsonb not null default '{}'::jsonb,
  provenance jsonb not null default '{}'::jsonb,
  confidence numeric not null default 0.5,
  last_verified_at timestamptz,
  review_status text not null default 'pending',
  change_history jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (country_id, snapshot_date)
);

create table if not exists opportunity_scores (
  id text primary key,
  entity_type text not null,
  entity_id text not null,
  score numeric not null,
  components jsonb not null default '[]'::jsonb,
  weights jsonb not null default '{}'::jsonb,
  explanation text,
  recommended_action text,
  provenance jsonb not null default '{}'::jsonb,
  confidence numeric not null default 0.5,
  last_verified_at timestamptz,
  review_status text not null default 'pending',
  change_history jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists watchlists (
  id text primary key,
  canonical_name text not null,
  aliases text[] not null default '{}',
  description text,
  filters jsonb not null default '{}'::jsonb,
  owner_id text,
  provenance jsonb not null default '{}'::jsonb,
  confidence numeric not null default 1,
  last_verified_at timestamptz,
  review_status text not null default 'active',
  change_history jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists watchlist_items (
  id text primary key,
  watchlist_id text not null references watchlists(id) on delete cascade,
  entity_type text not null,
  entity_id text not null,
  keywords text[] not null default '{}',
  provenance jsonb not null default '{}'::jsonb,
  confidence numeric not null default 1,
  last_verified_at timestamptz,
  review_status text not null default 'active',
  change_history jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists alert_rules (
  id text primary key,
  canonical_name text not null,
  watchlist_id text references watchlists(id) on delete cascade,
  severity text not null default 'medium',
  channels text[] not null default '{in_app}',
  cadence text not null default 'immediate',
  dedupe_window_hours int not null default 24,
  enabled boolean not null default true,
  provenance jsonb not null default '{}'::jsonb,
  confidence numeric not null default 1,
  last_verified_at timestamptz,
  review_status text not null default 'active',
  change_history jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists generated_alerts (
  id text primary key,
  alert_rule_id text references alert_rules(id),
  watchlist_id text references watchlists(id),
  story_cluster_id text references story_clusters(id),
  event_id text references intelligence_events(id),
  severity text not null,
  title text not null,
  body text not null,
  delivered_channels text[] not null default '{}',
  read_at timestamptz,
  provenance jsonb not null default '{}'::jsonb,
  confidence numeric not null default 0.5,
  last_verified_at timestamptz,
  review_status text not null default 'generated',
  change_history jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists review_queue (
  id text primary key,
  entity_type text not null,
  entity_id text not null,
  reason text not null,
  priority int not null default 3,
  assigned_to text,
  status text not null default 'open',
  provenance jsonb not null default '{}'::jsonb,
  confidence numeric not null default 0.5,
  last_verified_at timestamptz,
  review_status text not null default 'pending',
  change_history jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists dashboard_projections (
  projection_type text not null,
  projection_id text not null,
  payload jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (projection_type, projection_id)
);

create table if not exists job_leases (
  job_name text primary key,
  lease_until timestamptz not null,
  holder text not null default gen_random_uuid()::text,
  updated_at timestamptz not null default now()
);

create or replace function try_acquire_job_lease(p_job_name text, p_ttl_seconds int)
returns table(acquired boolean)
language plpgsql
as $$
begin
  insert into job_leases(job_name, lease_until)
  values (p_job_name, now() + make_interval(secs => p_ttl_seconds))
  on conflict (job_name) do update
    set lease_until = excluded.lease_until,
        holder = gen_random_uuid()::text,
        updated_at = now()
    where job_leases.lease_until < now();

  return query
    select job_leases.lease_until >= now()
      and job_leases.updated_at > now() - interval '5 seconds'
    from job_leases
    where job_leases.job_name = p_job_name;
end;
$$;

create or replace function release_job_lease(p_job_name text)
returns void
language sql
as $$
  delete from job_leases where job_name = p_job_name;
$$;

create or replace function update_search_tsv()
returns trigger
language plpgsql
as $$
begin
  if TG_TABLE_NAME in ('raw_documents', 'normalized_documents') then
    new.search_tsv := to_tsvector('simple', coalesce(new.title, '') || ' ' || coalesce(new.excerpt, '') || ' ' || coalesce(new.clean_text, ''));
  elsif TG_TABLE_NAME = 'news_items' then
    new.search_tsv := to_tsvector('simple', coalesce(new.canonical_name, '') || ' ' || coalesce(new.summary, '') || ' ' || coalesce(new.business_impact, ''));
  elsif TG_TABLE_NAME = 'intelligence_events' then
    new.search_tsv := to_tsvector('simple', coalesce(new.canonical_name, '') || ' ' || coalesce(new.summary, '') || ' ' || coalesce(new.commercial_impact, ''));
  elsif TG_TABLE_NAME in ('countries', 'companies', 'regulators') then
    new.search_tsv := to_tsvector('simple', coalesce(new.canonical_name, '') || ' ' || array_to_string(new.aliases, ' '));
  elsif TG_TABLE_NAME = 'payment_rails' then
    new.search_tsv := to_tsvector('simple', coalesce(new.canonical_name, '') || ' ' || coalesce(new.operator_name, '') || ' ' || array_to_string(new.aliases, ' '));
  elsif TG_TABLE_NAME = 'corridors' then
    new.search_tsv := to_tsvector('simple', coalesce(new.canonical_name, '') || ' ' || array_to_string(new.rails, ' ') || ' ' || array_to_string(new.operators, ' '));
  elsif TG_TABLE_NAME = 'regulatory_requirements' then
    new.search_tsv := to_tsvector('simple', coalesce(new.canonical_name, '') || ' ' || coalesce(new.summary, ''));
  end if;

  return new;
end;
$$;

create index if not exists source_registry_domain_idx on source_registry(domain);
create index if not exists source_registry_enabled_idx on source_registry(enabled, trust_tier);
create index if not exists source_fetch_state_next_fetch_idx on source_fetch_state(next_fetch_after);
create index if not exists ingestion_runs_started_idx on ingestion_runs(started_at desc, status);
create index if not exists ingestion_errors_source_idx on ingestion_errors(source_id, created_at desc);
create index if not exists raw_documents_publication_idx on raw_documents(publication_timestamp desc);
create index if not exists raw_documents_canonical_url_idx on raw_documents(canonical_url);
create index if not exists raw_documents_content_hash_idx on raw_documents(content_hash);
create index if not exists raw_documents_search_idx on raw_documents using gin(search_tsv);
create index if not exists normalized_documents_publication_idx on normalized_documents(publication_timestamp desc);
create index if not exists normalized_documents_country_idx on normalized_documents using gin(affected_countries);
create index if not exists normalized_documents_rails_idx on normalized_documents using gin(payment_rails);
create index if not exists normalized_documents_companies_idx on normalized_documents using gin(companies);
create index if not exists normalized_documents_search_idx on normalized_documents using gin(search_tsv);
create index if not exists story_clusters_publication_idx on story_clusters(earliest_publication_at desc);
create index if not exists news_items_publication_idx on news_items(publication_timestamp desc);
create index if not exists news_items_search_idx on news_items using gin(search_tsv);
create index if not exists intelligence_events_event_type_idx on intelligence_events(event_type);
create index if not exists intelligence_events_event_date_idx on intelligence_events(event_date desc);
create index if not exists intelligence_events_country_idx on intelligence_events using gin(affected_countries);
create index if not exists intelligence_events_rails_idx on intelligence_events using gin(payment_rails);
create index if not exists intelligence_events_confidence_idx on intelligence_events(confidence desc);
create index if not exists intelligence_events_search_idx on intelligence_events using gin(search_tsv);
create index if not exists event_evidence_event_idx on event_evidence(event_id);
create index if not exists countries_region_idx on countries(region_id);
create index if not exists countries_search_idx on countries using gin(search_tsv);
create index if not exists payment_rails_country_idx on payment_rails(country_id);
create index if not exists payment_rails_search_idx on payment_rails using gin(search_tsv);
create index if not exists companies_search_idx on companies using gin(search_tsv);
create index if not exists regulators_search_idx on regulators using gin(search_tsv);
create index if not exists corridors_status_idx on corridors(status);
create index if not exists corridors_origin_destination_idx on corridors(origin_country_id, destination_country_id);
create index if not exists corridors_search_idx on corridors using gin(search_tsv);
create index if not exists regulatory_requirements_country_idx on regulatory_requirements(country_id, effective_date desc);
create index if not exists regulatory_requirements_search_idx on regulatory_requirements using gin(search_tsv);
create index if not exists market_snapshots_country_date_idx on market_snapshots(country_id, snapshot_date desc);
create index if not exists opportunity_scores_entity_idx on opportunity_scores(entity_type, entity_id, score desc);
create index if not exists generated_alerts_created_idx on generated_alerts(created_at desc, severity);
create index if not exists review_queue_status_idx on review_queue(status, priority, created_at);
create index if not exists dashboard_projections_type_updated_idx on dashboard_projections(projection_type, updated_at desc);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'source_registry','source_candidates','raw_documents','normalized_documents','story_clusters','news_items',
    'intelligence_events','regions','currencies','countries','payment_rails','companies','company_aliases',
    'regulators','corridors','corridor_participants','entity_relationships','regulatory_requirements',
    'market_snapshots','opportunity_scores','watchlists','watchlist_items','alert_rules','generated_alerts','review_queue'
  ]
  loop
    execute format('drop trigger if exists %I_set_updated_at on %I', table_name, table_name);
    execute format('create trigger %I_set_updated_at before update on %I for each row execute function set_updated_at()', table_name, table_name);
  end loop;
end;
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'raw_documents','normalized_documents','news_items','intelligence_events','countries',
    'payment_rails','companies','regulators','corridors','regulatory_requirements'
  ]
  loop
    execute format('drop trigger if exists %I_update_search_tsv on %I', table_name, table_name);
    execute format('create trigger %I_update_search_tsv before insert or update on %I for each row execute function update_search_tsv()', table_name, table_name);
  end loop;
end;
$$;
