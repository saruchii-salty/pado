import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CURRENCIES } from '../data/chapters';
import { FlagBadge } from './FlagBadge';

gsap.registerPlugin(ScrollTrigger);

interface ScrollSectionsProps {
  onScrollProgress: (progress: number) => void;
  onNightChange: (isNight: boolean) => void;
}

const QR_MATRIX: number[][] = [
  [1,1,1,1,1,1,1,0,1,0,1,1,0,0,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,1,0,0,1,0,1,1,0,1,0,0,0,0,0,1],
  [1,0,1,1,1,0,1,0,1,1,1,0,1,0,1,0,1,1,1,0,1],
  [1,0,1,1,1,0,1,0,1,0,0,1,0,0,1,0,1,1,1,0,1],
  [1,0,1,1,1,0,1,0,0,1,1,0,1,0,1,0,1,1,1,0,1],
  [1,0,0,0,0,0,1,0,1,0,1,1,0,0,1,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1],
  [0,0,0,0,0,0,0,0,1,1,0,1,0,0,0,0,0,0,0,0,0],
  [1,0,1,1,0,1,1,1,0,1,1,0,1,1,1,0,1,0,1,1,0],
  [0,1,1,0,1,0,0,1,1,0,0,1,0,1,0,1,1,1,0,0,1],
  [1,1,0,1,1,1,1,0,1,1,1,0,1,0,1,1,0,1,1,1,0],
  [0,1,0,0,1,0,0,1,0,1,0,1,1,1,0,0,1,0,0,1,1],
  [1,0,1,1,0,1,1,0,1,0,1,1,0,0,1,1,1,0,1,0,1],
  [0,0,0,0,0,0,0,0,1,1,0,0,1,0,1,0,1,1,0,1,0],
  [1,1,1,1,1,1,1,0,0,1,1,1,0,1,1,0,0,1,1,0,1],
  [1,0,0,0,0,0,1,0,1,0,1,0,1,0,0,1,1,0,1,1,0],
  [1,0,1,1,1,0,1,0,1,1,0,1,1,1,1,0,1,1,0,0,1],
  [1,0,1,1,1,0,1,0,0,1,1,0,0,1,0,1,0,1,1,1,0],
  [1,0,1,1,1,0,1,0,1,0,1,1,1,0,1,1,1,0,0,1,1],
  [1,0,0,0,0,0,1,0,1,1,0,0,1,1,0,0,1,1,1,0,0],
  [1,1,1,1,1,1,1,0,0,1,1,1,0,1,1,1,0,1,0,1,1],
];

