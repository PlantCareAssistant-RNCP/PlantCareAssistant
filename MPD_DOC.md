## Our Raw SQL commands for creating our Database

-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.COMMENT (
  comment_id integer NOT NULL DEFAULT nextval('"COMMENT_comment_id_seq"'::regclass),
  content text NOT NULL,
  user_id uuid NOT NULL,
  post_id integer NOT NULL,
  photo text,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone,
  deleted_at timestamp without time zone,
  CONSTRAINT COMMENT_pkey PRIMARY KEY (comment_id),
  CONSTRAINT COMMENT_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.POST(post_id),
  CONSTRAINT COMMENT_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.USER_PROFILE(id)
);

CREATE TABLE public.EVENT (
  id integer NOT NULL DEFAULT nextval('"EVENT_id_seq"'::regclass),
  title text NOT NULL,
  start timestamp without time zone NOT NULL,
  end timestamp without time zone,
  userId uuid NOT NULL,
  plantId integer,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  isRecurringInstance boolean NOT NULL DEFAULT false,
  parentEventId integer,
  recurringDaysOfWeek text,
  recurringEndDate timestamp without time zone,
  recurringInterval integer,
  recurringPattern text,
  CONSTRAINT EVENT_pkey PRIMARY KEY (id),
  CONSTRAINT EVENT_userId_fkey FOREIGN KEY (userId) REFERENCES public.USER_PROFILE(id),
  CONSTRAINT EVENT_plantId_fkey FOREIGN KEY (plantId) REFERENCES public.PLANT(plant_id),
  CONSTRAINT EVENT_parentEventId_fkey FOREIGN KEY (parentEventId) REFERENCES public.EVENT(id)
);

CREATE TABLE public.LIKES (
  post_id integer NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at timestamp without time zone,
  CONSTRAINT LIKES_pkey PRIMARY KEY (user_id, post_id),
  CONSTRAINT LIKES_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.USER_PROFILE(id),
  CONSTRAINT LIKES_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.POST(post_id)
);

CREATE TABLE public.PLANT (
  plant_id integer NOT NULL DEFAULT nextval('"PLANT_plant_id_seq"'::regclass),
  plant_name text NOT NULL,
  user_id uuid NOT NULL,
  plant_type_id integer NOT NULL,
  photo text NOT NULL,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone,
  deleted_at timestamp without time zone,
  CONSTRAINT PLANT_pkey PRIMARY KEY (plant_id),
  CONSTRAINT PLANT_plant_type_id_fkey FOREIGN KEY (plant_type_id) REFERENCES public.PLANT_TYPE(plant_type_id),
  CONSTRAINT PLANT_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.USER_PROFILE(id)
);

CREATE TABLE public.PLANT_TYPE (
  plant_type_id integer NOT NULL DEFAULT nextval('"PLANT_TYPE_plant_type_id_seq"'::regclass),
  plant_type_name text NOT NULL,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone,
  deleted_at timestamp without time zone,
  CONSTRAINT PLANT_TYPE_pkey PRIMARY KEY (plant_type_id)
);

CREATE TABLE public.POST (
  post_id integer NOT NULL DEFAULT nextval('"POST_post_id_seq"'::regclass),
  title text NOT NULL,
  content text NOT NULL,
  photo text,
  user_id uuid NOT NULL,
  plant_id integer NOT NULL,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone,
  deleted_at timestamp without time zone,
  CONSTRAINT POST_pkey PRIMARY KEY (post_id),
  CONSTRAINT POST_plant_id_fkey FOREIGN KEY (plant_id) REFERENCES public.PLANT(plant_id),
  CONSTRAINT POST_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.USER_PROFILE(id)
);

CREATE TABLE public.USERS_POST (
  user_id uuid NOT NULL,
  post_id integer NOT NULL,
  CONSTRAINT USERS_POST_pkey PRIMARY KEY (user_id, post_id),
  CONSTRAINT USERS_POST_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.POST(post_id),
  CONSTRAINT USERS_POST_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.USER_PROFILE(id)
);

CREATE TABLE public.USER_PLANT (
  user_id uuid NOT NULL,
  plant_id integer NOT NULL,
  CONSTRAINT USER_PLANT_pkey PRIMARY KEY (user_id, plant_id),
  CONSTRAINT USER_PLANT_plant_id_fkey FOREIGN KEY (plant_id) REFERENCES public.PLANT(plant_id),
  CONSTRAINT USER_PLANT_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.USER_PROFILE(id)
);

CREATE TABLE public.USER_PROFILE (
  id uuid NOT NULL,
  username text NOT NULL,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone,
  deleted_at timestamp without time zone,
  isAdmin boolean NOT NULL DEFAULT false,
  CONSTRAINT USER_PROFILE_pkey PRIMARY KEY (id)
);

CREATE TABLE public._prisma_migrations (
  id character varying NOT NULL,
  checksum character varying NOT NULL,
  finished_at timestamp with time zone,
  migration_name character varying NOT NULL,
  logs text,
  rolled_back_at timestamp with time zone,
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  applied_steps_count integer NOT NULL DEFAULT 0,
  CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id)
);