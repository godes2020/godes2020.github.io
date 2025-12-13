/**
 * Управление состоянием игры
 */

import { MAX_ENERGY, REBIRTH_DAMAGE_MULTIPLIER } from '../config/constants.js';
import { CLICK_UPGRADES_CONFIG, PASSIVE_UPGRADES_CONFIG } from '../config/upgrades.js';
import { ACHIEVEMENTS_CONFIG } from '../config/achievements.js';

export class GameState {
    constructor() {
        this.initializeState();
    }

    /**
     * Инициализирует начальное состояние игры
     */
    initializeState() {
        // Базовые ресурсы
        this.gold = 0;
        this.totalGold = 0;

        // Энергия
        this.energy = MAX_ENERGY;
        this.maxEnergy = MAX_ENERGY;

        // Урон
        this.dpc = 1; // damage per click
        this.dps = 0; // damage per second

        // Перерождения
        this.rebirthLevel = 0;
        this.rebirthPoints = 0;
        this.rebirthMultiplier = 1;

        // Материалы
        this.materials = {
            wood: 0,
            stone: 0,
            iron: 0,
            gold_mat: 0,
            diamond: 0,
            void_essence: 0,
            emerald: 0,
            ruby: 0,
            obsidian: 0,
            star_shard: 0,
            core: 0
        };

        // Достижения
        this.achievements = this.initializeAchievements();

        // Апгрейды
        this.clickUpgrades = this.initializeUpgrades(CLICK_UPGRADES_CONFIG);
        this.passiveUpgrades = this.initializeUpgrades(PASSIVE_UPGRADES_CONFIG);

        // Рецепты
        this.unlockedRecipes = [];

        // Способности
        this.abilityLevels = {
            superHit: 0,
            megaStrike: 0,
            inferno: 0,
            voidBurst: 0,
            celestialRage: 0,
            dimensionalSlash: 0
        };
        this.currentAbility = 'superHit';

        // Статистика
        this.totalClicks = 0;
    }

    /**
     * Инициализирует достижения
     */
    initializeAchievements() {
        return ACHIEVEMENTS_CONFIG.map(cfg => ({
            id: cfg.id,
            unlocked: false,
            rewardTaken: false
        }));
    }

    /**
     * Инициализирует апгрейды
     */
    initializeUpgrades(config) {
        return config.map(cfg => ({
            ...cfg,
            level: 0
        }));
    }

    /**
     * Пересчитывает множитель перерождения
     */
    recalculateRebirthMultiplier() {
        this.rebirthMultiplier = 1 + (this.rebirthLevel * REBIRTH_DAMAGE_MULTIPLIER);
    }

    /**
     * Экспортирует состояние для сохранения
     */
    export() {
        return {
            gold: this.gold,
            totalGold: this.totalGold,
            energy: this.energy,
            maxEnergy: this.maxEnergy,
            dpc: this.dpc,
            dps: this.dps,
            rebirthLevel: this.rebirthLevel,
            rebirthPoints: this.rebirthPoints,
            materials: this.materials,
            achievements: this.achievements,
            clickUpgrades: this.clickUpgrades,
            passiveUpgrades: this.passiveUpgrades,
            unlockedRecipes: this.unlockedRecipes,
            abilityLevels: this.abilityLevels,
            currentAbility: this.currentAbility,
            totalClicks: this.totalClicks
        };
    }

    /**
     * Импортирует состояние из сохранения
     */
    import(data) {
        this.gold = data.gold ?? 0;
        this.totalGold = data.totalGold ?? 0;
        this.energy = data.energy ?? MAX_ENERGY;
        this.maxEnergy = data.maxEnergy ?? MAX_ENERGY;
        this.dpc = data.dpc ?? 1;
        this.dps = data.dps ?? 0;
        this.rebirthLevel = data.rebirthLevel ?? 0;
        this.rebirthPoints = data.rebirthPoints ?? 0;
        this.materials = data.materials ?? this.materials;
        this.achievements = data.achievements ?? this.initializeAchievements();
        this.clickUpgrades = data.clickUpgrades ?? this.initializeUpgrades(CLICK_UPGRADES_CONFIG);
        this.passiveUpgrades = data.passiveUpgrades ?? this.initializeUpgrades(PASSIVE_UPGRADES_CONFIG);
        this.unlockedRecipes = data.unlockedRecipes ?? [];
        this.abilityLevels = data.abilityLevels ?? {
            superHit: 0,
            megaStrike: 0,
            inferno: 0,
            voidBurst: 0,
            celestialRage: 0,
            dimensionalSlash: 0
        };
        this.currentAbility = data.currentAbility ?? 'superHit';
        this.totalClicks = data.totalClicks ?? 0;

        // Убедимся, что энергия в нормальном диапазоне
        if (this.energy > this.maxEnergy) this.energy = this.maxEnergy;
        if (this.energy < 0) this.energy = 0;

        // Пересчитаем множитель
        this.recalculateRebirthMultiplier();
    }
}