export const ScrollSections: React.FC<ScrollSectionsProps> = ({
  onScrollProgress,
  onNightChange,
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);
  const [activeExchangeStep, setActiveExchangeStep] = useState<number>(1);

  const rateNumberRef = useRef<HTMLSpanElement>(null);
  const targetRateRef = useRef<HTMLSpanElement>(null);
  const targetDeltaRef = useRef<HTMLSpanElement>(null);
  const chartPathRef = useRef<SVGPathElement>(null);
  const chartAreaRef = useRef<SVGPathElement>(null);
  const stepLineRef = useRef<HTMLDivElement>(null);
  const ribbonTopRef = useRef<HTMLDivElement>(null);
  const ribbonBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: rootRef.current,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          onScrollProgress(self.progress);
          onNightChange(self.progress >= 0.718 && self.progress <= 0.868);
        },
      });

      if (prefersReduced) return;

      gsap.utils.toArray<HTMLElement>('.chapter-block').forEach((block) => {
        const sectionEl = block.closest('section');
        if (!sectionEl) return;
        gsap.fromTo(
          block,
          { y: 26, opacity: 0.3 },
          {
            y: 0,
            opacity: 1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: sectionEl,
              start: 'top 72%',
              end: 'top 10%',
              scrub: 0.5,
            },
          },
        );
      });

      if (chartPathRef.current) {
        const len = chartPathRef.current.getTotalLength();
        gsap.set(chartPathRef.current, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(chartPathRef.current, {
          strokeDashoffset: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: '#chapter-rates',
            start: 'top 5%',
            end: 'bottom 105%',
            scrub: 0.65,
          },
        });
      }

      if (chartAreaRef.current) {
        gsap.fromTo(
          chartAreaRef.current,
          { opacity: 0 },
          {
            opacity: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: '#chapter-rates',
              start: 'top 5%',
              end: 'bottom 105%',
              scrub: 0.65,
            },
          },
        );
      }

      const rateProxy = { val: 1378.4 };
      gsap.to(rateProxy, {
        val: 1384.2,
        ease: 'none',
        scrollTrigger: {
          trigger: '#chapter-rates',
          start: 'top 5%',
          end: 'bottom 105%',
          scrub: 0.6,
        },
        onUpdate: () => {
          if (rateNumberRef.current) {
            rateNumberRef.current.textContent = `${rateProxy.val.toLocaleString('ko-KR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}원`;
          }
        },
      });

      // 3단계마다 멈춤 구간을 둬서 계단식으로 채워지게 처리
      const smooth01 = (v: number) => {
        const c = Math.max(0, Math.min(1, v));
        return c * c * (3 - 2 * c);
      };
      const calcSteppedBar = (p: number): { scale: number; step: number } => {
        if (p < 0.14) return { scale: (1 / 3) * smooth01(p / 0.14), step: 1 };
        if (p < 0.36) return { scale: 1 / 3, step: 1 };
        if (p < 0.48) return { scale: (1 / 3) + (1 / 3) * smooth01((p - 0.36) / 0.12), step: 2 };
        if (p < 0.70) return { scale: 2 / 3, step: 2 };
        if (p < 0.82) return { scale: (2 / 3) + (1 / 3) * smooth01((p - 0.70) / 0.12), step: 3 };
        return { scale: 1, step: 3 };
      };

      if (stepLineRef.current) {
        gsap.set(stepLineRef.current, { scaleX: 1 / 3 });
      }
      ScrollTrigger.create({
        trigger: '#chapter-exchange',
        start: 'top 5%',
        end: 'bottom 105%',
        scrub: 0.25,
        onUpdate: (self) => {
          const { scale, step } = calcSteppedBar(self.progress);
          if (stepLineRef.current) {
            stepLineRef.current.style.transform = `scaleX(${scale})`;
          }
          setActiveExchangeStep((prev) => (prev === step ? prev : step));
        },
      });

      const targetProxy = { rate: 1390.0 };
      const updateTargetReadout = (rate: number) => {
        if (targetRateRef.current) {
          targetRateRef.current.textContent = `${rate.toLocaleString('ko-KR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}원`;
        }
        if (targetDeltaRef.current) {
          const diff = rate - 1384.2;
          if (Math.abs(diff) < 0.05) {
            targetDeltaRef.current.textContent = '현재 시세와 같아요';
            targetDeltaRef.current.style.color = '#3182F6';
          } else if (diff < 0) {
            targetDeltaRef.current.textContent = `현재보다 ${Math.abs(diff).toFixed(2)}원 낮아요`;
            targetDeltaRef.current.style.color = '#3182F6';
          } else {
            targetDeltaRef.current.textContent = `현재보다 ${diff.toFixed(2)}원 높아요`;
            targetDeltaRef.current.style.color = '#F04452';
          }
        }
      };
      updateTargetReadout(targetProxy.rate);

      gsap.to(targetProxy, {
        rate: 1372.0,
        ease: 'none',
        scrollTrigger: {
          trigger: '#chapter-auto',
          start: 'top 5%',
          end: 'bottom 105%',
          scrub: 0.65,
        },
        onUpdate: () => updateTargetReadout(targetProxy.rate),
      });

      if (ribbonTopRef.current) {
        gsap.fromTo(
          ribbonTopRef.current,
          { xPercent: 0 },
          {
            xPercent: -24,
            ease: 'none',
            scrollTrigger: {
              trigger: '#chapter-wallet',
              start: 'top 25%',
              end: 'bottom 100%',
              scrub: 0.7,
            },
          },
        );
      }
      if (ribbonBottomRef.current) {
        gsap.fromTo(
          ribbonBottomRef.current,
          { xPercent: -22 },
          {
            xPercent: 4,
            ease: 'none',
            scrollTrigger: {
              trigger: '#chapter-wallet',
              start: 'top 25%',
              end: 'bottom 100%',
              scrub: 0.7,
            },
          },
        );
      }
    }, rootRef);

    return () => ctx.revert();
  }, [onNightChange, onScrollProgress]);

  const handleStoreClick = (platformLabel: string) => {
    setDownloadNotice(`${platformLabel} 설치 안내 페이지로 연결할 준비가 되었어요.`);
    window.setTimeout(() => setDownloadNotice(null), 4000);
  };

  return (
    <div ref={rootRef} className="relative z-20">
      <section id="chapter-hero" className="relative h-[560vh]">
        <div className="sticky top-0 mx-auto flex h-screen max-w-[1200px] flex-col items-center justify-start px-6 pt-24 lg:pt-28 text-center">
          <div className="max-w-[780px] space-y-2.5">
            <p className="text-[14px] font-semibold text-[#3182F6]">
              외환을 가장 쉽게
            </p>
            <h1 className="text-[clamp(2.15rem,3.9vw,3.5rem)] font-extrabold leading-[1.15] tracking-[-0.03em] text-[#191F28]">
              환율과 거래가 한눈에 들어와요
            </h1>
            <p className="mx-auto max-w-[520px] text-[16px] leading-[1.55] font-medium text-[#4E5968]">
              복잡한 차트와 어려운 용어 대신, 꼭 필요한 시세와 환전만 둥글게 담았어요.
            </p>
          </div>
        </div>
      </section>

      <section id="chapter-rates" className="relative h-[560vh]">
        <div className="sticky top-0 mx-auto flex h-screen max-w-[1240px] items-end lg:items-center px-6 pt-24 pb-10 lg:py-20">
          <div className="grid w-full grid-cols-1 lg:grid-cols-12 items-center gap-8">
            <div className="chapter-block lg:col-span-4 space-y-5 pt-[36dvh] lg:pt-0">
              <p className="text-[14px] font-semibold text-[#3182F6]">
                실시간 호가
              </p>
              <h2 className="text-[clamp(1.95rem,3vw,2.75rem)] font-extrabold leading-[1.2] tracking-[-0.03em] text-[#191F28]">
                1원 단위까지
                <br />
                바로바로 확인해요
              </h2>
              <p className="text-[16px] leading-[1.68] font-medium text-[#4E5968]">
                서울 외환시장과 연결된 호가를 지연 없이 보여드려요. 살 때와 팔 때의 차이까지 투명하게 확인할 수 있어요.
              </p>
            </div>

            {/* 가운데 컬럼은 3D 폰 영역이라 비워둠 */}
            <div className="hidden lg:block lg:col-span-4" aria-hidden="true" />

            <div className="chapter-block lg:col-span-4">
              <div className="pado-card p-6 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <FlagBadge type="us" size={32} />
                    <div>
                      <p className="text-[15px] font-bold text-[#191F28]">미국 달러</p>
                      <p className="text-[12px] font-medium text-[#8B95A1]">USD / KRW</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      ref={rateNumberRef}
                      className="text-[22px] font-extrabold text-[#191F28] tabular-nums"
                    >
                      1,384.20원
                    </span>
                    <p className="text-[12px] font-semibold text-[#F04452] tabular-nums">
                      +4.80원 (+0.35%)
                    </p>
                  </div>
                </div>

                <div className="relative h-[96px] w-full overflow-hidden rounded-[20px] bg-[#F9FAFB] p-2.5">
                  <svg viewBox="0 0 420 96" className="h-full w-full overflow-visible" aria-hidden="true">
                    <path
                      ref={chartAreaRef}
                      d="M8,76 C52,72 78,52 122,58 C166,64 190,34 236,42 C282,50 318,24 360,28 C386,30 402,16 412,12 L412,92 L8,92 Z"
                      fill="#F04452"
                      fillOpacity="0.06"
                    />
                    <path
                      ref={chartPathRef}
                      d="M8,76 C52,72 78,52 122,58 C166,64 190,34 236,42 C282,50 318,24 360,28 C386,30 402,16 412,12"
                      fill="none"
                      stroke="#F04452"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                <div className="flex items-center justify-between text-[12px] font-medium text-[#6B7684] tabular-nums">
                  <span>살 때 1,384.25 · 팔 때 1,384.15</span>
                  <span className="font-semibold text-[#3182F6]">차이 0.10원</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="chapter-exchange" className="relative h-[560vh]">
        <div className="sticky top-0 mx-auto flex h-screen max-w-[1200px] flex-col justify-end px-6 pb-5 lg:pb-6">
          <div className="chapter-block space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4">
              <p className="text-[14px] font-semibold text-[#3182F6] shrink-0">
                즉시 환전
              </p>
              <h2 className="text-[clamp(1.55rem,2.6vw,2.25rem)] font-extrabold leading-[1.2] tracking-[-0.03em] text-[#191F28]">
                수수료 고민 없이 바로 바꿔드려요
              </h2>
            </div>

            <div className="pado-card p-4 lg:p-5 space-y-3">
              <div className="relative h-[4px] w-full overflow-hidden rounded-full bg-[#E5E8EB]">
                <div
                  ref={stepLineRef}
                  className="h-full w-full bg-[#3182F6] origin-left will-change-transform"
                  style={{ transform: 'scaleX(0.3333)' }}
                />
                <span className="absolute top-0 bottom-0 left-1/3 w-[2px] bg-white" aria-hidden="true" />
                <span className="absolute top-0 bottom-0 left-2/3 w-[2px] bg-white" aria-hidden="true" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`space-y-1 transition-opacity duration-300 ${activeExchangeStep >= 1 ? 'opacity-100' : 'opacity-45'}`}>
                  <p className="text-[12px] font-semibold text-[#3182F6] tabular-nums">01단계</p>
                  <p className="text-[16px] font-bold text-[#191F28]">금액 고르기</p>
                  <p className="text-[14px] text-[#6B7684] tabular-nums">
                    1원부터 필요한 만큼만 가볍게 입력해요
                  </p>
                </div>
                <div className={`space-y-1 transition-opacity duration-300 ${activeExchangeStep >= 2 ? 'opacity-100' : 'opacity-45'}`}>
                  <p className="text-[12px] font-semibold text-[#3182F6] tabular-nums">02단계</p>
                  <p className="text-[16px] font-bold text-[#191F28]">실시간 환율 고정</p>
                  <p className="text-[14px] text-[#6B7684]">
                    환전 버튼을 누르는 순간 시세가 고정돼요
                  </p>
                </div>
                <div className={`space-y-1 transition-opacity duration-300 ${activeExchangeStep >= 3 ? 'opacity-100' : 'opacity-45'}`}>
                  <p className="text-[12px] font-semibold text-[#3182F6] tabular-nums">03단계</p>
                  <p className="text-[16px] font-bold text-[#191F28]">0.3초 즉시 입금</p>
                  <p className="text-[14px] text-[#6B7684] tabular-nums">
                    수수료 0원으로 내 지갑에 바로 채워져요
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="chapter-auto" className="relative h-[560vh]">
        <div className="sticky top-0 mx-auto flex h-screen max-w-[1200px] items-end lg:items-center px-6 pt-24 pb-12 lg:py-20">
          <div className="grid w-full grid-cols-1 lg:grid-cols-12 items-center gap-10">
            <div className="hidden lg:block lg:col-span-5" aria-hidden="true" />
            <div className="chapter-block lg:col-span-7 space-y-8 pt-[38dvh] lg:pt-0">
              <div className="space-y-4">
                <p className="text-[14px] font-semibold text-[#3182F6]">
                  자동 주문
                </p>
                <h2 className="text-[clamp(2rem,3.5vw,3.15rem)] font-extrabold leading-[1.2] tracking-[-0.03em] text-[#191F28]">
                  원하는 환율이 오면
                  <br />
                  알아서 바꿔줘요
                </h2>
                <p className="max-w-[460px] text-[17px] leading-[1.65] font-medium text-[#4E5968]">
                  하루 종일 시세를 들여다보지 않아도 돼요. 목표 환율만 정해두면, 닿는 순간 자동으로 매수해요.
                </p>
              </div>

              <div className="max-w-[500px] divide-y divide-[#191F28]/10 border-t border-b border-[#191F28]/10">
                <div className="flex items-baseline justify-between gap-4 py-5">
                  <div>
                    <p className="text-[14px] font-semibold text-[#4E5968]">설정한 목표 환율</p>
                    <span
                      ref={targetDeltaRef}
                      className="mt-1 inline-block text-[13px] font-semibold text-[#3182F6] tabular-nums"
                    >
                      현재보다 12.20원 낮아요
                    </span>
                  </div>
                  <span
                    ref={targetRateRef}
                    className="text-[clamp(1.9rem,3.2vw,2.65rem)] font-extrabold tracking-[-0.03em] text-[#191F28] tabular-nums"
                  >
                    1,372.00원
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 py-4">
                  <span className="text-[15px] font-semibold text-[#191F28]">자동 체결 금액</span>
                  <span className="text-[15px] font-bold text-[#4E5968] tabular-nums">
                    $3,000 · 수수료 0원
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 py-4">
                  <span className="text-[15px] font-semibold text-[#191F28]">체결 안내</span>
                  <span className="text-[15px] font-medium text-[#6B7684] tabular-nums">
                    목표가 도달 즉시 알림을 보내드려요
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="chapter-wallet" className="relative h-[560vh] overflow-x-clip">
        <div className="sticky top-0 mx-auto flex h-screen max-w-[1200px] items-end lg:items-center px-6 pt-24 pb-12 lg:py-20">
          <div className="grid w-full grid-cols-1 lg:grid-cols-12 items-center gap-10">
            <div className="chapter-block lg:col-span-7 space-y-7 pt-[38dvh] lg:pt-0">
              <div className="space-y-4">
                <p className="text-[14px] font-semibold text-[#3182F6]">
                  외화 지갑
                </p>
                <h2 className="text-[clamp(2rem,3.5vw,3.15rem)] font-extrabold leading-[1.2] tracking-[-0.03em] text-[#191F28]">
                  열여섯 나라 통화를
                  <br />
                  한 지갑에 모아요
                </h2>
                <p className="max-w-[460px] text-[17px] leading-[1.65] font-medium text-[#4E5968]">
                  미국 달러와 일본 엔, 유로부터 스위스 프랑까지. 통화마다 계좌를 새로 만들 필요 없이 한 지갑에서 바로 꺼내 써요.
                </p>
              </div>

              <div
                className="relative -ml-6 lg:-ml-24 overflow-hidden py-2 space-y-3.5"
                style={{
                  maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 88%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 88%, transparent 100%)',
                }}
              >
                <div ref={ribbonTopRef} className="flex w-max gap-3.5 px-4 will-change-transform">
                  {[...CURRENCIES, ...CURRENCIES].map((c, idx) => (
                    <div
                      key={`top-${c.code}-${idx}`}
                      className="flex items-center gap-3.5 rounded-[24px] bg-white px-5 py-3.5 shadow-[0_12px_32px_-12px_rgba(25,31,40,0.08)] shrink-0"
                    >
                      <FlagBadge type={c.flagType} size={32} />
                      <div>
                        <p className="text-[14px] font-bold text-[#191F28] whitespace-nowrap">
                          {c.nameKo}
                        </p>
                        <p className="text-[12px] font-medium text-[#6B7684] tabular-nums whitespace-nowrap">
                          {c.rate}원
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div ref={ribbonBottomRef} className="flex w-max gap-3.5 px-4 will-change-transform">
                  {[...CURRENCIES.slice().reverse(), ...CURRENCIES.slice().reverse()].map((c, idx) => (
                    <div
                      key={`bot-${c.code}-${idx}`}
                      className="flex items-center gap-3.5 rounded-[24px] bg-white px-5 py-3.5 shadow-[0_12px_32px_-12px_rgba(25,31,40,0.08)] shrink-0"
                    >
                      <FlagBadge type={c.flagType} size={32} />
                      <div>
                        <p className="text-[14px] font-bold text-[#191F28] whitespace-nowrap">
                          {c.code}
                        </p>
                        <p
                          className={`text-[12px] font-semibold tabular-nums whitespace-nowrap ${
                            c.isUp ? 'text-[#F04452]' : 'text-[#3182F6]'
                          }`}
                        >
                          {c.change}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="hidden lg:block lg:col-span-5" aria-hidden="true" />
          </div>
        </div>
      </section>

      <section id="chapter-security" className="relative h-[560vh] text-[#F9FAFB]">
        <div className="sticky top-0 mx-auto flex h-screen max-w-[1200px] items-end lg:items-center px-6 pt-24 pb-12 lg:py-20">
          <div className="grid w-full grid-cols-1 lg:grid-cols-12 items-center gap-10">
            <div className="chapter-block lg:col-span-6 space-y-8 pt-[38dvh] lg:pt-0">
              <div className="space-y-5">
                <p className="text-[14px] font-semibold text-[#60A5FA]">
                  24시간 보안
                </p>
                <h2 className="text-[clamp(2rem,3.5vw,3.15rem)] font-extrabold leading-[1.2] tracking-[0.01em] text-white">
                  밤에도 주말에도
                  <br />
                  마음 놓고 거래해요
                </h2>
                <p className="max-w-[440px] text-[17px] leading-[1.65] font-medium text-[#CBD5E1]">
                  서울이 잠든 시간에도 뉴욕과 런던 외환시장과 바로 이어져요.
                </p>
              </div>

              <div className="max-w-[460px] divide-y divide-white/12 border-t border-b border-white/12">
                <div className="py-4">
                  <p className="text-[16px] font-bold text-white">예치금 전액 분리 보관</p>
                  <p className="mt-1 text-[14px] font-medium text-[#94A3B8]">
                    고객님의 원화와 외화는 별도 신탁 계좌에 안전하게 보관돼요
                  </p>
                </div>
                <div className="py-4">
                  <p className="text-[16px] font-bold text-white">끊김 없는 24시간 거래</p>
                  <p className="mt-1 text-[14px] font-medium text-[#94A3B8] tabular-nums">
                    평일 낮부터 새벽까지 실시간 시세 확인과 환전이 가능해요
                  </p>
                </div>
                <div className="py-4">
                  <p className="text-[16px] font-bold text-white">본인 확인 기반 보호</p>
                  <p className="mt-1 text-[14px] font-medium text-[#94A3B8]">
                    모든 출금과 설정 변경은 생체 인증을 거쳐야만 진행돼요
                  </p>
                </div>
              </div>
            </div>
            <div className="hidden lg:block lg:col-span-6" aria-hidden="true" />
          </div>
        </div>
      </section>

      <section id="chapter-finale" className="relative h-[560vh]">
        <div className="sticky top-0 mx-auto flex h-screen max-w-[1200px] flex-col justify-between px-6 pt-24 pb-8">
          <div className="my-auto grid w-full grid-cols-1 lg:grid-cols-12 items-center gap-10">
            <div className="hidden lg:block lg:col-span-5" aria-hidden="true" />
            <div className="chapter-block lg:col-span-7 space-y-6 pt-[36dvh] lg:pt-0">
              <p className="text-[14px] font-semibold text-[#3182F6]">
                시작하기
              </p>
              <h2 className="text-[clamp(2.1rem,3.6vw,3.2rem)] font-extrabold leading-[1.2] tracking-[-0.03em] text-[#191F28]">
                환전이 가벼워지는 순간,
                <br />
                파도로 시작해요
              </h2>
              <p className="max-w-[440px] text-[17px] leading-[1.65] font-medium text-[#4E5968]">
                복잡한 서류 없이 1분 만에 내 외화 지갑을 만들 수 있어요. 지금 바로 첫 환전을 경험해 보세요.
              </p>

              <div className="pado-card p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="shrink-0 rounded-[20px] bg-[#F9FAFB] p-3 ring-1 ring-[#191F28]/6">
                  <svg
                    width="92"
                    height="92"
                    viewBox="0 0 21 21"
                    shapeRendering="crispEdges"
                    aria-label="파도 앱 설치용 큐알 코드"
                  >
                    <rect width="21" height="21" fill="#F9FAFB" />
                    {QR_MATRIX.map((row, r) =>
                      row.map((cell, c) =>
                        cell === 1 ? (
                          <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" fill="#191F28" />
                        ) : null,
                      ),
                    )}
                  </svg>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <p className="text-[15px] font-bold text-[#191F28]">카메라로 비춰서 바로 받아요</p>
                    <p className="text-[13px] font-medium text-[#8B95A1] mt-0.5">
                      아이폰과 안드로이드 모두 지원해요
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleStoreClick('앱스토어')}
                      className="cursor-pointer rounded-full bg-[#3182F6] px-5 py-2.5 text-[14px] font-semibold text-white transition-colors duration-200 hover:bg-[#1B64DA] whitespace-nowrap shrink-0"
                    >
                      앱스토어에서 받기
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStoreClick('구글 플레이')}
                      className="cursor-pointer rounded-full bg-[#F2F4F6] px-5 py-2.5 text-[14px] font-semibold text-[#191F28] transition-colors duration-200 hover:bg-[#E5E8EB] whitespace-nowrap shrink-0"
                    >
                      구글 플레이에서 받기
                    </button>
                  </div>

                  {downloadNotice && (
                    <p className="text-[13px] font-semibold text-[#3182F6]" role="status">
                      {downloadNotice}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <footer className="mt-8 border-t border-[#191F28]/6 pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[13px] font-medium text-[#8B95A1]">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-bold text-[#191F28]">파도</span>
                <span aria-hidden="true">·</span>
                <span>주?식회사 파도파이낸스</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">XX시 XX구 XX로 142</span>
              </div>
              <p className="tabular-nums">고객센터같은 건 없어요ㅋ</p>
            </div>
          </footer>
        </div>
      </section>
    </div>
  );
};
