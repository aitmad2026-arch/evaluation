import { useState, useEffect, useMemo } from "react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Cell, Legend
} from "recharts";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DESIGN TOKENS & GLOBAL STYLES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'DM Sans', sans-serif; background: #f0f4f8; }
    .font-display { font-family: 'Syne', sans-serif; }
    .urdu { font-family: 'Segoe UI', 'Noto Nastaliq Urdu', serif; }
    .step-enter { animation: fadeSlide 0.35s ease forwards; }
    @keyframes fadeSlide { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    .card-hover { transition: box-shadow 0.2s, transform 0.2s; }
    .card-hover:hover { box-shadow: 0 8px 30px rgba(59,130,246,0.12); transform: translateY(-1px); }
    input[type=range] { accent-color: #4f46e5; }
    ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: #f1f5f9; }
    ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 99px; }
    .pulse-ring { animation: pulseRing 2s ease-in-out infinite; }
    @keyframes pulseRing { 0%,100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.3); } 50% { box-shadow: 0 0 0 8px rgba(99,102,241,0); } }
    .shimmer { background: linear-gradient(90deg,#f0f4f8 25%,#e2e8f0 50%,#f0f4f8 75%); background-size: 200%; animation: shimmer 1.4s infinite; }
    @keyframes shimmer { from { background-position: 200% center; } to { background-position: -200% center; } }
    .modal-backdrop { animation: backdropIn 0.2s ease; }
    @keyframes backdropIn { from { opacity: 0; } to { opacity: 1; } }
    .modal-card { animation: modalIn 0.3s cubic-bezier(0.16,1,0.3,1); }
    @keyframes modalIn { from { opacity: 0; transform: scale(0.94) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
  `}</style>
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONSTANTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const CREDS = { student: "SCHOLAR2024", supervisor: "SUPER2024", admin: "ADMIN2024" };

const PSY_Q = [
  { id:"p1", text:"جب میں کسی مشکل صورتحال کا سامنا کرتا ہوں، تو میں پرسکون رہتا ہوں۔", cat:"تناؤ کا انتظام" },
  { id:"p2", text:"امتحان میں ناکامی کے بعد بھی میں ہمت نہیں ہارتا اور دوبارہ کوشش کرتا ہوں۔", cat:"ترقی کی سوچ" },
  { id:"p3", text:"میں نئے لوگوں سے آسانی سے دوستی کر لیتا ہوں۔", cat:"سماجی پہل" },
  { id:"p4", text:"میں اپنی پریشانیوں کو دوسروں پر ظاہر نہیں ہونے دیتا۔", cat:"تناؤ کا انتظام" },
  { id:"p5", text:"میرا یقین ہے کہ محنت اور لگن سے کوئی بھی مہارت حاصل کی جا سکتی ہے۔", cat:"ترقی کی سوچ" },
  { id:"p6", text:"میں گروپ سرگرمیوں میں بڑھ چڑھ کر حصہ لیتا ہوں۔", cat:"سماجی پہل" },
  { id:"p7", text:"دباؤ کے وقت بھی میں سوچ سمجھ کر صحیح فیصلہ کر سکتا ہوں۔", cat:"تناؤ کا انتظام" },
  { id:"p8", text:"میں ہر ناکامی کو سیکھنے کا ایک نیا موقع سمجھتا ہوں۔", cat:"ترقی کی سوچ" },
];

const PER_Q = [
  { id:"e1", text:"میں اپنے کام کو پہلے سے منصوبہ بندی کر کے کرتا ہوں۔", cat:"منصوبہ بندی" },
  { id:"e2", text:"دوسروں کے جذبات کو سمجھنا اور محسوس کرنا میرے لیے آسان ہے۔", cat:"ہمدردی" },
  { id:"e3", text:"میں مشکل وقت میں اپنے گروپ کی رہنمائی کرنے کی صلاحیت رکھتا ہوں۔", cat:"قیادت" },
  { id:"e4", text:"میں اپنے روزانہ کے کاموں کی فہرست بنا کر اس پر عمل کرتا ہوں۔", cat:"منصوبہ بندی" },
  { id:"e5", text:"جب کوئی پریشان ہو تو میں اس کی بات پوری توجہ سے سنتا ہوں۔", cat:"ہمدردی" },
  { id:"e6", text:"میں ذمہ داری قبول کرنے اور آگے بڑھ کر کام کرنے سے نہیں گھبراتا۔", cat:"قیادت" },
  { id:"e7", text:"میں وقت کی پابندی کو بہت اہمیت دیتا ہوں اور اسے ہمیشہ نبھاتا ہوں۔", cat:"منصوبہ بندی" },
];

const HON_Q = [
  { id:"h1", text:"میں ہمیشہ سچ بولتا ہوں، چاہے اس کا نتیجہ کچھ بھی ہو۔", cat:"دیانتداری" },
  { id:"h2", text:"میں اپنے والدین اور اساتذہ کی خدمات کا باقاعدگی سے شکریہ ادا کرتا ہوں۔", cat:"شکرگزاری" },
  { id:"h3", text:"میں کبھی بھی کسی کا سامان یا چیز بغیر اجازت استعمال نہیں کرتا۔", cat:"دیانتداری" },
  { id:"h4", text:"میں اللہ تعالیٰ کی دی ہوئی نعمتوں پر دل سے شکرگزار ہوں۔", cat:"شکرگزاری" },
  { id:"h5", text:"جو وعدہ کروں، اسے ہر حال میں پورا کرنے کی کوشش کرتا ہوں۔", cat:"دیانتداری" },
];

const IQ_Q = [
  { id:"i1", q:"If 2x + 5 = 13, what is x?", opts:["3","4","5","6"], ans:"4", type:"Arithmetic" },
  { id:"i2", q:"Complete the series: 2, 4, 8, 16, ___", opts:["24","32","20","28"], ans:"32", type:"Pattern" },
  { id:"i3", q:"Which shape has the most sides?", opts:["Triangle","Square","Pentagon","Hexagon"], ans:"Hexagon", type:"Logic" },
  { id:"i4", q:"A train travels at 60 km/hr. How far does it travel in 2.5 hours?", opts:["120 km","150 km","180 km","100 km"], ans:"150 km", type:"Arithmetic" },
  { id:"i5", q:"Find the odd one out: Apple, Mango, Carrot, Banana", opts:["Apple","Mango","Carrot","Banana"], ans:"Carrot", type:"Logic" },
  { id:"i6", q:"All Bloops are Razzles. All Razzles are Lazzles. Are all Bloops Lazzles?", opts:["Yes","No","Maybe","Cannot determine"], ans:"Yes", type:"Logic" },
  { id:"i7", q:"What comes next in: A, C, E, G, ___?", opts:["H","I","J","K"], ans:"I", type:"Pattern" },
  { id:"i8", q:"25% of 200 = ?", opts:["40","50","60","75"], ans:"50", type:"Arithmetic" },
  { id:"i9", q:"If MANGO reversed is OGNAM, how is APPLE written reversed?", opts:["ELPPA","ALPPA","EPPLA","APPEL"], ans:"ELPPA", type:"Pattern" },
  { id:"i10", q:"Which number is both even AND a perfect square, and is less than 50?", opts:["16","18","20","22"], ans:"16", type:"Arithmetic" },
];

const THINK_POOL = [
  { id:"t1", text:"Describe your family background and how it has shaped your values and character." },
  { id:"t2", text:"What is your current financial situation, and how does it motivate your pursuit of higher education?" },
  { id:"t3", text:"What does true friendship mean to you? Describe the core ethics you follow in your friendships." },
  { id:"t4", text:"Where do you see yourself in 10 years? Describe your future ambitions and life goals." },
  { id:"t5", text:"Describe a personal challenge you have faced and how overcoming it made you stronger." },
  { id:"t6", text:"How do you handle conflict with friends or classmates? Describe your approach to resolution." },
];

const LIKERT = [
  { val:1, urdu:"بالکل نہیں", en:"Never",   bg:"#ef4444", light:"#fef2f2", border:"#fca5a5" },
  { val:2, urdu:"کم",         en:"Rarely",   bg:"#f97316", light:"#fff7ed", border:"#fdba74" },
  { val:3, urdu:"کبھی کبھی", en:"Sometimes", bg:"#eab308", light:"#fefce8", border:"#fde047" },
  { val:4, urdu:"اکثر",       en:"Often",    bg:"#3b82f6", light:"#eff6ff", border:"#93c5fd" },
  { val:5, urdu:"ہمیشہ",      en:"Always",   bg:"#22c55e", light:"#f0fdf4", border:"#86efac" },
];

const TRAITS = [
  { id:"gratitude",     label:"Gratitude",          icon:"🙏", color:"#6366f1" },
  { id:"punctuality",   label:"Punctuality",         icon:"⏰", color:"#0ea5e9" },
  { id:"prayers",       label:"Prayers",             icon:"📿", color:"#8b5cf6" },
  { id:"participation", label:"Class Participation", icon:"🙋", color:"#10b981" },
  { id:"discipline",    label:"Discipline",          icon:"📐", color:"#f59e0b" },
];

const STEPS = ["Info","Psychology","Personality","Honesty","IQ Test","Thinking","Review"];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LOCAL STORAGE HELPERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const DB = {
  getStudents: ()  => JSON.parse(localStorage.getItem("sc_students") || "[]"),
  setStudents: (d) => localStorage.setItem("sc_students", JSON.stringify(d)),
  getSup:      ()  => JSON.parse(localStorage.getItem("sc_sup") || "{}"),
  setSup:      (d) => localStorage.setItem("sc_sup", JSON.stringify(d)),
  getDraft:    ()  => JSON.parse(localStorage.getItem("sc_draft") || "null"),
  setDraft:    (d) => localStorage.setItem("sc_draft", JSON.stringify(d)),
  clearDraft:  ()  => localStorage.removeItem("sc_draft"),
};

// Demo seed data (for admin preview)
const SEED_STUDENTS = [
  { id:"demo1", info:{ name:"Ahmed Raza Khan", father:"Muhammad Raza", school:"BISE Federal Islamabad", city:"Islamabad", phone:"0312-1234567" }, psychology:{ p1:4,p2:5,p3:3,p4:4,p5:5,p6:3,p7:4,p8:5 }, personality:{ e1:4,e2:5,e3:3,e4:4,e5:5,e6:4,e7:3 }, honesty:{ h1:5,h2:4,h3:5,h4:5,h5:4 }, iq:{ i1:"4",i2:"32",i3:"Hexagon",i4:"150 km",i5:"Carrot",i6:"Yes",i7:"I",i8:"50",i9:"ELPPA",i10:"16" }, thinking:[{ prompt:"Family Background", answer:"My family has always stressed hard work and honesty. My father is a teacher and instilled in me the value of education as the key to success and dignity." },{ prompt:"Friendship Ethics", answer:"True friendship means loyalty and respect. I believe in being honest with friends even when it is difficult, and standing by them in challenging times without expectation." }], submittedAt:"2024-12-01T08:00:00Z" },
  { id:"demo2", info:{ name:"Fatima Noor", father:"Abdul Noor", school:"KIPS Rawalpindi", city:"Rawalpindi", phone:"0333-9876543" }, psychology:{ p1:5,p2:4,p3:5,p4:3,p5:4,p6:5,p7:4,p8:4 }, personality:{ e1:5,e2:4,e3:5,e4:5,e5:4,e6:5,e7:4 }, honesty:{ h1:4,h2:5,h3:4,h4:5,h5:5 }, iq:{ i1:"4",i2:"32",i3:"Hexagon",i4:"150 km",i5:"Carrot",i6:"Yes",i7:"I",i8:"50",i9:"ALPPA",i10:"16" }, thinking:[{ prompt:"Future Ambitions", answer:"I aspire to become a doctor to serve my community. My goal is to complete MBBS and specialize in paediatrics, giving back to the underprivileged who cannot afford healthcare." },{ prompt:"Financial Situation", answer:"Our family is middle class and my father works hard to support us. This motivates me deeply to study well and earn a scholarship to reduce the financial burden on my family." }], submittedAt:"2024-12-01T09:30:00Z" },
  { id:"demo3", info:{ name:"Usman Tariq", father:"Tariq Mahmood", school:"Beaconhouse Lahore", city:"Lahore", phone:"0321-5550011" }, psychology:{ p1:3,p2:3,p3:4,p4:2,p5:4,p6:4,p7:3,p8:3 }, personality:{ e1:3,e2:3,e3:4,e4:2,e5:4,e6:3,e7:2 }, honesty:{ h1:3,h2:3,h3:4,h4:4,h5:3 }, iq:{ i1:"4",i2:"32",i3:"Pentagon",i4:"150 km",i5:"Carrot",i6:"Maybe",i7:"I",i8:"50",i9:"ELPPA",i10:"18" }, thinking:[{ prompt:"Personal Challenge", answer:"I struggled with shyness throughout school but pushed myself to join the debate team. This experience transformed me into a more confident and articulate person over two years." }], submittedAt:"2024-12-01T10:15:00Z" },
];
const SEED_SUP = {
  demo1:{ submitted:true, submittedAt:"2024-12-02T10:00:00Z", activityComments:"Ahmed showed excellent leadership during the group activity. He was the first to organize his team and kept everyone motivated. Very impressive communication skills.", activityMarks:"88", traits:{ gratitude:9, punctuality:8, prayers:9, participation:9, discipline:8 } },
  demo2:{ submitted:true, submittedAt:"2024-12-02T10:45:00Z", activityComments:"Fatima was highly cooperative and demonstrated exceptional empathy. She went out of her way to help struggling peers. A natural leader with strong moral character.", activityMarks:"92", traits:{ gratitude:10, punctuality:9, prayers:10, participation:8, discipline:9 } },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SCORING ENGINE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const sumVals = (obj) => Object.values(obj || {}).reduce((a, b) => a + b, 0);

function calcScores(student, supAll) {
  const psyScore = student.psychology ? Math.round((sumVals(student.psychology) / (PSY_Q.length * 5)) * 100) : 0;
  const perScore = student.personality ? Math.round((sumVals(student.personality) / (PER_Q.length * 5)) * 100) : 0;
  const honScore = student.honesty    ? Math.round((sumVals(student.honesty)    / (HON_Q.length * 5)) * 100) : 0;
  const iqCorrect = IQ_Q.filter(q => student.iq?.[q.id] === q.ans).length;
  const iqScore   = Math.round((iqCorrect / IQ_Q.length) * 100);
  const sup       = supAll?.[student.id];
  const supScore  = sup?.submitted && sup?.traits ? Math.round((sumVals(sup.traits) / (TRAITS.length * 10)) * 100) : null;
  const w = supScore !== null
    ? { psy:0.20, per:0.20, hon:0.15, iq:0.25, sup:0.20 }
    : { psy:0.25, per:0.25, hon:0.20, iq:0.30, sup:0 };
  const suitability = Math.round(psyScore*w.psy + perScore*w.per + honScore*w.hon + iqScore*w.iq + (supScore||0)*w.sup);
  return { psyScore, perScore, honScore, iqScore, supScore, suitability };
}

function getRec(score) {
  if (score >= 80) return { label:"Highly Recommended", badge:"⭐ Excellent", cls:"bg-emerald-500", light:"bg-emerald-50", border:"border-emerald-200", text:"text-emerald-700" };
  if (score >= 65) return { label:"Recommended",        badge:"✅ Good",      cls:"bg-blue-500",    light:"bg-blue-50",    border:"border-blue-200",    text:"text-blue-700" };
  if (score >= 50) return { label:"Conditional",         badge:"⚠️ Average",  cls:"bg-amber-500",   light:"bg-amber-50",   border:"border-amber-200",   text:"text-amber-700" };
  return                  { label:"Not Recommended",    badge:"❌ Low",       cls:"bg-red-500",     light:"bg-red-50",     border:"border-red-200",     text:"text-red-700" };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SHARED UI ATOMS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const ScorePill = ({ score, sm }) => {
  if (score === null || score === undefined) return <span style={{ color:"#cbd5e1", fontSize:"12px" }}>Pending</span>;
  const color = score>=75?"#16a34a":score>=60?"#2563eb":score>=45?"#d97706":"#dc2626";
  const bg    = score>=75?"#f0fdf4":score>=60?"#eff6ff":score>=45?"#fffbeb":"#fef2f2";
  return (
    <span style={{ background:bg, color, border:`1px solid ${color}33`, borderRadius:"99px", padding: sm?"2px 8px":"3px 10px", fontSize: sm?"11px":"12px", fontWeight:700 }}>
      {score}%
    </span>
  );
};

function TopBar({ title, subtitle, role, onLogout }) {
  const g = { student:"linear-gradient(135deg,#1d4ed8,#4f46e5)", supervisor:"linear-gradient(135deg,#0d9488,#059669)", admin:"linear-gradient(135deg,#7c3aed,#9333ea)" };
  const icon = { student:"📚", supervisor:"🎯", admin:"🛡️" };
  return (
    <header style={{ background:g[role], boxShadow:"0 4px 24px rgba(0,0,0,0.15)", position:"sticky", top:0, zIndex:40 }}>
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"12px 20px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:40, height:40, background:"rgba(255,255,255,0.15)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>{icon[role]}</div>
          <div>
            <div className="font-display" style={{ color:"#fff", fontSize:17, fontWeight:800, lineHeight:1.2 }}>{title}</div>
            <div style={{ color:"rgba(255,255,255,0.65)", fontSize:11 }}>{subtitle}</div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ color:"rgba(255,255,255,0.5)", fontSize:11, display:"none" }}>Shibli Scholarship</span>
          <button onClick={onLogout} style={{ color:"rgba(255,255,255,0.85)", background:"rgba(255,255,255,0.12)", border:"1px solid rgba(255,255,255,0.2)", borderRadius:8, padding:"6px 16px", fontSize:13, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
            Logout ↗
          </button>
        </div>
      </div>
    </header>
  );
}

function StepWizard({ step }) {
  return (
    <div style={{ marginBottom:28 }}>
      <div style={{ display:"flex", alignItems:"center", gap:0, marginBottom:8 }}>
        {STEPS.map((s, i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", flex:1 }}>
            <div style={{
              width:28, height:28, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:11, fontWeight:700, flexShrink:0,
              background: i<step?"#4f46e5": i===step?"#4f46e5":"#e2e8f0",
              color: i<=step?"#fff":"#94a3b8",
              boxShadow: i===step?"0 0 0 4px rgba(99,102,241,0.2)":"none",
              transition:"all 0.3s"
            }}>{i<step?"✓":i+1}</div>
            {i<STEPS.length-1 && (
              <div style={{ flex:1, height:3, background:i<step?"#4f46e5":"#e2e8f0", borderRadius:99, margin:"0 3px", transition:"background 0.4s" }} />
            )}
          </div>
        ))}
      </div>
      <div style={{ display:"flex", justifyContent:"space-between" }}>
        {STEPS.map((s, i) => (
          <span key={i} style={{ fontSize:9, color:i===step?"#4f46e5":"#94a3b8", fontWeight:i===step?700:400, flex:1, textAlign:"center" }}>{s}</span>
        ))}
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LOGIN PAGE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function LoginPage({ onLogin }) {
  const [role, setRole] = useState("student");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const roles = [
    { key:"student",    label:"Student Portal",     icon:"🎓", desc:"Take your assessment" },
    { key:"supervisor", label:"Supervisor Panel",   icon:"🎯", desc:"Observe & mark students" },
    { key:"admin",      label:"Admin Dashboard",    icon:"🛡️", desc:"Analytics & decisions" },
  ];
  const handleLogin = () => {
    if (pass.trim() === CREDS[role]) { onLogin(role); }
    else { setErr("Invalid access code. Please try again."); }
  };
  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(145deg,#0f172a 0%,#1e1b4b 40%,#0c4a6e 100%)", display:"flex", alignItems:"center", justifyContent:"center", padding:20, position:"relative", overflow:"hidden" }}>
      {/* Decorative blobs */}
      <div style={{ position:"absolute", top:-120, left:-120, width:400, height:400, borderRadius:"50%", background:"rgba(99,102,241,0.08)", filter:"blur(60px)" }} />
      <div style={{ position:"absolute", bottom:-100, right:-100, width:350, height:350, borderRadius:"50%", background:"rgba(14,165,233,0.08)", filter:"blur(60px)" }} />
      <div style={{ position:"absolute", top:"40%", left:"60%", width:200, height:200, borderRadius:"50%", background:"rgba(139,92,246,0.06)", filter:"blur(40px)" }} />

      <div style={{ position:"relative", width:"100%", maxWidth:420 }}>
        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div className="pulse-ring" style={{ display:"inline-flex", width:72, height:72, background:"linear-gradient(135deg,#4f46e5,#0ea5e9)", borderRadius:20, alignItems:"center", justifyContent:"center", fontSize:32, marginBottom:16, boxShadow:"0 8px 32px rgba(79,70,229,0.4)" }}>
            🎓
          </div>
          <h1 className="font-display" style={{ color:"#fff", fontSize:26, fontWeight:800, lineHeight:1.2 }}>Shibli Scholarship</h1>
          <p style={{ color:"rgba(255,255,255,0.5)", fontSize:13, marginTop:4 }}>Evaluation System · 2024–25</p>
        </div>

        {/* Card */}
        <div style={{ background:"rgba(255,255,255,0.06)", backdropFilter:"blur(20px)", borderRadius:24, padding:"28px 28px 24px", border:"1px solid rgba(255,255,255,0.1)", boxShadow:"0 24px 80px rgba(0,0,0,0.4)" }}>
          <p style={{ color:"rgba(255,255,255,0.6)", fontSize:12, marginBottom:14, textTransform:"uppercase", letterSpacing:"0.08em", fontWeight:600 }}>Select Your Role</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:20 }}>
            {roles.map(r => (
              <button key={r.key} onClick={() => { setRole(r.key); setPass(""); setErr(""); }} style={{
                padding:"12px 8px", borderRadius:14, border: role===r.key?"2px solid #818cf8":"2px solid rgba(255,255,255,0.08)",
                background: role===r.key?"rgba(99,102,241,0.2)":"rgba(255,255,255,0.04)",
                cursor:"pointer", textAlign:"center", transition:"all 0.2s", fontFamily:"'DM Sans',sans-serif"
              }}>
                <div style={{ fontSize:22, marginBottom:4 }}>{r.icon}</div>
                <div style={{ color:role===r.key?"#a5b4fc":"rgba(255,255,255,0.7)", fontSize:10, fontWeight:600 }}>{r.label.split(" ")[0]}</div>
              </button>
            ))}
          </div>

          <div style={{ background:"rgba(255,255,255,0.05)", borderRadius:12, padding:"10px 14px", marginBottom:16, border:"1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ color:"rgba(255,255,255,0.4)", fontSize:10, marginBottom:2 }}>Selected Role</div>
            <div style={{ color:"#a5b4fc", fontSize:13, fontWeight:600 }}>{roles.find(r=>r.key===role)?.label} — {roles.find(r=>r.key===role)?.desc}</div>
          </div>

          <label style={{ color:"rgba(255,255,255,0.5)", fontSize:12, display:"block", marginBottom:6 }}>Access Code</label>
          <input
            type="password" value={pass} placeholder="Enter your access code…"
            onChange={e => { setPass(e.target.value); setErr(""); }}
            onKeyDown={e => e.key==="Enter" && handleLogin()}
            style={{ width:"100%", background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:12, padding:"12px 16px", color:"#fff", fontSize:14, fontFamily:"'DM Sans',sans-serif", outline:"none", marginBottom:err?8:16, boxSizing:"border-box" }}
          />
          {err && <div style={{ color:"#f87171", fontSize:12, background:"rgba(239,68,68,0.1)", borderRadius:8, padding:"8px 12px", marginBottom:12 }}>{err}</div>}

          <button onClick={handleLogin} style={{ width:"100%", background:"linear-gradient(135deg,#4f46e5,#0ea5e9)", border:"none", borderRadius:12, padding:"13px 20px", color:"#fff", fontSize:15, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", boxShadow:"0 4px 20px rgba(79,70,229,0.4)", letterSpacing:"0.02em" }}>
            Enter Portal →
          </button>
          <p style={{ textAlign:"center", color:"rgba(255,255,255,0.25)", fontSize:11, marginTop:14 }}>
            Demo codes: SCHOLAR2024 · SUPER2024 · ADMIN2024
          </p>
        </div>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STUDENT PORTAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function LikertQ({ q, value, onChange, index }) {
  return (
    <div className="card-hover" style={{ background:"#fff", borderRadius:18, padding:"18px 20px", border:"1.5px solid #e2e8f0", marginBottom:12 }}>
      <div style={{ display:"flex", alignItems:"flex-start", gap:12, marginBottom:16 }}>
        <span style={{ width:28, height:28, borderRadius:"50%", background:"linear-gradient(135deg,#eff6ff,#dbeafe)", color:"#3b82f6", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, flexShrink:0, border:"1px solid #bfdbfe" }}>{index+1}</span>
        <p className="urdu" style={{ color:"#334155", fontSize:16, lineHeight:1.7, textAlign:"right", flex:1 }} dir="rtl">{q.text}</p>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:6 }}>
        {LIKERT.map(opt => (
          <button key={opt.val} onClick={() => onChange(q.id, opt.val)} style={{
            padding:"10px 4px", borderRadius:12, border: value===opt.val?`2px solid ${opt.bg}`:`2px solid #e2e8f0`,
            background: value===opt.val?opt.bg:opt.light, cursor:"pointer", textAlign:"center", transition:"all 0.18s",
            transform: value===opt.val?"scale(1.06)":"scale(1)", fontFamily:"'DM Sans',sans-serif"
          }}>
            <div style={{ color:value===opt.val?"#fff":opt.bg, fontSize:16, fontWeight:800 }}>{opt.val}</div>
            <div className="urdu" style={{ color:value===opt.val?"rgba(255,255,255,0.85)":"#64748b", fontSize:"9.5px", marginTop:2, lineHeight:1.3 }} dir="rtl">{opt.urdu}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function IQQ({ q, value, onChange, index }) {
  const typeColor = { Arithmetic:"#4f46e5", Pattern:"#0ea5e9", Logic:"#10b981" };
  return (
    <div className="card-hover" style={{ background:"#fff", borderRadius:18, padding:"18px 20px", border:"1.5px solid #e2e8f0", marginBottom:12 }}>
      <div style={{ display:"flex", alignItems:"flex-start", gap:12, marginBottom:14 }}>
        <span style={{ width:28, height:28, borderRadius:"50%", background:"linear-gradient(135deg,#f5f3ff,#ede9fe)", color:"#7c3aed", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, flexShrink:0, border:"1px solid #ddd6fe" }}>{index+1}</span>
        <div style={{ flex:1 }}>
          <span style={{ background: (typeColor[q.type]||"#6366f1")+"18", color:typeColor[q.type]||"#6366f1", fontSize:10, fontWeight:700, borderRadius:99, padding:"2px 10px", display:"inline-block", marginBottom:6 }}>{q.type}</span>
          <p style={{ color:"#1e293b", fontSize:14.5, fontWeight:500, lineHeight:1.5 }}>{q.q}</p>
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
        {q.opts.map(opt => (
          <button key={opt} onClick={() => onChange(q.id, opt)} style={{
            padding:"11px 14px", borderRadius:12, border: value===opt?"2px solid #4f46e5":"2px solid #e2e8f0",
            background: value===opt?"#eff6ff":"#f8fafc", cursor:"pointer", textAlign:"left",
            color: value===opt?"#3730a3":"#475569", fontSize:13.5, fontWeight:value===opt?600:400, transition:"all 0.18s",
            fontFamily:"'DM Sans',sans-serif"
          }}>{opt}</button>
        ))}
      </div>
    </div>
  );
}

function StudentPortal({ onLogout }) {
  const getInit = () => {
    const d = DB.getDraft();
    return {
      step:      d?.step || 0,
      info:      d?.info || { name:"", father:"", school:"", city:"", phone:"" },
      psy:       d?.psy  || {},
      per:       d?.per  || {},
      hon:       d?.hon  || {},
      iq:        d?.iq   || {},
      think:     d?.think|| {},
      studentId: d?.studentId || String(Date.now()),
      prompts:   d?.prompts || [...THINK_POOL].sort(()=>Math.random()-0.5).slice(0,4),
    };
  };

  const [init]       = useState(getInit);
  const [step,  setStep]  = useState(init.step);
  const [info,  setInfo]  = useState(init.info);
  const [psy,   setPsy]   = useState(init.psy);
  const [per,   setPer]   = useState(init.per);
  const [hon,   setHon]   = useState(init.hon);
  const [iq,    setIq]    = useState(init.iq);
  const [think, setThink] = useState(init.think);
  const [prompts]         = useState(init.prompts);
  const [studentId]       = useState(init.studentId);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!submitted) DB.setDraft({ step, info, psy, per, hon, iq, think, studentId, prompts });
  }, [step, info, psy, per, hon, iq, think, submitted]);

  const wordCount = (id) => (think[id]||"").trim().split(/\s+/).filter(Boolean).length;

  const canNext = () => {
    if (step===0) return info.name.trim() && info.father.trim() && info.school.trim();
    if (step===1) return PSY_Q.every(q=>psy[q.id]);
    if (step===2) return PER_Q.every(q=>per[q.id]);
    if (step===3) return HON_Q.every(q=>hon[q.id]);
    if (step===4) return IQ_Q.every(q=>iq[q.id]);
    if (step===5) return prompts.every(p=>wordCount(p.id)>=30);
    return true;
  };

  const doSubmit = () => {
    const students = DB.getStudents().filter(s=>s.id!==studentId);
    students.push({ id:studentId, submittedAt:new Date().toISOString(), info, psychology:psy, personality:per, honesty:hon, iq, thinking:prompts.map(p=>({ prompt:p.text, answer:think[p.id]||"" })) });
    DB.setStudents(students);
    DB.clearDraft();
    setSubmitted(true);
  };

  const sectionHeader = (label, sub, gradient, emoji) => (
    <div style={{ background:gradient, borderRadius:18, padding:"20px 24px", marginBottom:18, boxShadow:"0 4px 20px rgba(0,0,0,0.1)" }}>
      <div className="font-display" style={{ color:"#fff", fontSize:22, fontWeight:800 }}>{emoji} {label}</div>
      <div style={{ color:"rgba(255,255,255,0.7)", fontSize:12, marginTop:4 }}>{sub}</div>
    </div>
  );

  if (submitted) return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(145deg,#f0f9ff,#e0f2fe,#f0fdf4)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background:"#fff", borderRadius:28, padding:"48px 36px", maxWidth:440, textAlign:"center", boxShadow:"0 20px 60px rgba(0,0,0,0.1)" }}>
        <div style={{ fontSize:64, marginBottom:16, animation:"fadeSlide 0.5s ease" }}>🎉</div>
        <h2 className="font-display" style={{ fontSize:26, fontWeight:800, color:"#0f172a", marginBottom:8 }}>Assessment Submitted!</h2>
        <p style={{ color:"#64748b", fontSize:14, lineHeight:1.7, marginBottom:24 }}>Your responses have been saved successfully. The supervisor and admin team will review your profile shortly.</p>
        <div style={{ background:"#f0fdf4", borderRadius:14, padding:"14px 18px", border:"1px solid #bbf7d0" }}>
          <div style={{ fontSize:11, color:"#16a34a", marginBottom:4, fontWeight:600 }}>YOUR STUDENT ID</div>
          <div style={{ fontSize:13, color:"#14532d", fontWeight:700, fontFamily:"monospace" }}>{studentId}</div>
        </div>
        <p style={{ color:"#94a3b8", fontSize:12, marginTop:16 }}>Keep this ID for reference. Results will be announced by the admin.</p>
      </div>
    </div>
  );

  const reviewItems = [
    { label:"Psychology",  done:PSY_Q.every(q=>psy[q.id]),                                          count:`${Object.keys(psy).length}/${PSY_Q.length}`,  icon:"🧠" },
    { label:"Personality", done:PER_Q.every(q=>per[q.id]),                                          count:`${Object.keys(per).length}/${PER_Q.length}`,  icon:"👤" },
    { label:"Honesty",     done:HON_Q.every(q=>hon[q.id]),                                          count:`${Object.keys(hon).length}/${HON_Q.length}`,  icon:"🤲" },
    { label:"IQ Test",     done:IQ_Q.every(q=>iq[q.id]),                                            count:`${Object.keys(iq).length}/${IQ_Q.length}`,   icon:"🧩" },
    { label:"Thinking",    done:prompts.every(p=>wordCount(p.id)>=30), count:`${prompts.filter(p=>wordCount(p.id)>=30).length}/${prompts.length}`, icon:"✍️" },
  ];

  return (
    <div style={{ minHeight:"100vh", background:"#f0f4f8" }}>
      <TopBar title="Student Assessment Portal" subtitle={`Shibli FSc Scholarship Evaluation 2024`} role="student" onLogout={onLogout} />
      <div style={{ maxWidth:700, margin:"0 auto", padding:"24px 16px" }}>
        <StepWizard step={step} />
        <div className="step-enter">
          {step===0 && (
            <div style={{ background:"#fff", borderRadius:22, padding:"28px 24px", boxShadow:"0 2px 16px rgba(0,0,0,0.06)", border:"1px solid #e2e8f0" }}>
              <h2 className="font-display" style={{ fontSize:22, fontWeight:800, color:"#0f172a", marginBottom:4 }}>Personal Information</h2>
              <p style={{ color:"#64748b", fontSize:13, marginBottom:24 }}>Please fill in your details accurately — this information will be shown to the admin.</p>
              {[
                { k:"name",   label:"Full Name ✱",              ph:"Your full name (e.g. Ahmed Raza Khan)" },
                { k:"father", label:"Father's Name ✱",          ph:"Father's full name" },
                { k:"school", label:"Previous School / Board ✱",ph:"e.g. BISE Federal Board, Islamabad" },
                { k:"city",   label:"City",                      ph:"Your city" },
                { k:"phone",  label:"Contact Number",           ph:"03XX-XXXXXXX" },
              ].map(f => (
                <div key={f.k} style={{ marginBottom:16 }}>
                  <label style={{ fontSize:12, fontWeight:600, color:"#475569", display:"block", marginBottom:6 }}>{f.label}</label>
                  <input value={info[f.k]} onChange={e=>setInfo(p=>({...p,[f.k]:e.target.value}))} placeholder={f.ph}
                    style={{ width:"100%", border:"2px solid #e2e8f0", borderRadius:12, padding:"11px 14px", fontSize:14, color:"#1e293b", outline:"none", fontFamily:"'DM Sans',sans-serif", boxSizing:"border-box", transition:"border 0.2s" }}
                    onFocus={e=>e.target.style.borderColor="#4f46e5"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}
                  />
                </div>
              ))}
            </div>
          )}

          {step===1 && (<div>{sectionHeader("نفسیاتی جائزہ","Psychology Assessment — ہر سوال کا جواب اپنے حقیقی جذبات کے مطابق دیں","linear-gradient(135deg,#1d4ed8,#4f46e5)","🧠")}
            {PSY_Q.map((q,i)=><LikertQ key={q.id} q={q} value={psy[q.id]} onChange={(id,v)=>setPsy(p=>({...p,[id]:v}))} index={i}/>)}
          </div>)}

          {step===2 && (<div>{sectionHeader("شخصیت کا جائزہ","Personality Assessment — منصوبہ بندی، ہمدردی اور قیادت","linear-gradient(135deg,#0d9488,#059669)","👤")}
            {PER_Q.map((q,i)=><LikertQ key={q.id} q={q} value={per[q.id]} onChange={(id,v)=>setPer(p=>({...p,[id]:v}))} index={i}/>)}
          </div>)}

          {step===3 && (<div>{sectionHeader("دیانت اور شکرگزاری","Honesty & Gratitude — ایمانداری اور تشکر سے متعلق سوالات","linear-gradient(135deg,#d97706,#ea580c)","🤲")}
            {HON_Q.map((q,i)=><LikertQ key={q.id} q={q} value={hon[q.id]} onChange={(id,v)=>setHon(p=>({...p,[id]:v}))} index={i}/>)}
          </div>)}

          {step===4 && (<div>{sectionHeader("IQ Test","Logic, Pattern Recognition & Arithmetic — 10 Questions","linear-gradient(135deg,#7c3aed,#6d28d9)","🧩")}
            {IQ_Q.map((q,i)=><IQQ key={q.id} q={q} value={iq[q.id]} onChange={(id,v)=>setIq(p=>({...p,[id]:v}))} index={i}/>)}
          </div>)}

          {step===5 && (
            <div>
              {sectionHeader("Thinking Process","Write 30–50 words per prompt. Be thoughtful and honest in your responses.","linear-gradient(135deg,#1e293b,#334155)","✍️")}
              {prompts.map((p,i) => {
                const wc = wordCount(p.id);
                return (
                  <div key={p.id} className="card-hover" style={{ background:"#fff", borderRadius:18, padding:"20px", border:"1.5px solid #e2e8f0", marginBottom:14 }}>
                    <div style={{ display:"flex", alignItems:"flex-start", gap:12, marginBottom:12 }}>
                      <span style={{ width:28, height:28, borderRadius:"50%", background:"#f1f5f9", color:"#475569", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, flexShrink:0, border:"1px solid #e2e8f0" }}>{i+1}</span>
                      <p style={{ color:"#1e293b", fontSize:14, fontWeight:500, lineHeight:1.6 }}>{p.text}</p>
                    </div>
                    <textarea value={think[p.id]||""} onChange={e=>setThink(prev=>({...prev,[p.id]:e.target.value}))}
                      placeholder="Write your response here (30–50 words)…"
                      style={{ width:"100%", border:"2px solid #e2e8f0", borderRadius:12, padding:"12px 14px", height:110, resize:"none", fontFamily:"'DM Sans',sans-serif", fontSize:13.5, color:"#334155", outline:"none", boxSizing:"border-box" }}
                      onFocus={e=>e.target.style.borderColor="#4f46e5"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}
                    />
                    <div style={{ display:"flex", justifyContent:"flex-end", marginTop:6, gap:8, alignItems:"center" }}>
                      <span style={{ fontSize:11, color: wc<30?"#ef4444":wc>50?"#f59e0b":"#16a34a", fontWeight:600 }}>
                        {wc} words {wc<30?`— need ${30-wc} more`:wc>50?"— try to be concise":"✓ Perfect"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {step===6 && (
            <div>
              <div style={{ background:"linear-gradient(135deg,#0f172a,#1e293b)", borderRadius:18, padding:"20px 24px", marginBottom:18 }}>
                <div className="font-display" style={{ color:"#fff", fontSize:20, fontWeight:800 }}>✅ Review Your Submission</div>
                <div style={{ color:"rgba(255,255,255,0.6)", fontSize:12, marginTop:4 }}>Confirm all sections are complete before submitting.</div>
              </div>
              <div style={{ display:"grid", gap:10, marginBottom:8 }}>
                {reviewItems.map(r => (
                  <div key={r.label} style={{ background:"#fff", borderRadius:14, padding:"14px 18px", display:"flex", alignItems:"center", justifyContent:"space-between", border:`1.5px solid ${r.done?"#bbf7d0":"#fecaca"}`, boxShadow:"0 1px 6px rgba(0,0,0,0.04)" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <span style={{ fontSize:20 }}>{r.icon}</span>
                      <span style={{ fontWeight:600, color:"#1e293b", fontSize:14 }}>{r.label}</span>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <span style={{ color:"#94a3b8", fontSize:12 }}>{r.count} completed</span>
                      <span style={{ fontSize:18 }}>{r.done?"✅":"❌"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div style={{ display:"flex", gap:12, marginTop:20 }}>
          {step>0 && (
            <button onClick={()=>setStep(s=>s-1)} style={{ flex:1, padding:"13px 20px", border:"2px solid #cbd5e1", borderRadius:12, background:"#fff", color:"#475569", fontSize:15, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
              ← Back
            </button>
          )}
          {step<STEPS.length-2 ? (
            <button onClick={()=>canNext()&&setStep(s=>s+1)} style={{ flex:2, padding:"13px 20px", borderRadius:12, border:"none", background:canNext()?"linear-gradient(135deg,#4f46e5,#0ea5e9)":"#e2e8f0", color:canNext()?"#fff":"#94a3b8", fontSize:15, fontWeight:700, cursor:canNext()?"pointer":"not-allowed", fontFamily:"'DM Sans',sans-serif", boxShadow:canNext()?"0 4px 16px rgba(79,70,229,0.35)":"none", transition:"all 0.2s" }}>
              Next Section →
            </button>
          ) : step===STEPS.length-2 ? (
            <button onClick={()=>canNext()&&setStep(s=>s+1)} style={{ flex:2, padding:"13px 20px", borderRadius:12, border:"none", background:canNext()?"linear-gradient(135deg,#0d9488,#059669)":"#e2e8f0", color:canNext()?"#fff":"#94a3b8", fontSize:15, fontWeight:700, cursor:canNext()?"pointer":"not-allowed", fontFamily:"'DM Sans',sans-serif", boxShadow:canNext()?"0 4px 16px rgba(5,150,105,0.35)":"none" }}>
              Review & Submit →
            </button>
          ) : (
            <button onClick={doSubmit} disabled={!reviewItems.every(r=>r.done)} style={{ flex:2, padding:"13px 20px", borderRadius:12, border:"none", background:reviewItems.every(r=>r.done)?"linear-gradient(135deg,#16a34a,#059669)":"#e2e8f0", color:reviewItems.every(r=>r.done)?"#fff":"#94a3b8", fontSize:15, fontWeight:700, cursor:reviewItems.every(r=>r.done)?"pointer":"not-allowed", fontFamily:"'DM Sans',sans-serif", boxShadow:"0 4px 16px rgba(22,163,74,0.35)" }}>
              🎯 Submit Assessment
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SUPERVISOR PORTAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function SupervisorPortal({ onLogout }) {
  const [students, setStudents] = useState([]);
  const [supData,  setSupData]  = useState({});
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ activityComments:"", activityMarks:"", traits:{ gratitude:5,punctuality:5,prayers:5,participation:5,discipline:5 } });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setStudents(DB.getStudents());
    setSupData(DB.getSup());
  }, []);

  const select = (s) => {
    setSelected(s); setSaved(false);
    const ex = DB.getSup()[s.id];
    setForm(ex ? { ...ex } : { activityComments:"", activityMarks:"", traits:{ gratitude:5,punctuality:5,prayers:5,participation:5,discipline:5 } });
  };

  const save = () => {
    const updated = { ...supData, [selected.id]:{ ...form, savedAt:new Date().toISOString() } };
    DB.setSup(updated); setSupData(updated); setSaved(true);
    setTimeout(()=>setSaved(false), 2000);
  };

  const submit = () => {
    if (!window.confirm("⚠️ Final Submit — this action CANNOT be undone. The evaluation will be locked permanently.\n\nAre you sure?")) return;
    const updated = { ...supData, [selected.id]:{ ...form, submitted:true, submittedAt:new Date().toISOString() } };
    DB.setSup(updated); setSupData(updated); setSelected(null);
  };

  const locked = selected && supData[selected.id]?.submitted;
  const statusOf = (s) => {
    const d = supData[s.id];
    if (d?.submitted) return { label:"Submitted", bg:"#f0fdf4", color:"#16a34a", dot:"#22c55e" };
    if (d) return { label:"In Progress", bg:"#fefce8", color:"#d97706", dot:"#f59e0b" };
    return { label:"Pending", bg:"#f8fafc", color:"#94a3b8", dot:"#cbd5e1" };
  };

  return (
    <div style={{ minHeight:"100vh", background:"#f0f4f8" }}>
      <TopBar title="Supervisor Evaluation Panel" subtitle="Student Observation, Activity Marking & Trait Assessment" role="supervisor" onLogout={onLogout} />
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"24px 16px", display:"grid", gridTemplateColumns:"280px 1fr", gap:20, alignItems:"start" }}>
        {/* Student list */}
        <div style={{ background:"#fff", borderRadius:20, padding:18, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", border:"1px solid #e2e8f0", position:"sticky", top:80 }}>
          <h3 className="font-display" style={{ fontSize:16, fontWeight:800, color:"#0f172a", marginBottom:14 }}>📋 Student List <span style={{ color:"#94a3b8", fontSize:13, fontWeight:400 }}>({students.length})</span></h3>
          {students.length===0 && <p style={{ color:"#94a3b8", fontSize:13 }}>No students have submitted yet. Share the Student portal access code.</p>}
          {students.map(s => {
            const st = statusOf(s);
            return (
              <button key={s.id} onClick={()=>select(s)} style={{
                width:"100%", textAlign:"left", padding:"12px 14px", borderRadius:14, marginBottom:8,
                border: selected?.id===s.id?"2px solid #0d9488":"2px solid transparent",
                background: selected?.id===s.id?"#f0fdfa":"#f8fafc", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.18s"
              }}>
                <div style={{ fontWeight:600, color:"#1e293b", fontSize:13 }}>{s.info.name}</div>
                <div style={{ color:"#64748b", fontSize:11, marginTop:2 }}>{s.info.school}</div>
                <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:6 }}>
                  <span style={{ width:6, height:6, borderRadius:"50%", background:st.dot, display:"inline-block" }}></span>
                  <span style={{ fontSize:10, fontWeight:600, color:st.color }}>{st.label}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Marking form */}
        {!selected ? (
          <div style={{ background:"#fff", borderRadius:20, padding:"60px 20px", textAlign:"center", boxShadow:"0 2px 12px rgba(0,0,0,0.06)", border:"1px solid #e2e8f0" }}>
            <div style={{ fontSize:48, marginBottom:12 }}>👈</div>
            <p style={{ color:"#64748b", fontSize:14 }}>Select a student from the list to begin evaluation.</p>
          </div>
        ) : (
          <div style={{ background:"#fff", borderRadius:20, padding:"24px 24px 28px", boxShadow:"0 2px 12px rgba(0,0,0,0.06)", border:"1px solid #e2e8f0" }}>
            {/* Student info header */}
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:22, paddingBottom:18, borderBottom:"1px solid #f1f5f9" }}>
              <div>
                <h3 className="font-display" style={{ fontSize:21, fontWeight:800, color:"#0f172a" }}>{selected.info.name}</h3>
                <p style={{ color:"#64748b", fontSize:13, marginTop:2 }}>{selected.info.school} · {selected.info.city} · {selected.info.phone}</p>
                <p style={{ color:"#94a3b8", fontSize:11, marginTop:4 }}>Father: {selected.info.father} · ID: {selected.id}</p>
              </div>
              {locked && (
                <span style={{ background:"#fef2f2", color:"#dc2626", border:"1px solid #fecaca", borderRadius:99, padding:"4px 14px", fontSize:12, fontWeight:700 }}>🔒 Locked</span>
              )}
            </div>

            {/* Activity Evaluation */}
            <div style={{ marginBottom:26, paddingBottom:22, borderBottom:"1px solid #f1f5f9" }}>
              <h4 style={{ fontWeight:700, color:"#0f172a", fontSize:15, marginBottom:14 }}>📝 Activity Evaluation</h4>
              <label style={{ fontSize:12, fontWeight:600, color:"#475569", display:"block", marginBottom:6 }}>Supervisor Comments on Group / Physical Activities</label>
              <textarea value={form.activityComments} disabled={locked}
                onChange={e=>setForm(f=>({...f,activityComments:e.target.value}))}
                placeholder="Describe the student's performance: communication, teamwork, attitude, leadership in activities..."
                style={{ width:"100%", border:"2px solid #e2e8f0", borderRadius:12, padding:"12px 14px", height:100, resize:"none", fontFamily:"'DM Sans',sans-serif", fontSize:13.5, color:"#334155", outline:"none", boxSizing:"border-box", background:locked?"#f8fafc":"#fff" }}
              />
              <div style={{ display:"flex", alignItems:"center", gap:14, marginTop:12 }}>
                <label style={{ fontSize:12, fontWeight:600, color:"#475569" }}>Activity Score (0–100)</label>
                <input type="number" min="0" max="100" value={form.activityMarks} disabled={locked}
                  onChange={e=>setForm(f=>({...f,activityMarks:e.target.value}))}
                  style={{ width:90, border:"2px solid #e2e8f0", borderRadius:10, padding:"8px 12px", fontSize:14, fontFamily:"'DM Sans',sans-serif", outline:"none", background:locked?"#f8fafc":"#fff" }}
                />
              </div>
            </div>

            {/* Trait sliders */}
            <div style={{ marginBottom:24 }}>
              <h4 style={{ fontWeight:700, color:"#0f172a", fontSize:15, marginBottom:4 }}>📊 Behavioral Trait Rankings</h4>
              <p style={{ color:"#94a3b8", fontSize:12, marginBottom:16 }}>Rate each trait from 1 (Poor) to 10 (Excellent) based on your direct observations.</p>
              {TRAITS.map(t => (
                <div key={t.id} style={{ marginBottom:18 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                    <label style={{ fontSize:14, fontWeight:600, color:"#1e293b" }}>{t.icon} {t.label}</label>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <span style={{ fontSize:22, fontWeight:800, color:t.color }}>{form.traits[t.id]}</span>
                      <span style={{ fontSize:10, color:"#94a3b8" }}>/10</span>
                    </div>
                  </div>
                  <input type="range" min="1" max="10" value={form.traits[t.id]} disabled={locked}
                    onChange={e=>setForm(f=>({...f,traits:{...f.traits,[t.id]:+e.target.value}}))}
                    style={{ width:"100%", height:6, accentColor:t.color, cursor:locked?"not-allowed":"pointer" }}
                  />
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:"#94a3b8", marginTop:2 }}>
                    <span>1 — Poor</span><span>5 — Average</span><span>10 — Excellent</span>
                  </div>
                </div>
              ))}
            </div>

            {!locked && (
              <div style={{ display:"flex", gap:12 }}>
                <button onClick={save} style={{ flex:1, padding:"13px 20px", borderRadius:12, border:"2px solid #0d9488", background:saved?"#f0fdfa":"#fff", color:"#0d9488", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.2s" }}>
                  {saved ? "✓ Saved!" : "💾 Save Draft"}
                </button>
                <button onClick={submit} style={{ flex:1.4, padding:"13px 20px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#0d9488,#059669)", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", boxShadow:"0 4px 16px rgba(13,148,136,0.35)" }}>
                  🔒 Final Submit (Lock)
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STUDENT DETAIL MODAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function StudentModal({ student, supData, onClose }) {
  const [drill, setDrill] = useState(null);
  const sc  = calcScores(student, supData);
  const rec = getRec(sc.suitability);
  const sup = supData?.[student.id];

  const radarData = [
    { subject:"IQ",         score:sc.iqScore,              fullMark:100 },
    { subject:"Psychology", score:sc.psyScore,             fullMark:100 },
    { subject:"Personality",score:sc.perScore,             fullMark:100 },
    { subject:"Ethics",     score:sc.honScore,             fullMark:100 },
    { subject:"Supervisor", score:sc.supScore||0,          fullMark:100 },
  ];

  const drillSections = {
    psychology:  { label:"🧠 Psychology",  qs:PSY_Q, ans:student.psychology||{} },
    personality: { label:"👤 Personality", qs:PER_Q, ans:student.personality||{} },
    honesty:     { label:"🤲 Ethics",      qs:HON_Q, ans:student.honesty||{}    },
  };

  const InfoChip = ({ icon, label, value }) => (
    <div style={{ display:"flex", flexDirection:"column", background:"rgba(255,255,255,0.12)", borderRadius:12, padding:"10px 14px", flex:1, minWidth:100 }}>
      <div style={{ color:"rgba(255,255,255,0.55)", fontSize:10, marginBottom:3 }}>{icon} {label}</div>
      <div style={{ color:"#fff", fontSize:15, fontWeight:700 }}>{value}</div>
    </div>
  );

  return (
    <div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&onClose()} style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.75)", backdropFilter:"blur(6px)", zIndex:50, display:"flex", alignItems:"center", justifyContent:"center", padding:"16px", overflowY:"auto" }}>
      <div className="modal-card" style={{ background:"#fff", borderRadius:28, width:"100%", maxWidth:860, maxHeight:"90vh", overflowY:"auto", boxShadow:"0 32px 80px rgba(0,0,0,0.4)" }}>
        {/* Header */}
        <div style={{ background:`linear-gradient(135deg,#7c3aed,#9333ea)`, borderRadius:"28px 28px 0 0", padding:"24px 28px" }}>
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:16 }}>
            <div>
              <h2 className="font-display" style={{ color:"#fff", fontSize:24, fontWeight:800 }}>{student.info.name}</h2>
              <p style={{ color:"rgba(255,255,255,0.65)", fontSize:13, marginTop:2 }}>{student.info.school} · {student.info.city}</p>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ background:"rgba(255,255,255,0.15)", borderRadius:12, padding:"8px 16px", display:"inline-block" }}>
                <div style={{ color:"#fff", fontSize:26, fontWeight:800 }}>{sc.suitability}%</div>
                <div style={{ color:"rgba(255,255,255,0.7)", fontSize:10 }}>Suitability Match</div>
              </div>
              <div style={{ marginTop:6, fontSize:12, fontWeight:700, color:sc.suitability>=65?"#a7f3d0":"#fde68a" }}>{rec.badge}</div>
            </div>
          </div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            <InfoChip icon="🧩" label="IQ"          value={`${sc.iqScore}%`}                       />
            <InfoChip icon="🧠" label="Psychology"  value={`${sc.psyScore}%`}                      />
            <InfoChip icon="👤" label="Personality" value={`${sc.perScore}%`}                      />
            <InfoChip icon="🤲" label="Ethics"      value={`${sc.honScore}%`}                      />
            <InfoChip icon="🎯" label="Supervisor"  value={sc.supScore!==null?`${sc.supScore}%`:"—"} />
          </div>
        </div>

        {/* Charts row */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, padding:"24px 28px 0" }}>
          {/* Radar */}
          <div>
            <h3 style={{ fontWeight:700, color:"#0f172a", fontSize:14, marginBottom:14 }}>📊 Performance Radar</h3>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill:"#475569", fontSize:11, fontFamily:"'DM Sans',sans-serif" }} />
                <PolarRadiusAxis angle={90} domain={[0,100]} tick={{ fill:"#94a3b8", fontSize:9 }} />
                <Radar name="Score" dataKey="score" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.25} strokeWidth={2} />
                <Tooltip formatter={v=>[`${v}%`,"Score"]} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          {/* Supervisor insights */}
          <div>
            <h3 style={{ fontWeight:700, color:"#0f172a", fontSize:14, marginBottom:14 }}>🎯 Supervisor Insights</h3>
            {sup?.submitted ? (
              <div>
                {sup.activityComments && (
                  <div style={{ background:"#f0fdfa", borderRadius:12, padding:"12px 14px", marginBottom:12, border:"1px solid #99f6e4" }}>
                    <p style={{ fontSize:10, fontWeight:700, color:"#0d9488", marginBottom:4 }}>ACTIVITY COMMENTS</p>
                    <p style={{ fontSize:12.5, color:"#334155", lineHeight:1.6 }}>{sup.activityComments}</p>
                    {sup.activityMarks && <p style={{ fontSize:11, color:"#0d9488", marginTop:6, fontWeight:700 }}>Score: {sup.activityMarks}/100</p>}
                  </div>
                )}
                {TRAITS.map(t => (
                  <div key={t.id} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                    <span style={{ fontSize:13, width:16 }}>{t.icon}</span>
                    <span style={{ fontSize:12, color:"#475569", width:120, flexShrink:0 }}>{t.label}</span>
                    <div style={{ flex:1, height:6, background:"#f1f5f9", borderRadius:99 }}>
                      <div style={{ width:`${(sup.traits[t.id]/10)*100}%`, height:"100%", background:t.color, borderRadius:99, transition:"width 0.5s ease" }} />
                    </div>
                    <span style={{ fontSize:12, fontWeight:800, color:t.color, width:24, textAlign:"right" }}>{sup.traits[t.id]}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ background:"#fefce8", borderRadius:14, padding:"20px", textAlign:"center", border:"1px solid #fde68a" }}>
                <div style={{ fontSize:28, marginBottom:8 }}>⏳</div>
                <p style={{ color:"#92400e", fontSize:13, fontWeight:500 }}>Supervisor evaluation pending</p>
              </div>
            )}
          </div>
        </div>

        {/* Drill-down */}
        <div style={{ padding:"20px 28px" }}>
          <h3 style={{ fontWeight:700, color:"#0f172a", fontSize:14, marginBottom:12 }}>🔍 Section Deep Dive — Click to Expand</h3>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:14 }}>
            {Object.entries(drillSections).map(([key,sec]) => (
              <button key={key} onClick={()=>setDrill(drill===key?null:key)} style={{ padding:"8px 18px", borderRadius:99, border:"none", background:drill===key?"#7c3aed":"#f1f5f9", color:drill===key?"#fff":"#475569", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.2s" }}>
                {sec.label}
              </button>
            ))}
            <button onClick={()=>setDrill(drill==="iq"?null:"iq")} style={{ padding:"8px 18px", borderRadius:99, border:"none", background:drill==="iq"?"#7c3aed":"#f1f5f9", color:drill==="iq"?"#fff":"#475569", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>🧩 IQ Results</button>
            <button onClick={()=>setDrill(drill==="thinking"?null:"thinking")} style={{ padding:"8px 18px", borderRadius:99, border:"none", background:drill==="thinking"?"#7c3aed":"#f1f5f9", color:drill==="thinking"?"#fff":"#475569", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>✍️ Thinking</button>
          </div>

          {drill && drillSections[drill] && (
            <div className="step-enter" style={{ background:"#fafafa", borderRadius:16, padding:"18px", border:"1px solid #e2e8f0", maxHeight:320, overflowY:"auto" }}>
              {drillSections[drill].qs.map((q,i) => {
                const ans = drillSections[drill].ans[q.id];
                const lk  = LIKERT.find(l=>l.val===ans);
                return (
                  <div key={q.id} style={{ background:"#fff", borderRadius:12, padding:"12px 14px", marginBottom:8, border:"1px solid #e2e8f0" }}>
                    <p className="urdu" style={{ color:"#334155", fontSize:14, lineHeight:1.7, textAlign:"right", marginBottom:8 }} dir="rtl">{i+1}. {q.text}</p>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ background:lk?lk.bg:"#e2e8f0", color:"#fff", borderRadius:99, padding:"3px 12px", fontSize:11, fontWeight:700 }}>{ans||"—"}/5</span>
                      <span style={{ fontSize:12, color:"#64748b" }}>{lk?.en||"No answer"}</span>
                      <span className="urdu" style={{ fontSize:11, color:"#94a3b8" }} dir="rtl">{lk?.urdu||""}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {drill==="iq" && (
            <div className="step-enter" style={{ background:"#fafafa", borderRadius:16, padding:"18px", border:"1px solid #e2e8f0", maxHeight:320, overflowY:"auto" }}>
              {IQ_Q.map((q,i) => {
                const ua = student.iq?.[q.id];
                const ok = ua===q.ans;
                return (
                  <div key={q.id} style={{ background:"#fff", borderRadius:12, padding:"12px 14px", marginBottom:8, border:`1px solid ${ok?"#bbf7d0":"#fecaca"}` }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8 }}>
                      <p style={{ color:"#1e293b", fontSize:13, fontWeight:500, flex:1 }}>{i+1}. {q.q}</p>
                      <span style={{ fontSize:16 }}>{ok?"✅":"❌"}</span>
                    </div>
                    <div style={{ display:"flex", gap:10, marginTop:8 }}>
                      <span style={{ background:ok?"#f0fdf4":"#fef2f2", color:ok?"#16a34a":"#dc2626", borderRadius:8, padding:"3px 10px", fontSize:11, fontWeight:600 }}>
                        Student: {ua||"—"}
                      </span>
                      {!ok && <span style={{ background:"#f1f5f9", color:"#475569", borderRadius:8, padding:"3px 10px", fontSize:11, fontWeight:600 }}>Correct: {q.ans}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {drill==="thinking" && (
            <div className="step-enter" style={{ background:"#fafafa", borderRadius:16, padding:"18px", border:"1px solid #e2e8f0", maxHeight:320, overflowY:"auto" }}>
              {student.thinking?.map((t,i)=>(
                <div key={i} style={{ background:"#fff", borderRadius:12, padding:"14px 16px", marginBottom:10, border:"1px solid #e2e8f0" }}>
                  <p style={{ color:"#7c3aed", fontSize:11, fontWeight:700, marginBottom:6, textTransform:"uppercase", letterSpacing:"0.05em" }}>Prompt {i+1}</p>
                  <p style={{ color:"#475569", fontSize:12, marginBottom:8 }}>{t.prompt}</p>
                  <p style={{ color:"#1e293b", fontSize:13.5, lineHeight:1.7, borderLeft:"3px solid #7c3aed", paddingLeft:12 }}>{t.answer||<em style={{color:"#94a3b8"}}>No response</em>}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recommendation + close */}
        <div style={{ margin:"0 28px 28px", background:rec.light, borderRadius:16, padding:"16px 20px", border:`1px solid`, borderColor:rec.border, display:"flex", alignItems:"center", justifyContent:"space-between", gap:16 }}>
          <div>
            <p style={{ fontSize:16, fontWeight:800, color:rec.text.replace("text-","") }} className={rec.text}>{rec.badge} — {rec.label}</p>
            <p style={{ fontSize:12, color:"#64748b", marginTop:2 }}>
              Suitability: <strong>{sc.suitability}%</strong> · IQ: {sc.iqScore}% · Psy: {sc.psyScore}% · Per: {sc.perScore}% · Ethics: {sc.honScore}%{sc.supScore!==null?` · Sup: ${sc.supScore}%`:""}
            </p>
          </div>
          <button onClick={onClose} style={{ background:"#fff", border:"1.5px solid #e2e8f0", borderRadius:10, padding:"9px 20px", color:"#475569", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", flexShrink:0 }}>
            Close ✕
          </button>
        </div>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ADMIN DASHBOARD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function AdminDashboard({ onLogout }) {
  const [students, setStudents] = useState([]);
  const [supData,  setSupData]  = useState({});
  const [selected, setSelected] = useState(null);
  const [query, setQuery]       = useState("");
  const [sortKey, setSortKey]   = useState("suitability");
  const [demoLoaded, setDemoLoaded] = useState(false);

  const reload = () => { setStudents(DB.getStudents()); setSupData(DB.getSup()); };
  useEffect(() => { reload(); }, []);

  const loadDemo = () => {
    const existing = DB.getStudents();
    const demoIds  = SEED_STUDENTS.map(s=>s.id);
    const cleaned  = existing.filter(s=>!demoIds.includes(s.id));
    DB.setStudents([...cleaned, ...SEED_STUDENTS]);
    DB.setSup({ ...DB.getSup(), ...SEED_SUP });
    reload(); setDemoLoaded(true);
  };

  const scored = useMemo(() =>
    students
      .map(s=>({ ...s, sc:calcScores(s,supData) }))
      .filter(s=>!query||s.info.name.toLowerCase().includes(query.toLowerCase())||s.info.school.toLowerCase().includes(query.toLowerCase()))
      .sort((a,b)=>(b.sc[sortKey]||0)-(a.sc[sortKey]||0)),
    [students,supData,query,sortKey]
  );

  const avg    = scored.length ? Math.round(scored.reduce((a,s)=>a+s.sc.suitability,0)/scored.length) : 0;
  const supCnt = Object.values(supData).filter(s=>s.submitted).length;
  const high   = scored.filter(s=>s.sc.suitability>=75).length;

  const StatCard = ({ icon, label, value, gradient }) => (
    <div style={{ background:gradient, borderRadius:18, padding:"20px 22px", boxShadow:"0 4px 20px rgba(0,0,0,0.12)", color:"#fff" }}>
      <div style={{ fontSize:28, marginBottom:8 }}>{icon}</div>
      <div className="font-display" style={{ fontSize:30, fontWeight:800 }}>{value}</div>
      <div style={{ fontSize:12, opacity:0.75, marginTop:2 }}>{label}</div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#f0f4f8" }}>
      <TopBar title="Admin Analytics Dashboard" subtitle="Scholarship Evaluation · Decision Intelligence" role="admin" onLogout={onLogout} />
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"24px 16px" }}>

        {/* Demo banner */}
        {students.length===0 && (
          <div style={{ background:"linear-gradient(135deg,#1e1b4b,#312e81)", borderRadius:18, padding:"20px 24px", marginBottom:22, display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
            <div>
              <p style={{ color:"#a5b4fc", fontWeight:700, fontSize:15, marginBottom:4 }}>📊 No data yet</p>
              <p style={{ color:"rgba(255,255,255,0.55)", fontSize:13 }}>Load demo data to explore the dashboard, or wait for students to submit.</p>
            </div>
            <button onClick={loadDemo} style={{ background:"linear-gradient(135deg,#4f46e5,#0ea5e9)", border:"none", borderRadius:10, padding:"10px 22px", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", whiteSpace:"nowrap" }}>
              🚀 Load Demo Data
            </button>
          </div>
        )}

        {demoLoaded && (
          <div style={{ background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:12, padding:"10px 16px", marginBottom:18, fontSize:13, color:"#16a34a", fontWeight:500 }}>
            ✅ Demo data loaded — 3 students with supervisor evaluations.
          </div>
        )}

        {/* Stat cards */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:16, marginBottom:24 }}>
          <StatCard icon="👥" label="Total Applicants"     value={students.length}        gradient="linear-gradient(135deg,#1d4ed8,#4338ca)" />
          <StatCard icon="📈" label="Average Suitability"  value={`${avg}%`}              gradient="linear-gradient(135deg,#7c3aed,#6d28d9)" />
          <StatCard icon="✅" label="Supervisor Reviewed"  value={supCnt}                 gradient="linear-gradient(135deg,#0d9488,#059669)" />
          <StatCard icon="⭐" label="High Scorers (≥75%)"  value={high}                   gradient="linear-gradient(135deg,#d97706,#dc2626)" />
        </div>

        {/* Bar chart */}
        {scored.length>0 && (
          <div style={{ background:"#fff", borderRadius:20, padding:"22px 24px", marginBottom:22, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", border:"1px solid #e2e8f0" }}>
            <h3 style={{ fontWeight:700, color:"#0f172a", fontSize:15, marginBottom:16 }}>📊 Applicant Suitability Overview</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={scored.map(s=>({ name:s.info.name.split(" ")[0], score:s.sc.suitability, full:s.info.name }))} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fill:"#64748b", fontSize:12, fontFamily:"'DM Sans',sans-serif" }} />
                <YAxis domain={[0,100]} tick={{ fill:"#94a3b8", fontSize:11 }} />
                <Tooltip formatter={(v,n,p)=>[`${v}%`,p.payload.full]} />
                <Bar dataKey="score" radius={[8,8,0,0]}>
                  {scored.map((s,i)=>(
                    <Cell key={i} fill={s.sc.suitability>=75?"#059669":s.sc.suitability>=60?"#4f46e5":"#d97706"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div style={{ display:"flex", gap:16, marginTop:10, justifyContent:"center" }}>
              {[["#059669","≥75% High"],["#4f46e5","60–74% Good"],["#d97706","<60% Average"]].map(([c,l])=>(
                <div key={l} style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, color:"#64748b" }}>
                  <div style={{ width:12, height:12, borderRadius:3, background:c }}></div> {l}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Table */}
        <div style={{ background:"#fff", borderRadius:20, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", border:"1px solid #e2e8f0", overflow:"hidden" }}>
          <div style={{ padding:"18px 22px", borderBottom:"1px solid #f1f5f9", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
            <h3 style={{ fontWeight:800, color:"#0f172a", fontSize:16, fontFamily:"'Syne',sans-serif" }}>👥 Student Registry</h3>
            <div style={{ display:"flex", gap:10 }}>
              <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search by name or school…"
                style={{ border:"1.5px solid #e2e8f0", borderRadius:10, padding:"8px 14px", fontSize:13, fontFamily:"'DM Sans',sans-serif", outline:"none", color:"#1e293b", width:200 }}
              />
              <select value={sortKey} onChange={e=>setSortKey(e.target.value)}
                style={{ border:"1.5px solid #e2e8f0", borderRadius:10, padding:"8px 12px", fontSize:13, fontFamily:"'DM Sans',sans-serif", outline:"none", color:"#475569", cursor:"pointer" }}
              >
                <option value="suitability">Sort: Suitability</option>
                <option value="iqScore">Sort: IQ</option>
                <option value="psyScore">Sort: Psychology</option>
                <option value="perScore">Sort: Personality</option>
                <option value="honScore">Sort: Ethics</option>
              </select>
              {students.length>0 && (
                <button onClick={loadDemo} style={{ border:"1.5px solid #e2e8f0", borderRadius:10, padding:"8px 12px", fontSize:12, fontFamily:"'DM Sans',sans-serif", cursor:"pointer", color:"#64748b", background:"#f8fafc" }}>
                  + Demo
                </button>
              )}
            </div>
          </div>
          {scored.length===0 ? (
            <div style={{ padding:"60px 20px", textAlign:"center" }}>
              <div style={{ fontSize:48, marginBottom:12 }}>📭</div>
              <p style={{ color:"#94a3b8", fontSize:14 }}>No students found. Students must complete the assessment via the Student Portal.</p>
            </div>
          ) : (
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ background:"#f8fafc" }}>
                    {["#","Name","School","IQ","Psychology","Personality","Ethics","Supervisor","Suitability","Status","Action"].map(h=>(
                      <th key={h} style={{ padding:"12px 14px", textAlign:"left", fontSize:10, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.08em", whiteSpace:"nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {scored.map((s,i) => {
                    const r = getRec(s.sc.suitability);
                    return (
                      <tr key={s.id} style={{ borderTop:"1px solid #f1f5f9", transition:"background 0.15s" }}
                        onMouseEnter={e=>e.currentTarget.style.background="#fafbff"}
                        onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                      >
                        <td style={{ padding:"13px 14px", color:"#94a3b8", fontSize:13 }}>{i+1}</td>
                        <td style={{ padding:"13px 14px" }}>
                          <div style={{ fontWeight:700, color:"#0f172a", fontSize:13 }}>{s.info.name}</div>
                          <div style={{ color:"#94a3b8", fontSize:11, marginTop:1 }}>{s.info.city}</div>
                        </td>
                        <td style={{ padding:"13px 14px", color:"#475569", fontSize:12, maxWidth:150 }}>{s.info.school}</td>
                        <td style={{ padding:"13px 14px" }}><ScorePill score={s.sc.iqScore} sm /></td>
                        <td style={{ padding:"13px 14px" }}><ScorePill score={s.sc.psyScore} sm /></td>
                        <td style={{ padding:"13px 14px" }}><ScorePill score={s.sc.perScore} sm /></td>
                        <td style={{ padding:"13px 14px" }}><ScorePill score={s.sc.honScore} sm /></td>
                        <td style={{ padding:"13px 14px" }}><ScorePill score={s.sc.supScore} sm /></td>
                        <td style={{ padding:"13px 14px" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                            <div style={{ width:60, height:5, background:"#f1f5f9", borderRadius:99 }}>
                              <div style={{ width:`${s.sc.suitability}%`, height:"100%", background:s.sc.suitability>=75?"#059669":s.sc.suitability>=60?"#4f46e5":"#d97706", borderRadius:99 }} />
                            </div>
                            <ScorePill score={s.sc.suitability} sm />
                          </div>
                        </td>
                        <td style={{ padding:"13px 14px" }}>
                          <span style={{ background:r.light, color:r.text.replace("text-",""), border:`1px solid`, borderColor:r.border, borderRadius:99, padding:"2px 10px", fontSize:10, fontWeight:700 }} className={r.text}>{r.badge}</span>
                        </td>
                        <td style={{ padding:"13px 14px" }}>
                          <button onClick={()=>setSelected(s)} style={{ background:"linear-gradient(135deg,#7c3aed,#6d28d9)", border:"none", borderRadius:9, padding:"6px 14px", color:"#fff", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", boxShadow:"0 2px 10px rgba(124,58,237,0.25)" }}>
                            View Profile
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selected && <StudentModal student={selected} supData={supData} onClose={()=>setSelected(null)} />}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ROOT APP
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function App() {
  const [role, setRole] = useState(null);
  return (
    <>
      <GlobalStyle />
      {!role                  && <LoginPage       onLogin={setRole}         />}
      {role==="student"       && <StudentPortal   onLogout={()=>setRole(null)} />}
      {role==="supervisor"    && <SupervisorPortal onLogout={()=>setRole(null)} />}
      {role==="admin"         && <AdminDashboard  onLogout={()=>setRole(null)} />}
    </>
  );
}
