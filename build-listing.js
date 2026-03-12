// filename: build-listing.js
// (c) 2026 BlankHtmlPage
// Style: Liquid Glassmorphism ("19-sandy") + Custom Media Player

const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = 'files.html';

const BLACKLIST = new Set([
    'node_modules', '.git', '.vercel', '.github', 'api',
    'package.json', 'package-lock.json', 'build-listing.js',
    '.gitignore', 'README.md', 'files.html', 'favicon.ico'
]);

const getIcon = (name, isDir) => {
    if (isDir) return 'fa-folder';
    const ext = path.extname(name).toLowerCase();
    const icons = {
        '.mp3': 'fa-file-audio', '.wav': 'fa-file-audio', '.mp4': 'fa-file-video', '.webm': 'fa-file-video',
        '.jpg': 'fa-file-image', '.jpeg': 'fa-file-image', '.png': 'fa-file-image', '.svg': 'fa-file-image',
        '.zip': 'fa-file-zipper', '.rar': 'fa-file-zipper', '.7z': 'fa-file-zipper',
        '.pdf': 'fa-file-pdf', '.txt': 'fa-file-lines', '.doc': 'fa-file-word', '.docx': 'fa-file-word',
        '.js': 'fa-file-code', '.html': 'fa-file-code', '.css': 'fa-file-code', '.json': 'fa-file-code'
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
                
                // Проверяем, является ли файл медиа, чтобы открыть его в кастомном плеере
                const isVideo = ['mp4', 'webm', 'mkv', 'mov', 'avi'].includes(ext);
                const isAudio = ['mp3', 'wav', 'flac', 'ogg', 'm4a'].includes(ext);
                
                if (isVideo || isAudio) {
                    const mediaType = isVideo ? 'video' : 'audio';
                    html += `
                    <li class="file" data-name="${item.name.toLowerCase()}" data-path="${rootRelativePath.toLowerCase()}" data-type="${ext}">
                        <a href="#" onclick="openPlayer('/${webPath}', '${mediaType}', '${item.name.replace(/'/g, "\\'")}'); return false;" class="item-row file-link">
                            <span class="icon"><i class="fas ${icon}"></i></span>
                            <span class="name"><span>${item.name}</span></span>
                            <span class="action"><i class="fas fa-play"></i></span>
                        </a>
                    </li>`;
                } else {
                    html += `
                    <li class="file" data-name="${item.name.toLowerCase()}" data-path="${rootRelativePath.toLowerCase()}" data-type="${ext}">
                        <a href="/${webPath}" target="_blank" class="item-row file-link">
                            <span class="icon"><i class="fas ${icon}"></i></span>
                            <span class="name"><span>${item.name}</span></span>
                            <span class="action"><i class="fas fa-external-link-alt"></i></span>
                        </a>
                    </li>`;
                }
            }
        }
    } catch (e) { console.error(e.message); }
    html += '</ul>';
    return html;
}

