// Основной файл для страницы базы данных - инициализация модулей

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

// Сброс локального хранилища при закрытии/обновлении страницы
window.addEventListener('beforeunload', function() {
    try {
        clearSelectedUsers();
    } catch (e) {
        try { localStorage.removeItem('selectedUsers'); } catch (_) {}
    }
});

// Дополнительный обработчик для мобильных браузеров
window.addEventListener('pagehide', function() {
    try {
        clearSelectedUsers();
    } catch (e) {
        try { localStorage.removeItem('selectedUsers'); } catch (_) {}
    }
});
