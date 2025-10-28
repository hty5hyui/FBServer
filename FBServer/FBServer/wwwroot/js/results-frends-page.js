// Страница результатов: Поиск общих друзей
// Копия логики из results-page.js с тем же поведением

// Конфигурация
const RESULTS_CONFIG = {
    baseUrl: 'http://localhost:5253',
    timeout: 10000,
    retryAttempts: 3,
    retryDelay: 1000
};

// Состояние
const appState = {
    isLoading: false,
    requestId: null,
    results: [],
    userData: {},
    selectedSourceId: null,
    selectedMatchedId: null
};

// Общие утилиты
const getRequestIdFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
};

const getUserName = (userId) => appState.userData[userId] || `Пользователь ${userId}`;

// Загрузка данных
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

// Отрисовка
const displayResultsData = () => {
    const tbody = document.getElementById('interactiveTableBody');
    if (!tbody) return;
    if (appState.results.length === 0) {
        tbody.innerHTML = '';
        showNoDataState();
        return;
    }
    hideNoDataState();
    renderInteractiveTable();
    feather.replace();
};

const renderInteractiveTable = () => {
    const tbody = document.getElementById('interactiveTableBody');
    if (!tbody) return;

    const sourceUsers = appState.results.map(result => ({
        id: result.userSourceId,
        name: getUserName(result.userSourceId),
        hasMatches: result.frends && result.frends.length > 0
    }));

    let matchedUsers = [];
    if (appState.selectedSourceId) {
        const resultForSource = appState.results.find(r => String(r.userSourceId) === String(appState.selectedSourceId));
        if (resultForSource && resultForSource.frends) {
            matchedUsers = resultForSource.frends.map(friend => ({
                id: friend.userId,
                name: getUserName(friend.userId),
                commonFriends: friend.frendsId || {}
            }));
        }
    }

    let commonFriends = [];
    if (appState.selectedSourceId && appState.selectedMatchedId) {
        const resultForSource = appState.results.find(r => String(r.userSourceId) === String(appState.selectedSourceId));
        if (resultForSource) {
            const matched = resultForSource.frends.find(f => String(f.userId) === String(appState.selectedMatchedId));
            if (matched && matched.frendsId) {
                commonFriends = Object.keys(matched.frendsId).map(friendId => ({
                    id: friendId,
                    name: getUserName(friendId),
                    depth: matched.frendsId[friendId]
                }));
            }
        }
    }

    const maxRows = Math.max(sourceUsers.length, matchedUsers.length, commonFriends.length, 1);
    let tableHTML = '';
    for (let i = 0; i < maxRows; i++) {
        const sourceUser = sourceUsers[i];
        const matchedUser = matchedUsers[i];
        const commonFriend = commonFriends[i];

        const isSourceSelected = !!sourceUser && String(appState.selectedSourceId) === String(sourceUser.id);
        const isMatchedSelected = !!matchedUser && String(appState.selectedMatchedId) === String(matchedUser.id);
        const isSourceChosen = !!appState.selectedSourceId;

        const sourceBtnClasses = isSourceSelected
            ? 'w-full text-left p-3 rounded-lg transition-all duration-200 bg-primary/30 text-primary border-2 border-primary shadow-lg shadow-primary/20 ring-2 ring-primary/40'
            : 'w-full text-left p-3 rounded-lg transition-all duration-200 hover:bg-dark-600/50 border border-transparent';

        const matchedBtnClasses = [
            'w-full text-left p-3 rounded-lg transition-all duration-200',
            isMatchedSelected ? 'bg-secondary/30 text-secondary border-2 border-secondary shadow-lg shadow-secondary/20 ring-2 ring-secondary/40' : 'hover:bg-dark-600/50 border border-transparent',
            !isSourceChosen ? 'opacity-50 cursor-not-allowed' : ''
        ].join(' ').trim();

        tableHTML += `
            <tr class="border-b border-dark-700 hover:bg-dark-700/30 transition-colors">
                <td class="py-3 px-4 text-sm">
                    ${sourceUser ? `
                        <button class="${sourceBtnClasses}" onclick="selectSourceUser('${sourceUser.id}')">
                            <div class="font-medium flex items-center gap-2">${isSourceSelected ? '<i data-feather="check-circle" class="w-4 h-4"></i>' : ''}${sourceUser.name}</div>
                            <div class="text-xs text-dark-400">ID: ${sourceUser.id}</div>
                            ${sourceUser.hasMatches ? '<div class="text-xs text-green-400 mt-1">✓ Есть совпадения</div>' : '<div class="text-xs text-red-400 mt-1">✗ Нет совпадений</div>'}
                        </button>
                    ` : '<div class="text-dark-500">-</div>'}
                </td>
                <td class="py-3 px-4 text-sm">
                    ${matchedUser ? `
                        <button class="${matchedBtnClasses}" onclick="selectMatchedUser('${matchedUser.id}')" ${!isSourceChosen ? 'disabled' : ''}>
                            <div class="font-medium flex items-center gap-2">${isMatchedSelected ? '<i data-feather="check-circle" class="w-4 h-4"></i>' : ''}${matchedUser.name}</div>
                            <div class="text-xs text-dark-400">ID: ${matchedUser.id}</div>
                            <div class="text-xs text-blue-400 mt-1">🔗 Общих друзей: ${Object.keys(matchedUser.commonFriends).length}</div>
                        </button>
                    ` : '<div class="text-dark-500">-</div>'}
                </td>
                <td class="py-3 px-4 text-sm">
                    ${commonFriend ? `
                        <div class="p-2 rounded-lg bg-blue-600/10 border border-blue-600/20">
                            <div class="font-medium text-blue-300">${commonFriend.name}</div>
                            <div class="text-xs text-dark-400">ID: ${commonFriend.id}</div>
                            <div class="text-xs text-blue-400 mt-1">Глубина: ${commonFriend.depth}</div>
                        </div>
                    ` : '<div class="text-dark-500">-</div>'}
                </td>
            </tr>
        `;
    }
    tbody.innerHTML = tableHTML;
};

