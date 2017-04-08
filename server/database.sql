--
-- PostgreSQL database dump
--

-- Dumped from database version 9.6.1
-- Dumped by pg_dump version 9.6.1

-- Started on 2017-04-02 07:26:09 EDT

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
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- TOC entry 3119 (class 0 OID 0)
-- Dependencies: 1
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- TOC entry 186 (class 1259 OID 4639376)
-- Name: listings; Type: TABLE; Schema: public; Owner: evscqzpuxuvrje
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
    thumbnail_id bigint
);


ALTER TABLE listings OWNER TO evscqzpuxuvrje;

--
-- TOC entry 202 (class 1259 OID 4640485)
-- Name: listings-saved_searches; Type: TABLE; Schema: public; Owner: evscqzpuxuvrje
--

CREATE TABLE "listings-saved_searches" (
    key_id bigint NOT NULL,
    listing_id bigint NOT NULL,
    saved_search_id bigint NOT NULL,
    creation_date timestamp with time zone DEFAULT now()
);


ALTER TABLE "listings-saved_searches" OWNER TO evscqzpuxuvrje;

--
-- TOC entry 201 (class 1259 OID 4640483)
-- Name: listings-saved_searches_key_id_seq; Type: SEQUENCE; Schema: public; Owner: evscqzpuxuvrje
--

CREATE SEQUENCE "listings-saved_searches_key_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "listings-saved_searches_key_id_seq" OWNER TO evscqzpuxuvrje;

--
-- TOC entry 3121 (class 0 OID 0)
-- Dependencies: 201
-- Name: listings-saved_searches_key_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: evscqzpuxuvrje
--

ALTER SEQUENCE "listings-saved_searches_key_id_seq" OWNED BY "listings-saved_searches".key_id;


--
-- TOC entry 185 (class 1259 OID 4639374)
-- Name: listings_key_id_seq; Type: SEQUENCE; Schema: public; Owner: evscqzpuxuvrje
--

CREATE SEQUENCE listings_key_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE listings_key_id_seq OWNER TO evscqzpuxuvrje;

--
-- TOC entry 3122 (class 0 OID 0)
-- Dependencies: 185
-- Name: listings_key_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: evscqzpuxuvrje
--

ALTER SEQUENCE listings_key_id_seq OWNED BY listings.key_id;


--
-- TOC entry 194 (class 1259 OID 4640003)
-- Name: photos; Type: TABLE; Schema: public; Owner: evscqzpuxuvrje
--

CREATE TABLE photos (
    key_id bigint NOT NULL,
    creation_date timestamp with time zone DEFAULT now(),
    listing_id bigint NOT NULL,
    url character varying(2048) NOT NULL,
    "order" double precision
);


ALTER TABLE photos OWNER TO evscqzpuxuvrje;

--
-- TOC entry 193 (class 1259 OID 4640001)
-- Name: photos_key_id_seq; Type: SEQUENCE; Schema: public; Owner: evscqzpuxuvrje
--

CREATE SEQUENCE photos_key_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE photos_key_id_seq OWNER TO evscqzpuxuvrje;

--
-- TOC entry 3123 (class 0 OID 0)
-- Dependencies: 193
-- Name: photos_key_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: evscqzpuxuvrje
--

ALTER SEQUENCE photos_key_id_seq OWNED BY photos.key_id;


--
-- TOC entry 196 (class 1259 OID 4640388)
-- Name: saved_searches; Type: TABLE; Schema: public; Owner: evscqzpuxuvrje
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


ALTER TABLE saved_searches OWNER TO evscqzpuxuvrje;

--
-- TOC entry 195 (class 1259 OID 4640386)
-- Name: saved_searches_key_id_seq; Type: SEQUENCE; Schema: public; Owner: evscqzpuxuvrje
--

CREATE SEQUENCE saved_searches_key_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE saved_searches_key_id_seq OWNER TO evscqzpuxuvrje;

--
-- TOC entry 3124 (class 0 OID 0)
-- Dependencies: 195
-- Name: saved_searches_key_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: evscqzpuxuvrje
--

ALTER SEQUENCE saved_searches_key_id_seq OWNED BY saved_searches.key_id;


--
-- TOC entry 188 (class 1259 OID 4639453)
-- Name: seeks; Type: TABLE; Schema: public; Owner: evscqzpuxuvrje
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
    is_active boolean DEFAULT true
);


ALTER TABLE seeks OWNER TO evscqzpuxuvrje;

