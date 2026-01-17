/**
 * © 2024 NetVenture by Justin Baptiste. All Rights Reserved.
 * This software and its curriculum are proprietary and confidential.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Backpack, Target, Umbrella, Zap, Plus, Trophy, ShieldCheck, 
  BookOpen, Search, ArrowRight, Info, X, Lock, Eye, Key, 
  Copyright, UserCheck, Moon, ShieldEllipsis, Smile, Globe, 
  Camera, MessageSquareWarning, RefreshCw, PenTool, ShieldAlert, 
  Sparkles, LayoutGrid, Heart, Fingerprint, Sticker, GraduationCap, 
  Crown, MessagesSquare, Trash2, ThumbsUp, FileSearch, BookMarked, 
  MapPin, AlertCircle, BrainCircuit, Settings, ExternalLink, UserPlus,
  ShieldPlus, Download, Upload, ListChecks,
  RotateCcw, Save, Layers, Palette, Image as ImageIcon,
  CheckCircle2, Star, Shield, Award, Sparkle, History, HandHeart, Users, Link, Copy, Check,
  School, Trash, MessageCircle, Quote, Milestone, Scale, HeartHandshake, BookOpenCheck, ListPlus, UploadCloud, Eraser,
  ClipboardCheck, Flame, TrendingUp, PhoneCall, LifeBuoy, DownloadCloud, FileUp, LogOut, ChevronRight, Filter, EyeOff,
  BellOff, ShieldHalf, Bug, Mail, Beaker, UserCircle, MessageSquareQuote, LayoutList,
  ToggleLeft, ToggleRight, Database, Component, Boxes
} from 'lucide-react';

// --- Utils ---

const getLevelFromYear = (year: number): SchoolLevel => {
  if (year >= 1 && year <= 2) return 'ks1';
  if (year >= 3 && year <= 6) return 'ks2';
  if (year >= 7) return 'secondary';
  return 'ks1'; 
};

const SecureStorage = {
  save: (key: string, value: any) => {
    try {
      const str = JSON.stringify(value);
      const encoded = btoa(encodeURIComponent(str));
      localStorage.setItem(key, encoded);
    } catch (e) { console.error("Storage Error", e); }
  },
  load: (key: string) => {
    const data = localStorage.getItem(key);
    if (!data) return null;
    try {
      return JSON.parse(decodeURIComponent(atob(data)));
    } catch { return null; }
  }
};

// --- Types ---

type HouseKey = 'Baggins' | 'Hood' | 'Poppins' | 'Potter';
type LanguageCode = 'en' | 'ar';
type SchoolLevel = 'ks1' | 'ks2' | 'secondary';

interface HouseStatic { icon: any; defaultColor: string; }

interface Child {
  id: string;
  name: string;
  className: string;
  house: HouseKey;
  level: SchoolLevel;
  year: number;
  pledgeSigned: boolean;
  schoolId: string;
  pledgeLevel: number; 
  lastPledgeXP: number; 
}

interface Completion {
  childId: string;
  challengeId: string;
  timestamp: number;
  points: number;
  reflection?: string; 
}

interface TranslatedText { en: string; ar: string; }

interface Challenge {
  id: string;
  title: TranslatedText;
  description: TranslatedText;
  points: number;
  strand: number; 
  repeatable: boolean;
  level: 'ks1' | 'ks2' | 'secondary' | 'all';
  theme: string;
  iconName: string;
  reflectionPrompt?: TranslatedText;
  enabled?: boolean;
}

interface GlossaryItem {
  id: string;
  term: TranslatedText;
  level: 1 | 2 | 3;
  strand: number;
  primaryDefinition: TranslatedText; 
  secondaryDefinition: TranslatedText; 
}

interface Poster {
  id: string;
  title: TranslatedText;
  category: string;
  imageUrl: string;
  familyQuest: TranslatedText; 
}

interface SupportLink {
  id: string;
  name: TranslatedText;
  description: TranslatedText;
  phone?: string;
  url: string;
  iconName: string;
}

interface MasterConfig {
  id: string;
  schoolName: string;
  logoUrl?: string; 
  concernFormUrl: string;
  supportEmail: string;
  adminPinHash: string; 
  houseNames: Record<HouseKey, string>;
  team: { id: string; name: string; role: string }[];
  challenges: Challenge[];
  glossary: GlossaryItem[];
  posters: Poster[];
  supportLinks: SupportLink[];
  strands: TranslatedText[];
}

// --- Constants ---

const STRANDS = [
  { en: "Self-Image & Identity", ar: "الصورة الذاتية والهوية" },
  { en: "Online Relationships", ar: "العلاقات عبر الإنترنت" },
  { en: "Online Reputation", ar: "السمعة عبر الإنترنت" },
  { en: "Online Bullying", ar: "التنمر عبر الإنترنت" },
  { en: "Health & Well-being", ar: "الصحة والرفاهية" },
  { en: "Managing Information", ar: "إدارة المعلومات" },
  { en: "Privacy & Security", ar: "الخصوصية والأمان" },
  { en: "Copyright & Ownership", ar: "حقوق الطبع والنشر والملكية" }
];

const MASTER_CHALLENGES: Challenge[] = [
  { id: 's1c1', strand: 1, title: { en: 'Avatar Workshop', ar: 'ورشة عمل الأفاتار' }, description: { en: 'Create a profile picture that can represent you online.', ar: 'أنشئ صورة ملف شخصي يمكنها تمثيلك عبر الإنترنت.' }, points: 30, repeatable: false, level: 'ks1', theme: 'Identity', iconName: 'UserCheck', enabled: true },
  { id: 's1c2', strand: 1, title: { en: 'Alias Architect', ar: 'مهندس الأسماء المستعارة' }, description: { en: 'Design 3 cool nicknames that don\'t use your real initials.', ar: 'صمم ٣ أسماء مستعارة رائعة لا تستخدم أحرف اسمك الحقيقي.' }, points: 30, repeatable: false, level: 'ks2', theme: 'Identity', iconName: 'Fingerprint', enabled: true },
  { id: 's1c3', strand: 1, title: { en: 'Bio Audit', ar: 'تدقيق السيرة الذاتية' }, description: { en: 'Remove your private information (school name, age, etc.) from all public bios.', ar: 'قم بإزالة معلوماتك الخاصة (اسم المدرسة، العمر، إلخ) من جميع السير الذاتية العامة.' }, points: 55, repeatable: false, level: 'secondary', theme: 'Identity', iconName: 'FileSearch', enabled: true },
  { id: 's1c4', strand: 1, title: { en: 'The Filter Conversation', ar: 'محادثة الفلاتر' }, description: { en: 'Discuss how filters change our view of "normal" faces.', ar: 'ناقش كيف تغير الفلاتر نظرتنا للوجوه "العادية".' }, points: 40, repeatable: false, level: 'secondary', theme: 'Identity', iconName: 'Smile', enabled: true },
  { id: 's2c1', strand: 2, title: { en: 'Circle of Trust', ar: 'دائرة الثقة' }, description: { en: 'Draw a circle of people you can talk to about tech worries.', ar: 'ارسم دائرة من الأشخاص الذين يمكنك التحدث معهم عن مخاوف التقنية.' }, points: 20, repeatable: false, level: 'ks1', theme: 'Safety', iconName: 'Users', enabled: true },
  { id: 's2c2', strand: 2, title: { en: 'Permission Pact', ar: 'ميثاق الاستئذان' }, description: { en: 'Ask a family member before taking or posting their photo.', ar: 'استأذن أحد أفراد عائلتك قبل التقاط أو نشر صورته.' }, points: 40, repeatable: true, level: 'ks1', theme: 'Relationships', iconName: 'HeartHandshake', enabled: true },
  { id: 's2c3', strand: 2, title: { en: 'The Upstander Move', ar: 'حركة المدافع' }, description: { en: 'Support a peer who is being treated unkindly online.', ar: 'ادعم زميلاً يعامل بطريقة غير لطيفة عبر الإنترنت.' }, points: 45, repeatable: true, level: 'ks2', theme: 'Relationships', iconName: 'ShieldPlus', enabled: true },
  { id: 's2c4', strand: 2, title: { en: 'Red Flag Checklist', ar: 'قائمة العلامات التحذيرية' }, description: { en: 'Identify 3 signs of "digital grooming" with an adult.', ar: 'حدد ٣ علامات لـ "الاستمالة الرقمية" مع شخص بالغ.' }, points: 70, repeatable: false, level: 'secondary', theme: 'Safety', iconName: 'AlertCircle', enabled: true },
  { id: 's5c1', strand: 5, title: { en: 'Offline Adventure', ar: 'مغامرة بدون إنترنت' }, description: { en: 'Go outside and play for 30 minutes without a phone.', ar: 'اخرج والعب لمدة ٣٠ دقيقة بدون هاتف.' }, points: 50, repeatable: true, level: 'ks1', theme: 'Well-being', iconName: 'Globe', enabled: true },
  { id: 's7c2', strand: 7, title: { en: 'Privacy Shield', ar: 'درع الخصوصية' }, description: { en: 'Set your gaming profile to "Private".', ar: 'اجعل ملفك الشخصي في الألعاب "خاصاً".' }, points: 45, repeatable: false, level: 'ks2', theme: 'Privacy', iconName: 'ShieldCheck', enabled: true },
];

const MASTER_GLOSSARY: GlossaryItem[] = [
  { id: 'g1', strand: 7, level: 1, term: { en: 'Phishing', ar: 'التصيد' }, primaryDefinition: { en: 'Digital Trickery: Like a fake fisherman using bait to catch your passwords.', ar: 'خداع رقمي: مثل صياد مزيف يستخدم طعماً لصيد كلمات مرورك.' }, secondaryDefinition: { en: 'A fraudulent practice of sending emails or links to steal sensitive data.', ar: 'ممارسة احتيالية لإرسال رسائل بريد أو روابط لسرقة بيانات حساسة.' } },
  { id: 'g2', strand: 3, level: 1, term: { en: 'Digital Footprint', ar: 'الأثر الرقمي' }, primaryDefinition: { en: 'Muddy Shoes: Every click and post leaves a trail that never fully washes away.', ar: 'أحذية طينية: كل نقرة ومنشور يترك أثراً لا يزول تماماً.' }, secondaryDefinition: { en: 'The unique set of traceable digital activities and data manifested on the Internet.', ar: 'مجموعة فريدة من الأنشطة والبيانات الرقمية التي يمكن تتبعها على الإنترنت.' } },
];

const MASTER_SUPPORT: SupportLink[] = [
  { id: 'h1', name: { en: 'Childline', ar: 'خط نجدة الطفل' }, description: { en: 'Free, confidential support for any problem you\'re facing.', ar: 'دعم مجاني وسري لأي مشكلة تواجهها.' }, phone: '0800 1111', url: 'https://www.childline.org.uk', iconName: 'LifeBuoy' },
  { id: 'h2', name: { en: 'CEOP', ar: 'مركز حماية الطفل' }, description: { en: 'Reporting tool for online safety concerns and abuse.', ar: 'أداة إبلاغ عن مخاوف الأمان عبر الإنترنت والإساءة.' }, url: 'https://www.ceop.police.uk/safety-centre/', iconName: 'ShieldAlert' },
];

const DEFAULT_MASTER_CONFIG: MasterConfig = {
  id: 'school_default',
  schoolName: "NetVenture Academy",
  logoUrl: "",
  concernFormUrl: "#",
  supportEmail: "support@netventure.academy",
  adminPinHash: "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4",
  houseNames: { Potter: "Potter", Baggins: "Baggins", Poppins: "Poppins", Hood: "Hood" },
  team: [{ id: 't1', name: "Alex Rivers", role: "Safeguarding Lead" }],
  strands: STRANDS,
  challenges: MASTER_CHALLENGES,
  glossary: MASTER_GLOSSARY,
  posters: [
    { id: 'p1', title: { en: 'The Quiet Quest', ar: 'المهمة الهادئة' }, category: 'Well-being', imageUrl: '', familyQuest: { en: 'Can the whole family put their phones in a basket during dinner tonight?', ar: 'هل تستطيع العائلة وضع هواتفهم في سلة أثناء العشاء الليلة؟' } },
    { id: 'p2', title: { en: 'Legacy Talk', ar: 'حديث الإرث' }, category: 'Reputation', imageUrl: '', familyQuest: { en: 'Ask a parent: what is one thing they are glad WASN\'T recorded when they were kids?', ar: 'اسأل والديك: ما هو الشيء الذي يسعدهم أنه لم يسجل عندما كانوا أطفالاً؟' } },
  ],
  supportLinks: MASTER_SUPPORT
};

const ICON_MAP: Record<string, any> = {
  UserCheck, Heart, ShieldCheck, Moon, Search, Key, PenTool, AlertCircle, 
  MessagesSquare, Eye, Fingerprint, Lock, RefreshCw, Copyright, 
  MessageSquareWarning, FileSearch, Trash2, ThumbsUp, BookMarked, MapPin, 
  Umbrella, Camera, BrainCircuit, Target, Backpack, Zap, Globe, ShieldAlert, ImageIcon,
  CheckCircle2, Star, Shield, Award, Sparkle, Sticker, History, HandHeart, Users, Link, Copy, Check, School, Trash, MessageCircle, Quote, Milestone, Scale, HeartHandshake, BookOpenCheck, ListPlus, UploadCloud, Eraser,
  ClipboardCheck, Flame, TrendingUp, PhoneCall, LifeBuoy, DownloadCloud, FileUp, LogOut, ChevronRight, Filter, EyeOff,
  BellOff, ShieldHalf, Bug, Mail, Beaker, UserCircle, MessageSquareQuote, LayoutList,
  ToggleLeft, ToggleRight, Database, Component, Boxes
};

const HOUSE_ASSETS: Record<HouseKey, HouseStatic> = {
  Potter: { icon: Zap, defaultColor: '#E11D48' },
  Baggins: { icon: Backpack, defaultColor: '#D97706' },
  Poppins: { icon: Umbrella, defaultColor: '#7C3AED' },
  Hood: { icon: Target, defaultColor: '#059669' }
};

const UI_STRINGS: Record<string, TranslatedText> = {
  stats: { en: "Stats", ar: "الإحصائيات" },
  tasks: { en: "Tasks", ar: "المهام" },
  help: { en: "Help", ar: "المساعدة" },
  hub: { en: "Hub", ar: "المركز" },
  stickers: { en: "Badge", ar: "الأوسمة" },
  hello: { en: "Hey", ar: "يا هلا" },
  start: { en: "Start Adventure", ar: "ابدأ المغامرة" },
  new_explorer: { en: "New Explorer", ar: "مستكشف جديد" },
  log_task: { en: "Log Task", ar: "تسجيل المهمة" },
  ks1: { en: "Foundation (KS1)", ar: "تأسيسي (KS1)" },
  ks2: { en: "Explorer (KS2)", ar: "مستكشف (KS2)" },
  secondary: { en: "Guardian (Secondary)", ar: "حارس (ثانوي)" },
  pledge_title: { en: "The NetVenture Covenant", ar: "ميثاق نت-فنشر" },
  pledge_agree: { en: "I reaffirm my commitment to being a safe explorer.", ar: "أجدد التزامي بأن أكون مستكشفاً آمناً." },
  family_quest_header: { en: "Family Connection", ar: "اتصال عائلي" },
  reflection_label: { en: "Private Reflection (Private to this device)", ar: "تأمل خاص (خاص بهذا الجهاز)" },
  rank_up: { en: "Rank Up Available!", ar: "ترقية الرتبة متاحة!" },
  house_standings: { en: "House Command Centre", ar: "مركز قيادة المنازل" },
  hub_quests: { en: "Family Quests", ar: "مهام العائلة" },
  hub_glossary: { en: "Safety Glossary", ar: "قاموس الأمان" }
};

const PLEDGE_RANKS = [
  { level: 0, threshold: 0, title: { en: 'Digital Novice', ar: 'مبتدئ رقمي' } },
  { level: 1, threshold: 100, title: { en: 'Safety Scout', ar: 'كشاف الأمان' } },
  { level: 2, threshold: 300, title: { en: 'Web Warden', ar: 'خفير الشبكة' } },
  { level: 3, threshold: 600, title: { en: 'Cyber Sentinel', ar: 'خفير سيبراني' } },
  { level: 4, threshold: 1000, title: { en: 'Guardian', ar: 'حارس الهوية' } },
  { level: 5, threshold: 2000, title: { en: 'Master Guardian', ar: 'الحارس الأكبر' } }
];

const App: React.FC = () => {
  const [lang, setLang] = useState<LanguageCode>(() => (localStorage.getItem('nv_lang') as LanguageCode) || 'en');
  const [children, setChildren] = useState<Child[]>(() => SecureStorage.load('nv_children') || []);
  const [completions, setCompletions] = useState<Completion[]>(() => SecureStorage.load('nv_completions') || []);
  const [vault, setVault] = useState<MasterConfig[]>(() => SecureStorage.load('nv_school_vault') || [DEFAULT_MASTER_CONFIG]);

  const [activeChildId, setActiveChildId] = useState<string | null>(() => children[0]?.id || null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'challenges' | 'hub' | 'stickers' | 'support'>('dashboard');
  const [hubView, setHubView] = useState<'quests' | 'glossary'>('quests');
  
  const [showAdmin, setShowAdmin] = useState(false);
  const [showAddChild, setShowAddChild] = useState(false);
  const [isAdminLocked, setIsAdminLocked] = useState(true);
  const [pinInput, setPinInput] = useState("");
  
  const [reflectingOn, setReflectingOn] = useState<Challenge | null>(null);
  const [reflectionText, setReflectionText] = useState("");
  const [showPledgeRenewal, setShowPledgeRenewal] = useState(false);

  useEffect(() => {
    const loader = document.getElementById('loading');
    if (loader) {
      loader.style.opacity = '0';
      setTimeout(() => loader.remove(), 600);
    }
  }, []);

  const activeChild = children.find(c => c.id === activeChildId);
  const config = useMemo(() => {
    if (!activeChild) return vault[0];
    return vault.find(s => s.id === activeChild.schoolId) || vault[0];
  }, [activeChild, vault]);

  const activePoints = useMemo(() => {
    if (!activeChildId) return 0;
    return completions.filter(c => c.childId === activeChildId).reduce((a, b) => a + b.points, 0);
  }, [activeChildId, completions]);

  const currentRank = useMemo(() => {
    return [...PLEDGE_RANKS].reverse().find(r => activePoints >= r.threshold) || PLEDGE_RANKS[0];
  }, [activePoints]);

  const needsPledgeRenewal = useMemo(() => {
    if (!activeChild) return false;
    return currentRank.level > activeChild.pledgeLevel;
  }, [currentRank, activeChild]);

  const housePoints = useMemo(() => {
    const totals: Record<string, number> = { Potter: 0, Baggins: 0, Poppins: 0, Hood: 0 };
    if (!activeChild) return totals;
    const schoolChildren = children.filter(c => c.schoolId === activeChild.schoolId);
    schoolChildren.forEach(child => {
      const childSum = completions.filter(comp => comp.childId === child.id).reduce((acc, curr) => acc + curr.points, 0);
      totals[child.house as keyof typeof totals] += childSum;
    });
    return totals;
  }, [children, completions, activeChild]);

  const categorizedTasks = useMemo(() => {
    if (!activeChild) return [];
    const filtered = config.challenges.filter(c => (c.level === activeChild.level || c.level === 'all'));
    return config.strands.map((strand, idx) => ({ 
      strandId: idx + 1, 
      name: strand, 
      tasks: filtered.filter(t => t.strand === (idx + 1)) 
    })).filter(g => g.tasks.length > 0);
  }, [config, activeChild]);

  useEffect(() => { 
    localStorage.setItem('nv_lang', lang); 
    document.body.dir = lang === 'ar' ? 'rtl' : 'ltr'; 
  }, [lang]);

  useEffect(() => {
    SecureStorage.save('nv_children', children);
    SecureStorage.save('nv_completions', completions);
    SecureStorage.save('nv_school_vault', vault);
  }, [children, completions, vault]);

  const t = (key: string) => UI_STRINGS[key]?.[lang] || key;
  const lt = (text: TranslatedText) => text?.[lang] || "---";

  const logCompletion = (challenge: Challenge, reflection?: string) => {
    if (!activeChildId) return;
    setCompletions(prev => [...prev, { childId: activeChildId!, challengeId: challenge.id, timestamp: Date.now(), points: challenge.points, reflection }]);
    setReflectingOn(null);
    setReflectionText("");
  };

  const handlePledgeRenew = () => {
    if (!activeChild) return;
    setChildren(prev => prev.map(c => c.id === activeChild.id ? { ...c, pledgeLevel: currentRank.level, lastPledgeXP: activePoints } : c));
    setShowPledgeRenewal(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 overflow-x-hidden pb-32">
      {/* Header */}
      <nav className="sticky top-0 z-[100] bg-white/80 backdrop-blur-xl border-b border-slate-200 px-6 sm:px-12 h-20 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl text-white flex items-center justify-center shadow-lg">
            {config.logoUrl ? <img src={config.logoUrl} className="w-8 h-8 object-contain" /> : <ShieldCheck className="w-6 h-6" />}
          </div>
          <h1 className="text-xl font-black tracking-tight text-indigo-900 leading-none">NetVenture</h1>
        </div>
        <div className="flex items-center gap-3">
          {needsPledgeRenewal && <button onClick={() => setShowPledgeRenewal(true)} className="bg-amber-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase animate-pulse shadow-lg flex items-center gap-2"><Milestone className="w-4 h-4" /> {t('rank_up')}</button>}
          <button onClick={() => { setShowAdmin(true); setIsAdminLocked(true); setPinInput(""); }} className="p-2 bg-slate-100 rounded-xl text-slate-500"><Settings className="w-5 h-5" /></button>
          {activeChild && <button onClick={() => setActiveChildId(null)} className="p-2 bg-rose-50 text-rose-500 rounded-xl"><LogOut className="w-5 h-5" /></button>}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-6 animate-slide-up">
        {!activeChildId ? (
          <div className="text-center py-20 space-y-12">
            <div className="w-32 h-32 mx-auto rounded-[2.5rem] bg-indigo-600 text-white flex items-center justify-center shadow-2xl rotate-3">
               <Sparkles className="w-16 h-16" />
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-slate-800 tracking-tight">Master the Web.</h2>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">By {config.schoolName}</p>
            </div>
            <div className="flex flex-col items-center gap-6">
              <button onClick={() => setShowAddChild(true)} className="bg-slate-900 text-white px-10 py-5 rounded-3xl font-black text-lg shadow-xl uppercase transition-transform hover:scale-105 active:scale-95">{t('start')}</button>
              {children.length > 0 && (
                <div className="flex flex-wrap justify-center gap-4 mt-8">
                  {children.map(child => (
                    <button key={child.id} onClick={() => setActiveChildId(child.id)} className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-50" style={{ color: HOUSE_ASSETS[child.house].defaultColor }}>
                        {React.createElement(HOUSE_ASSETS[child.house].icon, { className: "w-5 h-5" })}
                      </div>
                      <span className="text-sm font-black">{child.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Dashboard */}
            {activeTab === 'dashboard' && (
              <div className="space-y-10">
                <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div>
                    <h2 className="text-4xl font-black text-slate-800 leading-none">{t('hello')}, {activeChild.name}!</h2>
                    <div className="flex gap-2 mt-4">
                      <span className="text-[10px] font-black text-indigo-600 uppercase bg-indigo-50 px-4 py-1.5 rounded-full">{lt(currentRank.title)}</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-black text-slate-800">{activePoints.toLocaleString()}</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Total XP</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {(Object.keys(HOUSE_ASSETS) as HouseKey[]).map(houseKey => (
                    <div key={houseKey} className="bg-white p-6 rounded-3xl border-b-4 shadow-sm" style={{ borderBottomColor: HOUSE_ASSETS[houseKey].defaultColor }}>
                      <div className="flex items-center gap-2 mb-2">
                        {React.createElement(HOUSE_ASSETS[houseKey].icon, { className: "w-4 h-4", style: { color: HOUSE_ASSETS[houseKey].defaultColor } })}
                        <span className="text-[10px] font-black uppercase text-slate-400">{config.houseNames[houseKey]}</span>
                      </div>
                      <div className="text-xl font-black">{housePoints[houseKey].toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Challenges */}
            {activeTab === 'challenges' && (
              <div className="space-y-12">
                <h3 className="text-2xl font-black uppercase tracking-tight px-2">Quest Inventory</h3>
                {categorizedTasks.map(group => (
                  <div key={group.strandId} className="space-y-6">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">{lt(group.name)}</h4>
                    <div className="grid gap-4">
                      {group.tasks.map(chall => {
                        const isDone = completions.some(c => c.childId === activeChildId && c.challengeId === chall.id);
                        return (
                          <div key={chall.id} className={`bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex justify-between items-center transition-all ${isDone && !chall.repeatable ? 'opacity-50' : ''}`}>
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-indigo-600">
                                {React.createElement(ICON_MAP[chall.iconName] || ShieldCheck, { className: "w-6 h-6" })}
                              </div>
                              <div>
                                <h5 className="font-black text-slate-800 uppercase tracking-tight">{lt(chall.title)}</h5>
                                <p className="text-xs text-slate-500 font-bold">{lt(chall.description)}</p>
                              </div>
                            </div>
                            <button onClick={() => chall.reflectionPrompt ? setReflectingOn(chall) : logCompletion(chall)} disabled={isDone && !chall.repeatable} className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase shadow-md disabled:bg-slate-100 disabled:text-slate-400">
                              {isDone && !chall.repeatable ? "Done" : `+${chall.points} XP`}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Hub (Quests & Glossary) */}
            {activeTab === 'hub' && (
              <div className="space-y-10">
                <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                  <button onClick={() => setHubView('quests')} className={`flex-1 py-3 rounded-xl font-black text-xs uppercase transition-all ${hubView === 'quests' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>{t('hub_quests')}</button>
                  <button onClick={() => setHubView('glossary')} className={`flex-1 py-3 rounded-xl font-black text-xs uppercase transition-all ${hubView === 'glossary' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>{t('hub_glossary')}</button>
                </div>
                {hubView === 'quests' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {config.posters.map(poster => (
                      <div key={poster.id} className="bg-indigo-600 p-8 rounded-[3rem] text-white shadow-xl relative overflow-hidden group">
                        <Sparkles className="absolute -top-4 -right-4 w-20 h-20 opacity-10 group-hover:rotate-12 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2 block">{poster.category}</span>
                        <h4 className="text-3xl font-black tracking-tight mb-4 uppercase">{lt(poster.title)}</h4>
                        <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
                          <p className="text-sm font-bold italic leading-relaxed">{lt(poster.familyQuest)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {config.glossary.map(item => (
                      <div key={item.id} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                        <h4 className="text-xl font-black text-indigo-600 mb-2 uppercase">{lt(item.term)}</h4>
                        <p className="text-sm font-bold text-slate-700 leading-relaxed mb-4">{lt(item.primaryDefinition)}</p>
                        <div className="bg-slate-50 p-4 rounded-xl border-l-4 border-slate-200">
                          <p className="text-[11px] text-slate-500 font-bold uppercase tracking-tight">{lt(item.secondaryDefinition)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Stickers / Progression */}
            {activeTab === 'stickers' && (
              <div className="space-y-12">
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-black uppercase tracking-tight">Covenant Progression</h3>
                  <p className="text-xs text-slate-400 font-bold">Earn XP to climb the ranks of digital safety.</p>
                </div>
                <div className="grid gap-6">
                  {PLEDGE_RANKS.map(rank => {
                    const isUnlocked = activePoints >= rank.threshold;
                    return (
                      <div key={rank.level} className={`p-8 rounded-[2.5rem] border-2 transition-all flex items-center justify-between ${isUnlocked ? 'bg-white border-indigo-600 shadow-xl' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
                        <div className="flex items-center gap-6">
                          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isUnlocked ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-400'}`}>
                            {rank.level === 0 ? <Sticker className="w-8 h-8" /> : rank.level === 5 ? <Crown className="w-8 h-8" /> : <Award className="w-8 h-8" />}
                          </div>
                          <div>
                            <h4 className="text-xl font-black uppercase tracking-tight">{lt(rank.title)}</h4>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{rank.threshold} XP Required</p>
                          </div>
                        </div>
                        {isUnlocked && <CheckCircle2 className="w-8 h-8 text-indigo-600" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Support */}
            {activeTab === 'support' && (
              <div className="space-y-10">
                <div className="bg-rose-50 p-8 rounded-[3rem] border border-rose-100 text-center space-y-4">
                  <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
                  <h3 className="text-2xl font-black text-rose-900 uppercase tracking-tight">Need Immediate Help?</h3>
                  <p className="text-sm font-bold text-rose-700">If you're worried about something online, tell a trusted adult or use the resources below.</p>
                  <a href={config.concernFormUrl} className="inline-block bg-rose-600 text-white px-10 py-4 rounded-2xl font-black text-sm uppercase shadow-lg shadow-rose-200">Submit School Concern</a>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {config.supportLinks.map(link => (
                    <div key={link.id} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-4">
                      <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                        {React.createElement(ICON_MAP[link.iconName] || ExternalLink, { className: "w-6 h-6" })}
                      </div>
                      <h4 className="text-xl font-black uppercase text-slate-800 tracking-tight">{lt(link.name)}</h4>
                      <p className="text-xs text-slate-500 font-bold leading-relaxed">{lt(link.description)}</p>
                      <div className="flex gap-2">
                        {link.phone && <a href={`tel:${link.phone}`} className="flex-1 bg-slate-100 text-center py-3 rounded-xl font-black text-[10px] uppercase">{link.phone}</a>}
                        <a href={link.url} target="_blank" className="flex-1 bg-indigo-600 text-white text-center py-3 rounded-xl font-black text-[10px] uppercase">Visit Site</a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Navigation */}
      {activeChildId && (
        <div className="fixed bottom-10 left-4 right-4 flex justify-center z-[100] pb-safe">
          <nav className="w-full max-w-lg bg-slate-900/90 backdrop-blur-3xl rounded-full p-2 flex justify-around items-center border border-white/10 shadow-2xl h-20">
            {[
              { id: 'dashboard', icon: LayoutGrid, label: t('stats') },
              { id: 'challenges', icon: ShieldHalf, label: t('tasks') },
              { id: 'hub', icon: BookOpen, label: t('hub') },
              { id: 'stickers', icon: Award, label: t('stickers') },
              { id: 'support', icon: ShieldAlert, label: t('help') }
            ].map(tab => (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id as any)} 
                className={`flex flex-col items-center justify-center flex-1 transition-all ${activeTab === tab.id ? 'text-white' : 'text-slate-500'}`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${activeTab === tab.id ? 'bg-indigo-600 scale-110 shadow-lg' : 'hover:text-slate-300'}`}>
                  {React.createElement(tab.icon, { className: "w-5 h-5" })}
                </div>
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Modals */}
      {showAddChild && (
        <div className="fixed inset-0 z-[200] bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-10 relative shadow-2xl">
            <button className="absolute top-6 right-6" onClick={() => setShowAddChild(false)}><X className="w-6 h-6" /></button>
            <h3 className="text-3xl font-black uppercase tracking-tight text-center mb-8">{t('new_explorer')}</h3>
            <form onSubmit={e => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const year = parseInt(f.get('year') as string);
              const nc: Child = {
                id: Date.now().toString(),
                name: f.get('name') as string,
                className: f.get('className') as string,
                year,
                house: f.get('house') as HouseKey,
                level: getLevelFromYear(year),
                pledgeSigned: true,
                schoolId: 'school_default',
                pledgeLevel: 0,
                lastPledgeXP: 0
              };
              setChildren(prev => [...prev, nc]);
              setActiveChildId(nc.id);
              setShowAddChild(false);
            }} className="space-y-4">
              <input name="name" required placeholder="Explorer Name" className="w-full bg-slate-50 px-6 py-4 rounded-2xl font-black outline-none border-2 border-transparent focus:border-indigo-600" />
              <input name="className" required placeholder="Class Code (e.g. 4B)" className="w-full bg-slate-50 px-6 py-4 rounded-2xl font-black outline-none border-2 border-transparent focus:border-indigo-600" />
              <input name="year" type="number" required placeholder="School Year" className="w-full bg-slate-50 px-6 py-4 rounded-2xl font-black outline-none border-2 border-transparent focus:border-indigo-600" />
              <div className="grid grid-cols-4 gap-2">
                {(Object.keys(HOUSE_ASSETS) as HouseKey[]).map(key => (
                  <label key={key} className="cursor-pointer">
                    <input type="radio" name="house" value={key} required className="hidden peer" />
                    <div className="aspect-square rounded-2xl bg-slate-50 border-4 border-transparent peer-checked:border-indigo-600 flex items-center justify-center">
                      {React.createElement(HOUSE_ASSETS[key].icon, { className: "w-6 h-6", style: { color: HOUSE_ASSETS[key].defaultColor } })}
                    </div>
                  </label>
                ))}
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black uppercase shadow-xl mt-4">Create Account</button>
            </form>
          </div>
        </div>
      )}

      {/* Reflection Modal */}
      {reflectingOn && (
        <div className="fixed inset-0 z-[200] bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-10 relative shadow-2xl space-y-6 text-center">
            <h3 className="text-2xl font-black uppercase tracking-tight">{lt(reflectingOn.title)}</h3>
            <p className="text-sm font-bold text-slate-500 italic">"{lt(reflectingOn.reflectionPrompt || { en: 'What did you learn from this?', ar: 'ماذا تعلمت من هذا؟' })}"</p>
            <textarea value={reflectionText} onChange={e => setReflectionText(e.target.value)} placeholder="Type your reflection here..." className="w-full bg-slate-50 h-32 p-6 rounded-3xl font-bold border-2 border-transparent focus:border-indigo-600 outline-none resize-none" />
            <div className="flex gap-4">
              <button onClick={() => setReflectingOn(null)} className="flex-1 bg-slate-100 py-4 rounded-2xl font-black uppercase text-[10px]">Cancel</button>
              <button onClick={() => logCompletion(reflectingOn, reflectionText)} className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase text-[10px]">Submit Reflection</button>
            </div>
          </div>
        </div>
      )}

      {/* Rank Up Pledge Renewal */}
      {showPledgeRenewal && (
        <div className="fixed inset-0 z-[250] bg-indigo-600 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-lg rounded-[4rem] p-12 text-center space-y-8 animate-slide-up shadow-2xl border-b-[20px] border-indigo-700">
            <div className="w-24 h-24 bg-amber-100 text-amber-600 rounded-[2rem] flex items-center justify-center mx-auto">
              <Milestone className="w-12 h-12" />
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-slate-800 tracking-tight leading-none uppercase">{t('pledge_title')}</h2>
              <p className="text-lg font-bold text-indigo-600">{lt(currentRank.title)}</p>
            </div>
            <div className="bg-slate-50 p-8 rounded-3xl border-2 border-indigo-50 leading-relaxed text-sm font-bold text-slate-600">
              <p>{t('pledge_agree')}</p>
            </div>
            <button onClick={handlePledgeRenew} className="w-full bg-slate-900 text-white py-6 rounded-full font-black text-xl uppercase shadow-2xl hover:bg-indigo-900">Sign Covenant</button>
          </div>
        </div>
      )}

      {/* Admin Modal */}
      {showAdmin && (
        <div className="fixed inset-0 z-[300] bg-slate-900/95 backdrop-blur-2xl flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-10 relative shadow-2xl text-center">
            <button className="absolute top-6 right-6" onClick={() => setShowAdmin(false)}><X className="w-6 h-6" /></button>
            <h3 className="text-3xl font-black uppercase tracking-tight mb-8">Admin Vault</h3>
            {isAdminLocked ? (
              <div className="space-y-6">
                <p className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Enter PIN to access controls</p>
                <input type="password" value={pinInput} onChange={e => {
                  setPinInput(e.target.value);
                  if (e.target.value === "1234") setIsAdminLocked(false);
                }} className="w-full bg-slate-50 py-6 rounded-3xl text-center text-3xl font-black tracking-[1em] border-none" maxLength={4} />
              </div>
            ) : (
              <div className="space-y-4">
                <button onClick={() => {
                  if (confirm("Reset all data?")) {
                    localStorage.clear();
                    window.location.reload();
                  }
                }} className="w-full bg-rose-50 text-rose-600 py-4 rounded-2xl font-black uppercase text-xs">Factory Reset App</button>
                <button onClick={() => setShowAdmin(false)} className="w-full bg-slate-100 py-4 rounded-2xl font-black uppercase text-xs">Close Vault</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);