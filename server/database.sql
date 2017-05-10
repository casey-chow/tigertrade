--
-- PostgreSQL database dump
--

-- Dumped from database version 9.6.1
-- Dumped by pg_dump version 9.6.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: listings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE listings (
    key_id bigint NOT NULL,
    creation_date timestamp with time zone DEFAULT now(),
    last_modification_date timestamp with time zone,
    title character varying(140) NOT NULL,
    description character varying(1000000),
    user_id bigint NOT NULL,
    price integer,
    status character varying(20),
    expiration_date timestamp with time zone,
    is_active boolean DEFAULT true,
    photos text[] DEFAULT '{}'::text[],
    thumbnail_url character varying(2084),
    keywords text[] DEFAULT '{}'::text[]
);


--
-- Name: listings-saved_searches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "listings-saved_searches" (
    key_id bigint NOT NULL,
    listing_id bigint NOT NULL,
    saved_search_id bigint NOT NULL,
    creation_date timestamp with time zone DEFAULT now()
);


--
-- Name: listings-saved_searches_key_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "listings-saved_searches_key_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: listings-saved_searches_key_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "listings-saved_searches_key_id_seq" OWNED BY "listings-saved_searches".key_id;


--
-- Name: listings_key_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE listings_key_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: listings_key_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE listings_key_id_seq OWNED BY listings.key_id;


--
-- Name: new_listings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE new_listings (
    key_id bigint NOT NULL,
    creation_date timestamp with time zone DEFAULT now(),
    last_modification_date timestamp with time zone,
    title character varying(140) NOT NULL,
    description character varying(1000000),
    user_id bigint NOT NULL,
    price integer,
    status character varying(20),
    expiration_date timestamp with time zone,
    is_active boolean DEFAULT true,
    photos text[] DEFAULT '{}'::text[],
    thumbnail_url character varying(2084)
);


--
-- Name: saved_searches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE saved_searches (
    key_id bigint NOT NULL,
    creation_date timestamp with time zone DEFAULT now(),
    last_modification_date timestamp with time zone,
    user_id bigint NOT NULL,
    query character varying(1024),
    min_price integer,
    max_price integer,
    listing_expiration_date timestamp with time zone,
    search_expiration_date timestamp with time zone,
    is_active boolean DEFAULT true
);


--
-- Name: saved_searches_key_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE saved_searches_key_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: saved_searches_key_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE saved_searches_key_id_seq OWNED BY saved_searches.key_id;


--
-- Name: seeks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE seeks (
    key_id bigint NOT NULL,
    creation_date timestamp with time zone DEFAULT now(),
    last_modification_date timestamp with time zone,
    title character varying(140) NOT NULL,
    description character varying(1000000),
    user_id bigint NOT NULL,
    saved_search_id bigint,
    notify_enabled boolean DEFAULT false,
    status character varying(20),
    is_active boolean DEFAULT true,
    thumbnail_url character varying(2084)
);


--
-- Name: seeks_key_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE seeks_key_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: seeks_key_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE seeks_key_id_seq OWNED BY seeks.key_id;


--
-- Name: starred_listings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE starred_listings (
    key_id bigint NOT NULL,
    creation_date timestamp with time zone DEFAULT now(),
    is_active boolean DEFAULT true,
    user_id bigint NOT NULL,
    listing_id bigint NOT NULL
);


--
-- Name: starred_listings_key_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE starred_listings_key_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: starred_listings_key_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE starred_listings_key_id_seq OWNED BY starred_listings.key_id;


--
-- Name: tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE tags (
    key_id bigint NOT NULL,
    creation_date timestamp with time zone DEFAULT now(),
    last_modification_date timestamp with time zone,
    name character varying(32) NOT NULL
);


--
-- Name: tags-listings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "tags-listings" (
    key_id bigint NOT NULL,
    creation_date timestamp with time zone DEFAULT now(),
    tag_id bigint NOT NULL,
    listing_id bigint NOT NULL
);


--
-- Name: tags-listings_key_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "tags-listings_key_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tags-listings_key_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "tags-listings_key_id_seq" OWNED BY "tags-listings".key_id;


