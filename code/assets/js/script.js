const username = 'ungaul';
const reposContainer = document.getElementById('repos');
const fileContentContainer = document.getElementById('file-content');
const accountInfoContainer = document.getElementById('account-info');
// const token = process.env.GITHUB_TOKEN;

// function authHeaders() {
//     return {
//         headers: {
//             'Authorization': `token ${token}`
//         }
//     };
// }

function authHeaders() {
    return {};
}

function loadContributionGraph(username) {
    fetch(`https://ghchart.rshah.org/${username}`)
        .then(response => response.text())
        .then(svgContent => {
            document.querySelector('.contribution-graph').innerHTML = svgContent;

            const svgElement = document.querySelector('.contribution-graph svg');
            if (svgElement) {
                svgElement.style.backgroundColor = '#f0f0f0';
                svgElement.style.borderRadius = '8px';
            }
        })
        .catch(error => {
            console.error('Erreur lors du chargement du graphique de contributions:', error);
            document.querySelector('.contribution-graph').innerHTML = '<p>Erreur lors du chargement du graphique.</p>';
        });
}

fetch(`https://api.github.com/users/${username}`, authHeaders())
    .then(response => response.json())
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
            <div class="contribution-graph">
                <iframe frameBorder="0" src="https://git-graph.vercel.app/embed/${username}?showColorLegend=true&showWeekdayLabels=false&showMonthLabels=true&showTotalCount=true&blockMargin=3&blockRadius=2&blockSize=9&fontSize=16&weekStart=4&year=2024"></iframe>
            
                </div>
        `;
    })
    .catch(error => {
        console.error('Erreur lors de la récupération des informations utilisateur:', error);
        accountInfoContainer.innerHTML = `<p>Erreur lors de la récupération des informations utilisateur.</p>`;
    });

fetch(`https://api.github.com/users/${username}/repos`, authHeaders())
    .then(response => response.json())
    .then(data => {
        data.forEach(repo => {
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
                            <div class="code-dropdown">
                                <button class="code-btn">
                                    <ion-icon name="code-slash-outline"></ion-icon>Code
                                </button>
                                <div class="code-options" style="display: none;">
                                    <p>Clone with HTTPS:</p>
                                    <div class="HTTPS">
                                        <pre>
                                            <code class="language-none">${repo.clone_url}</code>
                                            <ion-icon class="copy-icon" name="copy-outline" data-text="${repo.clone_url}"></ion-icon>
                                        </pre>
                                    </div>

                                    <p>Clone with SSH:</p>
                                    <div class="SSH">
                                        <pre>
                                            <code class="language-none">${repo.ssh_url}</code>
                                            <ion-icon class="copy-icon" name="copy-outline" data-text="${repo.ssh_url}"></ion-icon>
                                        </pre>
                                    </div>
                                    
                                    <a href="x-github-client://openRepo/${repo.html_url}" target="_blank">Open with GitHub Desktop</a>
                                    <a href="${repo.html_url}/archive/refs/heads/main.zip" target="_blank">Download ZIP</a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <ul class="file-list" id="files-${repo.name}">Loading files...</ul>
                </div>
            `;

            reposContainer.appendChild(repoDiv);

            fetch(repo.contents_url.replace('{+path}', ''), authHeaders())
                .then(response => response.json())
                .then(files => {
                    const filesList = document.getElementById(`files-${repo.name}`);
                    filesList.innerHTML = '';

                    files.sort((a, b) => {
                        if (a.type === 'dir' && b.type !== 'dir') {
                            return -1;
                        } else if (a.type !== 'dir' && b.type === 'dir') {
                            return 1;
                        } else {
                            return a.name.localeCompare(b.name);
                        }
                    });

                    files.forEach(file => {
                        const li = document.createElement('li');
                        if (file.type === 'dir') {
                            li.innerHTML = `<ion-icon name="folder-outline"></ion-icon> 
                                            <a href="#" class="folder-toggle">${file.name}</a>`;
                            filesList.appendChild(li);

                            const subfileList = document.createElement('ul');
                            subfileList.classList.add('subfile-list');
                            subfileList.style.display = 'none';
                            subfileList.style.paddingLeft = '20px';

                            li.after(subfileList);

                            li.addEventListener('click', function (event) {
                                event.preventDefault();
                                const folderIcon = li.querySelector('ion-icon');

                                if (subfileList.style.display === 'none') {
                                    subfileList.style.display = 'block';
                                    folderIcon.setAttribute('name', 'folder-open-outline');

                                    if (subfileList.innerHTML === '') {
                                        fetch(file.url, authHeaders())
                                            .then(response => response.json())
                                            .then(subfiles => {
                                                subfiles.forEach(subfile => {
                                                    addFileToList(subfile, subfileList, 20);
                                                });
                                            });
                                    }
                                } else {
                                    subfileList.style.display = 'none';
                                    folderIcon.setAttribute('name', 'folder-outline');
                                }
                            });
                        } else if (file.name.toLowerCase() === 'readme.md') {
                            li.innerHTML = `<ion-icon name="document-outline"></ion-icon> ${file.name}`;
                            li.addEventListener('click', function () {
                                loadReadme(file.url);
                            });
                            filesList.appendChild(li);
                        } else {
                            li.innerHTML = `<ion-icon name="document-outline"></ion-icon> ${file.name}`;
                            li.addEventListener('click', function () {
                                loadFile(file.url, file.name);
                            });
                            filesList.appendChild(li);
                        }
                    });
                })
                .catch(error => {
                    console.error('Erreur lors de la récupération des fichiers:', error);
                });

            repoDiv.querySelector('h2').addEventListener('click', function () {
                const details = document.getElementById(`details-${repo.name}`);
                const chevron = document.getElementById(`chevron-${repo.name}`);

                if (details.style.display === 'none') {
                    details.style.display = 'block';
                    chevron.setAttribute('name', 'chevron-down-outline');
                } else {
                    details.style.display = 'none';
                    chevron.setAttribute('name', 'chevron-forward-outline');
                }
            });

            const codeBtn = repoDiv.querySelector('.code-btn');
            const codeOptions = repoDiv.querySelector('.code-options');

            codeBtn.addEventListener('click', function () {
                if (codeOptions.style.display === 'none') {
                    codeOptions.style.display = 'flex';
                } else {
                    codeOptions.style.display = 'none';
                }
            });
        });
    })
    .catch(error => {
        reposContainer.innerHTML = `<p>Error while retrieving repositories.</p>`;
        console.error('Error:', error);
    });

function loadFile(fileUrl, fileName) {
    fetch(fileUrl, {
        headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3.raw'
        }
    })
        .then(response => response.text())
        .then(data => {
            let fileExtension = fileName.split('.').pop();
            let language = Prism.languages[fileExtension] ? fileExtension : 'markup';

            $('#file-content').html(`
                    <div id="file-content-top">
                        <h3>${fileName}</h3>
                        <button id="close-btn"><ion-icon name="close-outline"></ion-icon></button>
                    </div>
                    <pre><code class="language-${language}">${Prism.highlight(data, Prism.languages[language], language)}</code></pre>
                `);

            $('#file-content').addClass('toggled');
            $('#repos').css('width', '50%');

            if (window.innerWidth < 1000) {
                document.body.style.overflow = 'hidden';
                $('#background-overlay').show();
            }

            $('#close-btn').on('click', function () {
                $('#file-content').removeClass('toggled');
                $('#repos').css('width', '100%');

                document.body.style.overflow = '';
                $('#background-overlay').hide();

                setTimeout(() => {
                    $('#file-content').html('');
                }, 500);
            });
        })
        .catch(error => {
            $('#file-content').html('<p>Error downloading the file.</p>');
        });
}

function loadReadme(readmeUrl) {
    fetch(readmeUrl, {
        headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3.raw'
        }
    })
        .then(response => response.text())
        .then(markdown => {
            var converter = new showdown.Converter();
            var htmlContent = converter.makeHtml(markdown);

            $('#file-content').html(`
                    <div id="file-content-top">
                        <h3>README.md</h3>
                        <button id="close-btn"><ion-icon name="close-outline"></ion-icon></button>
                    </div>
                    <div class="readme-content">${htmlContent}</div>
                `);

            $('#file-content').addClass('toggled');
            $('#repos').css('width', '50%');

            if (window.innerWidth < 1000) {
                document.body.style.overflow = 'hidden';
                $('#background-overlay').show();
            }

            $('#close-btn').on('click', function () {
                $('#file-content').removeClass('toggled');
                $('#repos').css('width', '100%');

                document.body.style.overflow = '';
                $('#background-overlay').hide();

                setTimeout(() => {
                    $('#file-content').html('');
                }, 500);
            });
        })
        .catch(error => {
            $('#file-content').html('<p>Error downloading the README file.</p>');
        });
}

window.addEventListener('resize', function () {
    if ($('#file-content').hasClass('toggled')) {
        if (window.innerWidth < 1000) {
            document.body.style.overflow = 'hidden';
            $('#background-overlay').show();
        } else {
            document.body.style.overflow = '';
            $('#background-overlay').hide();
        }
    }
});

function addFileToList(file, listElement, indent) {
    const li = document.createElement('li');
    li.style.paddingLeft = `${indent}px`;

    if (file.type === 'dir') {
        li.innerHTML = `<ion-icon name="folder-outline"></ion-icon> 
                        <a href="#" class="folder-toggle">${file.name}</a>`;
        listElement.appendChild(li);

        const subfileList = document.createElement('ul');
        subfileList.classList.add('subfile-list');
        subfileList.style.display = 'none';
        subfileList.style.paddingLeft = '20px';

        li.after(subfileList);

        li.addEventListener('click', function (event) {
            event.preventDefault();
            const folderIcon = li.querySelector('ion-icon');

            if (subfileList.style.display === 'none') {
                subfileList.style.display = 'block';
                folderIcon.setAttribute('name', 'folder-open-outline');

                if (subfileList.innerHTML === '') {
                    fetch(file.url, authHeaders())
                        .then(response => response.json())
                        .then(subfiles => {
                            subfiles.forEach(subfile => {
                                addFileToList(subfile, subfileList, indent + 20);
                            });
                        });
                }
            } else {
                subfileList.style.display = 'none';
                folderIcon.setAttribute('name', 'folder-outline');
            }
        });
    } else {
        li.innerHTML = `<ion-icon name="document-outline"></ion-icon> 
                        <a href="#" onclick="loadFile('${file.url}', '${file.name}')">${file.name}</a>`;
        listElement.appendChild(li);
    }
}

$(document).ready(function () {
    $(document).on('click', '.copy-icon', function () {
        const textToCopy = $(this).data('text');
        const icon = $(this);
        navigator.clipboard.writeText(textToCopy).then(() => {
            icon.attr('name', 'checkmark-outline').css('color', 'green');
            setTimeout(function () {
                icon.attr('name', 'copy-outline').css('color', '');
            }, 2000);
        }).catch(err => {
            console.error('Error Copying :', err);
        });
    });
});