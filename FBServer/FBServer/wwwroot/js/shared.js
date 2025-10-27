// Shared JavaScript across all pages

// Конфигурация API
const API_CONFIG = {
    baseUrl: 'http://localhost:5253',
    timeout: 10000,
    retryAttempts: 3,
    retryDelay: 1000
};

// Кэш для хранения данных
const cache = new Map();
const CACHE_DURATION = 30000; // 30 секунд

// Функция для debounce
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Функция для retry запросов
async function fetchWithRetry(url, options = {}, retries = API_CONFIG.retryAttempts) {
    for (let i = 0; i < retries; i++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);
            
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return response;
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, API_CONFIG.retryDelay * (i + 1)));
        }
    }
}

// Функция для форматирования чисел
function formatNumber(num) {
    return new Intl.NumberFormat('ru-RU').format(num);
}

// Функция для определения цвета статуса на основе значения
function getStatusColor(value) {
    if (value < 50) return 'text-green-400';
    if (value < 80) return 'text-yellow-400';
    return 'text-red-400';
}

// Функция для определения цвета фона на основе значения
function getStatusBgColor(value) {
    if (value < 50) return 'bg-green-500/20';
    if (value < 80) return 'bg-yellow-500/20';
    return 'bg-red-500/20';
}

// Общие обработчики для навигационных карточек
document.addEventListener('DOMContentLoaded', function() {
    // Добавить обработчики для карточек навигации
    const navCards = document.querySelectorAll('.card');
    navCards.forEach(card => {
        card.addEventListener('click', function() {
            const link = this.querySelector('a');
            if (link) {
                window.location.href = link.href;
            }
        });
    });
});
