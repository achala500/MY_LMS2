/**
 * StudySync E2E Test Harness & Authoritative Domain Engine
 * 
 * Provides opaque-box simulation, validation rules, and domain models
 * strictly derived from ORIGINAL_REQUEST.md, PROJECT.md, and TEST_INFRA.md.
 */

import assert from 'node:assert';

// 260+ Sri Lankan National/Popular Schools Reference Dataset
export const SRI_LANKAN_SCHOOLS = [
  "Royal College, Colombo",
  "Ananda College, Colombo",
  "Nalanda College, Colombo",
  "Visakha Vidyalaya, Colombo",
  "Devi Balika Vidyalaya, Colombo",
  "Sirimavo Bandaranaike Vidyalaya, Colombo",
  "St. Joseph's College, Colombo",
  "St. Peter's College, Colombo",
  "D.S. Senanayake College, Colombo",
  "Mahanama College, Colombo",
  "Thurstan College, Colombo",
  "Musaeus College, Colombo",
  "Ladies' College, Colombo",
  "Bishop's College, Colombo",
  "Methodist College, Colombo",
  "St. Bridget's Convent, Colombo",
  "Holy Family Convent, Colombo",
  "Isipathana College, Colombo",
  "Lumbini College, Colombo",
  "Asoka Vidyalaya, Colombo",
  "Anula Vidyalaya, Nugegoda",
  "St. John's College, Nugegoda",
  "Samudradevi Balika Vidyalaya, Nugegoda",
  "Dharmapala Vidyalaya, Pannipitiya",
  "President's College, Maharagama",
  "Sri Subhuthi National School, Battaramulla",
  "Prince of Wales' College, Moratuwa",
  "Princess of Wales' College, Moratuwa",
  "St. Sebastian's College, Moratuwa",
  "Moratu Maha Vidyalaya, Moratuwa",
  "De Mazenod College, Kandana",
  "Maris Stella College, Negombo",
  "Newstead Girls' College, Negombo",
  "Harischandra National College, Negombo",
  "Loyola College, Negombo",
  "Bandaranayake College, Gampaha",
  "Rathnavali Balika Vidyalaya, Gampaha",
  "Holy Cross College, Gampaha",
  "Yasodara Devi Balika Maha Vidyalaya, Gampaha",
  "Galahitiyawa Central College, Ganemulla",
  "Gurukula College, Kelaniya",
  "Sri Dharmaloka College, Kelaniya",
  "Vidyalankara Maha Vidyalaya, Kelaniya",
  "Sapugaskanda Maha Vidyalaya, Makola",
  "Al-Hilal Central College, Negombo",
  "Bandaranayake Central College, Veyangoda",
  "Taxila Central College, Horana",
  "Sri Palee College, Horana",
  "C.W.W. Kannangara Central College, Mathugama",
  "St. Mary's College, Matugama",
  "Ananda Sastralaya, Matugama",
  "Kalutara Vidyalaya, Kalutara",
  "Balika Vidyalaya, Kalutara",
  "Holy Cross College, Kalutara",
  "Tissa Central College, Kalutara",
  "Miriswatta National School, Dodangoda",
  "Dharmaraja College, Kandy",
  "Kingswood College, Kandy",
  "Trinity College, Kandy",
  "St. Anthony's College, Kandy",
  "Vidyartha College, Kandy",
  "Sri Rahula College, Katugastota",
  "Mahamaya Girls' College, Kandy",
  "High School, Kandy",
  "Pushpadana Girls' College, Kandy",
  "St. Anthony's Girls' College, Kandy",
  "Hillwood College, Kandy",
  "Good Shepherd Convent, Kandy",
  "Vihara Maha Devi Balika Vidyalaya, Kandy",
  "Dharmashoka College, Ambalangoda",
  "Sri Devananda College, Ambalangoda",
  "P. de S. Kularatne Maha Vidyalaya, Ambalangoda",
  "Mahinda College, Galle",
  "Richmond College, Galle",
  "St. Aloysius' College, Galle",
  "Southlands College, Galle",
  "Rippon Girls' Collective, Galle",
  "Sanghamitta Balika Vidyalaya, Galle",
  "Vidyaloka College, Galle",
  "St. Thomas' College, Matara",
  "Rahula College, Matara",
  "Sujatha Vidyalaya, Matara",
  "St. Servatius' College, Matara",
  "St. Thomas' Girls' High School, Matara",
  "Matara Central College, Matara",
  "Dickwella Vijitha Central College, Dickwella",
  "Ananda Maithreya Central College, Balangoda",
  "Rathnaloka College, Balangoda",
  "Sivali Central College, Ratnapura",
  "Ferguson High School, Ratnapura",
  "St. Aloysius College, Ratnapura",
  "Sumana Balika Vidyalaya, Ratnapura",
  "Rambuka Maha Vidyalaya, Ratnapura",
  "Maliyadeva College, Kurunegala",
  "Maliyadeva Balika Vidyalaya, Kurunegala",
  "St. Anne's College, Kurunegala",
  "Holy Family Convent, Kurunegala",
  "Sir John Kotalawala Maha Vidyalaya, Kurunegala",
  "Wayamba Royal College, Kurunegala",
  "Ibbagamuwa Central College, Ibbagamuwa",
  "Kuliyapitiya Central College, Kuliyapitiya",
  "Holy Infant Jesus Convent, Kuliyapitiya",
  "Dharmasoka Central College, Rekawa",
  "Anuradhapura Central College, Anuradhapura",
  "Swarnapali Balika Maha Vidyalaya, Anuradhapura",
  "St. Joseph's College, Anuradhapura",
  "Walisinghe Harischandra Maha Vidyalaya, Anuradhapura",
  "Niwanthaka Chethiya Maha Vidyalaya, Anuradhapura",
  "Jaffna Central College, Jaffna",
  "Jaffna Hindu College, Jaffna",
  "St. John's College, Jaffna",
  "St. Patrick's College, Jaffna",
  "Vembadi Girls' High School, Jaffna",
  "Chundikuli Girls' College, Jaffna",
  "Hartley College, Point Pedro",
  "Methodist Girls' High School, Point Pedro",
  "Vada Hindu Ladies' College, Point Pedro",
  "Batticaloa Hindu College, Batticaloa",
  "St. Michael's College, Batticaloa",
  "Vincent Girls' High School, Batticaloa",
  "Shivananda Vidyalaya, Batticaloa",
  "Trinity College, Batticaloa",
  "St. Joseph's College, Trincomalee",
  "R.K.M. Sri Koneswara Hindu College, Trincomalee",
  "Orr's Hill Vivekananda College, Trincomalee",
  "St. Mary's College, Trincomalee",
  "Zahira College, Colombo",
  "Zahira College, Gampola",
  "Badulla Central College, Badulla",
  "Dharmadutha College, Badulla",
  "Uva College, Badulla",
  "Visakha Girls' High School, Badulla",
  "Bandarawela Central College, Bandarawela",
  "St. Joseph's College, Bandarawela",
  "Visakha Balika Vidyalaya, Bandarawela",
  "Dharmapala College, Bandarawela",
  "Kegalu Vidyalaya, Kegalle",
  "St. Joseph's Balika Maha Vidyalaya, Kegalle",
  "Kegalu Balika Vidyalaya, Kegalle",
  "St. Mary's College, Kegalle",
  "Pinnawala Central College, Rambukkana",
  "Swarna Jayanthi Maha Vidyalaya, Kegalle",
  "Dudley Senanayake Central College, Tholangamuwa",
  "St. Thomas' College, Mount Lavinia",
  "St. Thomas' Preparatory School, Kollupitiya",
  "St. Thomas' College, Gurutalawa",
  "St. Thomas' College, Bandarawela",
  "Sri Sumangala College, Panadura",
  "Sri Sumangala Balika Maha Vidyalaya, Panadura",
  "St. John's College, Panadura",
  "Agamethi Balika Vidyalaya, Panadura",
  "Jeelan Central College, Panadura",
  "Royal College, Panadura",
  "St. Anthony's College, Wattala",
  "Good Shepherd Convent, Kotahena",
  "St. Benedict's College, Kotahena",
  "Cathedral College, Kotahena",
  "Wolfendhal Girls' High School, Colombo",
  "Carey College, Colombo",
  "Wesley College, Colombo",
  "C.W.W. Kannangara Vidyalaya, Colombo",
  "T.B. Jayah Zahira Maha Vidyalaya, Colombo",
  "Al-Hikma College, Colombo",
  "Hamid Al Husseinie College, Colombo",
  "St. Paul's Girls' School, Milagiriya",
  "Sirimavo Bandaranaike Balika Vidyalaya, Matale",
  "Vijaya College, Matale",
  "Christ Church College, Matale",
  "St. Thomas' College, Matale",
  "Zahira College, Matale",
  "Pakkiyam National College, Matale",
  "Government Science College, Matale",
  "Poramadulla Central College, Rikillagaskada",
  "Gamini Dissanayake National School, Hasalaka",
  "Pallebowala Maha Vidyalaya, Hanguranketha",
  "Nannapurawa Maha Vidyalaya, Bibile",
  "Wellawaya Central College, Wellawaya",
  "Mahanama Central College, Monaragala",
  "Royal College, Monaragala",
  "Medagama National School, Medagama",
  "Bibile Central College, Bibile",
  "Vijayaba Central College, Maho",
  "Maliyadeva Model School, Kurunegala",
  "Royal College, Polonnaruwa",
  "Topawewa Maha Vidyalaya, Polonnaruwa",
  "Minneriya National School, Minneriya",
  "Medirigiriya National School, Medirigiriya",
  "Manampitiya Sinhala Maha Vidyalaya, Manampitiya",
  "Sewamuktha Kandakkadu Maha Vidyalaya, Polonnaruwa",
  "Kekirawa Central College, Kekirawa",
  "Thalawa Maha Vidyalaya, Thalawa",
  "Tambuttegama Central College, Tambuttegama",
  "Eppawala Siddhartha Central College, Eppawala",
  "Habarana Maha Vidyalaya, Habarana",
  "Galenbindunuwewa Central College, Galenbindunuwewa",
  "Kahathagasdigiliya Central College, Kahathagasdigiliya",
  "Horowpathana Central College, Horowpathana",
  "Medawachchiya Maithripala Senanayake Central College, Medawachchiya",
  "St. Anne's Balika Maha Vidyalaya, Madampe",
  "Senanayake Central College, Madampe",
  "Dhammananda Maha Vidyalaya, Moratuwa",
  "Sri Chandrasekara Maha Vidyalaya, Horethuduwa",
  "Hapugala Maha Vidyalaya, Galle",
  "Batapola Central College, Batapola",
  "Uragasmanhandiya Central College, Uragasmanhandiya",
  "Karandeniya Central College, Karandeniya",
  "Elpitiya Ananda Central College, Elpitiya",
  "Nalanda Boys' Central College, Minuwangoda",
  "Nalanda Girls' Central College, Minuwangoda",
  "President's College, Minuwangoda",
  "Dewalapola Ananda Maha Vidyalaya, Dewalapola",
  "Hunupitiya Bandaranayake Maha Vidyalaya, Wattala",
  "Mahabodhi Vidyalaya, Colombo",
  "Gothami Balika Vidyalaya, Colombo",
  "Rathnawali Balika Maha Vidyalaya, Borella",
  "Susamayawardhana Vidyalaya, Borella",
  "All Saints' College, Colombo",
  "St. Sebastian's Maha Vidyalaya, Colombo",
  "Kotahena Central College, Colombo",
  "Mutwal Hindu College, Colombo",
  "Vivekananda College, Colombo",
  "Ramanathan Hindu Ladies' College, Colombo",
  "Saiva Mangaiyar Vidyalayam, Colombo",
  "Hindu College, Colombo",
  "S. Thomas' College, Kotte",
  "Ananda Sastralaya, Kotte",
  "Sri Jayawardenepura Maha Vidyalaya, Kotte",
  "President's College, Kotte",
  "St. Thomas' Boys' School, Matara",
  "Mahinda Rajapaksa College, Homagama",
  "Dharmapala Balika Vidyalaya, Pannipitiya",
  "Lalith Athulathmudali College, Mount Lavinia",
  "Science College, Mount Lavinia",
  "Budhdhadaththa Maha Vidyalaya, Balapitiya",
  "Revatha College, Balapitiya",
  "Siddartha Central College, Balapitiya",
  "Devapathiraja Central College, Ratgama",
  "Siridhamma College, Labuduwa, Galle",
  "Madampa Central College, Kuleegoda",
  "Galle Fort High School, Galle",
  "Galle Central College, Galle",
  "Janadhipathi Balika Vidyalaya, Galle",
  "Sudharma Vidyalaya, Galle",
  "Piliyandala Central College, Piliyandala",
  "Mampe Dharmaraja Maha Vidyalaya, Piliyandala",
  "Kesbewa Dharmasena Attygalle Balika Vidyalaya, Kesbewa",
  "Moraketiya Maha Vidyalaya, Embilipitiya",
  "Embilipitiya President's College, Embilipitiya",
  "Bodhiraja Central College, Embilipitiya",
  "Kolonna Central College, Kolonna",
  "Godakawela Rahula Central College, Godakawela",
  "Kuruwita Central College, Kuruwita",
  "Eheliyagoda Central College, Eheliyagoda",
  "Dehiowita National School, Dehiowita",
  "Ruwanwella Rajasinghe Central College, Ruwanwella",
  "St. Gabriel's Girls' College, Yatiyantota",
  "Dr. N.M. Perera Central College, Yatiyantota",
  "Nooraniya Muslim Maha Vidyalaya, Uyanwatta",
  "Zahira National College, Dharga Town",
  "Al-Humaisara National School, Beruwala",
  "Naleem Hajiar Girls' College, Beruwala",
  "Zam Refai Hajiar Maha Vidyalaya, Beruwala",
  "Ilangovan Central College, Hatton",
  "Highlands College, Hatton",
  "St. Gabriel's Girls' High School, Hatton",
  "St. John Bosco's College, Hatton",
  "Gamini National School, Nuwara Eliya",
  "Holy Trinity Central College, Nuwara Eliya",
  "Good Shepherd Convent, Nuwara Eliya",
  "St. Xavier's College, Nuwara Eliya"
];

