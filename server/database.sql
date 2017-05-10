--
-- PostgreSQL database dump
--

-- Dumped from database version 9.6.1
-- Dumped by pg_dump version 9.6.2

-- Started on 2017-05-10 19:04:23 EDT

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 1 (class 3079 OID 13277)
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- TOC entry 3122 (class 0 OID 0)
-- Dependencies: 1
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- TOC entry 186 (class 1259 OID 4639376)
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
-- TOC entry 200 (class 1259 OID 4640485)
-- Name: listings-saved_searches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "listings-saved_searches" (
    key_id bigint NOT NULL,
    listing_id bigint NOT NULL,
    saved_search_id bigint NOT NULL,
    creation_date timestamp with time zone DEFAULT now()
);


--
-- TOC entry 199 (class 1259 OID 4640483)
-- Name: listings-saved_searches_key_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "listings-saved_searches_key_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3123 (class 0 OID 0)
-- Dependencies: 199
-- Name: listings-saved_searches_key_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "listings-saved_searches_key_id_seq" OWNED BY "listings-saved_searches".key_id;


--
-- TOC entry 185 (class 1259 OID 4639374)
-- Name: listings_key_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE listings_key_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3124 (class 0 OID 0)
-- Dependencies: 185
-- Name: listings_key_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE listings_key_id_seq OWNED BY listings.key_id;


--
-- TOC entry 203 (class 1259 OID 7022049)
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
-- TOC entry 194 (class 1259 OID 4640388)
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
-- TOC entry 193 (class 1259 OID 4640386)
-- Name: saved_searches_key_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE saved_searches_key_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3125 (class 0 OID 0)
-- Dependencies: 193
-- Name: saved_searches_key_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE saved_searches_key_id_seq OWNED BY saved_searches.key_id;


--
-- TOC entry 188 (class 1259 OID 4639453)
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
-- TOC entry 187 (class 1259 OID 4639451)
-- Name: seeks_key_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE seeks_key_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3126 (class 0 OID 0)
-- Dependencies: 187
-- Name: seeks_key_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE seeks_key_id_seq OWNED BY seeks.key_id;


--
-- TOC entry 202 (class 1259 OID 5649584)
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
-- TOC entry 201 (class 1259 OID 5649582)
-- Name: starred_listings_key_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE starred_listings_key_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3127 (class 0 OID 0)
-- Dependencies: 201
-- Name: starred_listings_key_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE starred_listings_key_id_seq OWNED BY starred_listings.key_id;


--
-- TOC entry 192 (class 1259 OID 4639968)
-- Name: tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE tags (
    key_id bigint NOT NULL,
    creation_date timestamp with time zone DEFAULT now(),
    last_modification_date timestamp with time zone,
    name character varying(32) NOT NULL
);


--
-- TOC entry 196 (class 1259 OID 4640440)
-- Name: tags-listings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "tags-listings" (
    key_id bigint NOT NULL,
    creation_date timestamp with time zone DEFAULT now(),
    tag_id bigint NOT NULL,
    listing_id bigint NOT NULL
);


--
-- TOC entry 195 (class 1259 OID 4640438)
-- Name: tags-listings_key_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "tags-listings_key_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3128 (class 0 OID 0)
-- Dependencies: 195
-- Name: tags-listings_key_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "tags-listings_key_id_seq" OWNED BY "tags-listings".key_id;


--
-- TOC entry 198 (class 1259 OID 4640454)
-- Name: tags-saved_searches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "tags-saved_searches" (
    key_id bigint NOT NULL,
    creation_date timestamp with time zone DEFAULT now(),
    tag_id bigint NOT NULL,
    saved_search_id bigint NOT NULL
);


--
-- TOC entry 197 (class 1259 OID 4640452)
-- Name: tags-saved_searches_key_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "tags-saved_searches_key_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3129 (class 0 OID 0)
-- Dependencies: 197
-- Name: tags-saved_searches_key_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "tags-saved_searches_key_id_seq" OWNED BY "tags-saved_searches".key_id;


--
-- TOC entry 191 (class 1259 OID 4639966)
-- Name: tags_key_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE tags_key_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3130 (class 0 OID 0)
-- Dependencies: 191
-- Name: tags_key_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE tags_key_id_seq OWNED BY tags.key_id;