--
-- TOC entry 187 (class 1259 OID 4639451)
-- Name: seeks_key_id_seq; Type: SEQUENCE; Schema: public; Owner: evscqzpuxuvrje
--

CREATE SEQUENCE seeks_key_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE seeks_key_id_seq OWNER TO evscqzpuxuvrje;

--
-- TOC entry 3125 (class 0 OID 0)
-- Dependencies: 187
-- Name: seeks_key_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: evscqzpuxuvrje
--

ALTER SEQUENCE seeks_key_id_seq OWNED BY seeks.key_id;


--
-- TOC entry 192 (class 1259 OID 4639968)
-- Name: tags; Type: TABLE; Schema: public; Owner: evscqzpuxuvrje
--

CREATE TABLE tags (
    key_id bigint NOT NULL,
    creation_date timestamp with time zone DEFAULT now(),
    last_modification_date timestamp with time zone,
    name character varying(32) NOT NULL
);


ALTER TABLE tags OWNER TO evscqzpuxuvrje;

--
-- TOC entry 198 (class 1259 OID 4640440)
-- Name: tags-listings; Type: TABLE; Schema: public; Owner: evscqzpuxuvrje
--

CREATE TABLE "tags-listings" (
    key_id bigint NOT NULL,
    creation_date timestamp with time zone DEFAULT now(),
    tag_id bigint NOT NULL,
    listing_id bigint NOT NULL
);


ALTER TABLE "tags-listings" OWNER TO evscqzpuxuvrje;

--
-- TOC entry 197 (class 1259 OID 4640438)
-- Name: tags-listings_key_id_seq; Type: SEQUENCE; Schema: public; Owner: evscqzpuxuvrje
--

CREATE SEQUENCE "tags-listings_key_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "tags-listings_key_id_seq" OWNER TO evscqzpuxuvrje;

--
-- TOC entry 3126 (class 0 OID 0)
-- Dependencies: 197
-- Name: tags-listings_key_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: evscqzpuxuvrje
--

ALTER SEQUENCE "tags-listings_key_id_seq" OWNED BY "tags-listings".key_id;


--
-- TOC entry 200 (class 1259 OID 4640454)
-- Name: tags-saved_searches; Type: TABLE; Schema: public; Owner: evscqzpuxuvrje
--

CREATE TABLE "tags-saved_searches" (
    key_id bigint NOT NULL,
    creation_date timestamp with time zone DEFAULT now(),
    tag_id bigint NOT NULL,
    saved_search_id bigint NOT NULL
);


ALTER TABLE "tags-saved_searches" OWNER TO evscqzpuxuvrje;

--
-- TOC entry 199 (class 1259 OID 4640452)
-- Name: tags-saved_searches_key_id_seq; Type: SEQUENCE; Schema: public; Owner: evscqzpuxuvrje
--

CREATE SEQUENCE "tags-saved_searches_key_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "tags-saved_searches_key_id_seq" OWNER TO evscqzpuxuvrje;

--
-- TOC entry 3127 (class 0 OID 0)
-- Dependencies: 199
-- Name: tags-saved_searches_key_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: evscqzpuxuvrje
--

ALTER SEQUENCE "tags-saved_searches_key_id_seq" OWNED BY "tags-saved_searches".key_id;


--
-- TOC entry 191 (class 1259 OID 4639966)
-- Name: tags_key_id_seq; Type: SEQUENCE; Schema: public; Owner: evscqzpuxuvrje
--

CREATE SEQUENCE tags_key_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE tags_key_id_seq OWNER TO evscqzpuxuvrje;

--
-- TOC entry 3128 (class 0 OID 0)
-- Dependencies: 191
-- Name: tags_key_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: evscqzpuxuvrje
--

ALTER SEQUENCE tags_key_id_seq OWNED BY tags.key_id;


--
-- TOC entry 204 (class 1259 OID 4758080)
-- Name: thumbnails; Type: TABLE; Schema: public; Owner: evscqzpuxuvrje
--

CREATE TABLE thumbnails (
    key_id bigint NOT NULL,
    creation_date timestamp with time zone DEFAULT now(),
    last_modification_date timestamp with time zone,
    is_active boolean DEFAULT true,
    url character varying(2048) NOT NULL
);


ALTER TABLE thumbnails OWNER TO evscqzpuxuvrje;

