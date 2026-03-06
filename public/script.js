const username = localStorage.getItem("username");

// Auth Guard: Agar user login nahi hai toh index page block karo
if (!username && !window.location.pathname.includes("login") && !window.location.pathname.includes("register")) {
    window.location.href = "login.html";
}

// 1. PASSWORD TOGGLE LOGIC
function togglePassword() {
    const p = document.getElementById("password");
    const icon = document.getElementById("eyeIcon");
    if (p.type === "password") {
        p.type = "text";
        icon.classList.replace("fa-eye", "fa-eye-slash");
    } else {
        p.type = "password";
        icon.classList.replace("fa-eye-slash", "fa-eye");
    }
}

// 2. REGISTER LOGIC (With User Exists Check)
async function register() {
    const u = document.getElementById("username").value;
    const p = document.getElementById("password").value;
    if (!u || !p) return alert("Bhai, Details fill karo!");

    const res = await fetch("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: u, password: p })
    });

    const data = await res.json();
    if (res.ok && data.success) {
        alert("Registration Successful! Ab login karein.");
        window.location.href = "login.html";
    } else {
        // Yeh line "User already exists" wala pop-up degi
        alert(data.message || "Registration Failed!");
    }
}

// 3. LOGIN LOGIC
async function login() {
    const u = document.getElementById("username").value;
    const p = document.getElementById("password").value;
    if (!u || !p) return alert("Username aur Password bhariye");

    const res = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: u, password: p })
    });

    const data = await res.json();
    if (data.success) {
        localStorage.setItem("username", u);
        window.location.href = "index.html";
    } else {
        alert("Login Failed! Details check karein.");
    }
}

// 4. TASK MANAGEMENT
async function loadTasks() {
    if (!document.getElementById("viewTitle")) return;
    const res = await fetch("/tasks?username=" + username);
    const tasks = await res.json();
    render(tasks, false);
}

async function showCompleted() {
    if (!document.getElementById("viewTitle")) return;
    document.getElementById("viewTitle").innerText = "Finished Tasks";
    const res = await fetch("/completed?username=" + username);
    const tasks = await res.json();
    render(tasks, true);
}

async function loadHistory() {
    const res = await fetch("/completed?username=" + username);
    const tasks = await res.json();
    const list = document.getElementById("historyList");
    const empty = document.getElementById("historyEmpty");
    if (!list) return;
    list.innerHTML = "";
    if (tasks.length === 0) {
        empty.style.display = "block";
    } else {
        empty.style.display = "none";
        tasks.forEach(t => {
            const div = document.createElement("div");
            div.className = "task";
            div.innerHTML = `<span>✔ ${t.task} <small style="display:block; color:#94a3b8;">${t.date} ${t.time || ""}</small></span>`;
            list.appendChild(div);
        });
    }
}

function render(tasks, done) {
    const list = document.getElementById("taskList");
    const empty = document.getElementById("emptyState");
    if(!list) return;
    list.innerHTML = "";
    if(empty) empty.style.display = tasks.length === 0 ? "block" : "none";

    tasks.forEach(t => {
        const div = document.createElement("div");
        div.className = "task";
        div.innerHTML = `
            <span>${done ? '✔ ' : ''}${t.task} <small style="display:block; color:#94a3b8">${t.date} ${t.time || ''}</small></span>
            <div>
                ${!done ? `<button class="btn-primary" onclick="completeTask('${t._id}')" style="width:auto; padding:5px 10px; margin-right:10px">Done</button>` : ''}
                <button class="btn-del" onclick="deleteTask('${t._id}')">Delete</button>
            </div>
        `;
        list.appendChild(div);
    });
}

async function addTask() {
    const taskInput = document.getElementById("taskInput");
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;
    if (!taskInput.value) return;
    await fetch("/task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, task: taskInput.value, date, time })
    });
    taskInput.value = "";
    loadTasks();
}

async function completeTask(id) {
    await fetch("/complete/" + id, { method: "PUT" });
    loadTasks();
}

async function deleteTask(id) {
    if(confirm("Delete karein?")) {
        await fetch("/delete/" + id, { method: "DELETE" });
        loadTasks();
    }
}

function logout() { localStorage.clear(); location.href = "login.html"; }

if (window.location.pathname.includes("index") || window.location.pathname === "/") {
    loadTasks();
}