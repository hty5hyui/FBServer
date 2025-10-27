// Конфигурация для страницы запросов
const REQUESTS_CONFIG = {
    baseUrl: 'http://localhost:5253',
    timeout: 10000,
    retryAttempts: 3,
    retryDelay: 1000,
    recordsPerPage: 50
};

// Состояние приложения
const appState = {
    currentPage: 1,
    totalPages: 1,
    cache: new Map(),
    isLoading: false,
    requests: []
};

// Кэширование данных
const getCachedData = (key) => {
    const cached = appState.cache.get(key);
    if (cached && Date.now() - cached.timestamp < 300000) { // 5 минут
        return cached.data;
    }
    return null;
};

const setCachedData = (key, data) => {
    appState.cache.set(key, {
        data: data,
        timestamp: Date.now()
    });
};

// Форматирование даты в локальное время
const formatLocalDateTime = (utcDateString) => {
    try {
        const date = new Date(utcDateString);
        return date.toLocaleString('ru-RU', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    } catch (error) {
        return utcDateString;
    }
};

// Получение текста статуса
const getStatusText = (status) => {
    switch (status) {
        case 0: return 'В процессе';
        case 1: return 'Завершен';
        case 2: return 'Ошибка';
        default: return 'Неизвестно';
    }
};

// Получение класса для статуса
const getStatusClass = (status) => {
    switch (status) {
        case 0: return 'text-yellow-400 bg-yellow-400/10';
        case 1: return 'text-green-400 bg-green-400/10';
        case 2: return 'text-red-400 bg-red-400/10';
        default: return 'text-gray-400 bg-gray-400/10';
    }
};

// Загрузка данных запросов
const loadRequestsData = async (page = 1) => {
    const cacheKey = `requests_page_${page}`;
    const cachedData = getCachedData(cacheKey);
    
    if (cachedData && !appState.isLoading) {
        appState.requests = cachedData.requests || [];
        appState.currentPage = cachedData.currentPage || page;
        appState.totalPages = cachedData.totalPages || 1;
        displayRequestsData();
        updatePagination();
        updateRecordsInfo();
        return;
    }

    appState.isLoading = true;
    showRequestsLoadingState();

    try {
        const url = `${REQUESTS_CONFIG.baseUrl}/Request?page=${page}`;
        const response = await fetchWithRetry(url, {}, REQUESTS_CONFIG.retryAttempts);
        const data = await response.json();
        
        appState.requests = data.requests || [];
        appState.currentPage = page;
        appState.totalPages = data.pageCount || 1;
        
        setCachedData(cacheKey, {
            requests: appState.requests,
            currentPage: appState.currentPage,
            totalPages: appState.totalPages
        });
        
        displayRequestsData();
        updatePagination();
        updateRecordsInfo();
        hideRequestsErrorState();
        
    } catch (error) {
        showRequestsErrorState(`Ошибка загрузки данных: ${error.message}. Проверьте подключение к серверу.`);
    } finally {
        appState.isLoading = false;
        hideRequestsLoadingState();
    }
};

// Отображение данных запросов
const displayRequestsData = () => {
    const tbody = document.getElementById('requestsTableBody');
    if (!tbody) return;

    if (appState.requests.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center py-8 text-dark-400">
                    <i data-feather="inbox" class="w-8 h-8 mx-auto mb-2"></i>
                    <p>Запросы не найдены</p>
                </td>
            </tr>
        `;
        feather.replace();
        return;
    }

    tbody.innerHTML = appState.requests.map(request => `
        <tr class="border-b border-dark-700 hover:bg-dark-700/30 transition-colors">
            <td class="py-3 px-4 text-sm">${formatLocalDateTime(request.date)}</td>
            <td class="py-3 px-4 text-sm">${request.type}</td>
            <td class="py-3 px-4">
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(request.status)}">
                    ${getStatusText(request.status)}
                </span>
            </td>
            <td class="py-3 px-4">
                ${request.status === 1 ? 
                    `<button onclick="viewResult(${request.id})" class="btn-primary text-xs px-3 py-1">
                        Посмотреть результат
                    </button>` : 
                    '<span class="text-dark-500 text-xs">-</span>'
                }
            </td>
        </tr>
    `).join('');

    feather.replace();
};

// Обновление счетчика записей
const updateRecordsInfo = () => {
    const recordsInfo = document.getElementById('recordsInfo');
    if (recordsInfo) {
        const totalRecords = appState.requests.length;
        recordsInfo.textContent = `Записей: ${totalRecords}`;
    }
};

// Обновление пагинации
const updatePagination = () => {
    const paginationContainer = document.getElementById('paginationContainer');
    const paginationInfo = document.getElementById('paginationInfo');
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    const pageNumbers = document.getElementById('pageNumbers');

    if (!paginationContainer || !paginationInfo || !prevBtn || !nextBtn || !pageNumbers) return;

    if (appState.totalPages <= 1) {
        paginationContainer.classList.add('hidden');
        return;
    }

    paginationContainer.classList.remove('hidden');
    paginationInfo.textContent = `Страница ${appState.currentPage} из ${appState.totalPages}`;

    // Кнопки предыдущая/следующая
    prevBtn.disabled = appState.currentPage <= 1;
    nextBtn.disabled = appState.currentPage >= appState.totalPages;

    // Номера страниц
    const maxVisiblePages = 5;
    let startPage = Math.max(1, appState.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(appState.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    pageNumbers.innerHTML = '';

    if (startPage > 1) {
        const firstBtn = createPageButton(1);
        pageNumbers.appendChild(firstBtn);
        
        if (startPage > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'px-2 text-dark-400';
            ellipsis.textContent = '...';
            pageNumbers.appendChild(ellipsis);
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = createPageButton(i);
        pageNumbers.appendChild(pageBtn);
    }

    if (endPage < appState.totalPages) {
        if (endPage < appState.totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'px-2 text-dark-400';
            ellipsis.textContent = '...';
            pageNumbers.appendChild(ellipsis);
        }
        
        const lastBtn = createPageButton(appState.totalPages);
        pageNumbers.appendChild(lastBtn);
    }
};

// Создание кнопки страницы
const createPageButton = (pageNumber) => {
    const button = document.createElement('button');
    button.className = `px-3 py-1 text-sm rounded transition-colors ${
        pageNumber === appState.currentPage 
            ? 'bg-primary text-white' 
            : 'text-dark-300 hover:text-white hover:bg-dark-600'
    }`;
    button.textContent = pageNumber;
    button.onclick = () => goToPage(pageNumber);
    return button;
};

// Переход на страницу
const goToPage = (page) => {
    if (page >= 1 && page <= appState.totalPages && page !== appState.currentPage) {
        loadRequestsData(page);
    }
};

// Просмотр результата
const viewResult = (requestId) => {
    window.location.href = `results.html?id=${requestId}`;
};

// Состояния UI для страницы запросов
const showRequestsLoadingState = () => {
    const loadingState = document.getElementById('loadingState');
    const errorState = document.getElementById('errorState');
    const tbody = document.getElementById('requestsTableBody');
    
    if (loadingState) loadingState.classList.remove('hidden');
    if (errorState) errorState.classList.add('hidden');
    if (tbody) tbody.innerHTML = '';
};

const hideRequestsLoadingState = () => {
    const loadingState = document.getElementById('loadingState');
    if (loadingState) loadingState.classList.add('hidden');
};

const showRequestsErrorState = (message) => {
    const errorState = document.getElementById('errorState');
    const errorMessage = document.getElementById('errorMessage');
    const loadingState = document.getElementById('loadingState');
    
    if (errorState) errorState.classList.remove('hidden');
    if (errorMessage) errorMessage.textContent = message;
    if (loadingState) loadingState.classList.add('hidden');
};

const hideRequestsErrorState = () => {
    const errorState = document.getElementById('errorState');
    if (errorState) errorState.classList.add('hidden');
};

// Обработчики событий
const addEventListeners = () => {
    // Кнопка обновления
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            appState.cache.clear();
            loadRequestsData(appState.currentPage);
        });
    }

    // Кнопка повтора при ошибке
    const retryBtn = document.getElementById('retryBtn');
    if (retryBtn) {
        retryBtn.addEventListener('click', () => {
            loadRequestsData(appState.currentPage);
        });
    }

    // Кнопки пагинации
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (appState.currentPage > 1) {
                goToPage(appState.currentPage - 1);
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (appState.currentPage < appState.totalPages) {
                goToPage(appState.currentPage + 1);
            }
        });
    }
};

// Инициализация страницы
const initializeRequestsPage = () => {
    addEventListeners();
    loadRequestsData(1);
};

// Запуск при загрузке страницы
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeRequestsPage);
} else {
    initializeRequestsPage();
}
