"use client";
import React, { useEffect, useMemo, useState } from "react";

type PromoStep = {
  startHour: number;
  startMinute: number;
  discount: number;
};

const promoSteps: PromoStep[] = [
  { startHour: 10, startMinute: 10, discount: 35 },
  { startHour: 10, startMinute: 30, discount: 30 },
  { startHour: 10, startMinute: 50, discount: 29 },
  { startHour: 11, startMinute: 10, discount: 28 },
  { startHour: 11, startMinute: 30, discount: 27 },
  { startHour: 11, startMinute: 50, discount: 26 },
  { startHour: 12, startMinute: 10, discount: 25 },
];

type CountdownState = {
  status: "before" | "active" | "final";
  discount: number;
  progress: number;
  secondsLeft: number;
  label: string;
};

const getMinuteOfDay = (hour: number, minute: number) => hour * 60 + minute;

const formatStepTime = (hour: number, minute: number) => {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
};

const formatClock = (totalSeconds: number) => {
  const seconds = Math.max(0, totalSeconds);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
};

const getCountdownState = (now: Date): CountdownState => {
  const firstStep = promoSteps[0];
  const firstStartMinute = getMinuteOfDay(firstStep.startHour, firstStep.startMinute);
  const currentMinute = now.getHours() * 60 + now.getMinutes();
  const currentSecondOfDay = currentMinute * 60 + now.getSeconds();

  if (currentMinute < firstStartMinute) {
    const firstStartSecond = firstStartMinute * 60;
    const secondsLeft = Math.max(0, firstStartSecond - currentSecondOfDay);
    return {
      status: "before",
      discount: firstStep.discount,
      progress: 1,
      secondsLeft,
      label: "Começa em",
    };
  }

  for (let i = 0; i < promoSteps.length; i++) {
    const step = promoSteps[i];
    const startMinute = getMinuteOfDay(step.startHour, step.startMinute);
    const nextStep = promoSteps[i + 1];
    const endMinute = nextStep
      ? getMinuteOfDay(nextStep.startHour, nextStep.startMinute)
      : null;

    if (endMinute !== null && currentMinute >= startMinute && currentMinute < endMinute) {
      const startSecond = startMinute * 60;
      const endSecond = endMinute * 60;
      const totalSeconds = endSecond - startSecond;
      const secondsLeft = Math.max(0, endSecond - currentSecondOfDay);
      const progress = Math.max(0, Math.min(1, secondsLeft / totalSeconds));
      return {
        status: "active",
        discount: step.discount,
        progress,
        secondsLeft,
        label: "Próxima troca em",
      };
    }
  }

  const finalStep = promoSteps[promoSteps.length - 1];
  return {
    status: "final",
    discount: finalStep.discount,
    progress: 1,
    secondsLeft: 0,
    label: "Faixa final ativa",
  };
};

export default function PromoCountdown() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const getNowSp = () =>
      new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
    setNow(getNowSp());
    const timer = setInterval(() => setNow(getNowSp()), 1000);
    return () => clearInterval(timer);
  }, []);

  const countdown = useMemo(() => getCountdownState(now), [now]);

  const radius = 84;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - countdown.progress);

  return (
    <section className="bg-brand-dark py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="rounded-3xl border border-brand-yellow/25 bg-black/40 backdrop-blur-sm p-8 md:p-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="text-center lg:text-left">
              <p className="text-brand-yellow font-black uppercase tracking-[0.2em] text-xs mb-3">
                Countdown da promoção
              </p>
              <h3 className="text-3xl md:text-4xl font-black text-white leading-tight uppercase">
                Countdown da virada de desconto
              </h3>
              <p className="text-white/70 mt-4 text-base md:text-lg">
                As faixas mudam automaticamente de 20 em 20 minutos: 35% → 30% → 29% → 28% → 27% → 26% → 25%.
              </p>
              <p className="mt-6 text-brand-yellow font-black text-xl md:text-2xl uppercase">
                {countdown.label} {countdown.secondsLeft > 0 ? formatClock(countdown.secondsLeft) : ""}
              </p>
            </div>

            <div className="relative w-[220px] h-[220px] shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 220 220">
                <circle
                  cx="110"
                  cy="110"
                  r={radius}
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="16"
                  fill="transparent"
                />
                <circle
                  cx="110"
                  cy="110"
                  r={radius}
                  stroke="#FFB800"
                  strokeWidth="16"
                  strokeLinecap="round"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  style={{ transition: "stroke-dashoffset 1s linear" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-black text-brand-yellow leading-none">
                  {countdown.discount}%
                </span>
                <span className="text-xs uppercase tracking-[0.3em] text-white/70 mt-2">
                  Desconto
                </span>
              </div>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {promoSteps.map((step) => {
              const activeStep = countdown.discount === step.discount && countdown.status !== "before";
              return (
                <div
                  key={`${step.startHour}-${step.startMinute}-${step.discount}`}
                  className={`rounded-xl px-3 py-3 text-center border ${
                    activeStep
                      ? "border-brand-yellow bg-brand-yellow/15"
                      : "border-white/10 bg-white/5"
                  }`}
                >
                  <p className="text-[10px] uppercase tracking-widest text-white/60">
                    {formatStepTime(step.startHour, step.startMinute)}
                  </p>
                  <p className="text-lg font-black text-white mt-1">{step.discount}%</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
