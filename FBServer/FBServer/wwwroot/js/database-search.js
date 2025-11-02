// Модуль для поиска в базе данных

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

