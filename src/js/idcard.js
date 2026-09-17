/**
 * StudySync — StudySync Platform ID Card Canvas 2D Renderer & 3x PNG Exporter
 * Renders luxury metallic dark gradient ID cards (1440x906px at 3x scale / 300DPI)
 * with gold EMV chip, Inter typography, status pill, and scannable QR code.
 */

import { formatDate } from './utils.js';


// Base card design dimensions (Aspect ratio ~ 1.589)
export const CARD_WIDTH_BASE = 480;
export const CARD_HEIGHT_BASE = 302;
export const EXPORT_SCALE_3X = 3;
export const EXPORT_WIDTH_3X = 1440;
export const EXPORT_HEIGHT_3X = 906;

class IdCardRenderer {
  constructor() {
    this.baseWidth = CARD_WIDTH_BASE;
    this.baseHeight = CARD_HEIGHT_BASE;
  }

  /**
   * Render Digital ID pass onto a target HTML5 Canvas
   * @param {Object} member - Member profile object
   * @param {HTMLCanvasElement} canvas - Target Canvas DOM element
   * @param {number} [scaleFactor=1] - 1 for interactive UI preview (480x302), 3 for high-res export (1440x906)
   * @param {Object} [options={}] - Custom options
   */
  renderToCanvas(member, canvas, scaleFactor = 1, options = {}) {
    if (!canvas || typeof canvas.getContext !== 'function') {
      throw new Error('[IdCard] Valid canvas element required');
    }

    if (!member || !member.studyId) {
      throw new Error('[IdCard] Valid member data with studyId required');
    }

    return this._renderInternal(member, canvas, scaleFactor, options);
  }

  async _renderInternal(member, canvas, scaleFactor = 1, options = {}) {
    const scale = Math.max(1, scaleFactor);
    const W = this.baseWidth * scale;
    const H = this.baseHeight * scale;

    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
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

    // 8. Draw Scannable QR Code (async — uses reliable qrcode library)
    await this._drawEmbeddedQrCode(ctx, W, H, scale, member);

    // 9. Draw Bottom Microtext Security Ribbon
    this._drawSecurityRibbon(ctx, W, H, scale);

    ctx.restore();

    // 10. Draw outer card border & gloss bevel
    this._drawCardBorder(ctx, W, H, cornerRadius, scale);
  }



