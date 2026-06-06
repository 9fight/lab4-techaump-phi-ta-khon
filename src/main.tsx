import React, { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import { motion } from "framer-motion";
import {
  AlertCircle,
  BadgeCheck,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Database,
  FileImage,
  ImagePlus,
  Info,
  Link,
  Loader2,
  Menu,
  MapPin,
  RefreshCw,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  UploadCloud,
  UsersRound,
  X,
  Zap,
} from "lucide-react";
import "./styles.css";

type Prediction = {
  class: string;
  confidence: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
};

type RoboflowResponse = {
  predictions?: Prediction[];
  image?: {
    width?: number;
    height?: number;
  };
};

type DetectionStatus = "idle" | "ready" | "loading" | "success" | "warning" | "error" | "waiting-api";

const assets = {
  hero: "/assets/hero-phi-ta-khon.png",
  bg: "/assets/site-background-texture.png",
  about: "/assets/about-section-illustration.png",
  masks: "/assets/mask-category-strip.png",
  thumbs: "/assets/sample-upload-thumbnails.png",
  logo: "/assets/logo-graphic-art.png",
};

const details = [
  { icon: CalendarDays, label: "จัดขึ้น", text: "ช่วงเดือนมิถุนายนของทุกปี" },
  { icon: MapPin, label: "สถานที่", text: "อำเภอด่านซ้าย จังหวัดเลย" },
  { icon: UsersRound, label: "ผู้เข้าร่วม", text: "ชาวบ้านและนักท่องเที่ยวจำนวนมาก" },
];

const maskTypes = [
  { title: "แบบดั้งเดิม", text: "หน้ากากแบบเก่าแก่ ทำจากกระบอกไม้ไผ่ วาดลวดลายด้วยมือ" },
  { title: "แบบร่วมสมัย", text: "หน้ากากที่ประยุกต์ลวดลายใหม่ตามจินตนาการ" },
  { title: "แบบสร้างสรรค์", text: "หน้ากากที่ออกแบบอย่างอิสระและทันสมัย" },
];

const navItems = [
  { id: "home", label: "หน้าหลัก", href: "#home" },
  { id: "about", label: "เกี่ยวกับผีตาโขน", href: "#about" },
  { id: "mask-types", label: "ประเภทหน้ากาก", href: "#mask-types" },
  { id: "model-report", label: "ข้อมูลโมเดล", href: "#model-report" },
  { id: "gallery", label: "แกลเลอรี่", href: "#gallery" },
];

const roboflowConfig = {
  apiKey: (import.meta.env.VITE_ROBOFLOW_API_KEY as string | undefined) ?? "3bRSrKIcliVxI8qipulb",
  modelId: (import.meta.env.VITE_ROBOFLOW_MODEL_ID as string | undefined) ?? "pee-ta-khon-h4wug/2",
  apiUrl: (import.meta.env.VITE_ROBOFLOW_API_URL as string | undefined) ?? "https://serverless.roboflow.com",
};

const isRoboflowReady = Boolean(roboflowConfig.apiKey && roboflowConfig.modelId);

const modelMetrics = [
  { label: "mAP@50 (Validation)", value: "98.14%", tone: "text-emerald-200" },
  { label: "Precision", value: "95.01%", tone: "text-cyan-200" },
  { label: "Recall", value: "95.15%", tone: "text-violet-200" },
  { label: "mAP@50 (Test)", value: "92.93%", tone: "text-amber-200" },
];

const trainingFacts = [
  { label: "Project Images", value: "311 รูป", text: "แบ่ง train 219 / valid 61 / test 31" },
  { label: "หลัง Augmentation", value: "2,282 รูป", text: "train 2,190 / valid 61 / test 31" },
  { label: "Model", value: "YOLOv11x", text: "Object Detection, pretrained COCOx" },
  { label: "Training", value: "85 epochs", text: "ตั้งเป้า 300 epochs, Roboflow หยุดที่ checkpoint ที่เหมาะสม" },
];

function App() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#030714] pt-[116px] text-white md:pt-[80px]">
      <div className="fixed inset-0 -z-10">
        <img className="h-full w-full object-cover opacity-55" src={assets.bg} alt="" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_18%,rgba(58,111,255,0.18),transparent_28%),radial-gradient(circle_at_85%_28%,rgba(255,144,31,0.14),transparent_24%),linear-gradient(180deg,rgba(3,7,20,0.58),#030714_82%)]" />
      </div>

      <Header />
      <Hero />
      <DetectorPanel />
      <InfoSections />
      <ModelReport />
      <Footer />
    </main>
  );
}

