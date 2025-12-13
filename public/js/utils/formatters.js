/**
 * Утилиты для форматирования чисел и других данных
 */

/**
 * Форматирует большие числа с суффиксами (K, M, B, T, etc.)
 * @param {number} num - Число для форматирования
 * @returns {string} Отформатированная строка
 */
export function formatNumber(num) {
    if (num < 1000) return Math.floor(num).toString();

    const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc'];
    const tier = Math.floor(Math.log10(Math.abs(num)) / 3);

    if (tier <= 0) return Math.floor(num).toString();

    const suffix = suffixes[tier] || 'e' + (tier * 3);
    const scale = Math.pow(10, tier * 3);
    const scaled = num / scale;

    return scaled.toFixed(2) + suffix;
}