// Admin Whitelist Configuration
export const ADMIN_WHITELIST = [
  "admin@studysync.lk",
  "alwis@gmail.com",
  "alwisachalaanurada@gmail.com",
  "lead.admin@studysync.lk"
];

/**
 * Autocomplete Filter for Schools
 */
export function filterSchools(query, maxResults = 10) {
  if (!query || typeof query !== 'string') return [];
  const cleanQuery = query.trim().toLowerCase();
  if (cleanQuery.length === 0) return [];
  
  return SRI_LANKAN_SCHOOLS.filter(s => s.toLowerCase().includes(cleanQuery)).slice(0, maxResults);
}

/**
 * Stream & Subject Definition Engine
 */
export const STREAMS = {
  BIO: "Biological Science",
  MATHS: "Physical Science"
};

export const STREAM_SUBJECTS = {
  [STREAMS.BIO]: {
    mandatory: ["Biology", "Chemistry"],
    optionalChoices: ["Physics", "Agriculture"]
  },
  [STREAMS.MATHS]: {
    mandatory: ["Combined Maths", "Physics"],
    optionalChoices: ["Chemistry", "ICT"]
  }
};

/**
 * Returns the exact 3 subjects for a student given their stream and optional subject choice.
 */
export function getStudentSubjects(stream, optionalSubject) {
  const streamDef = STREAM_SUBJECTS[stream];
  if (!streamDef) {
    throw new Error(`Invalid stream: ${stream}`);
  }
  
  if (!streamDef.optionalChoices.includes(optionalSubject)) {
    throw new Error(`Invalid optional subject '${optionalSubject}' for stream '${stream}'. Allowed: ${streamDef.optionalChoices.join(', ')}`);
  }
  
  return [...streamDef.mandatory, optionalSubject];
}

/**
 * Slider Qualitative Badge Formatter
 */
export function getFocusBadge(level) {
  const val = Math.round(Number(level));
  if (val < 1 || val > 10 || isNaN(val)) throw new Error(`Focus level must be integer 1-10, got ${level}`);
  if (val <= 3) return { text: "Distracted / Low", color: "rose", level: val };
  if (val <= 7) return { text: "Moderate / Steady", color: "amber", level: val };
  return { text: "High / Deep Flow", color: "emerald", level: val };
}

export function getProductivityBadge(level) {
  const val = Math.round(Number(level));
  if (val < 1 || val > 10 || isNaN(val)) throw new Error(`Productivity level must be integer 1-10, got ${level}`);
  if (val <= 3) return { text: "Slow Progress", color: "rose", level: val };
  if (val <= 7) return { text: "Consistent Progress", color: "amber", level: val };
  return { text: "Maximum Output / Mastery", color: "emerald", level: val };
}

/**
 * Study Streak Mathematical Calculator
 * Computes consecutive study days backwards from today/yesterday.
 */
export function calculateStreak(studyDates, referenceDate = new Date()) {
  if (!studyDates || studyDates.length === 0) return 0;
  
  // Normalize dates to YYYY-MM-DD strings and sort descending
  const uniqueDates = Array.from(new Set(studyDates.map(d => {
    if (typeof d === 'string') return d.substring(0, 10);
    const dateObj = new Date(d);
    return dateObj.toISOString().substring(0, 10);
  }))).sort().reverse();
  
  if (uniqueDates.length === 0) return 0;
  
  const refIso = typeof referenceDate === 'string' 
    ? referenceDate.substring(0, 10) 
    : new Date(referenceDate).toISOString().substring(0, 10);
  
  // Calculate difference in calendar days
  function daysBetween(dateStr1, dateStr2) {
    const d1 = new Date(dateStr1 + "T00:00:00Z");
    const d2 = new Date(dateStr2 + "T00:00:00Z");
    const diffMs = d1.getTime() - d2.getTime();
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
  }
  
  const latestStudyDate = uniqueDates[0];
  const diffFromRef = daysBetween(refIso, latestStudyDate);
  
  // If latest study date is more than 1 day before reference, streak is broken (0)
  if (diffFromRef > 1) {
    return 0;
  }
  
  // Consecutive streak counter
  let streak = 1;
  for (let i = 0; i < uniqueDates.length - 1; i++) {
    const current = uniqueDates[i];
    const previous = uniqueDates[i + 1];
    const diff = daysBetween(current, previous);
    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

/**
 * Personal Metrics Rollup Calculator
 */
export function calculateStudentMetrics(logs) {
  if (!logs || logs.length === 0) {
    return {
      totalHours: 0,
      perSubjectHours: {},
      avgFocus: 0,
      avgProductivity: 0,
      totalEntries: 0
    };
  }
  
  let totalHours = 0;
  const perSubjectHours = {};
  let totalFocus = 0;
  let totalProductivity = 0;
  let subjectCount = 0;
  
  for (const log of logs) {
    for (const sub of log.subjects) {
      const hours = Number(sub.hours) || 0;
      const focus = Number(sub.focus) || 0;
      const prod = Number(sub.productivity) || 0;
      
      totalHours += hours;
      perSubjectHours[sub.name] = (perSubjectHours[sub.name] || 0) + hours;
      
      totalFocus += focus;
      totalProductivity += prod;
      subjectCount++;
    }
  }
  
  return {
    totalHours: Number(totalHours.toFixed(2)),
    perSubjectHours: Object.fromEntries(
      Object.entries(perSubjectHours).map(([k, v]) => [k, Number(v.toFixed(2))])
    ),
    avgFocus: subjectCount > 0 ? Number((totalFocus / subjectCount).toFixed(2)) : 0,
    avgProductivity: subjectCount > 0 ? Number((totalProductivity / subjectCount).toFixed(2)) : 0,
    totalEntries: logs.length
  };
}

/**
 * QR Code Dual Payload Generator & Decoder
 */
export function generateQrPayload(member, baseUrl = "https://studysync.lk") {
  if (!member || !member.studyId) throw new Error("Invalid member object for QR generation");
  
  const offlineJson = JSON.stringify({
    id: member.studyId,
    name: member.fullName,
    stream: member.stream,
    school: member.school,
    regDate: member.registrationDate
  });
  
  const verifyUrl = `${baseUrl}/#verify/${encodeURIComponent(member.studyId)}`;
  
  return {
    offlineData: offlineJson,
    verifyUrl: verifyUrl,
    combinedString: `STUDYSYNC|${member.studyId}|${verifyUrl}|${offlineJson}`
  };
}

export function parseQrPayload(payloadString) {
  if (!payloadString || typeof payloadString !== 'string') return null;
  
  if (payloadString.startsWith('STUDYSYNC|')) {
    const parts = payloadString.split('|');
    try {
      return {
        type: 'STUDYSYNC_DUAL',
        studyId: parts[1],
        verifyUrl: parts[2],
        offlineData: JSON.parse(parts.slice(3).join('|'))
      };
    } catch (e) {
      return null;
    }
  }
  
  // Check if pure JSON
  try {
    const parsed = JSON.parse(payloadString);
    if (parsed.id) {
      return {
        type: 'STUDYSYNC_JSON',
        studyId: parsed.id,
        offlineData: parsed,
        verifyUrl: `/#verify/${parsed.id}`
      };
    }
  } catch (e) {
    // Not raw JSON
  }
  
  return null;
}

/**
 * Normalizes a Telegram username or URL handle:
 * - Strips URL prefixes (https://t.me/, t.me/, etc.)
 * - Strips leading '@'
 * - Strips invalid characters (keeps [a-zA-Z0-9_])
 * - Lowercases the handle
 * - Prepends '@' if result has length >= 1
 */
export function normalizeTelegramUsername(handle) {
  if (!handle) return "";
  let str = String(handle).trim();
  str = str.replace(/^(https?:\/\/)?(www\.)?(t\.me|telegram\.me)\//i, "");
  if (str.startsWith("@")) {
    str = str.substring(1);
  }
  str = str.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase();
  return str.length > 0 ? `@${str}` : "";
}

/**
 * Checks if a string is a valid Telegram handle
 */
export function isValidTelegramHandle(handle) {
  if (!handle) return false;
  const normalized = normalizeTelegramUsername(handle);
  if (!normalized || !normalized.startsWith('@')) return false;
  const raw = normalized.substring(1);
  return raw.length >= 3 && raw.length <= 32;
}

/**
 * Formats a clean Telegram markdown daily digest summary
 */
export function formatTelegramDigest(analytics = {}, leaderboard = [], dateVal = new Date()) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const d = dateVal instanceof Date ? dateVal : new Date(dateVal);
  const dayOfWeek = days[d.getDay()];
  const formattedDate = `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;

  const totalMembers = analytics?.totalMembers || (Array.isArray(leaderboard) ? leaderboard.length : 0);
  const activeToday = analytics?.activeToday || (Array.isArray(leaderboard) ? leaderboard.filter(l => (l.todayHours && l.todayHours > 0) || l.studiedToday).length : 0);
  const participationRate = totalMembers > 0 ? ((activeToday / totalMembers) * 100).toFixed(0) : "0";
  
  const totalTodayHours = Number(analytics?.totalTodayHours || analytics?.todayHours || 0);
  const avgHoursPerStudent = activeToday > 0 ? totalTodayHours / activeToday : 0;
  
  const bioStats = analytics?.streamBreakdown?.['Biological Science'] || analytics?.streamBreakdown?.bio || { totalHours: 0, members: 0 };
  const mathStats = analytics?.streamBreakdown?.['Physical Science'] || analytics?.streamBreakdown?.maths || { totalHours: 0, members: 0 };
  
  const bioHours = Number(bioStats.todayHours ?? bioStats.totalHours ?? 0);
  const bioCount = Number(bioStats.activeToday ?? bioStats.members ?? 0);
  const mathHours = Number(mathStats.todayHours ?? mathStats.totalHours ?? 0);
  const mathCount = Number(mathStats.activeToday ?? mathStats.members ?? 0);
  
  const avgGroupFocus = Number(analytics?.avgGroupFocus || 8.0);
  
  const topList = Array.isArray(leaderboard) ? leaderboard.slice(0, 5) : [];
  const medals = ["🥇 1.", "🥈 2.", "🥉 3.", "4️⃣ 4.", "5️⃣ 5."];
  
  let leaderboardText = "";
  if (topList.length === 0) {
    leaderboardText = "• _No entries yet_";
  } else {
    leaderboardText = topList.map((entry, idx) => {
      const medal = medals[idx] || `${idx + 1}.`;
      const name = entry.name || entry.fullName || "Student";
      const id = entry.studyId || "";
      const streak = entry.streak ?? entry.activeStreak ?? 0;
      const hours = Number(entry.totalHours || 0).toFixed(1);
      const school = entry.school || "A/L Candidate";
      return `${medal} *${name}* (\`${id}\`) — 🔥 *${streak} Days* (${hours}h) • ${school}`;
    }).join("\n");
  }

  const mvpVolume = analytics?.mvpVolume || (topList[0] ? { name: topList[0].name || topList[0].fullName, hours: topList[0].todayHours || topList[0].totalHours } : null);
  const mvpFocus = analytics?.mvpFocus || (topList[0] ? { name: topList[0].name || topList[0].fullName, focus: topList[0].avgFocus || 9 } : null);

  const pendingCount = Math.max(0, totalMembers - activeToday);

  return [
    `📢 *STUDYSYNC DAILY ACCOUNTABILITY DIGEST*`,
    `📅 *Date:* ${dayOfWeek}, ${formattedDate}`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    ``,
    `📊 *COMMUNITY PULSE*`,
    `• 👥 *Active Today:* *${activeToday} / ${totalMembers} (${participationRate}%)*`,
    `• ⏱️ *Total Study Hours:* *${totalTodayHours.toFixed(1)} hrs*`,
    `• 📈 *Average Study Time:* *${avgHoursPerStudent.toFixed(2)} hrs / student*`,
    `• 🧬 *Biological Science:* *${bioHours.toFixed(1)} hrs* (${bioCount} students)`,
    `• 📐 *Physical Science:* *${mathHours.toFixed(1)} hrs* (${mathCount} students)`,
    `• ⚡ *Group Focus Index:* *${avgGroupFocus.toFixed(1)} / 10*`,
    ``,
    `🔥 *STREAK HALL OF FAME (TOP 5)*`,
    leaderboardText,
    ``,
    `🌟 *TODAY'S STUDY MVPS*`,
    mvpVolume ? `👑 *Highest Volume:* *${mvpVolume.name}* (*${Number(mvpVolume.hours || 0).toFixed(1)} hrs*)` : `👑 *Highest Volume:* _Pending submissions_`,
    mvpFocus ? `🎯 *Deep Flow:* *${mvpFocus.name}* (*${Number(mvpFocus.focus || 0).toFixed(1)}/10 Focus*)` : `🎯 *Deep Flow:* _Pending submissions_`,
    ``,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `⚠️ *Streak Alert:* ${pendingCount} students have pending daily submissions.`,
    `Submit before 23:59 to keep your streak alive!`,
    `👉 *Log Study Hours:* https://studysync-al-2026.web.app/daily`
  ].join("\n");
}

