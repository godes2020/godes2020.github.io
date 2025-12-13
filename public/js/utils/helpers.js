/**
 * Вспомогательные функции
 */

import { CLICK_COOLDOWN } from '../config/constants.js';

let lastClickTime = 0;

/**
 * Проверяет, прошло ли достаточно времени с последнего клика
 * @returns {boolean} true если можно кликать
 */
export function checkClickRate() {
    const now = Date.now();
    if (now - lastClickTime < CLICK_COOLDOWN) return false;
    lastClickTime = now;
    return true;
}

/**
 * Создает всплывающий текст с уроном
 * @param {number} x - координата X
 * @param {number} y - координата Y
 * @param {string} text - текст для отображения
 */
export function createFloatingText(x, y, text) {
    const floatingText = document.createElement('div');
    floatingText.className = 'floating-text';
    floatingText.textContent = text;
    floatingText.style.left = x + 'px';
    floatingText.style.top = y + 'px';
    document.body.appendChild(floatingText);

    setTimeout(() => floatingText.remove(), 1000);
}