function Header() {
  const [activeSection, setActiveSection] = useState(navItems[0].id);
  const [menuOpen, setMenuOpen] = useState(false);

  function navigateTo(item: (typeof navItems)[number]) {
    const element = document.getElementById(item.id);
    setActiveSection(item.id);
    setMenuOpen(false);
    window.history.replaceState(null, "", item.href);

    if (!element) return;
    const scrollToSection = () => {
      const freshElement = document.getElementById(item.id);
      if (!freshElement) return;
      const headerOffset = window.innerWidth < 768 ? 96 : 88;
      const top = freshElement.getBoundingClientRect().top + window.scrollY - headerOffset;
      window.scrollTo({ top: Math.max(top, 0), behavior: "auto" });
    };

    scrollToSection();
    window.requestAnimationFrame(scrollToSection);
    window.setTimeout(scrollToSection, 80);
  }

  useEffect(() => {
    function updateActiveSection() {
      const hashId = window.location.hash.replace("#", "");
      const hashElement = navItems.some((item) => item.id === hashId) ? document.getElementById(hashId) : null;
      const hashRect = hashElement?.getBoundingClientRect();
      if (hashRect && hashRect.top < window.innerHeight * 0.78 && hashRect.bottom > 100) {
        setActiveSection(hashId);
        return;
      }

      const marker = window.scrollY + window.innerHeight * 0.55;
      const sections = navItems
        .map((item) => {
          const element = document.getElementById(item.id);
          return element ? { id: item.id, top: element.getBoundingClientRect().top + window.scrollY } : null;
        })
        .filter(Boolean) as Array<{ id: string; top: number }>;

      const current = sections
        .filter((section) => section.top <= marker)
        .sort((a, b) => b.top - a.top)[0]?.id ?? navItems[0].id;

      setActiveSection(current);
    }

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);
    window.addEventListener("hashchange", updateActiveSection);
    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
      window.removeEventListener("hashchange", updateActiveSection);
    };
  }, []);

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-[rgba(186,230,253,0.08)] bg-[rgba(3,7,20,0.62)] shadow-[0_12px_46px_rgba(3,7,20,0.28)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-5 lg:px-8">
        <a
          className="flex shrink-0 items-center gap-3"
          href="#home"
          onClick={(event) => {
            event.preventDefault();
            navigateTo(navItems[0]);
          }}
        >
          <span className="grid size-11 place-items-center rounded-xl border border-cyan-300/15 bg-white/[0.045] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_24px_rgba(34,211,238,0.08)]">
            <img className="size-10 object-contain" src={assets.logo} alt="Phi Ta Khon Detector" />
          </span>
          <span>
            <span className="block text-base font-semibold leading-5 tracking-normal sm:text-lg">Phi Ta Khon</span>
            <span className="block text-[10px] uppercase tracking-[0.18em] text-slate-400 sm:text-xs">Detector</span>
          </span>
        </a>

        <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
          {navItems.map((item) => (
            <NavLinkItem activeSection={activeSection} item={item} key={item.href} onNavigate={navigateTo} />
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-3 rounded-2xl border border-amber-200/28 bg-[#0b1022]/70 px-5 py-3 text-sm font-semibold text-amber-100 shadow-[0_0_28px_rgba(245,158,11,0.14)] backdrop-blur lg:flex">
          <span className={isRoboflowReady ? "size-2.5 rounded-full bg-emerald-300 shadow-[0_0_14px_rgba(110,231,183,0.75)]" : "size-2.5 rounded-full bg-amber-300 shadow-[0_0_14px_rgba(252,211,77,0.75)]"} />
          {isRoboflowReady ? "Roboflow พร้อมใช้งาน" : "รอ Roboflow API"}
        </div>

        <button
          aria-expanded={menuOpen}
          aria-label="เปิดเมนู"
          className="grid size-11 place-items-center rounded-xl border border-white/12 bg-white/[0.045] text-slate-100 md:hidden"
          onClick={() => setMenuOpen((open) => !open)}
          type="button"
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      <nav className={`${menuOpen ? "grid" : "hidden"} border-t border-white/8 bg-[#030714]/92 px-4 pb-4 pt-2 text-sm text-slate-300 backdrop-blur-xl md:hidden`}>
        <div className="mx-auto grid w-full max-w-7xl gap-1">
          {navItems.map((item) => (
            <NavLinkItem activeSection={activeSection} item={item} key={item.href} mobile onNavigate={navigateTo} />
          ))}
          <div className="mt-2 inline-flex w-fit items-center gap-3 rounded-xl border border-amber-200/24 bg-[#0b1022]/70 px-4 py-2 text-xs font-semibold text-amber-100">
            <span className={isRoboflowReady ? "size-2 rounded-full bg-emerald-300" : "size-2 rounded-full bg-amber-300"} />
            {isRoboflowReady ? "Roboflow พร้อมใช้งาน" : "รอ Roboflow API"}
          </div>
        </div>
      </nav>
    </header>
  );
}

function NavLinkItem({
  activeSection,
  item,
  mobile = false,
  onNavigate,
}: {
  activeSection: string;
  item: (typeof navItems)[number];
  mobile?: boolean;
  onNavigate: (item: (typeof navItems)[number]) => void;
}) {
  return (
    <a
      className={`${activeSection === item.id ? `nav-active ${mobile ? "nav-active-mobile" : ""}` : "transition hover:text-white"} ${mobile ? "rounded-xl px-3 py-3" : ""}`}
      href={item.href}
      onClick={(event) => {
        event.preventDefault();
        onNavigate(item);
      }}
    >
      {item.label}
    </a>
  );
}

function Hero() {
  return (
    <section id="home" className="relative z-0 mx-auto min-h-[520px] w-full max-w-7xl scroll-mt-28 overflow-visible px-5 pb-5 pt-9 lg:px-8">
      <img className="absolute inset-y-0 right-[-9%] top-[-86px] z-0 h-[680px] w-[74%] object-cover object-right opacity-95 max-sm:right-0 max-sm:top-[-20px] max-sm:h-[700px] max-sm:w-full max-sm:opacity-55 lg:right-[-4%]" src={assets.hero} alt="" />
      <div className="absolute right-0 top-0 z-0 h-full w-full bg-gradient-to-r from-[#030714] via-[#030714]/72 to-transparent" />
      <div className="absolute inset-0 z-0 hidden bg-[#030714]/42 max-sm:block" />

      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 max-w-2xl pt-14"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-sky-300 shadow-glow">
          <BadgeCheck className="size-4 text-violet-300" />
          AI Powered Detection
        </div>

        <h1 className="mt-7 max-w-3xl text-5xl font-bold leading-[1.12] text-white drop-shadow-[0_0_26px_rgba(148,163,184,0.22)] sm:text-6xl lg:text-7xl">
          ตรวจหา<span className="text-amber-200">ผีตา</span><span className="text-cyan-200">โขน</span>
        </h1>

        <p className="mt-6 max-w-xl text-lg leading-9 text-slate-300">
          ระบบปัญญาประดิษฐ์สำหรับตรวจจับหน้ากากผีตาโขนจากภาพถ่าย ด้วยความแม่นยำสูง
        </p>

        <div className="mt-10 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
          <Feature icon={ScanSearch} title="แม่นยำสูง" text="AI Model ขั้นสูง" color="from-violet-500 to-sky-400" />
          <Feature icon={Zap} title="รวดเร็ว" text="ตรวจจับในเสี้ยววินาที" color="from-amber-400 to-orange-500" />
          <Feature icon={ShieldCheck} title="เชื่อถือได้" text="เทคโนโลยีทันสมัย" color="from-emerald-400 to-cyan-400" />
        </div>
      </motion.div>
    </section>
  );
}

function Feature({
  icon: Icon,
  title,
  text,
  color,
}: {
  icon: React.ElementType;
  title: string;
  text: string;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#10162a]/70 p-5 shadow-cyan backdrop-blur-xl">
      <Icon className={`mb-3 size-8 rounded-xl bg-gradient-to-br ${color} p-1.5 text-white`} />
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-sm text-slate-400">{text}</p>
    </div>
  );
}

function DetectorPanel() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageSource, setImageSource] = useState("");
  const [imageKind, setImageKind] = useState<"file" | "url" | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [base64Image, setBase64Image] = useState("");
  const [fileName, setFileName] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [result, setResult] = useState<RoboflowResponse | null>(null);
  const [status, setStatus] = useState<DetectionStatus>("idle");
  const [message, setMessage] = useState("เลือกรูปภาพหรือใส่ URL เพื่อเริ่มตรวจจับ");

  const predictions = result?.predictions ?? [];
  const topPrediction = useMemo(() => {
    return [...predictions].sort((a, b) => b.confidence - a.confidence)[0];
  }, [predictions]);
  const tone = getStatusTone(status);

  async function handleFile(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setStatus("error");
      setMessage("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    const base64 = await fileToBase64(file);
    setImageSource(previewUrl);
    setBase64Image(base64);
    setFileName(file.name);
    setImageKind("file");
    setResult(null);
    setStatus("ready");
    setMessage("พร้อมตรวจจับด้วย Roboflow");
  }

  function handleUrlSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    applyImageUrl(imageUrlInput.trim());
  }

  function applyImageUrl(value: string) {
    const cleanUrl = value.trim();
    const resolvedUrl = resolveImageUrl(cleanUrl);
    if (!resolvedUrl) {
      setStatus("error");
      setMessage("กรุณาใส่ URL รูปภาพ เช่น https://example.com/image.jpg หรือ /assets/sample-upload-thumbnails.png");
      return;
    }

    setImageSource(resolvedUrl);
    setBase64Image("");
    setFileName("");
    setImageKind("url");
    setResult(null);
    setStatus("ready");
    setMessage(resolvedUrl.startsWith("https://") ? "พร้อมตรวจจับจาก URL รูปภาพ" : "พร้อมตรวจจับจาก URL ภายในเว็บ ระบบจะแปลงเป็น base64 ก่อนส่ง");
  }

  async function runDetection() {
    if (!imageSource) {
      setStatus("error");
      setMessage("ยังไม่มีรูปภาพสำหรับตรวจจับ");
      return;
    }

    if (!isRoboflowReady) {
      setStatus("waiting-api");
      setMessage("รอ Roboflow API: เพิ่มค่า VITE_ROBOFLOW_API_KEY และ VITE_ROBOFLOW_MODEL_ID ในไฟล์ .env แล้ว restart dev server");
      return;
    }

    try {
      setStatus("loading");
      setMessage(imageKind === "url" && !imageSource.startsWith("https://") ? "กำลังโหลดรูปจาก URL แล้วแปลงเป็น base64..." : "กำลังส่งภาพไปยัง Roboflow...");
      const data = await inferWithRoboflow({
        imageKind,
        imageUrl: imageSource,
        base64Image,
      });
      setResult(data);
      if (data.predictions?.length) {
        setStatus("success");
        setMessage("ตรวจจับสำเร็จ พบหน้ากากผีตาโขนจากภาพนี้");
      } else {
        setStatus("warning");
        setMessage("ตรวจจับสำเร็จ แต่ไม่พบวัตถุจากโมเดล อาจเป็นภาพหมู่ มุมเอียงด้านข้าง หรือภาพที่ต่างจากชุด train");
      }
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "ตรวจจับไม่สำเร็จ");
    }
  }

  function resetImage() {
    setImageSource("");
    setImageKind(null);
    setImageUrlInput("");
    setBase64Image("");
    setFileName("");
    setResult(null);
    setStatus("idle");
    setMessage("เลือกรูปภาพหรือใส่ URL เพื่อเริ่มตรวจจับ");
  }

  return (
    <section id="detector" className="relative z-10 mx-auto w-full max-w-7xl scroll-mt-24 px-5 pb-12 lg:px-8">
      <div className="grid gap-8 rounded-[18px] border border-[rgba(186,230,253,0.16)] bg-[#070c1b]/78 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.035),0_0_60px_rgba(59,130,246,0.12)] backdrop-blur-2xl lg:grid-cols-[0.95fr_1.05fr] lg:p-8">
        <div className="space-y-5">
          <div
            className={`rounded-[18px] border border-dashed p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] transition ${dragActive ? "border-[rgba(103,232,249,0.55)] bg-cyan-400/10" : "border-[rgba(199,210,254,0.30)] bg-[#050a18]/72"}`}
            onDragEnter={(event) => {
              event.preventDefault();
              setDragActive(true);
            }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={() => setDragActive(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragActive(false);
              void handleFile(event.dataTransfer.files[0]);
            }}
          >
            <input
              ref={fileInputRef}
              className="hidden"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => void handleFile(event.target.files?.[0])}
            />

            <div className="grid min-h-[300px] place-items-center overflow-hidden rounded-[16px] border border-[rgba(224,242,254,0.24)] bg-[#071021]/82 bg-[radial-gradient(circle_at_center,rgba(91,56,255,0.13),transparent_48%)] text-center shadow-[inset_0_0_34px_rgba(89,70,255,0.06)]">
              {imageSource ? (
                <img className="h-full max-h-[360px] w-full rounded-2xl object-contain" src={imageSource} alt="ภาพที่เลือกสำหรับตรวจจับ" />
              ) : (
                <div className="px-4 py-10">
                  <div className="mx-auto grid size-20 place-items-center rounded-2xl border border-violet-400/35 bg-violet-500/12 shadow-glow">
                    <ImagePlus className="size-10 text-violet-300" />
                  </div>
                  <h2 className="mt-7 text-2xl font-bold">อัปโหลดภาพเพื่อเริ่มการตรวจจับ</h2>
                  <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-slate-400">
                    ลากและวางไฟล์ที่นี่ หรือเลือกไฟล์จากเครื่อง รองรับ JPG, PNG, WebP
                  </p>
                </div>
              )}
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-sky-400 px-5 py-3 font-semibold shadow-[0_0_28px_rgba(56,189,248,0.25)] transition hover:brightness-110"
                onClick={() => fileInputRef.current?.click()}
                type="button"
              >
                <UploadCloud className="size-5" />
                เลือกไฟล์ภาพ
              </button>
              <button
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-[#080d1c]/80 px-5 py-3 font-semibold text-slate-300 transition hover:bg-white/10"
                onClick={resetImage}
                type="button"
              >
                <RefreshCw className="size-5" />
                ล้างรูป
              </button>
            </div>

            {fileName ? (
              <p className="mt-4 flex items-center gap-2 text-sm text-slate-400">
                <FileImage className="size-4 text-cyan-300" />
                {fileName}
              </p>
            ) : null}

            <div id="gallery" className="mt-6 scroll-mt-28 border-t border-white/10 pt-5">
              <p className="mb-4 text-center text-sm text-slate-400">หรือลองด้วยภาพตัวอย่าง</p>
              <button
                className="block w-full overflow-hidden rounded-2xl border border-white/10 transition hover:border-cyan-300/40 hover:brightness-110"
                onClick={() => applyImageUrl(assets.thumbs)}
                type="button"
              >
                <img className="h-24 w-full object-cover object-center" src={assets.thumbs} alt="ภาพตัวอย่างหน้ากากผีตาโขน" />
              </button>
            </div>
          </div>

          <form className="rounded-[18px] border border-[rgba(224,242,254,0.22)] bg-[#050a18]/74 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]" onSubmit={handleUrlSubmit}>
            <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-200" htmlFor="image-url">
              <Link className="size-4 text-cyan-300" />
              ใส่ที่อยู่รูปภาพ
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id="image-url"
                className="min-h-12 flex-1 rounded-xl border border-white/15 bg-[#060b17] px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/70"
                onChange={(event) => setImageUrlInput(event.target.value)}
                placeholder="https://example.com/image.jpg"
                type="url"
                value={imageUrlInput}
              />
              <button className="rounded-xl bg-white/14 px-5 py-3 text-sm font-semibold transition hover:bg-white/20" type="submit">
                ใช้ URL นี้
              </button>
            </div>
          </form>

        </div>

        <div className="rounded-[18px] border border-[rgba(125,151,255,0.14)] bg-[#12182a]/72 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="h-6 w-1 rounded-full bg-violet-400" />
              <h2 className="text-xl font-bold">ผลการตรวจจับ</h2>
            </div>
            <StatusPill status={status} />
          </div>

          <DetectionPreview imageSource={imageSource} predictions={predictions} result={result} status={status} />

          <div className={`mt-7 rounded-[14px] border bg-[#070c19]/92 p-6 transition ${tone.panel}`}>
            <div className="grid gap-6 md:grid-cols-[1fr_1px_1fr]">
              <div>
                <p className="text-sm font-semibold text-slate-300">ความมั่นใจสูงสุด</p>
                <p className={`mt-4 text-4xl font-bold ${topPrediction ? tone.text : "text-white"}`}>{topPrediction ? `${Math.round(topPrediction.confidence * 100)}%` : "--%"}</p>
                <div className="mt-5 h-2 rounded-full bg-slate-700">
                  <span
                    className={`block h-full rounded-full transition-all ${tone.bar}`}
                    style={{ width: topPrediction ? `${Math.round(topPrediction.confidence * 100)}%` : "0%" }}
                  />
                </div>
              </div>
              <div className="hidden bg-white/10 md:block" />
              <div className="space-y-3 text-sm">
                {topPrediction ? (
                  <>
                    <ResultLine color="bg-amber-300" label="ผลลัพธ์หลัก" value={topPrediction.class} />
                    <ResultLine color="bg-cyan-300" label="จำนวนที่พบ" value={`${predictions.length}`} />
                    <ResultLine color={tone.dot} label="สถานะ" value="พบวัตถุ" />
                  </>
                ) : status === "warning" ? (
                  <>
                    <ResultLine color="bg-amber-300" label="ผลลัพธ์หลัก" value="ไม่พบวัตถุ" />
                    <ResultLine color="bg-orange-300" label="จำนวนที่พบ" value="0" />
                    <ResultLine color={tone.dot} label="สถานะ" value="ควรตรวจซ้ำ" />
                  </>
                ) : (
                  <>
                    <ResultLine color="bg-amber-300" label="ผีตาโขน" value="--" />
                    <ResultLine color="bg-emerald-300" label="หน้ากากอื่นๆ" value="--" />
                    <ResultLine color="bg-orange-300" label="ไม่ใช่ผีตาโขน" value="--" />
                  </>
                )}
              </div>
            </div>

            <StatusMessage status={status} message={message} />

            <button
              className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 font-bold text-[#071021] shadow-[0_0_30px_rgba(45,212,191,0.18)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-55 ${tone.button}`}
              disabled={status === "loading" || !imageSource}
              onClick={() => void runDetection()}
              type="button"
            >
              {status === "loading" ? <Loader2 className="size-5 animate-spin" /> : <ScanSearch className="size-5" />}
              ตรวจจับภาพ
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function DetectionPreview({
  imageSource,
  predictions,
  result,
  status,
}: {
  imageSource: string;
  predictions: Prediction[];
  result: RoboflowResponse | null;
  status: DetectionStatus;
}) {
  const tone = getStatusTone(status);
  return (
    <div className={`relative grid min-h-[300px] place-items-center overflow-hidden rounded-[16px] border border-dashed bg-[#080e1e]/80 text-center shadow-[inset_0_0_34px_rgba(59,130,246,0.06)] ${tone.preview}`}>
      {imageSource ? (
        <div className="relative w-full">
          <img className="mx-auto max-h-[430px] w-full object-contain" src={imageSource} alt="ภาพผลการตรวจจับ" />
          {result?.image?.width && result?.image?.height
            ? predictions.map((prediction, index) => (
                <PredictionBox
                  imageHeight={result.image?.height ?? 1}
                  imageWidth={result.image?.width ?? 1}
                  key={`${prediction.class}-${index}`}
                  prediction={prediction}
                />
              ))
            : null}
        </div>
      ) : (
        <div>
          <ScanSearch className="mx-auto size-11 rounded-full bg-slate-700/35 p-2.5 text-slate-400" />
          <p className="mt-4 font-semibold">รอการอัปโหลดภาพ</p>
          <p className="mt-2 text-sm text-slate-500">ระบบจะแสดงผลการตรวจจับที่นี่</p>
        </div>
      )}
    </div>
  );
}

function PredictionBox({
  prediction,
  imageWidth,
  imageHeight,
}: {
  prediction: Prediction;
  imageWidth: number;
  imageHeight: number;
}) {
  if (!prediction.x || !prediction.y || !prediction.width || !prediction.height) return null;

  const left = ((prediction.x - prediction.width / 2) / imageWidth) * 100;
  const top = ((prediction.y - prediction.height / 2) / imageHeight) * 100;
  const width = (prediction.width / imageWidth) * 100;
  const height = (prediction.height / imageHeight) * 100;

  return (
    <div
      className="pointer-events-none absolute border-2 border-amber-300 bg-amber-300/10 shadow-[0_0_22px_rgba(252,211,77,0.42)]"
      style={{ left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%` }}
    >
      <span className="absolute left-0 top-0 -translate-y-full rounded-t-lg bg-amber-300 px-2 py-1 text-xs font-bold text-[#071021]">
        {prediction.class} {Math.round(prediction.confidence * 100)}%
      </span>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const config = {
    idle: { text: "รอรูป", color: "border-slate-500/30 bg-slate-500/10 text-slate-300" },
    ready: { text: "พร้อมตรวจ", color: "border-cyan-300/30 bg-cyan-300/10 text-cyan-200" },
    loading: { text: "กำลังตรวจ", color: "border-amber-300/30 bg-amber-300/10 text-amber-200" },
    success: { text: "สำเร็จ", color: "border-emerald-300/30 bg-emerald-300/10 text-emerald-200" },
    warning: { text: "ไม่พบ", color: "border-amber-300/30 bg-amber-300/10 text-amber-200" },
    error: { text: "ผิดพลาด", color: "border-red-300/30 bg-red-300/10 text-red-200" },
    "waiting-api": { text: "รอ API", color: "border-amber-300/30 bg-amber-300/10 text-amber-200" },
  }[status] ?? { text: "พร้อม", color: "border-slate-500/30 bg-slate-500/10 text-slate-300" };

  return <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${config.color}`}>{config.text}</span>;
}

function StatusMessage({ status, message }: { status: string; message: string }) {
  const tone = getStatusTone(status as DetectionStatus);
  const Icon = status === "success" ? CheckCircle2 : status === "warning" || status === "waiting-api" ? TriangleAlert : status === "error" ? AlertCircle : Sparkles;
  return (
    <div className={`mt-6 flex items-start gap-3 rounded-2xl border p-4 text-sm text-slate-300 ${tone.message}`}>
      <Icon className={`mt-0.5 size-5 shrink-0 ${tone.text}`} />
      <p className="leading-6">{message}</p>
    </div>
  );
}

function getStatusTone(status: DetectionStatus) {
  const tones = {
    idle: {
      bar: "bg-gradient-to-r from-violet-500 to-sky-400",
      button: "bg-gradient-to-r from-amber-400 to-cyan-400",
      dot: "bg-slate-300",
      message: "border-white/10 bg-white/[0.035]",
      panel: "border-[rgba(224,242,254,0.20)]",
      preview: "border-[rgba(186,230,253,0.24)]",
      text: "text-cyan-300",
    },
    ready: {
      bar: "bg-gradient-to-r from-cyan-400 to-sky-300",
      button: "bg-gradient-to-r from-amber-400 to-cyan-400",
      dot: "bg-cyan-300",
      message: "border-[rgba(103,232,249,0.18)] bg-cyan-300/[0.055]",
      panel: "border-[rgba(103,232,249,0.18)]",
      preview: "border-[rgba(103,232,249,0.24)]",
      text: "text-cyan-300",
    },
    loading: {
      bar: "bg-gradient-to-r from-amber-300 to-orange-400",
      button: "bg-gradient-to-r from-amber-400 to-cyan-400",
      dot: "bg-amber-300",
      message: "border-amber-300/20 bg-amber-300/[0.055]",
      panel: "border-amber-300/20",
      preview: "border-amber-300/25",
      text: "text-amber-300",
    },
    success: {
      bar: "bg-gradient-to-r from-emerald-300 to-cyan-300",
      button: "bg-gradient-to-r from-emerald-300 to-cyan-300",
      dot: "bg-emerald-300",
      message: "border-[rgba(110,231,183,0.24)] bg-emerald-300/[0.07]",
      panel: "border-[rgba(110,231,183,0.24)] shadow-[0_0_30px_rgba(52,211,153,0.09)]",
      preview: "border-[rgba(110,231,183,0.30)]",
      text: "text-emerald-300",
    },
    warning: {
      bar: "bg-gradient-to-r from-amber-300 to-orange-400",
      button: "bg-gradient-to-r from-amber-300 to-orange-400",
      dot: "bg-amber-300",
      message: "border-[rgba(252,211,77,0.26)] bg-amber-300/[0.075]",
      panel: "border-[rgba(252,211,77,0.24)] shadow-[0_0_30px_rgba(251,191,36,0.09)]",
      preview: "border-[rgba(252,211,77,0.32)]",
      text: "text-amber-300",
    },
    error: {
      bar: "bg-gradient-to-r from-red-400 to-rose-400",
      button: "bg-gradient-to-r from-red-300 to-orange-300",
      dot: "bg-red-300",
      message: "border-[rgba(252,165,165,0.26)] bg-red-300/[0.075]",
      panel: "border-[rgba(252,165,165,0.24)] shadow-[0_0_30px_rgba(248,113,113,0.09)]",
      preview: "border-[rgba(252,165,165,0.30)]",
      text: "text-red-300",
    },
    "waiting-api": {
      bar: "bg-gradient-to-r from-amber-300 to-orange-400",
      button: "bg-gradient-to-r from-amber-300 to-orange-400",
      dot: "bg-amber-300",
      message: "border-[rgba(252,211,77,0.26)] bg-amber-300/[0.075]",
      panel: "border-[rgba(252,211,77,0.22)]",
      preview: "border-[rgba(252,211,77,0.28)]",
      text: "text-amber-300",
    },
  };

  return tones[status];
}

function ResultLine({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="flex items-center gap-3 font-semibold text-slate-200">
        <span className={`size-2.5 rounded-full ${color}`} />
        {label}
      </span>
      <span className="max-w-[150px] truncate text-right text-slate-400">{value}</span>
    </div>
  );
}

function InfoSections() {
  return (
    <section className="mx-auto grid w-full max-w-7xl gap-10 px-5 pb-12 pt-2 lg:grid-cols-[0.95fr_1fr] lg:px-8">
      <div id="about" className="relative min-h-[360px] scroll-mt-24 overflow-hidden rounded-3xl py-2">
        <img className="absolute inset-0 -z-10 h-full w-full object-cover opacity-42" src={assets.about} alt="" />
        <div className="max-w-xl">
          <h2 className="text-3xl font-bold">
            เกี่ยวกับ <span className="text-amber-300">ผีตาโขน</span>
          </h2>
          <p className="mt-5 text-sm leading-8 text-slate-300">
            ผีตาโขน เป็นประเพณีอันเป็นเอกลักษณ์ของชาวอำเภอด่านซ้าย จังหวัดเลย จัดขึ้นในช่วงเทศกาลบุญหลวง ผู้คนสวมหน้ากากสีสันสดใสและชุดผ้าหลากสี เพื่อร่วมขบวนแห่และเฉลิมฉลองวัฒนธรรมท้องถิ่นที่โดดเด่น
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {details.map((item) => (
              <div className="rounded-2xl border border-white/10 bg-[#0b1022]/72 p-4 backdrop-blur" key={item.label}>
                <item.icon className="mb-3 size-6 text-violet-300" />
                <p className="font-semibold text-violet-200">{item.label}</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div id="mask-types" className="scroll-mt-24">
        <div className="mb-7">
          <h2 className="text-3xl font-bold">
            ประเภท <span className="text-cyan-300">หน้ากากผีตาโขน</span>
          </h2>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#071021]/65">
          <img className="h-[250px] w-full object-cover object-top" src={assets.masks} alt="ประเภทหน้ากากผีตาโขน" />
          <div className="grid gap-4 p-5 sm:grid-cols-3">
            {maskTypes.map((mask) => (
              <article className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 text-center" key={mask.title}>
                <h3 className="font-bold">{mask.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">{mask.text}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ModelReport() {
  return (
    <section id="model-report" className="mx-auto w-full max-w-7xl scroll-mt-28 px-5 pb-12 lg:px-8">
      <div className="rounded-[18px] border border-[rgba(186,230,253,0.16)] bg-[#070c1b]/78 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.035),0_0_60px_rgba(59,130,246,0.10)] backdrop-blur-2xl lg:p-8">
        <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-300/18 bg-cyan-300/[0.06] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">
              <BarChart3 className="size-4" />
              Roboflow Training Report
            </div>
            <h2 className="text-3xl font-bold">
              ข้อมูลโมเดล <span className="text-amber-300">Phi Ta Khon Detection</span>
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
              ข้อมูลนี้ดึงจาก Roboflow project version 2 สำหรับใช้ประกอบรายงาน คะแนนบนชุด validation/test อาจสูงเพราะจำนวนรูปยังไม่มาก
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-300/18 bg-emerald-300/[0.06] px-4 py-3 text-sm font-semibold text-emerald-200">
            Model endpoint: pee-ta-khon-h4wug/2
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {modelMetrics.map((metric) => (
            <div className="rounded-2xl border border-white/10 bg-[#0b1022]/72 p-5" key={metric.label}>
              <p className="text-sm text-slate-400">{metric.label}</p>
              <p className={`mt-3 text-3xl font-bold ${metric.tone}`}>{metric.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {trainingFacts.map((fact) => (
            <div className="rounded-2xl border border-[rgba(224,242,254,0.16)] bg-[#050a18]/78 p-5" key={fact.label}>
              <Database className="mb-4 size-6 text-violet-300" />
              <p className="text-sm text-slate-400">{fact.label}</p>
              <p className="mt-2 text-xl font-bold text-white">{fact.value}</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">{fact.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-2xl border border-cyan-300/18 bg-cyan-300/[0.055] p-5">
            <div className="flex items-start gap-3">
              <Info className="mt-1 size-5 shrink-0 text-cyan-300" />
              <div>
                <p className="font-semibold text-cyan-100">Preprocess และ Augmentation</p>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  auto-orient, resize แบบ stretch เป็น 640x640, flip แนวนอน/แนวตั้ง, crop สูงสุด 30%, brightness +/-15%, blur 2.4px และสร้าง image versions 10 ชุด
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-300/24 bg-amber-300/[0.07] p-5">
            <div className="flex items-start gap-3">
              <TriangleAlert className="mt-1 size-5 shrink-0 text-amber-300" />
              <div>
                <p className="font-semibold text-amber-100">ข้อจำกัดของโมเดล</p>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  ข้อมูล train/val/test รวมมีเพียง 311 รูป และเป็น class เดียว จึงยังไม่ควรถือว่าแม่นยำกับทุกสถานการณ์ โดยเฉพาะรูปหมู่ รูปที่หน้ากากเล็กมาก รูปเอียงด้านข้าง หรือภาพที่มุม/แสงต่างจากชุด train อาจตรวจไม่เจอ
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[rgba(186,230,253,0.08)] bg-[rgba(3,7,20,0.62)] px-5 py-7 shadow-[0_-12px_46px_rgba(3,7,20,0.28)] backdrop-blur-xl lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 text-center sm:flex-row sm:text-left">
        <div className="flex items-center gap-3">
          <img className="size-10 object-contain" src={assets.logo} alt="" />
          <div>
            <p className="text-lg font-semibold leading-5">Phi Ta Khon Detector</p>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Developer 9fight</p>
          </div>
        </div>
        <p className="max-w-md text-sm leading-6 text-slate-400">
          ระบบตรวจจับหน้ากากผีตาโขนด้วย Roboflow API รองรับการอัปโหลดไฟล์และตรวจจาก URL รูปภาพ
        </p>
      </div>
    </footer>
  );
}

async function inferWithRoboflow({
  imageKind,
  imageUrl,
  base64Image,
}: {
  imageKind: "file" | "url" | null;
  imageUrl: string;
  base64Image: string;
}) {
  const endpoint = `${roboflowConfig.apiUrl.replace(/\/$/, "")}/${roboflowConfig.modelId}?api_key=${encodeURIComponent(roboflowConfig.apiKey ?? "")}`;
  const shouldSendUrl = imageKind === "url" && imageUrl.startsWith("https://");
  const imageBody = imageKind === "url" && !shouldSendUrl ? await imageUrlToBase64(imageUrl) : base64Image;
  const response = shouldSendUrl
    ? await fetch(`${endpoint}&image=${encodeURIComponent(imageUrl)}`, { method: "POST" })
    : await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: imageBody,
      });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Roboflow ตอบกลับไม่สำเร็จ (${response.status})`);
  }

  return (await response.json()) as RoboflowResponse;
}

function resolveImageUrl(value: string) {
  if (!value) return "";

  try {
    return new URL(value, window.location.origin).href;
  } catch {
    return "";
  }
}

async function imageUrlToBase64(imageUrl: string) {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error(`โหลดรูปไม่สำเร็จ (${response.status})`);

    const blob = await response.blob();
    if (!blob.type.startsWith("image/")) throw new Error("URL นี้ไม่ได้ชี้ไปที่ไฟล์รูปภาพ");
    return await blobToBase64(blob);
  } catch (error) {
    const reason = error instanceof Error ? error.message : "ไม่ทราบสาเหตุ";
    throw new Error(`โหลดรูปจาก URL เพื่อแปลงเป็น base64 ไม่สำเร็จ: ${reason}`);
  }
}

function fileToBase64(file: File) {
  return blobToBase64(file);
}

function blobToBase64(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      resolve(result.includes(",") ? result.split(",")[1] : result);
    };
    reader.onerror = () => reject(new Error("อ่านไฟล์รูปภาพไม่สำเร็จ"));
    reader.readAsDataURL(blob);
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