--
-- TOC entry 203 (class 1259 OID 4758078)
-- Name: thumbnails_key_id_seq; Type: SEQUENCE; Schema: public; Owner: evscqzpuxuvrje
--

CREATE SEQUENCE thumbnails_key_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE thumbnails_key_id_seq OWNER TO evscqzpuxuvrje;

--
-- TOC entry 3129 (class 0 OID 0)
-- Dependencies: 203
-- Name: thumbnails_key_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: evscqzpuxuvrje
--

ALTER SEQUENCE thumbnails_key_id_seq OWNED BY thumbnails.key_id;


--
-- TOC entry 190 (class 1259 OID 4639697)
-- Name: users; Type: TABLE; Schema: public; Owner: evscqzpuxuvrje
--

CREATE TABLE users (
    key_id bigint NOT NULL,
    creation_date timestamp with time zone DEFAULT now(),
    last_modification_date timestamp with time zone,
    net_id character varying(8) NOT NULL
);


ALTER TABLE users OWNER TO evscqzpuxuvrje;

--
-- TOC entry 189 (class 1259 OID 4639695)
-- Name: users_key_id_seq; Type: SEQUENCE; Schema: public; Owner: evscqzpuxuvrje
--

CREATE SEQUENCE users_key_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE users_key_id_seq OWNER TO evscqzpuxuvrje;

--
-- TOC entry 3130 (class 0 OID 0)
-- Dependencies: 189
-- Name: users_key_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: evscqzpuxuvrje
--

ALTER SEQUENCE users_key_id_seq OWNED BY users.key_id;


--
-- TOC entry 2948 (class 2604 OID 4639379)
-- Name: listings key_id; Type: DEFAULT; Schema: public; Owner: evscqzpuxuvrje
--

ALTER TABLE ONLY listings ALTER COLUMN key_id SET DEFAULT nextval('listings_key_id_seq'::regclass);


--
-- TOC entry 2968 (class 2604 OID 4640488)
-- Name: listings-saved_searches key_id; Type: DEFAULT; Schema: public; Owner: evscqzpuxuvrje
--

ALTER TABLE ONLY "listings-saved_searches" ALTER COLUMN key_id SET DEFAULT nextval('"listings-saved_searches_key_id_seq"'::regclass);


--
-- TOC entry 2959 (class 2604 OID 4640006)
-- Name: photos key_id; Type: DEFAULT; Schema: public; Owner: evscqzpuxuvrje
--

ALTER TABLE ONLY photos ALTER COLUMN key_id SET DEFAULT nextval('photos_key_id_seq'::regclass);


--
-- TOC entry 2961 (class 2604 OID 4640391)
-- Name: saved_searches key_id; Type: DEFAULT; Schema: public; Owner: evscqzpuxuvrje
--

ALTER TABLE ONLY saved_searches ALTER COLUMN key_id SET DEFAULT nextval('saved_searches_key_id_seq'::regclass);


--
-- TOC entry 2951 (class 2604 OID 4639456)
-- Name: seeks key_id; Type: DEFAULT; Schema: public; Owner: evscqzpuxuvrje
--

ALTER TABLE ONLY seeks ALTER COLUMN key_id SET DEFAULT nextval('seeks_key_id_seq'::regclass);


--
-- TOC entry 2957 (class 2604 OID 4639971)
-- Name: tags key_id; Type: DEFAULT; Schema: public; Owner: evscqzpuxuvrje
--

ALTER TABLE ONLY tags ALTER COLUMN key_id SET DEFAULT nextval('tags_key_id_seq'::regclass);


--
-- TOC entry 2964 (class 2604 OID 4640443)
-- Name: tags-listings key_id; Type: DEFAULT; Schema: public; Owner: evscqzpuxuvrje
--

ALTER TABLE ONLY "tags-listings" ALTER COLUMN key_id SET DEFAULT nextval('"tags-listings_key_id_seq"'::regclass);


--
-- TOC entry 2966 (class 2604 OID 4640457)
-- Name: tags-saved_searches key_id; Type: DEFAULT; Schema: public; Owner: evscqzpuxuvrje
--

ALTER TABLE ONLY "tags-saved_searches" ALTER COLUMN key_id SET DEFAULT nextval('"tags-saved_searches_key_id_seq"'::regclass);


--
-- TOC entry 2970 (class 2604 OID 4758083)
-- Name: thumbnails key_id; Type: DEFAULT; Schema: public; Owner: evscqzpuxuvrje
--

