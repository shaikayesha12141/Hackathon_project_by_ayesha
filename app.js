const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const STORAGE_KEY = "campusConnectDemo_v1";

const defaultStudents = {
  "23CSE001": {name:"Aarav Kumar", roll:"23CSE001", branch:"CSE", year:3, semester:5, college:"ABC Institute of Technology", section:"A", password:"Student@123", role:"student", transport:"College Bus 12", route:"Guntur → College", transportFee:18000, totalFee:85000, paidFee:60000},
  "23ECE014": {name:"Priya Reddy", roll:"23ECE014", branch:"ECE", year:3, semester:5, college:"ABC Institute of Technology", section:"B", password:"Student@123", role:"student", transport:"College Bus 08", route:"Tenali → College", transportFee:20000, totalFee:82000, paidFee:82000}
};
const initialData = {
  users: defaultStudents,
  staff: {
    "ADMIN001": {name:"College Admin", role:"admin", password:"Admin@123", college:"ABC Institute of Technology"},
    "FAC001": {name:"Faculty Demo", role:"faculty", password:"Faculty@123", college:"ABC Institute of Technology"}
  },
  attendance: {
    "23CSE001": [
      {subject:"Data Structures",present:42,total:45},{subject:"Database Systems",present:38,total:45},
      {subject:"Computer Networks",present:35,total:45},{subject:"Operating Systems",present:41,total:44},
      {subject:"Java Programming Lab",present:18,total:20}
    ],
    "23ECE014": [
      {subject:"Signals & Systems",present:40,total:44},{subject:"Digital Electronics",present:38,total:45},
      {subject:"Electronic Devices",present:32,total:44},{subject:"Communication Systems",present:40,total:45}
    ]
  },
  marks: [
  // CSE student — sample semester 5 results
  {roll:"23CSE001", semester:5, exam:"Mid-term 1", subject:"Data Structures", marks:"27 / 30"},
  {roll:"23CSE001", semester:5, exam:"Mid-term 1", subject:"Database Management Systems", marks:"26 / 30"},
  {roll:"23CSE001", semester:5, exam:"Mid-term 1", subject:"Computer Networks", marks:"24 / 30"},
  {roll:"23CSE001", semester:5, exam:"Mid-term 1", subject:"Operating Systems", marks:"28 / 30"},
  {roll:"23CSE001", semester:5, exam:"Mid-term 1", subject:"Software Engineering", marks:"25 / 30"},
  {roll:"23CSE001", semester:5, exam:"Mid-term 1", subject:"Theory of Computation", marks:"23 / 30"},
  {roll:"23CSE001", semester:5, exam:"Mid-term 1", subject:"Java Programming", marks:"29 / 30"},
  {roll:"23CSE001", semester:5, exam:"Mid-term 1", subject:"Artificial Intelligence", marks:"27 / 30"},

  // ECE student — sample semester 5 results
  {roll:"23ECE014", semester:5, exam:"Mid-term 1", subject:"Digital Electronics", marks:"28 / 30"},
  {roll:"23ECE014", semester:5, exam:"Mid-term 1", subject:"Signals & Systems", marks:"26 / 30"},
  {roll:"23ECE014", semester:5, exam:"Mid-term 1", subject:"Electronic Devices", marks:"24 / 30"},
  {roll:"23ECE014", semester:5, exam:"Mid-term 1", subject:"Communication Systems", marks:"27 / 30"}
],
  exams: [
    {date:"2026-10-20",time:"09:30 AM",semester:5,subject:"Data Structures",type:"Mid-term examination",venue:"Block A"},
    {date:"2026-10-22",time:"09:30 AM",semester:5,subject:"Database Systems",type:"Mid-term examination",venue:"Block A"},
    {date:"2026-10-24",time:"01:30 PM",semester:5,subject:"Computer Networks",type:"Mid-term examination",venue:"Block B"}
  ],
  timetable: [
    {day:"Monday",time:"09:00–10:00",subject:"Data Structures",room:"C-201",faculty:"Dr. R. Kumar"},
    {day:"Monday",time:"10:00–11:00",subject:"Database Systems",room:"C-201",faculty:"Ms. P. Lakshmi"},
    {day:"Tuesday",time:"09:00–10:00",subject:"Computer Networks",room:"C-202",faculty:"Mr. S. Rao"},
    {day:"Tuesday",time:"11:00–01:00",subject:"Java Programming Lab",room:"Lab 3",faculty:"Ms. P. Lakshmi"},
    {day:"Wednesday",time:"10:00–11:00",subject:"Operating Systems",room:"C-201",faculty:"Dr. R. Kumar"},
    {day:"Thursday",time:"09:00–10:00",subject:"Database Systems",room:"C-201",faculty:"Ms. P. Lakshmi"},
    {day:"Friday",time:"11:00–01:00",subject:"Computer Networks Lab",room:"Lab 2",faculty:"Mr. S. Rao"}
  ],
  feedback: [],
  feePayments: []
};
let data = loadData();
let currentUser = null;
let currentRole = "student";
let currentPage = "home";
let toastTimer;

