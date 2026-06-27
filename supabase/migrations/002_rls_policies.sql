alter table restaurants enable row level security;
alter table restaurant_admins enable row level security;
alter table restaurant_branding enable row level security;
alter table menu_categories enable row level security;
alter table menu_items enable row level security;
alter table tables enable row level security;
alter table table_tokens enable row level security;
alter table customers enable row level security;
alter table customer_sessions enable row level security;
alter table otp_requests enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table loyalty_visits enable row level security;
alter table loyalty_rewards enable row level security;

create or replace function is_restaurant_admin(target_restaurant_id uuid)
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1
    from restaurant_admins ra
    where ra.restaurant_id = target_restaurant_id
      and ra.user_id = auth.uid()
      and ra.is_active = true
  );
$$;

create policy "public read active restaurants"
on restaurants
for select
using (deleted_at is null and is_active = true);

create policy "admin manage own restaurant"
on restaurants
for all
using (is_restaurant_admin(id))
with check (is_restaurant_admin(id));

create policy "admin read own branding"
on restaurant_branding
for select
using (is_restaurant_admin(restaurant_id));

create policy "admin manage own branding"
on restaurant_branding
for all
using (is_restaurant_admin(restaurant_id))
with check (is_restaurant_admin(restaurant_id));

create policy "public read categories"
on menu_categories
for select
using (deleted_at is null);

create policy "admin manage categories"
on menu_categories
for all
using (is_restaurant_admin(restaurant_id))
with check (is_restaurant_admin(restaurant_id));

create policy "public read items"
on menu_items
for select
using (deleted_at is null and is_available = true);

create policy "admin manage items"
on menu_items
for all
using (is_restaurant_admin(restaurant_id))
with check (is_restaurant_admin(restaurant_id));

create policy "public read tables"
on tables
for select
using (deleted_at is null);

create policy "admin manage tables"
on tables
for all
using (is_restaurant_admin(restaurant_id))
with check (is_restaurant_admin(restaurant_id));

create policy "admin manage tokens"
on table_tokens
for all
using (is_restaurant_admin(restaurant_id))
with check (is_restaurant_admin(restaurant_id));

create policy "admin read customers"
on customers
for select
using (is_restaurant_admin(restaurant_id));

create policy "admin manage customers"
on customers
for all
using (is_restaurant_admin(restaurant_id))
with check (is_restaurant_admin(restaurant_id));

create policy "admin read sessions"
on customer_sessions
for select
using (is_restaurant_admin(restaurant_id));

create policy "admin manage sessions"
on customer_sessions
for all
using (is_restaurant_admin(restaurant_id))
with check (is_restaurant_admin(restaurant_id));

create policy "admin manage otp"
on otp_requests
for all
using (is_restaurant_admin(restaurant_id))
with check (is_restaurant_admin(restaurant_id));

create policy "admin read orders"
on orders
for select
using (is_restaurant_admin(restaurant_id));

create policy "admin manage orders"
on orders
for all
using (is_restaurant_admin(restaurant_id))
with check (is_restaurant_admin(restaurant_id));

create policy "admin read order items"
on order_items
for select
using (exists (select 1 from orders o where o.id = order_items.order_id and is_restaurant_admin(o.restaurant_id)));

create policy "admin manage order items"
on order_items
for all
using (exists (select 1 from orders o where o.id = order_items.order_id and is_restaurant_admin(o.restaurant_id)))
with check (exists (select 1 from orders o where o.id = order_items.order_id and is_restaurant_admin(o.restaurant_id)));

create policy "admin read loyalty visits"
on loyalty_visits
for select
using (is_restaurant_admin(restaurant_id));

create policy "admin manage loyalty visits"
on loyalty_visits
for all
using (is_restaurant_admin(restaurant_id))
with check (is_restaurant_admin(restaurant_id));

create policy "admin read loyalty rewards"
on loyalty_rewards
for select
using (is_restaurant_admin(restaurant_id));

create policy "admin manage loyalty rewards"
on loyalty_rewards
for all
using (is_restaurant_admin(restaurant_id))
with check (is_restaurant_admin(restaurant_id));
