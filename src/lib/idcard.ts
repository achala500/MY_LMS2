/**
 * StudySync — StudySync Platform ID Card Canvas 2D Renderer & 3x PNG Exporter
 * Renders luxury metallic dark gradient ID cards (1440x906px at 3x scale / 300DPI)
 * with gold EMV chip, Inter typography, status pill, and scannable QR code.
 */

import { formatDate } from './utils';
import { renderQrToCanvas } from './qr';
import QRCode from 'qrcode';

export const CARD_WIDTH_BASE = 480;

export const CARD_HEIGHT_BASE = 302;
export const EXPORT_SCALE_3X = 3;
export const EXPORT_WIDTH_3X = 1440;
export const EXPORT_HEIGHT_3X = 906;

export interface MemberIdCardData {
  studyId?: string;
  fullName?: string;
  name?: string;
  school?: string;
  stream?: string;
  optionalSubject?: string;
  registrationDate?: string;
  status?: string;
  examYear?: string;
}

export class IdCardRenderer {
  public baseWidth = CARD_WIDTH_BASE;
  public baseHeight = CARD_HEIGHT_BASE;

  public async renderToCanvas(
    member: MemberIdCardData,
    canvas: HTMLCanvasElement,
    scaleFactor: number = 1
  ): Promise<void> {
    if (!canvas || typeof canvas.getContext !== 'function') {
      throw new Error('[IdCard] Valid canvas element required');
    }

    if (!member || !member.studyId) {
      throw new Error('[IdCard] Valid member data with studyId required');
    }

    const scale = Math.max(1, scaleFactor);
    const W = this.baseWidth * scale;
    const H = this.baseHeight * scale;

    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // 1. Draw rounded card clipping path
    const cornerRadius = 24 * scale;
    this._drawRoundedRectPath(ctx, 0, 0, W, H, cornerRadius);
    ctx.save();
    ctx.clip();

    // 2. Draw metallic luxury dark background gradient
    this._drawMetallicBackground(ctx, W, H, scale, member.stream);

    // 3. Draw security hologram watermark & fine grid overlay
    this._drawSecurityPattern(ctx, W, H, scale);

    // 4. Draw card header & StudySync brand
    this._drawCardHeader(ctx, W, H, scale);

    // 5. Draw Active Status Badge Pill (Top-Right)
    this._drawStatusPill(ctx, W, H, scale, member.status || 'Active');

    // 6. Draw Gold EMV Smart Chip & Contactless NFC icon
    this._drawEmvChip(ctx, 32 * scale, 76 * scale, scale);

    // 7. Draw Member Information (Name, Study ID, School, Stream, Date)
    this._drawMemberDetails(ctx, W, H, scale, member);

    // 8. Draw Scannable QR Code
    await this._drawEmbeddedQrCode(ctx, W, H, scale, member);

    // 9. Draw Bottom Microtext Security Ribbon
    this._drawSecurityRibbon(ctx, W, H, scale);

    ctx.restore();

    // 10. Draw outer card border & gloss bevel
    this._drawCardBorder(ctx, W, H, cornerRadius, scale);
  }

