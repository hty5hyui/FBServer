// Конфигурация для страницы результатов
const RESULTS_CONFIG = {
    baseUrl: 'http://localhost:5253',
    timeout: 10000,
    retryAttempts: 3,
    retryDelay: 1000
};

// Состояние приложения
const appState = {
    isLoading: false,
    requestId: null,
    results: [],
    userData: {}
};

// Получение ID запроса из URL
const getRequestIdFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
};

// Загрузка данных результатов
const loadResultsData = async (requestId) => {
    if (!requestId) {
        showResultsErrorState('ID запроса не указан');
        return;
    }

    appState.isLoading = true;
    appState.requestId = requestId;
    showResultsLoadingState();

    try {
        const url = `${RESULTS_CONFIG.baseUrl}/Request/result?idRequest=${requestId}`;
        const response = await fetchWithRetry(url, {}, RESULTS_CONFIG.retryAttempts);
        const data = await response.json();
        
        appState.results = data.operationResult || [];
        appState.userData = data.userData || {};
        
        displayResultsData();
        updateRecordsInfo();
        hideResultsErrorState();
        
    } catch (error) {
        showResultsErrorState(`Ошибка загрузки данных: ${error.message}. Проверьте подключение к серверу.`);
    } finally {
        appState.isLoading = false;
        hideResultsLoadingState();
    }
};

// Отображение данных результатов
const displayResultsData = () => {
    const tbody = document.getElementById('resultsTableBody');
    if (!tbody) return;

    if (appState.results.length === 0) {
        tbody.innerHTML = '';
        showNoDataState();
        return;
    }

    hideNoDataState();

    tbody.innerHTML = appState.results.map(result => {
        const sourceUserName = appState.userData[result.userSourceId] || `Пользователь ${result.userSourceId}`;
        
        return result.frends.map(friend => {
            const friendUserName = appState.userData[friend.userId] || `Пользователь ${friend.userId}`;
            
            // Формируем список общих друзей
            const commonFriends = Object.keys(friend.frendsId).map(friendId => {
                const friendName = appState.userData[friendId] || `Пользователь ${friendId}`;
                const depth = friend.frendsId[friendId];
                return `<span class="inline-block bg-blue-600/20 text-blue-300 px-2 py-1 rounded text-xs mr-1 mb-1">${friendName} (глубина: ${depth})</span>`;
            }).join('');

            return `
                <tr class="border-b border-dark-700 hover:bg-dark-700/30 transition-colors">
                    <td class="py-3 px-4 text-sm">
                        <div class="font-medium text-white">${sourceUserName}</div>
                        <div class="text-xs text-dark-400">ID: ${result.userSourceId}</div>
                    </td>
                    <td class="py-3 px-4 text-sm">
                        <div class="font-medium text-white">${friendUserName}</div>
                        <div class="text-xs text-dark-400">ID: ${friend.userId}</div>
                    </td>
                    <td class="py-3 px-4 text-sm">
                        <div class="flex flex-wrap gap-1">
                            ${commonFriends || '<span class="text-dark-500">Нет общих друзей</span>'}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }).join('');

    feather.replace();
};

// Обновление счетчика записей
const updateRecordsInfo = () => {
    const recordsInfo = document.getElementById('recordsInfo');
    if (recordsInfo) {
        const totalRecords = appState.results.reduce((total, result) => total + result.frends.length, 0);
        recordsInfo.textContent = `Записей: ${totalRecords}`;
    }
};

// Состояния UI для страницы результатов
const showResultsLoadingState = () => {
    const loadingState = document.getElementById('loadingState');
    const errorState = document.getElementById('errorState');
    const noDataState = document.getElementById('noDataState');
    const tbody = document.getElementById('resultsTableBody');
    
    if (loadingState) loadingState.classList.remove('hidden');
    if (errorState) errorState.classList.add('hidden');
    if (noDataState) noDataState.classList.add('hidden');
    if (tbody) tbody.innerHTML = '';
};

const hideResultsLoadingState = () => {
    const loadingState = document.getElementById('loadingState');
    if (loadingState) loadingState.classList.add('hidden');
};

const showResultsErrorState = (message) => {
    const errorState = document.getElementById('errorState');
    const errorMessage = document.getElementById('errorMessage');
    const loadingState = document.getElementById('loadingState');
    const noDataState = document.getElementById('noDataState');
    
    if (errorState) errorState.classList.remove('hidden');
    if (errorMessage) errorMessage.textContent = message;
    if (loadingState) loadingState.classList.add('hidden');
    if (noDataState) noDataState.classList.add('hidden');
};

const hideResultsErrorState = () => {
    const errorState = document.getElementById('errorState');
    if (errorState) errorState.classList.add('hidden');
};

const showNoDataState = () => {
    const noDataState = document.getElementById('noDataState');
    const errorState = document.getElementById('errorState');
    const loadingState = document.getElementById('loadingState');
    
    if (noDataState) noDataState.classList.remove('hidden');
    if (errorState) errorState.classList.add('hidden');
    if (loadingState) loadingState.classList.add('hidden');
};

const hideNoDataState = () => {
    const noDataState = document.getElementById('noDataState');
    if (noDataState) noDataState.classList.add('hidden');
};

// Обработчики событий
const addEventListeners = () => {
    // Кнопка обновления
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            if (appState.requestId) {
                loadResultsData(appState.requestId);
            }
        });
    }

    // Кнопка повтора при ошибке
    const retryBtn = document.getElementById('retryBtn');
    if (retryBtn) {
        retryBtn.addEventListener('click', () => {
            if (appState.requestId) {
                loadResultsData(appState.requestId);
            }
        });
    }
};

// Инициализация страницы
const initializeResultsPage = () => {
    const requestId = getRequestIdFromUrl();
    
    if (!requestId) {
        showResultsErrorState('ID запроса не найден в URL');
        return;
    }

    addEventListeners();
    loadResultsData(requestId);
};

// Запуск при загрузке страницы
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeResultsPage);
} else {
    initializeResultsPage();
}

