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

// Функции для работы с выделенными пользователями в localStorage
function saveSelectedUsers() {
    // Собираем данные о выделенных пользователях с именами
    const selectedUsersData = Array.from(appState.selectedUsers).map(userId => {
        // Пытаемся найти имя в текущей таблице
        const checkbox = document.querySelector(`[data-user-id="${userId}"]`);
        let name = 'Неизвестно';
        
        if (checkbox) {
            const tableRow = checkbox.closest('tr');
            const fioCell = tableRow.querySelector('td:nth-child(3)');
            name = fioCell ? fioCell.textContent.trim() : 'Неизвестно';
        } else {
            // Если не найдено в таблице, пытаемся найти в кэше
            name = findUserNameInCache(userId);
        }
        
        return {
            id: userId,
            name: name
        };
    });
    
    // Проверяем, есть ли хотя бы одно имя, отличное от "Неизвестно"
    const hasValidNames = selectedUsersData.some(user => user.name !== 'Неизвестно');
    
    if (hasValidNames) {
        localStorage.setItem('selectedUsers', JSON.stringify(selectedUsersData));
    } else {
        // Но все равно попробуем обновить существующие данные
        updateUserNamesInStorage();
    }
}

function loadSelectedUsers() {
    try {
        const saved = localStorage.getItem('selectedUsers');
        if (saved) {
            const selectedData = JSON.parse(saved);
            
            // Проверяем, новая ли это структура (с именами) или старая (только ID)
            if (Array.isArray(selectedData) && selectedData.length > 0) {
                if (typeof selectedData[0] === 'object' && selectedData[0].id) {
                    // Новая структура с именами
                    const selectedIds = selectedData.map(user => user.id);
                    appState.selectedUsers = new Set(selectedIds);
                } else {
                    // Старая структура (только ID)
                    appState.selectedUsers = new Set(selectedData);
                }
            } else {
                appState.selectedUsers = new Set();
            }
        }
    } catch (error) {
        // Если ошибка при чтении, очищаем localStorage
        localStorage.removeItem('selectedUsers');
        appState.selectedUsers = new Set();
    }
}

function clearSelectedUsers() {
    appState.selectedUsers.clear();
    localStorage.removeItem('selectedUsers');
}

