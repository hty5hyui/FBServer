// Модуль для отображения данных и пагинации

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
        updateCheckboxesFromSelection();
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
                        <th scope="col">Флаги</th>
                        <th scope="col">Действия</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map((item, index) => {
                        const recordNumber = (appState.currentPage - 1) * DB_CONFIG.recordsPerPage + index + 1;
                        const isSelected = appState.selectedUsers.has(item.userId);
                        const hasFlags = item.flags && Array.isArray(item.flags) && item.flags.length > 0;
                        return `
                        <tr class="${isSelected ? 'bg-blue-900/20 border-l-4 border-blue-500' : ''}">
                            <td class="text-center">
                                <input type="checkbox" class="user-checkbox" data-user-id="${item.userId}" ${isSelected ? 'checked' : ''} style="display: ${appState.isSelectionMode ? 'block' : 'none'};">
                            </td>
                            <td class="text-center text-dark-400 font-medium">${recordNumber}</td>
                            <td class="font-medium text-white">
                                <span>${item.fio || 'Не указано'}</span>
                            </td>
                            <td>
                                <a href="${item.link}" target="_blank" class="text-blue-400 hover:text-blue-300 underline">
                                    ${item.link}
                                </a>
                            </td>
                            <td class="text-dark-300">${item.subscribers || 'Не указано'}</td>
                            <td class="text-dark-300">${item.mobile || 'Не указано'}</td>
                            <td class="text-dark-300">${item.email || 'Не указано'}</td>
                            <td class="text-center">
                                ${hasFlags ? `
                                <div class="relative group inline-block">
                                    <i data-feather="flag" class="w-6 h-6 text-yellow-400 cursor-help"></i>
                                    <div class="absolute bottom-full left-0 mb-2 bg-dark-800 border border-dark-600 rounded-lg p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 min-w-48 max-w-xs">
                                        <div class="text-xs font-medium text-yellow-300 mb-2">Флаги:</div>
                                        <div class="text-sm text-white space-y-1">${item.flags.map(flag => `<div>• ${flag}</div>`).join('')}</div>
                                    </div>
                                </div>
                                ` : '<span class="text-dark-400">—</span>'}
                            </td>
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
        updateUserNamesInStorage();
    }
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

