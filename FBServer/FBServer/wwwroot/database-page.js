// Скрипт для страницы базы данных

// Конфигурация
const DB_CONFIG = {
    baseUrl: 'http://localhost:5253',
    recordsPerPage: 50,
    cacheDuration: 60000, // 1 минута
    retryAttempts: 3
};

// Состояние приложения
const appState = {
    currentPage: 1,
    totalPages: 1,
    cache: new Map(),
    isLoading: false
};

// Функция для получения кэшированных данных
function getCachedData(key) {
    // Временно отключаем кэш для отладки
    // const cached = appState.cache.get(key);
    // if (cached && Date.now() - cached.timestamp < DB_CONFIG.cacheDuration) {
    //     return cached.data;
    // }
    return null;
}

// Функция для сохранения в кэш
function setCachedData(key, data) {
    appState.cache.set(key, {
        data,
        timestamp: Date.now()
    });
}

// Функция для загрузки данных БД
async function loadDatabaseData(page = 1) {
    if (appState.isLoading) return;
    
    console.log('Загрузка данных БД, страница:', page);
    
    const cacheKey = `db_page_${page}`;
    const cachedData = getCachedData(cacheKey);
    
    if (cachedData) {
        console.log('Используем кэшированные данные');
        appState.currentPage = page;
        appState.totalPages = cachedData.pageCount || 1;
        displayDatabaseData(cachedData.userPreviews || []);
        updatePagination();
        return;
    }
    
    appState.isLoading = true;
    appState.currentPage = page;
    
    const loadingIndicator = document.getElementById('loadingIndicator');
    const errorMessage = document.getElementById('errorMessage');
    const tableContainer = document.getElementById('tableContainer');
    
    // Показать индикатор загрузки
    if (loadingIndicator) loadingIndicator.classList.remove('hidden');
    if (errorMessage) errorMessage.classList.add('hidden');
    if (tableContainer) tableContainer.innerHTML = '';
    
    try {
        console.log('Загружаем данные...');
        const response = await fetchWithRetry(`${DB_CONFIG.baseUrl}/Base/all?page=${page}`);
        console.log('Ответ сервера:', response.status);
        
        const responseData = await response.json();
        console.log('Получены данные БД:', responseData);
        
        // Обновить информацию о пагинации
        appState.totalPages = responseData.pageCount || 1;
        const userData = responseData.userPreviews || [];
        
        // Сохраняем в кэш
        setCachedData(cacheKey, responseData);
        
        console.log('Обновлена информация о пагинации:', { 
            currentPage: appState.currentPage, 
            totalPages: appState.totalPages, 
            userCount: userData.length 
        });
        
        // Скрыть индикатор загрузки
        if (loadingIndicator) loadingIndicator.classList.add('hidden');
        
        // Отобразить данные в таблице
        displayDatabaseData(userData);
        
        // Обновить пагинацию после загрузки данных
        updatePagination();
        
    } catch (error) {
        console.error('Ошибка при загрузке данных БД:', error);
        console.error('Детали ошибки:', {
            message: error.message,
            stack: error.stack,
            url: `${DB_CONFIG.baseUrl}/Base/all?page=${page}`
        });
        showErrorMessage(`Ошибка загрузки данных: ${error.message}. Проверьте подключение к серверу.`);
    } finally {
        appState.isLoading = false;
    }
}

