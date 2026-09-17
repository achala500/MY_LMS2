import QRCode from 'qrcode';

/**
 * StudySync â€” QR Code Generation & Payload Engine
 * Powered by standard ISO/IEC 18004 QRCode engine for 100% camera scannability,
 * with pure TypeScript Galois Field matrix fallback.
 */

// ============================================================================
// 1. GALOIS FIELD GF(256) & REED-SOLOMON ARITHMETIC
// ============================================================================

const GF256_EXP = new Uint8Array(512);
const GF256_LOG = new Uint8Array(256);

(function initGF256() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF256_EXP[i] = x;
    GF256_EXP[i + 255] = x;
    GF256_LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d; // Primitive polynomial x^8 + x^4 + x^3 + x^2 + 1
  }
  GF256_LOG[0] = 0;
})();

function gfMul(x: number, y: number): number {
  if (x === 0 || y === 0) return 0;
  return GF256_EXP[GF256_LOG[x] + GF256_LOG[y]];
}

function rsGeneratorPoly(numEcBytes: number): number[] {
  let poly = [1];
  for (let i = 0; i < numEcBytes; i++) {
    const factor = [1, GF256_EXP[i]];
    const nextPoly = new Array(poly.length + 1).fill(0);
    for (let j = 0; j < poly.length; j++) {
      nextPoly[j] ^= gfMul(poly[j], factor[0]);
      nextPoly[j + 1] ^= gfMul(poly[j], factor[1]);
    }
    poly = nextPoly;
  }
  return poly;
}

function rsCalculateRemainder(data: number[], numEcBytes: number): number[] {
  const gen = rsGeneratorPoly(numEcBytes);
  const remainder = new Array(numEcBytes).fill(0);

  for (let i = 0; i < data.length; i++) {
    const factor = data[i] ^ remainder[0];
    remainder.shift();
    remainder.push(0);
    if (factor !== 0) {
      for (let j = 0; j < numEcBytes; j++) {
        remainder[j] ^= gfMul(gen[j + 1], factor);
      }
    }
  }
  return remainder;
}

// ============================================================================
// 2. QR CODE CAPACITY & VERSION TABLES (Versions 1 to 14, Byte Mode)
// ============================================================================

interface VersionEcInfo {
  totalData: number;
  ecPerBlock: number;
  blocks: [number, number][];
}

interface VersionTableEntry {
  size: number;
  align?: number[];
  L: VersionEcInfo;
  M: VersionEcInfo;
}

