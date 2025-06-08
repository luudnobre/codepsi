// script.js completo com todas as funções integradas e responsividade

// ============ LOGIN ============
const loginForm = document.getElementById("loginForm");
const loginScreen = document.getElementById("loginScreen");
const app = document.getElementById("app");

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;
  if (user && pass) {
    loginScreen.classList.add("hidden");
    app.classList.remove("hidden");
    loadPatients();
    applySavedTheme();
    renderChart();
  }
});

// ============ NAVEGAÇÃO ==========
function showSection(id) {
  document.querySelectorAll(".view-section").forEach((el) => el.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
  document.getElementById("sectionTitle").textContent =
    id === "dashboard" ? "Dashboard" : id === "patients" ? "Pacientes" : "Consultar";
}

// ============ TEMA ============
function toggleTheme() {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
}

function applySavedTheme() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") document.body.classList.add("dark");
}

// ============ PACIENTES ============
const form = document.getElementById("addPatientForm");
const list = document.getElementById("patientList");
const patientDetails = document.getElementById("patientDetails");
const selectedName = document.getElementById("selectedPatientName");
const selectedInfo = document.getElementById("selectedPatientInfo");
const qaList = document.getElementById("qaList");
let currentPatient = null;

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("patientName").value;
  const sexo = document.getElementById("patientSexo").value;
  const nascimento = document.getElementById("patientNascimento").value;
  const local = document.getElementById("patientLocal").value;
  const patient = { name, sexo, nascimento, local, qa: [] };
  savePatient(patient);
  form.reset();
  loadPatients();
});

function savePatient(patient) {
  const data = JSON.parse(localStorage.getItem("patients") || "[]");
  data.push(patient);
  localStorage.setItem("patients", JSON.stringify(data));
}

function loadPatients() {
  list.innerHTML = "";
  const data = JSON.parse(localStorage.getItem("patients") || "[]");
  data.forEach((p, index) => {
    const li = document.createElement("li");
    li.textContent = p.name;
    const del = document.createElement("button");
    del.textContent = "🗑️";
    del.style.fontSize = "0.8rem";
    del.onclick = (event) => {
      event.stopPropagation();
      data.splice(index, 1);
      localStorage.setItem("patients", JSON.stringify(data));
      loadPatients();
      patientDetails.classList.add("hidden");
    };
    li.onclick = () => selectPatient(index);
    li.appendChild(del);
    list.appendChild(li);
  });
}

function selectPatient(index) {
  const data = JSON.parse(localStorage.getItem("patients") || "[]");
  currentPatient = index;
  const p = data[index];
  selectedName.textContent = p.name;
  selectedInfo.textContent = `${p.sexo} • ${p.nascimento} • ${p.local}`;
  renderQA(p.qa);
  patientDetails.classList.remove("hidden");
}

// ============ Q&A ============
document.getElementById("questionForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const q = document.getElementById("questionInput").value;
  const a = document.getElementById("answerInput").value;
  const data = JSON.parse(localStorage.getItem("patients") || "[]");
  if (currentPatient !== null && q && a) {
    data[currentPatient].qa.push({ q, a });
    localStorage.setItem("patients", JSON.stringify(data));
    renderQA(data[currentPatient].qa);
    document.getElementById("questionForm").reset();
  }
});

function renderQA(qa) {
  qaList.innerHTML = "";
  qa.forEach((item, index) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${item.q}</strong><br/>${item.a}`;
    const del = document.createElement("button");
    del.textContent = "🗑️";
    del.style.marginLeft = "1rem";
    del.onclick = () => {
      qa.splice(index, 1);
      const data = JSON.parse(localStorage.getItem("patients") || "[]");
      data[currentPatient].qa = qa;
      localStorage.setItem("patients", JSON.stringify(data));
      renderQA(qa);
    };
    li.appendChild(del);
    qaList.appendChild(li);
  });
}

// ============ CONSULTAR ============
document.getElementById("searchInput").addEventListener("input", function () {
  const term = this.value.toLowerCase();
  const data = JSON.parse(localStorage.getItem("patients") || "[]");
  const results = data.filter((p) => p.name.toLowerCase().includes(term));
  const ul = document.getElementById("searchResults");
  ul.innerHTML = "";
  results.forEach((p) => {
    const li = document.createElement("li");
    li.textContent = `${p.name} • ${p.sexo} • ${p.local}`;
    ul.appendChild(li);
  });
});

// ============ DASHBOARD ============
function renderChart() {
  const data = JSON.parse(localStorage.getItem("patients") || "[]");
  const ctx = document.getElementById("sessionsChart").getContext("2d");
  const sessionCounts = data.map((p) => p.qa.length);
  const labels = data.map((p) => p.name);

  new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Sessões por paciente",
          data: sessionCounts,
          backgroundColor: "#4e5dff"
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}
