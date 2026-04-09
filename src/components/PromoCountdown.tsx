"use client";
import React, { useEffect, useMemo, useState } from "react";

type PromoDay = {
  isoDate: string;
  discount: number;
};

const promoSchedule: PromoDay[] = [
  { isoDate: "2026-04-13", discount: 35 },
  { isoDate: "2026-04-14", discount: 30 },
  { isoDate: "2026-04-15", discount: 29 },
  { isoDate: "2026-04-16", discount: 28 },
  { isoDate: "2026-04-17", discount: 27 },
  { isoDate: "2026-04-18", discount: 26 },
  { isoDate: "2026-04-19", discount: 25 },
];

type CountdownState = {
  status: "before" | "active" | "ended";
  discount: number;
  progress: number;
  secondsLeft: number;
  label: string;
};

const toStartDate = (isoDate: string) => {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
};

const formatClock = (totalSeconds: number) => {
  const seconds = Math.max(0, totalSeconds);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
};

const getCountdownState = (now: Date): CountdownState => {
  const firstStart = toStartDate(promoSchedule[0].isoDate);
  const lastStart = toStartDate(promoSchedule[promoSchedule.length - 1].isoDate);
  const lastEnd = new Date(lastStart.getTime() + 24 * 60 * 60 * 1000);

  if (now < firstStart) {
    const secondsLeft = Math.floor((firstStart.getTime() - now.getTime()) / 1000);
    return {
      status: "before",
      discount: promoSchedule[0].discount,
      progress: 1,
      secondsLeft,
      label: "Começa em",
    };
  }

  if (now >= lastEnd) {
    return {
      status: "ended",
      discount: 0,
      progress: 0,
      secondsLeft: 0,
      label: "Promoção encerrada",
    };
  }

  for (const day of promoSchedule) {
    const start = toStartDate(day.isoDate);
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    if (now >= start && now < end) {
      const totalSeconds = 24 * 60 * 60;
      const secondsLeft = Math.floor((end.getTime() - now.getTime()) / 1000);
      const progress = Math.max(0, Math.min(1, secondsLeft / totalSeconds));
      return {
        status: "active",
        discount: day.discount,
        progress,
        secondsLeft,
        label: "Termina em",
      };
    }
  }

  return {
    status: "ended",
    discount: 0,
    progress: 0,
    secondsLeft: 0,
    label: "Promoção encerrada",
  };
};

export default function PromoCountdown() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
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
                Desconto do dia acabando
              </h3>
              <p className="text-white/70 mt-4 text-base md:text-lg">
                À meia-noite o percentual muda automaticamente para o próximo dia da campanha.
              </p>
              <p className="mt-6 text-brand-yellow font-black text-xl md:text-2xl uppercase">
                {countdown.label} {formatClock(countdown.secondsLeft)}
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
            {promoSchedule.map((day) => {
              const activeDay = countdown.status === "active" && countdown.discount === day.discount;
              return (
                <div
                  key={day.isoDate}
                  className={`rounded-xl px-3 py-3 text-center border ${
                    activeDay
                      ? "border-brand-yellow bg-brand-yellow/15"
                      : "border-white/10 bg-white/5"
                  }`}
                >
                  <p className="text-[10px] uppercase tracking-widest text-white/60">
                    {day.isoDate.slice(8, 10)}/{day.isoDate.slice(5, 7)}
                  </p>
                  <p className="text-lg font-black text-white mt-1">{day.discount}%</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
