const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const GITHUB_USERNAME = 'ungaul';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const githubAPI = axios.create({
    baseURL: 'https://api.github.com',
    headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json'
    }
});

app.get('/user', async (req, res) => {
    try {
        const { data } = await githubAPI.get(`/users/${GITHUB_USERNAME}`);
        res.json(data);
    } catch {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

app.get('/repos', async (req, res) => {
    try {
        const { data } = await githubAPI.get(`/users/${GITHUB_USERNAME}/repos`);
        res.json(data);
    } catch {
        res.status(500).json({ error: 'Failed to fetch repos' });
    }
});

app.get('/contents', async (req, res) => {
    const { repo, path = '' } = req.query;
    if (!repo) return res.status(400).json({ error: 'Missing repo name' });

    try {
        const { data } = await githubAPI.get(`/repos/${GITHUB_USERNAME}/${repo}/contents/${path}`);
        res.json(data);
    } catch {
        res.status(500).json({ error: 'Failed to fetch contents' });
    }
});

app.get('/file', async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'Missing file URL' });

    try {
        const { data } = await axios.get(url);
        res.send(data);
    } catch {
        res.status(500).json({ error: 'Failed to fetch file' });
    }
});

app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
});
