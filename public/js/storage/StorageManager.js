/**
 * Управление сохранением игры (localStorage и API)
 */

import { SAVE_KEY } from '../config/constants.js';

export class StorageManager {
    constructor() {
        this.saveKey = SAVE_KEY;
    }

    /**
     * Сохраняет игру в localStorage
     * @param {Object} gameData - данные для сохранения
     * @returns {boolean} успешно ли сохранено
     */
    saveToLocal(gameData) {
        try {
            localStorage.setItem(this.saveKey, JSON.stringify(gameData));
            console.log('✅ Game saved to localStorage');
            return true;
        } catch (error) {
            console.error('❌ Error saving to localStorage:', error);
            if (error.name === 'QuotaExceededError') {
                console.error('⚠️ Storage quota exceeded');
            }
            return false;
        }
    }

    /**
     * Загружает игру из localStorage
     * @returns {Object|null} данные игры или null
     */
    loadFromLocal() {
        try {
            const raw = localStorage.getItem(this.saveKey);
            if (!raw) {
                console.log('📝 No save found in localStorage');
                return null;
            }
            const data = JSON.parse(raw);
            console.log('✅ Game loaded from localStorage');
            return data;
        } catch (error) {
            console.error('❌ Error loading from localStorage:', error);
            return null;
        }
    }

    /**
     * Сохраняет игру на сервер через API
     * @param {Object} gameData - данные для сохранения
     * @param {string} token - JWT токен
     * @returns {Promise<boolean>} успешно ли сохранено
     */
    async saveToServer(gameData, token) {
        try {
            const response = await fetch('/api/game-state', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ gameData })
            });

            if (response.ok) {
                console.log('✅ Game saved to server');
                return true;
            } else {
                console.error('❌ Server save failed:', response.status);
                return false;
            }
        } catch (error) {
            console.error('❌ Error saving to server:', error);
            return false;
        }
    }

    /**
     * Загружает игру с сервера через API
     * @param {string} token - JWT токен
     * @returns {Promise<Object|null>} данные игры или null
     */
    async loadFromServer(token) {
        try {
            const response = await fetch('/api/game-state', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Game loaded from server');
                return data.gameData;
            } else {
                console.error('❌ Server load failed:', response.status);
                return null;
            }
        } catch (error) {
            console.error('❌ Error loading from server:', error);
            return null;
        }
    }

    /**
     * Очищает сохранение
     */
    clearLocal() {
        localStorage.removeItem(this.saveKey);
        console.log('🗑️ Local save cleared');
    }
}