// Выборы
const selectSourceUser = (sourceId) => {
    const wasSameSource = String(appState.selectedSourceId) === String(sourceId);
    appState.selectedSourceId = sourceId;
    if (!wasSameSource) appState.selectedMatchedId = null;
    renderInteractiveTable();
    feather.replace();
};

const selectMatchedUser = (matchedId) => {
    if (!appState.selectedSourceId) return;
    appState.selectedMatchedId = matchedId;
    renderInteractiveTable();
    feather.replace();
};

// Вспомогательные UI
const updateRecordsInfo = () => {
    const recordsInfo = document.getElementById('recordsInfo');
    if (recordsInfo) {
        const totalRecords = appState.results.reduce((total, result) => total + result.frends.length, 0);
        recordsInfo.textContent = `Записей: ${totalRecords}`;
    }
};

const showResultsLoadingState = () => {
    const loadingState = document.getElementById('loadingState');
    const errorState = document.getElementById('errorState');
    const noDataState = document.getElementById('noDataState');
    const tbody = document.getElementById('interactiveTableBody');
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

// Инициализация
const addEventListeners = () => {
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            if (appState.requestId) loadResultsData(appState.requestId);
        });
    }
    const retryBtn = document.getElementById('retryBtn');
    if (retryBtn) {
        retryBtn.addEventListener('click', () => {
            if (appState.requestId) loadResultsData(appState.requestId);
        });
    }
};

window.selectSourceUser = selectSourceUser;
window.selectMatchedUser = selectMatchedUser;

const initializeResultsPage = () => {
    const requestId = getRequestIdFromUrl();
    if (!requestId) {
        showResultsErrorState('ID запроса не найден в URL');
        return;
    }
    addEventListeners();
    loadResultsData(requestId);
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeResultsPage);
} else {
    initializeResultsPage();
}


