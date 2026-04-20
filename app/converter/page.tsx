'use client';

import React, { useState, useRef } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export default function VideoToMp3Converter() {
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [converting, setConverting] = useState(false);
  const [message, setMessage] = useState('');
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  
  const ffmpegRef = useRef<FFmpeg | null>(null);

  // Загрузка FFmpeg wasm в браузер
  const load = async () => {
    if (loaded) return;
    
    setLoading(true);
    setMessage('Загрузка необходимых компонентов...');

    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
    
    const ffmpeg = new FFmpeg();
    
    // Обработка логов для отладки
    ffmpeg.on('log', ({ message }) => {
      console.log(message);
    });

    try {
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      
      ffmpegRef.current = ffmpeg;
      setLoaded(true);
      setMessage('Готов к работе! Выберите видеофайл.');
    } catch (error) {
      console.error(error);
      setMessage('Ошибка загрузки конвертера. Попробуйте обновить страницу.');
    } finally {
      setLoading(false);
    }
  };

  const convertToMp3 = async (file: File) => {
    if (!ffmpegRef.current) return;
    
    setConverting(true);
    setOutputUrl(null);
    setMessage('Конвертация... Это может занять время.');

    const ffmpeg = ffmpegRef.current;

    try {
      // 1. Записываем файл в виртуальную файловую систему FFmpeg
      await ffmpeg.writeFile('input.mp4', await fetchFile(file));

      // 2. Запускаем команду конвертации
      // -i input.mp4: входной файл
      // -vn: отключить видео
      // -acodec libmp3lame: использовать mp3 кодек
      // -q:a 2: качество аудио (2 - хорошее)
      await ffmpeg.exec(['-i', 'input.mp4', '-vn', '-acodec', 'libmp3lame', '-q:a', '2', 'output.mp3']);

      // 3. Читаем результат
      const data = await ffmpeg.readFile('output.mp3');

      // 4. Создаем URL для скачивания
      const blob = new Blob([data], { type: 'audio/mp3' });
      const url = URL.createObjectURL(blob);
      
      setOutputUrl(url);
      setMessage('Конвертация завершена!');
      
      // Очистка виртуальной ФС (опционально, но полезно для памяти)
      await ffmpeg.deleteFile('input.mp4');
      await ffmpeg.deleteFile('output.mp3');

    } catch (error) {
      console.error(error);
      setMessage('Произошла ошибка при конвертации.');
    } finally {
      setConverting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Простая проверка типа файла
      if (!file.type.startsWith('video/')) {
        setMessage('Пожалуйста, выберите видеофайл.');
        return;
      }
      
      convertToMp3(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Видео в MP3</h1>
        
        {!loaded ? (
          <button
            onClick={load}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition duration-200 disabled:opacity-50"
          >
            {loading ? 'Загрузка...' : 'Запустить конвертер'}
          </button>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">{message}</p>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 transition-colors">
              <label className="cursor-pointer block">
                <span className="sr-only">Выберите файл</span>
                <input 
                  type="file" 
                  accept="video/*" 
                  onChange={handleFileChange}
                  disabled={converting}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100
                    disabled:opacity-50
                  "
                />
              </label>
            </div>

            {converting && (
              <div className="animate-pulse text-blue-600 font-medium">
                Идет обработка...
              </div>
            )}

            {outputUrl && (
              <div className="mt-4">
                <a
                  href={outputUrl}
                  download="audio.mp3"
                  className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
                >
                  Скачать MP3
                </a>
              </div>
            )}
          </div>
        )}
        
        <p className="mt-6 text-xs text-gray-400">
          Конвертация происходит в вашем браузере. Файлы не отправляются на сервер.
        </p>
      </div>
    </div>
  );
}