/**
 * 3-Sheet In-Memory Normalized Database Simulator
 */
export class StudySyncDatabase {
  constructor() {
    this.sheets = {
      // Exactly 10 columns: Study ID, Full Name, Email, Gender, Telegram, School, Stream, Optional Subject, Registration Date, Status
      Members: [],
      // Exactly 19 columns: Timestamp, Study ID, Email, Date of Study, Sub1 Name, Sub1 Hours, Sub1 Focus, Sub1 Prod, Sub2 Name, Sub2 Hours, Sub2 Focus, Sub2 Prod, Sub3 Name, Sub3 Hours, Sub3 Focus, Sub3 Prod, Notes, Telegram, Proof URL
      DailyLogs: [],
      Analytics: {}
    };
    this.bioCounter = 0;
    this.mathsCounter = 0;
  }
  
  static MEMBERS_COLUMNS = [
    "Study ID", "Full Name", "Email", "Gender", "Telegram Username", 
    "School", "Stream", "Optional Subject", "Registration Date", "Status"
  ];
  
  static DAILY_LOGS_COLUMNS = [
    "Timestamp", "Study ID", "Email", "Date of Study",
    "Subject 1 Name", "Subject 1 Hours", "Subject 1 Focus", "Subject 1 Productivity",
    "Subject 2 Name", "Subject 2 Hours", "Subject 2 Focus", "Subject 2 Productivity",
    "Subject 3 Name", "Subject 3 Hours", "Subject 3 Focus", "Subject 3 Productivity",
    "Notes", "Telegram", "Proof Photo URL"
  ];

  generateStudyId(stream) {
    if (stream === STREAMS.BIO) {
      this.bioCounter++;
      return `SG-BIO-${String(this.bioCounter).padStart(4, '0')}`;
    } else if (stream === STREAMS.MATHS) {
      this.mathsCounter++;
      return `SG-MATH-${String(this.mathsCounter).padStart(4, '0')}`;
    }
    throw new Error(`Unknown stream: ${stream}`);
  }

  registerMember({ fullName, email, gender, telegram, school, stream, optionalSubject }) {
    if (!email || !email.includes('@')) throw new Error("Valid email is required");
    const normalizedEmail = email.trim().toLowerCase();
    
    // Enforce 1:1 unique email key
    const existing = this.sheets.Members.find(m => m.Email.toLowerCase() === normalizedEmail);
    if (existing) {
      throw new Error(`Member with email ${normalizedEmail} already exists (${existing['Study ID']})`);
    }
    
    // Validate stream and optional subject
    const subjects = getStudentSubjects(stream, optionalSubject);
    const studyId = this.generateStudyId(stream);
    const regDate = new Date().toISOString().substring(0, 10);
    
    const memberRow = {
      "Study ID": studyId,
      "Full Name": fullName.trim(),
      "Email": normalizedEmail,
      "Gender": gender,
      "Telegram Username": telegram.startsWith('@') ? telegram : `@${telegram}`,
      "School": school.trim(),
      "Stream": stream,
      "Optional Subject": optionalSubject,
      "Registration Date": regDate,
      "Status": "Active"
    };
    
    this.sheets.Members.push(memberRow);
    return { ...memberRow, subjects };
  }

  getMemberByEmail(email) {
    if (!email) return null;
    const normalized = email.trim().toLowerCase();
    const row = this.sheets.Members.find(m => m.Email.toLowerCase() === normalized);
    if (!row) return null;
    return {
      studyId: row["Study ID"],
      fullName: row["Full Name"],
      email: row["Email"],
      gender: row["Gender"],
      telegram: row["Telegram Username"],
      school: row["School"],
      stream: row["Stream"],
      optionalSubject: row["Optional Subject"],
      registrationDate: row["Registration Date"],
      status: row["Status"]
    };
  }

  getMemberByStudyId(studyId) {
    if (!studyId) return null;
    const row = this.sheets.Members.find(m => m["Study ID"] === studyId);
    if (!row) return null;
    return {
      studyId: row["Study ID"],
      fullName: row["Full Name"],
      email: row["Email"],
      gender: row["Gender"],
      telegram: row["Telegram Username"],
      school: row["School"],
      stream: row["Stream"],
      optionalSubject: row["Optional Subject"],
      registrationDate: row["Registration Date"],
      status: row["Status"]
    };
  }

  submitDailyLog({ studyId, email, dateOfStudy, subjects, notes = "", telegram = "", proofPhotoUrl = "" }) {
    const member = this.getMemberByStudyId(studyId);
    if (!member) throw new Error(`Foreign Key Violation: Study ID ${studyId} does not exist in Members`);
    
    if (member.email.toLowerCase() !== email.trim().toLowerCase()) {
      throw new Error(`Email mismatch for Study ID ${studyId}`);
    }
    
    const targetDate = dateOfStudy ? dateOfStudy.substring(0, 10) : new Date().toISOString().substring(0, 10);
    
    // Enforce 1 submission per day per student
    const existing = this.sheets.DailyLogs.find(
      l => l["Study ID"] === studyId && l["Date of Study"] === targetDate
    );
    if (existing) {
      return {
        isDuplicate: true,
        message: "You have already submitted your study log for today.",
        existingLog: existing
      };
    }
    
    if (!subjects || subjects.length !== 3) {
      throw new Error("Exactly 3 subjects must be submitted");
    }
    
    // Validate subject names match student stream
    const expectedSubjects = getStudentSubjects(member.stream, member.optionalSubject);
    for (let i = 0; i < 3; i++) {
      if (subjects[i].name !== expectedSubjects[i]) {
        throw new Error(`Invalid subject at index ${i}: Expected ${expectedSubjects[i]}, got ${subjects[i].name}`);
      }
      const hrs = Number(subjects[i].hours);
      if (isNaN(hrs) || hrs < 0 || hrs > 24) {
        throw new Error(`Subject hours must be between 0 and 24, got ${subjects[i].hours}`);
      }
      getFocusBadge(subjects[i].focus);
      getProductivityBadge(subjects[i].productivity);
    }
    
    const timestamp = new Date().toISOString();
    const safeProofPhotoUrl = proofPhotoUrl || "";
    const logRow = {
      "Timestamp": timestamp,
      "Study ID": studyId,
      "Email": member.email,
      "Date of Study": targetDate,
      "Subject 1 Name": subjects[0].name,
      "Subject 1 Hours": Number(subjects[0].hours),
      "Subject 1 Focus": Number(subjects[0].focus),
      "Subject 1 Productivity": Number(subjects[0].productivity),
      "Subject 2 Name": subjects[1].name,
      "Subject 2 Hours": Number(subjects[1].hours),
      "Subject 2 Focus": Number(subjects[1].focus),
      "Subject 2 Productivity": Number(subjects[1].productivity),
      "Subject 3 Name": subjects[2].name,
      "Subject 3 Hours": Number(subjects[2].hours),
      "Subject 3 Focus": Number(subjects[2].focus),
      "Subject 3 Productivity": Number(subjects[2].productivity),
      "Notes": notes,
      "Telegram": telegram || member.telegram,
      "Proof Photo URL": safeProofPhotoUrl
    };
    
    this.sheets.DailyLogs.push(logRow);
    const totalHours = Number((logRow["Subject 1 Hours"] + logRow["Subject 2 Hours"] + logRow["Subject 3 Hours"]).toFixed(2));
    
    return {
      isDuplicate: false,
      logId: `LOG-${this.sheets.DailyLogs.length}`,
      studyId,
      dateOfStudy: targetDate,
      totalHours,
      proofPhotoUrl: safeProofPhotoUrl,
      rawRow: logRow
    };
  }

  getStudentLogs(studyId) {
    return this.sheets.DailyLogs
      .filter(l => l["Study ID"] === studyId)
      .map(l => ({
        timestamp: l["Timestamp"],
        studyId: l["Study ID"],
        email: l["Email"],
        dateOfStudy: l["Date of Study"],
        subjects: [
          { name: l["Subject 1 Name"], hours: l["Subject 1 Hours"], focus: l["Subject 1 Focus"], productivity: l["Subject 1 Productivity"] },
          { name: l["Subject 2 Name"], hours: l["Subject 2 Hours"], focus: l["Subject 2 Focus"], productivity: l["Subject 2 Productivity"] },
          { name: l["Subject 3 Name"], hours: l["Subject 3 Hours"], focus: l["Subject 3 Focus"], productivity: l["Subject 3 Productivity"] }
        ],
        totalHours: Number((l["Subject 1 Hours"] + l["Subject 2 Hours"] + l["Subject 3 Hours"]).toFixed(2)),
        notes: l["Notes"],
        telegram: l["Telegram"],
        proofPhotoUrl: l["Proof Photo URL"]
      }))
      .sort((a, b) => b.dateOfStudy.localeCompare(a.dateOfStudy));
  }

  getAdminAnalytics(adminEmail) {
    if (!ADMIN_WHITELIST.map(e => e.toLowerCase()).includes(adminEmail.toLowerCase())) {
      throw new Error(`Access Denied: ${adminEmail} is not a whitelisted administrator`);
    }
    
    const members = this.sheets.Members.map(m => this.getMemberByStudyId(m["Study ID"]));
    const allLogs = this.sheets.DailyLogs.map(l => ({
      studyId: l["Study ID"],
      dateOfStudy: l["Date of Study"],
      totalHours: l["Subject 1 Hours"] + l["Subject 2 Hours"] + l["Subject 3 Hours"],
      proofPhotoUrl: l["Proof Photo URL"]
    }));
    
    let totalGroupHours = 0;
    let bioHours = 0;
    let mathsHours = 0;
    
    for (const l of this.sheets.DailyLogs) {
      const member = this.getMemberByStudyId(l["Study ID"]);
      const hrs = l["Subject 1 Hours"] + l["Subject 2 Hours"] + l["Subject 3 Hours"];
      totalGroupHours += hrs;
      if (member && member.stream === STREAMS.BIO) {
        bioHours += hrs;
      } else if (member && member.stream === STREAMS.MATHS) {
        mathsHours += hrs;
      }
    }
    
    // Compute leaderboard
    const leaderboard = members.map(m => {
      const logs = this.getStudentLogs(m.studyId);
      const studyDates = logs.map(l => l.dateOfStudy);
      const streak = calculateStreak(studyDates);
      const metrics = calculateStudentMetrics(logs);
      return {
        studyId: m.studyId,
        fullName: m.fullName,
        school: m.school,
        stream: m.stream,
        streak,
        totalHours: metrics.totalHours,
        avgFocus: metrics.avgFocus,
        avgProductivity: metrics.avgProductivity
      };
    }).sort((a, b) => b.streak - a.streak || b.totalHours - a.totalHours);
    
    return {
      kpis: {
        totalMembers: members.length,
        totalLogs: this.sheets.DailyLogs.length,
        totalGroupHours: Number(totalGroupHours.toFixed(2)),
        avgDailyHoursPerActive: members.length > 0 ? Number((totalGroupHours / members.length).toFixed(2)) : 0
      },
      streamBreakdown: {
        bio: { members: members.filter(m => m.stream === STREAMS.BIO).length, totalHours: Number(bioHours.toFixed(2)) },
        maths: { members: members.filter(m => m.stream === STREAMS.MATHS).length, totalHours: Number(mathsHours.toFixed(2)) }
      },
      leaderboard
    };
  }

  getMemberByTelegram(handle) {
    if (!handle) return null;
    const target = normalizeTelegramUsername(handle);
    if (!target) return null;
    const row = this.sheets.Members.find(
      m => normalizeTelegramUsername(m["Telegram Username"]) === target
    );
    if (!row) return null;
    return {
      studyId: row["Study ID"],
      fullName: row["Full Name"],
      email: row["Email"],
      gender: row["Gender"],
      telegram: row["Telegram Username"],
      school: row["School"],
      stream: row["Stream"],
      optionalSubject: row["Optional Subject"],
      registrationDate: row["Registration Date"],
      status: row["Status"]
    };
  }

