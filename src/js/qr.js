/**
 * StudySync â€” QR Code Generation & Payload Engine
 * Standalone, pure JavaScript QR Code Generator (Model 2, Byte Mode, Error Correction L/M/Q/H).
 * Generates 2D boolean matrices, renders directly to HTML5 Canvas 2D, and encodes/decodes dual payloads.
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

function gfMul(x, y) {
  if (x === 0 || y === 0) return 0;
  return GF256_EXP[GF256_LOG[x] + GF256_LOG[y]];
}

function rsGeneratorPoly(numEcBytes) {
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

function rsCalculateRemainder(data, numEcBytes) {
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

// Total codewords, EC bytes per block, and block counts for EC level 'M' (15%) & 'L' (7%)
const QR_TABLE = {
  // [Version]: { size, ecL: { totalDataBytes, ecBytesPerBlock, blocks: [[count, dataBytes]] }, ecM: { ... } }
  1: {
    size: 21,
    L: { totalData: 19, ecPerBlock: 7, blocks: [[1, 19]] },
    M: { totalData: 16, ecPerBlock: 10, blocks: [[1, 16]] }
  },
  2: {
    size: 25,
    align: [6, 18],
    L: { totalData: 34, ecPerBlock: 10, blocks: [[1, 34]] },
    M: { totalData: 28, ecPerBlock: 16, blocks: [[1, 28]] }
  },
  3: {
    size: 29,
    align: [6, 22],
    L: { totalData: 55, ecPerBlock: 15, blocks: [[1, 55]] },
    M: { totalData: 44, ecPerBlock: 26, blocks: [[1, 44]] }
  },
  4: {
    size: 33,
    align: [6, 26],
    L: { totalData: 80, ecPerBlock: 20, blocks: [[1, 80]] },
    M: { totalData: 64, ecPerBlock: 18, blocks: [[2, 32]] }
  },
  5: {
    size: 37,
    align: [6, 30],
    L: { totalData: 108, ecPerBlock: 26, blocks: [[1, 108]] },
    M: { totalData: 86, ecPerBlock: 24, blocks: [[2, 43]] }
  },
  6: {
    size: 41,
    align: [6, 34],
    L: { totalData: 136, ecPerBlock: 18, blocks: [[2, 68]] },
    M: { totalData: 108, ecPerBlock: 16, blocks: [[4, 27]] }
  },
  7: {
    size: 45,
    align: [6, 22, 38],
    L: { totalData: 156, ecPerBlock: 20, blocks: [[2, 78]] },
    M: { totalData: 124, ecPerBlock: 18, blocks: [[4, 31]] }
  },
  8: {
    size: 49,
    align: [6, 24, 42],
    L: { totalData: 194, ecPerBlock: 24, blocks: [[2, 97]] },
    M: { totalData: 154, ecPerBlock: 22, blocks: [[2, 38], [2, 39]] }
  },
  9: {
    size: 53,
    align: [6, 26, 46],
    L: { totalData: 232, ecPerBlock: 30, blocks: [[2, 116]] },
    M: { totalData: 182, ecPerBlock: 22, blocks: [[3, 36], [2, 37]] }
  },
  10: {
    size: 57,
    align: [6, 28, 50],
    L: { totalData: 274, ecPerBlock: 18, blocks: [[2, 68], [2, 69]] },
    M: { totalData: 216, ecPerBlock: 26, blocks: [[4, 43], [1, 44]] }
  },
  11: {
    size: 61,
    align: [6, 30, 54],
    L: { totalData: 324, ecPerBlock: 20, blocks: [[4, 81]] },
    M: { totalData: 254, ecPerBlock: 30, blocks: [[1, 50], [4, 51]] }
  },
  12: {
    size: 65,
    align: [6, 32, 58],
    L: { totalData: 370, ecPerBlock: 24, blocks: [[2, 92], [2, 93]] },
    M: { totalData: 290, ecPerBlock: 22, blocks: [[6, 36], [2, 37]] }
  },
  13: {
    size: 69,
    align: [6, 34, 62],
    L: { totalData: 428, ecPerBlock: 26, blocks: [[4, 107]] },
    M: { totalData: 334, ecPerBlock: 22, blocks: [[8, 37], [1, 38]] }
  },
  14: {
    size: 73,
    align: [6, 26, 46, 66],
    L: { totalData: 461, ecPerBlock: 30, blocks: [[3, 115], [1, 116]] },
    M: { totalData: 365, ecPerBlock: 24, blocks: [[4, 40], [5, 41]] }
  }
};

// ============================================================================
// 3. BIT BUFFER & DATA ENCODING
// ============================================================================

class BitBuffer {
  constructor() {
    this.buffer = [];
    this.length = 0;
  }

  put(num, length) {
    for (let i = 0; i < length; i++) {
      this.putBit(((num >>> (length - i - 1)) & 1) === 1);
    }
  }

  putBit(bit) {
    const bufIndex = Math.floor(this.length / 8);
    if (this.buffer.length <= bufIndex) {
      this.buffer.push(0);
    }
    if (bit) {
      this.buffer[bufIndex] |= (0x80 >>> (this.length % 8));
    }
    this.length++;
  }

  getBytes() {
    return this.buffer;
  }
}

function encodeUtf8(str) {
  const utf8 = [];
  for (let i = 0; i < str.length; i++) {
    let charcode = str.charCodeAt(i);
    if (charcode < 0x80) utf8.push(charcode);
    else if (charcode < 0x800) {
      utf8.push(0xc0 | (charcode >> 6), 0x80 | (charcode & 0x3f));
    } else if (charcode < 0xd800 || charcode >= 0xe000) {
      utf8.push(0xe0 | (charcode >> 12), 0x80 | ((charcode >> 6) & 0x3f), 0x80 | (charcode & 0x3f));
    } else {
      // surrogate pair
      i++;
      charcode = 0x10000 + (((charcode & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff));
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

function pickVersion(dataByteLength, ecLevel = 'M') {
  const level = ecLevel.toUpperCase();
  for (let v = 1; v <= 14; v++) {
    const info = QR_TABLE[v][level];
    if (info) {
      const charCountBits = v < 10 ? 8 : 16;
      const totalHeaderBits = 4 + charCountBits; // 4 bits for byte mode (0100)
      const maxDataBits = info.totalData * 8;
      if (dataByteLength * 8 + totalHeaderBits <= maxDataBits) {
        return v;
      }
    }
  }
  throw new Error(`Data too long for StudySync QR generator (length: ${dataByteLength} bytes)`);
}

function createDataCodewords(text, version, ecLevel = 'M') {
  const rawBytes = encodeUtf8(text);
  const vInfo = QR_TABLE[version][ecLevel.toUpperCase()];
  const bitBuf = new BitBuffer();

  // Mode indicator: 0100 (8-bit Byte Mode)
  bitBuf.put(4, 4);

  // Character count indicator
  const charCountBits = version < 10 ? 8 : 16;
  bitBuf.put(rawBytes.length, charCountBits);

  // Data bytes
  for (const b of rawBytes) {
    bitBuf.put(b, 8);
  }

  // Terminator (up to 4 zeroes)
  const maxBits = vInfo.totalData * 8;
  const termLen = Math.min(4, maxBits - bitBuf.length);
  bitBuf.put(0, termLen);

  // Pad to byte boundary
  while (bitBuf.length % 8 !== 0) {
    bitBuf.putBit(false);
  }

  // Pad bytes (0xEC, 0x11 alternating)
  const padBytes = [0xec, 0x11];
  let padIndex = 0;
  while (bitBuf.length < maxBits) {
    bitBuf.put(padBytes[padIndex % 2], 8);
    padIndex++;
  }

  const dataBytes = bitBuf.getBytes();

  // Interleave data and error correction blocks
  const blocks = [];
  let byteOffset = 0;
  for (const [numBlocks, numDataBytes] of vInfo.blocks) {
    for (let b = 0; b < numBlocks; b++) {
      const blockData = dataBytes.slice(byteOffset, byteOffset + numDataBytes);
      byteOffset += numDataBytes;
      const ecData = rsCalculateRemainder(blockData, vInfo.ecPerBlock);
      blocks.push({ data: blockData, ec: ecData });
    }
  }

  // Interleave data words
  const result = [];
  const maxBlockData = Math.max(...blocks.map(b => b.data.length));
  for (let i = 0; i < maxBlockData; i++) {
    for (let b = 0; b < blocks.length; b++) {
      if (i < blocks[b].data.length) {
        result.push(blocks[b].data[i]);
      }
    }
  }

  // Interleave error correction words
  for (let i = 0; i < vInfo.ecPerBlock; i++) {
    for (let b = 0; b < blocks.length; b++) {
      result.push(blocks[b].ec[i]);
    }
  }

  return result;
}

// ============================================================================
// 4. MATRIX POPULATION & FUNCTION PATTERNS
// ============================================================================

class QrMatrix {
  constructor(size) {
    this.size = size;
    this.modules = Array.from({ length: size }, () => new Array(size).fill(null));
    this.isFunction = Array.from({ length: size }, () => new Array(size).fill(false));
  }

  set(r, c, val, isFunc = false) {
    this.modules[r][c] = val;
    if (isFunc) this.isFunction[r][c] = true;
  }

  get(r, c) {
    return this.modules[r][c];
  }

  placeFinderPattern(row, col) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const targetR = row + r;
        const targetC = col + c;
        if (targetR >= 0 && targetR < this.size && targetC >= 0 && targetC < this.size) {
          if (
            (r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
            (c >= 0 && c <= 6 && (r === 0 || r === 6)) ||
            (r >= 2 && r <= 4 && c >= 2 && c <= 4)
          ) {
            this.set(targetR, targetC, true, true);
          } else {
            this.set(targetR, targetC, false, true);
          }
        }
      }
    }
  }

  placeAlignmentPattern(row, col) {
    for (let r = -2; r <= 2; r++) {
      for (let c = -2; c <= 2; c++) {
        const targetR = row + r;
        const targetC = col + c;
        if (this.isFunction[targetR][targetC]) continue;
        const isDark = (Math.abs(r) === 2 || Math.abs(c) === 2 || (r === 0 && c === 0));
        this.set(targetR, targetC, isDark, true);
      }
    }
  }

  setupTimingPatterns() {
    for (let i = 8; i < this.size - 8; i++) {
      if (!this.isFunction[6][i]) {
        this.set(6, i, i % 2 === 0, true);
      }
      if (!this.isFunction[i][6]) {
        this.set(i, 6, i % 2 === 0, true);
      }
    }
  }

  reserveFormatInformation() {
    // Top-left
    for (let i = 0; i <= 8; i++) {
      if (i !== 6) this.set(8, i, false, true);
      if (i !== 6) this.set(i, 8, false, true);
    }
    // Top-right
    for (let i = 0; i < 8; i++) {
      this.set(8, this.size - 1 - i, false, true);
    }
    // Bottom-left
    for (let i = 0; i < 8; i++) {
      this.set(this.size - 1 - i, 8, false, true);
    }
    // Dark module at (4*version + 9, 8)
    this.set(this.size - 8, 8, true, true);
  }

  setupPositionPatterns(version) {
    // 3 Finder patterns
    this.placeFinderPattern(0, 0);
    this.placeFinderPattern(0, this.size - 7);
    this.placeFinderPattern(this.size - 7, 0);

    // Alignment patterns
    const vTable = QR_TABLE[version];
    if (vTable.align) {
      const coords = vTable.align;
      for (let r = 0; r < coords.length; r++) {
        for (let c = 0; c < coords.length; c++) {
          const row = coords[r];
          const col = coords[c];
          if (this.isFunction[row][col]) continue;
          this.placeAlignmentPattern(row, col);
        }
      }
    }

    this.setupTimingPatterns();
    this.reserveFormatInformation();
  }

  populateData(codewords, maskPattern) {
    let bitIndex = 0;
    const totalBits = codewords.length * 8;

    let col = this.size - 1;
    let isUpward = true;

    while (col > 0) {
      if (col === 6) col--; // Skip vertical timing column

      const rows = isUpward 
        ? Array.from({ length: this.size }, (_, i) => this.size - 1 - i)
        : Array.from({ length: this.size }, (_, i) => i);

      for (const row of rows) {
        for (const cOffset of [0, 1]) {
          const c = col - cOffset;
          if (!this.isFunction[row][c]) {
            let bit = false;
            if (bitIndex < totalBits) {
              const byteIdx = Math.floor(bitIndex / 8);
              const bitOffset = 7 - (bitIndex % 8);
              bit = ((codewords[byteIdx] >>> bitOffset) & 1) === 1;
              bitIndex++;
            }
            // Apply mask
            if (getMaskCondition(maskPattern, row, c)) {
              bit = !bit;
            }
            this.set(row, c, bit, false);
          }
        }
      }
      col -= 2;
      isUpward = !isUpward;
    }
  }

  applyFormatInfo(ecLevel, maskPattern) {
    // Format bits: 2 bits EC level (L=01, M=00, Q=11, H=10), 3 bits mask pattern
    const ecBits = ecLevel === 'L' ? 1 : (ecLevel === 'M' ? 0 : 2);
    let formatData = (ecBits << 3) | maskPattern;

    // Calculate 10-bit BCH error correction (generator 0x537)
    let bch = formatData << 10;
    const gen = 0x537;
    for (let i = 14; i >= 10; i--) {
      if ((bch >>> i) & 1) {
        bch ^= (gen << (i - 10));
      }
    }
    const fullFormat = ((formatData << 10) | bch) ^ 0x5412;

    // Place format bits
    // Top-left horizontal & vertical
    const bits = [];
    for (let i = 0; i < 15; i++) {
      bits.push(((fullFormat >>> i) & 1) === 1);
    }

    // Top-left
    this.set(8, 0, bits[0], true);
    this.set(8, 1, bits[1], true);
    this.set(8, 2, bits[2], true);
    this.set(8, 3, bits[3], true);
    this.set(8, 4, bits[4], true);
    this.set(8, 5, bits[5], true);
    this.set(8, 7, bits[6], true);
    this.set(8, 8, bits[7], true);
    this.set(7, 8, bits[8], true);
    this.set(5, 8, bits[9], true);
    this.set(4, 8, bits[10], true);
    this.set(3, 8, bits[11], true);
    this.set(2, 8, bits[12], true);
    this.set(1, 8, bits[13], true);
    this.set(0, 8, bits[14], true);

    // Bottom-left & top-right duplicates
    for (let i = 0; i < 7; i++) {
      this.set(this.size - 1 - i, 8, bits[i], true);
    }
    for (let i = 0; i < 8; i++) {
      this.set(8, this.size - 8 + i, bits[7 + i], true);
    }
  }
}

function getMaskCondition(pattern, row, col) {
  switch (pattern) {
    case 0: return (row + col) % 2 === 0;
    case 1: return row % 2 === 0;
    case 2: return col % 3 === 0;
    case 3: return (row + col) % 3 === 0;
    case 4: return (Math.floor(row / 2) + Math.floor(col / 3)) % 2 === 0;
    case 5: return ((row * col) % 2) + ((row * col) % 3) === 0;
    case 6: return (((row * col) % 2) + ((row * col) % 3)) % 2 === 0;
    case 7: return (((row + col) % 2) + ((row * col) % 3)) % 2 === 0;
    default: return false;
  }
}

// Evaluate mask penalties to select best pattern
function evaluatePenalty(matrix) {
  const size = matrix.size;
  let penalty = 0;

  // N1: 5 or more consecutive same-color modules in row/column
  for (let r = 0; r < size; r++) {
    let count = 1;
    for (let c = 1; c < size; c++) {
      if (matrix.get(r, c) === matrix.get(r, c - 1)) {
        count++;
      } else {
        if (count >= 5) penalty += 3 + (count - 5);
        count = 1;
      }
    }
    if (count >= 5) penalty += 3 + (count - 5);
  }

  for (let c = 0; c < size; c++) {
    let count = 1;
    for (let r = 1; r < size; r++) {
      if (matrix.get(r, c) === matrix.get(r - 1, c)) {
        count++;
      } else {
        if (count >= 5) penalty += 3 + (count - 5);
        count = 1;
      }
    }
    if (count >= 5) penalty += 3 + (count - 5);
  }

  // N2: 2x2 blocks of same color
  for (let r = 0; r < size - 1; r++) {
    for (let c = 0; c < size - 1; c++) {
      const v = matrix.get(r, c);
      if (v === matrix.get(r + 1, c) && v === matrix.get(r, c + 1) && v === matrix.get(r + 1, c + 1)) {
        penalty += 3;
      }
    }
  }

  return penalty;
}

// ============================================================================
// 5. PUBLIC QR ENGINE APIS
// ============================================================================

/**
 * Generate 2D boolean module matrix for text string
 * @param {string} text 
 * @param {'L'|'M'|'Q'|'H'} [ecLevel='M'] 
 * @returns {boolean[][]} 2D array (true = dark, false = light)
 */
