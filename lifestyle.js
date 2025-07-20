// Lifestyle section management

function initLifestyle() {
  const today = new Date().toISOString().slice(0,10);
  const dateInput = document.getElementById('scheduleDate');
  if (dateInput) {
    dateInput.value = today;
    dateInput.addEventListener('change', loadSchedule);
  }
  const ssFilter = document.getElementById('studySubjectFilter');
  const sdFilter = document.getElementById('studyDateFilter');
  if (ssFilter) ssFilter.addEventListener('change', loadStudySessions);
  if (sdFilter) sdFilter.addEventListener('change', loadStudySessions);
  const todoFilter = document.getElementById('todoCategoryFilter');
  if (todoFilter) todoFilter.addEventListener('input', loadTodos);
  const habitFilter = document.getElementById('habitCategoryFilter');
  if (habitFilter) habitFilter.addEventListener('input', loadHabits);
  const goalFilter = document.getElementById('goalCategoryFilter');
  if (goalFilter) goalFilter.addEventListener('input', loadGoals);
  document.querySelectorAll('#lifestyleNav button').forEach(btn => {
    btn.addEventListener('click', () => showLifestylePanel(btn.dataset.target));
  });
  loadSchedule();
  loadStudySessions();
  loadTodos();
  loadHabits();
  loadGoals();
}

function showLifestylePanel(id) {
  document.querySelectorAll('#lifestyleTab .panel').forEach(p => p.style.display='none');
  const el = document.getElementById(id);
  if (el) el.style.display='block';
}

// --- Daily Schedule ---
function loadSchedule() {
  const date = document.getElementById('scheduleDate').value;
  const data = JSON.parse(localStorage.getItem('schedule') || '{}');
  const list = document.getElementById('scheduleList');
  list.innerHTML = '';
  (data[date] || []).forEach((item, idx) => {
    const li = document.createElement('li');
    li.innerHTML = `<input type="checkbox" onchange="toggleScheduleItem(${idx})" ${item.done?'checked':''}> <span>${item.title}</span> <button class="icon-btn" onclick="deleteScheduleItem(${idx})">❌</button>`;
    list.appendChild(li);
  });
}

function addScheduleItem() {
  const title = prompt('Task or event');
  if (!title) return;
  const date = document.getElementById('scheduleDate').value;
  const data = JSON.parse(localStorage.getItem('schedule') || '{}');
  data[date] = data[date] || [];
  data[date].push({ title, done:false });
  localStorage.setItem('schedule', JSON.stringify(data));
  loadSchedule();
}

function toggleScheduleItem(idx) {
  const date = document.getElementById('scheduleDate').value;
  const data = JSON.parse(localStorage.getItem('schedule') || '{}');
  if (!data[date]) return;
  data[date][idx].done = !data[date][idx].done;
  localStorage.setItem('schedule', JSON.stringify(data));
  loadSchedule();
}

function deleteScheduleItem(idx) {
  const date = document.getElementById('scheduleDate').value;
  const data = JSON.parse(localStorage.getItem('schedule') || '{}');
  if (!data[date]) return;
  data[date].splice(idx,1);
  localStorage.setItem('schedule', JSON.stringify(data));
  loadSchedule();
}

// --- Study Sessions ---
function loadStudySessions() {
  const sessions = JSON.parse(localStorage.getItem('studySessions') || '[]');
  const subject = document.getElementById('studySubjectFilter').value;
  const date = document.getElementById('studyDateFilter').value;
  const list = document.getElementById('studyList');
  list.innerHTML = '';
  sessions.forEach((s, idx) => {
    if ((subject && s.subject !== subject) || (date && s.date !== date)) return;
    const li = document.createElement('li');
    li.textContent = `${s.date} - ${s.subject} (${s.duration} min)`;
    const del = document.createElement('button');
    del.textContent = '❌';
    del.className = 'icon-btn';
    del.onclick = () => deleteStudySession(idx);
    li.appendChild(del);
    list.appendChild(li);
  });
}

function addStudySession() {
  const subject = prompt('Subject');
  if (!subject) return;
  const duration = parseInt(prompt('Duration (min)'),10) || 0;
  const date = document.getElementById('studyDateFilter').value || new Date().toISOString().slice(0,10);
  const sessions = JSON.parse(localStorage.getItem('studySessions') || '[]');
  sessions.push({ date, subject, duration });
  localStorage.setItem('studySessions', JSON.stringify(sessions));
  loadStudySessions();
}

function deleteStudySession(idx) {
  const sessions = JSON.parse(localStorage.getItem('studySessions') || '[]');
  sessions.splice(idx,1);
  localStorage.setItem('studySessions', JSON.stringify(sessions));
  loadStudySessions();
}

