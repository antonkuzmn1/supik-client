export interface ChangelogCardInterface {
    version: string,
    time: string,
    changes: string[],
}

export const changelogCards: ChangelogCardInterface[] = [
    {
        version: '24.16.2',
        time: '00:30',
        changes: [
            '[00:30] Добавлена возможность добавлять почтовые группы в меню почтового ящика',
        ],
    },
    {
        version: '24.16.1',
        time: '01:10',
        changes: [
            '[01:10] Добавлена возможность синхронизировать почтовые группы',
        ],
    },
    {
        version: '24.16',
        time: '03:10',
        changes: [
            '[00:10] Улучшено отображение кнопок в таблице',
            '[00:00] Уменьшено время ожидания подключение к маршрутизатору до 5 секунд',
            '[03:00] Добавлена возможность скачать архив с набором для VPN подключения',
        ],
    },
    {
        version: '24.15',
        time: '04:50',
        changes: [
            '[04:50] Добавлен раздел управления почтовыми группами',
        ],
    },
    {
        version: '24.14.3',
        time: '00:50',
        changes: [
            '[00:45] Расширено отображение логов в консоли',
            '[00:01] Убрано поле никнейм у почтовых ящиков',
            '[00:02] В таблице почтовых ящиков расширены поля ФИО и уменьшены поля Boolean',
            '[00:02] Добавлена поддержка двойных фамилий для преобразования в формат "Фамилия И. О.',
            '[00:05] Добавлены маски для телефонов в карточке пользователя',
        ],
    },
    {
        version: '24.14.2',
        time: '00:10',
        changes: [
            '[00:10] Ограничены дубликаты логинов для пользователей',
        ],
    },
    {
        version: '24.14.1',
        time: '00:15',
        changes: [
            '[00:15] Исправлена ошибка добавления пароля к почтовому ящику "password.equals_previous"',
        ],
    },
    {
        version: '24.14',
        time: '00:45',
        changes: [
            '[00:45] Добавлена страница с настройками',
        ],
    },
    {
        version: '24.13',
        time: '05:20',
        changes: [
            '[05:20] Добавлен перевод на русский и английский языки',
        ],
    },
    {
        version: '24.12',
        time: '00:45',
        changes: [
            '[00:45] Добавлено сохранение сортировки, теперь она не будет сбрасываться после каждого изменения',
        ],
    },
    {
        version: '24.11.5',
        time: '00:15',
        changes: [
            '[00:05] Убраны символы из словаря для генерации паролей: "1", "0", "l" (маленькая L), "I" (большая i), "O", "o", "J"',
            '[00:10] Изменен алгоритм генерации паролей: теперь пароли всегда содержат цифры',
        ],
    },
    {
        version: '24.11.4',
        time: '01:10',
        changes: [
            '[00:05] Добавлено отображение затраченного времени итого',
            '[00:05] Улучшение структуры кода',
            '[00:05] Добавлено диалоговое окно для информации',
            '[00:30] Добавлена автоматическая блокировака почтовых ящиков при отключении пользователя',
            '[00:25] Добавлена возможность удалять почтовые ящики',
        ],
    },
    {
        version: '24.11.3',
        time: '00:30',
        changes: [
            '[00:10] Добавлено поле Access Mails для Groups',
            '[00:10] Добавлены фильтры для страницы Mails',
            '[00:05] Добавлен обработчик нажатия клавиши Enter на страницу авторизации',
            '[00:05] Добавлен обработчик нажатия клавиши Escape для диалогового окна',
        ],
    },
    {
        version: '24.11.2',
        time: '00:05',
        changes: [
            'Добавлен trim для всех полей (удаление лишних пробелов)',
        ],
    },
    {
        version: '24.11.1',
        time: '00:05',
        changes: [
            'Небольшие изменения стиля страницы Changelog',
        ],
    },
    {
        version: '24.11',
        time: '00:30',
        changes: [
            'Добавлена страница Changelog',
        ],
    },
    {
        version: '24.10.10',
        time: '00:15',
        changes: [
            'Добавлена возможность указать префикс в Routers для создания VPN аккаунтов',
        ],
    },
    {
        version: '24.10.9',
        time: '00:30',
        changes: [
            'Для Users добавлены поля Local Workplace и Cellular',
        ],
    },
    {
        version: '24.10.8',
        time: '00:20',
        changes: [
            'Добавлено автозаполнение полей для VPN',
        ],
    },
    {
        version: '24.10.7',
        time: '00:30',
        changes: [
            'Добавлено поле Default Profile для Routers и убрано поле Profile для VPNs',
        ],
    },
    {
        version: '24.10.6',
        time: '00:05',
        changes: [
            'Исправлена ошибка генерации PDF файла с пустым полями EMails',
        ],
    },
    {
        version: '24.10.5',
        time: '00:05',
        changes: [
            'Убран VID из таблицы VPNs',
        ],
    },
    {
        version: '24.10.4',
        time: '00:05',
        changes: [
            'Убран service из карточки и таблицы VPNs',
        ],
    },
    {
        version: '24.10.3',
        time: '00:05',
        changes: [
            'Экспортируемый файл теперь будет называться ФИО',
        ],
    },
    {
        version: '24.10.2',
        time: '00:05',
        changes: [
            'В Users поле Title переименовано в Post',
        ],
    },
    {
        version: '24.10.1',
        time: '00:10',
        changes: [
            'В выпадающих списках с пользователями добавил сортировку по ФИО',
        ],
    },
    {
        version: '24.10',
        time: '02:00',
        changes: [
            'Добавлено формирование PDF файла для Users',
        ],
    },
    {
        version: '24.9.10',
        time: '00:10',
        changes: [
            'Добавлены поля "workplace" и "phone" для Users',
        ],
    },
    {
        version: '24.9.9',
        time: '00:30',
        changes: [
            'Добавлена запись паролей от почтовых ящиков',
        ],
    },
    {
        version: '24.9.8',
        time: '00:05',
        changes: [
            'Добавлен форматтер для дат',
        ],
    },
    {
        version: '24.9.7',
        time: '00:05',
        changes: [
            'Добавлен скролл в диалог',
        ],
    },
    {
        version: '24.9.6',
        time: '00:10',
        changes: [
            'Добавлены поля External addr и L2TP Key в диалог VPNs',
        ],
    },
    {
        version: '24.9.5',
        time: '00:05',
        changes: [
            'Добавлен генератор паролей в диалог VPNs',
        ],
    },
    {
        version: '24.9.4',
        time: '00:05',
        changes: [
            'Исправлена очистка пароля при создании нового почтового ящика',
        ],
    },
    {
        version: '24.9.3',
        time: '00:15',
        changes: [
            'Добавлено автоподстановление данных User в Mails',
        ],
    },
    {
        version: '24.9.2',
        time: '00:05',
        changes: [
            'Убрано поле Gender для Mails',
        ],
    },
    {
        version: '24.9.1',
        time: '00:05',
        changes: [
            'Скрыт пароль для Users',
        ],
    },
    {
        version: '24.9',
        time: '07:00',
        changes: [
            'Добавлена страница Mails',
        ],
    },
    {
        version: '24.8',
        time: '01:00',
        changes: [
            'Добавлен генератор паролей',
        ],
    },
    {
        version: '24.7.1',
        time: '00:30',
        changes: [
            'Исправлены ошибки логики Departments',
        ],
    },
    {
        version: '24.7',
        time: '02:00',
        changes: [
            'Добавлен новый раздел Departments',
        ],
    },
    {
        version: '24.6.1',
        time: '00:30',
        changes: [
            'Исправлена ошибка отображения диалоговых окно на странице Routers',
        ],
    },
    {
        version: '24.6',
        time: '01:00',
        changes: [
            'Добавлено автоматическое отключение всех VPN аккаунтов пользователя при отключении пользователя',
        ],
    },
    {
        version: '24.5.1',
        time: '00:30',
        changes: [
            'Исправлена ошибка логики проверки на дубликаты IP для VPN',
        ],
    },
    {
        version: '24.5',
        time: '00:20',
        changes: [
            'Добавлена возможность менять положение диалоговых окон',
        ],
    },
    {
        version: '24.4.1',
        time: '00:30',
        changes: [
            'Исправлена ошибка с отображением доступных адресов',
        ],
    },
    {
        version: '24.4',
        time: '02:00',
        changes: [
            'Добавлена проверка на дубликаты IP для VPN',
        ],
    },
    {
        version: '24.3',
        time: '01:00',
        changes: [
            'Добавлен выпадающий список с доступными IP-адресами для VPN',
        ],
    },
    {
        version: '24.2.1',
        time: '00:20',
        changes: [
            'Исправлена ошибка при нажатии на кнопку "Показать пароль" в авторизации',
        ],
    },
    {
        version: '24.2',
        time: '00:30',
        changes: [
            'Добавлена возможность показать пароль',
        ],
    },
    {
        version: '24.1.2',
        time: '01:00',
        changes: [
            'Добавлена выгрузка профилей с подстановкой выпадающим списком',
        ],
    },
    {
        version: '24.1.1',
        time: '00:10',
        changes: [
            'Исправлен фильтр по дате создания',
        ],
    },
    {
        version: '24.1',
        time: '52:00',
        changes: [
            'Релиз',
        ],
    },
]
