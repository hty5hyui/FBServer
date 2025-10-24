// Скрипт для страницы базы данных

let currentPage = 1;
let totalPages = 1;
let recordsPerPage = 50;

// Функция для загрузки данных БД
async function loadDatabaseData(page = 1) {
    console.log('Загрузка данных БД, страница:', page);
    
    const loadingIndicator = document.getElementById('loadingIndicator');
    const errorMessage = document.getElementById('errorMessage');
    const tableContainer = document.getElementById('tableContainer');
    
    // Показать индикатор загрузки
    if (loadingIndicator) loadingIndicator.classList.remove('hidden');
    if (errorMessage) errorMessage.classList.add('hidden');
    if (tableContainer) tableContainer.innerHTML = '';
    
    try {
        const response = await fetch(`http://localhost:5253/Base/all?page=${page}`);
        console.log('Ответ сервера:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const responseData = await response.json();
        console.log('Получены данные БД:', responseData);
        
        // Обновить информацию о пагинации
        totalPages = responseData.pageCount || 1;
        const userData = responseData.userPreviews || [];
        
        console.log('Обновлена информация о пагинации:', { 
            currentPage, 
            totalPages, 
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
        
        // Скрыть индикатор загрузки и показать ошибку
        if (loadingIndicator) loadingIndicator.classList.add('hidden');
        if (errorMessage) errorMessage.classList.remove('hidden');
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
                        const recordNumber = (currentPage - 1) * recordsPerPage + index + 1;
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
    
    console.log('Обновление пагинации:', { currentPage, totalPages });
    
    paginationContainer.innerHTML = `
        <div class="pagination-container">
            <div class="flex items-center gap-2">
                <button id="prevPage" class="pagination-button" ${currentPage <= 1 ? 'disabled' : ''}>
                    <i data-feather="chevron-left" class="w-4 h-4"></i>
                    Предыдущая
                </button>
                <span class="text-dark-300 px-4">
                    Страница ${currentPage} из ${totalPages}
                </span>
                <button id="nextPage" class="pagination-button" ${currentPage >= totalPages ? 'disabled' : ''}>
                    Следующая
                    <i data-feather="chevron-right" class="w-4 h-4"></i>
                </button>
            </div>
        </div>
    `;
    
    // Заменить иконки
    feather.replace();
    
    // Принудительно применить стили после обновления пагинации
    requestAnimationFrame(() => {
        const pagination = paginationContainer.querySelector('.pagination-container');
        if (pagination) {
            // Принудительно пересчитать стили
            pagination.style.transform = 'translateZ(0)';
            pagination.offsetHeight; // Принудительный reflow
            pagination.style.transform = '';
            
            // Дополнительная проверка стилей
            const computedStyle = window.getComputedStyle(pagination);
            if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden') {
                pagination.style.display = 'flex';
                pagination.style.visibility = 'visible';
            }
        }
    });
    
    // Добавить обработчики событий
    const prevButton = document.getElementById('prevPage');
    const nextButton = document.getElementById('nextPage');
    
    if (prevButton) {
        prevButton.addEventListener('click', function() {
            console.log('Нажата кнопка "Предыдущая"', { currentPage, totalPages });
            if (currentPage > 1) {
                currentPage--;
                console.log('Переход на страницу:', currentPage);
                loadDatabaseData(currentPage);
            }
        });
    } else {
        console.error('Кнопка "Предыдущая" не найдена');
    }
    
    if (nextButton) {
        nextButton.addEventListener('click', function() {
            console.log('Нажата кнопка "Следующая"', { currentPage, totalPages });
            if (currentPage < totalPages) {
                currentPage++;
                console.log('Переход на страницу:', currentPage);
                loadDatabaseData(currentPage);
            }
        });
    } else {
        console.error('Кнопка "Следующая" не найдена');
    }
    
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('Страница базы данных загружена');
    
    // Загрузить данные БД
    loadDatabaseData(currentPage);
});
