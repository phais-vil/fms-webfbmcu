import type { CreateScheduleInput, ScheduleItemInput } from "./validations";

export interface ParsedScheduleResult {
  schedule: Partial<CreateScheduleInput>;
  items: ScheduleItemInput[];
  rawText?: string;
  detectedCount: number;
}

/**
 * Parses raw text extracted from PDF or OCR into structured schedule fields.
 */
export function parseScheduleText(text: string): ParsedScheduleResult {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const result: ParsedScheduleResult = {
    schedule: {
      academicYear: 2569,
      semester: 1,
      yearLevel: 1,
      titleTh: "",
      targetGroupTh: "",
      roomLocationTh: "",
      remarksTh: `๑. วันพระและวันนักขัตฤกษ์เป็นวันหยุดทั่วไป (ตารางเรียนวันใดตรงกับวันพระให้ยกไปเรียนวันศุกร์)\n๒. เครื่องหมายดอกจัน (*) อยู่หลังชื่อรายวิชา หมายถึง ข้อสอบกลาง\n๓. เครื่องหมายดอกจัน (*) อยู่หลังชื่อ หมายถึง อาจารย์ผู้รับผิดชอบรายวิชา\n๔. วันพระกับวันอาทิตย์เป็นวันหยุดประจำสัปดาห์`,
    },
    items: [],
    rawText: text,
    detectedCount: 0,
  };

  // 1. Detect Year
  const yearMatch = text.match(/(?:ปีการศึกษา|ปี)\s*(๒๕\d{2}|25\d{2})/);
  if (yearMatch) {
    const rawYr = yearMatch[1].replace(/[๑๒๓๔๕๖๗๘๙๐]/g, (d) =>
      String("๑๒๓๔๕๖๗๘๙๐".indexOf(d))
    );
    result.schedule.academicYear = parseInt(rawYr);
  }

  // 2. Detect Semester
  const semMatch = text.match(/(?:ภาคการศึกษาที่|ภาคเรียนที่|เทอม)\s*([๑๒๓123])/);
  if (semMatch) {
    const rawSem = semMatch[1].replace(/[๑๒๓]/g, (d) =>
      String("๑๒๓".indexOf(d) + 1)
    );
    result.schedule.semester = parseInt(rawSem);
  }

  // 3. Detect Year Level
  const levelMatch = text.match(/(?:ชั้นปีที่|ปีที่|ปี)\s*([๑๒๓๔1234])/);
  if (levelMatch) {
    const rawLvl = levelMatch[1].replace(/[๑๒๓๔]/g, (d) =>
      String("๑๒๓๔".indexOf(d) + 1)
    );
    result.schedule.yearLevel = parseInt(rawLvl);
  }

  // 4. Detect Title
  const titleLine = lines.find((l) => l.includes("ตารางสอน") || l.includes("ตารางเรียน"));
  if (titleLine) {
    result.schedule.titleTh = titleLine;
  } else {
    result.schedule.titleTh = `ตารางสอนปริญญาตรี ภาคการศึกษาที่ ${result.schedule.semester} ปีการศึกษา ${result.schedule.academicYear}`;
  }

  // 5. Detect Room Location
  const roomLine = lines.find((l) => l.includes("ห้อง") || l.includes("อาคารเรียนรวม"));
  if (roomLine) {
    result.schedule.roomLocationTh = roomLine;
  }

  // 6. Detect Target Group
  const targetLine = lines.find(
    (l) => l.includes("พระภิกษุ") || l.includes("สามเณร") || l.includes("คฤหัสถ์") || l.includes("สาขาวิชา")
  );
  if (targetLine) {
    result.schedule.targetGroupTh = targetLine;
  }

  // 7. Parse Course Items
  // Look for course codes: 000 139, 000 115, 0SP 101, 101 101, 000139
  const courseCodeRegex = /([0-9A-Z]{3}\s*[0-9]{3})/g;
  let match: RegExpExecArray | null;

  const foundCodes: string[] = [];
  while ((match = courseCodeRegex.exec(text)) !== null) {
    const code = match[1].replace(/\s+/, " ").trim();
    if (!foundCodes.includes(code)) {
      foundCodes.push(code);
    }
  }

  let order = 1;
  for (const code of foundCodes) {
    // Find line containing this code
    const lineIdx = lines.findIndex((l) => l.includes(code));
    let courseName = "";
    let instructors = "";

    if (lineIdx !== -1) {
      const line = lines[lineIdx];
      // remove the code to find course name
      const afterCode = line.replace(code, "").trim();
      if (afterCode.length > 2) {
        courseName = afterCode.replace(/^[:\-–\s]+/, "");
      } else if (lineIdx + 1 < lines.length) {
        courseName = lines[lineIdx + 1];
      }

      // Look at next lines for instructors
      for (let j = lineIdx + 1; j <= Math.min(lineIdx + 3, lines.length - 1); j++) {
        const nextL = lines[j];
        if (
          nextL.includes("พระ") ||
          nextL.includes("ดร.") ||
          nextL.includes("ผศ.") ||
          nextL.includes("รศ.") ||
          nextL.includes("ศ.") ||
          nextL.includes("อาจารย์")
        ) {
          instructors = instructors ? `${instructors}, ${nextL}` : nextL;
        }
      }
    }

    result.items.push({
      dayOfWeek: (order % 5) + 1, // Default distribute Mon-Fri
      startTime: order % 2 === 1 ? "09:00" : "12:30",
      endTime: order % 2 === 1 ? "11:30" : "15:10",
      slotPeriod: order % 2 === 1 ? "09.00 - 11.30 (คาบเช้า)" : "12.30 - 15.10 (คาบบ่าย)",
      courseCode: code,
      courseNameTh: courseName || `รายวิชา ${code}`,
      instructorsTh: instructors || "คณาจารย์ผู้รับผิดชอบรายวิชา*",
      roomOrNote: "",
      displayOrder: order,
    });
    order++;
  }

  // Detect Dates
  const startDateMatch = text.match(/(?:วันเปิดเรียน|เปิดเรียน|เริ่มเรียน)\s*[:\-–]?\s*(\d{4}-\d{2}-\d{2}|\d{1,2}\s*[^\d\s]+\s*\d{2,4})/);
  if (startDateMatch) {
    result.schedule.startDate = startDateMatch[1].trim();
  }
  const endDateMatch = text.match(/(?:วันสิ้นสุดภาคเรียน|วันสิ้นสุด|ปิดเรียน|สอบเสร็จ)\s*[:\-–]?\s*(\d{4}-\d{2}-\d{2}|\d{1,2}\s*[^\d\s]+\s*\d{2,4})/);
  if (endDateMatch) {
    result.schedule.endDate = endDateMatch[1].trim();
  }

  result.detectedCount = result.items.length;
  return result;
}

