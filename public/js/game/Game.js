/**
 * Главный класс игры - координирует все модули
 */

import { GameState } from './GameState.js';
import { Energy } from './Energy.js';
import { StorageManager } from '../storage/StorageManager.js';
import { AUTO_SAVE_INTERVAL, GAME_LOOP_INTERVAL } from '../config/constants.js';

export class Game {
    constructor() {
        // Состояние
        this.state = new GameState();

        // Модули
        this.storage = new StorageManager();
        this.energy = new Energy(this.state);

        // Интервалы
        this.gameLoopInterval = null;
        this.autoSaveInterval = null;

        // Авторизация
        this.token = null;
        this.currentUser = null;
    }

    /**
     * Инициализирует игру
     */
    async init() {
        // Проверяем авторизацию
        this.token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        if (user) {
            this.currentUser = JSON.parse(user).username;
        }

        // Загружаем игру
        await this.loadGame();

        // Запускаем системы
        this.energy.startRegen();
        this.startGameLoop();
        this.startAutoSave();

        console.log('✅ Game initialized for:', this.currentUser);
    }

    /**
     * Загружает игру
     */
    async loadGame() {
        // Пытаемся загрузить с сервера (если авторизован)
        if (this.token) {
            const serverData = await this.storage.loadFromServer(this.token);
            if (serverData) {
                this.state.import(serverData);
                return;
            }
        }

        // Fallback на localStorage
        const localData = this.storage.loadFromLocal();
        if (localData) {
            this.state.import(localData);
        } else {
            console.log('🎮 New game started');
        }
    }

    /**
     * Сохраняет игру
     */
    async saveGame() {
        const gameData = this.state.export();

        // Сохраняем локально
        this.storage.saveToLocal(gameData);

        // Сохраняем на сервер (если авторизован)
        if (this.token) {
            await this.storage.saveToServer(gameData, this.token);
        }
    }

    /**
     * Запускает игровой цикл
     */
    startGameLoop() {
        if (this.gameLoopInterval) {
            clearInterval(this.gameLoopInterval);
        }

        this.gameLoopInterval = setInterval(() => {
            // Пассивный урон (DPS)
            if (this.state.dps > 0) {
                const damage = this.state.dps * this.state.rebirthMultiplier;
                this.state.gold += damage * (GAME_LOOP_INTERVAL / 1000);
                this.state.totalGold += damage * (GAME_LOOP_INTERVAL / 1000);
                this.updateGoldUI();
            }

            // Проверка достижений (каждую секунду, не каждый тик)
            if (Date.now() % 1000 < GAME_LOOP_INTERVAL) {
                this.checkAchievements();
            }
        }, GAME_LOOP_INTERVAL);

        console.log('🎮 Game loop started');
    }

    /**
     * Запускает авто-сохранение
     */
    startAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }

        this.autoSaveInterval = setInterval(() => {
            this.saveGame();
        }, AUTO_SAVE_INTERVAL);

        console.log('💾 Auto-save started');
    }

    /**
     * Останавливает игру
     */
    stop() {
        this.energy.stopRegen();

        if (this.gameLoopInterval) {
            clearInterval(this.gameLoopInterval);
            this.gameLoopInterval = null;
        }

        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }

        this.saveGame();
        console.log('⏹️ Game stopped');
    }

    /**
     * Обработка клика игрока
     */
    playerClick(event) {
        // Тратим энергию
        if (!this.energy.spend(1)) {
            console.log('❌ Not enough energy');
            return;
        }

        // Считаем урон
        const damage = this.state.dpc * this.state.rebirthMultiplier;
        this.state.gold += damage;
        this.state.totalGold += damage;
        this.state.totalClicks++;

        // Обновляем UI
        this.updateGoldUI();

        // Показываем урон
        if (event) {
            this.showFloatingDamage(event.clientX, event.clientY, damage);
        }

        console.log(`💥 Click! Damage: ${damage}, Gold: ${this.state.gold}`);
    }

    /**
     * Показывает всплывающий текст урона
     */
    showFloatingDamage(x, y, damage) {
        const floatingText = document.createElement('div');
        floatingText.className = 'floating-text';
        floatingText.textContent = `+${Math.floor(damage)}`;
        floatingText.style.left = x + 'px';
        floatingText.style.top = y + 'px';
        document.body.appendChild(floatingText);

        setTimeout(() => floatingText.remove(), 1000);
    }

    /**
     * Обновляет UI золота
     */
    updateGoldUI() {
        const formatNumber = (num) => {
            if (num < 1000) return Math.floor(num).toString();
            const suffixes = ['', 'K', 'M', 'B', 'T'];
            const tier = Math.floor(Math.log10(Math.abs(num)) / 3);
            if (tier <= 0) return Math.floor(num).toString();
            const suffix = suffixes[tier] || 'e' + (tier * 3);
            const scale = Math.pow(10, tier * 3);
            const scaled = num / scale;
            return scaled.toFixed(2) + suffix;
        };

        const main = document.getElementById("gold-display");
        if (main) main.textContent = formatNumber(this.state.gold);

        const side = document.getElementById("sidebar-gold");
        if (side) side.textContent = formatNumber(this.state.gold);
    }

    /**
     * Проверяет достижения (упрощенная версия)
     */
    checkAchievements() {
        // TODO: Реализовать полную логику проверки достижений
        // Это будет сделано в отдельном модуле Achievements
    }
}
