import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Gamepad2, ShieldCheck, Smartphone, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import ThemeToggle from '../components/ui/ThemeToggle';
import LanguageSwitcher from '../components/ui/LanguageSwitcher';
import gamesChargingImage from '../assets/gamesCharging.webp';
import buyCardsImage from '../assets/buyCards.webp';
import chatAppsImage from '../assets/chatApps.webp';
import brandIconImage from '../assets/box_.png';
import brandWordmarkImage from '../assets/ibra.png';

const Landing = () => {
  const { t, i18n } = useTranslation();
  const [slideIndex, setSlideIndex] = useState(0);
  const isArabic = String(i18n.resolvedLanguage || i18n.language || 'ar').toLowerCase().startsWith('ar');

  const heroSlides = useMemo(
    () => [
      { id: 'landing-slide-1', image: gamesChargingImage, title: t('home.slide1') },
      { id: 'landing-slide-2', image: buyCardsImage, title: t('home.slide2') },
      { id: 'landing-slide-3', image: chatAppsImage, title: t('home.slide3') }
    ],
    [t]
  );

  const features = [
    {
      icon: Gamepad2,
      title: t('home.featureGames'),
      description: t('home.featureGamesDesc')
    },
    {
      icon: Smartphone,
      title: t('home.featureApps'),
      description: t('home.featureAppsDesc')
    },
    {
      icon: ShieldCheck,
      title: t('home.featureSecure'),
      description: t('home.featureSecureDesc')
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % heroSlides.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [heroSlides.length]);

  return (
    <div className="min-h-screen px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[var(--shell-max-width)] space-y-8">
        <div className="premium-card flex items-center justify-between rounded-[var(--radius-2xl)] px-4 py-3 sm:px-5">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 overflow-hidden rounded-[var(--radius-md)]">
              <img src={brandIconImage} alt="IBRA Store" className="h-full w-full object-cover" />
            </div>
            <div>
              <img src={brandWordmarkImage} alt="IBRA" className="h-6 w-auto object-contain" />
              <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-[var(--color-primary)]">
                {isArabic ? 'تجارة رقمية مميزة' : 'Premium Digital Commerce'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher variant="glass" />
            <ThemeToggle />
          </div>
        </div>

        <section className="premium-card-premium overflow-hidden px-5 py-6 sm:px-8 sm:py-8">
          <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <span className="section-kicker">
                <Sparkles className="h-3.5 w-3.5" />
                {isArabic ? 'متجر رقمي فاخر' : 'Luxury Digital Store'}
              </span>

              <div className="space-y-4">
                <h1 className="page-heading max-w-3xl">
                  {t('home.heroTitle')}
                </h1>
                <p className="page-subtitle max-w-2xl">
                  {t('home.heroDescription')} {t('home.heroSubDescription')}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link to="/auth">
                  <Button size="lg" className="glow-button w-full sm:w-auto">
                    {t('home.getStarted')}
                    <ArrowRight className="h-5 w-5 rtl:rotate-180" />
                  </Button>
                </Link>
                <Link to="/products">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                    {t('home.browseStore')}
                  </Button>
                </Link>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: t('home.featureGames'), value: '24/7' },
                  { label: t('header.wallet'), value: isArabic ? 'آمن' : 'Secure' },
                  { label: t('home.cardsSection'), value: isArabic ? 'فوري' : 'Instant' }
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[var(--radius-lg)] border border-[color:rgb(var(--color-border-rgb)/0.82)] bg-[color:rgb(var(--color-card-rgb)/0.74)] px-4 py-3"
                  >
                    <p className="text-lg font-bold text-[var(--color-text)]">{item.value}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[var(--color-muted)]">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-x-8 top-6 h-24 rounded-full bg-[color:rgb(var(--color-primary-rgb)/0.14)] blur-3xl" />
              <div className="relative overflow-hidden rounded-[calc(var(--radius-2xl)+0.25rem)] border border-[color:rgb(var(--color-border-rgb)/0.78)] bg-[color:rgb(var(--color-card-rgb)/0.74)] p-3 shadow-[var(--shadow-medium)]">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-xl)]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={heroSlides[slideIndex].id}
                      initial={{ opacity: 0, scale: 1.08 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.7 }}
                      className="absolute inset-0"
                    >
                      <img
                        src={heroSlides[slideIndex].image}
                        alt={heroSlides[slideIndex].title}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-5">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-primary-soft)]">
                          {isArabic ? 'مجموعة مختارة من IBRA' : 'IBRA Curated Collection'}
                        </p>
                        <h2 className="mt-2 text-2xl font-bold text-white">{heroSlides[slideIndex].title}</h2>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex gap-2">
                    {heroSlides.map((slide, idx) => (
                      <button
                        key={slide.id}
                        onClick={() => setSlideIndex(idx)}
                        className={`h-2 rounded-full transition-all ${idx === slideIndex ? 'w-9 bg-[var(--color-primary)]' : 'w-2 bg-[color:rgb(var(--color-border-rgb)/0.92)]'}`}
                        aria-label={isArabic ? `الشريحة ${idx + 1}` : `Slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {isArabic ? 'مصمم لهدايا رقمية فاخرة' : 'Tailored for premium digital gifting'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
            >
              <Card variant="elevated" className="h-full p-6">
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] border border-[color:rgb(var(--color-primary-rgb)/0.25)] bg-[color:rgb(var(--color-primary-rgb)/0.08)] text-[var(--color-primary)]">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--color-text)]">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--color-text-secondary)]">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default Landing;
