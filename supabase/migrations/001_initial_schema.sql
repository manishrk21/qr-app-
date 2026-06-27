create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

create table if not exists restaurants (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  name text not null,
  description text,
  phone text,
  email text,
  address text,
  city text,
  state text,
  pincode text,
  currency_code text not null default 'INR',
  tax_rate numeric(5,2) not null default 5.00,
  logo_url text,
  is_active boolean not null default true,
  is_accepting_orders boolean not null default true,
  loyalty_streak_target integer not null default 5,
  loyalty_reward_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists restaurant_admins (
  id uuid primary key default uuid_generate_v4(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (restaurant_id),
  unique (user_id)
);

create table if not exists restaurant_branding (
  id uuid primary key default uuid_generate_v4(),
  restaurant_id uuid not null unique references restaurants(id) on delete cascade,
  primary_color text not null default '#111827',
  secondary_color text not null default '#f8fafc',
  accent_color text not null default '#f59e0b',
  font_family text not null default 'Space Grotesk',
  banner_url text,
  updated_at timestamptz not null default now()
);

create table if not exists menu_categories (
  id uuid primary key default uuid_generate_v4(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  name text not null,
  description text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

alter table menu_categories
  add constraint menu_categories_restaurant_name_unique unique (restaurant_id, name);

create table if not exists menu_items (
  id uuid primary key default uuid_generate_v4(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  category_id uuid not null references menu_categories(id) on delete restrict,
  name text not null,
  description text,
  price numeric(10,2) not null check (price >= 0),
  image_url text,
  food_type text not null default 'veg' check (food_type in ('veg', 'non_veg', 'egg')),
  is_available boolean not null default true,
  is_featured boolean not null default false,
  display_order integer not null default 0,
  allergens text[] not null default '{}',
  preparation_time_minutes integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists tables (
  id uuid primary key default uuid_generate_v4(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  label text not null,
  capacity integer,
  is_active boolean not null default true,
  qr_code_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (restaurant_id, label)
);

create table if not exists table_tokens (
  id uuid primary key default uuid_generate_v4(),
  table_id uuid not null references tables(id) on delete cascade,
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  token text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  expires_at timestamptz
);

create table if not exists customers (
  id uuid primary key default uuid_generate_v4(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  mobile_number text not null,
  name text,
  is_guest boolean not null default false,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (restaurant_id, mobile_number)
);

create table if not exists customer_sessions (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid not null references customers(id) on delete cascade,
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  session_token text not null unique,
  is_guest boolean not null default false,
  table_id uuid references tables(id),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create table if not exists otp_requests (
  id uuid primary key default uuid_generate_v4(),
  mobile_number text not null,
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  otp_hash text not null,
  attempts integer not null default 0,
  is_used boolean not null default false,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '10 minutes')
);

create table if not exists orders (
  id uuid primary key default uuid_generate_v4(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete restrict,
  table_id uuid references tables(id),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'paid', 'preparing', 'ready', 'served', 'completed', 'cancel_requested', 'cancelled')),
  subtotal numeric(10,2) not null default 0,
  tax_amount numeric(10,2) not null default 0,
  total_amount numeric(10,2) not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  menu_item_id uuid not null references menu_items(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  unit_price numeric(10,2) not null check (unit_price >= 0),
  line_total numeric(10,2) not null check (line_total >= 0),
  special_instructions text,
  cancelled_at timestamptz
);

create table if not exists loyalty_visits (
  id uuid primary key default uuid_generate_v4(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete cascade,
  order_id uuid not null references orders(id) on delete cascade,
  visited_at timestamptz not null default now(),
  unique (order_id)
);

create table if not exists loyalty_rewards (
  id uuid primary key default uuid_generate_v4(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete cascade,
  reward_text text not null,
  status text not null default 'issued' check (status in ('issued', 'redeemed', 'expired')),
  issued_at timestamptz not null default now(),
  redeemed_at timestamptz
);

create index if not exists idx_restaurants_slug on restaurants(slug) where deleted_at is null;
create index if not exists idx_menu_categories_restaurant on menu_categories(restaurant_id) where deleted_at is null;
create index if not exists idx_menu_items_restaurant on menu_items(restaurant_id) where deleted_at is null;
create index if not exists idx_menu_items_category on menu_items(category_id) where deleted_at is null;
create index if not exists idx_tables_restaurant on tables(restaurant_id) where deleted_at is null;
create index if not exists idx_customers_restaurant on customers(restaurant_id);
create index if not exists idx_orders_restaurant on orders(restaurant_id);
create index if not exists idx_order_items_order on order_items(order_id);
create index if not exists idx_otp_expires on otp_requests(expires_at);
