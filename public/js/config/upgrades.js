/**
 * Конфигурация апгрейдов (клик и пассивный урон)
 */

export const CLICK_UPGRADES_CONFIG = [
    { id: "c1", name: "Малый удар", baseCost: 50, costMult: 1.15, dpcGain: 1 },
    { id: "c2", name: "Удар", baseCost: 150, costMult: 1.15, dpcGain: 3 },
    { id: "c3", name: "Сильный удар", baseCost: 400, costMult: 1.15, dpcGain: 10 },
    { id: "c4", name: "Огромный удар", baseCost: 1500, costMult: 1.15, dpcGain: 50 },
    { id: "c5", name: "Божественный удар", baseCost: 7500, costMult: 1.15, dpcGain: 250 },
];

export const PASSIVE_UPGRADES_CONFIG = [
    { id: "p1", name: "Малый тотем", baseCost: 40, costMult: 1.15, dpsGain: 1 },
    { id: "p2", name: "Тотем", baseCost: 130, costMult: 1.15, dpsGain: 3 },
    { id: "p3", name: "Сильный тотем", baseCost: 350, costMult: 1.15, dpsGain: 10 },
    { id: "p4", name: "Огромный тотем", baseCost: 1300, costMult: 1.15, dpsGain: 50 },
    { id: "p5", name: "Божественный тотем", baseCost: 6500, costMult: 1.15, dpsGain: 250 },
];
