--
-- PostgreSQL database dump
--

SET statement_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: SequelizeMeta; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE "SequelizeMeta" (
    name character varying(255) NOT NULL
);


ALTER TABLE public."SequelizeMeta" OWNER TO postgres;

--
-- Name: bale_selections; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE bale_selections (
    id integer NOT NULL,
    sales_id integer,
    bale_id integer,
    print boolean DEFAULT false,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.bale_selections OWNER TO postgres;

--
-- Name: bale_selections_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE bale_selections_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.bale_selections_id_seq OWNER TO postgres;

--
-- Name: bale_selections_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE bale_selections_id_seq OWNED BY bale_selections.id;


--
-- Name: blocks; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE blocks (
    id integer NOT NULL,
    district_id integer,
    block_name character varying(255),
    block_status boolean DEFAULT true,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.blocks OWNER TO postgres;

--
-- Name: blocks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE blocks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.blocks_id_seq OWNER TO postgres;

--
-- Name: blocks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE blocks_id_seq OWNED BY blocks.id;


--
-- Name: brands; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE brands (
    id integer NOT NULL,
    brand_name character varying(255) NOT NULL,
    address character varying(255) NOT NULL,
    email character varying(255),
    programs_id integer[] NOT NULL,
    countries_id integer[] NOT NULL,
    website character varying(255),
    company_info character varying(255),
    contact_person character varying(255) NOT NULL,
    logo character varying(255),
    photo character varying(255),
    mobile character varying(255),
    landline character varying(255),
    "brandUser_id" integer[] NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    entity_limit double precision DEFAULT 0::double precision
);


ALTER TABLE public.brands OWNER TO postgres;

--
-- Name: brands_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE brands_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.brands_id_seq OWNER TO postgres;

--
-- Name: brands_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE brands_id_seq OWNED BY brands.id;


--
-- Name: cooperatives; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE cooperatives (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    address character varying(255) NOT NULL,
    country character varying(255) NOT NULL,
    contact_person character varying(255),
    mobile character varying(255),
    email character varying(255),
    status boolean DEFAULT true NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.cooperatives OWNER TO postgres;

--
-- Name: cooperatives_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE cooperatives_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.cooperatives_id_seq OWNER TO postgres;

--
-- Name: cooperatives_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE cooperatives_id_seq OWNED BY cooperatives.id;


--
-- Name: cotton_mixes; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE cotton_mixes (
    id integer NOT NULL,
    "cottonMix_name" character varying(255) NOT NULL,
    "cottonMix_status" boolean NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.cotton_mixes OWNER TO postgres;

--
-- Name: cotton_mixes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE cotton_mixes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.cotton_mixes_id_seq OWNER TO postgres;

--
-- Name: cotton_mixes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE cotton_mixes_id_seq OWNED BY cotton_mixes.id;


--
-- Name: cotton_selections; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE cotton_selections (
    id integer NOT NULL,
    process_id integer NOT NULL,
    transaction_id integer NOT NULL,
    qty_used double precision NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.cotton_selections OWNER TO postgres;

--
-- Name: cotton_selections_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE cotton_selections_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.cotton_selections_id_seq OWNER TO postgres;

--
-- Name: cotton_selections_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE cotton_selections_id_seq OWNED BY cotton_selections.id;


--
-- Name: countries; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE countries (
    id integer NOT NULL,
    county_name character varying(255) NOT NULL,
    country_status boolean DEFAULT true NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.countries OWNER TO postgres;

--
-- Name: countries_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE countries_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.countries_id_seq OWNER TO postgres;

--
-- Name: countries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE countries_id_seq OWNED BY countries.id;


--
-- Name: crop_grades; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE crop_grades (
    id integer NOT NULL,
    "cropVariety_id" integer,
    "cropGrade" character varying(255) NOT NULL,
    "cropGrade_status" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.crop_grades OWNER TO postgres;

--
-- Name: crop_grades_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE crop_grades_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.crop_grades_id_seq OWNER TO postgres;

--
-- Name: crop_grades_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE crop_grades_id_seq OWNED BY crop_grades.id;


--
-- Name: crop_types; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE crop_types (
    id integer NOT NULL,
    crop_id integer,
    "cropType_name" character varying(255) NOT NULL,
    "cropType_status" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.crop_types OWNER TO postgres;

--
-- Name: crop_types_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE crop_types_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.crop_types_id_seq OWNER TO postgres;

--
-- Name: crop_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE crop_types_id_seq OWNED BY crop_types.id;


--
-- Name: crop_varieties; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE crop_varieties (
    id integer NOT NULL,
    "cropType_id" integer,
    "cropVariety" character varying(255) NOT NULL,
    "cropVariety_status" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.crop_varieties OWNER TO postgres;

--
-- Name: crop_varieties_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE crop_varieties_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.crop_varieties_id_seq OWNER TO postgres;

--
-- Name: crop_varieties_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE crop_varieties_id_seq OWNED BY crop_varieties.id;


--
-- Name: crops; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE crops (
    id integer NOT NULL,
    crop_name character varying(255) NOT NULL,
    crop_status boolean DEFAULT true NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.crops OWNER TO postgres;

--
-- Name: crops_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE crops_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.crops_id_seq OWNER TO postgres;

--
-- Name: crops_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE crops_id_seq OWNED BY crops.id;


--
-- Name: departments; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE departments (
    id integer NOT NULL,
    dept_name character varying(255) NOT NULL,
    dept_status boolean DEFAULT true NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.departments OWNER TO postgres;

--
-- Name: departments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE departments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.departments_id_seq OWNER TO postgres;

--
-- Name: departments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE departments_id_seq OWNED BY departments.id;


--
-- Name: devices; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE devices (
    id integer NOT NULL,
    device_id character varying(255) NOT NULL,
    staff_name character varying(255) NOT NULL,
    user_id integer NOT NULL,
    entry_date timestamp with time zone,
    status boolean,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.devices OWNER TO postgres;

--
-- Name: devices_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE devices_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.devices_id_seq OWNER TO postgres;

--
-- Name: devices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE devices_id_seq OWNED BY devices.id;


--
-- Name: districts; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE districts (
    id integer NOT NULL,
    state_id integer,
    district_name character varying(255),
    district_status boolean DEFAULT true,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.districts OWNER TO postgres;

--
-- Name: districts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE districts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.districts_id_seq OWNER TO postgres;

--
-- Name: districts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE districts_id_seq OWNED BY districts.id;


--
-- Name: dyeings; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE dyeings (
    id integer NOT NULL,
    processor_name character varying(255) NOT NULL,
    dyeing_address character varying(255) NOT NULL,
    process_name character varying(255) NOT NULL,
    yarn_delivered double precision,
    process_loss double precision NOT NULL,
    net_yarn double precision,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.dyeings OWNER TO postgres;

--
-- Name: dyeings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE dyeings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.dyeings_id_seq OWNER TO postgres;

--
-- Name: dyeings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE dyeings_id_seq OWNED BY dyeings.id;


--
-- Name: email_managements; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE email_managements (
    id integer NOT NULL,
    template_id integer NOT NULL,
    mail_type character varying(255),
    user_categories integer[],
    program_ids integer[],
    brand_ids integer[],
    country_ids integer[],
    user_ids integer[],
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.email_managements OWNER TO postgres;

--
-- Name: email_managements_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE email_managements_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.email_managements_id_seq OWNER TO postgres;

--
-- Name: email_managements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE email_managements_id_seq OWNED BY email_managements.id;


--
-- Name: email_templates; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE email_templates (
    id integer NOT NULL,
    template_name character varying(255),
    file_name character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    mail_type character varying(255)[]
);


ALTER TABLE public.email_templates OWNER TO postgres;

--
-- Name: email_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE email_templates_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.email_templates_id_seq OWNER TO postgres;

--
-- Name: email_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE email_templates_id_seq OWNED BY email_templates.id;


--
-- Name: embroiderings; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE embroiderings (
    id integer NOT NULL,
    processor_name character varying(255) NOT NULL,
    address character varying(255) NOT NULL,
    process_name character varying(255) NOT NULL,
    no_of_pieces double precision,
    process_loss integer NOT NULL,
    final_no_of_pieces double precision,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.embroiderings OWNER TO postgres;

--
-- Name: embroiderings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE embroiderings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.embroiderings_id_seq OWNER TO postgres;

--
-- Name: embroiderings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE embroiderings_id_seq OWNED BY embroiderings.id;


--
-- Name: entity_limits; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE entity_limits (
    id integer NOT NULL,
    brand_id integer NOT NULL,
    "limit" integer,
    used integer,
    remaining integer,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.entity_limits OWNER TO postgres;

--
-- Name: entity_limits_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE entity_limits_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.entity_limits_id_seq OWNER TO postgres;

--
-- Name: entity_limits_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE entity_limits_id_seq OWNED BY entity_limits.id;


--
-- Name: fabric_compacting_processes; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE fabric_compacting_processes (
    id integer NOT NULL,
    fabric_id integer NOT NULL,
    season_id integer NOT NULL,
    date timestamp with time zone NOT NULL,
    program character varying(255) NOT NULL,
    order_ref character varying(255),
    choosen_buyer character varying(255) NOT NULL,
    buyer_name character varying(255),
    processor_name character varying(255),
    processor_address character varying(255),
    qty_kgs double precision NOT NULL,
    qty_woven_fabric double precision NOT NULL,
    process_weight character varying(255) NOT NULL,
    weight_gain_percent integer,
    weight_loss_percent integer,
    compacted_fabric_length character varying(255) NOT NULL,
    compacted_fabric_gsm character varying(255) NOT NULL,
    compacted_fabric_net_weight character varying(255),
    batch_lot_no character varying(255) NOT NULL,
    job_details_garment character varying(255),
    compacting_details character varying(255) NOT NULL,
    compact_type character varying(255),
    invoice_no character varying(255),
    order_details character varying(255),
    bill_of_ladding character varying(255),
    transport_info character varying(255),
    status character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.fabric_compacting_processes OWNER TO postgres;

--
-- Name: fabric_compacting_processes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE fabric_compacting_processes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.fabric_compacting_processes_id_seq OWNER TO postgres;

--
-- Name: fabric_compacting_processes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE fabric_compacting_processes_id_seq OWNED BY fabric_compacting_processes.id;


--
-- Name: fabric_dyeing_processes; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE fabric_dyeing_processes (
    id integer NOT NULL,
    fabric_id integer NOT NULL,
    season_id integer NOT NULL,
    date timestamp with time zone NOT NULL,
    program character varying(255) NOT NULL,
    order_ref character varying(255),
    choosen_buyer character varying(255) NOT NULL,
    buyer_name character varying(255),
    processor_name character varying(255),
    processor_address character varying(255),
    qty_kgs double precision NOT NULL,
    qty_woven_fabric double precision NOT NULL,
    process_weight character varying(255) NOT NULL,
    weight_gain_percent integer,
    weight_loss_percent integer,
    dying_details character varying(255) NOT NULL,
    dying_color character varying(255),
    dyed_fabric_length character varying(255) NOT NULL,
    dyed_fabric_gsm character varying(255) NOT NULL,
    dyed_fabric_net_weight character varying(255),
    batch_lot_no character varying(255) NOT NULL,
    job_details_garment character varying(255),
    invoice_no character varying(255),
    order_details character varying(255),
    bill_of_ladding character varying(255),
    transport_info character varying(255),
    status character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.fabric_dyeing_processes OWNER TO postgres;

--
-- Name: fabric_dyeing_processes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE fabric_dyeing_processes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.fabric_dyeing_processes_id_seq OWNER TO postgres;

--
-- Name: fabric_dyeing_processes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE fabric_dyeing_processes_id_seq OWNED BY fabric_dyeing_processes.id;


--
-- Name: fabric_printing_processes; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE fabric_printing_processes (
    id integer NOT NULL,
    fabric_id integer NOT NULL,
    season_id integer NOT NULL,
    date timestamp with time zone NOT NULL,
    program character varying(255) NOT NULL,
    order_ref character varying(255),
    choosen_buyer character varying(255) NOT NULL,
    buyer_name character varying(255),
    processor_name character varying(255),
    processor_address character varying(255),
    qty_kgs double precision NOT NULL,
    qty_woven_fabric double precision NOT NULL,
    process_weight character varying(255) NOT NULL,
    weight_gain_percent integer,
    weight_loss_percent integer,
    printing_details character varying(255),
    printing_type character varying(255) NOT NULL,
    printed_fabric_length character varying(255) NOT NULL,
    printed_fabric_gsm character varying(255) NOT NULL,
    printed_fabric_net_weight character varying(255),
    batch_lot_no character varying(255) NOT NULL,
    job_details_garment character varying(255),
    invoice_no character varying(255),
    order_details character varying(255),
    uploaded_pattern character varying(255),
    bill_of_ladding character varying(255),
    transport_info character varying(255),
    status character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.fabric_printing_processes OWNER TO postgres;

--
-- Name: fabric_printing_processes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE fabric_printing_processes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.fabric_printing_processes_id_seq OWNER TO postgres;

--
-- Name: fabric_printing_processes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE fabric_printing_processes_id_seq OWNED BY fabric_printing_processes.id;


--
-- Name: fabric_selections; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE fabric_selections (
    id integer NOT NULL,
    fabric_id integer,
    sales_id integer,
    type character varying(255),
    processor character varying(255),
    qty_used double precision,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.fabric_selections OWNER TO postgres;

--
-- Name: fabric_selections_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE fabric_selections_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.fabric_selections_id_seq OWNER TO postgres;

--
-- Name: fabric_selections_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE fabric_selections_id_seq OWNED BY fabric_selections.id;


--
-- Name: fabric_types; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE fabric_types (
    id integer NOT NULL,
    "fabricType_name" character varying(255) NOT NULL,
    "fabricType_status" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.fabric_types OWNER TO postgres;

--
-- Name: fabric_types_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE fabric_types_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.fabric_types_id_seq OWNER TO postgres;

--
-- Name: fabric_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE fabric_types_id_seq OWNED BY fabric_types.id;


--
-- Name: fabric_washing_processes; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE fabric_washing_processes (
    id integer NOT NULL,
    fabric_id integer NOT NULL,
    season_id integer NOT NULL,
    date timestamp with time zone NOT NULL,
    program character varying(255) NOT NULL,
    order_ref character varying(255),
    choosen_buyer character varying(255) NOT NULL,
    buyer_name character varying(255),
    processor_name character varying(255),
    processor_address character varying(255),
    qty_kgs double precision NOT NULL,
    qty_woven_fabric double precision NOT NULL,
    process_weight character varying(255) NOT NULL,
    weight_gain_percent integer,
    weight_loss_percent integer,
    washing_details character varying(255),
    washing_type character varying(255) NOT NULL,
    washed_fabric_length character varying(255) NOT NULL,
    washed_fabric_gsm character varying(255) NOT NULL,
    washed_fabric_net_weight character varying(255),
    batch_lot_no character varying(255) NOT NULL,
    job_details_garment character varying(255),
    invoice_no character varying(255),
    order_details character varying(255),
    bill_of_ladding character varying(255),
    transport_info character varying(255),
    status character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.fabric_washing_processes OWNER TO postgres;

--
-- Name: fabric_washing_processes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE fabric_washing_processes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.fabric_washing_processes_id_seq OWNER TO postgres;

--
-- Name: fabric_washing_processes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE fabric_washing_processes_id_seq OWNED BY fabric_washing_processes.id;


--
-- Name: fabrics; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE fabrics (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    address text NOT NULL,
    country_id integer NOT NULL,
    state_id integer NOT NULL,
    program_id integer[] NOT NULL,
    latitude character varying(255),
    longtude character varying(255),
    website character varying(255),
    contact_person character varying(255) NOT NULL,
    no_of_machines character varying(255),
    fabric_processor_type integer[] NOT NULL,
    prod_capt integer[],
    loss_from character varying(255),
    loss_to character varying(255),
    unit_cert integer[],
    company_info character varying(255),
    org_logo character varying(255),
    org_photo character varying(255),
    certs character varying(255),
    brand integer[] NOT NULL,
    mobile character varying(255),
    landline character varying(255),
    email character varying(255),
    "fabricUser_id" integer[] NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.fabrics OWNER TO postgres;

--
-- Name: fabrics_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE fabrics_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.fabrics_id_seq OWNER TO postgres;

--
-- Name: fabrics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE fabrics_id_seq OWNED BY fabrics.id;


--
-- Name: farm_groups; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE farm_groups (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    brand_id integer NOT NULL,
    status boolean DEFAULT true NOT NULL,
    latitude character varying(255),
    longitude character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.farm_groups OWNER TO postgres;

--
-- Name: farm_groups_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE farm_groups_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.farm_groups_id_seq OWNER TO postgres;

--
-- Name: farm_groups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE farm_groups_id_seq OWNED BY farm_groups.id;


--
-- Name: farm_items; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE farm_items (
    id integer NOT NULL,
    "farmItem" character varying(255) NOT NULL,
    "farmItem_status" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.farm_items OWNER TO postgres;

--
-- Name: farm_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE farm_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.farm_items_id_seq OWNER TO postgres;

--
-- Name: farm_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE farm_items_id_seq OWNED BY farm_items.id;


--
-- Name: farm_products; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE farm_products (
    id integer NOT NULL,
    "farmItem_id" integer,
    "farmProduct" character varying(255) NOT NULL,
    "farmProduct_status" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.farm_products OWNER TO postgres;

--
-- Name: farm_products_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE farm_products_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.farm_products_id_seq OWNER TO postgres;

--
-- Name: farm_products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE farm_products_id_seq OWNED BY farm_products.id;


--
-- Name: farmer_agri_areas; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE farmer_agri_areas (
    id integer NOT NULL,
    farmer_id integer NOT NULL,
    agri_total_area numeric,
    agri_estimated_yeld numeric,
    agri_estimated_prod numeric,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.farmer_agri_areas OWNER TO postgres;

--
-- Name: farmer_agri_areas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE farmer_agri_areas_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.farmer_agri_areas_id_seq OWNER TO postgres;

--
-- Name: farmer_agri_areas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE farmer_agri_areas_id_seq OWNED BY farmer_agri_areas.id;


--
-- Name: farmer_cotton_areas; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE farmer_cotton_areas (
    id integer NOT NULL,
    farmer_id integer NOT NULL,
    cotton_total_area numeric,
    total_estimated_cotton numeric,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.farmer_cotton_areas OWNER TO postgres;

--
-- Name: farmer_cotton_areas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE farmer_cotton_areas_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.farmer_cotton_areas_id_seq OWNER TO postgres;

--
-- Name: farmer_cotton_areas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE farmer_cotton_areas_id_seq OWNED BY farmer_cotton_areas.id;


--
-- Name: farmers; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE farmers (
    id integer NOT NULL,
    program_id integer,
    brand_id integer,
    "farmGroup_id" integer,
    "firstName" character varying(255),
    "lastName" character varying(255),
    code character varying(255),
    country_id integer NOT NULL,
    state_id integer NOT NULL,
    district_id integer NOT NULL,
    block_id integer NOT NULL,
    village_id integer,
    joining_date timestamp with time zone,
    ics_id integer,
    cert_status character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "qrUrl" character varying(255) DEFAULT ''::character varying,
    agri_total_area numeric,
    agri_estimated_yeld numeric,
    agri_estimated_prod numeric,
    cotton_total_area numeric,
    total_estimated_cotton numeric,
    tracenet_id character varying(255)
);


ALTER TABLE public.farmers OWNER TO postgres;

--
-- Name: farmers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE farmers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.farmers_id_seq OWNER TO postgres;

--
-- Name: farmers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE farmers_id_seq OWNED BY farmers.id;


--
-- Name: farms; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE farms (
    id integer NOT NULL,
    farmer_id integer NOT NULL,
    season_id integer NOT NULL,
    program_id integer NOT NULL,
    agri_total_area numeric,
    agri_estimated_yeld numeric,
    agri_estimated_prod numeric,
    cotton_total_area numeric,
    total_estimated_cotton numeric,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    cotton_transacted numeric
);


ALTER TABLE public.farms OWNER TO postgres;

--
-- Name: farms_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE farms_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.farms_id_seq OWNER TO postgres;

--
-- Name: farms_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE farms_id_seq OWNED BY farms.id;


--
-- Name: garment_sales; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE garment_sales (
    id integer NOT NULL,
    garment_id integer NOT NULL,
    season_id integer NOT NULL,
    date timestamp with time zone NOT NULL,
    program_id integer NOT NULL,
    department_id integer NOT NULL,
    order_ref character varying(255),
    buyer_type character varying(255) NOT NULL,
    buyer_id integer,
    trader_id integer,
    processor_name character varying(255),
    processor_address character varying(255),
    fabric_length double precision,
    additional_fabric_length double precision,
    total_fabric_length double precision NOT NULL,
    transaction_via_trader boolean NOT NULL,
    transaction_agent character varying(255),
    garment_type character varying(255) NOT NULL,
    style_mark_no character varying(255) NOT NULL,
    garment_size character varying(255) NOT NULL,
    color character varying(255),
    no_of_pieces integer NOT NULL,
    no_of_boxes integer,
    invoice_no character varying(255) NOT NULL,
    box_ids character varying(255),
    bill_of_ladding character varying(255),
    transport_info character varying(255),
    contract_no character varying(255),
    tc_file character varying(255),
    contract_file character varying(255),
    invoice_file character varying(255),
    delivery_notes character varying(255),
    qty_stock double precision,
    embroidering_required boolean NOT NULL,
    embroidering_id integer,
    status character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    qr character varying(255),
    accept_date timestamp with time zone
);


ALTER TABLE public.garment_sales OWNER TO postgres;

--
-- Name: garment_sales_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE garment_sales_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.garment_sales_id_seq OWNER TO postgres;

--
-- Name: garment_sales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE garment_sales_id_seq OWNED BY garment_sales.id;


--
-- Name: garment_types; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE garment_types (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    status boolean,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.garment_types OWNER TO postgres;

--
-- Name: garment_types_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE garment_types_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.garment_types_id_seq OWNER TO postgres;

--
-- Name: garment_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE garment_types_id_seq OWNED BY garment_types.id;


--
-- Name: garments; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE garments (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    address character varying(255) NOT NULL,
    country_id integer NOT NULL,
    state_id integer NOT NULL,
    program_id integer[] NOT NULL,
    latitude character varying(255),
    longitude character varying(255),
    website character varying(255),
    contact_person character varying(255) NOT NULL,
    no_of_machines character varying(255),
    fabric_type integer[],
    prod_cap integer[],
    loss_from character varying(255) NOT NULL,
    loss_to character varying(255) NOT NULL,
    unit_cert integer[],
    company_info character varying(255),
    org_logo character varying(255),
    org_photo character varying(255),
    certs character varying(255),
    brand integer[] NOT NULL,
    mobile character varying(255),
    landline character varying(255),
    email character varying(255),
    "garmentUser_id" integer[] NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.garments OWNER TO postgres;

--
-- Name: garments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE garments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.garments_id_seq OWNER TO postgres;

--
-- Name: garments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE garments_id_seq OWNED BY garments.id;


--
-- Name: gin-bales; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE "gin-bales" (
    id integer NOT NULL,
    process_id integer NOT NULL,
    bale_no character varying(255),
    weight character varying(255),
    staple character varying(255),
    mic character varying(255),
    strength character varying(255),
    trash character varying(255),
    color_grade character varying(255),
    qr character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    sold_status boolean DEFAULT false
);


ALTER TABLE public."gin-bales" OWNER TO postgres;

--
-- Name: gin-bales_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE "gin-bales_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."gin-bales_id_seq" OWNER TO postgres;

--
-- Name: gin-bales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE "gin-bales_id_seq" OWNED BY "gin-bales".id;


--
-- Name: gin_process; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE gin_process (
    id integer NOT NULL,
    ginner_id integer NOT NULL,
    season_id integer NOT NULL,
    date timestamp with time zone NOT NULL,
    program_id integer NOT NULL,
    total_qty double precision,
    no_of_bales integer,
    gin_out_turn double precision,
    lot_no character varying(255) NOT NULL,
    reel_lot_no character varying(255),
    press_no character varying(255),
    weight character varying(255),
    staple character varying(255),
    mic character varying(255),
    strength character varying(255),
    trash character varying(255),
    color_grade character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    qr character varying(255)
);


ALTER TABLE public.gin_process OWNER TO postgres;

--
-- Name: gin_process_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE gin_process_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.gin_process_id_seq OWNER TO postgres;

--
-- Name: gin_process_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE gin_process_id_seq OWNED BY gin_process.id;


--
-- Name: gin_processes; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE gin_processes (
    id integer NOT NULL,
    ginner_id integer NOT NULL,
    season_id integer NOT NULL,
    date timestamp with time zone NOT NULL,
    program_id integer NOT NULL,
    total_qty double precision,
    no_of_bales integer,
    gin_out_turn double precision,
    lot_no character varying(255) NOT NULL,
    reel_lot_no character varying(255),
    press_no character varying(255),
    weight character varying(255),
    staple character varying(255),
    mic character varying(255),
    strength character varying(255),
    trash character varying(255),
    color_grade character varying(255),
    qr character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.gin_processes OWNER TO postgres;

--
-- Name: gin_processes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE gin_processes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.gin_processes_id_seq OWNER TO postgres;

--
-- Name: gin_processes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE gin_processes_id_seq OWNED BY gin_processes.id;


--
-- Name: gin_sales; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE gin_sales (
    id integer NOT NULL,
    ginner_id integer NOT NULL,
    season_id integer NOT NULL,
    date timestamp with time zone NOT NULL,
    program_id integer NOT NULL,
    total_qty double precision,
    no_of_bales integer,
    choosen_bale character varying(255),
    lot_no character varying(255),
    buyer integer NOT NULL,
    shipping_address character varying(255) NOT NULL,
    transaction_via_trader boolean NOT NULL,
    transaction_agent character varying(255),
    tc_file character varying(255),
    contract_file character varying(255),
    invoice_file character varying(255),
    delivery_notes character varying(255),
    candy_rate character varying(255) NOT NULL,
    rate character varying(255) NOT NULL,
    sale_value character varying(255),
    invoice_no character varying(255),
    despatch_from character varying(255) NOT NULL,
    despatch_to character varying(255),
    status character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    qr character varying(255),
    weight_loss integer,
    transporter_name character varying(255),
    vehicle_no character varying(255),
    lrbl_no character varying(255),
    place_of_supply character varying(255),
    gst_number character varying(255),
    gst_percentage character varying(255),
    gross_weight character varying(255),
    tare_weight character varying(255),
    less_weight character varying(255),
    sample character varying(255),
    press_no character varying(255),
    reel_lot_no character varying(255),
    qty_stock double precision
);


ALTER TABLE public.gin_sales OWNER TO postgres;

--
-- Name: gin_sales_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE gin_sales_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.gin_sales_id_seq OWNER TO postgres;

--
-- Name: gin_sales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE gin_sales_id_seq OWNED BY gin_sales.id;


--
-- Name: ginner_expected_cottons; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE ginner_expected_cottons (
    id integer NOT NULL,
    season_id integer,
    upload_date timestamp with time zone,
    ginner_id integer,
    ginning_mill character varying(255),
    brand_id integer,
    program_id integer,
    expected_seed_cotton character varying(255),
    expected_lint character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.ginner_expected_cottons OWNER TO postgres;

--
-- Name: ginner_expected_cottons_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE ginner_expected_cottons_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ginner_expected_cottons_id_seq OWNER TO postgres;

--
-- Name: ginner_expected_cottons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE ginner_expected_cottons_id_seq OWNED BY ginner_expected_cottons.id;


--
-- Name: ginner_orders; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE ginner_orders (
    id integer NOT NULL,
    season_id integer,
    upload_date timestamp with time zone,
    ginner_id integer,
    ginning_mill character varying(255),
    brand_id integer,
    program_id integer,
    confirmed_bales character varying(255),
    confirmed_lint_order character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.ginner_orders OWNER TO postgres;

--
-- Name: ginner_orders_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE ginner_orders_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ginner_orders_id_seq OWNER TO postgres;

--
-- Name: ginner_orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE ginner_orders_id_seq OWNED BY ginner_orders.id;


--
-- Name: ginners; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE ginners (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    short_name character varying(255) NOT NULL,
    address character varying(255) NOT NULL,
    country_id integer NOT NULL,
    state_id integer NOT NULL,
    program_id integer[] NOT NULL,
    latitude character varying(255),
    longitude character varying(255),
    website character varying(255),
    contact_person character varying(255) NOT NULL,
    outturn_range_from character varying(255) NOT NULL,
    outturn_range_to character varying(255) NOT NULL,
    bale_weight_from character varying(255) NOT NULL,
    bale_weight_to character varying(255) NOT NULL,
    unit_cert integer[],
    company_info character varying(255),
    org_logo character varying(255),
    org_photo character varying(255),
    certs character varying(255),
    brand integer[] NOT NULL,
    mobile character varying(255),
    landline character varying(255),
    email character varying(255),
    gin_type character varying(255),
    "ginnerUser_id" integer[] NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.ginners OWNER TO postgres;

--
-- Name: ginners_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE ginners_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ginners_id_seq OWNER TO postgres;

--
-- Name: ginners_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE ginners_id_seq OWNED BY ginners.id;


--
-- Name: ics; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE ics (
    id integer NOT NULL,
    ics_name character varying(255) NOT NULL,
    "farmGroup_id" integer,
    ics_latitude character varying(255),
    ics_longitude character varying(255),
    ics_status boolean DEFAULT true NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.ics OWNER TO postgres;

--
-- Name: ics_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE ics_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ics_id_seq OWNER TO postgres;

--
-- Name: ics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE ics_id_seq OWNED BY ics.id;


--
-- Name: knit_sales; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE knit_sales (
    id integer NOT NULL,
    knitter_id integer NOT NULL,
    season_id integer NOT NULL,
    date timestamp with time zone NOT NULL,
    program_id integer NOT NULL,
    order_ref character varying(255),
    buyer_type character varying(255) NOT NULL,
    buyer_id integer,
    processor_name character varying(255),
    processor_address character varying(255),
    transaction_via_trader boolean NOT NULL,
    transaction_agent character varying(255),
    yarn_qty double precision,
    additional_yarn_qty double precision,
    total_yarn_qty double precision NOT NULL,
    fabric_type integer NOT NULL,
    fabric_length double precision,
    fabric_gsm character varying(255) NOT NULL,
    fabric_weight double precision NOT NULL,
    batch_lot_no character varying(255) NOT NULL,
    job_details_garment character varying(255),
    bale_ids character varying(255),
    invoice_no character varying(255) NOT NULL,
    bill_of_ladding character varying(255) NOT NULL,
    transporter_name character varying(255) NOT NULL,
    vehicle_no character varying(255) NOT NULL,
    tc_file character varying(255),
    contract_file character varying(255),
    invoice_file character varying(255),
    delivery_notes character varying(255),
    qty_stock double precision,
    dyeing_required boolean NOT NULL,
    dyeing_id integer,
    status character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    cottonmix_type integer[],
    cottonmix_qty double precision[],
    qr character varying(255),
    accept_date timestamp with time zone,
    blend_choose boolean
);


ALTER TABLE public.knit_sales OWNER TO postgres;

--
-- Name: knit_sales_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE knit_sales_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.knit_sales_id_seq OWNER TO postgres;

--
-- Name: knit_sales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE knit_sales_id_seq OWNED BY knit_sales.id;


--
-- Name: knit_yarn_selections; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE knit_yarn_selections (
    id integer NOT NULL,
    yarn_id integer,
    sales_id integer,
    type character varying(255),
    qty_used double precision,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.knit_yarn_selections OWNER TO postgres;

--
-- Name: knit_yarn_selections_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE knit_yarn_selections_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.knit_yarn_selections_id_seq OWNER TO postgres;

--
-- Name: knit_yarn_selections_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE knit_yarn_selections_id_seq OWNED BY knit_yarn_selections.id;


--
-- Name: knitters; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE knitters (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    address character varying(255) NOT NULL,
    country_id integer NOT NULL,
    state_id integer NOT NULL,
    program_id integer[] NOT NULL,
    latitude character varying(255),
    longitude character varying(255),
    website character varying(255),
    contact_person character varying(255),
    no_of_machines character varying(255),
    fabric_type integer[],
    prod_cap integer[],
    loss_from character varying(255),
    loss_to character varying(255),
    unit_cert integer[],
    company_info character varying(255),
    org_logo character varying(255),
    org_photo character varying(255),
    certs character varying(255),
    brand integer[] NOT NULL,
    mobile character varying(255),
    landline character varying(255),
    email character varying(255),
    "knitterUser_id" integer[] NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.knitters OWNER TO postgres;

--
-- Name: knitters_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE knitters_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.knitters_id_seq OWNER TO postgres;

--
-- Name: knitters_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE knitters_id_seq OWNED BY knitters.id;


--
-- Name: linen_details; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE linen_details (
    id integer NOT NULL,
    season_id integer,
    harvest character varying(255),
    farmer_no character varying(255),
    farmer_name character varying(255),
    country character varying(255),
    town character varying(255),
    department character varying(255),
    area character varying(255),
    linen_variety character varying(255),
    cooperative_name character varying(255),
    no_of_bales integer,
    farm_lot_no character varying(255),
    total_weight character varying(255),
    scutch_date timestamp with time zone,
    scutching_lot_no character varying(255),
    bales_after_scutching integer,
    weight_after_scutching double precision,
    shipment_date timestamp with time zone,
    shipment_details text,
    shiped_to text,
    qty_stock double precision,
    program_id integer,
    status character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.linen_details OWNER TO postgres;

--
-- Name: linen_details_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE linen_details_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.linen_details_id_seq OWNER TO postgres;

--
-- Name: linen_details_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE linen_details_id_seq OWNED BY linen_details.id;


--
-- Name: linens; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE linens (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    variety character varying(255) NOT NULL,
    status boolean DEFAULT true NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.linens OWNER TO postgres;

--
-- Name: linens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE linens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.linens_id_seq OWNER TO postgres;

--
-- Name: linens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE linens_id_seq OWNED BY linens.id;


--
-- Name: lint_selections; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE lint_selections (
    id integer NOT NULL,
    process_id integer,
    lint_id integer,
    qty_used double precision,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.lint_selections OWNER TO postgres;

--
-- Name: lint_selections_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE lint_selections_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.lint_selections_id_seq OWNER TO postgres;

--
-- Name: lint_selections_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE lint_selections_id_seq OWNED BY lint_selections.id;


--
-- Name: loom_types; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE loom_types (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    status boolean DEFAULT true NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.loom_types OWNER TO postgres;

--
-- Name: loom_types_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE loom_types_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.loom_types_id_seq OWNER TO postgres;

--
-- Name: loom_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE loom_types_id_seq OWNED BY loom_types.id;


--
-- Name: menu_lists; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE menu_lists (
    id integer NOT NULL,
    menu_name character varying(255) NOT NULL,
    categories_allowed integer[] NOT NULL,
    status boolean,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.menu_lists OWNER TO postgres;

--
-- Name: menu_lists_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE menu_lists_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.menu_lists_id_seq OWNER TO postgres;

--
-- Name: menu_lists_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE menu_lists_id_seq OWNED BY menu_lists.id;


--
-- Name: organic_integrities; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE organic_integrities (
    id integer NOT NULL,
    date timestamp with time zone NOT NULL,
    brand_id integer NOT NULL,
    test_stage character varying(255) NOT NULL,
    seal_no character varying(255),
    sample_code character varying(255),
    seed_lot character varying(255),
    integrity_score boolean NOT NULL,
    documents character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    ginner_id integer,
    "farmGroup_id" integer,
    ics_id integer,
    farmer integer
);


ALTER TABLE public.organic_integrities OWNER TO postgres;

--
-- Name: organic_integrities_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE organic_integrities_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.organic_integrities_id_seq OWNER TO postgres;

--
-- Name: organic_integrities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE organic_integrities_id_seq OWNED BY organic_integrities.id;


--
-- Name: process_training_process_statuses; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE process_training_process_statuses (
    id integer NOT NULL,
    process_training_id integer,
    spinner_id integer,
    ginner_id integer,
    weaver_id integer,
    knitter_id integer,
    trader_id integer,
    garment_id integer,
    status character varying(255),
    feedback character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    subject character varying(255)
);


ALTER TABLE public.process_training_process_statuses OWNER TO postgres;

--
-- Name: process_training_process_statuses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE process_training_process_statuses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.process_training_process_statuses_id_seq OWNER TO postgres;

--
-- Name: process_training_process_statuses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE process_training_process_statuses_id_seq OWNED BY process_training_process_statuses.id;


--
-- Name: processor_trainings; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE processor_trainings (
    id integer NOT NULL,
    training_type character varying(255) NOT NULL,
    brand_id integer,
    country_id integer,
    processor character varying(255) NOT NULL,
    training_mode character varying(255) NOT NULL,
    processor_name character varying(255),
    training_description text,
    venue text NOT NULL,
    date timestamp with time zone NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone,
    feedback text,
    status character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    state_id integer
);


ALTER TABLE public.processor_trainings OWNER TO postgres;

--
-- Name: processor_trainings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE processor_trainings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.processor_trainings_id_seq OWNER TO postgres;

--
-- Name: processor_trainings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE processor_trainings_id_seq OWNED BY processor_trainings.id;


--
-- Name: prod_capacities; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE prod_capacities (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    status boolean DEFAULT true NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.prod_capacities OWNER TO postgres;

--
-- Name: prod_capacities_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE prod_capacities_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.prod_capacities_id_seq OWNER TO postgres;

--
-- Name: prod_capacities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE prod_capacities_id_seq OWNED BY prod_capacities.id;


--
-- Name: programs; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE programs (
    id integer NOT NULL,
    program_name character varying(255) NOT NULL,
    program_status boolean DEFAULT true NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.programs OWNER TO postgres;

--
-- Name: programs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE programs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.programs_id_seq OWNER TO postgres;

--
-- Name: programs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE programs_id_seq OWNED BY programs.id;


--
-- Name: quality-parameters; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE "quality-parameters" (
    id integer NOT NULL,
    process_id integer,
    spinner_id integer,
    ginner_id integer,
    sold_to integer,
    test_report timestamp with time zone,
    lab_name character varying(255),
    sci double precision,
    moisture double precision,
    mic double precision,
    mat double precision,
    uhml double precision,
    ui double precision,
    sf double precision,
    str double precision,
    elg double precision,
    rd double precision,
    plusb character varying(255),
    document character varying(255)[],
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."quality-parameters" OWNER TO postgres;

--
-- Name: quality-parameters_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE "quality-parameters_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."quality-parameters_id_seq" OWNER TO postgres;

--
-- Name: quality-parameters_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE "quality-parameters_id_seq" OWNED BY "quality-parameters".id;


--
-- Name: ratings; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE ratings (
    id integer NOT NULL,
    user_id integer,
    user_type character varying(255),
    rated_by integer,
    rated_by_type character varying(255),
    rating double precision,
    description character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.ratings OWNER TO postgres;

--
-- Name: ratings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE ratings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ratings_id_seq OWNER TO postgres;

--
-- Name: ratings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE ratings_id_seq OWNED BY ratings.id;


--
-- Name: scope_certs; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE scope_certs (
    id integer NOT NULL,
    country_id integer NOT NULL,
    state_id integer NOT NULL,
    brand_id integer NOT NULL,
    "farmGroup_id" integer NOT NULL,
    ics_id integer NOT NULL,
    validity_end timestamp with time zone NOT NULL,
    standard character varying(255),
    document character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.scope_certs OWNER TO postgres;

--
-- Name: scope_certs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE scope_certs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.scope_certs_id_seq OWNER TO postgres;

--
-- Name: scope_certs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE scope_certs_id_seq OWNED BY scope_certs.id;


--
-- Name: seasons; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE seasons (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    status boolean DEFAULT true NOT NULL,
    "from" character varying(255) NOT NULL,
    "to" character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.seasons OWNER TO postgres;

--
-- Name: seasons_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE seasons_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.seasons_id_seq OWNER TO postgres;

--
-- Name: seasons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE seasons_id_seq OWNED BY seasons.id;


--
-- Name: spin_process; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE spin_process (
    id integer NOT NULL,
    spinner_id integer NOT NULL,
    season_id integer NOT NULL,
    date timestamp with time zone NOT NULL,
    program_id integer NOT NULL,
    yarn_type character varying(255) NOT NULL,
    total_qty double precision NOT NULL,
    yarn_count double precision NOT NULL,
    yarn_qty_produced double precision NOT NULL,
    yarn_realisation double precision NOT NULL,
    net_yarn_qty double precision,
    comber_noil double precision,
    no_of_boxes integer,
    batch_lot_no character varying(255) NOT NULL,
    reel_lot_no character varying(255),
    box_id character varying(255),
    process_complete boolean NOT NULL,
    dyeing_required boolean NOT NULL,
    qty_stock double precision,
    status character varying(255),
    dyeing_id integer,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    cottonmix_type integer[],
    cottonmix_qty integer[],
    accept_date timestamp with time zone,
    tot_box_user integer,
    display_order integer,
    qr character varying(255),
    other_mix boolean,
    comber_noil_stock double precision
);


ALTER TABLE public.spin_process OWNER TO postgres;

--
-- Name: spin_process_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE spin_process_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spin_process_id_seq OWNER TO postgres;

--
-- Name: spin_process_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE spin_process_id_seq OWNED BY spin_process.id;


--
-- Name: spin_process_yarn_selections; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE spin_process_yarn_selections (
    id integer NOT NULL,
    spin_process_id integer,
    sales_id integer,
    no_of_box double precision,
    qty_used double precision,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.spin_process_yarn_selections OWNER TO postgres;

--
-- Name: spin_process_yarn_selections_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE spin_process_yarn_selections_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spin_process_yarn_selections_id_seq OWNER TO postgres;

--
-- Name: spin_process_yarn_selections_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE spin_process_yarn_selections_id_seq OWNED BY spin_process_yarn_selections.id;


--
-- Name: spin_sales; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE spin_sales (
    id integer NOT NULL,
    spinner_id integer NOT NULL,
    season_id integer NOT NULL,
    date timestamp with time zone NOT NULL,
    program_id integer NOT NULL,
    order_ref character varying(255),
    buyer_type character varying(255) NOT NULL,
    buyer_id integer,
    processor_name character varying(255),
    processor_address character varying(255),
    trader_id integer,
    transaction_via_trader boolean NOT NULL,
    transaction_agent character varying(255),
    total_qty double precision,
    no_of_boxes integer,
    batch_lot_no character varying(255) NOT NULL,
    reel_lot_no character varying(255),
    box_ids character varying(255),
    yarn_type character varying(255),
    yarn_count double precision,
    invoice_no character varying(255) NOT NULL,
    bill_of_ladding character varying(255) NOT NULL,
    transporter_name character varying(255) NOT NULL,
    vehicle_no character varying(255) NOT NULL,
    quality_doc character varying(255),
    tc_files character varying(255),
    contract_file character varying(255),
    invoice_file character varying(255),
    delivery_notes character varying(255),
    qty_stock double precision,
    status character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    qr character varying(255),
    knitter_id integer
);


ALTER TABLE public.spin_sales OWNER TO postgres;

--
-- Name: spin_sales_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE spin_sales_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spin_sales_id_seq OWNER TO postgres;

--
-- Name: spin_sales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE spin_sales_id_seq OWNED BY spin_sales.id;


--
-- Name: spinners; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE spinners (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    short_name character varying(255) NOT NULL,
    address character varying(255) NOT NULL,
    country_id integer NOT NULL,
    state_id integer NOT NULL,
    program_id integer[] NOT NULL,
    latitude character varying(255),
    longitude character varying(255),
    website character varying(255),
    contact_person character varying(255) NOT NULL,
    yarn_count_range character varying(255),
    realisation_range_from character varying(255) NOT NULL,
    realisation_range_to character varying(255) NOT NULL,
    unit_cert integer[],
    company_info character varying(255),
    org_logo character varying(255),
    org_photo character varying(255),
    certs character varying(255),
    brand integer[] NOT NULL,
    mobile character varying(255),
    landline character varying(255),
    email character varying(255),
    yarn_type character varying(255),
    "spinnerUser_id" integer[] NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.spinners OWNER TO postgres;

--
-- Name: spinners_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE spinners_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spinners_id_seq OWNER TO postgres;

--
-- Name: spinners_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE spinners_id_seq OWNED BY spinners.id;


--
-- Name: states; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE states (
    id integer NOT NULL,
    country_id integer,
    state_name character varying(255),
    state_status boolean DEFAULT true,
    state_latitude character varying(255),
    state_longitude character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.states OWNER TO postgres;

--
-- Name: states_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE states_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.states_id_seq OWNER TO postgres;

--
-- Name: states_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE states_id_seq OWNED BY states.id;


--
-- Name: style_mark_nos; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE style_mark_nos (
    id integer NOT NULL,
    style_mark_no character varying(255) NOT NULL,
    status boolean NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.style_mark_nos OWNER TO postgres;

--
-- Name: style_mark_nos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE style_mark_nos_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.style_mark_nos_id_seq OWNER TO postgres;

--
-- Name: style_mark_nos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE style_mark_nos_id_seq OWNED BY style_mark_nos.id;


--
-- Name: ticket_tracker_status; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE ticket_tracker_status (
    id integer NOT NULL,
    ticket_id integer,
    status character varying(255),
    comment character varying(255),
    user_id integer,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.ticket_tracker_status OWNER TO postgres;

--
-- Name: ticket_tracker_status_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE ticket_tracker_status_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ticket_tracker_status_id_seq OWNER TO postgres;

--
-- Name: ticket_tracker_status_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE ticket_tracker_status_id_seq OWNED BY ticket_tracker_status.id;


--
-- Name: ticket_tracker_statuses; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE ticket_tracker_statuses (
    id integer NOT NULL,
    ticket_id integer,
    status character varying(255),
    comment character varying(255),
    user_id integer,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.ticket_tracker_statuses OWNER TO postgres;

--
-- Name: ticket_tracker_statuses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE ticket_tracker_statuses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ticket_tracker_statuses_id_seq OWNER TO postgres;

--
-- Name: ticket_tracker_statuses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE ticket_tracker_statuses_id_seq OWNED BY ticket_tracker_statuses.id;


--
-- Name: ticket_trackers; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE ticket_trackers (
    id integer NOT NULL,
    ticket_no bigint,
    date timestamp with time zone,
    processor_name character varying(255),
    processor_type character varying(255),
    ticket_type character varying(255),
    process_or_sales character varying(255),
    style_mark_no character varying(255),
    comments text,
    documents character varying(255),
    status character varying(255),
    resolved_date timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    process_id integer
);


ALTER TABLE public.ticket_trackers OWNER TO postgres;

--
-- Name: ticket_trackers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE ticket_trackers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ticket_trackers_id_seq OWNER TO postgres;

--
-- Name: ticket_trackers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE ticket_trackers_id_seq OWNED BY ticket_trackers.id;


--
-- Name: ticketing_escalation_types; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE ticketing_escalation_types (
    id integer NOT NULL,
    name character varying(255),
    processor_type character varying(255)[],
    correction_type character varying(255)[],
    status boolean DEFAULT true,
    is_others boolean DEFAULT false,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.ticketing_escalation_types OWNER TO postgres;

--
-- Name: ticketing_escalation_types_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE ticketing_escalation_types_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ticketing_escalation_types_id_seq OWNER TO postgres;

--
-- Name: ticketing_escalation_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE ticketing_escalation_types_id_seq OWNED BY ticketing_escalation_types.id;


--
-- Name: trader_sales; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE trader_sales (
    id integer NOT NULL,
    trader_id integer NOT NULL,
    season_id integer NOT NULL,
    date timestamp with time zone NOT NULL,
    program_id integer NOT NULL,
    department_id integer,
    order_ref character varying(255),
    buyer_type character varying(255) NOT NULL,
    buyer_id integer,
    processor_id integer,
    processor_name character varying(255),
    processor_address character varying(255),
    fabric_length double precision,
    additional_fabric_length double precision,
    total_fabric_length double precision,
    batch_lot_no character varying(255),
    no_of_pieces integer NOT NULL,
    no_of_boxes integer,
    invoice_no character varying(255) NOT NULL,
    box_ids character varying(255),
    bill_of_ladding character varying(255),
    transport_info character varying(255),
    contract_no character varying(255),
    tc_file character varying(255),
    contract_file character varying(255),
    invoice_file character varying(255),
    delivery_notes character varying(255),
    total_qty double precision,
    qty_stock double precision,
    embroidering_required boolean,
    embroidering_id integer,
    status character varying(255),
    qr character varying(255),
    accept_date timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.trader_sales OWNER TO postgres;

--
-- Name: trader_sales_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE trader_sales_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.trader_sales_id_seq OWNER TO postgres;

--
-- Name: trader_sales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE trader_sales_id_seq OWNED BY trader_sales.id;


--
-- Name: traders; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE traders (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    address character varying(255) NOT NULL,
    country_id integer NOT NULL,
    state_id integer NOT NULL,
    program_id integer[] NOT NULL,
    latitude character varying(255),
    longitude character varying(255),
    website character varying(255),
    contact_person character varying(255) NOT NULL,
    unit_cert integer[],
    company_info character varying(255),
    org_logo character varying(255),
    org_photo character varying(255),
    certs character varying(255),
    brand integer[] NOT NULL,
    material_trading character varying(255)[] NOT NULL,
    mobile character varying(255),
    landline character varying(255),
    email character varying(255),
    "traderUser_id" integer[] NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.traders OWNER TO postgres;

--
-- Name: traders_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE traders_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.traders_id_seq OWNER TO postgres;

--
-- Name: traders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE traders_id_seq OWNED BY traders.id;


--
-- Name: transactions; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE transactions (
    id integer NOT NULL,
    date timestamp with time zone NOT NULL,
    country_id integer NOT NULL,
    state_id integer NOT NULL,
    district_id integer NOT NULL,
    block_id integer NOT NULL,
    village_id integer,
    farmer_id integer NOT NULL,
    farmer_name character varying(255) NOT NULL,
    brand_id integer,
    farmer_code character varying(255),
    season_id integer NOT NULL,
    qty_purchased character varying(255) NOT NULL,
    rate character varying(255) NOT NULL,
    grade_id integer NOT NULL,
    program_id integer NOT NULL,
    total_amount character varying(255),
    mapped_ginner integer NOT NULL,
    vehicle character varying(255),
    payment_method character varying(255),
    proof character varying(255),
    status character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    estimated_cotton double precision,
    accept_date timestamp with time zone,
    available_cotton double precision,
    farm_id integer,
    qty_stock double precision
);


ALTER TABLE public.transactions OWNER TO postgres;

--
-- Name: transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE transactions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.transactions_id_seq OWNER TO postgres;

--
-- Name: transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE transactions_id_seq OWNED BY transactions.id;


--
-- Name: unit_certifications; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE unit_certifications (
    id integer NOT NULL,
    certification_name character varying(255) NOT NULL,
    certification_logo character varying(255) NOT NULL,
    certification_status boolean DEFAULT true NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.unit_certifications OWNER TO postgres;

--
-- Name: unit_certifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE unit_certifications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.unit_certifications_id_seq OWNER TO postgres;

--
-- Name: unit_certifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE unit_certifications_id_seq OWNED BY unit_certifications.id;


--
-- Name: unit_subtypes; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE unit_subtypes (
    id integer NOT NULL,
    "unitType_id" integer,
    "unitSubType" character varying(255) NOT NULL,
    "unitSubType_status" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.unit_subtypes OWNER TO postgres;

--
-- Name: unit_subtypes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE unit_subtypes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.unit_subtypes_id_seq OWNER TO postgres;

--
-- Name: unit_subtypes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE unit_subtypes_id_seq OWNED BY unit_subtypes.id;


--
-- Name: unit_types; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE unit_types (
    id integer NOT NULL,
    "unitType" character varying(255) NOT NULL,
    "unitType_status" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.unit_types OWNER TO postgres;

--
-- Name: unit_types_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE unit_types_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.unit_types_id_seq OWNER TO postgres;

--
-- Name: unit_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE unit_types_id_seq OWNED BY unit_types.id;


--
-- Name: user_categories; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE user_categories (
    id integer NOT NULL,
    category_name character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.user_categories OWNER TO postgres;

--
-- Name: user_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE user_categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_categories_id_seq OWNER TO postgres;

--
-- Name: user_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE user_categories_id_seq OWNED BY user_categories.id;


--
-- Name: user_privileges; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE user_privileges (
    id integer NOT NULL,
    "userRole_id" integer NOT NULL,
    menu_id integer NOT NULL,
    create_privilege boolean NOT NULL,
    edit_privilege boolean NOT NULL,
    view_privilege boolean NOT NULL,
    delete_privilege boolean NOT NULL,
    status boolean,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.user_privileges OWNER TO postgres;

--
-- Name: user_privileges_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE user_privileges_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_privileges_id_seq OWNER TO postgres;

--
-- Name: user_privileges_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE user_privileges_id_seq OWNED BY user_privileges.id;


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE user_roles (
    id integer NOT NULL,
    "userCategory_id" integer NOT NULL,
    user_role character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    brand_id integer
);


ALTER TABLE public.user_roles OWNER TO postgres;

--
-- Name: user_roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE user_roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_roles_id_seq OWNER TO postgres;

--
-- Name: user_roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE user_roles_id_seq OWNED BY user_roles.id;


--
-- Name: user_tokens; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE user_tokens (
    id integer NOT NULL,
    user_id character varying(255),
    token character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.user_tokens OWNER TO postgres;

--
-- Name: user_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE user_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_tokens_id_seq OWNER TO postgres;

--
-- Name: user_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE user_tokens_id_seq OWNED BY user_tokens.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE users (
    id integer NOT NULL,
    username character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    firstname character varying(255) NOT NULL,
    lastname character varying(255),
    mobile character varying(255) NOT NULL,
    "position" character varying(255),
    countries_web integer[],
    access_level character varying(255)[],
    country_id integer,
    state_id integer,
    district_id integer[],
    block_id integer[],
    village_id integer[],
    role integer DEFAULT 0,
    brand_mapped integer[],
    "ticketApproveAccess" boolean,
    "ticketCountryAccess" character varying(255)[],
    "ticketAccessOnly" boolean,
    "isManagementUser" boolean DEFAULT false NOT NULL,
    status boolean DEFAULT true NOT NULL,
    "isAgreementAgreed" boolean DEFAULT false NOT NULL,
    farm_group integer[]
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE users_id_seq OWNED BY users.id;


--
-- Name: validation_farmers; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE validation_farmers (
    id integer NOT NULL,
    date timestamp with time zone NOT NULL,
    season_id integer NOT NULL,
    brand_id integer NOT NULL,
    "farmGroup_id" integer NOT NULL,
    ics_id integer NOT NULL,
    farmer_id integer NOT NULL,
    farmer_image character varying(255) NOT NULL,
    valid_identity character varying(255) NOT NULL,
    identity_others character varying(255),
    identity_id character varying(255) NOT NULL,
    identity_image character varying(255),
    cotton_purchaser character varying(255) NOT NULL,
    market_rate character varying(255) NOT NULL,
    payment_mode character varying(255) NOT NULL,
    payment_proof boolean NOT NULL,
    proof_name character varying(255),
    proof_document character varying(255),
    is_ginner_supported boolean NOT NULL,
    ginner_supported_details character varying(255)[],
    ginner_supported_others character varying(255)[],
    support_mode character varying(255)[] NOT NULL,
    verifier_inference character varying(255) NOT NULL,
    partially_verified text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.validation_farmers OWNER TO postgres;

--
-- Name: validation_farmers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE validation_farmers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.validation_farmers_id_seq OWNER TO postgres;

--
-- Name: validation_farmers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE validation_farmers_id_seq OWNED BY validation_farmers.id;


--
-- Name: validation_projects; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE validation_projects (
    id integer NOT NULL,
    date timestamp with time zone NOT NULL,
    season_id integer NOT NULL,
    brand_id integer NOT NULL,
    "farmGroup_id" integer NOT NULL,
    no_of_farmers double precision,
    cotton_purchased double precision,
    qty_of_lint_sold integer,
    premium_recieved double precision NOT NULL,
    premium_transfered character varying(255)[] NOT NULL,
    premium_transfered_name character varying(255)[],
    premium_transfered_cost character varying(255)[],
    avg_purchase_price double precision NOT NULL,
    avg_market_price double precision NOT NULL,
    price_variance integer,
    calculated_avg_variance double precision NOT NULL,
    premium_transfer_claim double precision NOT NULL,
    claim_variance integer,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.validation_projects OWNER TO postgres;

--
-- Name: validation_projects_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE validation_projects_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.validation_projects_id_seq OWNER TO postgres;

--
-- Name: validation_projects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE validation_projects_id_seq OWNED BY validation_projects.id;


--
-- Name: videos; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE videos (
    id integer NOT NULL,
    country integer[] NOT NULL,
    brand integer[] NOT NULL,
    processor character varying(255) NOT NULL,
    title character varying(255) NOT NULL,
    description character varying(255) NOT NULL,
    video character varying(255) NOT NULL,
    status boolean DEFAULT true NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.videos OWNER TO postgres;

--
-- Name: videos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE videos_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.videos_id_seq OWNER TO postgres;

--
-- Name: videos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE videos_id_seq OWNED BY videos.id;


--
-- Name: village_impacts; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE village_impacts (
    id integer NOT NULL,
    village character varying(255) NOT NULL,
    reduced_chemical_pesticide double precision,
    reduced_chemical_fertilizer double precision,
    reduced_water_use double precision,
    increased_yield double precision,
    reduced_input_costs double precision,
    increased_profit double precision,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.village_impacts OWNER TO postgres;

--
-- Name: village_impacts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE village_impacts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.village_impacts_id_seq OWNER TO postgres;

--
-- Name: village_impacts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE village_impacts_id_seq OWNED BY village_impacts.id;


--
-- Name: villages; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE villages (
    id integer NOT NULL,
    block_id integer,
    village_name character varying(255),
    village_status boolean DEFAULT true,
    village_latitude character varying(255),
    village_longitude character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.villages OWNER TO postgres;

--
-- Name: villages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE villages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.villages_id_seq OWNER TO postgres;

--
-- Name: villages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE villages_id_seq OWNED BY villages.id;


--
-- Name: weaver_sales; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE weaver_sales (
    id integer NOT NULL,
    weaver_id integer NOT NULL,
    season_id integer NOT NULL,
    date timestamp with time zone NOT NULL,
    program_id integer NOT NULL,
    order_ref character varying(255),
    buyer_type character varying(255) NOT NULL,
    buyer_id integer,
    processor_name character varying(255),
    processor_address character varying(255),
    transaction_via_trader boolean NOT NULL,
    transaction_agent character varying(255),
    warn_yarn_qty double precision,
    weft_choosen character varying(255) NOT NULL,
    weft_yarn_qty double precision,
    total_yarn_qty double precision,
    fabric_type integer NOT NULL,
    fabric_contruction character varying(255) NOT NULL,
    fabric_length double precision NOT NULL,
    fabric_gsm character varying(255) NOT NULL,
    fabric_weight double precision,
    batch_lot_no character varying(255) NOT NULL,
    job_details_garment character varying(255),
    bale_ids character varying(255),
    invoice_no character varying(255) NOT NULL,
    bill_of_ladding character varying(255) NOT NULL,
    transporter_name character varying(255) NOT NULL,
    vehicle_no character varying(255) NOT NULL,
    tc_file character varying(255),
    contract_file character varying(255),
    invoice_file character varying(255),
    delivery_notes character varying(255),
    qty_stock double precision,
    status character varying(255),
    dyeing_required boolean NOT NULL,
    dyeing_id integer,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    weft_cottonmix_type integer[],
    weft_cottonmix_qty double precision[],
    accept_date timestamp with time zone,
    no_of_bales double precision,
    qr character varying(255)
);


ALTER TABLE public.weaver_sales OWNER TO postgres;

--
-- Name: weaver_sales_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE weaver_sales_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.weaver_sales_id_seq OWNER TO postgres;

--
-- Name: weaver_sales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE weaver_sales_id_seq OWNED BY weaver_sales.id;


--
-- Name: weavers; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE weavers (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    address character varying(255) NOT NULL,
    country_id integer NOT NULL,
    state_id integer NOT NULL,
    program_id integer[] NOT NULL,
    latitude character varying(255),
    longitude character varying(255),
    website character varying(255),
    contact_person character varying(255) NOT NULL,
    no_of_machines character varying(255),
    fabric_type integer[],
    prod_cap integer[],
    loss_from character varying(255),
    loss_to character varying(255),
    unit_cert integer[],
    company_info character varying(255),
    org_logo character varying(255),
    org_photo character varying(255),
    certs character varying(255),
    brand integer[] NOT NULL,
    mobile character varying(255),
    landline character varying(255),
    email character varying(255),
    loom_type character varying(255),
    "weaverUser_id" integer[] NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.weavers OWNER TO postgres;

--
-- Name: weavers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE weavers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.weavers_id_seq OWNER TO postgres;

--
-- Name: weavers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE weavers_id_seq OWNED BY weavers.id;


--
-- Name: yarn_counts; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE yarn_counts (
    id integer NOT NULL,
    "yarnCount_name" character varying(255) NOT NULL,
    "yarnCount_status" boolean NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.yarn_counts OWNER TO postgres;

--
-- Name: yarn_counts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE yarn_counts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.yarn_counts_id_seq OWNER TO postgres;

--
-- Name: yarn_counts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE yarn_counts_id_seq OWNED BY yarn_counts.id;


--
-- Name: yarn_selections; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE yarn_selections (
    id integer NOT NULL,
    yarn_id integer,
    sales_id integer,
    type character varying(255),
    qty_used double precision,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.yarn_selections OWNER TO postgres;

--
-- Name: yarn_selections_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE yarn_selections_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.yarn_selections_id_seq OWNER TO postgres;

--
-- Name: yarn_selections_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE yarn_selections_id_seq OWNED BY yarn_selections.id;


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY bale_selections ALTER COLUMN id SET DEFAULT nextval('bale_selections_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY blocks ALTER COLUMN id SET DEFAULT nextval('blocks_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY brands ALTER COLUMN id SET DEFAULT nextval('brands_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY cooperatives ALTER COLUMN id SET DEFAULT nextval('cooperatives_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY cotton_mixes ALTER COLUMN id SET DEFAULT nextval('cotton_mixes_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY cotton_selections ALTER COLUMN id SET DEFAULT nextval('cotton_selections_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY countries ALTER COLUMN id SET DEFAULT nextval('countries_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY crop_grades ALTER COLUMN id SET DEFAULT nextval('crop_grades_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY crop_types ALTER COLUMN id SET DEFAULT nextval('crop_types_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY crop_varieties ALTER COLUMN id SET DEFAULT nextval('crop_varieties_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY crops ALTER COLUMN id SET DEFAULT nextval('crops_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY departments ALTER COLUMN id SET DEFAULT nextval('departments_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY devices ALTER COLUMN id SET DEFAULT nextval('devices_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY districts ALTER COLUMN id SET DEFAULT nextval('districts_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY dyeings ALTER COLUMN id SET DEFAULT nextval('dyeings_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY email_managements ALTER COLUMN id SET DEFAULT nextval('email_managements_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY email_templates ALTER COLUMN id SET DEFAULT nextval('email_templates_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY embroiderings ALTER COLUMN id SET DEFAULT nextval('embroiderings_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY entity_limits ALTER COLUMN id SET DEFAULT nextval('entity_limits_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY fabric_compacting_processes ALTER COLUMN id SET DEFAULT nextval('fabric_compacting_processes_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY fabric_dyeing_processes ALTER COLUMN id SET DEFAULT nextval('fabric_dyeing_processes_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY fabric_printing_processes ALTER COLUMN id SET DEFAULT nextval('fabric_printing_processes_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY fabric_selections ALTER COLUMN id SET DEFAULT nextval('fabric_selections_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY fabric_types ALTER COLUMN id SET DEFAULT nextval('fabric_types_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY fabric_washing_processes ALTER COLUMN id SET DEFAULT nextval('fabric_washing_processes_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY fabrics ALTER COLUMN id SET DEFAULT nextval('fabrics_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY farm_groups ALTER COLUMN id SET DEFAULT nextval('farm_groups_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY farm_items ALTER COLUMN id SET DEFAULT nextval('farm_items_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY farm_products ALTER COLUMN id SET DEFAULT nextval('farm_products_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY farmer_agri_areas ALTER COLUMN id SET DEFAULT nextval('farmer_agri_areas_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY farmer_cotton_areas ALTER COLUMN id SET DEFAULT nextval('farmer_cotton_areas_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY farmers ALTER COLUMN id SET DEFAULT nextval('farmers_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY farms ALTER COLUMN id SET DEFAULT nextval('farms_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY garment_sales ALTER COLUMN id SET DEFAULT nextval('garment_sales_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY garment_types ALTER COLUMN id SET DEFAULT nextval('garment_types_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY garments ALTER COLUMN id SET DEFAULT nextval('garments_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "gin-bales" ALTER COLUMN id SET DEFAULT nextval('"gin-bales_id_seq"'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY gin_process ALTER COLUMN id SET DEFAULT nextval('gin_process_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY gin_processes ALTER COLUMN id SET DEFAULT nextval('gin_processes_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY gin_sales ALTER COLUMN id SET DEFAULT nextval('gin_sales_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY ginner_expected_cottons ALTER COLUMN id SET DEFAULT nextval('ginner_expected_cottons_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY ginner_orders ALTER COLUMN id SET DEFAULT nextval('ginner_orders_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY ginners ALTER COLUMN id SET DEFAULT nextval('ginners_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY ics ALTER COLUMN id SET DEFAULT nextval('ics_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY knit_sales ALTER COLUMN id SET DEFAULT nextval('knit_sales_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY knit_yarn_selections ALTER COLUMN id SET DEFAULT nextval('knit_yarn_selections_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY knitters ALTER COLUMN id SET DEFAULT nextval('knitters_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY linen_details ALTER COLUMN id SET DEFAULT nextval('linen_details_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY linens ALTER COLUMN id SET DEFAULT nextval('linens_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY lint_selections ALTER COLUMN id SET DEFAULT nextval('lint_selections_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY loom_types ALTER COLUMN id SET DEFAULT nextval('loom_types_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY menu_lists ALTER COLUMN id SET DEFAULT nextval('menu_lists_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY organic_integrities ALTER COLUMN id SET DEFAULT nextval('organic_integrities_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY process_training_process_statuses ALTER COLUMN id SET DEFAULT nextval('process_training_process_statuses_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY processor_trainings ALTER COLUMN id SET DEFAULT nextval('processor_trainings_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY prod_capacities ALTER COLUMN id SET DEFAULT nextval('prod_capacities_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY programs ALTER COLUMN id SET DEFAULT nextval('programs_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "quality-parameters" ALTER COLUMN id SET DEFAULT nextval('"quality-parameters_id_seq"'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY ratings ALTER COLUMN id SET DEFAULT nextval('ratings_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY scope_certs ALTER COLUMN id SET DEFAULT nextval('scope_certs_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY seasons ALTER COLUMN id SET DEFAULT nextval('seasons_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY spin_process ALTER COLUMN id SET DEFAULT nextval('spin_process_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY spin_process_yarn_selections ALTER COLUMN id SET DEFAULT nextval('spin_process_yarn_selections_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY spin_sales ALTER COLUMN id SET DEFAULT nextval('spin_sales_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY spinners ALTER COLUMN id SET DEFAULT nextval('spinners_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY states ALTER COLUMN id SET DEFAULT nextval('states_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY style_mark_nos ALTER COLUMN id SET DEFAULT nextval('style_mark_nos_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY ticket_tracker_status ALTER COLUMN id SET DEFAULT nextval('ticket_tracker_status_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY ticket_tracker_statuses ALTER COLUMN id SET DEFAULT nextval('ticket_tracker_statuses_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY ticket_trackers ALTER COLUMN id SET DEFAULT nextval('ticket_trackers_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY ticketing_escalation_types ALTER COLUMN id SET DEFAULT nextval('ticketing_escalation_types_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY trader_sales ALTER COLUMN id SET DEFAULT nextval('trader_sales_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY traders ALTER COLUMN id SET DEFAULT nextval('traders_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY transactions ALTER COLUMN id SET DEFAULT nextval('transactions_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY unit_certifications ALTER COLUMN id SET DEFAULT nextval('unit_certifications_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY unit_subtypes ALTER COLUMN id SET DEFAULT nextval('unit_subtypes_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY unit_types ALTER COLUMN id SET DEFAULT nextval('unit_types_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY user_categories ALTER COLUMN id SET DEFAULT nextval('user_categories_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY user_privileges ALTER COLUMN id SET DEFAULT nextval('user_privileges_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY user_roles ALTER COLUMN id SET DEFAULT nextval('user_roles_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY user_tokens ALTER COLUMN id SET DEFAULT nextval('user_tokens_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY users ALTER COLUMN id SET DEFAULT nextval('users_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY validation_farmers ALTER COLUMN id SET DEFAULT nextval('validation_farmers_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY validation_projects ALTER COLUMN id SET DEFAULT nextval('validation_projects_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY videos ALTER COLUMN id SET DEFAULT nextval('videos_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY village_impacts ALTER COLUMN id SET DEFAULT nextval('village_impacts_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY villages ALTER COLUMN id SET DEFAULT nextval('villages_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY weaver_sales ALTER COLUMN id SET DEFAULT nextval('weaver_sales_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY weavers ALTER COLUMN id SET DEFAULT nextval('weavers_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY yarn_counts ALTER COLUMN id SET DEFAULT nextval('yarn_counts_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY yarn_selections ALTER COLUMN id SET DEFAULT nextval('yarn_selections_id_seq'::regclass);


--
-- Data for Name: SequelizeMeta; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "SequelizeMeta" (name) FROM stdin;
20230713065813-create-user.js
20230714062250-create-country.js
20230714093408-create-state.js
20230714105750-create-district.js
20230714112514-create-block.js
20230714113938-create-village.js
20230715083120-create-crop.js
20230715084203-create-crop-type.js
20230715084617-create-crop-variety.js
20230715084726-create-crop-grade.js
20230715084910-create-farm-item.js
20230715085018-create-farm-product.js
20230715085312-create-unit-type.js
20230715085603-create-unit-sub-type.js
20230715085950-create-unit-certification.js
20230715090105-create-department.js
20230715090210-create-program.js
20230715090400-create-fabric-type.js
20230715090622-create-season.js
20230715090828-create-loom-type.js
20230715091102-create-prod-capacity.js
20230715091646-create-farm-group.js
20230715091909-create-ics.js
20230715093017-create-yarn-count.js
20230715093158-create-cotton-mix.js
20230715093905-create-cooperative.js
20230715094341-create-linen.js
20230715100108-create-video.js
20230717084846-create-brand.js
20230717094225-create-farmer.js
20230717094339-create-farmer-place.js
20230717095122-create-farmer-asset.js
20230718043957-create-ginner.js
20230718045215-create-spinner.js
20230718050120-create-weaver.js
20230718051007-create-knitter.js
20230718051356-create-garment.js
20230718052856-create-trader.js
20230718103425-create-entity-limit.js
20230718112956-create-transaction.js
20230718133517-create-scope-cert.js
20230719083501-create-organic-integrity.js
20230721114207-create-user-category.js
20230721122326-create-menu-list.js
20230721130410-create-user-role.js
20230721130624-create-user-privilege.js
20230721144650-create-device.js
20230724051912-create-gin-process.js
20230724061839-create-gin-sales.js
20230724112541-create-dyeing.js
20230724113300-create-spin-process.js
20230724134213-create-spin-sales.js
20230724141642-create-knit-sales.js
20230724144430-create-weaver-sales.js
20230725049238-create-embroidering.js
20230725052333-create-garment-sales.js
20230726065627-create-farmer-agri-area.js
20230726065852-create-farmer-cotton-area.js
20230726110423-create-validation-farmer.js
20230726112638-create-validation-project.js
20230726142317-create-linen-details.js
20230726142924-create-style-mark.js
20230726144351-create-village-impact.js
20230726145029-create-garment-type.js
20230727045207-create-ginner-order.js
20230727045918-create-ginner-expected-cotton.js
20230727070333-create-processor-training.js
20230727080905-add-columns-to-users.js
20230728045438-create-ticket-tracker.js
20230728090556-create-email-template.js
20230728091259-create-email-management.js
20230728093823-create-fabric.js
20230728094037-create-fabric-dyeing-process.js
20230728095810-create-fabric-printing-process.js
20230728100716-create-fabric-washing-process.js
20230728103010-create-fabric-compacting-process.js
20230809082508-create-user-token.js
20230816125709-update-user-table.js
20230817081344-create-farm.js
20230819081614-update-training-table.js
20230825125956-change-transaction-column.js
20230830105131-farmer-registration-qr-cloumn.js
20230831034800-remove-farmer-fields.js
20230831072548-update-organic-integrity.js
20230831101923-create-ticket-tracker-status.js
20230831113441-add-column-ticketing.js
20230905080145-create-gin-bale.js
20230905081651-add-gin-proccess-column.js
20230905122611-add-gin-sales-column.js
20230906110850-create-bale-selection.js
20230907113827-create-quality-parameter.js
20230908060203-add-column-email-template.js
20230912080757-add-column-farmer-farm.js
20230913095202-add-column-spin-process.js
20230913123718-change-column-users.js
20230914051624-add-column-spin-process.js
20230914091843-add-column-spin-sales.js
20230915044522-add-column-sales.js
20230915081607-change-column-name-farmer.js
20230915105153-change-column-name-user-role.js
20230919044042-create-process-training-process-status.js
20230920052326-add-weaver-sale-column.js
20230920100837-create-rating.js
20230921063247-add-column-knit-sales.js
20230922051920-add-column-transaction.js
20230925055850-add-transaction-column.js
20230926070338-add-column-garment-sales.js
20230927055255-create-trader-sales.js
20230928045618-create-cotton-selection.js
20230928083649-add-training-status-column.js
20230929082339-add-column-spin-sales.js
20231003060739-add-column-spin-process.js
20231005042705-add-brand-column.js
20231005062837-add-gin-bale-column.js
20231009044611-create-lint-seletions.js
20231009051005-create-spin-process-yarn-seletions.js
20231009063227-create-knit-yarn-seletions.js
20231009063407-create-yarn-seletions.js
20231009070502-create-fabric-seletions.js
20231009094818-create-ticketing-escalation-type.js
\.


--
-- Data for Name: bale_selections; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY bale_selections (id, sales_id, bale_id, print, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: bale_selections_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('bale_selections_id_seq', 1, false);


--
-- Data for Name: blocks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY blocks (id, district_id, block_name, block_status, "createdAt", "updatedAt") FROM stdin;
5	6	test3	t	2023-09-12 07:26:38.894-06	2023-09-12 07:26:38.894-06
10	18	KavithaBlock	t	2023-09-25 04:22:33.777-06	2023-09-25 04:24:53.15-06
7	14	Patna Rural	t	2023-09-19 01:31:42.349-06	2023-09-25 23:25:51.3-06
14	14	Bikram	t	2023-09-25 23:39:13.548-06	2023-09-25 23:39:13.548-06
\.


--
-- Name: blocks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('blocks_id_seq', 14, true);


--
-- Data for Name: brands; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY brands (id, brand_name, address, email, programs_id, countries_id, website, company_info, contact_person, logo, photo, mobile, landline, "brandUser_id", "createdAt", "updatedAt", entity_limit) FROM stdin;
2	Test Brand 2	test address	testdev@gmail.com	{7}	{9}	testbrand.com		test contact			9876543210	9999999999	{3}	2023-09-19 01:20:32.838-06	2023-09-19 01:21:45.357-06	0
6	Akshaya	Chennai	ak@gmail.com	{11,8}	{27,13,12}		Vaiha	Akshaya	https://api.newtracebale.com/file/1695725204489-file_example_JPG_100kB.jpg	https://api.newtracebale.com/file/1695725207323-sample_640Ã426 jpeg.jpeg	6789067890	23452345	{9}	2023-09-26 04:47:54.053-06	2023-09-26 04:47:54.053-06	0
7	testbrand	abc		{8}	{12}			test					{45}	2023-09-28 09:04:00.819-06	2023-09-28 09:04:00.819-06	0
8	Anil	FKLR(RIOvklcxzvbdsogsdg	sdfkfgl()#09905906096094	{11}	{27}	KSFJKDS)(#()*%%()^)_	KGKJFDGJKe$()$%()()^()	W909Weeuriot($$)(()%kjggjkfjroi	https://api.newtracebale.com/file/1696491930533-download.pdf	https://api.newtracebale.com/file/1696491953298-download.pdf	579-8-7456=04643=5=-423214=23423	09340346-0lrklj#()%)*^($_)#_+#+	{57,58}	2023-10-05 01:47:56.825-06	2023-10-05 02:07:05.6-06	0
9	Primark	Address	testusernew@gmail.com	{8}	{12}			Kavitha					{60}	2023-10-11 22:21:32.029-06	2023-10-11 22:21:32.029-06	0
10	newBrand	new addrss		{12,11}	{27}			test contact					{71}	2023-10-12 00:22:30.153-06	2023-10-12 00:22:30.153-06	0
11	testtestest	test address		{11,10}	{31,12}	test@gmail.com		testfabriccontact					{80}	2023-10-12 00:26:08.159-06	2023-10-12 00:26:08.159-06	0
\.


--
-- Name: brands_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('brands_id_seq', 11, true);


--
-- Data for Name: cooperatives; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY cooperatives (id, name, address, country, contact_person, mobile, email, status, "createdAt", "updatedAt") FROM stdin;
1	Test 1	test	India	abc	6789067890	test@gmail.com	t	2023-09-12 08:48:15.915-06	2023-09-12 08:50:20.211-06
4	Test 2	test	Bangladesh	mno	1234512345		t	2023-09-12 08:49:43.107-06	2023-09-12 08:50:36.4-06
5	Farmer	chennai	India	akshaya	6789068890	ak@gmail.com	t	2023-09-26 03:45:59.045-06	2023-09-26 03:45:59.045-06
6	sdfjkdjk#*(#(*$*589458547(*#*($)(%)(%)(^)(H)(H	DOIF*#)*(%%()%^()	FJKF#()$%()JFGGJGLHJHLK><	Anil Test	)%$))#RIGJGJKFKLDEIOIOR	KJFJKFR(($)$(A_@)_#_)	t	2023-10-05 01:40:07.08-06	2023-10-05 01:40:07.08-06
\.


--
-- Name: cooperatives_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('cooperatives_id_seq', 6, true);


--
-- Data for Name: cotton_mixes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY cotton_mixes (id, "cottonMix_name", "cottonMix_status", "createdAt", "updatedAt") FROM stdin;
4	 test	t	2023-09-12 08:46:27.098-06	2023-09-12 08:46:27.098-06
6	Kavitha Blend1	t	2023-09-25 05:53:46.706-06	2023-09-25 05:53:52.377-06
7	linen	t	2023-09-26 03:34:04.052-06	2023-09-26 03:34:04.052-06
8	polyester	t	2023-09-26 03:34:04.065-06	2023-09-26 03:34:04.065-06
1	rayon	t	2023-09-12 08:46:27.098-06	2023-09-26 03:37:28.692-06
9	Anil Test $(%(^()^)($#()@()$(%)	t	2023-10-05 01:38:34.966-06	2023-10-05 01:38:34.966-06
10	Anil ()$(#()FIJGJJBKJKIOEIO	t	2023-10-05 01:38:34.985-06	2023-10-05 01:38:34.985-06
\.


--
-- Name: cotton_mixes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('cotton_mixes_id_seq', 10, true);


--
-- Data for Name: cotton_selections; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY cotton_selections (id, process_id, transaction_id, qty_used, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: cotton_selections_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('cotton_selections_id_seq', 1, false);


--
-- Data for Name: countries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY countries (id, county_name, country_status, "createdAt", "updatedAt") FROM stdin;
27	KavithaCountry	t	2023-09-25 04:14:06.248-06	2023-09-25 04:14:15.708-06
12	India	f	2023-09-12 08:26:21.487-06	2023-09-25 04:51:22.072-06
2	Bangladesh	t	2023-09-12 03:31:37.652-06	2023-09-12 04:01:10.896-06
31	KavithanewCountry	t	2023-09-26 04:18:08.515-06	2023-09-26 04:18:08.515-06
11	United States of America	t	2023-09-12 05:00:40.462-06	2023-09-12 05:00:40.462-06
15	Japan@1234	t	2023-09-12 21:41:32.375-06	2023-09-12 21:54:13.935-06
9	Spain	t	2023-09-12 04:38:04.358-06	2023-09-20 03:27:38.738-06
13	Germany	t	2023-09-12 21:38:02.91-06	2023-09-22 04:21:05.612-06
\.


--
-- Name: countries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('countries_id_seq', 32, true);


--
-- Data for Name: crop_grades; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY crop_grades (id, "cropVariety_id", "cropGrade", "cropGrade_status", "createdAt", "updatedAt") FROM stdin;
3	1	Grade 2	t	2023-09-12 07:45:51.558-06	2023-09-12 07:45:51.558-06
10	2	Grade 1	t	2023-09-14 04:24:11.532-06	2023-09-14 04:24:11.532-06
2	2	Grade 1	t	2023-09-12 07:44:59.402-06	2023-09-22 04:03:59.946-06
13	4	Grade B!@#$	t	2023-09-22 04:04:27.057-06	2023-09-22 04:04:27.057-06
14	14	Crop Grade-test@#$	t	2023-09-25 04:49:06.63-06	2023-09-25 04:49:33.955-06
\.


--
-- Name: crop_grades_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('crop_grades_id_seq', 14, true);


--
-- Data for Name: crop_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY crop_types (id, crop_id, "cropType_name", "cropType_status", "createdAt", "updatedAt") FROM stdin;
1	1	Inter Crop	t	2023-09-12 07:32:23.673-06	2023-09-12 07:32:23.673-06
2	3	Inter crop	t	2023-09-12 07:32:55.767-06	2023-09-12 07:32:55.767-06
3	2	Main Crop	t	2023-09-12 07:33:11.343-06	2023-09-12 07:33:11.343-06
4	9	Plantation crop@!@12	t	2023-09-14 02:11:18.652-06	2023-09-14 02:11:18.652-06
9	1	xyz	t	2023-09-14 02:13:03.38-06	2023-09-14 02:13:03.38-06
12	12	yxz	t	2023-09-14 02:25:54.366-06	2023-09-14 02:25:54.366-06
7	9	abc!@3q1?":	t	2023-09-14 02:12:06.728-06	2023-09-14 03:52:20.398-06
15	4	1ginger@#$	t	2023-09-22 02:58:08.182-06	2023-09-22 02:58:28.095-06
16	8	Main Crop	t	2023-09-22 03:01:29.425-06	2023-09-22 03:01:29.425-06
10	5	123	t	2023-09-14 02:14:47.827-06	2023-09-22 03:05:22.365-06
17	16	CropType	t	2023-09-25 04:46:46.945-06	2023-09-25 04:46:46.945-06
20	12	abcd@##$$%%%^^	t	2023-10-05 00:48:39.328-06	2023-10-05 00:49:05.658-06
\.


--
-- Name: crop_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('crop_types_id_seq', 20, true);


--
-- Data for Name: crop_varieties; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY crop_varieties (id, "cropType_id", "cropVariety", "cropVariety_status", "createdAt", "updatedAt") FROM stdin;
1	1	MCU 5	t	2023-09-12 07:36:14.377-06	2023-09-12 07:36:14.377-06
2	2	H614D	t	2023-09-12 07:37:26.973-06	2023-09-12 07:37:26.973-06
5	10	ghi@!$	t	2023-09-14 02:19:18.616-06	2023-09-14 02:19:18.616-06
10	3	IR64@#$!?	t	2023-09-14 04:14:23.669-06	2023-09-14 04:14:23.669-06
11	10	capsularis123!@#	t	2023-09-22 03:28:05.798-06	2023-09-22 03:28:05.798-06
14	17	Crop Variety	t	2023-09-25 04:47:50.568-06	2023-09-25 04:58:39.455-06
4	3	IR64	t	2023-09-14 02:18:40.792-06	2023-09-26 00:41:01.08-06
16	12	2df	t	2023-09-26 00:41:19.833-06	2023-09-26 00:41:19.833-06
17	20	ewruiewruiwe@#$*$(*$(*	t	2023-10-05 00:58:21.736-06	2023-10-05 00:58:21.736-06
\.


--
-- Name: crop_varieties_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('crop_varieties_id_seq', 17, true);


--
-- Data for Name: crops; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY crops (id, crop_name, crop_status, "createdAt", "updatedAt") FROM stdin;
2	Rice	t	2023-09-12 07:31:08.631-06	2023-09-12 07:31:08.631-06
3	Maize	t	2023-09-12 07:31:08.631-06	2023-09-12 07:31:08.631-06
4	Ginger1	t	2023-09-13 01:21:33.498-06	2023-09-13 01:21:46.249-06
1	Cotton@#$%	t	2023-09-06 02:37:52.595-06	2023-09-13 01:21:55.235-06
5	Jute	t	2023-09-13 01:23:09.453-06	2023-09-13 01:23:09.453-06
8	Wheat	t	2023-09-13 01:25:09.286-06	2023-09-13 01:25:09.286-06
9	Cashew	t	2023-09-13 02:17:54.813-06	2023-09-13 02:17:54.813-06
13	millet23@#$	t	2023-09-22 02:39:46.504-06	2023-09-22 02:40:06.697-06
12	abcd	t	2023-09-14 02:25:08.632-06	2023-09-22 02:41:56.705-06
16	KavithaCrop	t	2023-09-25 04:45:50.384-06	2023-09-25 04:45:50.384-06
17	KavithaCrop1	f	2023-09-25 04:46:23.537-06	2023-09-25 04:50:18.381-06
18	ANil test@#($((dfdre@#$$$	t	2023-10-05 00:17:41.869-06	2023-10-05 00:47:40.965-06
\.


--
-- Name: crops_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('crops_id_seq', 18, true);


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY departments (id, dept_name, dept_status, "createdAt", "updatedAt") FROM stdin;
6	Design	t	2023-09-14 05:50:28.342-06	2023-09-14 05:56:05.317-06
7	Production!@#$?"{}	t	2023-09-14 05:51:43.623-06	2023-09-14 05:56:25.358-06
10	Kavitha Department	t	2023-09-25 05:12:55.027-06	2023-09-25 05:12:55.027-06
13	Marketing@#!$6	t	2023-09-25 06:43:39.574-06	2023-09-25 06:43:39.574-06
8	Cutting	t	2023-09-14 05:54:18.763-06	2023-09-26 02:02:38.828-06
15	dsjfdsk#$(%(%(	t	2023-10-05 01:24:06.963-06	2023-10-05 01:24:06.963-06
\.


--
-- Name: departments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('departments_id_seq', 15, true);


--
-- Data for Name: devices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY devices (id, device_id, staff_name, user_id, entry_date, status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: devices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('devices_id_seq', 1, false);


--
-- Data for Name: districts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY districts (id, state_id, district_name, district_status, "createdAt", "updatedAt") FROM stdin;
4	3	Gazipur	t	2023-09-12 06:45:44.666-06	2023-09-12 06:45:44.666-06
5	9	Altona	t	2023-09-12 06:50:48.719-06	2023-09-12 06:50:48.719-06
6	12	Atlanta	t	2023-09-12 06:51:39.679-06	2023-09-12 06:51:39.679-06
18	31	KavithaDistrict	t	2023-09-25 04:20:53.49-06	2023-09-25 04:44:38.967-06
20	31	KavithaDistrictTest	t	2023-09-25 04:24:05.943-06	2023-09-25 04:44:42.007-06
14	26	patna	t	2023-09-19 01:31:19.791-06	2023-09-25 22:56:00.337-06
\.


--
-- Name: districts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('districts_id_seq', 21, true);


--
-- Data for Name: dyeings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY dyeings (id, processor_name, dyeing_address, process_name, yarn_delivered, process_loss, net_yarn, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: dyeings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('dyeings_id_seq', 1, false);


--
-- Data for Name: email_managements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY email_managements (id, template_id, mail_type, user_categories, program_ids, brand_ids, country_ids, user_ids, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: email_managements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('email_managements_id_seq', 1, false);


--
-- Data for Name: email_templates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY email_templates (id, template_name, file_name, "createdAt", "updatedAt", mail_type) FROM stdin;
\.


--
-- Name: email_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('email_templates_id_seq', 1, false);


--
-- Data for Name: embroiderings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY embroiderings (id, processor_name, address, process_name, no_of_pieces, process_loss, final_no_of_pieces, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: embroiderings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('embroiderings_id_seq', 1, false);


--
-- Data for Name: entity_limits; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY entity_limits (id, brand_id, "limit", used, remaining, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: entity_limits_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('entity_limits_id_seq', 1, false);


--
-- Data for Name: fabric_compacting_processes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY fabric_compacting_processes (id, fabric_id, season_id, date, program, order_ref, choosen_buyer, buyer_name, processor_name, processor_address, qty_kgs, qty_woven_fabric, process_weight, weight_gain_percent, weight_loss_percent, compacted_fabric_length, compacted_fabric_gsm, compacted_fabric_net_weight, batch_lot_no, job_details_garment, compacting_details, compact_type, invoice_no, order_details, bill_of_ladding, transport_info, status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: fabric_compacting_processes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('fabric_compacting_processes_id_seq', 1, false);


--
-- Data for Name: fabric_dyeing_processes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY fabric_dyeing_processes (id, fabric_id, season_id, date, program, order_ref, choosen_buyer, buyer_name, processor_name, processor_address, qty_kgs, qty_woven_fabric, process_weight, weight_gain_percent, weight_loss_percent, dying_details, dying_color, dyed_fabric_length, dyed_fabric_gsm, dyed_fabric_net_weight, batch_lot_no, job_details_garment, invoice_no, order_details, bill_of_ladding, transport_info, status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: fabric_dyeing_processes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('fabric_dyeing_processes_id_seq', 1, false);


--
-- Data for Name: fabric_printing_processes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY fabric_printing_processes (id, fabric_id, season_id, date, program, order_ref, choosen_buyer, buyer_name, processor_name, processor_address, qty_kgs, qty_woven_fabric, process_weight, weight_gain_percent, weight_loss_percent, printing_details, printing_type, printed_fabric_length, printed_fabric_gsm, printed_fabric_net_weight, batch_lot_no, job_details_garment, invoice_no, order_details, uploaded_pattern, bill_of_ladding, transport_info, status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: fabric_printing_processes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('fabric_printing_processes_id_seq', 1, false);


--
-- Data for Name: fabric_selections; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY fabric_selections (id, fabric_id, sales_id, type, processor, qty_used, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: fabric_selections_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('fabric_selections_id_seq', 1, false);


--
-- Data for Name: fabric_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY fabric_types (id, "fabricType_name", "fabricType_status", "createdAt", "updatedAt") FROM stdin;
2	tst23	t	2023-09-12 08:20:09.218-06	2023-09-14 06:12:19.165-06
3	fabric@#$%^	t	2023-09-12 08:20:09.218-06	2023-09-14 06:12:38.901-06
6	fabric@#$%^	t	2023-09-14 06:12:54.564-06	2023-09-14 06:13:15.212-06
1	abc1234	t	2023-09-12 08:19:54.678-06	2023-09-14 06:14:24.142-06
8	Kavitha Fabric Type	t	2023-09-25 05:15:57.523-06	2023-09-25 05:16:27.545-06
9	cotton	t	2023-09-26 02:16:46.65-06	2023-09-26 02:16:46.65-06
10	kdffdk@$_%+%^+^+	t	2023-10-05 01:25:41.353-06	2023-10-05 01:25:41.353-06
11	ANil Test #($(%(%(	t	2023-10-05 01:26:01.372-06	2023-10-05 01:26:01.372-06
\.


--
-- Name: fabric_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('fabric_types_id_seq', 11, true);


--
-- Data for Name: fabric_washing_processes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY fabric_washing_processes (id, fabric_id, season_id, date, program, order_ref, choosen_buyer, buyer_name, processor_name, processor_address, qty_kgs, qty_woven_fabric, process_weight, weight_gain_percent, weight_loss_percent, washing_details, washing_type, washed_fabric_length, washed_fabric_gsm, washed_fabric_net_weight, batch_lot_no, job_details_garment, invoice_no, order_details, bill_of_ladding, transport_info, status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: fabric_washing_processes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('fabric_washing_processes_id_seq', 1, false);


--
-- Data for Name: fabrics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY fabrics (id, name, address, country_id, state_id, program_id, latitude, longtude, website, contact_person, no_of_machines, fabric_processor_type, prod_capt, loss_from, loss_to, unit_cert, company_info, org_logo, org_photo, certs, brand, mobile, landline, email, "fabricUser_id", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: fabrics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('fabrics_id_seq', 1, false);


--
-- Data for Name: farm_groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY farm_groups (id, name, brand_id, status, latitude, longitude, "createdAt", "updatedAt") FROM stdin;
1	ISO Health and Safety	1	t	\N	\N	2023-09-19 01:25:15.157-06	2023-09-19 01:25:15.157-06
4	Farmer Group	3	t	\N	\N	2023-09-26 02:56:56.877-06	2023-09-26 02:56:56.877-06
3	Kavitha Farm Group	6	t	\N	\N	2023-09-25 05:48:24.556-06	2023-09-26 05:47:29.296-06
6	Anil Test )#)$%)%)%	7	t	\N	\N	2023-10-05 01:33:03.339-06	2023-10-05 01:33:03.339-06
7	new farm group	7	t	\N	\N	2023-10-09 01:01:15.706-06	2023-10-09 01:01:15.706-06
8	Rudi sewa	9	t	\N	\N	2023-10-11 22:22:04.277-06	2023-10-11 22:22:04.277-06
\.


--
-- Name: farm_groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('farm_groups_id_seq', 8, true);


--
-- Data for Name: farm_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY farm_items (id, "farmItem", "farmItem_status", "createdAt", "updatedAt") FROM stdin;
5	Hedge Shears	t	2023-09-12 08:03:38.854-06	2023-09-12 08:03:38.854-06
7	Hedge Shears	t	2023-09-14 04:37:17.819-06	2023-09-14 04:37:34.616-06
12	Lawn Rake	t	2023-09-14 04:50:49.205-06	2023-09-22 05:10:51.014-06
13	Axe	t	2023-09-22 05:32:29.66-06	2023-09-22 05:32:29.66-06
14	Shovel	t	2023-09-22 05:32:29.672-06	2023-09-22 05:32:29.672-06
15	Cultivator	t	2023-09-22 05:32:29.674-06	2023-09-22 05:32:29.674-06
17	Plow	t	2023-09-22 05:38:43.26-06	2023-09-22 05:38:43.26-06
18	KavithaFarm	t	2023-09-25 05:03:32.615-06	2023-09-25 05:03:32.615-06
19	KavithaFarm1	t	2023-09-25 05:03:32.633-06	2023-09-25 05:03:32.633-06
20	tractor	t	2023-09-26 01:02:45.18-06	2023-09-26 01:02:45.18-06
21	Anil@#($*$*$$**%*%	t	2023-10-05 01:06:43.292-06	2023-10-05 01:06:43.292-06
22	Sachin)@(#($( ($(%(	t	2023-10-05 01:06:43.31-06	2023-10-05 01:06:43.31-06
\.


--
-- Name: farm_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('farm_items_id_seq', 22, true);


--
-- Data for Name: farm_products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY farm_products (id, "farmItem_id", "farmProduct", "farmProduct_status", "createdAt", "updatedAt") FROM stdin;
8	12	Test 1@#$///	t	2023-09-14 04:51:29.853-06	2023-09-14 04:51:29.853-06
12	15	seeds	t	2023-09-25 04:07:03.316-06	2023-09-25 04:11:32.409-06
13	5	grass	t	2023-09-25 04:13:24.24-06	2023-09-25 04:18:16.051-06
15	17	testproduct	t	2023-09-25 04:38:17.788-06	2023-09-25 04:38:17.788-06
16	13	axe	t	2023-09-25 04:40:57.464-06	2023-09-25 04:40:57.464-06
17	18	Kavitha Farm Product	t	2023-09-25 05:04:00.493-06	2023-09-25 05:04:00.493-06
21	14	Anil Trst *$*45858	t	2023-10-05 01:20:04.127-06	2023-10-05 01:20:04.127-06
\.


--
-- Name: farm_products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('farm_products_id_seq', 21, true);


--
-- Data for Name: farmer_agri_areas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY farmer_agri_areas (id, farmer_id, agri_total_area, agri_estimated_yeld, agri_estimated_prod, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: farmer_agri_areas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('farmer_agri_areas_id_seq', 1, false);


--
-- Data for Name: farmer_cotton_areas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY farmer_cotton_areas (id, farmer_id, cotton_total_area, total_estimated_cotton, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: farmer_cotton_areas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('farmer_cotton_areas_id_seq', 1, false);


--
-- Data for Name: farmers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY farmers (id, program_id, brand_id, "farmGroup_id", "firstName", "lastName", code, country_id, state_id, district_id, block_id, village_id, joining_date, ics_id, cert_status, "createdAt", "updatedAt", "qrUrl", agri_total_area, agri_estimated_yeld, agri_estimated_prod, cotton_total_area, total_estimated_cotton, tracenet_id) FROM stdin;
22	11	6	3	new 	farmer	farmer112	12	26	14	7	29	2023-10-10 18:00:00-06	0	\N	2023-10-09 00:36:53.741-06	2023-10-09 00:36:54.551-06	qrcode_1696833413758.png	3	8	24	3	24	\N
23	11	6	3	new 	farmer	farm555	11	12	6	5	13	2023-10-11 18:00:00-06	0	\N	2023-10-09 00:40:09.136-06	2023-10-09 00:40:09.922-06	qrcode_1696833609153.png	37	6	222	4	24	\N
24	8	7	6	allen	gilbert	gilbert66	11	12	6	5	8	2023-10-27 18:00:00-06	0	\N	2023-10-09 00:48:34.349-06	2023-10-09 00:48:35.124-06	qrcode_1696834114372.png	55	2	110	44	88	\N
25	8	7	7	farmer	latest	LAT123	27	31	18	10	36	2023-10-08 18:00:00-06	0	\N	2023-10-09 01:05:47.186-06	2023-10-09 01:05:48.054-06	qrcode_1696835147204.png	40	4	160	30	120	\N
26	8	6	3	lat	farmer	lat778	11	12	6	5	13	2023-10-08 18:00:00-06	0	\N	2023-10-09 01:28:44.229-06	2023-10-09 01:28:45.084-06	qrcode_1696836524254.png	50	3	150	30	90	\N
27	8	7	7	last	term	last12	12	26	14	7	29	2023-10-12 18:00:00-06	0	\N	2023-10-09 02:12:54.878-06	2023-10-09 02:12:56.287-06	qrcode_1696839174894.png	40	12	480	22	264	\N
28	8	7	7	Test	Farmer	XXXXXAADDAD	12	26	14	7	28	2023-10-10 18:00:00-06	0	\N	2023-10-11 07:14:22.456-06	2023-10-11 07:14:23.872-06	qrcode_1697030062471.png	100	2	200	80	160	\N
29	8	9	8	Vaiha	H	Test001	12	26	14	7	29	2023-10-11 18:00:00-06	0	\N	2023-10-11 22:23:59.402-06	2023-10-11 22:25:23.013-06	qrcode_1697084639422.png	10	100	1000	11	1100	\N
30	8	6	3	testing	farm	XABADA	12	26	14	14	32	2023-10-11 18:00:00-06	0	\N	2023-10-11 22:28:47.793-06	2023-10-11 22:28:48.558-06	qrcode_1697084927815.png	100	2	200	101	202	\N
18	8	6	3	Kavitha		Test-001	27	31	18	10	15	2023-09-25 18:00:00-06	0	\N	2023-09-26 05:48:31.442-06	2023-09-26 05:48:32.736-06	qrcode_1695728911459.png	5	5	25	5	25	\N
19	8	6	3	Kavitha		test-001	27	31	18	10	15	2023-09-28 18:00:00-06	0	\N	2023-09-29 01:34:59.039-06	2023-09-29 01:35:00.379-06	qrcode_1695972899045.png	5	5	25	5	25	\N
20	8	6	3	Anonymous	Afron	TESTXXX	11	12	6	5	8	2023-10-06 18:00:00-06	0	\N	2023-10-09 00:29:28.352-06	2023-10-09 00:29:29.711-06	qrcode_1696832968366.png	564	43	24252	555	23865	\N
21	8	7	6	Test	Test	TESTXXXTESTXX	11	12	6	5	8	2023-10-04 18:00:00-06	0	\N	2023-10-09 00:31:36.43-06	2023-10-09 00:31:37.196-06	qrcode_1696833096451.png	767	65	49855	454	29510	\N
31	8	6	3	test	farmer	XXAXAXAX	12	26	14	7	29	2023-10-12 18:00:00-06	0	\N	2023-10-12 00:05:15.338-06	2023-10-12 00:05:16.15-06	qrcode_1697090715360.png	100	2	200	101	202	\N
32	11	6	3	farmer	newteat	XAFAR	12	26	14	7	28	2023-10-11 18:00:00-06	0	\N	2023-10-12 05:57:27.855-06	2023-10-12 05:57:29.185-06	qrcode_1697111847875.png	10	2	20	10	20	\N
33	11	6	3	Jeevitha1	Karunakaran	FC_123654789	12	26	14	14	18	2023-10-12 18:00:00-06	0	\N	2023-10-13 03:14:05.042-06	2023-10-13 03:16:23.576-06	qrcode_1697188445077.png	4	3	12	2	6	\N
\.


--
-- Name: farmers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('farmers_id_seq', 33, true);


--
-- Data for Name: farms; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY farms (id, farmer_id, season_id, program_id, agri_total_area, agri_estimated_yeld, agri_estimated_prod, cotton_total_area, total_estimated_cotton, "createdAt", "updatedAt", cotton_transacted) FROM stdin;
20	27	13	8	50	21	1050	49	1029	2023-10-11 07:11:41.01-06	2023-10-11 07:11:41.01-06	0
21	28	13	8	100	2	200	80	160	2023-10-11 07:14:23.875-06	2023-10-11 07:14:23.875-06	0
22	29	7	8	10	100	1000	12	1200	2023-10-11 22:24:00.277-06	2023-10-11 22:24:00.277-06	0
23	30	13	8	100	2	200	101	202	2023-10-11 22:28:48.561-06	2023-10-11 22:28:48.561-06	0
25	27	13	8	100	2	200	101	202	2023-10-12 00:49:08.256-06	2023-10-12 00:54:23.02-06	0
26	27	7	8	7	6	42	4	24	2023-10-12 03:22:27.856-06	2023-10-12 03:22:27.856-06	0
27	27	7	8	7	6	42	4	24	2023-10-12 03:22:28.18-06	2023-10-12 03:22:28.18-06	0
28	27	7	8	7	6	42	4	24	2023-10-12 03:22:28.439-06	2023-10-12 03:22:28.439-06	0
29	27	7	8	7	6	42	4	24	2023-10-12 03:22:28.492-06	2023-10-12 03:22:28.492-06	0
30	32	13	11	10	2	20	10	20	2023-10-12 05:57:29.189-06	2023-10-12 05:57:29.189-06	0
31	33	7	11	4	3	12	2	6	2023-10-13 03:14:06.442-06	2023-10-13 03:20:38.109-06	0
32	33	13	11	5	5	25	4	20	2023-10-13 03:21:56.265-06	2023-10-13 03:21:56.265-06	0
19	27	7	8	36	12	432	22	264	2023-10-09 02:12:56.292-06	2023-10-13 03:26:00.792-06	0
\.


--
-- Name: farms_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('farms_id_seq', 32, true);


--
-- Data for Name: garment_sales; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY garment_sales (id, garment_id, season_id, date, program_id, department_id, order_ref, buyer_type, buyer_id, trader_id, processor_name, processor_address, fabric_length, additional_fabric_length, total_fabric_length, transaction_via_trader, transaction_agent, garment_type, style_mark_no, garment_size, color, no_of_pieces, no_of_boxes, invoice_no, box_ids, bill_of_ladding, transport_info, contract_no, tc_file, contract_file, invoice_file, delivery_notes, qty_stock, embroidering_required, embroidering_id, status, "createdAt", "updatedAt", qr, accept_date) FROM stdin;
\.


--
-- Name: garment_sales_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('garment_sales_id_seq', 1, false);


--
-- Data for Name: garment_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY garment_types (id, name, status, "createdAt", "updatedAt") FROM stdin;
1	test 1	t	2023-09-27 23:35:17.026-06	2023-09-27 23:35:17.026-06
2	test 2	t	2023-09-27 23:35:17.039-06	2023-09-27 23:35:17.039-06
3	test 3	t	2023-09-27 23:35:17.042-06	2023-09-27 23:35:17.042-06
4	test 4	t	2023-09-27 23:35:17.045-06	2023-09-27 23:35:17.045-06
5	test 5	t	2023-09-27 23:35:17.048-06	2023-09-27 23:35:17.048-06
6	test 6	t	2023-09-27 23:35:17.051-06	2023-09-27 23:35:17.051-06
7	test 7	t	2023-09-27 23:36:39.543-06	2023-09-27 23:36:39.543-06
8	test 8	t	2023-09-27 23:36:39.563-06	2023-09-27 23:36:39.563-06
9	test 9	t	2023-09-27 23:36:39.569-06	2023-09-27 23:36:39.569-06
10	test 10	t	2023-09-27 23:36:39.571-06	2023-09-27 23:36:39.571-06
11	test 11	t	2023-09-27 23:36:39.574-06	2023-09-27 23:36:39.574-06
12	test 12	t	2023-09-27 23:36:39.577-06	2023-09-27 23:36:39.577-06
13	test 13	t	2023-09-27 23:36:39.579-06	2023-09-27 23:36:39.579-06
14	test 14	t	2023-09-27 23:36:39.582-06	2023-09-27 23:36:39.582-06
15	test 15	t	2023-09-27 23:36:39.585-06	2023-09-27 23:36:39.585-06
16	test 16	t	2023-09-27 23:36:39.588-06	2023-09-27 23:36:39.588-06
17	test 17	t	2023-09-27 23:36:39.591-06	2023-09-27 23:36:39.591-06
18	test 18	t	2023-09-27 23:36:39.594-06	2023-09-27 23:36:39.594-06
19	test 19	t	2023-09-27 23:36:39.597-06	2023-09-27 23:36:39.597-06
20	test 20	t	2023-09-27 23:36:39.6-06	2023-09-27 23:36:39.6-06
21	Testing 1	t	2023-09-28 05:16:22.435-06	2023-09-28 05:16:22.435-06
22	Testing 2	t	2023-09-28 05:16:22.453-06	2023-09-28 05:16:22.453-06
23	Testing 3	t	2023-09-28 05:16:22.456-06	2023-09-28 05:16:22.456-06
24	Garment 1	t	2023-09-28 23:17:57.403-06	2023-09-28 23:17:57.403-06
25	Garment 2	t	2023-09-28 23:17:57.416-06	2023-09-28 23:17:57.416-06
26	Anil Garment1	t	2023-10-05 04:19:33.628-06	2023-10-05 04:19:33.628-06
27	Anil Garment 2	t	2023-10-05 04:19:33.64-06	2023-10-05 04:19:33.64-06
\.


--
-- Name: garment_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('garment_types_id_seq', 27, true);


--
-- Data for Name: garments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY garments (id, name, address, country_id, state_id, program_id, latitude, longitude, website, contact_person, no_of_machines, fabric_type, prod_cap, loss_from, loss_to, unit_cert, company_info, org_logo, org_photo, certs, brand, mobile, landline, email, "garmentUser_id", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: garments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('garments_id_seq', 1, false);


--
-- Data for Name: gin-bales; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "gin-bales" (id, process_id, bale_no, weight, staple, mic, strength, trash, color_grade, qr, "createdAt", "updatedAt", sold_status) FROM stdin;
\.


--
-- Name: gin-bales_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"gin-bales_id_seq"', 1, false);


--
-- Data for Name: gin_process; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY gin_process (id, ginner_id, season_id, date, program_id, total_qty, no_of_bales, gin_out_turn, lot_no, reel_lot_no, press_no, weight, staple, mic, strength, trash, color_grade, "createdAt", "updatedAt", qr) FROM stdin;
\.


--
-- Name: gin_process_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('gin_process_id_seq', 1, false);


--
-- Data for Name: gin_processes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY gin_processes (id, ginner_id, season_id, date, program_id, total_qty, no_of_bales, gin_out_turn, lot_no, reel_lot_no, press_no, weight, staple, mic, strength, trash, color_grade, qr, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: gin_processes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('gin_processes_id_seq', 1, false);


--
-- Data for Name: gin_sales; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY gin_sales (id, ginner_id, season_id, date, program_id, total_qty, no_of_bales, choosen_bale, lot_no, buyer, shipping_address, transaction_via_trader, transaction_agent, tc_file, contract_file, invoice_file, delivery_notes, candy_rate, rate, sale_value, invoice_no, despatch_from, despatch_to, status, "createdAt", "updatedAt", qr, weight_loss, transporter_name, vehicle_no, lrbl_no, place_of_supply, gst_number, gst_percentage, gross_weight, tare_weight, less_weight, sample, press_no, reel_lot_no, qty_stock) FROM stdin;
\.


--
-- Name: gin_sales_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('gin_sales_id_seq', 1, false);


--
-- Data for Name: ginner_expected_cottons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY ginner_expected_cottons (id, season_id, upload_date, ginner_id, ginning_mill, brand_id, program_id, expected_seed_cotton, expected_lint, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: ginner_expected_cottons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('ginner_expected_cottons_id_seq', 1, false);


--
-- Data for Name: ginner_orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY ginner_orders (id, season_id, upload_date, ginner_id, ginning_mill, brand_id, program_id, confirmed_bales, confirmed_lint_order, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: ginner_orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('ginner_orders_id_seq', 1, false);


--
-- Data for Name: ginners; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY ginners (id, name, short_name, address, country_id, state_id, program_id, latitude, longitude, website, contact_person, outturn_range_from, outturn_range_to, bale_weight_from, bale_weight_to, unit_cert, company_info, org_logo, org_photo, certs, brand, mobile, landline, email, gin_type, "ginnerUser_id", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: ginners_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('ginners_id_seq', 1, false);


--
-- Data for Name: ics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY ics (id, ics_name, "farmGroup_id", ics_latitude, ics_longitude, ics_status, "createdAt", "updatedAt") FROM stdin;
1	Kavitha ICS Name	3	21test	22test	t	2023-09-25 05:51:17.876-06	2023-09-25 05:52:07.62-06
2	vaiha 	3			t	2023-09-26 03:06:24.712-06	2023-09-26 03:06:24.712-06
4	Anil test()$)(%()^()%)(^OITYYIYOI^()	6			t	2023-10-05 01:34:56.002-06	2023-10-05 01:35:12.591-06
\.


--
-- Name: ics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('ics_id_seq', 4, true);


--
-- Data for Name: knit_sales; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY knit_sales (id, knitter_id, season_id, date, program_id, order_ref, buyer_type, buyer_id, processor_name, processor_address, transaction_via_trader, transaction_agent, yarn_qty, additional_yarn_qty, total_yarn_qty, fabric_type, fabric_length, fabric_gsm, fabric_weight, batch_lot_no, job_details_garment, bale_ids, invoice_no, bill_of_ladding, transporter_name, vehicle_no, tc_file, contract_file, invoice_file, delivery_notes, qty_stock, dyeing_required, dyeing_id, status, "createdAt", "updatedAt", cottonmix_type, cottonmix_qty, qr, accept_date, blend_choose) FROM stdin;
\.


--
-- Name: knit_sales_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('knit_sales_id_seq', 1, false);


--
-- Data for Name: knit_yarn_selections; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY knit_yarn_selections (id, yarn_id, sales_id, type, qty_used, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: knit_yarn_selections_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('knit_yarn_selections_id_seq', 1, false);


--
-- Data for Name: knitters; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY knitters (id, name, address, country_id, state_id, program_id, latitude, longitude, website, contact_person, no_of_machines, fabric_type, prod_cap, loss_from, loss_to, unit_cert, company_info, org_logo, org_photo, certs, brand, mobile, landline, email, "knitterUser_id", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: knitters_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('knitters_id_seq', 1, false);


--
-- Data for Name: linen_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY linen_details (id, season_id, harvest, farmer_no, farmer_name, country, town, department, area, linen_variety, cooperative_name, no_of_bales, farm_lot_no, total_weight, scutch_date, scutching_lot_no, bales_after_scutching, weight_after_scutching, shipment_date, shipment_details, shiped_to, qty_stock, program_id, status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: linen_details_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('linen_details_id_seq', 1, false);


--
-- Data for Name: linens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY linens (id, name, variety, status, "createdAt", "updatedAt") FROM stdin;
1	abc	test 1	t	2023-09-12 08:51:20.845-06	2023-09-12 08:51:20.845-06
2	ghi	test 2	t	2023-09-12 08:51:33.231-06	2023-09-12 08:51:33.231-06
3	test 	test 3	t	2023-09-12 08:51:47.024-06	2023-09-12 08:51:47.024-06
4	ksdjgkjf#*(*(%%*(^*(GU	jsafdsewuweu8*(#$*(%%	t	2023-10-05 01:41:15.721-06	2023-10-05 01:41:15.721-06
\.


--
-- Name: linens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('linens_id_seq', 4, true);


--
-- Data for Name: lint_selections; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY lint_selections (id, process_id, lint_id, qty_used, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: lint_selections_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('lint_selections_id_seq', 1, false);


--
-- Data for Name: loom_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY loom_types (id, name, status, "createdAt", "updatedAt") FROM stdin;
1	Test21	t	2023-09-12 08:29:02.113-06	2023-09-14 06:28:38.999-06
2	abc123@#%^?"	t	2023-09-12 08:29:02.113-06	2023-09-14 06:28:59.388-06
5	xyz	t	2023-09-14 06:29:24.456-06	2023-09-14 06:29:24.456-06
8	Kavitha Loom Type	t	2023-09-25 05:44:38.362-06	2023-09-25 05:45:47.306-06
10	backstrap loom	t	2023-09-26 02:36:45.363-06	2023-09-26 02:36:45.363-06
3	inkle loom	t	2023-09-12 08:29:18.171-06	2023-09-26 02:38:57.925-06
11	Anil Test#)()$T)^(&Y))(E	t	2023-10-05 01:29:52.092-06	2023-10-05 01:30:49.405-06
\.


--
-- Name: loom_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('loom_types_id_seq', 11, true);


--
-- Data for Name: menu_lists; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY menu_lists (id, menu_name, categories_allowed, status, "createdAt", "updatedAt") FROM stdin;
1	Master	{1,2,11,12}	\N	2023-09-28 08:09:26.276-06	2023-09-28 08:09:26.276-06
2	Farmer Enrollment	{1,2,9,3,11,12}	\N	2023-09-28 08:09:51.18-06	2023-09-28 08:09:51.18-06
3	Procurement	{1,2,9,3,11,12}	\N	2023-09-28 08:10:04.57-06	2023-09-28 08:10:04.57-06
4	Organic Integrity	{1,2,3,11,12}	\N	2023-09-28 08:10:14.179-06	2023-09-28 08:10:14.179-06
5	User Management	{1,2,11,12}	\N	2023-09-28 08:10:24.717-06	2023-09-28 08:10:24.717-06
6	Retailer & Brand Registration	{1,2,11,12}	\N	2023-09-28 08:10:35.595-06	2023-09-28 08:10:35.595-06
7	Processor Registration	{1,2,3,11,12}	\N	2023-09-28 08:10:44.453-06	2023-09-28 08:10:44.453-06
8	Device Management	{1,2,11,12}	\N	2023-09-28 08:10:54.353-06	2023-09-28 08:10:54.353-06
9	Menu & Entitlement	{1,2,11,12}	\N	2023-09-28 08:11:14.139-06	2023-09-28 08:11:14.139-06
10	Organic Farmer Report	{1,2,3,11,12}	\N	2023-09-28 08:11:25.658-06	2023-09-28 08:11:25.658-06
11	Non Organic Farmer Report	{1,2,3,11,12}	\N	2023-09-28 08:11:39.053-06	2023-09-28 08:11:39.053-06
12	Procurement Report	{1,2,3,11,12}	\N	2023-09-28 08:11:53.275-06	2023-09-28 08:11:53.275-06
13	Organic Integrity Report	{1,2,3,11,12}	\N	2023-09-28 08:12:04.335-06	2023-09-28 08:12:04.335-06
14	Ginner Transaction	{1,4}	\N	2023-09-28 08:12:13.509-06	2023-09-28 08:12:13.509-06
15	Ginner Process	{1,4}	\N	2023-09-28 08:12:23.404-06	2023-09-28 08:12:23.404-06
16	Ginner Sale	{1,4}	\N	2023-09-28 08:12:34.844-06	2023-09-28 08:12:34.844-06
17	Ginner Supply Chain	{1,4}	\N	2023-09-28 08:12:42.207-06	2023-09-28 08:12:42.207-06
18	Spinner Transaction	{1,5}	\N	2023-09-28 08:13:19.064-06	2023-09-28 08:13:19.064-06
19	Spinner Sale	{1,5}	\N	2023-09-28 08:13:27.198-06	2023-09-28 08:13:27.198-06
20	Spinner Supply Chain	{1,5}	\N	2023-09-28 08:13:34.934-06	2023-09-28 08:13:34.934-06
21	Weaver Transaction	{1,6}	\N	2023-09-28 08:13:42.919-06	2023-09-28 08:13:42.919-06
22	Weaver Sale	{1,6}	\N	2023-09-28 08:13:51.051-06	2023-09-28 08:13:51.051-06
23	Weaver Supply Chain	{1,6}	\N	2023-09-28 08:13:59.818-06	2023-09-28 08:13:59.818-06
24	Knitter Transaction	{1,7}	\N	2023-09-28 08:14:08.333-06	2023-09-28 08:14:08.333-06
25	Knitter Sale	{1,7}	\N	2023-09-28 08:14:16.731-06	2023-09-28 08:14:16.731-06
26	Knitter Supply Chain	{1,7}	\N	2023-09-28 08:14:25.284-06	2023-09-28 08:14:25.284-06
27	Garment Transaction	{1,8}	\N	2023-09-28 08:14:33.149-06	2023-09-28 08:14:33.149-06
28	Garment Sale	{1,8}	\N	2023-09-28 08:14:41.415-06	2023-09-28 08:14:41.415-06
29	Garment Supply Chain	{1,8}	\N	2023-09-28 08:14:52.601-06	2023-09-28 08:14:52.601-06
30	Upload Database	{1,2,9,11,12}	\N	2023-09-28 08:15:04.318-06	2023-09-28 08:15:04.318-06
31	Comber Noir	{1,5}	\N	2023-09-28 08:15:13.134-06	2023-09-28 08:15:13.134-06
32	Entity Limit	{1}	\N	2023-09-28 08:15:23.321-06	2023-09-28 08:15:23.321-06
33	Ginner Sales Report	{1,2,3,11,12}	\N	2023-09-28 08:15:32.215-06	2023-09-28 08:15:32.215-06
34	Spinner Bale Receipt	{1,2,3,11,12}	\N	2023-09-28 08:15:40.79-06	2023-09-28 08:15:40.79-06
35	Spinner Yarn Sale	{1,2,3,11,12}	\N	2023-09-28 08:16:12.866-06	2023-09-28 08:16:12.866-06
36	Knitter Yarn Receipt	{1,2,3,11,12}	\N	2023-09-28 08:16:25.56-06	2023-09-28 08:16:25.56-06
37	Knitter Fabric Sale	{1,2,3,11,12}	\N	2023-09-28 08:16:37.181-06	2023-09-28 08:16:37.181-06
38	Weaver Yarn Receipt	{1,2,3,11,12}	\N	2023-09-28 08:16:48.091-06	2023-09-28 08:16:48.091-06
39	Weaver Fabric Sale	{1,2,3,11,12}	\N	2023-09-28 08:16:58.629-06	2023-09-28 08:16:58.629-06
40	Garment Fabric Receipt	{1,2,3,11,12}	\N	2023-09-28 08:17:11.399-06	2023-09-28 08:17:11.399-06
41	Garment Sale Report	{1,2,3,11,12}	\N	2023-09-28 08:17:20.908-06	2023-09-28 08:17:20.908-06
42	Consolidated Traceability	{1,2,3,11,12}	\N	2023-09-28 08:17:29.376-06	2023-09-28 08:17:29.376-06
43	QR Code Track	{1,2,3,11,12}	\N	2023-09-28 08:17:38.132-06	2023-09-28 08:17:38.132-06
44	Email Management	{1}	\N	2023-09-28 08:17:48.038-06	2023-09-28 08:17:48.038-06
45	Spinner Process	{1,5}	\N	2023-09-28 08:17:55.859-06	2023-09-28 08:17:55.859-06
46	Trader Transaction	{1,10}	\N	2023-09-28 08:18:04.567-06	2023-09-28 08:18:04.567-06
47	Trader Sale	{1,10}	\N	2023-09-28 08:18:14.026-06	2023-09-28 08:18:14.026-06
48	Premium Validation	{1,2,3,11,12}	\N	2023-09-28 08:18:24.655-06	2023-09-28 08:18:24.655-06
49	Ginner Bales Report	{1,2,3,11,12}	\N	2023-09-28 08:18:35.634-06	2023-09-28 08:18:35.634-06
50	Ginner Sales Pending	{1,2,3,11,12}	\N	2023-09-28 08:18:43.752-06	2023-09-28 08:18:43.752-06
51	Upload Linen	{1,2,3,11,12}	\N	2023-09-28 08:18:56.899-06	2023-09-28 08:18:56.899-06
52	Linen Transactions	{1,2,3,11,12}	\N	2023-09-28 08:19:05.778-06	2023-09-28 08:19:05.778-06
53	Video	{1,2,3,11,12}	\N	2023-09-28 08:19:18.347-06	2023-09-28 08:19:18.347-06
54	Scope Certificate	{1,2,3,11,12}	\N	2023-09-28 08:19:25.259-06	2023-09-28 08:19:25.259-06
55	Scope Certificate Report	{1,2,3,11,12}	\N	2023-09-28 08:19:34.251-06	2023-09-28 08:19:34.251-06
56	Processor Training	{1,2,3}	\N	2023-09-28 08:19:43.105-06	2023-09-28 08:19:43.105-06
57	Tracebale Training	{4,5,6,7,8,10}	\N	2023-09-28 08:19:50.095-06	2023-09-28 08:19:50.095-06
58	Spinner Pending Bales Receipt Report	{1,2,3,11,12}	\N	2023-09-28 08:19:59.733-06	2023-09-28 08:19:59.733-06
59	Spinner Summary Report	{1,2,3,11,12}	\N	2023-09-28 08:20:08.593-06	2023-09-28 08:20:08.593-06
60	PSCP Procurement and Sell Live Tracker	{1,2,3,11,12}	\N	2023-09-28 08:20:15.34-06	2023-09-28 08:20:15.34-06
61	Ginner Expected seed cotton data	{1,2,3,11,12}	\N	2023-09-28 08:20:22.781-06	2023-09-28 08:20:22.781-06
62	Ginner order in Hand	{1,2,3,11,12}	\N	2023-09-28 08:20:31.461-06	2023-09-28 08:20:31.461-06
63	Agent User Management	{1,2,3,11,12}	\N	2023-09-28 08:20:40.285-06	2023-09-28 08:20:40.285-06
64	Cotton Quality Parameters	{4,1,2,3,11,12,5}	\N	2023-09-28 08:20:48.94-06	2023-09-28 08:20:48.94-06
65	Quality Parameter Analytics	{1,2,3,11,12}	\N	2023-09-28 08:20:58.118-06	2023-09-28 08:20:58.118-06
66	APP Procurement Report	{1}	\N	2023-09-28 08:21:12.887-06	2023-09-28 08:21:12.887-06
67	Ticketing	{1,2,3,4,5,13,14}	\N	2023-09-28 08:21:23.21-06	2023-09-28 08:21:23.21-06
68	Quality Parameter Dashboard	{1}	\N	2023-09-28 08:21:35.575-06	2023-09-28 08:21:35.575-06
69	Spinner Yarn Process	{1,2,3}	\N	2023-09-28 08:21:43.704-06	2023-09-28 08:21:43.704-06
70	Ginner Summary Report	{1}	\N	2023-09-28 08:21:54.61-06	2023-09-28 08:21:54.61-06
71	Quality Parameter Graph	{1}	\N	2023-09-28 08:22:00.775-06	2023-09-28 08:22:00.775-06
72	Fabric Dying Transaction	{1,2,16}	\N	2023-09-28 08:22:07.93-06	2023-09-28 08:22:07.93-06
73	Fabric Dying Process	{1,2,16}	\N	2023-09-28 08:22:14.855-06	2023-09-28 08:22:14.855-06
74	Fabric Washing Transaction	{1,2,16}	\N	2023-09-28 08:22:21.403-06	2023-09-28 08:22:21.403-06
75	Fabric Washing Process	{1,2,16}	\N	2023-09-28 08:22:28.158-06	2023-09-28 08:22:28.158-06
76	Fabric Printing Transaction	{1,2,16}	\N	2023-09-28 08:22:36.185-06	2023-09-28 08:22:36.185-06
77	Fabric Printing Process	{1,2,16}	\N	2023-09-28 08:22:42.711-06	2023-09-28 08:22:42.711-06
78	Fabric Compacting Transaction	{1,2,16}	\N	2023-09-28 08:22:48.707-06	2023-09-28 08:22:48.707-06
79	Fabric Compacting Process	{1,2,16}	\N	2023-09-28 08:22:59.363-06	2023-09-28 08:22:59.363-06
80	Traceability Ginner Report	{1,2,3,11,12}	\N	2023-09-28 08:23:06.862-06	2023-09-28 08:23:06.862-06
81	Traceability Spinner Report	{1,2,3,11,12}	\N	2023-09-28 08:23:13.56-06	2023-09-28 08:23:13.56-06
82	Traceability Knitter Report	{1,2,3,11,12}	\N	2023-09-28 08:23:20.628-06	2023-09-28 08:23:20.628-06
83	Traceability Weaver Report	{1,2,3,11,12}	\N	2023-09-28 08:23:27.082-06	2023-09-28 08:23:27.082-06
84	Traceability Garment Report	{1,2,3,11,12}	\N	2023-09-28 08:23:33.191-06	2023-09-28 08:23:33.191-06
85	Ginner Physical Tracebility	{1,4}	\N	2023-09-28 08:23:42.337-06	2023-09-28 08:23:42.337-06
86	Spinner Physical Tracebility	{1,5}	\N	2023-09-28 08:24:01.165-06	2023-09-28 08:24:01.165-06
87	Knitter Physical Tracebility	{1,7}	\N	2023-09-28 08:24:10.473-06	2023-09-28 08:24:10.473-06
88	Weaver Physical Tracebility	{1,6}	\N	2023-09-28 08:24:17.692-06	2023-09-28 08:24:17.692-06
89	Garment Physical Tracebility	{1,8}	\N	2023-09-28 08:24:32.641-06	2023-09-28 08:24:32.641-06
\.


--
-- Name: menu_lists_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('menu_lists_id_seq', 89, true);


--
-- Data for Name: organic_integrities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY organic_integrities (id, date, brand_id, test_stage, seal_no, sample_code, seed_lot, integrity_score, documents, "createdAt", "updatedAt", ginner_id, "farmGroup_id", ics_id, farmer) FROM stdin;
\.


--
-- Name: organic_integrities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('organic_integrities_id_seq', 1, false);


--
-- Data for Name: process_training_process_statuses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY process_training_process_statuses (id, process_training_id, spinner_id, ginner_id, weaver_id, knitter_id, trader_id, garment_id, status, feedback, "createdAt", "updatedAt", subject) FROM stdin;
\.


--
-- Name: process_training_process_statuses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('process_training_process_statuses_id_seq', 1, false);


--
-- Data for Name: processor_trainings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY processor_trainings (id, training_type, brand_id, country_id, processor, training_mode, processor_name, training_description, venue, date, start_time, end_time, feedback, status, "createdAt", "updatedAt", state_id) FROM stdin;
\.


--
-- Name: processor_trainings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('processor_trainings_id_seq', 1, false);


--
-- Data for Name: prod_capacities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY prod_capacities (id, name, status, "createdAt", "updatedAt") FROM stdin;
2	xyz	t	2023-09-12 08:30:00.609-06	2023-09-12 08:30:00.609-06
3	mno	t	2023-09-12 08:30:10.927-06	2023-09-12 08:30:10.927-06
4	test123	t	2023-09-14 06:34:47.237-06	2023-09-14 06:34:47.237-06
5	xyz@!$%^&	t	2023-09-14 06:34:47.237-06	2023-09-14 06:34:47.237-06
6	Kavitha Production Capacity	t	2023-09-25 05:47:30.667-06	2023-09-25 05:47:51.431-06
7	test production	t	2023-09-26 02:43:53.743-06	2023-09-26 02:43:53.743-06
1	test	t	2023-09-12 08:29:50.626-06	2023-09-26 02:45:08.211-06
9	Anil Test	t	2023-10-05 01:31:43.418-06	2023-10-05 01:31:43.418-06
10	Anil Tetbbn)#)##%()^(*^^)(^	t	2023-10-05 01:31:43.433-06	2023-10-05 01:31:43.433-06
\.


--
-- Name: prod_capacities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('prod_capacities_id_seq', 10, true);


--
-- Data for Name: programs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY programs (id, program_name, program_status, "createdAt", "updatedAt") FROM stdin;
2	Test	t	2023-09-12 08:19:08.475-06	2023-09-14 06:03:16.611-06
6	mngghh112	t	2023-09-14 06:06:23.433-06	2023-09-14 06:06:23.433-06
1	test!@#$1	t	2023-09-12 08:18:56.827-06	2023-09-14 06:07:04.956-06
8	REEL	t	2023-09-20 02:43:49.834-06	2023-09-20 02:43:49.834-06
9	Organic	t	2023-09-20 02:43:49.847-06	2023-09-20 02:43:49.847-06
10	Kavitha Program	t	2023-09-25 05:14:35.418-06	2023-09-25 05:14:51.953-06
11	Farmer	t	2023-09-26 02:06:37.489-06	2023-09-26 02:06:37.489-06
12	ANIl Test	t	2023-10-05 01:25:09.645-06	2023-10-05 01:25:09.645-06
\.


--
-- Name: programs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('programs_id_seq', 12, true);


--
-- Data for Name: quality-parameters; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "quality-parameters" (id, process_id, spinner_id, ginner_id, sold_to, test_report, lab_name, sci, moisture, mic, mat, uhml, ui, sf, str, elg, rd, plusb, document, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: quality-parameters_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"quality-parameters_id_seq"', 1, false);


--
-- Data for Name: ratings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY ratings (id, user_id, user_type, rated_by, rated_by_type, rating, description, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: ratings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('ratings_id_seq', 1, false);


--
-- Data for Name: scope_certs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY scope_certs (id, country_id, state_id, brand_id, "farmGroup_id", ics_id, validity_end, standard, document, "createdAt", "updatedAt") FROM stdin;
5	27	31	6	3	2	2023-10-08 12:30:00-06	NPOP	https://api.newtracebale.com/file/1696827379660-head_s.jpg	2023-10-08 22:56:20.199-06	2023-10-08 22:56:20.199-06
6	2	3	7	3	2	2023-10-31 12:30:00-06	NOP	https://api.newtracebale.com/file/1696938057929-Academic Planner-SSVM 2023 - 24 - Grade 2.pdf	2023-10-10 05:40:59.189-06	2023-10-10 05:40:59.189-06
8	2	3	7	6	4	2023-11-03 12:30:00-06	NPOP	https://api.newtracebale.com/file/1696938600718-Academic Planner-SSVM 2023 - 24 - Grade 2.pdf	2023-10-10 05:50:02.736-06	2023-10-10 05:50:02.736-06
\.


--
-- Name: scope_certs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('scope_certs_id_seq', 8, true);


--
-- Data for Name: seasons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY seasons (id, name, status, "from", "to", "createdAt", "updatedAt") FROM stdin;
11	dkgjdfg()$%)(%()^()^^()^	t	2023-10-05T00:00:00.000Z	2023-10-20T00:00:00.000Z	2023-10-05 01:27:01.54-06	2023-10-05 01:27:01.54-06
7	2022-23	t	2023-09-06T00:00:00.000Z	2023-09-13T00:00:00.000Z	2023-09-19 01:25:51.824-06	2023-10-05 03:35:00.875-06
13	2021-22	t	2022-03-01T00:00:00.000Z	2023-03-01T00:00:00.000Z	2023-10-09 01:02:31.59-06	2023-10-09 01:02:31.59-06
\.


--
-- Name: seasons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('seasons_id_seq', 13, true);


--
-- Data for Name: spin_process; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY spin_process (id, spinner_id, season_id, date, program_id, yarn_type, total_qty, yarn_count, yarn_qty_produced, yarn_realisation, net_yarn_qty, comber_noil, no_of_boxes, batch_lot_no, reel_lot_no, box_id, process_complete, dyeing_required, qty_stock, status, dyeing_id, "createdAt", "updatedAt", cottonmix_type, cottonmix_qty, accept_date, tot_box_user, display_order, qr, other_mix, comber_noil_stock) FROM stdin;
\.


--
-- Name: spin_process_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('spin_process_id_seq', 1, false);


--
-- Data for Name: spin_process_yarn_selections; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY spin_process_yarn_selections (id, spin_process_id, sales_id, no_of_box, qty_used, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: spin_process_yarn_selections_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('spin_process_yarn_selections_id_seq', 1, false);


--
-- Data for Name: spin_sales; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY spin_sales (id, spinner_id, season_id, date, program_id, order_ref, buyer_type, buyer_id, processor_name, processor_address, trader_id, transaction_via_trader, transaction_agent, total_qty, no_of_boxes, batch_lot_no, reel_lot_no, box_ids, yarn_type, yarn_count, invoice_no, bill_of_ladding, transporter_name, vehicle_no, quality_doc, tc_files, contract_file, invoice_file, delivery_notes, qty_stock, status, "createdAt", "updatedAt", qr, knitter_id) FROM stdin;
\.


--
-- Name: spin_sales_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('spin_sales_id_seq', 1, false);


--
-- Data for Name: spinners; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY spinners (id, name, short_name, address, country_id, state_id, program_id, latitude, longitude, website, contact_person, yarn_count_range, realisation_range_from, realisation_range_to, unit_cert, company_info, org_logo, org_photo, certs, brand, mobile, landline, email, yarn_type, "spinnerUser_id", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: spinners_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('spinners_id_seq', 1, false);


--
-- Data for Name: states; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY states (id, country_id, state_name, state_status, state_latitude, state_longitude, "createdAt", "updatedAt") FROM stdin;
34	13	Berlin	t			2023-09-25 21:48:11.681-06	2023-09-25 21:48:11.681-06
12	11	Florida	t			2023-09-12 05:03:00.139-06	2023-09-25 22:06:23.877-06
3	2	Dhaka	t			2023-09-12 03:56:34.214-06	2023-09-12 04:52:07.975-06
35	27	Kavitha state new	t	122.556	122.566	2023-09-27 22:37:25.454-06	2023-09-27 22:37:25.454-06
36	13	Germany	t			2023-10-04 07:19:41.389-06	2023-10-04 07:19:41.389-06
9	9	Barcelona	t			2023-09-12 04:58:27.664-06	2023-10-04 07:20:38.523-06
21	15	kanto	t			2023-09-12 22:15:48.889-06	2023-09-12 23:19:56.889-06
26	12	bihar	t			2023-09-12 23:35:31.412-06	2023-09-12 23:35:31.412-06
31	27	KavithaState	t			2023-09-25 04:16:14.867-06	2023-09-25 04:16:53.897-06
32	27	VaihaStatee	t			2023-09-25 04:16:14.881-06	2023-09-25 04:19:30.661-06
\.


--
-- Name: states_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('states_id_seq', 36, true);


--
-- Data for Name: style_mark_nos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY style_mark_nos (id, style_mark_no, status, "createdAt", "updatedAt") FROM stdin;
1	test 1	t	2023-09-27 23:50:06.335-06	2023-09-27 23:50:06.335-06
2	test 2	t	2023-09-27 23:50:06.351-06	2023-09-27 23:50:06.351-06
3	test kavitha	t	2023-09-29 01:30:18.401-06	2023-09-29 01:30:18.401-06
4	SLXL2	t	2023-10-05 04:21:49.441-06	2023-10-05 04:21:49.441-06
5	XLL2	t	2023-10-05 04:21:49.458-06	2023-10-05 04:21:49.458-06
\.


--
-- Name: style_mark_nos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('style_mark_nos_id_seq', 5, true);


--
-- Data for Name: ticket_tracker_status; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY ticket_tracker_status (id, ticket_id, status, comment, user_id, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: ticket_tracker_status_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('ticket_tracker_status_id_seq', 1, false);


--
-- Data for Name: ticket_tracker_statuses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY ticket_tracker_statuses (id, ticket_id, status, comment, user_id, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: ticket_tracker_statuses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('ticket_tracker_statuses_id_seq', 1, false);


--
-- Data for Name: ticket_trackers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY ticket_trackers (id, ticket_no, date, processor_name, processor_type, ticket_type, process_or_sales, style_mark_no, comments, documents, status, resolved_date, "createdAt", "updatedAt", process_id) FROM stdin;
\.


--
-- Name: ticket_trackers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('ticket_trackers_id_seq', 1, false);


--
-- Data for Name: ticketing_escalation_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY ticketing_escalation_types (id, name, processor_type, correction_type, status, is_others, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: ticketing_escalation_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('ticketing_escalation_types_id_seq', 1, false);


--
-- Data for Name: trader_sales; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY trader_sales (id, trader_id, season_id, date, program_id, department_id, order_ref, buyer_type, buyer_id, processor_id, processor_name, processor_address, fabric_length, additional_fabric_length, total_fabric_length, batch_lot_no, no_of_pieces, no_of_boxes, invoice_no, box_ids, bill_of_ladding, transport_info, contract_no, tc_file, contract_file, invoice_file, delivery_notes, total_qty, qty_stock, embroidering_required, embroidering_id, status, qr, accept_date, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: trader_sales_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('trader_sales_id_seq', 1, false);


--
-- Data for Name: traders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY traders (id, name, address, country_id, state_id, program_id, latitude, longitude, website, contact_person, unit_cert, company_info, org_logo, org_photo, certs, brand, material_trading, mobile, landline, email, "traderUser_id", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: traders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('traders_id_seq', 1, false);


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY transactions (id, date, country_id, state_id, district_id, block_id, village_id, farmer_id, farmer_name, brand_id, farmer_code, season_id, qty_purchased, rate, grade_id, program_id, total_amount, mapped_ginner, vehicle, payment_method, proof, status, "createdAt", "updatedAt", estimated_cotton, accept_date, available_cotton, farm_id, qty_stock) FROM stdin;
\.


--
-- Name: transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('transactions_id_seq', 1, false);


--
-- Data for Name: unit_certifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY unit_certifications (id, certification_name, certification_logo, certification_status, "createdAt", "updatedAt") FROM stdin;
17	Test 	https://api.newtracebale.com/file/1695199784136-test.png	t	2023-09-20 02:49:47.05-06	2023-09-20 02:49:47.05-06
18	certification	https://api.newtracebale.com/file/1695199827944-images.png	t	2023-09-20 02:50:31.463-06	2023-09-20 02:50:31.463-06
19	Kavitha unit certification	https://api.newtracebale.com/file/1695640280696-11-Most-important-government-schemes-in-agriculture-sector-2-768x508.jpg	t	2023-09-25 05:11:22.921-06	2023-09-25 05:11:22.921-06
23	vaiha1@#$	https://api.newtracebale.com/file/1695642387310-file-sample_100kB.doc	t	2023-09-25 05:46:30.687-06	2023-09-25 05:46:30.687-06
22	Farmer	https://api.newtracebale.com/file/1695643107614-file-sample_100kB.doc	t	2023-09-25 05:43:52.513-06	2023-09-25 05:58:31.381-06
24	Anil Test	https://api.newtracebale.com/file/1696490471980-download.pdf	t	2023-10-05 01:21:16.692-06	2023-10-05 01:21:16.692-06
\.


--
-- Name: unit_certifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('unit_certifications_id_seq', 24, true);


--
-- Data for Name: unit_subtypes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY unit_subtypes (id, "unitType_id", "unitSubType", "unitSubType_status", "createdAt", "updatedAt") FROM stdin;
3	1	Test 3@#$	t	2023-09-12 08:13:58.737-06	2023-09-14 05:17:19.971-06
8	6	 tst123@#$%()?	t	2023-09-14 05:17:46.086-06	2023-09-14 05:17:46.086-06
10	3	Test	t	2023-09-14 05:27:30.555-06	2023-09-14 05:27:30.555-06
11	11	Kavitha Sub Type2	t	2023-09-25 05:10:12.746-06	2023-09-25 05:10:23.064-06
12	9	Spinner	t	2023-09-25 05:15:07.558-06	2023-09-26 01:37:42.76-06
14	13	Anil Test #*(*#$_)%_)%'	t	2023-10-05 01:20:33.932-06	2023-10-05 01:20:33.932-06
\.


--
-- Name: unit_subtypes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('unit_subtypes_id_seq', 14, true);


--
-- Data for Name: unit_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY unit_types (id, "unitType", "unitType_status", "createdAt", "updatedAt") FROM stdin;
5	abc!@##$?>	t	2023-09-14 05:02:35.26-06	2023-09-14 05:02:35.26-06
6	suv1	t	2023-09-14 05:04:29.802-06	2023-09-14 05:04:40.712-06
8	Ginner1@	t	2023-09-25 04:50:42.77-06	2023-09-25 04:50:42.77-06
9	Spinner	t	2023-09-25 04:57:58.412-06	2023-09-25 04:57:58.412-06
3	xyz1	t	2023-09-12 08:12:07.135-06	2023-09-25 05:01:43.537-06
10	KavithaUnit Type1	t	2023-09-25 05:09:08.974-06	2023-09-25 05:09:08.974-06
11	KavithaUnit Type2	t	2023-09-25 05:09:08.992-06	2023-09-25 05:09:08.992-06
1	Test1	t	2023-09-12 08:11:39.835-06	2023-09-26 01:29:29.237-06
13	Anil test	t	2023-10-05 01:19:11.353-06	2023-10-05 01:19:11.353-06
14	Anil Test 38485480@@(#*$&$)$_#_#"";	t	2023-10-05 01:19:38.286-06	2023-10-05 01:19:38.286-06
\.


--
-- Name: unit_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('unit_types_id_seq', 14, true);


--
-- Data for Name: user_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY user_categories (id, category_name, "createdAt", "updatedAt") FROM stdin;
1	Superadmin	2023-09-07 02:04:10.296-06	2023-09-07 02:04:10.296-06
2	Admin	2023-09-19 05:22:44.432-06	2023-09-19 05:22:44.432-06
3	Brand	2023-09-19 05:23:17.104-06	2023-09-19 05:23:17.104-06
4	Ginner	2023-09-19 05:23:28.786-06	2023-09-19 05:23:28.786-06
5	Spinner	2023-09-19 05:23:38.875-06	2023-09-19 05:23:38.875-06
6	Weaver	2023-09-19 05:23:50.871-06	2023-09-19 05:23:50.871-06
7	Knitter	2023-09-19 05:24:05.155-06	2023-09-19 05:24:05.155-06
8	Garment	2023-09-19 05:24:15.288-06	2023-09-19 05:24:15.288-06
9	Staff	2023-09-19 05:24:32.276-06	2023-09-19 05:24:32.276-06
10	Trader	2023-09-19 05:24:47.7-06	2023-09-19 05:24:47.7-06
11	Integrityadmin	2023-09-19 05:26:52.023-06	2023-09-19 05:26:52.023-06
12	Reeladmin	2023-09-19 05:27:51.569-06	2023-09-19 05:27:51.569-06
13	Technical_Team	2023-09-19 05:28:02.479-06	2023-09-19 05:28:02.479-06
14	Technical_Approver	2023-09-19 05:28:13.108-06	2023-09-19 05:28:13.108-06
15	Brand_Master	2023-09-19 05:28:21.142-06	2023-09-19 05:28:21.142-06
16	Fabric	2023-09-19 05:28:30.598-06	2023-09-19 05:28:30.598-06
17	Physical_Partner	2023-09-19 05:28:41.858-06	2023-09-19 05:28:41.858-06
\.


--
-- Name: user_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('user_categories_id_seq', 17, true);


--
-- Data for Name: user_privileges; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY user_privileges (id, "userRole_id", menu_id, create_privilege, edit_privilege, view_privilege, delete_privilege, status, "createdAt", "updatedAt") FROM stdin;
36	2	1	t	t	t	t	t	2023-09-28 08:59:33.899-06	2023-09-28 08:59:33.899-06
37	2	2	t	t	t	t	t	2023-09-28 08:59:33.899-06	2023-09-28 08:59:33.899-06
38	2	3	t	t	t	t	t	2023-09-28 08:59:33.899-06	2023-09-28 08:59:33.899-06
39	2	4	t	t	t	t	t	2023-09-28 08:59:33.899-06	2023-09-28 08:59:33.899-06
40	2	5	t	t	t	t	t	2023-09-28 08:59:33.899-06	2023-09-28 08:59:33.899-06
41	2	6	t	t	t	t	t	2023-09-28 08:59:33.899-06	2023-09-28 08:59:33.899-06
42	2	7	t	t	t	f	t	2023-09-28 08:59:33.899-06	2023-09-28 08:59:33.899-06
43	3	2	t	t	t	t	t	2023-09-28 09:00:00.674-06	2023-09-28 09:00:00.674-06
86	4	84	t	t	t	t	t	2023-09-28 22:00:27.47-06	2023-09-28 22:00:27.47-06
35	1	67	t	t	t	t	t	2023-09-28 08:56:46.682-06	2023-10-05 02:52:41.832-06
1195	24	43	f	f	t	f	t	2023-09-28 22:24:01.744-06	2023-09-28 23:30:51.142-06
19	1	36	t	t	t	f	t	2023-09-28 08:56:46.682-06	2023-10-05 02:52:41.788-06
11	1	17	t	f	t	t	t	2023-09-28 08:56:46.682-06	2023-10-05 02:52:41.762-06
1196	24	48	f	f	t	f	t	2023-09-28 22:24:01.747-06	2023-09-28 23:30:51.144-06
12	1	18	f	t	f	f	t	2023-09-28 08:56:46.682-06	2023-10-05 02:52:41.765-06
20	1	37	f	t	t	f	t	2023-09-28 08:56:46.682-06	2023-10-05 02:52:41.791-06
27	1	56	t	t	t	t	t	2023-09-28 08:56:46.682-06	2023-10-05 02:52:41.812-06
4	1	4	t	t	t	t	t	2023-09-28 08:56:46.682-06	2023-10-05 02:52:41.743-06
28	1	58	t	t	t	t	t	2023-09-28 08:56:46.682-06	2023-10-05 02:52:41.815-06
1	1	1	t	t	t	t	t	2023-09-28 08:56:46.682-06	2023-10-05 02:52:41.722-06
5	1	5	t	t	t	t	t	2023-09-28 08:56:46.682-06	2023-10-05 02:52:41.746-06
44	4	2	t	t	t	t	t	2023-09-28 22:00:27.47-06	2023-09-29 02:06:16.659-06
1197	24	49	f	f	t	f	t	2023-09-28 22:24:01.749-06	2023-09-28 23:30:51.147-06
1198	24	55	f	f	t	f	t	2023-09-28 22:24:01.766-06	2023-09-28 23:30:51.163-06
13	1	25	t	f	t	t	t	2023-09-28 08:56:46.682-06	2023-10-05 02:52:41.768-06
14	1	29	t	f	t	t	t	2023-09-28 08:56:46.682-06	2023-10-05 02:52:41.771-06
15	1	30	f	t	f	f	t	2023-09-28 08:56:46.682-06	2023-10-05 02:52:41.774-06
21	1	38	t	t	t	f	t	2023-09-28 08:56:46.682-06	2023-10-05 02:52:41.794-06
6	1	6	t	t	t	t	t	2023-09-28 08:56:46.682-06	2023-10-05 02:52:41.749-06
29	1	59	t	t	t	t	t	2023-09-28 08:56:46.682-06	2023-10-05 02:52:41.817-06
7	1	7	t	t	t	t	t	2023-09-28 08:56:46.682-06	2023-10-05 02:52:41.752-06
22	1	50	t	t	t	t	t	2023-09-28 08:56:46.682-06	2023-10-05 02:52:41.797-06
8	1	8	f	t	f	t	t	2023-09-28 08:56:46.682-06	2023-10-05 02:52:41.754-06
23	1	51	t	t	t	t	t	2023-09-28 08:56:46.682-06	2023-10-05 02:52:41.8-06
30	1	60	t	t	t	t	t	2023-09-28 08:56:46.682-06	2023-10-05 02:52:41.82-06
31	1	63	t	t	t	t	t	2023-09-28 08:56:46.682-06	2023-10-05 02:52:41.823-06
16	1	33	t	f	t	t	t	2023-09-28 08:56:46.682-06	2023-10-05 02:52:41.778-06
24	1	52	t	t	t	t	t	2023-09-28 08:56:46.682-06	2023-10-05 02:52:41.803-06
1187	24	10	f	f	t	f	t	2023-09-28 22:24:01.702-06	2023-09-28 23:30:51.099-06
1188	24	11	f	f	t	f	t	2023-09-28 22:24:01.706-06	2023-09-28 23:30:51.102-06
1189	24	12	f	f	t	f	t	2023-09-28 22:24:01.709-06	2023-09-28 23:30:51.105-06
1190	24	13	f	f	t	f	t	2023-09-28 22:24:01.711-06	2023-09-28 23:30:51.108-06
1191	24	39	f	f	t	f	t	2023-09-28 22:24:01.733-06	2023-09-28 23:30:51.131-06
1192	24	40	f	f	t	f	t	2023-09-28 22:24:01.736-06	2023-09-28 23:30:51.133-06
1193	24	41	f	f	t	f	t	2023-09-28 22:24:01.739-06	2023-09-28 23:30:51.136-06
1194	24	42	f	f	t	f	t	2023-09-28 22:24:01.742-06	2023-09-28 23:30:51.139-06
32	1	64	t	t	t	t	t	2023-09-28 08:56:46.682-06	2023-10-05 02:52:41.825-06
33	1	65	t	t	t	t	t	2023-09-28 08:56:46.682-06	2023-10-05 02:52:41.828-06
17	1	34	f	t	f	f	t	2023-09-28 08:56:46.682-06	2023-10-05 02:52:41.781-06
34	1	66	t	t	t	t	t	2023-09-28 08:56:46.682-06	2023-10-05 02:52:41.83-06
25	1	53	t	t	t	t	t	2023-09-28 08:56:46.682-06	2023-10-05 02:52:41.806-06
9	1	9	t	t	t	t	t	2023-09-28 08:56:46.682-06	2023-10-05 02:52:41.757-06
10	1	16	t	f	t	t	t	2023-09-28 08:56:46.682-06	2023-10-05 02:52:41.76-06
26	1	54	t	t	t	t	t	2023-09-28 08:56:46.682-06	2023-10-05 02:52:41.809-06
18	1	35	t	f	t	f	t	2023-09-28 08:56:46.682-06	2023-10-05 02:52:41.785-06
1242	30	2	t	t	t	t	t	2023-09-29 01:00:02.957-06	2023-09-29 01:05:19.579-06
1243	30	3	t	t	t	t	t	2023-09-29 01:00:02.96-06	2023-09-29 01:05:19.582-06
1244	30	4	t	t	t	t	t	2023-09-29 01:00:02.963-06	2023-09-29 01:05:19.585-06
1245	30	5	t	t	t	t	t	2023-09-29 01:00:02.966-06	2023-09-29 01:05:19.587-06
1246	30	6	t	t	t	t	t	2023-09-29 01:00:02.969-06	2023-09-29 01:05:19.59-06
1247	30	7	t	t	t	t	t	2023-09-29 01:00:02.971-06	2023-09-29 01:05:19.592-06
1249	30	9	t	t	t	t	t	2023-09-29 01:00:02.977-06	2023-09-29 01:05:19.597-06
1250	30	15	f	t	f	f	t	2023-09-29 01:00:02.98-06	2023-09-29 01:05:19.599-06
1251	30	16	t	f	t	t	t	2023-09-29 01:00:02.982-06	2023-09-29 01:05:19.602-06
1252	30	17	t	f	t	t	t	2023-09-29 01:00:02.985-06	2023-09-29 01:05:19.604-06
1253	30	18	f	t	f	f	t	2023-09-29 01:00:02.988-06	2023-09-29 01:05:19.606-06
1254	30	20	f	t	f	f	t	2023-09-29 01:00:02.991-06	2023-09-29 01:05:19.609-06
1255	30	21	t	f	t	t	t	2023-09-29 01:00:02.994-06	2023-09-29 01:05:19.614-06
1256	30	22	f	t	f	f	t	2023-09-29 01:00:02.997-06	2023-09-29 01:05:19.616-06
1257	30	23	f	t	f	f	t	2023-09-29 01:00:03-06	2023-09-29 01:05:19.619-06
1258	30	24	f	t	f	f	t	2023-09-29 01:00:03.003-06	2023-09-29 01:05:19.621-06
1259	30	25	t	f	t	t	t	2023-09-29 01:00:03.006-06	2023-09-29 01:05:19.624-06
3	1	3	t	t	t	t	t	2023-09-28 08:56:46.682-06	2023-10-05 02:52:41.74-06
45	4	3	t	t	t	t	t	2023-09-28 22:00:27.47-06	2023-09-29 02:06:16.671-06
46	4	4	t	t	t	t	t	2023-09-28 22:00:27.47-06	2023-09-29 02:06:16.674-06
47	4	7	t	t	t	t	t	2023-09-28 22:00:27.47-06	2023-09-29 02:06:16.676-06
48	4	10	f	f	t	f	t	2023-09-28 22:00:27.47-06	2023-09-29 02:06:16.678-06
50	4	12	f	f	t	f	t	2023-09-28 22:00:27.47-06	2023-09-29 02:06:16.683-06
51	4	13	f	f	t	f	t	2023-09-28 22:00:27.47-06	2023-09-29 02:06:16.685-06
52	4	33	t	f	t	t	t	2023-09-28 22:00:27.47-06	2023-09-29 02:06:16.688-06
53	4	34	f	t	t	f	t	2023-09-28 22:00:27.47-06	2023-09-29 02:06:16.69-06
54	4	35	t	t	t	f	t	2023-09-28 22:00:27.47-06	2023-09-29 02:06:16.693-06
55	4	36	t	t	t	t	t	2023-09-28 22:00:27.47-06	2023-09-29 02:06:16.695-06
56	4	37	t	t	t	t	t	2023-09-28 22:00:27.47-06	2023-09-29 02:06:16.697-06
57	4	38	t	t	t	t	t	2023-09-28 22:00:27.47-06	2023-09-29 02:06:16.7-06
58	4	39	f	f	t	f	t	2023-09-28 22:00:27.47-06	2023-09-29 02:06:16.702-06
59	4	40	f	f	t	f	t	2023-09-28 22:00:27.47-06	2023-09-29 02:06:16.704-06
60	4	41	f	f	t	f	t	2023-09-28 22:00:27.47-06	2023-09-29 02:06:16.707-06
61	4	42	f	f	t	f	t	2023-09-28 22:00:27.47-06	2023-09-29 02:06:16.71-06
62	4	43	f	f	t	f	t	2023-09-28 22:00:27.47-06	2023-09-29 02:06:16.712-06
63	4	48	f	f	t	f	t	2023-09-28 22:00:27.47-06	2023-09-29 02:06:16.715-06
64	4	49	f	f	t	f	t	2023-09-28 22:00:27.47-06	2023-09-29 02:06:16.717-06
65	4	50	t	t	t	t	t	2023-09-28 22:00:27.47-06	2023-09-29 02:06:16.72-06
67	4	52	t	t	t	t	t	2023-09-28 22:00:27.47-06	2023-09-29 02:06:16.725-06
68	4	53	t	t	t	t	t	2023-09-28 22:00:27.47-06	2023-09-29 02:06:16.729-06
69	4	54	t	t	t	t	t	2023-09-28 22:00:27.47-06	2023-09-29 02:06:16.731-06
70	4	55	f	f	t	f	t	2023-09-28 22:00:27.47-06	2023-09-29 02:06:16.734-06
71	4	56	t	t	t	t	t	2023-09-28 22:00:27.47-06	2023-09-29 02:06:16.736-06
72	4	58	t	t	t	t	t	2023-09-28 22:00:27.47-06	2023-09-29 02:06:16.738-06
73	4	59	t	t	t	t	t	2023-09-28 22:00:27.47-06	2023-09-29 02:06:16.741-06
74	4	60	t	t	t	t	t	2023-09-28 22:00:27.47-06	2023-09-29 02:06:16.743-06
75	4	61	t	t	t	t	t	2023-09-28 22:00:27.47-06	2023-09-29 02:06:16.746-06
76	4	62	t	t	t	t	t	2023-09-28 22:00:27.47-06	2023-09-29 02:06:16.749-06
77	4	63	t	t	t	t	t	2023-09-28 22:00:27.47-06	2023-09-29 02:06:16.752-06
78	4	64	t	t	t	t	t	2023-09-28 22:00:27.47-06	2023-09-29 02:06:16.754-06
79	4	65	t	t	t	t	t	2023-09-28 22:00:27.47-06	2023-09-29 02:06:16.757-06
80	4	67	t	t	t	t	t	2023-09-28 22:00:27.47-06	2023-09-29 02:06:16.76-06
81	4	69	t	t	t	t	t	2023-09-28 22:00:27.47-06	2023-09-29 02:06:16.762-06
82	4	80	t	t	t	t	t	2023-09-28 22:00:27.47-06	2023-09-29 02:06:16.764-06
84	4	82	t	t	t	t	t	2023-09-28 22:00:27.47-06	2023-09-29 02:06:16.77-06
85	4	83	t	t	t	t	t	2023-09-28 22:00:27.47-06	2023-09-29 02:06:16.772-06
2	1	2	t	t	t	t	t	2023-09-28 08:56:46.682-06	2023-10-05 02:52:41.736-06
1260	30	26	f	t	f	f	t	2023-09-29 01:00:03.009-06	2023-09-29 01:05:19.626-06
1261	30	27	f	t	f	f	t	2023-09-29 01:00:03.011-06	2023-09-29 01:05:19.628-06
1262	30	28	f	t	f	f	t	2023-09-29 01:00:03.014-06	2023-09-29 01:05:19.63-06
1263	30	29	t	f	t	t	t	2023-09-29 01:00:03.017-06	2023-09-29 01:05:19.632-06
1264	30	30	f	t	f	f	t	2023-09-29 01:00:03.019-06	2023-09-29 01:05:19.635-06
1265	30	31	f	t	f	f	t	2023-09-29 01:00:03.022-06	2023-09-29 01:05:19.637-06
1266	30	32	f	t	f	f	t	2023-09-29 01:00:03.025-06	2023-09-29 01:05:19.64-06
1267	30	33	t	f	t	t	t	2023-09-29 01:00:03.027-06	2023-09-29 01:05:19.643-06
1268	30	34	f	t	f	f	t	2023-09-29 01:00:03.03-06	2023-09-29 01:05:19.645-06
1269	30	35	t	t	f	f	t	2023-09-29 01:00:03.033-06	2023-09-29 01:05:19.647-06
1270	30	36	t	t	t	t	t	2023-09-29 01:00:03.036-06	2023-09-29 01:05:19.649-06
1271	30	37	t	t	t	t	t	2023-09-29 01:00:03.039-06	2023-09-29 01:05:19.651-06
1272	30	38	t	t	t	t	t	2023-09-29 01:00:03.042-06	2023-09-29 01:05:19.653-06
1273	30	50	t	t	t	t	t	2023-09-29 01:00:03.044-06	2023-09-29 01:05:19.656-06
1274	30	51	t	t	t	t	t	2023-09-29 01:00:03.047-06	2023-09-29 01:05:19.658-06
1275	30	52	t	t	t	t	t	2023-09-29 01:00:03.049-06	2023-09-29 01:05:19.66-06
1276	30	53	t	t	t	t	t	2023-09-29 01:00:03.052-06	2023-09-29 01:05:19.663-06
1277	30	54	t	t	t	t	t	2023-09-29 01:00:03.055-06	2023-09-29 01:05:19.665-06
1278	30	56	t	t	t	t	t	2023-09-29 01:00:03.057-06	2023-09-29 01:05:19.667-06
1279	30	58	t	t	t	t	t	2023-09-29 01:00:03.059-06	2023-09-29 01:05:19.669-06
1280	30	59	t	t	t	t	t	2023-09-29 01:00:03.062-06	2023-09-29 01:05:19.671-06
1281	30	60	t	t	t	t	t	2023-09-29 01:00:03.064-06	2023-09-29 01:05:19.673-06
1282	30	61	t	t	t	t	t	2023-09-29 01:00:03.066-06	2023-09-29 01:05:19.675-06
1283	30	62	t	t	t	t	t	2023-09-29 01:00:03.068-06	2023-09-29 01:05:19.677-06
1284	30	63	t	t	t	t	t	2023-09-29 01:00:03.071-06	2023-09-29 01:05:19.68-06
1285	30	64	t	t	t	t	t	2023-09-29 01:00:03.073-06	2023-09-29 01:05:19.682-06
1286	30	65	t	t	t	t	t	2023-09-29 01:00:03.075-06	2023-09-29 01:05:19.684-06
1287	30	66	t	t	t	t	t	2023-09-29 01:00:03.077-06	2023-09-29 01:05:19.687-06
1288	30	67	t	t	t	t	t	2023-09-29 01:00:03.08-06	2023-09-29 01:05:19.689-06
1289	30	68	t	t	t	t	t	2023-09-29 01:00:03.083-06	2023-09-29 01:05:19.692-06
1290	30	69	t	t	t	t	t	2023-09-29 01:00:03.086-06	2023-09-29 01:05:19.694-06
1291	30	70	t	t	t	t	t	2023-09-29 01:00:03.088-06	2023-09-29 01:05:19.696-06
1292	30	71	t	t	t	t	t	2023-09-29 01:00:03.09-06	2023-09-29 01:05:19.698-06
1293	30	72	t	t	t	t	t	2023-09-29 01:00:03.092-06	2023-09-29 01:05:19.7-06
1294	30	73	t	t	t	t	t	2023-09-29 01:00:03.095-06	2023-09-29 01:05:19.702-06
1295	30	74	t	t	t	t	t	2023-09-29 01:00:03.098-06	2023-09-29 01:05:19.704-06
1296	30	75	t	t	t	t	t	2023-09-29 01:00:03.1-06	2023-09-29 01:05:19.707-06
1297	30	76	t	t	t	t	t	2023-09-29 01:00:03.103-06	2023-09-29 01:05:19.71-06
1298	30	77	t	t	t	t	t	2023-09-29 01:00:03.105-06	2023-09-29 01:05:19.712-06
1299	30	78	t	t	t	t	t	2023-09-29 01:00:03.107-06	2023-09-29 01:05:19.714-06
1300	30	79	t	t	t	t	t	2023-09-29 01:00:03.11-06	2023-09-29 01:05:19.717-06
1301	30	80	t	t	t	t	t	2023-09-29 01:00:03.112-06	2023-09-29 01:05:19.72-06
1302	30	81	t	t	t	t	t	2023-09-29 01:00:03.114-06	2023-09-29 01:05:19.722-06
1303	30	82	t	t	t	t	t	2023-09-29 01:00:03.117-06	2023-09-29 01:05:19.725-06
1304	30	83	t	t	t	t	t	2023-09-29 01:00:03.12-06	2023-09-29 01:05:19.728-06
1305	30	84	t	t	t	t	t	2023-09-29 01:00:03.122-06	2023-09-29 01:05:19.73-06
1306	30	85	t	t	t	t	t	2023-09-29 01:00:03.125-06	2023-09-29 01:05:19.732-06
1307	30	86	t	t	t	t	t	2023-09-29 01:00:03.128-06	2023-09-29 01:05:19.734-06
1308	30	87	t	t	t	t	t	2023-09-29 01:00:03.131-06	2023-09-29 01:05:19.737-06
1309	30	88	t	t	t	t	t	2023-09-29 01:00:03.133-06	2023-09-29 01:05:19.739-06
1310	30	89	t	t	t	t	t	2023-09-29 01:00:03.136-06	2023-09-29 01:05:19.741-06
1241	30	1	t	t	t	t	t	2023-09-29 01:00:02.941-06	2023-09-29 01:05:19.566-06
1248	30	8	f	t	t	t	t	2023-09-29 01:00:02.974-06	2023-09-29 01:05:19.595-06
1311	1	82	t	f	t	f	t	2023-10-05 02:52:16.566-06	2023-10-05 02:52:41.837-06
49	4	11	f	f	t	f	t	2023-09-28 22:00:27.47-06	2023-09-29 02:06:16.681-06
66	4	51	t	t	t	t	t	2023-09-28 22:00:27.47-06	2023-09-29 02:06:16.723-06
83	4	81	t	t	t	t	t	2023-09-28 22:00:27.47-06	2023-09-29 02:06:16.767-06
1142	24	1	t	t	t	t	t	2023-09-28 22:17:16.343-06	2023-09-28 23:30:51.058-06
1143	24	2	t	t	t	t	t	2023-09-28 22:17:16.343-06	2023-09-28 23:30:51.076-06
1144	24	3	t	t	t	t	t	2023-09-28 22:17:16.343-06	2023-09-28 23:30:51.079-06
1145	24	4	t	t	t	t	t	2023-09-28 22:17:16.343-06	2023-09-28 23:30:51.083-06
1146	24	5	t	t	t	t	t	2023-09-28 22:17:16.343-06	2023-09-28 23:30:51.086-06
1147	24	6	t	t	t	t	t	2023-09-28 22:17:16.343-06	2023-09-28 23:30:51.088-06
1148	24	7	t	t	t	t	t	2023-09-28 22:17:16.343-06	2023-09-28 23:30:51.091-06
1149	24	8	f	t	t	t	t	2023-09-28 22:17:16.343-06	2023-09-28 23:30:51.093-06
1150	24	9	t	t	t	t	t	2023-09-28 22:17:16.343-06	2023-09-28 23:30:51.096-06
1151	24	30	f	t	t	f	t	2023-09-28 22:17:16.343-06	2023-09-28 23:30:51.111-06
1152	24	33	t	f	t	t	t	2023-09-28 22:17:16.343-06	2023-09-28 23:30:51.114-06
1153	24	34	f	t	t	f	t	2023-09-28 22:17:16.343-06	2023-09-28 23:30:51.116-06
1154	24	35	t	t	t	f	t	2023-09-28 22:17:16.343-06	2023-09-28 23:30:51.12-06
1155	24	36	t	t	t	t	t	2023-09-28 22:17:16.343-06	2023-09-28 23:30:51.123-06
1156	24	37	t	t	t	t	t	2023-09-28 22:17:16.343-06	2023-09-28 23:30:51.126-06
1157	24	38	t	t	t	t	t	2023-09-28 22:17:16.343-06	2023-09-28 23:30:51.128-06
1158	24	50	t	t	t	t	t	2023-09-28 22:17:16.343-06	2023-09-28 23:30:51.149-06
1159	24	51	t	t	t	t	t	2023-09-28 22:17:16.343-06	2023-09-28 23:30:51.152-06
1160	24	52	t	t	t	t	t	2023-09-28 22:17:16.343-06	2023-09-28 23:30:51.155-06
1161	24	53	t	t	t	t	t	2023-09-28 22:17:16.343-06	2023-09-28 23:30:51.158-06
1162	24	54	t	t	t	t	t	2023-09-28 22:17:16.343-06	2023-09-28 23:30:51.16-06
1163	24	56	t	t	t	t	t	2023-09-28 22:17:16.343-06	2023-09-28 23:30:51.166-06
1164	24	58	t	t	t	t	t	2023-09-28 22:17:16.343-06	2023-09-28 23:30:51.169-06
1165	24	59	t	t	t	t	t	2023-09-28 22:17:16.343-06	2023-09-28 23:30:51.171-06
1166	24	60	t	t	t	t	t	2023-09-28 22:17:16.343-06	2023-09-28 23:30:51.174-06
1167	24	61	t	t	t	t	t	2023-09-28 22:17:16.343-06	2023-09-28 23:30:51.177-06
1168	24	62	t	t	t	t	t	2023-09-28 22:17:16.343-06	2023-09-28 23:30:51.179-06
1169	24	63	t	t	t	t	t	2023-09-28 22:17:16.343-06	2023-09-28 23:30:51.182-06
1170	24	64	t	t	t	t	t	2023-09-28 22:17:16.343-06	2023-09-28 23:30:51.185-06
1171	24	65	t	t	t	t	t	2023-09-28 22:17:16.343-06	2023-09-28 23:30:51.187-06
1172	24	67	t	t	t	t	t	2023-09-28 22:17:16.343-06	2023-09-28 23:30:51.19-06
1173	24	69	t	t	t	t	t	2023-09-28 22:17:16.343-06	2023-09-28 23:30:51.193-06
1174	24	72	t	t	t	t	t	2023-09-28 22:17:16.343-06	2023-09-28 23:30:51.196-06
1175	24	73	t	t	t	t	t	2023-09-28 22:17:16.343-06	2023-09-28 23:30:51.198-06
1176	24	74	t	t	t	t	t	2023-09-28 22:17:16.343-06	2023-09-28 23:30:51.201-06
1177	24	75	t	t	t	t	t	2023-09-28 22:17:16.343-06	2023-09-28 23:30:51.203-06
1178	24	76	t	t	t	t	t	2023-09-28 22:17:16.343-06	2023-09-28 23:30:51.206-06
1179	24	77	t	t	t	t	t	2023-09-28 22:17:16.343-06	2023-09-28 23:30:51.209-06
1180	24	78	t	t	t	t	t	2023-09-28 22:17:16.343-06	2023-09-28 23:30:51.212-06
1181	24	79	t	t	t	t	t	2023-09-28 22:17:16.343-06	2023-09-28 23:30:51.214-06
1182	24	80	t	t	t	t	t	2023-09-28 22:17:16.343-06	2023-09-28 23:30:51.217-06
1183	24	81	t	t	t	t	t	2023-09-28 22:17:16.343-06	2023-09-28 23:30:51.22-06
1184	24	82	t	t	t	t	t	2023-09-28 22:17:16.343-06	2023-09-28 23:30:51.222-06
1185	24	83	t	t	t	t	t	2023-09-28 22:17:16.343-06	2023-09-28 23:30:51.224-06
1186	24	84	t	t	t	t	t	2023-09-28 22:17:16.343-06	2023-09-28 23:30:51.227-06
\.


--
-- Name: user_privileges_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('user_privileges_id_seq', 1311, true);


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY user_roles (id, "userCategory_id", user_role, "createdAt", "updatedAt", brand_id) FROM stdin;
2	2	Admin	2023-09-28 08:59:33.894-06	2023-09-28 08:59:33.894-06	\N
3	3	Brand	2023-09-28 09:00:00.657-06	2023-09-28 09:00:00.657-06	\N
30	1	Superadmin1	2023-09-28 23:33:21.668-06	2023-09-29 01:05:19.742-06	\N
4	3		2023-09-28 22:00:27.455-06	2023-09-29 02:06:16.774-06	6
1	1	Superadmin	2023-09-28 08:56:46.664-06	2023-10-05 02:52:41.839-06	\N
24	2	Test123	2023-09-28 22:17:16.34-06	2023-09-28 23:30:51.229-06	\N
\.


--
-- Name: user_roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('user_roles_id_seq', 32, true);


--
-- Data for Name: user_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY user_tokens (id, user_id, token, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: user_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('user_tokens_id_seq', 1, false);


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY users (id, username, email, password, "createdAt", "updatedAt", firstname, lastname, mobile, "position", countries_web, access_level, country_id, state_id, district_id, block_id, village_id, role, brand_mapped, "ticketApproveAccess", "ticketCountryAccess", "ticketAccessOnly", "isManagementUser", status, "isAgreementAgreed", farm_group) FROM stdin;
1	admin	superadmin@gmail.com	$2a$10$PDG/2cftdNMbqHLSkQ5m1.N.BRo.BKYINneeKdj4MWt3pAu.HDdIy	2023-09-07 03:32:17.453-06	2023-09-07 03:53:48.928-06	Superadmin	admin	123456789		{1}	{Web}	\N	\N	{}	{}	{}	1	{}	\N	\N	\N	f	t	t	\N
3	testuser	testuser@gmail.cm	$2a$10$.dz3yP67cVadwRp6WW796O3kWCIFXCU2LT4xirP17optKZ.oNSGlq	2023-09-19 01:20:32.815-06	2023-09-19 01:21:45.337-06	testbranduser1		9876543210	developer	\N	\N	\N	\N	\N	\N	\N	1	\N	t	{9}	t	f	t	f	\N
2	testrsre	test@test.com	$2a$10$3eFNEfCJUbDlUi2RHwMrweOqN9b8BZxgjTwV5iE/zMZe3Gu2bFtoe	2023-09-19 01:20:04.496-06	2023-09-20 02:38:17.852-06	testuser		123456789		\N	\N	\N	\N	\N	\N	\N	1	\N	f	{12}	f	f	t	f	\N
4	vaihabrand	vaihabrand@gmail.com	$2a$10$wAUOaEiJMttR7OrEZstDCulkqsL5vtCT6KcCN4CvTDmHIOJVf9R4K	2023-09-20 02:47:38.723-06	2023-09-20 02:47:38.723-06	Vaiha		9659894353	Manager	\N	\N	\N	\N	\N	\N	\N	3	\N	t	{12,2}	f	f	t	f	\N
57	SFJKSDJ)(#*)(%*%*onbkjj 	anil.dwivedi@cottonconnect.org	$2a$10$NM7M3d0N2dvpg.kkRW25XurJNpukVstbOly62E78bBpxGqp202eEq	2023-10-05 01:47:56.811-06	2023-10-05 02:07:05.468-06	598598IU)(#)($)($)()(%$		3439042-2(@)@*#$_$_))(%	ESIOR4W09#$*(%(^*	\N	\N	\N	\N	\N	\N	\N	3	\N	t	{27}	t	f	t	f	\N
60	prim	primark@gmail.com	$2a$10$jkEm1H6bIOQjKbgZLp0IUehBanaWANDvnMJWNkTAohPXLXZV76MpK	2023-10-11 22:21:32.006-06	2023-10-11 22:21:32.006-06	Primark		9659894353	Manager	\N	\N	\N	\N	\N	\N	\N	3	\N	t	{12}	f	f	t	f	\N
70	newtestnew	test99@gmail.com	$2a$10$4M3aMOsLSJlvyVC8U1xRh.U4P2Jb0h7eAJlRJTGFwHz.HEkhxxQK2	2023-10-12 00:11:27.687-06	2023-10-12 00:11:27.687-06	new 	test100	1234567890		{15}	{Web}	\N	\N	{}	{}	{}	24	{}	\N	\N	\N	t	t	f	{4}
6	kavithabrand1	kavithamani.vaiha1@gmail.com	$2a$10$LwXfH1vcFBV6SMRvAzvV7.mXcuFnZbnaH/6PqtIJzsy2hd2L2veyi	2023-09-25 06:02:45.361-06	2023-09-25 06:06:33.416-06	KavithaBrand1		9659894343	Manager	\N	\N	\N	\N	\N	\N	\N	3	\N	t	{27}	f	f	t	f	\N
5	kavithabrand	kavithamani.vaiha@gmail.com	$2a$10$f6jkjVHIBRuWkUffKq1AMevHAFqZ3DG816C9DTiKU7hGPEBppBLqC	2023-09-25 06:02:45.242-06	2023-09-25 06:36:27.278-06	KavithaBrand		9659894353	Manager	\N	\N	\N	\N	\N	\N	\N	3	\N	t	{27}	f	f	t	f	\N
80	testnewbrand	testnewdevdev@gmail.com	$2a$10$UBQEtTVDHAg7vPp1q65qI.q.IhJyH16A9cd8cJEE2oPZk.cCLCVHG	2023-10-12 00:26:07.728-06	2023-10-12 00:26:07.728-06	testbrandName		0987143453		\N	\N	\N	\N	\N	\N	\N	3	\N	t	{12}	t	f	t	f	\N
8	Akshaya farmer	ak@gmail.com	$2a$10$vAX/HBW1EZj3DzfzKmVbmu2EIrfV49cGxRiaOcuqoLLiMeBM.Lt.2	2023-09-26 04:21:20.939-06	2023-09-26 04:21:20.939-06	Akshaya		6789067890	Testing	\N	\N	\N	\N	\N	\N	\N	3	\N	t	{12}	t	f	t	f	\N
7	kavitha	kavitha.admin@gmail.c	$2a$10$9gujXhkhfyJa7tQpJPEaQu8OlMEx5T7S87o9eIe/w21bGHLOlNZrK	2023-09-25 06:42:56.775-06	2023-09-27 22:25:09.56-06	Kavitha	Admin	9659894353		{12}	{Mobile,Web}	12	26	{14}	{4}	{15}	2	{}	\N	\N	\N	t	t	t	{3}
10	Akshaya	akshaya.vaiha@gmail.com	$2a$10$A7gomo0ag7WOGdAuF9Y.kerblDb0nBNLjmdphn3D6xawZYwqnnMMS	2023-09-27 23:25:02.991-06	2023-09-27 23:28:23.996-06	Akshaya	Vaiha	9876543210		{12}	{Mobile,Web}	12	26	{14}	{7}	{12}	30	{}	\N	\N	\N	t	t	t	{4}
9	Akshaya 	a@gmail.com	$2a$10$IYI/F5sttFTS/L5zbljkLOOjNtBFEulBl3yF73SM6N0G742ELMpeO	2023-09-26 04:47:54.039-06	2023-09-29 02:06:16.777-06	Akshaya		6789067890	Testing	\N	\N	\N	\N	\N	\N	\N	4	\N	t	{13}	t	f	t	f	\N
58	JDFJ($*(%%)	anil.dwived1i@cottonconnect.org	$2a$10$vkuNKyonlMwd/TX3kL2z8u67eWirWsZ783q5u.7dHDn4omrUzAIBy	2023-10-05 02:07:05.596-06	2023-10-05 02:07:05.596-06	598598IU)(#)($)($)()(%$		3439042-2(@)@*#$_$_))(%	ESIOR4W09#$*(%(^*	\N	\N	\N	\N	\N	\N	\N	3	\N	f	{27}	f	f	t	f	\N
61	newtestUser	test900@gmail.com	$2a$10$Ky54N78r9SsSs1aI/UKpVO/WyLrU6blzVDmFZMUq5EnHbXh6udzg.	2023-10-12 00:07:10.509-06	2023-10-12 00:07:10.509-06	new	test	1234567890		{12}	{Web}	\N	\N	{}	{}	{}	1	{}	\N	\N	\N	t	t	f	{4}
71	testbrandusernew	test202256dev@gmail.com	$2a$10$144.uNJPP8PwgUhW6RTpeObMR/qYRIKPzr3L2IMOqMVHp/F34MyVi	2023-10-12 00:22:29.619-06	2023-10-12 00:22:29.619-06	testuser5555		6543212345	Manager	\N	\N	\N	\N	\N	\N	\N	3	\N	t	{27}	t	f	t	f	\N
59	rututt	fjg@gmaill.com	$2a$10$kqUw/JTOud2kPGyMahPKpO1HNhtOyY.81u10WWe3K1zq2MiVZqUeK	2023-10-05 03:01:03.88-06	2023-10-05 03:01:03.88-06	dsjkffdj()#()$)%%)(%_)%	sdjsdfj($()%()%()%)(%)(	89344589UIEEUIRUIRUIR()#(*#$*($		{13}	{Mobile,Web}	27	31	{18}	{10}	{26,24}	2	{}	\N	\N	\N	t	t	f	{4}
45	testbranduser	test@tracebale.com	$2a$10$jK0.EmsfXRSnvZpWNdBk7e7zU.WbJcrO0RwOk99Rij0F/joFKAkMG	2023-09-28 09:04:00.807-06	2023-09-28 09:04:00.807-06	testbranduser		123456789	CEO	\N	\N	\N	\N	\N	\N	\N	3	\N	t	{12}	t	f	t	f	\N
46	test	test1@gmail.com	$2a$10$bHHviuzfWJQMjB1NVu9onO1hQTArJTVeyO7fn7KyXnKJz2yMOpXGC	2023-09-28 22:27:17.255-06	2023-09-28 22:29:58.598-06	test12#$	Test#^^2	6789067890		{12}	{Mobile,Web}	12	26	{14}	{14}	{18}	2	{}	\N	\N	\N	t	t	t	{1,4,3}
\.


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('users_id_seq', 84, true);


--
-- Data for Name: validation_farmers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY validation_farmers (id, date, season_id, brand_id, "farmGroup_id", ics_id, farmer_id, farmer_image, valid_identity, identity_others, identity_id, identity_image, cotton_purchaser, market_rate, payment_mode, payment_proof, proof_name, proof_document, is_ginner_supported, ginner_supported_details, ginner_supported_others, support_mode, verifier_inference, partially_verified, "createdAt", "updatedAt") FROM stdin;
4	2023-08-18 23:44:45.557-06	1	2	5	8	7	K8kPn52sblpng.png	Aadhaar Card	\N	43434434343434	f43bAvUjLtpng.png	market	234	cash	t	photo	f43bAvUjLtpng.png	t	{others,others}	{ads,adahs}	{"partially paid",paid}	partiallyverified	partial vaerified text	2023-10-05 04:24:21.652-06	2023-10-05 04:24:21.652-06
5	2023-08-18 23:44:45.557-06	1	2	5	8	7	K8kPn52sblpng.png	Aadhaar Card	\N	43434434343434	f43bAvUjLtpng.png	market	234	cash	t	photo	f43bAvUjLtpng.png	t	{others,others}	{ads,adahs}	{"partially paid",paid}	partiallyverified	partial vaerified text	2023-10-08 22:46:35.724-06	2023-10-08 22:46:35.724-06
\.


--
-- Name: validation_farmers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('validation_farmers_id_seq', 5, true);


--
-- Data for Name: validation_projects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY validation_projects (id, date, season_id, brand_id, "farmGroup_id", no_of_farmers, cotton_purchased, qty_of_lint_sold, premium_recieved, premium_transfered, premium_transfered_name, premium_transfered_cost, avg_purchase_price, avg_market_price, price_variance, calculated_avg_variance, premium_transfer_claim, claim_variance, "createdAt", "updatedAt") FROM stdin;
1	2023-08-18 23:44:45.557-06	11	2	5	1	3175	\N	123	{Cash,Equipments}	{123}	{123,34}	32	4	700	23	2	9	2023-10-05 04:10:03.903-06	2023-10-05 04:10:03.903-06
\.


--
-- Name: validation_projects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('validation_projects_id_seq', 2, true);


--
-- Data for Name: videos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY videos (id, country, brand, processor, title, description, video, status, "createdAt", "updatedAt") FROM stdin;
1	{12}	{1}	Ginner	Test title	test description	https://api.newtracebale.com/file/1695199233468-481601049.png	t	2023-09-20 02:40:48.934-06	2023-09-20 02:42:19.505-06
4	{12}	{4}	Knitter	Knitter	Knitting video	https://api.newtracebale.com/file/1695722325765-file_example_MP4_1920_18MG.mp4	t	2023-09-26 03:59:21.788-06	2023-09-26 04:10:11.613-06
\.


--
-- Name: videos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('videos_id_seq', 5, true);


--
-- Data for Name: village_impacts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY village_impacts (id, village, reduced_chemical_pesticide, reduced_chemical_fertilizer, reduced_water_use, increased_yield, reduced_input_costs, increased_profit, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: village_impacts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('village_impacts_id_seq', 1, false);


--
-- Data for Name: villages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY villages (id, block_id, village_name, village_status, village_latitude, village_longitude, "createdAt", "updatedAt") FROM stdin;
8	5	test1	t			2023-09-13 01:00:18.785-06	2023-09-13 01:00:18.785-06
12	7	test village	t	12.5657	35.54654	2023-09-19 01:32:10.626-06	2023-09-19 01:32:10.626-06
13	5	town	t			2023-09-22 04:09:46.246-06	2023-09-22 04:09:46.246-06
15	10	KavithaVillage	t	12.77	22test	2023-09-25 04:27:42.339-06	2023-09-25 04:27:42.339-06
18	14	Wazirpur	t			2023-09-25 23:51:25.571-06	2023-09-25 23:51:25.571-06
19	10	Test1	t	0	0	2023-09-27 23:14:27.27-06	2023-09-27 23:14:27.27-06
20	10	Test2	t	0	0	2023-09-27 23:14:27.284-06	2023-09-27 23:14:27.284-06
22	10	Test5	t	0	0	2023-09-27 23:14:27.291-06	2023-09-27 23:14:27.291-06
23	10	Test6	t	0	0	2023-09-27 23:14:27.294-06	2023-09-27 23:14:27.294-06
24	10	Test7	t	0	0	2023-09-27 23:14:27.297-06	2023-09-27 23:14:27.297-06
25	10	Test9	t	0	0	2023-09-27 23:14:27.301-06	2023-09-27 23:14:27.301-06
26	10	Test10	t	0	0	2023-09-27 23:14:27.303-06	2023-09-27 23:14:27.303-06
27	7	Nurpur	t	0	0	2023-09-28 04:33:11.758-06	2023-09-28 04:33:11.758-06
28	7	Fatehpur	t	0	0	2023-09-28 04:33:11.774-06	2023-09-28 04:33:11.774-06
29	7	Mirzapur	t	0	0	2023-09-28 04:33:11.777-06	2023-09-28 04:33:11.777-06
30	14	Nurpur	t	0	0	2023-09-28 22:56:00.232-06	2023-09-28 22:56:00.232-06
31	14	Gopalpur	t	0	0	2023-09-28 23:20:28.748-06	2023-09-28 23:20:28.748-06
32	14	Harpur	t	0	0	2023-09-28 23:20:28.766-06	2023-09-28 23:20:28.766-06
33	14	Nasirpur	t	0	0	2023-09-28 23:20:28.769-06	2023-09-28 23:20:28.769-06
21	10	Test	t	0	0	2023-09-27 23:14:27.288-06	2023-10-04 07:22:25.191-06
34	10	Anl Village	t	0	0	2023-10-05 03:40:54.824-06	2023-10-05 03:40:54.824-06
35	10	Anil Village2	t	0	0	2023-10-05 03:40:54.837-06	2023-10-05 03:40:54.837-06
36	10	new test village	t			2023-10-09 01:00:40.273-06	2023-10-09 01:00:40.273-06
\.


--
-- Name: villages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('villages_id_seq', 36, true);


--
-- Data for Name: weaver_sales; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY weaver_sales (id, weaver_id, season_id, date, program_id, order_ref, buyer_type, buyer_id, processor_name, processor_address, transaction_via_trader, transaction_agent, warn_yarn_qty, weft_choosen, weft_yarn_qty, total_yarn_qty, fabric_type, fabric_contruction, fabric_length, fabric_gsm, fabric_weight, batch_lot_no, job_details_garment, bale_ids, invoice_no, bill_of_ladding, transporter_name, vehicle_no, tc_file, contract_file, invoice_file, delivery_notes, qty_stock, status, dyeing_required, dyeing_id, "createdAt", "updatedAt", weft_cottonmix_type, weft_cottonmix_qty, accept_date, no_of_bales, qr) FROM stdin;
\.


--
-- Name: weaver_sales_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('weaver_sales_id_seq', 1, false);


--
-- Data for Name: weavers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY weavers (id, name, address, country_id, state_id, program_id, latitude, longitude, website, contact_person, no_of_machines, fabric_type, prod_cap, loss_from, loss_to, unit_cert, company_info, org_logo, org_photo, certs, brand, mobile, landline, email, loom_type, "weaverUser_id", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: weavers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('weavers_id_seq', 1, false);


--
-- Data for Name: yarn_counts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY yarn_counts (id, "yarnCount_name", "yarnCount_status", "createdAt", "updatedAt") FROM stdin;
1	abc	t	2023-09-12 08:45:00.94-06	2023-09-12 08:45:00.94-06
3	mno	t	2023-09-12 08:45:57.641-06	2023-09-12 08:45:57.641-06
4	ghi	t	2023-09-12 08:45:57.641-06	2023-09-12 08:45:57.641-06
5	Ne 20s	t	2023-09-25 05:52:43.338-06	2023-09-25 05:52:43.338-06
7	fine yarn	t	2023-09-26 03:25:53.895-06	2023-09-26 03:25:53.895-06
9	Ne 10s	t	2023-10-04 11:09:12.996-06	2023-10-04 11:09:12.996-06
8	Ne 24S@###%%^^^&^	t	2023-10-04 11:09:12.976-06	2023-10-04 11:09:50.783-06
10	Anil test (#($(%(%	t	2023-10-05 01:36:33.646-06	2023-10-05 01:36:33.646-06
\.


--
-- Name: yarn_counts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('yarn_counts_id_seq', 10, true);


--
-- Data for Name: yarn_selections; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY yarn_selections (id, yarn_id, sales_id, type, qty_used, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: yarn_selections_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('yarn_selections_id_seq', 1, false);


--
-- Name: SequelizeMeta_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY "SequelizeMeta"
    ADD CONSTRAINT "SequelizeMeta_pkey" PRIMARY KEY (name);


--
-- Name: bale_selections_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY bale_selections
    ADD CONSTRAINT bale_selections_pkey PRIMARY KEY (id);


--
-- Name: blocks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY blocks
    ADD CONSTRAINT blocks_pkey PRIMARY KEY (id);


--
-- Name: brands_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY brands
    ADD CONSTRAINT brands_pkey PRIMARY KEY (id);


--
-- Name: cooperatives_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY cooperatives
    ADD CONSTRAINT cooperatives_pkey PRIMARY KEY (id);


--
-- Name: cotton_mixes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY cotton_mixes
    ADD CONSTRAINT cotton_mixes_pkey PRIMARY KEY (id);


--
-- Name: cotton_selections_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY cotton_selections
    ADD CONSTRAINT cotton_selections_pkey PRIMARY KEY (id);


--
-- Name: countries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY countries
    ADD CONSTRAINT countries_pkey PRIMARY KEY (id);


--
-- Name: crop_grades_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY crop_grades
    ADD CONSTRAINT crop_grades_pkey PRIMARY KEY (id);


--
-- Name: crop_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY crop_types
    ADD CONSTRAINT crop_types_pkey PRIMARY KEY (id);


--
-- Name: crop_varieties_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY crop_varieties
    ADD CONSTRAINT crop_varieties_pkey PRIMARY KEY (id);


--
-- Name: crops_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY crops
    ADD CONSTRAINT crops_pkey PRIMARY KEY (id);


--
-- Name: departments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: devices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY devices
    ADD CONSTRAINT devices_pkey PRIMARY KEY (id);


--
-- Name: districts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY districts
    ADD CONSTRAINT districts_pkey PRIMARY KEY (id);


--
-- Name: dyeings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY dyeings
    ADD CONSTRAINT dyeings_pkey PRIMARY KEY (id);


--
-- Name: email_managements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY email_managements
    ADD CONSTRAINT email_managements_pkey PRIMARY KEY (id);


--
-- Name: email_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY email_templates
    ADD CONSTRAINT email_templates_pkey PRIMARY KEY (id);


--
-- Name: embroiderings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY embroiderings
    ADD CONSTRAINT embroiderings_pkey PRIMARY KEY (id);


--
-- Name: entity_limits_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY entity_limits
    ADD CONSTRAINT entity_limits_pkey PRIMARY KEY (id);


--
-- Name: fabric_compacting_processes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY fabric_compacting_processes
    ADD CONSTRAINT fabric_compacting_processes_pkey PRIMARY KEY (id);


--
-- Name: fabric_dyeing_processes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY fabric_dyeing_processes
    ADD CONSTRAINT fabric_dyeing_processes_pkey PRIMARY KEY (id);


--
-- Name: fabric_printing_processes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY fabric_printing_processes
    ADD CONSTRAINT fabric_printing_processes_pkey PRIMARY KEY (id);


--
-- Name: fabric_selections_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY fabric_selections
    ADD CONSTRAINT fabric_selections_pkey PRIMARY KEY (id);


--
-- Name: fabric_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY fabric_types
    ADD CONSTRAINT fabric_types_pkey PRIMARY KEY (id);


--
-- Name: fabric_washing_processes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY fabric_washing_processes
    ADD CONSTRAINT fabric_washing_processes_pkey PRIMARY KEY (id);


--
-- Name: fabrics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY fabrics
    ADD CONSTRAINT fabrics_pkey PRIMARY KEY (id);


--
-- Name: farm_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY farm_groups
    ADD CONSTRAINT farm_groups_pkey PRIMARY KEY (id);


--
-- Name: farm_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY farm_items
    ADD CONSTRAINT farm_items_pkey PRIMARY KEY (id);


--
-- Name: farm_products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY farm_products
    ADD CONSTRAINT farm_products_pkey PRIMARY KEY (id);


--
-- Name: farmer_agri_areas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY farmer_agri_areas
    ADD CONSTRAINT farmer_agri_areas_pkey PRIMARY KEY (id);


--
-- Name: farmer_cotton_areas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY farmer_cotton_areas
    ADD CONSTRAINT farmer_cotton_areas_pkey PRIMARY KEY (id);


--
-- Name: farmers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY farmers
    ADD CONSTRAINT farmers_pkey PRIMARY KEY (id);


--
-- Name: farms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY farms
    ADD CONSTRAINT farms_pkey PRIMARY KEY (id);


--
-- Name: garment_sales_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY garment_sales
    ADD CONSTRAINT garment_sales_pkey PRIMARY KEY (id);


--
-- Name: garment_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY garment_types
    ADD CONSTRAINT garment_types_pkey PRIMARY KEY (id);


--
-- Name: garments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY garments
    ADD CONSTRAINT garments_pkey PRIMARY KEY (id);


--
-- Name: gin-bales_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY "gin-bales"
    ADD CONSTRAINT "gin-bales_pkey" PRIMARY KEY (id);


--
-- Name: gin_process_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY gin_process
    ADD CONSTRAINT gin_process_pkey PRIMARY KEY (id);


--
-- Name: gin_processes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY gin_processes
    ADD CONSTRAINT gin_processes_pkey PRIMARY KEY (id);


--
-- Name: gin_sales_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY gin_sales
    ADD CONSTRAINT gin_sales_pkey PRIMARY KEY (id);


--
-- Name: ginner_expected_cottons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY ginner_expected_cottons
    ADD CONSTRAINT ginner_expected_cottons_pkey PRIMARY KEY (id);


--
-- Name: ginner_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY ginner_orders
    ADD CONSTRAINT ginner_orders_pkey PRIMARY KEY (id);


--
-- Name: ginners_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY ginners
    ADD CONSTRAINT ginners_pkey PRIMARY KEY (id);


--
-- Name: ics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY ics
    ADD CONSTRAINT ics_pkey PRIMARY KEY (id);


--
-- Name: knit_sales_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY knit_sales
    ADD CONSTRAINT knit_sales_pkey PRIMARY KEY (id);


--
-- Name: knit_yarn_selections_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY knit_yarn_selections
    ADD CONSTRAINT knit_yarn_selections_pkey PRIMARY KEY (id);


--
-- Name: knitters_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY knitters
    ADD CONSTRAINT knitters_pkey PRIMARY KEY (id);


--
-- Name: linen_details_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY linen_details
    ADD CONSTRAINT linen_details_pkey PRIMARY KEY (id);


--
-- Name: linens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY linens
    ADD CONSTRAINT linens_pkey PRIMARY KEY (id);


--
-- Name: lint_selections_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY lint_selections
    ADD CONSTRAINT lint_selections_pkey PRIMARY KEY (id);


--
-- Name: loom_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY loom_types
    ADD CONSTRAINT loom_types_pkey PRIMARY KEY (id);


--
-- Name: menu_lists_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY menu_lists
    ADD CONSTRAINT menu_lists_pkey PRIMARY KEY (id);


--
-- Name: organic_integrities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY organic_integrities
    ADD CONSTRAINT organic_integrities_pkey PRIMARY KEY (id);


--
-- Name: process_training_process_statuses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY process_training_process_statuses
    ADD CONSTRAINT process_training_process_statuses_pkey PRIMARY KEY (id);


--
-- Name: processor_trainings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY processor_trainings
    ADD CONSTRAINT processor_trainings_pkey PRIMARY KEY (id);


--
-- Name: prod_capacities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY prod_capacities
    ADD CONSTRAINT prod_capacities_pkey PRIMARY KEY (id);


--
-- Name: programs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY programs
    ADD CONSTRAINT programs_pkey PRIMARY KEY (id);


--
-- Name: quality-parameters_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY "quality-parameters"
    ADD CONSTRAINT "quality-parameters_pkey" PRIMARY KEY (id);


--
-- Name: ratings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY ratings
    ADD CONSTRAINT ratings_pkey PRIMARY KEY (id);


--
-- Name: scope_certs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY scope_certs
    ADD CONSTRAINT scope_certs_pkey PRIMARY KEY (id);


--
-- Name: seasons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY seasons
    ADD CONSTRAINT seasons_pkey PRIMARY KEY (id);


--
-- Name: spin_process_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY spin_process
    ADD CONSTRAINT spin_process_pkey PRIMARY KEY (id);


--
-- Name: spin_process_yarn_selections_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY spin_process_yarn_selections
    ADD CONSTRAINT spin_process_yarn_selections_pkey PRIMARY KEY (id);


--
-- Name: spin_sales_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY spin_sales
    ADD CONSTRAINT spin_sales_pkey PRIMARY KEY (id);


--
-- Name: spinners_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY spinners
    ADD CONSTRAINT spinners_pkey PRIMARY KEY (id);


--
-- Name: states_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY states
    ADD CONSTRAINT states_pkey PRIMARY KEY (id);


--
-- Name: style_mark_nos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY style_mark_nos
    ADD CONSTRAINT style_mark_nos_pkey PRIMARY KEY (id);


--
-- Name: ticket_tracker_status_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY ticket_tracker_status
    ADD CONSTRAINT ticket_tracker_status_pkey PRIMARY KEY (id);


--
-- Name: ticket_tracker_statuses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY ticket_tracker_statuses
    ADD CONSTRAINT ticket_tracker_statuses_pkey PRIMARY KEY (id);


--
-- Name: ticket_trackers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY ticket_trackers
    ADD CONSTRAINT ticket_trackers_pkey PRIMARY KEY (id);


--
-- Name: ticketing_escalation_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY ticketing_escalation_types
    ADD CONSTRAINT ticketing_escalation_types_pkey PRIMARY KEY (id);


--
-- Name: trader_sales_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY trader_sales
    ADD CONSTRAINT trader_sales_pkey PRIMARY KEY (id);


--
-- Name: traders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY traders
    ADD CONSTRAINT traders_pkey PRIMARY KEY (id);


--
-- Name: transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: unit_certifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY unit_certifications
    ADD CONSTRAINT unit_certifications_pkey PRIMARY KEY (id);


--
-- Name: unit_subtypes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY unit_subtypes
    ADD CONSTRAINT unit_subtypes_pkey PRIMARY KEY (id);


--
-- Name: unit_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY unit_types
    ADD CONSTRAINT unit_types_pkey PRIMARY KEY (id);


--
-- Name: user_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY user_categories
    ADD CONSTRAINT user_categories_pkey PRIMARY KEY (id);


--
-- Name: user_privileges_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY user_privileges
    ADD CONSTRAINT user_privileges_pkey PRIMARY KEY (id);


--
-- Name: user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY user_tokens
    ADD CONSTRAINT user_tokens_pkey PRIMARY KEY (id);


--
-- Name: users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: validation_farmers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY validation_farmers
    ADD CONSTRAINT validation_farmers_pkey PRIMARY KEY (id);


--
-- Name: validation_projects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY validation_projects
    ADD CONSTRAINT validation_projects_pkey PRIMARY KEY (id);


--
-- Name: videos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY videos
    ADD CONSTRAINT videos_pkey PRIMARY KEY (id);


--
-- Name: village_impacts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY village_impacts
    ADD CONSTRAINT village_impacts_pkey PRIMARY KEY (id);


--
-- Name: villages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY villages
    ADD CONSTRAINT villages_pkey PRIMARY KEY (id);


--
-- Name: weaver_sales_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY weaver_sales
    ADD CONSTRAINT weaver_sales_pkey PRIMARY KEY (id);


--
-- Name: weavers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY weavers
    ADD CONSTRAINT weavers_pkey PRIMARY KEY (id);


--
-- Name: yarn_counts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY yarn_counts
    ADD CONSTRAINT yarn_counts_pkey PRIMARY KEY (id);


--
-- Name: yarn_selections_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY yarn_selections
    ADD CONSTRAINT yarn_selections_pkey PRIMARY KEY (id);


--
-- Name: blocks_district_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY blocks
    ADD CONSTRAINT blocks_district_id_fkey FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE CASCADE;


--
-- Name: crop_grades_cropVariety_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY crop_grades
    ADD CONSTRAINT "crop_grades_cropVariety_id_fkey" FOREIGN KEY ("cropVariety_id") REFERENCES crop_varieties(id) ON DELETE CASCADE;


--
-- Name: crop_types_crop_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY crop_types
    ADD CONSTRAINT crop_types_crop_id_fkey FOREIGN KEY (crop_id) REFERENCES crops(id) ON DELETE CASCADE;


--
-- Name: crop_varieties_cropType_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY crop_varieties
    ADD CONSTRAINT "crop_varieties_cropType_id_fkey" FOREIGN KEY ("cropType_id") REFERENCES crop_types(id) ON DELETE CASCADE;


--
-- Name: devices_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY devices
    ADD CONSTRAINT devices_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;


--
-- Name: districts_state_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY districts
    ADD CONSTRAINT districts_state_id_fkey FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE CASCADE;


--
-- Name: email_managements_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY email_managements
    ADD CONSTRAINT email_managements_template_id_fkey FOREIGN KEY (template_id) REFERENCES email_templates(id) ON DELETE CASCADE;


--
-- Name: entity_limits_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY entity_limits
    ADD CONSTRAINT entity_limits_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE;


--
-- Name: fabric_compacting_processes_fabric_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY fabric_compacting_processes
    ADD CONSTRAINT fabric_compacting_processes_fabric_id_fkey FOREIGN KEY (fabric_id) REFERENCES fabrics(id) ON DELETE CASCADE;


--
-- Name: fabric_dyeing_processes_fabric_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY fabric_dyeing_processes
    ADD CONSTRAINT fabric_dyeing_processes_fabric_id_fkey FOREIGN KEY (fabric_id) REFERENCES fabrics(id) ON DELETE CASCADE;


--
-- Name: fabric_printing_processes_fabric_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY fabric_printing_processes
    ADD CONSTRAINT fabric_printing_processes_fabric_id_fkey FOREIGN KEY (fabric_id) REFERENCES fabrics(id) ON DELETE CASCADE;


--
-- Name: fabric_washing_processes_fabric_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY fabric_washing_processes
    ADD CONSTRAINT fabric_washing_processes_fabric_id_fkey FOREIGN KEY (fabric_id) REFERENCES fabrics(id) ON DELETE CASCADE;


--
-- Name: farm_products_farmItem_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY farm_products
    ADD CONSTRAINT "farm_products_farmItem_id_fkey" FOREIGN KEY ("farmItem_id") REFERENCES farm_items(id) ON DELETE CASCADE;


--
-- Name: farmer_agri_areas_farmer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY farmer_agri_areas
    ADD CONSTRAINT farmer_agri_areas_farmer_id_fkey FOREIGN KEY (farmer_id) REFERENCES farmers(id) ON DELETE CASCADE;


--
-- Name: farmer_cotton_areas_farmer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY farmer_cotton_areas
    ADD CONSTRAINT farmer_cotton_areas_farmer_id_fkey FOREIGN KEY (farmer_id) REFERENCES farmers(id) ON DELETE CASCADE;


--
-- Name: farmers_block_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY farmers
    ADD CONSTRAINT farmers_block_id_fkey FOREIGN KEY (block_id) REFERENCES blocks(id) ON DELETE CASCADE;


--
-- Name: farmers_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY farmers
    ADD CONSTRAINT farmers_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE;


--
-- Name: farmers_country_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY farmers
    ADD CONSTRAINT farmers_country_id_fkey FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE CASCADE;


--
-- Name: farmers_district_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY farmers
    ADD CONSTRAINT farmers_district_id_fkey FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE CASCADE;


--
-- Name: farmers_farmGroup_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY farmers
    ADD CONSTRAINT "farmers_farmGroup_id_fkey" FOREIGN KEY ("farmGroup_id") REFERENCES farm_groups(id) ON DELETE CASCADE;


--
-- Name: farmers_program_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY farmers
    ADD CONSTRAINT farmers_program_id_fkey FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE;


--
-- Name: farmers_state_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY farmers
    ADD CONSTRAINT farmers_state_id_fkey FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE CASCADE;


--
-- Name: farmers_village_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY farmers
    ADD CONSTRAINT farmers_village_id_fkey FOREIGN KEY (village_id) REFERENCES villages(id) ON DELETE CASCADE;


--
-- Name: farms_farmer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY farms
    ADD CONSTRAINT farms_farmer_id_fkey FOREIGN KEY (farmer_id) REFERENCES farmers(id) ON DELETE CASCADE;


--
-- Name: farms_program_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY farms
    ADD CONSTRAINT farms_program_id_fkey FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE;


--
-- Name: farms_season_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY farms
    ADD CONSTRAINT farms_season_id_fkey FOREIGN KEY (season_id) REFERENCES seasons(id) ON DELETE CASCADE;


--
-- Name: garment_sales_embroidering_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY garment_sales
    ADD CONSTRAINT garment_sales_embroidering_id_fkey FOREIGN KEY (embroidering_id) REFERENCES embroiderings(id);


--
-- Name: garment_sales_garment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY garment_sales
    ADD CONSTRAINT garment_sales_garment_id_fkey FOREIGN KEY (garment_id) REFERENCES garments(id) ON DELETE CASCADE;


--
-- Name: garments_country_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY garments
    ADD CONSTRAINT garments_country_id_fkey FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE CASCADE;


--
-- Name: garments_state_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY garments
    ADD CONSTRAINT garments_state_id_fkey FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE CASCADE;


--
-- Name: gin_process_ginner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY gin_process
    ADD CONSTRAINT gin_process_ginner_id_fkey FOREIGN KEY (ginner_id) REFERENCES ginners(id) ON DELETE CASCADE;


--
-- Name: gin_processes_ginner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY gin_processes
    ADD CONSTRAINT gin_processes_ginner_id_fkey FOREIGN KEY (ginner_id) REFERENCES ginners(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: gin_processes_program_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY gin_processes
    ADD CONSTRAINT gin_processes_program_id_fkey FOREIGN KEY (program_id) REFERENCES programs(id) ON UPDATE CASCADE;


--
-- Name: gin_processes_season_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY gin_processes
    ADD CONSTRAINT gin_processes_season_id_fkey FOREIGN KEY (season_id) REFERENCES seasons(id) ON UPDATE CASCADE;


--
-- Name: gin_sales_ginner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY gin_sales
    ADD CONSTRAINT gin_sales_ginner_id_fkey FOREIGN KEY (ginner_id) REFERENCES ginners(id) ON DELETE CASCADE;


--
-- Name: ginner_expected_cottons_ginner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY ginner_expected_cottons
    ADD CONSTRAINT ginner_expected_cottons_ginner_id_fkey FOREIGN KEY (ginner_id) REFERENCES ginners(id) ON DELETE CASCADE;


--
-- Name: ginner_orders_ginner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY ginner_orders
    ADD CONSTRAINT ginner_orders_ginner_id_fkey FOREIGN KEY (ginner_id) REFERENCES ginners(id) ON DELETE CASCADE;


--
-- Name: ginners_country_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY ginners
    ADD CONSTRAINT ginners_country_id_fkey FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE CASCADE;


--
-- Name: ginners_state_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY ginners
    ADD CONSTRAINT ginners_state_id_fkey FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE CASCADE;


--
-- Name: ics_farmGroup_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY ics
    ADD CONSTRAINT "ics_farmGroup_id_fkey" FOREIGN KEY ("farmGroup_id") REFERENCES farm_groups(id) ON DELETE CASCADE;


--
-- Name: knit_sales_dyeing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY knit_sales
    ADD CONSTRAINT knit_sales_dyeing_id_fkey FOREIGN KEY (dyeing_id) REFERENCES dyeings(id);


--
-- Name: knit_sales_knitter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY knit_sales
    ADD CONSTRAINT knit_sales_knitter_id_fkey FOREIGN KEY (knitter_id) REFERENCES knitters(id) ON DELETE CASCADE;


--
-- Name: knitters_country_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY knitters
    ADD CONSTRAINT knitters_country_id_fkey FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE CASCADE;


--
-- Name: knitters_state_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY knitters
    ADD CONSTRAINT knitters_state_id_fkey FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE CASCADE;


--
-- Name: organic_integrities_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY organic_integrities
    ADD CONSTRAINT organic_integrities_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE;


--
-- Name: processor_trainings_brand_id_brands_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY processor_trainings
    ADD CONSTRAINT processor_trainings_brand_id_brands_fk FOREIGN KEY (brand_id) REFERENCES brands(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: processor_trainings_country_id_countries_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY processor_trainings
    ADD CONSTRAINT processor_trainings_country_id_countries_fk FOREIGN KEY (country_id) REFERENCES countries(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: processor_trainings_state_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY processor_trainings
    ADD CONSTRAINT processor_trainings_state_id_fkey FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE SET NULL;


--
-- Name: scope_certs_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY scope_certs
    ADD CONSTRAINT scope_certs_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE;


--
-- Name: scope_certs_country_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY scope_certs
    ADD CONSTRAINT scope_certs_country_id_fkey FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE CASCADE;


--
-- Name: scope_certs_farmGroup_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY scope_certs
    ADD CONSTRAINT "scope_certs_farmGroup_id_fkey" FOREIGN KEY ("farmGroup_id") REFERENCES farm_groups(id) ON DELETE CASCADE;


--
-- Name: scope_certs_ics_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY scope_certs
    ADD CONSTRAINT scope_certs_ics_id_fkey FOREIGN KEY (ics_id) REFERENCES ics(id) ON DELETE CASCADE;


--
-- Name: scope_certs_state_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY scope_certs
    ADD CONSTRAINT scope_certs_state_id_fkey FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE CASCADE;


--
-- Name: spin_process_dyeing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY spin_process
    ADD CONSTRAINT spin_process_dyeing_id_fkey FOREIGN KEY (dyeing_id) REFERENCES dyeings(id);


--
-- Name: spin_process_spinner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY spin_process
    ADD CONSTRAINT spin_process_spinner_id_fkey FOREIGN KEY (spinner_id) REFERENCES spinners(id) ON DELETE CASCADE;


--
-- Name: spin_sales_spinner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY spin_sales
    ADD CONSTRAINT spin_sales_spinner_id_fkey FOREIGN KEY (spinner_id) REFERENCES spinners(id) ON DELETE CASCADE;


--
-- Name: spinners_country_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY spinners
    ADD CONSTRAINT spinners_country_id_fkey FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE CASCADE;


--
-- Name: spinners_state_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY spinners
    ADD CONSTRAINT spinners_state_id_fkey FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE CASCADE;


--
-- Name: states_country_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY states
    ADD CONSTRAINT states_country_id_fkey FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE CASCADE;


--
-- Name: trader_sales_buyer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY trader_sales
    ADD CONSTRAINT trader_sales_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES brands(id) ON UPDATE CASCADE;


--
-- Name: trader_sales_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY trader_sales
    ADD CONSTRAINT trader_sales_department_id_fkey FOREIGN KEY (department_id) REFERENCES departments(id) ON UPDATE CASCADE;


--
-- Name: trader_sales_embroidering_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY trader_sales
    ADD CONSTRAINT trader_sales_embroidering_id_fkey FOREIGN KEY (embroidering_id) REFERENCES embroiderings(id) ON UPDATE CASCADE;


--
-- Name: trader_sales_program_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY trader_sales
    ADD CONSTRAINT trader_sales_program_id_fkey FOREIGN KEY (program_id) REFERENCES programs(id) ON UPDATE CASCADE;


--
-- Name: trader_sales_season_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY trader_sales
    ADD CONSTRAINT trader_sales_season_id_fkey FOREIGN KEY (season_id) REFERENCES seasons(id) ON UPDATE CASCADE;


--
-- Name: trader_sales_trader_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY trader_sales
    ADD CONSTRAINT trader_sales_trader_id_fkey FOREIGN KEY (trader_id) REFERENCES traders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: traders_country_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY traders
    ADD CONSTRAINT traders_country_id_fkey FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE CASCADE;


--
-- Name: traders_state_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY traders
    ADD CONSTRAINT traders_state_id_fkey FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE CASCADE;


--
-- Name: transactions_block_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY transactions
    ADD CONSTRAINT transactions_block_id_fkey FOREIGN KEY (block_id) REFERENCES blocks(id) ON DELETE CASCADE;


--
-- Name: transactions_country_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY transactions
    ADD CONSTRAINT transactions_country_id_fkey FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE CASCADE;


--
-- Name: transactions_district_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY transactions
    ADD CONSTRAINT transactions_district_id_fkey FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE CASCADE;


--
-- Name: transactions_farmer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY transactions
    ADD CONSTRAINT transactions_farmer_id_fkey FOREIGN KEY (farmer_id) REFERENCES farmers(id) ON DELETE CASCADE;


--
-- Name: transactions_grade_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY transactions
    ADD CONSTRAINT transactions_grade_id_fkey FOREIGN KEY (grade_id) REFERENCES crop_grades(id) ON DELETE CASCADE;


--
-- Name: transactions_program_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY transactions
    ADD CONSTRAINT transactions_program_id_fkey FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE;


--
-- Name: transactions_season_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY transactions
    ADD CONSTRAINT transactions_season_id_fkey FOREIGN KEY (season_id) REFERENCES seasons(id) ON DELETE CASCADE;


--
-- Name: transactions_state_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY transactions
    ADD CONSTRAINT transactions_state_id_fkey FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE CASCADE;


--
-- Name: transactions_village_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY transactions
    ADD CONSTRAINT transactions_village_id_fkey FOREIGN KEY (village_id) REFERENCES villages(id) ON DELETE CASCADE;


--
-- Name: unit_subtypes_unitType_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY unit_subtypes
    ADD CONSTRAINT "unit_subtypes_unitType_id_fkey" FOREIGN KEY ("unitType_id") REFERENCES unit_types(id) ON DELETE CASCADE;


--
-- Name: user_privileges_menu_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY user_privileges
    ADD CONSTRAINT user_privileges_menu_id_fkey FOREIGN KEY (menu_id) REFERENCES menu_lists(id) ON DELETE CASCADE;


--
-- Name: user_privileges_userRole_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY user_privileges
    ADD CONSTRAINT "user_privileges_userRole_id_fkey" FOREIGN KEY ("userRole_id") REFERENCES user_roles(id) ON DELETE CASCADE;


--
-- Name: user_roles_userCategory_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY user_roles
    ADD CONSTRAINT "user_roles_userCategory_id_fkey" FOREIGN KEY ("userCategory_id") REFERENCES user_categories(id) ON DELETE CASCADE;


--
-- Name: villages_block_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY villages
    ADD CONSTRAINT villages_block_id_fkey FOREIGN KEY (block_id) REFERENCES blocks(id) ON DELETE CASCADE;


--
-- Name: weaver_sales_dyeing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY weaver_sales
    ADD CONSTRAINT weaver_sales_dyeing_id_fkey FOREIGN KEY (dyeing_id) REFERENCES dyeings(id);


--
-- Name: weaver_sales_weaver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY weaver_sales
    ADD CONSTRAINT weaver_sales_weaver_id_fkey FOREIGN KEY (weaver_id) REFERENCES weavers(id) ON DELETE CASCADE;


--
-- Name: weavers_country_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY weavers
    ADD CONSTRAINT weavers_country_id_fkey FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE CASCADE;


--
-- Name: weavers_state_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY weavers
    ADD CONSTRAINT weavers_state_id_fkey FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE CASCADE;


--
-- Name: public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM postgres;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