export function generateQrMatrix(text, ecLevel = 'M') {
  if (typeof text !== 'string' || text.length === 0) {
    throw new Error('[QRCode] Text cannot be empty');
  }

  const rawBytes = encodeUtf8(text);
  const version = pickVersion(rawBytes.length, ecLevel);
  const codewords = createDataCodewords(text, version, ecLevel);
  const size = QR_TABLE[version].size;

  let bestMatrix = null;
  let minPenalty = Infinity;

  // Test mask patterns 0..7 to find lowest penalty score
  for (let mask = 0; mask < 8; mask++) {
    const mat = new QrMatrix(size);
    mat.setupPositionPatterns(version);
    mat.populateData(codewords, mask);
    mat.applyFormatInfo(ecLevel, mask);

    const penalty = evaluatePenalty(mat);
    if (penalty < minPenalty) {
      minPenalty = penalty;
      bestMatrix = mat;
    }
  }

  return bestMatrix.modules;
}

/**
 * Render QR Code directly onto an HTML5 Canvas element
 * @param {string} text - Payload to encode
 * @param {HTMLCanvasElement} canvas - Target Canvas DOM element
 * @param {Object} [options={}]
 * @param {number} [options.size=256] - Width & height of canvas in px
 * @param {number} [options.margin=4] - Quiet zone margin in modules
 * @param {string} [options.darkColor='#000000'] - Dark module color
 * @param {string} [options.lightColor='#ffffff'] - Light module color
 * @param {'L'|'M'|'Q'|'H'} [options.ecLevel='M'] - Error correction level
 */
