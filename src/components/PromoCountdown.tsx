"use client";
import React, { useEffect, useMemo, useState } from "react";

type PromoStep = {
  startHour: number;
  startMinute: number;
  discount: number;
};

const promoSteps: PromoStep[] = [
  { startHour: 9, startMinute: 5, discount: 35 },
  { startHour: 9, startMinute: 15, discount: 30 },
  { startHour: 9, startMinute: 25, discount: 29 },
  { startHour: 9, startMinute: 35, discount: 28 },
  { startHour: 9, startMinute: 45, discount: 27 },
  { startHour: 9, startMinute: 55, discount: 26 },
  { startHour: 10, startMinute: 5, discount: 25 },
];

type CountdownState = {
  status: "before" | "active" | "final";
  discount: number;
  progress: number;
  secondsLeft: number;
  label: string;
};

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

const getCountdownState = (elapsedSeconds: number): CountdownState => {
  const stepDuration = 10 * 60;
  const cycleDuration = promoSteps.length * stepDuration;
  const cycleSecond = elapsedSeconds % cycleDuration;
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
  const [startAtMs] = useState(() => Date.now());
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const countdown = useMemo(() => {
    const elapsedSeconds = Math.floor((nowMs - startAtMs) / 1000);
    return getCountdownState(Math.max(0, elapsedSeconds));
  }, [nowMs, startAtMs]);

  const radius = 84;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - countdown.progress);

  return (
    <div className="w-full rounded-3xl border border-brand-yellow/25 bg-brand-dark p-4 md:p-5">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="text-center lg:text-left">
          <p className="text-brand-yellow font-black uppercase tracking-[0.16em] text-[10px] mb-2">
            Countdown da promoção
          </p>
          <h3 className="text-xl md:text-2xl font-black text-white leading-tight uppercase">
            Countdown da virada de desconto
          </h3>
          <p className="text-white/70 mt-1.5 text-xs md:text-sm">
            As faixas mudam automaticamente de 10 em 10 minutos: 35% → 30% → 29% → 28% → 27% → 26% → 25%.
          </p>
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

      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
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