  findMemberByTelegram(handle) {
    return this.getMemberByTelegram(handle);
  }

  telegramWebhook(payload = {}) {
    const message = payload.message || payload.edited_message || (payload.callback_query ? payload.callback_query.message : null);
    const chatId = message && message.chat ? message.chat.id : (payload.chatId || 'mock_chat');
    const text = (message && message.text ? message.text : (payload.text || '')).trim();

    const parts = text.split(/\s+/);
    const rawCommand = parts[0] || (payload.command || '');
    const command = rawCommand.split('@')[0].toLowerCase();
    const args = parts.slice(1);

    const senderUsername = message && message.from && message.from.username ? message.from.username : (payload.username || '');
    const normalizedSender = normalizeTelegramUsername(senderUsername);

    switch (command) {
      case '/start': {
        const studyIdArg = args.length > 0 ? args[0].trim().toUpperCase() : '';
        if (studyIdArg && (studyIdArg.startsWith('SG-BIO-') || studyIdArg.startsWith('SG-MATH-') || /^SG-[A-Z]+-\d+$/i.test(studyIdArg))) {
          const row = this.sheets.Members.find(m => m["Study ID"] === studyIdArg);
          if (!row) {
            const notFoundMsg = `❌ *Study ID not found: ${studyIdArg}*\n\nPlease check your Study ID or register at https://studysync-al-2026.web.app/register`;
            return { handled: true, command: '/start', chatId, replyText: notFoundMsg, error: 'Study ID not found' };
          }
          if (normalizedSender) {
            row["Telegram Username"] = normalizedSender;
          }
          const member = this.getMemberByStudyId(studyIdArg);
          const welcomeMsg = `🎓 *Welcome to StudySync, ${member.fullName}!* (ID: ${member.studyId})`;
          return { handled: true, command: '/start', chatId, replyText: welcomeMsg, member, studyId: member.studyId };
        }

        if (normalizedSender) {
          const member = this.getMemberByTelegram(normalizedSender);
          if (member) {
            const welcomeBack = `🎓 *Welcome back, ${member.fullName}!*`;
            return { handled: true, command: '/start', chatId, replyText: welcomeBack, member, studyId: member.studyId };
          }
        }

        const unlinkedMsg = `👋 *Welcome to StudySync A/L Accountability Bot!* Link with /start <STUDY_ID>`;
        return { handled: true, command: '/start', chatId, replyText: unlinkedMsg };
      }

      case '/status': {
        const studyIdArg = args.length > 0 ? args[0].trim().toUpperCase() : '';
        let member = null;
        if (studyIdArg) {
          member = this.getMemberByStudyId(studyIdArg);
        } else if (normalizedSender) {
          member = this.getMemberByTelegram(normalizedSender);
        }

        if (!member) {
          return { handled: true, command: '/status', chatId, replyText: '❌ Member not found', error: 'Member not found' };
        }

        const logs = this.getStudentLogs(member.studyId);
        const streak = calculateStreak(logs.map(l => l.dateOfStudy));
        const metrics = calculateStudentMetrics(logs);
        const todayStr = new Date().toISOString().substring(0, 10);
        const studiedToday = logs.some(l => l.dateOfStudy === todayStr);

        const card = `📊 *STUDYSYNC PERFORMANCE CARD*\nStudent: ${member.fullName}\nStreak: ${streak} Days\nTotal: ${metrics.totalHours} hrs`;
        return {
          handled: true,
          command: '/status',
          chatId,
          replyText: card,
          member,
          studyId: member.studyId,
          stats: { streak, totalHours: metrics.totalHours, studiedToday }
        };
      }

      case '/log': {
        if (!normalizedSender) {
          return { handled: true, command: '/log', chatId, replyText: '❌ Telegram username required', error: 'No username' };
        }
        const member = this.getMemberByTelegram(normalizedSender);
        if (!member) {
          return { handled: true, command: '/log', chatId, replyText: '❌ Account not linked', error: 'Account not linked' };
        }

        const numMatches = [];
        let notesStartIndex = -1;
        for (let i = 0; i < args.length; i++) {
          const p = parseFloat(args[i]);
          if (!isNaN(p) && /^-?\d+(\.\d+)?$/.test(args[i]) && numMatches.length < 3) {
            numMatches.push(p);
          } else {
            notesStartIndex = i;
            break;
          }
        }

        if (numMatches.length < 3) {
          return { handled: true, command: '/log', chatId, replyText: '❌ Invalid syntax. Use /log <h1\\> <h2\\> <h3\\>', error: 'Invalid syntax' };
        }

        const [h1, h2, h3] = numMatches;
        const total = Number((h1 + h2 + h3).toFixed(2));
        if (h1 < 0 || h2 < 0 || h3 < 0 || total > 24) {
          return { handled: true, command: '/log', chatId, replyText: '❌ Hours out of bounds', error: 'Hours out of bounds' };
        }

        const notes = notesStartIndex >= 0 ? args.slice(notesStartIndex).join(' ') : '';
        const todayStr = new Date().toISOString().substring(0, 10);
        const expectedSubjects = getStudentSubjects(member.stream, member.optionalSubject);

        const logResult = this.submitDailyLog({
          studyId: member.studyId,
          email: member.email,
          dateOfStudy: todayStr,
          subjects: [
            { name: expectedSubjects[0], hours: h1, focus: 8, productivity: 8 },
            { name: expectedSubjects[1], hours: h2, focus: 8, productivity: 8 },
            { name: expectedSubjects[2], hours: h3, focus: 8, productivity: 8 }
          ],
          notes,
          telegram: normalizedSender
        });

        if (logResult.isDuplicate) {
          return { handled: true, command: '/log', chatId, replyText: '⚠️ Duplicate submission for today', isDuplicate: true };
        }

        const newStreak = calculateStreak(this.getStudentLogs(member.studyId).map(l => l.dateOfStudy));
        const receipt = `✅ Study Log Recorded! Total: ${total}h, Streak: ${newStreak} Days`;

        return {
          handled: true,
          command: '/log',
          chatId,
          replyText: receipt,
          member,
          studyId: member.studyId,
          totalHours: total,
          activeStreak: newStreak
        };
      }

      case '/leaderboard': {
        const streamFilter = args.length > 0 ? args[0].toLowerCase() : 'all';
        const adminData = this.getAdminAnalytics(ADMIN_WHITELIST[0]);
        let filtered = adminData.leaderboard;
        if (streamFilter.startsWith('bio')) {
          filtered = filtered.filter(e => e.stream === STREAMS.BIO);
        } else if (streamFilter.startsWith('math') || streamFilter.startsWith('phys')) {
          filtered = filtered.filter(e => e.stream === STREAMS.MATHS);
        }
        const text = `🏆 *STUDYSYNC STREAK LEADERBOARD*\nTop: ${filtered.slice(0, 5).map(e => `${e.fullName} (${e.streak}d)`).join(', ')}`;
        return { handled: true, command: '/leaderboard', chatId, replyText: text, count: filtered.length };
      }

      case '/remind': {
        if (!normalizedSender) {
          return { handled: true, command: '/remind', chatId, replyText: '❌ Telegram username required' };
        }
        const member = this.getMemberByTelegram(normalizedSender);
        if (!member) {
          return { handled: true, command: '/remind', chatId, replyText: '❌ Account not linked' };
        }
        const todayStr = new Date().toISOString().substring(0, 10);
        const studiedToday = this.sheets.DailyLogs.some(l => l["Study ID"] === member.studyId && l["Date of Study"] === todayStr);
        const streak = calculateStreak(this.getStudentLogs(member.studyId).map(l => l.dateOfStudy));
        const text = studiedToday 
          ? `🎉 Great job ${member.fullName}! Today's study logged. Streak: ${streak} Days`
          : `⏰ REMINDER: Hey ${member.fullName}, your ${streak}-day streak is on the line!`;
        return { handled: true, command: '/remind', chatId, replyText: text, studiedToday };
      }

      default:
        return { handled: true, command: command || 'none', chatId, replyText: 'Welcome to StudySync Bot!' };
    }
  }

  broadcastDailyDigest({ adminEmail, chatId = 'mock_chat', previewOnly = false } = {}) {
    if (!adminEmail || !ADMIN_WHITELIST.map(e => e.toLowerCase()).includes(adminEmail.toLowerCase())) {
      throw new Error(`Access Denied: ${adminEmail} is not authorized`);
    }

    const adminData = this.getAdminAnalytics(adminEmail);
    const todayStr = new Date().toISOString().substring(0, 10);
    const todayLogs = this.sheets.DailyLogs.filter(l => l["Date of Study"] === todayStr);
    const activeToday = todayLogs.length;
    const totalTodayHours = todayLogs.reduce((sum, l) => sum + (l["Subject 1 Hours"] + l["Subject 2 Hours"] + l["Subject 3 Hours"]), 0);

    const digestText = formatTelegramDigest({
      totalMembers: this.sheets.Members.length,
      activeToday,
      totalTodayHours,
      streamBreakdown: adminData.streamBreakdown
    }, adminData.leaderboard);

    return {
      broadcastSent: true,
      chatId,
      digestText,
      stats: {
        activeStudentsToday: activeToday,
        totalActiveMembers: this.sheets.Members.length,
        totalStudyHoursToday: Number(totalTodayHours.toFixed(1)),
        topStreakDays: adminData.leaderboard[0] ? adminData.leaderboard[0].streak : 0
      }
    };
  }
}

// ============================================================================
// SECURITY & RESILIENCE HELPERS (Milestone M8)
// ============================================================================

export function inspectMagicBytes(bytes) {
  if (!bytes || bytes.length < 4) {
    return { valid: false, code: 'SECURITY_FILE_TOO_SMALL', error: 'File too small.' };
  }

  // Blacklist checks
  if (bytes[0] === 0x4D && bytes[1] === 0x5A) {
    return { valid: false, code: 'MALWARE_PE_EXECUTABLE', error: 'Blocked: Windows executable.' };
  }
  if (bytes[0] === 0x7F && bytes[1] === 0x45 && bytes[2] === 0x4C && bytes[3] === 0x46) {
    return { valid: false, code: 'MALWARE_LINUX_ELF', error: 'Blocked: Linux binary.' };
  }
  if (bytes[0] === 0xCA && bytes[1] === 0xFE && bytes[2] === 0xBA && bytes[3] === 0xBE) {
    return { valid: false, code: 'MALWARE_JAVA_BYTECODE', error: 'Blocked: Java bytecode.' };
  }
  if (bytes[0] === 0x50 && bytes[1] === 0x4B && (bytes[2] === 0x03 || bytes[2] === 0x05 || bytes[2] === 0x07)) {
    return { valid: false, code: 'MALWARE_ARCHIVE_ZIP', error: 'Blocked: ZIP/APK archive.' };
  }
  if (bytes[0] === 0x37 && bytes[1] === 0x7A && bytes[2] === 0xBC && bytes[3] === 0xAF && bytes[4] === 0x27 && bytes[5] === 0x1C) {
    return { valid: false, code: 'MALWARE_ARCHIVE_7Z', error: 'Blocked: 7-Zip archive.' };
  }
  if (bytes[0] === 0x23 && bytes[1] === 0x21) {
    return { valid: false, code: 'MALWARE_SHEBANG_SCRIPT', error: 'Blocked: Script file.' };
  }

  // Structural header checks
  // JPEG
  if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
    return { valid: true, detectedFormat: 'image/jpeg', error: null };
  }

  // PNG
  if (
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47 &&
    bytes[4] === 0x0D && bytes[5] === 0x0A && bytes[6] === 0x1A && bytes[7] === 0x0A
  ) {
    return { valid: true, detectedFormat: 'image/png', error: null };
  }

  // WebP vs WAV / AVI masquerade
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
    if (bytes.length >= 12) {
      const subType = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]);
      if (subType === 'WAVE') {
        return { valid: false, code: 'SECURITY_MIME_MISMATCH', error: 'Blocked: Audio WAV masquerading in RIFF container.' };
      }
      if (subType === 'AVI ') {
        return { valid: false, code: 'SECURITY_MIME_MISMATCH', error: 'Blocked: Video AVI masquerading in RIFF container.' };
      }
      if (subType === 'WEBP') {
        return { valid: true, detectedFormat: 'image/webp', error: null };
      }
    }
    return { valid: false, code: 'SECURITY_INVALID_HEADER', error: 'Blocked: Unknown RIFF container.' };
  }

  // GIF
  if (
    bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38 &&
    (bytes[4] === 0x37 || bytes[4] === 0x39) && bytes[5] === 0x61
  ) {
    return { valid: true, detectedFormat: 'image/gif', error: null };
  }

  return { valid: false, code: 'SECURITY_INVALID_HEADER', error: 'Invalid file signature.' };
}