/**
 * Parses JSON format schedule payload.
 */
export function parseScheduleJson(jsonString: string): ParsedScheduleResult {
  const data = JSON.parse(jsonString);

  const schedule: Partial<CreateScheduleInput> = {
    departmentId: data.departmentId || undefined,
    curriculumId: data.curriculumId || null,
    academicYear: data.academicYear || 2569,
    semester: data.semester || 1,
    yearLevel: data.yearLevel || 1,
    titleTh: data.titleTh || "",
    titleEn: data.titleEn || "",
    targetGroupTh: data.targetGroupTh || "",
    targetGroupEn: data.targetGroupEn || "",
    roomLocationTh: data.roomLocationTh || "",
    roomLocationEn: data.roomLocationEn || "",
    startDate: data.startDate || "",
    endDate: data.endDate || "",
    remarksTh: data.remarksTh || "",
    remarksEn: data.remarksEn || "",
    fileUrl: data.fileUrl || "",
    isActive: data.isActive !== undefined ? data.isActive : true,
  };

  const items: ScheduleItemInput[] = (data.items || []).map(
    (it: Partial<ScheduleItemInput>, idx: number) => ({
      dayOfWeek: it.dayOfWeek || 1,
      startTime: it.startTime || "09:00",
      endTime: it.endTime || "11:30",
      slotPeriod: it.slotPeriod || "09.00 - 11.30 (คาบเช้า)",
      courseCode: it.courseCode || "",
      courseNameTh: it.courseNameTh || "",
      courseNameEn: it.courseNameEn || "",
      instructorsTh: it.instructorsTh || "",
      instructorsEn: it.instructorsEn || "",
      roomOrNote: it.roomOrNote || "",
      displayOrder: it.displayOrder || idx + 1,
    })
  );

  return {
    schedule,
    items,
    detectedCount: items.length,
  };
}

/**
 * Parses CSV format schedule payload.
 */