  public async exportToBlob(
    member: MemberIdCardData,
    scaleFactor: number = EXPORT_SCALE_3X
  ): Promise<Blob> {
    if (typeof document === 'undefined') {
      throw new Error('[IdCard] DOM document required for blob export');
    }

    const canvas = document.createElement('canvas');
    await this.renderToCanvas(member, canvas, scaleFactor);

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(
              new Error('[IdCard] Failed to create image blob from canvas')
            );
          }
        },
        'image/png',
        1.0
      );
    });
  }

  public async exportToDataUrl(
    member: MemberIdCardData,
    scaleFactor: number = EXPORT_SCALE_3X
  ): Promise<string> {
    if (typeof document === 'undefined') return '';
    const canvas = document.createElement('canvas');
    await this.renderToCanvas(member, canvas, scaleFactor);
    return canvas.toDataURL('image/png', 1.0);
  }

  public async downloadPass(
    member: MemberIdCardData,
    scaleFactor: number = EXPORT_SCALE_3X,
    customFileName?: string
  ): Promise<void> {
    if (typeof document === 'undefined') return;

    const blob = await this.exportToBlob(member, scaleFactor);
    const safeId = (member.studyId || 'STUDY-ID').replace(
      /[^a-zA-Z0-9_-]/g,
      ''
    );
    const fileName = customFileName || `StudySync_Digital_ID_${safeId}.png`;

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  private _drawRoundedRectPath(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(
      x + width,
      y + height,
      x + width - radius,
      y + height
    );
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  private _drawMetallicBackground(
    ctx: CanvasRenderingContext2D,
    W: number,
    H: number,
    scale: number,
    stream: string = ''
  ) {
    const isBio = String(stream).toLowerCase().includes('bio');

    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    if (isBio) {
      bgGrad.addColorStop(0.0, '#060B11');
      bgGrad.addColorStop(0.25, '#0B192C');
      bgGrad.addColorStop(0.5, '#062024');
      bgGrad.addColorStop(0.75, '#0B192C');
      bgGrad.addColorStop(1.0, '#050B10');
    } else {
      bgGrad.addColorStop(0.0, '#07090E');
      bgGrad.addColorStop(0.25, '#0F172A');
      bgGrad.addColorStop(0.5, '#1E1B4B');
      bgGrad.addColorStop(0.75, '#111827');
      bgGrad.addColorStop(1.0, '#07090E');
    }

    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    const sweep = ctx.createRadialGradient(
      W * 0.2,
      H * 0.1,
      0,
      W * 0.2,
      H * 0.1,
      W * 0.7
    );
    if (isBio) {
      sweep.addColorStop(0, 'rgba(16, 185, 129, 0.22)');
      sweep.addColorStop(0.5, 'rgba(6, 182, 212, 0.08)');
      sweep.addColorStop(1, 'rgba(0, 0, 0, 0)');
    } else {
      sweep.addColorStop(0, 'rgba(99, 102, 241, 0.25)');
      sweep.addColorStop(0.5, 'rgba(217, 70, 239, 0.09)');
      sweep.addColorStop(1, 'rgba(0, 0, 0, 0)');
    }
    ctx.fillStyle = sweep;
    ctx.fillRect(0, 0, W, H);

    const bottomGlow = ctx.createRadialGradient(
      W * 0.85,
      H * 0.85,
      0,
      W * 0.85,
      H * 0.85,
      W * 0.5
    );
    bottomGlow.addColorStop(0, 'rgba(56, 189, 248, 0.12)');
    bottomGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = bottomGlow;
    ctx.fillRect(0, 0, W, H);
  }

  private _drawSecurityPattern(
    ctx: CanvasRenderingContext2D,
    W: number,
    H: number,
    scale: number
  ) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1 * scale;

    const step = 20 * scale;
    for (let x = -H; x < W + H; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + H, H);
      ctx.stroke();
    }

    ctx.font = `600 ${8 * scale}px "JetBrains Mono", monospace`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.textAlign = 'center';
    ctx.fillText(
      'STUDYSYNC OFFICIAL SECURE VERIFICATION ID',
      W * 0.5,
      H * 0.52
    );

    ctx.restore();
  }

  private _drawCardHeader(
    ctx: CanvasRenderingContext2D,
    W: number,
    H: number,
    scale: number
  ) {
    const x = 32 * scale;
    const y = 28 * scale;

    ctx.save();

    const iconSize = 28 * scale;
    const iconRadius = 7 * scale;
    // Authentic StudySync Monogram Mark
    this._drawRoundedRectPath(ctx, x, y, iconSize, iconSize, iconRadius);
    ctx.fillStyle = '#121418';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1 * scale;
    ctx.stroke();

    // Archival watermark circle
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 0.5 * scale;
    ctx.beginPath();
    ctx.arc(x + iconSize * 0.5, y + iconSize * 0.5, iconSize * 0.35, 0, Math.PI * 2);
    ctx.stroke();

    // Terracotta seal dot
    ctx.fillStyle = '#C24942';
    ctx.beginPath();
    ctx.arc(x + iconSize * 0.68, y + iconSize * 0.35, iconSize * 0.08, 0, Math.PI * 2);
    ctx.fill();

    // Stylized Serif 'S' glyph
    ctx.font = `700 ${14 * scale}px "Newsreader", "Playfair Display", "Times New Roman", serif`;
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('S', x + iconSize * 0.48, y + iconSize * 0.54);

    // Horizon line
    ctx.strokeStyle = '#C24942';
    ctx.lineWidth = 1.5 * scale;
    ctx.beginPath();
    ctx.moveTo(x + iconSize * 0.25, y + iconSize * 0.82);
    ctx.lineTo(x + iconSize * 0.75, y + iconSize * 0.82);
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `700 ${15 * scale}px "SF Pro Display", "Product Sans", -apple-system, sans-serif`;
    ctx.fillText('StudySync', x + iconSize + 10 * scale, y + 15 * scale);

    ctx.fillStyle = '#94A3B8';
    ctx.font = `500 ${8.5 * scale}px "SF Pro Text", "Product Sans", -apple-system, sans-serif`;
    ctx.fillText(
      'SRI LANKA G.C.E. A/L ID CARD',
      x + iconSize + 10 * scale,
      y + 25 * scale
    );

    ctx.restore();
  }

  private _drawStatusPill(
    ctx: CanvasRenderingContext2D,
    W: number,
    H: number,
    scale: number,
    status: string = 'Active'
  ) {
    const pillW = 88 * scale;
    const pillH = 22 * scale;
    const x = W - 32 * scale - pillW;
    const y = 30 * scale;
    const radius = pillH / 2;

    ctx.save();

    this._drawRoundedRectPath(ctx, x, y, pillW, pillH, radius);
    ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.35)';
    ctx.lineWidth = 1 * scale;
    ctx.stroke();

    const dotX = x + 12 * scale;
    const dotY = y + pillH / 2;
    ctx.beginPath();
    ctx.arc(dotX, dotY, 3.5 * scale, 0, Math.PI * 2);
    ctx.fillStyle = '#10B981';
    ctx.shadowColor = '#10B981';
    ctx.shadowBlur = 6 * scale;
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#6EE7B7';
    ctx.font = `700 ${9 * scale}px "SF Pro Text", "Product Sans", -apple-system, sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText(status.toUpperCase(), dotX + 8 * scale, y + 14 * scale);

    ctx.restore();
  }

  private _drawEmvChip(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    scale: number
  ) {
    const chipW = 38 * scale;
    const chipH = 28 * scale;
    const chipRadius = 5 * scale;

    ctx.save();

    this._drawRoundedRectPath(ctx, x, y, chipW, chipH, chipRadius);
    const chipGrad = ctx.createLinearGradient(x, y, x + chipW, y + chipH);
    chipGrad.addColorStop(0, '#FDE68A');
    chipGrad.addColorStop(0.3, '#F59E0B');
    chipGrad.addColorStop(0.7, '#D97706');
    chipGrad.addColorStop(1, '#92400E');
    ctx.fillStyle = chipGrad;
    ctx.fill();
    ctx.strokeStyle = '#B45309';
    ctx.lineWidth = 0.8 * scale;
    ctx.stroke();

    ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.lineWidth = 0.8 * scale;

    ctx.beginPath();
    ctx.moveTo(x, y + chipH * 0.5);
    ctx.lineTo(x + chipW, y + chipH * 0.5);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x + chipW * 0.4, y);
    ctx.lineTo(x + chipW * 0.4, y + chipH);
    ctx.stroke();

    ctx.strokeRect(
      x + chipW * 0.3,
      y + chipH * 0.25,
      chipW * 0.4,
      chipH * 0.5
    );

    const nfcX = x + chipW + 12 * scale;
    const nfcY = y + chipH * 0.5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.2 * scale;
    for (let r = 1; r <= 3; r++) {
      ctx.beginPath();
      ctx.arc(
        nfcX,
        nfcY,
        (4 + r * 3.5) * scale,
        -Math.PI * 0.35,
        Math.PI * 0.35
      );
      ctx.stroke();
    }

    ctx.restore();
  }

  private _drawMemberDetails(
    ctx: CanvasRenderingContext2D,
    W: number,
    H: number,
    scale: number,
    member: MemberIdCardData
  ) {
    const leftX = 32 * scale;
    const fullName = member.fullName || member.name || 'Member Name';
    const studyId = member.studyId || 'SG-BIO-0001';
    const school = member.school || 'Sri Lanka School';
    const stream = member.stream || 'Biological Science';
    const optSubject = member.optionalSubject
      ? ` (${member.optionalSubject})`
      : '';
    const regDate = formatDate(member.registrationDate || new Date(), 'short');

    ctx.save();
    ctx.textAlign = 'left';

    ctx.fillStyle = '#FFFFFF';
    ctx.font = `700 ${18 * scale}px "SF Pro Display", "Product Sans", -apple-system, sans-serif`;

    let nameDisplay = fullName;
    const maxNameW = W * 0.55;
    while (
      ctx.measureText(nameDisplay).width > maxNameW &&
      nameDisplay.length > 5
    ) {
      nameDisplay = nameDisplay.substring(0, nameDisplay.length - 2) + '…';
    }
    ctx.fillText(nameDisplay, leftX, 134 * scale);

    ctx.font = `700 ${14 * scale}px "JetBrains Mono", SFMono-Regular, monospace`;
    const isBio = studyId.includes('BIO');
    ctx.fillStyle = isBio ? '#06B6D4' : '#818CF8';
    ctx.shadowColor = isBio
      ? 'rgba(6, 182, 212, 0.5)'
      : 'rgba(129, 140, 248, 0.5)';
    ctx.shadowBlur = 6 * scale;
    ctx.fillText(studyId, leftX, 158 * scale);
    ctx.shadowBlur = 0;

    ctx.font = `600 ${10.5 * scale}px "SF Pro Text", "Product Sans", -apple-system, sans-serif`;
    ctx.fillStyle = '#C7D2FE';
    ctx.fillText(`${stream}${optSubject}`, leftX, 184 * scale);

    ctx.font = `500 ${10 * scale}px "SF Pro Text", "Product Sans", -apple-system, sans-serif`;
    ctx.fillStyle = '#94A3B8';
    let schoolDisplay = school;
    while (
      ctx.measureText(schoolDisplay).width > maxNameW &&
      schoolDisplay.length > 5
    ) {
      schoolDisplay =
        schoolDisplay.substring(0, schoolDisplay.length - 2) + '…';
    }
    ctx.fillText(schoolDisplay, leftX, 204 * scale);

    ctx.font = `500 ${8.5 * scale}px "JetBrains Mono", SFMono-Regular, monospace`;
    ctx.fillStyle = '#64748B';
    const examYearDisplay = member.examYear ? ` • A/L ${member.examYear}` : ' • A/L 2026';
    ctx.fillText(`ISSUED: ${regDate.toUpperCase()}${examYearDisplay}`, leftX, 226 * scale);

    ctx.restore();
  }

  private async _drawEmbeddedQrCode(
    ctx: CanvasRenderingContext2D,
    W: number,
    H: number,
    scale: number,
    member: MemberIdCardData
  ) {
    const qrBoxSize = 104 * scale;
    const qrX = W - 28 * scale - qrBoxSize;
    const qrY = 74 * scale;
    const radius = 10 * scale;

    ctx.save();

    this._drawRoundedRectPath(ctx, qrX, qrY, qrBoxSize, qrBoxSize, radius);
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 10 * scale;
    ctx.shadowOffsetY = 3 * scale;
    ctx.fill();
    ctx.shadowBlur = 0;

    const studyId = encodeURIComponent(member.studyId || 'SG-BIO-0001');
    const verifyUrl = `https://studysync-al-2026.web.app/verify.html?id=${studyId}`;

    try {
      const qrPadding = 6 * scale;
      const innerSize = Math.round(qrBoxSize - qrPadding * 2);

      const qrCanvas = document.createElement('canvas');
      qrCanvas.width = innerSize;
      qrCanvas.height = innerSize;

      await QRCode.toCanvas(qrCanvas, verifyUrl, {
        width: innerSize,
        margin: 1,
        errorCorrectionLevel: 'M',
        color: { dark: '#000000', light: '#FFFFFF' },
      });

      const prevSmoothing = ctx.imageSmoothingEnabled;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(
        qrCanvas,
        qrX + qrPadding,
        qrY + qrPadding,
        innerSize,
        innerSize
      );
      ctx.imageSmoothingEnabled = prevSmoothing;
    } catch (err) {
      console.warn('[IdCard] QR generation fallback triggered:', err);
      try {
        const qrPadding = 6 * scale;
        const innerSize = Math.round(qrBoxSize - qrPadding * 2);
        const qrCanvas = document.createElement('canvas');
        renderQrToCanvas(verifyUrl, qrCanvas, {
          margin: 1,
          moduleSize: Math.max(1, Math.floor(innerSize / 33)),
          darkColor: '#000000',
          lightColor: '#FFFFFF',
        });
        ctx.drawImage(
          qrCanvas,
          qrX + qrPadding,
          qrY + qrPadding,
          innerSize,
          innerSize
        );
      } catch (_) {}
    }

    ctx.fillStyle = '#94A3B8';
    ctx.font = `600 ${7.5 * scale}px "SF Pro Text", "Product Sans", -apple-system, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(
      'SCAN TO VERIFY',
      qrX + qrBoxSize / 2,
      qrY + qrBoxSize + 13 * scale
    );

    ctx.restore();
  }

  private _drawSecurityRibbon(
    ctx: CanvasRenderingContext2D,
    W: number,
    H: number,
    scale: number
  ) {
    const ribbonH = 24 * scale;
    const y = H - ribbonH;

    ctx.save();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(0, y, W, ribbonH);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1 * scale;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();

    ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
    ctx.font = `500 ${7 * scale}px "JetBrains Mono", monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(
      'OFFICIAL SRI LANKA G.C.E. ADVANCED LEVEL VERIFIED IDENTITY • REPRODUCTION PROHIBITED',
      W * 0.5,
      y + 15 * scale
    );

    ctx.restore();
  }

  private _drawCardBorder(
    ctx: CanvasRenderingContext2D,
    W: number,
    H: number,
    radius: number,
    scale: number
  ) {
    ctx.save();
    this._drawRoundedRectPath(
      ctx,
      0.5 * scale,
      0.5 * scale,
      W - 1 * scale,
      H - 1 * scale,
      radius
    );

    const strokeGrad = ctx.createLinearGradient(0, 0, W, H);
    strokeGrad.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
    strokeGrad.addColorStop(0.3, 'rgba(99, 102, 241, 0.25)');
    strokeGrad.addColorStop(0.7, 'rgba(255, 255, 255, 0.08)');
    strokeGrad.addColorStop(1, 'rgba(255, 255, 255, 0.2)');

    ctx.strokeStyle = strokeGrad;
    ctx.lineWidth = 1.5 * scale;
    ctx.stroke();
    ctx.restore();
  }
}

export const IdCard = new IdCardRenderer();
export default IdCard;