// Функция для retry запросов
async function fetchWithRetry(url, retries = DB_CONFIG.retryAttempts) {
    for (let i = 0; i < retries; i++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            
            console.log(`Попытка ${i + 1}/${retries}: запрос к ${url}`);
            
            const response = await fetch(url, {
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
            }
            
            return response;
        } catch (error) {
            console.error(`Попытка ${i + 1} неудачна:`, error.message);
            
            if (i === retries - 1) {
                // Если это последняя попытка, выбрасываем ошибку с более подробной информацией
                if (error.name === 'AbortError') {
                    throw new Error('Превышено время ожидания ответа от сервера');
                } else if (error.message.includes('Failed to fetch')) {
                    throw new Error('Не удается подключиться к серверу. Убедитесь, что сервер запущен на порту 5253');
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

// Функция для отображения данных в таблице
function displayDatabaseData(data) {
    const tableContainer = document.getElementById('tableContainer');
    if (!tableContainer) return;
    
    if (!data || data.length === 0) {
        tableContainer.innerHTML = `
            <div class="text-center py-8 text-dark-300">
                <i data-feather="database" class="w-8 h-8 mx-auto mb-2"></i>
                <p>Данные не найдены</p>
            </div>
        `;
        feather.replace();
        return;
    }
    
    // Создаем таблицу
    tableContainer.innerHTML = `
        <div class="database-table">
            <table class="w-full text-sm text-left">
                <thead>
                    <tr>
                        <th scope="col" class="w-16">№</th>
                        <th scope="col">ФИО</th>
                        <th scope="col">Ссылка</th>
                        <th scope="col">Подписчики</th>
                        <th scope="col">Мобильный</th>
                        <th scope="col">Email</th>
                        <th scope="col">Действия</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map((item, index) => {
                        const recordNumber = (appState.currentPage - 1) * DB_CONFIG.recordsPerPage + index + 1;
                        return `
                        <tr>
                            <td class="text-center text-dark-400 font-medium">${recordNumber}</td>
                            <td class="font-medium text-white">${item.fio || 'Не указано'}</td>
                            <td>
                                <a href="${item.link}" target="_blank" class="text-blue-400 hover:text-blue-300 underline">
                                    ${item.link}
                                </a>
                            </td>
                            <td class="text-dark-300">${item.subscribers || 'Не указано'}</td>
                            <td class="text-dark-300">${item.mobile || 'Не указано'}</td>
                            <td class="text-dark-300">${item.email || 'Не указано'}</td>
                            <td>
                                <button class="script-btn script-view bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors" data-user-id="${item.userId}">
                                    <i data-feather="eye" class="w-4 h-4"></i>
                                    Обзор
                                </button>
                            </td>
                        </tr>
                    `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    // Заменить иконки
    feather.replace();
    
    // Принудительно применить стили после обновления DOM
    requestAnimationFrame(() => {
        const table = tableContainer.querySelector('.database-table');
        if (table) {
            // Принудительно пересчитать стили
            table.style.transform = 'translateZ(0)';
            table.offsetHeight; // Принудительный reflow
            table.style.transform = '';
            
            // Дополнительная проверка стилей
            const computedStyle = window.getComputedStyle(table);
            if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden') {
                table.style.display = 'block';
                table.style.visibility = 'visible';
            }
        }
    });
    
    // Добавить обработчики для кнопок обзора
    addViewButtonHandlers();
}

// Функция для добавления обработчиков кнопок обзора
function addViewButtonHandlers() {
    const viewButtons = document.querySelectorAll('.script-view');
    
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const userId = this.getAttribute('data-user-id');
            console.log('Обзор пользователя:', userId);
            // TODO: Реализовать функционал обзора
        });
    });
}

// Функция для обновления пагинации
function updatePagination() {
    const paginationContainer = document.getElementById('paginationContainer');
    if (!paginationContainer) {
        console.error('Элемент paginationContainer не найден');
        return;
    }
    
    console.log('Обновление пагинации:', { 
        currentPage: appState.currentPage, 
        totalPages: appState.totalPages 
    });
    
    paginationContainer.innerHTML = `
        <div class="pagination-container">
            <div class="flex items-center gap-2">
                <button id="prevPage" class="pagination-button" ${appState.currentPage <= 1 ? 'disabled' : ''}>
                    <i data-feather="chevron-left" class="w-4 h-4"></i>
                    Предыдущая
                </button>
                <span class="text-dark-300 px-4">
                    Страница ${appState.currentPage} из ${appState.totalPages}
                </span>
                <button id="nextPage" class="pagination-button" ${appState.currentPage >= appState.totalPages ? 'disabled' : ''}>
                    Следующая
                    <i data-feather="chevron-right" class="w-4 h-4"></i>
                </button>
            </div>
        </div>
    `;
    
    // Заменить иконки
    feather.replace();
    
    // Добавить обработчики событий
    const prevButton = document.getElementById('prevPage');
    const nextButton = document.getElementById('nextPage');
    
    if (prevButton) {
        prevButton.addEventListener('click', function() {
            console.log('Нажата кнопка "Предыдущая"', { 
                currentPage: appState.currentPage, 
                totalPages: appState.totalPages 
            });
            if (appState.currentPage > 1) {
                loadDatabaseData(appState.currentPage - 1);
            }
        });
    }
    
    if (nextButton) {
        nextButton.addEventListener('click', function() {
            console.log('Нажата кнопка "Следующая"', { 
                currentPage: appState.currentPage, 
                totalPages: appState.totalPages 
            });
            if (appState.currentPage < appState.totalPages) {
                loadDatabaseData(appState.currentPage + 1);
            }
        });
    }
}


// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('Страница базы данных загружена');
    console.log('Состояние приложения:', appState);
    
    // Загрузить данные БД
    console.log('Запуск загрузки данных для страницы:', appState.currentPage);
    loadDatabaseData(appState.currentPage);
});