function loadData(){
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if(saved) return JSON.parse(saved);
  } catch(e) {}
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
  return structuredClone(initialData);
}
function saveData(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
function esc(value=""){ return String(value).replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function money(value){ return new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(Number(value)||0); }
function pct(present,total){ return total ? Math.round((present/total)*100) : 0; }
function attendanceStatus(value){
  if(value > 90) return {label:"Safe",cls:"safe",message:"Excellent! Your attendance is in the safe zone."};
  if(value >= 75 && value <= 90) return {label:"Good",cls:"good",message:"Good attendance. Keep attending classes regularly."};
  if(value >= 65 && value < 75) return {label:"Danger zone",cls:"warning",message:"You are in the danger zone. Improve attendance to meet exam eligibility rules."};
  return {label:"Likely to be detained",cls:"danger",message:"Your attendance is critically low. Contact your class advisor immediately."};
}
function showToast(message){
  const t=$("#toast"); t.textContent=message; t.classList.add("show");
  clearTimeout(toastTimer); toastTimer=setTimeout(()=>t.classList.remove("show"),2800);
}
function showModal(title,html){ $("#modalTitle").textContent=title; $("#modalBody").innerHTML=html; $("#modal").classList.remove("hidden"); }
function closeModal(){ $("#modal").classList.add("hidden"); }
function setAuthTab(tab){
  $$(".tab").forEach(b=>b.classList.toggle("active",b.dataset.authTab===tab));
  $("#loginForm").classList.toggle("hidden",tab!=="login");
  $("#registerForm").classList.toggle("hidden",tab!=="register");
}
function enterPortal(){ $("#intro").classList.add("hidden"); $("#authView").classList.remove("hidden"); }
function startSession(user, role){
  currentUser=user; currentRole=role; currentPage="home";
  $("#authView").classList.add("hidden"); $("#appView").classList.remove("hidden");
  $("#avatar").textContent=(user.name||user.roll||"U").charAt(0).toUpperCase();
  $("#todayLabel").textContent=new Intl.DateTimeFormat("en-IN",{day:"numeric",month:"short",year:"numeric"}).format(new Date());
  $$(".admin-only").forEach(el=>el.classList.toggle("hidden",role!=="admin" && role!=="faculty"));
  renderPage("home");
}
function signOut(){
  currentUser=null; currentRole="student"; $("#appView").classList.add("hidden"); $("#authView").classList.remove("hidden"); setAuthTab("login");
  $("#loginPassword").value=""; $("#sidebar").classList.remove("open"); showToast("You have signed out.");
}
function studentByRoll(roll){ return data.users[roll] || null; }
function getAttendance(roll){ return data.attendance[roll] || []; }
function totalAttendance(roll){
  const rows=getAttendance(roll); const p=rows.reduce((a,r)=>a+r.present,0); const t=rows.reduce((a,r)=>a+r.total,0);
  return {present:p,total:t,percent:pct(p,t)};
}
function pageIntro(title,subtitle){return `<div class="page-intro"><h1>${title}</h1><p>${subtitle}</p></div>`;}
function statusPill(value){const s=attendanceStatus(value);return `<span class="status ${s.cls}">${s.label}</span>`;}
function card(icon,title,desc,page,color=""){return `<button class="feature-card" data-go="${page}"><div class="feature-icon" ${color?`style="background:${color}"`:""}>${icon}</div><h4>${title}</h4><p>${desc}</p></button>`;}
function renderHome(){
  const student=currentRole==="student";
  const profile=student?currentUser:{name:currentUser.name,roll:currentUser.id||"STAFF",branch:"Staff",year:"—",semester:"—",college:currentUser.college||"ABC Institute of Technology",section:"—"};
  const att=student?totalAttendance(profile.roll):{percent:0,present:0,total:0};
  const feeDue=student?(Number(profile.totalFee)-Number(profile.paidFee)):0;
  const name=profile.name||"Campus user";
  const cards=student?[
    card("◷","Attendance","Subject-wise attendance and eligibility","attendance"),
    card("▤","Exam cell","Marks, exam schedule and results","exams","#fff2df"),
    card("▦","Timetable","Your branch and section timetable","timetable","#e3f8f4"),
    card("₹","College fees","Fee summary and payment status","fees","#fff2df"),
    card("↗","Transport","Bus number, route and fee","transport","#e6efff"),
    card("☆","Faculty feedback","Share a rating for your faculty","feedback","#fff0f3"),
    card("▧","Regulations & subjects","Semester-wise subjects and labs","regulation","#f0e9ff")
  ].join(""):[
    card("⚙","Management","Manage demo academic records","management"),
    card("▤","Exam cell","View marks and exam schedules","exams","#fff2df"),
    card("▦","Timetable","View timetable records","timetable","#e3f8f4"),
    card("◷","Attendance","Review attendance data","attendance")
  ].join("");
  return `<section class="welcome-banner"><div><p class="eyebrow">YOUR CAMPUS DASHBOARD</p><h1>Welcome back, ${esc(name.split(" ")[0])} 👋</h1><p>Here’s your academic overview for today.</p></div><div class="banner-badge">🎓</div></section>
  <div class="section-heading"><div><h3>At a glance</h3><p>Your key information, all in one place.</p></div><span class="pill">${student?"Student":"Staff"} workspace</span></div>
  <div class="grid">
    <div class="metric-card"><div class="metric-top">Attendance <span class="metric-icon">◷</span></div><div class="metric-value">${student?att.percent+"%":"—"}</div><div class="metric-note">${student?`${att.present} present of ${att.total} classes`:"Manage student attendance"}</div></div>
    <div class="metric-card"><div class="metric-top">Current semester <span class="metric-icon">▦</span></div><div class="metric-value">${student?"Sem "+esc(profile.semester):"Academic"}</div><div class="metric-note">${student?esc(profile.branch)+" · Section "+esc(profile.section):"Academic workspace"}</div></div>
    <div class="metric-card"><div class="metric-top">Fee balance <span class="metric-icon">₹</span></div><div class="metric-value">${student?money(feeDue):"—"}</div><div class="metric-note">${student?`Paid ${money(profile.paidFee)} of ${money(profile.totalFee)}`:"Review fee records"}</div></div>
    <div class="metric-card"><div class="metric-top">Upcoming exams <span class="metric-icon">▤</span></div><div class="metric-value">${data.exams.filter(e=>Number(e.semester)==Number(profile.semester)).length}</div><div class="metric-note">Scheduled in this semester</div></div>
  </div>
  <div class="section-heading"><div><h3>${student?"Student services":"Staff tools"}</h3><p>Choose a card to open its section.</p></div></div>
  <div class="feature-grid">${cards}</div>
  <div class="section-heading"><div><h3>${student?"Student profile":"Signed-in account"}</h3><p>Basic details linked to this demo account.</p></div></div>
  <div class="panel"><div class="profile-row"><div class="profile-avatar">${esc(name.charAt(0))}</div><div><h3>${esc(name)}</h3><p>${student?esc(profile.roll)+" · "+esc(profile.branch):esc(currentRole.toUpperCase())}</p></div></div><div class="info-list">
    <div><small>College</small><strong>${esc(profile.college)}</strong></div><div><small>Roll number / ID</small><strong>${esc(profile.roll||currentUser.id||"—")}</strong></div>
    <div><small>Branch / role</small><strong>${esc(profile.branch||currentRole)}</strong></div><div><small>Year / semester</small><strong>${student?`${esc(profile.year)} year · Semester ${esc(profile.semester)}`:"Authorized staff account"}</strong></div>
  </div></div>`;
}
function renderAttendance(){
  if(currentRole!=="student") return renderStaffAttendance();
  const rows=getAttendance(currentUser.roll); const total=totalAttendance(currentUser.roll); const s=attendanceStatus(total.percent);
  return `${pageIntro("Attendance","Monitor subject-wise attendance and keep track of exam eligibility.")}<div class="panel"><div class="metric-top">Overall attendance <span>${statusPill(total.percent)}</span></div><div class="metric-value">${total.percent}%</div><div class="progress-track"><div class="progress-fill" style="width:${Math.min(total.percent,100)}%"></div></div><p class="muted">${esc(s.message)} Total: ${total.present} present out of ${total.total} classes.</p></div>
  <div class="section-heading"><div><h3>Subject-wise attendance</h3><p>Records for ${esc(currentUser.roll)}</p></div></div>
  <div class="table-wrap"><table><thead><tr><th>Subject</th><th>Present</th><th>Total classes</th><th>Attendance</th><th>Status</th></tr></thead><tbody>${rows.map(r=>{const v=pct(r.present,r.total);return `<tr><td>${esc(r.subject)}</td><td>${r.present}</td><td>${r.total}</td><td><strong>${v}%</strong><div class="progress-track"><div class="progress-fill" style="width:${v}%"></div></div></td><td>${statusPill(v)}</td></tr>`}).join("")}</tbody></table></div>
  <div class="notice">Demo thresholds: above 90% = Safe; 75–90% = Good; 65% to below 75% = Danger zone; below 65% = Likely to be detained. Official eligibility depends on your college regulations and approved exemptions.</div>`;
}
function renderStaffAttendance(){
  const rows=Object.values(data.users);
  return `${pageIntro("Attendance overview","Faculty and administrators can review the sample student records.")}<div class="table-wrap"><table><thead><tr><th>Student</th><th>Roll number</th><th>Branch</th><th>Attendance</th><th>Status</th></tr></thead><tbody>${rows.map(u=>{const a=totalAttendance(u.roll);return `<tr><td>${esc(u.name)}</td><td>${esc(u.roll)}</td><td>${esc(u.branch)}</td><td>${a.percent}%</td><td>${statusPill(a.percent)}</td></tr>`}).join("")}</tbody></table></div><p class="muted">This demo only lists sample records. Production access must be limited by faculty assignment and admin permissions.</p>`;
}
function renderExams(){
  const student=currentRole==="student"; const roll=student?currentUser.roll:null; const marks=data.marks.filter(m=>!roll||m.roll===roll);
  const sem=student?Number(currentUser.semester):5; const exams=data.exams.filter(e=>Number(e.semester)===sem);
  return `${pageIntro("Exam cell","Review semester marks and upcoming examination schedules.")}<div class="section-heading"><div><h3>Marks and results</h3><p>${student?"Your published sample results":"Published sample results"}</p></div></div>
  <div class="table-wrap"><table><thead><tr>${student?"":"<th>Roll number</th>"}<th>Semester</th><th>Exam</th><th>Subject</th><th>Marks</th></tr></thead><tbody>${marks.length?marks.map(m=>`<tr>${student?"":`<td>${esc(m.roll)}</td>`}<td>${m.semester}</td><td>${esc(m.exam)}</td><td>${esc(m.subject)}</td><td><strong>${esc(m.marks)}</strong></td></tr>`).join(""):`<tr><td colspan="${student?4:5}" class="empty">No marks published for this account.</td></tr>`}</tbody></table></div>
  <div class="section-heading"><div><h3>Semester ${sem} exam schedule</h3><p>Check dates, time and venue before each examination.</p></div></div>
  <div class="table-wrap"><table><thead><tr><th>Date</th><th>Time</th><th>Subject</th><th>Exam type</th><th>Venue</th></tr></thead><tbody>${exams.map(e=>`<tr><td>${esc(e.date)}</td><td>${esc(e.time)}</td><td>${esc(e.subject)}</td><td>${esc(e.type)}</td><td>${esc(e.venue)}</td></tr>`).join("")||`<tr><td colspan="5" class="empty">No schedule available for this semester.</td></tr>`}</tbody></table></div>`;
}
function renderTimetable(){
  const student=currentRole==="student"; const branch=student?currentUser.branch:"All branches"; const section=student?currentUser.section:"All sections";
  const rows=data.timetable;
  return `${pageIntro("Class timetable",`${branch} · Section ${section} · Semester ${student?currentUser.semester:"All"}`)}<div class="toolbar"><span class="pill">${esc(branch)}</span><span class="pill">Section ${esc(section)}</span><span class="pill">Semester ${student?esc(currentUser.semester):"All"}</span></div>
  <div class="table-wrap"><table><thead><tr><th>Day</th><th>Time</th><th>Subject / Lab</th><th>Room</th><th>Faculty</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${esc(r.day)}</td><td>${esc(r.time)}</td><td>${esc(r.subject)}</td><td>${esc(r.room)}</td><td>${esc(r.faculty)}</td></tr>`).join("")}</tbody></table></div><p class="muted">The sample timetable is illustrative. The production portal should filter official timetables by branch, section, semester and academic year.</p>`;
}

function renderFees() {
  if (currentRole !== "student") {
    return `
      ${pageIntro("College fees", "Sample fee overview for staff.")}
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Roll Number</th>
              <th>Total Fee</th>
              <th>Paid</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            ${Object.values(data.users).map(u => `
              <tr>
                <td>${esc(u.name)}</td>
                <td>${esc(u.roll)}</td>
                <td>${money(u.totalFee)}</td>
                <td>${money(u.paidFee)}</td>
                <td>${money(u.totalFee - u.paidFee)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>`;
  }

  const totalFee = Number(currentUser.totalFee);
  const paidFee = Number(currentUser.paidFee);
  const balance = totalFee - paidFee;
  const paidPercentage = pct(paidFee, totalFee);

  // Sample fee breakdown
  const feeDetails = [
    { name: "Tuition Fee", amount: 55000 },
    { name: "Examination Fee", amount: 5000 },
    { name: "Laboratory Fee", amount: 8000 },
    { name: "Library Fee", amount: 3000 },
    { name: "Other College Fees", amount: 14000 }
  ];

  return `
    ${pageIntro(
      "College Fees",
      "View your semester fees and payment status."
    )}

    <div class="grid">
      <div class="metric-card">
        <div class="metric-top">Total Fee</div>
        <div class="metric-value">${money(totalFee)}</div>
        <div class="metric-note">Academic year 2026–27</div>
      </div>

      <div class="metric-card">
        <div class="metric-top">Amount Paid</div>
        <div class="metric-value">${money(paidFee)}</div>
        <div class="metric-note">${paidPercentage}% paid</div>
      </div>

      <div class="metric-card">
        <div class="metric-top">Balance Due</div>
        <div class="metric-value">${money(balance)}</div>
        <div class="metric-note">
          ${balance === 0 ? "No balance due" : "Payment pending"}
        </div>
      </div>
    </div>

    <div class="section-heading">
      <div>
        <h3>Semester Fee Details</h3>
        <p>Semester ${esc(currentUser.semester)} · Sample amounts</p>
      </div>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Fee Type</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${feeDetails.map(fee => `
            <tr>
              <td>${esc(fee.name)}</td>
              <td>${money(fee.amount)}</td>
            </tr>
          `).join("")}

          <tr>
            <td><strong>Total Fee</strong></td>
            <td><strong>${money(totalFee)}</strong></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="panel" style="margin-top:18px">
      <h3>Payment Progress</h3>
      <div class="progress-track">
        <div class="progress-fill"
             style="width:${Math.min(paidPercentage, 100)}%">
        </div>
      </div>

      <p class="muted">
        Paid: ${money(paidFee)} |
        Balance: ${money(balance)}
      </p>

      <button class="btn btn-secondary" id="feeBreakdownBtn">
        View Payment Summary
      </button>
    </div>

    <div class="notice">
      These fee components are fictional examples. Replace them
      with your college's official fee structure before use.
      This demo does not process payments.
    </div>
  `;
}
function renderTransport(){
  if(currentRole!=="student") return `${pageIntro("Transport overview","Sample transport assignments.")}<div class="table-wrap"><table><thead><tr><th>Student</th><th>Roll number</th><th>Bus</th><th>Route</th><th>Fee</th></tr></thead><tbody>${Object.values(data.users).map(u=>`<tr><td>${esc(u.name)}</td><td>${esc(u.roll)}</td><td>${esc(u.transport)}</td><td>${esc(u.route)}</td><td>${money(u.transportFee)}</td></tr>`).join("")}</tbody></table></div>`;
  return `${pageIntro("Transport details","Your assigned bus, route and transport fee.")}<div class="two-col"><div class="panel"><div class="feature-icon">🚌</div><h3>Assigned transport</h3><div class="info-list"><div><small>Bus number</small><strong>${esc(currentUser.transport)}</strong></div><div><small>Student roll number</small><strong>${esc(currentUser.roll)}</strong></div><div><small>Route</small><strong>${esc(currentUser.route)}</strong></div><div><small>Transport fee</small><strong>${money(currentUser.transportFee)}</strong></div></div></div><div class="panel"><h3>Transport help</h3><p class="muted">For pickup timing, route changes, or bus pass queries, contact the college transport office.</p><button class="btn btn-secondary" id="transportHelpBtn">View contact guidance</button></div></div>`;
}
function renderFeedback(){
  if(currentRole!=="student") return `${pageIntro("Faculty feedback","Review the demo feedback submissions.")}<div class="table-wrap"><table><thead><tr><th>Faculty</th><th>Subject</th><th>Rating</th><th>Comment</th></tr></thead><tbody>${data.feedback.map(f=>`<tr><td>${esc(f.faculty)}</td><td>${esc(f.subject)}</td><td>${"★".repeat(Number(f.rating))}</td><td>${esc(f.comment||"—")}</td></tr>`).join("")||`<tr><td colspan="4" class="empty">No feedback submitted yet.</td></tr>`}</tbody></table></div>`;
  const faculty=[["Dr. R. Kumar","Data Structures"],["Ms. P. Lakshmi","Database Systems"],["Mr. S. Rao","Computer Networks"],["Ms. N. Devi","Java Programming Lab"]];
  return `${pageIntro("Faculty feedback","Rate your learning experience respectfully and constructively.")}<form id="feedbackForm" class="panel"><h3>Submit faculty feedback</h3><label class="field-label" for="feedbackFaculty">Faculty member</label><select id="feedbackFaculty" class="field">${faculty.map(f=>`<option value="${esc(f[0])}|${esc(f[1])}">${esc(f[0])} · ${esc(f[1])}</option>`).join("")}</select><label class="field-label" for="feedbackRating">Teaching rating</label><select id="feedbackRating" class="field"><option value="5">5 — Excellent</option><option value="4">4 — Very good</option><option value="3">3 — Good</option><option value="2">2 — Needs improvement</option><option value="1">1 — Poor</option></select><label class="field-label" for="feedbackComment">Optional comment</label><textarea id="feedbackComment" class="field" rows="4" maxlength="500" placeholder="Share constructive feedback..."></textarea><button class="btn btn-primary" type="submit">Submit feedback</button></form><div class="notice">In a live system, feedback visibility, anonymity and retention should follow the college's published policy.</div>`;
}
const semesterSubjects = {
  1:["Mathematics I","Applied Physics","Applied Chemistry","English Communication","Engineering Drawing","Basic Workshop"],
  2:["Mathematics II","Programming Fundamentals","Applied Physics Lab","Chemistry Lab","Engineering Graphics","Environmental Studies"],
  3:["Data Structures","Digital Logic","Object-Oriented Programming","Computer Organization","Discrete Mathematics","Data Structures Lab"],
  4:["Database Systems","Operating Systems","Computer Networks","Java Programming","Probability & Statistics","DBMS Lab"],
  5:["Software Engineering","Web Technologies","Design & Analysis of Algorithms","Theory of Computation","Artificial Intelligence","Web Technologies Lab"],
  6:["Machine Learning","Compiler Design","Cloud Computing","Cyber Security","Mobile Application Development","Machine Learning Lab"],
  7:["Distributed Systems","Big Data Analytics","Professional Elective I","Open Elective I","Project Phase I","Technical Seminar"],
  8:["Professional Elective II","Open Elective II","Internship","Major Project","Industry Practice"]
};
function renderRegulation(){
  const sems=Object.keys(semesterSubjects);
  return `${pageIntro("Regulations & subjects","Browse semester-wise subjects and practical labs. Confirm the applicable syllabus with your college.")}<div class="toolbar"><label for="semesterSelect">Choose semester</label><select id="semesterSelect" class="field" style="max-width:220px">${sems.map(s=>`<option value="${s}" ${currentRole==="student"&&Number(currentUser.semester)===Number(s)?"selected":""}>Semester ${s}</option>`).join("")}</select></div><div id="subjectsList" class="feature-grid">${subjectCards(currentRole==="student"?currentUser.semester:1)}</div><div class="notice">These subject names are illustrative, not an official regulation or curriculum. Ask college management to upload the correct regulation and syllabus for each branch and admission year.</div>`;
}
function subjectCards(sem){return (semesterSubjects[sem]||[]).map((sub,i)=>card(i===5?"⚗":"▤",sub,i===5?"Practical / lab course":"Theory / curriculum subject","subject")).join("");}
function renderManagement(){
  return `${pageIntro("Management workspace","Demo controls for viewing records. Production record editing must use a secured backend and audit trail.")}<div class="notice">You are signed in as ${esc(currentRole)}. This local demo does not yet provide secure record editing or real database permissions.</div><div class="management-grid"><div class="management-tile"><h4>Student directory</h4><p>Review registered demo student profiles.</p><button class="btn btn-secondary" data-manage="students">View students</button></div><div class="management-tile"><h4>Attendance records</h4><p>Review sample attendance by student.</p><button class="btn btn-secondary" data-manage="attendance">View attendance</button></div><div class="management-tile"><h4>Fee records</h4><p>Review fee summaries for sample accounts.</p><button class="btn btn-secondary" data-manage="fees">View fee records</button></div><div class="management-tile"><h4>Exam schedules</h4><p>Review the sample exam timetable.</p><button class="btn btn-secondary" data-manage="exams">View schedule</button></div><div class="management-tile"><h4>Feedback submissions</h4><p>View feedback submitted in this browser.</p><button class="btn btn-secondary" data-manage="feedback">View feedback</button></div><div class="management-tile"><h4>Reset demo data</h4><p>Restore the sample data stored in this browser.</p><button class="btn btn-danger" id="resetDemoBtn">Reset demo</button></div></div>`;
}
function renderStaffRecords(type){
  if(type==="students"){
    showModal("Student directory",`<div class="table-wrap"><table><thead><tr><th>Name</th><th>Roll</th><th>Branch</th></tr></thead><tbody>${Object.values(data.users).map(u=>`<tr><td>${esc(u.name)}</td><td>${esc(u.roll)}</td><td>${esc(u.branch)}</td></tr>`).join("")}</tbody></table></div>`);
  } else if(type==="attendance"){ showModal("Attendance records",renderStaffAttendance()); }
  else if(type==="fees"){ showModal("Fee records",renderFees()); }
  else if(type==="exams"){ showModal("Exam schedule",renderExams()); }
  else if(type==="feedback"){ showModal("Feedback submissions",renderFeedback()); }
}
function renderPage(page){
  if(page==="management" && currentRole==="student") page="home";
  currentPage=page;
  const titles={home:"Dashboard",attendance:"Attendance",exams:"Exam cell",timetable:"Timetable",fees:"College fees",transport:"Transport details",feedback:"Faculty feedback",regulation:"Regulations & subjects",management:"Management"};
  $("#pageTitle").textContent=titles[page]||"Dashboard";
  $$(".nav-item[data-page]").forEach(b=>b.classList.toggle("active",b.dataset.page===page));
  const renderers={home:renderHome,attendance:renderAttendance,exams:renderExams,timetable:renderTimetable,fees:renderFees,transport:renderTransport,feedback:renderFeedback,regulation:renderRegulation,management:renderManagement};
  $("#pageContent").innerHTML=(renderers[page]||renderHome)();
  $("#sidebar").classList.remove("open");
  bindPageEvents();
}
function bindPageEvents(){
  $$("[data-go]").forEach(b=>b.addEventListener("click",()=>b.dataset.go==="subject"?showToast("Subject details can be connected to the official syllabus."):renderPage(b.dataset.go)));
  $("#feeBreakdownBtn")?.addEventListener("click",()=>showModal("Fee breakdown",`<div class="info-list"><div><small>Tuition / academic fee</small><strong>${money(Math.round(currentUser.totalFee*.75))}</strong></div><div><small>Other college fees</small><strong>${money(currentUser.totalFee-Math.round(currentUser.totalFee*.75))}</strong></div><div><small>Paid</small><strong>${money(currentUser.paidFee)}</strong></div><div><small>Balance</small><strong>${money(currentUser.totalFee-currentUser.paidFee)}</strong></div></div><p class="muted">Illustrative breakdown only; actual fee components must be supplied by the college.</p>`));
  $("#transportHelpBtn")?.addEventListener("click",()=>showModal("Transport office",`<p>Contact the college transport coordinator for official route timing, bus pass and payment queries.</p><p class="muted">Add the approved office phone number and email here before deployment.</p>`));
  $("#feedbackForm")?.addEventListener("submit",e=>{
    e.preventDefault();const [faculty,subject]=$("#feedbackFaculty").value.split("|");
    data.feedback.push({roll:currentUser.roll,faculty,subject,rating:Number($("#feedbackRating").value),comment:$("#feedbackComment").value.trim(),createdAt:new Date().toISOString()});
    saveData();showToast("Feedback saved in this browser.");renderPage("feedback");
  });
  $("#semesterSelect")?.addEventListener("change",e=>{$("#subjectsList").innerHTML=subjectCards(e.target.value);bindPageEvents();});
  $$("[data-manage]").forEach(b=>b.addEventListener("click",()=>renderStaffRecords(b.dataset.manage)));
  $("#resetDemoBtn")?.addEventListener("click",()=>{
    if(confirm("Reset all local demo data? This cannot be undone.")){localStorage.removeItem(STORAGE_KEY);data=loadData();showToast("Demo data reset.");renderPage("management");}
  });
}
$("#enterBtn").addEventListener("click",enterPortal);
$$("[data-auth-tab]").forEach(b=>b.addEventListener("click",()=>setAuthTab(b.dataset.authTab)));
$("#loginForm").addEventListener("submit",e=>{
  e.preventDefault();const id=$("#loginId").value.trim().toUpperCase();const password=$("#loginPassword").value;const role=$("#loginRole").value;
  let user=null;
  if(role==="student"){
    const u=studentByRoll(id);if(u&&u.password===password)user={...u};
  }else{
    const s=data.staff[id];if(s&&s.password===password&&s.role===role)user={...s,id};
  }
  if(!user){showToast("Login details not recognized. Check the demo credentials in README.md.");return;}
  startSession(user,role);
});
$("#registerForm").addEventListener("submit",e=>{
  e.preventDefault();const name=$("#regName").value.trim();const roll=$("#regRoll").value.trim().toUpperCase();const password=$("#regPassword").value;const semester=Number($("#regYear").value);
  if(!/^[A-Z0-9-]{5,20}$/.test(roll)){showToast("Use a valid roll number (5–20 letters/numbers).");return;}
  if(data.users[roll]||data.staff[roll]){showToast("This roll number is already registered.");return;}
  const branch=$("#regBranch").value;const year=Math.ceil(semester/2);
  const u={name,roll,branch,year,semester,college:"ABC Institute of Technology",section:"A",password,role:"student",transport:"Not assigned",route:"Contact transport office",transportFee:0,totalFee:0,paidFee:0};
  data.users[roll]=u;data.attendance[roll]=[];saveData();showToast("Demo account created. You can now sign in.");$("#loginId").value=roll;setAuthTab("login");
});
$("#signOutBtn").addEventListener("click",signOut);
$("#closeModal").addEventListener("click",closeModal);
$("#modal").addEventListener("click",e=>{if(e.target===$("#modal"))closeModal();});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal();});
$("#sideNav").addEventListener("click",e=>{const b=e.target.closest("[data-page]");if(b)renderPage(b.dataset.page);});
$("#menuBtn").addEventListener("click",()=>$("#sidebar").classList.toggle("open"));
document.addEventListener("click",e=>{if(e.target.matches("[data-go]")){} });
const sampleStudent = {
  name: "Rahul Kumar",
  rollNumber: "23CSE001",
  branch: "CSE",
  year: "2nd Year",
  semester: 3,

  marks: [
    { subject: "Data Structures", internal: 24, external: 62, total: 86 },
    { subject: "Database Management", internal: 22, external: 59, total: 81 },
    { subject: "Digital Electronics", internal: 21, external: 55, total: 76 },
    { subject: "Mathematics III", internal: 25, external: 64, total: 89 },
    { subject: "Operating Systems", internal: 23, external: 60, total: 83 }
  ],

  attendance: {
    totalClasses: 120,
    attended: 108,
    absent: 12
  },

  transport: {
    busNumber: "BUS-12",
    route: "Route 5 - Kukatpally to College",
    pickupPoint: "Kukatpally Bus Stop",
    pickupTime: "7:30 AM",
    dropTime: "4:30 PM",
    driverName: "Suresh Reddy",
    driverPhone: "9000000001",
    monthlyFee: 1800,
    status: "Active"
  }
};


