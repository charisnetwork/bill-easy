--
-- PostgreSQL database dump
--

\restrict QmqW5360KlvKZbzmMeJrwNXC5mgeo5di1lWc77QDfKnjoZ68VBmVjNr6dp91KHY

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
    'inactive'
);


ALTER TYPE public."enum_Affiliates_status" OWNER TO postgres;

--
-- Name: enum_Coupons_discount_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Coupons_discount_type" AS ENUM (
    'percentage',
    'flat'
);


ALTER TYPE public."enum_Coupons_discount_type" OWNER TO postgres;

--
-- Name: enum_EWayBills_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_EWayBills_status" AS ENUM (
    'active',
    'cancelled',
    'expired'
);


ALTER TYPE public."enum_EWayBills_status" OWNER TO postgres;

--
-- Name: enum_Enquiries_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Enquiries_status" AS ENUM (
    'pending',
    'contacted',
    'closed'
);


ALTER TYPE public."enum_Enquiries_status" OWNER TO postgres;

--
-- Name: enum_Invoices_discount_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Invoices_discount_type" AS ENUM (
    'percentage',
    'fixed'
);


ALTER TYPE public."enum_Invoices_discount_type" OWNER TO postgres;

--
-- Name: enum_Invoices_payment_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Invoices_payment_status" AS ENUM (
    'paid',
    'partial',
    'unpaid'
);


ALTER TYPE public."enum_Invoices_payment_status" OWNER TO postgres;

--
-- Name: enum_Invoices_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Invoices_status" AS ENUM (
    'draft',
    'sent',
    'cancelled'
);


ALTER TYPE public."enum_Invoices_status" OWNER TO postgres;

--
-- Name: enum_Payments_payment_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Payments_payment_type" AS ENUM (
    'received',
    'made'
);


ALTER TYPE public."enum_Payments_payment_type" OWNER TO postgres;

--
-- Name: enum_Plans_billing_cycle; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Plans_billing_cycle" AS ENUM (
    'monthly',
    'yearly',
    'lifetime',
    '3month'
);


ALTER TYPE public."enum_Plans_billing_cycle" OWNER TO postgres;

--
-- Name: enum_Purchases_payment_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Purchases_payment_status" AS ENUM (
    'paid',
    'partial',
    'unpaid'
);


ALTER TYPE public."enum_Purchases_payment_status" OWNER TO postgres;

--
-- Name: enum_Purchases_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Purchases_status" AS ENUM (
    'draft',
    'received',
    'active',
    'ordered',
    'pending',
    'cancelled'
);


ALTER TYPE public."enum_Purchases_status" OWNER TO postgres;

--
-- Name: enum_Quotations_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Quotations_status" AS ENUM (
    'draft',
    'sent',
    'accepted',
    'rejected',
    'expired'
);


ALTER TYPE public."enum_Quotations_status" OWNER TO postgres;

--
-- Name: enum_StaffAttendance_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_StaffAttendance_status" AS ENUM (
    'present',
    'absent',
    'late',
    'half-day'
);


ALTER TYPE public."enum_StaffAttendance_status" OWNER TO postgres;

--
-- Name: enum_StockMovements_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_StockMovements_type" AS ENUM (
    'in',
    'out',
    'adjustment',
    'transfer'
);


ALTER TYPE public."enum_StockMovements_type" OWNER TO postgres;

--
-- Name: enum_Subscriptions_payment_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Subscriptions_payment_status" AS ENUM (
    'paid',
    'pending',
    'failed'
);


ALTER TYPE public."enum_Subscriptions_payment_status" OWNER TO postgres;

--
-- Name: enum_Subscriptions_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Subscriptions_status" AS ENUM (
    'active',
    'expired',
    'cancelled',
    'trial'
);


ALTER TYPE public."enum_Subscriptions_status" OWNER TO postgres;

--
-- Name: enum_UserCompanies_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_UserCompanies_role" AS ENUM (
    'SUPER_ADMIN',
    'owner',
    'admin',
    'staff'
);


ALTER TYPE public."enum_UserCompanies_role" OWNER TO postgres;

--
-- Name: enum_Users_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Users_role" AS ENUM (
    'SUPER_ADMIN',
    'owner',
    'admin',
    'staff'
);


ALTER TYPE public."enum_Users_role" OWNER TO postgres;

--
-- Name: enum_companies_invoice_business_category; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_companies_invoice_business_category AS ENUM (
    'generic',
    'distribution',
    'retail',
    'automobile',
    'group5_service',
    'group6_mfg_construction'
);


ALTER TYPE public.enum_companies_invoice_business_category OWNER TO postgres;

--
-- Name: enum_companies_invoice_text_size; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_companies_invoice_text_size AS ENUM (
    '9pt',
    '10pt',
    '11pt',
    '12pt'
);


ALTER TYPE public.enum_companies_invoice_text_size OWNER TO postgres;

--
-- Name: enum_coupons_discount_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_coupons_discount_type AS ENUM (
    'percentage',
    'flat'
);


ALTER TYPE public.enum_coupons_discount_type OWNER TO postgres;

--
-- Name: enum_enquiries_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_enquiries_status AS ENUM (
    'pending',
    'contacted',
    'closed'
);


ALTER TYPE public.enum_enquiries_status OWNER TO postgres;

--
-- Name: enum_ewaybills_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_ewaybills_status AS ENUM (
    'active',
    'cancelled',
    'expired'
);


ALTER TYPE public.enum_ewaybills_status OWNER TO postgres;

--
-- Name: enum_invoices_discount_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_invoices_discount_type AS ENUM (
    'fixed',
    'percentage'
);


ALTER TYPE public.enum_invoices_discount_type OWNER TO postgres;

--
-- Name: enum_invoices_payment_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_invoices_payment_status AS ENUM (
    'paid',
    'partial',
    'unpaid'
);


ALTER TYPE public.enum_invoices_payment_status OWNER TO postgres;

--
-- Name: enum_invoices_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_invoices_status AS ENUM (
    'draft',
    'sent',
    'cancelled'
);


ALTER TYPE public.enum_invoices_status OWNER TO postgres;

--
-- Name: enum_payments_payment_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_payments_payment_type AS ENUM (
    'received',
    'made'
);


ALTER TYPE public.enum_payments_payment_type OWNER TO postgres;

--
-- Name: enum_plans_billing_cycle; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_plans_billing_cycle AS ENUM (
    'monthly',
    '3month',
    'yearly',
    'lifetime'
);


ALTER TYPE public.enum_plans_billing_cycle OWNER TO postgres;

--
-- Name: enum_purchase_orders_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_purchase_orders_status AS ENUM (
    'draft',
    'sent',
    'received',
    'cancelled'
);


ALTER TYPE public.enum_purchase_orders_status OWNER TO postgres;

--
-- Name: enum_purchases_payment_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_purchases_payment_status AS ENUM (
    'paid',
    'partial',
    'unpaid'
);


ALTER TYPE public.enum_purchases_payment_status OWNER TO postgres;

--
-- Name: enum_purchases_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_purchases_status AS ENUM (
    'received',
    'ordered',
    'pending',
    'cancelled'
);


ALTER TYPE public.enum_purchases_status OWNER TO postgres;

--
-- Name: enum_quotations_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_quotations_status AS ENUM (
    'draft',
    'sent',
    'accepted',
    'rejected',
    'expired'
);


ALTER TYPE public.enum_quotations_status OWNER TO postgres;

--
-- Name: enum_staffattendance_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_staffattendance_status AS ENUM (
    'present',
    'absent',
    'late',
    'half-day'
);


ALTER TYPE public.enum_staffattendance_status OWNER TO postgres;

--
-- Name: enum_stock_movements_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_stock_movements_type AS ENUM (
    'in',
    'out',
    'adjustment'
);


ALTER TYPE public.enum_stock_movements_type OWNER TO postgres;

--
-- Name: enum_stockmovements_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_stockmovements_type AS ENUM (
    'in',
    'out',
    'adjustment',
    'transfer'
);


ALTER TYPE public.enum_stockmovements_type OWNER TO postgres;

--
-- Name: enum_subscriptions_payment_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_subscriptions_payment_status AS ENUM (
    'paid',
    'pending',
    'failed'
);


ALTER TYPE public.enum_subscriptions_payment_status OWNER TO postgres;

--
-- Name: enum_subscriptions_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_subscriptions_status AS ENUM (
    'active',
    'expired',
    'cancelled',
    'trial'
);


ALTER TYPE public.enum_subscriptions_status OWNER TO postgres;

--
-- Name: enum_tax_settings_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_tax_settings_type AS ENUM (
    'tds',
    'tcs'
);


ALTER TYPE public.enum_tax_settings_type OWNER TO postgres;

--
-- Name: enum_usercompanies_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_usercompanies_role AS ENUM (
    'owner',
    'admin',
    'staff'
);


ALTER TYPE public.enum_usercompanies_role OWNER TO postgres;

--
-- Name: enum_users_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_users_role AS ENUM (
    'owner',
    'admin',
    'staff'
);


ALTER TYPE public.enum_users_role OWNER TO postgres;

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
    mobile_no character varying(255) NOT NULL,
    status public."enum_Affiliates_status" DEFAULT 'active'::public."enum_Affiliates_status",
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public."Affiliates" OWNER TO postgres;

--
-- Name: Categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Categories" (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    company_id uuid NOT NULL
);


ALTER TABLE public."Categories" OWNER TO postgres;

--
-- Name: Companies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Companies" (
    id uuid NOT NULL,
    name character varying(255),
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Companies" OWNER TO postgres;

--
-- Name: Coupons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Coupons" (
    id uuid NOT NULL,
    code character varying(255) NOT NULL,
    is_active boolean DEFAULT true,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    discount_type public."enum_Coupons_discount_type" DEFAULT 'percentage'::public."enum_Coupons_discount_type",
    discount_value numeric(10,2) DEFAULT 0,
    expiry_date timestamp with time zone,
    usage_limit integer DEFAULT 100,
    usage_count integer DEFAULT 0,
    company_id uuid
);


ALTER TABLE public."Coupons" OWNER TO postgres;

--
-- Name: CreditNoteItems; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CreditNoteItems" (
    id uuid NOT NULL,
    credit_note_id uuid NOT NULL,
    product_id uuid NOT NULL,
    quantity numeric(12,2) NOT NULL,
    unit_price numeric(12,2) NOT NULL,
    tax_rate numeric(5,2) DEFAULT 0,
    tax_amount numeric(12,2) DEFAULT 0,
    total numeric(12,2) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."CreditNoteItems" OWNER TO postgres;

--
-- Name: CreditNotes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CreditNotes" (
    id uuid NOT NULL,
    company_id uuid NOT NULL,
    customer_id uuid NOT NULL,
    invoice_id uuid NOT NULL,
    credit_note_number character varying(255) NOT NULL,
    date timestamp with time zone,
    reason character varying(255),
    subtotal numeric(12,2) DEFAULT 0,
    tax_amount numeric(12,2) DEFAULT 0,
    total_amount numeric(12,2) DEFAULT 0,
    industry_metadata jsonb DEFAULT '{}'::jsonb,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."CreditNotes" OWNER TO postgres;

--
-- Name: Customers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Customers" (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    phone character varying(255),
    email character varying(255),
    gst_number character varying(255),
    address text,
    city character varying(255),
    state character varying(255),
    pincode character varying(255),
    outstanding_balance numeric(12,2) DEFAULT 0,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    company_id uuid NOT NULL,
    wallet_balance numeric(12,2) DEFAULT 0
);


ALTER TABLE public."Customers" OWNER TO postgres;

--
-- Name: EWayBills; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."EWayBills" (
    id uuid NOT NULL,
    company_id uuid NOT NULL,
    invoice_id uuid,
    eway_bill_number character varying(255) NOT NULL,
    generated_date timestamp with time zone,
    valid_until timestamp with time zone,
    transporter_name character varying(255),
    transporter_id character varying(255),
    vehicle_number character varying(255),
    from_place character varying(255),
    to_place character varying(255),
    distance integer,
    status public."enum_EWayBills_status" DEFAULT 'active'::public."enum_EWayBills_status",
    details json,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."EWayBills" OWNER TO postgres;

--
-- Name: Enquiries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Enquiries" (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    phone character varying(255) NOT NULL,
    email character varying(255),
    business_type character varying(255),
    message text,
    status public."enum_Enquiries_status" DEFAULT 'pending'::public."enum_Enquiries_status",
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Enquiries" OWNER TO postgres;

--
-- Name: Expenses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Expenses" (
    id uuid NOT NULL,
    category character varying(255) NOT NULL,
    amount numeric(12,2) DEFAULT 0,
    payment_method character varying(255),
    date timestamp with time zone,
    reference_number character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    company_id uuid NOT NULL,
    description text
);


ALTER TABLE public."Expenses" OWNER TO postgres;

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
-- Name: Godowns; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Godowns" (
    id uuid NOT NULL,
    company_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    is_active boolean DEFAULT true,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    address text,
    is_default boolean DEFAULT false
);


ALTER TABLE public."Godowns" OWNER TO postgres;

--
-- Name: InvoiceCounters; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."InvoiceCounters" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    last_number integer DEFAULT 0,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."InvoiceCounters" OWNER TO postgres;

--
-- Name: InvoiceItems; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."InvoiceItems" (
    id uuid NOT NULL,
    quantity numeric(12,2) NOT NULL,
    unit_price numeric(12,2) NOT NULL,
    total numeric(12,2) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    invoice_id uuid NOT NULL,
    product_id uuid NOT NULL,
    description text
);


ALTER TABLE public."InvoiceItems" OWNER TO postgres;

--
-- Name: Invoices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Invoices" (
    id uuid NOT NULL,
    total_amount numeric(12,2),
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone NOT NULL,
    company_id uuid
);


ALTER TABLE public."Invoices" OWNER TO postgres;

--
-- Name: Payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Payments" (
    id uuid NOT NULL,
    payment_type public."enum_Payments_payment_type" NOT NULL,
    amount numeric(12,2) NOT NULL,
    payment_method character varying(255),
    payment_date timestamp with time zone,
    reference_number character varying(255),
    notes text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    company_id uuid NOT NULL,
    customer_id uuid,
    supplier_id uuid,
    invoice_id uuid,
    purchase_id uuid
);


ALTER TABLE public."Payments" OWNER TO postgres;

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
-- Name: Products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Products" (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    sku character varying(255),
    hsn_code character varying(255),
    unit character varying(255) DEFAULT 'pcs'::character varying,
    gst_rate numeric(5,2) DEFAULT 18,
    purchase_price numeric(12,2) DEFAULT 0,
    sale_price numeric(12,2) DEFAULT 0,
    stock_quantity numeric(12,2) DEFAULT 0,
    low_stock_alert numeric(12,2) DEFAULT 10,
    barcode character varying(255),
    description text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    company_id uuid NOT NULL,
    category_id uuid,
    type character varying(255) DEFAULT 'product'::character varying
);


ALTER TABLE public."Products" OWNER TO postgres;

--
-- Name: PurchaseItems; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PurchaseItems" (
    id uuid NOT NULL,
    quantity numeric(12,2) NOT NULL,
    unit_price numeric(12,2) NOT NULL,
    total numeric(12,2) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    purchase_id uuid NOT NULL,
    product_id uuid NOT NULL,
    tax_rate numeric(5,2) DEFAULT 0,
    tax_amount numeric(12,2) DEFAULT 0
);


ALTER TABLE public."PurchaseItems" OWNER TO postgres;

--
-- Name: Purchases; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Purchases" (
    id uuid NOT NULL,
    bill_number character varying(255) NOT NULL,
    bill_date timestamp with time zone,
    tax_amount numeric(12,2) DEFAULT 0,
    total_amount numeric(12,2) DEFAULT 0,
    paid_amount numeric(12,2) DEFAULT 0,
    payment_status public."enum_Purchases_payment_status" DEFAULT 'unpaid'::public."enum_Purchases_payment_status",
    notes text,
    status public."enum_Purchases_status" DEFAULT 'received'::public."enum_Purchases_status",
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    company_id uuid NOT NULL,
    supplier_id uuid NOT NULL,
    due_date timestamp with time zone,
    subtotal numeric(12,2) DEFAULT 0,
    discount_amount numeric(12,2) DEFAULT 0,
    godown_id uuid
);


ALTER TABLE public."Purchases" OWNER TO postgres;

