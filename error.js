// /api/error.js

const ERROR_CONFIG = {
  // 4xx Ошибки клиента (Client Errors)
  400: { 
    title: 'Неверный запрос', 
    message: 'Сервер не может обработать запрос из-за синтаксической ошибки клиента.', 
    icon: 'fa-triangle-exclamation' 
  },
  401: { 
    title: 'Требуется авторизация', 
    message: 'Для доступа к этому ресурсу требуется аутентификация.', 
    icon: 'fa-lock' 
  },
  403: { 
    title: 'Доступ запрещен', 
    message: 'У вас нет прав для просмотра этого ресурса.', 
    icon: 'fa-ban' 
  },
  404: { 
    title: 'Страница не найдена', 
    message: 'Запрашиваемая страница не существует, была перемещена или удалена.', 
    icon: 'fa-magnifying-glass' 
  },
  405: { 
    title: 'Метод не поддерживается', 
    message: 'Метод запроса не разрешен для этого ресурса.', 
    icon: 'fa-xmark' 
  },
  429: { 
    title: 'Слишком много запросов', 
    message: 'Вы отправили слишком много запросов за короткое время. Попробуйте позже.', 
    icon: 'fa-gauge-high' 
  },
  451: { 
    title: 'Доступ ограничен', 
    message: 'Контент недоступен в вашем регионе из-за юридических ограничений.', 
    icon: 'fa-globe', 
    isRegional: true 
  },
  
  // 5xx Ошибки сервера (Server Errors)
  500: { 
    title: 'Внутренняя ошибка сервера', 
    message: 'На сервере что-то пошло не так. Мы уже работаем над этим.', 
    icon: 'fa-server' 
  },
  502: { 
    title: 'Ошибочный шлюз', 
    message: 'Сервер получил недопустимый ответ от вышестоящего сервера.', 
    icon: 'fa-route' 
  },
  503: { 
    title: 'Сервис недоступен', 
    message: 'Сервер временно перегружен или находится на техническом обслуживании.', 
    icon: 'fa-tools' 
  },
  504: { 
    title: 'Время ожидания истекло', 
    message: 'Сервер не получил своевременный ответ от вышестоящего шлюза.', 
    icon: 'fa-clock' 
  },
  
  // Fallback
  default: { 
    title: 'Ошибка', 
    message: 'Произошла непредвиденная ошибка.', 
    icon: 'fa-circle-exclamation' 
  }
};

export default function handler(request, response) {
  try {
    const { code } = request.query;

    // 1. Parsing & Validation
    let statusCode = parseInt(code, 10);

    // Validate valid HTTP range (100-599). Fallback to 500.
    if (isNaN(statusCode) || statusCode < 100 || statusCode > 599) {
      statusCode = 500;
    }

    // 2. Set Status Code
    response.status(statusCode);

    // 3. Cache Control
    // Cache standard errors (404/410) publicly. Do not cache server errors (5xx).
    if ([404, 410, 451].includes(statusCode)) {
      response.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=60');
    } else {
      response.setHeader('Cache-Control', 'no-store');
    }

    // 4. Render
    const errorData = ERROR_CONFIG[statusCode] || ERROR_CONFIG.default;
    const isRegional = statusCode === 451;
    const html = renderErrorPage(statusCode, errorData, isRegional);
    
    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    response.send(html);

  } catch (e) {
    console.error('Error handler crashed:', e);
    // Absolute fallback
    response.status(500).send('Internal Server Error');
  }
}

function renderErrorPage(statusCode, error, isRegional) {
  // Theme: Regional = Pink/Orange, Generic = Blue/Purple
  const theme = isRegional 
    ? { bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', text: '#fff', accent: '#d946ef' }
    : { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', text: '#fff', accent: '#4f46e5' };

  return `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${statusCode} - ${error.title}</title>

    <!-- CSP (Content Security Policy) -->
    <meta http-equiv="Content-Security-Policy" 
          content="default-src 'self'; 
                   script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com; 
                   style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com/; 
                   img-src 'self' data: https://flurion.qzz.io; 
                   connect-src 'self' https://cloudflareinsights.com;
                   font-src 'self' https://cdnjs.cloudflare.com;">

    <!-- Favicons -->
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
    <link rel="manifest" href="/site.webmanifest">

    <!-- Fonts/Icons -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    
    <style>
        :root { --font-main: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
        body {
            font-family: var(--font-main);
            margin: 0; padding: 0;
            min-height: 100vh;
            display: flex; align-items: center; justify-content: center;
            background: ${theme.bg};
            color: ${theme.text};
            overflow: hidden;
        }
        .container {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 24px;
            padding: 3rem;
            max-width: 440px; width: 90%;
            text-align: center;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            animation: fadeIn 0.5s ease-out;
            position: relative;
            z-index: 10;
        }
        .icon-box {
            width: 80px; height: 80px; margin: 0 auto 1.5rem;
            background: rgba(255,255,255,0.2);
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            font-size: 2.5rem;
        }
        h1 { margin: 0; font-size: 4.5rem; font-weight: 800; line-height: 1; letter-spacing: -2px; }
        h2 { margin: 0.5rem 0 1rem; font-size: 1.5rem; font-weight: 600; opacity: 0.95; }
        p { line-height: 1.6; opacity: 0.85; margin-bottom: 2rem; }
        
        .regional-notice {
            background: rgba(255,255,255,0.15); 
            padding: 10px; 
            border-radius: 8px; 
            margin-bottom: 20px; 
            font-size: 0.9rem;
            border: 1px solid rgba(255,255,255,0.2);
        }

        .btn {
            display: inline-flex; align-items: center; gap: 0.5rem;
            padding: 0.8rem 1.5rem;
            border-radius: 12px;
            text-decoration: none;
            font-weight: 600;
            transition: all 0.2s;
            background: white;
            color: ${theme.accent};
            border: none; cursor: pointer;
        }
        .btn:hover { transform: translateY(-2px); box-shadow: 0 10px 20px -10px rgba(0,0,0,0.3); }
        .btn-secondary { background: rgba(255,255,255,0.2); color: white; margin-right: 10px; }
        .btn-secondary:hover { background: rgba(255,255,255,0.3); }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon-box">
            <i class="fas ${error.icon}"></i>
        </div>
        <h1>${statusCode}</h1>
        <h2>${error.title}</h2>
        <p>${error.message}</p>
        
        ${isRegional ? `
          <div class="regional-notice">
             <i class="fas fa-info-circle"></i> Региональные ограничения лицензирования
          </div>
        ` : ''}

        <div>
            <button onclick="history.back()" class="btn btn-secondary">
                <i class="fas fa-arrow-left"></i> Назад
            </button>
            <a href="/" class="btn">
                <i class="fas fa-home"></i> На главную
            </a>
        </div>
    </div>
</body>
</html>
  `;
}