export function renderQrToCanvas(text, canvas, options = {}) {
  if (!canvas || typeof canvas.getContext !== 'function') {
    throw new Error('[QRCode] Valid canvas element required');
  }

  const size = options.size || 256;
  const margin = options.margin !== undefined ? options.margin : 4;
  const darkColor = options.darkColor || '#000000';
  const lightColor = options.lightColor || '#ffffff';
  const ecLevel = options.ecLevel || 'M';

  const matrix = generateQrMatrix(text, ecLevel);
  const matrixSize = matrix.length;
  const totalModules = matrixSize + margin * 2;
  const moduleSize = size / totalModules;

  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = lightColor;
  ctx.fillRect(0, 0, size, size);

  // Draw modules
  ctx.fillStyle = darkColor;
  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      if (matrix[r][c]) {
        const x = Math.round((c + margin) * moduleSize);
        const y = Math.round((r + margin) * moduleSize);
        const w = Math.ceil(moduleSize);
        const h = Math.ceil(moduleSize);
        ctx.fillRect(x, y, w, h);
      }
    }
  }
}

/**
 * Generate QR Code as Base64 PNG Data URL
 * @param {string} text 
 * @param {Object} [options={}]
 * @returns {string} Data URL
 */
export function qrToDataUrl(text, options = {}) {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  renderQrToCanvas(text, canvas, options);
  return canvas.toDataURL('image/png');
}