  /**
   * Export Digital ID card to high-resolution PNG Blob (1440x906px at 3x scale)
   * @param {Object} member 
   * @param {number} [scaleFactor=3] 
   * @returns {Promise<Blob>}
   */
  async exportToBlob(member, scaleFactor = EXPORT_SCALE_3X) {
    if (typeof document === 'undefined') {
      throw new Error('[IdCard] DOM document required for blob export');
    }

    const canvas = document.createElement('canvas');
    this.renderToCanvas(member, canvas, scaleFactor);

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('[IdCard] Failed to create image blob from canvas'));
        }
      }, 'image/png', 1.0);
    });
  }

  /**
   * Export Digital ID card to Base64 PNG Data URL
   * @param {Object} member 
   * @param {number} [scaleFactor=3] 
   * @returns {Promise<string>}
   */
  async exportToDataUrl(member, scaleFactor = EXPORT_SCALE_3X) {
    if (typeof document === 'undefined') return '';
    const canvas = document.createElement('canvas');
    this.renderToCanvas(member, canvas, scaleFactor);
    return canvas.toDataURL('image/png', 1.0);
  }

  /**
   * Trigger browser file download of high-resolution 3x PNG Digital ID pass
   * @param {Object} member 
   * @param {number} [scaleFactor=3] 
   * @param {string} [customFileName] 
   */
  async downloadPass(member, scaleFactor = EXPORT_SCALE_3X, customFileName) {
    if (typeof document === 'undefined') return;

    const blob = await this.exportToBlob(member, scaleFactor);
    const safeId = (member.studyId || 'STUDY-ID').replace(/[^a-zA-Z0-9_-]/g, '');
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

  // ==========================================================================
  // PRIVATE CANVAS RENDERING HELPERS
  // ==========================================================================

  _drawRoundedRectPath(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  _drawMetallicBackground(ctx, W, H, scale, stream = '') {
    const isBio = String(stream).toLowerCase().includes('bio');

    // Multi-stop base metallic gradient
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    if (isBio) {
      // Emerald / Cyan tint for Biological Science
      bgGrad.addColorStop(0.0, '#060B11');
      bgGrad.addColorStop(0.25, '#0B192C');
      bgGrad.addColorStop(0.5, '#062024');
      bgGrad.addColorStop(0.75, '#0B192C');
      bgGrad.addColorStop(1.0, '#050B10');
    } else {
      // Deep Indigo / Purple tint for Physical Science
      bgGrad.addColorStop(0.0, '#07090E');
      bgGrad.addColorStop(0.25, '#0F172A');
      bgGrad.addColorStop(0.5, '#1E1B4B');
      bgGrad.addColorStop(0.75, '#111827');
      bgGrad.addColorStop(1.0, '#07090E');
    }

    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Specular light sweep across top-left
    const sweep = ctx.createRadialGradient(W * 0.2, H * 0.1, 0, W * 0.2, H * 0.1, W * 0.7);
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

    // Ambient bottom-right glow
    const bottomGlow = ctx.createRadialGradient(W * 0.85, H * 0.85, 0, W * 0.85, H * 0.85, W * 0.5);
    bottomGlow.addColorStop(0, 'rgba(56, 189, 248, 0.12)');
    bottomGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = bottomGlow;
    ctx.fillRect(0, 0, W, H);
  }

  _drawSecurityPattern(ctx, W, H, scale) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1 * scale;

    // Diagonal safety micro-lines
    const step = 20 * scale;
    for (let x = -H; x < W + H; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + H, H);
      ctx.stroke();
    }

    // Microtext watermark in middle
    ctx.font = `600 ${8 * scale}px "JetBrains Mono", monospace`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.textAlign = 'center';
    ctx.fillText('STUDYSYNC OFFICIAL SECURE VERIFICATION ID', W * 0.5, H * 0.52);

    ctx.restore();
  }

  _drawCardHeader(ctx, W, H, scale) {
    const x = 32 * scale;
    const y = 28 * scale;

    ctx.save();

    // Brand icon (Gradient Rounded Box with Lightning Glyph)
    const iconSize = 28 * scale;
    const iconRadius = 7 * scale;
    this._drawRoundedRectPath(ctx, x, y, iconSize, iconSize, iconRadius);
    const iconGrad = ctx.createLinearGradient(x, y, x + iconSize, y + iconSize);
    iconGrad.addColorStop(0, '#6366F1');
    iconGrad.addColorStop(0.5, '#8B5CF6');
    iconGrad.addColorStop(1, '#D946EF');
    ctx.fillStyle = iconGrad;
    ctx.fill();

    // Lightning bolt glyph
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(x + iconSize * 0.55, y + iconSize * 0.2);
    ctx.lineTo(x + iconSize * 0.28, y + iconSize * 0.55);
    ctx.lineTo(x + iconSize * 0.5, y + iconSize * 0.55);
    ctx.lineTo(x + iconSize * 0.45, y + iconSize * 0.85);
    ctx.lineTo(x + iconSize * 0.72, y + iconSize * 0.48);
    ctx.lineTo(x + iconSize * 0.5, y + iconSize * 0.48);
    ctx.closePath();
    ctx.fill();

    // Brand text
    ctx.textAlign = 'left';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `700 ${15 * scale}px "SF Pro Display", "Product Sans", -apple-system, sans-serif`;
    ctx.fillText('StudySync', x + iconSize + 10 * scale, y + 15 * scale);

    ctx.fillStyle = '#94A3B8';
    ctx.font = `500 ${8.5 * scale}px "SF Pro Text", "Product Sans", -apple-system, sans-serif`;
    ctx.fillText('SRI LANKA G.C.E. A/L ID CARD', x + iconSize + 10 * scale, y + 25 * scale);

    ctx.restore();
  }

  _drawStatusPill(ctx, W, H, scale, status = 'Active') {
    const pillW = 88 * scale;
    const pillH = 22 * scale;
    const x = W - 32 * scale - pillW;
    const y = 30 * scale;
    const radius = pillH / 2;

    ctx.save();

    // Pill background
    this._drawRoundedRectPath(ctx, x, y, pillW, pillH, radius);
    ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.35)';
    ctx.lineWidth = 1 * scale;
    ctx.stroke();

    // Glowing green dot
    const dotX = x + 12 * scale;
    const dotY = y + pillH / 2;
    ctx.beginPath();
    ctx.arc(dotX, dotY, 3.5 * scale, 0, Math.PI * 2);
    ctx.fillStyle = '#10B981';
    ctx.shadowColor = '#10B981';
    ctx.shadowBlur = 6 * scale;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Status text
    ctx.fillStyle = '#6EE7B7';
    ctx.font = `700 ${9 * scale}px "SF Pro Text", "Product Sans", -apple-system, sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText(status.toUpperCase(), dotX + 8 * scale, y + 14 * scale);

    ctx.restore();
  }

  _drawEmvChip(ctx, x, y, scale) {
    const chipW = 38 * scale;
    const chipH = 28 * scale;
    const chipRadius = 5 * scale;

    ctx.save();

    // Chip metallic gold gradient
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

    // Internal contact traces
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.lineWidth = 0.8 * scale;

    // Horizontal line
    ctx.beginPath();
    ctx.moveTo(x, y + chipH * 0.5);
    ctx.lineTo(x + chipW, y + chipH * 0.5);
    ctx.stroke();

    // Vertical line
    ctx.beginPath();
    ctx.moveTo(x + chipW * 0.4, y);
    ctx.lineTo(x + chipW * 0.4, y + chipH);
    ctx.stroke();

    // Inner chip circuit center box
    ctx.strokeRect(x + chipW * 0.3, y + chipH * 0.25, chipW * 0.4, chipH * 0.5);

    // NFC Wave Symbol next to chip
    const nfcX = x + chipW + 12 * scale;
    const nfcY = y + chipH * 0.5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.2 * scale;
    for (let r = 1; r <= 3; r++) {
      ctx.beginPath();
      ctx.arc(nfcX, nfcY, (4 + r * 3.5) * scale, -Math.PI * 0.35, Math.PI * 0.35);
      ctx.stroke();
    }

    ctx.restore();
  }

  _drawMemberDetails(ctx, W, H, scale, member) {
    const leftX = 32 * scale;
    const fullName = member.fullName || member.name || 'Member Name';
    const studyId = member.studyId || 'SG-BIO-0001';
    const school = member.school || 'Sri Lanka School';
    const stream = member.stream || 'Biological Science';
    const optSubject = member.optionalSubject ? ` (${member.optionalSubject})` : '';
    const regDate = formatDate(member.registrationDate || new Date(), 'short');

    ctx.save();
    ctx.textAlign = 'left';

    // 1. Member Full Name
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `700 ${18 * scale}px "SF Pro Display", "Product Sans", -apple-system, sans-serif`;
    
    // Truncate name if too long to fit
    let nameDisplay = fullName;
    const maxNameW = W * 0.55;
    while (ctx.measureText(nameDisplay).width > maxNameW && nameDisplay.length > 5) {
      nameDisplay = nameDisplay.substring(0, nameDisplay.length - 2) + '…';
    }
    ctx.fillText(nameDisplay, leftX, 134 * scale);

    // 2. Study ID
    ctx.font = `700 ${14 * scale}px "JetBrains Mono", SFMono-Regular, monospace`;
    const isBio = studyId.includes('BIO');
    ctx.fillStyle = isBio ? '#06B6D4' : '#818CF8';
    ctx.shadowColor = isBio ? 'rgba(6, 182, 212, 0.5)' : 'rgba(129, 140, 248, 0.5)';
    ctx.shadowBlur = 6 * scale;
    ctx.fillText(studyId, leftX, 158 * scale);
    ctx.shadowBlur = 0;

    // 3. Stream & Optional Subject Pill / Label
    ctx.font = `600 ${10.5 * scale}px "SF Pro Text", "Product Sans", -apple-system, sans-serif`;
    ctx.fillStyle = '#C7D2FE';
    ctx.fillText(`${stream}${optSubject}`, leftX, 184 * scale);

    // 4. School Name (Subdued text)
    ctx.font = `500 ${10 * scale}px "SF Pro Text", "Product Sans", -apple-system, sans-serif`;
    ctx.fillStyle = '#94A3B8';
    let schoolDisplay = school;
    while (ctx.measureText(schoolDisplay).width > maxNameW && schoolDisplay.length > 5) {
      schoolDisplay = schoolDisplay.substring(0, schoolDisplay.length - 2) + '…';
    }
    ctx.fillText(schoolDisplay, leftX, 204 * scale);

    // 5. Issue / Registration Date
    ctx.font = `500 ${8.5 * scale}px "JetBrains Mono", SFMono-Regular, monospace`;
    ctx.fillStyle = '#64748B';
    ctx.fillText(`ISSUED: ${regDate.toUpperCase()}`, leftX, 226 * scale);

    ctx.restore();
  }


  async _drawEmbeddedQrCode(ctx, W, H, scale, member) {
    const qrBoxSize = 104 * scale;
    const qrX = W - 28 * scale - qrBoxSize;
    const qrY = 74 * scale;
    const radius = 10 * scale;

    ctx.save();

    // 1. White QR container with drop shadow
    this._drawRoundedRectPath(ctx, qrX, qrY, qrBoxSize, qrBoxSize, radius);
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 10 * scale;
    ctx.shadowOffsetY = 3 * scale;
    ctx.fill();
    ctx.shadowBlur = 0;

    // 2. Build the verify URL — ONLY the short URL, nothing else
    const studyId = encodeURIComponent(member.studyId || 'SG-BIO-0001');
    const verifyUrl = `https://studysync-al-2026.web.app/verify.html?id=${studyId}`;

    try {
      // Use the qrcode library (loaded via window.QRCode or dynamic import)
      const qrPadding = 6 * scale;
      const innerSize = qrBoxSize - qrPadding * 2;

      // Create an off-screen canvas for the QR
      const qrCanvas = document.createElement('canvas');
      qrCanvas.width = Math.round(innerSize);
      qrCanvas.height = Math.round(innerSize);

      // Try window.QRCode (CDN loaded) first, then dynamic import
      let QRCodeLib = null;
      if (typeof window !== 'undefined' && window.QRCode) {
        QRCodeLib = window.QRCode;
      } else {
        try {
          const mod = await import('https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js');
          QRCodeLib = mod.default || mod;
        } catch (_) {}
      }

      if (QRCodeLib && QRCodeLib.toCanvas) {
        await QRCodeLib.toCanvas(qrCanvas, verifyUrl, {
          width: Math.round(innerSize),
          margin: 0,
          errorCorrectionLevel: 'M',
          color: { dark: '#000000', light: '#FFFFFF' }
        });
        ctx.drawImage(qrCanvas, qrX + qrPadding, qrY + qrPadding, innerSize, innerSize);
      } else {
        // Fallback: render via Google Charts QR API as an image
        await new Promise((resolve, reject) => {
          const img = new Image();
          const size = Math.round(innerSize);
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            ctx.drawImage(img, qrX + qrPadding, qrY + qrPadding, innerSize, innerSize);
            resolve();
          };
          img.onerror = reject;
          img.src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&ecc=M&data=${encodeURIComponent(verifyUrl)}`;
        });
      }
    } catch (err) {
      // Last resort fallback: draw QR placeholder with URL text
      console.warn('[IdCard] QR generation failed, using fallback:', err);
      ctx.fillStyle = '#F1F5F9';
      ctx.fillRect(qrX + 4 * scale, qrY + 4 * scale, qrBoxSize - 8 * scale, qrBoxSize - 8 * scale);
      ctx.fillStyle = '#64748B';
      ctx.font = `${5 * scale}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText('QR', qrX + qrBoxSize / 2, qrY + qrBoxSize / 2);
    }

    // 3. Label below QR code
    ctx.fillStyle = '#94A3B8';
    ctx.font = `600 ${7.5 * scale}px "SF Pro Text", "Product Sans", -apple-system, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('SCAN TO VERIFY', qrX + qrBoxSize / 2, qrY + qrBoxSize + 13 * scale);

    ctx.restore();
  }



  _drawSecurityRibbon(ctx, W, H, scale) {
    const ribbonH = 24 * scale;
    const y = H - ribbonH;

    ctx.save();

    // Bottom ribbon background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(0, y, W, ribbonH);

    // Top border line of ribbon
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1 * scale;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();

    // Microtext Security line
    ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
    ctx.font = `500 ${7 * scale}px "JetBrains Mono", monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('OFFICIAL SRI LANKA G.C.E. ADVANCED LEVEL VERIFIED IDENTITY • REPRODUCTION PROHIBITED', W * 0.5, y + 15 * scale);

    ctx.restore();
  }

  _drawCardBorder(ctx, W, H, radius, scale) {
    ctx.save();
    this._drawRoundedRectPath(ctx, 0.5 * scale, 0.5 * scale, W - 1 * scale, H - 1 * scale, radius);
    
    // Gradient border with light sheen
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

// Export singleton instance
export const IdCard = new IdCardRenderer();
export default IdCard;
