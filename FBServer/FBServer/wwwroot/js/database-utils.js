// Утилиты для страницы базы данных

// Функция для создания хэша строки
function hashString(str) {
    let hash = 0;
    if (str.length === 0) return hash.toString();
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
}

// Функция для получения кэшированных данных
function getCachedData(key) {
    const cached = appState.cache.get(key);
    if (cached && Date.now() - cached.timestamp < DB_CONFIG.cacheDuration) {
        return cached.data;
    }
    return null;
}

// Функция для сохранения в кэш
function setCachedData(key, data) {
    appState.cache.set(key, {
        data,
        timestamp: Date.now()
    });
}

// Функция для поиска имени пользователя в кэше
function findUserNameInCache(userId) {
    // Поиск в кэше текущей страницы
    const cacheKey = `db_page_${appState.currentPage}`;
    const cachedData = appState.cache.get(cacheKey);
    
    if (cachedData && cachedData.userPreviews) {
        const userData = cachedData.userPreviews.find(user => user.userId == userId);
        if (userData) {
            return userData.fio || 'Неизвестно';
        }
    }
    
    // Поиск во всех страницах кэша
    for (const [key, value] of appState.cache.entries()) {
        if (key.startsWith('db_page_') && value.userPreviews) {
            const userData = value.userPreviews.find(user => user.userId == userId);
            if (userData) {
                return userData.fio || 'Неизвестно';
            }
        }
    }
    
    return 'Неизвестно';
}

// Функция для retry запросов
async function fetchWithRetry(url, options = {}, retries = DB_CONFIG.retryAttempts) {
    for (let i = 0; i < retries; i++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
            }
            
            return response;
        } catch (error) {
            if (i === retries - 1) {
                // Если это последняя попытка, выбрасываем ошибку с более подробной информацией
                if (error.name === 'AbortError') {
                    throw new Error('Превышено время ожидания ответа от сервера');
                } else if (error.message.includes('Failed to fetch')) {
                    throw new Error('Не удается подключиться к серверу. Убедитесь, что сервер запущен.');
                } else {
                    throw error;
                }
            }
            
            // Ждем перед следующей попыткой
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
    }
}

// Функция для показа сообщения об ошибке
function showErrorMessage(message) {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const errorMessage = document.getElementById('errorMessage');
    
    if (loadingIndicator) loadingIndicator.classList.add('hidden');
    if (errorMessage) {
        errorMessage.querySelector('p').textContent = message;
        errorMessage.classList.remove('hidden');
    }
}

// Функция для показа стилизованных уведомлений
function showNotification(message, type = 'info') {
    // Удалить существующие уведомления
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Создать новое уведомление
    const notification = document.createElement('div');
    notification.className = `notification fixed top-4 right-4 z-[10000] p-4 rounded-lg shadow-lg max-w-sm transform transition-all duration-300 ease-in-out`;
    
    // Определить стили в зависимости от типа
    let bgColor, textColor, icon, iconColor;
    switch (type) {
        case 'success':
            bgColor = 'bg-green-900/90';
            textColor = 'text-green-100';
            icon = 'check-circle';
            iconColor = 'text-green-400';
            break;
        case 'error':
            bgColor = 'bg-red-900/90';
            textColor = 'text-red-100';
            icon = 'x-circle';
            iconColor = 'text-red-400';
            break;
        case 'warning':
            bgColor = 'bg-yellow-900/90';
            textColor = 'text-yellow-100';
            icon = 'alert-triangle';
            iconColor = 'text-yellow-400';
            break;
        default:
            bgColor = 'bg-blue-900/90';
            textColor = 'text-blue-100';
            icon = 'info';
            iconColor = 'text-blue-400';
    }
    
    notification.classList.add(bgColor, textColor);
    
    notification.innerHTML = `
        <div class="flex items-start gap-3">
            <div class="flex-shrink-0">
                <i data-feather="${icon}" class="w-5 h-5 ${iconColor}"></i>
            </div>
            <div class="flex-1">
                <p class="text-sm font-medium">${message}</p>
            </div>
            <button class="flex-shrink-0 ml-2 text-current opacity-70 hover:opacity-100 transition-opacity" onclick="this.parentElement.parentElement.remove()">
                <i data-feather="x" class="w-4 h-4"></i>
            </button>
        </div>
    `;
    
    // Добавить в DOM
    document.body.appendChild(notification);
    
    // Заменить иконки
    feather.replace();
    
    // Анимация появления
    requestAnimationFrame(() => {
        notification.style.transform = 'translateX(0)';
        notification.style.opacity = '1';
    });
    
    // Автоматическое скрытие через 5 секунд
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 300);
    }, 5000);
}

