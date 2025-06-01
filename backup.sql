--
-- PostgreSQL database dump
--

-- Dumped from database version 13.21 (Debian 13.21-1.pgdg120+1)
-- Dumped by pg_dump version 13.21 (Debian 13.21-1.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);


ALTER TABLE public.alembic_version OWNER TO postgres;

--
-- Name: currencies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.currencies (
    id integer NOT NULL,
    code character varying(10) NOT NULL,
    name character varying(50) NOT NULL,
    description text,
    is_crypto boolean NOT NULL
);


ALTER TABLE public.currencies OWNER TO postgres;

--
-- Name: currencies_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.currencies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.currencies_id_seq OWNER TO postgres;

--
-- Name: currencies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.currencies_id_seq OWNED BY public.currencies.id;


--
-- Name: currency_alerts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.currency_alerts (
    id integer NOT NULL,
    user_id integer NOT NULL,
    currency_id integer NOT NULL,
    is_active boolean NOT NULL,
    notification_time time without time zone NOT NULL,
    notification_channel character varying(10) NOT NULL
);


ALTER TABLE public.currency_alerts OWNER TO postgres;

--
-- Name: currency_alerts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.currency_alerts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.currency_alerts_id_seq OWNER TO postgres;

--
-- Name: currency_alerts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.currency_alerts_id_seq OWNED BY public.currency_alerts.id;


--
-- Name: exchange_rates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.exchange_rates (
    id integer NOT NULL,
    currency_id integer NOT NULL,
    rate numeric(20,8) NOT NULL,
    "timestamp" timestamp without time zone NOT NULL,
    source character varying(50) NOT NULL
);


ALTER TABLE public.exchange_rates OWNER TO postgres;

--
-- Name: exchange_rates_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.exchange_rates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.exchange_rates_id_seq OWNER TO postgres;

--
-- Name: exchange_rates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.exchange_rates_id_seq OWNED BY public.exchange_rates.id;


--
-- Name: portfolio_alerts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.portfolio_alerts (
    id integer NOT NULL,
    user_id integer NOT NULL,
    portfolio_id integer NOT NULL,
    threshold numeric(10,4),
    is_active boolean NOT NULL,
    notification_channel character varying(10) NOT NULL
);


ALTER TABLE public.portfolio_alerts OWNER TO postgres;

--
-- Name: portfolio_alerts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.portfolio_alerts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.portfolio_alerts_id_seq OWNER TO postgres;

--
-- Name: portfolio_alerts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.portfolio_alerts_id_seq OWNED BY public.portfolio_alerts.id;


--
-- Name: portfolio_positions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.portfolio_positions (
    id integer NOT NULL,
    portfolio_id integer NOT NULL,
    currency_id integer NOT NULL,
    amount numeric(20,8) NOT NULL,
    purchase_rate numeric(20,8) NOT NULL,
    purchased_at timestamp without time zone NOT NULL
);


ALTER TABLE public.portfolio_positions OWNER TO postgres;

--
-- Name: portfolio_positions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.portfolio_positions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.portfolio_positions_id_seq OWNER TO postgres;

--
-- Name: portfolio_positions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.portfolio_positions_id_seq OWNED BY public.portfolio_positions.id;


--
-- Name: portfolios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.portfolios (
    id integer NOT NULL,
    user_id integer NOT NULL,
    name character varying(100) NOT NULL,
    created_at date NOT NULL
);


ALTER TABLE public.portfolios OWNER TO postgres;

--
-- Name: portfolios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.portfolios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.portfolios_id_seq OWNER TO postgres;

--
-- Name: portfolios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.portfolios_id_seq OWNED BY public.portfolios.id;


--
-- Name: transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transactions (
    id integer NOT NULL,
    user_id integer NOT NULL,
    currency_id integer NOT NULL,
    type character varying(4) NOT NULL,
    amount numeric(20,8) NOT NULL,
    rate numeric(20,8) NOT NULL,
    "timestamp" timestamp without time zone NOT NULL,
    portfolio_id integer
);


ALTER TABLE public.transactions OWNER TO postgres;

--
-- Name: transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.transactions_id_seq OWNER TO postgres;

--
-- Name: transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.transactions_id_seq OWNED BY public.transactions.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    password_hash character varying(255) NOT NULL,
    created_at timestamp without time zone NOT NULL,
    is_active boolean NOT NULL,
    unique_id character varying(36) NOT NULL,
    balance numeric(10,2) NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: currencies id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.currencies ALTER COLUMN id SET DEFAULT nextval('public.currencies_id_seq'::regclass);


