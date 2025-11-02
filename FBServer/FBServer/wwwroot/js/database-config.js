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
    'fio': 'ФИО',
    'work': 'Работа',
    'university': 'Университет',
    'school': 'Школа',
    'home': 'Домашний адрес',
    'city': 'Город',
    'another_city': 'Другой город',
    'address': 'Адрес',
    'mobile': 'Мобильный телефон',
    'email': 'Email',
    'another_contact_info': 'Дополнительная контактная информация',
    'whatsapp': 'WhatsApp',
    'site': 'Сайт',
    'another_web_socialmedia': 'Другие социальные сети',
    'male': 'Пол',
    'language': 'Язык',
    'opening_hours': 'Часы работы',
    'pronouns_in_the_system': 'Местоимения в системе',
    'another_basic_information': 'Другая базовая информация',
    'category': 'Категория',
    'page_id': 'ID страницы',
    'date_of_creation': 'Дата создания',
    'reklama': 'Реклама',
    'info': 'Информация',
    'another': 'Другое',
    'link': 'Ссылка',
    'work1': 'Дополнительная работа',
    'university1': 'Дополнительный университет',
    'school1': 'Дополнительная школа',
    'vk': 'VK',
    'instagram': 'Instagram',
    'skype': 'Skype',
    'linkedin': 'LinkedIn',
    'check_link': 'Проверка ссылки',
    'spotify': 'Spotify',
    'kakaotalk': 'KakaoTalk',
    'youtube': 'YouTube',
    'x': 'X (Twitter)',
    'tiktok': 'TikTok',
    'snapchat': 'Snapchat',
    'wechat': 'WeChat',
    'threads': 'Threads',
    'line': 'Line',
    'twitch': 'Twitch',
    'askfm': 'Ask.fm',
    'pinterest': 'Pinterest',
    'soundcloud': 'SoundCloud',
    'ok': 'Одноклассники'
};

