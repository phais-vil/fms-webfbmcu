import "dotenv/config";
import { PrismaClient, Prisma } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { seedCore, seedUser } from "./lib/seed-core";
import { requireDatabaseUrl } from "./lib/require-database-url";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: requireDatabaseUrl() }) });

/** รหัสผ่านทุกบัญชีตัวอย่าง */
export const DEV_PASSWORD = "Passw0rd!vibe";

async function main() {
  if (process.env.NODE_ENV === "production" && process.env.SEED_ALLOW_PROD !== "1") {
    console.error("[seed] ปฏิเสธ: NODE_ENV=production — ใช้ npm run db:bootstrap แทน");
    process.exit(1);
  }
  const core = await seedCore(prisma, { tenantCode: "DEMO", nameTh: "คณะพุทธศาสตร์ มจร", nameEn: "Faculty of Buddhism, MCU" });
  const hash = await bcrypt.hash(DEV_PASSWORD, 12);
  const users = [
    { email: "admin@app.local", name: "ผู้ดูแลสูงสุด", roles: ["SUPER_ADMIN"] },
    { email: "staff@app.local", name: "เจ้าหน้าที่", roles: ["STAFF"] },
    { email: "viewer@app.local", name: "ผู้ดู", roles: ["VIEWER"] },
    { email: "lockme@app.local", name: "บัญชีทดสอบล็อก", roles: ["VIEWER"] },
    { email: "forced@app.local", name: "บัญชีบังคับเปลี่ยนรหัส", roles: ["VIEWER"], mustChangePassword: true },
  ];
  for (const u of users) {
    await seedUser(prisma, core.tenantId, { ...u, passwordHash: hash, roleIds: u.roles.map((c) => core.roleIds[c]) });
  }

  // Seed News Categories
  const categories = [
    { code: "ACADEMIC", nameTh: "ข่าววิชาการและการวิจัย", nameEn: "Academic & Research", displayOrder: 1 },
    { code: "ADMISSION", nameTh: "ข่าวรับสมัครและทุนการศึกษา", nameEn: "Admissions & Scholarships", displayOrder: 2 },
    { code: "STUDENT", nameTh: "ข่าวกิจกรรมนิสิต", nameEn: "Student Activities", displayOrder: 3 },
    { code: "GENERAL", nameTh: "ข่าวประชาสัมพันธ์ทั่วไป", nameEn: "General News", displayOrder: 4 },
  ];

  const catMap: Record<string, string> = {};
  for (const cat of categories) {
    const row = await prisma.newsCategory.upsert({
      where: { tenantId_code: { tenantId: core.tenantId, code: cat.code } },
      update: { nameTh: cat.nameTh, nameEn: cat.nameEn, displayOrder: cat.displayOrder },
      create: { tenantId: core.tenantId, code: cat.code, nameTh: cat.nameTh, nameEn: cat.nameEn, displayOrder: cat.displayOrder },
    });
    catMap[cat.code] = row.id;
  }

  // Seed Sample News Articles
  const articles = [
    {
      categoryId: catMap["ACADEMIC"],
      slug: "international-buddhist-studies-conference-2026",
      titleTh: "ขอเชิญร่วมงานสัมมนาวิชาการระดับนานาชาติด้านพระพุทธศาสนา ครั้งที่ 15",
      titleEn: "The 15th International Buddhist Studies Conference: Buddhism & Social Transformation",
      summaryTh: "คณะพุทธศาสตร์ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย ร่วมกับสถาบันวิจัยพุทธศาสตร์ จัดงานสัมมนาวิชาการระดับนานาชาติ",
      summaryEn: "Faculty of Buddhism, MCU hosts the 15th International Conference on Buddhist Studies focusing on global social transformation.",
      contentTh: `คณะพุทธศาสตร์ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย ขอเชิญนักวิชาการ นักวิจัย คณาจารย์ นิสิต และผู้สนใจทั่วไป ร่วมงานสัมมนาวิชาการระดับนานาชาติด้านพระพุทธศาสนา ครั้งที่ 15 ภายใต้หัวข้อ "พระพุทธศาสนากับการเปลี่ยนแปลงของสังคมโลกยุคดิจิทัล" (Buddhism & Global Transformation in the Digital Era)

โดยมีวัตถุประสงค์เพื่อเป็นเวทีแลกเปลี่ยนองค์ความรู้ด้านพุทธศาสตร์ บูรณาการหลักพุทธธรรมกับการพัฒนาสังคม และนำเสนอบทความวิจัยจากนักวิชาการชั้นนำทั่วโลก

กำหนดการจัดงาน:
- วันที่ 15-16 พฤศจิกายน 2568 ณ หอประชุม มวก. 48 พรรษา มจร วังน้อย อยุธยา
- มีการถ่ายทอดสดผ่านระบบ Zoom และ Facebook Live`,
      contentEn: `The Faculty of Buddhism, Mahachulalongkornrajavidyalaya University, invites scholars, researchers, faculty members, and students to participate in the 15th International Buddhist Studies Conference.

Theme: "Buddhism & Global Transformation in the Digital Era"

Date: November 15-16, 2026 at MCU Main Auditorium, Wang Noi, Ayutthaya, Thailand. Live stream available via Zoom and YouTube Live.`,
      coverImage: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80",
      isPinned: true,
      status: "PUBLISHED" as const,
      publishedAt: new Date(),
    },
    {
      categoryId: catMap["ADMISSION"],
      slug: "admission-undergraduate-graduate-2026",
      titleTh: "เปิดรับสมัครนิสิตใหม่ ระดับปริญญาตรีและบัณฑิตศึกษา ประจำปีการศึกษา 2568",
      titleEn: "Admissions Open: Bachelor, Master and Ph.D. Programs in Buddhist Studies 2026",
      summaryTh: "คณะพุทธศาสตร์เปิดรับสมัครผู้สำเร็จการศึกษาเข้ารับการศึกษาต่อในสาขาวิชาพระพุทธศาสนา และปรัชญา",
      summaryEn: "MCU Faculty of Buddhism opens applications for 2026 academic year across all degree programs.",
      contentTh: `เปิดรับสมัครนิสิตใหม่ ประจำปีการศึกษา 2568 ทั้งระดับปริญญาตรี ปริญญาโท และปริญญาเอก 

หลักสูตรที่เปิดรับสมัคร:
1. หลักสูตรพุทธศาสตรบัณฑิต (พธ.บ.) สาขาวิชาพระพุทธศาสนา และปรัชญา
2. หลักสูตรพุทธศาสตรมหาบัณฑิต (พธ.ม.) 
3. หลักสูตรพุทธศาสตรดุษฎีบัณฑิต (พธ.ด.)

พร้อมทุนการศึกษาสำหรับพระภิกษุ สามเณร และนิสิตคฤหัสถ์ผู้มีผลการเรียนดีเด่น`,
      contentEn: `Applications are now open for the 2026 academic year in Bachelor, Master, and Doctoral degrees in Buddhist Studies and Philosophy. Scholarships are available for distinguished monastic and lay students.`,
      coverImage: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
      isPinned: true,
      status: "PUBLISHED" as const,
      publishedAt: new Date(),
    },
    {
      categoryId: catMap["STUDENT"],
      slug: "faculty-mindfulness-meditation-retreat",
      titleTh: "คณะพุทธศาสตร์จัดกิจกรรมปฏิบัติธรรมและพัฒนาจิตใจนิสิตประจำปี",
      titleEn: "Faculty Organizes Annual Mindfulness & Vipassana Meditation Retreat",
      summaryTh: "กิจกรรมเสริมสร้างคุณธรรม จริยธรรม และการเจริญสติภาวนาสำหรับนิสิตใหม่และนิสิตปัจจุบัน",
      summaryEn: "Annual meditation workshop cultivating inner peace, mindfulness and Buddhist leadership for students.",
      contentTh: `คณะพุทธศาสตร์ได้จัดโครงการปฏิบัติธรรมเพื่อพัฒนาศักยภาพนิสิตและเสริมสร้างความเป็นผู้นำทางจิตวิญญาณ โดยมีพระมหาเถระและพระอาจารย์ผู้ทรงคุณวุฒิเมตตาให้การอบรมด้านสติปัฏฐาน 4 และการนำหลักธรรมไปใช้ในการดำเนินชีวิตประจำวัน`,
      contentEn: `The Faculty of Buddhism successfully hosted its annual meditation retreat emphasizing Vipassana mindfulness practice and spiritual leadership for students.`,
      coverImage: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80",
      isPinned: false,
      status: "PUBLISHED" as const,
      publishedAt: new Date(),
    },
    {
      categoryId: catMap["GENERAL"],
      slug: "ai-and-buddhist-ethics-lecture",
      titleTh: "การบรรยายพิเศษ: ปัญญาประดิษฐ์กับจริยธรรมพุทธศาสนาในโลกยุคดิจิทัล",
      titleEn: "Special Lecture on Artificial Intelligence and Buddhist Ethics",
      summaryTh: "มุมมองทางพุทธปรัชญาต่อการพัฒนาเทคโนโลยี AI และความรับผิดชอบต่อเพื่อนมนุษย์",
      summaryEn: "Philosophical insights into ethical AI deployment grounded in compassionate Buddhist principles.",
      contentTh: `คณะพุทธศาสตร์จัดเสวนาทางวิชาการในหัวข้อ "ปัญญาประดิษฐ์และจริยธรรมพุทธศาสนา" เพื่อสร้างความเข้าใจในมิติจริยธรรมของการนำ AI มาประยุกต์ใช้ในสังคม การศึกษา และการเผยแผ่พระพุทธศาสนาอย่างสร้างสรรค์`,
      contentEn: `Faculty of Buddhism held an insightful academic panel exploring Buddhist ethical frameworks applied to artificial intelligence innovation and human well-being.`,
      coverImage: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80",
      isPinned: false,
      status: "PUBLISHED" as const,
      publishedAt: new Date(),
    },
  ];

  for (const art of articles) {
    await prisma.newsArticle.upsert({
      where: { tenantId_slug: { tenantId: core.tenantId, slug: art.slug } },
      update: {
        titleTh: art.titleTh,
        titleEn: art.titleEn,
        summaryTh: art.summaryTh,
        summaryEn: art.summaryEn,
        contentTh: art.contentTh,
        contentEn: art.contentEn,
        coverImage: art.coverImage,
        isPinned: art.isPinned,
        status: art.status,
      },
      create: {
        tenantId: core.tenantId,
        categoryId: art.categoryId,
        slug: art.slug,
        titleTh: art.titleTh,
        titleEn: art.titleEn,
        summaryTh: art.summaryTh,
        summaryEn: art.summaryEn,
        contentTh: art.contentTh,
        contentEn: art.contentEn,
        coverImage: art.coverImage,
        isPinned: art.isPinned,
        status: art.status,
        publishedAt: art.publishedAt,
      },
    });
  }

  // Seed Departments
  const deptList = [
    { code: "DEAN_OFFICE", nameTh: "สำนักงานคณบดี", nameEn: "Dean's Office", displayOrder: 1 },
    { code: "BUDDHISM", nameTh: "ภาควิชาพระพุทธศาสนา", nameEn: "Department of Buddhism", displayOrder: 2 },
    { code: "PHILOSOPHY", nameTh: "ภาควิชาศาสนาและปรัชญา", nameEn: "Department of Religion and Philosophy", displayOrder: 3 },
  ];

  const deptMap: Record<string, string> = {};
  for (const d of deptList) {
    const row = await prisma.academicDepartment.upsert({
      where: { tenantId_code: { tenantId: core.tenantId, code: d.code } },
      update: { nameTh: d.nameTh, nameEn: d.nameEn, displayOrder: d.displayOrder },
      create: { tenantId: core.tenantId, code: d.code, nameTh: d.nameTh, nameEn: d.nameEn, displayOrder: d.displayOrder },
    });
    deptMap[d.code] = row.id;
  }

  // Seed Staff Profiles
  const staffSample = [
    {
      departmentId: deptMap["DEAN_OFFICE"],
      prefixTh: "ศ.ดร.พระธรรมวัชรบัณฑิต",
      prefixEn: "Prof. Dr. Phra Dhammavajrabundit",
      firstNameTh: "สมจินต์",
      lastNameTh: "สมฺมาปญฺโญ",
      firstNameEn: "Somjin",
      lastNameEn: "Sammapañño",
      academicRankTh: "ศาสตราจารย์",
      academicRankEn: "Professor",
      adminPositionTh: "คณบดีคณะพุทธศาสตร์",
      adminPositionEn: "Dean of Faculty of Buddhism",
      email: "dean.buddhism@mcu.ac.th",
      phone: "035-248-000 ต่อ 8100",
      officeRoom: "ห้อง 401 อาคารเรียนรวม มจร",
      avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
      bioTh: "เปรียญธรรม 9 ประโยค, พธ.บ. (ภาษาอังกฤษ), M.A. (Philosophy), Ph.D. (Philosophy) มหาวิทยาลัยพาราณสี ประเทศอินเดีย",
      bioEn: "Pali Scholar Level 9, B.A. (English), M.A., Ph.D. (Philosophy) Banaras Hindu University, India",
      researchInterests: "พระไตรปิฎกศึกษา, คัมภีร์อรรถกถา, พุทธปรัชญาเถรวาทและมหายาน",
      isExecutive: true,
      displayOrder: 1,
    },
    {
      departmentId: deptMap["DEAN_OFFICE"],
      prefixTh: "รศ.ดร.พระสุวรรณเมธี",
      prefixEn: "Assoc. Prof. Dr. Phra Suwannamethi",
      firstNameTh: "สุวรรณ",
      lastNameTh: "โชติวโร",
      firstNameEn: "Suwan",
      lastNameEn: "Chotiwaro",
      academicRankTh: "รองศาสตราจารย์",
      academicRankEn: "Associate Professor",
      adminPositionTh: "รองคณบดีฝ่ายวิชาการ",
      adminPositionEn: "Associate Dean for Academic Affairs",
      email: "academic.buddhism@mcu.ac.th",
      phone: "035-248-000 ต่อ 8102",
      officeRoom: "ห้อง 402 อาคารเรียนรวม มจร",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
      bioTh: "เปรียญธรรม 7 ประโยค, พธ.บ., ศศ.ม. (มานุษยวิทยา), Ph.D. (Buddhist Studies)",
      bioEn: "Pali Scholar Level 7, B.A., M.A. (Anthropology), Ph.D. (Buddhist Studies)",
      researchInterests: "มานุษยวิทยาพุทธศาสนา, การพัฒนาหลักสูตรและการประกันคุณภาพการศึกษา",
      isExecutive: true,
      displayOrder: 2,
    },
    {
      departmentId: deptMap["BUDDHISM"],
      prefixTh: "รศ.ดร.",
      prefixEn: "Assoc. Prof. Dr.",
      firstNameTh: "สมชัย",
      lastNameTh: "ศรีนอก",
      firstNameEn: "Somchai",
      lastNameEn: "Srinok",
      academicRankTh: "รองศาสตราจารย์",
      academicRankEn: "Associate Professor",
      adminPositionTh: "หัวหน้าภาควิชาพระพุทธศาสนา",
      adminPositionEn: "Head of Department of Buddhism",
      email: "somchai.sri@mcu.ac.th",
      phone: "035-248-000 ต่อ 8110",
      officeRoom: "ห้อง 405 อาคารเรียนรวม มจร",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
      bioTh: "พธ.บ. (พระพุทธศาสนา), อ.ม. (ภาษาบาลีและสันสกฤต จุฬาฯ), Ph.D. (Pali and Buddhist Studies)",
      bioEn: "B.A. (Buddhist Studies), M.A. (Pali and Sanskrit, Chulalongkorn), Ph.D.",
      researchInterests: "ภาษาบาลีและวรรณคดีพุทธศาสนา, พระอภิธรรมมัตถสังคหะ",
      isExecutive: true,
      displayOrder: 3,
    },
    {
      departmentId: deptMap["PHILOSOPHY"],
      prefixTh: "ผศ.ดร.พระมหาวีรชัย",
      prefixEn: "Asst. Prof. Dr. Phramaha Weerachai",
      firstNameTh: "วีรชโย",
      lastNameTh: "สุทธิวารี",
      firstNameEn: "Weerachayo",
      lastNameEn: "Sutthiwari",
      academicRankTh: "ผู้ช่วยศาสตราจารย์",
      academicRankEn: "Assistant Professor",
      adminPositionTh: "หัวหน้าภาควิชาศาสนาและปรัชญา",
      adminPositionEn: "Head of Department of Religion and Philosophy",
      email: "weerachai.s@mcu.ac.th",
      phone: "035-248-000 ต่อ 8120",
      officeRoom: "ห้อง 408 อาคารเรียนรวม มจร",
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
      bioTh: "เปรียญธรรม 8 ประโยค, พธ.บ. (ปรัชญา), M.A. (Philosophy), Ph.D. (Philosophy)",
      bioEn: "Pali Scholar Level 8, B.A. (Philosophy), M.A., Ph.D. (Philosophy)",
      researchInterests: "ปรัชญาอินเดียโบราณ, พุทธญาณวิทยาและจริยศาสตร์สิ่งแวดล้อม",
      isExecutive: true,
      displayOrder: 4,
    },
    {
      departmentId: deptMap["BUDDHISM"],
      prefixTh: "ดร.",
      prefixEn: "Dr.",
      firstNameTh: "บุญส่ง",
      lastNameTh: "แสงสุวรรณ",
      firstNameEn: "Boonsong",
      lastNameEn: "Saengsuwan",
      academicRankTh: "อาจารย์",
      academicRankEn: "Lecturer",
      adminPositionTh: null,
      adminPositionEn: null,
      email: "boonsong.s@mcu.ac.th",
      phone: "035-248-000 ต่อ 8115",
      officeRoom: "ห้อง 410 อาคารเรียนรวม มจร",
      avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80",
      bioTh: "พธ.บ. (พระพุทธศาสนา), พธ.ม. (พระพุทธศาสนา), Ph.D. (Buddhist Studies)",
      bioEn: "B.A., M.A., Ph.D. (Buddhist Studies)",
      researchInterests: "ประวัติศาสตร์พระพุทธศาสนาในเอเชียอาคเนย์, พระพุทธศาสนากับสันติภาพ",
      isExecutive: false,
      displayOrder: 5,
    },
  ];

  for (const s of staffSample) {
    const existing = await prisma.staffProfile.findFirst({
      where: { tenantId: core.tenantId, email: s.email },
    });
    if (existing) {
      await prisma.staffProfile.update({
        where: { id: existing.id },
        data: s,
      });
    } else {
      await prisma.staffProfile.create({
        data: { tenantId: core.tenantId, ...s },
      });
    }
  }

  // Seed Curriculums
  const curriculumSample = [
    {
      code: "B.A.-BUDDHISM",
      departmentId: deptMap["BUDDHISM"],
      nameTh: "หลักสูตรพุทธศาสตรบัณฑิต สาขาวิชาพระพุทธศาสนา",
      nameEn: "Bachelor of Arts Program in Buddhist Studies",
      degreeTh: "พุทธศาสตรบัณฑิต (พระพุทธศาสนา)",
      degreeEn: "Bachelor of Arts (Buddhist Studies)",
      degreeAbbrTh: "พธ.บ. (พระพุทธศาสนา)",
      degreeAbbrEn: "B.A. (Buddhist Studies)",
      degreeLevel: "BACHELOR" as const,
      totalCredits: 136,
      durationYears: 4,
      philosophyTh: "ผลิตบัณฑิตให้มีความรอบรู้ในหลักธรรมทางพระพุทธศาสนาอย่างลึกซึ้ง มีความสามารถในการประยุกต์ใช้พุทธธรรมเพื่อแก้ไขปัญหาชีวิตและสังคมอย่างสันติวิธี มีคุณธรรม จริยธรรม และเป็นผู้นำทางจิตใจและปัญญาของสังคม",
      philosophyEn: "Cultivating graduates with profound knowledge of Buddhist principles, ethical integrity, and capability to apply Buddhist wisdom for personal and societal harmony.",
      careerOpportunitiesTh: "1. พระธรรมทูตและนักเผยแผ่พระพุทธศาสนาทั้งในและต่างประเทศ\n2. นักวิชาการและอาจารย์ผู้สอนวิชาพระพุทธศาสนาและจริยศึกษา\n3. เจ้าหน้าที่ในองค์กรศาสนา ภาครัฐ และเอกชน\n4. นักพัฒนาทรัพยากรมนุษย์และผู้ให้คำปรึกษาเชิงพุทธจิตวิทยา",
      careerOpportunitiesEn: "1. Buddhist Dhammaduta missionaries and educators globally\n2. Academic lecturers in religious studies\n3. Religious and cultural affairs officers\n4. Human resource developers and Buddhist counseling specialists",
      tuitionFees: "15,000 บาท / ภาคการศึกษา (พระภิกษุสามเณรได้รับทุนอุปถัมภ์)",
      coverImage: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
      curriculumPdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      effectiveYear: 2568,
      isActive: true,
      displayOrder: 1,
    },
    {
      code: "M.A.-BUDDHISM",
      departmentId: deptMap["BUDDHISM"],
      nameTh: "หลักสูตรพุทธศาสตรมหาบัณฑิต สาขาวิชาพระพุทธศาสนา",
      nameEn: "Master of Arts Program in Buddhist Studies",
      degreeTh: "พุทธศาสตรมหาบัณฑิต (พระพุทธศาสนา)",
      degreeEn: "Master of Arts (Buddhist Studies)",
      degreeAbbrTh: "พธ.ม. (พระพุทธศาสนา)",
      degreeAbbrEn: "M.A. (Buddhist Studies)",
      degreeLevel: "MASTER" as const,
      totalCredits: 36,
      durationYears: 2,
      philosophyTh: "มุ่งเน้นการวิจัยเชิงลึกในคัมภีร์พระไตรปิฎก อรรถกถา และการบูรณาการพุทธธรรมกับศาสตร์สมัยใหม่ เพื่อสร้างองค์ความรู้ใหม่และการพัฒนาสังคมอย่างยั่งยืน",
      philosophyEn: "Fostering advanced research in canonical Buddhist scriptures and interdisciplinary integration with modern sciences for sustainable societal development.",
      careerOpportunitiesTh: "1. นักวิจัยและนักวิชาการระดับสูงด้านพุทธศาสนาศึกษา\n2. อาจารย์ประจำสถาบันอุดมศึกษา\n3. ที่ปรึกษาองค์กรเพื่อสันติภาพและการพัฒนาสังคม\n4. บรรณาธิการและผู้เชี่ยวชาญการผลิตสื่อทางศาสนาและวัฒนธรรม",
      careerOpportunitiesEn: "1. Senior researchers in Buddhist and Asian studies\n2. University professors and lecturers\n3. Advisors in NGOs, peace-building, and ethical think tanks",
      tuitionFees: "25,000 บาท / ภาคการศึกษา",
      coverImage: "https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&w=800&q=80",
      curriculumPdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      effectiveYear: 2568,
      isActive: true,
      displayOrder: 2,
    },
    {
      code: "PH.D.-BUDDHISM",
      departmentId: deptMap["BUDDHISM"],
      nameTh: "หลักสูตรพุทธศาสตรดุษฎีบัณฑิต สาขาวิชาพระพุทธศาสนา",
      nameEn: "Doctor of Philosophy Program in Buddhist Studies",
      degreeTh: "พุทธศาสตรดุษฎีบัณฑิต (พระพุทธศาสนา)",
      degreeEn: "Doctor of Philosophy (Buddhist Studies)",
      degreeAbbrTh: "พธ.ด. (พระพุทธศาสนา)",
      degreeAbbrEn: "Ph.D. (Buddhist Studies)",
      degreeLevel: "DOCTORAL" as const,
      totalCredits: 54,
      durationYears: 3,
      philosophyTh: "สร้างผู้นำทางวิชาการและผู้เชี่ยวชาญระดับนานาชาติ ที่สามารถบุกเบิกวิจัยคัมภีร์และศาสตร์พระพุทธศาสนาในระดับสากล มีทักษะการเป็นผู้นำทางปัญญาและการชี้นำทิศทางสังคมอย่างมีสติสัมปชัญญะ",
      philosophyEn: "Developing scholarly leaders and international experts who pioneer Buddhist canonical research and provide ethical guidance to global society.",
      careerOpportunitiesTh: "1. ศาสตราจารย์และผู้เชี่ยวชาญระดับสากลด้านพระพุทธศาสนา\n2. ผู้บริหารสถาบันการศึกษาและองค์กรระหว่างประเทศ\n3. ผู้ทรงคุณวุฒิและนักวิจัยระดับชาติด้านศาสนาและสันติภาพ",
      careerOpportunitiesEn: "1. International professors and distinguished scholars\n2. Higher education executive administrators\n3. Policy advisors for global cultural and peace initiatives",
      tuitionFees: "45,000 บาท / ภาคการศึกษา",
      coverImage: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80",
      curriculumPdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      effectiveYear: 2568,
      isActive: true,
      displayOrder: 3,
    },
    {
      code: "B.A.-PHILOSOPHY",
      departmentId: deptMap["PHILOSOPHY"],
      nameTh: "หลักสูตรพุทธศาสตรบัณฑิต สาขาวิชาปรัชญา",
      nameEn: "Bachelor of Arts Program in Philosophy",
      degreeTh: "พุทธศาสตรบัณฑิต (ปรัชญา)",
      degreeEn: "Bachelor of Arts (Philosophy)",
      degreeAbbrTh: "พธ.บ. (ปรัชญา)",
      degreeAbbrEn: "B.A. (Philosophy)",
      degreeLevel: "BACHELOR" as const,
      totalCredits: 136,
      durationYears: 4,
      philosophyTh: "พัฒนากระบวนการคิดเชิงวิพากษ์ เหตุผลนิยม และการเปรียบเทียบปรัชญาตะวันออก-ตะวันตก โดยมีพุทธปรัชญาเป็นฐานราก เพื่อผลิตผู้นำทางความคิดในโลกยุคโลกาภิวัตน์",
      philosophyEn: "Cultivating critical thinking, reasoned inquiry, and comparative East-West philosophical mastery rooted in Buddhist epistemology.",
      careerOpportunitiesTh: "1. นักวิเคราะห์นโยบายและแผน\n2. นักวิชาการ นักเขียน และคอลัมนิสต์\n3. ที่ปรึกษาด้านจริยธรรมในองค์กรธุรกิจและเทคโนโลยี\n4. ผู้ประสานงานองค์กรระหว่างประเทศและภาคประชาสังคม",
      careerOpportunitiesEn: "1. Policy and planning analysts\n2. Academic writers and ethics columnists\n3. AI & Corporate ethics consultants\n4. International NGO coordinators",
      tuitionFees: "15,000 บาท / ภาคการศึกษา",
      coverImage: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80",
      curriculumPdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      effectiveYear: 2568,
      isActive: true,
      displayOrder: 4,
    },
  ];

  for (const c of curriculumSample) {
    await prisma.curriculum.upsert({
      where: { tenantId_code: { tenantId: core.tenantId, code: c.code } },
      update: c,
      create: { tenantId: core.tenantId, ...c },
    });
  }

  // Seed Rooms
  const roomSample = [
    {
      code: "RM-401",
      nameTh: "ห้องประชุม 401 สำนักงานคณบดี",
      nameEn: "Conference Room 401 (Dean's Office)",
      building: "อาคารเรียนรวม มจร",
      floor: "ชั้น 4",
      capacity: 25,
      roomType: "MEETING" as const,
      facilities: "โปรเจกเตอร์ 4K, ไมโครโฟนไร้สาย 4 ตัว, ระบบ Zoom Hybrid, จอสัมผัสอัจฉริยะ, แอร์คอนดิชันเนอร์",
      coverImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
      isActive: true,
      displayOrder: 1,
    },
    {
      code: "RM-BRAHMAPUNDIT",
      nameTh: "ห้องประชุมพระพรหมบัณฑิต",
      nameEn: "Phra Brahmapundit Conference Hall",
      building: "อาคารเรียนรวม มจร",
      floor: "ชั้น 2",
      capacity: 120,
      roomType: "AUDITORIUM" as const,
      facilities: "จอ LED ขนาดใหญ่ 300 นิ้ว, ระบบเสียงสเตอริโอรอบทิศทาง, กล้องบันทึกเทปการประชุม 4 ตัว, โพเดียมดิจิทัล",
      coverImage: "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&w=800&q=80",
      isActive: true,
      displayOrder: 2,
    },
    {
      code: "RM-VIPASSANA",
      nameTh: "ห้องปฏิบัติธรรมและเจริญจิตภาวนา",
      nameEn: "Vipassana Meditation & Mindfulness Hall",
      building: "อาคารเรียนรวม มจร",
      floor: "ชั้น 3",
      capacity: 60,
      roomType: "MEDITATION" as const,
      facilities: "เบาะนั่งสมาธิ 60 ชุด, ระบบปรับอากาศควบคุมความชื้น, ระบบเครื่องเสียงบรรยายธรรม, เครื่องฟอกอากาศ",
      coverImage: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
      isActive: true,
      displayOrder: 3,
    },
    {
      code: "RM-SEM-A",
      nameTh: "ห้องสัมมนาวิชาการ A",
      nameEn: "Academic Seminar Room A",
      building: "อาคารเรียนรวม มจร",
      floor: "ชั้น 4",
      capacity: 45,
      roomType: "SEMINAR" as const,
      facilities: "โต๊ะสัมมนารูปตัวยู (U-Shape), ไมโครโฟนตั้งโต๊ะประจำทุกที่นั่ง, Smart TV 85 นิ้ว 2 เครื่อง",
      coverImage: "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=800&q=80",
      isActive: true,
      displayOrder: 4,
    },
    {
      code: "RM-CLASS-402",
      nameTh: "ห้องเรียนอัจฉริยะ 402",
      nameEn: "Smart Classroom 402",
      building: "อาคารเรียนรวม มจร",
      floor: "ชั้น 4",
      capacity: 50,
      roomType: "CLASSROOM" as const,
      facilities: "กระดานอัจฉริยะ Interactive Whiteboard, เครื่องฉายเอกสาร 3 มิติ, ระบบถ่ายทอดสดการสอน LMS",
      coverImage: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80",
      isActive: true,
      displayOrder: 5,
    },
  ];

  const roomMap: Record<string, string> = {};
  for (const r of roomSample) {
    const row = await prisma.room.upsert({
      where: { tenantId_code: { tenantId: core.tenantId, code: r.code } },
      update: r,
      create: { tenantId: core.tenantId, ...r },
    });
    roomMap[r.code] = row.id;
  }

  // Seed Sample Bookings
  const today = new Date();
  const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const adminUser = await prisma.user.findFirst({ where: { email: "admin@app.local" } });
  const adminUserId = adminUser?.id ?? null;

  const bookingSample = [
    {
      roomId: roomMap["RM-401"],
      title: "การประชุมคณะกรรมการบริหารคณะพุทธศาสตร์ ประจำเดือน",
      description: "พิจารณาวาระการเปิดรับสมัครนิสิตใหม่ และการประกันคุณภาพการศึกษา",
      bookingDate: todayDateOnly,
      startTime: "09:00",
      endTime: "12:00",
      attendeesCount: 20,
      organizerName: "ผศ.ดร.พระมหาวีรชัย วีรชโย",
      organizerEmail: "weerachai.s@mcu.ac.th",
      organizerPhone: "081-999-8877",
      department: "สำนักงานคณบดี",
      status: "APPROVED" as const,
      approvedById: adminUserId,
      approvedAt: new Date(),
    },
    {
      roomId: roomMap["RM-BRAHMAPUNDIT"],
      title: "การสัมมนาวิชาการนานาชาติด้านพุทธศาสน์ศึกษาและเทคโนโลยี AI",
      description: "การบรรยายพิเศษโดยนักวิชาการจากมหาวิทยาลัยออกซ์ฟอร์ดและจุฬาลงกรณ์มหาวิทยาลัย",
      bookingDate: todayDateOnly,
      startTime: "13:00",
      endTime: "16:30",
      attendeesCount: 100,
      organizerName: "รศ.ดร.สมชัย ศรีนอก",
      organizerEmail: "somchai.sri@mcu.ac.th",
      organizerPhone: "089-123-4567",
      department: "ภาควิชาพระพุทธศาสนา",
      status: "APPROVED" as const,
      approvedById: adminUserId,
      approvedAt: new Date(),
    },
    {
      roomId: roomMap["RM-VIPASSANA"],
      title: "โครงการปฏิบัติวิปัสสนากรรมฐานสำหรับนิสิตระดับบัณฑิตศึกษา",
      description: "การฝึกอบรมสติปัฏฐาน 4 และการเจริญอานาปานสติภาวนา",
      bookingDate: todayDateOnly,
      startTime: "17:00",
      endTime: "19:00",
      attendeesCount: 45,
      organizerName: "ดร.บุญส่ง แสงสุวรรณ",
      organizerEmail: "boonsong.s@mcu.ac.th",
      organizerPhone: "086-555-1234",
      department: "ภาควิชาพระพุทธศาสนา",
      status: "APPROVED" as const,
      approvedById: adminUserId,
      approvedAt: new Date(),
    },
    {
      roomId: roomMap["RM-SEM-A"],
      title: "การสอบป้องกันดุษฎีนิพนธ์ หลักสูตรพุทธศาสตรดุษฎีบัณฑิต",
      description: "หัวข้อ: การศึกษาเปรียบเทียบมโนทัศน์เรื่องศูนยตาในพุทธปรัชญานาคารชุนกับควอนตัมฟิสิกส์",
      bookingDate: todayDateOnly,
      startTime: "09:30",
      endTime: "12:00",
      attendeesCount: 15,
      organizerName: "พระมหาธีระ ปญฺญาธีโร",
      organizerEmail: "teera.pan@mcu.ac.th",
      organizerPhone: "084-222-3344",
      department: "บัณฑิตศึกษา คณะพุทธศาสตร์",
      status: "PENDING" as const,
    },
  ];

  for (const b of bookingSample) {
    const existing = await prisma.roomBooking.findFirst({
      where: {
        tenantId: core.tenantId,
        roomId: b.roomId,
        bookingDate: b.bookingDate,
        startTime: b.startTime,
      },
    });
    if (!existing) {
      await prisma.roomBooking.create({
        data: { tenantId: core.tenantId, ...b },
      });
    }
  }

  // --- 8. Certificate Types & Student Requests (Student Services Feature) ---
  const certTypeData = [
    {
      code: "CERT-01",
      nameTh: "หนังสือรับรองการเป็นนิสิต (ภาษาไทย)",
      nameEn: "Certificate of Student Status (Thai)",
      descriptionTh: "ใช้สำหรับรับรองการเป็นนิสิตที่ลงทะเบียนเรียนในภาคการศึกษาปัจจุบัน เพื่อใช้ติดต่อหน่วยงานราชการหรือเอกชน",
      descriptionEn: "Certifies current student enrollment for official and general purposes",
      category: "ENROLLMENT" as const,
      processingDays: 3,
      fee: 0,
      requiresDoc: false,
      isActive: true,
      displayOrder: 1,
    },
    {
      code: "CERT-02",
      nameTh: "หนังสือรับรองการเป็นนิสิต (ภาษาอังกฤษ)",
      nameEn: "Certificate of Student Status (English)",
      descriptionTh: "Official Certificate in English for international organizations, visa applications, or exchange programs",
      descriptionEn: "Official enrollment certificate in English for visa and international purposes",
      category: "ENROLLMENT" as const,
      processingDays: 3,
      fee: 0,
      requiresDoc: false,
      isActive: true,
      displayOrder: 2,
    },
    {
      code: "CERT-03",
      nameTh: "หนังสือรับรองความประพฤติ",
      nameEn: "Certificate of Good Conduct",
      descriptionTh: "รับรองว่านิสิตมีความประพฤติเรียบร้อย ปฏิบัติตามพระธรรมวินัยและระเบียบของมหาวิทยาลัย ไม่เคยถูกลงโทษทางวินัย",
      descriptionEn: "Certifies good academic and moral conduct according to Buddhist ethics and university regulations",
      category: "CONDUCT" as const,
      processingDays: 3,
      fee: 0,
      requiresDoc: false,
      isActive: true,
      displayOrder: 3,
    },
    {
      code: "CERT-04",
      nameTh: "หนังสือขอเปิดบัญชีธนาคารสำหรับพระภิกษุสามเณร",
      nameEn: "Bank Account Opening Request for Monks and Novices",
      descriptionTh: "หนังสือรับรองสถานภาพบรรพชิตและนิสิต เพื่อใช้เปิดบัญชีเงินฝากกับธนาคารพาณิชย์ตามระเบียบของสถาบันการเงิน",
      descriptionEn: "Official recommendation letter for Buddhist monks and novices to open commercial bank accounts",
      category: "BANK_ACCOUNT" as const,
      processingDays: 2,
      fee: 0,
      requiresDoc: false,
      isActive: true,
      displayOrder: 4,
    },
    {
      code: "CERT-05",
      nameTh: "หนังสือขอผ่อนผันการตรวจเลือกเข้ารับราชการทหาร",
      nameEn: "Military Service Deferment Certificate",
      descriptionTh: "สำหรับนิสิตคฤหัสถ์ชายที่อยู่ในเกณฑ์เข้ารับการตรวจเลือกทหารกองประจำการ (สด.35) เพื่อใช้ยื่นผ่อนผันต่อสัสดีอำเภอ",
      descriptionEn: "Official documentation for military service postponement during academic studies",
      category: "MILITARY_DEFERMENT" as const,
      processingDays: 5,
      fee: 0,
      requiresDoc: true,
      isActive: true,
      displayOrder: 5,
    },
    {
      code: "CERT-06",
      nameTh: "หนังสือรับรองการปฏิบัติวิปัสสนากรรมฐานและจิตอาสา",
      nameEn: "Certificate of Vipassana Practice & Community Service",
      descriptionTh: "รับรองชั่วโมงการปฏิบัติวิปัสสนากรรมฐานและการบริการสังคมตามเกณฑ์คุณลักษณะบัณฑิตที่พึงประสงค์ของ มจร",
      descriptionEn: "Certifies completed meditation retreats and Buddhist public volunteer hours",
      category: "VOLUNTEER" as const,
      processingDays: 3,
      fee: 0,
      requiresDoc: false,
      isActive: true,
      displayOrder: 6,
    },
  ];

  const certTypeMap: Record<string, string> = {};
  for (const ct of certTypeData) {
    const existing = await prisma.certificateType.findFirst({
      where: { tenantId: core.tenantId, code: ct.code },
    });
    if (existing) {
      certTypeMap[ct.code] = existing.id;
    } else {
      const created = await prisma.certificateType.create({
        data: { tenantId: core.tenantId, ...ct },
      });
      certTypeMap[ct.code] = created.id;
    }
  }

  // Sample Student Requests
  const sampleRequests = [
    {
      certificateTypeId: certTypeMap["CERT-01"],
      requestNumber: "REQ-2026-00101",
      studentCode: "6601201001",
      titleTh: "พระมหา",
      firstNameTh: "ชัชวาลย์",
      lastNameTh: "ญาณเมธี",
      firstNameEn: "Chatchawan",
      lastNameEn: "Yanamethi",
      degreeLevel: "BACHELOR" as const,
      majorProgram: "พุทธศาสตร์ (B.A. Buddhism)",
      yearLevel: 3,
      email: "chatchawan.yan@mcu.ac.th",
      phone: "081-999-8877",
      purpose: "ใช้ประกอบการยื่นขอรับทุนการศึกษาสงเคราะห์ วัดพระเชตุพนวิมลมังคลาราม",
      copies: 2,
      status: "APPROVED" as const,
      verificationCode: "MCU-FMS-2026-A8K9Z2",
      issuedAt: new Date("2026-09-01"),
      expiresAt: new Date("2027-03-01"),
      approverNotes: "ตรวจสอบข้อมูลการลงทะเบียนเรียนครบถ้วน ออกหนังสือรับรองเรียบร้อย",
    },
    {
      certificateTypeId: certTypeMap["CERT-04"],
      requestNumber: "REQ-2026-00102",
      studentCode: "6701202015",
      titleTh: "พระ",
      firstNameTh: "เกษม",
      lastNameTh: "สุทฺธิญาโณ",
      firstNameEn: "Kasem",
      lastNameEn: "Sutthiyano",
      degreeLevel: "BACHELOR" as const,
      majorProgram: "ปรัชญา (B.A. Philosophy)",
      yearLevel: 2,
      email: "kasem.sut@mcu.ac.th",
      phone: "082-333-4455",
      purpose: "ขอเปิดบัญชีเงินฝากออมทรัพย์ ธนาคารกรุงไทย สาขาวังน้อย เพื่อรับเงินอุดหนุนการศึกษา",
      copies: 1,
      status: "PENDING" as const,
    },
    {
      certificateTypeId: certTypeMap["CERT-03"],
      requestNumber: "REQ-2026-00103",
      studentCode: "6501203008",
      titleTh: "สามเณร",
      firstNameTh: "ธนวัฒน์",
      lastNameTh: "สิริวฑฺฒโน",
      firstNameEn: "Thanawat",
      lastNameEn: "Siriwatthano",
      degreeLevel: "BACHELOR" as const,
      majorProgram: "พุทธศาสตร์ (B.A. Buddhism)",
      yearLevel: 4,
      email: "thanawat.sir@mcu.ac.th",
      phone: "083-444-5566",
      purpose: "ใช้สมัครเข้าศึกษาต่อระดับปริญญาโท คณะพุทธศาสตร์ มจร",
      copies: 1,
      status: "APPROVED" as const,
      verificationCode: "MCU-FMS-2026-B3F7X1",
      issuedAt: new Date("2026-09-05"),
      expiresAt: new Date("2027-03-05"),
      approverNotes: "ประวัติความประพฤติดีเด่น ไม่เคยละเมิดพระธรรมวินัย",
    },
  ];

  for (const sr of sampleRequests) {
    const existing = await prisma.studentRequest.findFirst({
      where: { tenantId: core.tenantId, requestNumber: sr.requestNumber },
    });
    if (!existing && sr.certificateTypeId) {
      await prisma.studentRequest.create({
        data: { tenantId: core.tenantId, ...sr },
      });
    }
  }

  // --- 9. Attendance Courses & Sessions (Attendance & Dynamic QR Feature) ---
  const courseSampleData = [
    {
      courseCode: "พธ101",
      courseNameTh: "พระไตรปิฎกศึกษา",
      courseNameEn: "Tipitaka Studies",
      section: "1",
      semester: "1/2569",
      instructorName: "พระพรหมบัณฑิต, ศ.ดร.",
      roomNumber: "ห้อง 401 อาคารเรียนรวม",
      totalSessions: 16,
      isActive: true,
    },
    {
      courseCode: "พธ201",
      courseNameTh: "วิปัสสนากรรมฐานและจริยธรรม",
      courseNameEn: "Vipassana Meditation & Buddhist Ethics",
      section: "1",
      semester: "1/2569",
      instructorName: "ดร.บุญส่ง แสงสุวรรณ",
      roomNumber: "ห้องปฏิบัติวิปัสสนากรรมฐาน",
      totalSessions: 16,
      isActive: true,
    },
    {
      courseCode: "ปร301",
      courseNameTh: "ปรัชญาเถรวาทและมหายานเปรียบเทียบ",
      courseNameEn: "Comparative Theravada and Mahayana Philosophy",
      section: "1",
      semester: "1/2569",
      instructorName: "ผศ.ดร.พระมหาวีรชัย วีรชโย",
      roomNumber: "ห้องสัมมนา A",
      totalSessions: 16,
      isActive: true,
    },
  ];

  const courseMap: Record<string, string> = {};
  for (const c of courseSampleData) {
    const existing = await prisma.attendanceCourse.findFirst({
      where: {
        tenantId: core.tenantId,
        courseCode: c.courseCode,
        section: c.section,
        semester: c.semester,
      },
    });
    if (existing) {
      courseMap[c.courseCode] = existing.id;
    } else {
      const created = await prisma.attendanceCourse.create({
        data: { tenantId: core.tenantId, ...c },
      });
      courseMap[c.courseCode] = created.id;
    }
  }

  // Create Sessions for Course พธ101
  const buddhism101Id = courseMap["พธ101"];
  if (buddhism101Id) {
    const sessions = [
      {
        courseId: buddhism101Id,
        sessionNumber: 1,
        title: "บทนำพระไตรปิฎกและโครงสร้างพระวินัยปิฎก",
        sessionType: "LECTURE" as const,
        sessionDate: new Date("2026-09-03"),
        startTime: "09:00",
        endTime: "12:00",
        status: "CLOSED" as const,
      },
      {
        courseId: buddhism101Id,
        sessionNumber: 2,
        title: "พระสุตตันตปิฎก: ทีฆนิกายและมัชฌิมนิกาย",
        sessionType: "LECTURE" as const,
        sessionDate: new Date(),
        startTime: "09:00",
        endTime: "12:00",
        status: "OPEN" as const,
        qrToken: "ATT-DEMO-2026",
        qrExpiresAt: new Date(Date.now() + 3600 * 1000), // Active for testing
      },
      {
        courseId: buddhism101Id,
        sessionNumber: 3,
        title: "พระอภิธรรมปิฎก: จิต เจตสิก รูป นิพพาน",
        sessionType: "LECTURE" as const,
        sessionDate: new Date("2026-09-17"),
        startTime: "09:00",
        endTime: "12:00",
        status: "SCHEDULED" as const,
      },
    ];

    for (const s of sessions) {
      const existing = await prisma.attendanceSession.findFirst({
        where: {
          tenantId: core.tenantId,
          courseId: s.courseId,
          sessionNumber: s.sessionNumber,
        },
      });
      if (!existing) {
        const createdSession = await prisma.attendanceSession.create({
          data: { tenantId: core.tenantId, ...s },
        });

        // Add sample records for session 1
        if (s.sessionNumber === 1) {
          await prisma.attendanceRecord.createMany({
            data: [
              {
                tenantId: core.tenantId,
                sessionId: createdSession.id,
                studentCode: "6601201001",
                studentName: "พระมหาชัชวาลย์ ญาณเมธี",
                majorProgram: "พุทธศาสตร์",
                status: "PRESENT",
              },
              {
                tenantId: core.tenantId,
                sessionId: createdSession.id,
                studentCode: "6701202015",
                studentName: "พระเกษม สุทฺธิญาโณ",
                majorProgram: "ปรัชญา",
                status: "PRESENT",
              },
              {
                tenantId: core.tenantId,
                sessionId: createdSession.id,
                studentCode: "6501203008",
                studentName: "สามเณรธนวัฒน์ สิริวฑฺฒโน",
                majorProgram: "พุทธศาสตร์",
                status: "LATE",
              },
            ],
          });
        }
      }
    }
  }

  // -------------------------------------------------------------
  // Seed Faculty Documents (Document E-Approval Feature)
  // -------------------------------------------------------------
  const sampleDocuments = [
    {
      documentNumber: "วธ-มจร-2569/0101",
      title: "โครงการสัมมนาพระไตรปิฎกศึกษาและวิชาการพุทธศาสตร์นานาชาติ ประจำปี 2569",
      docType: "PROJECT_PROPOSAL" as const,
      urgency: "URGENT" as const,
      status: "UNDER_REVIEW" as const,
      submitterName: "รศ.ดร. สุรศักดิ์ ศรีพุทธศาสตร์",
      submitterRole: "หัวหน้าภาควิชาพระพุทธศาสนา",
      submitterEmail: "surasak.s@mcu.ac.th",
      department: "ภาควิชาพระพุทธศาสนา",
      content: "ด้วยภาควิชาพระพุทธศาสนา มีความประสงค์จะจัดโครงการสัมมนาพระไตรปิฎกศึกษาและวิชาการพุทธศาสตร์นานาชาติ ณ อาคารเรียนรวม มจร อยุธยา เพื่อเผยแผ่ผลงานวิจัยของคณาจารย์และนิสิตระดับบัณฑิตศึกษา และส่งเสริมความร่วมมือทางวิชาการกับมหาวิทยาลัยสงฆ์ในเอเชีย จึงขออนุมัติโครงการและวงเงินงบประมาณสนับสนุน",
      budgetAmount: new Prisma.Decimal(150000),
      currentStep: 2,
      totalSteps: 3,
      attachmentUrl: "https://drive.google.com/sample/tipitaka-seminar-2569.pdf",
      logs: [
        {
          action: "SUBMITTED",
          actorName: "รศ.ดร. สุรศักดิ์ ศรีพุทธศาสตร์",
          actorRole: "หัวหน้าภาควิชาพระพุทธศาสนา",
          comment: "เสนอขออนุมัติโครงการและวงเงินงบประมาณประจำปีงบประมาณ 2569",
        },
        {
          action: "ADVANCE_STEP",
          actorName: "นายสมเกียรติ มั่นคง",
          actorRole: "หัวหน้างานการเงินและพัสดุ",
          comment: "ตรวจสอบงบประมาณในแผนงานหมวดอุดหนุนวิชาการแล้ว มีงบเพียงพอ เสนอคณบดีเพื่อโปรดพิจารณาลงนาม",
        },
      ],
    },
    {
      documentNumber: "วธ-มจร-2569/0102",
      title: "บันทึกข้อความขอจัดซื้อตำราวิชาการพุทธปรัชญาและวารสารวิจัยนานาชาติเข้าห้องสมุดคณะ",
      docType: "BUDGET_REQUEST" as const,
      urgency: "NORMAL" as const,
      status: "APPROVED" as const,
      submitterName: "ผศ.ดร. เมธา สัทธาธิคุณ",
      submitterRole: "ประธานหลักสูตรปรัชญาดุษฎีบัณฑิต",
      submitterEmail: "metha.s@mcu.ac.th",
      department: "ภาควิชาปรัชญา",
      content: "เพื่อส่งเสริมการค้นคว้าวิจัยของคณาจารย์และนิสิตหลักสูตรพุทธศาสตรดุษฎีบัณฑิต สาขาวิชาพระพุทธศาสนาและปรัชญา จึงขออนุมัติจัดซื้อตำราและฐานข้อมูลวารสารวิชาการพุทธปรัชญาชั้นนำ จำนวน 45 รายการ รวมเป็นเงินทั้งสิ้น 45,000 บาท",
      budgetAmount: new Prisma.Decimal(45000),
      currentStep: 3,
      totalSteps: 3,
      attachmentUrl: "https://drive.google.com/sample/library-books-2569.pdf",
      logs: [
        {
          action: "SUBMITTED",
          actorName: "ผศ.ดร. เมธา สัทธาธิคุณ",
          actorRole: "ประธานหลักสูตรปรัชญาดุษฎีบัณฑิต",
          comment: "เสนอขอจัดซื้อหนังสือตำราวิชาการสำหรับห้องสมุดคณะ",
        },
        {
          action: "ADVANCE_STEP",
          actorName: "นางสาวศิริพร สุวรรณมาลัย",
          actorRole: "เจ้าหน้าที่บริหารงานทั่วไป",
          comment: "ตรวจสอบรายการหนังสือและใบเสนอราคาเรียบร้อย ถูกต้องตามระเบียบพัสดุ",
        },
        {
          action: "APPROVE",
          actorName: "พระธรรมวัชรบัณฑิต, ศ.ดร.",
          actorRole: "คณบดีคณะพุทธศาสตร์",
          comment: "อนุมัติตามเสนอ ให้งานพัสดุดำเนินการจัดซื้อตามระเบียบ",
        },
      ],
    },
    {
      documentNumber: "วธ-มจร-2569/0103",
      title: "ขออนุมัติจัดโครงการปฏิบัติวิปัสสนากรรมฐานประจำปีสำหรับนิสิตใหม่ รุ่นที่ 69",
      docType: "PROJECT_PROPOSAL" as const,
      urgency: "EXPEDITE" as const,
      status: "SUBMITTED" as const,
      submitterName: "พระครูปลัดสุวัฒนบัณฑิตคุณ, ดร.",
      submitterRole: "รองคณบดีฝ่ายวิชาการ",
      submitterEmail: "suwat.b@mcu.ac.th",
      department: "สำนักงานคณบดีคณะพุทธศาสตร์",
      content: "ตามระเบียบมหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย กำหนดให้นิสิตใหม่ทุกสาขาวิชาต้องเข้ารับการอบรมปฏิบัติวิปัสสนากรรมฐานเป็นเวลา 10 วัน ณ ศูนย์ปฏิบัติธรรมมหาจุฬาอาศรม จึงขออนุมัติจัดโครงการพร้อมขออนุมัติงบประมาณยานพาหนะและภัตตาหาร",
      budgetAmount: new Prisma.Decimal(80000),
      currentStep: 1,
      totalSteps: 3,
      attachmentUrl: "https://drive.google.com/sample/vipassana-retreat-69.pdf",
      logs: [
        {
          action: "SUBMITTED",
          actorName: "พระครูปลัดสุวัฒนบัณฑิตคุณ, ดร.",
          actorRole: "รองคณบดีฝ่ายวิชาการ",
          comment: "เสนอโครงการปฏิบัติวิปัสสนากรรมฐานประจำปีงบประมาณ 2569",
        },
      ],
    },
  ];

  for (const docData of sampleDocuments) {
    const { logs, ...docFields } = docData;
    const existing = await prisma.facultyDocument.findFirst({
      where: { documentNumber: docFields.documentNumber },
    });
    if (!existing) {
      const createdDoc = await prisma.facultyDocument.create({
        data: {
          tenantId: core.tenantId,
          ...docFields,
        },
      });

      for (const l of logs) {
        await prisma.facultyDocumentLog.create({
          data: {
            documentId: createdDoc.id,
            action: l.action,
            actorName: l.actorName,
            actorRole: l.actorRole,
            comment: l.comment,
          },
        });
      }
    }
  }

  // -------------------------------------------------------------
  // Seed Annual Projects & Budget Planning Feature
  // -------------------------------------------------------------
  const sampleProjects = [
    {
      projectCode: "PRJ-2569-001",
      fiscalYear: 2569,
      title: "โครงการผลิตตำราและสื่อการสอนพระพุทธศาสนาสู่สากล",
      pillar: "DHAMMA_STUDY" as const,
      quarter: "Q1" as const,
      department: "ภาควิชาพระพุทธศาสนา",
      responsiblePerson: "รศ.ดร. สุรศักดิ์ ศรีพุทธศาสตร์",
      responsibleEmail: "surasak.s@mcu.ac.th",
      allocatedBudget: new Prisma.Decimal(250000),
      spentBudget: new Prisma.Decimal(175000),
      targetKpi: "ผลิตและตีพิมพ์ตำราวิชาการพระพุทธศาสนาภาษาไทยและอังกฤษ 4 รายวิชา พร้อมสื่อดิจิทัล",
      actualResult: "จัดพิมพ์ต้นฉบับตำราเสร็จ 3 รายวิชา และบันทึกคลิปวิดีโอบรรยายเสร็จสิ้น",
      progressPercent: 70,
      status: "IN_PROGRESS" as const,
      remarks: "ดำเนินงานตามแผนงานไตรมาส 1-2",
      updates: [
        {
          progressPercent: 35,
          spentAmount: new Prisma.Decimal(80000),
          reportNote: "จัดประชุมคณะทำงานยกร่างเนื้อหาตำราและวางโครงสร้างสื่อ",
          reporterName: "รศ.ดร. สุรศักดิ์ ศรีพุทธศาสตร์",
        },
        {
          progressPercent: 70,
          spentAmount: new Prisma.Decimal(95000),
          reportNote: "ส่งตรวจทานต้นฉบับโดยผู้ทรงคุณวุฒิภายนอก (Peer Reviewers) และบันทึกเสียง",
          reporterName: "รศ.ดร. สุรศักดิ์ ศรีพุทธศาสตร์",
        },
      ],
    },
    {
      projectCode: "PRJ-2569-002",
      fiscalYear: 2569,
      title: "โครงการประชุมวิชาการระดับชาติและนานาชาติพุทธศาสตร์วิจัย ครั้งที่ 12",
      pillar: "RESEARCH_INNOVATION" as const,
      quarter: "Q2" as const,
      department: "ภาควิชาปรัชญา",
      responsiblePerson: "ผศ.ดร. เมธา สัทธาธิคุณ",
      responsibleEmail: "metha.s@mcu.ac.th",
      allocatedBudget: new Prisma.Decimal(350000),
      spentBudget: new Prisma.Decimal(50000),
      targetKpi: "บทความวิจัยที่ผ่านการประเมินเพื่อนำเสนอไม่น้อยกว่า 60 บทความ และผู้เข้าร่วม 300 คน",
      actualResult: "เปิดรับบทความวิจัยแล้ว มีผู้ส่งบทความเข้าสู่ระบบ 42 บทความ",
      progressPercent: 20,
      status: "APPROVED" as const,
      remarks: "กำหนดจัดประชุม ณ อาคาร มวก. 48 พรรษา ในเดือนกุมภาพันธ์ 2569",
      updates: [
        {
          progressPercent: 20,
          spentAmount: new Prisma.Decimal(50000),
          reportNote: "ประชาสัมพันธ์ Call for Papers และจัดทำระบบส่งบทความออนไลน์",
          reporterName: "ผศ.ดร. เมธา สัทธาธิคุณ",
        },
      ],
    },
    {
      projectCode: "PRJ-2569-003",
      fiscalYear: 2569,
      title: "โครงการบริการวิชาการธรรมะสัญจรและวิปัสสนากรรมฐานเพื่อชุมชน",
      pillar: "ACADEMIC_SERVICES" as const,
      quarter: "Q3" as const,
      department: "ภาควิชาศาสนาและปรัชญา",
      responsiblePerson: "พระมหาสุริยา สุนฺทโร",
      responsibleEmail: "suriya.s@mcu.ac.th",
      allocatedBudget: new Prisma.Decimal(180000),
      spentBudget: new Prisma.Decimal(0),
      targetKpi: "จัดอบรมปฏิบัติธรรมและสนทนาธรรมใน 5 จังหวัด ประชาชนเข้าร่วมไม่น้อยกว่า 1,000 คน",
      actualResult: null,
      progressPercent: 0,
      status: "PROPOSED" as const,
      remarks: "เตรียมประสานงานเจ้าคณะจังหวัดและศูนย์ปฏิบัติธรรมในพื้นที่",
      updates: [],
    },
    {
      projectCode: "PRJ-2569-004",
      fiscalYear: 2569,
      title: "โครงการสืบสานประเพณีวิสาขบูชานานาชาติและอนุรักษ์คัมภีร์พุทธศิลป์",
      pillar: "CULTURE_PRESERVATION" as const,
      quarter: "Q3" as const,
      department: "สำนักงานคณบดีคณะพุทธศาสตร์",
      responsiblePerson: "พระครูปลัดสุวัฒนบัณฑิตคุณ, ดร.",
      responsibleEmail: "suwat.b@mcu.ac.th",
      allocatedBudget: new Prisma.Decimal(200000),
      spentBudget: new Prisma.Decimal(0),
      targetKpi: "จัดนิทรรศการพระคัมภีร์โบราณและเสวนาพุทธศิลป์นานาชาติ",
      actualResult: null,
      progressPercent: 0,
      status: "PROPOSED" as const,
      remarks: "จัดร่วมกับสมาคมมหาวิทยาลัยพระพุทธศาสนานานาชาติ (IABU)",
      updates: [],
    },
    {
      projectCode: "PRJ-2569-005",
      fiscalYear: 2569,
      title: "โครงการพัฒนาระบบเทคโนโลยีดิจิทัลและการบริหารจัดการคณะพุทธศาสตร์สู่ความเป็นเลิศ",
      pillar: "ORGANIZATION_EXCELLENCE" as const,
      quarter: "Q1" as const,
      department: "สำนักงานคณบดีคณะพุทธศาสตร์",
      responsiblePerson: "นายอรรถพล แก้วประดิษฐ์",
      responsibleEmail: "attapol.k@mcu.ac.th",
      allocatedBudget: new Prisma.Decimal(300000),
      spentBudget: new Prisma.Decimal(300000),
      targetKpi: "พัฒนาระบบ Web Platform และ Portal สารสนเทศคณะ 10 ระบบ ครบถ้วนตามเกณฑ์ EdPEx",
      actualResult: "ส่งมอบระบบ Web Platform และ Admin Console ใช้งานได้จริง 100%",
      progressPercent: 100,
      status: "COMPLETED" as const,
      remarks: "ผ่านการตรวจรับงานเรียบร้อยครบถ้วน",
      updates: [
        {
          progressPercent: 50,
          spentAmount: new Prisma.Decimal(150000),
          reportNote: "ส่งมอบระบบงวดที่ 1 (โครงสร้างระบบและฐานข้อมูล)",
          reporterName: "นายอรรถพล แก้วประดิษฐ์",
        },
        {
          progressPercent: 100,
          spentAmount: new Prisma.Decimal(150000),
          reportNote: "ส่งมอบระบบงวดที่ 2 (เสร็จสมบูรณ์ 100% พร้อมทดสอบ Quality Gates)",
          reporterName: "นายอรรถพล แก้วประดิษฐ์",
        },
      ],
    },
  ];

  for (const projData of sampleProjects) {
    const { updates, ...projFields } = projData;
    const existing = await prisma.annualProject.findFirst({
      where: { projectCode: projFields.projectCode },
    });
    if (!existing) {
      const createdProj = await prisma.annualProject.create({
        data: {
          tenantId: core.tenantId,
          ...projFields,
        },
      });

      for (const u of updates) {
        await prisma.projectProgressUpdate.create({
          data: {
            projectId: createdProj.id,
            progressPercent: u.progressPercent,
            spentAmount: u.spentAmount,
            reportNote: u.reportNote,
            reporterName: u.reporterName,
          },
        });
      }
    }
  }

  // --- 11. Portal CMS Banners Feature ---
  const bannerSample = [
    {
      titleTh: "ยินดีต้อนรับสู่ คณะพุทธศาสตร์ มหาจุฬาลงกรณราชวิทยาลัย",
      titleEn: "Welcome to Faculty of Buddhism, MCU",
      subtitleTh: "แหล่งรวมปัญญาวิชาการ พัฒนาจิตใจสู่สังคมสากล",
      subtitleEn: "Wisdom & Buddhist Studies for Global Harmony",
      tagTh: "ประกาศคณะ",
      tagEn: "Faculty Notice",
      imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1920&q=80",
      linkUrl: "/news",
      buttonTextTh: "ข่าวสารล่าสุด",
      buttonTextEn: "Latest News",
      displayOrder: 1,
      isActive: true,
    },
    {
      titleTh: "เปิดรับสมัครนิสิตใหม่ ปีการศึกษา 2568",
      titleEn: "Admissions Open 2026",
      subtitleTh: "ระดับปริญญาตรี โท และเอก พร้อมทุนการศึกษา",
      subtitleEn: "Bachelor, Master, and Ph.D. Programs",
      tagTh: "รับสมัคร",
      tagEn: "Admission",
      imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1920&q=80",
      linkUrl: "/curriculum",
      buttonTextTh: "ดูหลักสูตร",
      buttonTextEn: "View Programs",
      displayOrder: 2,
      isActive: true,
    }
  ];

  for (const b of bannerSample) {
    const existing = await prisma.portalBanner.findFirst({
      where: { tenantId: core.tenantId, titleTh: b.titleTh },
    });
    if (!existing) {
      await prisma.portalBanner.create({
        data: { tenantId: core.tenantId, ...b },
      });
    }
  }

  console.log(`[seed] เสร็จ — login: admin@app.local / ${DEV_PASSWORD}`);
}

main().finally(() => prisma.$disconnect());
