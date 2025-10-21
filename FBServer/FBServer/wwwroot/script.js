// Shared JavaScript across all pages

// Функция для обновления статуса системы
async function updateSystemStatus() {
    try {
        const response = await fetch('http://localhost:5253/status');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Обновление значений на странице
        document.getElementById('scryptCount').textContent = data.scryptCount || 0;
        document.getElementById('dbConnection').textContent = data.dbConnection || 0;
        document.getElementById('cpuLoad').textContent = (data.cpuLoad || 0) + '%';
        document.getElementById('ozuLoad').textContent = (data.ozuLoad || 0) + '%';
        document.getElementById('memLoad').textContent = (data.memLoad || 0) + '%';
        
        // Обновление текстовых значений для метрик
        document.getElementById('cpuLoadText').textContent = (data.cpuLoad || 0) + '%';
        document.getElementById('ozuLoadText').textContent = (data.ozuLoad || 0) + '%';
        document.getElementById('memLoadText').textContent = (data.memLoad || 0) + '%';
        
        // Обновление индикаторов прогресса
        document.getElementById('cpuBar').style.width = (data.cpuLoad || 0) + '%';
        document.getElementById('ozuBar').style.width = (data.ozuLoad || 0) + '%';
        document.getElementById('memBar').style.width = (data.memLoad || 0) + '%';
        
        // Добавление анимации обновления
        const statusCards = document.querySelectorAll('.status-card');
        statusCards.forEach(card => {
            card.classList.add('loading');
            setTimeout(() => card.classList.remove('loading'), 1000);
        });
        
    } catch (error) {
        console.error('Ошибка при получении статуса:', error);
        
        // Показать состояние ошибки
        const errorElements = document.querySelectorAll('#scryptCount, #dbConnection, #cpuLoad, #ozuLoad, #memLoad');
        errorElements.forEach(element => {
            element.textContent = element.id.includes('Load') ? '0%' : '0';
        });
        
        // Сбросить индикаторы прогресса при ошибке
        document.getElementById('cpuBar').style.width = '0%';
        document.getElementById('ozuBar').style.width = '0%';
        document.getElementById('memBar').style.width = '0%';
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