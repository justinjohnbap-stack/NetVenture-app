/**
 * © 2024 NetVenture by Justin Baptiste. All Rights Reserved.
 * This software and its curriculum are proprietary and confidential.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
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

async function hashPin(pin: string): Promise<string> {
  if (!window.crypto?.subtle) {
    return "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4"; // 1234
  }
  const msgBuffer = new TextEncoder().encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

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
  // Strand 1: Self-Image & Identity
  { id: 's1c1', strand: 1, title: { en: 'Avatar Workshop', ar: 'ورشة عمل الأفاتار' }, description: { en: 'Create a profile picture that can represent you online.', ar: 'أنشئ صورة ملف شخصي يمكنها تمثيلك عبر الإنترنت.' }, points: 30, repeatable: false, level: 'ks1', theme: 'Identity', iconName: 'UserCheck', enabled: true },
  { id: 's1c2', strand: 1, title: { en: 'Alias Architect', ar: 'مهندس الأسماء المستعارة' }, description: { en: 'Design 3 cool nicknames that don\'t use your real initials.', ar: 'صمم ٣ أسماء مستعارة رائعة لا تستخدم أحرف اسمك الحقيقي.' }, points: 30, repeatable: false, level: 'ks2', theme: 'Identity', iconName: 'Fingerprint', enabled: true },
  { id: 's1c3', strand: 1, title: { en: 'Bio Audit', ar: 'تدقيق السيرة الذاتية' }, description: { en: 'Remove your private information (school name, age, etc.) from all public bios.', ar: 'قم بإزالة معلوماتك الخاصة (اسم المدرسة، العمر، إلخ) من جميع السير الذاتية العامة.' }, points: 55, repeatable: false, level: 'secondary', theme: 'Identity', iconName: 'FileSearch', enabled: true },
  { id: 's1c4', strand: 1, title: { en: 'The Filter Conversation', ar: 'محادثة الفلاتر' }, description: { en: 'Discuss how filters change our view of "normal" faces.', ar: 'ناقش كيف تغير الفلاتر نظرتنا للوجوه "العادية".' }, points: 40, repeatable: false, level: 'secondary', theme: 'Identity', iconName: 'Smile', enabled: true },
  // Strand 2: Online Relationships
  { id: 's2c1', strand: 2, title: { en: 'Circle of Trust', ar: 'دائرة الثقة' }, description: { en: 'Draw a circle of people you can talk to about tech worries.', ar: 'ارسم دائرة من الأشخاص الذين يمكنك التحدث معهم عن مخاوف التقنية.' }, points: 20, repeatable: false, level: 'ks1', theme: 'Safety', iconName: 'Users', enabled: true },
  { id: 's2c2', strand: 2, title: { en: 'Permission Pact', ar: 'ميثاق الاستئذان' }, description: { en: 'Ask a family member before taking or posting their photo.', ar: 'استأذن أحد أفراد عائلتك قبل التقاط أو نشر صورته.' }, points: 40, repeatable: true, level: 'ks1', theme: 'Relationships', iconName: 'HeartHandshake', enabled: true },
  { id: 's2c3', strand: 2, title: { en: 'The Upstander Move', ar: 'حركة المدافع' }, description: { en: 'Support a peer who is being treated unkindly online.', ar: 'ادعم زميلاً يعامل بطريقة غير لطيفة عبر الإنترنت.' }, points: 45, repeatable: true, level: 'ks2', theme: 'Relationships', iconName: 'ShieldPlus', enabled: true },
  { id: 's2c4', strand: 2, title: { en: 'Red Flag Checklist', ar: 'قائمة العلامات التحذيرية' }, description: { en: 'Identify 3 signs of "digital grooming" with an adult.', ar: 'حدد ٣ علامات لـ "الاستمالة الرقمية" مع شخص بالغ.' }, points: 70, repeatable: false, level: 'secondary', theme: 'Safety', iconName: 'AlertCircle', enabled: true },
  // Strand 3: Online Reputation
  { id: 's3c1', strand: 3, title: { en: 'Footprint Trace', ar: 'تتبع الأثر' }, description: { en: 'List the top 5 sites you visited this week.', ar: 'اذكر أهم ٥ مواقع زرتها هذا الأسبوع.' }, points: 25, repeatable: false, level: 'ks1', theme: 'Reputation', iconName: 'MapPin', enabled: true },
  { id: 's3c2', strand: 3, title: { en: 'Digital Legacy', ar: 'الإرث الرقمي' }, description: { en: 'Write one positive sentence you want people to remember when they think of you.', ar: 'اكتب جملة إيجابية واحدة تريد أن يتذكرها الناس عندما يفكرون فيك.' }, points: 35, repeatable: false, level: 'ks2', theme: 'Reputation', iconName: 'PenTool', enabled: true },
  { id: 's3c3', strand: 3, title: { en: 'Clean Sweep', ar: 'المسح الشامل' }, description: { en: 'Archive or delete 5 old, embarrassing posts.', ar: 'أرشفة أو حذف ٥ منشورات قديمة ومحرجة.' }, points: 40, repeatable: false, level: 'secondary', theme: 'Reputation', iconName: 'Eraser', enabled: true },
  { id: 's3c4', strand: 3, title: { en: 'Future Employer Test', ar: 'اختبار صاحب العمل المستقبلي' }, description: { en: 'Would you hire "Online You" 10 years from now?', ar: 'هل ستقوم بتوظيف "نسختك الرقمية" بعد ١٠ سنوات من الآن؟' }, points: 50, repeatable: false, level: 'secondary', theme: 'Reputation', iconName: 'UserCircle', enabled: true },
  // Strand 4: Online Bullying
  { id: 's4c1', strand: 4, title: { en: 'Evidence Keeper', ar: 'حافظ الأدلة' }, description: { en: 'Learn how to take a screenshot to save proof of bullying.', ar: 'تعلم كيفية التقاط صورة للشاشة لحفظ دليل على التنمر.' }, points: 30, repeatable: false, level: 'all', theme: 'Bullying', iconName: 'Camera', enabled: true },
  { id: 's4c2', strand: 4, title: { en: 'Anti-Hate Pledge', ar: 'عهد ضد الكراهية' }, description: { en: 'Commit to never using sarcasm to hurt others online.', ar: 'تعهد بعدم استخدام السخرية لإيذاء الآخرين عبر الإنترنت.' }, points: 40, repeatable: false, level: 'ks2', theme: 'Bullying', iconName: 'Quote', enabled: true },
  { id: 's4c3', strand: 4, title: { en: 'Block & Report Pro', ar: 'محترف الحظر والإبلاغ' }, description: { en: 'Show an adult how to block a user on any platform.', ar: 'أظهر لشخص بالغ كيفية حظر مستخدم على أي منصة.' }, points: 45, repeatable: false, level: 'ks2', theme: 'Bullying', iconName: 'ShieldAlert', enabled: true },
  { id: 's4c4', strand: 4, title: { en: 'Private Support', ar: 'دعم خاص' }, description: { en: 'Message a friend privately to check on them.', ar: 'أرسل رسالة خاصة لصديق للاطمئنان عليه.' }, points: 40, repeatable: true, level: 'secondary', theme: 'Bullying', iconName: 'HandHeart', enabled: true },
  // Strand 5: Health & Well-being
  { id: 's5c1', strand: 5, title: { en: 'Offline Adventure', ar: 'مغامرة بدون إنترنت' }, description: { en: 'Go outside and play for 30 minutes without a phone.', ar: 'اخرج والعب لمدة ٣٠ دقيقة بدون هاتف.' }, points: 50, repeatable: true, level: 'ks1', theme: 'Well-being', iconName: 'Globe', enabled: true },
  { id: 's5c2', strand: 5, title: { en: 'Notification Diet', ar: 'حمية التنبيهات' }, description: { en: 'Turn off non-human notifications for 24 hours.', ar: 'أوقف تشغيل التنبيهات غير البشرية لمدة ٢٤ ساعة.' }, points: 50, repeatable: true, level: 'ks2', theme: 'Well-being', iconName: 'BellOff', enabled: true },
  { id: 's5c3', strand: 5, title: { en: 'Blue Light Boycott', ar: 'مقاطعة الضوء الأزرق' }, description: { en: 'No screens for 60 minutes before bed tonight.', ar: 'لا شاشات لمدة ٦٠ دقيقة قبل النوم الليلة.' }, points: 40, repeatable: true, level: 'all', theme: 'Well-being', iconName: 'Moon', enabled: true },
  { id: 's5c4', strand: 5, title: { en: 'The Dopamine Audit', ar: 'تدقيق الدوبامين' }, description: { en: 'Count how many notifications you get in one hour.', ar: 'احسب عدد التنبيهات التي تصلك في ساعة واحدة.' }, points: 45, repeatable: false, level: 'secondary', theme: 'Well-being', iconName: 'TrendingUp', enabled: true },
  // Strand 6: Managing Information
  { id: 's6c1', strand: 6, title: { en: 'Ad-Awareness', ar: 'الوعي الإعلاني' }, description: { en: 'Point out 3 "Sponsored" results on a search page.', ar: 'حدد ٣ نتائج "ممولة" في صفحة البحث.' }, points: 20, repeatable: false, level: 'ks1', theme: 'Information', iconName: 'Target', enabled: true },
  { id: 's6c2', strand: 6, title: { en: 'Scam Spotter', ar: 'راصد الاحتيال' }, description: { en: 'Identify 3 "too good to be true" online offers.', ar: 'حدد ٣ عروض عبر الإنترنت "أجمل من أن تكون حقيقية".' }, points: 25, repeatable: false, level: 'ks2', theme: 'Information', iconName: 'AlertCircle', enabled: true },
  { id: 's6c3', strand: 6, title: { en: 'Source Checker', ar: 'فاحص المصادر' }, description: { en: 'Find the "About Us" page of a website.', ar: 'ابحث عن صفحة "من نحن" في موقع ويب.' }, points: 35, repeatable: false, level: 'secondary', theme: 'Information', iconName: 'Search', enabled: true },
  { id: 's6c4', strand: 6, title: { en: 'Deepfake Detective', ar: 'مكتشف التزييف العميق' }, description: { en: 'Find a video and look for glitches that show it is AI.', ar: 'ابحث عن فيديو وابحث عن أخطاء تظهر أنه ذكاء اصطناعي.' }, points: 60, repeatable: false, level: 'secondary', theme: 'Information', iconName: 'Search', enabled: true },
  // Strand 7: Privacy & Security
  { id: 's7c1', strand: 7, title: { en: 'The Smart Device Audit', ar: 'تدقيق الأجهزة الذكية' }, description: { en: 'List all devices in your house that connect to WiFi.', ar: 'اذكر جميع الأجهزة في منزلك التي تتصل بالواي فاي.' }, points: 30, repeatable: false, level: 'ks1', theme: 'Privacy', iconName: 'Layers', enabled: true },
  { id: 's7c2', strand: 7, title: { en: 'Privacy Shield', ar: 'درع الخصوصية' }, description: { en: 'Set your gaming profile to "Private".', ar: 'اجعل ملفك الشخصي في الألعاب "خاصاً".' }, points: 45, repeatable: false, level: 'ks2', theme: 'Privacy', iconName: 'ShieldCheck', enabled: true },
  { id: 's7c3', strand: 7, title: { en: 'The Passphrase', ar: 'عبارة المرور' }, description: { en: 'Create a password using 4 random words.', ar: 'أنشئ كلمة مرور باستخدام ٤ كلمات عشوائية.' }, points: 40, repeatable: false, level: 'ks2', theme: 'Security', iconName: 'Key', enabled: true },
  { id: 's7c4', strand: 7, title: { en: '2FA Setup', ar: 'إعداد التحقق الثنائي' }, description: { en: 'Help an adult setup two-factor login for one of their accounts.', ar: 'ساعد شخصاً بالغاً في إعداد تسجيل الدخول الثنائي لأحد حساباته.' }, points: 60, repeatable: false, level: 'secondary', theme: 'Security', iconName: 'Lock', enabled: true },
  // Strand 8: Copyright & Ownership
  { id: 's8c1', strand: 8, title: { en: 'Creator Credit', ar: 'نسب الفضل للمبدع' }, description: { en: 'Find the name of the photographer for an online photo.', ar: 'ابحث عن اسم المصور لصورة عبر الإنترنت.' }, points: 30, repeatable: true, level: 'ks1', theme: 'Copyright', iconName: 'Copyright', enabled: true },
  { id: 's8c2', strand: 8, title: { en: 'Stock Photo Pro', ar: 'محترف الصور المجانية' }, description: { en: 'Use a "Creative Commons" site to find an image.', ar: 'استخدم موقعاً لـ "المشاع الإبداعي" للبحث عن صورة.' }, points: 30, repeatable: true, level: 'ks2', theme: 'Copyright', iconName: 'ImageIcon', enabled: true },
  { id: 's8c3', strand: 8, title: { en: 'Fair Use Finder', ar: 'مكتشف الاستخدام العادل' }, description: { en: "Explain what a 'Fair Use' video is.", ar: 'اشرح ماهية فيديو "الاستخدام العادل".' }, points: 50, repeatable: false, level: 'secondary', theme: 'Copyright', iconName: 'Scale', enabled: true },
  { id: 's8c4', strand: 8, title: { en: 'Fair Use Mythbusting', ar: 'تحطيم خرافات الاستخدام العادل' }, description: { en: 'Explain why using "just 10 seconds of a song" is not a rule.', ar: 'اشرح لماذا استخدام "١٠ ثوانٍ فقط من أغنية" ليس قاعدة.' }, points: 50, repeatable: false, level: 'secondary', theme: 'Copyright', iconName: 'Scale', enabled: true }
];

const MASTER_GLOSSARY: GlossaryItem[] = [
  { id: 'g1', strand: 7, level: 1, term: { en: 'Phishing', ar: 'التصيد' }, primaryDefinition: { en: 'Digital Trickery: Like a fake fisherman using bait to catch your passwords.', ar: 'خداع رقمي: مثل صياد مزيف يستخدم طعماً لصيد كلمات مرورك.' }, secondaryDefinition: { en: 'A fraudulent practice of sending emails or links to steal sensitive data.', ar: 'ممارسة احتيالية لإرسال رسائل بريد أو روابط لسرقة بيانات حساسة.' } },
  { id: 'g2', strand: 3, level: 1, term: { en: 'Digital Footprint', ar: 'الأثر الرقمي' }, primaryDefinition: { en: 'Muddy Shoes: Every click and post leaves a trail that never fully washes away.', ar: 'أحذية طينية: كل نقرة ومنشور يترك أثراً لا يزول تماماً.' }, secondaryDefinition: { en: 'The unique set of traceable digital activities and data manifested on the Internet.', ar: 'مجموعة فريدة من الأنشطة والبيانات الرقمية التي يمكن تتبعها على الإنترنت.' } },
  { id: 'g3', strand: 7, level: 2, term: { en: 'Encryption', ar: 'التشفير' }, primaryDefinition: { en: 'Secret Code: Turning your message into a jumble that only the right key can read.', ar: 'خداء سري: تحويل رسالتك إلى خليط لا يمكن قراءته إلا بالمفتاح الصحيح.' }, secondaryDefinition: { en: 'The process of converting information or data into a code to prevent unauthorized access.', ar: 'عملية تحويل المعلومات أو البيانات إلى كود لمنع الوصول غير المصرح به.' } },
  { id: 'g4', strand: 6, level: 1, term: { en: 'Cookies', ar: 'ملفات تعريف الارتباط' }, primaryDefinition: { en: 'Crumbs: Small bits of info websites leave on your computer to remember who you are.', ar: 'فتات: معلومات صغيرة تتركها المواقع على جهازك لتتذكر هويتك.' }, secondaryDefinition: { en: 'Small files stored on a user\'s computer by the web browser while browsing a website.', ar: 'ملفات صغيرة مخزنة على جهاز المستخدم بواسطة المتصفح أثناء التصفح.' } },
  { id: 'g5', strand: 4, level: 1, term: { en: 'Cyberbullying', ar: 'التنمر الإلكتروني' }, primaryDefinition: { en: 'Digital Meanies: Using the internet to repeatedly hurt or scare someone.', ar: 'أشرار رقميون: استخدام الإنترنت لإيذاء شخص ما أو تخويفه بشكل متكرر.' }, secondaryDefinition: { en: 'The use of electronic communication to bully a person, typically by sending intimidating messages.', ar: 'استخدام الاتصالات الإلكترونية للتنمر، عادةً عن طريق رسائل التخويف.' } },
  { id: 'g6', strand: 8, level: 2, term: { en: 'Fair Use', ar: 'الاستخدام العادل' }, primaryDefinition: { en: 'Sharing Rules: When it\'s okay to use a small bit of someone else\'s work for school.', ar: 'قواعد المشاركة: متى يسمح باستخدام جزء صغير من عمل شخص آخر للمدرسة.' }, secondaryDefinition: { en: 'A legal doctrine that permits limited use of copyrighted material without permission.', ar: 'مبدأ قانوني يسمح باستخدام محدود للمواد المحمية دون إذن.' } },
  { id: 'g7', strand: 1, level: 1, term: { en: 'Algorithms', ar: 'الخوارزميات' }, primaryDefinition: { en: 'Robot Brain: A set of instructions that tells an app what to show you next.', ar: 'عقل الروبوت: مجموعة من التعليمات تخبر التطبيق بما يجب إظهاره لك لاحقاً.' }, secondaryDefinition: { en: 'A process or set of rules to be followed in calculations or problem-solving operations.', ar: 'عملية أو قواعد تتبع في العمليات الحسابية أو حل المشكلات.' } },
  { id: 'g8', strand: 7, level: 1, term: { en: '2FA', ar: 'التحقق الثنائي' }, primaryDefinition: { en: 'Double Lock: Using two keys (like a password and a phone code) to open your door.', ar: 'قفل مزدوج: استخدام مفتاحين (مثل كلمة المرور وكود الهاتف) لفتح بابك.' }, secondaryDefinition: { en: 'Multi-Factor Authentication: Requiring more than one method of authentication.', ar: 'المصادقة متعددة العوامل: تتطلب أكثر من طريقة واحدة للتحقق.' } },
  { id: 'g9', strand: 1, level: 2, term: { en: 'Data Harvesting', ar: 'حصاد البيانات' }, primaryDefinition: { en: 'Information Vacuum: Apps sucking up your info to sell it to advertisers.', ar: 'مكنسة المعلومات: تطبيقات تسحب معلوماتك لبيعها للمعلنين.' }, secondaryDefinition: { en: 'The process by which companies collect large amounts of data for analysis.', ar: 'العملية التي تقوم بها الشركات بجمع كميات كبيرة من البيانات للتحليل.' } },
  { id: 'g10', strand: 2, level: 1, term: { en: 'Grooming', ar: 'الاستمالة' }, primaryDefinition: { en: 'Fake Friendship: When a stranger acts nice online just to trick you later.', ar: 'صداقة مزيفة: عندما يتصرف غريب بلطف لخدعك لاحقاً.' }, secondaryDefinition: { en: 'When someone builds an emotional connection with a minor to gain their trust for exploitation.', ar: 'عندما يبني اتصالاً عاطفياً مع قاصر لكسب ثقته بهدف الاستغلال.' } }
];

const MASTER_SUPPORT: SupportLink[] = [
  { id: 'h1', name: { en: 'Childline', ar: 'خط نجدة الطفل' }, description: { en: 'Free, confidential support for any problem you\'re facing.', ar: 'دعم مجاني وسري لأي مشكلة تواجهها.' }, phone: '0800 1111', url: 'https://www.childline.org.uk', iconName: 'LifeBuoy' },
  { id: 'h2', name: { en: 'CEOP', ar: 'مركز حماية الطفل' }, description: { en: 'Reporting tool for online safety concerns and abuse.', ar: 'أداة إبلاغ عن مخاوف الأمان عبر الإنترنت والإساءة.' }, url: 'https://www.ceop.police.uk/safety-centre/', iconName: 'ShieldAlert' },
  { id: 'h3', name: { en: 'Report Harmful Content', ar: 'الإبلاغ عن محتوى ضار' }, description: { en: 'Advice on how to report content that shouldn\'t be online.', ar: 'نصائح حول كيفية الإبلاغ عن محتوى لا ينبغي أن يكون متاحاً.' }, url: 'https://reportharmfulcontent.com/', iconName: 'MessageSquareWarning' },
  { id: 'h4', name: { en: 'Internet Matters', ar: 'إنترنت ماترز' }, description: { en: 'Parent and student guides for staying safe on every app.', ar: 'أدلة للآباء والطلاب للبقاء آمنين في كل تطبيق.' }, url: 'https://www.internetmatters.org/', iconName: 'BookOpen' }
];

const DEFAULT_MASTER_CONFIG: MasterConfig = {
  id: 'school_default',
  schoolName: "NetVenture Academy",
  logoUrl: "",
  concernFormUrl: "#",
  supportEmail: "support@netventure.academy",
  adminPinHash: "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4", // 1234
  houseNames: { Potter: "Potter", Baggins: "Baggins", Poppins: "Poppins", Hood: "Hood" },
  team: [{ id: 't1', name: "Alex Rivers", role: "Safeguarding Lead" }],
  strands: STRANDS,
  challenges: MASTER_CHALLENGES,
  glossary: MASTER_GLOSSARY,
  posters: [
    { id: 'p1', title: { en: 'The Quiet Quest', ar: 'المهمة الهادئة' }, category: 'Well-being', imageUrl: '', familyQuest: { en: 'Can the whole family put their phones in a basket during dinner tonight?', ar: 'هل تستطيع العائلة وضع هواتفهم في سلة أثناء العشاء الليلة؟' } },
    { id: 'p2', title: { en: 'Legacy Talk', ar: 'حديث الإرث' }, category: 'Reputation', imageUrl: '', familyQuest: { en: 'Ask a parent: what is one thing they are glad WASN\'T recorded when they were kids?', ar: 'اسأل والديك: ما هو الشيء الذي يسعدهم أنه لم يسجل عندما كانوا أطفالاً؟' } },
    { id: 'p3', title: { en: 'Avatar Adventure', ar: 'مغامرة الأفاتار' }, category: 'Identity', imageUrl: '', familyQuest: { en: 'Create a family group avatar together using items found around the house.', ar: 'أنشئوا أفاتاراً جماعياً للعائلة باستخدام أشياء تجدونها في المنزل.' } },
    { id: 'p4', title: { en: 'Friendship Filter', ar: 'فلتر الصداقة' }, category: 'Relationships', imageUrl: '', familyQuest: { en: 'Discuss as a family: What are the top 3 rules for being a kind friend online?', ar: 'ناقشوا كعائلة: ما هي أهم ٣ قواعد لتكون صديقاً لطيفاً عبر الإنترنت؟' } },
    { id: 'p5', title: { en: 'Truth Detectives', ar: 'محققو الحقيقة' }, category: 'Information', imageUrl: '', familyQuest: { en: 'Find a viral news story and try to find two different sources to prove it is true.', ar: 'ابحثوا عن قصة إخبارية منتشرة وحاولوا إيجاد مصدرين مختلفين لإثبات صحتها.' } },
    { id: 'p6', title: { en: 'Privacy Patrol', ar: 'دورية الخصوصية' }, category: 'Privacy', imageUrl: '', familyQuest: { en: 'Check the privacy settings on the family smart TV or home assistant together.', ar: 'تحققوا من إعدادات الخصوصية في التلفاز الذكي أو المساعد المنزلي معاً.' } },
    { id: 'p7', title: { en: 'Screen-Free Sunrise', ar: 'شروق بلا شاشات' }, category: 'Well-being', imageUrl: '', familyQuest: { en: 'Spend the first hour after waking up tomorrow without any digital devices.', ar: 'اقضوا الساعة الأولى بعد الاستيقاظ غداً بدون أي أجهزة رقمية.' } },
    { id: 'p8', title: { en: 'Creative Credit', ar: 'الفضل للمبدع' }, category: 'Copyright', imageUrl: '', familyQuest: { en: 'When watching a movie tonight, wait for the credits and find the "Copyright" symbol.', ar: 'عند مشاهدة فيلم الليلة، انتظروا شارة النهاية وابحثوا عن رمز "حقوق الطبع والنشر".' } }
  ],
  supportLinks: MASTER_SUPPORT
};

const ICON_MAP: Record<string, any> = {
  UserCheck, Heart, ShieldCheck, Moon, Search, Key, PenTool, AlertCircle, 
  MessagesSquare, Eye, Fingerprint, Lock, RefreshCw, Copyright, 
  MessageSquareWarning, FileSearch, Trash2, ThumbsUp, BookMarked, MapPin, 
  Umbrella, Camera, BrainCircuit, Target, Backpack, Zap, Globe, ShieldAlert, ImageIcon,
  CheckCircle2, Star, Shield, Award, Sparkle, Sticker, History, HandHeart, Users, Link, Copy, Check, School, Trash, MessageCircle, Quote, Milestone, Scale, HeartHandshake, BookOpenCheck, ListPlus, UploadCloud, Eraser,
  ClipboardCheck, Flame, TrendingUp, PhoneCall, LifeBuoy, DownloadCloud, FileUp, LogOut, BellOff, ShieldHalf, Bug, Mail, Beaker, UserCircle, Database, Component, Boxes
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

const TaskBadge = ({ level, lang }: { level: string, lang: LanguageCode }) => {
  const styles: Record<string, string> = {
    all: "bg-slate-100 text-slate-500",
    ks1: "bg-amber-50 text-amber-600 border border-amber-100",
    ks2: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    secondary: "bg-violet-50 text-violet-600 border border-violet-100"
  };
  const labels: Record<string, Record<LanguageCode, string>> = {
    all: { en: "General", ar: "عام" },
    ks1: { en: "KS1", ar: "KS1" },
    ks2: { en: "KS2", ar: "KS2" },
    secondary: { en: "Secondary", ar: "ثانوي" }
  };
  return (
    <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-md ${styles[level] || styles.all}`}>
      {labels[level][lang]}
    </span>
  );
};

// --- Main App ---

const App: React.FC = () => {
  const [lang, setLang] = useState<LanguageCode>(() => (localStorage.getItem('nv_lang') as LanguageCode) || 'en');
  const [children, setChildren] = useState<Child[]>(() => SecureStorage.load('nv_children') || []);
  const [completions, setCompletions] = useState<Completion[]>(() => SecureStorage.load('nv_completions') || []);
  const [vault, setVault] = useState<MasterConfig[]>(() => {
    const loaded = SecureStorage.load('nv_school_vault');
    if (!loaded) return [DEFAULT_MASTER_CONFIG];
    return loaded;
  });

  const [activeChildId, setActiveChildId] = useState<string | null>(() => children[0]?.id || null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'challenges' | 'hub' | 'stickers' | 'support'>('dashboard');
  const [hubView, setHubView] = useState<'quests' | 'glossary'>('quests');
  const [showAdmin, setShowAdmin] = useState(false);
  const [showAddChild, setShowAddChild] = useState(false);
  const [adminSubTab, setAdminSubTab] = useState<'identity' | 'assets' | 'manifest' | 'maintenance'>('identity');
  const [assetSubView, setAssetSubView] = useState<'tasks' | 'quests'>('tasks');
  const [isAdminLocked, setIsAdminLocked] = useState(true);
  const [pinInput, setPinInput] = useState("");
  
  const [reflectingOn, setReflectingOn] = useState<Challenge | null>(null);
  const [reflectionText, setReflectionText] = useState("");
  const [showPledgeRenewal, setShowPledgeRenewal] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  const activeChild = children.find(c => c.id === activeChildId);
  const config = useMemo(() => {
    if (!activeChild) return vault[0];
    return vault.find(s => s.id === activeChild.schoolId) || vault[0];
  }, [activeChild, vault]);

  const activePoints = useMemo(() => {
    if (!activeChildId) return 0;
    return completions.filter(c => c.childId === activeChildId).reduce((a, b) => a + b.points, 0);
  }, [activeChildId, completions]);

  const categorizedTasks = useMemo(() => {
    if (!activeChild) return [];
    const filtered = config.challenges.filter(c => 
      (c.level === activeChild.level || c.level === 'all') && 
      (c.enabled !== false)
    );
    return config.strands.map((strand, idx) => ({ 
      strandId: idx + 1, 
      name: strand, 
      tasks: filtered.filter(t => t.strand === (idx + 1)) 
    })).filter(g => g.tasks.length > 0);
  }, [config.challenges, config.strands, activeChild]);

  const currentRank = useMemo(() => {
    if (!activeChild) return PLEDGE_RANKS[0];
    return [...PLEDGE_RANKS].reverse().find(r => activePoints >= r.threshold) || PLEDGE_RANKS[0];
  }, [activePoints, activeChild]);

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

  const needsPledgeRenewal = useMemo(() => {
    if (!activeChild) return false;
    return currentRank.level > activeChild.pledgeLevel;
  }, [currentRank, activeChild]);

  const updateVaultItem = (updated: MasterConfig) => setVault(prev => prev.map(v => v.id === updated.id ? updated : v));

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => updateVaultItem({ ...config, logoUrl: event.target?.result as string });
    reader.readAsDataURL(file);
  };

  const handlePosterImageUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      updateVaultItem({
        ...config,
        posters: config.posters.map(p => p.id === id ? { ...p, imageUrl: event.target?.result as string } : p)
      });
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => { 
    localStorage.setItem('nv_lang', lang); 
    document.body.dir = lang === 'ar' ? 'rtl' : 'ltr'; 
  }, [lang]);

  useEffect(() => SecureStorage.save('nv_children', children), [children]);
  useEffect(() => SecureStorage.save('nv_completions', completions), [completions]);
  useEffect(() => SecureStorage.save('nv_school_vault', vault), [vault]);

  const t = (key: string) => UI_STRINGS[key]?.[lang] || key;
  const lt = (text: TranslatedText) => text?.[lang] || "---";

  const logCompletion = (challenge: Challenge, reflection?: string) => {
    if (!activeChildId) return;
    if (!challenge.repeatable && completions.some(c => c.childId === activeChildId && c.challengeId === challenge.id)) return;
    setCompletions(prev => [...prev, { childId: activeChildId!, challengeId: challenge.id, timestamp: Date.now(), points: challenge.points, reflection }]);
    setReflectingOn(null);
    setReflectionText("");
  };

  const seedDemoData = () => {
    if (!confirm("This will load a high-fidelity demonstration scenario. Existing local data will be replaced. Continue?")) return;
    setIsSeeding(true);
    setTimeout(() => {
      const demoStudents: Child[] = [
        { id: 'd1', name: 'Zoe Explorer', year: 4, className: '4 Juniper Blue', house: 'Potter', level: 'ks2', pledgeSigned: true, schoolId: 'school_default', pledgeLevel: 2, lastPledgeXP: 400 },
        { id: 'd2', name: 'Liam Scout', year: 2, className: '2 Beechwood', house: 'Baggins', level: 'ks1', pledgeSigned: true, schoolId: 'school_default', pledgeLevel: 1, lastPledgeXP: 150 },
        { id: 'd3', name: 'Sarah Guardian', year: 9, className: 'Year 9 Alpha', house: 'Poppins', level: 'secondary', pledgeSigned: true, schoolId: 'school_default', pledgeLevel: 4, lastPledgeXP: 1200 },
        { id: 'd4', name: 'Amir Sentinel', year: 6, className: '6 Hawthorn', house: 'Hood', level: 'ks2', pledgeSigned: true, schoolId: 'school_default', pledgeLevel: 3, lastPledgeXP: 800 }
      ];
      const demoComps: Completion[] = [];
      demoStudents.forEach(s => {
        MASTER_CHALLENGES.filter(c => c.level === s.level || c.level === 'all').forEach((c, idx) => {
          if (Math.random() > 0.3) {
            demoComps.push({ 
              childId: s.id, 
              challengeId: c.id, 
              timestamp: Date.now() - (idx * 172800000),
              points: c.points,
              reflection: s.level === 'secondary' ? "Completed this task during digital safety week." : undefined
            });
          }
        });
      });
      setVault([DEFAULT_MASTER_CONFIG]);
      setChildren(demoStudents);
      setCompletions(demoComps);
      setActiveChildId('d3'); 
      setActiveTab('dashboard');
      setShowAdmin(false);
      setIsAdminLocked(true);
      setIsSeeding(false);
      alert("NetVenture Academy Demo Environment Initialized!");
    }, 800);
  };

  const generateTechnicalSupportEmail = () => {
    if (!activeChild) return;
    const subject = `NetVenture Support: ${config.schoolName} - ${activeChild.name}`;
    const body = `--- DIAGNOSTICS ---\nUser: ${activeChild.name}\nSchool: ${config.id}\nYear: ${activeChild.year}\nLevel: ${activeChild.level}\nUA: ${navigator.userAgent}\nTS: ${new Date().toISOString()}\n\n--- ISSUE ---\nPlease describe the problem:\n\n`;
    window.location.href = `mailto:${config.supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="min-h-screen flex flex-col text-slate-900 bg-slate-50 overflow-x-hidden">
      <nav className="sticky top-0 z-[100] bg-white/80 backdrop-blur-xl border-b border-slate-200 px-6 sm:px-12 h-24 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-1 bg-indigo-600 rounded-2xl text-white shadow-lg overflow-hidden flex items-center justify-center min-w-[3.5rem] min-h-[3.5rem]">
            {config.logoUrl ? <img src={config.logoUrl} className="w-12 h-12 object-contain" /> : <ShieldCheck className="w-8 h-8" />}
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-indigo-900 leading-none">NetVenture</h1>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{config.schoolName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {needsPledgeRenewal && <button onClick={() => setShowPledgeRenewal(true)} className="bg-amber-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase animate-pulse shadow-lg flex items-center gap-2"><Milestone className="w-4 h-4" /> {t('rank_up')}</button>}
          <button onClick={() => { setShowAdmin(true); setIsAdminLocked(true); setPinInput(""); }} className="p-3 bg-slate-100 rounded-2xl text-slate-500 hover:text-indigo-600 transition-all active:scale-95"><Settings className="w-6 h-6" /></button>
          {activeChild && <button onClick={() => setActiveChildId(null)} className="flex items-center gap-3 bg-white pl-2 pr-4 py-2 rounded-full border border-slate-200 shadow-sm hover:bg-rose-50 transition-all group">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50" style={{ color: HOUSE_ASSETS[activeChild.house].defaultColor }}><LogOut className="w-5 h-5 hidden group-hover:block text-rose-500" /><div className="group-hover:hidden">{React.createElement(HOUSE_ASSETS[activeChild.house].icon, { className: "w-6 h-6" })}</div></div>
            <div className="flex flex-col text-left rtl:text-right leading-none"><span className="text-xs font-black">{activeChild.name}</span><span className="text-[8px] font-bold text-slate-400 uppercase tracking-tight">{activeChild.className || 'Explorer'} • Year {activeChild.year}</span></div>
          </button>}
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 sm:p-12 pb-64 animate-slide-up">
        {!activeChildId ? (
          <div className="text-center py-20 space-y-12">
            <div className="w-48 h-48 mx-auto rounded-[4rem] bg-indigo-600 text-white flex items-center justify-center shadow-2xl rotate-3 overflow-hidden">
               {config.logoUrl ? <img src={config.logoUrl} className="w-32 h-32 object-contain" /> : <Sparkles className="w-20 h-20" />}
            </div>
            <div className="space-y-4">
              <h2 className="text-6xl font-black text-slate-800 tracking-tighter leading-tight">Master the Web.<br/>Secure the Glory.</h2>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">A Digital Safety Quest by {config.schoolName}</p>
            </div>
            <div className="flex flex-col items-center gap-6"><button onClick={() => setShowAddChild(true)} className="bg-slate-900 text-white px-12 py-6 rounded-[2rem] font-black text-xl hover:scale-105 transition-all shadow-xl uppercase">{t('start')}</button>
               {children.length > 0 && <div className="flex flex-wrap justify-center gap-4 mt-8">{children.map(child => <button key={child.id} onClick={() => setActiveChildId(child.id)} className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-600 transition-all flex items-center gap-3 group text-left">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 shrink-0" style={{ color: HOUSE_ASSETS[child.house].defaultColor }}>{React.createElement(HOUSE_ASSETS[child.house].icon, { className: "w-5 h-5" })}</div>
                <div className="flex flex-col leading-tight"><span className="text-xs font-black text-slate-700">{child.name}</span><span className="text-[8px] font-black text-slate-400 uppercase tracking-tight">{child.className}</span></div>
                </button>)}</div>}
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            {activeTab === 'dashboard' && <div className="space-y-14">
                <div className="clay-card p-10 rounded-[4rem] flex flex-col md:flex-row justify-between items-center gap-10">
                  <div className="text-center md:text-left rtl:md:text-right">
                    <h2 className="text-5xl font-black text-slate-800 tracking-tighter leading-none">{t('hello')}, {activeChild.name}!</h2>
                    <div className="flex gap-4 mt-6"><span className="text-[11px] font-black text-indigo-600 uppercase bg-indigo-50 px-5 py-2 rounded-full shadow-sm">{lt(currentRank.title)}</span><span className="text-[11px] font-black text-slate-400 uppercase px-5 py-2 rounded-full border border-slate-100">{t(activeChild.level)}</span></div>
                  </div>
                  <div className="w-32 h-32 rounded-[3.5rem] bg-white shadow-xl flex items-center justify-center border-8 border-slate-50" style={{ color: HOUSE_ASSETS[activeChild.house].defaultColor }}>{React.createElement(HOUSE_ASSETS[activeChild.house].icon, { className: "w-16 h-16" })}</div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 px-2"><Trophy className="w-4 h-4" /> {t('house_standings')}</h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {(Object.keys(HOUSE_ASSETS) as HouseKey[]).map(houseKey => {
                      const pts = housePoints[houseKey] || 0;
                      const maxPts = Math.max(...Object.values(housePoints), 1);
                      const isWinning = pts === Math.max(...Object.values(housePoints)) && pts > 0;
                      return <div key={houseKey} className={`bg-white p-8 rounded-[3rem] clay-card relative overflow-hidden transition-all border-b-[10px]`} style={{ borderBottomColor: HOUSE_ASSETS[houseKey].defaultColor }}>
                        {isWinning && <div className="absolute top-4 right-4 text-amber-500 animate-bounce"><Crown className="w-5 h-5 fill-current" /></div>}
                        <div className="flex items-center gap-3 mb-4"><div className="p-3 rounded-2xl bg-slate-50" style={{ color: HOUSE_ASSETS[houseKey].defaultColor }}>{React.createElement(HOUSE_ASSETS[houseKey].icon, { className: "w-6 h-6" })}</div><span className="text-xs font-black uppercase text-slate-500">{config.houseNames[houseKey]}</span></div>
                        <div className="text-3xl font-black tracking-tighter text-slate-800">{pts.toLocaleString()}</div>
                        <div className="h-1.5 w-full bg-slate-50 rounded-full mt-6 overflow-hidden"><div className="h-full transition-all duration-1000" style={{ width: `${(pts / maxPts) * 100}%`, backgroundColor: HOUSE_ASSETS[houseKey].defaultColor }}></div></div>
                      </div>;
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                   {config.strands.map((strand, i) => {
                     const strandId = i + 1;
                     const tasks = config.challenges.filter(c => (c.level === activeChild.level || c.level === 'all') && c.strand === strandId && (c.enabled !== false));
                     const doneCount = new Set(completions.filter(c => c.childId === activeChildId && config.challenges.find(ch => ch.id === c.challengeId)?.strand === strandId).map(c => c.challengeId)).size;
                     const progress = tasks.length > 0 ? (doneCount / tasks.length) * 100 : 0;
                     return <div key={strandId} className="bg-white p-8 rounded-[3rem] clay-card relative flex flex-col justify-between group">
                       <div><div className="flex items-center justify-between mb-4"><span className="text-[9px] font-black uppercase text-slate-400">Strand {strandId}</span>{progress === 100 && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}</div><h4 className="text-[11px] font-black uppercase tracking-tight text-slate-700 leading-tight mb-4">{lt(strand)}</h4></div>
                       <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mt-4"><div className="h-full bg-indigo-600 transition-all duration-700" style={{ width: `${progress}%` }}></div></div>
                     </div>;
                   })}
                </div>
              </div>}

            {activeTab === 'challenges' && <div className="space-y-16">
                <div className="flex items-center justify-between px-2"><div className="flex items-center gap-4"><div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg"><Filter className="w-5 h-5" /></div><div><h3 className="text-xl font-black uppercase tracking-tighter leading-none">Master Asset Inventory</h3><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Targeting {activeChild.level.toUpperCase()} content</p></div></div></div>
                {categorizedTasks.map(group => <div key={group.strandId} className="space-y-8">
                    <div className="flex items-center gap-4"><div className="h-px flex-1 bg-slate-200"></div><h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{lt(group.name)}</h4><div className="h-px flex-1 bg-slate-200"></div></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">{group.tasks.map(chall => {
                        const isDone = completions.some(c => c.childId === activeChildId && c.challengeId === chall.id);
                        return <div key={chall.id} className={`bg-white p-10 rounded-[4rem] clay-card flex flex-col justify-between group transition-all ${isDone && !chall.repeatable ? 'opacity-60 grayscale' : ''}`}>
                            <div className="space-y-6"><div className="flex justify-between items-start"><div className="p-5 bg-slate-50 rounded-[2.5rem] text-indigo-600 shadow-inner">{React.createElement(ICON_MAP[chall.iconName] || ShieldCheck, { className: "w-8 h-8" })}</div><div className="flex flex-col items-end gap-2"><div className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-4 py-2 rounded-xl uppercase">+{chall.points} XP</div><TaskBadge level={chall.level} lang={lang} /></div></div><h4 className="text-2xl font-black uppercase tracking-tighter leading-none">{lt(chall.title)}</h4><p className="text-sm text-slate-500 font-bold leading-relaxed">{lt(chall.description)}</p></div>
                            <button onClick={() => (chall.reflectionPrompt && activeChild.level === 'secondary') ? setReflectingOn(chall) : logCompletion(chall)} disabled={isDone && !chall.repeatable} className="w-full bg-slate-900 text-white py-6 rounded-[2.5rem] font-black mt-10 active:scale-95 transition-all flex items-center justify-center gap-3 uppercase shadow-lg disabled:bg-slate-100 disabled:text-slate-400">{isDone && !chall.repeatable ? <Check className="w-6 h-6" /> : <Plus className="w-6 h-6" />}{isDone && !chall.repeatable ? "Completed" : t('log_task')}</button>
                          </div>;
                    })}</div>
                  </div>)}
              </div>}

            {activeTab === 'hub' && <div className="space-y-12">
                <div className="flex justify-center mb-8">
                  <div className="inline-flex p-2 bg-slate-200/50 backdrop-blur rounded-[2rem] clay-card border-slate-100">
                    <button onClick={() => setHubView('quests')} className={`px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase transition-all flex items-center gap-2 ${hubView === 'quests' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:text-indigo-600'}`}>
                      <Sparkles className="w-4 h-4" /> {t('hub_quests')}
                    </button>
                    <button onClick={() => setHubView('glossary')} className={`px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase transition-all flex items-center gap-2 ${hubView === 'glossary' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:text-indigo-600'}`}>
                      <BookOpen className="w-4 h-4" /> {t('hub_glossary')}
                    </button>
                  </div>
                </div>
                {hubView === 'quests' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">{config.posters.map(poster => (
                    <div key={poster.id} className="bg-white p-10 rounded-[4rem] clay-card flex flex-col md:flex-row gap-10 items-center border-l-[12px] border-indigo-600 min-h-[15rem]">
                      <div className="w-24 h-24 bg-indigo-50 rounded-[3rem] flex items-center justify-center text-indigo-600 shadow-inner shrink-0 overflow-hidden relative">
                        {poster.imageUrl ? <img src={poster.imageUrl} className="w-full h-full object-cover" /> : <MessageSquareQuote className="w-12 h-12" />}
                      </div>
                      <div className="space-y-4 text-center md:text-left rtl:md:text-right flex-1">
                        <h4 className="text-xs font-black uppercase text-indigo-400">{lt(poster.title)}</h4>
                        <p className="text-lg font-black text-slate-800 leading-tight">"{lt(poster.familyQuest)}"</p>
                        <span className="text-[9px] font-black uppercase bg-slate-100 px-4 py-1.5 rounded-full text-slate-500 inline-block">Focus: {poster.category}</span>
                      </div>
                    </div>
                  ))}</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{config.glossary.map(item => (
                    <div key={item.id} className="p-8 bg-white rounded-[3rem] clay-card hover:bg-slate-50 transition-all border-t-4 border-transparent hover:border-indigo-100">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-black text-indigo-700 text-lg uppercase tracking-tight">{lt(item.term)}</h4>
                        <div className="bg-slate-100 text-[8px] font-black px-2 py-1 rounded uppercase">Strand {item.strand}</div>
                      </div>
                      <p className="text-[13px] text-slate-600 font-bold leading-relaxed">{activeChild.level === 'ks1' ? lt(item.primaryDefinition) : lt(item.secondaryDefinition)}</p>
                    </div>
                  ))}</div>
                )}
              </div>}

            {activeTab === 'stickers' && <div className="space-y-12 animate-slide-up"><div className="text-center space-y-4"><h2 className="text-4xl font-black uppercase tracking-tighter">Guardian Sigils</h2><p className="text-slate-500 font-bold text-sm px-6">Master every challenge in a strand to unlock its unique Golden Shield.</p></div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8">{config.strands.map((strand, idx) => {
                    const strandId = idx + 1;
                    const tasks = config.challenges.filter(c => (c.level === activeChild.level || c.level === 'all') && c.strand === strandId && (c.enabled !== false));
                    const doneCount = new Set(completions.filter(c => c.childId === activeChildId && config.challenges.find(ch => ch.id === c.challengeId)?.strand === strandId).map(c => c.challengeId)).size;
                    const isUnlocked = tasks.length > 0 && doneCount === tasks.length;
                    return <div key={strandId} className={`flex flex-col items-center gap-6 p-10 rounded-[4rem] clay-card transition-all ${isUnlocked ? 'bg-amber-50 ring-4 ring-amber-200 shadow-amber-100 scale-105' : 'opacity-40 grayscale'}`}><div className={`w-24 h-24 rounded-full flex items-center justify-center shadow-2xl ${isUnlocked ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white' : 'bg-slate-100 text-slate-400'}`}>{isUnlocked ? <ShieldCheck className="w-14 h-14" /> : <Lock className="w-10 h-10" />}</div><div className="text-center"><h4 className="text-[10px] font-black uppercase tracking-widest text-slate-700">{lt(strand)}</h4><p className="text-[9px] font-bold text-slate-400 uppercase mt-1">{doneCount} / {tasks.length} Done</p></div></div>;
                })}</div>
              </div>}

            {activeTab === 'support' && <div className="space-y-12 animate-slide-up">
                 <div className="p-12 bg-rose-50 rounded-[4rem] clay-card border-l-[12px] border-rose-500 flex flex-col md:flex-row gap-10 items-center"><div className="w-24 h-24 bg-white rounded-[3rem] shadow-xl flex items-center justify-center text-rose-500 shrink-0"><ShieldAlert className="w-12 h-12" /></div><div className="space-y-4 flex-1"><h3 className="text-3xl font-black uppercase tracking-tighter text-rose-900">Immediate Help</h3><p className="text-rose-900/60 font-bold leading-relaxed">If something online has made you feel scared, sad, or unsafe, please reach out. You are not alone, and help is always available.</p><div className="flex gap-4"><a href={config.concernFormUrl} target="_blank" className="bg-rose-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs shadow-lg hover:bg-rose-700 transition-all flex items-center gap-2"><MessageSquareWarning className="w-5 h-5" /> Report to School</a></div></div></div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">{config.supportLinks.map(link => <div key={link.id} className="bg-white p-10 rounded-[4rem] clay-card flex flex-col justify-between border-t-4 border-slate-100"><div className="space-y-4"><div className="p-4 bg-slate-50 w-fit rounded-2xl text-indigo-600">{React.createElement(ICON_MAP[link.iconName] || LifeBuoy, { className: "w-8 h-8" })}</div><h4 className="text-2xl font-black uppercase tracking-tighter">{lt(link.name)}</h4><p className="text-sm text-slate-500 font-bold leading-relaxed">{lt(link.description)}</p></div><div className="mt-8 flex gap-4">{link.phone && <a href={`tel:${link.phone}`} className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase text-xs text-center shadow-lg flex items-center justify-center gap-2"><PhoneCall className="w-4 h-4" /> {link.phone}</a>}<a href={link.url} target="_blank" className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-xs text-center shadow-lg flex items-center justify-center gap-2"><ExternalLink className="w-4 h-4" /> Visit</a></div></div>)}</div>
              </div>}
          </div>
        )}
        
        {/* Copyright Footer */}
        <footer className="mt-20 pb-10 text-center space-y-2 opacity-40 hover:opacity-100 transition-opacity">
          <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <Copyright className="w-3 h-3" />
            <span>2024 NetVenture by Justin Baptiste</span>
          </div>
          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">All Rights Reserved • Proprietary Digital Curriculum</p>
        </footer>
      </main>

      {/* Admin Panel */}
      {showAdmin && <div className="fixed inset-0 z-[200] bg-slate-900/95 backdrop-blur-2xl flex items-center justify-center p-6"><div className="bg-white w-full max-w-6xl rounded-[4rem] p-0 relative shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <button className="absolute top-8 right-8 p-3 hover:bg-slate-100 rounded-full z-10" onClick={() => setShowAdmin(false)}><X className="w-8 h-8" /></button>
            {isAdminLocked ? <div className="flex flex-col items-center justify-center py-40 space-y-10 animate-slide-up text-center w-full px-6"><ShieldPlus className="w-20 h-20 text-indigo-600" /><h3 className="text-4xl font-black uppercase tracking-tighter">Vault Encryption Required</h3><input type="password" value={pinInput} onChange={async e => { setPinInput(e.target.value); if (e.target.value.length === 4 && (await hashPin(e.target.value)) === config.adminPinHash) setIsAdminLocked(false); }} className="w-full max-w-[280px] bg-slate-50 px-10 py-6 rounded-[2rem] text-center font-black text-3xl tracking-[1em] outline-none border-4 border-transparent shadow-inner focus:border-indigo-600" autoFocus maxLength={4} /></div> : <div className="flex flex-1 overflow-hidden h-full">
                <aside className="w-72 bg-slate-50 border-r border-slate-200 p-10 flex flex-col gap-4"><div className="mb-6"><h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Configuration</h3><div className="h-1 w-12 bg-indigo-600 rounded-full"></div></div>
                  {[{ id: 'identity', icon: Palette, label: 'Identity' }, { id: 'assets', icon: LayoutList, label: 'Inventory' }, { id: 'manifest', icon: Database, label: 'Asset Manifest' }, { id: 'maintenance', icon: RefreshCw, label: 'Maintenance' }].map(tab => <button key={tab.id} onClick={() => setAdminSubTab(tab.id as any)} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${adminSubTab === tab.id ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-400 hover:bg-white hover:text-slate-600'}`}>{React.createElement(tab.icon, { className: "w-5 h-5" })} {tab.label}</button>)}
                  <button onClick={() => { if(confirm("Full Wipe?")) { SecureStorage.save('nv_children', []); SecureStorage.save('nv_completions', []); SecureStorage.save('nv_school_vault', null); window.location.reload(); } }} className="mt-auto text-[8px] font-black text-rose-400 uppercase tracking-widest hover:text-rose-600">Wipe Local Data</button>
                </aside>
                <div className="flex-1 p-12 overflow-y-auto bg-white no-scrollbar">
                  {adminSubTab === 'identity' && <div className="space-y-12 animate-slide-up"><div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-4"><h4 className="text-xs font-black uppercase text-slate-400 tracking-widest ml-2">School Visuals</h4><div className="flex flex-col gap-6 p-8 bg-slate-50 rounded-[3rem] items-center border border-slate-100 shadow-inner"><div className="w-40 h-40 bg-white rounded-[3rem] shadow-xl flex items-center justify-center border-4 border-slate-100 overflow-hidden relative group">{config.logoUrl ? <img src={config.logoUrl} className="w-full h-full object-contain p-2" /> : <School className="w-16 h-16 text-slate-200" />}<label className="absolute inset-0 bg-indigo-600/90 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center text-white cursor-pointer p-4 text-center"><UploadCloud className="w-8 h-8 mb-2" /><span className="text-[10px] font-black uppercase">Replace Badge</span><input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} /></label></div></div></div>
                        <div className="space-y-6"><h4 className="text-xs font-black uppercase text-slate-400 tracking-widest ml-2">Compliance Score</h4><div className="bg-emerald-50 p-8 rounded-[3rem] border border-emerald-100 shadow-sm space-y-4">{[{ label: 'Glossary (10 Terms)', status: config.glossary.length >= 10 }, { label: 'Inventory (32 Tasks)', status: config.challenges.length >= 32 }, { label: 'House Points', status: true }, { label: 'Diagnostic Reporting', status: true }].map((check, idx) => <div key={idx} className="flex items-center gap-3">{check.status ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <AlertCircle className="w-5 h-5 text-amber-500" />}<span className="text-[10px] font-black uppercase text-emerald-900">{check.label}</span></div>)}</div>
                          <div className="space-y-3"><label className="text-[10px] font-black uppercase text-slate-400 ml-4">School Name</label><input value={config.schoolName} onChange={e => updateVaultItem({...config, schoolName: e.target.value})} className="w-full bg-slate-50 p-6 rounded-3xl font-black shadow-inner" /></div>
                          <div className="space-y-3"><label className="text-[10px] font-black uppercase text-slate-400 ml-4">Support Contact (Email)</label><input value={config.supportEmail} onChange={e => updateVaultItem({...config, supportEmail: e.target.value})} className="w-full bg-slate-50 p-6 rounded-3xl font-black shadow-inner" placeholder="you@school.com" /></div>
                          <div className="space-y-3"><label className="text-[10px] font-black uppercase text-slate-400 ml-4">Reporting Form URL (Google Form)</label><input value={config.concernFormUrl} onChange={e => updateVaultItem({...config, concernFormUrl: e.target.value})} className="w-full bg-slate-50 p-6 rounded-3xl font-black shadow-inner text-xs" placeholder="https://docs.google.com/forms/..." /></div>
                        </div>
                      </div></div>}
                  
                  {adminSubTab === 'manifest' && <div className="space-y-12 animate-slide-up pb-20">
                      <div className="flex items-center gap-4 mb-8">
                        <div className="p-4 bg-indigo-600 text-white rounded-[1.5rem] shadow-lg"><Database className="w-8 h-8" /></div>
                        <div><h3 className="text-3xl font-black uppercase tracking-tighter">Master System Manifest</h3><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Platform Reference Index</p></div>
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {/* House Assets */}
                        <div className="space-y-6">
                           <h4 className="flex items-center gap-2 text-xs font-black uppercase text-slate-400 tracking-[0.2em] ml-2"><Boxes className="w-4 h-4" /> 1. House Command Centre</h4>
                           <div className="grid grid-cols-2 gap-4">
                             {(Object.keys(HOUSE_ASSETS) as HouseKey[]).map(hk => (
                               <div key={hk} className="p-6 bg-slate-50 rounded-[2.5rem] flex items-center gap-4 border border-slate-100 shadow-inner">
                                 <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md" style={{ backgroundColor: HOUSE_ASSETS[hk].defaultColor }}>{React.createElement(HOUSE_ASSETS[hk].icon, { className: "w-6 h-6" })}</div>
                                 <div className="flex flex-col"><span className="text-[10px] font-black uppercase text-slate-800">{hk}</span><span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{config.houseNames[hk]} Identity</span></div>
                               </div>
                             ))}
                           </div>
                        </div>

                        {/* achievement Sigils */}
                        <div className="space-y-6">
                           <h4 className="flex items-center gap-2 text-xs font-black uppercase text-slate-400 tracking-[0.2em] ml-2"><Award className="w-4 h-4" /> 2. Achievement Sigils</h4>
                           <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 space-y-3 shadow-inner">
                             {config.strands.map((s, i) => (
                               <div key={i} className="flex items-center justify-between bg-white px-5 py-3 rounded-2xl border border-slate-100">
                                 <span className="text-[10px] font-black uppercase text-slate-600">{lt(s)}</span>
                                 <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-sm"><ShieldCheck className="w-4 h-4" /></div>
                               </div>
                             ))}
                           </div>
                        </div>
                      </div>

                      {/* Curriculum Inventory */}
                      <div className="space-y-6">
                         <h4 className="flex items-center gap-2 text-xs font-black uppercase text-slate-400 tracking-[0.2em] ml-2"><Component className="w-4 h-4" /> 3. Curriculum Asset Inventory (32 Tasks)</h4>
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {config.challenges.map(c => (
                              <div key={c.id} className={`p-6 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col gap-3 transition-all ${c.enabled === false ? 'opacity-50 grayscale' : ''}`}>
                                <div className="flex justify-between items-start">
                                  <div className="p-3 bg-slate-50 rounded-xl text-indigo-600 shadow-inner">{React.createElement(ICON_MAP[c.iconName] || ShieldCheck, { className: "w-5 h-5" })}</div>
                                  <span className="text-[8px] font-black uppercase bg-emerald-50 text-emerald-600 px-2 py-1 rounded">+{c.points} XP</span>
                                </div>
                                <h5 className="text-[11px] font-black uppercase text-slate-800 leading-tight">{lt(c.title)}</h5>
                                <TaskBadge level={c.level} lang={lang} />
                              </div>
                            ))}
                         </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {/* Glossary */}
                        <div className="space-y-6">
                           <h4 className="flex items-center gap-2 text-xs font-black uppercase text-slate-400 tracking-[0.2em] ml-2"><BookOpen className="w-4 h-4" /> 4. Digital Safety Glossary</h4>
                           <div className="grid grid-cols-2 gap-4">
                             {config.glossary.map(g => (
                               <div key={g.id} className="p-5 bg-white border border-slate-100 rounded-[2rem] shadow-sm">
                                 <span className="text-[10px] font-black uppercase text-indigo-600">{lt(g.term)}</span>
                                 <p className="text-[8px] font-bold text-slate-400 uppercase mt-1 leading-tight">Strand {g.strand} Integration</p>
                               </div>
                             ))}
                           </div>
                        </div>

                        {/* Quests */}
                        <div className="space-y-6">
                           <h4 className="flex items-center gap-2 text-xs font-black uppercase text-slate-400 tracking-[0.2em] ml-2"><Sparkles className="w-4 h-4" /> 5. Family Quest Hub</h4>
                           <div className="grid grid-cols-1 gap-4">
                             {config.posters.map(p => (
                               <div key={p.id} className="p-5 bg-white border border-slate-100 rounded-[2rem] shadow-sm flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-indigo-600 shadow-inner"><MessageSquareQuote className="w-5 h-5" /></div>
                                 <div className="flex flex-col"><span className="text-[10px] font-black uppercase text-slate-800">{lt(p.title)}</span><span className="text-[8px] font-bold text-slate-400 uppercase">{p.category} Focus</span></div>
                               </div>
                             ))}
                           </div>
                        </div>
                      </div>

                      {/* Help/Support Assets */}
                      <div className="space-y-6">
                         <h4 className="flex items-center gap-2 text-xs font-black uppercase text-slate-400 tracking-[0.2em] ml-2"><ShieldAlert className="w-4 h-4" /> 6. Help & Support Infrastructure</h4>
                         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="p-6 bg-rose-50 rounded-[2.5rem] border border-rose-100 shadow-inner">
                               <span className="text-[10px] font-black uppercase text-rose-800">Concern Reporting</span>
                               <p className="text-[8px] font-bold text-rose-600/60 uppercase mt-1">Direct School Link Integrated</p>
                            </div>
                            {config.supportLinks.map(l => (
                              <div key={l.id} className="p-6 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
                                <span className="text-[10px] font-black uppercase text-slate-800">{lt(l.name)}</span>
                                <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">{l.url.replace('https://', '')}</p>
                              </div>
                            ))}
                         </div>
                      </div>
                  </div>}

                  {adminSubTab === 'maintenance' && <div className="space-y-12 animate-slide-up">
                      <div className="p-12 bg-amber-50 rounded-[4rem] border-2 border-dashed border-amber-200 text-center space-y-6">
                        <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center text-amber-600 mx-auto shadow-xl">
                          {isSeeding ? <RefreshCw className="w-10 h-10 animate-spin" /> : <Beaker className="w-10 h-10" />}
                        </div>
                        <h4 className="text-2xl font-black uppercase tracking-tighter">High-Fidelity Demo Mode</h4>
                        <button onClick={seedDemoData} disabled={isSeeding} className="bg-amber-600 text-white px-10 py-5 rounded-[1.5rem] font-black uppercase text-xs shadow-xl active:scale-95 transition-all disabled:opacity-50">{isSeeding ? "Initializing..." : "Launch Demo Scenario"}</button>
                      </div>
                    </div>}
                  {adminSubTab === 'assets' && <div className="space-y-8 animate-slide-up h-full flex flex-col">
                      <div className="flex gap-4 p-2 bg-slate-50 rounded-2xl w-fit">
                        <button onClick={() => setAssetSubView('tasks')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${assetSubView === 'tasks' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>Tasks Inventory</button>
                        <button onClick={() => setAssetSubView('quests')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${assetSubView === 'quests' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>Family Quests</button>
                      </div>
                      <div className="flex-1 mt-6">
                        {assetSubView === 'tasks' ? (
                          <div className="space-y-12 animate-slide-up pb-20">
                            <div className="flex justify-between items-center"><h4 className="text-xl font-black uppercase tracking-tighter">Task Management</h4><button onClick={() => updateVaultItem({...config, challenges: [...config.challenges, { id: Date.now().toString(), title: { en: "New Task", ar: "" }, description: { en: "", ar: "" }, points: 20, strand: 1, repeatable: false, level: 'all', theme: "", iconName: "ShieldCheck", enabled: true }]})} className="bg-indigo-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 shadow-lg"><Plus className="w-4 h-4" /> Add Custom Task</button></div>
                            <div className="grid grid-cols-1 gap-6">{config.challenges.map(chall => (
                              <div key={chall.id} className={`p-8 rounded-[3rem] border space-y-6 shadow-sm bg-white border-slate-100 ${chall.enabled === false ? 'opacity-60 bg-slate-50' : ''}`}>
                                <div className="flex justify-between items-center gap-4">
                                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1"><label className="text-[8px] font-black uppercase text-slate-400 ml-1">Title (EN)</label><input value={chall.title.en} onChange={e => updateVaultItem({...config, challenges: config.challenges.map(c => c.id === chall.id ? {...c, title: {...c.title, en: e.target.value}} : c)})} className="w-full bg-slate-50 p-4 rounded-xl font-black text-sm" /></div>
                                    <div className="space-y-1"><label className="text-[8px] font-black uppercase text-slate-400 ml-1">Title (AR)</label><input dir="rtl" value={chall.title.ar} onChange={e => updateVaultItem({...config, challenges: config.challenges.map(c => c.id === chall.id ? {...c, title: {...c.title, ar: e.target.value}} : c)})} className="w-full bg-slate-50 p-4 rounded-xl font-black text-sm" /></div>
                                  </div>
                                  <div className="flex flex-col gap-2 items-end">
                                    <button onClick={() => updateVaultItem({...config, challenges: config.challenges.map(c => c.id === chall.id ? {...c, enabled: !c.enabled} : c)})} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${chall.enabled !== false ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                      {chall.enabled !== false ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />} {chall.enabled !== false ? 'Enabled' : 'Disabled'}
                                    </button>
                                    <button onClick={() => updateVaultItem({...config, challenges: config.challenges.filter(c => c.id !== chall.id)})} className="text-rose-400 hover:bg-rose-50 p-2 rounded-lg"><Trash className="w-4 h-4" /></button>
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                  <div className="space-y-2"><label className="text-[9px] font-black uppercase text-slate-400 ml-1">Curriculum Phase</label><select value={chall.level} onChange={e => updateVaultItem({...config, challenges: config.challenges.map(c => c.id === chall.id ? {...c, level: e.target.value as any} : c)})} className="w-full bg-slate-50 p-4 rounded-xl font-black text-xs uppercase"><option value="ks1">KS1 (Foundation)</option><option value="ks2">KS2 (Explorer)</option><option value="secondary">Secondary (Guardian)</option><option value="all">Universal (All)</option></select></div>
                                  <div className="space-y-2"><label className="text-[9px] font-black uppercase text-slate-400 ml-1">Points (XP)</label><input type="number" value={chall.points} onChange={e => updateVaultItem({...config, challenges: config.challenges.map(c => c.id === chall.id ? {...c, points: parseInt(e.target.value)} : c)})} className="w-full bg-slate-50 p-4 rounded-xl font-black text-xs" /></div>
                                  <div className="space-y-2"><label className="text-[9px] font-black uppercase text-slate-400 ml-1">Strand (1-8)</label><input type="number" min="1" max="8" value={chall.strand} onChange={e => updateVaultItem({...config, challenges: config.challenges.map(c => c.id === chall.id ? {...c, strand: parseInt(e.target.value)} : c)})} className="w-full bg-slate-50 p-4 rounded-xl font-black text-xs" /></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <textarea value={chall.description.en} onChange={e => updateVaultItem({...config, challenges: config.challenges.map(c => c.id === chall.id ? {...c, description: {...c.description, en: e.target.value}} : c)})} className="w-full bg-slate-50 p-4 rounded-xl text-xs h-20" placeholder="English description..." />
                                  <textarea dir="rtl" value={chall.description.ar} onChange={e => updateVaultItem({...config, challenges: config.challenges.map(c => c.id === chall.id ? {...c, description: {...c.description, ar: e.target.value}} : c)})} className="w-full bg-slate-50 p-4 rounded-xl text-xs h-20" placeholder="الوصف بالعربية..." />
                                </div>
                              </div>
                            ))}</div>
                          </div>
                        ) : (
                          <div className="space-y-12 animate-slide-up pb-20">
                            <div className="flex justify-between items-center"><h4 className="text-xl font-black uppercase tracking-tighter">Family Quests</h4><button onClick={() => updateVaultItem({...config, posters: [...config.posters, { id: Date.now().toString(), title: { en: "New Quest", ar: "" }, category: "General", imageUrl: "", familyQuest: { en: "Quest description.", ar: "" } }]})} className="bg-indigo-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 shadow-lg"><Plus className="w-4 h-4" /> Add Quest</button></div>
                            <div className="grid grid-cols-1 gap-8">{config.posters.map(poster => (
                                <div key={poster.id} className="p-8 rounded-[3rem] bg-white border border-slate-100 shadow-sm space-y-6">
                                  <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <input value={poster.title.en} onChange={e => updateVaultItem({...config, posters: config.posters.map(p => p.id === poster.id ? {...p, title: {...p.title, en: e.target.value}} : p)})} className="w-full bg-slate-50 p-4 rounded-xl font-black text-sm" placeholder="Quest Title (EN)" />
                                      <input dir="rtl" value={poster.title.ar} onChange={e => updateVaultItem({...config, posters: config.posters.map(p => p.id === poster.id ? {...p, title: {...p.title, ar: e.target.value}} : p)})} className="w-full bg-slate-50 p-4 rounded-xl font-black text-sm" placeholder="Quest Title (AR)" />
                                    </div>
                                    <button onClick={() => updateVaultItem({...config, posters: config.posters.filter(p => p.id !== poster.id)})} className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl"><Trash2 className="w-6 h-6" /></button>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <textarea value={poster.familyQuest.en} onChange={e => updateVaultItem({...config, posters: config.posters.map(p => p.id === poster.id ? {...p, familyQuest: {...p.familyQuest, en: e.target.value}} : p)})} className="w-full h-24 bg-slate-50 p-4 rounded-xl text-xs" />
                                    <textarea dir="rtl" value={poster.familyQuest.ar} onChange={e => updateVaultItem({...config, posters: config.posters.map(p => p.id === poster.id ? {...p, familyQuest: {...p.familyQuest, ar: e.target.value}} : p)})} className="w-full h-24 bg-slate-50 p-4 rounded-xl text-xs" />
                                  </div>
                                </div>
                              ))}</div>
                          </div>
                        )}
                      </div>
                    </div>}
                </div>
              </div>}
          </div></div>}

      {reflectingOn && <div className="fixed inset-0 z-[300] bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-6"><div className="bg-white w-full max-w-xl rounded-[4rem] p-12 shadow-2xl space-y-8 animate-slide-up"><div className="text-center space-y-2"><div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4"><Scale className="w-8 h-8" /></div><h3 className="text-2xl font-black uppercase tracking-tighter">Private Reflection</h3></div>
            <div className="space-y-4"><label className="text-[11px] font-black uppercase text-indigo-400 block ml-2">"{lt(reflectingOn.reflectionPrompt || {en:"What did you learn?", ar:""})}"</label><textarea value={reflectionText} onChange={e => setReflectionText(e.target.value)} className="w-full h-40 bg-slate-50 p-6 rounded-[2.5rem] font-bold text-slate-700 outline-none focus:ring-4 ring-indigo-100" placeholder="Type your reflection..." /></div>
            <div className="flex gap-4"><button onClick={() => setReflectingOn(null)} className="flex-1 py-5 rounded-2xl font-black uppercase text-xs text-slate-400">Go Back</button><button onClick={() => logCompletion(reflectingOn, reflectionText)} disabled={reflectionText.length < 5} className="flex-1 bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-xs">Seal Entry</button></div>
          </div></div>}

      {showPledgeRenewal && <div className="fixed inset-0 z-[300] bg-indigo-900/95 backdrop-blur-2xl flex items-center justify-center p-6"><div className="bg-white w-full max-w-2xl rounded-[4rem] p-12 shadow-2xl space-y-10 animate-slide-up text-center"><div className="space-y-4"><div className="w-24 h-24 bg-amber-100 text-amber-600 rounded-[3rem] flex items-center justify-center mx-auto shadow-inner"><Crown className="w-12 h-12" /></div><h2 className="text-4xl font-black uppercase tracking-tighter leading-none">Ascending Rank</h2><p className="text-slate-500 font-bold text-sm">Reaffirm your covenant to the community.</p></div>
            <div className="bg-slate-900 text-white p-12 rounded-[4rem] text-left rtl:text-right space-y-6 shadow-2xl"><h4 className="text-xs font-black uppercase tracking-widest text-indigo-400">Guardian Pledge</h4><ul className="space-y-4 text-[11px] font-bold text-slate-400 uppercase"><li>• I will defend the privacy of my family and friends.</li><li>• I will act as an upstander against cyberbullying.</li><li>• I will respect the digital property of creators.</li></ul>
               <label className="flex items-center gap-4 cursor-pointer pt-8 border-t border-white/10"><input type="checkbox" required className="peer hidden" /><div className="w-10 h-10 bg-white/10 rounded-2xl border-2 border-white/20 peer-checked:bg-indigo-600 transition-all flex items-center justify-center"><Check className="w-6 h-6 text-white opacity-0 peer-checked:opacity-100" /></div><span className="text-[12px] font-black uppercase text-slate-400 peer-checked:text-white">{t('pledge_agree')}</span></label>
            </div><button onClick={() => { if(activeChild) { setChildren(prev => prev.map(c => c.id === activeChild.id ? { ...c, pledgeLevel: currentRank.level, lastPledgeXP: activePoints } : c)); setShowPledgeRenewal(false); } }} className="w-full bg-indigo-600 text-white py-8 rounded-[3rem] font-black text-xl uppercase shadow-xl">Ascend Rank</button>
          </div></div>}

      {showAddChild && <div className="fixed inset-0 z-[200] bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-6 overflow-y-auto"><div className="bg-white w-full max-w-xl rounded-[4rem] p-12 relative shadow-2xl my-auto animate-slide-up">
            <button className="absolute top-10 right-10 p-3 hover:bg-slate-100 rounded-full" onClick={() => setShowAddChild(false)}><X className="w-8 h-8" /></button>
            <div className="text-center mb-8"><div className="w-24 h-24 bg-indigo-50 rounded-[3rem] mx-auto mb-6 flex items-center justify-center overflow-hidden">{config.logoUrl ? <img src={config.logoUrl} className="w-16 h-16 object-contain" /> : <ShieldCheck className="w-12 h-12 text-indigo-600" />}</div><h3 className="text-4xl font-black uppercase tracking-tighter">{t('new_explorer')}</h3></div>
            <form onSubmit={e => { e.preventDefault(); const f = new FormData(e.currentTarget); const year = parseInt(f.get('year') as string, 10); const nc: Child = { id: Date.now().toString(), name: f.get('name') as string, className: f.get('className') as string, year, house: f.get('house') as HouseKey, level: getLevelFromYear(year), pledgeSigned: true, schoolId: f.get('schoolId') as string, pledgeLevel: 0, lastPledgeXP: 0 }; setChildren(prev => [...prev, nc]); setActiveChildId(nc.id); setShowAddChild(false); }} className="space-y-6">
              <div className="space-y-1"><label className="text-[9px] font-black uppercase text-slate-400 ml-2">Explorer Name</label><input name="name" required className="w-full bg-slate-50 px-6 py-5 rounded-2xl font-black outline-none focus:ring-4 ring-indigo-50 shadow-inner" /></div>
              <div className="grid grid-cols-2 gap-4"><div className="space-y-1"><label className="text-[9px] font-black uppercase text-slate-400 ml-2">Year Group</label><select name="year" required className="w-full bg-slate-50 px-6 py-5 rounded-2xl font-black outline-none">{[1,2,3,4,5,6,7,8,9,10,11,12,13].map(y => <option key={y} value={y}>Year {y}</option>)}</select></div><div className="space-y-1"><label className="text-[9px] font-black uppercase text-slate-400 ml-2">Class Name</label><input name="className" placeholder="6 Juniper Blue" className="w-full bg-slate-50 px-6 py-5 rounded-2xl font-black outline-none" /></div></div>
              <div className="space-y-1"><label className="text-[9px] font-black uppercase text-slate-400 ml-2">Choose House</label><div className="grid grid-cols-4 gap-3">{(Object.keys(HOUSE_ASSETS) as HouseKey[]).map(key => <label key={key} className="cursor-pointer"><input type="radio" name="house" value={key} required className="hidden peer" /><div className="aspect-square rounded-2xl bg-slate-50 border-4 border-transparent peer-checked:border-indigo-600 flex flex-col items-center justify-center shadow-sm" style={{ color: HOUSE_ASSETS[key].defaultColor }}>{React.createElement(HOUSE_ASSETS[key].icon, { className: "w-8 h-8" })}<span className="text-[7px] font-black uppercase mt-1 opacity-60">{config.houseNames[key]}</span></div></label>)}</div></div>
              <input type="hidden" name="schoolId" value={vault[0].id} />
              <button type="submit" className="w-full bg-slate-900 text-white py-6 rounded-[2.5rem] font-black uppercase shadow-2xl mt-6">Initialize Explorer</button>
            </form>
          </div></div>}

      {activeChildId && <div className="fixed bottom-10 left-4 right-4 flex justify-center z-[100] pointer-events-none pb-safe"><nav className="w-full max-w-2xl bg-slate-900/90 backdrop-blur-3xl rounded-[4rem] p-5 flex justify-around items-center border border-white/10 shadow-2xl pointer-events-auto h-28">
            {[{ id: 'dashboard', icon: LayoutGrid, label: t('stats') }, { id: 'challenges', icon: ShieldHalf, label: t('tasks') }, { id: 'hub', icon: BookOpen, label: t('hub') }, { id: 'stickers', icon: Award, label: t('stickers') }, { id: 'support', icon: ShieldAlert, label: t('help') }].map(tab => <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex flex-col items-center justify-center flex-1 transition-all ${activeTab === tab.id ? 'text-white' : 'text-slate-500'}`}><div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all mb-1 ${activeTab === tab.id ? 'bg-indigo-600 shadow-lg scale-110' : 'hover:text-slate-300'}`}>{React.createElement(tab.icon, { className: "w-6 h-6" })}</div><span className="text-[9px] font-black uppercase tracking-widest">{tab.label}</span></button>)}
          </nav></div>}
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);