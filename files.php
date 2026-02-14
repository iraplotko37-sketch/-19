<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Список всех файлов сайта</title>
    <style>
        body { 
            font-family: 'Segoe UI', sans-serif; 
            background: #f4f7f6; 
            padding: 40px; 
            color: #333;
        }
        .container { 
            max-width: 800px; 
            margin: 0 auto; 
            background: white; 
            padding: 30px; 
            border-radius: 12px; 
            box-shadow: 0 4px 15px rgba(0,0,0,0.05); 
        }
        h1 { 
            border-bottom: 2px solid #3498db; 
            padding-bottom: 15px; 
            font-size: 24px;
            color: #2c3e50;
        }
        ul { list-style: none; padding: 0; }
        li { 
            padding: 12px; 
            border-bottom: 1px solid #eee; 
            display: flex; 
            align-items: center; 
            transition: background 0.2s;
        }
        li:hover { background: #f9f9f9; }
        li:last-child { border-bottom: none; }
        
        a { 
            text-decoration: none; 
            color: #3498db; 
            font-weight: 500; 
            flex-grow: 1;
        }
        a:hover { text-decoration: underline; }
        
        .size { 
            color: #999; 
            font-size: 0.85em; 
            margin-left: 15px;
        }
        .icon { 
            margin-right: 15px; 
            font-size: 1.2em;
        }
    </style>
</head>
<body>

<div class="container">
    <h1>📄 Карта файлов сайта</h1>
    <ul>
        <?php
        // 1. Указываем директорию (текущая)
        $dir = "./";
        $files = scandir($dir);

        // 2. Список исключений (эти файлы не будут показаны)
        $exclude = array('.', '..', 'files.php', '.htaccess', '.git', 'index.php');

        foreach ($files as $file) {
            // Проверяем, нет ли файла в списке исключений
            if (!in_array($file, $exclude)) {
                
                // Определяем иконку: папка или файл
                $icon = is_dir($file) ? "📁" : "📄";
                
                // Получаем размер файла в Килобайтах
                $filesize = is_file($file) ? round(filesize($file) / 1024, 2) . " KB" : "Папка";
                
                echo "<li>
                        <span class='icon'>$icon</span>
                        <a href='$file'>$file</a>
                        <span class='size'>$filesize</span>
                      </li>";
            }
        }
        ?>
    </ul>
</div>

</body>
</html>
