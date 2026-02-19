// filename: build-listing.js
// (c) 2026 BlankHtmlPage
// licensed under the AGPLv3 license.

const fs = require('fs');
const path = require('path');

/**
 * Configuration
 */
const OUTPUT_FILE = 'files.html';
const SITE_TITLE = 'Index of /';

// Files or Folders to ignore
const BLACKLIST = new Set([
    'node_modules',
    '.git',
    '.vercel',
    '.github',
    'api',
    'package.json',
    'package-lock.json',
    'build-listing.js',
    '.gitignore',
    'README.md',
    'files.html' // Don't list the output file itself
]);

/**
 * Expanded Icon Mapping
 */
const getIcon = (name, isDir) => {
    if (isDir) return 'fa-folder';
    const ext = path.extname(name).toLowerCase();
    
    const icons = {
        // Audio
        '.mp3': 'fa-file-audio', '.wav': 'fa-file-audio', '.flac': 'fa-file-audio', '.ogg': 'fa-file-audio', '.m4a': 'fa-file-audio',
        // Video
        '.mp4': 'fa-file-video', '.mkv': 'fa-file-video', '.mov': 'fa-file-video', '.avi': 'fa-file-video', '.webm': 'fa-file-video',
        // Images
        '.jpg': 'fa-file-image', '.jpeg': 'fa-file-image', '.png': 'fa-file-image', '.gif': 'fa-file-image', '.svg': 'fa-file-image', '.webp': 'fa-file-image', '.ico': 'fa-file-image',
        // Archives
        '.zip': 'fa-file-zipper', '.rar': 'fa-file-zipper', '.7z': 'fa-file-zipper', '.tar': 'fa-file-zipper', '.gz': 'fa-file-zipper',
        // Documents
        '.pdf': 'fa-file-pdf', '.doc': 'fa-file-word', '.docx': 'fa-file-word', '.txt': 'fa-file-lines', '.rtf': 'fa-file-lines',
        // Code/Data
        '.js': 'fa-file-code', '.json': 'fa-file-code', '.css': 'fa-file-code', '.html': 'fa-file-code', '.xml': 'fa-file-code', '.csv': 'fa-file-csv',
        // Executables / Misc
        '.exe': 'fa-gears', '.dmg': 'fa-box-open', '.iso': 'fa-compact-disc', '.bin': 'fa-microchip'
    };

    return icons[ext] || 'fa-file';
};

/**
 * Recursive Directory Scanner
 */
function scan(dirPath, rootRelativePath = '') {
    let html = '<ul class="file-tree">';
    
    try {
        const items = fs.readdirSync(dirPath, { withFileTypes: true });
        
        // Sort: Folders first, then Alphabetical
        items.sort((a, b) => {
            if (a.isDirectory() === b.isDirectory()) return a.name.localeCompare(b.name);
            return a.isDirectory() ? -1 : 1;
        });

        for (const item of items) {
            // Check Blacklist
            if (BLACKLIST.has(item.name) || item.name.startsWith('.')) continue;

            const relativePath = path.join(rootRelativePath, item.name);
            const fullPath = path.join(dirPath, item.name);
            const icon = getIcon(item.name, item.isDirectory());

            if (item.isDirectory()) {
                html += `
                <li class="folder">
                    <div class="item-row folder-trigger" onclick="toggleFolder(this)">
                        <span class="icon"><i class="fas ${icon}"></i></span>
                        <span class="name">${item.name}</span>
                        <span class="arrow"><i class="fas fa-chevron-right"></i></span>
                    </div>
                    ${scan(fullPath, relativePath)}
                </li>`;
            } else {
                // Ensure URL encoding for spaces and special characters
                const webPath = relativePath.split(path.sep).map(encodeURIComponent).join('/');
                html += `
                <li class="file">
                    <a href="/${webPath}" class="item-row file-link">
                        <span class="icon"><i class="fas ${icon}"></i></span>
                        <span class="name">${item.name}</span>
                        <span class="action"><i class="fas fa-external-link-alt"></i></span>
                    </a>
                </li>`;
            }
        }
    } catch (e) {
        console.error(`Error scanning ${dirPath}:`, e.message);
    }

    html += '</ul>';
    return html;
}