// --- To-Do List ---
function loadTodos() {
  const todos = JSON.parse(localStorage.getItem('todos') || '[]');
  const cat = document.getElementById('todoCategoryFilter').value;
  const list = document.getElementById('todoList');
  list.innerHTML = '';
  todos.forEach((t, idx) => {
    if (cat && t.category !== cat) return;
    const li = document.createElement('li');
    li.innerHTML = `<input type="checkbox" onchange="toggleTodo(${idx})" ${t.done?'checked':''}> <span>${t.title}</span> <button class="icon-btn" onclick="deleteTodo(${idx})">❌</button>`;
    list.appendChild(li);
  });
}

function addTodo() {
  const title = prompt('Task');
  if (!title) return;
  const category = prompt('Category') || '';
  const todos = JSON.parse(localStorage.getItem('todos') || '[]');
  todos.push({ title, category, done:false });
  localStorage.setItem('todos', JSON.stringify(todos));
  loadTodos();
}

function toggleTodo(idx) {
  const todos = JSON.parse(localStorage.getItem('todos') || '[]');
  todos[idx].done = !todos[idx].done;
  localStorage.setItem('todos', JSON.stringify(todos));
  loadTodos();
}

function deleteTodo(idx) {
  const todos = JSON.parse(localStorage.getItem('todos') || '[]');
  todos.splice(idx,1);
  localStorage.setItem('todos', JSON.stringify(todos));
  loadTodos();
}

// --- Habits ---
function loadHabits() {
  const habits = JSON.parse(localStorage.getItem('habits') || '[]');
  const cat = document.getElementById('habitCategoryFilter').value;
  const list = document.getElementById('habitList');
  const today = new Date().toISOString().slice(0,10);
  list.innerHTML = '';
  habits.forEach((h, idx) => {
    if (cat && h.category !== cat) return;
    const done = h.history && h.history[today];
    const li = document.createElement('li');
    li.innerHTML = `<span>${h.name}</span> <input type="checkbox" onchange="toggleHabit(${idx})" ${done?'checked':''}> <button class="icon-btn" onclick="deleteHabit(${idx})">❌</button>`;
    list.appendChild(li);
  });
}

function addHabit() {
  const name = prompt('Habit name');
  if (!name) return;
  const category = prompt('Category') || '';
  const habits = JSON.parse(localStorage.getItem('habits') || '[]');
  habits.push({ name, category, history:{} });
  localStorage.setItem('habits', JSON.stringify(habits));
  loadHabits();
}

function toggleHabit(idx) {
  const habits = JSON.parse(localStorage.getItem('habits') || '[]');
  const today = new Date().toISOString().slice(0,10);
  const h = habits[idx];
  h.history = h.history || {};
  h.history[today] = !h.history[today];
  localStorage.setItem('habits', JSON.stringify(habits));
  loadHabits();
}

function deleteHabit(idx) {
  const habits = JSON.parse(localStorage.getItem('habits') || '[]');
  habits.splice(idx,1);
  localStorage.setItem('habits', JSON.stringify(habits));
  loadHabits();
}

// --- Goals ---
function loadGoals() {
  const goals = JSON.parse(localStorage.getItem('goals') || '[]');
  const cat = document.getElementById('goalCategoryFilter').value;
  const list = document.getElementById('goalList');
  list.innerHTML = '';
  goals.forEach((g, idx) => {
    if (cat && g.category !== cat) return;
    const li = document.createElement('li');
    li.innerHTML = `<span>${g.name}</span> <progress value="${g.progress}" max="100"></progress> <button class="icon-btn" onclick="updateGoal(${idx})">Edit</button> <button class="icon-btn" onclick="deleteGoal(${idx})">❌</button>`;
    list.appendChild(li);
  });
}

function addGoal() {
  const name = prompt('Goal');
  if (!name) return;
  const category = prompt('Category') || '';
  const progress = parseInt(prompt('Progress %'),10) || 0;
  const goals = JSON.parse(localStorage.getItem('goals') || '[]');
  goals.push({ name, category, progress });
  localStorage.setItem('goals', JSON.stringify(goals));
  loadGoals();
}

function updateGoal(idx) {
  const goals = JSON.parse(localStorage.getItem('goals') || '[]');
  const g = goals[idx];
  const progress = parseInt(prompt('Progress %', g.progress),10);
  if (!isNaN(progress)) {
    g.progress = progress;
    localStorage.setItem('goals', JSON.stringify(goals));
    loadGoals();
  }
}

function deleteGoal(idx) {
  const goals = JSON.parse(localStorage.getItem('goals') || '[]');
  goals.splice(idx,1);
  localStorage.setItem('goals', JSON.stringify(goals));
  loadGoals();
}

window.initLifestyle = initLifestyle;
window.addScheduleItem = addScheduleItem;
window.toggleScheduleItem = toggleScheduleItem;
window.deleteScheduleItem = deleteScheduleItem;
window.addStudySession = addStudySession;
window.deleteStudySession = deleteStudySession;
window.addTodo = addTodo;
window.toggleTodo = toggleTodo;
window.deleteTodo = deleteTodo;
window.addHabit = addHabit;
window.toggleHabit = toggleHabit;
window.deleteHabit = deleteHabit;
window.addGoal = addGoal;
window.updateGoal = updateGoal;
window.deleteGoal = deleteGoal;
