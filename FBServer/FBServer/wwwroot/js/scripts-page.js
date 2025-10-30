// Скрипт для страницы управления скриптами

// Конфигурация
const SCRIPTS_CONFIG = {
    get baseUrl() {
        return window.location.origin;
    },
    cacheDuration: 30000, // 30 секунд
    retryAttempts: 3,
    statusUpdateInterval: 5000
};

// Состояние приложения
const scriptsState = {
    cache: new Map(),
    isLoading: false,
    statusUpdateInterval: null
};

// Функция для получения кэшированных данных
function getCachedScripts() {
    const cached = scriptsState.cache.get('scripts');
    if (cached && Date.now() - cached.timestamp < SCRIPTS_CONFIG.cacheDuration) {
        return cached.data;
    }
    return null;
}

// Функция для сохранения в кэш
function setCachedScripts(data) {
    scriptsState.cache.set('scripts', {
        data,
        timestamp: Date.now()
    });
}

// Функция для загрузки скриптов
async function loadScripts() {
    if (scriptsState.isLoading) return;
    
    
    const cachedScripts = getCachedScripts();
    if (cachedScripts) {
        displayScripts(cachedScripts);
        return;
    }
    
    scriptsState.isLoading = true;
    
    const loadingIndicator = document.getElementById('loadingIndicator');
    const errorMessage = document.getElementById('errorMessage');
    const scriptsContainer = document.getElementById('scriptsContainer');
    
    // Показать индикатор загрузки
    if (loadingIndicator) loadingIndicator.classList.remove('hidden');
    if (errorMessage) errorMessage.classList.add('hidden');
    if (scriptsContainer) scriptsContainer.innerHTML = '';
    
    try {
        const response = await fetchWithRetry(`${SCRIPTS_CONFIG.baseUrl}/Script`);
        
        const scripts = await response.json();
        
        // Сохраняем в кэш
        setCachedScripts(scripts);
        
        // Скрыть индикатор загрузки
        if (loadingIndicator) loadingIndicator.classList.add('hidden');
        
        // Отобразить скрипты
        displayScripts(scripts);
        
    } catch (error) {
        showScriptsError('Ошибка загрузки скриптов. Попробуйте обновить страницу.');
    } finally {
        scriptsState.isLoading = false;
    }
}

// Функция для retry запросов
async function fetchWithRetry(url, options = {}, retries = SCRIPTS_CONFIG.retryAttempts) {
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
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return response;
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
    }
}

// Функция для показа ошибки
function showScriptsError(message) {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const errorMessage = document.getElementById('errorMessage');
    
    if (loadingIndicator) loadingIndicator.classList.add('hidden');
    if (errorMessage) {
        errorMessage.querySelector('p').textContent = message;
        errorMessage.classList.remove('hidden');
    }
}