export function validateBinaryBuffer(buffer, expectedMime) {
  const byteLength = buffer ? (buffer.byteLength || buffer.length || 0) : 0;
  if (byteLength < 100) {
    return { valid: false, code: 'SECURITY_FILE_TOO_SMALL', error: 'File size too small (min 100 bytes).' };
  }
  if (byteLength > 10 * 1024 * 1024) {
    return { valid: false, code: 'SECURITY_FILE_TOO_LARGE', error: 'File size exceeds maximum allowed 10MB.' };
  }

  const bytes = new Uint8Array(buffer.slice ? buffer.slice(0, 32) : buffer);
  const inspection = inspectMagicBytes(bytes);
  if (!inspection.valid) {
    return inspection;
  }

  if (expectedMime && inspection.detectedFormat !== expectedMime) {
    return {
      valid: false,
      code: 'SECURITY_MIME_MISMATCH',
      error: `File signature (${inspection.detectedFormat}) does not match expected MIME type (${expectedMime}).`
    };
  }

  return inspection;
}

export function scanBinaryPayload(bytes) {
  if (!bytes) return { safe: true, threat: null };
  let str = '';
  const len = Math.min(bytes.length, 4096);
  for (let i = 0; i < len; i++) {
    str += String.fromCharCode(bytes[i]);
  }
  const lower = str.toLowerCase();
  if (lower.includes('<script') || lower.includes('javascript:') || lower.includes('<?php') || lower.includes('eval(')) {
    return { safe: false, code: 'MALWARE_SCRIPT_EMBEDDED', threat: 'Script injection detected in binary payload.' };
  }
  return { safe: true, threat: null };
}

export function scanBase64Payload(base64Str) {
  if (!base64Str) return { safe: true, threat: null };
  let raw = base64Str;
  if (raw.includes(',')) {
    raw = raw.split(',')[1];
  }
  try {
    const buf = Buffer.from(raw, 'base64');
    if (buf.length >= 2 && buf[0] === 0x4D && buf[1] === 0x5A) {
      return { safe: false, code: 'MALWARE_PE_EXECUTABLE', threat: 'Blocked: Base64 encoded PE executable.' };
    }
    return scanBinaryPayload(buf);
  } catch (e) {
    return { safe: false, code: 'SECURITY_INVALID_ENCODING', threat: 'Invalid Base64 payload.' };
  }
}

export class SynchronizedSlidingRateLimiter {
  constructor({ limit = 6, windowMs = 60000, storageKey = 'studysync_limiter' } = {}) {
    this.limit = limit;
    this.windowMs = windowMs;
    this.storageKey = storageKey;
    this.timestamps = [];
  }

  _clean(now = Date.now()) {
    const cutoff = now - this.windowMs;
    this.timestamps = this.timestamps.filter(ts => ts > cutoff);
  }

  allow(cost = 1) {
    const now = Date.now();
    this._clean(now);
    if (this.timestamps.length + cost > this.limit) {
      return false;
    }
    for (let i = 0; i < cost; i++) {
      this.timestamps.push(now);
    }
    return true;
  }

  getRemaining() {
    this._clean();
    return Math.max(0, this.limit - this.timestamps.length);
  }

  getResetTimeMs() {
    this._clean();
    if (this.timestamps.length === 0) return 0;
    return Math.max(0, this.timestamps[0] + this.windowMs - Date.now());
  }
}

export function generateSecurityNonce() {
  let hex = '';
  for (let i = 0; i < 32; i++) {
    hex += Math.floor(Math.random() * 16).toString(16);
  }
  return hex;
}

export function generateIdempotencyKey(payload, nonce = generateSecurityNonce()) {
  const cleanPayload = { ...payload };
  delete cleanPayload.security;
  const serialized = JSON.stringify(cleanPayload, Object.keys(cleanPayload).sort());
  let hash = 0;
  const str = serialized + ':' + nonce;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `idempotent_${Math.abs(hash).toString(16)}_${nonce.substring(0, 8)}`;
}

export function createIdempotencyEnvelope(payload) {
  const nonce = generateSecurityNonce();
  const idempotencyKey = generateIdempotencyKey(payload, nonce);
  const requestTimestamp = new Date().toISOString();
  return {
    ...payload,
    security: {
      nonce,
      idempotencyKey,
      requestTimestamp
    }
  };
}

export function verifyTimestampDrift(isoTimestamp, maxDriftSec = 300) {
  if (!isoTimestamp) {
    return { valid: false, code: 'ERR_TIMESTAMP_MISSING', error: 'Missing timestamp.' };
  }
  const reqTime = new Date(isoTimestamp).getTime();
  if (isNaN(reqTime)) {
    return { valid: false, code: 'ERR_TIMESTAMP_INVALID', error: 'Invalid ISO timestamp.' };
  }
  const now = Date.now();
  const driftSec = Math.abs(now - reqTime) / 1000;
  if (reqTime - now > 60000) {
    return { valid: false, code: 'ERR_TIMESTAMP_FUTURE', error: 'Request timestamp is in future (>60s).' };
  }
  if (driftSec > maxDriftSec) {
    return { valid: false, code: 'ERR_TIMESTAMP_EXPIRED', error: `Timestamp expired outside ${maxDriftSec}s window.` };
  }
  return { valid: true, code: null, error: null };
}

export function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function sanitizeInput(input, maxLength = 1000) {
  if (!input) return '';
  const trimmed = String(input).trim().substring(0, maxLength);
  return escapeHtml(trimmed);
}

export function sanitizeUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed, 'https://studysync-al-2026.web.app');
    const protocol = parsed.protocol.toLowerCase();
    if (protocol === 'http:' || protocol === 'https:' || protocol === 'mailto:' || protocol === 'tel:') {
      return trimmed;
    }
    return '#';
  } catch (e) {
    if (trimmed.startsWith('/') || trimmed.startsWith('#')) return trimmed;
    return '#';
  }
}

export function sanitizeCsvFormula(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (/^[=+\-@\t\r]/.test(str)) {
    return `'${str}`;
  }
  return str;
}

