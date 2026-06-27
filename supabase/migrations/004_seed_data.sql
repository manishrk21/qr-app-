insert into restaurants (slug, name, description, city, currency_code, tax_rate, loyalty_streak_target, loyalty_reward_description)
values (
  'demo-cafe',
  'Demo Cafe',
  'Sample tenant for local development.',
  'Bengaluru',
  'INR',
  5.00,
  5,
  'Get one free drink on every fifth visit.'
)
on conflict (slug) do nothing;

with restaurant_row as (
  select id from restaurants where slug = 'demo-cafe' limit 1
)
insert into menu_categories (restaurant_id, name, description, display_order)
select id, 'Coffee', 'Signature coffee menu.', 1 from restaurant_row
on conflict (restaurant_id, name) do nothing;
