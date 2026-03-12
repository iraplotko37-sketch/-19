// ... (начало скрипта scan и getIcon остается без изменений)

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
        --glass-dark: rgba(255, 255, 255, 0.12);
        --glass-light: rgba(255, 255, 255, 0.25);
        --glass-border: rgba(255, 255, 255, 0.3);
    }
    
    body {
        margin: 0; background-color: var(--bg-base);
        background-image: radial-gradient(circle at 10% 10%, rgba(253, 224, 71, 0.15), transparent 40%);
        background-attachment: fixed;
        font-family: 'Outfit', sans-serif; color: white;
        min-height: 100vh;
    }

    .container { max-width: 900px; margin: 2rem auto; padding: 0 15px; }

    h1 { 
        text-align: center; font-size: 2.2rem; margin-bottom: 2rem;
        background: linear-gradient(135deg, var(--accent), var(--accent-secondary));
        -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }

    /* Группа поиска и кнопки */
    .search-wrapper {
        display: flex; gap: 10px; align-items: center; margin-bottom: 1rem;
    }

    /* Круглая кнопка фильтра (3D Liquid Knob) */
    .filter-btn {
        width: 50px; height: 50px; flex-shrink: 0;
        background: var(--glass-light);
        backdrop-filter: blur(10px) url(#liquid);
        -webkit-backdrop-filter: blur(10px);
        border: 2px solid #fff; border-radius: 50%;
        cursor: pointer; display: flex; align-items: center; justify-content: center;
        box-shadow: inset 0 0 15px rgba(255,255,255,0.6), 0 5px 15px rgba(0,0,0,0.2);
        transition: transform 0.2s, box-shadow 0.2s;
        color: white; font-size: 1.1rem;
    }
    .filter-btn:hover { transform: scale(1.05); }
    .filter-btn:active { transform: scale(0.95); }

    /* Строка поиска */
    .search-input {
        flex: 1; padding: 14px 22px;
        background: rgba(255, 255, 255, 0.08);
        backdrop-filter: blur(15px);
        border: 1px solid var(--glass-border);
        border-radius: 30px; color: white; outline: none;
        font-size: 1rem; transition: 0.3s;
    }
    .search-input:focus { border-color: var(--accent); background: rgba(255,255,255,0.12); }

    /* Выпадающая панель фильтров */
    .filter-panel {
        max-height: 0; overflow: hidden;
        background: var(--glass-dark);
        backdrop-filter: blur(10px);
        border-radius: 20px;
        transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), padding 0.3s, margin 0.3s;
        border: 0 solid var(--glass-border);
    }
    .filter-panel.show {
        max-height: 200px; padding: 15px; margin-bottom: 2rem;
        border-width: 1px;
    }

    .filter-tags { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
    .tag {
        padding: 6px 15px; border-radius: 20px; background: rgba(255,255,255,0.1);
        font-size: 0.85rem; cursor: pointer; transition: 0.2s; border: 1px solid transparent;
    }
    .tag.active { background: var(--accent); color: #000; font-weight: 600; }

    /* Список файлов */
    .glass-panel {
        background: var(--glass-dark); backdrop-filter: blur(20px);
        border-radius: 30px; border: 1px solid var(--glass-border);
        box-shadow: 0 20px 40px rgba(0,0,0,0.2);
    }

    .item-row {
        display: flex; align-items: center; padding: 0.8rem 1.2rem;
        margin: 4px 8px; border-radius: 12px; text-decoration: none; color: white;
        transition: background 0.2s; min-width: 0;
    }
    .item-row:hover { background: var(--glass-light); }

    .icon { width: 24px; margin-right: 12px; color: var(--accent); flex-shrink: 0; }
    .name { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    
    .file-tree { list-style: none; padding: 0; margin: 0; }
    .file-tree ul { list-style: none; padding-left: 18px; display: none; border-left: 1px solid rgba(255,255,255,0.1); }
    .folder.open > ul { display: block; }

    footer { text-align: center; padding: 2rem; opacity: 0.6; font-size: 0.8rem; }
    </style>
</head>
<body>
    <svg style="position: absolute; width: 0; height: 0;">
        <filter id="liquid">
            <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" />
        </filter>
    </svg>

    <div class="container">
        <h1 style="backdrop-filter: url(#liquid);">${SITE_TITLE}</h1>
        
        <div class="search-wrapper">
            <button class="filter-btn" onclick="toggleFilterPanel()" title="Фильтры">
                <i class="fas fa-sliders"></i>
            </button>
            <input type="text" id="fileSearch" class="search-input" placeholder="Поиск файлов и папок..." onkeyup="runFilters()">
        </div>

        <div class="filter-panel" id="filterPanel">
            <div class="filter-tags">
                <div class="tag active" onclick="toggleTag(this, 'all')">Все файлы</div>
                <div class="tag" onclick="toggleTag(this, 'media')"><i class="fas fa-play"></i> Медиа</div>
                <div class="tag" onclick="toggleTag(this, 'docs')"><i class="fas fa-file-lines"></i> Документы</div>
                <div class="tag" onclick="toggleTag(this, 'code')"><i class="fas fa-code"></i> Код</div>
                <div class="tag" onclick="toggleTag(this, 'dir')"><i class="fas fa-folder"></i> Папки</div>
            </div>
        </div>

        <div class="glass-panel">
            ${content}
        </div>
    </div>

    <script>
        let activeFilter = 'all';

        function toggleFilterPanel() {
            document.getElementById('filterPanel').classList.toggle('show');
        }

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
                    else matchesTag = groups[activeFilter] && groups[activeFilter].includes(type);
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
    </script>
</body>
</html>
`;
// ... (конец скрипта)