export function parseScheduleCsv(csvString: string): ParsedScheduleResult {
  const lines = csvString
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const schedule: Partial<CreateScheduleInput> = {
    academicYear: 2569,
    semester: 1,
    yearLevel: 1,
    titleTh: "",
    targetGroupTh: "",
    roomLocationTh: "",
    startDate: "",
    endDate: "",
    remarksTh: "",
  };

  const items: ScheduleItemInput[] = [];

  for (const line of lines) {
    // Comment / Metadata line e.g. # Title: ...
    if (line.startsWith("#")) {
      const meta = line.substring(1).trim();
      const colonIdx = meta.indexOf(":");
      if (colonIdx !== -1) {
        const key = meta.substring(0, colonIdx).trim().toLowerCase();
        const val = meta.substring(colonIdx + 1).trim();
        if (key.includes("title")) schedule.titleTh = val;
        else if (key.includes("year") && !key.includes("level")) schedule.academicYear = parseInt(val) || 2569;
        else if (key.includes("semester") || key.includes("term")) schedule.semester = parseInt(val) || 1;
        else if (key.includes("level")) schedule.yearLevel = parseInt(val) || 1;
        else if (key.includes("room") || key.includes("location")) schedule.roomLocationTh = val;
        else if (key.includes("target") || key.includes("group")) schedule.targetGroupTh = val;
        else if (key.includes("start")) schedule.startDate = val;
        else if (key.includes("end")) schedule.endDate = val;
        else if (key.includes("remarks")) schedule.remarksTh = val;
      }
      continue;
    }

    // Skip CSV header line if present
    if (
      line.toLowerCase().includes("coursecode") ||
      line.toLowerCase().includes("รหัสวิชา") ||
      line.toLowerCase().includes("day,start")
    ) {
      continue;
    }

    // Parse CSV row values (handling simple quoted strings)
    const cols: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        cols.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    cols.push(current.trim());

    if (cols.length >= 5) {
      // Expected cols: Day, StartTime, EndTime, SlotPeriod, CourseCode, CourseName, Instructors, RoomOrNote
      const dayVal = parseInt(cols[0]) || 1;
      const startTime = cols[1] || "09:00";
      const endTime = cols[2] || "11:30";
      const slotPeriod = cols[3] || `${startTime} - ${endTime}`;
      const courseCode = cols[4] || "";
      const courseNameTh = cols[5] || "";
      const instructorsTh = cols[6] || "";
      const roomOrNote = cols[7] || "";

      if (courseCode || courseNameTh) {
        items.push({
          dayOfWeek: dayVal,
          startTime,
          endTime,
          slotPeriod,
          courseCode,
          courseNameTh,
          courseNameEn: "",
          instructorsTh,
          instructorsEn: "",
          roomOrNote,
          displayOrder: items.length + 1,
        });
      }
    }
  }

  if (!schedule.titleTh) {
    schedule.titleTh = `ตารางสอนประจำภาคการศึกษาที่ ${schedule.semester} ปีการศึกษา ${schedule.academicYear}`;
  }

  return {
    schedule,
    items,
    detectedCount: items.length,
  };
}

/**
 * Generates sample JSON template for downloading.
 */
export function getSampleScheduleJson(): string {
  const sample = getBuddhismBachelorScheduleSample();
  return JSON.stringify(sample, null, 2);
}

/**
 * Authentic MCU Bachelor of Buddhism Schedule Sample (พระพุทธศาสนา ชั้นปีที่ ๑ ภาค ๑ ปี ๒๕๖๙)
 */