// Функция для обновления только имен в существующих данных
function updateUserNamesInStorage() {
    try {
        const saved = localStorage.getItem('selectedUsers');
        if (saved) {
            const selectedData = JSON.parse(saved);
            
            // Обновляем имена только для тех, у кого имя "Неизвестно"
            let updated = false;
            const updatedData = selectedData.map(user => {
                if (user.name === 'Неизвестно') {
                    const newName = findUserNameInCache(user.id);
                    if (newName !== 'Неизвестно') {
                        updated = true;
                        console.log(`Обновлено имя для ${user.id}: "${newName}"`);
                        return { ...user, name: newName };
                    }
                }
                return user;
            });
            
            if (updated) {
                localStorage.setItem('selectedUsers', JSON.stringify(updatedData));
                console.log('Обновлены имена в localStorage:', updatedData);
            }
        }
    } catch (error) {
        console.log('Ошибка при обновлении имен:', error);
    }
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

// Функция для обновления состояния чекбоксов на основе сохраненных выделений
function updateCheckboxesFromSelection() {
    const userCheckboxes = document.querySelectorAll('.user-checkbox');
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    
    // Временная отладка
    console.log('Обновление чекбоксов:', {
        totalCheckboxes: userCheckboxes.length,
        selectedUsers: Array.from(appState.selectedUsers),
        selectedCount: appState.selectedUsers.size
    });
    
    // Обновить состояние отдельных чекбоксов
    userCheckboxes.forEach(checkbox => {
        const userId = checkbox.getAttribute('data-user-id');
        const isSelected = appState.selectedUsers.has(userId);
        checkbox.checked = isSelected;
        
        // Обновить стиль строки
        const row = checkbox.closest('tr');
        if (row) {
            if (isSelected) {
                row.classList.add('bg-blue-900/20', 'border-l-4', 'border-blue-500');
            } else {
                row.classList.remove('bg-blue-900/20', 'border-l-4', 'border-blue-500');
            }
        }
    });
    
    // Обновить состояние "Выделить все"
    if (selectAllCheckbox && userCheckboxes.length > 0) {
        const checkedCount = userCheckboxes.length;
        const selectedCount = Array.from(userCheckboxes).filter(cb => cb.checked).length;
        
        if (selectedCount === 0) {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = false;
        } else if (selectedCount === checkedCount) {
            selectAllCheckbox.checked = true;
            selectAllCheckbox.indeterminate = false;
        } else {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = true;
        }
    }
}

// Функция для загрузки данных БД
async function loadDatabaseData(page = 1) {
    if (appState.isLoading) return;
    
    
    const searchKey = appState.searchQuery ? `_search_${hashString(appState.searchQuery)}` : '';
    const cacheKey = `db_page_${page}${searchKey}`;
    const cachedData = getCachedData(cacheKey);
    
    if (cachedData) {
        appState.currentPage = page;
        appState.totalPages = cachedData.pageCount || 1;
        displayDatabaseData(cachedData.userPreviews || []);
        updatePagination();
        updateCheckboxesFromSelection(); // Обновить чекбоксы после загрузки из кэша
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
        
        const responseData = await response.json();
        
        // Обновить информацию о пагинации
        appState.totalPages = responseData.pageCount || 1;
        const userData = responseData.userPreviews || [];
        
        // Сохраняем в кэш
        setCachedData(cacheKey, responseData);
        
        
        // Скрыть индикатор загрузки
        if (loadingIndicator) loadingIndicator.classList.add('hidden');
        
        // Отобразить данные в таблице
        displayDatabaseData(userData);
        
        // Обновить пагинацию после загрузки данных
        updatePagination();
        
        // Обновить чекбоксы после загрузки новых данных
        updateCheckboxesFromSelection();
        
    } catch (error) {
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
    
    loadDatabaseData(1);
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
                        <th scope="col" class="w-12">
                            <input type="checkbox" id="selectAllCheckbox" class="select-all-checkbox" style="display: ${appState.isSelectionMode ? 'block' : 'none'};">
                        </th>
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
                        const isSelected = appState.selectedUsers.has(item.userId);
                        return `
                        <tr class="${isSelected ? 'bg-blue-900/20 border-l-4 border-blue-500' : ''}">
                            <td class="text-center">
                                <input type="checkbox" class="user-checkbox" data-user-id="${item.userId}" ${isSelected ? 'checked' : ''} style="display: ${appState.isSelectionMode ? 'block' : 'none'};">
                            </td>
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
    
    // Добавить обработчики для чекбоксов выделения
    addSelectionHandlers();
    
    // Обновить UI выделения после создания таблицы
    updateSelectionUI();
    
    // Обновить состояние чекбокса "Выделить все"
    updateSelectAllCheckbox();
    
    // Принудительно обновить состояние чекбоксов на основе сохраненных данных
    updateCheckboxesFromSelection();
    
    // Обновить сохраненные имена для выделенных пользователей
    if (appState.selectedUsers.size > 0) {
        updateUserNamesInStorage(); // Обновляем только имена, не перезаписывая данные
    }
}

// Функция для добавления обработчиков выделения
function addSelectionHandlers() {
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    const userCheckboxes = document.querySelectorAll('.user-checkbox');
    
    // Обработчик для "Выделить все"
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            const isChecked = this.checked;
            userCheckboxes.forEach(checkbox => {
                checkbox.checked = isChecked;
                const userId = checkbox.getAttribute('data-user-id');
                if (isChecked) {
                    appState.selectedUsers.add(userId);
                } else {
                    appState.selectedUsers.delete(userId);
                }
            });
            updateSelectionUI();
            
            // Принудительно сохраняем имена при выделении
            setTimeout(() => {
                saveSelectedUsers();
            }, 100); // Небольшая задержка для обновления DOM
        });
    }
    
    // Обработчики для отдельных пользователей
    userCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const userId = this.getAttribute('data-user-id');
            if (this.checked) {
                appState.selectedUsers.add(userId);
            } else {
                appState.selectedUsers.delete(userId);
            }
            updateSelectAllCheckbox();
            updateSelectionUI();
            
            // Принудительно сохраняем имена при выделении
            setTimeout(() => {
                saveSelectedUsers();
            }, 100); // Небольшая задержка для обновления DOM
        });
    });
}

// Функция для обновления состояния "Выделить все"
function updateSelectAllCheckbox() {
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    const userCheckboxes = document.querySelectorAll('.user-checkbox');
    
    if (selectAllCheckbox && userCheckboxes.length > 0) {
        const checkedCount = Array.from(userCheckboxes).filter(cb => cb.checked).length;
        selectAllCheckbox.checked = checkedCount === userCheckboxes.length;
        selectAllCheckbox.indeterminate = checkedCount > 0 && checkedCount < userCheckboxes.length;
    }
}

// Функция для обновления UI выделения
function updateSelectionUI() {
    const selectedCount = document.getElementById('selectedCount');
    const selectedUsersTooltipList = document.getElementById('selectedUsersTooltipList');
    const selectionPanel = document.getElementById('selectionPanel');
    
    if (selectedCount) {
        selectedCount.textContent = appState.selectedUsers.size;
    }
    
    if (appState.selectedUsers.size > 0 && appState.isSelectionMode) {
        if (selectionPanel) {
            selectionPanel.classList.remove('hidden');
        }
        
        if (selectedUsersTooltipList) {
            // Получаем данные о выделенных пользователях из текущей страницы
            const currentPageUsers = Array.from(document.querySelectorAll('.user-checkbox:checked'))
                .map(cb => {
                    const row = cb.closest('tr');
                    const fioCell = row.querySelector('td:nth-child(3)');
                    return fioCell ? fioCell.textContent.trim() : 'Неизвестно';
                });
            
            if (currentPageUsers.length > 0) {
                selectedUsersTooltipList.innerHTML = `
                    <div class="font-medium text-blue-300 mb-2">На текущей странице:</div>
                    <div class="space-y-1">
                        ${currentPageUsers.map(fio => `<div class="text-sm">• ${fio}</div>`).join('')}
                    </div>
                    ${appState.selectedUsers.size > currentPageUsers.length ? 
                        `<div class="text-xs text-gray-400 mt-2">И еще ${appState.selectedUsers.size - currentPageUsers.length} на других страницах</div>` : ''
                    }
                `;
            } else {
                selectedUsersTooltipList.innerHTML = `
                    <div class="text-sm text-gray-400">
                        Выделено ${appState.selectedUsers.size} пользователей на других страницах
                    </div>
                `;
            }
        }
    } else {
        if (selectionPanel) {
            selectionPanel.classList.add('hidden');
        }
    }
}

// Функция для инициализации выделения
function initializeSelection() {
    const toggleSelectionBtn = document.getElementById('toggleSelectionBtn');
    const clearSelectionBtn = document.getElementById('clearSelectionBtn');
    
    // Переключение режима выделения
    if (toggleSelectionBtn) {
        toggleSelectionBtn.addEventListener('click', () => {
            appState.isSelectionMode = !appState.isSelectionMode;
            
            if (appState.isSelectionMode) {
                toggleSelectionBtn.classList.add('bg-blue-600', 'text-white');
                toggleSelectionBtn.classList.remove('btn-secondary');
                toggleSelectionBtn.innerHTML = '<i data-feather="check-square" class="w-4 h-4"></i> Режим выделения';
            } else {
                toggleSelectionBtn.classList.remove('bg-blue-600', 'text-white');
                toggleSelectionBtn.classList.add('btn-secondary');
                toggleSelectionBtn.innerHTML = '<i data-feather="check-square" class="w-4 h-4"></i> Выделение';
            }
            
            // Показать/скрыть чекбоксы
            const checkboxes = document.querySelectorAll('.user-checkbox, .select-all-checkbox');
            checkboxes.forEach(cb => {
                cb.style.display = appState.isSelectionMode ? 'block' : 'none';
            });
            
            // Показать/скрыть панель выделения
            const selectionPanel = document.getElementById('selectionPanel');
            if (selectionPanel) {
                if (appState.isSelectionMode) {
                    selectionPanel.classList.remove('hidden');
                } else {
                    selectionPanel.classList.add('hidden');
                }
            }
            
            feather.replace();
        });
    }
    
    // Убедиться, что панель выделения скрыта по умолчанию
    const selectionPanel = document.getElementById('selectionPanel');
    if (selectionPanel) {
        selectionPanel.classList.add('hidden');
    }
    
    // Обработка выделенных пользователей
    const processSelectionBtn = document.getElementById('processSelectionBtn');
    if (processSelectionBtn) {
        processSelectionBtn.addEventListener('click', () => {
            if (appState.selectedUsers.size === 0) {
                alert('Выберите пользователей для обработки');
                return;
            }
            showProcessModal();
        });
    }
    
    // Очистка выделения
    if (clearSelectionBtn) {
        clearSelectionBtn.addEventListener('click', () => {
            clearSelectedUsers(); // Используем функцию очистки с localStorage
            
            // Снять выделение со всех чекбоксов
            const checkboxes = document.querySelectorAll('.user-checkbox');
            checkboxes.forEach(cb => {
                cb.checked = false;
            });
            
            updateSelectAllCheckbox();
            updateSelectionUI();
        });
    }
}

// Функция для показа модального окна обработки
function showProcessModal() {
    const modal = document.getElementById('processModal');
    const selectedUsersList = document.getElementById('selectedUsersList');
    
    if (!modal || !selectedUsersList) {
        return;
    }
    
    // Заполнить список выделенных пользователей
    const selectedIds = Array.from(appState.selectedUsers);
    
    if (selectedIds.length === 0) {
        selectedUsersList.innerHTML = '<tr><td class="text-center py-8 text-dark-300">Нет выделенных пользователей</td></tr>';
        modal.classList.remove('hidden');
        return;
    }
    
    // Принудительно обновить имена в localStorage перед отображением
    console.log('Обновляем имена перед показом модального окна');
    updateUserNamesInStorage();
    
    // Создаем HTML для выделенных пользователей
    const selectedUsersHtml = selectedIds.map(userId => {
        let fio = 'Неизвестно';
        let source = 'не найдено';
        
        // Сначала пытаемся найти имя в сохраненных данных
        const savedData = localStorage.getItem('selectedUsers');
        console.log('Проверяем сохраненные данные для userId:', userId);
        console.log('Сохраненные данные:', savedData);
        
        if (savedData) {
            try {
                const selectedData = JSON.parse(savedData);
                console.log('Распарсенные данные:', selectedData);
                const userData = selectedData.find(user => user.id === userId);
                console.log('Найденные данные пользователя:', userData);
                
                if (userData && userData.name) {
                    fio = userData.name;
                    source = 'localStorage';
                }
            } catch (error) {
                console.log('Ошибка при чтении сохраненных данных:', error);
            }
        }
        
        // Если не найдено в сохраненных данных, ищем в текущей таблице
        if (fio === 'Неизвестно') {
            const checkbox = document.querySelector(`[data-user-id="${userId}"]`);
            
            if (checkbox) {
                const tableRow = checkbox.closest('tr');
                const fioCell = tableRow.querySelector('td:nth-child(3)');
                fio = fioCell ? fioCell.textContent.trim() : 'Неизвестно';
                source = 'текущая таблица';
            } else {
                // Ищем в кэше
                fio = findUserNameInCache(userId);
                source = 'кэш';
            }
        }
        
        console.log(`Имя для ${userId}: "${fio}" (источник: ${source})`);
        
        return `<tr class="bg-dark-600 hover:bg-dark-500 transition-colors">
            <td class="px-3 py-2 text-white">${fio}</td>
        </tr>`;
    }).join('');
    
    selectedUsersList.innerHTML = selectedUsersHtml || '<tr><td class="text-center py-8 text-dark-300">Нет выделенных пользователей</td></tr>';
    
    // Показать модальное окно
    modal.classList.remove('hidden');
    
    // Заменить иконки
    feather.replace();
    
    // Добавить обработчики
    addProcessModalHandlers();
}

// Функция для добавления обработчиков модального окна обработки
function addProcessModalHandlers() {
    const modal = document.getElementById('processModal');
    const closeBtn = document.getElementById('closeProcessModal');
    const cancelBtn = document.getElementById('cancelProcessBtn');
    const startBtn = document.getElementById('startProcessBtn');
    const processType = document.getElementById('processType');
    
    // Закрытие модального окна
    const closeModal = () => {
        modal.classList.add('hidden');
    };
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeModal);
    }
    
    // Закрытие по клику на фон
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Запуск обработки
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            const selectedType = processType.value;
            if (!selectedType) {
                alert('Выберите тип обработки');
                return;
            }
            
            startProcess(selectedType);
        });
    }
}

// Функция для запуска обработки
async function startProcess(processType) {
    const startBtn = document.getElementById('startProcessBtn');
    const selectedIds = Array.from(appState.selectedUsers);
    
    if (selectedIds.length === 0) {
        showNotification('Нет выделенных пользователей для обработки', 'error');
        return;
    }
    
    // Проверить, не выполняется ли уже обработка
    if (appState.isProcessing) {
        showNotification('Обработка уже выполняется, пожалуйста, подождите', 'warning');
        return;
    }
    
    // Установить флаг обработки
    appState.isProcessing = true;
    
    // Показать состояние загрузки
    startBtn.disabled = true;
    startBtn.innerHTML = '<i data-feather="loader" class="w-4 h-4 animate-spin"></i> Обработка...';
    feather.replace();
    
    try {
        let response;
        
        switch (processType) {
            case 'friends_analyse':
                response = await fetchWithRetry(`${DB_CONFIG.baseUrl}/Operation/frendsAnalyse`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(selectedIds)
                });
                break;
            default:
                throw new Error('Неизвестный тип обработки');
        }
        
        if (response.ok) {
            showNotification('Запрос на обработку принят успешно!', 'success');
            // Закрыть модальное окно
            document.getElementById('processModal').classList.add('hidden');
        } else {
            const errorText = await response.text();
            showNotification(`Ошибка: ${errorText}`, 'error');
        }
        
    } catch (error) {
        showNotification(`Ошибка: ${error.message}`, 'error');
    } finally {
        // Сбросить флаг обработки
        appState.isProcessing = false;
        
        // Восстановить кнопку
        startBtn.disabled = false;
        startBtn.innerHTML = '<i data-feather="play" class="w-4 h-4"></i> Запустить обработку';
        feather.replace();
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

// Функция для добавления обработчиков кнопок обзора
function addViewButtonHandlers() {
    const viewButtons = document.querySelectorAll('.script-view');
    
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const userId = this.getAttribute('data-user-id');
            loadUserDetails(userId);
        });
    });
}

// Функция для загрузки подробных данных пользователя
async function loadUserDetails(userId) {
    try {
        
        const response = await fetchWithRetry(`${DB_CONFIG.baseUrl}/Base/data?idUser=${userId}`, {});
        const userData = await response.json();
        
        showUserDetailsModal(userData);
        
    } catch (error) {
        showErrorMessage(`Ошибка загрузки данных пользователя: ${error.message}`);
    }
}

// Функция для показа модального окна с подробными данными
function showUserDetailsModal(userData) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-[9999] p-4 overflow-y-auto modal-backdrop';
    modal.innerHTML = `
        <div class="bg-dark-800 rounded-lg w-full max-w-6xl max-h-[85vh] flex flex-col my-4 modal-dialog">
            <div class="flex items-center justify-between p-6 border-b border-dark-600 flex-shrink-0">
                <h3 class="text-2xl font-bold text-white">Подробные данные пользователя</h3>
                <button id="closeModal" class="text-dark-400 hover:text-white transition-colors">
                    <i data-feather="x" class="w-6 h-6"></i>
                </button>
            </div>
            
            <div class="p-6 overflow-y-auto flex-1">
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
            
            <!-- Нижняя панель с кнопкой закрытия -->
            <div class="flex justify-end p-4 border-t border-dark-600 flex-shrink-0">
                <button id="closeModalBottom" class="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors">
                    Закрыть
                </button>
            </div>
        </div>
    `;
    
    // Предотвратить прокрутку фона
    document.body.style.overflow = 'hidden';
    
    document.body.appendChild(modal);
    
    // Заменить иконки
    feather.replace();
    
    // Фиксированное позиционирование модального окна
    const modalContent = modal.querySelector('.bg-dark-800');
    
    // Устанавливаем фиксированную позицию один раз
    const viewportHeight = window.innerHeight;
    const maxAllowedHeight = Math.min(viewportHeight * 0.85, viewportHeight - 32);
    
    modalContent.style.maxHeight = `${maxAllowedHeight}px`;
    modalContent.style.marginTop = 'auto';
    modalContent.style.marginBottom = 'auto';
    
    // Добавить обработчики событий
    const closeButton = modal.querySelector('#closeModal');
    const closeButtonBottom = modal.querySelector('#closeModalBottom');
    const tabButtons = modal.querySelectorAll('.tab-btn');
    const tabContents = modal.querySelectorAll('.tab-content');
    
    // Функция закрытия модального окна
    const closeModal = () => {
        document.body.style.overflow = ''; // Восстановить прокрутку
        document.body.removeChild(modal);
    };
    
    // Закрытие модального окна
    closeButton.addEventListener('click', closeModal);
    closeButtonBottom.addEventListener('click', closeModal);
    
    // Закрытие по клику на фон
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
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
                
                // Прокручиваем к началу содержимого вкладки
                const modalBody = modal.querySelector('.p-6.overflow-y-auto');
                if (modalBody) {
                    modalBody.scrollTop = 0;
                }
                
                // НЕ пересчитываем позицию модального окна при смене вкладок
                // чтобы окно оставалось на месте
            }
        });
    });
}

// Функция для обновления пагинации
function updatePagination() {
    const paginationContainer = document.getElementById('paginationContainer');
    if (!paginationContainer) {
        return;
    }
    
    
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
            if (appState.currentPage > 1) {
                loadDatabaseData(appState.currentPage - 1);
            }
        });
    }
    
    if (nextButton) {
        nextButton.addEventListener('click', function() {
            if (appState.currentPage < appState.totalPages) {
                loadDatabaseData(appState.currentPage + 1);
            }
        });
    }
}


// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    
    // Загрузить сохраненные выделенные пользователи
    loadSelectedUsers();
    
    // Инициализировать поиск
    initializeSearch();
    
    // Инициализировать выделение
    initializeSelection();
    
    // Загрузить данные БД
    loadDatabaseData(appState.currentPage);
});