const QR_TABLE: Record<number, VersionTableEntry> = {
  1: {
    size: 21,
    L: { totalData: 19, ecPerBlock: 7, blocks: [[1, 19]] },
    M: { totalData: 16, ecPerBlock: 10, blocks: [[1, 16]] },
  },
  2: {
    size: 25,
    align: [6, 18],
    L: { totalData: 34, ecPerBlock: 10, blocks: [[1, 34]] },
    M: { totalData: 28, ecPerBlock: 16, blocks: [[1, 28]] },
  },
  3: {
    size: 29,
    align: [6, 22],
    L: { totalData: 55, ecPerBlock: 15, blocks: [[1, 55]] },
    M: { totalData: 44, ecPerBlock: 26, blocks: [[1, 44]] },
  },
  4: {
    size: 33,
    align: [6, 26],
    L: { totalData: 80, ecPerBlock: 20, blocks: [[1, 80]] },
    M: { totalData: 64, ecPerBlock: 18, blocks: [[2, 32]] },
  },
  5: {
    size: 37,
    align: [6, 30],
    L: { totalData: 108, ecPerBlock: 26, blocks: [[1, 108]] },
    M: { totalData: 86, ecPerBlock: 24, blocks: [[2, 43]] },
  },
  6: {
    size: 41,
    align: [6, 34],
    L: { totalData: 136, ecPerBlock: 18, blocks: [[2, 68]] },
    M: { totalData: 108, ecPerBlock: 16, blocks: [[4, 27]] },
  },
  7: {
    size: 45,
    align: [6, 22, 38],
    L: { totalData: 156, ecPerBlock: 20, blocks: [[2, 78]] },
    M: { totalData: 124, ecPerBlock: 18, blocks: [[4, 31]] },
  },
  8: {
    size: 49,
    align: [6, 24, 42],
    L: { totalData: 194, ecPerBlock: 24, blocks: [[2, 97]] },
    M: { totalData: 154, ecPerBlock: 22, blocks: [[2, 38], [2, 39]] },
  },
  9: {
    size: 53,
    align: [6, 26, 46],
    L: { totalData: 232, ecPerBlock: 30, blocks: [[2, 116]] },
    M: { totalData: 182, ecPerBlock: 22, blocks: [[3, 36], [2, 37]] },
  },
  10: {
    size: 57,
    align: [6, 28, 50],
    L: { totalData: 274, ecPerBlock: 18, blocks: [[2, 68], [2, 69]] },
    M: { totalData: 216, ecPerBlock: 26, blocks: [[4, 43], [1, 44]] },
  },
  11: {
    size: 61,
    align: [6, 30, 54],
    L: { totalData: 324, ecPerBlock: 20, blocks: [[4, 81]] },
    M: { totalData: 254, ecPerBlock: 30, blocks: [[1, 50], [4, 51]] },
  },
  12: {
    size: 65,
    align: [6, 32, 58],
    L: { totalData: 370, ecPerBlock: 24, blocks: [[2, 92], [2, 93]] },
    M: { totalData: 290, ecPerBlock: 22, blocks: [[6, 36], [2, 37]] },
  },
  13: {
    size: 69,
    align: [6, 34, 62],
    L: { totalData: 428, ecPerBlock: 26, blocks: [[4, 107]] },
    M: { totalData: 334, ecPerBlock: 22, blocks: [[8, 37], [1, 38]] },
  },
  14: {
    size: 73,
    align: [6, 26, 46, 66],
    L: { totalData: 461, ecPerBlock: 30, blocks: [[3, 115], [1, 116]] },
    M: { totalData: 365, ecPerBlock: 24, blocks: [[4, 40], [5, 41]] },
  },
};

// ============================================================================
// 3. BIT BUFFER & DATA ENCODING
// ============================================================================

class BitBuffer {
  public buffer: number[] = [];
  public length = 0;

  put(num: number, length: number) {
    for (let i = 0; i < length; i++) {
      this.putBit(((num >>> (length - i - 1)) & 1) === 1);
    }
  }

  putBit(bit: boolean) {
    const bufIndex = Math.floor(this.length / 8);
    if (this.buffer.length <= bufIndex) {
      this.buffer.push(0);
    }
    if (bit) {
      this.buffer[bufIndex] |= 0x80 >>> (this.length % 8);
    }
    this.length++;
  }

  getBytes(): number[] {
    return this.buffer;
  }
}

