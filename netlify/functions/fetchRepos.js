import fetch from 'node-fetch';

exports.handler = async function(event, context) {
  const username = 'ungaul';
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

  const response = await fetch(`https://api.github.com/users/${username}/repos`, {
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`
    }
  });

  const data = await response.json();

  return {
    statusCode: 200,
    body: JSON.stringify(data)
  };
};