/**
 * HTML Generator with Liquid Glass GUI
 */
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
            --glass-bg: rgba(255, 255, 255, 0.03);
            --glass-border: rgba(255, 255, 255, 0.08);
            --text-main: #FFFFFF;
            --text-muted: #94a3b8;
            --accent: #8b5cf6;
            --hover-bg: rgba(255, 255, 255, 0.06);
        }
        
        body {
            margin: 0; padding: 0;
            font-family: 'Outfit', sans-serif;
            background-color: #020617;
            color: var(--text-main);
            min-height: 100vh;
            display: flex; flex-direction: column;
            background-image: 
                radial-gradient(circle at 0% 0%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 100% 100%, rgba(236, 72, 153, 0.1) 0%, transparent 50%);
        }

        .container {
            max-width: 900px;
            width: 95%;
            margin: 4rem auto;
            flex: 1;
        }

        header { margin-bottom: 2.5rem; }
        h1 { font-size: 2rem; margin: 0; font-weight: 600; letter-spacing: -0.5px; }
        .breadcrumb { color: var(--text-muted); font-size: 0.9rem; margin-top: 0.5rem; }

        /* Liquid Glass Card */
        .glass-panel {
            background: var(--glass-bg);
            backdrop-filter: blur(25px);
            -webkit-backdrop-filter: blur(25px);
            border: 1px solid var(--glass-border);
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        /* Listing Styling */
        .file-tree { list-style: none; padding: 0; margin: 0; }
        .file-tree ul { 
            list-style: none; 
            padding-left: 1.25rem; 
            display: none; 
            border-left: 1px solid rgba(255,255,255,0.05);
            margin-left: 1.1rem;
        }

        .item-row {
            display: flex; align-items: center;
            padding: 0.75rem 1.25rem;
            cursor: pointer;
            transition: all 0.2s ease;
            text-decoration: none;
            color: var(--text-main);
            border-bottom: 1px solid rgba(255,255,255,0.02);
        }

        .item-row:hover {
            background: var(--hover-bg);
            padding-left: 1.5rem;
            color: #fff;
        }

        .icon { width: 24px; text-align: center; margin-right: 1rem; color: var(--accent); opacity: 0.8; }
        .name { flex: 1; font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .arrow { font-size: 0.7rem; color: var(--text-muted); transition: transform 0.3s; }
        .action { font-size: 0.8rem; color: var(--text-muted); opacity: 0; }
        
        .item-row:hover .action { opacity: 0.5; }

        /* Logic for Folder Expansion */
        .folder.open > .item-row .arrow { transform: rotate(90deg); }
        .folder.open > ul { display: block; }

        footer {
            text-align: center;
            padding: 3rem 1rem;
            color: var(--text-muted);
            font-size: 0.85rem;
            letter-spacing: 0.5px;
        }

        @media (max-width: 600px) {
            .container { margin: 2rem auto; }
            h1 { font-size: 1.5rem; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>${SITE_TITLE}</h1>
            <div class="breadcrumb">Root Directory</div>
        </header>

        <div class="glass-panel">
            ${content}
        </div>
    </div>

    <footer>
        &lt;/&gt; Coded with love by BlankHtmlPage.
    </footer>

    <script>
        function toggleFolder(element) {
            const folderLi = element.parentElement;
            folderLi.classList.toggle('open');
            // Prevent link redirection if nested
            event.stopPropagation();
        }
    </script>
</body>
</html>
`;

// --- Execution ---
console.log('🚀 Starting Scan...');

// Start scanning from current directory (.)
const treeContent = scan('.');

console.log('📄 Generating HTML...');
const finalHtml = generateHTML(treeContent);

fs.writeFileSync(OUTPUT_FILE, finalHtml);
console.log(`✅ Listing generated successfully: ${OUTPUT_FILE}`);


