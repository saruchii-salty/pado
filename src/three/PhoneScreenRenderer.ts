import * as THREE from 'three';

const SCREEN_W = 780;
const SCREEN_H = 1688;
const FONT_FAMILY = '"Pretendard Variable", "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, system-ui, sans-serif';

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - clamp01(t), 3);
}

function easeInOutCubic(t: number): number {
  const x = clamp01(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp01(t);
}

function formatComma(num: number): string {
  return Math.round(num).toLocaleString('ko-KR');
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawCard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill: string,
  shadow = true,
  stroke?: string,
) {
  ctx.save();
  if (shadow) {
    ctx.shadowColor = 'rgba(25, 31, 40, 0.055)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 8;
  }
  drawRoundedRect(ctx, x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.restore();

  if (stroke) {
    ctx.save();
    drawRoundedRect(ctx, x, y, w, h, r);
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }
}

type FlagType = 'kr' | 'us' | 'jp' | 'eu' | 'gb' | 'ch' | 'ca';

function drawFlag(ctx: CanvasRenderingContext2D, type: FlagType, cx: number, cy: number, r: number) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();

  if (type === 'us') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    ctx.fillStyle = '#E03E45';
    const stripeH = (r * 2) / 7;
    for (let i = 0; i < 7; i += 2) {
      ctx.fillRect(cx - r, cy - r + i * stripeH, r * 2, stripeH);
    }
    ctx.fillStyle = '#2B4C9B';
    ctx.fillRect(cx - r, cy - r, r * 1.05, r * 1.05);
    ctx.fillStyle = '#FFFFFF';
    for (let sx = 0; sx < 3; sx++) {
      for (let sy = 0; sy < 3; sy++) {
        ctx.beginPath();
        ctx.arc(cx - r * 0.75 + sx * r * 0.28, cy - r * 0.72 + sy * r * 0.26, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (type === 'jp') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    ctx.fillStyle = '#E12D48';
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.44, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === 'eu') {
    ctx.fillStyle = '#1E4DB7';
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    ctx.fillStyle = '#FFD43B';
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * r * 0.56, cy + Math.sin(a) * r * 0.56, 3.2, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (type === 'gb') {
    ctx.fillStyle = '#1B3B8B';
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = r * 0.34;
    ctx.beginPath();
    ctx.moveTo(cx - r, cy - r);
    ctx.lineTo(cx + r, cy + r);
    ctx.moveTo(cx + r, cy - r);
    ctx.lineTo(cx - r, cy + r);
    ctx.stroke();
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(cx - r * 0.24, cy - r, r * 0.48, r * 2);
    ctx.fillRect(cx - r, cy - r * 0.24, r * 2, r * 0.48);
    ctx.fillStyle = '#DC2E3E';
    ctx.fillRect(cx - r * 0.14, cy - r, r * 0.28, r * 2);
    ctx.fillRect(cx - r, cy - r * 0.14, r * 2, r * 0.28);
  } else if (type === 'ch') {
    ctx.fillStyle = '#E0353B';
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(cx - r * 0.16, cy - r * 0.5, r * 0.32, r);
    ctx.fillRect(cx - r * 0.5, cy - r * 0.16, r, r * 0.32);
  } else if (type === 'ca') {
    ctx.fillStyle = '#E0353B';
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(cx - r * 0.48, cy - r, r * 0.96, r * 2);
    ctx.fillStyle = '#E0353B';
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.26, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    ctx.fillStyle = '#D93848';
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.45, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#1E57B8';
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.45, 0, Math.PI);
    ctx.fill();
  }

  ctx.restore();
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(0,0,0,0.07)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}

export class PhoneScreenRenderer {
  public readonly canvas: HTMLCanvasElement;
  public readonly texture: THREE.CanvasTexture;
  private ctx: CanvasRenderingContext2D;
  private lastDrawnProgress = -1;
  private lastTimeBucket = -1;

  constructor(maxAnisotropy = 8) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = SCREEN_W;
    this.canvas.height = SCREEN_H;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('Could not initialize 2D context for phone screen');
    this.ctx = ctx;

    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.anisotropy = maxAnisotropy;
    this.texture.minFilter = THREE.LinearMipmapLinearFilter;
    this.texture.magFilter = THREE.LinearFilter;
    this.texture.generateMipmaps = true;

    this.render(0, 0, true);
  }

  public render(scrollProgress: number, elapsedTime: number, force = false) {
    const p = clamp01(scrollProgress);
    const timeBucket = Math.floor(elapsedTime * 15);
    if (!force && Math.abs(p - this.lastDrawnProgress) < 0.0002 && timeBucket === this.lastTimeBucket) {
      return;
    }
    this.lastDrawnProgress = p;
    this.lastTimeBucket = timeBucket;

    const ctx = this.ctx;
    ctx.clearRect(0, 0, SCREEN_W, SCREEN_H);

    // 6번 다크 섹션 배경색 보간
    const darkBlendIn = easeInOutCubic((p - 0.702) / 0.034);
    const darkBlendOut = easeInOutCubic((p - 0.850) / 0.034);
    const isDarkFactor = clamp01(darkBlendIn - darkBlendOut);

    const bgR = Math.round(lerp(236, 13, isDarkFactor));
    const bgG = Math.round(lerp(239, 19, isDarkFactor));
    const bgB = Math.round(lerp(245, 32, isDarkFactor));
    ctx.fillStyle = `rgb(${bgR}, ${bgG}, ${bgB})`;
    ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);

    // 560vh 균등 분할 기준 섹션 전환점
    const bounds = [0, 0.133, 0.280, 0.427, 0.573, 0.720, 0.866, 1.01];
    const fade = 0.015;

    for (let idx = 0; idx < 7; idx++) {
      const start = bounds[idx];
      const end = bounds[idx + 1];
      if (p < start - fade || p > end + fade) continue;

      let alpha = 1;
      let offsetY = 0;

      if (idx > 0 && p < start + fade) {
        const t = easeInOutCubic((p - (start - fade)) / (fade * 2));
        alpha = t;
        offsetY = (1 - t) * 28;
      } else if (idx < 6 && p > end - fade) {
        const t = easeInOutCubic((p - (end - fade)) / (fade * 2));
        alpha = 1 - t;
        offsetY = -t * 28;
      }

      const localP = clamp01((p - start) / (end - start));

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(0, offsetY);

      switch (idx) {
        case 0:
          this.drawScreenHome(ctx, localP, elapsedTime);
          break;
        case 1:
          this.drawScreenRates(ctx, localP, elapsedTime);
          break;
        case 2:
          this.drawScreenExchange(ctx, localP);
          break;
        case 3:
          this.drawScreenAutoOrder(ctx, localP);
          break;
        case 4:
          this.drawScreenWallet(ctx, localP);
          break;
        case 5:
          this.drawScreenSecurity(ctx, localP);
          break;
        case 6:
          this.drawScreenFinale(ctx, localP);
          break;
      }

      ctx.restore();
    }

    this.drawStatusBar(ctx, isDarkFactor);
    this.drawBottomNav(ctx, p, isDarkFactor);

    this.texture.needsUpdate = true;
  }

  private drawStatusBar(ctx: CanvasRenderingContext2D, darkFactor: number) {
    const ink = darkFactor > 0.5 ? '#F9FAFB' : '#191F28';
    ctx.save();
    ctx.fillStyle = ink;
    ctx.font = `700 28px ${FONT_FAMILY}`;
    ctx.textBaseline = 'middle';
    ctx.fillText('9:41', 64, 58);

    drawRoundedRect(ctx, SCREEN_W / 2 - 110, 34, 220, 56, 28);
    ctx.fillStyle = '#07090E';
    ctx.fill();

    ctx.fillStyle = ink;
    for (let i = 0; i < 4; i++) {
      const h = 10 + i * 5;
      drawRoundedRect(ctx, SCREEN_W - 166 + i * 11, 68 - h, 7, h, 2);
      ctx.fill();
    }

    ctx.strokeStyle = darkFactor > 0.5 ? 'rgba(255,255,255,0.45)' : 'rgba(25,31,40,0.35)';
    ctx.lineWidth = 2.5;
    drawRoundedRect(ctx, SCREEN_W - 112, 46, 48, 24, 7);
    ctx.stroke();
    drawRoundedRect(ctx, SCREEN_W - 108, 50, 36, 16, 4);
    ctx.fillStyle = ink;
    ctx.fill();
    ctx.restore();
  }

  private drawBottomNav(ctx: CanvasRenderingContext2D, p: number, darkFactor: number) {
    const navY = SCREEN_H - 138;
    const navW = SCREEN_W - 64;
    const navX = 32;
    const navH = 102;

    const bg = darkFactor > 0.5 ? '#172033' : '#FFFFFF';
    const border = darkFactor > 0.5 ? 'rgba(255, 255, 255, 0.10)' : 'rgba(25, 31, 40, 0.06)';
    drawCard(ctx, navX, navY, navW, navH, 34, bg, true, border);

    const tabs = ['홈', '시세', '환전', '지갑'];
    let activeIdx = 0;
    if (p >= 0.133 && p < 0.280) activeIdx = 1;
    else if (p >= 0.280 && p < 0.573) activeIdx = 2;
    else if (p >= 0.573 && p < 0.866) activeIdx = 3;
    else if (p >= 0.866) activeIdx = 0;

    const tabW = navW / 4;
    for (let i = 0; i < 4; i++) {
      const cx = navX + tabW * i + tabW / 2;
      const isActive = i === activeIdx;
      const color = isActive ? '#3182F6' : '#8B95A1';

      if (isActive) {
        ctx.save();
        drawRoundedRect(ctx, navX + tabW * i + 16, navY + 12, tabW - 32, navH - 24, 24);
        ctx.fillStyle = darkFactor > 0.5 ? 'rgba(49, 130, 246, 0.18)' : '#EBF4FF';
        ctx.fill();
        ctx.restore();
      }

      ctx.save();
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 3.2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      const iy = navY + 38;

      if (i === 0) {
        ctx.beginPath();
        ctx.moveTo(cx - 12, iy + 2);
        ctx.lineTo(cx, iy - 10);
        ctx.lineTo(cx + 12, iy + 2);
        ctx.lineTo(cx + 12, iy + 14);
        ctx.lineTo(cx - 12, iy + 14);
        ctx.closePath();
        ctx.stroke();
      } else if (i === 1) {
        ctx.beginPath();
        ctx.moveTo(cx - 14, iy + 10);
        ctx.lineTo(cx - 4, iy + 1);
        ctx.lineTo(cx + 4, iy + 6);
        ctx.lineTo(cx + 14, iy - 8);
        ctx.stroke();
      } else if (i === 2) {
        ctx.beginPath();
        ctx.arc(cx, iy + 2, 12, 0, Math.PI * 1.6);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + 8, iy - 10);
        ctx.lineTo(cx + 13, iy - 3);
        ctx.lineTo(cx + 5, iy - 2);
        ctx.stroke();
      } else {
        drawRoundedRect(ctx, cx - 14, iy - 8, 28, 20, 5);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx + 6, iy + 2, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.font = `${isActive ? '700' : '600'} 22px ${FONT_FAMILY}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tabs[i], cx, navY + 75);
      ctx.restore();
    }
  }

  private drawScreenHome(ctx: CanvasRenderingContext2D, localP: number, time: number) {
    ctx.save();
    ctx.fillStyle = '#191F28';
    ctx.font = `800 38px ${FONT_FAMILY}`;
    ctx.fillText('내 지갑', 48, 166);

    drawCard(ctx, 40, 216, SCREEN_W - 80, 412, 36, '#FFFFFF');
    ctx.fillStyle = '#6B7684';
    ctx.font = `600 26px ${FONT_FAMILY}`;
    ctx.fillText('총 외화 자산', 80, 278);

    const animatedVal = 48290400 + Math.round(localP * 145000);
    ctx.fillStyle = '#191F28';
    ctx.font = `800 62px ${FONT_FAMILY}`;
    ctx.fillText(`${formatComma(animatedVal)}원`, 80, 356);

    ctx.fillStyle = '#F04452';
    ctx.font = `700 27px ${FONT_FAMILY}`;
    ctx.fillText('+184,200원 (+0.38%)', 80, 408);

    ctx.beginPath();
    const pts = [0.22, 0.35, 0.28, 0.48, 0.42, 0.65, 0.58, 0.78, 0.84, 0.92];
    const gx = 80;
    const gy = 528;
    const gw = SCREEN_W - 160;
    const gh = 72;
    pts.forEach((v, i) => {
      const px = gx + (i / (pts.length - 1)) * gw;
      const py = gy - v * gh + Math.sin(time * 2 + i) * 2;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.strokeStyle = '#3182F6';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    drawRoundedRect(ctx, 80, 550, (SCREEN_W - 180) / 2, 54, 20);
    ctx.fillStyle = '#EBF4FF';
    ctx.fill();
    ctx.fillStyle = '#1B64DA';
    ctx.font = `700 25px ${FONT_FAMILY}`;
    ctx.textAlign = 'center';
    ctx.fillText('환전', 80 + (SCREEN_W - 180) / 4, 586);

    drawRoundedRect(ctx, 100 + (SCREEN_W - 180) / 2, 550, (SCREEN_W - 180) / 2, 54, 20);
    ctx.fillStyle = '#3182F6';
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('채우기', 100 + ((SCREEN_W - 180) * 3) / 4, 586);
    ctx.textAlign = 'left';

    drawCard(ctx, 40, 660, SCREEN_W - 80, 810, 36, '#FFFFFF');
    ctx.fillStyle = '#191F28';
    ctx.font = `700 32px ${FONT_FAMILY}`;
    ctx.fillText('보유 외화', 80, 728);

    const holdings: Array<{ flag: FlagType; name: string; code: string; val: string; krw: string }> = [
      { flag: 'us', name: '미국 달러', code: 'USD', val: '$24,500.00', krw: '33,912,900원' },
      { flag: 'jp', name: '일본 엔', code: 'JPY', val: '¥1,240,000', krw: '11,217,660원' },
      { flag: 'eu', name: '유로', code: 'EUR', val: '€2,116.70', krw: '3,159,840원' },
      { flag: 'gb', name: '영국 파운드', code: 'GBP', val: '£0.00', krw: '1,758.10원' },
    ];

    holdings.forEach((h, i) => {
      const ry = 800 + i * 165;
      drawFlag(ctx, h.flag, 108, ry + 32, 34);

      ctx.fillStyle = '#191F28';
      ctx.font = `700 30px ${FONT_FAMILY}`;
      ctx.fillText(h.name, 166, ry + 24);

      ctx.fillStyle = '#8B95A1';
      ctx.font = `500 23px ${FONT_FAMILY}`;
      ctx.fillText(h.code, 166, ry + 60);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#191F28';
      ctx.font = `700 30px ${FONT_FAMILY}`;
      ctx.fillText(h.val, SCREEN_W - 80, ry + 24);

      ctx.fillStyle = '#6B7684';
      ctx.font = `600 23px ${FONT_FAMILY}`;
      ctx.fillText(h.krw, SCREEN_W - 80, ry + 60);
      ctx.textAlign = 'left';

      if (i < holdings.length - 1) {
        ctx.fillStyle = '#F2F4F6';
        ctx.fillRect(80, ry + 112, SCREEN_W - 160, 2);
      }
    });

    ctx.restore();
  }

  private drawScreenRates(ctx: CanvasRenderingContext2D, localP: number, time: number) {
    ctx.save();
    drawFlag(ctx, 'us', 84, 166, 30);
    ctx.fillStyle = '#191F28';
    ctx.font = `700 32px ${FONT_FAMILY}`;
    ctx.fillText('미국 달러', 130, 176);

    const liveRate = 1384.2 + Math.sin(localP * Math.PI * 2) * 1.45;
    ctx.fillStyle = '#191F28';
    ctx.font = `800 72px ${FONT_FAMILY}`;
    ctx.fillText(`${liveRate.toFixed(2)}원`, 48, 274);

    ctx.fillStyle = '#F04452';
    ctx.font = `700 28px ${FONT_FAMILY}`;
    ctx.fillText('▲ 4.80원 (+0.35%)', 50, 326);

    drawCard(ctx, 40, 366, SCREEN_W - 80, 740, 36, '#FFFFFF');

    const periods = ['1분', '1시간', '1일', '1주', '1달'];
    periods.forEach((label, idx) => {
      const tx = 86 + idx * 124;
      const active = idx === 2;
      if (active) {
        drawRoundedRect(ctx, tx - 14, 404, 84, 48, 18);
        ctx.fillStyle = '#EBF4FF';
        ctx.fill();
      }
      ctx.fillStyle = active ? '#1B64DA' : '#8B95A1';
      ctx.font = `700 24px ${FONT_FAMILY}`;
      ctx.textAlign = 'center';
      ctx.fillText(label, tx + 28, 436);
    });
    ctx.textAlign = 'left';

    ctx.strokeStyle = '#F2F4F6';
    ctx.lineWidth = 2;
    for (let g = 0; g < 4; g++) {
      const gy = 540 + g * 120;
      ctx.beginPath();
      ctx.moveTo(76, gy);
      ctx.lineTo(SCREEN_W - 76, gy);
      ctx.stroke();
    }

    const chartData = [
      0.34, 0.31, 0.38, 0.44, 0.40, 0.49, 0.56, 0.52,
      0.61, 0.58, 0.67, 0.72, 0.65, 0.76, 0.81, 0.79, 0.88,
    ];
    const cx0 = 76;
    const cw = SCREEN_W - 152;
    const cy0 = 960;
    const ch = 410;

    const drawRatio = clamp01((localP - 0.12) / 0.58);
    const maxIndex = Math.max(2, Math.floor((chartData.length - 1) * drawRatio));

    const points = chartData.map((val, i) => ({
      x: cx0 + (i / (chartData.length - 1)) * cw,
      y: cy0 - val * ch,
    }));

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points[0].x, cy0);
    for (let i = 0; i <= maxIndex; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.lineTo(points[maxIndex].x, cy0);
    ctx.closePath();
    ctx.fillStyle = 'rgba(240, 68, 82, 0.06)';
    ctx.fill();
    ctx.restore();

    ctx.beginPath();
    for (let i = 0; i <= maxIndex; i++) {
      if (i === 0) ctx.moveTo(points[i].x, points[i].y);
      else {
        const prev = points[i - 1];
        const curr = points[i];
        const midX = (prev.x + curr.x) / 2;
        ctx.quadraticCurveTo(prev.x, prev.y, midX, (prev.y + curr.y) / 2);
        if (i === maxIndex) ctx.lineTo(curr.x, curr.y);
      }
    }
    ctx.strokeStyle = '#F04452';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.stroke();

    const tip = points[maxIndex];
    const pulseR = 16 + Math.sin(time * 4) * 2;
    ctx.fillStyle = 'rgba(240, 68, 82, 0.18)';
    ctx.beginPath();
    ctx.arc(tip.x, tip.y, pulseR, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#F04452';
    ctx.beginPath();
    ctx.arc(tip.x, tip.y, 9, 0, Math.PI * 2);
    ctx.fill();

    const tipBoxX = Math.min(tip.x - 95, SCREEN_W - 260);
    drawCard(ctx, Math.max(76, tipBoxX), tip.y - 78, 190, 52, 18, '#191F28', false);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `700 24px ${FONT_FAMILY}`;
    ctx.textAlign = 'center';
    ctx.fillText(`${liveRate.toFixed(2)}원`, Math.max(76, tipBoxX) + 95, tip.y - 44);
    ctx.textAlign = 'left';

    drawCard(ctx, 40, 1140, SCREEN_W - 80, 260, 36, '#FFFFFF');
    ctx.fillStyle = '#4E5968';
    ctx.font = `600 25px ${FONT_FAMILY}`;
    ctx.fillText('살 때 · 팔 때', 80, 1200);

    drawRoundedRect(ctx, 76, 1238, (SCREEN_W - 172) / 2, 122, 26);
    ctx.fillStyle = '#FFF5F5';
    ctx.fill();
    ctx.fillStyle = '#F04452';
    ctx.font = `600 24px ${FONT_FAMILY}`;
    ctx.fillText('살 때', 104, 1284);
    ctx.font = `800 36px ${FONT_FAMILY}`;
    ctx.fillText((liveRate + 0.05).toFixed(2), 104, 1332);

    const askX = 96 + (SCREEN_W - 172) / 2;
    drawRoundedRect(ctx, askX, 1238, (SCREEN_W - 172) / 2, 122, 26);
    ctx.fillStyle = '#F2F7FF';
    ctx.fill();
    ctx.fillStyle = '#3182F6';
    ctx.font = `600 24px ${FONT_FAMILY}`;
    ctx.fillText('팔 때', askX + 28, 1284);
    ctx.font = `800 36px ${FONT_FAMILY}`;
    ctx.fillText((liveRate - 0.05).toFixed(2), askX + 28, 1332);

    ctx.restore();
  }

  private drawScreenExchange(ctx: CanvasRenderingContext2D, localP: number) {
    ctx.save();
    ctx.fillStyle = '#191F28';
    ctx.font = `800 44px ${FONT_FAMILY}`;
    ctx.fillText('즉시 환전', 48, 174);

    const amountRatio = easeOutCubic(clamp01((localP - 0.12) / 0.42));
    const krwAmount = lerp(1000000, 10000000, amountRatio);
    const usdAmount = krwAmount / 1384.2;

    drawCard(ctx, 40, 236, SCREEN_W - 80, 250, 36, '#FFFFFF');
    ctx.fillStyle = '#8B95A1';
    ctx.font = `600 25px ${FONT_FAMILY}`;
    ctx.fillText('보내는 금액', 80, 294);

    drawFlag(ctx, 'kr', 110, 380, 34);
    ctx.fillStyle = '#191F28';
    ctx.font = `700 34px ${FONT_FAMILY}`;
    ctx.fillText('원', 164, 386);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#191F28';
    ctx.font = `800 44px ${FONT_FAMILY}`;
    ctx.fillText(`${formatComma(krwAmount)}원`, SCREEN_W - 80, 392);
    ctx.textAlign = 'left';

    drawCard(ctx, 40, 514, SCREEN_W - 80, 250, 36, '#FFFFFF');
    ctx.fillStyle = '#8B95A1';
    ctx.font = `600 25px ${FONT_FAMILY}`;
    ctx.fillText('받는 금액', 80, 572);

    drawFlag(ctx, 'us', 110, 658, 34);
    ctx.fillStyle = '#191F28';
    ctx.font = `700 34px ${FONT_FAMILY}`;
    ctx.fillText('달러', 164, 664);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#3182F6';
    ctx.font = `800 46px ${FONT_FAMILY}`;
    ctx.fillText(`$${usdAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, SCREEN_W - 80, 670);
    ctx.textAlign = 'left';

    ctx.save();
    ctx.translate(SCREEN_W / 2, 500);
    drawCard(ctx, -40, -40, 80, 80, 40, '#FFFFFF', true, '#E5E8EB');
    ctx.strokeStyle = '#3182F6';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, -14);
    ctx.lineTo(0, 14);
    ctx.moveTo(-10, 4);
    ctx.lineTo(0, 14);
    ctx.lineTo(10, 4);
    ctx.stroke();
    ctx.restore();

    drawCard(ctx, 40, 796, SCREEN_W - 80, 148, 34, '#FFFFFF');
    ctx.fillStyle = '#6B7684';
    ctx.font = `600 26px ${FONT_FAMILY}`;
    ctx.fillText('환전 수수료', 80, 854);
    ctx.fillText('입금 속도', 80, 906);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#00C471';
    ctx.font = `800 28px ${FONT_FAMILY}`;
    ctx.fillText('0원', SCREEN_W - 80, 854);
    ctx.fillStyle = '#191F28';
    ctx.font = `700 27px ${FONT_FAMILY}`;
    ctx.fillText('0.3초', SCREEN_W - 80, 906);
    ctx.textAlign = 'left';

    const doneT = easeOutCubic((localP - 0.50) / 0.20);

    if (doneT < 0.99) {
      ctx.save();
      ctx.globalAlpha = 1 - doneT;
      drawRoundedRect(ctx, 40, 984, SCREEN_W - 80, 104, 30);
      ctx.fillStyle = '#3182F6';
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `700 32px ${FONT_FAMILY}`;
      ctx.textAlign = 'center';
      ctx.fillText('바로 환전하기', SCREEN_W / 2, 1046);
      ctx.restore();
    }

    if (doneT > 0.01) {
      ctx.save();
      ctx.globalAlpha = doneT;
      const slideY = (1 - doneT) * 32;
      ctx.translate(0, slideY);
      drawCard(ctx, 40, 984, SCREEN_W - 80, 340, 36, '#EBF4FF', false, '#B8D8FF');

      ctx.fillStyle = '#00C471';
      ctx.beginPath();
      ctx.arc(SCREEN_W / 2, 1088, 44, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(SCREEN_W / 2 - 18, 1088);
      ctx.lineTo(SCREEN_W / 2 - 4, 1104);
      ctx.lineTo(SCREEN_W / 2 + 20, 1072);
      ctx.stroke();

      ctx.fillStyle = '#191F28';
      ctx.font = `800 36px ${FONT_FAMILY}`;
      ctx.textAlign = 'center';
      ctx.fillText('환전을 마쳤어요', SCREEN_W / 2, 1188);
      ctx.fillStyle = '#4E5968';
      ctx.font = `600 28px ${FONT_FAMILY}`;
      ctx.fillText('$7,224.38 입금 완료', SCREEN_W / 2, 1244);
      ctx.textAlign = 'left';
      ctx.restore();
    }

    ctx.restore();
  }

  private drawScreenAutoOrder(ctx: CanvasRenderingContext2D, localP: number) {
    ctx.save();
    ctx.fillStyle = '#191F28';
    ctx.font = `800 44px ${FONT_FAMILY}`;
    ctx.fillText('자동 주문', 48, 174);

    const targetProgress = easeInOutCubic(clamp01((localP - 0.12) / 0.58));
    const targetRate = lerp(1390.0, 1372.0, targetProgress);

    // 그래프 곡선·현재 점·목표선이 같은 Y 스케일 쓰도록 묶음
    drawCard(ctx, 40, 224, SCREEN_W - 80, 790, 36, '#FFFFFF');

    ctx.fillStyle = '#6B7684';
    ctx.font = `600 24px ${FONT_FAMILY}`;
    ctx.fillText('목표 환율', 80, 286);

    ctx.fillStyle = '#191F28';
    ctx.font = `800 54px ${FONT_FAMILY}`;
    ctx.fillText(`${targetRate.toFixed(2)}원`, 80, 350);

    const diff = targetRate - 1384.2;
    ctx.fillStyle = Math.abs(diff) < 0.05 ? '#3182F6' : diff < 0 ? '#3182F6' : '#F04452';
    ctx.font = `700 24px ${FONT_FAMILY}`;
    const diffText =
      Math.abs(diff) < 0.05
        ? '현재 시세와 동일해요'
        : diff < 0
          ? `현재보다 ${Math.abs(diff).toFixed(2)}원 낮아요`
          : `현재보다 ${diff.toFixed(2)}원 높아요`;
    ctx.fillText(diffText, 80, 396);

    const chartLeft = 80;
    const chartRight = SCREEN_W - 80;
    const chartTop = 455;
    const chartBottom = 945;
    const minRate = 1365;
    const maxRate = 1395;

    const rateToY = (r: number) =>
      chartBottom - ((r - minRate) / (maxRate - minRate)) * (chartBottom - chartTop);

    const gridRates = [1390, 1384.2, 1375, 1368];
    gridRates.forEach((gr) => {
      const gy = rateToY(gr);
      ctx.strokeStyle = '#F2F4F6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(chartLeft, gy);
      ctx.lineTo(chartRight, gy);
      ctx.stroke();
    });

    const histRates = [1388.5, 1390.8, 1387.2, 1389.4, 1386.8, 1383.5, 1385.4, 1384.2];
    const nowX = chartLeft + (chartRight - chartLeft) * 0.6;
    const nowY = rateToY(1384.2);

    ctx.beginPath();
    histRates.forEach((r, i) => {
      const px = chartLeft + (i / (histRates.length - 1)) * (nowX - chartLeft);
      const py = rateToY(r);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.arc(nowX, nowY, 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#64748B';
    ctx.font = `700 22px ${FONT_FAMILY}`;
    ctx.fillText('현재 1,384.20', nowX - 150, nowY - 22);

    const targetY = rateToY(targetRate);
    const triggerX = chartRight - 36;

    ctx.save();
    ctx.strokeStyle = 'rgba(49, 130, 246, 0.25)';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(chartLeft, targetY);
    ctx.lineTo(chartRight, targetY);
    ctx.stroke();

    ctx.setLineDash([10, 10]);
    ctx.strokeStyle = '#3182F6';
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(nowX, nowY);
    ctx.bezierCurveTo(
      lerp(nowX, triggerX, 0.45),
      nowY,
      lerp(nowX, triggerX, 0.55),
      targetY,
      triggerX,
      targetY,
    );
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(triggerX, targetY, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#3182F6';
    ctx.lineWidth = 6;
    ctx.stroke();

    drawCard(ctx, 40, 1054, SCREEN_W - 80, 200, 36, '#FFFFFF');
    drawFlag(ctx, 'us', 112, 1154, 34);
    ctx.fillStyle = '#191F28';
    ctx.font = `800 32px ${FONT_FAMILY}`;
    ctx.fillText(`${targetRate.toFixed(2)}원 도달 시 매수`, 170, 1140);
    ctx.fillStyle = '#3182F6';
    ctx.font = `600 25px ${FONT_FAMILY}`;
    ctx.fillText('$3,000 자동 주문 · 수수료 0원', 170, 1188);

    ctx.restore();
  }

  private drawScreenWallet(ctx: CanvasRenderingContext2D, localP: number) {
    ctx.save();
    ctx.fillStyle = '#191F28';
    ctx.font = `800 44px ${FONT_FAMILY}`;
    ctx.fillText('외화 지갑', 48, 174);

    const cards: Array<{ flag: FlagType; code: string; name: string; amount: string; krw: string; tint: string }> = [
      { flag: 'us', code: 'USD', name: '미국 달러', amount: '$24,500.00', krw: '33,912,900원', tint: '#EBF4FF' },
      { flag: 'jp', code: 'JPY', name: '일본 엔', amount: '¥1,240,000', krw: '11,217,660원', tint: '#FFF2F3' },
      { flag: 'eu', code: 'EUR', name: '유로', amount: '€4,820.50', krw: '7,196,042원', tint: '#F0F5FF' },
      { flag: 'gb', code: 'GBP', name: '영국 파운드', amount: '£1,920.00', krw: '3,375,552원', tint: '#F4F3FF' },
      { flag: 'ch', code: 'CHF', name: '스위스 프랑', amount: 'Fr 2,400.00', krw: '3,764,160원', tint: '#FFF4F4' },
      { flag: 'ca', code: 'CAD', name: '캐나다 달러', amount: 'C$3,100.00', krw: '3,073,650원', tint: '#F0FDF7' },
    ];

    const scrollOffset = easeInOutCubic(clamp01((localP - 0.12) / 0.62)) * 260;

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 210, SCREEN_W, 1300);
    ctx.clip();

    cards.forEach((c, i) => {
      const cy = 236 + i * 218 - scrollOffset;
      drawCard(ctx, 40, cy, SCREEN_W - 80, 190, 34, '#FFFFFF');

      drawRoundedRect(ctx, 64, cy + 32, 88, 88, 26);
      ctx.fillStyle = c.tint;
      ctx.fill();
      drawFlag(ctx, c.flag, 108, cy + 76, 30);

      ctx.fillStyle = '#191F28';
      ctx.font = `800 32px ${FONT_FAMILY}`;
      ctx.fillText(c.name, 174, cy + 70);

      ctx.fillStyle = '#8B95A1';
      ctx.font = `600 24px ${FONT_FAMILY}`;
      ctx.fillText(c.code, 174, cy + 108);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#191F28';
      ctx.font = `800 35px ${FONT_FAMILY}`;
      ctx.fillText(c.amount, SCREEN_W - 76, cy + 70);

      ctx.fillStyle = '#6B7684';
      ctx.font = `600 24px ${FONT_FAMILY}`;
      ctx.fillText(c.krw, SCREEN_W - 76, cy + 108);
      ctx.textAlign = 'left';

      ctx.fillStyle = '#F2F4F6';
      ctx.fillRect(68, cy + 144, SCREEN_W - 136, 7);
      ctx.fillStyle = '#3182F6';
      ctx.fillRect(68, cy + 144, (SCREEN_W - 136) * Math.max(0.18, 0.85 - i * 0.12), 7);
    });

    ctx.restore();
    ctx.restore();
  }

  private drawScreenSecurity(ctx: CanvasRenderingContext2D, localP: number) {
    ctx.save();
    ctx.fillStyle = '#F9FAFB';
    ctx.font = `800 44px ${FONT_FAMILY}`;
    ctx.fillText('24시간 안심 거래', 48, 174);

    drawCard(ctx, 40, 236, SCREEN_W - 80, 400, 36, '#172033', false, 'rgba(255,255,255,0.08)');

    const ringProgress = easeOutCubic(clamp01((localP - 0.04) / 0.24));
    const checkProgress = easeOutCubic(clamp01((localP - 0.29) / 0.18));
    const cx = SCREEN_W / 2;
    const cy = 390;
    const rad = 82;

    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.arc(cx, cy, rad, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#00C471';
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(cx, cy, rad, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ringProgress);
    ctx.stroke();

    if (checkProgress > 0.005) {
      const p0x = cx - 22;
      const p0y = cy + 4;
      const p1x = cx - 4;
      const p1y = cy + 22;
      const p2x = cx + 26;
      const p2y = cy - 16;

      ctx.strokeStyle = '#00C471';
      ctx.lineWidth = 9;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(p0x, p0y);

      if (checkProgress <= 0.36) {
        const leg1 = checkProgress / 0.36;
        ctx.lineTo(lerp(p0x, p1x, leg1), lerp(p0y, p1y, leg1));
      } else {
        const leg2 = (checkProgress - 0.36) / 0.64;
        ctx.lineTo(p1x, p1y);
        ctx.lineTo(lerp(p1x, p2x, leg2), lerp(p1y, p2y, leg2));
      }
      ctx.stroke();
    }

    ctx.textAlign = 'center';
    ctx.fillStyle = '#F9FAFB';
    ctx.font = `800 32px ${FONT_FAMILY}`;
    ctx.fillText('예치금 100% 분리 보관', cx, 548);
    ctx.textAlign = 'left';

    drawCard(ctx, 40, 676, SCREEN_W - 80, 680, 36, '#172033', false, 'rgba(255,255,255,0.08)');
    ctx.fillStyle = '#F9FAFB';
    ctx.font = `700 30px ${FONT_FAMILY}`;
    ctx.fillText('실시간 시장 연결', 80, 744);

    const sessions = [
      { city: '뉴욕', pair: 'USD/KRW 1,384.20', time: '0.11초' },
      { city: '런던', pair: 'EUR/KRW 1,492.80', time: '0.13초' },
      { city: '도쿄', pair: 'JPY/KRW 904.65', time: '0.09초' },
      { city: '취리히', pair: 'CHF/KRW 1,568.40', time: '0.14초' },
    ];

    sessions.forEach((s, i) => {
      const sy = 810 + i * 134;

      ctx.fillStyle = '#F9FAFB';
      ctx.font = `700 28px ${FONT_FAMILY}`;
      ctx.fillText(s.city, 80, sy + 36);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#E2E8F0';
      ctx.font = `700 26px ${FONT_FAMILY}`;
      ctx.fillText(s.pair, SCREEN_W - 80, sy + 28);

      ctx.fillStyle = '#60A5FA';
      ctx.font = `600 22px ${FONT_FAMILY}`;
      ctx.fillText(s.time, SCREEN_W - 80, sy + 64);
      ctx.textAlign = 'left';

      if (i < sessions.length - 1) {
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.fillRect(80, sy + 98, SCREEN_W - 160, 2);
      }
    });

    ctx.restore();
  }

  private drawScreenFinale(ctx: CanvasRenderingContext2D, localP: number) {
    ctx.save();
    const logoY = 600;
    const scaleIn = 0.94 + easeOutCubic(localP) * 0.06;
    ctx.save();
    ctx.translate(SCREEN_W / 2, logoY);
    ctx.scale(scaleIn, scaleIn);
    drawCard(ctx, -96, -96, 192, 192, 56, '#3182F6', true);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-48, 6);
    ctx.bezierCurveTo(-24, -28, 0, -28, 0, 0);
    ctx.bezierCurveTo(0, 28, 24, 28, 48, -6);
    ctx.stroke();
    ctx.restore();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#191F28';
    ctx.font = `800 52px ${FONT_FAMILY}`;
    ctx.fillText('환전이 쉬워지는', SCREEN_W / 2, 820);
    ctx.fillText('새로운 방법, 파도예요', SCREEN_W / 2, 890);

    ctx.fillStyle = '#6B7684';
    ctx.font = `500 27px ${FONT_FAMILY}`;
    ctx.fillText('수수료 없이 시작해 보세요', SCREEN_W / 2, 964);

    ctx.restore();
  }

  public dispose() {
    this.texture.dispose();
  }
}
