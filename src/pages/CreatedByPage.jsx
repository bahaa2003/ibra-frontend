import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowUpLeft,
  BadgeCheck,
  Building2,
  Globe,
  Layers3,
  MessageCircleMore,
  Palette,
  ShieldCheck,
  Sparkles,
  Store,
  Users2,
  Zap
} from 'lucide-react';
import Header from '../components/Header';
import PublicSidebar from '../components/PublicSidebar';
import digitechLogo from '../assets/digitech-solutions.png';
import ahmedImage from '../assets/WhatsApp Image 2026-03-26 at 7.18.08 AM.jpeg';
import kareemImage from '../assets/WhatsApp Image 2026-03-26 at 7.18.08 AM (1).jpeg';
import bahaaImage from '../assets/WhatsApp Image 2026-03-26 at 7.18.08 AM (2).jpeg';

const WHATSAPP_NUMBER = '01019603238';
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER.replace(/^0/, '20')}`;
const WORKS_LINK = 'https://digiteech.me/our-work';


const services = [
  {
    title: 'تطوير المواقع',
    icon: Globe,
  },
  {
    title: 'المتاجر الإلكترونية',
    icon: Store,
  },
  {
    title: 'تطبيقات الدردشة الصوتية',
    icon: MessageCircleMore,
  },
  {
    title: 'تصميم UI/UX',
    icon: Palette,
  },
  {
    title: 'أنظمة مخصصة',
    icon: Layers3,
  },
  {
    title: 'حلول رقمية آمنة وسريعة',
    icon: ShieldCheck,
  },
];

const projects = [
  {
    name: 'IBRA Store',
    category: 'متجر رقمي احترافي',
    summary:
      'نموذج عملي يجسد قدرتنا على تقديم منصة تجمع بين الأداء العالي، الثقة، وسهولة الاستخدام ضمن تجربة متقنة بصريًا ووظيفيًا.',
  },
];

const team = [
  {
    name: 'ENG: AHMED ELSHARKAWY',
    role: 'مهندس برمجيات ومسؤول الشركة ومتخصص Frontend Development',
    image: ahmedImage,
  },
  {
    name: 'ENG: KAREEM MOHAMED',
    role: 'مهندس برمجيات ومدير الشركة ومتخصص Cyber Security',
    image: kareemImage,
  },
  {
    name: 'ENG: BAHAA MOHAMED',
    role: 'مهندس برمجيات وأحد أفضل مؤسسي الشركة ومتخصص Backend Development',
    image: bahaaImage,
  },
];

const companyPrinciples = [
  {
    title: 'رؤية تنفيذية راقية',
    icon: Sparkles,
  },
  {
    title: 'ثقة تقنية حقيقية',
    icon: ShieldCheck,
  },
  {
    title: 'سرعة في الإحساس قبل الأرقام',
    icon: Zap,
  },
  {
    title: 'منتج يرفع قيمة البراند',
    icon: ArrowUpLeft,
  },
];

const heroContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const heroItemVariants = {
  hidden: { opacity: 0, y: 26 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const scrollSectionVariants = {
  hidden: {
    opacity: 0,
    y: 56,
    filter: 'blur(8px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.82,
      ease: [0.22, 1, 0.36, 1],
      when: 'beforeChildren',
      staggerChildren: 0.09,
    },
  },
};

const scrollCardVariants = {
  hidden: {
    opacity: 0,
    y: 42,
    scale: 0.985,
    filter: 'blur(6px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.72,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const sectionViewport = {
  once: true,
  amount: 0.18,
  margin: '0px 0px -8% 0px',
};

const CreatedByPage = ({ embedded = false }) => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (embedded) return undefined;

    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      setIsSidebarOpen(false);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      dir="rtl"
      className={embedded
        ? 'relative overflow-hidden text-[#3a2411] dark:text-[#fff7df]'
        : 'relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(213,173,87,0.18),transparent_30%),linear-gradient(180deg,#fff7df_0%,#f8e7be_42%,#ffffff_100%)] text-[#3a2411] dark:bg-[radial-gradient(circle_at_top_right,rgba(240,198,111,0.14),transparent_30%),linear-gradient(180deg,#17100a_0%,#24170d_42%,#111318_100%)] dark:text-[#fff7df]'}
    >
      {!embedded && (
        <>
          <PublicSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} isMobile={isMobile} />
          <Header
            showUserInfo={false}
            onMenuClick={() => setIsSidebarOpen((current) => !current)}
          />
        </>
      )}

      <main className={embedded ? 'relative z-10 flex w-full flex-col gap-8' : 'relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8'}>
        {!embedded && (
          <div className="flex justify-end [direction:ltr]">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-[#d5ad57]/28 bg-white/58 px-4 text-sm font-semibold text-[#6e4519] shadow-[0_16px_34px_-26px_rgba(126,88,30,0.34)] transition-all hover:-translate-y-0.5 hover:border-[#b9781f]/42 hover:bg-[#fff7df] hover:text-[#3a2411] dark:border-[#f0c66f]/24 dark:bg-[#f0c66f]/10 dark:text-[#f8dfab] dark:shadow-[0_16px_34px_-24px_rgba(240,198,111,0.7)] dark:hover:border-[#f0c66f]/42 dark:hover:bg-[#f0c66f]/16 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>رجوع</span>
          </button>
        </div>
        )}

        <motion.section
          variants={heroContainerVariants}
          initial="hidden"
          animate="visible"
          className="relative overflow-hidden rounded-[2rem] border border-[#d5ad57]/26 bg-[linear-gradient(145deg,rgba(255,251,236,0.92),rgba(255,255,255,0.84))] p-6 shadow-[0_30px_90px_-54px_rgba(126,88,30,0.42)] dark:border-[#f0c66f]/18 dark:bg-[linear-gradient(145deg,rgba(36,23,13,0.92),rgba(17,19,24,0.94))] dark:shadow-[0_30px_90px_-48px_rgba(0,0,0,0.9)] sm:p-8 lg:p-12"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(213,173,87,0.18),transparent_31%),radial-gradient(circle_at_18%_20%,rgba(185,120,31,0.1),transparent_24%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(240,198,111,0.18),transparent_31%),radial-gradient(circle_at_18%_20%,rgba(185,120,31,0.14),transparent_24%)]" />
          <div className="absolute inset-y-0 left-0 hidden w-px bg-gradient-to-b from-transparent via-[#d5ad57]/34 to-transparent dark:via-[#f0c66f]/40 lg:block" />
          <div className="relative grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-7">
              <motion.div variants={heroItemVariants} className="inline-flex">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#d5ad57]/28 bg-[#fff7df]/64 px-4 py-2 text-xs font-semibold tracking-[0.22em] text-[#6e4519] shadow-[0_12px_30px_-24px_rgba(126,88,30,0.34)] backdrop-blur-xl dark:border-[#f0c66f]/24 dark:bg-[#f0c66f]/10 dark:text-[#f8dfab] dark:shadow-[0_12px_30px_-20px_rgba(240,198,111,0.55)]">
                  <BadgeCheck className="h-4 w-4" />
                  Trusted &amp; Built for IBRA Store
                </span>
              </motion.div>

              <motion.div variants={heroItemVariants} className="space-y-5">
                <div className="space-y-4">
                  <img
                    src={digitechLogo}
                    alt="DigiTech Solutions"
                    className="h-48 w-full max-w-[38rem] object-contain sm:h-56 lg:h-64"
                  />
                  <div className="w-full max-w-[38rem] text-center">
                    <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#6e4519]/64 dark:text-[#f8dfab]/64">
                      DigiTech Solutions
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h1 className="max-w-4xl text-3xl font-black leading-[1.25] text-[#3a2411] dark:text-white sm:text-4xl lg:text-[3.4rem]">
                    نحن نصمم منصه الكترونيه خاصه ليك تخلي اسمك يلف العالم بتصميم مختلف وبتحديثات مختلفه ومميزه.
                  </h1>
                  <div className="max-w-2xl rounded-[1.6rem] border border-[#d5ad57]/28 bg-[linear-gradient(135deg,rgba(213,173,87,0.18),rgba(255,255,255,0.62),rgba(185,120,31,0.08))] p-4 text-center shadow-[0_22px_55px_-42px_rgba(126,88,30,0.34)] backdrop-blur-xl dark:border-[#f0c66f]/20 dark:bg-[linear-gradient(135deg,rgba(240,198,111,0.13),rgba(255,255,255,0.055),rgba(185,120,31,0.11))] dark:shadow-[0_22px_55px_-36px_rgba(240,198,111,0.5)] sm:p-5">
                    <p className="text-sm font-semibold leading-7 text-[#6e4519] dark:text-[#f8dfab]">
                      ابدأ مشروعك اليوم واجعل فكرتك تنطلق باحترافية
                    </p>
                    <motion.a
                      href={WHATSAPP_LINK}
                      target="_blank"
                      rel="noreferrer"
                      whileHover={{ y: -4, scale: 1.06 }}
                      whileTap={{ scale: 0.985 }}
                      transition={{ type: 'spring', stiffness: 280, damping: 18 }}
                      className="group relative mt-4 inline-flex items-center justify-center"
                    >
                      <span className="pointer-events-none absolute left-1/2 top-1/2 h-[142%] w-[126%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/22 blur-2xl opacity-70" />
                      <span className="pointer-events-none absolute left-1/2 top-1/2 h-[118%] w-[108%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-300/25 opacity-75" />
                      <span className="relative isolate inline-flex items-center justify-center gap-3 overflow-hidden rounded-[1.15rem] border border-emerald-200/45 bg-[linear-gradient(135deg,#0f9f47_0%,#18b158_36%,#25d366_70%,#63f3a7_100%)] px-6 py-3 text-sm font-extrabold text-white shadow-[0_24px_56px_-20px_rgba(22,163,74,0.85)] sm:px-7 sm:text-base">
                        <span className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.34),transparent_58%)]" />
                        <motion.span
                          aria-hidden="true"
                          className="absolute left-[-42%] top-[-18%] h-[136%] w-[32%] rotate-[14deg] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.16),rgba(255,255,255,0.82),rgba(255,255,255,0.16),transparent)] blur-[1px] mix-blend-screen"
                          animate={{ x: ['-150%', '430%'] }}
                          transition={{ duration: 2.25, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.9 }}
                        />
                        <MessageCircleMore className="relative h-5 w-5" />
                        <span className="relative">تواصل معنا الآن</span>
                      </span>
                    </motion.a>
                    <motion.a
                      href={WORKS_LINK}
                      target="_blank"
                      rel="noreferrer"
                      whileHover={{ y: -3, scale: 1.035 }}
                      whileTap={{ scale: 0.985 }}
                      transition={{ type: 'spring', stiffness: 280, damping: 18 }}
                      className="mt-3 inline-flex items-center justify-center gap-2 rounded-[1.05rem] border border-[#d5ad57]/28 bg-white/58 px-6 py-3 text-sm font-extrabold text-[#6e4519] shadow-[0_18px_44px_-32px_rgba(126,88,30,0.34)] transition-all hover:-translate-y-0.5 hover:border-[#b9781f]/42 hover:bg-[#fff7df] hover:text-[#3a2411] dark:border-[#f0c66f]/26 dark:bg-[#f0c66f]/10 dark:text-[#f8dfab] dark:shadow-[0_18px_44px_-28px_rgba(240,198,111,0.58)] dark:hover:border-[#f0c66f]/42 dark:hover:bg-[#f0c66f]/16 dark:hover:text-white sm:px-7 sm:text-base"
                    >
                      <ArrowUpLeft className="h-5 w-5" />
                      <span>شاهد أعمالنا</span>
                    </motion.a>
                  </div>
                  <p className="max-w-3xl text-base leading-8 text-[#6e4519]/74 dark:text-[#f7e8c8]/72 sm:text-lg">
                    نصمم مواقع ومتاجر وتطبيقات حديثة تجمع بين الجمال، السرعة، والثقة لتظهر علامتك التجارية بالشكل الذي تستحقه.
                  </p>
                </div>
              </motion.div>

            </div>

            <motion.div variants={heroItemVariants} className="relative">
              <motion.div
                whileHover={{ y: -8 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="relative overflow-hidden rounded-[2rem] border border-[#d5ad57]/26 bg-white/58 p-5 shadow-[0_30px_70px_-46px_rgba(126,88,30,0.34)] backdrop-blur-2xl dark:border-[#f0c66f]/18 dark:bg-[#fff2c7]/8 dark:shadow-[0_30px_70px_-38px_rgba(0,0,0,0.75)]"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(240,198,111,0.16),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(185,120,31,0.14),transparent_28%)]" />
                <div className="relative space-y-4">
                  <div className="rounded-[1.35rem] border border-[#d5ad57]/24 bg-[linear-gradient(135deg,rgba(213,173,87,0.18),rgba(255,255,255,0.58))] p-3.5 dark:border-[#f0c66f]/16 dark:bg-[linear-gradient(135deg,rgba(240,198,111,0.14),rgba(255,255,255,0.055))]">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#6e4519]/58 dark:text-[#f8dfab]/58">
                          Digital Excellence
                        </p>
                        <h2 className="mt-1.5 text-xl font-extrabold text-[#3a2411] dark:text-white">
                          نبني الثقة قبل أن نبني الواجهة
                        </h2>
                      </div>
                      <div className="rounded-full border border-[#d5ad57]/28 bg-white/58 px-2.5 py-1 text-[0.7rem] font-bold tracking-[0.18em] text-[#6e4519] dark:border-[#f0c66f]/24 dark:bg-[#f0c66f]/10 dark:text-[#f8dfab]">
                        Premium
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-2.5">
                    {[
                      'مظهر بصري فاخر يعكس قيمة البراند.',
                      'أداء سريع وتجربة استخدام واضحة.',
                      'تفاصيل مدروسة ترفع ثقة العميل.',
                    ].map((point) => (
                      <div
                        key={point}
                        className="flex items-start gap-2.5 rounded-[1.05rem] border border-[#d5ad57]/22 bg-white/56 p-3 dark:border-[#f0c66f]/14 dark:bg-[#111318]/42"
                      >
                        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#d5ad57]/16 text-[#6e4519] dark:bg-[#f0c66f]/12 dark:text-[#f8dfab]">
                          <BadgeCheck className="h-3.5 w-3.5" />
                        </span>
                        <p className="text-xs leading-6 text-[#6e4519]/74 dark:text-[#f7e8c8]/76 sm:text-sm">{point}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-2.5 sm:grid-cols-2">
                    <div className="rounded-[1.1rem] border border-[#d5ad57]/24 bg-[#3a2411] px-3.5 py-4 text-white dark:border-[#f0c66f]/16 dark:bg-[#111318]/72">
                      <p className="text-[0.7rem] uppercase tracking-[0.18em] text-[#f8dfab]">Premium Delivery</p>
                      <p className="mt-1.5 text-xs leading-6 text-[#f7e8c8]/82 sm:text-sm">
                        من الفكرة وحتى الإطلاق، نعمل بمنهجية تمنح المشروع حضورًا راقيًا وتجربة متماسكة.
                      </p>
                    </div>
                    <div className="rounded-[1.1rem] border border-[#d5ad57]/28 bg-white/58 px-3.5 py-4 dark:border-[#f0c66f]/20 dark:bg-[#f0c66f]/10">
                      <p className="text-[0.7rem] uppercase tracking-[0.18em] text-[#6e4519] dark:text-[#f8dfab]">Brand Impact</p>
                      <p className="mt-1.5 text-xs leading-6 text-[#6e4519]/74 dark:text-[#f7e8c8]/82 sm:text-sm">
                        نصمم ما يترك أثرًا بصريًا ونفسيًا يجعل مشروعك يبدو أقوى وأكثر إقناعًا.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        <motion.section
          variants={scrollSectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={sectionViewport}
          className="space-y-5"
        >
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d5ad57]/28 bg-[#fff7df]/64 px-4 py-2 text-xs font-semibold tracking-[0.2em] text-[#6e4519] dark:border-[#f0c66f]/24 dark:bg-[#f0c66f]/10 dark:text-[#f8dfab]">
              <Users2 className="h-4 w-4" />
              فريق DigiTech Solutions
            </div>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[#6e4519]/72 dark:text-[#f7e8c8]/72">
              خبرات متخصصة تعمل بروح واحدة: بناء منتج يليق بطموحك
            </p>
          </div>

          <div className="mx-auto grid w-full max-w-2xl grid-cols-1 gap-y-8">
            {team.map((member) => (
              <motion.div
                key={member.name}
                variants={scrollCardVariants}
                whileHover={{ y: -4 }}
                className="will-change-transform flex flex-col items-center text-center"
              >
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(240,198,111,0.18),transparent_68%)] blur-xl" />
                  <img
                    src={member.image}
                    alt={member.name}
                    className="relative h-24 w-24 rounded-full border border-[#d5ad57]/30 object-cover shadow-[0_18px_40px_-30px_rgba(126,88,30,0.34)] dark:border-[#f0c66f]/22 dark:shadow-[0_18px_40px_-28px_rgba(240,198,111,0.45)] sm:h-28 sm:w-28"
                  />
                </div>
                <h3 className="mt-4 text-sm font-black tracking-[0.04em] text-[#3a2411] dark:text-white sm:text-base">
                  {member.name}
                </h3>
                <p className="mt-2 max-w-[19rem] text-xs leading-6 text-[#6e4519]/70 dark:text-[#f7e8c8]/70 sm:text-sm">
                  {member.role}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          variants={scrollSectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={sectionViewport}
          className="space-y-6"
        >
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d5ad57]/28 bg-[#fff7df]/64 px-4 py-2 text-xs font-semibold tracking-[0.2em] text-[#6e4519] dark:border-[#f0c66f]/24 dark:bg-[#f0c66f]/10 dark:text-[#f8dfab]">
              <Sparkles className="h-4 w-4" />
              أبرز خدماتنا
            </div>
            <h2 className="mt-4 text-2xl font-black text-[#3a2411] dark:text-white sm:text-3xl">
              خدمات مصممة لتجعل مشروعك يبدو أقوى ويعمل أفضل
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-base leading-8 text-[#6e4519]/72 dark:text-[#f7e8c8]/72">
              خدماتنا مصممة لتمنح مشروعك حضورًا أقوى وتجربة استخدام أكثر أناقة ووضوحًا.
            </p>
          </div>

          <div className="mx-auto grid w-full max-w-4xl grid-cols-2 gap-3 sm:gap-4">
            {services.map((service) => (
              <motion.div
                key={service.title}
                variants={scrollCardVariants}
                whileHover={{ y: -8, scale: 1.01 }}
                className="group will-change-transform relative overflow-hidden rounded-[1.25rem] border border-[#d5ad57]/24 bg-white/58 p-4 shadow-[0_24px_60px_-46px_rgba(126,88,30,0.34)] backdrop-blur-xl transition-all dark:border-[#f0c66f]/16 dark:bg-[#fff2c7]/8 dark:shadow-[0_24px_60px_-42px_rgba(0,0,0,0.72)] sm:p-5"
              >
                <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-[radial-gradient(circle_at_top,rgba(240,198,111,0.14),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(185,120,31,0.12),transparent_35%)]" />
                <div className="relative flex min-h-[8.5rem] flex-col items-center justify-center text-center sm:min-h-[9.25rem]">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1rem] bg-[linear-gradient(135deg,#b9781f,#f0c66f_52%,#fff0bd)] text-[#24170d] shadow-[0_20px_36px_-22px_rgba(240,198,111,0.72)] transition-transform duration-300 group-hover:scale-105 sm:h-[3.25rem] sm:w-[3.25rem]">
                    <service.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-3 text-sm font-extrabold leading-6 text-[#3a2411] dark:text-white sm:text-base">
                    {service.title}
                  </h3>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          variants={scrollSectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={sectionViewport}
          className="space-y-6"
        >
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d5ad57]/28 bg-[#fff7df]/64 px-4 py-2 text-xs font-semibold tracking-[0.2em] text-[#6e4519] dark:border-[#f0c66f]/24 dark:bg-[#f0c66f]/10 dark:text-[#f8dfab]">
              <BadgeCheck className="h-4 w-4" />
              نفذنا مشاريع ناجحة مثل
            </div>
            <p className="mx-auto mt-4 max-w-3xl text-base leading-8 text-[#6e4519]/72 dark:text-[#f7e8c8]/72">
              IBRA Store مثال واضح على قدرتنا على تنفيذ حلول رقمية قوية تجمع بين الأداء والثقة وسهولة الاستخدام.
            </p>
          </div>

          <div className="grid gap-4">
            {projects.map((project) => (
              <motion.div
                key={project.name}
                variants={scrollCardVariants}
                whileHover={{ y: -6 }}
                className="will-change-transform relative overflow-hidden rounded-[1.8rem] border border-[#d5ad57]/24 bg-white/58 p-6 shadow-[0_22px_60px_-46px_rgba(126,88,30,0.34)] backdrop-blur-xl dark:border-[#f0c66f]/16 dark:bg-[#fff2c7]/8 dark:shadow-[0_22px_60px_-42px_rgba(0,0,0,0.72)] sm:p-8"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(240,198,111,0.14),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(185,120,31,0.12),transparent_24%)]" />
                <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#d5ad57]/28 bg-[#fff7df]/64 px-3 py-1.5 text-xs font-semibold tracking-[0.18em] text-[#6e4519] dark:border-[#f0c66f]/20 dark:bg-[#f0c66f]/10 dark:text-[#f8dfab]">
                      <Building2 className="h-4 w-4 text-[#6e4519] dark:text-[#f8dfab]" />
                      {project.category}
                    </div>
                    <h3 className="text-2xl font-black text-[#3a2411] dark:text-white">{project.name}</h3>
                    <p className="max-w-3xl text-sm leading-7 text-[#6e4519]/72 dark:text-[#f7e8c8]/72">{project.summary}</p>
                  </div>

                  <div className="flex min-w-[220px] flex-col gap-3 rounded-[1.5rem] border border-[#d5ad57]/26 bg-[#3a2411] px-5 py-5 text-white dark:border-[#f0c66f]/18 dark:bg-[#111318]/76">
                    <span className="text-xs uppercase tracking-[0.24em] text-[#f8dfab]">Showcase Project</span>
                    <p className="text-lg font-bold">حل رقمي يوازن بين الجمال العملي والقوة التشغيلية</p>
                    <div className="flex items-center gap-2 text-sm text-[#f7e8c8]/76">
                      <BadgeCheck className="h-4 w-4 text-[#f8dfab]" />
                      تجربة موثوقة قابلة للتوسع
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          variants={scrollSectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={sectionViewport}
          className="space-y-5"
        >
          <div className="mx-auto grid w-full max-w-3xl grid-cols-2 gap-3 sm:gap-4">
            {companyPrinciples.map((item) => (
              <motion.div
                key={item.title}
                variants={scrollCardVariants}
                whileHover={{ y: -6, scale: 1.01 }}
                className="group will-change-transform relative overflow-hidden rounded-[1.1rem] border border-[#d5ad57]/24 bg-white/58 p-3 shadow-[0_20px_50px_-40px_rgba(126,88,30,0.34)] backdrop-blur-xl dark:border-[#f0c66f]/16 dark:bg-[#fff2c7]/8 dark:shadow-[0_20px_50px_-36px_rgba(0,0,0,0.7)] sm:p-4"
              >
                <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-[radial-gradient(circle_at_top,rgba(240,198,111,0.14),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(185,120,31,0.12),transparent_35%)]" />
                <div className="relative flex min-h-[6.75rem] flex-col items-center justify-center text-center sm:min-h-[7.25rem]">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[0.9rem] bg-[linear-gradient(135deg,#b9781f,#f0c66f_52%,#fff0bd)] text-[#24170d] shadow-[0_18px_32px_-20px_rgba(240,198,111,0.72)] transition-transform duration-300 group-hover:scale-105">
                    <item.icon className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="mt-2.5 text-xs font-extrabold leading-5 text-[#3a2411] dark:text-white sm:text-sm">
                    {item.title}
                  </h3>
                </div>
              </motion.div>
            ))}
          </div>

        </motion.section>

        <motion.footer
          variants={scrollSectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={sectionViewport}
          className="pb-4 pt-2 text-center"
        >
          <p className="text-sm font-semibold tracking-[0.18em] text-[#6e4519]/58 dark:text-[#f8dfab]/58">
            نصمم تجارب رقمية تليق بطموحك وتمنح مشروعك حضورًا يفرض احترامه.
          </p>
        </motion.footer>
      </main>
    </div>
  );
};

export default CreatedByPage;
