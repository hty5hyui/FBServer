// Модуль для модального окна с деталями пользователя и редактированием

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
                                        <div class="flex-1">
                                            <p class="text-dark-300 text-xs font-medium mb-1">Дата создания</p>
                                            <p class="text-white text-sm font-semibold" data-field-name="dateOfCreation">${userData.dateOfCreation || 'Не указано'}</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="info-item rounded-lg p-4">
                                    <div class="flex items-center gap-3">
                                        <div class="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                                            <i data-feather="hash" class="w-5 h-5 text-yellow-400"></i>
                                        </div>
                                        <div class="flex-1">
                                            <p class="text-dark-300 text-xs font-medium mb-1">ID страницы</p>
                                            <p class="text-white text-sm font-semibold" data-field-name="pageId">${userData.pageId || 'Не указано'}</p>
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
                                <button class="tab-btn px-6 py-3 text-sm font-medium text-dark-400 hover:text-white" data-tab="flags">
                                    Флаги
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
                                                <label class="block text-sm font-medium text-dark-300 mb-1">Другой город</label>
                                                <p class="text-white">${userData.anotherCity || 'Не указано'}</p>
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
                                
                                <!-- Вкладка флагов -->
                                <div id="tab-flags" class="tab-content hidden">
                                    <div class="space-y-6">
                                        <div class="flex items-center justify-between mb-4">
                                            <h4 class="text-lg font-semibold text-white">Список флагов</h4>
                                            <button id="addFlagBtn" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2">
                                                <i data-feather="plus" class="w-4 h-4"></i>
                                                Добавить флаг
                                            </button>
                                        </div>
                                        
                                        <div id="flagsList" class="space-y-3">
                                            ${userData.flags && Array.isArray(userData.flags) && userData.flags.length > 0 
                                                ? userData.flags.map((flag, index) => `
                                                    <div class="bg-dark-600 rounded-lg p-4 border border-dark-500 flex items-start justify-between gap-4">
                                                        <div class="flex-1">
                                                            <div class="flex items-center gap-3 mb-2">
                                                                <span class="text-xs font-medium text-dark-400 bg-dark-700 px-2 py-1 rounded">#${index + 1}</span>
                                                                <span class="text-sm font-semibold text-yellow-400">${flag.type || 'Не указано'}</span>
                                                                <span class="text-xs text-dark-400">${flag.date ? new Date(flag.date).toLocaleString('ru-RU') : 'Не указано'}</span>
                                                            </div>
                                                            <p class="text-white text-sm">${flag.flagText || 'Не указано'}</p>
                                                            ${flag.author ? `<p class="text-xs text-dark-400 mt-2">Автор: ${flag.author}</p>` : ''}
                                                        </div>
                                                        <button class="delete-flag-btn bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2" data-flag-id="${flag.id}">
                                                            <i data-feather="trash-2" class="w-4 h-4"></i>
                                                            Удалить
                                                        </button>
                                                    </div>
                                                `).join('')
                                                : '<p class="text-dark-400 text-center py-8">Флаги отсутствуют</p>'
                                            }
                                        </div>
                                        
                                        <!-- Форма добавления флага -->
                                        <div id="addFlagForm" class="hidden bg-dark-600 rounded-lg p-4 border border-dark-500">
                                            <h5 class="text-md font-semibold text-white mb-4">Добавить новый флаг</h5>
                                            <div class="space-y-4">
                                                <div>
                                                    <label class="block text-sm font-medium text-dark-300 mb-2">Тип флага</label>
                                                    <select id="flagTypeSelect" class="w-full px-3 py-2 bg-dark-700 border border-dark-500 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none">
                                                        <option value="">Выберите тип...</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label class="block text-sm font-medium text-dark-300 mb-2">Текст флага</label>
                                                    <textarea id="flagTextInput" class="w-full px-3 py-2 bg-dark-700 border border-dark-500 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none" rows="3" placeholder="Введите текст флага..."></textarea>
                                                </div>
                                                <div class="flex items-center gap-3">
                                                    <button id="saveFlagBtn" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2">
                                                        <i data-feather="save" class="w-4 h-4"></i>
                                                        Сохранить
                                                    </button>
                                                    <button id="cancelAddFlagBtn" class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                                                        Отмена
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Нижняя панель с кнопками -->
            <div class="flex justify-between p-4 border-t border-dark-600 flex-shrink-0" id="modalBottomPanel">
                <button id="editBtn" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2">
                    <i data-feather="edit" class="w-4 h-4"></i>
                    Редактировать
                </button>
                <div class="flex gap-3 hidden" id="editButtons">
                    <button id="saveBtn" class="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2">
                        <i data-feather="save" class="w-4 h-4"></i>
                        Сохранить
                    </button>
                    <button id="cancelEditBtn" class="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors">
                        Отмена
                    </button>
                </div>
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
        document.body.style.overflow = '';
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
            }
        });
    });

    // Сохраняем исходные данные для возможности отмены
    let originalData = JSON.parse(JSON.stringify(userData));
    let isEditMode = false;

    // Функция для создания поля редактирования
    const createEditField = (fieldName, value, isTextarea = false) => {
        const fieldValue = value || '';
        if (isTextarea) {
            return `<textarea data-field="${fieldName}" class="w-full px-3 py-2 bg-dark-600 border border-dark-500 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none" rows="3">${fieldValue}</textarea>`;
        }
        return `<input type="text" data-field="${fieldName}" class="w-full px-3 py-2 bg-dark-600 border border-dark-500 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none" value="${fieldValue.replace(/"/g, '&quot;')}">`;
    };

    // Функция для переключения в режим редактирования
    const enterEditMode = () => {
        isEditMode = true;
        const editBtn = modal.querySelector('#editBtn');
        const editButtons = modal.querySelector('#editButtons');
        
        editBtn.classList.add('hidden');
        editButtons.classList.remove('hidden');
        
        // Преобразуем все поля в редактируемые
        const fieldsToEdit = [
            'fio', 'subscribers', 'work', 'university', 'school', 'home', 'city', 'anotherCity',
            'address', 'mobile', 'email', 'anotherContactInfo', 'whatsapp', 'site', 
            'anotherWebSocialmedia', 'male', 'language', 'openingHours', 'pronounsInTheSystem',
            'anotherBasicInformation', 'category', 'pageId', 'dateOfCreation', 'reklama', 'info', 
            'another', 'link', 'work1', 'university1', 'school1', 'vk', 'instagram', 'skype',
            'linkedin', 'checkLink', 'spotify', 'kakaotalk', 'youtube', 'x', 'tiktok', 'snapchat',
            'wechat', 'threads', 'line', 'twitch', 'askfm', 'pinterest', 'soundcloud', 'ok'
        ];
        
        fieldsToEdit.forEach(fieldName => {
            const value = userData[fieldName] || '';
            // Находим все элементы с этим полем
            const elements = modal.querySelectorAll(`[data-field-name="${fieldName}"]`);
            elements.forEach(el => {
                const parent = el.parentElement;
                if (parent) {
                    const isTextarea = ['info', 'reklama', 'anotherBasicInformation'].includes(fieldName);
                    const editField = createEditField(fieldName, value, isTextarea);
                    parent.innerHTML = editField;
                }
            });
        });
        
        // Также преобразуем основные поля в боковой панели
        const fioElement = modal.querySelector('h4.text-xl');
        if (fioElement && fioElement.parentElement) {
            const parent = fioElement.parentElement;
            parent.innerHTML = `
                <input type="text" data-field="fio" class="w-full px-3 py-2 bg-dark-600 border border-dark-500 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none text-center" value="${(userData.fio || '').replace(/"/g, '&quot;')}">
            `;
        }
        
        // Преобразуем поля в боковой панели
        const dateOfCreationElement = modal.querySelector('[data-field-name="dateOfCreation"]');
        if (dateOfCreationElement) {
            const parent = dateOfCreationElement.parentElement;
            if (parent) {
                parent.innerHTML = `
                    <input type="text" data-field="dateOfCreation" class="w-full px-3 py-2 bg-dark-600 border border-dark-500 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none" value="${(userData.dateOfCreation || '').replace(/"/g, '&quot;')}">
                `;
            }
        }
        
        const pageIdElement = modal.querySelector('[data-field-name="pageId"]');
        if (pageIdElement) {
            const parent = pageIdElement.parentElement;
            if (parent) {
                parent.innerHTML = `
                    <input type="text" data-field="pageId" class="w-full px-3 py-2 bg-dark-600 border border-dark-500 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none" value="${(userData.pageId || '').replace(/"/g, '&quot;')}">
                `;
            }
        }
        
        const categoryElement = modal.querySelector('.info-item:has([data-feather="tag"]) p.text-white');
        if (categoryElement) {
            const parent = categoryElement.parentElement;
            parent.innerHTML = `
                <input type="text" data-field="category" class="w-full px-3 py-2 bg-dark-600 border border-dark-500 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none" value="${(userData.category || '').replace(/"/g, '&quot;')}">
            `;
        }
        
        const linkElement = modal.querySelector('.info-item:has([data-feather="link"]) a');
        if (linkElement) {
            const parent = linkElement.parentElement;
            parent.innerHTML = `
                <input type="text" data-field="link" class="w-full px-3 py-2 bg-dark-600 border border-dark-500 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none" value="${(userData.link || '').replace(/"/g, '&quot;')}">
            `;
        }

        // Обновляем все поля во вкладках
        updateTabFieldsToEdit(modal, userData, createEditField);
    };

    // Функция для обновления полей во вкладках
    const updateTabFieldsToEdit = (modal, data, createEditField) => {
        // Контакты
        updateFieldInTab(modal, 'mobile', data.mobile);
        updateFieldInTab(modal, 'email', data.email);
        updateFieldInTab(modal, 'whatsapp', data.whatsapp);
        updateFieldInTab(modal, 'site', data.site);
        updateFieldInTab(modal, 'city', data.city);
        updateFieldInTab(modal, 'anotherCity', data.anotherCity);
        updateFieldInTab(modal, 'home', data.home);
        updateFieldInTab(modal, 'address', data.address);
        updateFieldInTab(modal, 'anotherContactInfo', data.anotherContactInfo, true);
        
        // Социальные сети
        updateFieldInTab(modal, 'instagram', data.instagram);
        updateFieldInTab(modal, 'vk', data.vk);
        updateFieldInTab(modal, 'youtube', data.youtube);
        updateFieldInTab(modal, 'tiktok', data.tiktok);
        updateFieldInTab(modal, 'x', data.x);
        updateFieldInTab(modal, 'linkedin', data.linkedin);
        updateFieldInTab(modal, 'skype', data.skype);
        updateFieldInTab(modal, 'snapchat', data.snapchat);
        updateFieldInTab(modal, 'anotherWebSocialmedia', data.anotherWebSocialmedia);
        
        // Работа и образование
        updateFieldInTab(modal, 'work', data.work, true);
        updateFieldInTab(modal, 'work1', data.work1, true);
        updateFieldInTab(modal, 'university', data.university);
        updateFieldInTab(modal, 'university1', data.university1);
        updateFieldInTab(modal, 'school', data.school);
        updateFieldInTab(modal, 'school1', data.school1);
        
        // Дополнительно
        updateFieldInTab(modal, 'subscribers', data.subscribers);
        updateFieldInTab(modal, 'openingHours', data.openingHours);
        updateFieldInTab(modal, 'language', data.language);
        updateFieldInTab(modal, 'male', data.male);
        updateFieldInTab(modal, 'pronounsInTheSystem', data.pronounsInTheSystem);
        updateFieldInTab(modal, 'anotherBasicInformation', data.anotherBasicInformation, true);
        updateFieldInTab(modal, 'reklama', data.reklama, true);
        updateFieldInTab(modal, 'info', data.info, true);
        updateFieldInTab(modal, 'another', data.another);
    };

    const updateFieldInTab = (modal, fieldName, value, isTextarea = false) => {
        // Находим label с текстом, который соответствует полю
        const labels = modal.querySelectorAll('label');
        labels.forEach(label => {
            const labelText = label.textContent.trim();
            const fieldMap = {
                'Мобильный телефон': 'mobile',
                'Email': 'email',
                'WhatsApp': 'whatsapp',
                'Сайт': 'site',
                'Город': 'city',
                'Другой город': 'anotherCity',
                'Домашний адрес': 'home',
                'Адрес': 'address',
                'Дополнительная контактная информация': 'anotherContactInfo',
                'Instagram': 'instagram',
                'VK': 'vk',
                'YouTube': 'youtube',
                'TikTok': 'tiktok',
                'Twitter/X': 'x',
                'LinkedIn': 'linkedin',
                'Skype': 'skype',
                'Snapchat': 'snapchat',
                'Другие социальные сети': 'anotherWebSocialmedia',
                'Работа': 'work',
                'Дополнительная работа': 'work1',
                'Университет': 'university',
                'Дополнительный университет': 'university1',
                'Школа': 'school',
                'Дополнительная школа': 'school1',
                'Подписчики': 'subscribers',
                'Часы работы': 'openingHours',
                'Язык': 'language',
                'Пол': 'male',
                'Местоимения в системе': 'pronounsInTheSystem',
                'Другая базовая информация': 'anotherBasicInformation',
                'Реклама': 'reklama',
                'Информация': 'info',
                'Другое': 'another'
            };
            
            if (fieldMap[labelText] === fieldName) {
                const nextSibling = label.nextElementSibling;
                if (nextSibling && nextSibling.tagName === 'P') {
                    const editField = createEditField(fieldName, value || '', isTextarea);
                    nextSibling.outerHTML = editField;
                }
            }
        });
    };

    // Функция для выхода из режима редактирования
    const exitEditMode = (restoreOriginal = false) => {
        isEditMode = false;
        const editBtn = modal.querySelector('#editBtn');
        const editButtons = modal.querySelector('#editButtons');
        
        editBtn.classList.remove('hidden');
        editButtons.classList.add('hidden');
        
        if (restoreOriginal) {
            // Восстанавливаем исходные данные
            userData = JSON.parse(JSON.stringify(originalData));
            // Перезагружаем модальное окно
            closeModal();
            showUserDetailsModal(userData);
        }
    };

    // Функция для сохранения данных
    const saveUserData = async () => {
        const saveBtn = modal.querySelector('#saveBtn');
        const originalText = saveBtn.innerHTML;
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i data-feather="loader" class="w-4 h-4 animate-spin"></i> Сохранение...';
        feather.replace();
        
        try {
            // Собираем все данные из полей
            const formData = {
                userId: userData.userId,
                fio: getFieldValue(modal, 'fio'),
                subscribers: getFieldValue(modal, 'subscribers'),
                work: getFieldValue(modal, 'work'),
                university: getFieldValue(modal, 'university'),
                school: getFieldValue(modal, 'school'),
                home: getFieldValue(modal, 'home'),
                city: getFieldValue(modal, 'city'),
                anotherCity: getFieldValue(modal, 'anotherCity'),
                address: getFieldValue(modal, 'address'),
                mobile: getFieldValue(modal, 'mobile'),
                email: getFieldValue(modal, 'email'),
                anotherContactInfo: getFieldValue(modal, 'anotherContactInfo'),
                whatsapp: getFieldValue(modal, 'whatsapp'),
                site: getFieldValue(modal, 'site'),
                anotherWebSocialmedia: getFieldValue(modal, 'anotherWebSocialmedia'),
                male: getFieldValue(modal, 'male'),
                language: getFieldValue(modal, 'language'),
                openingHours: getFieldValue(modal, 'openingHours'),
                pronounsInTheSystem: getFieldValue(modal, 'pronounsInTheSystem'),
                anotherBasicInformation: getFieldValue(modal, 'anotherBasicInformation'),
                category: getFieldValue(modal, 'category'),
                pageId: getFieldValue(modal, 'pageId'),
                dateOfCreation: getFieldValue(modal, 'dateOfCreation'),
                reklama: getFieldValue(modal, 'reklama'),
                info: getFieldValue(modal, 'info'),
                another: getFieldValue(modal, 'another'),
                link: getFieldValue(modal, 'link'),
                work1: getFieldValue(modal, 'work1'),
                university1: getFieldValue(modal, 'university1'),
                school1: getFieldValue(modal, 'school1'),
                vk: getFieldValue(modal, 'vk'),
                instagram: getFieldValue(modal, 'instagram'),
                skype: getFieldValue(modal, 'skype'),
                linkedin: getFieldValue(modal, 'linkedin'),
                checkLink: getFieldValue(modal, 'checkLink') || null,
                spotify: getFieldValue(modal, 'spotify'),
                kakaotalk: getFieldValue(modal, 'kakaotalk'),
                youtube: getFieldValue(modal, 'youtube'),
                x: getFieldValue(modal, 'x'),
                tiktok: getFieldValue(modal, 'tiktok'),
                snapchat: getFieldValue(modal, 'snapchat'),
                wechat: getFieldValue(modal, 'wechat'),
                threads: getFieldValue(modal, 'threads'),
                line: getFieldValue(modal, 'line'),
                twitch: getFieldValue(modal, 'twitch'),
                askfm: getFieldValue(modal, 'askfm'),
                pinterest: getFieldValue(modal, 'pinterest'),
                soundcloud: getFieldValue(modal, 'soundcloud'),
                ok: getFieldValue(modal, 'ok')
            };
            
            // Преобразуем пустые строки в null
            Object.keys(formData).forEach(key => {
                if (formData[key] === '' || formData[key] === undefined) {
                    formData[key] = null;
                }
            });
            
            // Конвертируем checkLink в число если он есть
            if (formData.checkLink !== null && formData.checkLink !== undefined) {
                formData.checkLink = parseInt(formData.checkLink, 10) || null;
            }
            
            const response = await fetchWithRetry(`${DB_CONFIG.baseUrl}/Base/data`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                showNotification('Данные успешно сохранены!', 'success');
                // Обновляем данные пользователя
                userData = formData;
                originalData = JSON.parse(JSON.stringify(userData));
                exitEditMode(false);
                // Перезагружаем модальное окно с обновленными данными
                closeModal();
                loadUserDetails(userData.userId);
            } else {
                const errorText = await response.text();
                showNotification(`Ошибка сохранения: ${errorText}`, 'error');
            }
        } catch (error) {
            showNotification(`Ошибка: ${error.message}`, 'error');
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = originalText;
            feather.replace();
        }
    };

    const getFieldValue = (modal, fieldName) => {
        const field = modal.querySelector(`[data-field="${fieldName}"]`);
        return field ? (field.value || '').trim() : (userData[fieldName] || '');
    };

    // Обработчики кнопок редактирования
    const editBtn = modal.querySelector('#editBtn');
    const saveBtn = modal.querySelector('#saveBtn');
    const cancelEditBtn = modal.querySelector('#cancelEditBtn');
    
    if (editBtn) {
        editBtn.addEventListener('click', enterEditMode);
    }
    
    if (saveBtn) {
        saveBtn.addEventListener('click', saveUserData);
    }
    
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', () => exitEditMode(true));
    }

    // Обработчики для работы с флагами
    let flagTypes = [];
    
    // Функция для загрузки типов флагов
    const loadFlagTypes = async () => {
        try {
            const response = await fetchWithRetry(`${DB_CONFIG.baseUrl}/Base/flagTypes`, {});
            flagTypes = await response.json();
            
            const select = modal.querySelector('#flagTypeSelect');
            if (select) {
                select.innerHTML = '<option value="">Выберите тип...</option>';
                flagTypes.forEach(type => {
                    const option = document.createElement('option');
                    option.value = type;
                    option.textContent = type;
                    select.appendChild(option);
                });
            }
        } catch (error) {
            showNotification(`Ошибка загрузки типов флагов: ${error.message}`, 'error');
        }
    };
    
    // Функция для обновления списка флагов
    const refreshFlagsList = async () => {
        try {
            const response = await fetchWithRetry(`${DB_CONFIG.baseUrl}/Base/data?idUser=${userData.userId}`, {});
            const updatedUserData = await response.json();
            userData.flags = updatedUserData.flags || [];
            
            const flagsList = modal.querySelector('#flagsList');
            if (flagsList) {
                if (userData.flags && userData.flags.length > 0) {
                    flagsList.innerHTML = userData.flags.map((flag, index) => `
                        <div class="bg-dark-600 rounded-lg p-4 border border-dark-500 flex items-start justify-between gap-4">
                            <div class="flex-1">
                                <div class="flex items-center gap-3 mb-2">
                                    <span class="text-xs font-medium text-dark-400 bg-dark-700 px-2 py-1 rounded">#${index + 1}</span>
                                    <span class="text-sm font-semibold text-yellow-400">${flag.type || 'Не указано'}</span>
                                    <span class="text-xs text-dark-400">${flag.date ? new Date(flag.date).toLocaleString('ru-RU') : 'Не указано'}</span>
                                </div>
                                <p class="text-white text-sm">${flag.flagText || 'Не указано'}</p>
                                ${flag.author ? `<p class="text-xs text-dark-400 mt-2">Автор: ${flag.author}</p>` : ''}
                            </div>
                            <button class="delete-flag-btn bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2" data-flag-id="${flag.id}">
                                <i data-feather="trash-2" class="w-4 h-4"></i>
                                Удалить
                            </button>
                        </div>
                    `).join('');
                    feather.replace();
                    // Добавляем обработчики для новых кнопок удаления
                    addDeleteFlagHandlers();
                } else {
                    flagsList.innerHTML = '<p class="text-dark-400 text-center py-8">Флаги отсутствуют</p>';
                }
            }
        } catch (error) {
            showNotification(`Ошибка обновления списка флагов: ${error.message}`, 'error');
        }
    };
    
    // Функция для добавления обработчиков удаления флагов
    const addDeleteFlagHandlers = () => {
        const deleteButtons = modal.querySelectorAll('.delete-flag-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', async function() {
                const flagId = this.getAttribute('data-flag-id');
                if (!flagId) return;
                
                if (!confirm('Вы уверены, что хотите удалить этот флаг?')) {
                    return;
                }
                
                const originalText = this.innerHTML;
                this.disabled = true;
                this.innerHTML = '<i data-feather="loader" class="w-4 h-4 animate-spin"></i>';
                feather.replace();
                
                try {
                    const response = await fetchWithRetry(`${DB_CONFIG.baseUrl}/Base/flag?idFlag=${flagId}`, {
                        method: 'DELETE'
                    });
                    
                    if (response.ok) {
                        showNotification('Флаг успешно удален', 'success');
                        await refreshFlagsList();
                    } else {
                        const errorText = await response.text();
                        showNotification(`Ошибка удаления флага: ${errorText}`, 'error');
                    }
                } catch (error) {
                    showNotification(`Ошибка: ${error.message}`, 'error');
                } finally {
                    this.disabled = false;
                    this.innerHTML = originalText;
                    feather.replace();
                }
            });
        });
    };
    
    // Добавить обработчики для существующих кнопок удаления
    addDeleteFlagHandlers();
    
    // Обработчик кнопки "Добавить флаг"
    const addFlagBtn = modal.querySelector('#addFlagBtn');
    const addFlagForm = modal.querySelector('#addFlagForm');
    const cancelAddFlagBtn = modal.querySelector('#cancelAddFlagBtn');
    
    if (addFlagBtn) {
        addFlagBtn.addEventListener('click', async () => {
            addFlagForm.classList.remove('hidden');
            await loadFlagTypes();
        });
    }
    
    if (cancelAddFlagBtn) {
        cancelAddFlagBtn.addEventListener('click', () => {
            addFlagForm.classList.add('hidden');
            const select = modal.querySelector('#flagTypeSelect');
            const textarea = modal.querySelector('#flagTextInput');
            if (select) select.value = '';
            if (textarea) textarea.value = '';
        });
    }
    
    // Обработчик кнопки "Сохранить" флаг
    const saveFlagBtn = modal.querySelector('#saveFlagBtn');
    if (saveFlagBtn) {
        saveFlagBtn.addEventListener('click', async () => {
            const select = modal.querySelector('#flagTypeSelect');
            const textarea = modal.querySelector('#flagTextInput');
            
            const type = select ? select.value.trim() : '';
            const flagText = textarea ? textarea.value.trim() : '';
            
            if (!type) {
                showNotification('Пожалуйста, выберите тип флага', 'warning');
                return;
            }
            
            if (!flagText) {
                showNotification('Пожалуйста, введите текст флага', 'warning');
                return;
            }
            
            const originalText = saveFlagBtn.innerHTML;
            saveFlagBtn.disabled = true;
            saveFlagBtn.innerHTML = '<i data-feather="loader" class="w-4 h-4 animate-spin"></i> Сохранение...';
            feather.replace();
            
            try {
                const response = await fetchWithRetry(`${DB_CONFIG.baseUrl}/Base/flag`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        idUser: userData.userId,
                        type: type,
                        flagText: flagText
                    })
                });
                
                if (response.ok) {
                    showNotification('Флаг успешно добавлен', 'success');
                    addFlagForm.classList.add('hidden');
                    if (select) select.value = '';
                    if (textarea) textarea.value = '';
                    await refreshFlagsList();
                } else {
                    const errorText = await response.text();
                    showNotification(`Ошибка добавления флага: ${errorText}`, 'error');
                }
            } catch (error) {
                showNotification(`Ошибка: ${error.message}`, 'error');
            } finally {
                saveFlagBtn.disabled = false;
                saveFlagBtn.innerHTML = originalText;
                feather.replace();
            }
        });
    }
}

