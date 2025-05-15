const username = 'ungaul';
const backend = 'https://ungaul-github-io.onrender.com';

const reposContainer = document.getElementById('repos');
const fileContentContainer = document.getElementById('file-content');
const accountInfoContainer = document.getElementById('account-info');

function loadContributionGraph(username) {
    fetch(`https://ghchart.rshah.org/${username}`)
        .then(r => r.text())
        .then(svgContent => {
            const graphElement = document.querySelector('.contribution-graph');
            graphElement.innerHTML = svgContent;
            const svgElement = graphElement.querySelector('svg');
            if (svgElement) {
                svgElement.style.backgroundColor = '#f0f0f0';
                svgElement.style.borderRadius = '8px';
            }
        })
        .catch(() => {
            document.querySelector('.contribution-graph').innerHTML = '<p>Error loading graph.</p>';
        });
}

fetch(`${backend}/user`)
    .then(r => r.json())
    .then(userData => {
        accountInfoContainer.innerHTML = `
            <div class="profile-info">
                <img src="${userData.avatar_url}" alt="Avatar" class="profile-avatar">
                <div class="user-text">
                    <a href="https://github.com/${username}">${userData.name || userData.login}</a>
                    <p>${userData.bio || ""}</p>
                    <p>Followers: ${userData.followers} | Following: ${userData.following}</p>
                    <p>Public Repos: ${userData.public_repos}</p>
                </div>
            </div>
            <div class="contribution-graph"></div>
        `;
        loadContributionGraph(username);
    })
    .catch(() => {
        accountInfoContainer.innerHTML = `<p>Error retrieving user information.</p>`;
    });

function addFileToList(file, listElement, indent, repo, currentPath = '') {
    const li = document.createElement('li');
    li.style.paddingLeft = `${indent}px`;
    const filePath = currentPath ? `${currentPath}/${file.name}` : file.name;

    if (file.type === 'dir') {
        li.innerHTML = `
            <ion-icon name="folder-outline"></ion-icon>
            <p class="folder-toggle" style="display: inline-block; cursor: pointer;">${file.name}</p>
        `;
        listElement.appendChild(li);

        const subfileList = document.createElement('ul');
        subfileList.classList.add('subfile-list');
        subfileList.style.display = 'none';
        li.after(subfileList);

        li.addEventListener('click', function () {
            const folderIcon = li.querySelector('ion-icon');
            if (subfileList.style.display === 'none') {
                subfileList.style.display = 'block';
                folderIcon.setAttribute('name', 'folder-open-outline');

                if (subfileList.innerHTML === '') {
                    const url = `${backend}/contents?repo=${repo.name}&path=${encodeURIComponent(filePath)}`;
                    fetch(url)
                        .then(r => r.json())
                        .then(subfiles => {
                            subfiles.forEach(subfile => {
                                addFileToList(subfile, subfileList, indent + 20, repo, filePath);
                            });
                        })
                        .catch(console.error);
                }
            } else {
                subfileList.style.display = 'none';
                folderIcon.setAttribute('name', 'folder-outline');
            }
        });
    } else if (file.type === 'file') {
        li.innerHTML = `
            <ion-icon name="document-outline"></ion-icon>
            <p class="file-link" style="display: inline-block; cursor: pointer;">${file.name}</p>
        `;
        listElement.appendChild(li);

        li.addEventListener('click', function () {
            loadFile(file.download_url, file.name);
        });
    }
}

function processRepo(repo) {
    const repoDiv = document.createElement('div');
    repoDiv.classList.add('repo');

    const lastUpdated = new Date(repo.updated_at).toLocaleDateString();
    repoDiv.innerHTML = `
        <h2>
            <ion-icon name="chevron-forward-outline" class="chevron" id="chevron-${repo.name}" style="cursor: pointer;"></ion-icon>
            <a>${repo.name}</a>
        </h2>
        <div class="repo-details" id="details-${repo.name}" style="display: none;">
            <div class="repo-top">
                <div class="repo-text">
                    <p><strong>Last updated:</strong> ${lastUpdated}</p>
                    <p>${repo.description || ""}</p>
                    <p>⭐ ${repo.stargazers_count} | Forks: ${repo.forks_count}</p>
                </div>
                <div class="buttons">
                    <a href="${repo.html_url}" target="_blank">Open in GitHub</a>
                    <a href="${repo.html_url}/fork" target="_blank">Fork</a>
                    <a href="${repo.html_url}/stargazers" target="_blank">Star</a>
                </div>
            </div>
            <ul class="file-list" id="files-${repo.name}">Loading files...</ul>
        </div>
    `;

    reposContainer.appendChild(repoDiv);

    fetch(`${backend}/contents?repo=${repo.name}`)
        .then(r => r.json())
        .then(files => {
            const filesList = document.getElementById(`files-${repo.name}`);
            filesList.innerHTML = '';
            files.sort((a, b) => a.type === 'dir' ? -1 : b.type === 'dir' ? 1 : a.name.localeCompare(b.name));
            files.forEach(file => addFileToList(file, filesList, 20, repo, ''));
        });

    repoDiv.querySelector('h2').addEventListener('click', function () {
        const details = document.getElementById(`details-${repo.name}`);
        const chevron = document.getElementById(`chevron-${repo.name}`);
        details.style.display = details.style.display === 'none' ? 'block' : 'none';
        chevron.setAttribute('name', details.style.display === 'none' ? 'chevron-forward-outline' : 'chevron-down-outline');
    });
}

fetch(`${backend}/repos`)
    .then(r => r.json())
    .then(repos => {
        repos.forEach(repo => processRepo(repo));
    })
    .catch(() => {
        reposContainer.innerHTML = `<p>Error retrieving repositories.</p>`;
    });

function loadFile(fileUrl, fileName) {
    fetch(`${backend}/file?url=${encodeURIComponent(fileUrl)}&name=${encodeURIComponent(fileName)}`)
        .then(response => response.text())
        .then(data => {
            const fileExtension = fileName.split('.').pop();
            const language = Prism.languages[fileExtension] ? fileExtension : 'markup';

            fileContentContainer.innerHTML = `
                <div id="file-content-top">
                    <h3>${fileName}</h3>
                    <button id="close-btn"><ion-icon name="close-outline"></ion-icon></button>
                </div>
                <pre><code class="language-${language}">${Prism.highlight(data, Prism.languages[language], language)}</code></pre>
            `;
            fileContentContainer.classList.add('toggled');
            reposContainer.style.width = '50%';

            if (window.innerWidth < 1000) {
                document.body.style.overflow = 'hidden';
                document.getElementById('background-overlay').style.display = 'block';
            }

            document.getElementById('close-btn').addEventListener('click', function () {
                fileContentContainer.classList.remove('toggled');
                reposContainer.style.width = '100%';
                document.body.style.overflow = '';
                document.getElementById('background-overlay').style.display = 'none';

                setTimeout(() => { fileContentContainer.innerHTML = ''; }, 500);
            });
        });
}