function encodeUtf8(str: string): number[] {
  const utf8: number[] = [];
  for (let i = 0; i < str.length; i++) {
    let charcode = str.charCodeAt(i);
    if (charcode < 0x80) utf8.push(charcode);
    else if (charcode < 0x800) {
      utf8.push(0xc0 | (charcode >> 6), 0x80 | (charcode & 0x3f));
    } else if (charcode < 0xd800 || charcode >= 0xe000) {
      utf8.push(
        0xe0 | (charcode >> 12),
        0x80 | ((charcode >> 6) & 0x3f),
        0x80 | (charcode & 0x3f)
      );
    } else {
      i++;
      charcode =
        0x10000 + (((charcode & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff));
      utf8.push(
        0xf0 | (charcode >> 18),
        0x80 | ((charcode >> 12) & 0x3f),
        0x80 | ((charcode >> 6) & 0x3f),
        0x80 | (charcode & 0x3f)
      );
    }
  }
  return utf8;
}

function pickVersion(dataByteLength: number, ecLevel: 'L' | 'M' = 'M'): number {
  const level = ecLevel.toUpperCase() as 'L' | 'M';
  for (let v = 1; v <= 14; v++) {
    const info = QR_TABLE[v]?.[level];
    if (info) {
      const charCountBits = v < 10 ? 8 : 16;
      const totalHeaderBits = 4 + charCountBits; // 4 bits for byte mode
      const maxDataBits = info.totalData * 8;
      if (dataByteLength * 8 + totalHeaderBits <= maxDataBits) {
        return v;
      }
    }
  }
  return 14;
}

function createDataCodewords(
  text: string,
  version: number,
  ecLevel: 'L' | 'M' = 'M'
): number[] {
  const rawBytes = encodeUtf8(text);
  const vInfo = QR_TABLE[version][ecLevel.toUpperCase() as 'L' | 'M'];
  const bitBuf = new BitBuffer();

  bitBuf.put(4, 4); // 8-bit byte mode
  const charCountBits = version < 10 ? 8 : 16;
  bitBuf.put(rawBytes.length, charCountBits);

  for (const b of rawBytes) {
    bitBuf.put(b, 8);
  }

  const maxBits = vInfo.totalData * 8;
  const termLen = Math.min(4, maxBits - bitBuf.length);
  bitBuf.put(0, termLen);

  while (bitBuf.length % 8 !== 0) {
    bitBuf.putBit(false);
  }

  const padBytes = [0xec, 0x11];
  let padIdx = 0;
  while (bitBuf.length < maxBits) {
    bitBuf.put(padBytes[padIdx % 2], 8);
    padIdx++;
  }

  const bytes = bitBuf.getBytes();
  const allBlocks: { data: number[]; ec: number[] }[] = [];
  let byteOffset = 0;

  for (const [count, dataLen] of vInfo.blocks) {
    for (let c = 0; c < count; c++) {
      const blockData = bytes.slice(byteOffset, byteOffset + dataLen);
      byteOffset += dataLen;
      const ecData = rsCalculateRemainder(blockData, vInfo.ecPerBlock);
      allBlocks.push({ data: blockData, ec: ecData });
    }
  }

  const finalCodewords: number[] = [];
  let maxDataLen = 0;
  for (const b of allBlocks) {
    if (b.data.length > maxDataLen) maxDataLen = b.data.length;
  }
  for (let i = 0; i < maxDataLen; i++) {
    for (const b of allBlocks) {
      if (i < b.data.length) finalCodewords.push(b.data[i]);
    }
  }

  for (let i = 0; i < vInfo.ecPerBlock; i++) {
    for (const b of allBlocks) {
      finalCodewords.push(b.ec[i]);
    }
  }

  return finalCodewords;
}

// ============================================================================
// 4. QR MATRIX CONSTRUCTION & PATTERNS
// ============================================================================

export function generateQrMatrix(
  text: string,
  ecLevel: 'L' | 'M' = 'M'
): boolean[][] {
  const rawBytes = encodeUtf8(text);
  const version = pickVersion(rawBytes.length, ecLevel);
  const size = QR_TABLE[version].size;

  const matrix: (boolean | null)[][] = Array.from({ length: size }, () =>
    Array(size).fill(null)
  );
  const isFunctionPattern: boolean[][] = Array.from({ length: size }, () =>
    Array(size).fill(false)
  );

  function setFinder(row: number, col: number) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const nr = row + r;
        const nc = col + c;
        if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
          isFunctionPattern[nr][nc] = true;
          if (r >= 0 && r <= 6 && c >= 0 && c <= 6) {
            if (
              r === 0 ||
              r === 6 ||
              c === 0 ||
              c === 6 ||
              (r >= 2 && r <= 4 && c >= 2 && c <= 4)
            ) {
              matrix[nr][nc] = true;
            } else {
              matrix[nr][nc] = false;
            }
          } else {
            matrix[nr][nc] = false;
          }
        }
      }
    }
  }

  setFinder(0, 0);
  setFinder(0, size - 7);
  setFinder(size - 7, 0);

  const alignCoords = QR_TABLE[version].align || [];
  for (const r of alignCoords) {
    for (const c of alignCoords) {
      if (
        (r === 6 && c === 6) ||
        (r === 6 && c === size - 7) ||
        (r === size - 7 && c === 6)
      ) {
        continue;
      }
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          isFunctionPattern[nr][nc] = true;
          if (
            Math.abs(dr) === 2 ||
            Math.abs(dc) === 2 ||
            (dr === 0 && dc === 0)
          ) {
            matrix[nr][nc] = true;
          } else {
            matrix[nr][nc] = false;
          }
        }
      }
    }
  }

  for (let i = 8; i < size - 8; i++) {
    if (matrix[6][i] === null) {
      matrix[6][i] = i % 2 === 0;
      isFunctionPattern[6][i] = true;
    }
    if (matrix[i][6] === null) {
      matrix[i][6] = i % 2 === 0;
      isFunctionPattern[i][6] = true;
    }
  }

  matrix[size - 8][8] = true;
  isFunctionPattern[size - 8][8] = true;

  const FORMAT_MASKS: Record<string, number> = {
    'M-0': 0x5412,
    'M-1': 0x5125,
    'M-2': 0x5e7c,
    'M-3': 0x5b4b,
    'L-0': 0x77c4,
    'L-1': 0x72f3,
    'L-2': 0x7daa,
    'L-3': 0x789d,
  };
  const formatBits = FORMAT_MASKS[`${ecLevel.toUpperCase()}-0`] || 0x5412;

  for (let i = 0; i < 15; i++) {
    const bit = ((formatBits >>> (14 - i)) & 1) === 1;
    if (i <= 5) {
      matrix[8][i] = bit;
      isFunctionPattern[8][i] = true;
    } else if (i === 6) {
      matrix[8][7] = bit;
      isFunctionPattern[8][7] = true;
    } else if (i === 7) {
      matrix[8][8] = bit;
      isFunctionPattern[8][8] = true;
    } else if (i === 8) {
      matrix[7][8] = bit;
      isFunctionPattern[7][8] = true;
    } else {
      matrix[14 - i][8] = bit;
      isFunctionPattern[14 - i][8] = true;
    }

    if (i < 7) {
      matrix[size - 1 - i][8] = bit;
      isFunctionPattern[size - 1 - i][8] = true;
    } else {
      matrix[8][size - 15 + i] = bit;
      isFunctionPattern[8][size - 15 + i] = true;
    }
  }

  const codewords = createDataCodewords(text, version, ecLevel);
  const dataBits: boolean[] = [];
  for (const cw of codewords) {
    for (let b = 7; b >= 0; b--) {
      dataBits.push(((cw >>> b) & 1) === 1);
    }
  }

  let bitIdx = 0;
  let upward = true;
  for (let rightCol = size - 1; rightCol > 0; rightCol -= 2) {
    if (rightCol === 6) rightCol--;
    const cols = [rightCol, rightCol - 1];
    const rows = upward
      ? Array.from({ length: size }, (_, i) => size - 1 - i)
      : Array.from({ length: size }, (_, i) => i);

    for (const r of rows) {
      for (const c of cols) {
        if (!isFunctionPattern[r][c]) {
          const bitVal = bitIdx < dataBits.length ? dataBits[bitIdx] : false;
          bitIdx++;
          const maskVal = (r + c) % 2 === 0;
          matrix[r][c] = bitVal !== maskVal;
        }
      }
    }
    upward = !upward;
  }

  return matrix.map((row) => row.map((cell) => cell ?? false));
}

