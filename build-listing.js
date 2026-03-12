// filename: build-listing.js
// Style: Ultimate Liquid Glassmorphism (2026 Edition)
// Features: Cinematic Player, Auto-hide UI, Speed List, No Outlines

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
    <title>Cloud Drive</title>
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

        /* УБИРАЕМ СИНЕЕ ВЫДЕЛЕНИЕ ПРИ КЛИКЕ И ФОКУСЕ */
        *, *::before, *::after {
            outline: none !important;
            -webkit-tap-highlight-color: transparent;
            user-select: none;
        }

        body {
            margin: 0; padding: 0;
            background-color: var(--bg-base);
            background-image: radial-gradient(circle at 5% 5%, rgba(253, 224, 71, 0.15), transparent 30%);
            background-attachment: fixed;
            font-family: 'Outfit', sans-serif; color: white;
            min-height: 100vh; overflow-x: hidden;
        }

        .container { max-width: 900px; margin: 3rem auto; padding: 0 15px; }

        .search-wrapper { 
            display: flex; gap: 0; align-items: center; margin-bottom: 1rem;
            background: rgba(255, 255, 255, 0.07);
            backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px);
            border-radius: 35px; border: 1px solid var(--glass-border);
            padding: 4px; transition: 0.3s;
        }
        .search-wrapper:focus-within { border-color: var(--accent); background: rgba(255, 255, 255, 0.12); }

        .filter-btn {
            width: 48px; height: 48px; flex-shrink: 0;
            background: transparent; border: none; border-radius: 50%;
            cursor: pointer; display: flex; align-items: center; justify-content: center;
            color: rgba(255, 255, 255, 0.6); font-size: 1.1rem; transition: 0.3s;
        }
        .filter-btn:hover { color: var(--accent); background: rgba(255,255,255,0.1); }

        .search-input {
            flex: 1; padding: 12px 20px 12px 10px;
            background: transparent; border: none; color: white; font-size: 1rem;
        }
        .search-input::placeholder { color: rgba(255, 255, 255, 0.4); }

        .filter-panel {
            max-height: 0; overflow: hidden; opacity: 0;
            background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); border-radius: 25px;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); border: 0 solid var(--glass-border);
        }
        .filter-panel.show { max-height: 200px; opacity: 1; padding: 15px; margin-bottom: 1.5rem; border-width: 1px; }

        .filter-tags { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }
        .tag {
            padding: 6px 16px; border-radius: 20px; background: rgba(255,255,255,0.1); font-size: 0.85rem;
            cursor: pointer; transition: 0.2s; border: 1px solid transparent;
        }
        .tag.active { background: var(--accent); color: #000; font-weight: 600; border-color: var(--accent); }

        .glass-panel {
            background: var(--glass-dark); backdrop-filter: blur(25px); border-radius: 35px;
            border: 1px solid var(--glass-border); box-shadow: 0 25px 50px rgba(0,0,0,0.1); padding: 10px 0;
        }

        .item-row {
            display: flex; align-items: center; padding: 0.8rem 1.4rem; margin: 4px 12px; border-radius: 18px;
            text-decoration: none; color: white; transition: 0.2s;
        }
        .item-row:hover { background: var(--glass-light); }
        .icon { width: 26px; margin-right: 12px; color: var(--accent); flex-shrink: 0; font-size: 1.1rem; }
        .name { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 300; }
        
        .file-tree { list-style: none; padding: 0; margin: 0; }
        .file-tree ul { list-style: none; padding-left: 20px; display: none; border-left: 1px solid rgba(255,255,255,0.1); margin-left: 15px; }
        .folder.open > ul { display: block; }
        .arrow { flex-shrink: 0; transition: 0.3s; opacity: 0.4; font-size: 0.7rem; margin-left: 10px; }
        .folder.open > .item-row .arrow { transform: rotate(90deg); opacity: 1; color: var(--accent); }

        /* --- CINEMATIC MEDIA PLAYER --- */
        .modal-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(116, 156, 249, 0.7); 
            backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
            display: flex; justify-content: center; align-items: center;
            z-index: 1000; opacity: 0; pointer-events: none; transition: 0.2s ease;
        }
        .modal-overlay.active { opacity: 1; pointer-events: auto; }
        
        .player-box {
            background: rgba(255, 255, 255, 0.12); border: 1px solid var(--glass-border);
            border-radius: 35px; padding: 25px; width: 92%; max-width: 850px;
            box-shadow: 0 40px 80px rgba(0,0,0,0.15);
            transform: scale(0.97); transition: 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28);
            display: flex; flex-direction: column; gap: 15px; position: relative;
            overflow: hidden;
        }
        .modal-overlay.active .player-box { transform: scale(1); }

        /* Скрытие интерфейса */
        .player-header, .custom-controls { transition: opacity 0.5s ease, transform 0.5s ease; opacity: 1; position: relative; z-index: 10; }
        .hide-ui .player-header { opacity: 0; transform: translateY(-15px); }
        .hide-ui .custom-controls { opacity: 0; transform: translateY(15px); }
        .hide-ui { cursor: none; }

        .player-header { display: flex; justify-content: space-between; align-items: center; }
        .player-title { font-weight: 600; color: var(--accent); font-size: 1.1rem; }

        .media-container { width: 100%; border-radius: 20px; overflow: hidden; background: #000; display: none; position: relative; cursor: pointer; }
        .media-container.show { display: block; }
        video { width: 100%; display: block; max-height: 55vh; object-fit: contain; }

        /* Анимированный статус по центру */
        .center-status {
            position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0.8);
            background: rgba(253, 224, 71, 0.9); color: #000; width: 80px; height: 80px;
            border-radius: 50%; display: flex; align-items: center; justify-content: center;
            font-size: 1.8rem; opacity: 0; pointer-events: none; z-index: 5;
        }
        .center-status.animate-in {
            animation: pingStatus 0.5s ease-out forwards;
        }
        @keyframes pingStatus {
            0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
            100% { opacity: 0; transform: translate(-50%, -50%) scale(1.3); }
        }

        .custom-controls {
            display: flex; align-items: center; gap: 15px;
            background: rgba(255,255,255,0.15); padding: 12px 22px; border-radius: 25px;
        }

        .play-pause-btn {
            background: var(--accent); color: #000; border: none; border-radius: 50%;
            width: 48px; height: 48px; cursor: pointer; display: flex; align-items: center; justify-content: center;
            font-size: 1.1rem; transition: 0.2s; flex-shrink: 0;
        }
        .play-pause-btn:hover { transform: scale(1.05); box-shadow: 0 0 15px rgba(253, 224, 71, 0.4); }

        input[type=range] { -webkit-appearance: none; flex: 1; background: transparent; cursor: pointer; }
        input[type=range]::-webkit-slider-runnable-track { width: 100%; height: 6px; background: rgba(255,255,255,0.2); border-radius: 3px; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; height: 18px; width: 18px; border-radius: 50%; background: var(--accent); margin-top: -6px; box-shadow: 0 0 8px rgba(0,0,0,0.2); }

        .time-box { font-size: 0.8rem; font-family: monospace; min-width: 90px; text-align: center; color: rgba(255,255,255,0.8); }

        /* Стилизованный список скорости */
        .speed-wrap { position: relative; }
        .speed-select {
            background: rgba(255,255,255,0.1); color: white; border: 1px solid var(--glass-border); 
            border-radius: 12px; padding: 6px 10px; font-size: 0.8rem; cursor: pointer; 
            font-family: inherit; appearance: none; -webkit-appearance: none; padding-right: 25px;
        }
        .speed-wrap::after {
            content: '\\f0d7'; font-family: 'Font Awesome 5 Free'; font-weight: 900;
            position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
            font-size: 0.7rem; pointer-events: none; opacity: 0.6;
        }
        .speed-select option { background: #5c8ae6; color: white; }

        .mini-btn { background: transparent; color: white; border: none; cursor: pointer; width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: 0.2s; font-size: 1rem; }
        .mini-btn:hover { background: rgba(255,255,255,0.12); color: var(--accent); }

        footer { text-align: center; padding: 4rem; opacity: 0.4; font-size: 0.8rem; letter-spacing: 1px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="search-wrapper">
            <button class="filter-btn" onclick="toggleFilterPanel()"><i class="fas fa-sliders-h"></i></button>
            <input type="text" id="fileSearch" class="search-input" placeholder="Найти в хранилище..." onkeyup="runFilters()">
        </div>

        <div class="filter-panel" id="filterPanel">
            <div class="filter-tags">
                <div class="tag active" onclick="toggleTag(this, 'all')">Все файлы</div>
                <div class="tag" onclick="toggleTag(this, 'media')">Медиа</div>
                <div class="tag" onclick="toggleTag(this, 'docs')">Документы</div>
                <div class="tag" onclick="toggleTag(this, 'code')">Разработка</div>
                <div class="tag" onclick="toggleTag(this, 'dir')">Папки</div>
            </div>
        </div>

        <div class="glass-panel">${content}</div>
    </div>

    <div class="modal-overlay" id="playerModal" onclick="closePlayer(event)">
        <div class="player-box" id="playerBox" onclick="event.stopPropagation()">
            <div class="player-header">
                <div class="player-title" id="playerTitle">Filament.mp4</div>
                <button class="mini-btn" onclick="closePlayer(true)"><i class="fas fa-times"></i></button>
            </div>
            
            <div class="media-container" id="videoContainer" onclick="togglePlay()">
                <div class="center-status" id="centerStatus"><i class="fas fa-play"></i></div>
                <video id="glassVideo" playsinline></video>
            </div>
            
            <audio id="glassAudio"></audio>

            <div class="custom-controls">
                <button class="play-pause-btn" id="playBtn" onclick="togglePlay()"><i class="fas fa-play"></i></button>
                <input type="range" id="progressBar" min="0" max="100" value="0" step="0.1">
                <div class="time-box" id="timeBox">0:00 / 0:00</div>
                
                <div class="speed-wrap">
                    <select class="speed-select" id="speedSelect" onchange="changeSpeed(this.value)">
                        <option value="0.5">0.5x</option>
                        <option value="1" selected>1.0x</option>
                        <option value="1.25">1.25x</option>
                        <option value="1.5">1.5x</option>
                        <option value="2">2.0x</option>
                    </select>
                </div>

                <button class="mini-btn" onclick="toggleFullscreen()"><i class="fas fa-expand"></i></button>
            </div>
        </div>
    </div>

    <footer>
        &copy; 2026 Plotko Mark &bull; DESIGNED FOR SPEED
    </footer>

    <script>
        // --- Общая логика ---
        function toggleFilterPanel() { document.getElementById('filterPanel').classList.toggle('show'); }
        function toggleFolder(el) { el.parentElement.classList.toggle('open'); }
        let activeFilter = 'all';
        function toggleTag(el, f) { document.querySelectorAll('.tag').forEach(t=>t.classList.remove('active')); el.classList.add('active'); activeFilter=f; runFilters(); }
        
        function runFilters() {
            const q = document.getElementById('fileSearch').value.toLowerCase();
            const items = document.querySelectorAll('li.file, li.folder');
            const groups = { media:['mp3','mp4','wav','png','jpg','webm','mkv','mov'], docs:['pdf','txt','zip','rar','7z'], code:['js','html','css','json','py'] };
            items.forEach(item => {
                const name = item.getAttribute('data-name');
                const type = item.getAttribute('data-type');
                const matchesQ = name.includes(q);
                let matchesT = (activeFilter==='all') || (activeFilter==='dir' && type==='dir') || (groups[activeFilter] && groups[activeFilter].includes(type));
                item.style.display = (matchesQ && matchesT) ? "" : "none";
            });
        }

        // --- ЛОГИКА ПЛЕЕРА ---
        let currentMedia = null;
        let idleTimer;
        const pBox = document.getElementById('playerBox');
        const cStatus = document.getElementById('centerStatus');
        const vEl = document.getElementById('glassVideo');
        const aEl = document.getElementById('glassAudio');

        function openPlayer(url, type, name) {
            document.getElementById('playerTitle').innerText = name;
            vEl.pause(); aEl.pause(); vEl.src = ""; aEl.src = "";
            
            const isVideo = type === 'video';
            document.getElementById('videoContainer').style.display = isVideo ? 'block' : 'none';
            currentMedia = isVideo ? vEl : aEl;
            
            currentMedia.src = url;
            currentMedia.playbackRate = parseFloat(document.getElementById('speedSelect').value);
            currentMedia.ontimeupdate = updateProgress;
            currentMedia.onloadedmetadata = updateProgress;
            
            document.getElementById('playerModal').classList.add('active');
            resetIdleTimer();
            togglePlay(true);
        }

        function closePlayer(e) {
            if (e === true || e.target.id === 'playerModal') {
                document.getElementById('playerModal').classList.remove('active');
                if(currentMedia) currentMedia.pause();
                if(document.fullscreenElement) document.exitFullscreen();
                clearTimeout(idleTimer);
            }
        }

        function togglePlay(forcePlay) {
            if(!currentMedia) return;
            const isPaused = currentMedia.paused;
            
            if (isPaused || forcePlay === true) {
                currentMedia.play();
                showStatusIcon('play');
            } else {
                currentMedia.pause();
                showStatusIcon('pause');
            }
            updateBtnUI();
            resetIdleTimer();
        }

        function updateBtnUI() {
            document.getElementById('playBtn').innerHTML = currentMedia.paused ? '<i class="fas fa-play"></i>' : '<i class="fas fa-pause"></i>';
        }

        function showStatusIcon(type) {
            cStatus.innerHTML = type === 'play' ? '<i class="fas fa-play"></i>' : '<i class="fas fa-pause"></i>';
            cStatus.classList.remove('animate-in');
            void cStatus.offsetWidth; // Триггер анимации
            cStatus.classList.add('animate-in');
        }

        function changeSpeed(val) { 
            if(currentMedia) currentMedia.playbackRate = parseFloat(val); 
        }

        function updateProgress() {
            if(!currentMedia) return;
            const progress = document.getElementById('progressBar');
            const cur = currentMedia.currentTime, dur = currentMedia.duration || 0;
            progress.value = (cur / dur) * 100 || 0;
            document.getElementById('timeBox').innerText = formatTime(cur) + ' / ' + formatTime(dur);
        }

        document.getElementById('progressBar').oninput = function() {
            if(currentMedia && currentMedia.duration) {
                currentMedia.currentTime = (this.value / 100) * currentMedia.duration;
            }
        };

        function formatTime(s) {
            if(isNaN(s)) return "0:00";
            const m = Math.floor(s/60); const sec = Math.floor(s%60);
            return m + ':' + (sec < 10 ? '0' : '') + sec;
        }

        function toggleFullscreen() {
            if (!document.fullscreenElement) pBox.requestFullscreen().catch(e=>console.log(e));
            else document.exitFullscreen();
        }

        // Автоскрытие интерфейса
        function resetIdleTimer() {
            pBox.classList.remove('hide-ui');
            clearTimeout(idleTimer);
            if (currentMedia && !currentMedia.paused) {
                idleTimer = setTimeout(() => pBox.classList.add('hide-ui'), 3000);
            }
        }

        pBox.onmousemove = resetIdleTimer;
        pBox.onclick = resetIdleTimer;
        pBox.ontouchstart = resetIdleTimer;

        // Закрытие по ESC
        window.onkeydown = (e) => { if(e.key === 'Escape') closePlayer(true); };
    </script>
</body>
</html>
`;

const treeContent = scan('.');
fs.writeFileSync(OUTPUT_FILE, generateHTML(treeContent));
console.log(`✅ Идеальный листинг создан: ${OUTPUT_FILE}`);