const generateHTML = (content) => `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Files</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-base: #749CF9;
            --accent: #FDE047;
            --accent-secondary: #38BDF8;
            --glass-dark: rgba(255, 255, 255, 0.12);
            --glass-light: rgba(255, 255, 255, 0.25);
            --glass-border: rgba(255, 255, 255, 0.2);
        }

        body {
            margin: 0; padding: 0;
            background-color: var(--bg-base);
            background-image: radial-gradient(circle at 5% 5%, rgba(253, 224, 71, 0.1), transparent 30%);
            background-attachment: fixed;
            font-family: 'Outfit', sans-serif; color: white;
            min-height: 100vh; overflow-x: hidden;
        }

        .container { max-width: 900px; margin: 3rem auto; padding: 0 15px; }

        /* --- ПОИСК --- */
        .search-wrapper { 
            display: flex; gap: 0; align-items: center; margin-bottom: 1rem;
            background: rgba(255, 255, 255, 0.07);
            backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px);
            border-radius: 35px; border: 1px solid var(--glass-border);
            padding: 4px; transition: 0.3s;
        }
        .search-wrapper:focus-within {
            border-color: var(--accent); background: rgba(255, 255, 255, 0.12);
        }

        .filter-btn {
            width: 48px; height: 48px; flex-shrink: 0;
            background: transparent; border: none; border-radius: 50%;
            cursor: pointer; display: flex; align-items: center; justify-content: center;
            color: rgba(255, 255, 255, 0.5); font-size: 1.1rem; transition: 0.3s;
            outline: none; -webkit-tap-highlight-color: transparent; user-select: none;
        }
        .filter-btn:hover { color: var(--accent); background: rgba(255,255,255,0.1); }
        .filter-btn:focus { outline: none; }

        .search-input {
            flex: 1; padding: 12px 20px 12px 10px;
            background: transparent; border: none; color: white; outline: none;
            font-size: 1rem;
        }
        .search-input:focus { outline: none; }

        /* --- ПАНЕЛЬ ФИЛЬТРОВ --- */
        .filter-panel {
            max-height: 0; overflow: hidden; opacity: 0;
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px); border-radius: 20px;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            border: 0 solid var(--glass-border); margin-bottom: 0;
        }
        .filter-panel.show {
            max-height: 200px; opacity: 1; padding: 15px; margin-bottom: 1.5rem; border-width: 1px;
        }

        .filter-tags { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }
        .tag {
            padding: 6px 14px; border-radius: 20px; background: rgba(255,255,255,0.1);
            font-size: 0.8rem; cursor: pointer; transition: 0.2s; border: 1px solid transparent;
            outline: none; -webkit-tap-highlight-color: transparent;
        }
        .tag.active { background: var(--accent); color: #000; font-weight: 600; }

        /* --- СПИСОК ФАЙЛОВ --- */
        .glass-panel {
            background: var(--glass-dark); backdrop-filter: blur(20px);
            border-radius: 30px; border: 1px solid var(--glass-border);
            box-shadow: 0 25px 50px rgba(0,0,0,0.1); padding: 10px 0;
        }

        .item-row {
            display: flex; align-items: center; padding: 0.8rem 1.4rem;
            margin: 4px 10px; border-radius: 15px; text-decoration: none; 
            color: white; transition: 0.2s; min-width: 0;
            -webkit-tap-highlight-color: transparent;
        }
        .item-row:hover { background: var(--glass-light); }
        .icon { width: 26px; margin-right: 12px; color: var(--accent); flex-shrink: 0; }
        .name { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 300; }
        .action { font-size: 0.8rem; opacity: 0; transition: 0.2s; color: var(--accent-secondary); }
        .item-row:hover .action { opacity: 1; }
        
        .file-tree { list-style: none; padding: 0; margin: 0; }
        .file-tree ul { list-style: none; padding-left: 20px; display: none; border-left: 1px solid rgba(255,255,255,0.1); margin-left: 15px; }
        .folder.open > ul { display: block; }
        .arrow { flex-shrink: 0; transition: 0.3s; opacity: 0.4; font-size: 0.7rem; }
        .folder.open > .item-row .arrow { transform: rotate(90deg); opacity: 1; color: var(--accent); }

        footer { text-align: center; padding: 3rem; opacity: 0.4; font-size: 0.8rem; }

        /* --- GLASS PLAYER MODAL --- */
        .modal-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(15px);
            display: flex; justify-content: center; align-items: center;
            z-index: 1000; opacity: 0; pointer-events: none; transition: 0.3s ease;
        }
        .modal-overlay.active { opacity: 1; pointer-events: auto; }
        
        .player-box {
            background: var(--glass-dark); border: 1px solid var(--glass-border);
            border-radius: 30px; padding: 20px; width: 90%; max-width: 700px;
            box-shadow: 0 30px 60px rgba(0,0,0,0.5);
            transform: scale(0.95); transition: 0.3s ease;
            display: flex; flex-direction: column; gap: 15px;
        }
        .modal-overlay.active .player-box { transform: scale(1); }

        .player-header { display: flex; justify-content: space-between; align-items: center; }
        .player-title { font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-right: 15px; color: var(--accent); }
        .close-btn { 
            background: none; border: none; color: white; cursor: pointer; font-size: 1.2rem;
            width: 35px; height: 35px; border-radius: 50%; background: rgba(255,255,255,0.1);
            transition: 0.2s; display: flex; align-items: center; justify-content: center;
        }
        .close-btn:hover { background: rgba(255, 100, 100, 0.8); }

        .media-container { width: 100%; border-radius: 15px; overflow: hidden; background: rgba(0,0,0,0.3); display: none; }
        .media-container.show { display: block; }
        video { width: 100%; display: block; max-height: 50vh; outline: none; }

        .custom-controls {
            display: flex; align-items: center; gap: 15px;
            background: rgba(255,255,255,0.08); padding: 12px 20px; border-radius: 20px;
        }
        .play-pause-btn {
            background: var(--accent); color: #000; border: none; border-radius: 50%;
            width: 45px; height: 45px; cursor: pointer; display: flex; align-items: center; justify-content: center;
            font-size: 1.1rem; transition: 0.2s; box-shadow: 0 4px 15px rgba(253, 224, 71, 0.3);
        }
        .play-pause-btn:hover { transform: scale(1.05); }
        
        .progress-area { flex: 1; height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; cursor: pointer; position: relative; }
        .progress-bar { height: 100%; background: var(--accent-secondary); border-radius: 4px; width: 0%; pointer-events: none; transition: width 0.1s linear; }
        .time-box { font-size: 0.85rem; opacity: 0.8; font-family: monospace; min-width: 90px; text-align: right; }
    </style>
</head>
<body>
    <div class="container">
        
        <div class="search-wrapper">
            <button class="filter-btn" onclick="toggleFilterPanel()" title="Фильтры">
                <i class="fas fa-sliders-h"></i>
            </button>
            <input type="text" id="fileSearch" class="search-input" placeholder="Искать файлы или папки..." onkeyup="runFilters()">
        </div>

        <div class="filter-panel" id="filterPanel">
            <div class="filter-tags">
                <div class="tag active" onclick="toggleTag(this, 'all')">Все</div>
                <div class="tag" onclick="toggleTag(this, 'media')">Медиа</div>
                <div class="tag" onclick="toggleTag(this, 'docs')">Документы</div>
                <div class="tag" onclick="toggleTag(this, 'code')">Код</div>
                <div class="tag" onclick="toggleTag(this, 'dir')">Папки</div>
            </div>
        </div>

        <div class="glass-panel">
            ${content}
        </div>
    </div>

    <div class="modal-overlay" id="playerModal" onclick="closePlayer(event)">
        <div class="player-box" onclick="event.stopPropagation()">
            <div class="player-header">
                <div class="player-title" id="playerTitle">Media.mp4</div>
                <button class="close-btn" onclick="closePlayer(true)"><i class="fas fa-times"></i></button>
            </div>
            
            <div class="media-container" id="videoContainer">
                <video id="glassVideo" preload="metadata"></video>
            </div>
            
            <audio id="glassAudio" preload="metadata"></audio>

            <div class="custom-controls">
                <button class="play-pause-btn" id="playBtn" onclick="togglePlay()">
                    <i class="fas fa-play"></i>
                </button>
                <div class="progress-area" id="progressArea" onclick="seekMedia(event)">
                    <div class="progress-bar" id="progressBar"></div>
                </div>
                <div class="time-box" id="timeBox">0:00 / 0:00</div>
            </div>
        </div>
    </div>

    <footer>
        &copy; 2026 Plotko Mark &bull; Liquid Glass Index
    </footer>

    <script>
        // --- Логика файлов и поиска ---
        function toggleFilterPanel() { document.getElementById('filterPanel').classList.toggle('show'); }
        function toggleFolder(element) { element.parentElement.classList.toggle('open'); }
        
        let activeFilter = 'all';
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
                media: ['mp3', 'mp4', 'wav', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'webm', 'ico'],
                docs: ['pdf', 'txt', 'doc', 'docx', 'zip', 'rar', '7z'],
                code: ['js', 'html', 'css', 'json', 'py', 'ts']
            };

            items.forEach(item => {
                const name = item.getAttribute('data-name');
                const path = item.getAttribute('data-path');
                const type = item.getAttribute('data-type');
                const matchesQuery = name.includes(query) || path.includes(query);
                let matchesTag = (activeFilter === 'all') || (activeFilter === 'dir' && type === 'dir') || (groups[activeFilter] && groups[activeFilter].includes(type));

                if (matchesQuery && matchesTag) {
                    item.style.display = "";
                    if (query.length > 0) {
                        let p = item.parentElement.closest('.folder');
                        while(p) { p.classList.add('open'); p.style.display = ""; p = p.parentElement.closest('.folder'); }
                    }
                } else { item.style.display = "none"; }
            });
        }

        // --- Логика Кастомного Плеера ---
        let currentMediaElement = null;
        const vPlayer = document.getElementById('glassVideo');
        const aPlayer = document.getElementById('glassAudio');
        const playBtn = document.getElementById('playBtn');
        const progress = document.getElementById('progressBar');
        const timeBox = document.getElementById('timeBox');

        function openPlayer(url, type, name) {
            document.getElementById('playerTitle').innerText = name;
            document.getElementById('videoContainer').classList.remove('show');
            
            // Сбрасываем старые ресурсы
            vPlayer.pause(); vPlayer.src = "";
            aPlayer.pause(); aPlayer.src = "";

            if (type === 'video') {
                currentMediaElement = vPlayer;
                document.getElementById('videoContainer').classList.add('show');
            } else {
                currentMediaElement = aPlayer;
            }

            currentMediaElement.src = url;
            
            // Привязка событий
            currentMediaElement.ontimeupdate = updateProgress;
            currentMediaElement.onended = () => { playBtn.innerHTML = '<i class="fas fa-play"></i>'; };
            currentMediaElement.onloadedmetadata = updateProgress;

            document.getElementById('playerModal').classList.add('active');
            togglePlay(true); // Автостарт
        }

        function closePlayer(force) {
            if (force === true || force.target === document.getElementById('playerModal')) {
                document.getElementById('playerModal').classList.remove('active');
                if (currentMediaElement) {
                    currentMediaElement.pause();
                }
            }
        }

        function togglePlay(forcePlay) {
            if (!currentMediaElement) return;
            if (currentMediaElement.paused || forcePlay === true) {
                currentMediaElement.play();
                playBtn.innerHTML = '<i class="fas fa-pause"></i>';
            } else {
                currentMediaElement.pause();
                playBtn.innerHTML = '<i class="fas fa-play"></i>';
            }
        }

        function updateProgress() {
            if (!currentMediaElement) return;
            const cur = currentMediaElement.currentTime || 0;
            const dur = currentMediaElement.duration || 0;
            const pct = dur > 0 ? (cur / dur) * 100 : 0;
            
            progress.style.width = pct + '%';
            timeBox.innerText = formatTime(cur) + ' / ' + formatTime(dur);
        }

        function seekMedia(e) {
            if (!currentMediaElement || !currentMediaElement.duration) return;
            const area = document.getElementById('progressArea');
            const rect = area.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            currentMediaElement.currentTime = pos * currentMediaElement.duration;
        }

        function formatTime(sec) {
            if (isNaN(sec)) return "0:00";
            const m = Math.floor(sec / 60);
            const s = Math.floor(sec % 60);
            return m + ':' + (s < 10 ? '0' : '') + s;
        }
    </script>
</body>
</html>
`;

const treeContent = scan('.');
fs.writeFileSync(OUTPUT_FILE, generateHTML(treeContent));
console.log(`✅ Листинг успешно создан в ${OUTPUT_FILE}`);