--
-- Name: currency_alerts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.currency_alerts ALTER COLUMN id SET DEFAULT nextval('public.currency_alerts_id_seq'::regclass);


--
-- Name: exchange_rates id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exchange_rates ALTER COLUMN id SET DEFAULT nextval('public.exchange_rates_id_seq'::regclass);


--
-- Name: portfolio_alerts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.portfolio_alerts ALTER COLUMN id SET DEFAULT nextval('public.portfolio_alerts_id_seq'::regclass);


--
-- Name: portfolio_positions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.portfolio_positions ALTER COLUMN id SET DEFAULT nextval('public.portfolio_positions_id_seq'::regclass);


--
-- Name: portfolios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.portfolios ALTER COLUMN id SET DEFAULT nextval('public.portfolios_id_seq'::regclass);


--
-- Name: transactions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions ALTER COLUMN id SET DEFAULT nextval('public.transactions_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: alembic_version; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.alembic_version (version_num) FROM stdin;
3db473928776
\.


--
-- Data for Name: currencies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.currencies (id, code, name, description, is_crypto) FROM stdin;
5	BTC	Bitcoin	Первая и самая известная криптовалюта, созданная Сатоши Накамото в 2009 году. Использует технологию блокчейн и алгоритм Proof-of-Work.	t
6	SOL	Solana	Высокопроизводительный блокчейн с поддержкой смарт-контрактов. Использует гибридный механизм консенсуса Proof-of-History + Proof-of-Stake.	t
7	ETH	Ethereum	Платформа для умных контрактов и децентрализованных приложений. Создана Виталиком Бутериным. Использует алгоритм Proof-of-Stake после обновления The Merge.	t
8	TON	Toncoin	Криптовалюта экосистемы TON (The Open Network), изначально разрабатывавшейся Telegram. Быстрые и дешевые транзакции.	t
\.


--
-- Data for Name: currency_alerts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.currency_alerts (id, user_id, currency_id, is_active, notification_time, notification_channel) FROM stdin;
\.


--
-- Data for Name: exchange_rates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.exchange_rates (id, currency_id, rate, "timestamp", source) FROM stdin;
5	5	8646344.75290000	2025-05-23 16:15:00.67592	binance
6	7	203330.02180000	2025-05-23 16:15:00.701111	binance
7	6	14047.03830000	2025-05-23 16:15:00.722958	binance
8	8	241.36000000	2025-05-23 16:15:00.744805	binance
9	5	8657018.97110000	2025-05-23 16:20:00.672926	binance
10	7	203518.19800000	2025-05-23 16:20:00.698977	binance
11	6	14094.08230000	2025-05-23 16:20:00.727737	binance
12	8	241.67890000	2025-05-23 16:20:00.750737	binance
13	5	8674907.67530000	2025-05-23 16:25:00.676326	binance
14	7	204432.76650000	2025-05-23 16:25:00.70057	binance
15	6	14149.10000000	2025-05-23 16:25:00.721802	binance
16	8	242.39650000	2025-05-23 16:25:00.742916	binance
17	5	8668166.02190000	2025-05-23 16:30:00.67606	binance
18	7	204108.24220000	2025-05-23 16:30:00.699918	binance
19	6	14155.47880000	2025-05-23 16:30:00.720766	binance
20	8	242.31680000	2025-05-23 16:30:00.74105	binance
21	5	8724819.83150000	2025-05-23 16:35:00.649919	binance
22	7	205680.63020000	2025-05-23 16:35:00.673452	binance
23	6	14300.59780000	2025-05-23 16:35:00.694682	binance
24	8	243.67230000	2025-05-23 16:35:00.715697	binance
25	5	8705543.72600000	2025-05-23 16:40:00.696722	binance
26	7	204850.58160000	2025-05-23 16:40:00.723932	binance
27	6	14249.56690000	2025-05-23 16:40:00.747863	binance
28	8	243.11410000	2025-05-23 16:40:00.76833	binance
\.


--
-- Data for Name: portfolio_alerts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.portfolio_alerts (id, user_id, portfolio_id, threshold, is_active, notification_channel) FROM stdin;
1	1	1	1.0000	t	telegram
\.


--
-- Data for Name: portfolio_positions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.portfolio_positions (id, portfolio_id, currency_id, amount, purchase_rate, purchased_at) FROM stdin;
\.


--
-- Data for Name: portfolios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.portfolios (id, user_id, name, created_at) FROM stdin;
1	1	123	2025-05-23
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transactions (id, user_id, currency_id, type, amount, rate, "timestamp", portfolio_id) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, email, password_hash, created_at, is_active, unique_id, balance) FROM stdin;
1	user	meindokuse@gmail.com	$2b$12$bh1edUVGf1howFybBJZZPeKnyKecnHCcIkqK0lmu99TI7DMGm2/Nu	2025-05-23 15:53:48.838332	t	bf63a6	1000000.00
\.