// ============================================================================
// 6. DUAL PAYLOAD GENERATOR & PARSER (Feature 9 & Feature 11)
// ============================================================================

/**
 * Generate Dual QR Payload (Offline JSON metadata + Live Verification URL)
 * @param {Object} member - Member profile object
 * @param {string} [baseUrl] - Base application host URL
 * @returns {{ offlineData: string, verifyUrl: string, combinedString: string }}
 */
export function generateQrPayload(member, baseUrl) {
  if (!member || !member.studyId) {
    throw new Error('[QRCode] Invalid member object: studyId is required');
  }

  const defaultHost = (typeof window !== 'undefined' && window.location && window.location.origin)
    ? window.location.origin
    : 'https://studysync-al-2026.web.app';
    
  const host = baseUrl || defaultHost;
  const cleanId = encodeURIComponent(member.studyId);
  const verifyUrl = `${host}/#verify/${cleanId}`;

  const offlineObj = {
    id: member.studyId,
    name: member.fullName || member.name || '',
    stream: member.stream || '',
    school: member.school || '',
    regDate: member.registrationDate || new Date().toISOString().substring(0, 10)
  };

  const offlineJson = JSON.stringify(offlineObj);
  const combinedString = `STUDYSYNC|${member.studyId}|${verifyUrl}|${offlineJson}`;

  return {
    offlineData: offlineJson,
    verifyUrl: verifyUrl,
    combinedString: combinedString
  };
}