ALTER TABLE ONLY thumbnails ALTER COLUMN key_id SET DEFAULT nextval('thumbnails_key_id_seq'::regclass);


--
-- TOC entry 2955 (class 2604 OID 4639700)
-- Name: users key_id; Type: DEFAULT; Schema: public; Owner: evscqzpuxuvrje
--

ALTER TABLE ONLY users ALTER COLUMN key_id SET DEFAULT nextval('users_key_id_seq'::regclass);


--
-- TOC entry 2992 (class 2606 OID 4640491)
-- Name: listings-saved_searches listings-saved_searches_pkey; Type: CONSTRAINT; Schema: public; Owner: evscqzpuxuvrje
--

ALTER TABLE ONLY "listings-saved_searches"
    ADD CONSTRAINT "listings-saved_searches_pkey" PRIMARY KEY (key_id);


--
-- TOC entry 2974 (class 2606 OID 4639385)
-- Name: listings listings_pkey; Type: CONSTRAINT; Schema: public; Owner: evscqzpuxuvrje
--

ALTER TABLE ONLY listings
    ADD CONSTRAINT listings_pkey PRIMARY KEY (key_id);


--
-- TOC entry 2984 (class 2606 OID 4640009)
-- Name: photos photos_pkey; Type: CONSTRAINT; Schema: public; Owner: evscqzpuxuvrje
--

ALTER TABLE ONLY photos
    ADD CONSTRAINT photos_pkey PRIMARY KEY (key_id);


--
-- TOC entry 2986 (class 2606 OID 4640398)
-- Name: saved_searches saved_searches_pkey; Type: CONSTRAINT; Schema: public; Owner: evscqzpuxuvrje
--

ALTER TABLE ONLY saved_searches
    ADD CONSTRAINT saved_searches_pkey PRIMARY KEY (key_id);


--
-- TOC entry 2976 (class 2606 OID 4639459)
-- Name: seeks seeks_pkey; Type: CONSTRAINT; Schema: public; Owner: evscqzpuxuvrje
--

ALTER TABLE ONLY seeks
    ADD CONSTRAINT seeks_pkey PRIMARY KEY (key_id);


--
-- TOC entry 2988 (class 2606 OID 4640446)
-- Name: tags-listings tags-listings_pkey; Type: CONSTRAINT; Schema: public; Owner: evscqzpuxuvrje
--

ALTER TABLE ONLY "tags-listings"
    ADD CONSTRAINT "tags-listings_pkey" PRIMARY KEY (key_id);


--
-- TOC entry 2990 (class 2606 OID 4640460)
-- Name: tags-saved_searches tags-saved_searches_pkey; Type: CONSTRAINT; Schema: public; Owner: evscqzpuxuvrje
--

ALTER TABLE ONLY "tags-saved_searches"
    ADD CONSTRAINT "tags-saved_searches_pkey" PRIMARY KEY (key_id);


--
-- TOC entry 2980 (class 2606 OID 4639974)
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: evscqzpuxuvrje
--

ALTER TABLE ONLY tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (key_id);


--
-- TOC entry 2994 (class 2606 OID 4758090)
-- Name: thumbnails thumbnails_pkey; Type: CONSTRAINT; Schema: public; Owner: evscqzpuxuvrje
--

ALTER TABLE ONLY thumbnails
    ADD CONSTRAINT thumbnails_pkey PRIMARY KEY (key_id);


--
-- TOC entry 2982 (class 2606 OID 4640149)
-- Name: tags uniq_name; Type: CONSTRAINT; Schema: public; Owner: evscqzpuxuvrje
--

ALTER TABLE ONLY tags
    ADD CONSTRAINT uniq_name UNIQUE (name);


--
-- TOC entry 2978 (class 2606 OID 4639703)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: evscqzpuxuvrje
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_pkey PRIMARY KEY (key_id);


--
-- TOC entry 3118 (class 0 OID 0)
-- Dependencies: 7
-- Name: public; Type: ACL; Schema: -; Owner: evscqzpuxuvrje
--

REVOKE ALL ON SCHEMA public FROM postgres;
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO evscqzpuxuvrje;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- TOC entry 3120 (class 0 OID 0)
-- Dependencies: 621
-- Name: plpgsql; Type: ACL; Schema: -; Owner: postgres
--

GRANT ALL ON LANGUAGE plpgsql TO evscqzpuxuvrje;


-- Completed on 2017-04-02 07:26:11 EDT

--
-- PostgreSQL database dump complete
--