// Функция для отображения скриптов
function displayScripts(scripts) {
    const scriptsContainer = document.getElementById('scriptsContainer');
    if (!scriptsContainer) return;
    
    if (!scripts || scripts.length === 0) {
        scriptsContainer.innerHTML = `
            <div class="text-center py-8 text-dark-300">
                <i data-feather="file-text" class="w-8 h-8 mx-auto mb-2"></i>
                <p>Скрипты не найдены</p>
            </div>
        `;
        feather.replace();
        return;
    }
    
    scriptsContainer.innerHTML = scripts.map(script => `
        <div class="script-card bg-dark-700/50 border border-dark-600 rounded-lg p-4 hover:bg-dark-700/70 transition-all duration-300" data-script-id="${script.id}">
            <div class="flex items-center justify-between">
                <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                        <div class="script-icon bg-primary/20 p-2 rounded-lg">
                            <i data-feather="terminal" class="w-5 h-5 text-primary"></i>
                        </div>
                        <div>
                            <h3 class="font-semibold text-lg">${script.name}</h3>
                            <div class="flex items-center gap-4 text-sm text-dark-400">
                                <div class="flex items-center gap-1">
                                    <i data-feather="server" class="w-4 h-4"></i>
                                    <span>${script.ip}:${script.port}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="script-status-info mt-2 text-sm" id="status-${script.id}">
                        <div class="flex items-center gap-2">
                            <span class="status-indicator w-2 h-2 rounded-full bg-gray-500"></span>
                            <span class="status-text text-dark-400">Статус неизвестен</span>
                        </div>
                    </div>
                </div>
                <div class="flex items-center gap-2 ml-4">
                    <button class="script-btn script-start bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors" data-script-id="${script.id}">
                        <i data-feather="play" class="w-4 h-4"></i>
                        Старт
                    </button>
                    <button class="script-btn script-stop bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors" data-script-id="${script.id}">
                        <i data-feather="square" class="w-4 h-4"></i>
                        Стоп
                    </button>
                    <button class="script-btn script-status bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors" data-script-id="${script.id}">
                        <i data-feather="activity" class="w-4 h-4"></i>
                        Статус
                    </button>
                    <button class="script-btn script-delete bg-red-800 hover:bg-red-900 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors" data-script-id="${script.id}">
                        <i data-feather="trash-2" class="w-4 h-4"></i>
                        Удалить
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    // Заменить иконки
    feather.replace();
    
    // Добавить обработчики событий для кнопок
    addScriptButtonHandlers();
}

// Функция для добавления обработчиков кнопок
function addScriptButtonHandlers() {
    const startButtons = document.querySelectorAll('.script-start');
    const stopButtons = document.querySelectorAll('.script-stop');
    const statusButtons = document.querySelectorAll('.script-status');
    const deleteButtons = document.querySelectorAll('.script-delete');
    
    startButtons.forEach(button => {
        button.addEventListener('click', function() {
            const scriptId = this.getAttribute('data-script-id');
            showStartForm(scriptId);
        });
    });
    
    stopButtons.forEach(button => {
        button.addEventListener('click', function() {
            const scriptId = this.getAttribute('data-script-id');
            stopScript(scriptId);
        });
    });
    
    statusButtons.forEach(button => {
        button.addEventListener('click', function() {
            const scriptId = this.getAttribute('data-script-id');
            checkScriptStatus(scriptId);
        });
    });
    
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const scriptId = this.getAttribute('data-script-id');
            showDeleteConfirmation(scriptId);
        });
    });
}

// Функция для показа формы запуска скрипта
function showStartForm(scriptId) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-dark-800 rounded-lg p-6 w-96">
            <h3 class="text-xl font-semibold mb-4">Запуск скрипта</h3>
            <form id="startForm">
                <div class="mb-4">
                    <label class="block text-sm font-medium mb-2">URL</label>
                    <input type="url" id="scriptUrl" class="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white" placeholder="https://example.com" required>
                </div>
                <div class="mb-6">
                    <label class="block text-sm font-medium mb-2">Глубина</label>
                    <input type="number" id="scriptDepth" class="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white" placeholder="1" min="1" required>
                </div>
                <div class="flex gap-3">
                    <button type="submit" class="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">Старт</button>
                    <button type="button" id="cancelStart" class="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg">Отмена</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Обработчики событий
    document.getElementById('startForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const url = document.getElementById('scriptUrl').value;
        const depth = parseInt(document.getElementById('scriptDepth').value);
        startScript(scriptId, url, depth);
        document.body.removeChild(modal);
    });
    
    document.getElementById('cancelStart').addEventListener('click', function() {
        document.body.removeChild(modal);
    });
}

// Функция для запуска скрипта
async function startScript(scriptId, url, depth) {
    try {
        const response = await fetch(`${SCRIPTS_CONFIG.baseUrl}/Script/start?id=${scriptId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                link: url,
                depth: depth
            })
        });
        
        if (response.ok) {
            checkScriptStatus(scriptId); // Обновить статус
        } else {
        }
    } catch (error) {
    }
}

// Функция для остановки скрипта
async function stopScript(scriptId) {
    try {
        const response = await fetch(`${SCRIPTS_CONFIG.baseUrl}/Script/stop?id=${scriptId}`, {
            method: 'GET'
        });
        
        if (response.ok) {
            checkScriptStatus(scriptId); // Обновить статус
        } else {
        }
    } catch (error) {
    }
}

// Функция для проверки статуса скрипта
async function checkScriptStatus(scriptId) {
    try {
        const response = await fetch(`${SCRIPTS_CONFIG.baseUrl}/Script/status?id=${scriptId}`);
        
        if (response.ok) {
            const status = await response.json();
            updateScriptStatus(scriptId, status);
        } else {
        }
    } catch (error) {
    }
}

// Функция для обновления отображения статуса
function updateScriptStatus(scriptId, status) {
    const statusElement = document.getElementById(`status-${scriptId}`);
    if (!statusElement) return;
    
    const indicator = statusElement.querySelector('.status-indicator');
    const text = statusElement.querySelector('.status-text');
    
    if (status.status) {
        indicator.className = 'status-indicator w-2 h-2 rounded-full bg-green-500';
        text.textContent = `Активен - ${status.running}`;
        text.className = 'status-text text-green-400';
    } else {
        indicator.className = 'status-indicator w-2 h-2 rounded-full bg-red-500';
        text.textContent = 'Не активен';
        text.className = 'status-text text-red-400';
    }
}