/**
 * Parse and decode QR code string back into structured payload
 * @param {string} payloadString 
 * @returns {Object|null}
 */
export function parseQrPayload(payloadString) {
  if (!payloadString || typeof payloadString !== 'string') return null;

  // Format 1: Combined protocol string: STUDYSYNC|{studyId}|{verifyUrl}|{json}
  if (payloadString.startsWith('STUDYSYNC|')) {
    const parts = payloadString.split('|');
    try {
      const offlineData = JSON.parse(parts.slice(3).join('|'));
      return {
        type: 'STUDYSYNC_DUAL',
        studyId: parts[1],
        verifyUrl: parts[2],
        offlineData
      };
    } catch (_) {
      return {
        type: 'STUDYSYNC_DUAL',
        studyId: parts[1],
        verifyUrl: parts[2],
        offlineData: null
      };
    }
  }

  // Format 2: Pure JSON object payload
  try {
    const parsed = JSON.parse(payloadString);
    if (parsed && (parsed.id || parsed.studyId)) {
      const studyId = parsed.id || parsed.studyId;
      return {
        type: 'STUDYSYNC_JSON',
        studyId: studyId,
        verifyUrl: `/#verify/${encodeURIComponent(studyId)}`,
        offlineData: parsed
      };
    }
  } catch (_) {}

  // Format 3: Direct URL string containing #verify/ID or verify.html?id=ID
  const urlMatch = payloadString.match(/(?:#verify\/|[?&]id=)([A-Za-z0-9\-]+)/i);
  if (urlMatch) {
    return {
      type: 'STUDYSYNC_URL',
      studyId: urlMatch[1].toUpperCase(),
      verifyUrl: payloadString,
      offlineData: null
    };
  }

  return null;
}

export default {
  generateQrMatrix,
  renderQrToCanvas,
  qrToDataUrl,
  generateQrPayload,
  parseQrPayload
};