export function formatCsvCell(val) {
  if (val === null || val === undefined) return '';
  const str = sanitizeCsvFormula(String(val));
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function generateCsvString(headers, rows) {
  const headerLine = headers.map(formatCsvCell).join(',');
  const rowLines = (rows || []).map((row) => (row || []).map(formatCsvCell).join(','));
  return [headerLine, ...rowLines].join('\r\n');
}


// ============================================================================
// M9: COGNITIVE AI & DYNAMIC Z-SCORE VELOCITY HARNESS
// ============================================================================

export const NATIONAL_SUBJECT_STATS = {
  'Combined Mathematics': { mean: 42.5, stdDev: 18.2, weight: 1.0, code: 'CM' },
  'Combined Maths': { mean: 42.5, stdDev: 18.2, weight: 1.0, code: 'CM' },
  'Physics': { mean: 46.0, stdDev: 17.5, weight: 1.0, code: 'PH' },
  'Chemistry': { mean: 48.2, stdDev: 16.8, weight: 1.0, code: 'CH' },
  'Biology': { mean: 49.5, stdDev: 16.2, weight: 1.0, code: 'BI' },
  'ICT': { mean: 52.0, stdDev: 15.5, weight: 1.0, code: 'IT' },
  'Information & Communication Technology': { mean: 52.0, stdDev: 15.5, weight: 1.0, code: 'IT' },
  'Agriculture': { mean: 54.0, stdDev: 14.8, weight: 1.0, code: 'AG' },
  'Agricultural Science': { mean: 54.0, stdDev: 14.8, weight: 1.0, code: 'AG' },
};

export const UNIVERSITY_CUTOFF_TIERS = [
  {
    id: 'colombo-eng-med',
    name: 'Tier 1: Engineering / Medicine (Colombo / Merit)',
    faculty: 'Faculty of Medicine / Engineering (UoC / UoM / UoP)',
    targetZ: 2.05,
    description: 'Island Top 1.5% - Direct admission to top university faculties in Colombo/Peradeniya/Moratuwa.',
    color: '#10b981',
  },
  {
    id: 'state-eng-med',
    name: 'Tier 2: Engineering / Medicine (Regional / State Merit)',
    faculty: 'Engineering & Medical Faculties (Ruhuna / Jaffna / Rajarata / Eastern)',
    targetZ: 1.85,
    description: 'Island Top 3.5% - Secure selection for national medical and engineering faculties.',
    color: '#6366f1',
  },
  {
    id: 'applied-sciences-it',
    name: 'Tier 3: Physical & Bio Applied Sciences / Computing',
    faculty: 'Applied Sciences, Computer Science, Software Engineering',
    targetZ: 1.45,
    description: 'Island Top 7.5% - Direct qualification for high-demand applied technology degrees.',
    color: '#3b82f6',
  },
  {
    id: 'national-threshold',
    name: 'Tier 4: National University Admission Threshold',
    faculty: 'General Science, Technology & Inter-Faculty Degrees',
    targetZ: 0.95,
    description: 'Island Top 17% - Minimum competitive benchmark for state university placement.',
    color: '#f59e0b',
  },
];

export function calculatePercentileFromZ(z) {
  if (z === 0) return 50.0;
  const b1 = 0.319381530;
  const b2 = -0.356563782;
  const b3 = 1.781477937;
  const b4 = -1.821255978;
  const b5 = 1.330274429;
  const p = 0.2316419;
  const c = 0.3989422804014327;

  const absZ = Math.abs(z);
  const t = 1.0 / (1.0 + p * absZ);
  const poly = ((((b5 * t + b4) * t + b3) * t + b2) * t + b1) * t;
  const cdf = 1.0 - c * Math.exp((-absZ * absZ) / 2.0) * poly;

  const result = z >= 0 ? cdf : 1.0 - cdf;
  return Math.min(99.9, Math.max(0.1, Math.round(result * 1000) / 10));
}

export function calculateSubjectZScore(subject, rawScore, testCount = 0) {
  const norm = NATIONAL_SUBJECT_STATS[subject] || { mean: 45.0, stdDev: 17.0, weight: 1.0 };

  if (testCount === 0 || rawScore < 0) {
    return {
      subject,
      rawScore: 0,
      mean: norm.mean,
      stdDev: norm.stdDev,
      zScore: 0,
      grade: 'F',
      confidencePct: 0,
    };
  }

  const kappa = 2.0;
  const bayesianMean = (testCount / (testCount + kappa)) * rawScore + (kappa / (testCount + kappa)) * norm.mean;
  const zScore = (bayesianMean - norm.mean) / norm.stdDev;

  let grade = 'F';
  if (rawScore >= 75) grade = 'A';
  else if (rawScore >= 65) grade = 'B';
  else if (rawScore >= 50) grade = 'C';
  else if (rawScore >= 35) grade = 'S';
  else grade = 'F';

  const confidencePct = Math.min(99, Math.round((1 - Math.exp(-0.55 * testCount)) * 100));

  return {
    subject,
    rawScore: Number(rawScore.toFixed(1)),
    mean: norm.mean,
    stdDev: norm.stdDev,
    zScore: Number(zScore.toFixed(4)),
    grade,
    confidencePct,
  };
}

export function calculateSubjectZScoreDetail(subject, rawScore, testCount = 0) {
  const norm = NATIONAL_SUBJECT_STATS[subject] || { mean: 45.0, stdDev: 17.0, weight: 1.0 };
  const base = calculateSubjectZScore(subject, rawScore, testCount);
  
  const kappa = 2.0;
  const bayesianMean = testCount > 0
    ? (testCount / (testCount + kappa)) * rawScore + (kappa / (testCount + kappa)) * norm.mean
    : norm.mean;
  
  const sensitivity = Number((1 / (3 * norm.stdDev)).toFixed(6));
  const marksNeededPer01Z = Number((3 * norm.stdDev * 0.1).toFixed(2));
  const percentile = calculatePercentileFromZ(base.zScore);

  return {
    subject,
    rawScore: base.rawScore,
    mean: norm.mean,
    stdDev: norm.stdDev,
    bayesianMean: Number(bayesianMean.toFixed(2)),
    zScore: base.zScore,
    grade: base.grade,
    confidencePct: base.confidencePct,
    sensitivity,
    marksNeededPer01Z,
    percentile,
  };
}

export function calculateCompositeZScore(streamSubjects, testMarks) {
  if (!testMarks || testMarks.length === 0) {
    const emptyMetrics = streamSubjects.map((sub) => calculateSubjectZScore(sub, 0, 0));
    return {
      compositeZScore: 0,
      zScoreRange: { min: 0, max: 0 },
      subjectMetrics: emptyMetrics,
      predictedGradesSummary: '0 Tests Logged',
      nationalPercentile: 0,
      targetTier: 'Revision Required',
    };
  }

  const subjectMetrics = streamSubjects.map((sub) => {
    const subMarks = testMarks
      .filter((t) => t.subject.toLowerCase() === sub.toLowerCase())
      .sort((a, b) => new Date(a.testDate).getTime() - new Date(b.testDate).getTime());

    if (subMarks.length === 0) {
      return calculateSubjectZScore(sub, 0, 0);
    }

    let weightedSum = 0;
    let weightTotal = 0;
    subMarks.forEach((m, idx) => {
      const weight = Math.pow(1.15, idx + 1);
      weightedSum += m.score * weight;
      weightTotal += weight;
    });

    const weightedAvg = weightedSum / weightTotal;
    return calculateSubjectZScore(sub, weightedAvg, subMarks.length);
  });

  const subjectsWithTests = subjectMetrics.filter((m) => m.confidencePct > 0);
  const sumZ = subjectsWithTests.reduce((acc, curr) => acc + curr.zScore, 0);
  const compositeZ = subjectsWithTests.length > 0 ? sumZ / subjectsWithTests.length : 0;

  const nationalPercentile = subjectsWithTests.length > 0 ? calculatePercentileFromZ(compositeZ) : 0;

  const gradeCounts = { A: 0, B: 0, C: 0, S: 0, F: 0 };
  subjectsWithTests.forEach((m) => {
    gradeCounts[m.grade] = (gradeCounts[m.grade] || 0) + 1;
  });

  const gradesSummary =
    Object.entries(gradeCounts)
      .filter(([_, count]) => count > 0)
      .map(([grade, count]) => (count > 1 ? `${count}${grade}` : grade))
      .join(' ') || 'Pending Tests';

  let targetTier = 'National University Threshold';
  if (compositeZ >= 1.85) targetTier = 'Engineering / Medicine Direct';
  else if (compositeZ >= 1.35) targetTier = 'Physical / Bio Applied Sciences';
  else if (compositeZ >= 0.75) targetTier = 'National University Threshold';
  else targetTier = 'Revision Required';

  const marginOfError = Math.max(0.08, 0.28 / Math.sqrt(testMarks.length || 1));

  return {
    compositeZScore: Number(compositeZ.toFixed(4)),
    zScoreRange: {
      min: Number(Math.max(0, compositeZ - marginOfError).toFixed(2)),
      max: Number((compositeZ + marginOfError).toFixed(2)),
    },
    subjectMetrics,
    predictedGradesSummary: gradesSummary,
    nationalPercentile,
    targetTier,
  };
}

export function calculateSubjectEma(subject, tests) {
  const subjectTests = tests
    .filter((t) => t.subject.toLowerCase() === subject.toLowerCase())
    .sort((a, b) => new Date(a.testDate).getTime() - new Date(b.testDate).getTime());

  if (subjectTests.length === 0) {
    return {
      subject,
      currentEma3: 0,
      currentEma5: 0,
      velocity: 0,
      trend: 'stable',
    };
  }

  const k3 = 2 / (3 + 1);
  const k5 = 2 / (5 + 1);

  let ema3 = subjectTests[0].score;
  let ema5 = subjectTests[0].score;

  subjectTests.forEach((t) => {
    ema3 = t.score * k3 + ema3 * (1 - k3);
    ema5 = t.score * k5 + ema5 * (1 - k5);
  });

  const firstScore = subjectTests[0].score;
  const latestScore = subjectTests[subjectTests.length - 1].score;
  const velocity =
    subjectTests.length > 1
      ? Number((((latestScore - firstScore) / (firstScore || 1)) * 100).toFixed(1))
      : 0;

  const momentum = ema3 - ema5;
  let trend = 'stable';
  if (momentum > 2.5 || velocity >= 4.0) trend = 'accelerating';
  else if (momentum < -2.5 || velocity <= -4.0) trend = 'decaying';

  return {
    subject,
    currentEma3: Number(ema3.toFixed(1)),
    currentEma5: Number(ema5.toFixed(1)),
    velocity,
    trend,
  };
}

export function calculateDynamicVelocity(streamSubjects, testMarks) {
  if (!testMarks || testMarks.length < 2) {
    return {
      periodDays: 30,
      velocityZPerMonth: 0,
      ema3: 0,
      ema5: 0,
      momentum: 0,
      momentumStatus: 'stable',
      velocityLabel: 'Steady Baseline',
    };
  }

  const sortedTests = [...testMarks].sort(
    (a, b) => new Date(a.testDate).getTime() - new Date(b.testDate).getTime()
  );

  const k3 = 2 / (3 + 1);
  const k5 = 2 / (5 + 1);

  let ema3 = sortedTests[0].score;
  let ema5 = sortedTests[0].score;

  sortedTests.forEach((t) => {
    ema3 = t.score * k3 + ema3 * (1 - k3);
    ema5 = t.score * k5 + ema5 * (1 - k5);
  });

  const firstDate = new Date(sortedTests[0].testDate).getTime();
  const lastDate = new Date(sortedTests[sortedTests.length - 1].testDate).getTime();
  const diffDays = Math.max(1, Math.round((lastDate - firstDate) / (1000 * 60 * 60 * 24)));

  const firstHalf = sortedTests.slice(0, Math.ceil(sortedTests.length / 2));
  const latestHalf = sortedTests.slice(Math.floor(sortedTests.length / 2));

  const firstForecast = calculateCompositeZScore(streamSubjects, firstHalf);
  const latestForecast = calculateCompositeZScore(streamSubjects, latestHalf);

  const deltaZ = latestForecast.compositeZScore - firstForecast.compositeZScore;
  const velocityZPerMonth = Number(((deltaZ / diffDays) * 30).toFixed(4));
  const momentum = Number((ema3 - ema5).toFixed(2));

  let momentumStatus = 'stable';
  let velocityLabel = 'Steady Cadence ⚡';

  if (momentum > 2.5 || velocityZPerMonth >= 0.12) {
    momentumStatus = 'accelerating';
    velocityLabel = 'Accelerating Momentum 🔥';
  } else if (momentum < -2.5 || velocityZPerMonth <= -0.12) {
    momentumStatus = 'decaying';
    velocityLabel = 'Decaying Velocity ⚠️';
  }

  return {
    periodDays: diffDays,
    velocityZPerMonth,
    ema3: Number(ema3.toFixed(1)),
    ema5: Number(ema5.toFixed(1)),
    momentum,
    momentumStatus,
    velocityLabel,
  };
}

export function calculateTargetGapAnalysis(compositeZ, streamSubjects, targetTierId = 'colombo-eng-med') {
  const targetTier =
    UNIVERSITY_CUTOFF_TIERS.find((t) => t.id === targetTierId) || UNIVERSITY_CUTOFF_TIERS[0];

  const gap = Number(Math.max(0, targetTier.targetZ - compositeZ).toFixed(4));
  const isTargetMet = compositeZ >= targetTier.targetZ;

  const subjectRequiredMarks = {};
  let sumInvSigma = 0;

  streamSubjects.forEach((sub) => {
    const norm = NATIONAL_SUBJECT_STATS[sub] || { mean: 45.0, stdDev: 17.0, weight: 1.0 };
    const marksNeeded = Number((gap * 3 * norm.stdDev).toFixed(1));
    subjectRequiredMarks[sub] = isTargetMet ? 0 : marksNeeded;
    sumInvSigma += 1 / norm.stdDev;
  });

  const uniformMarksNeeded = isTargetMet
    ? 0
    : Number(((3 * gap) / (sumInvSigma || 1)).toFixed(1));

  return {
    targetTier,
    currentZ: Number(compositeZ.toFixed(4)),
    targetZ: targetTier.targetZ,
    gap,
    isTargetMet,
    subjectRequiredMarks,
    uniformMarksNeeded,
  };
}

export function calculateCognitiveFatigueIndex(logs, streakDays = 0) {
  const recentLogs = (logs || []).slice(-7);
  let totalHours7d = 0;
  let focusSum = 0;
  let prodSum = 0;
  let count = 0;

  recentLogs.forEach((log) => {
    const subs = log.subjects || [];
    let logH = 0;
    if (subs.length > 0) {
      subs.forEach((s) => {
        logH += Number(s.hours || 0);
        focusSum += Number(s.focus || 7);
        prodSum += Number(s.productivity || 7);
        count++;
      });
    } else {
      logH = Number(log.totalHours || 0);
      focusSum += Number(log.focusScore || log.focusLevel || 7);
      prodSum += Number(log.productivityScore || log.productivityLevel || 7);
      count++;
    }
    totalHours7d += logH;
  });

  const avgFocus7d = count > 0 ? Number((focusSum / count).toFixed(1)) : 8.0;
  const avgProductivity7d = count > 0 ? Number((prodSum / count).toFixed(1)) : 8.0;

  const termFocus = 0.35 * (10 - avgFocus7d);
  const termProd = 0.35 * (10 - avgProductivity7d);
  const termVolume = 0.20 * Math.max(0, totalHours7d / 42 - 1) * 10;
  const termStreak = 0.10 * Math.min(10, (streakDays / 14) * 10);

  const rawFatigue = termFocus + termProd + termVolume + termStreak;
  const fatigueIndex = Number(Math.min(10, Math.max(0, rawFatigue)).toFixed(1));
  const flowScore = Number((10 - fatigueIndex).toFixed(1));

  let tier = 'optimal';
  let label = 'Optimal Flow State ⚡';
  let recommendation = 'Peak cognitive efficiency. Continue regular high-yield study blocks.';
  let restorativeProtocol = 'Maintain standard 60-minute deep work blocks with 10-minute active recovery breaks.';

  if (fatigueIndex >= 7.5) {
    tier = 'burnout';
    label = 'Acute Burnout Risk 🛑';
    recommendation = 'Cognitive saturation reached. 24-hour tactical recovery day strongly advised.';
    restorativeProtocol = 'Reduce study volume by 50% for 24 hours. Ensure 8 hours restorative sleep and zero screens 1h before bedtime.';
  } else if (fatigueIndex >= 5.5) {
    tier = 'high';
    label = 'High Fatigue & Saturation Alert 🚨';
    recommendation = 'Noticeable mental strain. Implement strict Pomodoro intervals and front-load hard subjects.';
    restorativeProtocol = 'Adopt 50/10 Pomodoro blocks. Dedicate morning hours to heavy problem-solving, evenings to light flashcards.';
  } else if (fatigueIndex >= 3.5) {
    tier = 'moderate';
    label = 'Mild Cognitive Strain ⚠️';
    recommendation = 'Normal study friction. Stay hydrated and preserve consistent sleep cycles.';
    restorativeProtocol = 'Take a 15-minute screen-free walk between major subject switches.';
  }

  return {
    fatigueIndex,
    tier,
    label,
    flowScore,
    avgFocus7d,
    avgProductivity7d,
    totalHours7d: Number(totalHours7d.toFixed(1)),
    streakDays,
    recommendation,
    restorativeProtocol,
  };
}

export function calculateSubjectEntropyEquilibrium(hours, subjectNames = ['Subject 1', 'Subject 2', 'Subject 3']) {
  const total = hours.reduce((sum, h) => sum + Math.max(0, h), 0);
  const k = Math.max(1, hours.length || 3);
  const maxEntropy = Math.log(k);

  if (total <= 0) {
    return {
      entropyScore: 0,
      maxEntropy: Number(maxEntropy.toFixed(4)),
      equilibriumPct: 100,
      assessment: 'Equal Baseline',
      isNeglected: false,
    };
  }

  let entropy = 0;
  let minH = Infinity;
  let maxH = -Infinity;
  let weakestIdx = 0;
  let strongestIdx = 0;

  hours.forEach((h, idx) => {
    const val = Math.max(0, h);
    if (val < minH) {
      minH = val;
      weakestIdx = idx;
    }
    if (val > maxH) {
      maxH = val;
      strongestIdx = idx;
    }

    const p = val / total;
    if (p > 0) {
      entropy -= p * Math.log(p);
    }
  });

  const equilibriumPct = Math.min(100, Math.max(0, Math.round((entropy / maxEntropy) * 100)));
  const isNeglected = equilibriumPct < 70;
  const reallocationHoursTarget = isNeglected
    ? Number(((maxH - minH) / 3).toFixed(1))
    : 0;

  let assessment = 'Balanced Cadence ⚡';
  if (equilibriumPct >= 90) assessment = 'Optimal Equilibrium ⚡';
  else if (equilibriumPct >= 75) assessment = 'Moderate Balance ⚡';
  else assessment = 'Asymmetric Subject Neglect ⚠️';

  return {
    entropyScore: Number(entropy.toFixed(3)),
    maxEntropy: Number(maxEntropy.toFixed(4)),
    equilibriumPct,
    assessment,
    isNeglected,
    weakestSubject: subjectNames[weakestIdx] || 'Weakest Subject',
    strongestSubject: subjectNames[strongestIdx] || 'Strongest Subject',
    reallocationHoursTarget,
  };
}

export function calculateStudyRoi(streamSubjects, logs, testMarks) {
  return streamSubjects.map((subject) => {
    let subjectHours = 0;
    logs.forEach((log) => {
      const subs = log.subjects || [];
      const match = subs.find((s) => s.name?.toLowerCase() === subject.toLowerCase());
      if (match) {
        subjectHours += Number(match.hours || 0);
      }
    });

    const subMarks = testMarks.filter((t) => t.subject.toLowerCase() === subject.toLowerCase());
    const avgMark =
      subMarks.length > 0
        ? subMarks.reduce((acc, m) => acc + m.score, 0) / subMarks.length
        : 0;

    const roiScore = subjectHours > 0 ? Number((avgMark / (subjectHours / 10 + 1)).toFixed(1)) : 0;

    let efficiencyBadge = 'Optimal Balance ';
    if (avgMark >= 75 && subjectHours >= 5) efficiencyBadge = 'High Yield ';
    else if (avgMark < 50 && subjectHours >= 10) efficiencyBadge = 'Low Yield Alert ';

    return {
      subject,
      totalStudyHours: Number(subjectHours.toFixed(1)),
      averageMark: Number(avgMark.toFixed(1)),
      roiScore,
      efficiencyBadge,
    };
  });
}

export function generateAiPrescriptions(member, logs, testMarks) {
  const isBio =
    member?.stream === 'Biological Science' ||
    String(member?.stream || '').toLowerCase().includes('bio');

  const streamName = isBio ? 'Biological Science' : 'Physical Science';

  const streamSubjects = isBio
    ? ['Biology', 'Chemistry', member?.optionalSubject || 'Physics']
    : ['Combined Maths', 'Physics', member?.optionalSubject || 'Chemistry'];

  const prescriptions = [];
  const forecast = calculateCompositeZScore(streamSubjects, testMarks);
  const rois = calculateStudyRoi(streamSubjects, logs || [], testMarks || []);
  const streak = logs?.length || 0;
  const fatigue = calculateCognitiveFatigueIndex(logs || [], streak);

  const subjectHours = streamSubjects.map((sub) => {
    let hrs = 0;
    (logs || []).forEach((log) => {
      const subs = log.subjects || [];
      const match = subs.find((s) => s.name?.toLowerCase() === sub.toLowerCase());
      if (match) hrs += Number(match.hours || 0);
    });
    return hrs;
  });

  const equilibrium = calculateSubjectEntropyEquilibrium(subjectHours, streamSubjects);

  if (!testMarks || testMarks.length === 0) {
    return [
      {
        id: 'onboarding-diagnostic',
        ruleId: 'ONBOARDING-01',
        stream: streamName,
        category: 'strategy',
        severity: 'focus',
        title: 'Cognitive AI Diagnostic Active — Awaiting First Test Mark',
        diagnosticReason: 'Your AI Study Advisor is ready to calibrate. Log your first school term test, model paper, or revision quiz score to compute your empirical Sri Lankan Z-Score and identify subject bottlenecks.',
        diagnosis: 'Your AI Study Advisor is ready to calibrate. Log your first school term test, model paper, or revision quiz score to compute your empirical Sri Lankan Z-Score and identify subject bottlenecks.',
        actionProtocol: 'Click "+ Log Test Mark" above and record your most recent paper marks for ' + streamSubjects.join(', ') + '.',
        actionablePrescription: 'Click "+ Log Test Mark" above and record your most recent paper marks for ' + streamSubjects.join(', ') + '.',
        targetSubject: streamSubjects[0],
        projectedZGain: 0.25,
        priorityScore: 100,
      },
    ];
  }

  const subStats = {};
  streamSubjects.forEach((sub, idx) => {
    const matching = testMarks.filter((t) => t.subject.toLowerCase() === sub.toLowerCase());
    const count = matching.length;
    const avgScore = count > 0 ? matching.reduce((acc, m) => acc + m.score, 0) / count : 0;
    const ema = calculateSubjectEma(sub, testMarks);
    subStats[sub] = {
      avgScore,
      count,
      hours: subjectHours[idx] || 0,
      emaVelocity: ema.velocity,
    };
  });

  if (!isBio) {
    const math = subStats['Combined Maths'] || subStats['Combined Mathematics'] || { avgScore: 0, count: 0, hours: 0, emaVelocity: 0 };
    const phys = subStats['Physics'] || { avgScore: 0, count: 0, hours: 0, emaVelocity: 0 };
    const chem = subStats['Chemistry'] || { avgScore: 0, count: 0, hours: 0, emaVelocity: 0 };
    const ict = subStats['ICT'] || subStats['Information & Communication Technology'] || { avgScore: 0, count: 0, hours: 0, emaVelocity: 0 };

    if (math.count >= 1 && (math.emaVelocity < 0 || (math.hours > 15 && math.avgScore < 60))) {
      prescriptions.push({
        id: 'math-dyn-01',
        ruleId: 'MATH-DYN-01',
        stream: 'Physical Science',
        category: 'mechanics',
        severity: 'urgent',
        title: 'Applied Mathematics / Dynamics Bottleneck in Combined Maths',
        diagnosticReason: 'High study hours spent reading theory rather than solving timed step-by-step mechanics & vector proofs.',
        diagnosis: 'High study hours spent reading theory rather than solving timed step-by-step mechanics & vector proofs.',
        actionProtocol: 'Complete 2 full Section B Dynamics/Statics questions under strict 45-minute exam limits. Maintain an "Error Taxonomy Log" classifying calculation vs conceptual errors.',
        actionablePrescription: 'Complete 2 full Section B Dynamics/Statics questions under strict 45-minute exam limits. Maintain an "Error Taxonomy Log" classifying calculation vs conceptual errors.',
        targetSubject: 'Combined Maths',
        projectedZGain: 0.24,
        priorityScore: 95,
      });
    }

    if (math.count >= 2 && math.avgScore < 50) {
      prescriptions.push({
        id: 'math-calc-02',
        ruleId: 'MATH-CALC-02',
        stream: 'Physical Science',
        category: 'calculus',
        severity: 'urgent',
        title: 'Pure Maths Calculus & Trigonometry Deficit',
        diagnosticReason: 'Structural gap in algebraic manipulation and integration techniques affecting Part A and Part B pure maths questions.',
        diagnosis: 'Structural gap in algebraic manipulation and integration techniques affecting Part A and Part B pure maths questions.',
        actionProtocol: 'Dedicate first 30 minutes of each morning to 5 integration/differentiation problems from 2015–2024 past papers before attempting full model papers.',
        actionablePrescription: 'Dedicate first 30 minutes of each morning to 5 integration/differentiation problems from 2015–2024 past papers before attempting full model papers.',
        targetSubject: 'Combined Maths',
        projectedZGain: 0.20,
        priorityScore: 92,
      });
    }

    if (phys.count >= 1 && (phys.avgScore < 55 || (phys.hours < 8 && phys.avgScore < 65))) {
      prescriptions.push({
        id: 'phys-num-01',
        ruleId: 'PHYS-NUM-01',
        stream: 'Physical Science',
        category: 'mechanics',
        severity: 'alert',
        title: 'Physics Mechanics & Free-Body Diagram Deficit',
        diagnosticReason: 'Concept fragmentation in mechanics, circular motion, and oscillations leading to lost marks in structured essay questions.',
        diagnosis: 'Concept fragmentation in mechanics, circular motion, and oscillations leading to lost marks in structured essay questions.',
        actionProtocol: 'Free-Body Diagram (FBD) First Protocol: Re-solve past paper Part II questions by strictly writing 3-step structured solutions: (1) System isolation & FBD, (2) Coordinate equations, (3) Dimensional unit check.',
        actionablePrescription: 'Free-Body Diagram (FBD) First Protocol: Re-solve past paper Part II questions by strictly writing 3-step structured solutions: (1) System isolation & FBD, (2) Coordinate equations, (3) Dimensional unit check.',
        targetSubject: 'Physics',
        projectedZGain: 0.22,
        priorityScore: 88,
      });
    }

    if (chem.count >= 1 && chem.avgScore < 60 && math.avgScore >= 75) {
      prescriptions.push({
        id: 'chem-phys-01',
        ruleId: 'CHEM-PHYS-01',
        stream: 'Physical Science',
        category: 'calculus',
        severity: 'alert',
        title: 'Physical Chemistry Calculation Disconnect',
        diagnosticReason: 'Strong mathematical capability is not being effectively transferred to chemical thermodynamics & equilibrium problem solving.',
        diagnosis: 'Strong mathematical capability is not being effectively transferred to chemical thermodynamics & equilibrium problem solving.',
        actionProtocol: 'Unit Equilibrium Drills: Practice 10 multi-step equilibrium (Kp, Kc, pH) and electrochemistry calculation problems. Focus on tabular ICE (Initial, Change, Equilibrium) method.',
        actionablePrescription: 'Unit Equilibrium Drills: Practice 10 multi-step equilibrium (Kp, Kc, pH) and electrochemistry calculation problems. Focus on tabular ICE (Initial, Change, Equilibrium) method.',
        targetSubject: 'Chemistry',
        projectedZGain: 0.18,
        priorityScore: 84,
      });
    }

    if (chem.count >= 2 && chem.emaVelocity <= -4) {
      prescriptions.push({
        id: 'chem-inorg-02',
        ruleId: 'CHEM-INORG-02',
        stream: 'Physical Science',
        category: 'active_recall',
        severity: 'focus',
        title: 'Inorganic Qualitative Recall Decay',
        diagnosticReason: 'Forgetting curve affecting transition element oxidation states, precipitate colors, and qualitative inorganic analysis tests.',
        diagnosis: 'Forgetting curve affecting transition element oxidation states, precipitate colors, and qualitative inorganic analysis tests.',
        actionProtocol: 'Active Recall Flash Matrix: Build a 1-page synthetic summary sheet of group chemistry reactions and test recall daily via 15-minute active quizzing before sleep.',
        actionablePrescription: 'Active Recall Flash Matrix: Build a 1-page synthetic summary sheet of group chemistry reactions and test recall daily via 15-minute active quizzing before sleep.',
        targetSubject: 'Chemistry',
        projectedZGain: 0.16,
        priorityScore: 78,
      });
    }

    if (ict.count >= 1 && ict.avgScore < 65 && member?.optionalSubject === 'ICT') {
      prescriptions.push({
        id: 'ict-alg-01',
        ruleId: 'ICT-ALG-01',
        stream: 'Physical Science',
        category: 'strategy',
        severity: 'alert',
        title: 'Programming & Algorithm Logic Bottleneck in ICT',
        diagnosticReason: 'Weakness in Section B structured Python programming, pseudo-code trace tables, and database normalization (2NF/3NF).',
        diagnosis: 'Weakness in Section B structured Python programming, pseudo-code trace tables, and database normalization (2NF/3NF).',
        actionProtocol: 'Code Trace & SQL Sprint: Write out dry-run trace tables for recursive algorithms and normalize 3 database schema scenarios from provincial past papers weekly.',
        actionablePrescription: 'Code Trace & SQL Sprint: Write out dry-run trace tables for recursive algorithms and normalize 3 database schema scenarios from provincial past papers weekly.',
        targetSubject: 'ICT',
        projectedZGain: 0.20,
        priorityScore: 82,
      });
    }
  }

  if (isBio) {
    const bio = subStats['Biology'] || { avgScore: 0, count: 0, hours: 0, emaVelocity: 0 };
    const chem = subStats['Chemistry'] || { avgScore: 0, count: 0, hours: 0, emaVelocity: 0 };
    const phys = subStats['Physics'] || { avgScore: 0, count: 0, hours: 0, emaVelocity: 0 };
    const agri = subStats['Agriculture'] || subStats['Agricultural Science'] || { avgScore: 0, count: 0, hours: 0, emaVelocity: 0 };

    if (bio.count >= 2 && bio.avgScore < 65) {
      prescriptions.push({
        id: 'bio-res-01',
        ruleId: 'BIO-RES-01',
        stream: 'Biological Science',
        category: 'active_recall',
        severity: 'urgent',
        title: 'NIE Resource Book Phrasing Imprecision in Biology',
        diagnosticReason: 'Inability to match official National Institute of Education (NIE) Resource Book marking keywords in structured essay questions.',
        diagnosis: 'Inability to match official National Institute of Education (NIE) Resource Book marking keywords in structured essay questions.',
        actionProtocol: 'NIE Keyword Cloze Drills: Convert Resource Book Unit summaries into active fill-in-the-blank cloze tests. Practice writing 1 full essay question weekly and self-evaluate strictly against Department of Examinations marking schemes.',
        actionablePrescription: 'NIE Keyword Cloze Drills: Convert Resource Book Unit summaries into active fill-in-the-blank cloze tests. Practice writing 1 full essay question weekly and self-evaluate strictly against Department of Examinations marking schemes.',
        targetSubject: 'Biology',
        projectedZGain: 0.28,
        priorityScore: 96,
      });
    }

    if (bio.hours > 18 && bio.avgScore >= 55 && bio.avgScore <= 70) {
      prescriptions.push({
        id: 'bio-spaced-02',
        ruleId: 'BIO-SPACED-02',
        stream: 'Biological Science',
        category: 'spaced_retrieval',
        severity: 'alert',
        title: 'Passive Reading Satiation & Ebbinghaus Decay in Biology',
        diagnosticReason: 'Excessive passive highlighting with diminishing retention returns in high-volume units like Plant Physiology and Genetics.',
        diagnosis: 'Excessive passive highlighting with diminishing retention returns in high-volume units like Plant Physiology and Genetics.',
        actionProtocol: '2-3-7 Spaced Retrieval Protocol: Implement 2-day, 3-day, and 7-day spaced active recall cycles for high-volume units (Plant Physiology, Genetics, Molecular Biology).',
        actionablePrescription: '2-3-7 Spaced Retrieval Protocol: Implement 2-day, 3-day, and 7-day spaced active recall cycles for high-volume units (Plant Physiology, Genetics, Molecular Biology).',
        targetSubject: 'Biology',
        projectedZGain: 0.22,
        priorityScore: 86,
      });
    }

    if (chem.count >= 1 && chem.avgScore < 55) {
      prescriptions.push({
        id: 'bio-chem-org-01',
        ruleId: 'BIO-CHEM-ORG-01',
        stream: 'Biological Science',
        category: 'organic',
        severity: 'urgent',
        title: 'Organic Chemistry Mechanism Synthesis Deficit',
        diagnosticReason: 'Chemistry is the primary gating subject for medical faculty admission. Failure to memorize multi-step conversion pathways creates severe Z-Score drag.',
        diagnosis: 'Chemistry is the primary gating subject for medical faculty admission. Failure to memorize multi-step conversion pathways creates severe Z-Score drag.',
        actionProtocol: 'Organic Conversion Roadmap Sprint: Draw the complete aliphatic and aromatic reaction conversion map from memory twice weekly. Practice 5 conversion problems (e.g. alcohol to amine via Grignard) per session.',
        actionablePrescription: 'Organic Conversion Roadmap Sprint: Draw the complete aliphatic and aromatic reaction conversion map from memory twice weekly. Practice 5 conversion problems (e.g. alcohol to amine via Grignard) per session.',
        targetSubject: 'Chemistry',
        projectedZGain: 0.30,
        priorityScore: 98,
      });
    }

    if (phys.count >= 1 && phys.avgScore < 50 && member?.optionalSubject === 'Physics') {
      prescriptions.push({
        id: 'bio-phys-math-01',
        ruleId: 'BIO-PHYS-MATH-01',
        stream: 'Biological Science',
        category: 'mechanics',
        severity: 'alert',
        title: 'Mathematical Anxiety / Physics Vector Bottleneck',
        diagnosticReason: 'Biological science students often experience high cognitive friction with physics trigonometric components and vector mechanics.',
        diagnosis: 'Biological science students often experience high cognitive friction with physics trigonometric components and vector mechanics.',
        actionProtocol: 'Structured Physics Template Method: Use standardized calculation templates for Optics, Waves, and Current Electricity. Focus on structured Part I MCQs first to build speed.',
        actionablePrescription: 'Structured Physics Template Method: Use standardized calculation templates for Optics, Waves, and Current Electricity. Focus on structured Part I MCQs first to build speed.',
        targetSubject: 'Physics',
        projectedZGain: 0.25,
        priorityScore: 90,
      });
    }

    if (agri.count >= 1 && agri.avgScore < 60 && member?.optionalSubject === 'Agriculture') {
      prescriptions.push({
        id: 'agri-agron-01',
        ruleId: 'AGRI-AGRON-01',
        stream: 'Biological Science',
        category: 'strategy',
        severity: 'focus',
        title: 'Agro-Climatic & Soil Science Integration Gap',
        diagnosticReason: 'Deficit in quantitative agronomy questions (fertilizer ratio calculations, water requirement formulas).',
        diagnosis: 'Deficit in quantitative agronomy questions (fertilizer ratio calculations, water requirement formulas).',
        actionProtocol: 'Calculation & Practical Field Sheet Practice: Solve 5 numerical agronomy problems and memorize diagnostic plant deficiency tables from past provincial model papers.',
        actionablePrescription: 'Calculation & Practical Field Sheet Practice: Solve 5 numerical agronomy problems and memorize diagnostic plant deficiency tables from past provincial model papers.',
        targetSubject: 'Agriculture',
        projectedZGain: 0.18,
        priorityScore: 80,
      });
    }
  }

  if (fatigue.tier === 'burnout' || fatigue.tier === 'high') {
    prescriptions.push({
      id: 'cognitive-fatigue-alert',
      ruleId: 'FATIGUE-01',
      stream: 'General',
      category: 'fatigue',
      severity: fatigue.tier === 'burnout' ? 'urgent' : 'alert',
      title: fatigue.label,
      diagnosticReason: `Your Cognitive Fatigue Index is ${fatigue.fatigueIndex}/10 (${fatigue.label}). Focus (${fatigue.avgFocus7d}/10) and volume (${fatigue.totalHours7d}h/wk) indicate mental saturation.`,
      diagnosis: `Your Cognitive Fatigue Index is ${fatigue.fatigueIndex}/10 (${fatigue.label}). Focus (${fatigue.avgFocus7d}/10) and volume (${fatigue.totalHours7d}h/wk) indicate mental saturation.`,
      actionProtocol: fatigue.restorativeProtocol,
      actionablePrescription: fatigue.restorativeProtocol,
      projectedZGain: 0.15,
      priorityScore: fatigue.tier === 'burnout' ? 99 : 85,
    });
  }

  const subjectsWithMarks = forecast.subjectMetrics.filter((s) => s.confidencePct > 0);
  if (subjectsWithMarks.length >= 2) {
    const sortedByZ = [...subjectsWithMarks].sort((a, b) => a.zScore - b.zScore);
    const weakest = sortedByZ[0];
    const strongest = sortedByZ[sortedByZ.length - 1];

    if (weakest && strongest && strongest.zScore - weakest.zScore >= 0.50) {
      prescriptions.push({
        id: 'asymmetry-drag',
        ruleId: 'ASYM-DRAG-01',
        stream: streamName,
        category: 'balance',
        severity: 'urgent',
        title: `Asymmetric Z-Score Drag in ${weakest.subject}`,
        diagnosticReason: `Your ${strongest.subject} (Z: ${strongest.zScore.toFixed(2)}) is tracking at ${strongest.grade} grade, but ${weakest.subject} (Z: ${weakest.zScore.toFixed(2)}) is pulling down your composite Z-Score.`,
        diagnosis: `Your ${strongest.subject} (Z: ${strongest.zScore.toFixed(2)}) is tracking at ${strongest.grade} grade, but ${weakest.subject} (Z: ${weakest.zScore.toFixed(2)}) is pulling down your composite Z-Score.`,
        actionProtocol: `Shift 3.5 study hours per week into ${weakest.subject} unit-by-unit past paper drills and targeted error classification.`,
        actionablePrescription: `Shift 3.5 study hours per week into ${weakest.subject} unit-by-unit past paper drills and targeted error classification.`,
        targetSubject: weakest.subject,
        projectedZGain: 0.28,
        priorityScore: 94,
      });
    }
  }

  if (equilibrium.isNeglected && equilibrium.weakestSubject) {
    prescriptions.push({
      id: 'subject-neglect-alert',
      ruleId: 'NEGLECT-01',
      stream: streamName,
      category: 'balance',
      severity: 'alert',
      title: `Asymmetric Study Allocation: ${equilibrium.weakestSubject} Neglect`,
      diagnosticReason: `Your study distribution across subjects has an equilibrium index of ${equilibrium.equilibriumPct}% (Shannon entropy ${equilibrium.entropyScore}). ${equilibrium.weakestSubject} is receiving significantly less focus than ${equilibrium.strongestSubject}.`,
      diagnosis: `Your study distribution across subjects has an equilibrium index of ${equilibrium.equilibriumPct}% (Shannon entropy ${equilibrium.entropyScore}). ${equilibrium.weakestSubject} is receiving significantly less focus than ${equilibrium.strongestSubject}.`,
      actionProtocol: `Reallocate ~${equilibrium.reallocationHoursTarget} hours from ${equilibrium.strongestSubject} to ${equilibrium.weakestSubject} this week to restore three-subject balance.`,
      actionablePrescription: `Reallocate ~${equilibrium.reallocationHoursTarget} hours from ${equilibrium.strongestSubject} to ${equilibrium.weakestSubject} this week to restore three-subject balance.`,
      targetSubject: equilibrium.weakestSubject,
      projectedZGain: 0.18,
      priorityScore: 81,
    });
  }

  const lowRoi = rois.find((r) => r.efficiencyBadge === 'Low Yield Alert ');
  if (lowRoi) {
    prescriptions.push({
      id: 'low-roi-bottleneck',
      ruleId: 'LOW-ROI-01',
      stream: streamName,
      category: 'efficiency',
      severity: 'alert',
      title: `Low Yield Study Bottleneck in ${lowRoi.subject}`,
      diagnosticReason: `You have logged ${lowRoi.totalStudyHours}h in ${lowRoi.subject}, but average mark is ${lowRoi.averageMark}%. Passive reading is yielding diminishing returns.`,
      diagnosis: `You have logged ${lowRoi.totalStudyHours}h in ${lowRoi.subject}, but average mark is ${lowRoi.averageMark}%. Passive reading is yielding diminishing returns.`,
      actionProtocol: `Replace passive notes reading with active recall: 40-minute timed past paper drills followed by immediate error taxonomy review.`,
      actionablePrescription: `Replace passive notes reading with active recall: 40-minute timed past paper drills followed by immediate error taxonomy review.`,
      targetSubject: lowRoi.subject,
      projectedZGain: 0.20,
      priorityScore: 83,
    });
  }

  streamSubjects.forEach((sub) => {
    const ema = calculateSubjectEma(sub, testMarks);
    if (ema.trend === 'accelerating' && ema.velocity >= 4) {
      prescriptions.push({
        id: `acceleration-${sub.toLowerCase().replace(/\s+/g, '-')}`,
        ruleId: 'MOMENTUM-01',
        stream: streamName,
        category: 'mastery',
        severity: 'mastery',
        title: `Positive Acceleration Momentum in ${sub}`,
        diagnosticReason: `Your ${sub} test performance has accelerated by +${ema.velocity}% over recent assessments with strong momentum (${ema.currentEma3}% EMA-3).`,
        diagnosis: `Your ${sub} test performance has accelerated by +${ema.velocity}% over recent assessments with strong momentum (${ema.currentEma3}% EMA-3).`,
        actionProtocol: `Maintain this cadence with weekly full-length model paper simulations under strict exam timer conditions.`,
        actionablePrescription: `Maintain this cadence with weekly full-length model paper simulations under strict exam timer conditions.`,
        targetSubject: sub,
        projectedZGain: 0.14,
        priorityScore: 70,
      });
    }
  });

  if (prescriptions.length === 0) {
    prescriptions.push({
      id: 'strategic-default',
      ruleId: 'STRATEGY-01',
      stream: streamName,
      category: 'strategy',
      severity: 'focus',
      title: 'Balanced A/L Study Cadence',
      diagnosticReason: `Composite Z-Score is tracking at ${forecast.compositeZScore.toFixed(2)} (${forecast.predictedGradesSummary}). Continuous logging will refine predictive precision.`,
      diagnosis: `Composite Z-Score is tracking at ${forecast.compositeZScore.toFixed(2)} (${forecast.predictedGradesSummary}). Continuous logging will refine predictive precision.`,
      actionProtocol: 'Log at least 2 timed model papers per week and record your scores in the Test Marks inspector.',
      actionablePrescription: 'Log at least 2 timed model papers per week and record your scores in the Test Marks inspector.',
      projectedZGain: 0.10,
      priorityScore: 50,
    });
  }

  return prescriptions.sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0));
}

