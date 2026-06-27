import type { Customer, MenuCategory, MenuItem, Order, Restaurant, Table } from "@menuflow/shared";

export type Database = {
  public: {
    Tables: {
      restaurants: {
        Row: Restaurant;
      };
      menu_categories: {
        Row: MenuCategory;
      };
      menu_items: {
        Row: MenuItem;
      };
      tables: {
        Row: Table;
      };
      customers: {
        Row: Customer;
      };
      orders: {
        Row: Order;
      };
    };
  };
};