export function getBuddhismBachelorScheduleSample() {
  return {
    academicYear: 2569,
    semester: 1,
    yearLevel: 1,
    titleTh: "ตารางสอนปริญญาตรี ภาคการศึกษาที่ ๑ ปีการศึกษา ๒๕๖๙ คณะพุทธศาสตร์",
    titleEn: "Bachelor Timetable Semester 1, Academic Year 2026 Faculty of Buddhism",
    targetGroupTh: "คณะพุทธศาสตร์ ชั้นปีที่ ๑ (พระภิกษุ สามเณร และคฤหัสถ์) สาขาวิชาพระพุทธศาสนา",
    targetGroupEn: "Faculty of Buddhism Year 1, Major in Buddhist Studies",
    roomLocationTh: "อาคารเรียนรวม ชั้น ๕ ห้อง D ๕๑๖/๑ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย อำเภอวังน้อย จังหวัดพระนครศรีอยุธยา",
    roomLocationEn: "MCU Academic Complex, 5th Floor, Room D 516/1, Wang Noi, Ayutthaya",
    startDate: "2026-06-09",
    endDate: "2026-09-25",
    remarksTh: `๑. วันพระและวันนักขัตฤกษ์เป็นวันหยุดทั่วไป (ตารางเรียนวันใดตรงกับวันพระให้ยกไปเรียนวันศุกร์)\n๒. เครื่องหมายดอกจัน (*) อยู่หลังชื่อรายวิชา หมายถึง ข้อสอบกลาง\n๓. เครื่องหมายดอกจัน (*) อยู่หลังชื่อ หมายถึง อาจารย์ผู้รับผิดชอบรายวิชา\n๔. วันพระกับวันอาทิตย์เป็นวันหยุดประจำสัปดาห์`,
    remarksEn: "1. Buddhist Sabbath days and official holidays are observed.\n2. Asterisk (*) denotes centralized exam or course chair.\n3. Sundays and Sabbath days are weekly holidays.",
    items: [
      {
        dayOfWeek: 1,
        startTime: "09:00",
        endTime: "11:30",
        slotPeriod: "09.00 - 11.30 (คาบเช้า)",
        courseCode: "000 102",
        courseNameTh: "กฎหมายทั่วไป",
        courseNameEn: "General Law",
        instructorsTh: "พระมหามงคลกานต์ ฐิตธมฺโม, รศ.ดร.*, อ.ดร.คงขิต ชินสัญจน์, อ.ดร.ณัฐนันท์ สุดประเสริฐ",
        instructorsEn: "Assoc. Prof. Phramaha Mongkolkan Thitadhammo*, Dr. Khongchit, Dr. Natthanan",
        roomOrNote: "ห้อง D ๕๑๖/๑",
        displayOrder: 1,
      },
      {
        dayOfWeek: 1,
        startTime: "12:30",
        endTime: "15:10",
        slotPeriod: "12.30 - 15.10 (คาบบ่าย)",
        courseCode: "000 136",
        courseNameTh: "ภาษาบาลี",
        courseNameEn: "Pali Language",
        instructorsTh: "ผศ.ดร.บุญเกิด เจริญแนว",
        instructorsEn: "Asst. Prof. Dr. Boonkerd Charoennaeo",
        roomOrNote: "ห้อง D ๕๑๖/๑",
        displayOrder: 2,
      },
      {
        dayOfWeek: 2,
        startTime: "09:00",
        endTime: "11:30",
        slotPeriod: "09.00 - 11.30 (คาบเช้า)",
        courseCode: "101 103",
        courseNameTh: "นิเทศศาสตร์ในพระไตรปิฎก",
        courseNameEn: "Communication Arts in Tipitaka",
        instructorsTh: "พระราชญาณกวีระเวที, ผศ.ดร., ผศ.พิเศษ ดร.เสนาะ ผดุงฉัตร*",
        instructorsEn: "Phra Rajayanakawirawethee, Asst. Prof. Dr., Asst. Prof. Dr. Sanoe*",
        roomOrNote: "ห้อง D ๕๑๖/๑",
        displayOrder: 3,
      },
      {
        dayOfWeek: 2,
        startTime: "12:30",
        endTime: "15:10",
        slotPeriod: "12.30 - 15.10 (คาบบ่าย)",
        courseCode: "000 140",
        courseNameTh: "กรรมฐาน ๑",
        courseNameEn: "Meditation Practice 1",
        instructorsTh: "พระครูพิสิฐธรรมพิสุทธิ์, อ.ดร.*, พระมหาไพโรจน์ ญาณกุสโล, อ.ดร.",
        instructorsEn: "Phrakhru Pisitdhammapisut, Dr.*, Phramaha Pairote, Dr.",
        roomOrNote: "ห้อง D ๕๑๖/๑",
        displayOrder: 4,
      },
      {
        dayOfWeek: 3,
        startTime: "09:00",
        endTime: "11:30",
        slotPeriod: "09.00 - 11.30 (คาบเช้า)",
        courseCode: "101 101",
        courseNameTh: "พระพุทธศาสนากับวิทยาศาสตร์",
        courseNameEn: "Buddhism and Science",
        instructorsTh: "รศ.ดร.สุเทพ พรมเลิศ*, อ.ดร.อรจิรา วงษาพาน",
        instructorsEn: "Assoc. Prof. Dr. Suthep Promlert*, Dr. Onjira Vongsapan",
        roomOrNote: "ห้อง D ๕๑๖/๑",
        displayOrder: 5,
      },
      {
        dayOfWeek: 3,
        startTime: "12:30",
        endTime: "15:10",
        slotPeriod: "12.30 - 15.10 (คาบบ่าย)",
        courseCode: "000 101",
        courseNameTh: "มนุษย์กับสังคม*",
        courseNameEn: "Man and Society",
        instructorsTh: "พระมหาสุริยัน ฐิตปัญโญ, อ.ดร.*, อ.ดร.อธิเทพ ผาทา",
        instructorsEn: "Phramaha Suriyan, Dr.*, Dr. Athithep Phatha",
        roomOrNote: "ห้อง D ๕๑๖/๑",
        displayOrder: 6,
      },
      {
        dayOfWeek: 4,
        startTime: "09:00",
        endTime: "10:40",
        slotPeriod: "09.00 - 10.40 (๒ คาบ เช้า)",
        courseCode: "0SP 101",
        courseNameTh: "บาลี ๑ (รายวิชาเสริมพื้นฐาน)",
        courseNameEn: "Pali 1 (Fundamental Course)",
        instructorsTh: "พระมหาสมเดช ตปสีโล, อ.ดร.",
        instructorsEn: "Phramaha Somdet Tapasilo, Dr.",
        roomOrNote: "ห้อง D ๕๑๖/๑",
        displayOrder: 7,
      },
    ],
  };
}

