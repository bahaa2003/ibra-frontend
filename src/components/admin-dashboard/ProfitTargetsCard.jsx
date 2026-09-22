import React, { useMemo } from 'react';
import { ArrowLeft, ArrowRight, Check, Crown, Gem, Medal, Sparkles, Target } from 'lucide-react';
import Card from '../ui/Card';

const TARGETS = [
  {
    amount: 100,
    labelAr: 'التارجت البرونزي',
    labelEn: 'Bronze target',
    descriptionAr: 'المرحلة الأولى',
    descriptionEn: 'Stage one',
    icon: Medal,
    color: '#c48a55',
    glow: 'rgba(196, 138, 85, 0.28)',
  },
  {
    amount: 500,
    labelAr: 'التارجت الذهبي',
    labelEn: 'Gold target',
    descriptionAr: 'المرحلة الثانية',
    descriptionEn: 'Stage two',
    icon: Crown,
    color: '#eabf55',
    glow: 'rgba(234, 191, 85, 0.3)',
  },
  {
    amount: 1000,
    labelAr: 'التارجت الماسي',
    labelEn: 'Diamond target',
    descriptionAr: 'المرحلة الثالثة',
    descriptionEn: 'Stage three',
    icon: Gem,
    color: '#75d9e8',
    glow: 'rgba(117, 217, 232, 0.3)',
  },
];

const ProfitTargetsCard = ({ profit = 0, isArabic = true, formatMoney }) => {
  const currentProfit = Math.max(0, Number(profit) || 0);
  const completedCount = TARGETS.filter((target) => currentProfit >= target.amount).length;
  const activeIndex = completedCount >= TARGETS.length
    ? TARGETS.length - 1
    : completedCount;
  const activeTarget = TARGETS[activeIndex];
  const previousAmount = activeIndex === 0 ? 0 : TARGETS[activeIndex - 1].amount;
  const progress = completedCount === TARGETS.length
    ? 100
    : Math.min(100, Math.max(0, ((currentProfit - previousAmount) / (activeTarget.amount - previousAmount)) * 100));
  const remaining = Math.max(0, activeTarget.amount - currentProfit);

  const money = useMemo(() => (
    typeof formatMoney === 'function'
      ? (value) => formatMoney(value, 'USD')
      : (value) => `$${Number(value).toLocaleString('en-US', { maximumFractionDigits: 2 })}`
  ), [formatMoney]);

  const Arrow = isArabic ? ArrowLeft : ArrowRight;

  return (
    <Card
      variant="premium"
      className="relative overflow-hidden p-2.5 sm:p-3"
      style={{ '--target-color': activeTarget.color, '--target-glow': activeTarget.glow }}
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <div className="pointer-events-none absolute -end-20 -top-24 h-56 w-56 rounded-full blur-3xl" style={{ backgroundColor: activeTarget.glow }} />
      <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 text-[var(--target-color)]">
              <Target className="h-4 w-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.12em]">
                {isArabic ? 'تارجت أرباح الشهر' : 'Monthly profit targets'}
              </p>
            </div>
            <h2 className="mt-0.5 text-sm font-black text-[var(--color-text)] sm:text-base">
              {isArabic ? 'تقدمك نحو المرحلة التالية' : 'Your progress to the next stage'}
            </h2>
          </div>
          <div className="rounded-xl border px-2 py-1 text-end" style={{ borderColor: `${activeTarget.color}55`, backgroundColor: `${activeTarget.glow}` }}>
            <p className="text-sm font-black" style={{ color: activeTarget.color }}>{money(currentProfit)}</p>
          </div>
        </div>

        <div className="mt-2 grid grid-cols-3 gap-1.5 sm:gap-2">
          {TARGETS.map((target, index) => {
            const Icon = target.icon;
            const isComplete = currentProfit >= target.amount;
            const isActive = index === activeIndex && !isComplete;
            return (
              <div
                key={target.amount}
                className={`relative rounded-xl border p-2 transition-all duration-500 ${isActive ? 'scale-[1.02] shadow-lg' : 'opacity-80'}`}
                style={{
                  borderColor: isComplete || isActive ? `${target.color}99` : 'rgb(var(--color-border-rgb) / 0.75)',
                  background: isComplete || isActive ? `linear-gradient(135deg, ${target.glow}, transparent 75%)` : 'rgb(var(--color-card-rgb) / 0.42)',
                  boxShadow: isActive ? `0 12px 30px -16px ${target.glow}` : undefined,
                }}
              >
                {isComplete && <span className="absolute -end-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full text-white shadow-lg" style={{ backgroundColor: target.color }}><Check className="h-3.5 w-3.5" /></span>}
                <div className="flex items-center gap-1" style={{ color: target.color }}><Icon className="h-3.5 w-3.5" /><span className="truncate text-[9px] font-black sm:text-[10px]">{isArabic ? target.labelAr : target.labelEn}</span></div>
                <p className="mt-1 text-base font-black text-[var(--color-text)] sm:text-lg">{money(target.amount)}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-2">
          <div className="mb-1 flex items-center justify-between gap-2 text-[10px] font-bold text-[var(--color-text-secondary)]">
            <span>{completedCount === TARGETS.length ? (isArabic ? 'تم اجتياز جميع المراحل!' : 'All stages completed!') : (isArabic ? `متبقي ${money(remaining)} لاجتياز المرحلة` : `${money(remaining)} left to complete the stage`)}</span>
            <span style={{ color: activeTarget.color }}>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[color:rgb(var(--color-border-rgb)/0.6)]">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${activeTarget.color}88, ${activeTarget.color})`, boxShadow: `0 0 18px ${activeTarget.glow}` }} />
          </div>
        </div>

        {completedCount < TARGETS.length && (
          <div className="mt-2 flex items-center justify-center gap-1 text-[10px] font-black" style={{ color: activeTarget.color }}>
            <Sparkles className="h-3 w-3 animate-pulse" />
            <span>{isArabic ? `التالي بعد ${money(activeTarget.amount)}` : `Next after ${money(activeTarget.amount)}`}</span>
            <Arrow className="h-4 w-4 animate-bounce" />
          </div>
        )}
      </div>
    </Card>
  );
};

export default ProfitTargetsCard;
