export default async function handler(req, res) {
    const { path } = req.query;
    const token = process.env.GITHUB_TOKEN;

    try {
        const response = await fetch(`https://api.github.com${path}`, {
            headers: {
                Authorization: `token ${token}`,
                Accept: 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
