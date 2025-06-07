// Community features (incomplete placeholder)

let groups = JSON.parse(localStorage.getItem('communityGroups')) || [];

function saveGroups() {
  localStorage.setItem('communityGroups', JSON.stringify(groups));
}

function createGroup(name) {
  if (!name) return null;
  const g = { id: Date.now(), name, members: [], posts: [] };
  groups.push(g);
  saveGroups();
  return g;
}

function getGroups() {
  return groups;
}

function addPost(groupId, user, text) {
  const g = groups.find(gr => gr.id === groupId);
  if (!g) return;
  g.posts.push({ user, text, date: new Date().toISOString() });
  saveGroups();
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

if (typeof module !== 'undefined') {
  module.exports = { calculateLeaderboard, createGroup, getGroups, addPost };
}
if (typeof window !== 'undefined') {
  window.createGroup = createGroup;
  window.loadGroups = () => renderGroups(getGroups());
  window.showCreateGroup = showCreateGroup;
  window.addPostToGroup = addPost;
}

function renderGroups(list) {
  const container = document.getElementById('groupList');
  if (!container) return;
  container.innerHTML = '';
  list.forEach(g => {
    const div = document.createElement('div');
    div.textContent = g.name;
    container.appendChild(div);
  });
}

function showCreateGroup() {
  const name = prompt('Group name?');
  if (!name) return;
  createGroup(name);
  renderGroups(groups);
}

