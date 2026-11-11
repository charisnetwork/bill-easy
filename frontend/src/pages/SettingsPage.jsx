import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import api, { companyAPI, authAPI, utilityAPI } from '../services/api';
import { getAssetUrl, getErrorMessage } from '../config/api';
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSearchParams, useNavigate } from 'react-router-dom';

import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';

import {
  Card
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
  Plus,
  Trash2,
  Save,
  Mail,
  Phone,
  Settings,
  Settings2,
  Warehouse,
  ChevronDown,
  FileText,
  CreditCard,
  Lock,
  Upload,
  Image as ImageIcon,
  Briefcase,
  Search,
  Loader2,
  Check,
  Banknote,
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
import { IndustryPicker } from "../components/IndustryPicker";
import { InvoiceDesignSettings } from "../components/settings/InvoiceDesignSettings";
import { DeleteAccount } from "../components/settings/DeleteAccount";
import { COUNTRIES, countryByCode, regionsForCountry } from '../lib/localization';

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
  pincode: z.string().regex(/^[A-Za-z0-9 -]{3,12}$/, "Invalid postal code"),
  country_code: z.string().length(2).default('IN'),
  language: z.string().min(2, "Language is required"),
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
  const { user, company, refreshProfile, hasFeature, limitOf } = useAuth();
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

  // Send to CA States
  const [caEmail, setCaEmail] = useState('');
  const [caDateRange, setCaDateRange] = useState({ start: '', end: '' });

  // Data States
  const [users, setUsers] = useState([]);
  const [godowns, setGodowns] = useState([]);
  const [fullCompany, setFullCompany] = useState(null);
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
      pincode: "", city: "", country_code: 'IN', language: 'en-IN', business_types: [], industry: "General Store",
      registration_type: "Sole Proprietorship", extra_details: []
    }
  });
  const selectedCountry = businessForm.watch('country_code') || 'IN';

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
        setFullCompany(c);

        businessForm.reset({
          name: c.name || "",
          phone: c.phone || "",
          email: c.email || "",
          address: c.address || "",
          state: c.state || "Karnataka",
          pincode: c.pincode || "",
          city: c.city || "",
          country_code: c.country_code || 'IN',
          language: c.language || countryByCode(c.country_code || 'IN').locale,
          business_types: c.settings?.businessTypes || [],
          industry: c.business_category || "General Store",
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
  }, [businessForm, taxForm, profileForm, bankForm, user]);

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
        // Only this form's own keys: the server merges them, so the invoice design is never overwritten.
        settings: {
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

  // --- Send to CA Handler ---
  const handleSendToCA = async (e) => {
    e.preventDefault();
    if (!caEmail || !caDateRange.start || !caDateRange.end) {
      return toast.error("Please fill all fields");
    }
    
    // Feature Check
    if (!hasFeature('enterprise_reports')) {
       return toast.error("Send to CA is not included in your current plan.");
    }
    
    setSubmitting(true);
    try {
      await api.post('/reports/send-to-ca', {
        caEmail,
        startDate: caDateRange.start,
        endDate: caDateRange.end
      });
      toast.success("GSTR-1 sent to CA successfully");
      setCaEmail('');
      setCaDateRange({ start: '', end: '' });
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to send to CA"));
    } finally {
      setSubmitting(false);
    }
  };

  // --- Navigation Items (Flat like MyBillBook) ---

  const navItems = [
    { id: 'account-profile', label: 'Account', icon: User },
    { id: 'business-details', label: 'Manage Business', icon: Building2 },
    { id: 'invoice-customization', label: 'Invoice Design', icon: FileText },
    { id: 'team', label: 'Manage Users', icon: Users },
    { id: 'business-tax', label: 'Tax & GST', icon: Settings2 },
    { id: 'business-godowns', label: 'Godowns', icon: Warehouse },
    { id: 'payments', label: 'Payment & Bank', icon: CreditCard },
    { id: 'reminders', label: 'Reminders', icon: Bell },
    { id: 'send-to-ca', label: 'CA Portal', icon: Mail },
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
    'invoice-customization': { title: 'Invoice Design', subtitle: 'Template, colours, columns and paper size' },
    'payments': { title: 'Payment & Bank Settings', subtitle: 'Manage banking and payment details' },
    'team': { title: 'Manage Users', subtitle: 'Add and manage team members' },
    'reminders': { title: 'Reminders', subtitle: 'Set up automated reminders' },
    'send-to-ca': { title: 'CA Portal', subtitle: 'Directly send GSTR-1 Excel reports to your CA' },
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
    return null;
  }, [activeSection, profileForm, passwordForm, businessForm, taxForm, bankForm]);
  const handleGlobalSubmit = () => {
    if (activeSection === 'account-profile') profileForm.handleSubmit(handleProfileSubmit)();
    else if (activeSection === 'account-security') passwordForm.handleSubmit(handlePasswordSubmit)();
    else if (activeSection === 'business-details') businessForm.handleSubmit(handleBusinessSubmit)();
    else if (activeSection === 'business-tax') taxForm.handleSubmit(handleTaxSubmit)();
    else if (activeSection === 'payments') bankForm.handleSubmit(handleBankSubmit)();
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

        <div className="px-4 py-3 border-t border-slate-200 space-y-2">
          <p className="text-[10px] font-semibold text-slate-400">App Version : 1.0.0</p>
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
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-slate-300" onClick={() => setSearchParams({ section: 'help' })}>
              <MessageCircle className="w-3.5 h-3.5" />
              Help & support
            </Button>
            {/* Sections with their own save (invoice design, godowns, team…) hide the shared buttons. */}
            {currentForm && (<>
            <Button variant="outline" size="sm" className="h-8 text-xs border-slate-300" onClick={() => currentForm.reset()} disabled={!currentForm.formState.isDirty}>
              Discard
            </Button>
            <Button
              disabled={submitting || !currentForm.formState.isDirty}
              onClick={handleGlobalSubmit}
              size="sm"
              className="h-8 bg-[#22C55E] hover:bg-[#16A34A] text-white text-xs font-semibold min-w-[100px]"
            >
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save Changes"}
            </Button>
            </>)}
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
            {activeSection === 'account-profile' && <DeleteAccount />}

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
                        <FormField control={businessForm.control} name="country_code" render={({ field }) => (
                          <FormItem><FormLabel>Country</FormLabel><FormControl><select className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm" value={field.value} onChange={(event) => { const country = countryByCode(event.target.value); field.onChange(country.code); businessForm.setValue('language', country.locale, { shouldDirty: true }); businessForm.setValue('state', '', { shouldDirty: true }); businessForm.setValue('pincode', '', { shouldDirty: true }); }}><>{COUNTRIES.map((country) => <option key={country.code} value={country.code}>{country.name}</option>)}</></select></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={businessForm.control} name="language" render={({ field }) => (
                          <FormItem><FormLabel>Language</FormLabel><FormControl><select className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm" {...field}><option value="en">English</option><option value="en-IN">English (India)</option><option value="ar">Arabic</option><option value="bn">Bengali</option><option value="de">German</option><option value="es">Spanish</option><option value="fr">French</option><option value="hi">Hindi</option><option value="ja">Japanese</option><option value="pt">Portuguese</option><option value="si-LK">Sinhala</option><option value="ta">Tamil</option><option value="ur-PK">Urdu</option><option value="zh">Chinese</option></select></FormControl><FormMessage /></FormItem>
                        )} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField control={businessForm.control} name="state" render={({ field }) => (
                          <FormItem><FormLabel>State / Province</FormLabel><FormControl><select className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm" {...field}><option value="">Select region</option>{regionsForCountry(selectedCountry).map((region) => <option key={region} value={region}>{region}</option>)}</select></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={businessForm.control} name="pincode" render={({ field }) => (
                          <FormItem><FormLabel>{countryByCode(selectedCountry).postalLabel}</FormLabel><FormControl><Input className="h-11" inputMode={selectedCountry === 'IN' ? 'numeric' : 'text'} {...field} /></FormControl><FormMessage /></FormItem>
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
                      <FormField control={businessForm.control} name="industry" render={({ field, fieldState }) => (
                        <FormItem><FormLabel>Business type</FormLabel>
                          <IndustryPicker value={field.value} invalid={!!fieldState.error} onChange={(v) => businessForm.setValue('industry', v, { shouldDirty: true, shouldValidate: true })} />
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
                  <div className="space-y-1"><h3 className="text-lg font-bold text-slate-900">Godown Management</h3><p className="text-sm text-slate-500">Manage your inventory locations and warehouses. {limitOf('godowns') === null ? 'Your plan allows unlimited godowns.' : `${godowns.length} of ${limitOf('godowns')} godowns used.`}</p></div>
                  {(limitOf('godowns') === null || godowns.length < limitOf('godowns')) && (
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
                {limitOf('godowns') !== null && godowns.length >= limitOf('godowns') && <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm font-medium">You have reached your plan's godown limit. <button type="button" onClick={() => navigate('/subscription')} className="underline font-semibold">Upgrade</button> to add more.</div>}
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

            {activeSection === 'invoice-customization' && fullCompany && (
              <InvoiceDesignSettings company={fullCompany} onSaved={async () => { setFullCompany((await companyAPI.get()).data); refreshProfile(); }} />
            )}

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
                    <p className="text-sm text-slate-500">Write to us at support@charisbilleasy.store for any queries or issues.</p>
                  </div>
                  <div className="p-6 bg-white rounded-xl border border-slate-200 hover:shadow-md transition-shadow cursor-pointer space-y-3">
                    <Phone className="w-8 h-8 text-emerald-600" />
                    <h4 className="font-bold text-slate-900">Phone Support</h4>
                    <p className="text-sm text-slate-500">Call us at +91 99869 95848 (Mon-Sat, 9 AM - 6 PM)</p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'send-to-ca' && (
              <div className="space-y-8">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900">CA Portal</h3>
                  <p className="text-sm text-slate-500">Automatically generate and email your GSTR-1 return in Excel format directly to your Chartered Accountant.</p>
                </div>
                
                {!hasFeature('enterprise_reports') ? (
                  <div className="p-6 bg-indigo-50 border border-indigo-200 rounded-xl text-center">
                    <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Lock className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-semibold text-indigo-900 mb-1">Upgrade to unlock</h4>
                    <p className="text-sm text-indigo-700 max-w-md mx-auto mb-4">
                      Send to CA is not in your current plan. Upgrade to email automated, government-compliant GST reports to your accountant.
                    </p>
                    <Button onClick={() => navigate('/subscription')} className="bg-indigo-600 hover:bg-indigo-700">
                      Upgrade to Enterprise
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSendToCA} className="space-y-6 max-w-md bg-white p-6 rounded-xl border border-slate-200">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>CA Email Address *</Label>
                        <Input 
                          type="email" 
                          placeholder="chartered.accountant@example.com" 
                          value={caEmail} 
                          onChange={(e) => setCaEmail(e.target.value)}
                          required 
                          className="h-11"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Start Date *</Label>
                          <Input 
                            type="date" 
                            value={caDateRange.start} 
                            onChange={(e) => setCaDateRange({...caDateRange, start: e.target.value})}
                            required 
                            className="h-11"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>End Date *</Label>
                          <Input 
                            type="date" 
                            value={caDateRange.end} 
                            onChange={(e) => setCaDateRange({...caDateRange, end: e.target.value})}
                            required 
                            className="h-11"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <Button type="submit" disabled={submitting} className="w-full bg-emerald-600 hover:bg-emerald-700 h-11 text-white font-semibold">
                      {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
                      {submitting ? 'Sending...' : 'Send GSTR-1 to CA'}
                    </Button>
                  </form>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
