/**
 * Базовые константы игры
 */

// Энергия
export const MAX_ENERGY = 20;
export const ENERGY_REGEN_RATE = 1; // +1 энергии
export const ENERGY_REGEN_INTERVAL = 500; // каждые 500ms

// Клики
export const CLICK_COOLDOWN = 100; // минимум 100ms между кликами
export const CLICK_ENERGY_COST = 1; // стоимость обычного клика

// Сохранение
export const AUTO_SAVE_INTERVAL = 5000; // авто-сохранение каждые 5 сек
export const SAVE_KEY = 'void_clicker_save'; // ключ в localStorage

// Игровой цикл
export const GAME_LOOP_INTERVAL = 100; // игровой цикл каждые 100ms

// Перерождение
export const REBIRTH_BASE_COST = 10000000; // 10M базовая стоимость
export const REBIRTH_COST_MULTIPLIER = 10; // множитель стоимости
export const REBIRTH_DAMAGE_MULTIPLIER = 0.5; // +50% урона за перерождение

// API
export const API_BASE_URL = '/api';
