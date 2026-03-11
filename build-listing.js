// filename: build-listing.js
// (c) 2026 BlankHtmlPage
// Style: Liquid Glassmorphism ("19-sandy")

const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = 'files.html';
const SITE_TITLE = 'Index of /';

const BLACKLIST = new Set([
    'node_modules', '.git', '.vercel', '.github', 'api',
    'package.json', 'package-lock.json', 'build-listing.js',
    '.gitignore', 'README.md', 'files.html'
]);

const getIcon = (name, isDir) => {
    if (isDir) return 'fa-folder';
    const ext = path.extname(name).toLowerCase();
    const icons = {
        '.mp3': 'fa-file-audio', '.wav': 'fa-file-audio', '.flac': 'fa-file-audio',
        '.mp4': 'fa-file-video', '.mkv': 'fa-file-video',
        '.jpg': 'fa-file-image', '.png': 'fa-file-image', '.svg': 'fa-file-image',
        '.zip': 'fa-file-zipper', '.rar': 'fa-file-zipper',
        '.pdf': 'fa-file-pdf', '.txt': 'fa-file-lines',
        '.js': 'fa-file-code', '.html': 'fa-file-code', '.css': 'fa-file-code'
    };
    return icons[ext] || 'fa-file';
};

function scan(dirPath, rootRelativePath = '') {
    let html = '<ul class="file-tree">';
    try {
        const items = fs.readdirSync(dirPath, { withFileTypes: true });
        items.sort((a, b) => {
            if (a.isDirectory() === b.isDirectory()) return a.name.localeCompare(b.name);
            return a.isDirectory() ? -1 : 1;
        });

        for (const item of items) {
            if (BLACKLIST.has(item.name) || item.name.startsWith('.')) continue;

            const relativePath = path.join(rootRelativePath, item.name);
            const fullPath = path.join(dirPath, item.name);
            const icon = getIcon(item.name, item.isDirectory());

            if (item.isDirectory()) {
                html += `
                <li class="folder" data-name="${item.name.toLowerCase()}">
                    <div class="item-row folder-trigger" onclick="toggleFolder(this)">
                        <span class="icon"><i class="fas ${icon}"></i></span>
                        <span class="name">${item.name}</span>
                        <span class="arrow"><i class="fas fa-chevron-right"></i></span>
                    </div>
                    ${scan(fullPath, relativePath)}
                </li>`;
            } else {
                const webPath = relativePath.split(path.sep).map(encodeURIComponent).join('/');
                html += `
                <li class="file" data-name="${item.name.toLowerCase()}">
                    <a href="/${webPath}" class="item-row file-link">
                        <span class="icon"><i class="fas ${icon}"></i></span>
                        <span class="name">${item.name}</span>
                        <span class="action"><i class="fas fa-external-link-alt"></i></span>
                    </a>
                </li>`;
            }
        }
    } catch (e) { console.error(e.message); }
    html += '</ul>';
    return html;
}

