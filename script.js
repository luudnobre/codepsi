let currentUser = "";
let currentPatient = "";

function enterApp() {
  const username = document.getElementById("username").value.trim();
  if (username) {
    currentUser = username;
    document.getElementById("userName").innerText = currentUser;
    document.getElementById("loginScreen").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");
    loadPatients();
  }
}

function logout() {
  location.reload();
}

function addPatient() {
  const patientName = document.getElementById("newPatient").value.trim();
  if (!patientName) return;
  let patients = getPatients();
  if (!patients.includes(patientName)) {
    patients.push(patientName);
    savePatients(patients);
    renderPatientList();
    document.getElementById("newPatient").value = "";
  }
}

function getPatients() {
  return JSON.parse(localStorage.getItem(currentUser + "_patients") || "[]");
}

function savePatients(patients) {
  localStorage.setItem(currentUser + "_patients", JSON.stringify(patients));
}

function renderPatientList() {
  const list = document.getElementById("patientList");
  list.innerHTML = "";
  getPatients().forEach(name => {
    const li = document.createElement("li");
    li.textContent = name;
    li.onclick = () => openNotes(name);
    list.appendChild(li);
  });
}

function openNotes(name) {
  currentPatient = name;
  document.getElementById("notesSection").classList.remove("hidden");
  document.getElementById("selectedPatientName").innerText = "Paciente: " + name;
  const notesKey = `${currentUser}_notes_${name}`;
  const dateKey = `${currentUser}_dates_${name}`;
  const tagKey = `${currentUser}_tags_${name}`;
  document.getElementById("notesArea").value = localStorage.getItem(notesKey) || "";
  document.getElementById("tagsInput").value = localStorage.getItem(tagKey) || "";
  document.getElementById("sessionDate").value = "";
  const dates = JSON.parse(localStorage.getItem(dateKey) || "[]");
  document.getElementById("sessionHistory").innerHTML =
    "<strong>Sessões:</strong><br>" + dates.map(d => `🗓️ ${d}`).join("<br>");
}

function saveNotes() {
  const content = document.getElementById("notesArea").value;
  const sessionDate = document.getElementById("sessionDate").value;
  const tags = document.getElementById("tagsInput").value;
  const notesKey = `${currentUser}_notes_${currentPatient}`;
  const dateKey = `${currentUser}_dates_${currentPatient}`;
  const tagKey = `${currentUser}_tags_${currentPatient}`;
  localStorage.setItem(notesKey, content);
  if (tags) localStorage.setItem(tagKey, tags);
  if (sessionDate) {
    let dates = JSON.parse(localStorage.getItem(dateKey) || "[]");
    if (!dates.includes(sessionDate)) {
      dates.push(sessionDate);
      localStorage.setItem(dateKey, JSON.stringify(dates));
    }
  }
  alert("Anotações e sessão salvas!");
  openNotes(currentPatient);
  updateDashboard();
}

function loadPatients() {
  renderPatientList();
  updateDashboard();
}

function filterPatients() {
  const search = document.getElementById("searchPatient").value.toLowerCase();
  const items = document.querySelectorAll("#patientList li");
  items.forEach(item => {
    item.style.display = item.textContent.toLowerCase().includes(search) ? "" : "none";
  });
}

function toggleTheme() {
  document.body.classList.toggle("dark");
}

function updateDashboard() {
  const patients = getPatients();
  document.getElementById("countPatients").innerText = patients.length;
  let sessionCount = 0;
  let tagBank = [];
  patients.forEach(name => {
    const dateKey = `${currentUser}_dates_${name}`;
    const tagKey = `${currentUser}_tags_${name}`;
    const sessions = JSON.parse(localStorage.getItem(dateKey) || "[]");
    const tags = (localStorage.getItem(tagKey) || "").split(",").map(t => t.trim());
    sessionCount += sessions.length;
    tagBank.push(...tags);
  });
  document.getElementById("countSessions").innerText = sessionCount;
  const freq = {};
  tagBank.forEach(tag => {
    if (tag) freq[tag] = (freq[tag] || 0) + 1;
  });
  const sortedTags = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag, count]) => `${tag} (${count})`);
  document.getElementById("tagList").innerText = sortedTags.length ? sortedTags.join(", ") : "-";
}