--
-- Name: tags-saved_searches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "tags-saved_searches" (
    key_id bigint NOT NULL,
    creation_date timestamp with time zone DEFAULT now(),
    tag_id bigint NOT NULL,
    saved_search_id bigint NOT NULL
);


--
-- Name: tags-saved_searches_key_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "tags-saved_searches_key_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tags-saved_searches_key_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "tags-saved_searches_key_id_seq" OWNED BY "tags-saved_searches".key_id;


--
-- Name: tags_key_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE tags_key_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tags_key_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE tags_key_id_seq OWNED BY tags.key_id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE users (
    key_id bigint NOT NULL,
    creation_date timestamp with time zone DEFAULT now(),
    last_modification_date timestamp with time zone,
    net_id character varying(8) NOT NULL,
    domain text DEFAULT 'princeton.edu'::text,
    CONSTRAINT nonempty_net_id CHECK (((net_id)::text <> ''::text)),
    CONSTRAINT "positive key_id" CHECK ((key_id > 0))
);


--
-- Name: users_key_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE users_key_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_key_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE users_key_id_seq OWNED BY users.key_id;


--
-- Name: listings key_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY listings ALTER COLUMN key_id SET DEFAULT nextval('listings_key_id_seq'::regclass);


--
-- Name: listings-saved_searches key_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "listings-saved_searches" ALTER COLUMN key_id SET DEFAULT nextval('"listings-saved_searches_key_id_seq"'::regclass);


--
-- Name: saved_searches key_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY saved_searches ALTER COLUMN key_id SET DEFAULT nextval('saved_searches_key_id_seq'::regclass);


--
-- Name: seeks key_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY seeks ALTER COLUMN key_id SET DEFAULT nextval('seeks_key_id_seq'::regclass);


--
-- Name: starred_listings key_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY starred_listings ALTER COLUMN key_id SET DEFAULT nextval('starred_listings_key_id_seq'::regclass);


--
-- Name: tags key_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY tags ALTER COLUMN key_id SET DEFAULT nextval('tags_key_id_seq'::regclass);


--
-- Name: tags-listings key_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "tags-listings" ALTER COLUMN key_id SET DEFAULT nextval('"tags-listings_key_id_seq"'::regclass);


--
-- Name: tags-saved_searches key_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "tags-saved_searches" ALTER COLUMN key_id SET DEFAULT nextval('"tags-saved_searches_key_id_seq"'::regclass);


--
-- Name: users key_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY users ALTER COLUMN key_id SET DEFAULT nextval('users_key_id_seq'::regclass);


--
-- Name: listings-saved_searches listings-saved_searches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "listings-saved_searches"
    ADD CONSTRAINT "listings-saved_searches_pkey" PRIMARY KEY (key_id);


--
-- Name: listings listings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY listings
    ADD CONSTRAINT listings_pkey PRIMARY KEY (key_id);


--
-- Name: new_listings new_listings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY new_listings
    ADD CONSTRAINT new_listings_pkey PRIMARY KEY (key_id);


--
-- Name: saved_searches saved_searches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY saved_searches
    ADD CONSTRAINT saved_searches_pkey PRIMARY KEY (key_id);


--
-- Name: seeks seeks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY seeks
    ADD CONSTRAINT seeks_pkey PRIMARY KEY (key_id);


--
-- Name: starred_listings starred_listings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY starred_listings
    ADD CONSTRAINT starred_listings_pkey PRIMARY KEY (key_id);


--
-- Name: starred_listings starred_listings_user_id_listing_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY starred_listings
    ADD CONSTRAINT starred_listings_user_id_listing_id_key UNIQUE (user_id, listing_id);


--
-- Name: tags-listings tags-listings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "tags-listings"
    ADD CONSTRAINT "tags-listings_pkey" PRIMARY KEY (key_id);


--
-- Name: tags-saved_searches tags-saved_searches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "tags-saved_searches"
    ADD CONSTRAINT "tags-saved_searches_pkey" PRIMARY KEY (key_id);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (key_id);


--
-- Name: tags uniq_name; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY tags
    ADD CONSTRAINT uniq_name UNIQUE (name);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_pkey PRIMARY KEY (key_id);


--
-- PostgreSQL database dump complete
--

