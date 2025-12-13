/**
 * Точка входа в приложение
 */

import { Game } from './game/Game.js';

// Глобальная переменная для доступа из HTML
window.game = null;

/**
 * Инициализирует игру
 */
async function initGame() {
    window.game = new Game();
    await window.game.init();

    // Обновляем UI
    window.game.updateGoldUI();
    window.game.energy.updateUI();
}

/**
 * Обработка входа в игру после авторизации
 */
async function enterGame() {
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'flex';
    await initGame();
}

/**
 * Выход из игры
 */
function logout() {
    if (confirm('Выйти из аккаунта?\n\nТвой прогресс сохранён.')) {
        if (window.game) {
            window.game.stop();
        }

        localStorage.removeItem('token');
        localStorage.removeItem('user');

        document.getElementById('game-screen').style.display = 'none';
        document.getElementById('auth-screen').style.display = 'flex';

        window.location.reload();
    }
}

/**
 * Обработка клика по врагу
 */
function playerClick(event) {
    if (window.game) {
        window.game.playerClick(event);
    }
}

// Экспорт функций для использования в HTML
window.initGame = initGame;
window.enterGame = enterGame;
window.logout = logout;
window.playerClick = playerClick;

// Сохранение перед закрытием страницы
window.addEventListener('beforeunload', () => {
    if (window.game) {
        window.game.saveGame();
    }
});

// Автоматическая инициализация при загрузке
window.addEventListener('load', () => {
    // Проверяем, авторизован ли пользователь
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
        // Автоматически входим в игру
        enterGame();
    } else {
        // Показываем экран авторизации
        document.getElementById('auth-screen').style.display = 'flex';
        document.getElementById('game-screen').style.display = 'none';
    }
});

console.log('✅ Main.js loaded - modular version');
