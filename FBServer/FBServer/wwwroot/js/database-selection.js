// Модуль для работы с выделением пользователей

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
                        return { ...user, name: newName };
                    }
                }
                return user;
            });
            
            if (updated) {
                localStorage.setItem('selectedUsers', JSON.stringify(updatedData));
            }
        }
    } catch (error) {}
}

// Функция для обновления состояния чекбоксов на основе сохраненных выделений
function updateCheckboxesFromSelection() {
    const userCheckboxes = document.querySelectorAll('.user-checkbox');
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    
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
            }, 100);
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
            }, 100);
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
            clearSelectedUsers();
            
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
    updateUserNamesInStorage();
    
    // Создаем HTML для выделенных пользователей
    const selectedUsersHtml = selectedIds.map(userId => {
        let fio = 'Неизвестно';
        
        // Сначала пытаемся найти имя в сохраненных данных
        const savedData = localStorage.getItem('selectedUsers');
        
        if (savedData) {
            try {
                const selectedData = JSON.parse(savedData);
                const userData = selectedData.find(user => user.id === userId);
                
                if (userData && userData.name) {
                    fio = userData.name;
                }
            } catch (error) {}
        }
        
        // Если не найдено в сохраненных данных, ищем в текущей таблице
        if (fio === 'Неизвестно') {
            const checkbox = document.querySelector(`[data-user-id="${userId}"]`);
            
            if (checkbox) {
                const tableRow = checkbox.closest('tr');
                const fioCell = tableRow.querySelector('td:nth-child(3)');
                fio = fioCell ? fioCell.textContent.trim() : 'Неизвестно';
            } else {
                // Ищем в кэше
                fio = findUserNameInCache(userId);
            }
        }
        
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
    const depthWrapper = document.getElementById('depthFieldWrapper');
    const depthInput = document.getElementById('processDepth');
    
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

    // Показ/скрытие поля глубины поиска в зависимости от типа обработки
    const updateDepthVisibility = () => {
        const show = processType && processType.value === 'friends_analyse';
        if (depthWrapper) {
            if (show) {
                depthWrapper.classList.remove('hidden');
            } else {
                depthWrapper.classList.add('hidden');
            }
        }
        if (depthInput && (depthInput.value === '' || Number.isNaN(parseInt(depthInput.value, 10)) || parseInt(depthInput.value, 10) < 1 || parseInt(depthInput.value, 10) > 3)) {
            const value = parseInt(depthInput.value, 10);
            if (isNaN(value) || value < 1) {
                depthInput.value = '1';
            } else if (value > 3) {
                depthInput.value = '3';
            }
        }
    };
    if (processType) {
        updateDepthVisibility();
        processType.addEventListener('change', updateDepthVisibility);
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
                {
                    const depthEl = document.getElementById('processDepth');
                    let depth = 1;
                    if (depthEl) {
                        const parsed = parseInt(depthEl.value, 10);
                        if (Number.isFinite(parsed)) {
                            if (parsed < 1) {
                                depth = 1;
                            } else if (parsed > 3) {
                                depth = 3;
                            } else {
                                depth = parsed;
                            }
                        } else {
                            depth = 1;
                        }
                    }
                    response = await fetchWithRetry(`${DB_CONFIG.baseUrl}/Operation/frendsAnalyse?depth=${encodeURIComponent(depth)}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(selectedIds)
                    });
                }
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