/**
 * Authentic MCU Master/Doctoral of Philosophy Schedule Sample (ศาสนาและปรัชญา)
 */
export function getPhilosophyMasterScheduleSample() {
  return {
    academicYear: 2569,
    semester: 1,
    yearLevel: 1,
    titleTh: "ตารางสอนระดับบัณฑิตศึกษา ปริญญาโท-เอก ภาคการศึกษาที่ ๑ ปีการศึกษา ๒๕๖๙",
    titleEn: "Graduate Timetable (M.A. & Ph.D.) Semester 1, Academic Year 2026",
    targetGroupTh: "นิสิตระดับปริญญาโท-เอก ภาควิชาศาสนาและปรัชญา คณะพุทธศาสตร์",
    targetGroupEn: "Graduate Students in Religion and Philosophy, Faculty of Buddhism",
    roomLocationTh: "อาคารเรียนรวม ชั้น ๔ ห้อง D ๔๐๒ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย",
    roomLocationEn: "MCU Academic Complex, 4th Floor, Room D 402",
    startDate: "2026-06-13",
    endDate: "2026-09-27",
    remarksTh: `๑. จัดการเรียนการสอนทุกวันเสาร์และอาทิตย์\n๒. นิสิตต้องเข้าเรียนไม่น้อยกว่าร้อยละ ๘๐ ของเวลาเรียนทั้งหมด`,
    remarksEn: "1. Classes conducted every Saturday and Sunday.\n2. Minimum 80% class attendance is required.",
    items: [
      {
        dayOfWeek: 6,
        startTime: "09:00",
        endTime: "12:00",
        slotPeriod: "09.00 - 12.00 (เสาร์เช้า)",
        courseCode: "601 101",
        courseNameTh: "ปรัชญาศาสนาขั้นสูง",
        courseNameEn: "Advanced Philosophy of Religion",
        instructorsTh: "ศ.ดร.สมภาร พรมทา*, พระมหาบุญเลิศ อินฺทปญฺโญ, ศ.ดร.",
        roomOrNote: "ห้อง D ๔๐๒",
        displayOrder: 1,
      },
      {
        dayOfWeek: 6,
        startTime: "13:00",
        endTime: "16:00",
        slotPeriod: "13.00 - 16.00 (เสาร์บ่าย)",
        courseCode: "601 102",
        courseNameTh: "สัมมนาปรัชญาตะวันออกและอินเดีย",
        courseNameEn: "Seminar on Eastern and Indian Philosophy",
        instructorsTh: "รศ.ดร.พระมหาสุเทพ อธิปญฺโญ*, ผศ.ดร.ชาญณรงค์ บุญหนุน",
        roomOrNote: "ห้อง D ๔๐๒",
        displayOrder: 2,
      },
      {
        dayOfWeek: 7,
        startTime: "09:00",
        endTime: "12:00",
        slotPeriod: "09.00 - 12.00 (อาทิตย์เช้า)",
        courseCode: "601 103",
        courseNameTh: "ระเบียบวิธีวิจัยขั้นสูงทางพุทธปรัชญา",
        courseNameEn: "Advanced Research Methodology in Buddhist Philosophy",
        instructorsTh: "พระพรหมบัณฑิต, ศ.ดร.*, พระธรรมวัชรบัณฑิต, ศ.ดร.",
        roomOrNote: "ห้อง D ๔๐๒",
        displayOrder: 3,
      },
      {
        dayOfWeek: 7,
        startTime: "13:00",
        endTime: "16:00",
        slotPeriod: "13.00 - 16.00 (อาทิตย์บ่าย)",
        courseCode: "601 104",
        courseNameTh: "จริยศาสตร์ประยุกต์และสันติศึกษา",
        courseNameEn: "Applied Ethics and Peace Studies",
        instructorsTh: "พระเมธีธรรมาจารย์, ดร.*, รศ.ดร.สุรพล สุยะพรหม",
        roomOrNote: "ห้อง D ๔๐๒",
        displayOrder: 4,
      },
    ],
  };
}

