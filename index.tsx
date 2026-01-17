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
  { id: 's1c1', strand: 1, title: { en: 'Avatar Workshop', ar: 'ورشة عمل الأفاتار' }, description: { en: 'Create a profile picture that can represent you online.', ar: 'أنشئ صورة ملف شخصي يمكنها تمثيلك عبر الإنترنت.' }, points: 30, repeatable: false, level: 'ks1', theme: 'Identity', iconName: 'UserCheck', enabled: true },
  { id: 's1c2', strand: 1, title: { en: 'Alias Architect', ar: 'مهندس الأسماء المستعارة' }, description: { en: 'Design 3 cool nicknames that don\'t use your real initials.', ar: 'صمم ٣ أسماء مستعارة رائعة لا تستخدم أحرف اسمك الحقيقي.' }, points: 30, repeatable: false, level: 'ks2', theme: 'Identity', iconName: 'Fingerprint', enabled: true },
  { id: 's1c3', strand: 1, title: { en: 'Bio Audit', ar: 'تدقيق السيرة الذاتية' }, description: { en: 'Remove your private information (school name, age, etc.) from all public bios.', ar: 'قم بإزالة معلوماتك الخاصة (اسم المدرسة، العمر، إلخ) من جميع السير الذاتية العامة.' }, points: 55, repeatable: false, level: 'secondary', theme: 'Identity', iconName: 'FileSearch', enabled: true },
  { id: 's1c4', strand: 1, title: { en: 'The Filter Conversation', ar: 'محادثة الفلاتر' }, description: { en: 'Discuss how filters change our view of "normal" faces.', ar: 'ناقش كيف تغير الفلاتر نظرتنا للوجوه "العادية".' }, points: 40, repeatable: false, level: 'secondary', theme: 'Identity', iconName: 'Smile', enabled: true },
  { id: 's2c1', strand: 2, title: { en: 'Circle of Trust', ar: 'دائرة الثقة' }, description: { en: 'Draw a circle of people you can talk to about tech worries.', ar: 'ارسم دائرة من الأشخاص الذين يمكنك التحدث معهم عن مخاوف التقنية.' }, points: 20, repeatable: false, level: 'ks1', theme: 'Safety', iconName: 'Users', enabled: true },
  { id: 's2c2', strand: 2, title: { en: 'Permission Pact', ar: 'ميثاق الاستئذان' }, description: { en: 'Ask a family member before taking or posting their photo.', ar: 'استأذن أحد أفراد عائلتك قبل التقاط أو نشر صورته.' }, points: 40, repeatable: true, level: 'ks1', theme: 'Relationships', iconName: 'HeartHandshake', enabled: true },
  { id: 's2c3', strand: 2, title: { en: 'The Upstander Move', ar: 'حركة المدافع' }, description: { en: 'Support a peer who is being treated unkindly online.', ar: 'ادعم زميلاً يعامل بطريقة غير لطيفة عبر الإنترنت.' }, points: 45, repeatable: true, level: 'ks2', theme: 'Relationships', iconName: 'ShieldPlus', enabled: true },
  { id: 's2c4', strand: 2, title: { en: 'Red Flag Checklist', ar: 'قائمة العلامات التحذيرية' }, description: { en: 'Identify 3 signs of "digital grooming" with an adult.', ar: 'حدد ٣ علامات لـ "الاستمالة الرقمية" مع شخص بالغ.' }, points: 70, repeatable: false, level: 'secondary', theme: 'Safety', iconName: 'AlertCircle', enabled: true },
  { id: 's3c1', strand: 3, title: { en: 'Footprint Trace', ar: 'تتبع الأثر' }, description: { en: 'List the top 5 sites you visited this week.', ar: 'اذكر أهم ٥ مواقع زرتها هذا الأسبوع.' }, points: 25, repeatable: false, level: 'ks1', theme: 'Reputation', iconName: 'MapPin', enabled: true },
  { id: 's3c2', strand: 3, title: { en: 'Digital Legacy', ar: 'الإرث الرقمي' }, description: { en: 'Write one positive sentence you want people to remember when they think of you.', ar: 'اكتب جملة إيجابية واحدة تريد أن يتذكرها الناس عندما يفكرون فيك.' }, points: 35, repeatable: false, level: 'ks2', theme: 'Reputation', iconName: 'PenTool', enabled: true },
  { id: 's3c3', strand: 3, title: { en: 'Clean Sweep', ar: 'المسح الشامل' }, description: { en: 'Archive or delete 5 old, embarrassing posts.', ar: 'أرشفة أو حذف ٥ منشورات قديمة ومحرجة.' }, points: 40, repeatable: false, level: 'secondary', theme: 'Reputation', iconName: 'Eraser', enabled: true },
  { id: 's3c4', strand: 3, title: { en: 'Future Employer Test', ar: 'اختبار صاحب العمل المستقبلي' }, description: { en: 'Would you hire "Online You" 10 years from now?', ar: 'هل ستقوم بتوظيف "نسختك الرقمية" بعد ١٠ سنوات من الآن؟' }, points: 50, repeatable: false, level: 'secondary', theme: 'Reputation', iconName: 'UserCircle', enabled: true },
  { id: 's4c1', strand: 4, title: { en: 'Evidence Keeper', ar: 'حافظ الأدلة' }, description: { en: 'Learn how to take a screenshot to save proof of bullying.', ar: 'تعلم كيفية التقاط صورة للشاشة لحفظ دليل على التنمر.' }, points: 30, repeatable: false, level: 'all', theme: 'Bullying', iconName: 'Camera', enabled: true },
  { id: 's4c2', strand: 4, title: { en: 'Anti-Hate Pledge', ar: 'عهد ضد الكراهية' }, description: { en: 'Commit to never using sarcasm to hurt others online.', ar: 'تعهد بعدم استخدام السخرية لإيذاء الآخرين عبر الإنترنت.' }, points: 40, repeatable: false, level: 'ks2', theme: 'Bullying', iconName: 'Quote', enabled: true },
  { id: 's4c3', strand: 4, title: { en: 'Block & Report Pro', ar: 'محترف الحظر والإبلاغ' }, description: { en: 'Show an adult how to block a user on any platform.', ar: 'أظهر لشخص بالغ كيفية حظر مستخدم على أي منصة.' }, points: 45, repeatable: false, level: 'ks2', theme: 'Bullying', iconName: 'ShieldAlert', enabled: true },
  { id: 's4c4', strand: 4, title: { en: 'Private Support', ar: 'دعم خاص' }, description: { en: 'Message a friend privately to check on them.', ar: 'أرسل رسالة خاصة لصديق للاطمئنان عليه.' }, points: 40, repeatable: true, level: 'secondary', theme: 'Bullying', iconName: 'HandHeart', enabled: true },
  { id: 's5c1', strand: 5, title: { en: 'Offline Adventure', ar: 'مغامرة بدون إنترنت' }, description: { en: 'Go outside and play for 30 minutes without a phone.', ar: 'اخرج والعب لمدة ٣٠ دقيقة بدون هاتف.' }, points: 50, repeatable: true, level: 'ks1', theme: 'Well-being', iconName: 'Globe', enabled: true },
  { id: 's5c2', strand: 5, title: { en: 'Notification Diet', ar: 'حمية التنبيهات' }, description: { en: 'Turn off non-human notifications for 24 hours.', ar: 'أوقف تشغيل التنبيهات غير البشرية لمدة ٢٤ ساعة.' }, points: 50, repeatable: true, level: 'ks2', theme: 'Well-being', iconName: 'BellOff', enabled: true },
  { id: 's5c3', strand: 5, title: { en: 'Blue Light Boycott', ar: 'مقاطعة الضوء الأزرق' }, description: { en: 'No screens for 60 minutes before bed tonight.', ar: 'لا شاشات لمدة ٦٠ دقيقة قبل النوم الليلة.' }, points: 40, repeatable: true, level: 'all', theme: 'Well-being', iconName: 'Moon', enabled: true },
  { id: 's5c4', strand: 5, title: { en: 'The Dopamine Audit', ar: 'تدقيق الدوبامين' }, description: { en: 'Count how many notifications you get in one hour.', ar: 'احسب عدد التنبيهات التي تصلك في ساعة واحدة.' }, points: 45, repeatable: false, level: 'secondary', theme: 'Well-being', iconName: 'TrendingUp', enabled: true },
  { id: 's6c1', strand: 6, title: { en: 'Ad-Awareness', ar: 'الوعي الإعلاني' }, description: { en: 'Point out 3 "Sponsored" results on a search page.', ar: 'حدد ٣ نتائج "ممولة" في صفحة البحث.' }, points: 20, repeatable: false, level: 'ks1', theme: 'Information', iconName: 'Target', enabled: true },
  { id: 's6c2', strand: 6, title: { en: 'Scam Spotter', ar: 'راصد الاحتيال' }, description: { en: 'Identify 3 "too good to be true" online offers.', ar: 'حدد ٣ عروض عبر الإنترنت "أجمل من أن تكون حقيقية".' }, points: 25, repeatable: false, level: 'ks2', theme: 'Information', iconName: 'AlertCircle', enabled: true },
  { id: 's6c3', strand: 6, title: { en: 'Source Checker', ar: 'فاحص المصادر' }, description: { en: 'Find the "About Us" page of a website.', ar: 'ابحث عن صفحة "من نحن" في موقع ويب.' }, points: 35, repeatable: false, level: 'secondary', theme: 'Information', iconName: 'Search', enabled: true },
  { id: 's6c4', strand: 6, title: { en: 'Deepfake Detective', ar: 'مكتشف التزييف العميق' }, description: { en: 'Find a video and look for glitches that show it is AI.', ar: 'ابحث عن فيديو وابحث عن أخطاء تظهر أنه ذكاء اصطناعي.' }, points: 60, repeatable: false, level: 'secondary', theme: 'Information', iconName: 'Search', enabled: true },
  { id: 's7c1', strand: 7, title: { en: 'The Smart Device Audit', ar: 'تدقيق الأجهزة الذكية' }, description: { en: 'List all devices in your house that connect to WiFi.', ar: 'اذكر جميع الأجهزة في منزلك التي تتصل بالواي فاي.' }, points: 30, repeatable: false, level: 'ks1', theme: 'Privacy', iconName: 'Layers', enabled: true },
  { id: 's7c2', strand: 7, title: { en: 'Privacy Shield', ar: 'درع الخصوصية' }, description: { en: 'Set your gaming profile to "Private".', ar: 'اجعل ملفك الشخصي في الألعاب "خاصاً".' }, points: 45, repeatable: false, level: 'ks2', theme: 'Privacy', iconName: 'ShieldCheck', enabled: true },
  { id: 's7c3', strand: 7, title: { en: 'The Passphrase', ar: 'عبارة المرور' }, description: { en: 'Create a password using 4 random words.', ar: 'أنشئ كلمة مرور باستخدام ٤ كلمات عشوائية.' }, points: 40, repeatable: false, level: 'ks2', theme: 'Security', iconName: 'Key', enabled: true },
  { id: 's7c4', strand: 7, title: { en: '2FA Setup', ar: 'إعداد التحقق الثنائي' }, description: { en: 'Help an adult setup two-factor login for one of their accounts.', ar: 'ساعد شخصاً بالغاً في إعداد تسجيل الدخول الثنائي لأحد حساباته.' }, points: 60, repeatable: false, level: 'secondary', theme: 'Security', iconName: 'Lock', enabled: true },
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
    if (!confirm("This will load high-fidelity demonstration data. Continue?")) return;
    setIsSeeding(true);
    setTimeout(() => {
      const demoStudents: Child[] = [
        { id: 'd1', name: 'Zoe Explorer', year: 4, className: '4 Juniper Blue', house: 'Potter', level: 'ks2', pledgeSigned: true, schoolId: 'school_default', pledgeLevel: 2, lastPledgeXP: 400 },
        { id: 'd3', name: 'Sarah Guardian', year: 9, className: 'Year 9 Alpha', house: 'Poppins', level: 'secondary', pledgeSigned: true, schoolId: 'school_default', pledgeLevel: 4, lastPledgeXP: 1200 }
      ];
      setVault([DEFAULT_MASTER_CONFIG]);
      setChildren(demoStudents);
      setActiveChildId('d3'); 
      setShowAdmin(false);
      setIsAdminLocked(true);
      setIsSeeding(false);
    }, 800);
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
            <div className="flex flex-col text-left rtl:text-right leading-none"><span className="text-xs font-black">{activeChild.name}</span><span className="text-[8px] font-bold text-slate-400 uppercase tracking-tight">Year {activeChild.year}</span></div>
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
                      return <div key={houseKey} className={`bg-white p-8 rounded-[3rem] clay-card transition-all border-b-[10px]`} style={{ borderBottomColor: HOUSE_ASSETS[houseKey].defaultColor }}>
                        <div className="flex items-center gap-3 mb-4"><div className="p-3 rounded-2xl bg-slate-50" style={{ color: HOUSE_ASSETS[houseKey].defaultColor }}>{React.createElement(HOUSE_ASSETS[houseKey].icon, { className: "w-6 h-6" })}</div><span className="text-xs font-black uppercase text-slate-500">{config.houseNames[houseKey]}</span></div>
                        <div className="text-3xl font-black tracking-tighter text-slate-800">{pts.toLocaleString()}</div>
                      </div>;
                    })}
                  </div>
                </div>
            </div>}
            {activeTab === 'challenges' && <div className="space-y-16">
                <div className="flex items-center justify-between px-2"><div className="flex items-center gap-4"><div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg"><Filter className="w-5 h-5" /></div><div><h3 className="text-xl font-black uppercase tracking-tighter leading-none">Master Asset Inventory</h3><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Targeting {activeChild.level.toUpperCase()} content</p></div></div></div>
                {categorizedTasks.map(group => <div key={group.strandId} className="space-y-8">
                    <div className="flex items-center gap-4"><div className="h-px flex-1 bg-slate-200"></div><h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{lt(group.name)}</h4><div className="h-px flex-1 bg-slate-200"></div></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">{group.tasks.map(chall => {
                        const isDone = completions.some(c => c.childId === activeChildId && c.challengeId === chall.id);
                        return <div key={chall.id} className={`bg-white p-10 rounded-[4rem] clay-card flex flex-col justify-between group transition-all ${isDone && !chall.repeatable ? 'opacity-60 grayscale' : ''}`}>
                            <div className="space-y-6"><div className="flex justify-between items-start"><div className="p-5 bg-slate-50 rounded-[2.5rem] text-indigo-600 shadow-inner">{React.createElement(ICON_MAP[chall.iconName] || ShieldCheck, { className: "w-8 h-8" })}</div><div className="flex flex-col items-end gap-2"><div className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-4 py-2 rounded-xl uppercase">+{chall.points} XP</div></div></div><h4 className="text-2xl font-black uppercase tracking-tighter leading-none">{lt(chall.title)}</h4><p className="text-sm text-slate-500 font-bold leading-relaxed">{lt(chall.description)}</p></div>
                            <button onClick={() => logCompletion(chall)} disabled={isDone && !chall.repeatable} className="w-full bg-slate-900 text-white py-6 rounded-[2.5rem] font-black mt-10 uppercase shadow-lg disabled:bg-slate-100 disabled:text-slate-400">{isDone && !chall.repeatable ? "Completed" : t('log_task')}</button>
                          </div>;
                    })}</div>
                  </div>)}
              </div>}
          </div>
        )}
      </main>

      {/* Modals & Popups */}
      {showAddChild && <div className="fixed inset-0 z-[200] bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-6"><div className="bg-white w-full max-w-xl rounded-[4rem] p-12 relative shadow-2xl animate-slide-up"><button className="absolute top-10 right-10" onClick={() => setShowAddChild(false)}><X className="w-8 h-8" /></button><h3 className="text-4xl font-black uppercase tracking-tighter text-center mb-8">{t('new_explorer')}</h3>
            <form onSubmit={e => { e.preventDefault(); const f = new FormData(e.currentTarget); const year = parseInt(f.get('year') as string); const nc: Child = { id: Date.now().toString(), name: f.get('name') as string, className: f.get('className') as string, year, house: f.get('house') as HouseKey, level: getLevelFromYear(year), pledgeSigned: true, schoolId: 'school_default', pledgeLevel: 0, lastPledgeXP: 0 }; setChildren(prev => [...prev, nc]); setActiveChildId(nc.id); setShowAddChild(false); }} className="space-y-6">
              <input name="name" required placeholder="Name" className="w-full bg-slate-50 px-6 py-5 rounded-2xl font-black outline-none" />
              <input name="year" type="number" required placeholder="Year" className="w-full bg-slate-50 px-6 py-5 rounded-2xl font-black outline-none" />
              <div className="grid grid-cols-4 gap-3">{(Object.keys(HOUSE_ASSETS) as HouseKey[]).map(key => <label key={key} className="cursor-pointer"><input type="radio" name="house" value={key} required className="hidden peer" /><div className="aspect-square rounded-2xl bg-slate-50 border-4 border-transparent peer-checked:border-indigo-600 flex items-center justify-center">{React.createElement(HOUSE_ASSETS[key].icon, { className: "w-8 h-8" })}</div></label>)}</div>
              <button type="submit" className="w-full bg-slate-900 text-white py-6 rounded-[2.5rem] font-black uppercase shadow-2xl">Create</button>
            </form>
          </div></div>}

      {showAdmin && <div className="fixed inset-0 z-[200] bg-slate-900/95 backdrop-blur-2xl flex items-center justify-center p-6"><div className="bg-white w-full max-w-4xl rounded-[4rem] p-12 relative shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto"><button className="absolute top-10 right-10" onClick={() => setShowAdmin(false)}><X className="w-8 h-8" /></button>
            <h3 className="text-4xl font-black uppercase tracking-tighter mb-10">Admin Vault</h3>
            {isAdminLocked ? <div className="text-center space-y-8"><p className="font-bold">Enter Admin PIN</p><input type="password" value={pinInput} onChange={async e => { setPinInput(e.target.value); if (e.target.value === "1234") setIsAdminLocked(false); }} className="w-48 bg-slate-50 p-6 rounded-3xl text-center text-3xl tracking-widest" maxLength={4} /></div> : <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <button onClick={seedDemoData} className="p-10 bg-indigo-50 rounded-[3rem] font-black uppercase text-indigo-600 hover:bg-indigo-100 transition-all shadow-inner">Load Demo Data</button>
                <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="p-10 bg-rose-50 rounded-[3rem] font-black uppercase text-rose-600 hover:bg-rose-100 transition-all shadow-inner">Factory Reset</button>
              </div>}
          </div></div>}

      {activeChildId && <div className="fixed bottom-10 left-4 right-4 flex justify-center z-[100] pb-safe"><nav className="w-full max-w-2xl bg-slate-900/90 backdrop-blur-3xl rounded-[4rem] p-5 flex justify-around items-center border border-white/10 shadow-2xl h-28 pointer-events-auto">
            {[{ id: 'dashboard', icon: LayoutGrid, label: t('stats') }, { id: 'challenges', icon: ShieldHalf, label: t('tasks') }, { id: 'hub', icon: BookOpen, label: t('hub') }, { id: 'stickers', icon: Award, label: t('stickers') }, { id: 'support', icon: ShieldAlert, label: t('help') }].map(tab => <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex flex-col items-center justify-center flex-1 transition-all ${activeTab === tab.id ? 'text-white' : 'text-slate-500'}`}><div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all mb-1 ${activeTab === tab.id ? 'bg-indigo-600 shadow-lg scale-110' : 'hover:text-slate-300'}`}>{React.createElement(tab.icon, { className: "w-6 h-6" })}</div><span className="text-[9px] font-black uppercase tracking-widest">{tab.label}</span></button>)}
          </nav></div>}
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);