// api/upload.js
import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

// Настройки
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain', 'text/markdown',
  'video/mp4', 'audio/mpeg'
];

// Санитизация имени файла
function sanitizeFilename(filename) {
  return filename
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(0, 100);
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'Файл не передан' }, { status: 400 });
    }

    // Проверка размера
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Файл слишком большой (макс. 50 МБ)' }, { status: 413 });
    }

    // Проверка типа
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Неподдерживаемый тип файла' }, { status: 415 });
    }

    // Санитизация имени
    const safeName = sanitizeFilename(file.name);
    const timestamp = Date.now();
    const uniqueName = `${timestamp}_${safeName}`;

    // Загрузка в Vercel Blob
    const blob = await put(uniqueName, file, {
      access: 'public',
      addRandomSuffix: false,
    });

    return NextResponse.json({
      success: true,
      file: {
        name: safeName,
        url: blob.url,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Ошибка загрузки' }, { status: 500 });
  }
        }
