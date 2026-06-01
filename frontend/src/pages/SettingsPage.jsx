import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import api, { companyAPI, authAPI, utilityAPI } from '../services/api';
import { getAssetUrl, BACKEND_URL, getErrorMessage } from '../config/api';
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSearchParams, useNavigate, Link } from 'react-router-dom';

import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../components/ui/accordion";
import {
  Card,
  CardContent,
} from '../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "../components/ui/form";
import { Switch } from "../components/ui/switch";
import { Badge } from '../components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../components/ui/command";
import {
  Building2,
  User,
  Users,
  Shield,
  Plus,
  Trash2,
  Save,
  KeyRound,
  Mail,
  Phone,
  UserCog,
  ShieldCheck,
  Settings,
  Settings2,
  Warehouse,
  MapPin,
  RefreshCcw,
  Pencil,
  ChevronRight,
  ChevronDown,
  FileText,
  CreditCard,
  Lock,
  Palette,
  Printer,
  Upload,
  Image as ImageIcon,
  Briefcase,
  Search,
  Loader2,
  X,
  Check,
  CheckCircle2,
  Banknote,
  Layout,
  QrCode,
  Type,
  Bell,
  Gift,
  HelpCircle,
  Info,
  ArrowLeft,
  MessageCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import { industries } from "../lib/industryConfig";

// --- Schemas ---

const profileSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const userSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
  role: z.enum(["admin", "staff"]).default("staff"),
});

