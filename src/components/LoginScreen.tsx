import React, { useState } from 'react';
import { useFoodRescue } from '../context/FoodRescueContext';
import { UserRole } from '../types';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User as UserIcon,
  Phone,
  MapPin,
  Building,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Heart,
  Utensils,
  HandHeart,
  ShieldAlert,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RoleOption {
  id: UserRole;
  title: string;
  icon: React.ReactNode;
  subtitle: string;
  color: string;
  badgeBg: string;
  defaultEmail: string;
}

const ROLES: RoleOption[] = [
  {
    id: 'donor',
    title: 'Food Donor',
    icon: <Utensils className="w-4 h-4" />,
    subtitle: 'Hotels, Caterers, Hostels, Supermarkets',
    color: '#087A28',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    defaultEmail: 'rajesh@greenbites.in',
  },
  {
    id: 'receiver',
    title: 'Receiver',
    icon: <Heart className="w-4 h-4" />,
    subtitle: 'Individuals & Families in need of food',
    color: '#2563EB',
    badgeBg: 'bg-blue-100 text-blue-800 border-blue-300',
    defaultEmail: 'ananya.d@gmail.com',
  },
  {
    id: 'ngo',
    title: 'NGO / Charity',
    icon: <HandHeart className="w-4 h-4" />,
    subtitle: 'Shelters, Orphanages, Relief Trusts',
    color: '#D97706',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
    defaultEmail: 'contact@snehango.org',
  },
  {
    id: 'admin',
    title: 'Admin',
    icon: <ShieldAlert className="w-4 h-4" />,
    subtitle: 'Platform Operations, Audits & Analytics',
    color: '#7C3AED',
    badgeBg: 'bg-purple-100 text-purple-800 border-purple-300',
    defaultEmail: 'admin@foodrescue.org',
  },
];

