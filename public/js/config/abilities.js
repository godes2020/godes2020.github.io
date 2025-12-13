/**
 * Конфигурация способностей игры
 */

export const ABILITIES_CONFIG = {
    superHit: {
        name: 'СУПЕР УДАР',
        icon: '⚡',
        baseDamage: 100,
        baseCooldown: 5,
        maxLevel: 10,
        upgradeCost: 2,
        damagePerLevel: 50,
        cooldownReduction: 0.1,
        rebirthRequired: 0
    },
    megaStrike: {
        name: 'МЕГА УДАР',
        icon: '💥',
        baseDamage: 250,
        baseCooldown: 8,
        maxLevel: 10,
        upgradeCost: 3,
        damagePerLevel: 100,
        cooldownReduction: 0.15,
        rebirthRequired: 3
    },
    inferno: {
        name: 'ИНФЕРНО',
        icon: '🔥',
        baseDamage: 500,
        baseCooldown: 10,
        maxLevel: 10,
        upgradeCost: 4,
        damagePerLevel: 200,
        cooldownReduction: 0.2,
        rebirthRequired: 7
    },
    voidBurst: {
        name: 'ВЗРЫВ ПУСТОТЫ',
        icon: '🌑',
        baseDamage: 1000,
        baseCooldown: 12,
        maxLevel: 10,
        upgradeCost: 5,
        damagePerLevel: 400,
        cooldownReduction: 0.25,
        rebirthRequired: 12
    },
    celestialRage: {
        name: 'НЕБЕСНЫЙ ГНЕВ',
        icon: '✨',
        baseDamage: 2000,
        baseCooldown: 15,
        maxLevel: 10,
        upgradeCost: 6,
        damagePerLevel: 800,
        cooldownReduction: 0.3,
        rebirthRequired: 20
    },
    dimensionalSlash: {
        name: 'РАЗМЕРНЫЙ РАЗЛОМ',
        icon: '⚔️',
        baseDamage: 5000,
        baseCooldown: 20,
        maxLevel: 10,
        upgradeCost: 8,
        damagePerLevel: 1500,
        cooldownReduction: 0.4,
        rebirthRequired: 30
    }
};
