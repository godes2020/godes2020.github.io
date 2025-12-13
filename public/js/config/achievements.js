/**
 * Конфигурация достижений игры
 */

export const ACHIEVEMENTS_CONFIG = [
    // ЗОЛОТО
    { id: "gold_1k", name: "Первый шаг", desc: "Накопи 1K эссенций", type: "totalGold", target: 1000, reward: 1 },
    { id: "gold_10k", name: "Растущее богатство", desc: "Накопи 10K эссенций", type: "totalGold", target: 10000, reward: 1 },
    { id: "gold_100k", name: "Состоятельный", desc: "Накопи 100K эссенций", type: "totalGold", target: 100000, reward: 2 },
    { id: "gold_1m", name: "Повелитель денег", desc: "Накопи 1M эссенций", type: "totalGold", target: 1000000, reward: 3 },
    { id: "gold_10m", name: "Магнат", desc: "Накопи 10M эссенций", type: "totalGold", target: 10000000, reward: 4 },
    { id: "gold_100m", name: "Император богатства", desc: "Накопи 100M эссенций", type: "totalGold", target: 100000000, reward: 5 },

    // УРОН ЗА КЛИК
    { id: "click_10", name: "Слабый удар", desc: "Добейся 10 урона за клик", type: "dpc", target: 10, reward: 1 },
    { id: "click_100", name: "Сильный удар", desc: "Добейся 100 урона за клик", type: "dpc", target: 100, reward: 2 },
    { id: "click_1000", name: "Мастер удара", desc: "Добейся 1000 урона за клик", type: "dpc", target: 1000, reward: 3 },
    { id: "click_10k", name: "Разрушитель", desc: "Добейся 10K урона за клик", type: "dpc", target: 10000, reward: 4 },
    { id: "click_100k", name: "Катаклизм", desc: "Добейся 100K урона за клик", type: "dpc", target: 100000, reward: 5 },

    // ПАССИВНЫЙ УРОН
    { id: "dps_10", name: "Малый тотем", desc: "Добейся 10 пассивного урона", type: "dps", target: 10, reward: 1 },
    { id: "dps_100", name: "Сильный тотем", desc: "Добейся 100 пассивного урона", type: "dps", target: 100, reward: 2 },
    { id: "dps_1000", name: "Магический хранитель", desc: "Добейся 1000 пассивного урона", type: "dps", target: 1000, reward: 3 },
    { id: "dps_10k", name: "Армия помощников", desc: "Добейся 10K пассивного урона", type: "dps", target: 10000, reward: 4 },
    { id: "dps_100k", name: "Боги войны", desc: "Добейся 100K пассивного урона", type: "dps", target: 100000, reward: 5 },

    // ПЕРЕРОЖДЕНИЯ
    { id: "rebirth_1", name: "Возрождение", desc: "Соверши первое перерождение", type: "rebirth", target: 1, reward: 1 },
    { id: "rebirth_3", name: "Триада", desc: "Соверши 3 перерождения", type: "rebirth", target: 3, reward: 2 },
    { id: "rebirth_5", name: "Цикл пяти", desc: "Соверши 5 перерождений", type: "rebirth", target: 5, reward: 2 },
    { id: "rebirth_10", name: "Десятикратный", desc: "Соверши 10 перерождений", type: "rebirth", target: 10, reward: 3 },
    { id: "rebirth_20", name: "Вечный цикл", desc: "Соверши 20 перерождений", type: "rebirth", target: 20, reward: 4 },
    { id: "rebirth_50", name: "Легенда забвения", desc: "Соверши 50 перерождений", type: "rebirth", target: 50, reward: 5 },

    // СПОСОБНОСТИ
    { id: "ability_unlock_1", name: "Первая сила", desc: "Разблокируй вторую способность", type: "abilityUnlocked", target: 1, reward: 2 },
    { id: "ability_unlock_2", name: "Мощь растет", desc: "Разблокируй четвертую способность", type: "abilityUnlocked", target: 3, reward: 3 },
    { id: "ability_unlock_3", name: "Высшие силы", desc: "Разблокируй все способности", type: "abilityUnlocked", target: 6, reward: 5 },

    // УРОВНИ СПОСОБНОСТЕЙ
    { id: "ability_level_10", name: "Совершенствование", desc: "Доведи одну способность до уровня 10", type: "abilityMaxed", target: 1, reward: 3 },
    { id: "ability_level_all", name: "Мастер боевых искусств", desc: "Доведи все способности до уровня 10", type: "abilityMaxed", target: 6, reward: 5 },

    // ЭНЕРГИЯ И КЛИКИ
    { id: "clicks_100k", name: "Маниакальный клик", desc: "Сделай 100K кликов", type: "totalClicks", target: 100000, reward: 2 },
    { id: "clicks_1m", name: "Король кликов", desc: "Сделай 1M кликов", type: "totalClicks", target: 1000000, reward: 4 },

    // МАТЕРИАЛЫ
    { id: "materials_1k", name: "Сборщик", desc: "Собери 1K материалов в сумме", type: "totalMaterials", target: 1000, reward: 2 },
    { id: "materials_10k", name: "Заготовщик", desc: "Собери 10K материалов в сумме", type: "totalMaterials", target: 10000, reward: 4 },

    // СПЕЦАЛЬНЫЕ
    { id: "prestige", name: "Элита", desc: "Достигни 10 уровня перерождения", type: "rebirth", target: 10, reward: 3 },
    { id: "mega_prestige", name: "Божество", desc: "Достигни 30 уровня перерождения", type: "rebirth", target: 30, reward: 5 }
];