export const LoginScreen: React.FC = () => {
  const { login, register, setActiveScreen } = useFoodRescue();

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('donor');
  const [showPassword, setShowPassword] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Form states
  const [email, setEmail] = useState('rajesh@greenbites.in');
  const [password, setPassword] = useState('password123');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [organizationName, setOrganizationName] = useState('');
  const [address, setAddress] = useState('Indiranagar, Bengaluru');
  const [error, setError] = useState('');

  // When changing role, update default email placeholder if not customized
  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    const matched = ROLES.find((r) => r.id === role);
    if (matched && !isRegisterMode) {
      setEmail(matched.defaultEmail);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isRegisterMode) {
      if (!fullName.trim() || !email.trim() || !password.trim()) {
        setError('Please fill in your name, email, and password.');
        return;
      }
      if (phone && !phone.startsWith('+91') && phone.length < 10) {
        setError('Please enter a valid 10-digit Indian phone number (+91).');
        return;
      }

      register({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        userType: selectedRole,
        organizationName: organizationName.trim(),
        address: address.trim() || 'Bengaluru, Karnataka',
      });

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      setToastMsg(`Welcome! Registered and logged in as ${selectedRole.toUpperCase()}.`);
    } else {
      if (!email.trim() || !password.trim()) {
        setError('Please enter your email and password.');
        return;
      }

      login(email.trim().toLowerCase(), selectedRole);
      setToastMsg(`Logged in successfully as ${selectedRole.toUpperCase()}!`);
    }
  };

  const handleQuickOneTap = (role: UserRole, sampleEmail: string) => {
    setSelectedRole(role);
    setEmail(sampleEmail);
    login(sampleEmail, role);
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.7 },
    });
  };

  const handleGoogleLogin = () => {
    const googleEmail = `google_${selectedRole}_${Date.now().toString().slice(-4)}@gmail.com`;
    login(googleEmail, selectedRole);
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.7 },
    });
  };

  const currentRoleConfig = ROLES.find((r) => r.id === selectedRole) || ROLES[0];

  return (
    <div className="flex-1 w-full p-4 sm:p-5 flex flex-col justify-between relative bg-[#FFFDF2] overflow-y-auto">
      {/* Decorative leaf corner artwork matching reference poster */}
      <div className="absolute top-0 right-0 pointer-events-none w-24 h-24 overflow-hidden">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full opacity-80">
          <path d="M100 0C60 0 40 40 40 80C70 80 100 50 100 0Z" fill="#8BC34A" fillOpacity="0.4" />
          <path d="M100 0C80 20 60 40 60 70C80 60 100 30 100 0Z" fill="#4CAF50" fillOpacity="0.6" />
          <path d="M100 0L60 70" stroke="#2E7D32" strokeWidth="1.5" strokeDasharray="2 2" />
        </svg>
      </div>

      <div className="w-full pt-1">
        {/* Header */}
        <div className="mb-3">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold mb-1.5 shadow-2xs">
            <Sparkles className="w-3 h-3 text-[#087A28]" />
            <span>FoodRescue Identity & Access</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 font-heading">
            {isRegisterMode ? 'Register New User' : 'Welcome Back!'}
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            {isRegisterMode
              ? 'Join as a Donor, Receiver, NGO, or Admin to save food'
              : 'Login as Donor, Receiver, NGO, or Admin'}
          </p>
        </div>

        {/* Mode Toggle Pills: Login vs Register */}
        <div className="flex bg-slate-100 p-1 rounded-2xl mb-3.5 border border-slate-200/80 shadow-2xs">
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(false);
              setError('');
            }}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all text-center ${
              !isRegisterMode
                ? 'bg-[#087A28] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#087A28]'
            }`}
          >
            Login Existing
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(true);
              setError('');
            }}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all text-center ${
              isRegisterMode
                ? 'bg-[#087A28] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#087A28]'
            }`}
          >
            Register New User
          </button>
        </div>

        {/* 4 Role Selector Tabs matching user prompt requirement */}
        <div className="mb-3">
          <div className="flex items-center justify-between gap-2 flex-wrap mb-1.5">
            <span className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider">
              {isRegisterMode ? '1. Select Your Role to Register:' : '1. Select User Role:'}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${currentRoleConfig.badgeBg}`}>
              Selected: {currentRoleConfig.title}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {ROLES.map((r) => {
              const isSelected = selectedRole === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleSelectRole(r.id)}
                  className={`p-2 rounded-2xl border text-left transition relative flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#087A28] bg-emerald-50/70 text-slate-900 shadow-xs ring-1 ring-[#087A28]'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                        isSelected ? 'bg-[#087A28] text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {r.icon}
                    </div>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-[#087A28] animate-ping" />
                    )}
                  </div>
                  <div className="text-xs font-extrabold leading-tight">{r.title}</div>
                  <div className="text-[9px] text-slate-400 leading-tight mt-0.5 truncate">
                    {r.subtitle}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick One-Tap Login Bar for Instant Testing */}
        {!isRegisterMode && (
          <div className="mb-3 bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                Instant 1-Click Role Login:
              </span>
              <span className="text-[9px] text-emerald-700 font-semibold">Test directly</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleQuickOneTap(r.id, r.defaultEmail)}
                  className="py-1.5 px-1 bg-slate-50 hover:bg-emerald-50 border border-slate-200 rounded-xl text-center text-[10px] font-bold text-slate-700 hover:text-[#087A28] transition flex flex-col items-center gap-0.5"
                >
                  <span className="truncate">{r.id.toUpperCase()}</span>
                  <span className="text-[8px] text-slate-400 font-medium">One-Tap</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="mb-3 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span>{error}</span>
          </div>
        )}

        {toastMsg && (
          <div className="mb-3 p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMsg}</span>
          </div>
        )}

        {forgotSent && (
          <div className="mb-3 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Password reset link sent to your registered email!
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {isRegisterMode && (
            <>
              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#087A28]"
                    required
                  />
                </div>
              </div>

              {/* Organization name for Donor or NGO or Admin */}
              {(selectedRole === 'donor' || selectedRole === 'ngo' || selectedRole === 'admin') && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {selectedRole === 'donor'
                      ? 'Restaurant / Banquet / Hotel Name'
                      : selectedRole === 'ngo'
                      ? 'NGO / Shelter / Trust Name'
                      : 'Operations Hub / Department'}
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      placeholder={
                        selectedRole === 'donor'
                          ? 'e.g. Grand Palace Caterers'
                          : selectedRole === 'ngo'
                          ? 'e.g. Asha Hunger Relief Trust'
                          : 'e.g. Central Operations Team'
                      }
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#087A28]"
                    />
                  </div>
                </div>
              )}

              {/* Indian Phone Number */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Phone Number (India +91) *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#087A28]"
                    required
                  />
                </div>
              </div>

              {/* Address / Location */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  City & Area *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Indiranagar, Bengaluru, Karnataka"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#087A28]"
                  />
                </div>
              </div>
            </>
          )}

          {/* Email Address */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Email Address ({currentRoleConfig.title}) *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#087A28]"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#087A28]"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {!isRegisterMode && (
            <div className="flex justify-between items-center pt-0.5 text-[11px]">
              <div className="flex items-center gap-1.5 text-slate-500">
                <input type="checkbox" id="remember" defaultChecked className="rounded text-[#087A28] focus:ring-0" />
                <label htmlFor="remember">Remember me</label>
              </div>
              <button
                type="button"
                onClick={() => setForgotSent(true)}
                className="text-[#087A28] font-bold hover:underline"
              >
                Forgot Password?
              </button>
            </div>
          )}

          {/* Solid Green Login/Submit Button matching poster */}
          <button
            type="submit"
            className="w-full mt-2 py-3 bg-[#087A28] hover:bg-[#066521] text-white font-bold rounded-xl shadow-md transition-all active:scale-98 text-xs tracking-wide flex items-center justify-center gap-2"
          >
            <span>
              {isRegisterMode
                ? `Create Account & Login as ${currentRoleConfig.title}`
                : `Login as ${currentRoleConfig.title}`}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* — OR — Divider */}
        <div className="relative my-3">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-400">
            <span className="bg-[#FFFDF2] px-3">— OR —</span>
          </div>
        </div>

        {/* Sign In with Google Button */}
        <button
          onClick={handleGoogleLogin}
          type="button"
          className="w-full py-2 px-4 bg-white border border-slate-300 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center justify-center gap-2 text-xs shadow-2xs"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google as {currentRoleConfig.title}</span>
        </button>

        {/* Toggle between Login and Create Account Button */}
        <button
          type="button"
          onClick={() => {
            setIsRegisterMode(!isRegisterMode);
            setError('');
          }}
          className="w-full mt-2.5 py-2.5 px-4 bg-transparent border border-[#087A28] text-[#087A28] font-bold rounded-xl hover:bg-emerald-50 transition text-xs"
        >
          {isRegisterMode ? 'Already have an account? Login' : '+ Create New Account (Any Role)'}
        </button>
      </div>
    </div>
  );
};