// ============================================================================
// 5. CANVAS 2D RENDERER
// ============================================================================

export interface RenderQrOptions {
  moduleSize?: number;
  margin?: number;
  darkColor?: string;
  lightColor?: string;
  roundedCorners?: boolean;
}

export function renderQrToCanvas(
  text: string,
  canvas: HTMLCanvasElement,
  options: RenderQrOptions = {}
): void {
  if (!canvas || typeof canvas.getContext !== 'function') return;

  const darkColor = options.darkColor || '#000000';
  const lightColor = options.lightColor || '#FFFFFF';
  const margin = options.margin ?? 1;

  try {
    // Primary path: Standard ISO/IEC 18004 QRCode engine
    QRCode.toCanvas(canvas, text, {
      margin: margin,
      errorCorrectionLevel: 'M',
      color: {
        dark: darkColor,
        light: lightColor,
      },
    }, (err: Error | null | undefined) => {
      if (err) {
        console.warn('[QR] QRCode.toCanvas fallback triggered:', err);
        renderQrFallback(text, canvas, options);
      }
    });
  } catch (err) {
    renderQrFallback(text, canvas, options);
  }
}

function renderQrFallback(
  text: string,
  canvas: HTMLCanvasElement,
  options: RenderQrOptions = {}
): void {
  const matrix = generateQrMatrix(text, 'M');
  const moduleCount = matrix.length;
  const margin = options.margin ?? 1;
  const moduleSize = options.moduleSize ?? 6;
  const totalDimension = (moduleCount + margin * 2) * moduleSize;

  canvas.width = totalDimension;
  canvas.height = totalDimension;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.fillStyle = options.lightColor || '#FFFFFF';
  ctx.fillRect(0, 0, totalDimension, totalDimension);

  ctx.fillStyle = options.darkColor || '#000000';
  const offset = margin * moduleSize;

  for (let r = 0; r < moduleCount; r++) {
    for (let c = 0; c < moduleCount; c++) {
      if (matrix[r][c]) {
        const x = offset + c * moduleSize;
        const y = offset + r * moduleSize;
        ctx.fillRect(x, y, moduleSize, moduleSize);
      }
    }
  }
}

