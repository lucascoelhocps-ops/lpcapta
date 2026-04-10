"use client";
import React, { useEffect, useMemo, useState } from "react";

type PromoStep = {
  startHour: number;
  startMinute: number;
  discount: number;
};

const promoSteps: PromoStep[] = [
  { startHour: 16, startMinute: 0, discount: 35 },
  { startHour: 16, startMinute: 5, discount: 30 },
  { startHour: 16, startMinute: 10, discount: 29 },
  { startHour: 16, startMinute: 15, discount: 28 },
  { startHour: 16, startMinute: 20, discount: 27 },
  { startHour: 16, startMinute: 25, discount: 26 },
  { startHour: 16, startMinute: 30, discount: 25 },
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
  const currentMinute = now.getHours() * 60 + now.getMinutes();
  const currentSecondOfDay = currentMinute * 60 + now.getSeconds();
  const stepDuration = 5 * 60;
  const cycleDuration = promoSteps.length * stepDuration;
  const cycleSecond = currentSecondOfDay % cycleDuration;
  const currentStepIndex = Math.floor(cycleSecond / stepDuration);
  const secondsIntoStep = cycleSecond % stepDuration;
  const secondsLeft = stepDuration - secondsIntoStep;
  const currentStep = promoSteps[currentStepIndex];
  return {
    status: "active",
    discount: currentStep.discount,
    progress: Math.max(0, Math.min(1, secondsLeft / stepDuration)),
    secondsLeft,
    label: "Próxima troca em",
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
    <div className="w-full rounded-3xl border border-brand-yellow/25 bg-brand-dark p-4 md:p-5">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="text-center lg:text-left">
          <p className="text-brand-yellow font-black uppercase tracking-[0.16em] text-[10px] mb-2">
            PROMOÇÃO 2 ANOS DE RATOEIRA
          </p>
          <h3 className="text-xl md:text-2xl font-black text-white leading-tight uppercase">
            Countdown da virada de desconto
          </h3>
          <p className="mt-3 text-brand-yellow font-black text-base md:text-lg uppercase">
            {countdown.label} {countdown.secondsLeft > 0 ? formatClock(countdown.secondsLeft) : ""}
          </p>
        </div>

        <div className="relative w-[145px] h-[145px] shrink-0">
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
            <span className="text-3xl font-black text-brand-yellow leading-none">
              {countdown.discount}%
            </span>
            <span className="text-[10px] uppercase tracking-[0.28em] text-white/70 mt-2">
              Desconto
            </span>
          </div>
        </div>
      </div>

      {/* Mobile: só o card ativo */}
      <div className="mt-4 block md:hidden">
        {promoSteps
          .filter((step) => countdown.discount === step.discount)
          .map((step) => (
            <div
              key={`mobile-${step.startHour}-${step.startMinute}`}
              className="rounded-xl px-4 py-3 text-center border border-brand-yellow bg-brand-yellow/15 w-full"
            >
              <p className="text-[9px] uppercase tracking-widest text-white/60 mb-1">
                {formatStepTime(step.startHour, step.startMinute)}
              </p>
              <p className="text-2xl font-black text-brand-yellow">{step.discount}% OFF</p>
              <p className="text-[10px] uppercase tracking-widest text-white/50 mt-1">Desconto atual</p>
            </div>
          ))}
      </div>

      {/* Desktop: todos os 7 cards */}
      <div className="mt-4 hidden md:grid md:grid-cols-4 lg:grid-cols-7 gap-2">
        {promoSteps.map((step) => {
          const activeStep = countdown.discount === step.discount && countdown.status !== "before";
          return (
            <div
              key={`${step.startHour}-${step.startMinute}-${step.discount}`}
              className={`rounded-xl px-2.5 py-1.5 text-center border ${
                activeStep
                  ? "border-brand-yellow bg-brand-yellow/15"
                  : "border-white/10 bg-white/5"
              }`}
            >
              <p className="text-[9px] uppercase tracking-widest text-white/60">
                {formatStepTime(step.startHour, step.startMinute)}
              </p>
              <p className="text-sm font-black text-white mt-1">{step.discount}%</p>
            </div>
          );
        })}
      </div>

    </div>
  );
}