// Функция для показа подтверждения удаления
function showDeleteConfirmation(scriptId) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-dark-800 rounded-lg p-6 w-96">
            <h3 class="text-xl font-semibold mb-4 text-red-400">Удаление скрипта</h3>
            <p class="text-dark-300 mb-6">Вы уверены, что хотите удалить этот скрипт? Это действие нельзя отменить.</p>
            <div class="flex gap-3">
                <button id="confirmDelete" class="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg">Удалить</button>
                <button id="cancelDelete" class="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg">Отмена</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Обработчики событий
    document.getElementById('confirmDelete').addEventListener('click', function() {
        deleteScript(scriptId);
        document.body.removeChild(modal);
    });
    
    document.getElementById('cancelDelete').addEventListener('click', function() {
        document.body.removeChild(modal);
    });
}

// Функция для удаления скрипта
async function deleteScript(scriptId) {
    try {
        const response = await fetch(`${SCRIPTS_CONFIG.baseUrl}/Script?id=${scriptId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadScripts(); // Перезагрузить список скриптов
        } else {
        }
    } catch (error) {
    }
}

// Функция для запуска автоматического обновления статуса
function startAutoStatusUpdate() {
    // Остановить предыдущий интервал если он есть
    if (scriptsState.statusUpdateInterval) {
        clearInterval(scriptsState.statusUpdateInterval);
    }
    
    // Обновлять статус каждые 5 секунд
    scriptsState.statusUpdateInterval = setInterval(async () => {
        
        // Получить все скрипты и обновить их статус
        const scriptCards = document.querySelectorAll('.script-card');
        const updatePromises = Array.from(scriptCards).map(async (card) => {
            const scriptId = card.getAttribute('data-script-id');
            if (scriptId) {
                try {
                    const response = await fetchWithRetry(`${SCRIPTS_CONFIG.baseUrl}/Script/status?id=${scriptId}`);
                    if (response.ok) {
                        const status = await response.json();
                        updateScriptStatus(scriptId, status);
                    }
                } catch (error) {
                }
            }
        });
        
        // Ждем завершения всех обновлений
        await Promise.allSettled(updatePromises);
    }, SCRIPTS_CONFIG.statusUpdateInterval);
}

// Функция для остановки автоматического обновления
function stopAutoStatusUpdate() {
    if (scriptsState.statusUpdateInterval) {
        clearInterval(scriptsState.statusUpdateInterval);
        scriptsState.statusUpdateInterval = null;
    }
}

// Функция для показа формы добавления скрипта
function showAddScriptForm() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-dark-800 rounded-lg p-6 w-96">
            <h3 class="text-xl font-semibold mb-4">Добавить скрипт</h3>
            <form id="addScriptForm">
                <div class="mb-4">
                    <label class="block text-sm font-medium mb-2">Название</label>
                    <input type="text" id="scriptName" class="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white" placeholder="Название скрипта" required>
                </div>
                <div class="mb-4">
                    <label class="block text-sm font-medium mb-2">IP адрес</label>
                    <input type="text" id="scriptIp" class="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white" placeholder="127.0.0.1" required>
                </div>
                <div class="mb-6">
                    <label class="block text-sm font-medium mb-2">Порт</label>
                    <input type="number" id="scriptPort" class="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white" placeholder="5000" min="1" max="65535" required>
                </div>
                <div class="flex gap-3">
                    <button type="submit" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">Добавить</button>
                    <button type="button" id="cancelAdd" class="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg">Отмена</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Обработчики событий
    document.getElementById('addScriptForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('scriptName').value;
        const ip = document.getElementById('scriptIp').value;
        const port = parseInt(document.getElementById('scriptPort').value);
        addScript(name, ip, port);
        document.body.removeChild(modal);
    });
    
    document.getElementById('cancelAdd').addEventListener('click', function() {
        document.body.removeChild(modal);
    });
}

// Функция для добавления скрипта
async function addScript(name, ip, port) {
    try {
        const response = await fetch(`${SCRIPTS_CONFIG.baseUrl}/Script`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: name,
                ip: ip,
                port: port
            })
        });
        
        if (response.ok) {
            loadScripts(); // Перезагрузить список скриптов
        } else {
        }
    } catch (error) {
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    
    // Загрузить скрипты
    loadScripts();
    
    // Запустить автоматическое обновление статуса
    startAutoStatusUpdate();
    
    // Добавить обработчик для кнопки добавления скрипта
    const addButton = document.getElementById('addScript');
    if (addButton) {
        addButton.addEventListener('click', function() {
            showAddScriptForm();
        });
    }
});

// Остановить автоматическое обновление при уходе со страницы
window.addEventListener('beforeunload', function() {
    stopAutoStatusUpdate();
});
