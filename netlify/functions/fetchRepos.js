const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const username = 'ungaul';
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

  try {
    const response = await fetch(`https://api.github.com/users/${username}/repos`, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`
      }
    });

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: 'Error fetching repos', message: response.statusText })
      };
    }

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error', message: error.message })
    };
  }
};
