create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_restaurants_updated_at
before update on restaurants
for each row execute function set_updated_at();

create trigger trg_menu_categories_updated_at
before update on menu_categories
for each row execute function set_updated_at();

create trigger trg_menu_items_updated_at
before update on menu_items
for each row execute function set_updated_at();

create trigger trg_tables_updated_at
before update on tables
for each row execute function set_updated_at();

create trigger trg_orders_updated_at
before update on orders
for each row execute function set_updated_at();

create or replace function expire_old_otp_requests()
returns void
language sql
as $$
  delete from otp_requests
  where expires_at < now() or is_used = true;
$$;
