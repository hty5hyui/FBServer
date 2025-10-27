// JavaScript specific to the main page (index.html)

// Функция для обновления статуса системы
async function updateSystemStatus() {
    try {
        const response = await fetchWithRetry(`${API_CONFIG.baseUrl}/status`);
        const data = await response.json();
        
        updateStatusDisplay(data);
        
    } catch (error) {
        showErrorState();
    }
}

// Функция для обновления отображения статуса
function updateStatusDisplay(data) {
    const elements = {
        scryptCount: document.getElementById('scryptCount'),
        dbConnection: document.getElementById('dbConnection'),
        cpuLoad: document.getElementById('cpuLoad'),
        ozuLoad: document.getElementById('ozuLoad')
    };
    
    // Безопасное обновление элементов
    Object.entries(elements).forEach(([key, element]) => {
        if (element) {
            const value = data[key] || 0;
            element.textContent = key.includes('Load') ? `${value}%` : value;
        }
    });
    
    // Убрана анимация увеличения иконок при обновлении статуса
}

// Функция для показа состояния ошибки
function showErrorState() {
    const elements = {
        scryptCount: document.getElementById('scryptCount'),
        dbConnection: document.getElementById('dbConnection'),
        cpuLoad: document.getElementById('cpuLoad'),
        ozuLoad: document.getElementById('ozuLoad')
    };
    
    Object.values(elements).forEach(element => {
        if (element) {
            element.textContent = element.id.includes('Load') ? '0%' : '0';
            element.classList.add('error-state');
        }
    });
}

// Debounced версия обновления статуса (не используется)
// const debouncedUpdateStatus = debounce(updateSystemStatus, 1000);

// Инициализация статуса системы на главной странице
document.addEventListener('DOMContentLoaded', function() {
    // Обновление статуса только на главной странице
    const statusElements = document.querySelectorAll('#scryptCount, #scryptActive, #scryptInactive, #scryptError');
    if (statusElements.length > 0) {
        // Инициализация обновления статуса только если есть элементы статуса
        updateSystemStatus();
        setInterval(updateSystemStatus, 5000);
    }
});
