// filename: build-listing.js
// Style: Liquid Glassmorphism ("19-sandy") Optimized & Extended

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
            const ext = path.extname(item.name).toLowerCase().replace('.', '');

            if (item.isDirectory()) {
                html += `
                <li class="folder" data-name="${item.name.toLowerCase()}" data-path="${rootRelativePath.toLowerCase()}" data-type="dir">
                    <div class="item-row folder-trigger" onclick="toggleFolder(this)">
                        <span class="icon"><i class="fas ${icon}"></i></span>
                        <span class="name"><span>${item.name}</span></span>
                        <span class="arrow"><i class="fas fa-chevron-right"></i></span>
                    </div>
                    ${scan(fullPath, relativePath)}
                </li>`;
            } else {
                const webPath = relativePath.split(path.sep).map(encodeURIComponent).join('/');
                html += `
                <li class="file" data-name="${item.name.toLowerCase()}" data-path="${rootRelativePath.toLowerCase()}" data-type="${ext}">
                    <a href="/${webPath}" class="item-row file-link">
                        <span class="icon"><i class="fas ${icon}"></i></span>
                        <span class="name"><span>${item.name}</span></span>
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
        --glass-dark: rgba(255, 255, 255, 0.12);
        --glass-light: rgba(255, 255, 255, 0.25);
        --glass-border: rgba(255, 255, 255, 0.2);
    }
    
    body {
        margin: 0; background-color: var(--bg-base);
        background-image: radial-gradient(circle at 10% 10%, rgba(253, 224, 71, 0.15), transparent 40%);
        background-attachment: fixed;
        font-family: 'Outfit', sans-serif; color: white;
        min-height: 100vh; overflow-x: hidden;
    }

    .container { max-width: 900px; margin: 2rem auto; padding: 0 15px; }

    h1 { 
        text-align: center; font-size: 2.2rem;
        background: linear-gradient(135deg, var(--accent), var(--accent-secondary));
        -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
    }

    /* Строка поиска - Сделана прозрачнее */
    .search-section {
        background: rgba(255, 255, 255, 0.08);
        backdrop-filter: blur(15px);
        border-radius: 25px;
        padding: 20px;
        margin-bottom: 2rem;
        border: 1px solid var(--glass-border);
    }

    .search-input {
        width: 100%; padding: 12px 20px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid var(--glass-border);
        border-radius: 15px; color: white; outline: none;
        box-sizing: border-box; font-size: 1rem;
    }

    /* Фильтры */
    .filter-tags { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; }
    .tag {
        padding: 5px 12px; border-radius: 20px; background: rgba(255,255,255,0.1);
        font-size: 0.8rem; cursor: pointer; border: 1px solid transparent;
        transition: 0.2s;
    }
    .tag.active { background: var(--accent); color: #000; font-weight: 600; }

    /* Панель файлов - Оптимизирована для скролла */
    .glass-panel {
        background: var(--glass-dark);
        backdrop-filter: blur(20px); /* Убран url(#liquid) для скорости скролла */
        border-radius: 30px;
        border: 1px solid var(--glass-border);
        box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        will-change: transform; /* Подсказка браузеру для оптимизации */
    }

    .item-row {
        display: flex; align-items: center; padding: 0.8rem 1.2rem;
        margin: 4px 8px; border-radius: 12px;
        text-decoration: none; color: white; transition: background 0.2s;
        min-width: 0; /* Важно для сокращения текста */
    }

    .item-row:hover { background: var(--glass-light); }

    .icon { width: 24px; margin-right: 12px; color: var(--accent); flex-shrink: 0; }

    /* Исправление длинных названий */
    .name { 
        flex: 1; min-width: 0; white-space: nowrap; 
        overflow: hidden; text-overflow: ellipsis; 
        font-weight: 300; margin-right: 10px;
    }

    .file-tree { list-style: none; padding: 0; margin: 0; }
    .file-tree ul { list-style: none; padding-left: 18px; display: none; border-left: 1px solid rgba(255,255,255,0.1); }
    .folder.open > ul { display: block; }
    .arrow { flex-shrink: 0; transition: 0.3s; opacity: 0.5; }
    .folder.open > .item-row .arrow { transform: rotate(90deg); opacity: 1; color: var(--accent); }

    footer { text-align: center; padding: 2rem; opacity: 0.6; font-size: 0.8rem; }
    </style>
</head>
<body>
    <svg style="position: absolute; width: 0; height: 0;">
        <filter id="liquid">
            <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" />
        </filter>
    </svg>

    <div class="container">
        <h1 style="backdrop-filter: url(#liquid);">${SITE_TITLE}</h1>
        
        <div class="search-section">
            <input type="text" id="fileSearch" class="search-input" placeholder="Искать файлы, папки или расширения..." onkeyup="runFilters()">
            <div class="filter-tags" id="typeFilters">
                <div class="tag" onclick="toggleTag(this, 'all')">Все</div>
                <div class="tag" onclick="toggleTag(this, 'media')">Медиа</div>
                <div class="tag" onclick="toggleTag(this, 'docs')">Документы</div>
                <div class="tag" onclick="toggleTag(this, 'code')">Код</div>
                <div class="tag" onclick="toggleTag(this, 'dir')">Только папки</div>
            </div>
        </div>

        <div class="glass-panel" id="mainPanel">
            ${content}
        </div>
    </div>

    <script>
        let activeFilter = 'all';

        function toggleFolder(element) {
            element.parentElement.classList.toggle('open');
        }

        function toggleTag(el, filter) {
            document.querySelectorAll('.tag').forEach(t => t.classList.remove('active'));
            el.classList.add('active');
            activeFilter = filter;
            runFilters();
        }

        function runFilters() {
            const query = document.getElementById('fileSearch').value.toLowerCase();
            const items = document.querySelectorAll('li.file, li.folder');
            
            const groups = {
                media: ['mp3', 'mp4', 'wav', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'webm'],
                docs: ['pdf', 'txt', 'doc', 'docx', 'zip', 'rar', '7z'],
                code: ['js', 'html', 'css', 'json', 'py', 'cpp']
            };

            items.forEach(item => {
                const name = item.getAttribute('data-name');
                const path = item.getAttribute('data-path');
                const type = item.getAttribute('data-type');
                
                const matchesQuery = name.includes(query) || path.includes(query);
                let matchesTag = true;

                if (activeFilter !== 'all') {
                    if (activeFilter === 'dir') matchesTag = (type === 'dir');
                    else matchesTag = groups[activeFilter].includes(type);
                }

                if (matchesQuery && matchesTag) {
                    item.style.display = "";
                    if (query.length > 0) {
                        let p = item.parentElement.closest('.folder');
                        while(p) { p.classList.add('open'); p.style.display = ""; p = p.parentElement.closest('.folder'); }
                    }
                } else {
                    item.style.display = "none";
                }
            });
        }

        // Инициализация
        document.querySelector('.tag').classList.add('active');
    </script>
</body>
</html>
`;

const treeContent = scan('.');
fs.writeFileSync(OUTPUT_FILE, generateHTML(treeContent));
console.log('✅ Оптимизированный листинг готов!');