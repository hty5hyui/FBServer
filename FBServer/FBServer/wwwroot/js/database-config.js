// Конфигурация и константы для страницы базы данных

// Конфигурация
const DB_CONFIG = {
    get baseUrl() {
        return window.location.origin;
    },
    recordsPerPage: 50,
    cacheDuration: 60000, // 1 минута
    retryAttempts: 3
};

// Состояние приложения
const appState = {
    currentPage: 1,
    totalPages: 1,
    cache: new Map(),
    isLoading: false,
    searchQuery: null,
    isSearchActive: false,
    selectedUsers: new Set(), // Множество ID выделенных пользователей
    isSelectionMode: false, // Режим выделения
    isProcessing: false // Флаг обработки для предотвращения множественных запросов
};

// Конфигурация полей для поиска
const SEARCH_FIELDS = {
    'users.fio': 'ФИО',
    'users.work': 'Работа',
    'users.university': 'Университет',
    'users.school': 'Школа',
    'users.home': 'Домашний адрес',
    'users.city': 'Город',
    'users.another_city': 'Другой город',
    'users.address': 'Адрес',
    'users.mobile': 'Мобильный телефон',
    'users.email': 'Email',
    'users.another_contact_info': 'Дополнительная контактная информация',
    'users.whatsapp': 'WhatsApp',
    'users.site': 'Сайт',
    'users.another_web_socialmedia': 'Другие социальные сети',
    'users.male': 'Пол',
    'users.language': 'Язык',
    'users.opening_hours': 'Часы работы',
    'users.pronouns_in_the_system': 'Местоимения в системе',
    'users.another_basic_information': 'Другая базовая информация',
    'users.category': 'Категория',
    'users.page_id': 'ID страницы',
    'users.date_of_creation': 'Дата создания',
    'users.reklama': 'Реклама',
    'users.info': 'Информация',
    'users.another': 'Другое',
    'users.link': 'Ссылка',
    'users.work1': 'Дополнительная работа',
    'users.university1': 'Дополнительный университет',
    'users.school1': 'Дополнительная школа',
    'users.vk': 'VK',
    'users.instagram': 'Instagram',
    'users.skype': 'Skype',
    'users.linkedin': 'LinkedIn',
    'users.spotify': 'Spotify',
    'users.kakaotalk': 'KakaoTalk',
    'users.youtube': 'YouTube',
    'users.x': 'X (Twitter)',
    'users.tiktok': 'TikTok',
    'users.snapchat': 'Snapchat',
    'users.wechat': 'WeChat',
    'users.threads': 'Threads',
    'users.line': 'Line',
    'users.twitch': 'Twitch',
    'users.askfm': 'Ask.fm',
    'users.pinterest': 'Pinterest',
    'users.soundcloud': 'SoundCloud',
    'users.ok': 'Одноклассники',
    '"Flags"."type"': 'Тип флага',
    '"Flags"."author"': 'Автор флага'
};