export function generateComprehensiveCognitiveReport(member, logs, testMarks, targetTierId = 'colombo-eng-med') {
  const isBio =
    member?.stream === 'Biological Science' ||
    String(member?.stream || '').toLowerCase().includes('bio');

  const streamSubjects = isBio
    ? ['Biology', 'Chemistry', member?.optionalSubject || 'Physics']
    : ['Combined Maths', 'Physics', member?.optionalSubject || 'Chemistry'];

  const forecast = calculateCompositeZScore(streamSubjects, testMarks);
  const velocity = calculateDynamicVelocity(streamSubjects, testMarks);
  const targetGap = calculateTargetGapAnalysis(forecast.compositeZScore, streamSubjects, targetTierId);
  const fatigue = calculateCognitiveFatigueIndex(logs || [], logs?.length || 0);

  const subjectHours = streamSubjects.map((sub) => {
    let hrs = 0;
    (logs || []).forEach((log) => {
      const subs = log.subjects || [];
      const match = subs.find((s) => s.name?.toLowerCase() === sub.toLowerCase());
      if (match) hrs += Number(match.hours || 0);
    });
    return hrs;
  });

  const equilibrium = calculateSubjectEntropyEquilibrium(subjectHours, streamSubjects);
  const prescriptions = generateAiPrescriptions(member, logs, testMarks);

  const subjects = streamSubjects.map((sub) => {
    const matching = testMarks.filter((t) => t.subject.toLowerCase() === sub.toLowerCase());
    const count = matching.length;
    const avgScore = count > 0 ? matching.reduce((acc, m) => acc + m.score, 0) / count : 0;
    return calculateSubjectZScoreDetail(sub, avgScore, count);
  });

  const subjectsWithTests = subjects.filter((s) => s.confidencePct > 0);
  const confidencePct =
    subjectsWithTests.length > 0
      ? Math.round(
          subjectsWithTests.reduce((acc, s) => acc + s.confidencePct, 0) / subjectsWithTests.length
        )
      : 0;

  return {
    compositeZScore: forecast.compositeZScore,
    nationalPercentile: forecast.nationalPercentile,
    predictedGradesSummary: forecast.predictedGradesSummary,
    confidencePct,
    subjects,
    velocity,
    targetGap,
    fatigue,
    equilibrium,
    prescriptions,
  };
}


