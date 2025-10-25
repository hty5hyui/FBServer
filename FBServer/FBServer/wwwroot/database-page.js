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
    isLoading: false,
    searchQuery: null,
    isSearchActive: false
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
    
    const searchKey = appState.searchQuery ? `_search_${hashString(appState.searchQuery)}` : '';
    const cacheKey = `db_page_${page}${searchKey}`;
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
        const response = await fetchWithRetry(`${DB_CONFIG.baseUrl}/Base/all`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                page: page,
                searchQuery: appState.searchQuery
            })
        });
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
            url: `${DB_CONFIG.baseUrl}/Base/all`
        });
        showErrorMessage(`Ошибка загрузки данных: ${error.message}. Проверьте подключение к серверу.`);
    } finally {
        appState.isLoading = false;
    }
}

// Функция для создания поля поиска
function createSearchField(fieldKey = '', fieldValue = '', condition = 'contains') {
    const fieldId = `search_field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return `
        <div class="search-field bg-dark-600/50 rounded-lg p-3 mb-3 border border-dark-500" data-field-id="${fieldId}">
            <div class="flex items-center gap-3">
                <div class="flex-1">
                    <select class="search-field-select w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none">
                        <option value="">Выберите поле</option>
                        ${Object.entries(SEARCH_FIELDS).map(([key, label]) => 
                            `<option value="${key}" ${key === fieldKey ? 'selected' : ''}>${label}</option>`
                        ).join('')}
                    </select>
                </div>
                
                <div class="flex-1">
                    <select class="search-condition-select w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none">
                        <option value="contains" ${condition === 'contains' ? 'selected' : ''}>Содержит</option>
                        <option value="starts_with" ${condition === 'starts_with' ? 'selected' : ''}>Начинается на</option>
                        <option value="not_empty" ${condition === 'not_empty' ? 'selected' : ''}>Не пусто</option>
                        <option value="empty" ${condition === 'empty' ? 'selected' : ''}>Пусто</option>
                    </select>
                </div>
                
                <div class="flex-1">
                    <input type="text" class="search-value-input w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none" 
                           placeholder="Введите значение" value="${fieldValue}" ${condition === 'not_empty' || condition === 'empty' ? 'disabled' : ''}>
                </div>
                
                <button class="remove-search-field-btn bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm transition-colors">
                    <i data-feather="x" class="w-4 h-4"></i>
                </button>
            </div>
        </div>
    `;
}

// Функция для инициализации поиска
function initializeSearch() {
    const toggleSearchBtn = document.getElementById('toggleSearchBtn');
    const searchForm = document.getElementById('searchForm');
    const addSearchFieldBtn = document.getElementById('addSearchFieldBtn');
    const searchBtn = document.getElementById('searchBtn');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    const closeSearchBtn = document.getElementById('closeSearchBtn');
    const searchFieldsContainer = document.getElementById('searchFieldsContainer');
    
    // Переключение видимости формы поиска
    toggleSearchBtn.addEventListener('click', () => {
        searchForm.classList.toggle('hidden');
        if (!searchForm.classList.contains('hidden')) {
            // Если форма открывается и нет полей, добавить одно поле
            if (searchFieldsContainer.children.length === 0) {
                addSearchField();
            }
        }
    });
    
    // Закрытие формы поиска
    closeSearchBtn.addEventListener('click', () => {
        searchForm.classList.add('hidden');
    });
    
    // Добавление поля поиска
    addSearchFieldBtn.addEventListener('click', addSearchField);
    
    // Поиск
    searchBtn.addEventListener('click', performSearch);
    
    // Очистка поиска
    clearSearchBtn.addEventListener('click', clearSearch);
}

// Функция для добавления поля поиска
function addSearchField() {
    const searchFieldsContainer = document.getElementById('searchFieldsContainer');
    const fieldHtml = createSearchField();
    searchFieldsContainer.insertAdjacentHTML('beforeend', fieldHtml);
    
    // Заменить иконки
    feather.replace();
    
    // Добавить обработчики для нового поля
    const newField = searchFieldsContainer.lastElementChild;
    addSearchFieldHandlers(newField);
}

// Функция для добавления обработчиков к полю поиска
function addSearchFieldHandlers(fieldElement) {
    const removeBtn = fieldElement.querySelector('.remove-search-field-btn');
    const conditionSelect = fieldElement.querySelector('.search-condition-select');
    const valueInput = fieldElement.querySelector('.search-value-input');
    
    // Удаление поля
    removeBtn.addEventListener('click', () => {
        fieldElement.remove();
    });
    
    // Обработка изменения условия
    conditionSelect.addEventListener('change', () => {
        const condition = conditionSelect.value;
        if (condition === 'not_empty' || condition === 'empty') {
            valueInput.disabled = true;
            valueInput.value = '';
        } else {
            valueInput.disabled = false;
        }
    });
}

// Функция для выполнения поиска
function performSearch() {
    const searchFields = document.querySelectorAll('.search-field');
    const conditions = [];
    
    searchFields.forEach(field => {
        const fieldSelect = field.querySelector('.search-field-select');
        const conditionSelect = field.querySelector('.search-condition-select');
        const valueInput = field.querySelector('.search-value-input');
        
        const fieldName = fieldSelect.value;
        const condition = conditionSelect.value;
        const value = valueInput.value.trim();
        
        if (fieldName && condition) {
            let sqlCondition = '';
            
            switch (condition) {
                case 'contains':
                    if (value) {
                        // Экранируем одинарные кавычки и другие специальные символы
                        const escapedValue = value.replace(/'/g, "''").replace(/[%_]/g, '\\$&');
                        sqlCondition = `${fieldName} ILIKE '%${escapedValue}%'`;
                    }
                    break;
                case 'starts_with':
                    if (value) {
                        // Экранируем одинарные кавычки и другие специальные символы
                        const escapedValue = value.replace(/'/g, "''").replace(/[%_]/g, '\\$&');
                        sqlCondition = `${fieldName} ILIKE '${escapedValue}%'`;
                    }
                    break;
                case 'not_empty':
                    sqlCondition = `${fieldName} IS NOT NULL AND ${fieldName} != ''`;
                    break;
                case 'empty':
                    sqlCondition = `(${fieldName} IS NULL OR ${fieldName} = '')`;
                    break;
            }
            
            if (sqlCondition) {
                conditions.push(sqlCondition);
            }
        }
    });
    
    if (conditions.length > 0) {
        appState.searchQuery = conditions.join(' AND ');
        appState.isSearchActive = true;
        appState.currentPage = 1; // Сброс на первую страницу при поиске
        
        console.log('Выполняется поиск:', appState.searchQuery);
        loadDatabaseData(1);
    } else {
        alert('Пожалуйста, добавьте хотя бы одно условие поиска');
    }
}

// Функция для очистки поиска
function clearSearch() {
    appState.searchQuery = null;
    appState.isSearchActive = false;
    appState.currentPage = 1;
    
    // Очистить форму
    const searchFieldsContainer = document.getElementById('searchFieldsContainer');
    searchFieldsContainer.innerHTML = '';
    
    console.log('Поиск очищен');
    loadDatabaseData(1);
}

// Функция для retry запросов
async function fetchWithRetry(url, options = {}, retries = DB_CONFIG.retryAttempts) {
    for (let i = 0; i < retries; i++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            
            console.log(`Попытка ${i + 1}/${retries}: запрос к ${url}`);
            
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
            loadUserDetails(userId);
        });
    });
}

// Функция для загрузки подробных данных пользователя
async function loadUserDetails(userId) {
    try {
        console.log('Загрузка подробных данных пользователя:', userId);
        
        const response = await fetchWithRetry(`${DB_CONFIG.baseUrl}/Base/data?idUser=${userId}`, {});
        const userData = await response.json();
        
        console.log('Получены подробные данные:', userData);
        showUserDetailsModal(userData);
        
    } catch (error) {
        console.error('Ошибка при загрузке подробных данных:', error);
        showErrorMessage(`Ошибка загрузки данных пользователя: ${error.message}`);
    }
}

// Функция для показа модального окна с подробными данными
function showUserDetailsModal(userData) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-dark-800 rounded-lg w-full max-w-6xl max-h-[95vh] overflow-hidden">
            <div class="flex items-center justify-between p-6 border-b border-dark-600">
                <h3 class="text-2xl font-bold text-white">Подробные данные пользователя</h3>
                <button id="closeModal" class="text-dark-400 hover:text-white transition-colors">
                    <i data-feather="x" class="w-6 h-6"></i>
                </button>
            </div>
            
            <div class="p-6">
                <div class="grid grid-cols-1 xl:grid-cols-4 gap-6">
                    <!-- Аватар и основная информация -->
                    <div class="xl:col-span-1">
                        <div class="user-info-card rounded-lg p-6">
                            <div class="text-center mb-6">
                                <div class="user-avatar w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden bg-dark-600 flex items-center justify-center">
                                    ${userData.avatarByte ? 
                                        `<img src="data:image/jpeg;base64,${userData.avatarByte}" alt="Аватар" class="w-full h-full object-cover">` :
                                        `<i data-feather="user" class="w-16 h-16 text-dark-400"></i>`
                                    }
                                </div>
                                <h4 class="text-xl font-bold text-white mb-1">${userData.fio || 'Не указано'}</h4>
                                <p class="text-dark-300">ID: ${userData.userId}</p>
                            </div>
                            
                            <div class="space-y-4">
                                <div class="info-item rounded-lg p-4">
                                    <div class="flex items-center gap-3">
                                        <div class="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                            <i data-feather="calendar" class="w-5 h-5 text-blue-400"></i>
                                        </div>
                                        <div>
                                            <p class="text-dark-300 text-xs font-medium mb-1">Дата создания</p>
                                            <p class="text-white text-sm font-semibold">${userData.dateOfCreation || 'Не указано'}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="info-item rounded-lg p-4">
                                    <div class="flex items-center gap-3">
                                        <div class="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                                            <i data-feather="tag" class="w-5 h-5 text-green-400"></i>
                                        </div>
                                        <div>
                                            <p class="text-dark-300 text-xs font-medium mb-1">Категория</p>
                                            <p class="text-white text-sm font-semibold">${userData.category || 'Не указано'}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="info-item rounded-lg p-4">
                                    <div class="flex items-start gap-3">
                                        <div class="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mt-1">
                                            <i data-feather="link" class="w-5 h-5 text-purple-400"></i>
                                        </div>
                                        <div class="flex-1">
                                            <p class="text-dark-300 text-xs font-medium mb-1">Ссылка</p>
                                            <a href="${userData.link}" target="_blank" class="text-blue-400 hover:text-blue-300 underline break-all text-xs leading-relaxed block bg-dark-900/50 p-2 rounded">
                                                ${userData.link}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Вкладки с данными -->
                    <div class="xl:col-span-3">
                        <div class="bg-dark-700 rounded-lg">
                            <!-- Навигация по вкладкам -->
                            <div class="flex border-b border-dark-600">
                                <button class="tab-btn active px-6 py-3 text-sm font-medium text-white border-b-2 border-blue-500" data-tab="contact">
                                    Контакты
                                </button>
                                <button class="tab-btn px-6 py-3 text-sm font-medium text-dark-400 hover:text-white" data-tab="social">
                                    Социальные сети
                                </button>
                                <button class="tab-btn px-6 py-3 text-sm font-medium text-dark-400 hover:text-white" data-tab="work">
                                    Работа и образование
                                </button>
                                <button class="tab-btn px-6 py-3 text-sm font-medium text-dark-400 hover:text-white" data-tab="additional">
                                    Дополнительно
                                </button>
                            </div>
                            
                            <!-- Содержимое вкладок -->
                            <div class="p-6">
                                <!-- Вкладка контактов -->
                                <div id="tab-contact" class="tab-content">
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div class="space-y-4">
                                            <div>
                                                <label class="block text-sm font-medium text-dark-300 mb-1">Мобильный телефон</label>
                                                <p class="text-white">${userData.mobile || 'Не указано'}</p>
                                            </div>
                                            
                                            <div>
                                                <label class="block text-sm font-medium text-dark-300 mb-1">Email</label>
                                                <p class="text-white">${userData.email || 'Не указано'}</p>
                                            </div>
                                            
                                            <div>
                                                <label class="block text-sm font-medium text-dark-300 mb-1">WhatsApp</label>
                                                <p class="text-white">${userData.whatsapp || 'Не указано'}</p>
                                            </div>
                                            
                                            <div>
                                                <label class="block text-sm font-medium text-dark-300 mb-1">Сайт</label>
                                                <p class="text-white">${userData.site || 'Не указано'}</p>
                                            </div>
                                        </div>
                                        
                                        <div class="space-y-4">
                                            <div>
                                                <label class="block text-sm font-medium text-dark-300 mb-1">Город</label>
                                                <p class="text-white">${userData.city || 'Не указано'}</p>
                                            </div>
                                            
                                            <div>
                                                <label class="block text-sm font-medium text-dark-300 mb-1">Домашний адрес</label>
                                                <p class="text-white">${userData.home || 'Не указано'}</p>
                                            </div>
                                            
                                            <div>
                                                <label class="block text-sm font-medium text-dark-300 mb-1">Адрес</label>
                                                <p class="text-white">${userData.address || 'Не указано'}</p>
                                            </div>
                                            
                                            <div>
                                                <label class="block text-sm font-medium text-dark-300 mb-1">Дополнительная контактная информация</label>
                                                <p class="text-white">${userData.anotherContactInfo || 'Не указано'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Вкладка социальных сетей -->
                                <div id="tab-social" class="tab-content hidden">
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div class="space-y-4">
                                            <div>
                                                <label class="block text-sm font-medium text-dark-300 mb-1">Facebook</label>
                                                <p class="text-white">${userData.link || 'Не указано'}</p>
                                            </div>
                                            
                                            <div>
                                                <label class="block text-sm font-medium text-dark-300 mb-1">Instagram</label>
                                                <p class="text-white">${userData.instagram || 'Не указано'}</p>
                                            </div>
                                            
                                            <div>
                                                <label class="block text-sm font-medium text-dark-300 mb-1">VK</label>
                                                <p class="text-white">${userData.vk || 'Не указано'}</p>
                                            </div>
                                            
                                            <div>
                                                <label class="block text-sm font-medium text-dark-300 mb-1">YouTube</label>
                                                <p class="text-white">${userData.youtube || 'Не указано'}</p>
                                            </div>
                                            
                                            <div>
                                                <label class="block text-sm font-medium text-dark-300 mb-1">TikTok</label>
                                                <p class="text-white">${userData.tiktok || 'Не указано'}</p>
                                            </div>
                                        </div>
                                        
                                        <div class="space-y-4">
                                            <div>
                                                <label class="block text-sm font-medium text-dark-300 mb-1">Twitter/X</label>
                                                <p class="text-white">${userData.x || 'Не указано'}</p>
                                            </div>
                                            
                                            <div>
                                                <label class="block text-sm font-medium text-dark-300 mb-1">LinkedIn</label>
                                                <p class="text-white">${userData.linkedin || 'Не указано'}</p>
                                            </div>
                                            
                                            <div>
                                                <label class="block text-sm font-medium text-dark-300 mb-1">Skype</label>
                                                <p class="text-white">${userData.skype || 'Не указано'}</p>
                                            </div>
                                            
                                            <div>
                                                <label class="block text-sm font-medium text-dark-300 mb-1">Snapchat</label>
                                                <p class="text-white">${userData.snapchat || 'Не указано'}</p>
                                            </div>
                                            
                                            <div>
                                                <label class="block text-sm font-medium text-dark-300 mb-1">Другие социальные сети</label>
                                                <p class="text-white">${userData.anotherWebSocialmedia || 'Не указано'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Вкладка работы и образования -->
                                <div id="tab-work" class="tab-content hidden">
                                    <div class="space-y-6">
                                        <div>
                                            <label class="block text-sm font-medium text-dark-300 mb-2">Работа</label>
                                            <p class="text-white">${userData.work || 'Не указано'}</p>
                                        </div>
                                        
                                        <div>
                                            <label class="block text-sm font-medium text-dark-300 mb-2">Дополнительная работа</label>
                                            <p class="text-white">${userData.work1 || 'Не указано'}</p>
                                        </div>
                                        
                                        <div>
                                            <label class="block text-sm font-medium text-dark-300 mb-2">Университет</label>
                                            <p class="text-white">${userData.university || 'Не указано'}</p>
                                        </div>
                                        
                                        <div>
                                            <label class="block text-sm font-medium text-dark-300 mb-2">Дополнительный университет</label>
                                            <p class="text-white">${userData.university1 || 'Не указано'}</p>
                                        </div>
                                        
                                        <div>
                                            <label class="block text-sm font-medium text-dark-300 mb-2">Школа</label>
                                            <p class="text-white">${userData.school || 'Не указано'}</p>
                                        </div>
                                        
                                        <div>
                                            <label class="block text-sm font-medium text-dark-300 mb-2">Дополнительная школа</label>
                                            <p class="text-white">${userData.school1 || 'Не указано'}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Вкладка дополнительной информации -->
                                <div id="tab-additional" class="tab-content hidden">
                                    <div class="space-y-6">
                                        <div>
                                            <label class="block text-sm font-medium text-dark-300 mb-2">Подписчики</label>
                                            <p class="text-white">${userData.subscribers || 'Не указано'}</p>
                                        </div>
                                        
                                        <div>
                                            <label class="block text-sm font-medium text-dark-300 mb-2">Часы работы</label>
                                            <p class="text-white">${userData.openingHours || 'Не указано'}</p>
                                        </div>
                                        
                                        <div>
                                            <label class="block text-sm font-medium text-dark-300 mb-2">Язык</label>
                                            <p class="text-white">${userData.language || 'Не указано'}</p>
                                        </div>
                                        
                                        <div>
                                            <label class="block text-sm font-medium text-dark-300 mb-2">Пол</label>
                                            <p class="text-white">${userData.male || 'Не указано'}</p>
                                        </div>
                                        
                                        <div>
                                            <label class="block text-sm font-medium text-dark-300 mb-2">Местоимения в системе</label>
                                            <p class="text-white">${userData.pronounsInTheSystem || 'Не указано'}</p>
                                        </div>
                                        
                                        <div>
                                            <label class="block text-sm font-medium text-dark-300 mb-2">Другая базовая информация</label>
                                            <p class="text-white">${userData.anotherBasicInformation || 'Не указано'}</p>
                                        </div>
                                        
                                        <div>
                                            <label class="block text-sm font-medium text-dark-300 mb-2">Реклама</label>
                                            <p class="text-white">${userData.reklama || 'Не указано'}</p>
                                        </div>
                                        
                                        <div>
                                            <label class="block text-sm font-medium text-dark-300 mb-2">Информация</label>
                                            <p class="text-white">${userData.info || 'Не указано'}</p>
                                        </div>
                                        
                                        <div>
                                            <label class="block text-sm font-medium text-dark-300 mb-2">Другое</label>
                                            <p class="text-white">${userData.another || 'Не указано'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Заменить иконки
    feather.replace();
    
    // Добавить обработчики событий
    const closeButton = modal.querySelector('#closeModal');
    const tabButtons = modal.querySelectorAll('.tab-btn');
    const tabContents = modal.querySelectorAll('.tab-content');
    
    // Закрытие модального окна
    closeButton.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // Закрытие по клику на фон
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    // Переключение вкладок
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            
            // Убираем активный класс со всех кнопок
            tabButtons.forEach(btn => {
                btn.classList.remove('active', 'border-blue-500', 'text-white');
                btn.classList.add('text-dark-400');
            });
            
            // Добавляем активный класс к текущей кнопке
            button.classList.add('active', 'border-blue-500', 'text-white');
            button.classList.remove('text-dark-400');
            
            // Скрываем все вкладки
            tabContents.forEach(content => {
                content.classList.add('hidden');
            });
            
            // Показываем нужную вкладку
            const targetTab = modal.querySelector(`#tab-${tabId}`);
            if (targetTab) {
                targetTab.classList.remove('hidden');
            }
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
    
    // Инициализировать поиск
    initializeSearch();
    
    // Загрузить данные БД
    console.log('Запуск загрузки данных для страницы:', appState.currentPage);
    loadDatabaseData(appState.currentPage);
});
