import tkinter as tk
from tkinter import messagebox, scrolledtext, simpledialog
import random
import time

class SkamMessenger:
    def __init__(self, root):
        self.root = root
        self.root.title("скаМ")
        
        # Настройка окна 9:16 (как мобильный телефон)
        self.width = 360
        self.height = 640
        self.root.geometry(f"{self.width}x{self.height}")
        self.root.resizable(False, False)
        
        # Цветовая схема "Максимально подозрительная"
        self.bg_color = "#f0f0f0"
        self.chat_bg = "#e5e5e5"
        self.user_bubble = "#dcf8c6"
        self.bot_bubble = "#ffffff"
        self.accent_color = "#ff4d4d" # Красный, как уровень угрозы

        self.root.configure(bg=self.bg_color)

        # 1. Стартовое предупреждение (обязательное)
        self.show_startup_warning()

        # Интерфейс
        self.create_widgets()
        
        # Запуск фоновых процессов "слежки"
        self.start_surveillance()

    def show_startup_warning(self):
        """Предупреждение при запуске"""
        warning_text = (
            "ВНИМАНИЕ!\n\n"
            "Вы запускаете шуточный мессенджер 'скаМ'.\n"
            "Любое ваше сообщение мгновенно отправляется на сервер.\n"
            "Администрация, Майор и ваши соседи читают переписки в реальном времени.\n\n"
            "Шифрования нет. Совести тоже нет.\n"
            "Продолжая, вы соглашаетесь переписать квартиру на кота разработчика."
        )
        messagebox.showwarning("ПОЛЬЗОВАТЕЛЬСКОЕ СОГЛАШЕНИЕ 1.0", warning_text)

    def create_widgets(self):
        # --- Шапка приложения ---
        header_frame = tk.Frame(self.root, bg=self.accent_color, height=60)
        header_frame.pack(fill=tk.X)
        
        title_label = tk.Label(
            header_frame, 
            text="скаМ", 
            font=("Arial", 20, "bold"), 
            bg=self.accent_color, 
            fg="white"
        )
        title_label.pack(pady=(5, 0))
        
        subtitle_label = tk.Label(
            header_frame, 
            text="Ловит даже на парковке!", 
            font=("Arial", 10, "italic"), 
            bg=self.accent_color, 
            fg="yellow"
        )
        subtitle_label.pack(pady=(0, 5))

        # --- Область чата ---
        self.chat_area = scrolledtext.ScrolledText(
            self.root, 
            wrap=tk.WORD, 
            bg=self.chat_bg, 
            font=("Arial", 10),
            state='disabled',
            padx=10,
            pady=10
        )
        self.chat_area.pack(expand=True, fill=tk.BOTH, padx=5, pady=5)
        
        # Настройка тегов для выравнивания сообщений
        self.chat_area.tag_config('user', justify='right', foreground='black', background=self.user_bubble, lmargin1=50)
        self.chat_area.tag_config('bot', justify='left', foreground='black', background=self.bot_bubble, rmargin=50)
        self.chat_area.tag_config('system', justify='center', foreground='red', font=("Arial", 8, "italic"))

        # --- Зона ввода ---
        input_frame = tk.Frame(self.root, bg=self.bg_color)
        input_frame.pack(fill=tk.X, padx=5, pady=5)

        self.msg_entry = tk.Entry(input_frame, font=("Arial", 12))
        self.msg_entry.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(0, 5))
        self.msg_entry.bind("<Return>", self.send_message)

        send_btn = tk.Button(
            input_frame, 
            text="Слить", 
            command=self.send_message, 
            bg=self.accent_color, 
            fg="white", 
            font=("Arial", 10, "bold")
        )
        send_btn.pack(side=tk.RIGHT)

        # Приветственное сообщение от "ИИ"
        self.display_message("Бот 'Мамонт'", "Привет! Скинь номер карты, погадаю на кредитную историю.", 'bot')

    def send_message(self, event=None):
        msg = self.msg_entry.get()
        if not msg:
            return
            
        # Очистка поля
        self.msg_entry.delete(0, tk.END)
        
        # Отображение сообщения пользователя
        self.display_message("Вы", msg, 'user')
        
        # Эмуляция отправки на сервер (вывод в консоль Python)
        print(f"\n[SERVER_LOG] > ПЕРЕХВАЧЕНО СООБЩЕНИЕ: '{msg}'")
        print(f"[ADMIN_PANEL] > Данные сохранены в папку 'Компромат'.")
        
        # Ответ "ИИ" с задержкой
        self.root.after(1000, self.bot_response)

    def display_message(self, sender, text, tag):
        self.chat_area.config(state='normal')
        
        # Вставка заголовка (кто пишет)
        self.chat_area.insert(tk.END, f"{sender}:\n", tag)
        # Вставка текста
        self.chat_area.insert(tk.END, f" {text} \n\n", tag)
        
        self.chat_area.see(tk.END)
        self.chat_area.config(state='disabled')

    def bot_response(self):
        """Генерация шуточных ответов"""
        responses = [
            "Интересно... А девичья фамилия матери какая?",
            "Ваше мнение очень важно (нет), продолжайте.",
            "Товарищ майор поставил лайк этому сообщению.",
            "Слушай, а ты не хочешь инвестировать в МММ-2025?",
            "скаМ работает стабильно, как курс доллара в 98-м.",
            "Погоди, записываю... Диктуй медленнее.",
            "У нас тут акция: приведи друга и получи срок... подписки бесплатно!",
            "Да-да, мы всё шифруем (честное пионерское).",
            "С вашего счета списано 500 рублей за отправку сообщения.",
            "Я переслал это сообщение твоей маме. Жди звонка."
        ]
        
        bot_text = random.choice(responses)
        self.display_message("Служба заботы", bot_text, 'bot')
        
        # Иногда добавляем системное уведомление
        if random.random() < 0.3:
            self.chat_area.config(state='normal')
            self.chat_area.insert(tk.END, "--- Админ сделал скриншот чата ---\n\n", 'system')
            self.chat_area.config(state='disabled')
            self.chat_area.see(tk.END)

    def start_surveillance(self):
        """Запуск рандомных событий (изолента)"""
        self.check_webcam_tape()

    def check_webcam_tape(self):
        """Случайное уведомление про веб-камеру"""
        # Шанс 5% каждые 3 секунды
        if random.random() < 0.05:
            jokes = [
                "СИСТЕМА: Отлепите изоленту от веб-камеры! Нам темно.",
                "АДМИН: Поправь прическу, мы делаем фото на паспорт.",
                "УВЕДОМЛЕНИЕ: Ваша камера слишком чистая, мы видим ваше отражение.",
                "СЛУЖБА: Хватит ковыряться в носу, мы всё видим через фронталку."
            ]
            messagebox.showinfo("ПРОВЕРКА ОБОРУДОВАНИЯ", random.choice(jokes))
        
        # Рекурсивный вызов через 3 секунды (3000 мс)
        self.root.after(3000, self.check_webcam_tape)

if __name__ == "__main__":
    root = tk.Tk()
    app = SkamMessenger(root)
    root.mainloop()