/* ==========================================
   ATTENDANCE PAGE
   ========================================== */

function renderAttendance() {
  const a = sampleStudent.attendance;
  const percentage = Math.round(
    (a.attended / a.totalClasses) * 100
  );

  return `
    <div class="dashboard-grid">
      <div class="stat-card">
        <p>Total Classes</p>
        <h2>${a.totalClasses}</h2>
      </div>

      <div class="stat-card">
        <p>Classes Attended</p>
        <h2>${a.attended}</h2>
      </div>

      <div class="stat-card">
        <p>Classes Absent</p>
        <h2>${a.absent}</h2>
      </div>

      <div class="stat-card">
        <p>Attendance Percentage</p>
        <h2>${percentage}%</h2>
      </div>
    </div>

    <div class="content-card">
      <h3>Attendance Overview</h3>

      <div class="progress-track">
        <div class="progress-fill"
             style="width:${percentage}%"></div>
      </div>

      <p>${percentage}% attendance recorded</p>
      <p class="muted">
        Student: ${sampleStudent.name}
        | Roll No: ${sampleStudent.rollNumber}
      </p>
    </div>
  `;
}


/* ==========================================
   EXAM CELL / STUDENT MARKS PAGE
   ========================================== */

function renderExams() {
  const marks = sampleStudent.marks;

  const total = marks.reduce(
    (sum, item) => sum + item.total, 0
  );

  const maxMarks = marks.length * 100;
  const percentage = ((total / maxMarks) * 100).toFixed(1);

  return `
    <div class="dashboard-grid">
      <div class="stat-card">
        <p>Total Marks</p>
        <h2>${total}/${maxMarks}</h2>
      </div>

      <div class="stat-card">
        <p>Percentage</p>
        <h2>${percentage}%</h2>
      </div>

      <div class="stat-card">
        <p>Subjects</p>
        <h2>${marks.length}</h2>
      </div>
    </div>

    <div class="content-card">
      <h3>Semester ${sampleStudent.semester} Results</h3>

      <p class="muted">
        ${sampleStudent.name} · ${sampleStudent.rollNumber}
      </p>

      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Internal / 25</th>
              <th>External / 75</th>
              <th>Total / 100</th>
            </tr>
          </thead>

          <tbody>
            ${marks.map(item => `
              <tr>
                <td>${item.subject}</td>
                <td>${item.internal}</td>
                <td>${item.external}</td>
                <td><strong>${item.total}</strong></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>

      <h3>Overall Percentage: ${percentage}%</h3>
      <p class="muted">
        These are fictional marks for demonstration only.
      </p>
    </div>
  `;
}


/* ==========================================
   TRANSPORT DETAILS PAGE
   ========================================== */

function renderTransport() {
  const t = sampleStudent.transport;

  return `
    <div class="content-card transport-card">
      <div class="transport-header">
        <div>
          <p class="muted">STUDENT TRANSPORT</p>
          <h2>College Bus ${t.busNumber}</h2>
          <p>${t.route}</p>
        </div>

        <span class="status-badge">${t.status}</span>
      </div>

      <div class="dashboard-grid">
        <div class="stat-card">
          <p>Pickup Point</p>
          <h3>${t.pickupPoint}</h3>
        </div>

        <div class="stat-card">
          <p>Pickup Time</p>
          <h3>${t.pickupTime}</h3>
        </div>

        <div class="stat-card">
          <p>Return Time</p>
          <h3>${t.dropTime}</h3>
        </div>

        <div class="stat-card">
          <p>Monthly Fee</p>
          <h3>₹${t.monthlyFee.toLocaleString("en-IN")}</h3>
        </div>
      </div>

      <div class="transport-info">
        <h3>Driver Information</h3>

        <p><strong>Driver Name:</strong> ${t.driverName}</p>

        <p><strong>Contact:</strong>
          <a href="tel:${t.driverPhone}">
            ${t.driverPhone}
          </a>
        </p>

        <p><strong>Bus Number:</strong> ${t.busNumber}</p>

        <p><strong>Route:</strong> ${t.route}</p>
      </div>

      <p class="muted">
        Transport information is sample data and is not
        connected to a live GPS tracking system.
      </p>
    </div>
  `;
}


/* ==========================================
   OPTIONAL: PAGE RENDERING INTEGRATION
   ========================================== */

// Use this inside your existing page-rendering function.
// Example:
// pageContent.innerHTML = renderCampusPage("attendance");

function renderCampusPage(page) {
  switch (page) {
    case "attendance":
      return renderAttendance();

    case "exams":
      return renderExams();

    case "transport":
      return renderTransport();

    default:
      return `
        <div class="content-card">
          <h2>CampusConnect</h2>
          <p>Select Attendance, Exam Cell, or Transport
             from the sidebar.</p>
        </div>
      `;
  }
}
async function loadFees() {
  const message = document.getElementById("fees-message");
  const tbody = document.getElementById("fees-table-body");

  if (!message || !tbody) return;

  try {
    const response = await fetch("./data/fees.csv");
    if (!response.ok) throw new Error("Fees CSV not found");

    const csv = await response.text();
    const lines = csv.trim().split(/\r?\n/);
    const headers = lines[0].split(",").map(h => h.trim());

    const records = lines.slice(1).filter(Boolean).map(line => {
      const values = line.split(",").map(v => v.trim());
      return Object.fromEntries(
        headers.map((header, i) => [header, values[i] || ""])
      );
    });

    tbody.replaceChildren();

    records.forEach(record => {
      const row = document.createElement("tr");

      [
        record.semester,
        "₹" + record.totalFee,
        "₹" + record.amountPaid,
        "₹" + record.balance
      ].forEach(value => {
        const cell = document.createElement("td");
        cell.textContent = value;
        row.appendChild(cell);
      });

      tbody.appendChild(row);
    });

    message.textContent = `Loaded ${records.length} fee records.`;
  } catch (error) {
    message.textContent = error.message;
    console.error(error);
  }
}

loadFees();