const businessSchema = z.object({
  name: z.string().min(2, "Business name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  email: z.string().email("Invalid email address").or(z.literal("")),
  address: z.string().min(5, "Address is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().length(6, "Pincode must be 6 digits"),
  city: z.string().min(2, "City is required"),
  business_types: z.array(z.string()).default([]),
  industry: z.string().min(1, "Industry type is required"),
  registration_type: z.string().min(1, "Registration type is required"),
  extra_details: z.array(z.object({ label: z.string(), value: z.string() })).default([])
});

const taxSchema = z.object({
  gst_registered: z.boolean().default(false),
  gst_number: z.string().optional().or(z.literal("")),
  pan_number: z.string().optional().or(z.literal("")),
  enable_tds: z.boolean().default(false),
  enable_tcs: z.boolean().default(false),
});

const bankSchema = z.object({
  bank_name: z.string().min(2, "Bank name is required"),
  account_number: z.string().min(5, "Account number is required"),
  ifsc_code: z.string().length(11, "IFSC code must be 11 characters"),
  branch_name: z.string().min(2, "Branch name is required"),
  terms_conditions: z.string().optional()
});

const customizationSchema = z.object({
  template_id: z.string().min(1, "Please select a template"),
});

// --- Constants ---

const registrationTypes = [
  "Sole Proprietorship", "Partnership", "LLP", "Private Limited", "Public Limited", "One Person Company"
];

const businessTypes = [
  "Retailer", "Wholesaler", "Distributor", "Manufacturer", "Services", "Other"
];

const states = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands",
  "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi",
  "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const templates = [
  { id: 'modern', name: 'Modern Professional', preview: 'https://placehold.co/200x280?text=Modern' },
  { id: 'classic', name: 'Classic Compact', preview: 'https://placehold.co/200x280?text=Classic' },
  { id: 'minimal', name: 'Minimalist', preview: 'https://placehold.co/200x280?text=Minimal' },
  { id: 'gst-standard', name: 'Standard GST', preview: 'https://placehold.co/200x280?text=GST' }
];

const BUSINESS_CONFIGS = {
  distribution: {
    labels: { f1: 'Item Description', f2: 'HSN/SAC', f3: 'Batch/Lot #', f4: 'Rate', f5: 'GST', f6: 'Discount' },
    toggles: { showF1: true, showF2: true, showF3: false, showF4: true, showF5: true, showF6: true }
  },
  retail: {
    labels: { f1: 'Product Name', f2: 'Unit', f3: 'Price', f4: 'Tax%', f5: 'Discount%', f6: 'Final Price' },
    toggles: { showF1: true, showF2: false, showF3: true, showF4: true, showF5: true, showF6: true }
  },
  automobile: {
    labels: { f1: 'PARTS DESCRIPTION', f2: 'HSN/Code', f3: 'MRP/RATE', f4: 'QTY', f5: 'Discount%', f6: 'Total Amount' },
    toggles: { showF1: true, showF2: true, showF3: true, showF4: true, showF5: true, showF6: true }
  },
  group5_service: {
    labels: { f1: 'Service Provided', f2: 'Date', f3: 'Consultation Fee', f4: 'GST/Tax', f5: 'Discount', f6: 'Project Code' },
    toggles: { showF1: true, showF2: false, showF3: true, showF4: true, showF5: true, showF6: false }
  },
  group6_mfg_construction: {
    labels: { f1: 'Material Name', f2: 'Supplier ID', f3: 'PO Number', f4: 'UOM', f5: 'Rate', f6: 'Total' },
    toggles: { showF1: true, showF2: true, showF3: false, showF4: true, showF5: true, showF6: true }
  },
  generic: {
    labels: { f1: 'Description', f2: 'Date', f3: 'Rate', f4: 'Amount', f5: 'Tax', f6: 'Total' },
    toggles: { showF1: true, showF2: false, showF3: true, showF4: true, showF5: true, showF6: true }
  }
};

// --- Main Component ---

export const SettingsPage = () => {
  const { user, company, refreshProfile, hasFeature, subscription } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSection = searchParams.get('section') || 'business-details';

  const [gstLoading, setGstLoading] = useState(false);

  // GST Lookup Handler
  const handleGstLookup = async () => {
    const gstin = taxForm.getValues('gst_number');
    if (!gstin || gstin.length !== 15) {
      toast.error("Please enter a valid 15-digit GSTIN");
      return;
    }

    setGstLoading(true);
    try {
      const { data } = await utilityAPI.getGST(gstin);

      // Auto-fill fields if they exist in this form or related forms
      // For SettingsPage, we might want to update business details too
      // But taxForm only has tax fields. We need to handle this carefully.

      if (data) {
        toast.success("GST details fetched successfully");
        // Update GST number in case it was formatted
        taxForm.setValue('gst_number', data.gstin);

        // If we want to auto-fill business details, we need to switch or access businessForm
        // For now, let's at least show the data or update what we can.
        console.log("Fetched GST Data:", data);

        // If businessForm is accessible (it is defined below in the component)
        if (businessForm) {
          businessForm.setValue('name', data.legal_name || data.trade_name);
          if (data.address_details) {
            const addr = data.address_details;
            const fullAddr = `${addr.building_name}, ${addr.street}, ${addr.location}, ${addr.city}`;
            businessForm.setValue('address', fullAddr);
            businessForm.setValue('city', addr.city);
            businessForm.setValue('state', addr.state);
            businessForm.setValue('pincode', addr.pincode);
          }
        }
      }
    } catch (error) {
      console.error("GST Lookup Error:", error);
      toast.error(getErrorMessage(error, "Could not find details for this GSTIN. Please enter manually."));
    } finally {
      setGstLoading(false);
    }
  };

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Data States
  const [users, setUsers] = useState([]);
  const [godowns, setGodowns] = useState([]);
  const [logoPreview, setLogoPreview] = useState(null);
  const [signaturePreview, setSignaturePreview] = useState(null);
  const [qrPreview, setQrPreview] = useState(null);

  // Dialog States
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [godownDialogOpen, setGodownDialogOpen] = useState(false);
  const [editGodownDialogOpen, setEditGodownDialogOpen] = useState(false);
  const [newGodown, setNewGodown] = useState({ name: '', address: '' });
  const [editingGodown, setEditingGodown] = useState(null);

  // Expanded Menu States
  const [expandedMenus, setExpandedMenus] = useState(['account', 'business', 'invoice']);

  const toggleMenu = (menuId) => {
    setExpandedMenus(prev =>
      prev.includes(menuId) ? prev.filter(m => m !== menuId) : [...prev, menuId]
    );
  };

  // --- Forms ---

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", phone: "" },
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const newUserForm = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: { name: "", email: "", password: "", phone: "", role: "staff" },
  });

  const businessForm = useForm({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      name: "", phone: "", email: "", address: "", state: "Karnataka",
      pincode: "", city: "", business_types: [], industry: "Retail",
      registration_type: "Sole Proprietorship", extra_details: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: businessForm.control,
    name: "extra_details"
  });

  const taxForm = useForm({
    resolver: zodResolver(taxSchema),
    defaultValues: {
      gst_registered: false, gst_number: "", pan_number: "",
      enable_tds: false, enable_tcs: false
    }
  });

  const bankForm = useForm({
    resolver: zodResolver(bankSchema),
    defaultValues: {
      bank_name: "", account_number: "", ifsc_code: "",
      branch_name: "", terms_conditions: ""
    }
  });

  const customForm = useForm({
    resolver: zodResolver(customizationSchema),
    defaultValues: { template_id: "modern" }
  });

  const invoiceCustomForm = useForm({
    defaultValues: {
      template_id: 'stylish',
      theme_color: '#4F46E5',
      show_party_balance: false,
      enable_free_quantity: false,
      show_item_description: true,
      show_alternate_unit: true,
      show_phone_number: true,
      show_time: false,
      price_history: false,
      auto_apply_luxury: true,
      show_po_number: false,
      show_eway_bill: false,
      show_vehicle_number: false,
      invoice_industry_type: '',
    }
  });

  // --- Fetch Logic ---

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [usersRes, godownsRes, companyRes] = await Promise.all([
          companyAPI.getUsers(),
          companyAPI.getGodowns(),
          companyAPI.get()
        ]);

        setUsers(usersRes.data);
        setGodowns(godownsRes.data);

        const c = companyRes.data;

        // Reset Invoice Customization Form
        invoiceCustomForm.reset({
          template_id: c.settings?.template_id || 'stylish',
          theme_color: c.settings?.theme_color || '#4F46E5',
          show_party_balance: c.settings?.show_party_balance || false,
          enable_free_quantity: c.settings?.enable_free_quantity || false,
          show_item_description: c.settings?.show_item_description ?? true,
          show_alternate_unit: c.settings?.show_alternate_unit ?? true,
          show_phone_number: c.settings?.show_phone_number ?? true,
          show_po_number: c.settings?.show_po_number || false,
          show_eway_bill: c.settings?.show_eway_bill || false,
          show_vehicle_number: c.settings?.show_vehicle_number || false,
          invoice_industry_type: c.settings?.invoice_industry_type || c.business_category || '',
          show_time: c.settings?.show_time || false,
          price_history: c.settings?.price_history || false,
          auto_apply_luxury: c.settings?.auto_apply_luxury ?? true,
        });

        businessForm.reset({
          name: c.name || "",
          phone: c.phone || "",
          email: c.email || "",
          address: c.address || "",
          state: c.state || "Karnataka",
          pincode: c.pincode || "",
          city: c.city || "",
          business_types: c.settings?.businessTypes || [],
          industry: c.business_category || "Retail",
          registration_type: c.settings?.ownerType || "Sole Proprietorship",
          extra_details: c.settings?.extra_details || []
        });

        taxForm.reset({
          gst_registered: c.gst_registered ?? !!c.gst_number,
          gst_number: c.gst_number || "",
          pan_number: c.settings?.pan_number || "",
          enable_tds: c.enable_tds ?? !!c.settings?.enableTDS,
          enable_tcs: c.enable_tcs ?? !!c.settings?.enableTCS
        });

        bankForm.reset({
          bank_name: c.bank_name || "",
          account_number: c.account_number || "",
          ifsc_code: c.ifsc_code || "",
          branch_name: c.branch_name || "",
          terms_conditions: c.terms_conditions || ""
        });

        customForm.reset({
          template_id: c.settings?.template_id || c.settings?.invoice_template || "modern"
        });

        if (c.logo) setLogoPreview(getAssetUrl(c.logo));
        if (c.signature) setSignaturePreview(getAssetUrl(c.signature));
        if (c.qr_code) setQrPreview(getAssetUrl(c.qr_code));

        if (user) {
          profileForm.reset({ name: user.name || '', phone: user.phone || '' });
        }
      } catch (err) {
        toast.error("Failed to load settings data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [businessForm, taxForm, profileForm, bankForm, customForm, user]);

  // --- Submit Handlers ---

  const handleProfileSubmit = async (values) => {
    setSubmitting(true);
    try {
      await authAPI.updateProfile(values);
      toast.success('Profile updated successfully');
      refreshProfile();
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (values) => {
    setSubmitting(true);
    try {
      await authAPI.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      });
      toast.success('Password changed successfully');
      passwordForm.reset();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to change password'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleBusinessSubmit = async (values) => {
    setSubmitting(true);
    try {
      const payload = {
        ...values,
        business_category: values.industry,
        settings: {
          ...company.settings,
          industry: values.industry,
          ownerType: values.registration_type,
          businessTypes: values.business_types,
          extra_details: values.extra_details
        }
      };
      await companyAPI.update(payload);
      toast.success("Business details updated");
      refreshProfile();
    } catch {
      toast.error("Failed to save business details");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTaxSubmit = async (values) => {
    setSubmitting(true);
    try {
      const payload = {
        gst_registered: values.gst_registered,
        gst_number: values.gst_registered ? values.gst_number : "",
        enable_tds: values.enable_tds,
        enable_tcs: values.enable_tcs,
        settings: {
          pan_number: values.pan_number
        }
      };
      await api.patch('/company/settings', payload);
      toast.success("Tax & GST settings updated");
      refreshProfile();
    } catch {
      toast.error("Failed to save tax settings");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBankSubmit = async (values) => {
    setSubmitting(true);
    try {
      await companyAPI.update(values);
      toast.success("Banking & Payment details updated");
      refreshProfile();
    } catch {
      toast.error("Failed to save bank details");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCustomSubmit = async (values) => {
    setSubmitting(true);
    try {
      await api.patch('/company/settings', {
        settings: { template_id: values.template_id }
      });
      toast.success("Invoice template updated");
      refreshProfile();
    } catch {
      toast.error("Failed to update template");
    } finally {
      setSubmitting(false);
    }
  };

  const handleInvoiceCustomSubmit = async (values) => {
    setSubmitting(true);
    try {
      await api.patch('/company/settings', { settings: values });
      toast.success("Invoice customization saved");
      refreshProfile();
    } catch (error) {
      toast.error("Failed to save customization");
    } finally {
      setSubmitting(false);
    }
  };

  // Plan-based template access
  const getPlanName = () => {
    const plan = subscription?.plan || subscription?.Plan;
    return plan?.plan_name || 'Free';
  };

  // Helper for optimistic toggle updates
  const handleOptimisticToggle = async (field, value) => {
    const prevValues = taxForm.getValues();
    taxForm.setValue(field, value);

    try {
      const payload = {};

      if (field === 'gst_registered') payload.gst_registered = value;
      if (field === 'enable_tds') payload.enable_tds = value;
      if (field === 'enable_tcs') payload.enable_tcs = value;

      await api.patch('/company/settings', payload);
      refreshProfile();
    } catch (err) {
      taxForm.setValue(field, prevValues[field]);
      toast.error("Failed to update setting");
    }
  };

  const onFileUpload = async (type, file) => {
    if (file.size > 5 * 1024 * 1024) return toast.error("Maximum file size is 5MB");
    const formData = new FormData();
    formData.append(type, file);
    try {
      let endpoint = '';
      if (type === 'logo') endpoint = '/company/upload-logo';
      else if (type === 'signature') endpoint = '/company/upload-signature';
      else if (type === 'qr_code') endpoint = '/company/upload-qr';

      const res = await api.post(endpoint, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const filePath = res.data.logo || res.data.signature || res.data.qr_code;
      const previewUrl = getAssetUrl(filePath);

      if (type === 'logo') setLogoPreview(previewUrl);
      else if (type === 'signature') setSignaturePreview(previewUrl);
      else if (type === 'qr_code') setQrPreview(previewUrl);

      refreshProfile();
      toast.success(`${type.split('_').join(' ').toUpperCase()} uploaded`);
    } catch {
      toast.error(`Failed to upload ${type}`);
    }
  };

  // --- Godown Handlers ---

  const onAddGodown = async (e) => {
    e.preventDefault();
    if (!newGodown.name) return toast.error("Name is required");
    try {
      setSubmitting(true);
      await companyAPI.addGodown(newGodown);
      toast.success("Godown added");
      setGodownDialogOpen(false);
      setNewGodown({ name: '', address: '' });
      const res = await companyAPI.getGodowns();
      setGodowns(res.data);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to add godown"));
    } finally {
      setSubmitting(false);
    }
  };

  const onDeleteGodown = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await companyAPI.deleteGodown(id);
      toast.success("Godown deleted");
      const res = await companyAPI.getGodowns();
      setGodowns(res.data);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete godown"));
    }
  };

  // --- Team Handlers ---

  const onAddUser = async (values) => {
    setSubmitting(true);
    try {
      await companyAPI.addUser(values);
      toast.success('User added');
      setUserDialogOpen(false);
      newUserForm.reset();
      const res = await companyAPI.getUsers();
      setUsers(res.data);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to add user'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await companyAPI.deleteUser(id);
      toast.success('User deleted');
      const res = await companyAPI.getUsers();
      setUsers(res.data);
    } catch {
      toast.error('Failed to delete user');
    }
  };

  // --- Navigation Items (Flat like MyBillBook) ---

  const navItems = [
    { id: 'account-profile', label: 'Account', icon: User },
    { id: 'business-details', label: 'Manage Business', icon: Building2 },
    { id: 'invoice-customization', label: 'Invoice Settings', icon: FileText },
    { id: 'invoice-print', label: 'Print Settings', icon: Printer },
    { id: 'team', label: 'Manage Users', icon: Users },
    { id: 'business-tax', label: 'Tax & GST', icon: Settings2 },
    { id: 'business-godowns', label: 'Godowns', icon: Warehouse },
    { id: 'payments', label: 'Payment & Bank', icon: CreditCard },
    { id: 'reminders', label: 'Reminders', icon: Bell },
    { id: 'refer', label: 'Refer & Earn', icon: Gift },
    { id: 'help', label: 'Help And Support', icon: HelpCircle },
  ];

  // Section title mapping
  const sectionTitles = {
    'account-profile': { title: 'Account', subtitle: 'Manage your profile and security' },
    'account-security': { title: 'Security', subtitle: 'Change your password' },
    'business-details': { title: 'Business Settings', subtitle: 'Edit Your Company Settings And Information' },
    'business-tax': { title: 'Tax & GST Settings', subtitle: 'Manage your tax configuration' },
    'business-godowns': { title: 'Godown Management', subtitle: 'Manage your inventory locations' },
    'invoice-customization': { title: 'Invoice Settings', subtitle: 'Customize your invoice appearance' },
    'invoice-print': { title: 'Print Settings', subtitle: 'Configure printers and paper sizes' },
    'payments': { title: 'Payment & Bank Settings', subtitle: 'Manage banking and payment details' },
    'team': { title: 'Manage Users', subtitle: 'Add and manage team members' },
    'reminders': { title: 'Reminders', subtitle: 'Set up automated reminders' },
    'refer': { title: 'Refer & Earn', subtitle: 'Share Bill Easy and earn rewards' },
    'help': { title: 'Help And Support', subtitle: 'Get help with Bill Easy' },
  };

  const currentSection = sectionTitles[activeSection] || { title: 'Settings', subtitle: '' };

  const currentForm = useMemo(() => {
    if (activeSection === 'account-profile') return profileForm;
    if (activeSection === 'account-security') return passwordForm;
    if (activeSection === 'business-details') return businessForm;
    if (activeSection === 'business-tax') return taxForm;
    if (activeSection === 'payments') return bankForm;
    if (activeSection === 'invoice-customization') return invoiceCustomForm;
    return null;
  }, [activeSection, profileForm, passwordForm, businessForm, taxForm, bankForm, invoiceCustomForm]);
  const handleGlobalSubmit = () => {
    if (activeSection === 'account-profile') profileForm.handleSubmit(handleProfileSubmit)();
    else if (activeSection === 'account-security') passwordForm.handleSubmit(handlePasswordSubmit)();
    else if (activeSection === 'business-details') businessForm.handleSubmit(handleBusinessSubmit)();
    else if (activeSection === 'business-tax') taxForm.handleSubmit(handleTaxSubmit)();
    else if (activeSection === 'payments') bankForm.handleSubmit(handleBankSubmit)();
    else if (activeSection === 'invoice-customization') invoiceCustomForm.handleSubmit(handleInvoiceCustomSubmit)();
  };

  if (loading) return (
    <div className="flex h-[calc(100vh-80px)] items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-[#4F46E5]" />
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-80px)] -m-4 md:-m-6 lg:-m-8 bg-white overflow-hidden">

      {/* MyBillBook-style Left Sidebar */}
      <aside className="w-56 bg-white border-r border-slate-200 flex flex-col shrink-0">

        {/* Company Info */}
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#4F46E5] rounded-full flex items-center justify-center text-white font-bold text-sm">
              {company?.name?.charAt(0)?.toUpperCase() || 'B'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{company?.name || 'My Business'}</p>
              <p className="text-xs text-slate-500 truncate">{company?.phone || ''}</p>
            </div>
          </div>
        </div>

        {/* Back to Dashboard */}
        <div className="px-3 pt-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#4F46E5] text-white text-xs font-semibold rounded-lg hover:bg-[#4338CA] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </button>
        </div>

        {/* Flat Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-3">
          <ul className="space-y-0.5">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setSearchParams({ section: item.id })}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium rounded-lg transition-all",
                      isActive
                        ? "bg-[#4F46E5] text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    )}
                  >
                    <item.icon className={cn("w-4 h-4", isActive ? "text-white" : "text-slate-400")} />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Trust Badges */}
        <div className="px-4 py-3 border-t border-slate-200 space-y-2">
          <p className="text-[10px] font-semibold text-slate-400">App Version : 1.0.0</p>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-emerald-600">
              <Shield className="w-3 h-3" />
              <span className="text-[9px] font-bold">100% Secure</span>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <ShieldCheck className="w-3 h-3" />
              <span className="text-[9px] font-bold">ISO Certified</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">

        {/* Header with Section Title + Actions */}
        <header className="border-b border-slate-200 bg-white flex items-center justify-between px-6 py-3 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{currentSection.title}</h2>
            <p className="text-xs text-slate-500">{currentSection.subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button className="h-8 bg-[#E66E26] hover:bg-[#d45d1d] text-white text-xs font-semibold" onClick={() => navigate('/settings/business/new')}>
              Create new business
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-slate-300">
              <MessageCircle className="w-3.5 h-3.5" />
              Chat Support
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs border-slate-300" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button
              disabled={submitting || (currentForm && !currentForm.formState.isDirty)}
              onClick={handleGlobalSubmit}
              size="sm"
              className="h-8 bg-[#22C55E] hover:bg-[#16A34A] text-white text-xs font-semibold min-w-[100px]"
            >
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save Changes"}
            </Button>
          </div>
        </header>

        {/* Scrollable Form Content (no Card wrapper) */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl">

            {activeSection === 'account-profile' && (
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-8">
                  <div className="grid grid-cols-2 gap-8">
                    <FormField
                      control={profileForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl><Input className="h-11" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl><Input className="h-11" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl><Input value={user?.email} disabled className="h-11 bg-slate-50" /></FormControl>
                      <FormDescription>Your login email cannot be changed.</FormDescription>
                    </FormItem>
                    <FormItem>
                      <FormLabel>Account Role</FormLabel>
                      <div className="h-11 flex items-center"><Badge className="bg-emerald-50 text-emerald-700 border-emerald-100">{user?.role?.toUpperCase()}</Badge></div>
                    </FormItem>
                  </div>
                </form>
              </Form>
            )}

            {activeSection === 'account-security' && (
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-8">
                  <div className="grid grid-cols-2 gap-8">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Password</FormLabel>
                          <FormControl><Input type="password" placeholder="••••••••" className="h-11" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="space-y-8">
                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl><Input type="password" placeholder="••••••••" className="h-11" {...field} /></FormControl>
                            <FormDescription>At least 6 characters.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl><Input type="password" placeholder="••••••••" className="h-11" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </form>
              </Form>
            )}

            {activeSection === 'business-details' && (
              <Form {...businessForm}>
                <form onSubmit={businessForm.handleSubmit(handleBusinessSubmit)} className="space-y-12">
                  {/* Note banner like MyBillBook */}
                  <div className="flex items-center gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <Info className="w-4 h-4 text-blue-600 shrink-0" />
                    <p className="text-sm text-blue-700 font-medium">Note: Details added below will be shown on your Invoices</p>
                  </div>
                  <div className="grid grid-cols-2 gap-12">
                    {/* Left Col */}
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <Label>Business Logo</Label>
                        <div className="w-32 h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative group overflow-hidden" onClick={() => document.getElementById('logo-in').click()}>
                          {logoPreview ? <img src={logoPreview} className="w-full h-full object-contain p-2" alt="Logo" /> : <ImageIcon className="w-8 h-8 text-slate-300" />}
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Upload className="w-6 h-6 text-white" /></div>
                        </div>
                        <input id="logo-in" type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files[0] && onFileUpload('logo', e.target.files[0])} />
                      </div>
                      <FormField control={businessForm.control} name="name" render={({ field }) => (
                        <FormItem><FormLabel>Business Name *</FormLabel><FormControl><Input className="h-11" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField control={businessForm.control} name="phone" render={({ field }) => (
                          <FormItem><FormLabel>Phone</FormLabel><FormControl><Input className="h-11" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={businessForm.control} name="email" render={({ field }) => (
                          <FormItem><FormLabel>Email</FormLabel><FormControl><Input className="h-11" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                      </div>
                      <FormField control={businessForm.control} name="address" render={({ field }) => (
                        <FormItem><FormLabel>Address</FormLabel><FormControl><Textarea className="min-h-[100px]" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField control={businessForm.control} name="state" render={({ field }) => (
                          <FormItem><FormLabel>State</FormLabel>
                            <Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className="h-11 w-full justify-between font-normal">{field.value || "Select"}<Search className="w-4 h-4 opacity-50" /></Button></FormControl></PopoverTrigger>
                              <PopoverContent className="w-full p-0"><Command><CommandInput placeholder="Search..." /><CommandList><CommandEmpty>No results</CommandEmpty><CommandGroup>{states.map(s => <CommandItem key={s} onSelect={() => businessForm.setValue("state", s, { shouldDirty: true })}><Check className={cn("mr-2 h-4 w-4", s === field.value ? "opacity-100" : "opacity-0")} />{s}</CommandItem>)}</CommandGroup></CommandList></Command></PopoverContent></Popover>
                            <FormMessage /></FormItem>
                        )} />
                        <FormField control={businessForm.control} name="pincode" render={({ field }) => (
                          <FormItem><FormLabel>Pincode</FormLabel><FormControl><Input className="h-11" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                      </div>
                      <FormField control={businessForm.control} name="city" render={({ field }) => (
                        <FormItem><FormLabel>City</FormLabel><FormControl><Input className="h-11" placeholder="Enter City" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                    {/* Right Col */}
                    <div className="space-y-8">
                      <FormField control={businessForm.control} name="business_types" render={({ field }) => (
                        <FormItem><FormLabel>Business Types</FormLabel>
                          <Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className="min-h-11 h-auto w-full justify-between font-normal px-3 py-2"><div className="flex items-center gap-1 flex-wrap flex-1 text-left">{(field.value?.length > 0) ? field.value.map(v => <Badge key={v} variant="secondary" className="mr-1 bg-slate-100 font-medium">{v}</Badge>) : <span className="text-slate-400">Select business types</span>}</div><ChevronDown className="w-4 h-4 opacity-50 shrink-0 ml-2" /></Button></FormControl></PopoverTrigger>
                            <PopoverContent className="w-full p-0"><Command><CommandInput placeholder="Search type..." /><CommandList><CommandEmpty>No results</CommandEmpty><CommandGroup>{businessTypes.map(t => <CommandItem key={t} onSelect={() => { const cur = field.value || []; const next = cur.includes(t) ? cur.filter(x => x !== t) : [...cur, t]; field.onChange(next); businessForm.setValue('business_types', next, { shouldDirty: true }); }}><Check className={cn("mr-2 h-4 w-4", field.value?.includes(t) ? "opacity-100" : "opacity-0")} />{t}</CommandItem>)}</CommandGroup></CommandList></Command></PopoverContent></Popover>
                          <FormMessage /></FormItem>
                      )} />
                      <FormField control={businessForm.control} name="industry" render={({ field }) => (
                        <FormItem><FormLabel>Industry Type</FormLabel>
                          <Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className="h-11 w-full justify-between font-normal"><div className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-slate-400" />{field.value || "Select"}</div><Search className="w-4 h-4 opacity-50" /></Button></FormControl></PopoverTrigger>
                            <PopoverContent className="w-full p-0"><Command><CommandInput placeholder="Search..." /><CommandList><CommandEmpty>No results</CommandEmpty><CommandGroup>{industries.map(i => <CommandItem key={i} onSelect={() => businessForm.setValue("industry", i, { shouldDirty: true })}><Check className={cn("mr-2 h-4 w-4", i === field.value ? "opacity-100" : "opacity-0")} />{i}</CommandItem>)}</CommandGroup></CommandList></Command></PopoverContent></Popover>
                          <FormMessage /></FormItem>
                      )} />
                      <FormField control={businessForm.control} name="registration_type" render={({ field }) => (
                        <FormItem><FormLabel>Business Registration Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger className="h-11"><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="Sole Proprietorship">Sole Proprietorship</SelectItem>
                              <SelectItem value="Partnership">Partnership</SelectItem>
                              <SelectItem value="LLP">LLP</SelectItem>
                              <SelectItem value="Private Limited">Private Limited</SelectItem>
                              <SelectItem value="Public Limited">Public Limited</SelectItem>
                              <SelectItem value="One Person Company">One Person Company</SelectItem>
                              <SelectItem value="Trust">Trust</SelectItem>
                              <SelectItem value="Society">Society</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage /></FormItem>
                      )} />
                      <div className="space-y-4">
                        <Label>Authorized Signature</Label>
                        <div className="h-40 border-2 border-dashed rounded-xl flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative group" onClick={() => document.getElementById('sig-in').click()}>
                          {signaturePreview ? <img src={signaturePreview} className="h-full object-contain p-4" alt="Signature" /> : <div className="flex flex-col items-center gap-2"><Plus className="w-6 h-6 text-indigo-600" /><span className="text-sm font-medium text-slate-500">Add Signature</span></div>}
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Upload className="w-6 h-6 text-white" /></div>
                        </div>
                        <input id="sig-in" type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files[0] && onFileUpload('signature', e.target.files[0])} />
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between"><Label>Custom Fields</Label><Button type="button" variant="ghost" size="sm" className="text-indigo-600 h-8 px-2" onClick={() => append({ label: "", value: "" })}><Plus className="w-4 h-4 mr-1" />Add</Button></div>
                        <div className="space-y-2">{fields.map((item, index) => (
                          <div key={item.id} className="flex gap-2"><Input placeholder="Label" className="h-10" {...businessForm.register(`extra_details.${index}.label`)} /><Input placeholder="Value" className="h-10" {...businessForm.register(`extra_details.${index}.value`)} /><Button variant="ghost" size="icon" className="text-rose-500" onClick={() => remove(index)}><Trash2 className="w-4 h-4" /></Button></div>
                        ))}</div>
                      </div>
                    </div>
                  </div>
                </form>
              </Form>
            )}

            {activeSection === 'business-tax' && (
              <Form {...taxForm}>
                <form onSubmit={taxForm.handleSubmit(handleTaxSubmit)} className="space-y-12">
                  <div className="grid grid-cols-2 gap-12">
                    <div className="space-y-6">
                      <FormField control={taxForm.control} name="gst_registered" render={({ field }) => (
                        <FormItem className="flex items-center justify-between p-6 bg-slate-50 rounded-xl border border-slate-200"><div className="space-y-0.5"><FormLabel className="text-base">GST Registered</FormLabel><p className="text-xs text-slate-500">Does this business have a GSTIN?</p></div><FormControl><Switch checked={field.value} onCheckedChange={(val) => handleOptimisticToggle('gst_registered', val)} /></FormControl></FormItem>
                      )} />
                      {taxForm.watch("gst_registered") && (
                        <FormField control={taxForm.control} name="gst_number" render={({ field }) => (
                          <FormItem>
                            <FormLabel>GSTIN</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  className="h-11 bg-white pr-12 uppercase"
                                  placeholder="22AAAAA0000A1Z5"
                                  {...field}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-1 top-1 h-9 w-9 p-0 text-indigo-600 hover:text-indigo-700"
                                  onClick={handleGstLookup}
                                  disabled={gstLoading}
                                >
                                  {gstLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Search className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            <FormDescription>Enter 15-digit GSTIN to auto-fill business details</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )} />
                      )}
                    </div>
                    <div className="space-y-8">
                      <FormField control={taxForm.control} name="pan_number" render={({ field }) => (
                        <FormItem><FormLabel>PAN Number</FormLabel><FormControl><Input className="h-11 bg-white uppercase" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField control={taxForm.control} name="enable_tds" render={({ field }) => (
                          <FormItem className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200"><FormLabel className="cursor-pointer">Enable TDS</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={(val) => handleOptimisticToggle('enable_tds', val)} /></FormControl></FormItem>
                        )} />
                        <FormField control={taxForm.control} name="enable_tcs" render={({ field }) => (
                          <FormItem className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200"><FormLabel className="cursor-pointer">Enable TCS</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={(val) => handleOptimisticToggle('enable_tcs', val)} /></FormControl></FormItem>
                        )} />
                      </div>
                    </div>
                  </div>
                </form>
              </Form>
            )}

            {activeSection === 'business-godowns' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <div className="space-y-1"><h3 className="text-lg font-bold text-slate-900">Godown Management</h3><p className="text-sm text-slate-500">Manage your inventory locations and warehouses.</p></div>
                  {hasFeature('multi_godowns') && (
                    <Dialog open={godownDialogOpen} onOpenChange={setGodownDialogOpen}>
                      <DialogTrigger asChild><Button className="bg-emerald-600 hover:bg-emerald-700"><Plus className="w-4 h-4 mr-2" />Add Godown</Button></DialogTrigger>
                      <DialogContent><DialogHeader><DialogTitle>Add New Godown</DialogTitle><DialogDescription>Create a new storage location.</DialogDescription></DialogHeader>
                        <form onSubmit={onAddGodown} className="space-y-4 pt-4">
                          <div className="space-y-2"><Label>Name *</Label><Input value={newGodown.name} onChange={(e) => setNewGodown({ ...newGodown, name: e.target.value })} required /></div>
                          <div className="space-y-2"><Label>Address</Label><Input value={newGodown.address} onChange={(e) => setNewGodown({ ...newGodown, address: e.target.value })} /></div>
                          <DialogFooter><Button type="submit" disabled={submitting} className="w-full bg-emerald-600">{submitting ? '...' : 'Create'}</Button></DialogFooter>
                        </form></DialogContent></Dialog>
                  )}
                </div>
                <div className="rounded-xl border border-slate-200 overflow-hidden"><Table><TableHeader className="bg-slate-50"><TableRow><TableHead>Name</TableHead><TableHead>Location</TableHead><TableHead>Type</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{godowns.map(g => (
                  <TableRow key={g.id}><TableCell className="font-semibold">{g.name}</TableCell><TableCell className="text-xs text-slate-500">{g.address || '-'}</TableCell><TableCell>{g.is_default ? <Badge className="bg-blue-50 text-blue-700">Default</Badge> : <Badge variant="outline">Sub</Badge>}</TableCell><TableCell className="text-right">{!g.is_default && <Button variant="ghost" size="icon" onClick={() => onDeleteGodown(g.id)} className="text-rose-600"><Trash2 className="w-4 h-4" /></Button>}</TableCell></TableRow>
                ))}</TableBody></Table></div>
                {!hasFeature('multi_godowns') && <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm font-medium">Upgrade to Enterprise to add multiple godowns.</div>}
              </div>
            )}

            {activeSection === 'team' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <div className="space-y-1"><h3 className="text-lg font-bold text-slate-900">Team Management</h3><p className="text-sm text-slate-500">Manage your organization's members and their roles.</p></div>
                  <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
                    <DialogTrigger asChild><Button className="bg-indigo-600 hover:bg-indigo-700"><Plus className="w-4 h-4 mr-2" />Add Member</Button></DialogTrigger>
                    <DialogContent><DialogHeader><DialogTitle>Add Team Member</DialogTitle></DialogHeader>
                      <Form {...newUserForm}><form onSubmit={newUserForm.handleSubmit(onAddUser)} className="space-y-4 pt-4">
                        <FormField control={newUserForm.control} name="name" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={newUserForm.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={newUserForm.control} name="password" render={({ field }) => (<FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={newUserForm.control} name="role" render={({ field }) => (<FormItem><FormLabel>Role</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="admin">Admin</SelectItem><SelectItem value="staff">Staff</SelectItem></SelectContent></Select></FormItem>)} />
                        <DialogFooter><Button type="submit" disabled={submitting} className="w-full bg-indigo-600">{submitting ? '...' : 'Create'}</Button></DialogFooter>
                      </form></Form></DialogContent></Dialog>
                </div>
                <div className="rounded-xl border border-slate-200 overflow-hidden"><Table><TableHeader className="bg-slate-50"><TableRow><TableHead>Member</TableHead><TableHead>Role</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{users.map(u => (
                  <TableRow key={u.id}><TableCell><div><div className="font-semibold">{u.name}</div><div className="text-xs text-slate-500">{u.email}</div></div></TableCell><TableCell><Badge variant="outline" className="capitalize">{u.role}</Badge></TableCell><TableCell className="text-right">{u.role !== 'owner' && u.id !== user?.id && <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(u.id)} className="text-rose-600"><Trash2 className="w-4 h-4" /></Button>}</TableCell></TableRow>
                ))}</TableBody></Table></div>
              </div>
            )}

            {activeSection === 'invoice-customization' && (() => {
              const planName = getPlanName();
              const ALL_TEMPLATES = [
                { id: 'luxury', name: 'Luxury', color: '#8B5CF6' },
                { id: 'stylish', name: 'Stylish', color: '#4F46E5' },
                { id: 'adv-gst', name: 'Advanced GST', color: '#0369A1' },
                { id: 'adv-gst-tally', name: 'GST (Tally)', color: '#0F766E' },
                { id: 'billbook', name: 'Billbook', color: '#1D4ED8' },
                { id: 'billbook-a5', name: 'Billbook (A5)', color: '#1E40AF' },
                { id: 'modern', name: 'Modern', color: '#0F172A' },
                { id: 'simple', name: 'Simple', color: '#64748B' },
                { id: 'custom', name: 'Custom', color: '#E11D48', enterprise: true },
              ];
              const freeTemplates = ['stylish'];
              const premiumTemplates = ['luxury', 'stylish', 'adv-gst', 'billbook', 'modern'];
              const isTemplateLocked = (tid) => {
                if (planName === 'Enterprise') return false;
                if (planName === 'Premium') return !premiumTemplates.includes(tid);
                return !freeTemplates.includes(tid);
              };
              const selectedTmpl = ALL_TEMPLATES.find(t => t.id === invoiceCustomForm.watch('template_id')) || ALL_TEMPLATES[1];
              const activeColor = invoiceCustomForm.watch('theme_color') || selectedTmpl.color;
              return (
              <Form {...invoiceCustomForm}>
                <form onSubmit={invoiceCustomForm.handleSubmit(handleInvoiceCustomSubmit)} className="h-[calc(100vh-140px)] flex flex-col md:flex-row -m-6 overflow-hidden bg-slate-50">
                  {/* Left Pane - Live Preview */}
                  <div className="flex-1 p-8 overflow-y-auto flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-slate-800">Invoice Settings</h3>
                      <Button variant="outline" size="sm" type="button" onClick={() => invoiceCustomForm.reset()} className="bg-white">Revert to Original</Button>
                    </div>
                    <div className="flex-1 bg-white border border-slate-200 shadow-sm rounded-lg relative flex flex-col min-h-[550px] overflow-hidden">
                      {/* Template-reactive colored top bar */}
                      <div className="h-2 w-full" style={{ backgroundColor: activeColor }}></div>
                      <div className="p-8 flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-6 border-b pb-4">
                        <div>
                          <h2 className="text-2xl font-bold" style={{ color: activeColor }}>{company?.name || 'Your Business'}</h2>
                          {taxForm.getValues('pan_number') && <p className="text-xs text-slate-500 mt-1">Pan No <span className="font-semibold">{taxForm.getValues('pan_number')}</span> &nbsp; GSTIN <span className="font-semibold">{taxForm.getValues('gst_number') || ''}</span></p>}
                          <p className="text-xs text-slate-500 mt-1">📞 {company?.phone || ''}</p>
                          <p className="text-xs text-slate-500 mt-1 max-w-xs">📍 {company?.address || 'Business address'}{company?.state ? `, ${company.state}` : ''}{company?.pincode ? ` - ${company.pincode}` : ''}</p>
                        </div>
                        <div className="text-right space-y-2">
                          <span className="text-xs font-bold px-3 py-1.5 border-2 rounded text-white" style={{ borderColor: activeColor, backgroundColor: activeColor }}>TAX INVOICE</span>
                          <p className="text-[9px] text-slate-400 mt-2">ORIGINAL FOR RECIPIENT</p>
                        </div>
                      </div>
                      {/* Invoice meta row */}
                      <div className="flex gap-4 text-xs mb-4 p-3 rounded" style={{ backgroundColor: activeColor + '10' }}>
                        <div><span className="text-slate-500 block">Invoice No.</span><span className="font-bold">AABBCCDD/202</span></div>
                        <div><span className="text-slate-500 block">Invoice Date</span><span className="font-bold">17/01/2023</span></div>
                        <div><span className="text-slate-500 block">Due Date</span><span className="font-bold">16/02/2023</span></div>
                        {invoiceCustomForm.watch('show_vehicle_number') && <div><span className="text-slate-500 block">Vehicle No.</span><span className="font-bold">12312321</span></div>}
                        {invoiceCustomForm.watch('show_po_number') && <div><span className="text-slate-500 block">PO Number</span><span className="font-bold">PO-4521</span></div>}
                        {invoiceCustomForm.watch('show_eway_bill') && <div><span className="text-slate-500 block">E-way Bill</span><span className="font-bold">EWB-789</span></div>}
                      </div>
                      <div className="grid grid-cols-2 gap-6 text-sm mb-4 p-3 bg-slate-50 rounded">
                        <div>
                          <p className="text-slate-500 mb-1 text-xs font-bold tracking-widest">BILL TO</p>
                          <p className="font-bold text-slate-900">Sample Party</p>
                          <p className="text-slate-600 text-xs mt-1">1234123 324324234, Bengaluru</p>
                          {invoiceCustomForm.watch('show_phone_number') && <p className="text-slate-600 text-xs mt-1">Ph: 9876543210</p>}
                        </div>
                        <div className="text-right space-y-1">
                          {invoiceCustomForm.watch('show_time') && <p className="text-xs text-slate-400">Time: 14:30</p>}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="w-full border-t border-b py-2 flex text-xs font-bold text-white" style={{ backgroundColor: activeColor }}>
                          <div className="flex-1 px-2">ITEM NAME</div>
                          <div className="w-16 text-right px-2">QTY</div>
                          <div className="w-24 text-right px-2">PRICE</div>
                          <div className="w-24 text-right px-2">AMOUNT</div>
                        </div>
                        <div className="w-full py-3 flex text-sm text-slate-800 border-b border-slate-100 px-2">
                          <div className="flex-1">
                            PUMA BLUE ROUND NECK T-SHIRT
                            {invoiceCustomForm.watch('show_item_description') && <p className="text-xs text-slate-400 mt-0.5">Size XL, Cotton</p>}
                          </div>
                          <div className="w-16 text-right">2 {invoiceCustomForm.watch('show_alternate_unit') ? 'BOX' : 'PCS'}</div>
                          <div className="w-24 text-right">900</div>
                          <div className="w-24 text-right font-semibold">1,800</div>
                        </div>
                        <div className="w-full py-3 flex text-sm text-slate-800 border-b border-slate-100 px-2">
                          <div className="flex-1">
                            Pane-G 200g
                            {invoiceCustomForm.watch('show_item_description') && <p className="text-xs text-slate-400 mt-0.5">HSN: 40911209</p>}
                          </div>
                          <div className="w-16 text-right">1 {invoiceCustomForm.watch('show_alternate_unit') ? 'BOX' : 'PCS'}</div>
                          <div className="w-24 text-right">342.86</div>
                          <div className="w-24 text-right font-semibold">342.86</div>
                        </div>
                        {invoiceCustomForm.watch('show_party_balance') && (
                          <div className="w-full py-3 flex justify-end text-sm border-b border-slate-100">
                            <div className="w-48 text-right text-slate-500">Previous Balance:</div>
                            <div className="w-24 text-right font-semibold text-rose-600">₹ 4,500</div>
                          </div>
                        )}
                      </div>
                      </div>
                    </div>
                    <div className="mt-4">
                        <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm space-y-3">
                          <div className="flex gap-2 text-xs flex-wrap">
                            <span className="font-semibold text-orange-500 flex items-center gap-1">✨ Try using</span>
                            {['Easy to Read', 'Brand Touch', 'Highlight Key Info'].map(t => (
                              <button key={t} type="button" className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-full hover:bg-slate-100">{t}</button>
                            ))}
                          </div>
                          <div className="relative">
                            <input type="text" placeholder="Write anything to style your invoice..." className="w-full pl-3 pr-12 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 ring-indigo-500/20" />
                            <button type="button" className="absolute right-2 top-2 w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center hover:bg-slate-300">
                              <ArrowLeft className="w-4 h-4 text-slate-600 rotate-90" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  {/* Right Pane - Settings Sidebar */}
                  <div className="w-96 bg-white border-l border-slate-200 flex flex-col h-full shrink-0">
                    <div className="p-4 border-b border-slate-200 shrink-0">
                      <Button type="submit" disabled={submitting} className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white">
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                      </Button>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      {/* Themes Grid with Plan Gating */}
                      <div className="p-5 border-b border-slate-200 space-y-4">
                        <h4 className="font-bold text-slate-800 flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full border-[3px] border-indigo-600" /> Themes
                          <span className="ml-auto text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{planName}</span>
                        </h4>
                        <div className="grid grid-cols-3 gap-3">
                          {ALL_TEMPLATES.map(t => {
                            const locked = isTemplateLocked(t.id);
                            return (
                              <button
                                key={t.id}
                                type="button"
                                disabled={locked}
                                onClick={() => { if (!locked) { invoiceCustomForm.setValue('template_id', t.id, { shouldDirty: true }); invoiceCustomForm.setValue('theme_color', t.color, { shouldDirty: true }); }}}
                                className={cn("flex flex-col items-center gap-1.5 group relative", locked && "opacity-50 cursor-not-allowed")}
                              >
                                <div className={cn(
                                  "w-full aspect-[1/1.4] border-2 rounded-lg bg-slate-50 transition-all p-1",
                                  invoiceCustomForm.watch('template_id') === t.id ? "border-indigo-600 ring-2 ring-indigo-100" : "border-slate-200 group-hover:border-slate-300"
                                )}>
                                  <div className="w-full h-full bg-white border shadow-sm rounded-sm p-1 space-y-1">
                                    <div className="h-1.5 rounded-sm w-full" style={{ backgroundColor: t.color }}></div>
                                    <div className="h-1 bg-slate-200 w-1/2"></div>
                                    <div className="h-2 bg-slate-100 w-full"></div>
                                    <div className="h-4 bg-slate-50 w-full border border-slate-100"></div>
                                  </div>
                                </div>
                                <span className="text-[10px] text-slate-600 font-medium">{t.name}</span>
                                {locked && <Lock className="w-3 h-3 text-slate-400 absolute top-1 right-1" />}
                              </button>
                            );
                          })}
                        </div>
                        {planName === 'Free' && <p className="text-[10px] text-amber-600 bg-amber-50 p-2 rounded-lg">Upgrade to Premium for 5 templates or Enterprise for all + custom.</p>}
                      </div>
                      {/* Theme Styling */}
                      <div className="p-5 border-b border-slate-200 bg-slate-50/50 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-800 flex items-center gap-2"><Palette className="w-4 h-4 text-indigo-600" /> Theme Styling</h4>
                          <Badge className="bg-red-500 text-[9px] px-1.5 py-0 h-4">New</Badge>
                        </div>
                        <FormField control={invoiceCustomForm.control} name="theme_color" render={({ field }) => (
                          <FormItem>
                            <div className="flex gap-3">
                              {['#1D70B8', '#4F46E5', '#E66E26', '#16A34A', '#DC2626', '#000000'].map(c => (
                                <button key={c} type="button" onClick={() => field.onChange(c)}
                                  className={cn("w-6 h-6 rounded-full border-[3px] transition-transform", field.value === c ? "border-slate-300 scale-110 shadow-sm" : "border-transparent opacity-80 hover:opacity-100")}
                                  style={{ backgroundColor: c }} />
                              ))}
                            </div>
                          </FormItem>
                        )} />
                      </div>
                      {/* Checkboxes */}
                      <div className="p-5 border-b border-slate-200 space-y-3">
                        {[
                          { name: 'show_party_balance', label: 'Show party balance in invoice' },
                          { name: 'enable_free_quantity', label: 'Enable free item quantity' },
                          { name: 'show_item_description', label: 'Show item description in invoice' },
                          { name: 'show_alternate_unit', label: 'Show Alternate Unit in Invoice' },
                          { name: 'show_phone_number', label: 'Show phone number on Invoice' },
                          { name: 'show_time', label: 'Show time on Invoices', icon: <Info className="w-3.5 h-3.5 text-slate-400" /> },
                          { name: 'price_history', label: 'Price History', icon: <Info className="w-3.5 h-3.5 text-slate-400" /> },
                          { name: 'auto_apply_luxury', label: 'Auto-apply luxury theme for sharing' }
                        ].map((item) => (
                          <FormField key={item.name} control={invoiceCustomForm.control} name={item.name} render={({ field }) => (
                            <FormItem className="flex items-center gap-3 space-y-0">
                              <FormControl>
                                <input type="checkbox" className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300" checked={field.value} onChange={field.onChange} />
                              </FormControl>
                              <FormLabel className="text-sm font-normal text-slate-700 cursor-pointer flex items-center gap-1.5 leading-none">
                                {item.label} {item.icon && item.icon}
                              </FormLabel>
                            </FormItem>
                          )} />
                        ))}
                      </div>
                      {/* Accordions */}
                      <div className="px-2 pb-6">
                        <Accordion type="multiple" defaultValue={['invoice-details']} className="w-full">
                          <AccordionItem value="invoice-details" className="border-b-0">
                            <AccordionTrigger className="px-4 py-3 hover:bg-slate-50 rounded-lg font-bold text-slate-800">Invoice Details</AccordionTrigger>
                            <AccordionContent className="px-4 space-y-4">
                              <FormField control={invoiceCustomForm.control} name="invoice_industry_type" render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs text-slate-500">Industry Type</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl><SelectTrigger className="h-10"><SelectValue placeholder="Select industry" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                      {industries.map(i => <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>)}
                                    </SelectContent>
                                  </Select>
                                </FormItem>
                              )} />
                              {[
                                { name: 'show_po_number', label: 'PO Number' },
                                { name: 'show_eway_bill', label: 'E-way Bill Number' },
                                { name: 'show_vehicle_number', label: 'Vehicle Number' },
                              ].map(item => (
                                <FormField key={item.name} control={invoiceCustomForm.control} name={item.name} render={({ field }) => (
                                  <FormItem className="flex items-center gap-3 space-y-0">
                                    <FormControl>
                                      <input type="checkbox" className="w-4 h-4 rounded text-indigo-600 border-slate-300" checked={field.value} onChange={field.onChange} />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal text-slate-700 cursor-pointer leading-none">{item.label}</FormLabel>
                                  </FormItem>
                                )} />
                              ))}
                            </AccordionContent>
                          </AccordionItem>
                          <AccordionItem value="party-details" className="border-b-0">
                            <AccordionTrigger className="px-4 py-3 hover:bg-slate-50 rounded-lg font-bold text-slate-800">Party Details</AccordionTrigger>
                            <AccordionContent className="px-4 text-slate-500">Configure what customer information is displayed on the invoice.</AccordionContent>
                          </AccordionItem>
                          <AccordionItem value="item-table" className="border-b-0">
                            <AccordionTrigger className="px-4 py-3 hover:bg-slate-50 rounded-lg font-bold text-slate-800">Item Table Columns</AccordionTrigger>
                            <AccordionContent className="px-4 text-slate-500">Toggle HSN, Discount, and Tax columns.</AccordionContent>
                          </AccordionItem>
                          <AccordionItem value="misc" className="border-b-0">
                            <AccordionTrigger className="px-4 py-3 hover:bg-slate-50 rounded-lg font-bold text-slate-800">
                              <span>Miscellaneous Details</span>
                              <Badge className="bg-blue-500 hover:bg-blue-600 text-[9px] px-1.5 py-0 ml-2">New</Badge>
                            </AccordionTrigger>
                            <AccordionContent className="px-4 text-slate-500">Additional signature and stamp configurations.</AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>
                    </div>
                  </div>
                </form>
              </Form>
              );
            })()}

            {activeSection === 'payments' && (
              <Form {...bankForm}>
                <form onSubmit={bankForm.handleSubmit(handleBankSubmit)} className="space-y-12">
                  <div className="grid grid-cols-2 gap-12">
                    <div className="space-y-8">
                      <div className="space-y-1">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Banknote className="w-5 h-5 text-indigo-600" /> Bank Account Details</h3>
                        <p className="text-sm text-slate-500">These details will appear on your invoices for customer payments.</p>
                      </div>

                      <div className="space-y-6">
                        <FormField control={bankForm.control} name="bank_name" render={({ field }) => (
                          <FormItem><FormLabel>Bank Name</FormLabel><FormControl><Input className="h-11" placeholder="e.g. HDFC Bank" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={bankForm.control} name="account_number" render={({ field }) => (
                          <FormItem><FormLabel>Account Number</FormLabel><FormControl><Input className="h-11" placeholder="Enter account number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField control={bankForm.control} name="ifsc_code" render={({ field }) => (
                            <FormItem><FormLabel>IFSC Code</FormLabel><FormControl><Input className="h-11 uppercase" placeholder="HDFC0001234" {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                          <FormField control={bankForm.control} name="branch_name" render={({ field }) => (
                            <FormItem><FormLabel>Branch Name</FormLabel><FormControl><Input className="h-11" placeholder="Branch location" {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-8">
                      <div className="space-y-1">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><QrCode className="w-5 h-5 text-indigo-600" /> Payment QR Code</h3>
                        <p className="text-sm text-slate-500">Upload your UPI QR code to accept instant payments.</p>
                      </div>

                      <div
                        className="aspect-square w-48 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative group overflow-hidden mx-auto"
                        onClick={() => document.getElementById('qr-in').click()}
                      >
                        {qrPreview ? (
                          <img src={qrPreview} className="w-full h-full object-contain p-4" alt="UPI QR" />
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-slate-400">
                            <QrCode className="w-10 h-10 opacity-20" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Upload QR Code</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Upload className="w-6 h-6 text-white" /></div>
                      </div>
                      <input id="qr-in" type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files[0] && onFileUpload('qr_code', e.target.files[0])} />

                      <FormField control={bankForm.control} name="terms_conditions" render={({ field }) => (
                        <FormItem><FormLabel>Terms & Conditions (Footer)</FormLabel><FormControl><Textarea className="min-h-[120px] resize-none" placeholder="e.g. 1. Goods once sold will not be taken back..." {...field} /></FormControl><FormDescription>This text appears at the bottom of every invoice.</FormDescription><FormMessage /></FormItem>
                      )} />
                    </div>
                  </div>
                </form>
              </Form>
            )}

            {['invoice-print'].includes(activeSection) && (
              <div className="space-y-8">
                <div className="space-y-2">
                  <div className="flex items-center gap-3"><Printer className="w-6 h-6 text-indigo-600" /><h3 className="text-xl font-bold">Print Settings</h3></div>
                  <p className="text-sm text-slate-500">Configure thermal and barcode printing options for your business.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
                  {/* Left Sidebar */}
                  <div className="space-y-6">
                    <div className="flex border-b border-slate-200">
                      <button type="button" className="px-4 py-3 text-sm font-bold text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50">Thermal Printer</button>
                      <button type="button" className="px-4 py-3 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50">Barcode Printer</button>
                    </div>
                    <div className="space-y-8 px-2">
                      <div className="space-y-4">
                        <Label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Paper Size</Label>
                        <div className="space-y-3">
                          <button type="button" className="w-full py-3 border-2 border-indigo-600 rounded-lg text-sm font-bold text-indigo-700 bg-indigo-50 text-left px-4">2 Inch (58mm)</button>
                          <button type="button" className="w-full py-3 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 text-left px-4">3 Inch (80mm)</button>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <Label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Business Logo (Monochrome)</Label>
                        <div className="h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer" onClick={() => document.getElementById('mono-logo-in').click()}>
                          <ImageIcon className="w-8 h-8 text-slate-300 mb-2" />
                          <span className="text-xs text-indigo-600 font-medium">Upload Monochrome Logo</span>
                        </div>
                        <input id="mono-logo-in" type="file" className="hidden" accept="image/*" />
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <p className="text-[10px] text-slate-500 leading-relaxed">
                            Upload in Monochrome, *.bmp extension. Max: 210px width x 70px height. <a href="#" className="text-indigo-600 hover:underline">Learn how</a>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Right Preview */}
                  <div className="md:col-span-2">
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 mb-6 font-medium">
                      This is a preview of the Thermal print of your invoice. Some columns might not appear if they don't have the required information.
                    </div>
                    <div className="w-full min-h-[500px] bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center">
                      <div className="text-center text-slate-400 space-y-2">
                        <Printer className="w-12 h-12 mx-auto opacity-30" />
                        <p className="text-sm font-medium">Thermal Receipt Preview</p>
                        <p className="text-xs">Select a paper size to see a live preview</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}


            {activeSection === 'reminders' && (
              <div className="space-y-8">
                <div className="space-y-2">
                  <div className="flex items-center gap-3"><Bell className="w-6 h-6 text-[#4F46E5]" /><h3 className="text-xl font-bold">Reminders</h3></div>
                  <p className="text-sm text-slate-500">Set up automated reminders for invoice payments and follow-ups.</p>
                </div>
                <div className="p-8 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-3">
                  <Bell className="w-12 h-12 text-slate-300 mx-auto" />
                  <h4 className="text-lg font-bold text-slate-700">Coming Soon</h4>
                  <p className="text-sm text-slate-500 max-w-md mx-auto">Automated payment reminders, overdue notifications, and follow-up scheduling will be available in a future update.</p>
                </div>
              </div>
            )}

            {activeSection === 'refer' && (
              <div className="space-y-8">
                <div className="space-y-2">
                  <div className="flex items-center gap-3"><Gift className="w-6 h-6 text-[#E66E26]" /><h3 className="text-xl font-bold">Refer & Earn</h3></div>
                  <p className="text-sm text-slate-500">Share Bill Easy with other businesses and earn rewards.</p>
                </div>
                <div className="p-8 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border border-orange-200 text-center space-y-3">
                  <Gift className="w-12 h-12 text-orange-400 mx-auto" />
                  <h4 className="text-lg font-bold text-slate-700">Referral Program</h4>
                  <p className="text-sm text-slate-500 max-w-md mx-auto">Invite your business contacts to Bill Easy. When they subscribe, you both earn rewards! Coming soon.</p>
                </div>
              </div>
            )}

            {activeSection === 'help' && (
              <div className="space-y-8">
                <div className="space-y-2">
                  <div className="flex items-center gap-3"><HelpCircle className="w-6 h-6 text-[#4F46E5]" /><h3 className="text-xl font-bold">Help & Support</h3></div>
                  <p className="text-sm text-slate-500">Get help with Bill Easy features and troubleshooting.</p>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-6 bg-white rounded-xl border border-slate-200 hover:shadow-md transition-shadow cursor-pointer space-y-3">
                    <Mail className="w-8 h-8 text-[#4F46E5]" />
                    <h4 className="font-bold text-slate-900">Email Support</h4>
                    <p className="text-sm text-slate-500">Write to us at support@billeasy.com for any queries or issues.</p>
                  </div>
                  <div className="p-6 bg-white rounded-xl border border-slate-200 hover:shadow-md transition-shadow cursor-pointer space-y-3">
                    <Phone className="w-8 h-8 text-emerald-600" />
                    <h4 className="font-bold text-slate-900">Phone Support</h4>
                    <p className="text-sm text-slate-500">Call us at +91 99869 95848 (Mon-Sat, 9 AM - 6 PM)</p>
                  </div>
                </div>
              </div>
            )}


          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
