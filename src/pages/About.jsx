import React, { useEffect, useState } from 'react';
import { ArrowRight, MessageCircle, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import PublicSidebar from '../components/PublicSidebar';
import { buildWhatsAppLink, getAdminWhatsAppNumber } from '../utils/whatsapp';
import brandIconImage from '../assets/logo-optimized.webp';
import brandWordmarkImage from '../assets/ibra.png';

const About = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const whatsappNumber = getAdminWhatsAppNumber();
  const whatsappLink = buildWhatsAppLink({
    number: whatsappNumber,
    message: 'مرحبًا، أحتاج مساعدة بخصوص منصة IBRA Store.',
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      setIsSidebarOpen(false);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div dir="rtl" className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(213,173,87,0.2),transparent_30%),linear-gradient(180deg,#fff7df_0%,#f8e7be_44%,#ffffff_100%)] text-[#3a2411] dark:bg-[radial-gradient(circle_at_top_right,rgba(240,198,111,0.16),transparent_30%),linear-gradient(180deg,#17100a_0%,#24170d_44%,#111318_100%)] dark:text-[#fff7df]">
      <PublicSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} isMobile={isMobile} />
      <Header
        showUserInfo={false}
        onMenuClick={() => setIsSidebarOpen((current) => !current)}
      />

      <main className="mx-auto flex min-h-[calc(100vh-4.75rem)] w-full max-w-5xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-5 flex justify-end [direction:ltr]">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-[#d5ad57]/28 bg-white/58 px-4 text-sm font-semibold text-[#6e4519] shadow-[0_16px_34px_-26px_rgba(126,88,30,0.34)] transition-all hover:-translate-y-0.5 hover:border-[#b9781f]/42 hover:bg-[#fff7df] hover:text-[#3a2411] dark:border-[#f0c66f]/24 dark:bg-[#f0c66f]/10 dark:text-[#f8dfab] dark:shadow-[0_16px_34px_-24px_rgba(240,198,111,0.7)] dark:hover:border-[#f0c66f]/42 dark:hover:bg-[#f0c66f]/16 dark:hover:text-white"
          >
            <span>رجوع</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-1 items-center">
        <section className="relative w-full overflow-hidden rounded-[2rem] border border-[#d5ad57]/26 bg-[linear-gradient(145deg,rgba(255,251,236,0.9),rgba(255,255,255,0.82))] p-6 text-center shadow-[0_28px_80px_-48px_rgba(126,88,30,0.34)] backdrop-blur-2xl dark:border-[#f0c66f]/18 dark:bg-[linear-gradient(145deg,rgba(36,23,13,0.9),rgba(17,19,24,0.92))] dark:shadow-[0_28px_80px_-42px_rgba(0,0,0,0.85)] sm:p-8 lg:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(213,173,87,0.18),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(185,120,31,0.1),transparent_28%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(240,198,111,0.16),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(185,120,31,0.12),transparent_28%)]" />
          <div className="relative mx-auto flex max-w-2xl flex-col items-center">
            <img
              src={brandIconImage}
              alt="IBRA Store"
              className="h-28 w-28 object-contain"
            />

            <img
              src={brandWordmarkImage}
              alt="ibra"
              className="mt-5 h-9 w-auto max-w-[10rem] object-contain"
            />

            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#d5ad57]/28 bg-[#fff7df]/64 px-4 py-2 text-xs font-semibold text-[#6e4519] dark:border-[#f0c66f]/24 dark:bg-[#f0c66f]/10 dark:text-[#f8dfab]">
              <ShieldCheck className="h-4 w-4" />
              منصة موثوقة للشحن الرقمي
            </div>

            <h1 className="mt-5 text-3xl font-black text-[#3a2411] dark:text-white sm:text-4xl">
              من نحن
            </h1>

            <p className="mt-5 text-base leading-9 text-[#6e4519]/74 dark:text-[#f7e8c8]/72 sm:text-lg">
              منصة إلكترونية لشحن جميع التطبيقات والألعاب. لحدوث أي مشاكل في المنصة يمكنك التواصل معنا مباشرة عبر واتساب.
            </p>

            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="mt-7 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#25d366] px-6 py-3 text-sm font-extrabold text-white shadow-[0_18px_45px_-22px_rgba(37,211,102,0.82)] transition-all hover:-translate-y-0.5 hover:bg-[#20bd5a] sm:text-base"
            >
              <MessageCircle className="h-5 w-5" />
              <span>تواصل عبر واتساب</span>
            </a>
          </div>
        </section>
        </div>
      </main>
    </div>
  );
};

export default About;
