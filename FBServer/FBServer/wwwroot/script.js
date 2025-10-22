// Shared JavaScript across all pages

// Функция для обновления статуса системы
async function updateSystemStatus() {
    try {
        console.log('Отправка запроса на получение статуса...');
        const response = await fetch('http://localhost:5253/status');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Получены данные статуса:', data);
        
        // Обновление значений на странице
        const scryptCountEl = document.getElementById('scryptCount');
        const dbConnectionEl = document.getElementById('dbConnection');
        const cpuLoadEl = document.getElementById('cpuLoad');
        const ozuLoadEl = document.getElementById('ozuLoad');
        
        if (scryptCountEl) scryptCountEl.textContent = data.scryptCount || 0;
        if (dbConnectionEl) dbConnectionEl.textContent = data.dbConnection || 0;
        if (cpuLoadEl) cpuLoadEl.textContent = (data.cpuLoad || 0) + '%';
        if (ozuLoadEl) ozuLoadEl.textContent = (data.ozuLoad || 0) + '%';
        
        console.log('Статус обновлен:', {
            scryptCount: data.scryptCount || 0,
            dbConnection: data.dbConnection || 0,
            cpuLoad: data.cpuLoad || 0,
            ozuLoad: data.ozuLoad || 0
        });
        
        // Добавление анимации обновления
        const statusCards = document.querySelectorAll('.status-card');
        statusCards.forEach(card => {
            card.classList.add('loading');
            setTimeout(() => card.classList.remove('loading'), 1000);
        });
        
    } catch (error) {
        console.error('Ошибка при получении статуса:', error);
        
        // Показать состояние ошибки
        const scryptCountEl = document.getElementById('scryptCount');
        const dbConnectionEl = document.getElementById('dbConnection');
        const cpuLoadEl = document.getElementById('cpuLoad');
        const ozuLoadEl = document.getElementById('ozuLoad');
        
        if (scryptCountEl) scryptCountEl.textContent = '0';
        if (dbConnectionEl) dbConnectionEl.textContent = '0';
        if (cpuLoadEl) cpuLoadEl.textContent = '0%';
        if (ozuLoadEl) ozuLoadEl.textContent = '0%';
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('ScriptMaster Pro Dashboard loaded');
    
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