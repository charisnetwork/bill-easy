--
-- PostgreSQL database dump
--

\restrict uiW54g0dRCr6BCkOmS3Afp7LxGLd1nSPbJ1B6DGDhW7bSU8fpgWy1z6F5l6QPBE

-- Dumped from database version 17.8 (Debian 17.8-0+deb13u1)
-- Dumped by pg_dump version 17.8 (Debian 17.8-0+deb13u1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: enum_Affiliates_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Affiliates_status" AS ENUM (
    'active',
    'inactive',
    'pending'
);


ALTER TYPE public."enum_Affiliates_status" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Affiliates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Affiliates" (
    id uuid NOT NULL,
    company_name character varying(255) NOT NULL,
    contact_person character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    status public."enum_Affiliates_status" DEFAULT 'active'::public."enum_Affiliates_status",
    mobile_no character varying(255) NOT NULL
);


ALTER TABLE public."Affiliates" OWNER TO postgres;

--
-- Name: Coupons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Coupons" (
    id uuid NOT NULL,
    code character varying(255) NOT NULL,
    discount_percentage numeric(5,2) DEFAULT 0,
    is_active boolean DEFAULT true,
    valid_until timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Coupons" OWNER TO postgres;

--
-- Name: GlobalNotifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."GlobalNotifications" (
    id uuid NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    target_audience character varying(255) DEFAULT 'all'::character varying,
    sent_at timestamp with time zone
);


ALTER TABLE public."GlobalNotifications" OWNER TO postgres;

--
-- Name: PlatformExpenses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PlatformExpenses" (
    id uuid NOT NULL,
    category character varying(255) NOT NULL,
    amount numeric(12,2) NOT NULL,
    date date,
    description text
);


ALTER TABLE public."PlatformExpenses" OWNER TO postgres;

--
-- Data for Name: Affiliates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Affiliates" (id, company_name, contact_person, email, status, mobile_no) FROM stdin;
0c8ee53d-4f7e-4a0e-9469-b843ceb498f8	advita	advita	advita@gmail.com	active	8585858585
c7768cf3-dd9b-47b8-82ff-865bee28ba4a	Mystic aromatics 	Nivedhan Nempe 	Nivi@gmail.com	active	7700677766
b218f347-ebd4-4ffe-81dc-d6002da09f83	my	nivi	nivi@gmail.com	active	7112234564
63dc7b66-753d-43b3-94b3-34523ee9e6de	nivi	nivi	nivi@gmail.com	active	6987654123
e6084719-b3d2-494b-9d03-09ffd2286403	khojh	jijjknkl	hnjhn@gmail.com	active	9876543210
b03a3331-c365-4d45-9adc-e2f86cfc0d5f	ghyghj	fuvgffgy	jjhgjg@gmail.com	active	9876543210
\.


--
-- Data for Name: Coupons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Coupons" (id, code, discount_percentage, is_active, valid_until, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: GlobalNotifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."GlobalNotifications" (id, title, message, target_audience, sent_at) FROM stdin;
\.


--
-- Data for Name: PlatformExpenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PlatformExpenses" (id, category, amount, date, description) FROM stdin;
\.


--
-- Name: Affiliates Affiliates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Affiliates"
    ADD CONSTRAINT "Affiliates_pkey" PRIMARY KEY (id);


--
-- Name: Coupons Coupons_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Coupons"
    ADD CONSTRAINT "Coupons_code_key" UNIQUE (code);


--
-- Name: Coupons Coupons_code_key1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Coupons"
    ADD CONSTRAINT "Coupons_code_key1" UNIQUE (code);


--
-- Name: Coupons Coupons_code_key10; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Coupons"
    ADD CONSTRAINT "Coupons_code_key10" UNIQUE (code);


--
-- Name: Coupons Coupons_code_key11; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Coupons"
    ADD CONSTRAINT "Coupons_code_key11" UNIQUE (code);


--
-- Name: Coupons Coupons_code_key2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Coupons"
    ADD CONSTRAINT "Coupons_code_key2" UNIQUE (code);


--
-- Name: Coupons Coupons_code_key3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Coupons"
    ADD CONSTRAINT "Coupons_code_key3" UNIQUE (code);


--
-- Name: Coupons Coupons_code_key4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Coupons"
    ADD CONSTRAINT "Coupons_code_key4" UNIQUE (code);


--
-- Name: Coupons Coupons_code_key5; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Coupons"
    ADD CONSTRAINT "Coupons_code_key5" UNIQUE (code);


--
-- Name: Coupons Coupons_code_key6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Coupons"
    ADD CONSTRAINT "Coupons_code_key6" UNIQUE (code);


--
-- Name: Coupons Coupons_code_key7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Coupons"
    ADD CONSTRAINT "Coupons_code_key7" UNIQUE (code);


--
-- Name: Coupons Coupons_code_key8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Coupons"
    ADD CONSTRAINT "Coupons_code_key8" UNIQUE (code);


--
-- Name: Coupons Coupons_code_key9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Coupons"
    ADD CONSTRAINT "Coupons_code_key9" UNIQUE (code);


--
-- Name: Coupons Coupons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Coupons"
    ADD CONSTRAINT "Coupons_pkey" PRIMARY KEY (id);


--
-- Name: GlobalNotifications GlobalNotifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."GlobalNotifications"
    ADD CONSTRAINT "GlobalNotifications_pkey" PRIMARY KEY (id);


--
-- Name: PlatformExpenses PlatformExpenses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PlatformExpenses"
    ADD CONSTRAINT "PlatformExpenses_pkey" PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

\unrestrict uiW54g0dRCr6BCkOmS3Afp7LxGLd1nSPbJ1B6DGDhW7bSU8fpgWy1z6F5l6QPBE

