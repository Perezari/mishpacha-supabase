-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.families (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'המשפחה שלי'::text,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT families_pkey PRIMARY KEY (id),
  CONSTRAINT families_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.kids (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL,
  name text NOT NULL,
  age integer NOT NULL DEFAULT 8,
  avatar text NOT NULL DEFAULT '🐱'::text,
  goal_name text NOT NULL DEFAULT 'המטרה שלי'::text,
  goal_icon text NOT NULL DEFAULT '🎯'::text,
  goal_amount numeric NOT NULL DEFAULT 100,
  earned numeric NOT NULL DEFAULT 0,
  theme_id text NOT NULL DEFAULT 'A'::text,
  streak integer NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  last_streak_date date,
  CONSTRAINT kids_pkey PRIMARY KEY (id),
  CONSTRAINT kids_family_id_fkey FOREIGN KEY (family_id) REFERENCES public.families(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  role text NOT NULL DEFAULT 'parent'::text,
  theme_id text NOT NULL DEFAULT 'C'::text,
  family_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id),
  CONSTRAINT fk_family FOREIGN KEY (family_id) REFERENCES public.families(id)
);
CREATE TABLE public.purchases (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  kid_id uuid NOT NULL,
  family_id uuid NOT NULL,
  item_name text NOT NULL,
  item_icon text NOT NULL,
  item_price numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text,
  created_at timestamp with time zone DEFAULT now(),
  approved_at timestamp with time zone,
  CONSTRAINT purchases_pkey PRIMARY KEY (id),
  CONSTRAINT purchases_kid_id_fkey FOREIGN KEY (kid_id) REFERENCES public.kids(id),
  CONSTRAINT purchases_family_id_fkey FOREIGN KEY (family_id) REFERENCES public.families(id)
);
CREATE TABLE public.shop_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL,
  name text NOT NULL,
  icon text NOT NULL,
  price numeric NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT shop_items_pkey PRIMARY KEY (id),
  CONSTRAINT shop_items_family_id_fkey FOREIGN KEY (family_id) REFERENCES public.families(id)
);
CREATE TABLE public.tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  kid_id uuid NOT NULL,
  family_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  reward numeric NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'todo'::text,
  requires_approval boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  is_daily boolean NOT NULL DEFAULT false,
  CONSTRAINT tasks_pkey PRIMARY KEY (id),
  CONSTRAINT tasks_kid_id_fkey FOREIGN KEY (kid_id) REFERENCES public.kids(id),
  CONSTRAINT tasks_family_id_fkey FOREIGN KEY (family_id) REFERENCES public.families(id)
);