--
-- Name: currencies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.currencies_id_seq', 8, true);


--
-- Name: currency_alerts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.currency_alerts_id_seq', 1, false);


--
-- Name: exchange_rates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.exchange_rates_id_seq', 28, true);


--
-- Name: portfolio_alerts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.portfolio_alerts_id_seq', 1, true);


--
-- Name: portfolio_positions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.portfolio_positions_id_seq', 1, false);


--
-- Name: portfolios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.portfolios_id_seq', 1, true);


--
-- Name: transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.transactions_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


--
-- Name: alembic_version alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


--
-- Name: currencies currencies_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.currencies
    ADD CONSTRAINT currencies_code_key UNIQUE (code);


--
-- Name: currencies currencies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.currencies
    ADD CONSTRAINT currencies_pkey PRIMARY KEY (id);


--
-- Name: currency_alerts currency_alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.currency_alerts
    ADD CONSTRAINT currency_alerts_pkey PRIMARY KEY (id);


--
-- Name: exchange_rates exchange_rates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exchange_rates
    ADD CONSTRAINT exchange_rates_pkey PRIMARY KEY (id);


--
-- Name: portfolio_alerts portfolio_alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.portfolio_alerts
    ADD CONSTRAINT portfolio_alerts_pkey PRIMARY KEY (id);


--
-- Name: portfolio_positions portfolio_positions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.portfolio_positions
    ADD CONSTRAINT portfolio_positions_pkey PRIMARY KEY (id);


--
-- Name: portfolios portfolios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.portfolios
    ADD CONSTRAINT portfolios_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_unique_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_unique_id_key UNIQUE (unique_id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: ix_users_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_users_id ON public.users USING btree (id);


--
-- Name: currency_alerts currency_alerts_currency_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.currency_alerts
    ADD CONSTRAINT currency_alerts_currency_id_fkey FOREIGN KEY (currency_id) REFERENCES public.currencies(id);


--
-- Name: currency_alerts currency_alerts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.currency_alerts
    ADD CONSTRAINT currency_alerts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: exchange_rates exchange_rates_currency_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exchange_rates
    ADD CONSTRAINT exchange_rates_currency_id_fkey FOREIGN KEY (currency_id) REFERENCES public.currencies(id);


--
-- Name: portfolio_alerts portfolio_alerts_portfolio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.portfolio_alerts
    ADD CONSTRAINT portfolio_alerts_portfolio_id_fkey FOREIGN KEY (portfolio_id) REFERENCES public.portfolios(id) ON DELETE CASCADE;


--
-- Name: portfolio_alerts portfolio_alerts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.portfolio_alerts
    ADD CONSTRAINT portfolio_alerts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: portfolio_positions portfolio_positions_currency_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.portfolio_positions
    ADD CONSTRAINT portfolio_positions_currency_id_fkey FOREIGN KEY (currency_id) REFERENCES public.currencies(id);


--
-- Name: portfolio_positions portfolio_positions_portfolio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.portfolio_positions
    ADD CONSTRAINT portfolio_positions_portfolio_id_fkey FOREIGN KEY (portfolio_id) REFERENCES public.portfolios(id) ON DELETE CASCADE;


--
-- Name: portfolios portfolios_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.portfolios
    ADD CONSTRAINT portfolios_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: transactions transactions_currency_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_currency_id_fkey FOREIGN KEY (currency_id) REFERENCES public.currencies(id);


--
-- Name: transactions transactions_portfolio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_portfolio_id_fkey FOREIGN KEY (portfolio_id) REFERENCES public.portfolios(id) ON DELETE CASCADE;


--
-- Name: transactions transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