// ============================================================================
// 6. PAYLOAD GENERATION & PARSING
// ============================================================================

export interface QrPayloadResult {
  offlineData: string;
  verifyUrl: string;
  combinedString: string;
}

export function generateQrPayload(
  member: {
    studyId?: string;
    fullName?: string;
    name?: string;
    stream?: string;
    school?: string;
    registrationDate?: string;
  },
  baseUrl?: string
): QrPayloadResult {
  if (!member || !member.studyId) {
    throw new Error('[QRCode] Invalid member object: studyId is required');
  }

  const defaultHost =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : 'https://studysync-al-2026.web.app';

  const host = baseUrl || defaultHost;
  const verifyUrl = `${host}/verify.html?id=${encodeURIComponent(member.studyId)}`;

  const offlineObj = {
    id: member.studyId,
    name: member.fullName || member.name || '',
    stream: member.stream || '',
    school: member.school || '',
    regDate:
      member.registrationDate || new Date().toISOString().substring(0, 10),
  };

  const offlineJson = JSON.stringify(offlineObj);

  return {
    offlineData: offlineJson,
    verifyUrl: verifyUrl,
    combinedString: verifyUrl,
  };
}

export function parseQrPayload(payloadString?: string): {
  type: string;
  studyId: string;
  verifyUrl: string;
  offlineData: any;
} | null {
  if (!payloadString || typeof payloadString !== 'string') return null;

  if (payloadString.startsWith('STUDYSYNC|')) {
    const parts = payloadString.split('|');
    try {
      const offlineData = JSON.parse(parts.slice(3).join('|'));
      return {
        type: 'STUDYSYNC_DUAL',
        studyId: parts[1],
        verifyUrl: parts[2],
        offlineData,
      };
    } catch (_) {
      return {
        type: 'STUDYSYNC_DUAL',
        studyId: parts[1],
        verifyUrl: parts[2],
        offlineData: null,
      };
    }
  }

  try {
    const parsed = JSON.parse(payloadString);
    if (parsed && (parsed.id || parsed.studyId)) {
      const studyId = parsed.id || parsed.studyId;
      return {
        type: 'STUDYSYNC_JSON',
        studyId: studyId,
        verifyUrl: `/#verify/${encodeURIComponent(studyId)}`,
        offlineData: parsed,
      };
    }
  } catch (_) {}

  const urlMatch = payloadString.match(
    /(?:#verify\/|[?&]id=)([A-Za-z0-9\-]+)/i
  );
  if (urlMatch) {
    return {
      type: 'STUDYSYNC_URL',
      studyId: urlMatch[1].toUpperCase(),
      verifyUrl: payloadString,
      offlineData: null,
    };
  }

  return null;
}
