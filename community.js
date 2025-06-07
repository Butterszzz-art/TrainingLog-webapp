// Groups array and localStorage handling
let groups = [];
if (typeof localStorage !== 'undefined') {
  groups = JSON.parse(localStorage.getItem('communityGroups')) || [];
}

function saveGroups() {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('communityGroups', JSON.stringify(groups));
  }
}

// Async createGroup to call backend or fallback to local
async function createGroup(name) {
  if (!name) return null;
  if (typeof fetch !== 'undefined' && window && window.currentUser) {
    try {
      const res = await fetch('/community/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, creatorId: window.currentUser })
      });
      const g = await res.json();
      groups.push(g);
      saveGroups();
      return g;
    } catch (e) {
      console.warn('createGroup failed', e);
    }
  }
  // fallback local group creation
  const g = { id: Date.now(), name, members: [], posts: [] };
  groups.push(g);
  saveGroups();
  return g;
}

function getGroups() {
  return groups;
}

async function fetchGroups(userId) {
  if (!userId || typeof fetch === 'undefined') return getGroups();
  try {
    const res = await fetch(`/community/groups?userId=${encodeURIComponent(userId)}`);
    if (res.ok) {
      groups = await res.json();
      saveGroups();
    }
  } catch (e) {
    console.warn('fetchGroups failed', e);
  }
  return groups;
}

function loadGroups() {
  return fetchGroups(window.currentUser).then(renderGroups);
}

// Add post locally and via backend
async function addPost(groupId, user, text) {
  const g = groups.find(gr => gr.id === groupId);
  if (!g) return;
  if (typeof fetch !== 'undefined') {
    try {
      await fetch(`/community/groups/${groupId}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user, text })
      });
    } catch (e) {
      console.warn('addPost failed', e);
    }
  }
  g.posts.push({ user, text, date: new Date().toISOString() });
  saveGroups();
}

async function fetchPosts(groupId) {
  try {
    const res = await fetch(`/community/groups/${groupId}/posts`);
    if (res.ok) {
      const posts = await res.json();
      const g = groups.find(gr => gr.id === groupId);
      if (g) {
        g.posts = posts;
        saveGroups();
      }
      return posts;
    }
  } catch (e) {
    console.warn('fetchPosts failed', e);
  }
  const g = groups.find(gr => gr.id === groupId);
  return (g && g.posts) || [];
}

async function shareProgram(groupId, programData) {
  if (typeof fetch === 'undefined' || !window.currentUser) return;
  try {
    await fetch(`/community/groups/${groupId}/share`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senderId: window.currentUser, programData })
    });
  } catch (e) {
    console.warn('shareProgram failed', e);
  }
}

async function fetchProgress(groupId) {
  try {
    const res = await fetch(`/community/groups/${groupId}/progress`);
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('fetchProgress failed', e);
  }
  return null;
}

function calculateLeaderboard(members) {
  if (!Array.isArray(members)) return { consistent: [], improving: [] };
  const byConsistent = [...members].sort((a,b) => (b.consistencyScore||0) - (a.consistencyScore||0));
  const byImprove = [...members].sort((a,b) => (b.improvementScore||0) - (a.improvementScore||0));
  return {
    consistent: byConsistent.slice(0,3).map(m => m.name),
    improving: byImprove.slice(0,3).map(m => m.name)
  };
}

function renderGroups(list) {
  const container = document.getElementById('groupList');
  if (!container) return;
  container.innerHTML = '';
  list.forEach(g => {
    const div = document.createElement('div');
    div.textContent = g.name;
    div.className = 'group-item';
    div.onclick = () => openGroup(g.id);
    container.appendChild(div);
  });
}

async function openGroup(id) {
  const group = groups.find(gr => gr.id === id);
  if (!group) return;
  const detail = document.getElementById('groupDetail');
  if (!detail) return;
  detail.style.display = 'block';
  await fetchPosts(id);
  const postsHtml = (group.posts || [])
    .sort((a,b) => new Date(a.date)-new Date(b.date))
    .map(p => `<div><strong>${p.user}</strong>: ${p.text} <small>${new Date(p.date).toLocaleString()}</small></div>`)
    .join('');
  detail.innerHTML = `
    <h3>${group.name}</h3>
    <div id="groupPosts">${postsHtml}</div>
    <textarea id="newPostText"></textarea>
    <button onclick="addPostToGroup(${id}, window.currentUser, document.getElementById('newPostText').value)">Post</button>
    <h4>Share Program</h4>
    <textarea id="shareProgramData"></textarea>
    <button onclick="shareProgramToGroup(${id}, document.getElementById('shareProgramData').value)">Share</button>
    <button onclick="loadGroupStats(${id})">Load Progress</button>
    <div id="groupProgress"></div>
  `;
}

async function loadGroupStats(id) {
  const data = await fetchProgress(id);
  const div = document.getElementById('groupProgress');
  if (!div || !data) return;
  const rows = (data.members || [])
    .map(m => `<tr><td>${m.userId}</td><td>${m.volume||0}</td><td>${m.reps||0}</td></tr>`) 
    .join('');
  const lb = data.leaderboard;
  div.innerHTML = `
    <table><tr><th>User</th><th>Volume</th><th>Reps</th></tr>${rows}</table>
    <p>Most Consistent: ${lb.consistent.join(', ')}</p>
    <p>Most Improving: ${lb.improving.join(', ')}</p>`;
}

function showCreateGroup() {
  const name = prompt('Group name?');
  if (!name) return;
  createGroup(name).then(() => renderGroups(groups));
}

window.loadGroups = loadGroups;
window.showCreateGroup = showCreateGroup;
