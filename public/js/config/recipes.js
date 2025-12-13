/**
 * Конфигурация рецептов крафта и материалов
 */

export const CRAFT_RECIPES = [
    {
        id: "basic_1",
        result: "wood",
        name: "Деревянный брусок",
        pattern: [
            ["wood", "wood", "wood"],
            ["wood", "wood", "wood"],
            ["wood", "wood", "wood"]
        ],
        costEnergy: 2
    },
    {
        id: "stone_1",
        result: "stone",
        name: "Каменный кирпич",
        pattern: [
            ["stone", "stone", "stone"],
            ["stone", "stone", "stone"],
            ["stone", "stone", "stone"]
        ],
        costEnergy: 3
    },
    {
        id: "iron_1",
        result: "iron",
        name: "Железный слиток",
        pattern: [
            ["iron", "iron", "iron"],
            ["iron", "iron", "iron"],
            ["iron", "iron", "iron"]
        ],
        costEnergy: 4
    },
    {
        id: "gold_1",
        result: "gold_mat",
        name: "Золотой слиток",
        pattern: [
            ["gold_mat", "gold_mat", "gold_mat"],
            ["gold_mat", "gold_mat", "gold_mat"],
            ["gold_mat", "gold_mat", "gold_mat"]
        ],
        costEnergy: 5
    },
    {
        id: "diamond_1",
        result: "diamond",
        name: "Алмазная крошка",
        pattern: [
            ["diamond", "diamond", "diamond"],
            ["diamond", "diamond", "diamond"],
            ["diamond", "diamond", "diamond"]
        ],
        costEnergy: 6
    },
    {
        id: "void_1",
        result: "void_essence",
        name: "Эссенция Пустоты",
        pattern: [
            ["void_essence", "diamond", "void_essence"],
            ["diamond", "void_essence", "diamond"],
            ["void_essence", "diamond", "void_essence"]
        ],
        costEnergy: 8
    },
    {
        id: "emerald_1",
        result: "emerald",
        name: "Изумрудное ядро",
        pattern: [
            ["emerald", "void_essence", "emerald"],
            ["void_essence", "emerald", "void_essence"],
            ["emerald", "void_essence", "emerald"]
        ],
        costEnergy: 7
    },
    {
        id: "ruby_1",
        result: "ruby",
        name: "Рубиновый кристалл",
        pattern: [
            ["ruby", "ruby", "ruby"],
            ["ruby", "ruby", "ruby"],
            ["ruby", "ruby", "ruby"]
        ],
        costEnergy: 9
    },
    {
        id: "obsidian_1",
        result: "obsidian",
        name: "Обсидиановая плита",
        pattern: [
            ["obsidian", "obsidian", "obsidian"],
            ["obsidian", "obsidian", "obsidian"],
            ["obsidian", "obsidian", "obsidian"]
        ],
        costEnergy: 10
    },
    {
        id: "core_1",
        result: "core",
        name: "Ядро Силы",
        pattern: [
            ["obsidian", "void_essence", "obsidian"],
            ["void_essence", "diamond", "void_essence"],
            ["obsidian", "void_essence", "obsidian"]
        ],
        costEnergy: 12
    },
    {
        id: "star_1",
        result: "star_shard",
        name: "Звёздный осколок",
        pattern: [
            ["diamond", "emerald", "diamond"],
            ["emerald", "void_essence", "emerald"],
            ["diamond", "emerald", "diamond"]
        ],
        costEnergy: 11
    }
];

export const MATERIAL_NAMES = {
    wood: { name: 'Древесина', icon: '🌳', cost: 100 },
    stone: { name: 'Камень', icon: '⛏️', cost: 500 },
    iron: { name: 'Железо', icon: '⚙️', cost: 2500 },
    gold_mat: { name: 'Золотой слиток', icon: '🟡', cost: 10000 },
    diamond: { name: 'Алмаз', icon: '💎', cost: 50000 },
    void_essence: { name: 'Сущность Пустоты', icon: '🌀', cost: 250000 },
    emerald: { name: 'Изумруд', icon: '💚', cost: 500000 },
    ruby: { name: 'Рубин', icon: '🔴', cost: 1000000 },
    obsidian: { name: 'Обсидиан', icon: '⬛', cost: 2500000 }
};
