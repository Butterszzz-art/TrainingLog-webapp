const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

const { calculateLeaderboard } = require('./community');

const groups = [];

app.get('/config', (req, res) => {
  res.json({
    airtableToken: process.env.AIRTABLE_TOKEN || 'patHs7yemB2TYuOOc.6ed847f094d08b1d30710f9f5763d909d1841a2e7dc63fbdac208133a39ae577',
    airtableBaseId: process.env.AIRTABLE_BASE_ID || 'appmjr4IgnEH72K1b'
  });
});

// Groups API
app.get('/community/groups', (req, res) => {
  const { userId } = req.query;
  if (userId) {
    const filtered = groups.filter(g => (g.members || []).includes(userId));
    return res.json(filtered);
  }
  res.json(groups);
});

app.post('/community/groups', (req, res) => {
  const { name, creatorId } = req.body;
  if (!name || !creatorId) {
    return res.status(400).json({ error: 'name and creatorId required' });
  }
  const group = {
    id: groups.length + 1,
    name,
    members: [creatorId],
    sharedPrograms: [],
    progress: {},
    posts: [],
    programId: null
  };
  groups.push(group);
  res.json(group);
});

// Posts
app.get('/community/groups/:groupId/posts', (req, res) => {
  const g = groups.find(gr => gr.id === Number(req.params.groupId));
  if (!g) return res.status(404).json({ error: 'group not found' });
  res.json(g.posts || []);
});

app.post('/community/groups/:groupId/posts', (req, res) => {
  const g = groups.find(gr => gr.id === Number(req.params.groupId));
  if (!g) return res.status(404).json({ error: 'group not found' });
  const { userId, text } = req.body;
  if (!userId || !text) return res.status(400).json({ error: 'userId and text required' });
  if (!Array.isArray(g.posts)) g.posts = [];
  g.posts.push({ userId: Number(userId), text, date: new Date().toISOString() });
  res.json({ ok: true });
});

// Program sharing API
app.post('/community/groups/:groupId/share', (req, res) => {
  const { groupId } = req.params;
  const g = groups.find(gr => gr.id === Number(groupId));
  if (!g) return res.status(404).json({ error: 'group not found' });
  const { senderId, programData } = req.body;
  if (!senderId || !programData) {
    return res.status(400).json({ error: 'senderId and programData required' });
  }
  g.sharedPrograms.push({ senderId, programData });
  res.json({ ok: true });
});

// Progress and leaderboard API
app.get('/community/groups/:groupId/progress', (req, res) => {
  const { groupId } = req.params;
  const g = groups.find(gr => gr.id === Number(groupId));
  if (!g) return res.status(404).json({ error: 'group not found' });
  const members = Object.entries(g.progress || {}).map(([id, data]) => ({
    userId: id,
    ...data
  }));
  const lb = calculateLeaderboard(members);
  res.json({ members, leaderboard: lb });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