--
-- Name: QuotationCounters; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."QuotationCounters" (
    id uuid NOT NULL,
    company_id uuid NOT NULL,
    last_number integer DEFAULT 0,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."QuotationCounters" OWNER TO postgres;

--
-- Name: QuotationItems; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."QuotationItems" (
    id uuid NOT NULL,
    quotation_id uuid NOT NULL,
    product_id uuid NOT NULL,
    quantity numeric(12,2) NOT NULL,
    unit_price numeric(12,2) NOT NULL,
    tax_rate numeric(5,2) DEFAULT 0,
    tax_amount numeric(12,2) DEFAULT 0,
    total numeric(12,2) NOT NULL,
    description text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."QuotationItems" OWNER TO postgres;

--
-- Name: Quotations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Quotations" (
    id uuid NOT NULL,
    company_id uuid NOT NULL,
    customer_id uuid NOT NULL,
    godown_id uuid,
    quotation_number character varying(255) NOT NULL,
    quotation_date timestamp with time zone,
    valid_until timestamp with time zone,
    subtotal numeric(12,2) DEFAULT 0,
    tax_amount numeric(12,2) DEFAULT 0,
    discount_amount numeric(12,2) DEFAULT 0,
    total_amount numeric(12,2) DEFAULT 0,
    status public."enum_Quotations_status" DEFAULT 'draft'::public."enum_Quotations_status",
    notes text,
    terms text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    industry_metadata jsonb DEFAULT '{}'::jsonb
);


ALTER TABLE public."Quotations" OWNER TO postgres;

--
-- Name: Staff; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Staff" (
    id uuid NOT NULL,
    company_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    phone character varying(255),
    role character varying(255),
    salary numeric(12,2) DEFAULT 0,
    is_active boolean DEFAULT true,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Staff" OWNER TO postgres;

--
-- Name: StaffAttendance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."StaffAttendance" (
    id uuid NOT NULL,
    staff_id uuid NOT NULL,
    date date,
    status public."enum_StaffAttendance_status" DEFAULT 'present'::public."enum_StaffAttendance_status",
    notes text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."StaffAttendance" OWNER TO postgres;

--
-- Name: StockLevels; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."StockLevels" (
    id uuid NOT NULL,
    company_id uuid NOT NULL,
    product_id uuid NOT NULL,
    godown_id uuid NOT NULL,
    quantity numeric(12,2) DEFAULT 0,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."StockLevels" OWNER TO postgres;

--
-- Name: StockMovements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."StockMovements" (
    id uuid NOT NULL,
    type public."enum_StockMovements_type" NOT NULL,
    quantity numeric(12,2) NOT NULL,
    previous_stock numeric(12,2) DEFAULT 0,
    new_stock numeric(12,2) DEFAULT 0,
    reference_type character varying(255),
    reference_id uuid,
    notes text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    company_id uuid NOT NULL,
    product_id uuid NOT NULL,
    godown_id uuid
);


ALTER TABLE public."StockMovements" OWNER TO postgres;

--
-- Name: Subscriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Subscriptions" (
    id uuid NOT NULL,
    start_date timestamp with time zone,
    expiry_date timestamp with time zone,
    status public."enum_Subscriptions_status",
    payment_status public."enum_Subscriptions_payment_status",
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone NOT NULL,
    company_id uuid NOT NULL,
    plan_id uuid,
    coupon_id uuid,
    price numeric(10,2) DEFAULT 0
);


ALTER TABLE public."Subscriptions" OWNER TO postgres;

--
-- Name: Suppliers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Suppliers" (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    phone character varying(255),
    email character varying(255),
    gst_number character varying(255),
    address text,
    city character varying(255),
    state character varying(255),
    pincode character varying(255),
    outstanding_balance numeric(12,2) DEFAULT 0,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    company_id uuid NOT NULL
);


ALTER TABLE public."Suppliers" OWNER TO postgres;

--
-- Name: UserCompanies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."UserCompanies" (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    company_id uuid NOT NULL,
    role public."enum_UserCompanies_role" DEFAULT 'staff'::public."enum_UserCompanies_role",
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."UserCompanies" OWNER TO postgres;

--
-- Name: Users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Users" (
    id uuid NOT NULL,
    email character varying(255),
    name character varying(255),
    phone character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    company_id uuid,
    role character varying(255)
);


ALTER TABLE public."Users" OWNER TO postgres;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id uuid NOT NULL,
    company_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: companies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.companies (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    gst_number character varying(255),
    address text,
    city character varying(255),
    state character varying(255),
    pincode character varying(255),
    phone character varying(255),
    email character varying(255),
    logo character varying(255),
    signature character varying(255),
    tagline character varying(255),
    business_category character varying(255) DEFAULT 'General Store'::character varying,
    invoice_prefix character varying(255) DEFAULT 'INV'::character varying,
    currency character varying(255) DEFAULT 'INR'::character varying,
    financial_year_start integer DEFAULT 4,
    bank_name character varying(255),
    account_number character varying(255),
    ifsc_code character varying(255),
    branch_name character varying(255),
    qr_code character varying(255),
    terms_conditions text,
    gst_registered boolean DEFAULT false,
    enable_tds boolean DEFAULT false,
    enable_tcs boolean DEFAULT false,
    settings json DEFAULT '{"invoice_template":"modern"}'::json,
    invoice_business_category public.enum_companies_invoice_business_category DEFAULT 'generic'::public.enum_companies_invoice_business_category,
    invoice_column_labels jsonb DEFAULT '{}'::jsonb,
    invoice_column_toggles jsonb DEFAULT '{}'::jsonb,
    invoice_header_color text DEFAULT '#1D70B8'::text,
    invoice_menu_color text DEFAULT '#FFFFFF'::text,
    invoice_text_size public.enum_companies_invoice_text_size DEFAULT '10pt'::public.enum_companies_invoice_text_size
);


ALTER TABLE public.companies OWNER TO postgres;

--
-- Name: coupons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.coupons (
    id uuid NOT NULL,
    code character varying(255) NOT NULL,
    discount_type public.enum_coupons_discount_type DEFAULT 'percentage'::public.enum_coupons_discount_type,
    discount_value numeric(10,2) DEFAULT 0,
    expiry_date timestamp with time zone,
    usage_limit integer DEFAULT 100,
    usage_count integer DEFAULT 0,
    affiliate_id uuid,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.coupons OWNER TO postgres;

--
-- Name: creditnoteitems; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.creditnoteitems (
    id uuid NOT NULL,
    credit_note_id uuid NOT NULL,
    product_id uuid NOT NULL,
    quantity numeric(12,2) NOT NULL,
    unit_price numeric(12,2) NOT NULL,
    tax_rate numeric(5,2) DEFAULT 0,
    tax_amount numeric(12,2) DEFAULT 0,
    total numeric(12,2) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.creditnoteitems OWNER TO postgres;

--
-- Name: creditnotes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.creditnotes (
    id uuid NOT NULL,
    company_id uuid NOT NULL,
    customer_id uuid NOT NULL,
    invoice_id uuid NOT NULL,
    credit_note_number character varying(255) NOT NULL,
    date timestamp with time zone,
    reason character varying(255),
    subtotal numeric(12,2) DEFAULT 0,
    tax_amount numeric(12,2) DEFAULT 0,
    total_amount numeric(12,2) DEFAULT 0,
    industry_metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.creditnotes OWNER TO postgres;

--
-- Name: customers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customers (
    id uuid NOT NULL,
    company_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    phone character varying(255),
    email character varying(255),
    gst_number character varying(255),
    address text,
    city character varying(255),
    state character varying(255),
    pincode character varying(255),
    outstanding_balance numeric(12,2) DEFAULT 0,
    wallet_balance numeric(12,2) DEFAULT 0,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.customers OWNER TO postgres;

--
-- Name: enquiries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.enquiries (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    phone character varying(255) NOT NULL,
    email character varying(255),
    business_type character varying(255),
    message text,
    status public.enum_enquiries_status DEFAULT 'pending'::public.enum_enquiries_status,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.enquiries OWNER TO postgres;

--
-- Name: ewaybills; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ewaybills (
    id uuid NOT NULL,
    company_id uuid NOT NULL,
    invoice_id uuid,
    eway_bill_number character varying(255) NOT NULL,
    generated_date timestamp with time zone,
    valid_until timestamp with time zone,
    transporter_name character varying(255),
    transporter_id character varying(255),
    vehicle_number character varying(255),
    from_place character varying(255),
    to_place character varying(255),
    distance integer,
    status public.enum_ewaybills_status DEFAULT 'active'::public.enum_ewaybills_status,
    details json,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.ewaybills OWNER TO postgres;

--
-- Name: expenses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.expenses (
    id uuid NOT NULL,
    company_id uuid NOT NULL,
    date timestamp with time zone,
    category character varying(255) NOT NULL,
    amount numeric(12,2) DEFAULT 0,
    payment_method character varying(255),
    notes text,
    reference_number character varying(255),
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.expenses OWNER TO postgres;

--
-- Name: godowns; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.godowns (
    id uuid NOT NULL,
    company_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    address text,
    is_active boolean DEFAULT true,
    is_default boolean DEFAULT false,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.godowns OWNER TO postgres;

--
-- Name: gst_cache; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gst_cache (
    id uuid NOT NULL,
    gstin character varying(255) NOT NULL,
    data jsonb NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.gst_cache OWNER TO postgres;

--
-- Name: invoice_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoice_items (
    id uuid NOT NULL,
    invoice_id uuid NOT NULL,
    product_id uuid NOT NULL,
    quantity numeric(12,2) NOT NULL,
    unit_price numeric(12,2) NOT NULL,
    discount numeric(12,2) DEFAULT 0,
    tax_rate numeric(5,2) DEFAULT 0,
    tax_amount numeric(12,2) DEFAULT 0,
    total numeric(12,2) NOT NULL,
    description text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.invoice_items OWNER TO postgres;

--
-- Name: invoicecounters; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoicecounters (
    id uuid NOT NULL,
    company_id uuid NOT NULL,
    last_number integer DEFAULT 0,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.invoicecounters OWNER TO postgres;

--
-- Name: invoices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoices (
    id uuid NOT NULL,
    company_id uuid NOT NULL,
    total_amount numeric(12,2) DEFAULT 0,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    customer_id uuid NOT NULL,
    godown_id uuid,
    invoice_number character varying(255) NOT NULL,
    invoice_date timestamp with time zone,
    due_date timestamp with time zone,
    subtotal numeric(12,2) DEFAULT 0,
    tax_amount numeric(12,2) DEFAULT 0,
    discount_type public.enum_invoices_discount_type DEFAULT 'fixed'::public.enum_invoices_discount_type,
    discount_amount numeric(12,2) DEFAULT 0,
    tds_rate numeric(5,2) DEFAULT 0,
    tds_amount numeric(12,2) DEFAULT 0,
    tcs_rate numeric(5,2) DEFAULT 0,
    tcs_amount numeric(12,2) DEFAULT 0,
    round_off numeric(12,2) DEFAULT 0,
    final_amount numeric(12,2) DEFAULT 0,
    paid_amount numeric(12,2) DEFAULT 0,
    payment_status public.enum_invoices_payment_status DEFAULT 'unpaid'::public.enum_invoices_payment_status,
    payment_method character varying(255),
    notes text,
    terms text,
    status public.enum_invoices_status DEFAULT 'draft'::public.enum_invoices_status,
    extra_fields json DEFAULT '{}'::json,
    industry_metadata jsonb DEFAULT '{}'::jsonb,
    eway_bill_number character varying(255),
    wallet_amount numeric(12,2) DEFAULT 0
);


ALTER TABLE public.invoices OWNER TO postgres;

--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id uuid NOT NULL,
    company_id uuid NOT NULL,
    customer_id uuid,
    supplier_id uuid,
    invoice_id uuid,
    purchase_id uuid,
    payment_type public.enum_payments_payment_type NOT NULL,
    amount numeric(12,2) NOT NULL,
    payment_method character varying(255),
    payment_date timestamp with time zone,
    reference_number character varying(255),
    notes text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: plans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.plans (
    id uuid NOT NULL,
    plan_name character varying(255) NOT NULL,
    price numeric(10,2) DEFAULT 0,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    billing_cycle public.enum_plans_billing_cycle DEFAULT 'monthly'::public.enum_plans_billing_cycle,
    max_users integer DEFAULT 1,
    max_invoices_per_month integer DEFAULT 100,
    max_products integer DEFAULT 100,
    storage_limit integer DEFAULT 100,
    features json DEFAULT '{}'::json,
    is_active boolean DEFAULT true
);


ALTER TABLE public.plans OWNER TO postgres;

--
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id uuid NOT NULL,
    company_id uuid NOT NULL,
    category_id uuid,
    name character varying(255) NOT NULL,
    sku character varying(255),
    hsn_code character varying(255),
    type character varying(255) DEFAULT 'product'::character varying,
    unit character varying(255) DEFAULT 'pcs'::character varying,
    gst_rate numeric(5,2) DEFAULT 18,
    purchase_price numeric(12,2) DEFAULT 0,
    sale_price numeric(12,2) DEFAULT 0,
    stock_quantity numeric(12,2) DEFAULT 0,
    low_stock_alert numeric(12,2) DEFAULT 10,
    barcode character varying(255),
    description text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    new_price numeric(12,2)
);


ALTER TABLE public.products OWNER TO postgres;

--
-- Name: purchase_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchase_items (
    id uuid NOT NULL,
    purchase_id uuid NOT NULL,
    product_id uuid NOT NULL,
    quantity numeric(12,2) NOT NULL,
    unit_price numeric(12,2) NOT NULL,
    tax_rate numeric(5,2) DEFAULT 0,
    tax_amount numeric(12,2) DEFAULT 0,
    total numeric(12,2) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.purchase_items OWNER TO postgres;

--
-- Name: purchase_order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchase_order_items (
    id uuid NOT NULL,
    purchase_order_id uuid NOT NULL,
    product_id uuid NOT NULL,
    quantity numeric(12,2) NOT NULL,
    unit_price numeric(12,2) NOT NULL,
    tax_rate numeric(5,2) DEFAULT 0,
    tax_amount numeric(12,2) DEFAULT 0,
    total numeric(12,2) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.purchase_order_items OWNER TO postgres;

--
-- Name: purchase_orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchase_orders (
    id uuid NOT NULL,
    company_id uuid NOT NULL,
    supplier_id uuid NOT NULL,
    po_number character varying(255) NOT NULL,
    po_date timestamp with time zone,
    expected_date timestamp with time zone,
    subtotal numeric(12,2) DEFAULT 0,
    tax_amount numeric(12,2) DEFAULT 0,
    total_amount numeric(12,2) DEFAULT 0,
    status public.enum_purchase_orders_status DEFAULT 'draft'::public.enum_purchase_orders_status,
    notes text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.purchase_orders OWNER TO postgres;

--
-- Name: purchases; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchases (
    id uuid NOT NULL,
    company_id uuid NOT NULL,
    supplier_id uuid NOT NULL,
    godown_id uuid,
    bill_number character varying(255) NOT NULL,
    bill_date timestamp with time zone,
    due_date timestamp with time zone,
    subtotal numeric(12,2) DEFAULT 0,
    tax_amount numeric(12,2) DEFAULT 0,
    discount_amount numeric(12,2) DEFAULT 0,
    total_amount numeric(12,2) DEFAULT 0,
    paid_amount numeric(12,2) DEFAULT 0,
    payment_status public.enum_purchases_payment_status DEFAULT 'unpaid'::public.enum_purchases_payment_status,
    status public.enum_purchases_status DEFAULT 'received'::public.enum_purchases_status,
    notes text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.purchases OWNER TO postgres;

--
-- Name: quotationcounters; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quotationcounters (
    id uuid NOT NULL,
    company_id uuid NOT NULL,
    last_number integer DEFAULT 0,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.quotationcounters OWNER TO postgres;

--
-- Name: quotationitems; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quotationitems (
    id uuid NOT NULL,
    quotation_id uuid NOT NULL,
    product_id uuid NOT NULL,
    quantity numeric(12,2) NOT NULL,
    unit_price numeric(12,2) NOT NULL,
    tax_rate numeric(5,2) DEFAULT 0,
    tax_amount numeric(12,2) DEFAULT 0,
    total numeric(12,2) NOT NULL,
    description text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.quotationitems OWNER TO postgres;

--
-- Name: quotations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quotations (
    id uuid NOT NULL,
    company_id uuid NOT NULL,
    customer_id uuid NOT NULL,
    godown_id uuid,
    quotation_number character varying(255) NOT NULL,
    quotation_date timestamp with time zone,
    valid_until timestamp with time zone,
    subtotal numeric(12,2) DEFAULT 0,
    tax_amount numeric(12,2) DEFAULT 0,
    discount_amount numeric(12,2) DEFAULT 0,
    total_amount numeric(12,2) DEFAULT 0,
    status public.enum_quotations_status DEFAULT 'draft'::public.enum_quotations_status,
    notes text,
    terms text,
    industry_metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.quotations OWNER TO postgres;

--
-- Name: staff; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.staff (
    id uuid NOT NULL,
    company_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    phone character varying(255),
    role character varying(255),
    salary numeric(12,2) DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.staff OWNER TO postgres;

--
-- Name: staffattendance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.staffattendance (
    id uuid NOT NULL,
    staff_id uuid NOT NULL,
    date date,
    status public.enum_staffattendance_status DEFAULT 'present'::public.enum_staffattendance_status,
    notes text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.staffattendance OWNER TO postgres;

--
-- Name: stock_movements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_movements (
    id uuid NOT NULL,
    type public.enum_stock_movements_type NOT NULL,
    quantity numeric(12,2) NOT NULL,
    previous_stock numeric(12,2) DEFAULT 0,
    new_stock numeric(12,2) DEFAULT 0,
    reference_type character varying(255),
    reference_id uuid,
    notes text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    company_id uuid,
    product_id uuid
);


ALTER TABLE public.stock_movements OWNER TO postgres;

--
-- Name: stocklevels; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stocklevels (
    id uuid NOT NULL,
    company_id uuid NOT NULL,
    product_id uuid NOT NULL,
    godown_id uuid NOT NULL,
    quantity numeric(12,2) DEFAULT 0,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.stocklevels OWNER TO postgres;

--
-- Name: stockmovements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stockmovements (
    id uuid NOT NULL,
    company_id uuid NOT NULL,
    product_id uuid NOT NULL,
    godown_id uuid,
    type public.enum_stockmovements_type NOT NULL,
    quantity numeric(12,2) NOT NULL,
    previous_stock numeric(12,2) DEFAULT 0,
    new_stock numeric(12,2) DEFAULT 0,
    reference_type character varying(255),
    reference_id uuid,
    notes text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.stockmovements OWNER TO postgres;

--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscriptions (
    id uuid NOT NULL,
    company_id uuid NOT NULL,
    plan_id uuid,
    coupon_id uuid,
    price numeric(10,2) DEFAULT 0,
    start_date timestamp with time zone,
    expiry_date timestamp with time zone,
    status public.enum_subscriptions_status DEFAULT 'trial'::public.enum_subscriptions_status,
    payment_status public.enum_subscriptions_payment_status DEFAULT 'pending'::public.enum_subscriptions_payment_status,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    usage jsonb DEFAULT '{"godowns": 0, "invoices": 0, "products": 0, "eway_bills": 0}'::jsonb
);


ALTER TABLE public.subscriptions OWNER TO postgres;

--
-- Name: suppliers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.suppliers (
    id uuid NOT NULL,
    company_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    phone character varying(255),
    email character varying(255),
    gst_number character varying(255),
    address text,
    city character varying(255),
    state character varying(255),
    pincode character varying(255),
    outstanding_balance numeric(12,2) DEFAULT 0,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.suppliers OWNER TO postgres;

--
-- Name: tax_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tax_settings (
    id uuid NOT NULL,
    company_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    type public.enum_tax_settings_type NOT NULL,
    section character varying(255),
    rate numeric(5,2) NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.tax_settings OWNER TO postgres;

--
-- Name: user_companies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_companies (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    company_id bigint NOT NULL,
    role character varying(10) DEFAULT 'staff'::character varying,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT user_companies_role_check CHECK (((role)::text = ANY ((ARRAY['owner'::character varying, 'admin'::character varying, 'staff'::character varying])::text[])))
);


ALTER TABLE public.user_companies OWNER TO postgres;

--
-- Name: user_companies_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_companies_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_companies_id_seq OWNER TO postgres;

--
-- Name: user_companies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_companies_id_seq OWNED BY public.user_companies.id;


--
-- Name: usercompanies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usercompanies (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    company_id uuid NOT NULL,
    role public.enum_usercompanies_role DEFAULT 'staff'::public.enum_usercompanies_role,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.usercompanies OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    company_id uuid,
    email character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    phone character varying(255),
    role public.enum_users_role DEFAULT 'staff'::public.enum_users_role,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    password character varying(255),
    permissions json DEFAULT '{}'::json,
    is_active boolean DEFAULT true,
    email_verified boolean DEFAULT false,
    last_login timestamp with time zone
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: user_companies id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_companies ALTER COLUMN id SET DEFAULT nextval('public.user_companies_id_seq'::regclass);


--
-- Data for Name: Affiliates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Affiliates" (id, company_name, contact_person, email, mobile_no, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: Categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Categories" (id, name, description, "createdAt", "updatedAt", company_id) FROM stdin;
\.


--
-- Data for Name: Companies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Companies" (id, name, "createdAt", "updatedAt") FROM stdin;
2e741b9e-0681-493e-b5bc-44dbc6204ad0	pachu	2026-03-11 23:00:52.126+05:30	2026-03-11 23:00:52.126+05:30
33c71f0d-12fa-4413-9ce4-be7e61b1b7a0	pachu	2026-03-11 23:01:25.558+05:30	2026-03-11 23:01:25.558+05:30
16376443-c5ee-485e-b27d-16292578263b	pachu	2026-03-11 23:07:36.24+05:30	2026-03-11 23:07:36.24+05:30
9f3a83f5-eb25-467a-b4ae-67862e878431	nishu	2026-03-13 21:10:36.925+05:30	2026-03-13 21:10:36.925+05:30
3f2f84e4-2107-4597-b950-03df66d28031	abhi	2026-03-19 00:44:43.588+05:30	2026-03-19 00:45:55.924+05:30
5433a3bd-85f2-4b50-9a3e-ff2638f44b58	pachu 1	2026-03-11 23:15:44.77+05:30	2026-03-21 00:39:13.109+05:30
9844ff1b-ff21-473f-b2db-e06a0477ad63	ashu	2026-03-18 08:25:17.19+05:30	2026-03-18 08:26:57.36+05:30
8e31583d-02c7-4666-80e9-1a0d78ecc90d	ammu	2026-03-17 23:51:30.098+05:30	2026-03-18 09:05:00.398+05:30
569fbada-644c-44f9-90b8-71bece4b242e	nishu	2026-03-19 12:36:50.439+05:30	2026-03-20 13:28:30.937+05:30
1292d994-0ad6-47b3-9f94-fa1183f19835	pachu	2026-03-11 22:58:51.626+05:30	2026-03-18 17:27:41.398+05:30
\.


--
-- Data for Name: Coupons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Coupons" (id, code, is_active, "createdAt", "updatedAt", discount_type, discount_value, expiry_date, usage_limit, usage_count, company_id) FROM stdin;
8756cea3-2397-4c2b-91f7-c6b6ff18dc10	ACT101	t	2026-03-21 19:10:56.266+05:30	2026-03-21 19:10:56.266+05:30	percentage	10.00	2026-04-05 05:30:00+05:30	100	0	0c8ee53d-4f7e-4a0e-9469-b843ceb498f8
44383565-5230-405f-91d8-3a2e1e3ffbba	MYSTIC10	t	2026-03-21 21:47:50.076+05:30	2026-03-21 21:47:50.076+05:30	percentage	10.00	2026-04-04 05:30:00+05:30	100	0	c7768cf3-dd9b-47b8-82ff-865bee28ba4a
\.


--
-- Data for Name: CreditNoteItems; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CreditNoteItems" (id, credit_note_id, product_id, quantity, unit_price, tax_rate, tax_amount, total, "createdAt", "updatedAt") FROM stdin;
20752393-0e4a-4daf-8d2d-1e25f47db53c	7eeaf95e-6c87-469b-a5d0-b649dc2615fd	3e12daa5-921e-4806-9c49-cabd385880df	3.00	150.00	0.00	0.00	450.00	2026-03-20 15:30:21.288+05:30	2026-03-20 15:30:21.288+05:30
18262439-e7a8-4e0e-ae79-5d76a8993119	ff4448e8-3b72-48ed-9c81-abab563449ef	254e86ef-111c-4f9c-8159-647044b8b627	1.00	125.00	0.00	0.00	125.00	2026-03-20 15:56:41.296+05:30	2026-03-20 15:56:41.296+05:30
aa9eed93-7679-4ae2-a095-6d3224824a19	0150e753-0aaf-4558-9916-807f5b7e6634	254e86ef-111c-4f9c-8159-647044b8b627	2.00	125.00	0.00	0.00	250.00	2026-03-20 16:11:15.084+05:30	2026-03-20 16:11:15.084+05:30
\.


--
-- Data for Name: CreditNotes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CreditNotes" (id, company_id, customer_id, invoice_id, credit_note_number, date, reason, subtotal, tax_amount, total_amount, industry_metadata, "createdAt", "updatedAt") FROM stdin;
7eeaf95e-6c87-469b-a5d0-b649dc2615fd	5433a3bd-85f2-4b50-9a3e-ff2638f44b58	6f9ad643-d900-4222-90fd-9c33fb10a4ca	5471721f-c3ca-4eab-b432-8f79c1c6558b	CN-1001	2026-03-20 15:30:21.28+05:30	Damaged	450.00	0.00	450.00	{}	2026-03-20 15:30:21.281+05:30	2026-03-20 15:30:21.294+05:30
ff4448e8-3b72-48ed-9c81-abab563449ef	5433a3bd-85f2-4b50-9a3e-ff2638f44b58	6f9ad643-d900-4222-90fd-9c33fb10a4ca	e64678a9-c3ad-4adf-8836-035142e0e681	CN-1002	2026-03-20 15:56:41.292+05:30	Damaged	125.00	0.00	125.00	{}	2026-03-20 15:56:41.292+05:30	2026-03-20 15:56:41.302+05:30
0150e753-0aaf-4558-9916-807f5b7e6634	5433a3bd-85f2-4b50-9a3e-ff2638f44b58	6f9ad643-d900-4222-90fd-9c33fb10a4ca	e64678a9-c3ad-4adf-8836-035142e0e681	CN-1003	2026-03-20 16:11:15.075+05:30	Damaged	250.00	0.00	250.00	{}	2026-03-20 16:11:15.076+05:30	2026-03-20 16:11:15.091+05:30
\.


--
-- Data for Name: Customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Customers" (id, name, phone, email, gst_number, address, city, state, pincode, outstanding_balance, "createdAt", "updatedAt", company_id, wallet_balance) FROM stdin;
f99d47e2-387a-433a-83e0-17f088b206c6	ashu	8867674040	ashu@gmail.com	29bjipp0825q	shimoga	mandagadde	kar		0.00	2026-03-13 21:11:43.076+05:30	2026-03-13 21:11:43.076+05:30	9f3a83f5-eb25-467a-b4ae-67862e878431	0.00
eb880a51-38f8-4a47-9e20-d8839f06236c	ashu	8867674040	ashu@gmail.com	598255kkk	shimoga	shimoga	Karnataka		490.00	2026-03-18 00:16:33.894+05:30	2026-03-18 08:33:01.233+05:30	8e31583d-02c7-4666-80e9-1a0d78ecc90d	0.00
6f9ad643-d900-4222-90fd-9c33fb10a4ca	ashu	8867674040	ashu@gmail.com	12544jghjj	smg	shimoga	Karnataka		1275.00	2026-03-12 00:17:35.89+05:30	2026-03-20 16:11:15.097+05:30	5433a3bd-85f2-4b50-9a3e-ff2638f44b58	100.00
31612f17-0d29-4a8c-b86b-7ae2a986375c	abhi	8858754745	abhi@gmail.com	2586458725	gundlupete	mysore	Karnataka		1974.00	2026-03-20 15:26:35.535+05:30	2026-03-21 00:45:48.876+05:30	5433a3bd-85f2-4b50-9a3e-ff2638f44b58	0.00
\.


--
-- Data for Name: EWayBills; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."EWayBills" (id, company_id, invoice_id, eway_bill_number, generated_date, valid_until, transporter_name, transporter_id, vehicle_number, from_place, to_place, distance, status, details, "createdAt", "updatedAt") FROM stdin;
9cc9bb31-7969-47c5-85e2-f46c01eb0897	5433a3bd-85f2-4b50-9a3e-ff2638f44b58	\N	EW205587361233	2026-03-20 14:27:02.511+05:30	2026-03-21 14:27:02.51+05:30	vrl	123456899633	ka03h3121	bengaluru	tumkuru	50	active	\N	2026-03-20 14:27:02.511+05:30	2026-03-20 14:27:02.511+05:30
\.


--
-- Data for Name: Enquiries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Enquiries" (id, name, phone, email, business_type, message, status, "createdAt", "updatedAt") FROM stdin;
bbe34f34-07fa-4d45-9495-34e8c9781609	pachu	9986995848	\N	\N	Quick callback request from footer	pending	2026-03-21 13:29:04.191+05:30	2026-03-21 13:29:04.191+05:30
\.


--
-- Data for Name: Expenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Expenses" (id, category, amount, payment_method, date, reference_number, "createdAt", "updatedAt", company_id, description) FROM stdin;
6ca73c45-3e00-4776-aaa2-55721579ca64	Utilities	1000.00	Cash	2026-03-18 05:30:00+05:30		2026-03-18 17:07:42.856+05:30	2026-03-18 17:07:42.856+05:30	5433a3bd-85f2-4b50-9a3e-ff2638f44b58	\N
\.


--
-- Data for Name: GlobalNotifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."GlobalNotifications" (id, title, message, target_audience, sent_at) FROM stdin;
\.


--
-- Data for Name: Godowns; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Godowns" (id, company_id, name, is_active, "createdAt", "updatedAt", address, is_default) FROM stdin;
78005f7a-92fa-4809-9d1d-b88f4742832d	1292d994-0ad6-47b3-9f94-fa1183f19835	Main Store	t	2026-03-20 16:34:51.69+05:30	2026-03-20 16:34:51.69+05:30	mandagadde	t
5e3bae10-951b-4748-a1fe-1d400e626597	5433a3bd-85f2-4b50-9a3e-ff2638f44b58	Main Store	t	2026-03-20 16:34:51.709+05:30	2026-03-20 16:34:51.709+05:30	mandagadde	t
77ea7dd0-5416-4e93-91f9-cfdc7d42c820	9f3a83f5-eb25-467a-b4ae-67862e878431	Main Store	t	2026-03-20 16:34:51.728+05:30	2026-03-20 16:34:51.728+05:30	Main Office	t
3ef46da5-117f-4f92-9489-dcdc4ca8898b	33c71f0d-12fa-4413-9ce4-be7e61b1b7a0	Main Store	t	2026-03-20 16:34:51.748+05:30	2026-03-20 16:34:51.748+05:30	mandagadde	t
74996809-2e37-48a5-a45b-4cdf972ff59d	2e741b9e-0681-493e-b5bc-44dbc6204ad0	Main Store	t	2026-03-20 16:34:51.768+05:30	2026-03-20 16:34:51.768+05:30	mandagadde	t
36576397-474b-4685-98fa-329e197ed08a	8e31583d-02c7-4666-80e9-1a0d78ecc90d	Main Store	t	2026-03-20 16:34:51.789+05:30	2026-03-20 16:34:51.789+05:30	mandagadde	t
4bb25b20-4d7e-4234-a911-98ae4a3f07df	569fbada-644c-44f9-90b8-71bece4b242e	Main Store	t	2026-03-20 16:34:51.809+05:30	2026-03-20 16:34:51.809+05:30	shimoga	t
1149a102-2899-407e-b332-8c5b736f6817	16376443-c5ee-485e-b27d-16292578263b	Main Store	t	2026-03-20 16:34:51.828+05:30	2026-03-20 16:34:51.828+05:30	mandagadde	t
5f3cb3e7-b99f-4edd-8677-04619f30aaf1	3f2f84e4-2107-4597-b950-03df66d28031	Main Store	t	2026-03-20 16:34:51.847+05:30	2026-03-20 16:34:51.847+05:30	gundlupete	t
fd2a6669-2986-43a1-a91a-e62165aa664f	9844ff1b-ff21-473f-b2db-e06a0477ad63	Main Store	t	2026-03-20 16:34:51.866+05:30	2026-03-20 16:34:51.866+05:30	bengaluru	t
\.


--
-- Data for Name: InvoiceCounters; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."InvoiceCounters" (id, company_id, last_number, "createdAt", "updatedAt") FROM stdin;
47c18e92-37a0-41a8-a89e-2544beb3756b	1292d994-0ad6-47b3-9f94-fa1183f19835	1	2026-03-18 00:19:38.746+05:30	2026-03-18 00:19:38.755+05:30
33bd57f5-a1bb-4e54-b5a6-9e4221a33956	8e31583d-02c7-4666-80e9-1a0d78ecc90d	12	2026-03-17 23:59:59.805+05:30	2026-03-18 01:01:33.64+05:30
9c091010-a2ef-49c3-9b15-25c7c60ff4c2	569fbada-644c-44f9-90b8-71bece4b242e	2	2026-03-20 13:40:07.306+05:30	2026-03-20 13:40:07.338+05:30
95a7da36-f9b1-4662-932f-b28e8399da70	5433a3bd-85f2-4b50-9a3e-ff2638f44b58	49	2026-03-12 23:28:08.748+05:30	2026-03-21 00:19:56.391+05:30
\.


--
-- Data for Name: InvoiceItems; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."InvoiceItems" (id, quantity, unit_price, total, "createdAt", "updatedAt", invoice_id, product_id, description) FROM stdin;
f9d03e78-9d6a-4a24-8c4b-3046c0ffe0bb	10.00	125.00	1439.60	2026-03-18 01:01:33.73+05:30	2026-03-18 01:01:33.73+05:30	b716520d-e817-4e26-9040-1d94ca3c3f4f	f0b1d53f-5f0e-429f-82ed-659188ac8e77	\N
bd573439-6700-4a37-9767-477c26a9765b	10.00	125.00	1475.00	2026-03-19 00:06:13.515+05:30	2026-03-19 00:06:13.515+05:30	e64678a9-c3ad-4adf-8836-035142e0e681	254e86ef-111c-4f9c-8159-647044b8b627	
63fe6cc8-3abd-44b3-8a07-389bd6276587	11.00	150.00	1947.00	2026-03-20 13:48:01.493+05:30	2026-03-20 13:48:01.493+05:30	42b062e4-90a1-48f7-869f-c64d7db7c891	3e12daa5-921e-4806-9c49-cabd385880df	
fe044bf5-89bf-418f-9a68-382b92c17690	1.00	125.00	147.50	2026-03-20 13:48:01.499+05:30	2026-03-20 13:48:01.499+05:30	42b062e4-90a1-48f7-869f-c64d7db7c891	254e86ef-111c-4f9c-8159-647044b8b627	
b8220b9b-e531-4a6a-ab0d-a033b5da4743	8.00	150.00	1416.00	2026-03-20 14:00:23.751+05:30	2026-03-20 14:00:23.751+05:30	5471721f-c3ca-4eab-b432-8f79c1c6558b	3e12daa5-921e-4806-9c49-cabd385880df	
0fd34d3e-7d44-43b8-a14b-daacddd4516e	3.50	125.00	516.25	2026-03-20 14:00:23.756+05:30	2026-03-20 14:00:23.756+05:30	5471721f-c3ca-4eab-b432-8f79c1c6558b	254e86ef-111c-4f9c-8159-647044b8b627	
25e44bbe-d45e-4c09-8ee0-29c66d30ec86	1.99	150.00	352.23	2026-03-20 21:13:52.585+05:30	2026-03-20 21:13:52.585+05:30	da0a616d-6689-40a3-ba40-eb2d90514aa1	d22a008b-70ee-4ee0-8f1f-1f730f3a4c10	
9e828109-1add-4348-80f6-4afa579d38a4	1.00	150.00	177.00	2026-03-20 21:59:00.83+05:30	2026-03-20 21:59:00.83+05:30	6586218a-75af-407a-b377-8fddb0a65463	d22a008b-70ee-4ee0-8f1f-1f730f3a4c10	
a93d3fbe-1cdb-4987-b9da-5a2aa901e5af	1.00	150.00	177.00	2026-03-20 22:19:36.425+05:30	2026-03-20 22:19:36.425+05:30	ef1a5ad3-8f94-4259-90fb-ca021d7efa04	d22a008b-70ee-4ee0-8f1f-1f730f3a4c10	
ab824174-7c2b-4bbc-87ec-4cd33878db96	9.99	150.00	1768.23	2026-03-21 00:19:56.417+05:30	2026-03-21 00:19:56.417+05:30	41128b8d-e481-4ebd-a06f-5279e90485de	d22a008b-70ee-4ee0-8f1f-1f730f3a4c10	
\.


--
-- Data for Name: Invoices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Invoices" (id, total_amount, "createdAt", "updatedAt", company_id) FROM stdin;
b716520d-e817-4e26-9040-1d94ca3c3f4f	1440.00	2026-03-18 01:01:33.72+05:30	2026-03-18 08:33:01.229+05:30	8e31583d-02c7-4666-80e9-1a0d78ecc90d
42b062e4-90a1-48f7-869f-c64d7db7c891	1885.00	2026-03-20 13:48:01.485+05:30	2026-03-20 15:24:28.391+05:30	5433a3bd-85f2-4b50-9a3e-ff2638f44b58
5471721f-c3ca-4eab-b432-8f79c1c6558b	1836.00	2026-03-20 14:00:23.745+05:30	2026-03-20 15:30:21.297+05:30	5433a3bd-85f2-4b50-9a3e-ff2638f44b58
e64678a9-c3ad-4adf-8836-035142e0e681	1475.00	2026-03-18 16:55:13.839+05:30	2026-03-20 16:11:15.094+05:30	5433a3bd-85f2-4b50-9a3e-ff2638f44b58
da0a616d-6689-40a3-ba40-eb2d90514aa1	352.00	2026-03-20 21:13:52.578+05:30	2026-03-20 21:13:52.578+05:30	5433a3bd-85f2-4b50-9a3e-ff2638f44b58
6586218a-75af-407a-b377-8fddb0a65463	177.00	2026-03-20 21:59:00.82+05:30	2026-03-20 21:59:00.82+05:30	5433a3bd-85f2-4b50-9a3e-ff2638f44b58
ef1a5ad3-8f94-4259-90fb-ca021d7efa04	177.00	2026-03-20 22:19:36.41+05:30	2026-03-20 22:19:36.41+05:30	5433a3bd-85f2-4b50-9a3e-ff2638f44b58
41128b8d-e481-4ebd-a06f-5279e90485de	1768.00	2026-03-21 00:19:56.403+05:30	2026-03-21 00:45:48.872+05:30	5433a3bd-85f2-4b50-9a3e-ff2638f44b58
\.


--
-- Data for Name: Payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Payments" (id, payment_type, amount, payment_method, payment_date, reference_number, notes, "createdAt", "updatedAt", company_id, customer_id, supplier_id, invoice_id, purchase_id) FROM stdin;
579b4fc1-0881-4f33-a3f7-79d7eff27a23	received	950.00	UPI/GPay	2026-03-18 05:30:00+05:30			2026-03-18 08:33:01.224+05:30	2026-03-18 08:33:01.224+05:30	8e31583d-02c7-4666-80e9-1a0d78ecc90d	eb880a51-38f8-4a47-9e20-d8839f06236c	\N	b716520d-e817-4e26-9040-1d94ca3c3f4f	\N
1709b7e8-bd4a-4ec0-9a8e-408fd3527a2c	received	1000.00	Cash	2026-03-18 05:30:00+05:30			2026-03-18 16:56:10.03+05:30	2026-03-18 16:56:10.03+05:30	5433a3bd-85f2-4b50-9a3e-ff2638f44b58	6f9ad643-d900-4222-90fd-9c33fb10a4ca	\N	e64678a9-c3ad-4adf-8836-035142e0e681	\N
3123fb2b-5550-48b1-8111-5178878d5057	received	200.00	Cash	2026-03-18 05:30:00+05:30			2026-03-18 18:02:42.134+05:30	2026-03-18 18:02:42.134+05:30	5433a3bd-85f2-4b50-9a3e-ff2638f44b58	6f9ad643-d900-4222-90fd-9c33fb10a4ca	\N	e64678a9-c3ad-4adf-8836-035142e0e681	\N
f7b7a91c-317b-4c35-a98a-5cfef34f68f4	made	10000.00	Cash	2026-03-18 23:48:25.219+05:30			2026-03-18 23:48:25.22+05:30	2026-03-18 23:48:25.22+05:30	5433a3bd-85f2-4b50-9a3e-ff2638f44b58	\N	bd03676c-b36a-4d6e-9b9f-5bccc2a65d05	\N	c6b98f98-6a93-4e34-ac66-8ffd3f8891e0
f334c268-cf2d-43bd-88d2-833208e036b0	received	736.00	Cash	2026-03-20 05:30:00+05:30			2026-03-20 15:24:12.723+05:30	2026-03-20 15:24:12.723+05:30	5433a3bd-85f2-4b50-9a3e-ff2638f44b58	6f9ad643-d900-4222-90fd-9c33fb10a4ca	\N	5471721f-c3ca-4eab-b432-8f79c1c6558b	\N
5ec169ca-2925-42d3-a65f-76af43707a2b	received	1885.00	Cash	2026-03-20 05:30:00+05:30			2026-03-20 15:24:28.387+05:30	2026-03-20 15:24:28.387+05:30	5433a3bd-85f2-4b50-9a3e-ff2638f44b58	6f9ad643-d900-4222-90fd-9c33fb10a4ca	\N	42b062e4-90a1-48f7-869f-c64d7db7c891	\N
1a42ef03-f3cb-4b6f-9d9e-8241149ac19d	made	354.00	Cash	2026-03-20 15:25:06.896+05:30			2026-03-20 15:25:06.897+05:30	2026-03-20 15:25:06.897+05:30	5433a3bd-85f2-4b50-9a3e-ff2638f44b58	\N	bd03676c-b36a-4d6e-9b9f-5bccc2a65d05	\N	127af42c-cdcf-4588-b37b-0234316b48b0
b024c787-6ae1-4c1e-8172-cba393005159	received	100.00	Cash	2026-03-20 05:30:00+05:30			2026-03-20 15:29:36.113+05:30	2026-03-20 15:29:36.113+05:30	5433a3bd-85f2-4b50-9a3e-ff2638f44b58	6f9ad643-d900-4222-90fd-9c33fb10a4ca	\N	5471721f-c3ca-4eab-b432-8f79c1c6558b	\N
c42a8716-b176-43cd-a3ba-4af14296549a	received	500.00	Cash	2026-03-20 05:30:00+05:30			2026-03-21 00:45:48.86+05:30	2026-03-21 00:45:48.86+05:30	5433a3bd-85f2-4b50-9a3e-ff2638f44b58	31612f17-0d29-4a8c-b86b-7ae2a986375c	\N	41128b8d-e481-4ebd-a06f-5279e90485de	\N
\.


--
-- Data for Name: PlatformExpenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PlatformExpenses" (id, category, amount, date, description) FROM stdin;
\.


--
-- Data for Name: Products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Products" (id, name, sku, hsn_code, unit, gst_rate, purchase_price, sale_price, stock_quantity, low_stock_alert, barcode, description, "createdAt", "updatedAt", company_id, category_id, type) FROM stdin;
f0b1d53f-5f0e-429f-82ed-659188ac8e77	oil		1001	l	18.00	100.00	125.00	990.00	10.00			2026-03-18 00:17:46.226+05:30	2026-03-18 01:01:33.737+05:30	8e31583d-02c7-4666-80e9-1a0d78ecc90d	\N	product
672f18e4-2cc2-487d-ad4a-a3808fd15160	Test Product 1773806472380	\N	\N	pcs	18.00	100.00	150.00	10.00	10.00	\N	\N	2026-03-18 09:31:12.383+05:30	2026-03-18 09:31:12.383+05:30	1292d994-0ad6-47b3-9f94-fa1183f19835	\N	product
d0591d00-928f-4328-b12f-4d9a4c451856	Real Test Product	SKU1773806812297	1234	pcs	18.00	100.50	150.75	5.00	2.00	BAR1773806812297	Test	2026-03-18 09:36:52.302+05:30	2026-03-18 09:36:52.302+05:30	1292d994-0ad6-47b3-9f94-fa1183f19835	\N	product
8f3a5c70-5b36-470a-9f25-7fe4befb03a1	filters		100	pcs	18.00	250.00	300.00	15.00	2.00			2026-03-20 15:27:54.16+05:30	2026-03-20 15:27:54.16+05:30	5433a3bd-85f2-4b50-9a3e-ff2638f44b58	\N	product
254e86ef-111c-4f9c-8159-647044b8b627	oil		1001	l	18.00	100.00	125.00	188.50	10.00			2026-03-12 21:11:32.717+05:30	2026-03-20 16:11:15.089+05:30	5433a3bd-85f2-4b50-9a3e-ff2638f44b58	\N	product
3e12daa5-921e-4806-9c49-cabd385880df	blu pen			pcs	18.00	100.00	150.00	-13.00	10.00			2026-03-18 22:58:35.531+05:30	2026-03-20 21:12:28.241+05:30	5433a3bd-85f2-4b50-9a3e-ff2638f44b58	\N	product
d22a008b-70ee-4ee0-8f1f-1f730f3a4c10	blue pen			pcs	18.00	100.00	150.00	136.02	10.00			2026-03-20 21:13:17.668+05:30	2026-03-21 00:19:56.422+05:30	5433a3bd-85f2-4b50-9a3e-ff2638f44b58	\N	product
\.


--
-- Data for Name: PurchaseItems; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PurchaseItems" (id, quantity, unit_price, total, "createdAt", "updatedAt", purchase_id, product_id, tax_rate, tax_amount) FROM stdin;
e18d09e3-2d7d-4d92-be0a-9ae3df11cede	100.00	100.00	11800.00	2026-03-18 17:06:28.549+05:30	2026-03-18 17:06:28.549+05:30	c6b98f98-6a93-4e34-ac66-8ffd3f8891e0	254e86ef-111c-4f9c-8159-647044b8b627	18.00	1800.00
6d85f6fa-4ed8-4b9a-9474-be80d60fccf2	3.00	100.00	354.00	2026-03-18 22:59:00.541+05:30	2026-03-18 22:59:00.541+05:30	127af42c-cdcf-4588-b37b-0234316b48b0	3e12daa5-921e-4806-9c49-cabd385880df	18.00	54.00
\.


--
-- Data for Name: Purchases; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Purchases" (id, bill_number, bill_date, tax_amount, total_amount, paid_amount, payment_status, notes, status, "createdAt", "updatedAt", company_id, supplier_id, due_date, subtotal, discount_amount, godown_id) FROM stdin;
e773ef1e-9aaa-45ee-bba8-c84872fbdfb9	TEST-1773807475047	2026-03-18 05:30:00+05:30	18.00	118.00	0.00	unpaid		received	2026-03-18 09:47:55.051+05:30	2026-03-18 09:47:55.051+05:30	1292d994-0ad6-47b3-9f94-fa1183f19835	07fe68cc-cf62-4c2f-a8b0-d2e0ba684b95	\N	100.00	0.00	\N
c6b98f98-6a93-4e34-ac66-8ffd3f8891e0	0012	2026-03-18 05:30:00+05:30	1800.00	11800.00	10000.00	partial		received	2026-03-18 17:06:28.538+05:30	2026-03-18 23:48:25.228+05:30	5433a3bd-85f2-4b50-9a3e-ff2638f44b58	bd03676c-b36a-4d6e-9b9f-5bccc2a65d05	2026-03-28 05:30:00+05:30	10000.00	0.00	\N
127af42c-cdcf-4588-b37b-0234316b48b0	012	2026-03-18 05:30:00+05:30	54.00	354.00	354.00	paid		received	2026-03-18 22:59:00.537+05:30	2026-03-20 15:25:06.9+05:30	5433a3bd-85f2-4b50-9a3e-ff2638f44b58	bd03676c-b36a-4d6e-9b9f-5bccc2a65d05	\N	300.00	0.00	\N
\.


--
-- Data for Name: QuotationCounters; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."QuotationCounters" (id, company_id, last_number, "createdAt", "updatedAt") FROM stdin;
15b2bafb-c5e2-456b-ba17-2518b7fe7e27	5433a3bd-85f2-4b50-9a3e-ff2638f44b58	2	2026-03-20 15:28:14.323+05:30	2026-03-20 15:28:14.347+05:30
\.


--
-- Data for Name: QuotationItems; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."QuotationItems" (id, quotation_id, product_id, quantity, unit_price, tax_rate, tax_amount, total, description, "createdAt", "updatedAt") FROM stdin;
9290d27a-2292-4947-b1a1-c865b6ad3878	ae9bac8f-2bb8-4a5f-a709-9ea277ae7114	8f3a5c70-5b36-470a-9f25-7fe4befb03a1	1.00	300.00	18.00	54.00	354.00		2026-03-20 15:28:29.144+05:30	2026-03-20 15:28:29.144+05:30
\.


--
-- Data for Name: Quotations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Quotations" (id, company_id, customer_id, godown_id, quotation_number, quotation_date, valid_until, subtotal, tax_amount, discount_amount, total_amount, status, notes, terms, "createdAt", "updatedAt", industry_metadata) FROM stdin;
ae9bac8f-2bb8-4a5f-a709-9ea277ae7114	5433a3bd-85f2-4b50-9a3e-ff2638f44b58	31612f17-0d29-4a8c-b86b-7ae2a986375c	\N	QTN-2	2026-03-20 05:30:00+05:30	\N	300.00	54.00	0.00	354.00	draft			2026-03-20 15:28:29.139+05:30	2026-03-20 15:28:29.146+05:30	{}
\.


--
-- Data for Name: Staff; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Staff" (id, company_id, name, phone, role, salary, is_active, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: StaffAttendance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."StaffAttendance" (id, staff_id, date, status, notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: StockLevels; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."StockLevels" (id, company_id, product_id, godown_id, quantity, "createdAt", "updatedAt") FROM stdin;
5658ae7f-1844-4e02-8e54-475aa92fff59	5433a3bd-85f2-4b50-9a3e-ff2638f44b58	d22a008b-70ee-4ee0-8f1f-1f730f3a4c10	5e3bae10-951b-4748-a1fe-1d400e626597	136.02	2026-03-20 21:13:17.679+05:30	2026-03-21 00:19:56.425+05:30
\.


--
-- Data for Name: StockMovements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."StockMovements" (id, type, quantity, previous_stock, new_stock, reference_type, reference_id, notes, "createdAt", "updatedAt", company_id, product_id, godown_id) FROM stdin;
7a43c6c2-8a7f-453e-9f34-8bf935893656	in	100.00	0.00	100.00	opening	\N	Opening stock	2026-03-12 21:11:32.731+05:30	2026-03-12 21:11:32.731+05:30	5433a3bd-85f2-4b50-9a3e-ff2638f44b58	254e86ef-111c-4f9c-8159-647044b8b627	\N
e0e63c52-369d-4dc0-b4de-b41e06d70628	in	1000.00	0.00	1000.00	opening	\N	Opening stock	2026-03-18 00:17:46.296+05:30	2026-03-18 00:17:46.296+05:30	8e31583d-02c7-4666-80e9-1a0d78ecc90d	f0b1d53f-5f0e-429f-82ed-659188ac8e77	\N
49f0da71-f35e-4ab1-8586-0e7d3b0df93c	in	5.00	0.00	5.00	opening	\N	Opening stock	2026-03-18 09:36:52.515+05:30	2026-03-18 09:36:52.515+05:30	1292d994-0ad6-47b3-9f94-fa1183f19835	d0591d00-928f-4328-b12f-4d9a4c451856	\N
444c813e-600f-4467-9c88-4cfd76f7f032	in	100.00	90.00	190.00	purchase	c6b98f98-6a93-4e34-ac66-8ffd3f8891e0	\N	2026-03-18 17:06:28.556+05:30	2026-03-18 17:06:28.556+05:30	5433a3bd-85f2-4b50-9a3e-ff2638f44b58	254e86ef-111c-4f9c-8159-647044b8b627	\N
dc243fbc-de2d-4b1b-8a08-cc23da8f1919	in	3.00	0.00	3.00	purchase	127af42c-cdcf-4588-b37b-0234316b48b0	\N	2026-03-18 22:59:00.548+05:30	2026-03-18 22:59:00.548+05:30	5433a3bd-85f2-4b50-9a3e-ff2638f44b58	3e12daa5-921e-4806-9c49-cabd385880df	\N
06ff781a-1fce-4ac8-92d1-8284bd6c6b1c	in	15.00	0.00	15.00	opening	\N	Opening stock	2026-03-20 15:27:54.169+05:30	2026-03-20 15:27:54.169+05:30	5433a3bd-85f2-4b50-9a3e-ff2638f44b58	8f3a5c70-5b36-470a-9f25-7fe4befb03a1	\N
9b37ef56-bacf-465f-9427-6785b1e905da	in	150.00	0.00	150.00	opening	\N	Opening stock	2026-03-20 21:13:17.682+05:30	2026-03-20 21:13:17.682+05:30	5433a3bd-85f2-4b50-9a3e-ff2638f44b58	d22a008b-70ee-4ee0-8f1f-1f730f3a4c10	5e3bae10-951b-4748-a1fe-1d400e626597
ef3a562a-b035-4c08-84d6-57bcafc46dd6	out	1.99	0.00	0.00	invoice	da0a616d-6689-40a3-ba40-eb2d90514aa1	Invoice #ASH-42	2026-03-20 21:13:52.592+05:30	2026-03-20 21:13:52.592+05:30	5433a3bd-85f2-4b50-9a3e-ff2638f44b58	d22a008b-70ee-4ee0-8f1f-1f730f3a4c10	5e3bae10-951b-4748-a1fe-1d400e626597
882fc96e-12bb-4f36-9e1d-20fe73db5ea1	out	1.00	0.00	0.00	invoice	6586218a-75af-407a-b377-8fddb0a65463	Invoice #ASH-47	2026-03-20 21:59:00.839+05:30	2026-03-20 21:59:00.839+05:30	5433a3bd-85f2-4b50-9a3e-ff2638f44b58	d22a008b-70ee-4ee0-8f1f-1f730f3a4c10	5e3bae10-951b-4748-a1fe-1d400e626597
278c0ceb-9ddc-4263-b6cc-541c10729669	out	1.00	0.00	0.00	invoice	ef1a5ad3-8f94-4259-90fb-ca021d7efa04	Invoice #ASH-48	2026-03-20 22:19:36.437+05:30	2026-03-20 22:19:36.437+05:30	5433a3bd-85f2-4b50-9a3e-ff2638f44b58	d22a008b-70ee-4ee0-8f1f-1f730f3a4c10	5e3bae10-951b-4748-a1fe-1d400e626597
6be9bccc-1076-4d65-8ac4-69240d624971	out	9.99	0.00	0.00	invoice	41128b8d-e481-4ebd-a06f-5279e90485de	Invoice #ASH-49	2026-03-21 00:19:56.427+05:30	2026-03-21 00:19:56.427+05:30	5433a3bd-85f2-4b50-9a3e-ff2638f44b58	d22a008b-70ee-4ee0-8f1f-1f730f3a4c10	5e3bae10-951b-4748-a1fe-1d400e626597
\.


--
-- Data for Name: Subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Subscriptions" (id, start_date, expiry_date, status, payment_status, "createdAt", "updatedAt", company_id, plan_id, coupon_id, price) FROM stdin;
1d782b5a-c3ad-46db-a051-58639a245038	2026-03-19 15:25:11.873+05:30	2026-04-19 15:25:11.873+05:30	active	paid	2026-03-19 15:21:23.407+05:30	2026-03-20 21:13:17.675+05:30	5433a3bd-85f2-4b50-9a3e-ff2638f44b58	3ba0a4d0-6a61-40ea-99d5-e526a9949218	\N	0.00
b0def5aa-25ea-444c-b6bc-846c91d439be	2026-03-19 15:21:23.388+05:30	2036-03-19 15:21:23.388+05:30	active	paid	2026-03-19 15:21:23.389+05:30	2026-03-20 12:50:39.393+05:30	2e741b9e-0681-493e-b5bc-44dbc6204ad0	3ba0a4d0-6a61-40ea-99d5-e526a9949218	\N	0.00
a096c1af-4d13-4aaf-abe6-9ce411dc26a5	2026-03-19 15:21:23.397+05:30	2036-03-19 15:21:23.397+05:30	active	paid	2026-03-19 15:21:23.397+05:30	2026-03-20 12:50:39.393+05:30	33c71f0d-12fa-4413-9ce4-be7e61b1b7a0	3ba0a4d0-6a61-40ea-99d5-e526a9949218	\N	0.00
32e31e25-0c14-4222-b6f3-8ca2d624e031	2026-03-19 15:21:23.4+05:30	2036-03-19 15:21:23.4+05:30	active	paid	2026-03-19 15:21:23.401+05:30	2026-03-20 12:50:39.393+05:30	16376443-c5ee-485e-b27d-16292578263b	3ba0a4d0-6a61-40ea-99d5-e526a9949218	\N	0.00
3a1d10ff-67f0-4107-82f0-ad69cb9eacd1	2026-03-19 15:21:23.404+05:30	2036-03-19 15:21:23.404+05:30	active	paid	2026-03-19 15:21:23.404+05:30	2026-03-20 12:50:39.393+05:30	9f3a83f5-eb25-467a-b4ae-67862e878431	3ba0a4d0-6a61-40ea-99d5-e526a9949218	\N	0.00
efe7153c-2eea-4068-b4c8-f44526dab9b6	2026-03-19 15:21:23.41+05:30	2036-03-19 15:21:23.41+05:30	active	paid	2026-03-19 15:21:23.41+05:30	2026-03-20 12:50:39.393+05:30	3f2f84e4-2107-4597-b950-03df66d28031	3ba0a4d0-6a61-40ea-99d5-e526a9949218	\N	0.00
62dc85ac-3fe4-4a34-a619-d05487c73498	2026-03-19 15:21:23.413+05:30	2036-03-19 15:21:23.413+05:30	active	paid	2026-03-19 15:21:23.413+05:30	2026-03-20 12:50:39.393+05:30	569fbada-644c-44f9-90b8-71bece4b242e	3ba0a4d0-6a61-40ea-99d5-e526a9949218	\N	0.00
0d37d962-034f-4826-b55f-ac2078366e09	2026-03-19 15:21:23.416+05:30	2036-03-19 15:21:23.416+05:30	active	paid	2026-03-19 15:21:23.416+05:30	2026-03-20 12:50:39.393+05:30	9844ff1b-ff21-473f-b2db-e06a0477ad63	3ba0a4d0-6a61-40ea-99d5-e526a9949218	\N	0.00
a0b6f23b-31e1-48a4-bd9b-96d844866cde	2026-03-19 15:21:23.419+05:30	2036-03-19 15:21:23.419+05:30	active	paid	2026-03-19 15:21:23.419+05:30	2026-03-20 12:50:39.393+05:30	8e31583d-02c7-4666-80e9-1a0d78ecc90d	3ba0a4d0-6a61-40ea-99d5-e526a9949218	\N	0.00
e4832574-7d97-4c5e-bd08-a7495bd07283	2026-03-19 15:21:23.422+05:30	2036-03-19 15:21:23.422+05:30	active	paid	2026-03-19 15:21:23.422+05:30	2026-03-20 12:50:39.393+05:30	1292d994-0ad6-47b3-9f94-fa1183f19835	3ba0a4d0-6a61-40ea-99d5-e526a9949218	\N	0.00
\.


--
-- Data for Name: Suppliers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Suppliers" (id, name, phone, email, gst_number, address, city, state, pincode, outstanding_balance, "createdAt", "updatedAt", company_id) FROM stdin;
07fe68cc-cf62-4c2f-a8b0-d2e0ba684b95	pammu	9686887827	pammu@gmail.com	54852kjjhgb	shimoga	shimoga	Karnataka		0.00	2026-03-18 00:17:11.998+05:30	2026-03-18 00:17:11.998+05:30	8e31583d-02c7-4666-80e9-1a0d78ecc90d
bd03676c-b36a-4d6e-9b9f-5bccc2a65d05	pammu	9686887827	pammu@gmail.com	58964785nnmm	shimoga	shimoga	Karnataka		1800.00	2026-03-18 16:54:08.958+05:30	2026-03-20 15:25:06.903+05:30	5433a3bd-85f2-4b50-9a3e-ff2638f44b58
b8f99ece-4717-4a56-8ebb-eb753d751200	shanthamma	96324568548	shanthamma@gmail.com	85795475522	shimoga	mandagadde	Karnataka		0.00	2026-03-20 15:27:14.463+05:30	2026-03-20 15:27:14.463+05:30	5433a3bd-85f2-4b50-9a3e-ff2638f44b58
\.


--
-- Data for Name: UserCompanies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."UserCompanies" (id, user_id, company_id, role, "createdAt", "updatedAt") FROM stdin;
7b11d87a-0c7b-446e-8508-0bd0abe3224c	e24c9f85-5dbe-4f5b-aee9-2c43f340d2dc	569fbada-644c-44f9-90b8-71bece4b242e	owner	2026-03-19 12:36:50.444+05:30	2026-03-19 12:36:50.444+05:30
afc304a8-d016-4884-8e79-b59c2b87dc00	00c000c3-418a-4895-8fd3-45fac7dd7d81	1292d994-0ad6-47b3-9f94-fa1183f19835	owner	2026-03-19 12:49:31.031+05:30	2026-03-19 12:49:31.031+05:30
a82b34fa-1ad2-4ba9-8bdb-7df09112ba8f	34cb785f-fb41-4085-a2e4-fbdc971198e7	33c71f0d-12fa-4413-9ce4-be7e61b1b7a0	owner	2026-03-19 12:49:31.046+05:30	2026-03-19 12:49:31.046+05:30
41c592f3-79b7-4071-8976-e4765baffcdf	4e0a03b4-9024-4059-93de-05e4a2f61c76	2e741b9e-0681-493e-b5bc-44dbc6204ad0	owner	2026-03-19 12:49:31.052+05:30	2026-03-19 12:49:31.052+05:30
7e26f305-ad68-4569-9fcc-0726509191c9	6f83cae7-bab8-4523-a3c5-9d47cbc0af03	16376443-c5ee-485e-b27d-16292578263b	owner	2026-03-19 12:49:31.058+05:30	2026-03-19 12:49:31.058+05:30
3675c6f6-27f6-444e-981e-0f3ee096784f	2bac85f7-675d-4a57-b7a3-7bec7854c608	3f2f84e4-2107-4597-b950-03df66d28031	owner	2026-03-19 12:49:31.065+05:30	2026-03-19 12:49:31.065+05:30
1b3b73b1-18ba-4bf5-a265-e25b99b5b141	e24c9f85-5dbe-4f5b-aee9-2c43f340d2dc	5433a3bd-85f2-4b50-9a3e-ff2638f44b58	owner	2026-03-19 12:49:31.071+05:30	2026-03-19 12:49:31.071+05:30
cd446a87-6d69-4e47-bbd4-93d82f29c24b	cc00de4e-6678-40a6-bd1e-82ee1c050a87	5433a3bd-85f2-4b50-9a3e-ff2638f44b58	staff	2026-03-19 12:49:31.077+05:30	2026-03-19 12:49:31.077+05:30
c5ea4bdb-4d9c-4073-8d49-3d2d26172794	739f32f7-988a-4337-909c-d1f238a486fe	9f3a83f5-eb25-467a-b4ae-67862e878431	owner	2026-03-19 12:49:31.083+05:30	2026-03-19 12:49:31.083+05:30
c46a5f79-5956-40b4-9af2-f48a01e77406	7e474373-165d-4a7a-97a0-25179e8dbdd3	9844ff1b-ff21-473f-b2db-e06a0477ad63	owner	2026-03-19 12:49:31.088+05:30	2026-03-19 12:49:31.088+05:30
84fdaa07-8c37-4d5c-a941-e1bb0e1a08ad	4db3fa9c-2e0d-4798-a3ef-20568f975501	9844ff1b-ff21-473f-b2db-e06a0477ad63	staff	2026-03-19 12:49:31.094+05:30	2026-03-19 12:49:31.094+05:30
2f0f84a2-e082-4ebb-8f8b-1c33777a4fd7	e695ccf0-c5a4-4880-b579-6d5fe24bba93	8e31583d-02c7-4666-80e9-1a0d78ecc90d	owner	2026-03-19 12:49:31.099+05:30	2026-03-19 12:49:31.099+05:30
\.


--
-- Data for Name: Users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Users" (id, email, name, phone, "createdAt", "updatedAt", company_id, role) FROM stdin;
00c000c3-418a-4895-8fd3-45fac7dd7d81	pachu.mgd@gmail.com	pachu	08867674040	2026-03-11 22:58:51.802+05:30	2026-03-11 23:00:02.575+05:30	1292d994-0ad6-47b3-9f94-fa1183f19835	staff
34cb785f-fb41-4085-a2e4-fbdc971198e7	ashu143@gmail.com	pachu	08867674040	2026-03-11 23:01:25.706+05:30	2026-03-11 23:01:25.706+05:30	33c71f0d-12fa-4413-9ce4-be7e61b1b7a0	staff
4e0a03b4-9024-4059-93de-05e4a2f61c76	ashu@gmail.com	pachu	08867674040	2026-03-11 23:00:52.275+05:30	2026-03-11 23:07:00.704+05:30	2e741b9e-0681-493e-b5bc-44dbc6204ad0	staff
6f83cae7-bab8-4523-a3c5-9d47cbc0af03	pachu11@gmail.com	pachu	08867674040	2026-03-11 23:07:36.388+05:30	2026-03-11 23:07:36.388+05:30	16376443-c5ee-485e-b27d-16292578263b	staff
2bac85f7-675d-4a57-b7a3-7bec7854c608	abhi@gmail.com	abhi	9480777223	2026-03-19 00:44:43.757+05:30	2026-03-19 10:56:40.314+05:30	3f2f84e4-2107-4597-b950-03df66d28031	staff
e24c9f85-5dbe-4f5b-aee9-2c43f340d2dc	pachu143@gmail.com	nishan	08867674040	2026-03-11 23:15:44.946+05:30	2026-03-21 13:13:41.571+05:30	5433a3bd-85f2-4b50-9a3e-ff2638f44b58	staff
cc00de4e-6678-40a6-bd1e-82ee1c050a87	advita@gmail.com	ashu		2026-03-16 23:26:06.465+05:30	2026-03-16 23:26:06.465+05:30	5433a3bd-85f2-4b50-9a3e-ff2638f44b58	staff
739f32f7-988a-4337-909c-d1f238a486fe	nishu@gmail.com	nishu	1234567891	2026-03-13 21:10:37.08+05:30	2026-03-17 23:40:35.726+05:30	9f3a83f5-eb25-467a-b4ae-67862e878431	staff
7e474373-165d-4a7a-97a0-25179e8dbdd3	ammu@gmail.com	ashwini	8867674040	2026-03-18 08:25:17.526+05:30	2026-03-18 08:25:17.526+05:30	9844ff1b-ff21-473f-b2db-e06a0477ad63	staff
4db3fa9c-2e0d-4798-a3ef-20568f975501	pachu.smg@gmail.com	ashwini	8867674040	2026-03-18 08:28:13.758+05:30	2026-03-18 08:30:24.282+05:30	9844ff1b-ff21-473f-b2db-e06a0477ad63	staff
e695ccf0-c5a4-4880-b579-6d5fe24bba93	pachu@gmail.com	pachu	9986995848	2026-03-17 23:51:30.401+05:30	2026-03-18 08:32:24.194+05:30	8e31583d-02c7-4666-80e9-1a0d78ecc90d	staff
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, company_id, name, description, created_at, updated_at) FROM stdin;
ac945ca9-13e6-4909-a9d2-0ac0ece3aeaa	a31dbdf5-814f-42c8-a1cf-91ad4fbbd909	oils and filters	\N	2026-03-24 21:08:44.516+05:30	2026-03-24 21:08:44.516+05:30
\.


--
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.companies (id, name, created_at, updated_at, gst_number, address, city, state, pincode, phone, email, logo, signature, tagline, business_category, invoice_prefix, currency, financial_year_start, bank_name, account_number, ifsc_code, branch_name, qr_code, terms_conditions, gst_registered, enable_tds, enable_tcs, settings, invoice_business_category, invoice_column_labels, invoice_column_toggles, invoice_header_color, invoice_menu_color, invoice_text_size) FROM stdin;
25d5f6b0-fa9f-4111-a01e-dd8f0d1d74ba	ASHU	2026-03-22 20:55:11.526+05:30	2026-03-22 20:56:33.508+05:30	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	General Store	INV	INR	4	\N	\N	\N	\N	\N	\N	f	f	f	{"invoice_template":"modern"}	generic	{}	{}	#1D70B8	#FFFFFF	10pt
aec31e73-cc63-40b3-97bd-db95dc4cd9b2	pachu	2026-03-22 22:45:00.191+05:30	2026-03-22 22:45:00.191+05:30		shimoga	shimoga	karnataka	577101	9986995848	pachu@gmail.com	\N	\N	\N	General Store	INV	INR	4	\N	\N	\N	\N	\N	\N	f	f	f	{"invoice_template":"modern"}	generic	{}	{}	#1D70B8	#FFFFFF	10pt
94161a36-7c24-4d3b-a0b8-dd5f0cb7ccb1	ammu	2026-03-23 09:59:21.282+05:30	2026-03-23 09:59:21.282+05:30		bangaore	bangalore	karnataka	570001	98765643210	ammu@gmail.com	\N	\N	\N	General Store	INV	INR	4	\N	\N	\N	\N	\N	\N	f	f	f	{"invoice_template":"modern"}	generic	{}	{}	#1D70B8	#FFFFFF	10pt
a31dbdf5-814f-42c8-a1cf-91ad4fbbd909	ashu	2026-03-22 21:17:15.121+05:30	2026-03-24 21:55:33.486+05:30	`		\N	\N	\N	\N	ashu@gmail.com	/company/logos/logo_1774194786916.jpeg	/company/signatures/signature_1774194794951.jpeg	\N	General Store	INV	INR	4	hdfc bank	123456789987654	hdfc0000123	shimoga	/company/qrcodes/qrcode_1774369533482.jpeg	goods and stocks	t	t	t	{"invoice_template":"modern"}	distribution	{"f1": "Item Description", "f2": "HSN/SAC", "f3": "Batch/Lot #", "f4": "Rate", "f5": "GST", "f6": "Discount"}	{"showF1": true, "showF2": true, "showF3": true, "showF4": true, "showF5": true, "showF6": true}	#1D70B8	#FFFFFF	9pt
\.


--
-- Data for Name: coupons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.coupons (id, code, discount_type, discount_value, expiry_date, usage_limit, usage_count, affiliate_id, is_active, created_at, updated_at) FROM stdin;
4b31ae57-2993-47b5-b8e1-eedaad540e55	MI100	percentage	10.00	2026-04-05 05:30:00+05:30	100	1	c7768cf3-dd9b-47b8-82ff-865bee28ba4a	t	2026-03-22 21:05:12.533+05:30	2026-03-22 21:18:31.013+05:30
598ff6d8-e9c3-4232-aa00-59f55db1d9c3	MYSTIC100	percentage	100.00	2026-03-29 05:30:00+05:30	2	1	c7768cf3-dd9b-47b8-82ff-865bee28ba4a	t	2026-03-22 21:19:20.716+05:30	2026-03-22 21:19:35.158+05:30
\.


--
-- Data for Name: creditnoteitems; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.creditnoteitems (id, credit_note_id, product_id, quantity, unit_price, tax_rate, tax_amount, total, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: creditnotes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.creditnotes (id, company_id, customer_id, invoice_id, credit_note_number, date, reason, subtotal, tax_amount, total_amount, industry_metadata, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customers (id, company_id, name, phone, email, gst_number, address, city, state, pincode, outstanding_balance, wallet_balance, created_at, updated_at) FROM stdin;
3141f771-cce9-4703-8b9f-7f4fe233db09	a31dbdf5-814f-42c8-a1cf-91ad4fbbd909	nivi	7896584855	nivi@gmail.com		mandagdde	shimoga	karnataka		1812.00	0.00	2026-03-22 21:22:00.607+05:30	2026-03-24 19:28:07.589+05:30
\.


--
-- Data for Name: enquiries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.enquiries (id, name, phone, email, business_type, message, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: ewaybills; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ewaybills (id, company_id, invoice_id, eway_bill_number, generated_date, valid_until, transporter_name, transporter_id, vehicle_number, from_place, to_place, distance, status, details, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.expenses (id, company_id, date, category, amount, payment_method, notes, reference_number, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: godowns; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.godowns (id, company_id, name, address, is_active, is_default, created_at, updated_at) FROM stdin;
cf3ac53d-a337-48d2-b741-a6f9bf341592	25d5f6b0-fa9f-4111-a01e-dd8f0d1d74ba	Main Store	Main Office	t	t	2026-03-22 21:14:19.41+05:30	2026-03-22 21:14:19.41+05:30
aaf6572d-2f6c-4366-8ac9-44528bb53956	a31dbdf5-814f-42c8-a1cf-91ad4fbbd909	Main Store	Main Office	t	t	2026-03-22 22:14:52.471+05:30	2026-03-22 22:14:52.471+05:30
888c954e-16ef-4ddc-982c-c09c206175ee	a31dbdf5-814f-42c8-a1cf-91ad4fbbd909	mane	mandagadde	t	f	2026-03-22 22:44:15.876+05:30	2026-03-22 22:44:15.876+05:30
3156d9dd-9d07-4b79-89f3-78a3a9fcb8de	aec31e73-cc63-40b3-97bd-db95dc4cd9b2	Main Store	shimoga	t	t	2026-03-22 22:48:13.12+05:30	2026-03-22 22:48:13.12+05:30
d397447d-377e-4360-a198-11bb95d3943c	94161a36-7c24-4d3b-a0b8-dd5f0cb7ccb1	Main Store	bangaore	t	t	2026-03-24 09:37:52.438+05:30	2026-03-24 09:37:52.438+05:30
\.


--
-- Data for Name: gst_cache; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gst_cache (id, gstin, data, expires_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: invoice_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invoice_items (id, invoice_id, product_id, quantity, unit_price, discount, tax_rate, tax_amount, total, description, created_at, updated_at) FROM stdin;
3eeff216-e3ca-47d1-b54d-4262ccbd4217	2935d7c8-e5e7-4d2c-97f1-20cc31672a34	843ec109-b538-4f15-b569-e0f5c869d652	1.00	220.00	0.00	0.00	0.00	259.60		2026-03-22 22:17:44.028+05:30	2026-03-22 22:17:44.028+05:30
1bd0dd5c-8e3b-4954-87f1-770bde37e150	1c247ce1-7a11-49d9-92c7-2acbe2e08409	843ec109-b538-4f15-b569-e0f5c869d652	5.00	220.00	0.00	0.00	0.00	1298.00		2026-03-22 23:46:00.162+05:30	2026-03-22 23:46:00.162+05:30
df89558e-309b-4500-b743-24ff0c17452f	5ec77d71-99c9-4227-9d19-9df8c27ed433	843ec109-b538-4f15-b569-e0f5c869d652	1.00	220.00	0.00	0.00	0.00	259.60		2026-03-24 19:28:07.563+05:30	2026-03-24 19:28:07.563+05:30
\.


--
-- Data for Name: invoicecounters; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invoicecounters (id, company_id, last_number, created_at, updated_at) FROM stdin;
213743a2-97aa-4d83-8026-c5ed83467c35	a31dbdf5-814f-42c8-a1cf-91ad4fbbd909	3	2026-03-22 22:17:44.011+05:30	2026-03-24 19:28:07.355+05:30
\.


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invoices (id, company_id, total_amount, created_at, updated_at, customer_id, godown_id, invoice_number, invoice_date, due_date, subtotal, tax_amount, discount_type, discount_amount, tds_rate, tds_amount, tcs_rate, tcs_amount, round_off, final_amount, paid_amount, payment_status, payment_method, notes, terms, status, extra_fields, industry_metadata, eway_bill_number, wallet_amount) FROM stdin;
2935d7c8-e5e7-4d2c-97f1-20cc31672a34	a31dbdf5-814f-42c8-a1cf-91ad4fbbd909	260.00	2026-03-22 22:17:44.023+05:30	2026-03-22 22:17:44.023+05:30	3141f771-cce9-4703-8b9f-7f4fe233db09	aaf6572d-2f6c-4366-8ac9-44528bb53956	INV-1	2026-03-22 05:30:00+05:30	\N	220.00	39.60	fixed	0.00	0.00	0.00	0.00	0.00	0.00	260.00	0.00	unpaid	\N		\N	sent	{}	{}		0.00
1c247ce1-7a11-49d9-92c7-2acbe2e08409	a31dbdf5-814f-42c8-a1cf-91ad4fbbd909	1298.00	2026-03-22 23:46:00.062+05:30	2026-03-22 23:46:00.062+05:30	3141f771-cce9-4703-8b9f-7f4fe233db09	aaf6572d-2f6c-4366-8ac9-44528bb53956	INV-2	2026-03-22 05:30:00+05:30	\N	1100.00	198.00	fixed	0.00	0.00	0.00	0.00	0.00	0.00	1298.00	0.00	unpaid	\N		\N	sent	{}	{}		0.00
5ec77d71-99c9-4227-9d19-9df8c27ed433	a31dbdf5-814f-42c8-a1cf-91ad4fbbd909	260.00	2026-03-24 19:28:07.441+05:30	2026-03-24 19:28:07.441+05:30	3141f771-cce9-4703-8b9f-7f4fe233db09	aaf6572d-2f6c-4366-8ac9-44528bb53956	INV-3	2026-03-24 05:30:00+05:30	\N	220.00	39.60	fixed	0.00	2.00	5.19	0.00	0.00	0.00	254.00	0.00	unpaid	\N		\N	sent	{}	{}		0.00
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, company_id, customer_id, supplier_id, invoice_id, purchase_id, payment_type, amount, payment_method, payment_date, reference_number, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: plans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.plans (id, plan_name, price, created_at, updated_at, billing_cycle, max_users, max_invoices_per_month, max_products, storage_limit, features, is_active) FROM stdin;
a280f024-cff8-499a-a2fb-4cc9b5ea4be2	Free Account	0.00	2026-03-22 20:19:49.864+05:30	2026-03-25 00:15:20.34+05:30	lifetime	1	50	100	100	{"reports": true, "eway_bills": false, "quotations": true, "gst_billing": true, "multi_godowns": false, "manage_businesses": 1, "inventory_management": true, "user_activity_tracker": false, "staff_attendance_payroll": false}	t
a271f927-6dc0-4001-96fb-d3b00ef132c1	Premium	499.00	2026-03-22 20:19:49.882+05:30	2026-03-25 00:15:20.485+05:30	3month	5	999999	10000	100	{"gst_billing":true,"inventory_management":true,"reports":true,"quotations":true,"eway_bills":true,"multi_godowns":true,"staff_attendance_payroll":false,"manage_businesses":2,"user_activity_tracker":false}	t
6b7c5d0f-c645-486c-91a3-c40871992259	Enterprise	699.00	2026-03-22 20:19:49.888+05:30	2026-03-25 00:15:20.596+05:30	3month	20	999999	100000	100	{"reports": true, "eway_bills": true, "quotations": true, "gst_billing": true, "multi_godowns": true, "priority_support": true, "manage_businesses": 3, "inventory_management": true, "user_activity_tracker": true, "staff_attendance_payroll": true}	t
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, company_id, category_id, name, sku, hsn_code, type, unit, gst_rate, purchase_price, sale_price, stock_quantity, low_stock_alert, barcode, description, created_at, updated_at, new_price) FROM stdin;
843ec109-b538-4f15-b569-e0f5c869d652	a31dbdf5-814f-42c8-a1cf-91ad4fbbd909	\N	scent 2		1002	product	l	18.00	120.00	220.00	193.00	2.00			2026-03-22 22:17:13.685+05:30	2026-03-24 19:28:07.572+05:30	\N
e66cb617-e6d8-4e00-bacb-144eaadcd858	a31dbdf5-814f-42c8-a1cf-91ad4fbbd909	ac945ca9-13e6-4909-a9d2-0ac0ece3aeaa	oil filter		1001	product	pcs	18.00	120.00	120.00	10.00	2.00			2026-03-24 21:09:44.411+05:30	2026-03-24 21:09:44.411+05:30	\N
\.


--
-- Data for Name: purchase_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_items (id, purchase_id, product_id, quantity, unit_price, tax_rate, tax_amount, total, created_at, updated_at) FROM stdin;
bf3eea89-1fe0-4665-9891-d5d62f0553fc	be20f2a6-7184-4234-88d0-a1cdebd13683	843ec109-b538-4f15-b569-e0f5c869d652	100.00	120.00	18.00	2160.00	14160.00	2026-03-22 23:05:15.755+05:30	2026-03-22 23:05:15.755+05:30
\.


--
-- Data for Name: purchase_order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_order_items (id, purchase_order_id, product_id, quantity, unit_price, tax_rate, tax_amount, total, created_at, updated_at) FROM stdin;
9052d188-455f-48d4-8480-5985d982714e	3d246ed6-1ec4-4c8e-88d2-4928d6df164b	843ec109-b538-4f15-b569-e0f5c869d652	10.00	120.00	18.00	216.00	1416.00	2026-03-22 23:44:56.68+05:30	2026-03-22 23:44:56.68+05:30
\.


--
-- Data for Name: purchase_orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_orders (id, company_id, supplier_id, po_number, po_date, expected_date, subtotal, tax_amount, total_amount, status, notes, created_at, updated_at) FROM stdin;
3d246ed6-1ec4-4c8e-88d2-4928d6df164b	a31dbdf5-814f-42c8-a1cf-91ad4fbbd909	e0fd7187-10ef-4287-9202-5b98536b1432	PO-2026-00001	2026-03-22 05:30:00+05:30	2026-03-26 05:30:00+05:30	1200.00	216.00	1416.00	draft		2026-03-22 23:44:56.672+05:30	2026-03-22 23:44:56.672+05:30
\.


--
-- Data for Name: purchases; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchases (id, company_id, supplier_id, godown_id, bill_number, bill_date, due_date, subtotal, tax_amount, discount_amount, total_amount, paid_amount, payment_status, status, notes, created_at, updated_at) FROM stdin;
be20f2a6-7184-4234-88d0-a1cdebd13683	a31dbdf5-814f-42c8-a1cf-91ad4fbbd909	e0fd7187-10ef-4287-9202-5b98536b1432	aaf6572d-2f6c-4366-8ac9-44528bb53956	PUR-2026-00001	2026-03-22 05:30:00+05:30	\N	12000.00	2160.00	0.00	14160.00	0.00	unpaid	received		2026-03-22 23:05:15.748+05:30	2026-03-22 23:05:15.748+05:30
\.


--
-- Data for Name: quotationcounters; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quotationcounters (id, company_id, last_number, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: quotationitems; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quotationitems (id, quotation_id, product_id, quantity, unit_price, tax_rate, tax_amount, total, description, created_at, updated_at) FROM stdin;
eadabf2a-db60-466d-a2e1-157d9e2b2cd9	b2956279-8a3e-49aa-9985-3538e05fb704	843ec109-b538-4f15-b569-e0f5c869d652	5.00	220.00	18.00	198.00	1298.00		2026-03-22 23:45:47.474+05:30	2026-03-22 23:45:47.474+05:30
\.


--
-- Data for Name: quotations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quotations (id, company_id, customer_id, godown_id, quotation_number, quotation_date, valid_until, subtotal, tax_amount, discount_amount, total_amount, status, notes, terms, industry_metadata, created_at, updated_at) FROM stdin;
b2956279-8a3e-49aa-9985-3538e05fb704	a31dbdf5-814f-42c8-a1cf-91ad4fbbd909	3141f771-cce9-4703-8b9f-7f4fe233db09	aaf6572d-2f6c-4366-8ac9-44528bb53956	QTN-1	2026-03-22 05:30:00+05:30	\N	1100.00	198.00	0.00	1298.00	draft			{}	2026-03-22 23:45:47.471+05:30	2026-03-22 23:45:47.471+05:30
\.


--
-- Data for Name: staff; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.staff (id, company_id, name, phone, role, salary, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: staffattendance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.staffattendance (id, staff_id, date, status, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: stock_movements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_movements (id, type, quantity, previous_stock, new_stock, reference_type, reference_id, notes, created_at, updated_at, company_id, product_id) FROM stdin;
\.


--
-- Data for Name: stocklevels; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stocklevels (id, company_id, product_id, godown_id, quantity, created_at, updated_at) FROM stdin;
02e17055-bd06-491a-85de-6e65b0236ad4	a31dbdf5-814f-42c8-a1cf-91ad4fbbd909	843ec109-b538-4f15-b569-e0f5c869d652	aaf6572d-2f6c-4366-8ac9-44528bb53956	193.00	2026-03-22 22:17:13.825+05:30	2026-03-24 19:28:07.576+05:30
c994a44d-16ba-44b2-831a-1c399331326c	a31dbdf5-814f-42c8-a1cf-91ad4fbbd909	e66cb617-e6d8-4e00-bacb-144eaadcd858	aaf6572d-2f6c-4366-8ac9-44528bb53956	10.00	2026-03-24 21:09:44.554+05:30	2026-03-24 21:09:44.554+05:30
\.


--
-- Data for Name: stockmovements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stockmovements (id, company_id, product_id, godown_id, type, quantity, previous_stock, new_stock, reference_type, reference_id, notes, created_at, updated_at) FROM stdin;
34d5b0d5-dd07-48a9-96cf-89526d244ba3	a31dbdf5-814f-42c8-a1cf-91ad4fbbd909	843ec109-b538-4f15-b569-e0f5c869d652	aaf6572d-2f6c-4366-8ac9-44528bb53956	in	100.00	0.00	100.00	opening	\N	Opening stock	2026-03-22 22:17:13.955+05:30	2026-03-22 22:17:13.955+05:30
4a908742-49a5-4e25-a4c8-c613ff95f026	a31dbdf5-814f-42c8-a1cf-91ad4fbbd909	843ec109-b538-4f15-b569-e0f5c869d652	aaf6572d-2f6c-4366-8ac9-44528bb53956	out	1.00	0.00	0.00	invoice	2935d7c8-e5e7-4d2c-97f1-20cc31672a34	Invoice #INV-1	2026-03-22 22:17:44.034+05:30	2026-03-22 22:17:44.034+05:30
bece1811-30d4-4f36-8210-efb286eb96bd	a31dbdf5-814f-42c8-a1cf-91ad4fbbd909	843ec109-b538-4f15-b569-e0f5c869d652	aaf6572d-2f6c-4366-8ac9-44528bb53956	in	100.00	99.00	199.00	purchase	be20f2a6-7184-4234-88d0-a1cdebd13683	\N	2026-03-22 23:05:15.771+05:30	2026-03-22 23:05:15.771+05:30
346b7c73-71de-4f98-afe2-b449f2257c27	a31dbdf5-814f-42c8-a1cf-91ad4fbbd909	843ec109-b538-4f15-b569-e0f5c869d652	aaf6572d-2f6c-4366-8ac9-44528bb53956	out	5.00	0.00	0.00	invoice	1c247ce1-7a11-49d9-92c7-2acbe2e08409	Invoice #INV-2	2026-03-22 23:46:00.173+05:30	2026-03-22 23:46:00.173+05:30
d38ff72b-06b4-4d87-9076-60f81cfd2690	a31dbdf5-814f-42c8-a1cf-91ad4fbbd909	843ec109-b538-4f15-b569-e0f5c869d652	aaf6572d-2f6c-4366-8ac9-44528bb53956	out	1.00	0.00	0.00	invoice	5ec77d71-99c9-4227-9d19-9df8c27ed433	Invoice #INV-3	2026-03-24 19:28:07.582+05:30	2026-03-24 19:28:07.582+05:30
e52130d6-07ea-421a-b78a-8b4d91e0c6d0	a31dbdf5-814f-42c8-a1cf-91ad4fbbd909	e66cb617-e6d8-4e00-bacb-144eaadcd858	aaf6572d-2f6c-4366-8ac9-44528bb53956	in	10.00	0.00	10.00	opening	\N	Opening stock	2026-03-24 21:09:44.618+05:30	2026-03-24 21:09:44.618+05:30
\.


--
-- Data for Name: subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscriptions (id, company_id, plan_id, coupon_id, price, start_date, expiry_date, status, payment_status, created_at, updated_at, usage) FROM stdin;
636c728e-f111-41d1-8b40-4cb6a1f3e59f	25d5f6b0-fa9f-4111-a01e-dd8f0d1d74ba	a280f024-cff8-499a-a2fb-4cc9b5ea4be2	\N	0.00	2026-03-22 20:55:11.702+05:30	2026-04-05 20:55:11.702+05:30	trial	pending	2026-03-22 20:55:11.703+05:30	2026-03-22 21:14:19.371+05:30	{"godowns": 0, "invoices": 0, "products": 0, "eway_bills": 0}
70c05ed6-cc83-430f-9d05-f595f709522f	aec31e73-cc63-40b3-97bd-db95dc4cd9b2	a280f024-cff8-499a-a2fb-4cc9b5ea4be2	\N	0.00	2026-03-22 22:48:13.189+05:30	2036-03-22 22:48:13.189+05:30	active	paid	2026-03-22 22:48:13.19+05:30	2026-03-22 22:48:13.19+05:30	{"godowns": 0, "invoices": 0, "products": 0, "eway_bills": 0}
dca1c3ed-f289-4d14-8daf-f336117446f9	94161a36-7c24-4d3b-a0b8-dd5f0cb7ccb1	a280f024-cff8-499a-a2fb-4cc9b5ea4be2	\N	0.00	2026-03-23 09:59:21.407+05:30	2036-03-23 09:59:21.407+05:30	active	paid	2026-03-23 09:59:21.407+05:30	2026-03-23 09:59:21.407+05:30	{"godowns": 0, "invoices": 0, "products": 0, "eway_bills": 0}
fe5740b6-1dc4-4d64-ba19-32b29034f340	a31dbdf5-814f-42c8-a1cf-91ad4fbbd909	6b7c5d0f-c645-486c-91a3-c40871992259	598ff6d8-e9c3-4232-aa00-59f55db1d9c3	0.00	2026-03-22 21:19:35.16+05:30	2026-06-22 21:19:35.16+05:30	active	pending	2026-03-22 21:17:15.317+05:30	2026-03-24 21:09:44.484+05:30	{"godowns": 0, "invoices": 0, "products": 3, "eway_bills": 0}
\.


--
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.suppliers (id, company_id, name, phone, email, gst_number, address, city, state, pincode, outstanding_balance, created_at, updated_at) FROM stdin;
e0fd7187-10ef-4287-9202-5b98536b1432	a31dbdf5-814f-42c8-a1cf-91ad4fbbd909	pammu	9686887827			bangalore	bglr	karnataka		14160.00	2026-03-22 23:00:35.72+05:30	2026-03-22 23:05:15.777+05:30
\.


--
-- Data for Name: tax_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tax_settings (id, company_id, name, type, section, rate, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: user_companies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_companies (id, user_id, company_id, role, created_at) FROM stdin;
\.


--
-- Data for Name: usercompanies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usercompanies (id, user_id, company_id, role, created_at, updated_at) FROM stdin;
23c8c7c7-0195-44e7-ab52-08a9ddb4440b	a2401c83-490d-47a4-bf93-78c1fc7659ec	25d5f6b0-fa9f-4111-a01e-dd8f0d1d74ba	owner	2026-03-22 21:14:19.389+05:30	2026-03-22 21:14:19.389+05:30
d49fefec-7d7e-417e-b3c0-4267bb1f7743	a3da6d97-87d9-4f22-a71c-2d3a91d4b272	a31dbdf5-814f-42c8-a1cf-91ad4fbbd909	owner	2026-03-22 22:14:52.323+05:30	2026-03-22 22:14:52.323+05:30
f19cb107-b719-48d1-8a35-b2c0ccd96fe3	a3da6d97-87d9-4f22-a71c-2d3a91d4b272	aec31e73-cc63-40b3-97bd-db95dc4cd9b2	owner	2026-03-22 22:45:00.313+05:30	2026-03-22 22:45:00.313+05:30
ccdacc94-74c1-408d-aa27-a729cabc31c3	a3da6d97-87d9-4f22-a71c-2d3a91d4b272	94161a36-7c24-4d3b-a0b8-dd5f0cb7ccb1	owner	2026-03-23 09:59:21.346+05:30	2026-03-23 09:59:21.346+05:30
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, company_id, email, name, phone, role, created_at, updated_at, password, permissions, is_active, email_verified, last_login) FROM stdin;
a2401c83-490d-47a4-bf93-78c1fc7659ec	25d5f6b0-fa9f-4111-a01e-dd8f0d1d74ba	ASHU@GMAIL.COM	ASHU		owner	2026-03-22 20:55:11.693+05:30	2026-03-22 20:55:11.693+05:30	\N	{}	t	f	\N
a3da6d97-87d9-4f22-a71c-2d3a91d4b272	a31dbdf5-814f-42c8-a1cf-91ad4fbbd909	ashu@gmail.com	ashu		owner	2026-03-22 21:17:15.309+05:30	2026-03-24 20:17:00.152+05:30	$2b$10$sPqGxSIk9W4QtPY/EqqHJ.F1J3cReeuIBDIgqpZ0fIF97JdmBn6TC	{}	t	f	2026-03-24 20:17:00.152+05:30
\.


--
-- Name: user_companies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_companies_id_seq', 1, false);


--
-- Name: Affiliates Affiliates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Affiliates"
    ADD CONSTRAINT "Affiliates_pkey" PRIMARY KEY (id);


--
-- Name: Categories Categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Categories"
    ADD CONSTRAINT "Categories_pkey" PRIMARY KEY (id);


--
-- Name: Companies Companies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Companies"
    ADD CONSTRAINT "Companies_pkey" PRIMARY KEY (id);


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
-- Name: CreditNoteItems CreditNoteItems_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CreditNoteItems"
    ADD CONSTRAINT "CreditNoteItems_pkey" PRIMARY KEY (id);


--
-- Name: CreditNotes CreditNotes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CreditNotes"
    ADD CONSTRAINT "CreditNotes_pkey" PRIMARY KEY (id);


--
-- Name: Customers Customers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Customers"
    ADD CONSTRAINT "Customers_pkey" PRIMARY KEY (id);


--
-- Name: EWayBills EWayBills_eway_bill_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EWayBills"
    ADD CONSTRAINT "EWayBills_eway_bill_number_key" UNIQUE (eway_bill_number);


--
-- Name: EWayBills EWayBills_eway_bill_number_key1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EWayBills"
    ADD CONSTRAINT "EWayBills_eway_bill_number_key1" UNIQUE (eway_bill_number);


--
-- Name: EWayBills EWayBills_eway_bill_number_key10; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EWayBills"
    ADD CONSTRAINT "EWayBills_eway_bill_number_key10" UNIQUE (eway_bill_number);


--
-- Name: EWayBills EWayBills_eway_bill_number_key11; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EWayBills"
    ADD CONSTRAINT "EWayBills_eway_bill_number_key11" UNIQUE (eway_bill_number);


--
-- Name: EWayBills EWayBills_eway_bill_number_key12; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EWayBills"
    ADD CONSTRAINT "EWayBills_eway_bill_number_key12" UNIQUE (eway_bill_number);


--
-- Name: EWayBills EWayBills_eway_bill_number_key13; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EWayBills"
    ADD CONSTRAINT "EWayBills_eway_bill_number_key13" UNIQUE (eway_bill_number);


--
-- Name: EWayBills EWayBills_eway_bill_number_key14; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EWayBills"
    ADD CONSTRAINT "EWayBills_eway_bill_number_key14" UNIQUE (eway_bill_number);


--
-- Name: EWayBills EWayBills_eway_bill_number_key15; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EWayBills"
    ADD CONSTRAINT "EWayBills_eway_bill_number_key15" UNIQUE (eway_bill_number);


--
-- Name: EWayBills EWayBills_eway_bill_number_key16; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EWayBills"
    ADD CONSTRAINT "EWayBills_eway_bill_number_key16" UNIQUE (eway_bill_number);


--
-- Name: EWayBills EWayBills_eway_bill_number_key17; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EWayBills"
    ADD CONSTRAINT "EWayBills_eway_bill_number_key17" UNIQUE (eway_bill_number);


--
-- Name: EWayBills EWayBills_eway_bill_number_key18; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EWayBills"
    ADD CONSTRAINT "EWayBills_eway_bill_number_key18" UNIQUE (eway_bill_number);


--
-- Name: EWayBills EWayBills_eway_bill_number_key19; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EWayBills"
    ADD CONSTRAINT "EWayBills_eway_bill_number_key19" UNIQUE (eway_bill_number);


--
-- Name: EWayBills EWayBills_eway_bill_number_key2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EWayBills"
    ADD CONSTRAINT "EWayBills_eway_bill_number_key2" UNIQUE (eway_bill_number);


--
-- Name: EWayBills EWayBills_eway_bill_number_key20; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EWayBills"
    ADD CONSTRAINT "EWayBills_eway_bill_number_key20" UNIQUE (eway_bill_number);


--
-- Name: EWayBills EWayBills_eway_bill_number_key21; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EWayBills"
    ADD CONSTRAINT "EWayBills_eway_bill_number_key21" UNIQUE (eway_bill_number);


--
-- Name: EWayBills EWayBills_eway_bill_number_key22; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EWayBills"
    ADD CONSTRAINT "EWayBills_eway_bill_number_key22" UNIQUE (eway_bill_number);


--
-- Name: EWayBills EWayBills_eway_bill_number_key23; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EWayBills"
    ADD CONSTRAINT "EWayBills_eway_bill_number_key23" UNIQUE (eway_bill_number);


--
-- Name: EWayBills EWayBills_eway_bill_number_key24; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EWayBills"
    ADD CONSTRAINT "EWayBills_eway_bill_number_key24" UNIQUE (eway_bill_number);


--
-- Name: EWayBills EWayBills_eway_bill_number_key25; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EWayBills"
    ADD CONSTRAINT "EWayBills_eway_bill_number_key25" UNIQUE (eway_bill_number);


--
-- Name: EWayBills EWayBills_eway_bill_number_key26; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EWayBills"
    ADD CONSTRAINT "EWayBills_eway_bill_number_key26" UNIQUE (eway_bill_number);


--
-- Name: EWayBills EWayBills_eway_bill_number_key27; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EWayBills"
    ADD CONSTRAINT "EWayBills_eway_bill_number_key27" UNIQUE (eway_bill_number);


--
-- Name: EWayBills EWayBills_eway_bill_number_key28; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EWayBills"
    ADD CONSTRAINT "EWayBills_eway_bill_number_key28" UNIQUE (eway_bill_number);


--
-- Name: EWayBills EWayBills_eway_bill_number_key29; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EWayBills"
    ADD CONSTRAINT "EWayBills_eway_bill_number_key29" UNIQUE (eway_bill_number);


--
-- Name: EWayBills EWayBills_eway_bill_number_key3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EWayBills"
    ADD CONSTRAINT "EWayBills_eway_bill_number_key3" UNIQUE (eway_bill_number);


--
-- Name: EWayBills EWayBills_eway_bill_number_key30; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EWayBills"
    ADD CONSTRAINT "EWayBills_eway_bill_number_key30" UNIQUE (eway_bill_number);


--
-- Name: EWayBills EWayBills_eway_bill_number_key31; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EWayBills"
    ADD CONSTRAINT "EWayBills_eway_bill_number_key31" UNIQUE (eway_bill_number);


--
-- Name: EWayBills EWayBills_eway_bill_number_key32; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EWayBills"
    ADD CONSTRAINT "EWayBills_eway_bill_number_key32" UNIQUE (eway_bill_number);


--
-- Name: EWayBills EWayBills_eway_bill_number_key33; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EWayBills"
    ADD CONSTRAINT "EWayBills_eway_bill_number_key33" UNIQUE (eway_bill_number);


--
-- Name: EWayBills EWayBills_eway_bill_number_key34; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EWayBills"
    ADD CONSTRAINT "EWayBills_eway_bill_number_key34" UNIQUE (eway_bill_number);


--
-- Name: EWayBills EWayBills_eway_bill_number_key35; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EWayBills"
    ADD CONSTRAINT "EWayBills_eway_bill_number_key35" UNIQUE (eway_bill_number);


--
-- Name: EWayBills EWayBills_eway_bill_number_key36; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EWayBills"
    ADD CONSTRAINT "EWayBills_eway_bill_number_key36" UNIQUE (eway_bill_number);


--
-- Name: EWayBills EWayBills_eway_bill_number_key37; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EWayBills"
    ADD CONSTRAINT "EWayBills_eway_bill_number_key37" UNIQUE (eway_bill_number);


--
-- Name: EWayBills EWayBills_eway_bill_number_key38; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EWayBills"
    ADD CONSTRAINT "EWayBills_eway_bill_number_key38" UNIQUE (eway_bill_number);


--
-- Name: EWayBills EWayBills_eway_bill_number_key39; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EWayBills"
    ADD CONSTRAINT "EWayBills_eway_bill_number_key39" UNIQUE (eway_bill_number);


--
-- Name: EWayBills EWayBills_eway_bill_number_key4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EWayBills"
    ADD CONSTRAINT "EWayBills_eway_bill_number_key4" UNIQUE (eway_bill_number);


--
-- Name: EWayBills EWayBills_eway_bill_number_key40; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EWayBills"
    ADD CONSTRAINT "EWayBills_eway_bill_number_key40" UNIQUE (eway_bill_number);


--
-- Name: EWayBills EWayBills_eway_bill_number_key41; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EWayBills"
    ADD CONSTRAINT "EWayBills_eway_bill_number_key41" UNIQUE (eway_bill_number);


--
-- Name: EWayBills EWayBills_eway_bill_number_key42; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EWayBills"
    ADD CONSTRAINT "EWayBills_eway_bill_number_key42" UNIQUE (eway_bill_number);


--
-- Name: EWayBills EWayBills_eway_bill_number_key43; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EWayBills"
    ADD CONSTRAINT "EWayBills_eway_bill_number_key43" UNIQUE (eway_bill_number);


--
-- Name: EWayBills EWayBills_eway_bill_number_key44; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EWayBills"
    ADD CONSTRAINT "EWayBills_eway_bill_number_key44" UNIQUE (eway_bill_number);


--
-- Name: EWayBills EWayBills_eway_bill_number_key45; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EWayBills"
    ADD CONSTRAINT "EWayBills_eway_bill_number_key45" UNIQUE (eway_bill_number);


--
-- Name: EWayBills EWayBills_eway_bill_number_key46; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EWayBills"
    ADD CONSTRAINT "EWayBills_eway_bill_number_key46" UNIQUE (eway_bill_number);


--
-- Name: EWayBills EWayBills_eway_bill_number_key47; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EWayBills"
    ADD CONSTRAINT "EWayBills_eway_bill_number_key47" UNIQUE (eway_bill_number);


--
-- Name: EWayBills EWayBills_eway_bill_number_key48; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EWayBills"
    ADD CONSTRAINT "EWayBills_eway_bill_number_key48" UNIQUE (eway_bill_number);


--
-- Name: EWayBills EWayBills_eway_bill_number_key49; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EWayBills"
    ADD CONSTRAINT "EWayBills_eway_bill_number_key49" UNIQUE (eway_bill_number);


--
-- Name: EWayBills EWayBills_eway_bill_number_key5; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EWayBills"
    ADD CONSTRAINT "EWayBills_eway_bill_number_key5" UNIQUE (eway_bill_number);


--
-- Name: EWayBills EWayBills_eway_bill_number_key50; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EWayBills"
    ADD CONSTRAINT "EWayBills_eway_bill_number_key50" UNIQUE (eway_bill_number);


--
-- Name: EWayBills EWayBills_eway_bill_number_key51; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EWayBills"
    ADD CONSTRAINT "EWayBills_eway_bill_number_key51" UNIQUE (eway_bill_number);


--
-- Name: EWayBills EWayBills_eway_bill_number_key52; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EWayBills"
    ADD CONSTRAINT "EWayBills_eway_bill_number_key52" UNIQUE (eway_bill_number);


--
-- Name: EWayBills EWayBills_eway_bill_number_key53; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EWayBills"
    ADD CONSTRAINT "EWayBills_eway_bill_number_key53" UNIQUE (eway_bill_number);


--
-- Name: EWayBills EWayBills_eway_bill_number_key54; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EWayBills"
    ADD CONSTRAINT "EWayBills_eway_bill_number_key54" UNIQUE (eway_bill_number);


--
-- Name: EWayBills EWayBills_eway_bill_number_key55; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EWayBills"
    ADD CONSTRAINT "EWayBills_eway_bill_number_key55" UNIQUE (eway_bill_number);


--
-- Name: EWayBills EWayBills_eway_bill_number_key6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EWayBills"
    ADD CONSTRAINT "EWayBills_eway_bill_number_key6" UNIQUE (eway_bill_number);


--
-- Name: EWayBills EWayBills_eway_bill_number_key7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EWayBills"
    ADD CONSTRAINT "EWayBills_eway_bill_number_key7" UNIQUE (eway_bill_number);


--
-- Name: EWayBills EWayBills_eway_bill_number_key8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EWayBills"
    ADD CONSTRAINT "EWayBills_eway_bill_number_key8" UNIQUE (eway_bill_number);


--
-- Name: EWayBills EWayBills_eway_bill_number_key9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EWayBills"
    ADD CONSTRAINT "EWayBills_eway_bill_number_key9" UNIQUE (eway_bill_number);


--
-- Name: EWayBills EWayBills_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EWayBills"
    ADD CONSTRAINT "EWayBills_pkey" PRIMARY KEY (id);


--
-- Name: Enquiries Enquiries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Enquiries"
    ADD CONSTRAINT "Enquiries_pkey" PRIMARY KEY (id);


--
-- Name: Expenses Expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Expenses"
    ADD CONSTRAINT "Expenses_pkey" PRIMARY KEY (id);


--
-- Name: GlobalNotifications GlobalNotifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."GlobalNotifications"
    ADD CONSTRAINT "GlobalNotifications_pkey" PRIMARY KEY (id);


--
-- Name: Godowns Godowns_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Godowns"
    ADD CONSTRAINT "Godowns_pkey" PRIMARY KEY (id);


--
-- Name: InvoiceCounters InvoiceCounters_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InvoiceCounters"
    ADD CONSTRAINT "InvoiceCounters_pkey" PRIMARY KEY (id);


--
-- Name: InvoiceItems InvoiceItems_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InvoiceItems"
    ADD CONSTRAINT "InvoiceItems_pkey" PRIMARY KEY (id);


--
-- Name: Invoices Invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Invoices"
    ADD CONSTRAINT "Invoices_pkey" PRIMARY KEY (id);


--
-- Name: Payments Payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payments"
    ADD CONSTRAINT "Payments_pkey" PRIMARY KEY (id);


--
-- Name: PlatformExpenses PlatformExpenses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PlatformExpenses"
    ADD CONSTRAINT "PlatformExpenses_pkey" PRIMARY KEY (id);


--
-- Name: Products Products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Products"
    ADD CONSTRAINT "Products_pkey" PRIMARY KEY (id);


--
-- Name: PurchaseItems PurchaseItems_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseItems"
    ADD CONSTRAINT "PurchaseItems_pkey" PRIMARY KEY (id);


--
-- Name: Purchases Purchases_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Purchases"
    ADD CONSTRAINT "Purchases_pkey" PRIMARY KEY (id);


--
-- Name: QuotationCounters QuotationCounters_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."QuotationCounters"
    ADD CONSTRAINT "QuotationCounters_pkey" PRIMARY KEY (id);


--
-- Name: QuotationItems QuotationItems_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."QuotationItems"
    ADD CONSTRAINT "QuotationItems_pkey" PRIMARY KEY (id);


--
-- Name: Quotations Quotations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Quotations"
    ADD CONSTRAINT "Quotations_pkey" PRIMARY KEY (id);


--
-- Name: StaffAttendance StaffAttendance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StaffAttendance"
    ADD CONSTRAINT "StaffAttendance_pkey" PRIMARY KEY (id);


--
-- Name: Staff Staff_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Staff"
    ADD CONSTRAINT "Staff_pkey" PRIMARY KEY (id);


--
-- Name: StockLevels StockLevels_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StockLevels"
    ADD CONSTRAINT "StockLevels_pkey" PRIMARY KEY (id);


--
-- Name: StockMovements StockMovements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StockMovements"
    ADD CONSTRAINT "StockMovements_pkey" PRIMARY KEY (id);


--
-- Name: Subscriptions Subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Subscriptions"
    ADD CONSTRAINT "Subscriptions_pkey" PRIMARY KEY (id);


--
-- Name: Suppliers Suppliers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Suppliers"
    ADD CONSTRAINT "Suppliers_pkey" PRIMARY KEY (id);


--
-- Name: UserCompanies UserCompanies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserCompanies"
    ADD CONSTRAINT "UserCompanies_pkey" PRIMARY KEY (id);


--
-- Name: UserCompanies UserCompanies_user_id_company_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserCompanies"
    ADD CONSTRAINT "UserCompanies_user_id_company_id_key" UNIQUE (user_id, company_id);


--
-- Name: Users Users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key" UNIQUE (email);


--
-- Name: Users Users_email_key1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key1" UNIQUE (email);


--
-- Name: Users Users_email_key10; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key10" UNIQUE (email);


--
-- Name: Users Users_email_key100; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key100" UNIQUE (email);


--
-- Name: Users Users_email_key101; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key101" UNIQUE (email);


--
-- Name: Users Users_email_key102; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key102" UNIQUE (email);


--
-- Name: Users Users_email_key103; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key103" UNIQUE (email);


--
-- Name: Users Users_email_key104; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key104" UNIQUE (email);


--
-- Name: Users Users_email_key105; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key105" UNIQUE (email);


--
-- Name: Users Users_email_key106; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key106" UNIQUE (email);


--
-- Name: Users Users_email_key107; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key107" UNIQUE (email);


--
-- Name: Users Users_email_key108; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key108" UNIQUE (email);


--
-- Name: Users Users_email_key109; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key109" UNIQUE (email);


--
-- Name: Users Users_email_key11; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key11" UNIQUE (email);


--
-- Name: Users Users_email_key110; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key110" UNIQUE (email);


--
-- Name: Users Users_email_key111; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key111" UNIQUE (email);


--
-- Name: Users Users_email_key112; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key112" UNIQUE (email);


--
-- Name: Users Users_email_key113; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key113" UNIQUE (email);


--
-- Name: Users Users_email_key114; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key114" UNIQUE (email);


--
-- Name: Users Users_email_key115; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key115" UNIQUE (email);


--
-- Name: Users Users_email_key116; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key116" UNIQUE (email);


--
-- Name: Users Users_email_key117; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key117" UNIQUE (email);


--
-- Name: Users Users_email_key118; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key118" UNIQUE (email);


--
-- Name: Users Users_email_key119; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key119" UNIQUE (email);


--
-- Name: Users Users_email_key12; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key12" UNIQUE (email);


--
-- Name: Users Users_email_key120; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key120" UNIQUE (email);


--
-- Name: Users Users_email_key121; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key121" UNIQUE (email);


--
-- Name: Users Users_email_key122; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key122" UNIQUE (email);


--
-- Name: Users Users_email_key123; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key123" UNIQUE (email);


--
-- Name: Users Users_email_key124; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key124" UNIQUE (email);


--
-- Name: Users Users_email_key125; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key125" UNIQUE (email);


--
-- Name: Users Users_email_key126; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key126" UNIQUE (email);


--
-- Name: Users Users_email_key127; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key127" UNIQUE (email);


--
-- Name: Users Users_email_key128; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key128" UNIQUE (email);


--
-- Name: Users Users_email_key129; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key129" UNIQUE (email);


--
-- Name: Users Users_email_key13; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key13" UNIQUE (email);


--
-- Name: Users Users_email_key14; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key14" UNIQUE (email);


--
-- Name: Users Users_email_key15; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key15" UNIQUE (email);


--
-- Name: Users Users_email_key16; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key16" UNIQUE (email);


--
-- Name: Users Users_email_key17; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key17" UNIQUE (email);


--
-- Name: Users Users_email_key18; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key18" UNIQUE (email);


--
-- Name: Users Users_email_key19; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key19" UNIQUE (email);


--
-- Name: Users Users_email_key2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key2" UNIQUE (email);


--
-- Name: Users Users_email_key20; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key20" UNIQUE (email);


--
-- Name: Users Users_email_key21; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key21" UNIQUE (email);


--
-- Name: Users Users_email_key22; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key22" UNIQUE (email);


--
-- Name: Users Users_email_key23; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key23" UNIQUE (email);


--
-- Name: Users Users_email_key24; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key24" UNIQUE (email);


--
-- Name: Users Users_email_key25; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key25" UNIQUE (email);


--
-- Name: Users Users_email_key26; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key26" UNIQUE (email);


--
-- Name: Users Users_email_key27; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key27" UNIQUE (email);


--
-- Name: Users Users_email_key28; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key28" UNIQUE (email);


--
-- Name: Users Users_email_key29; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key29" UNIQUE (email);


--
-- Name: Users Users_email_key3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key3" UNIQUE (email);


--
-- Name: Users Users_email_key30; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key30" UNIQUE (email);


--
-- Name: Users Users_email_key31; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key31" UNIQUE (email);


--
-- Name: Users Users_email_key32; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key32" UNIQUE (email);


--
-- Name: Users Users_email_key33; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key33" UNIQUE (email);


--
-- Name: Users Users_email_key34; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key34" UNIQUE (email);


--
-- Name: Users Users_email_key35; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key35" UNIQUE (email);


--
-- Name: Users Users_email_key36; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key36" UNIQUE (email);


--
-- Name: Users Users_email_key37; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key37" UNIQUE (email);


--
-- Name: Users Users_email_key38; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key38" UNIQUE (email);


--
-- Name: Users Users_email_key39; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key39" UNIQUE (email);


--
-- Name: Users Users_email_key4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key4" UNIQUE (email);


--
-- Name: Users Users_email_key40; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key40" UNIQUE (email);


--
-- Name: Users Users_email_key41; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key41" UNIQUE (email);


--
-- Name: Users Users_email_key42; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key42" UNIQUE (email);


--
-- Name: Users Users_email_key43; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key43" UNIQUE (email);


--
-- Name: Users Users_email_key44; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key44" UNIQUE (email);


--
-- Name: Users Users_email_key45; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key45" UNIQUE (email);


--
-- Name: Users Users_email_key46; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key46" UNIQUE (email);


--
-- Name: Users Users_email_key47; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key47" UNIQUE (email);


--
-- Name: Users Users_email_key48; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key48" UNIQUE (email);


--
-- Name: Users Users_email_key49; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key49" UNIQUE (email);


--
-- Name: Users Users_email_key5; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key5" UNIQUE (email);


--
-- Name: Users Users_email_key50; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key50" UNIQUE (email);


--
-- Name: Users Users_email_key51; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key51" UNIQUE (email);


--
-- Name: Users Users_email_key52; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key52" UNIQUE (email);


--
-- Name: Users Users_email_key53; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key53" UNIQUE (email);


--
-- Name: Users Users_email_key54; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key54" UNIQUE (email);


--
-- Name: Users Users_email_key55; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key55" UNIQUE (email);


--
-- Name: Users Users_email_key56; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key56" UNIQUE (email);


--
-- Name: Users Users_email_key57; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key57" UNIQUE (email);


--
-- Name: Users Users_email_key58; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key58" UNIQUE (email);


--
-- Name: Users Users_email_key59; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key59" UNIQUE (email);


--
-- Name: Users Users_email_key6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key6" UNIQUE (email);


--
-- Name: Users Users_email_key60; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key60" UNIQUE (email);


--
-- Name: Users Users_email_key61; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key61" UNIQUE (email);


--
-- Name: Users Users_email_key62; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key62" UNIQUE (email);


--
-- Name: Users Users_email_key63; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key63" UNIQUE (email);


--
-- Name: Users Users_email_key64; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key64" UNIQUE (email);


--
-- Name: Users Users_email_key65; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key65" UNIQUE (email);


--
-- Name: Users Users_email_key66; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key66" UNIQUE (email);


--
-- Name: Users Users_email_key67; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key67" UNIQUE (email);


--
-- Name: Users Users_email_key68; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key68" UNIQUE (email);


--
-- Name: Users Users_email_key69; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key69" UNIQUE (email);


--
-- Name: Users Users_email_key7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key7" UNIQUE (email);


--
-- Name: Users Users_email_key70; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key70" UNIQUE (email);


--
-- Name: Users Users_email_key71; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key71" UNIQUE (email);


--
-- Name: Users Users_email_key72; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key72" UNIQUE (email);


--
-- Name: Users Users_email_key73; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key73" UNIQUE (email);


--
-- Name: Users Users_email_key74; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key74" UNIQUE (email);


--
-- Name: Users Users_email_key75; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key75" UNIQUE (email);


--
-- Name: Users Users_email_key76; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key76" UNIQUE (email);


--
-- Name: Users Users_email_key77; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key77" UNIQUE (email);


--
-- Name: Users Users_email_key78; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key78" UNIQUE (email);


--
-- Name: Users Users_email_key79; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key79" UNIQUE (email);


--
-- Name: Users Users_email_key8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key8" UNIQUE (email);


--
-- Name: Users Users_email_key80; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key80" UNIQUE (email);


--
-- Name: Users Users_email_key81; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key81" UNIQUE (email);


--
-- Name: Users Users_email_key82; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key82" UNIQUE (email);


--
-- Name: Users Users_email_key83; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key83" UNIQUE (email);


--
-- Name: Users Users_email_key84; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key84" UNIQUE (email);


--
-- Name: Users Users_email_key85; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key85" UNIQUE (email);


--
-- Name: Users Users_email_key86; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key86" UNIQUE (email);


--
-- Name: Users Users_email_key87; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key87" UNIQUE (email);


--
-- Name: Users Users_email_key88; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key88" UNIQUE (email);


--
-- Name: Users Users_email_key89; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key89" UNIQUE (email);


--
-- Name: Users Users_email_key9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key9" UNIQUE (email);


--
-- Name: Users Users_email_key90; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key90" UNIQUE (email);


--
-- Name: Users Users_email_key91; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key91" UNIQUE (email);


--
-- Name: Users Users_email_key92; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key92" UNIQUE (email);


--
-- Name: Users Users_email_key93; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key93" UNIQUE (email);


--
-- Name: Users Users_email_key94; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key94" UNIQUE (email);


--
-- Name: Users Users_email_key95; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key95" UNIQUE (email);


--
-- Name: Users Users_email_key96; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key96" UNIQUE (email);


--
-- Name: Users Users_email_key97; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key97" UNIQUE (email);


--
-- Name: Users Users_email_key98; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key98" UNIQUE (email);


--
-- Name: Users Users_email_key99; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key99" UNIQUE (email);


--
-- Name: Users Users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_pkey" PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- Name: coupons coupons_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_code_key UNIQUE (code);


--
-- Name: coupons coupons_code_key1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_code_key1 UNIQUE (code);


--
-- Name: coupons coupons_code_key10; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_code_key10 UNIQUE (code);


--
-- Name: coupons coupons_code_key11; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_code_key11 UNIQUE (code);


--
-- Name: coupons coupons_code_key12; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_code_key12 UNIQUE (code);


--
-- Name: coupons coupons_code_key13; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_code_key13 UNIQUE (code);


--
-- Name: coupons coupons_code_key14; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_code_key14 UNIQUE (code);


--
-- Name: coupons coupons_code_key15; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_code_key15 UNIQUE (code);


--
-- Name: coupons coupons_code_key16; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_code_key16 UNIQUE (code);


--
-- Name: coupons coupons_code_key17; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_code_key17 UNIQUE (code);


--
-- Name: coupons coupons_code_key18; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_code_key18 UNIQUE (code);


--
-- Name: coupons coupons_code_key19; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_code_key19 UNIQUE (code);


--
-- Name: coupons coupons_code_key2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_code_key2 UNIQUE (code);


--
-- Name: coupons coupons_code_key20; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_code_key20 UNIQUE (code);


--
-- Name: coupons coupons_code_key21; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_code_key21 UNIQUE (code);


--
-- Name: coupons coupons_code_key22; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_code_key22 UNIQUE (code);


--
-- Name: coupons coupons_code_key23; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_code_key23 UNIQUE (code);


--
-- Name: coupons coupons_code_key24; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_code_key24 UNIQUE (code);


--
-- Name: coupons coupons_code_key25; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_code_key25 UNIQUE (code);


--
-- Name: coupons coupons_code_key26; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_code_key26 UNIQUE (code);


--
-- Name: coupons coupons_code_key27; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_code_key27 UNIQUE (code);


--
-- Name: coupons coupons_code_key28; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_code_key28 UNIQUE (code);


--
-- Name: coupons coupons_code_key29; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_code_key29 UNIQUE (code);


--
-- Name: coupons coupons_code_key3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_code_key3 UNIQUE (code);


--
-- Name: coupons coupons_code_key30; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_code_key30 UNIQUE (code);


--
-- Name: coupons coupons_code_key31; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_code_key31 UNIQUE (code);


--
-- Name: coupons coupons_code_key32; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_code_key32 UNIQUE (code);


--
-- Name: coupons coupons_code_key33; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_code_key33 UNIQUE (code);


--
-- Name: coupons coupons_code_key34; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_code_key34 UNIQUE (code);


--
-- Name: coupons coupons_code_key35; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_code_key35 UNIQUE (code);


--
-- Name: coupons coupons_code_key36; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_code_key36 UNIQUE (code);


--
-- Name: coupons coupons_code_key37; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_code_key37 UNIQUE (code);


--
-- Name: coupons coupons_code_key4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_code_key4 UNIQUE (code);


--
-- Name: coupons coupons_code_key5; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_code_key5 UNIQUE (code);


--
-- Name: coupons coupons_code_key6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_code_key6 UNIQUE (code);


--
-- Name: coupons coupons_code_key7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_code_key7 UNIQUE (code);


--
-- Name: coupons coupons_code_key8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_code_key8 UNIQUE (code);


--
-- Name: coupons coupons_code_key9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_code_key9 UNIQUE (code);


--
-- Name: coupons coupons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_pkey PRIMARY KEY (id);


--
-- Name: creditnoteitems creditnoteitems_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.creditnoteitems
    ADD CONSTRAINT creditnoteitems_pkey PRIMARY KEY (id);


--
-- Name: creditnotes creditnotes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.creditnotes
    ADD CONSTRAINT creditnotes_pkey PRIMARY KEY (id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: enquiries enquiries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enquiries
    ADD CONSTRAINT enquiries_pkey PRIMARY KEY (id);


--
-- Name: ewaybills ewaybills_eway_bill_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ewaybills
    ADD CONSTRAINT ewaybills_eway_bill_number_key UNIQUE (eway_bill_number);


--
-- Name: ewaybills ewaybills_eway_bill_number_key1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ewaybills
    ADD CONSTRAINT ewaybills_eway_bill_number_key1 UNIQUE (eway_bill_number);


--
-- Name: ewaybills ewaybills_eway_bill_number_key10; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ewaybills
    ADD CONSTRAINT ewaybills_eway_bill_number_key10 UNIQUE (eway_bill_number);


--
-- Name: ewaybills ewaybills_eway_bill_number_key11; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ewaybills
    ADD CONSTRAINT ewaybills_eway_bill_number_key11 UNIQUE (eway_bill_number);


--
-- Name: ewaybills ewaybills_eway_bill_number_key12; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ewaybills
    ADD CONSTRAINT ewaybills_eway_bill_number_key12 UNIQUE (eway_bill_number);


--
-- Name: ewaybills ewaybills_eway_bill_number_key13; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ewaybills
    ADD CONSTRAINT ewaybills_eway_bill_number_key13 UNIQUE (eway_bill_number);


--
-- Name: ewaybills ewaybills_eway_bill_number_key14; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ewaybills
    ADD CONSTRAINT ewaybills_eway_bill_number_key14 UNIQUE (eway_bill_number);


--
-- Name: ewaybills ewaybills_eway_bill_number_key15; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ewaybills
    ADD CONSTRAINT ewaybills_eway_bill_number_key15 UNIQUE (eway_bill_number);


--
-- Name: ewaybills ewaybills_eway_bill_number_key16; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ewaybills
    ADD CONSTRAINT ewaybills_eway_bill_number_key16 UNIQUE (eway_bill_number);


--
-- Name: ewaybills ewaybills_eway_bill_number_key17; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ewaybills
    ADD CONSTRAINT ewaybills_eway_bill_number_key17 UNIQUE (eway_bill_number);


--
-- Name: ewaybills ewaybills_eway_bill_number_key18; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ewaybills
    ADD CONSTRAINT ewaybills_eway_bill_number_key18 UNIQUE (eway_bill_number);


--
-- Name: ewaybills ewaybills_eway_bill_number_key19; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ewaybills
    ADD CONSTRAINT ewaybills_eway_bill_number_key19 UNIQUE (eway_bill_number);


--
-- Name: ewaybills ewaybills_eway_bill_number_key2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ewaybills
    ADD CONSTRAINT ewaybills_eway_bill_number_key2 UNIQUE (eway_bill_number);


--
-- Name: ewaybills ewaybills_eway_bill_number_key20; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ewaybills
    ADD CONSTRAINT ewaybills_eway_bill_number_key20 UNIQUE (eway_bill_number);


--
-- Name: ewaybills ewaybills_eway_bill_number_key21; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ewaybills
    ADD CONSTRAINT ewaybills_eway_bill_number_key21 UNIQUE (eway_bill_number);


--
-- Name: ewaybills ewaybills_eway_bill_number_key22; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ewaybills
    ADD CONSTRAINT ewaybills_eway_bill_number_key22 UNIQUE (eway_bill_number);


--
-- Name: ewaybills ewaybills_eway_bill_number_key23; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ewaybills
    ADD CONSTRAINT ewaybills_eway_bill_number_key23 UNIQUE (eway_bill_number);


--
-- Name: ewaybills ewaybills_eway_bill_number_key24; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ewaybills
    ADD CONSTRAINT ewaybills_eway_bill_number_key24 UNIQUE (eway_bill_number);


--
-- Name: ewaybills ewaybills_eway_bill_number_key25; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ewaybills
    ADD CONSTRAINT ewaybills_eway_bill_number_key25 UNIQUE (eway_bill_number);


--
-- Name: ewaybills ewaybills_eway_bill_number_key26; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ewaybills
    ADD CONSTRAINT ewaybills_eway_bill_number_key26 UNIQUE (eway_bill_number);


--
-- Name: ewaybills ewaybills_eway_bill_number_key27; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ewaybills
    ADD CONSTRAINT ewaybills_eway_bill_number_key27 UNIQUE (eway_bill_number);


--
-- Name: ewaybills ewaybills_eway_bill_number_key28; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ewaybills
    ADD CONSTRAINT ewaybills_eway_bill_number_key28 UNIQUE (eway_bill_number);


--
-- Name: ewaybills ewaybills_eway_bill_number_key29; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ewaybills
    ADD CONSTRAINT ewaybills_eway_bill_number_key29 UNIQUE (eway_bill_number);


--
-- Name: ewaybills ewaybills_eway_bill_number_key3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ewaybills
    ADD CONSTRAINT ewaybills_eway_bill_number_key3 UNIQUE (eway_bill_number);


--
-- Name: ewaybills ewaybills_eway_bill_number_key30; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ewaybills
    ADD CONSTRAINT ewaybills_eway_bill_number_key30 UNIQUE (eway_bill_number);


--
-- Name: ewaybills ewaybills_eway_bill_number_key31; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ewaybills
    ADD CONSTRAINT ewaybills_eway_bill_number_key31 UNIQUE (eway_bill_number);


--
-- Name: ewaybills ewaybills_eway_bill_number_key32; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ewaybills
    ADD CONSTRAINT ewaybills_eway_bill_number_key32 UNIQUE (eway_bill_number);


--
-- Name: ewaybills ewaybills_eway_bill_number_key33; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ewaybills
    ADD CONSTRAINT ewaybills_eway_bill_number_key33 UNIQUE (eway_bill_number);


--
-- Name: ewaybills ewaybills_eway_bill_number_key34; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ewaybills
    ADD CONSTRAINT ewaybills_eway_bill_number_key34 UNIQUE (eway_bill_number);


--
-- Name: ewaybills ewaybills_eway_bill_number_key35; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ewaybills
    ADD CONSTRAINT ewaybills_eway_bill_number_key35 UNIQUE (eway_bill_number);


--
-- Name: ewaybills ewaybills_eway_bill_number_key4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ewaybills
    ADD CONSTRAINT ewaybills_eway_bill_number_key4 UNIQUE (eway_bill_number);


--
-- Name: ewaybills ewaybills_eway_bill_number_key5; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ewaybills
    ADD CONSTRAINT ewaybills_eway_bill_number_key5 UNIQUE (eway_bill_number);


--
-- Name: ewaybills ewaybills_eway_bill_number_key6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ewaybills
    ADD CONSTRAINT ewaybills_eway_bill_number_key6 UNIQUE (eway_bill_number);


--
-- Name: ewaybills ewaybills_eway_bill_number_key7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ewaybills
    ADD CONSTRAINT ewaybills_eway_bill_number_key7 UNIQUE (eway_bill_number);


--
-- Name: ewaybills ewaybills_eway_bill_number_key8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ewaybills
    ADD CONSTRAINT ewaybills_eway_bill_number_key8 UNIQUE (eway_bill_number);


--
-- Name: ewaybills ewaybills_eway_bill_number_key9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ewaybills
    ADD CONSTRAINT ewaybills_eway_bill_number_key9 UNIQUE (eway_bill_number);


--
-- Name: ewaybills ewaybills_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ewaybills
    ADD CONSTRAINT ewaybills_pkey PRIMARY KEY (id);


--
-- Name: expenses expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);


--
-- Name: godowns godowns_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.godowns
    ADD CONSTRAINT godowns_pkey PRIMARY KEY (id);


--
-- Name: gst_cache gst_cache_gstin_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gst_cache
    ADD CONSTRAINT gst_cache_gstin_key UNIQUE (gstin);


--
-- Name: gst_cache gst_cache_gstin_key1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gst_cache
    ADD CONSTRAINT gst_cache_gstin_key1 UNIQUE (gstin);


--
-- Name: gst_cache gst_cache_gstin_key10; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gst_cache
    ADD CONSTRAINT gst_cache_gstin_key10 UNIQUE (gstin);


--
-- Name: gst_cache gst_cache_gstin_key11; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gst_cache
    ADD CONSTRAINT gst_cache_gstin_key11 UNIQUE (gstin);


--
-- Name: gst_cache gst_cache_gstin_key12; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gst_cache
    ADD CONSTRAINT gst_cache_gstin_key12 UNIQUE (gstin);


--
-- Name: gst_cache gst_cache_gstin_key13; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gst_cache
    ADD CONSTRAINT gst_cache_gstin_key13 UNIQUE (gstin);


--
-- Name: gst_cache gst_cache_gstin_key14; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gst_cache
    ADD CONSTRAINT gst_cache_gstin_key14 UNIQUE (gstin);


--
-- Name: gst_cache gst_cache_gstin_key15; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gst_cache
    ADD CONSTRAINT gst_cache_gstin_key15 UNIQUE (gstin);


--
-- Name: gst_cache gst_cache_gstin_key16; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gst_cache
    ADD CONSTRAINT gst_cache_gstin_key16 UNIQUE (gstin);


--
-- Name: gst_cache gst_cache_gstin_key17; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gst_cache
    ADD CONSTRAINT gst_cache_gstin_key17 UNIQUE (gstin);


--
-- Name: gst_cache gst_cache_gstin_key18; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gst_cache
    ADD CONSTRAINT gst_cache_gstin_key18 UNIQUE (gstin);


--
-- Name: gst_cache gst_cache_gstin_key19; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gst_cache
    ADD CONSTRAINT gst_cache_gstin_key19 UNIQUE (gstin);


--
-- Name: gst_cache gst_cache_gstin_key2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gst_cache
    ADD CONSTRAINT gst_cache_gstin_key2 UNIQUE (gstin);


--
-- Name: gst_cache gst_cache_gstin_key20; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gst_cache
    ADD CONSTRAINT gst_cache_gstin_key20 UNIQUE (gstin);


--
-- Name: gst_cache gst_cache_gstin_key21; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gst_cache
    ADD CONSTRAINT gst_cache_gstin_key21 UNIQUE (gstin);


--
-- Name: gst_cache gst_cache_gstin_key22; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gst_cache
    ADD CONSTRAINT gst_cache_gstin_key22 UNIQUE (gstin);


--
-- Name: gst_cache gst_cache_gstin_key23; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gst_cache
    ADD CONSTRAINT gst_cache_gstin_key23 UNIQUE (gstin);


--
-- Name: gst_cache gst_cache_gstin_key24; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gst_cache
    ADD CONSTRAINT gst_cache_gstin_key24 UNIQUE (gstin);


--
-- Name: gst_cache gst_cache_gstin_key25; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gst_cache
    ADD CONSTRAINT gst_cache_gstin_key25 UNIQUE (gstin);


--
-- Name: gst_cache gst_cache_gstin_key26; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gst_cache
    ADD CONSTRAINT gst_cache_gstin_key26 UNIQUE (gstin);


--
-- Name: gst_cache gst_cache_gstin_key27; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gst_cache
    ADD CONSTRAINT gst_cache_gstin_key27 UNIQUE (gstin);


--
-- Name: gst_cache gst_cache_gstin_key28; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gst_cache
    ADD CONSTRAINT gst_cache_gstin_key28 UNIQUE (gstin);


--
-- Name: gst_cache gst_cache_gstin_key29; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gst_cache
    ADD CONSTRAINT gst_cache_gstin_key29 UNIQUE (gstin);


--
-- Name: gst_cache gst_cache_gstin_key3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gst_cache
    ADD CONSTRAINT gst_cache_gstin_key3 UNIQUE (gstin);


--
-- Name: gst_cache gst_cache_gstin_key30; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gst_cache
    ADD CONSTRAINT gst_cache_gstin_key30 UNIQUE (gstin);


--
-- Name: gst_cache gst_cache_gstin_key31; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gst_cache
    ADD CONSTRAINT gst_cache_gstin_key31 UNIQUE (gstin);


--
-- Name: gst_cache gst_cache_gstin_key32; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gst_cache
    ADD CONSTRAINT gst_cache_gstin_key32 UNIQUE (gstin);


--
-- Name: gst_cache gst_cache_gstin_key33; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gst_cache
    ADD CONSTRAINT gst_cache_gstin_key33 UNIQUE (gstin);


--
-- Name: gst_cache gst_cache_gstin_key34; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gst_cache
    ADD CONSTRAINT gst_cache_gstin_key34 UNIQUE (gstin);


--
-- Name: gst_cache gst_cache_gstin_key35; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gst_cache
    ADD CONSTRAINT gst_cache_gstin_key35 UNIQUE (gstin);


--
-- Name: gst_cache gst_cache_gstin_key4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gst_cache
    ADD CONSTRAINT gst_cache_gstin_key4 UNIQUE (gstin);


--
-- Name: gst_cache gst_cache_gstin_key5; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gst_cache
    ADD CONSTRAINT gst_cache_gstin_key5 UNIQUE (gstin);


--
-- Name: gst_cache gst_cache_gstin_key6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gst_cache
    ADD CONSTRAINT gst_cache_gstin_key6 UNIQUE (gstin);


--
-- Name: gst_cache gst_cache_gstin_key7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gst_cache
    ADD CONSTRAINT gst_cache_gstin_key7 UNIQUE (gstin);


--
-- Name: gst_cache gst_cache_gstin_key8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gst_cache
    ADD CONSTRAINT gst_cache_gstin_key8 UNIQUE (gstin);


--
-- Name: gst_cache gst_cache_gstin_key9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gst_cache
    ADD CONSTRAINT gst_cache_gstin_key9 UNIQUE (gstin);


--
-- Name: gst_cache gst_cache_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gst_cache
    ADD CONSTRAINT gst_cache_pkey PRIMARY KEY (id);


--
-- Name: invoice_items invoice_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_pkey PRIMARY KEY (id);


--
-- Name: invoicecounters invoicecounters_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoicecounters
    ADD CONSTRAINT invoicecounters_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_invoice_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_invoice_number_key UNIQUE (invoice_number);


--
-- Name: invoices invoices_invoice_number_key1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_invoice_number_key1 UNIQUE (invoice_number);


--
-- Name: invoices invoices_invoice_number_key10; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_invoice_number_key10 UNIQUE (invoice_number);


--
-- Name: invoices invoices_invoice_number_key11; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_invoice_number_key11 UNIQUE (invoice_number);


--
-- Name: invoices invoices_invoice_number_key12; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_invoice_number_key12 UNIQUE (invoice_number);


--
-- Name: invoices invoices_invoice_number_key13; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_invoice_number_key13 UNIQUE (invoice_number);


--
-- Name: invoices invoices_invoice_number_key14; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_invoice_number_key14 UNIQUE (invoice_number);


--
-- Name: invoices invoices_invoice_number_key15; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_invoice_number_key15 UNIQUE (invoice_number);


--
-- Name: invoices invoices_invoice_number_key16; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_invoice_number_key16 UNIQUE (invoice_number);


--
-- Name: invoices invoices_invoice_number_key17; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_invoice_number_key17 UNIQUE (invoice_number);


--
-- Name: invoices invoices_invoice_number_key18; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_invoice_number_key18 UNIQUE (invoice_number);


--
-- Name: invoices invoices_invoice_number_key19; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_invoice_number_key19 UNIQUE (invoice_number);


--
-- Name: invoices invoices_invoice_number_key2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_invoice_number_key2 UNIQUE (invoice_number);


--
-- Name: invoices invoices_invoice_number_key20; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_invoice_number_key20 UNIQUE (invoice_number);


--
-- Name: invoices invoices_invoice_number_key21; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_invoice_number_key21 UNIQUE (invoice_number);


--
-- Name: invoices invoices_invoice_number_key22; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_invoice_number_key22 UNIQUE (invoice_number);


--
-- Name: invoices invoices_invoice_number_key23; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_invoice_number_key23 UNIQUE (invoice_number);


--
-- Name: invoices invoices_invoice_number_key3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_invoice_number_key3 UNIQUE (invoice_number);


--
-- Name: invoices invoices_invoice_number_key4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_invoice_number_key4 UNIQUE (invoice_number);


--
-- Name: invoices invoices_invoice_number_key5; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_invoice_number_key5 UNIQUE (invoice_number);


--
-- Name: invoices invoices_invoice_number_key6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_invoice_number_key6 UNIQUE (invoice_number);


--
-- Name: invoices invoices_invoice_number_key7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_invoice_number_key7 UNIQUE (invoice_number);


--
-- Name: invoices invoices_invoice_number_key8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_invoice_number_key8 UNIQUE (invoice_number);


--
-- Name: invoices invoices_invoice_number_key9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_invoice_number_key9 UNIQUE (invoice_number);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: plans plans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plans
    ADD CONSTRAINT plans_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: purchase_items purchase_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_items
    ADD CONSTRAINT purchase_items_pkey PRIMARY KEY (id);


--
-- Name: purchase_order_items purchase_order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_pkey PRIMARY KEY (id);


--
-- Name: purchase_orders purchase_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_pkey PRIMARY KEY (id);


--
-- Name: purchases purchases_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_pkey PRIMARY KEY (id);


--
-- Name: quotationcounters quotationcounters_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotationcounters
    ADD CONSTRAINT quotationcounters_pkey PRIMARY KEY (id);


--
-- Name: quotationitems quotationitems_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotationitems
    ADD CONSTRAINT quotationitems_pkey PRIMARY KEY (id);


--
-- Name: quotations quotations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT quotations_pkey PRIMARY KEY (id);


--
-- Name: staff staff_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_pkey PRIMARY KEY (id);


--
-- Name: staffattendance staffattendance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staffattendance
    ADD CONSTRAINT staffattendance_pkey PRIMARY KEY (id);


--
-- Name: stock_movements stock_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_pkey PRIMARY KEY (id);


--
-- Name: stocklevels stocklevels_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stocklevels
    ADD CONSTRAINT stocklevels_pkey PRIMARY KEY (id);


--
-- Name: stockmovements stockmovements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stockmovements
    ADD CONSTRAINT stockmovements_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: suppliers suppliers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_pkey PRIMARY KEY (id);


--
-- Name: tax_settings tax_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tax_settings
    ADD CONSTRAINT tax_settings_pkey PRIMARY KEY (id);


--
-- Name: user_companies user_companies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_companies
    ADD CONSTRAINT user_companies_pkey PRIMARY KEY (id);


--
-- Name: usercompanies usercompanies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usercompanies
    ADD CONSTRAINT usercompanies_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_email_key1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key1 UNIQUE (email);


--
-- Name: users users_email_key10; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key10 UNIQUE (email);


--
-- Name: users users_email_key11; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key11 UNIQUE (email);


--
-- Name: users users_email_key12; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key12 UNIQUE (email);


--
-- Name: users users_email_key13; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key13 UNIQUE (email);


--
-- Name: users users_email_key14; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key14 UNIQUE (email);


--
-- Name: users users_email_key15; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key15 UNIQUE (email);


--
-- Name: users users_email_key16; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key16 UNIQUE (email);


--
-- Name: users users_email_key17; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key17 UNIQUE (email);


--
-- Name: users users_email_key18; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key18 UNIQUE (email);


--
-- Name: users users_email_key19; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key19 UNIQUE (email);


--
-- Name: users users_email_key2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key2 UNIQUE (email);


--
-- Name: users users_email_key20; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key20 UNIQUE (email);


--
-- Name: users users_email_key21; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key21 UNIQUE (email);


--
-- Name: users users_email_key22; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key22 UNIQUE (email);


--
-- Name: users users_email_key23; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key23 UNIQUE (email);


--
-- Name: users users_email_key24; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key24 UNIQUE (email);


--
-- Name: users users_email_key25; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key25 UNIQUE (email);


--
-- Name: users users_email_key26; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key26 UNIQUE (email);


--
-- Name: users users_email_key27; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key27 UNIQUE (email);


--
-- Name: users users_email_key28; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key28 UNIQUE (email);


--
-- Name: users users_email_key29; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key29 UNIQUE (email);


--
-- Name: users users_email_key3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key3 UNIQUE (email);


--
-- Name: users users_email_key30; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key30 UNIQUE (email);


--
-- Name: users users_email_key31; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key31 UNIQUE (email);


--
-- Name: users users_email_key32; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key32 UNIQUE (email);


--
-- Name: users users_email_key33; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key33 UNIQUE (email);


--
-- Name: users users_email_key34; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key34 UNIQUE (email);


--
-- Name: users users_email_key35; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key35 UNIQUE (email);


--
-- Name: users users_email_key36; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key36 UNIQUE (email);


--
-- Name: users users_email_key37; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key37 UNIQUE (email);


--
-- Name: users users_email_key4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key4 UNIQUE (email);


--
-- Name: users users_email_key5; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key5 UNIQUE (email);


--
-- Name: users users_email_key6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key6 UNIQUE (email);


--
-- Name: users users_email_key7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key7 UNIQUE (email);


--
-- Name: users users_email_key8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key8 UNIQUE (email);


--
-- Name: users users_email_key9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key9 UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: stock_levels_product_id_godown_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX stock_levels_product_id_godown_id ON public."StockLevels" USING btree (product_id, godown_id);


--
-- Name: stocklevels_product_id_godown_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX stocklevels_product_id_godown_id ON public.stocklevels USING btree (product_id, godown_id);


--
-- Name: Categories Categories_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Categories"
    ADD CONSTRAINT "Categories_company_id_fkey" FOREIGN KEY (company_id) REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CreditNoteItems CreditNoteItems_credit_note_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CreditNoteItems"
    ADD CONSTRAINT "CreditNoteItems_credit_note_id_fkey" FOREIGN KEY (credit_note_id) REFERENCES public."CreditNotes"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CreditNoteItems CreditNoteItems_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CreditNoteItems"
    ADD CONSTRAINT "CreditNoteItems_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public."Products"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CreditNotes CreditNotes_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CreditNotes"
    ADD CONSTRAINT "CreditNotes_company_id_fkey" FOREIGN KEY (company_id) REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CreditNotes CreditNotes_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CreditNotes"
    ADD CONSTRAINT "CreditNotes_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES public."Customers"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CreditNotes CreditNotes_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CreditNotes"
    ADD CONSTRAINT "CreditNotes_invoice_id_fkey" FOREIGN KEY (invoice_id) REFERENCES public."Invoices"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Customers Customers_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Customers"
    ADD CONSTRAINT "Customers_company_id_fkey" FOREIGN KEY (company_id) REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: EWayBills EWayBills_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EWayBills"
    ADD CONSTRAINT "EWayBills_company_id_fkey" FOREIGN KEY (company_id) REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: EWayBills EWayBills_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EWayBills"
    ADD CONSTRAINT "EWayBills_invoice_id_fkey" FOREIGN KEY (invoice_id) REFERENCES public."Invoices"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Expenses Expenses_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Expenses"
    ADD CONSTRAINT "Expenses_company_id_fkey" FOREIGN KEY (company_id) REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Godowns Godowns_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Godowns"
    ADD CONSTRAINT "Godowns_company_id_fkey" FOREIGN KEY (company_id) REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: InvoiceCounters InvoiceCounters_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InvoiceCounters"
    ADD CONSTRAINT "InvoiceCounters_company_id_fkey" FOREIGN KEY (company_id) REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: InvoiceItems InvoiceItems_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InvoiceItems"
    ADD CONSTRAINT "InvoiceItems_invoice_id_fkey" FOREIGN KEY (invoice_id) REFERENCES public."Invoices"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: InvoiceItems InvoiceItems_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InvoiceItems"
    ADD CONSTRAINT "InvoiceItems_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public."Products"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Invoices Invoices_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Invoices"
    ADD CONSTRAINT "Invoices_company_id_fkey" FOREIGN KEY (company_id) REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Payments Payments_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payments"
    ADD CONSTRAINT "Payments_company_id_fkey" FOREIGN KEY (company_id) REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Payments Payments_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payments"
    ADD CONSTRAINT "Payments_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES public."Customers"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Payments Payments_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payments"
    ADD CONSTRAINT "Payments_invoice_id_fkey" FOREIGN KEY (invoice_id) REFERENCES public."Invoices"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Payments Payments_purchase_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payments"
    ADD CONSTRAINT "Payments_purchase_id_fkey" FOREIGN KEY (purchase_id) REFERENCES public."Purchases"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Payments Payments_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payments"
    ADD CONSTRAINT "Payments_supplier_id_fkey" FOREIGN KEY (supplier_id) REFERENCES public."Suppliers"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Products Products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Products"
    ADD CONSTRAINT "Products_category_id_fkey" FOREIGN KEY (category_id) REFERENCES public."Categories"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Products Products_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Products"
    ADD CONSTRAINT "Products_company_id_fkey" FOREIGN KEY (company_id) REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PurchaseItems PurchaseItems_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseItems"
    ADD CONSTRAINT "PurchaseItems_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public."Products"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PurchaseItems PurchaseItems_purchase_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseItems"
    ADD CONSTRAINT "PurchaseItems_purchase_id_fkey" FOREIGN KEY (purchase_id) REFERENCES public."Purchases"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Purchases Purchases_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Purchases"
    ADD CONSTRAINT "Purchases_company_id_fkey" FOREIGN KEY (company_id) REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Purchases Purchases_godown_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Purchases"
    ADD CONSTRAINT "Purchases_godown_id_fkey" FOREIGN KEY (godown_id) REFERENCES public."Godowns"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Purchases Purchases_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Purchases"
    ADD CONSTRAINT "Purchases_supplier_id_fkey" FOREIGN KEY (supplier_id) REFERENCES public."Suppliers"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: QuotationCounters QuotationCounters_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."QuotationCounters"
    ADD CONSTRAINT "QuotationCounters_company_id_fkey" FOREIGN KEY (company_id) REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: QuotationItems QuotationItems_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."QuotationItems"
    ADD CONSTRAINT "QuotationItems_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public."Products"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: QuotationItems QuotationItems_quotation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."QuotationItems"
    ADD CONSTRAINT "QuotationItems_quotation_id_fkey" FOREIGN KEY (quotation_id) REFERENCES public."Quotations"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Quotations Quotations_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Quotations"
    ADD CONSTRAINT "Quotations_company_id_fkey" FOREIGN KEY (company_id) REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Quotations Quotations_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Quotations"
    ADD CONSTRAINT "Quotations_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES public."Customers"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Quotations Quotations_godown_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Quotations"
    ADD CONSTRAINT "Quotations_godown_id_fkey" FOREIGN KEY (godown_id) REFERENCES public."Godowns"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StaffAttendance StaffAttendance_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StaffAttendance"
    ADD CONSTRAINT "StaffAttendance_staff_id_fkey" FOREIGN KEY (staff_id) REFERENCES public."Staff"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Staff Staff_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Staff"
    ADD CONSTRAINT "Staff_company_id_fkey" FOREIGN KEY (company_id) REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StockLevels StockLevels_godown_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StockLevels"
    ADD CONSTRAINT "StockLevels_godown_id_fkey" FOREIGN KEY (godown_id) REFERENCES public."Godowns"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StockLevels StockLevels_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StockLevels"
    ADD CONSTRAINT "StockLevels_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public."Products"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StockMovements StockMovements_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StockMovements"
    ADD CONSTRAINT "StockMovements_company_id_fkey" FOREIGN KEY (company_id) REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StockMovements StockMovements_godown_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StockMovements"
    ADD CONSTRAINT "StockMovements_godown_id_fkey" FOREIGN KEY (godown_id) REFERENCES public."Godowns"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StockMovements StockMovements_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StockMovements"
    ADD CONSTRAINT "StockMovements_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public."Products"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Subscriptions Subscriptions_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Subscriptions"
    ADD CONSTRAINT "Subscriptions_company_id_fkey" FOREIGN KEY (company_id) REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Subscriptions Subscriptions_coupon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Subscriptions"
    ADD CONSTRAINT "Subscriptions_coupon_id_fkey" FOREIGN KEY (coupon_id) REFERENCES public."Coupons"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Suppliers Suppliers_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Suppliers"
    ADD CONSTRAINT "Suppliers_company_id_fkey" FOREIGN KEY (company_id) REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserCompanies UserCompanies_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserCompanies"
    ADD CONSTRAINT "UserCompanies_company_id_fkey" FOREIGN KEY (company_id) REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserCompanies UserCompanies_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserCompanies"
    ADD CONSTRAINT "UserCompanies_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Users Users_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_company_id_fkey" FOREIGN KEY (company_id) REFERENCES public."Companies"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: categories categories_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: creditnoteitems creditnoteitems_credit_note_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.creditnoteitems
    ADD CONSTRAINT creditnoteitems_credit_note_id_fkey FOREIGN KEY (credit_note_id) REFERENCES public.creditnotes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: creditnoteitems creditnoteitems_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.creditnoteitems
    ADD CONSTRAINT creditnoteitems_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: creditnotes creditnotes_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.creditnotes
    ADD CONSTRAINT creditnotes_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: creditnotes creditnotes_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.creditnotes
    ADD CONSTRAINT creditnotes_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: creditnotes creditnotes_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.creditnotes
    ADD CONSTRAINT creditnotes_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: customers customers_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ewaybills ewaybills_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ewaybills
    ADD CONSTRAINT ewaybills_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ewaybills ewaybills_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ewaybills
    ADD CONSTRAINT ewaybills_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: expenses expenses_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: godowns godowns_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.godowns
    ADD CONSTRAINT godowns_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: invoice_items invoice_items_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: invoice_items invoice_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: invoicecounters invoicecounters_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoicecounters
    ADD CONSTRAINT invoicecounters_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: invoices invoices_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: invoices invoices_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: invoices invoices_godown_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_godown_id_fkey FOREIGN KEY (godown_id) REFERENCES public.godowns(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: payments payments_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: payments payments_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: payments payments_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: payments payments_purchase_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_purchase_id_fkey FOREIGN KEY (purchase_id) REFERENCES public.purchases(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: payments payments_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: products products_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: purchase_items purchase_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_items
    ADD CONSTRAINT purchase_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: purchase_items purchase_items_purchase_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_items
    ADD CONSTRAINT purchase_items_purchase_id_fkey FOREIGN KEY (purchase_id) REFERENCES public.purchases(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: purchase_order_items purchase_order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: purchase_order_items purchase_order_items_purchase_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_purchase_order_id_fkey FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: purchase_orders purchase_orders_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: purchase_orders purchase_orders_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: purchases purchases_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: purchases purchases_godown_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_godown_id_fkey FOREIGN KEY (godown_id) REFERENCES public.godowns(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: purchases purchases_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: quotationcounters quotationcounters_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotationcounters
    ADD CONSTRAINT quotationcounters_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: quotationitems quotationitems_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotationitems
    ADD CONSTRAINT quotationitems_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: quotationitems quotationitems_quotation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotationitems
    ADD CONSTRAINT quotationitems_quotation_id_fkey FOREIGN KEY (quotation_id) REFERENCES public.quotations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: quotations quotations_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT quotations_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: quotations quotations_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT quotations_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: quotations quotations_godown_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT quotations_godown_id_fkey FOREIGN KEY (godown_id) REFERENCES public.godowns(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: staff staff_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: staffattendance staffattendance_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staffattendance
    ADD CONSTRAINT staffattendance_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.staff(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: stocklevels stocklevels_godown_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stocklevels
    ADD CONSTRAINT stocklevels_godown_id_fkey FOREIGN KEY (godown_id) REFERENCES public.godowns(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: stocklevels stocklevels_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stocklevels
    ADD CONSTRAINT stocklevels_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: stockmovements stockmovements_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stockmovements
    ADD CONSTRAINT stockmovements_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: stockmovements stockmovements_godown_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stockmovements
    ADD CONSTRAINT stockmovements_godown_id_fkey FOREIGN KEY (godown_id) REFERENCES public.godowns(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: stockmovements stockmovements_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stockmovements
    ADD CONSTRAINT stockmovements_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: subscriptions subscriptions_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: subscriptions subscriptions_coupon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_coupon_id_fkey FOREIGN KEY (coupon_id) REFERENCES public.coupons(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: subscriptions subscriptions_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.plans(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: suppliers suppliers_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: usercompanies usercompanies_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usercompanies
    ADD CONSTRAINT usercompanies_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: usercompanies usercompanies_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usercompanies
    ADD CONSTRAINT usercompanies_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: users users_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict QmqW5360KlvKZbzmMeJrwNXC5mgeo5di1lWc77QDfKnjoZ68VBmVjNr6dp91KHY

