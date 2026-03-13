// filename: build-listing.js
// Version: 5.0 - Professional Media Hub
// Fixes: Bullet points, Fullscreen scale, Filters restored, Double actions

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
            const webPath = relativePath.split(path.sep).map(encodeURIComponent).join('/');

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
                const isVideo = ['mp4', 'webm', 'mkv', 'mov', 'avi'].includes(ext);
                const isAudio = ['mp3', 'wav', 'flac', 'ogg', 'm4a'].includes(ext);
                
                if (isVideo || isAudio) {
                    const mediaType = isVideo ? 'video' : 'audio';
                    html += `
                    <li class="file" data-name="${item.name.toLowerCase()}" data-path="${rootRelativePath.toLowerCase()}" data-type="${ext}">
                        <div class="item-row">
                            <span class="icon"><i class="fas ${icon}"></i></span>
                            <span class="name" onclick="openPlayer('/${webPath}', '${mediaType}', '${item.name.replace(/'/g, "\\'")}')"><span>${item.name}</span></span>
                            <div class="action-group">
                                <button class="action-btn play" title="Запустить" onclick="openPlayer('/${webPath}', '${mediaType}', '${item.name.replace(/'/g, "\\'")}')"><i class="fas fa-play"></i></button>
                                <a href="/${webPath}" target="_blank" class="action-btn link" title="Перейти"><i class="fas fa-external-link-alt"></i></a>
                            </div>
                        </div>
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
            --glass: rgba(255, 255, 255, 0.15);
            --glass-border: rgba(255, 255, 255, 0.25);
            --gradient: radial-gradient(circle at 5% 5%, rgba(253, 224, 71, 0.15), transparent 30%);
        }

        *, *::before, *::after {
            outline: none !important;
            -webkit-tap-highlight-color: transparent;
            box-sizing: border-box;
        }

        body {
            margin: 0; padding: 0;
            background-color: var(--bg-base);
            background-image: var(--gradient);
            background-attachment: fixed;
            font-family: 'Outfit', sans-serif; color: white;
            min-height: 100vh;
        }

        .container { max-width: 900px; margin: 3rem auto; padding: 0 15px; }

        /* Убираем белые точки */
        ul.file-tree, ul.file-tree ul {
            list-style: none !important;
            padding: 0; margin: 0;
        }

        .glass-panel {
            background: var(--glass); backdrop-filter: blur(25px); -webkit-backdrop-filter: blur(25px);
            border-radius: 35px; border: 1px solid var(--glass-border);
            padding: 10px 0; box-shadow: 0 25px 50px rgba(0,0,0,0.1);
        }

        /* --- SEARCH & FILTERS --- */
        .search-wrapper { 
            display: flex; background: rgba(255,255,255,0.1); border: 1px solid var(--glass-border);
            border-radius: 30px; padding: 5px; margin-bottom: 10px; backdrop-filter: blur(15px);
        }
        .search-input { flex: 1; background: transparent; border: none; color: white; padding: 10px 20px; font-size: 1rem; }
        .filter-trigger-btn { background: transparent; border: none; color: white; cursor: pointer; padding: 0 15px; font-size: 1.1rem; opacity: 0.7; transition: 0.3s; }
        .filter-trigger-btn:hover { opacity: 1; color: var(--accent); }

        .filter-panel {
            max-height: 0; overflow: hidden; opacity: 0; transition: 0.4s ease;
            display: flex; gap: 10px; justify-content: center; margin-bottom: 20px;
        }
        .filter-panel.show { max-height: 100px; opacity: 1; margin-top: 15px; }
        .tag { padding: 6px 15px; background: rgba(255,255,255,0.1); border-radius: 20px; font-size: 0.8rem; cursor: pointer; border: 1px solid transparent; }
        .tag.active { background: var(--accent); color: black; font-weight: 600; }

        /* --- ITEM ROWS --- */
        .item-row { display: flex; align-items: center; padding: 0.7rem 1.4rem; margin: 4px 12px; border-radius: 20px; text-decoration: none; color: white; transition: 0.2s; cursor: pointer; }
        .item-row:hover { background: rgba(255,255,255,0.2); }
        .icon { width: 26px; margin-right: 15px; color: var(--accent); }
        .name { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        
        .action-group { display: flex; gap: 8px; }
        .action-btn { 
            width: 34px; height: 34px; border-radius: 50%; border: none; 
            display: flex; align-items: center; justify-content: center; 
            cursor: pointer; transition: 0.2s; font-size: 0.8rem; color: white; background: rgba(255,255,255,0.1);
        }
        .action-btn.play { background: var(--accent); color: black; }
        .action-btn:hover { transform: scale(1.1); }

        .file-tree ul { padding-left: 20px; display: none; border-left: 1px solid rgba(255,255,255,0.1); margin-left: 25px !important; }
        .folder.open > ul { display: block; }
        .arrow { transition: 0.3s; opacity: 0.5; }
        .folder.open > .item-row .arrow { transform: rotate(90deg); color: var(--accent); opacity: 1; }

        /* --- PLAYER --- */
        .modal-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(116, 156, 249, 0.4); backdrop-filter: blur(25px);
            display: flex; justify-content: center; align-items: center;
            z-index: 1000; opacity: 0; pointer-events: none; transition: 0.3s;
        }
        .modal-overlay.active { opacity: 1; pointer-events: auto; }
        
        .player-box {
            background: rgba(255, 255, 255, 0.1); border: 1px solid var(--glass-border);
            border-radius: 35px; padding: 20px; width: 92%; max-width: 900px;
            display: flex; flex-direction: column; gap: 15px; position: relative;
        }

        /* Настоящий ПОЛНЫЙ ЭКРАН */
        .player-box:fullscreen {
            width: 100vw; max-width: 100vw; height: 100vh;
            border-radius: 0; border: none; padding: 0;
            background: var(--bg-base) !important;
            display: flex; flex-direction: column;
        }

        .media-container { 
            width: 100%; border-radius: 20px; overflow: hidden; 
            background: #000; position: relative; flex-grow: 1;
            display: none; align-items: center; justify-content: center;
        }
        .media-container.show { display: flex; }
        
        video { width: 100%; height: 100%; max-height: 65vh; object-fit: contain; }
        .player-box:fullscreen video { max-height: 100vh; }

        .player-header { padding: 10px 20px; display: flex; justify-content: space-between; align-items: center; z-index: 10; transition: 0.4s; }
        .custom-controls {
            margin: 15px; display: flex; align-items: center; gap: 15px;
            background: rgba(255,255,255,0.15); padding: 12px 25px; border-radius: 25px;
            backdrop-filter: blur(15px); border: 1px solid var(--glass-border); transition: 0.4s;
        }

        .player-box:fullscreen .player-header { position: absolute; top: 0; width: 100%; background: linear-gradient(to bottom, rgba(0,0,0,0.5), transparent); }
        .player-box:fullscreen .custom-controls { position: absolute; bottom: 10px; left: 20px; right: 20px; margin: 0; }

        .hide-ui .player-header, .hide-ui .custom-controls { opacity: 0; }
        .hide-ui { cursor: none; }

        /* Кнопки и ползунки */
        .play-pause-btn { background: var(--accent); color: black; border: none; border-radius: 50%; width: 46px; height: 46px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; }
        input[type=range] { -webkit-appearance: none; flex: 1; background: transparent; cursor: pointer; }
        input[type=range]::-webkit-slider-runnable-track { height: 6px; background: rgba(255,255,255,0.2); border-radius: 3px; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; height: 18px; width: 18px; border-radius: 50%; background: var(--accent); margin-top: -6px; }

        /* СТЕКЛЯННАЯ СКОРОСТЬ */
        .speed-wrap { position: relative; background: rgba(255,255,255,0.1); border-radius: 12px; border: 1px solid var(--glass-border); padding: 5px 10px; backdrop-filter: blur(10px); }
        .speed-select { background: transparent; color: white; border: none; font-family: inherit; font-weight: 600; cursor: pointer; font-size: 0.8rem; }
        .speed-select option { background: var(--bg-base); color: white; }

        .center-status { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: var(--accent); color: black; width: 70px; height: 70px; border-radius: 50%; display: flex; align-items: center; justify-content: center; opacity: 0; pointer-events: none; font-size: 1.5rem; z-index: 5; }
        .animate-status { animation: statusJump 0.5s ease-out; }
        @keyframes statusJump { 0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); } 50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); } 100% { opacity: 0; transform: translate(-50%, -50%) scale(1.3); } }
    </style>
</head>
<body>
    <div class="container">
        <div class="search-wrapper">
            <button class="filter-trigger-btn" onclick="toggleFilters()"><i class="fas fa-filter"></i></button>
            <input type="text" id="fileSearch" class="search-input" placeholder="Поиск..." onkeyup="runFilters()">
        </div>

        <div class="filter-panel" id="filterPanel">
            <div class="tag active" onclick="setFilter(this, 'all')">Все</div>
            <div class="tag" onclick="setFilter(this, 'video')">Видео</div>
            <div class="tag" onclick="setFilter(this, 'audio')">Музыка</div>
            <div class="tag" onclick="setFilter(this, 'dir')">Папки</div>
        </div>

        <div class="glass-panel" id="mainPanel">${content}</div>
    </div>

    <div class="modal-overlay" id="playerModal" onclick="closePlayer(event)">
        <div class="player-box" id="playerBox" onclick="event.stopPropagation()">
            <div class="player-header">
                <div id="playerTitle" style="font-weight:600; color:var(--accent)">Media</div>
                <button style="background:none;border:none;color:white;cursor:pointer;font-size:1.2rem" onclick="closePlayer(true)"><i class="fas fa-times"></i></button>
            </div>
            <div class="media-container" id="mediaCont" onclick="togglePlay()">
                <div class="center-status" id="centerStatus"></div>
                <video id="glassVideo" playsinline></video>
                <audio id="glassAudio" style="width:90%"></audio>
            </div>
            <div class="custom-controls">
                <button class="play-pause-btn" id="playBtn" onclick="togglePlay()"><i class="fas fa-play"></i></button>
                <input type="range" id="prog" value="0" step="0.1">
                <div id="timeBox" style="font-size:0.8rem; font-family:monospace; min-width:90px">0:00/0:00</div>
                <div class="speed-wrap">
                    <select class="speed-select" id="speedSel" onchange="changeSpeed(this.value)">
                        <option value="0.5">0.5x</option><option value="1" selected>1.0x</option><option value="1.5">1.5x</option><option value="2">2.0x</option>
                    </select>
                </div>
                <button style="background:none;border:none;color:white;cursor:pointer" onclick="toggleFullscreen()"><i class="fas fa-expand"></i></button>
            </div>
        </div>
    </div>

    <script>
        function toggleFolder(el) { el.parentElement.classList.toggle('open'); }
        function toggleFilters() { document.getElementById('filterPanel').classList.toggle('show'); }
        
        let currentTag = 'all';
        function setFilter(el, tag) {
            document.querySelectorAll('.tag').forEach(t => t.classList.remove('active'));
            el.classList.add('active');
            currentTag = tag;
            runFilters();
        }

        function runFilters() {
            const q = document.getElementById('fileSearch').value.toLowerCase();
            document.querySelectorAll('li.file, li.folder').forEach(item => {
                const name = item.getAttribute('data-name');
                const type = item.getAttribute('data-type');
                const isDir = type === 'dir';
                const isVideo = ['mp4','webm','mkv'].includes(type);
                const isAudio = ['mp3','wav'].includes(type);

                let matchTag = (currentTag === 'all') || 
                               (currentTag === 'dir' && isDir) || 
                               (currentTag === 'video' && isVideo) || 
                               (currentTag === 'audio' && isAudio);
                
                item.style.display = (name.includes(q) && matchTag) ? "" : "none";
            });
        }

        let media = null;
        let idle;
        const pBox = document.getElementById('playerBox');
        const cStat = document.getElementById('centerStatus');

        function openPlayer(url, type, name) {
            document.getElementById('playerTitle').innerText = name;
            const v = document.getElementById('glassVideo'), a = document.getElementById('glassAudio');
            v.pause(); a.pause(); v.style.display = 'none'; a.style.display = 'none';
            media = (type === 'video') ? v : a;
            media.src = url; media.style.display = 'block';
            document.getElementById('mediaCont').classList.add('show');
            document.getElementById('playerModal').classList.add('active');
            media.onloadedmetadata = updateUI;
            media.ontimeupdate = updateUI;
            togglePlay(true);
        }

        function closePlayer(force) {
            if(force === true || force.target.id === 'playerModal') {
                document.getElementById('playerModal').classList.remove('active');
                if(media) media.pause();
                if(document.fullscreenElement) document.exitFullscreen();
            }
        }

        function togglePlay(onlyPlay) {
            if(!media) return;
            if(media.paused || onlyPlay === true) { media.play(); showIcon('fa-play'); }
            else { media.pause(); showIcon('fa-pause'); }
            document.getElementById('playBtn').innerHTML = media.paused ? '<i class="fas fa-play"></i>' : '<i class="fas fa-pause"></i>';
            resetIdle();
        }

        function showIcon(icon) {
            cStat.innerHTML = '<i class="fas '+icon+'"></i>';
            cStat.classList.remove('animate-status');
            void cStat.offsetWidth;
            cStat.classList.add('animate-status');
        }

        function changeSpeed(v) { if(media) media.playbackRate = parseFloat(v); }
        function updateUI() {
            const p = document.getElementById('prog');
            p.value = (media.currentTime / media.duration) * 100 || 0;
            document.getElementById('timeBox').innerText = fmt(media.currentTime)+'/'+fmt(media.duration);
        }
        document.getElementById('prog').oninput = function() { media.currentTime = (this.value/100) * media.duration; };
        function fmt(s) { if(isNaN(s)) return "0:00"; const m=Math.floor(s/60), sec=Math.floor(s%60); return m+":"+(sec<10?"0":"")+sec; }
        function toggleFullscreen() { if(!document.fullscreenElement) pBox.requestFullscreen(); else document.exitFullscreen(); }
        function resetIdle() { pBox.classList.remove('hide-ui'); clearTimeout(idle); if(media && !media.paused) idle = setTimeout(() => pBox.classList.add('hide-ui'), 3000); }
        pBox.onmousemove = resetIdle;
        pBox.onclick = resetIdle;
        window.onkeydown = (e) => { if(e.code === 'Space') { e.preventDefault(); togglePlay(); } if(e.key === 'Escape') closePlayer(true); };
    </script>
</body>
</html>
`;

const treeContent = scan('.');
fs.writeFileSync(OUTPUT_FILE, generateHTML(treeContent));
console.log(`✅ Обновлено! Фильтры на месте, точки удалены, видео во весь экран.`);