--
-- TOC entry 190 (class 1259 OID 4639697)
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
-- TOC entry 189 (class 1259 OID 4639695)
-- Name: users_key_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE users_key_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3131 (class 0 OID 0)
-- Dependencies: 189
-- Name: users_key_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE users_key_id_seq OWNED BY users.key_id;


--
-- TOC entry 2946 (class 2604 OID 4639379)
-- Name: listings key_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY listings ALTER COLUMN key_id SET DEFAULT nextval('listings_key_id_seq'::regclass);


--
-- TOC entry 2969 (class 2604 OID 4640488)
-- Name: listings-saved_searches key_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "listings-saved_searches" ALTER COLUMN key_id SET DEFAULT nextval('"listings-saved_searches_key_id_seq"'::regclass);


--
-- TOC entry 2962 (class 2604 OID 4640391)
-- Name: saved_searches key_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY saved_searches ALTER COLUMN key_id SET DEFAULT nextval('saved_searches_key_id_seq'::regclass);


--
-- TOC entry 2951 (class 2604 OID 4639456)
-- Name: seeks key_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY seeks ALTER COLUMN key_id SET DEFAULT nextval('seeks_key_id_seq'::regclass);


--
-- TOC entry 2971 (class 2604 OID 5649587)
-- Name: starred_listings key_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY starred_listings ALTER COLUMN key_id SET DEFAULT nextval('starred_listings_key_id_seq'::regclass);


--
-- TOC entry 2960 (class 2604 OID 4639971)
-- Name: tags key_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY tags ALTER COLUMN key_id SET DEFAULT nextval('tags_key_id_seq'::regclass);


--
-- TOC entry 2965 (class 2604 OID 4640443)
-- Name: tags-listings key_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "tags-listings" ALTER COLUMN key_id SET DEFAULT nextval('"tags-listings_key_id_seq"'::regclass);


--
-- TOC entry 2967 (class 2604 OID 4640457)
-- Name: tags-saved_searches key_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "tags-saved_searches" ALTER COLUMN key_id SET DEFAULT nextval('"tags-saved_searches_key_id_seq"'::regclass);


--
-- TOC entry 2955 (class 2604 OID 4639700)
-- Name: users key_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY users ALTER COLUMN key_id SET DEFAULT nextval('users_key_id_seq'::regclass);


--
-- TOC entry 2994 (class 2606 OID 4640491)
-- Name: listings-saved_searches listings-saved_searches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "listings-saved_searches"
    ADD CONSTRAINT "listings-saved_searches_pkey" PRIMARY KEY (key_id);


--
-- TOC entry 2978 (class 2606 OID 4639385)
-- Name: listings listings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY listings
    ADD CONSTRAINT listings_pkey PRIMARY KEY (key_id);


--
-- TOC entry 2998 (class 2606 OID 7022059)
-- Name: new_listings new_listings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY new_listings
    ADD CONSTRAINT new_listings_pkey PRIMARY KEY (key_id);


--
-- TOC entry 2988 (class 2606 OID 4640398)
-- Name: saved_searches saved_searches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY saved_searches
    ADD CONSTRAINT saved_searches_pkey PRIMARY KEY (key_id);


--
-- TOC entry 2980 (class 2606 OID 4639459)
-- Name: seeks seeks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY seeks
    ADD CONSTRAINT seeks_pkey PRIMARY KEY (key_id);


--
-- TOC entry 2996 (class 2606 OID 5649589)
-- Name: starred_listings starred_listings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY starred_listings
    ADD CONSTRAINT starred_listings_pkey PRIMARY KEY (key_id);


--
-- TOC entry 2990 (class 2606 OID 4640446)
-- Name: tags-listings tags-listings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "tags-listings"
    ADD CONSTRAINT "tags-listings_pkey" PRIMARY KEY (key_id);


--
-- TOC entry 2992 (class 2606 OID 4640460)
-- Name: tags-saved_searches tags-saved_searches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "tags-saved_searches"
    ADD CONSTRAINT "tags-saved_searches_pkey" PRIMARY KEY (key_id);


--
-- TOC entry 2984 (class 2606 OID 4639974)
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (key_id);


--
-- TOC entry 2986 (class 2606 OID 4640149)
-- Name: tags uniq_name; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY tags
    ADD CONSTRAINT uniq_name UNIQUE (name);


--
-- TOC entry 2982 (class 2606 OID 4639703)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_pkey PRIMARY KEY (key_id);


-- Completed on 2017-05-10 19:04:25 EDT

--
-- PostgreSQL database dump complete
--