/**
 * Generates sample CSV template string.
 */
export function getSampleScheduleCsv(): string {
  return `# Title: ตารางสอนปริญญาตรี ภาคการศึกษาที่ ๑ ปีการศึกษา ๒๕๖๙ คณะพุทธศาสตร์
# AcademicYear: 2569
# Semester: 1
# YearLevel: 1
# Room: อาคารเรียนรวม ชั้น ๕ ห้อง D ๕๑๖/๑ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย
# TargetGroup: คณะพุทธศาสตร์ ชั้นปีที่ ๑ สาขาวิชาพระพุทธศาสนา
# StartDate: 2026-06-09
# EndDate: 2026-09-25
# Remarks: ๑. วันพระและวันนักขัตฤกษ์เป็นวันหยุดทั่วไป ๒. วันพระกับวันอาทิตย์เป็นวันหยุดประจำสัปดาห์
Day,StartTime,EndTime,SlotPeriod,CourseCode,CourseName,Instructors,RoomOrNote
1,09:00,11:30,09.00 - 11.30 (คาบเช้า),000 139,จิตวิทยาทั่วไป,"ผศ.ดร.บุญมี พวงเพชร*, ดร.ณรงค์ ปั้นงาม",ห้อง D ๕๑๖/๑
1,12:30,15:10,12.30 - 15.10 (คาบบ่าย),000 115,ภาษาอังกฤษเบื้องต้น,"ผศ.ดร.ระพิน พุทธิสรรค์*, รศ.ดร.พิเศษ เสนอ ผดุงอรรถ*",ห้อง D ๕๑๖/๑
2,09:00,11:30,09.00 - 11.30 (คาบเช้า),000 102,กฎหมายทั่วไป,"รศ.ดร.กานต์ จันทรา*, พระมหาธนรัตน์ ฐิตปญฺโญ",ห้อง D ๕๑๖/๑
2,12:30,15:10,12.30 - 15.10 (คาบบ่าย),000 140,การเจริญสมาธิภาวนา ๑,"พระครูพิสิฐธรรมพิสุทธิ์, ดร.*, พระมหาไพโรจน์ ญาณกุสโล, ดร.",ห้อง D ๕๑๖/๑
3,09:00,11:30,09.00 - 11.30 (คาบเช้า),000 101,มนุษย์กับสังคม,"ผศ.ดร.สำราญ ท้าวเงิน*, ดร.วิเชียร พันธุลา",ห้อง D ๕๑๖/๑
3,12:30,15:10,12.30 - 15.10 (คาบบ่าย),000 104,พระพุทธศาสนากับวิทยาศาสตร์,"พระมหาวิเชียร สุธีโร, ดร.*, รศ.ดร.สุรพล สุยะพรหม",ห้อง D ๕๑๖/๑
4,09:00,11:30,09.00 - 11.30 (คาบเช้า),101 101,ประวัติพระพุทธศาสนา,"พระมหาประยูร โชติปญฺโญ, ดร.*",ห้อง D ๕๑๖/๑
4,12:30,15:10,12.30 - 15.10 (คาบบ่าย),000 138,ภาษากับการสื่อสาร,"ผศ.ดร.สมปอง มาดี*, อาจารย์สุริยา รัตนประทีป",ห้อง D ๕๑๖/๑
`;
}