const generateHTML = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${SITE_TITLE}</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600&display=swap" rel="stylesheet">
    <style>
    :root {
        --bg-base: #749CF9;
        --accent: #FDE047;
        --accent-secondary: #38BDF8;
        --text-main: #FFFFFF;
        --text-muted: #BAE6FD;
        --glass-dark: rgba(255, 255, 255, 0.15);
        --glass-light: rgba(255, 255, 255, 0.45);
        --glass-border: rgba(255, 255, 255, 0.3);
        --shadow-base: rgba(0, 0, 0, 0.3);
    }
    
    body {
        margin: 0; padding: 0;
        font-family: 'Outfit', sans-serif;
        background-color: var(--bg-base);
        background-image: 
            radial-gradient(circle at 10% 10%, rgba(253, 224, 71, 0.2), transparent 40%),
            radial-gradient(circle at 90% 90%, rgba(56, 189, 248, 0.2), transparent 40%);
        background-attachment: fixed;
        color: var(--text-main);
        min-height: 100vh;
    }

    .container {
        max-width: 900px;
        margin: 4rem auto;
        padding: 0 20px;
    }

    /* Жидкий Текст (Заголовки) */
    h1 { 
        font-size: 2.5rem; 
        text-align: center;
        background: linear-gradient(135deg, var(--accent), var(--accent-secondary));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        backdrop-filter: blur(2px) url(#liquid);
        margin-bottom: 2rem;
        filter: drop-shadow(0 4px 10px var(--shadow-base));
    }

    /* Поле поиска в стиле Liquid Glass */
    .search-container {
        margin-bottom: 2rem;
        position: relative;
    }

    .search-input {
        width: 100%;
        padding: 15px 25px;
        background: var(--glass-light);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid var(--glass-border);
        border-radius: 50px;
        color: white;
        font-size: 1rem;
        outline: none;
        box-shadow: 0 10px 25px var(--shadow-base), inset 0 0 10px rgba(255,255,255,0.2);
        transition: all 0.3s ease;
        box-sizing: border-box;
    }

    .search-input:focus {
        background: rgba(255,255,255,0.55);
        border-color: var(--accent);
        box-shadow: 0 10px 30px rgba(253, 224, 71, 0.2);
    }

    .search-input::placeholder { color: rgba(255,255,255,0.7); }

    /* Основной корпус (Жидкий матовый контейнер) */
    .glass-panel {
        background: var(--glass-dark);
        backdrop-filter: blur(20px) url(#liquid);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid var(--glass-border);
        border-radius: 30px;
        box-shadow: 0 25px 50px var(--shadow-base), inset 0 0 20px rgba(255, 255, 255, 0.1);
        padding: 10px 0;
    }

    /* Внутренние ячейки */
    .item-row {
        display: flex; align-items: center;
        padding: 1rem 1.5rem;
        margin: 5px 10px;
        border-radius: 15px;
        text-decoration: none;
        color: var(--text-main);
        transition: all 0.3s ease;
        background: transparent;
    }

    .item-row:hover {
        background: var(--glass-light);
        backdrop-filter: blur(5px);
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }

    .icon { 
        width: 30px; 
        font-size: 1.2rem;
        margin-right: 1rem; 
        color: var(--accent);
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
    }
    
    .name { flex: 1; font-weight: 400; }
    
    .arrow, .action { color: var(--text-muted); font-size: 0.8rem; }

    .file-tree { list-style: none; padding: 0; margin: 0; }
    .file-tree ul { list-style: none; padding-left: 20px; display: none; }
    
    .folder.open > ul { display: block; animation: fadeIn 0.4s ease; }
    .folder.open > .item-row .arrow { transform: rotate(90deg); color: var(--accent); }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    footer { text-align: center; padding: 3rem; color: var(--text-muted); }
    </style>
</head>
<body>
    <svg style="position: absolute; width: 0; height: 0;">
        <filter id="liquid">
            <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="8" />
        </filter>
    </svg>

    <div class="container">
        <h1>${SITE_TITLE}</h1>
        
        <div class="search-container">
            <input type="text" id="fileSearch" class="search-input" placeholder="Search files and folders..." onkeyup="searchFiles()">
        </div>

        <div class="glass-panel">
            ${content}
        </div>
    </div>

    <footer>
        Coded by Plotko Mark &bull; Liquid Glass Style
    </footer>

    <script>
        function toggleFolder(element) {
            element.parentElement.classList.toggle('open');
        }

        function searchFiles() {
            const input = document.getElementById('fileSearch').value.toLowerCase();
            const items = document.querySelectorAll('.file, .folder');
            
            items.forEach(item => {
                const name = item.getAttribute('data-name');
                if (name.includes(input)) {
                    item.style.display = "";
                    // Если ищем внутри папки, раскрываем её
                    if (input.length > 0 && item.classList.contains('file')) {
                        let parent = item.parentElement.closest('.folder');
                        while(parent) {
                            parent.classList.add('open');
                            parent.style.display = "";
                            parent = parent.parentElement.closest('.folder');
                        }
                    }
                } else {
                    item.style.display = "none";
                }
            });
        }
    </script>
</body>
</html>
`;

console.log('🚀 Starting Scan...');
const treeContent = scan('.');
fs.writeFileSync(OUTPUT_FILE, generateHTML(treeContent));
console.log(`✅ Success: ${OUTPUT_FILE}`);
