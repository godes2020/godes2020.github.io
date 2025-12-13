// ============================================
// VOID CLICKER - НОВАЯ ВЕРСИЯ
// Исправленная логика энергии, баланса, достижений
// ============================================

// === ПЕРЕМЕННЫЕ АВТОРИЗАЦИИ ===
let token = null;
let currentUser = null;

// === ФУНКЦИИ АВТОРИЗАЦИИ ===

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const toggle = input.nextElementSibling;
    
    if (input.type === 'password') {
        input.type = 'text';
        toggle.textContent = '🙈 Скрыть';
    } else {
        input.type = 'password';
        toggle.textContent = '👁️ Показать';
    }
}

function showLogin() {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('register-form').style.display = 'none';
    clearErrors();
}

function showRegister() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
    clearErrors();
}

function clearErrors() {
    document.getElementById('login-error').textContent = '';
    document.getElementById('register-error').textContent = '';
}

async function handleRegister() {
    const username = document.getElementById('reg-username').value.trim();
    const pass1 = document.getElementById('reg-password').value;
    const pass2 = document.getElementById('reg-password2').value;
    const errorEl = document.getElementById('register-error');

    if (username.length < 3 || username.length > 16) {
        errorEl.textContent = '❌ Ник должен быть от 3 до 16 символов';
        return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        errorEl.textContent = '❌ Только буквы, цифры и _ (как в Minecraft)';
        return;
    }

    if (pass1.length < 4) {
        errorEl.textContent = '❌ Пароль слишком короткий (минимум 4 символа)';
        return;
    }

    if (pass1 !== pass2) {
        errorEl.textContent = '❌ Пароли не совпадают';
        return;
    }

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password: pass1 })
        });

        const data = await response.json();

        if (response.ok) {
            token = data.token;
            currentUser = data.user.username;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(data.user));
            enterGame();
        } else {
            errorEl.textContent = data.error || '❌ Ошибка регистрации';
        }
    } catch (error) {
        errorEl.textContent = '❌ Ошибка сети';
        console.error('Register error:', error);
    }
}

async function handleLogin() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            token = data.token;
            currentUser = data.user.username;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(data.user));
            enterGame();
        } else {
            errorEl.textContent = data.error || '❌ Ошибка входа';
        }
    } catch (error) {
        errorEl.textContent = '❌ Ошибка сети';
        console.error('Login error:', error);
    }
}

function logout() {
    if (confirm('Выйти из аккаунта?\n\nТвой прогресс сохранён.')) {
        if (gameLoopInterval) {
            clearInterval(gameLoopInterval);
            gameLoopInterval = null;
        }
        if (energyRegenInterval) {
            clearInterval(energyRegenInterval);
            energyRegenInterval = null;
        }

        saveGame();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        currentUser = null;
        token = null;
        
        document.getElementById('game-screen').style.display = 'none';
        document.getElementById('auth-screen').style.display = 'flex';
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('overlay').classList.remove('active');
        document.getElementById('login-username').value = '';
        document.getElementById('login-password').value = '';
        document.getElementById('reg-username').value = '';
        document.getElementById('reg-password').value = '';
        document.getElementById('reg-password2').value = '';
        
        showLogin();
    }
}

async function enterGame() {
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'flex';
    initGame();
    console.log('✅ Game started for:', currentUser);
}

// === ГЛОБАЛЬНОЕ СОСТОЯНИЕ ИГРЫ ===

// базовые ресурсы
let gold = 0;
let totalGold = 0;

// энергия
let energy = 20;
let maxEnergy = 20;
let energyRegenInterval = null;

// урон
let dpc = 1;         // damage per click
let dps = 0;         // damage per second

// перерождения
let rebirthLevel = 0;
let rebirthPoints = 0;
let rebirthMultiplier = 1;

// материалы
let materials = {
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

// достижения - храним массив {id, unlocked, rewardTaken}
let achievements = [];

// апгрейды - храним массив {id, level, baseCost, costMult, dpcGain или dpsGain}
let clickUpgrades = [];
let passiveUpgrades = [];

// рецепты - какие открыты
let unlockedRecipes = [];

// способности - уровни и готовность
let abilityLevels = {
    superHit: 0,
    megaStrike: 0,
    inferno: 0,
    voidBurst: 0,
    celestialRage: 0,
    dimensionalSlash: 0
};
let abilityReady = true;
let abilityTimerId = null;
let currentAbility = 'superHit';

// === ФЛАГИ И ИНТЕРВАЛЫ ===
let gameLoopInterval = null;
let clickCooldown = 100;
let lastClickTime = 0;
let currentLeaderboardType = 'rebirths';

// === ЗАГРУЗКА/СОХРАНЕНИЕ ИГРЫ ===

function saveGame() {
    const data = {
        gold,
        totalGold,
        energy,
        maxEnergy,
        dpc,
        dps,
        rebirthLevel,
        rebirthPoints,
        materials,
        achievements,
        clickUpgrades,
        passiveUpgrades,
        unlockedRecipes,
        abilityLevels,
        currentAbility
    };
    localStorage.setItem("void_clicker_save", JSON.stringify(data));
    console.log('✅ Game saved');
}

function loadGame() {
    const raw = localStorage.getItem("void_clicker_save");
    if (!raw) {
        console.log('📝 No save found, starting fresh');
        initializeNewGame();
        return;
    }

    try {
        const data = JSON.parse(raw);
        gold = data.gold ?? 0;
        totalGold = data.totalGold ?? 0;
        energy = data.energy ?? 20;
        maxEnergy = data.maxEnergy ?? 20;
        dpc = data.dpc ?? 1;
        dps = data.dps ?? 0;
        rebirthLevel = data.rebirthLevel ?? 0;
        rebirthPoints = data.rebirthPoints ?? 0;
        materials = data.materials ?? materials;
        achievements = data.achievements ?? [];
        
        // Если достижения пусты, инициализируем их
        if (!achievements || achievements.length === 0) {
            initializeAchievements();
        }
        
        clickUpgrades = data.clickUpgrades ?? [];
        passiveUpgrades = data.passiveUpgrades ?? [];
        unlockedRecipes = data.unlockedRecipes ?? [];
        abilityLevels = data.abilityLevels ?? {
            superHit: 0,
            megaStrike: 0,
            inferno: 0,
            voidBurst: 0,
            celestialRage: 0,
            dimensionalSlash: 0
        };
        currentAbility = data.currentAbility ?? 'superHit';
        
        // Убедимся, что энергия в нормальном диапазоне
        if (energy > maxEnergy) energy = maxEnergy;
        if (energy < 0) energy = 0;
        
        // Пересчитаем множитель на основе уровня перерождения
        rebirthMultiplier = 1 + (rebirthLevel * 0.5);
        
        console.log('✅ Game loaded from save');
    } catch (e) {
        console.error("❌ Ошибка загрузки сохранения:", e);
        initializeNewGame();
    }
}

function initializeNewGame() {
    gold = 0;
    totalGold = 0;
    energy = 20;
    maxEnergy = 20;
    dpc = 1;
    dps = 0;
    rebirthLevel = 0;
    rebirthPoints = 0;
    materials = {
        wood: 0, stone: 0, iron: 0, gold_mat: 0, diamond: 0,
        void_essence: 0, emerald: 0, ruby: 0, obsidian: 0,
        star_shard: 0, core: 0
    };
    achievements = [];
    clickUpgrades = [];
    passiveUpgrades = [];
    unlockedRecipes = [];
    abilityLevels = {
        superHit: 0,
        megaStrike: 0,
        inferno: 0,
        voidBurst: 0,
        celestialRage: 0,
        dimensionalSlash: 0
    };
    abilityReady = true;
    currentAbility = 'superHit';
    initializeAchievements();
    console.log('🎮 New game initialized');
}

// === ПЕРИОДИЧЕСКОЕ АВТО-СОХРАНЕНИЕ ===
setInterval(saveGame, 5000);

// === ЭНЕРГИЯ ===

function updateEnergyUI() {
    const el = document.getElementById("energy-display");
    if (el) {
        el.textContent = `${Math.floor(energy)}/${Math.floor(maxEnergy)}`;
    }
}

function startEnergyRegen() {
    if (energyRegenInterval) clearInterval(energyRegenInterval);

    // +1 энергии каждые 0.5 секунды
    energyRegenInterval = setInterval(() => {
        if (energy < maxEnergy) {
            energy += 1;
            if (energy > maxEnergy) energy = maxEnergy;
            updateEnergyUI();
        }
    }, 500);
    
    console.log('⚡ Energy regen started');
}

// тратим энергию на клик
function spendEnergy(amount) {
    if (energy < amount) {
        console.log('❌ Not enough energy:', energy, '<', amount);
        return false;
    }
    energy -= amount;
    updateEnergyUI();
    saveGame();
    return true;
}

// === УТИЛИТЫ ===



function checkClickRate() {
    const now = Date.now();
    if (now - lastClickTime < clickCooldown) return false;
    lastClickTime = now;
    return true;
}

// === КЛИК ПО ВРАГУ ===



function updateGoldUI() {
    const main = document.getElementById("gold-display");
    if (main) main.textContent = formatNumber(gold);

    const side = document.getElementById("sidebar-gold");
    if (side) side.textContent = formatNumber(gold);
}

function showDamageText(x, y, damage) {
    const floatingText = document.createElement('div');
    floatingText.className = 'floating-text';
    floatingText.textContent = `+${formatNumber(damage)}`;
    floatingText.style.left = x + 'px';
    floatingText.style.top = y + 'px';
    document.body.appendChild(floatingText);

    setTimeout(() => floatingText.remove(), 1000);
}

// === ЛИДЕРБОРД (4 ВКЛАДКИ) ===



// === ДОСТИЖЕНИЯ ===

const ACHIEVEMENTS_CONFIG = [
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

function initializeAchievements() {
    achievements = ACHIEVEMENTS_CONFIG.map(cfg => ({
        id: cfg.id,
        unlocked: false,
        rewardTaken: false
    }));
}

function checkAchievements() {
    achievements.forEach(ach => {
        if (ach.unlocked) return; // уже разблокировано
        
        const cfg = ACHIEVEMENTS_CONFIG.find(c => c.id === ach.id);
        if (!cfg) return;
        
        let progress = 0;
        switch (cfg.type) {
            case 'totalGold': progress = totalGold; break;
            case 'dpc': progress = dpc; break;
            case 'dps': progress = dps; break;
            case 'rebirth': progress = rebirthLevel; break;
        }
        
        if (progress >= cfg.target) {
            ach.unlocked = true;
            console.log('🏆 Achievement unlocked:', cfg.name);
            
            // Даём награду только один раз
            if (!ach.rewardTaken) {
                rebirthPoints += cfg.reward;
                ach.rewardTaken = true;
                console.log(`   +${cfg.reward} Rebirth Points`);
                updateStatsUI();
                saveGame();
            }
        }
    });
}



// === КРАФТ ===

const CRAFT_RECIPES = [
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

// === КОНСТАНТЫ МАТЕРИАЛОВ ===
const MATERIAL_NAMES = {
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

// === КОНФИГ СПОСОБНОСТЕЙ ===
const ABILITIES_CONFIG = {
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

function renderCraftTab() {
    if (rebirthLevel < 1) {
        const lockMsg = document.getElementById('craft-lock-message');
        if (lockMsg) {
            lockMsg.innerHTML = `<div class="locked-message">🔒 Верстак открывается после первого перерождения</div>`;
        }
        const grid = document.getElementById('craft-grid');
        if (grid) grid.style.display = 'none';
        return;
    }
    
    const lockMsg = document.getElementById('craft-lock-message');
    if (lockMsg) lockMsg.innerHTML = '';
    const grid = document.getElementById('craft-grid');
    if (grid) grid.style.display = 'block';
    
    const container = document.getElementById('craft-grid');
    if (!container) return;
    
    let html = '';
    CRAFT_RECIPES.forEach(recipe => {
        const canCraft = energy >= recipe.costEnergy;
        html += `<div class="craft-recipe ${!canCraft ? 'disabled' : ''}">
            <div class="craft-name">${recipe.name}</div>
            <div class="craft-cost">⚡ ${recipe.costEnergy}</div>
            <button onclick="craftRecipe('${recipe.id}')" ${!canCraft ? 'disabled' : ''}>Создать</button>
        </div>`;
    });
    container.innerHTML = html;
}

function craftRecipe(recipeId) {
    const recipe = CRAFT_RECIPES.find(r => r.id === recipeId);
    if (!recipe) return;
    
    if (!spendEnergy(recipe.costEnergy)) {
        console.log('❌ Not enough energy for crafting');
        return;
    }
    
    // Даём ресурс
    materials[recipe.result] = (materials[recipe.result] || 0) + 1;
    console.log(`✨ Crafted: ${recipe.name}`);
    
    updateUI();
    saveGame();
}

// === АПГРЕЙДЫ (КЛИКИ И DPS) ===

const CLICK_UPGRADES_CONFIG = [
    { id: "c1", name: "Малый удар", baseCost: 50, costMult: 1.15, dpcGain: 1 },
    { id: "c2", name: "Удар", baseCost: 150, costMult: 1.15, dpcGain: 3 },
    { id: "c3", name: "Сильный удар", baseCost: 400, costMult: 1.15, dpcGain: 10 },
    { id: "c4", name: "Огромный удар", baseCost: 1500, costMult: 1.15, dpcGain: 50 },
    { id: "c5", name: "Божественный удар", baseCost: 7500, costMult: 1.15, dpcGain: 250 },
];

const PASSIVE_UPGRADES_CONFIG = [
    { id: "p1", name: "Малый тотем", baseCost: 40, costMult: 1.15, dpsGain: 1 },
    { id: "p2", name: "Тотем", baseCost: 130, costMult: 1.15, dpsGain: 3 },
    { id: "p3", name: "Сильный тотем", baseCost: 350, costMult: 1.15, dpsGain: 10 },
    { id: "p4", name: "Огромный тотем", baseCost: 1300, costMult: 1.15, dpsGain: 50 },
    { id: "p5", name: "Божественный тотем", baseCost: 6500, costMult: 1.15, dpsGain: 250 },
];

function initializeUpgrades() {
    clickUpgrades = CLICK_UPGRADES_CONFIG.map(cfg => ({
        ...cfg,
        level: 0
    }));
    passiveUpgrades = PASSIVE_UPGRADES_CONFIG.map(cfg => ({
        ...cfg,
        level: 0
    }));
}

function getUpgradeCost(upgrade) {
    return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMult, upgrade.level));
}

function buyUpgrade(type, upgradeId) {
    const list = type === 'click' ? clickUpgrades : passiveUpgrades;
    const upgrade = list.find(u => u.id === upgradeId);
    if (!upgrade) return;
    
    const cost = getUpgradeCost(upgrade);
    if (gold < cost) {
        console.log('❌ Not enough gold');
        return;
    }
    
    gold -= cost;
    upgrade.level++;
    
    if (upgrade.dpcGain) {
        dpc += upgrade.dpcGain * rebirthMultiplier;
    } else if (upgrade.dpsGain) {
        dps += upgrade.dpsGain * rebirthMultiplier;
    }
    
    updateUI();
    saveGame();
}

// === UI И МЕНЮ ===

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    
    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
    
    if (sidebar.classList.contains('open')) {
        updateSidebarStats();
    }
}

function updateSidebarStats() {
    document.getElementById('sidebar-username').textContent = currentUser || 'Guest';
    document.getElementById('sidebar-gold').textContent = formatNumber(gold);
    document.getElementById('sidebar-dpc').textContent = formatNumber(dpc * rebirthMultiplier);
    document.getElementById('sidebar-dps').textContent = formatNumber(dps);
    document.getElementById('sidebar-rp').textContent = rebirthPoints;
    
    document.getElementById('rebirth-level').textContent = rebirthLevel;
    document.getElementById('rebirth-mult').textContent = '×' + rebirthMultiplier.toFixed(1);
    document.getElementById('rebirth-cost').textContent = formatNumber(getRebirthCost());
}

function switchTab(tabName) {
    const contents = document.querySelectorAll('.tab-content');
    const tabs = document.querySelectorAll('.tab');
    
    contents.forEach(el => el.classList.remove('active'));
    tabs.forEach(el => el.classList.remove('active'));
    
    const contentEl = document.getElementById('content-' + tabName);
    if (contentEl) {
        contentEl.classList.add('active');
    }
    
    if (event && event.target) {
        event.target.classList.add('active');
    }
    
    // Рендерим контент вкладок при переключении
    switch(tabName) {
        case 'main':
            // Главная вкладка - просто показываем её содержимое
            break;
        case 'click':
            renderClickTab();
            break;
        case 'passive':
            renderPassiveTab();
            break;
        case 'craft':
            renderCraftTab();
            break;
        case 'recipes':
            renderRecipesTab();
            break;
        case 'shop':
            renderShopTab();
            break;
        case 'rebirth':
            renderRebirthTab();
            break;
        case 'leaderboard':
            renderLeaderboard();
            break;
        case 'achievements':
            renderAchievements();
            break;
    }
}

function switchLeaderboard(type) {
    currentLeaderboardType = type;
    document.querySelectorAll('.leaderboard-tab').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    renderLeaderboard();
}

async function renderLeaderboard() {
    const container = document.getElementById('leaderboard-list');
    if (!container) return;
    
    container.innerHTML = '<div style="text-align: center; padding: 20px;">Загрузка...</div>';

    try {
        const response = await fetch(`/api/leaderboard?type=${currentLeaderboardType}`);
        const data = await response.json();

        if (response.ok && data.leaderboard && data.leaderboard.length > 0) {
            let html = '';
            data.leaderboard.forEach((player, index) => {
                const value = player.value || 0;
                const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅';
                const displayValue = formatNumber(value);
                
                html += `
                    <div class="stat-display" style="margin-bottom: 8px;">
                        <span class="stat-label">${medal} ${index + 1}. ${player.username}</span>
                        <span class="stat-value">${displayValue}</span>
                    </div>
                `;
            });
            container.innerHTML = html;
        } else {
            container.innerHTML = '<div style="text-align: center; color: var(--text-dim);">Нет данных</div>';
        }
    } catch (error) {
        container.innerHTML = '<div style="text-align: center; color: var(--error);">Ошибка сети</div>';
        console.error('Leaderboard error:', error);
    }
}

function renderClickTab() {
    const container = document.getElementById('click-upgrades-tab');
    if (!container) return;
    container.innerHTML = '';

    clickUpgrades.forEach(upgrade => {
        const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMult, upgrade.level));
        const mult = rebirthMultiplier;
        const statValue = (upgrade.dpcGain || 0) * mult;
        
        const div = document.createElement('div');
        div.className = 'upgrade-mini';
        div.innerHTML = `
            <div class="upgrade-name">
                <div>${upgrade.name}</div>
                <div class="upgrade-level">Lvl ${upgrade.level} | +${formatNumber(statValue)}</div>
            </div>
            <button class="btn-buy-mini" onclick="buyUpgrade('click', '${upgrade.id}')" 
                ${gold < cost ? 'disabled' : ''}>
                ${formatNumber(cost)}
            </button>
        `;
        container.appendChild(div);
    });
}

function renderPassiveTab() {
    const container = document.getElementById('passive-upgrades-tab');
    if (!container) return;
    container.innerHTML = '';

    passiveUpgrades.forEach(upgrade => {
        const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMult, upgrade.level));
        const mult = rebirthMultiplier;
        const statValue = (upgrade.dpsGain || 0) * mult;
        
        const div = document.createElement('div');
        div.className = 'upgrade-mini';
        div.innerHTML = `
            <div class="upgrade-name">
                <div>${upgrade.name}</div>
                <div class="upgrade-level">Lvl ${upgrade.level} | +${formatNumber(statValue)}/s</div>
            </div>
            <button class="btn-buy-mini" onclick="buyUpgrade('passive', '${upgrade.id}')" 
                ${gold < cost ? 'disabled' : ''}>
                ${formatNumber(cost)}
            </button>
        `;
        container.appendChild(div);
    });
}

function renderShopTab() {
    if (rebirthLevel < 1) {
        const lockMsg = document.getElementById('shop-lock-message');
        if (lockMsg) {
            lockMsg.innerHTML = `<div class="locked-message">🔒 Магазин открывается после первого перерождения</div>`;
        }
        const matsDisplay = document.getElementById('materials-display');
        if (matsDisplay) matsDisplay.style.display = 'none';
        const shopItems = document.getElementById('shop-items');
        if (shopItems) shopItems.style.display = 'none';
        return;
    }
    
    const lockMsg = document.getElementById('shop-lock-message');
    if (lockMsg) lockMsg.innerHTML = '';
    const matsDisplay = document.getElementById('materials-display');
    if (matsDisplay) matsDisplay.style.display = 'block';
    const shopItems = document.getElementById('shop-items');
    if (shopItems) shopItems.style.display = 'block';
    
    renderMaterials();
    renderShopMaterials();
}

function renderMaterials() {
    const container = document.getElementById('materials-display');
    if (!container) return;
    container.innerHTML = '';

    for (let [key, mat] of Object.entries(MATERIAL_NAMES)) {
        const div = document.createElement('div');
        div.className = 'material-item';
        div.innerHTML = `
            <span>${mat.icon} ${mat.name}</span>
            <span style="color:var(--accent); font-weight:bold">${materials[key] || 0}</span>
        `;
        container.appendChild(div);
    }
}

function renderShopMaterials() {
    const container = document.getElementById('shop-items');
    if (!container) return;
    container.innerHTML = '';

    for (let [key, mat] of Object.entries(MATERIAL_NAMES)) {
        const div = document.createElement('div');
        div.className = 'shop-item';
        div.innerHTML = `
            <div>
                <div style="font-weight:bold; font-size:0.9rem">${mat.icon} ${mat.name}</div>
                <div style="font-size:0.75rem; color:var(--text-dim)">${formatNumber(mat.cost)} золота</div>
            </div>
            <button class="btn-buy-shop" onclick="buyMaterial('${key}')" 
                ${gold < mat.cost ? 'disabled' : ''}>
                КУПИТЬ
            </button>
        `;
        container.appendChild(div);
    }
}

function buyMaterial(key) {
    const mat = MATERIAL_NAMES[key];
    if (gold >= mat.cost) {
        gold -= mat.cost;
        materials[key] = (materials[key] || 0) + 1;
        renderMaterials();
        renderShopMaterials();
        updateUI();
        saveGame();
    }
}

function renderRecipesTab() {
    if (rebirthLevel < 1) {
        const lockMsg = document.getElementById('recipes-lock-message');
        if (lockMsg) {
            lockMsg.innerHTML = `<div class="locked-message">🔒 Книга рецептов открывается после первого перерождения</div>`;
        }
        const recipesList = document.getElementById('recipes-list');
        if (recipesList) recipesList.style.display = 'none';
        return;
    }
    
    const lockMsg = document.getElementById('recipes-lock-message');
    if (lockMsg) lockMsg.innerHTML = '';
    const recipesList = document.getElementById('recipes-list');
    if (recipesList) recipesList.style.display = 'block';
    
    renderRecipesList();
}

function renderRecipesList() {
    const container = document.getElementById('recipes-list');
    if (!container) return;
    container.innerHTML = '';

    const baseRecipes = [
        { id: 'r1', name: 'Деревянный щит', icon: '🛡️', cost: 5000, unlocked: rebirthLevel >= 1 },
        { id: 'r2', name: 'Железный меч', icon: '⚔️', cost: 25000, unlocked: rebirthLevel >= 1 },
        { id: 'r3', name: 'Железная кирка', icon: '⛏️', cost: 10000, unlocked: rebirthLevel >= 1 },
        { id: 'r4', name: 'Золотая корона', icon: '👑', cost: 100000, unlocked: rebirthLevel >= 2 },
        { id: 'r5', name: 'Алмазная броня', icon: '🛡️', cost: 250000, unlocked: rebirthLevel >= 2 },
        { id: 'r6', name: 'Артефакт Бездны', icon: '👁️', cost: 500000, unlocked: rebirthLevel >= 3 },
    ];
    
    baseRecipes.forEach(recipe => {
        const unlocked = unlockedRecipes.includes(recipe.id);
        
        const div = document.createElement('div');
        div.className = 'recipe-item';
        if (unlocked) div.classList.add('unlocked');
        
        if (unlocked) {
            div.innerHTML = `
                <div class="recipe-header">
                    <div style="font-weight:bold; color:var(--success)">${recipe.icon} ${recipe.name}</div>
                    <div style="font-size:0.75rem; color:var(--success)">✅ Разблокирована</div>
                </div>
            `;
        } else if (recipe.unlocked) {
            div.innerHTML = `
                <div class="recipe-header">
                    <div style="font-weight:bold">🔒 ${recipe.name}</div>
                    <button class="btn-buy-shop" onclick="unlockRecipe('${recipe.id}', ${recipe.cost})" 
                        ${gold < recipe.cost ? 'disabled' : ''}>
                        ${formatNumber(recipe.cost)}
                    </button>
                </div>
                <div style="font-size:0.75rem; color:var(--text-dim); margin-top:8px">
                    Купи рецепт, чтобы узнать как крафтить
                </div>
            `;
        } else {
            div.innerHTML = `
                <div class="recipe-header">
                    <div style="font-weight:bold; color:var(--text-dim)">⏰ ${recipe.name}</div>
                    <div style="font-size:0.75rem; color:var(--text-dim)">Позже</div>
                </div>
            `;
        }
        
        container.appendChild(div);
    });
}

function unlockRecipe(id, cost) {
    if (gold >= cost) {
        gold -= cost;
        unlockedRecipes.push(id);
        renderRecipesList();
        updateUI();
        saveGame();
        alert(`✅ Рецепт разблокирован!`);
    }
}

function renderRebirthTab() {
    const container = document.getElementById('content-rebirth');
    if (!container) return;
    
    const rebirthCost = getRebirthCost();
    const canRebirth = gold >= rebirthCost;
    
    let html = `
        <div style="padding: 20px;">
            <div style="background: rgba(255,0,255,0.15); padding: 20px; border-radius: 8px; border: 2px solid var(--primary); margin-bottom: 20px;">
                <div style="font-size: 18px; color: var(--primary); font-weight: bold; margin-bottom: 10px;">💫 Информация о перерождении</div>
                <div style="color: var(--text-dim); margin-bottom: 10px;">
                    <div>Текущий уровень: <span style="color: #fff;">${rebirthLevel}</span></div>
                    <div>Множитель: <span style="color: var(--primary);">×${rebirthMultiplier.toFixed(1)}</span></div>
                    <div>Очки перерождения: <span style="color: #0f0;">${rebirthPoints}</span></div>
                </div>
                <div style="border-top: 1px solid rgba(255,0,255,0.3); padding-top: 10px; margin-top: 10px;">
                    <div style="font-size: 12px; color: var(--text-dim); margin-bottom: 5px;">Стоимость следующего:</div>
                    <div style="font-size: 16px; color: var(--primary); font-weight: bold;">${formatNumber(rebirthCost)} золота</div>
                </div>
            </div>
            <button onclick="doRebirth()" ${!canRebirth ? 'disabled' : ''} 
                style="width: 100%; padding: 15px; background: ${canRebirth ? 'var(--primary)' : '#444'}; color: #fff; border: none; border-radius: 5px; font-size: 16px; font-weight: bold; cursor: ${canRebirth ? 'pointer' : 'not-allowed'};">
                ${canRebirth ? '✨ ПЕРЕРОЖДЕНИЕ' : '❌ Недостаточно золота'}
            </button>
            <div style="color: var(--text-dim); font-size: 12px; margin-top: 15px; text-align: center;">
                ⚠️ При перерождении вся статистика обнуляется, но множитель урона увеличивается!
            </div>
        </div>
    `;
    container.innerHTML = html;
}

function renderAchievements() {
    const container = document.getElementById('achievements-list');
    if (!container) return;
    container.innerHTML = '';

    achievements.forEach(ach => {
        const cfg = ACHIEVEMENTS_CONFIG.find(c => c.id === ach.id);
        if (!cfg) return;
        
        const div = document.createElement('div');
        div.className = `achievement-item ${ach.unlocked ? 'unlocked' : 'locked'}`;
        
        const icon = ach.unlocked ? '✅' : '🔒';
        
        div.innerHTML = `
            <div class="achievement-header">
                <span class="achievement-icon">${icon}</span>
                <div>
                    <div class="achievement-name">${cfg.name}</div>
                    <div class="achievement-desc">${cfg.desc}</div>
                </div>
            </div>
            <div class="achievement-reward">${cfg.reward} RP</div>
        `;
        container.appendChild(div);
    });
}



function formatNumber(num) {
    if (num < 1000) return Math.floor(num).toString();
    
    const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc'];
    const tier = Math.floor(Math.log10(Math.abs(num)) / 3);
    
    if (tier <= 0) return Math.floor(num).toString();
    
    const suffix = suffixes[tier] || 'e' + (tier * 3);
    const scale = Math.pow(10, tier * 3);
    const scaled = num / scale;
    
    return scaled.toFixed(2) + suffix;
}



// === ПЕРЕРОЖДЕНИЕ ===

function getRebirthCost() {
    return 10000000 * Math.pow(10, rebirthLevel);
}

function playerClick(event) {
    const now = Date.now();
    if (now - lastClickTime < clickCooldown) {
        return; // анти-спам
    }
    lastClickTime = now;

    if (energy <= 0) {
        console.log('❌ Not enough energy');
        return;
    }

    energy--;
    console.log(`⚡ Click! Energy: ${Math.floor(energy)}/${maxEnergy}`);

    const mult = rebirthMultiplier;
    const dmg = dpc * mult;
    gold += dmg;
    totalGold += dmg;
    
    createFloatingText(event, `+${formatNumber(dmg)}`);
    
    const enemy = document.getElementById('enemy-btn');
    if (enemy) {
        enemy.style.transform = 'scale(0.92)';
        setTimeout(() => {
            enemy.style.transform = 'scale(1)';
        }, 50);
    }

    updateUI();
    saveGame();
    checkAchievements();
}

function createFloatingText(event, text) {
    const span = document.createElement('span');
    span.className = 'damage-text';
    span.textContent = text;
    span.style.left = event.clientX + 'px';
    span.style.top = event.clientY + 'px';
    span.style.color = '#fff';
    document.body.appendChild(span);
    
    setTimeout(() => span.remove(), 600);
}

function activateAbility() {
    if (!abilityReady) {
        return; // На кулдауне
    }

    const ability = ABILITIES_CONFIG[currentAbility];
    if (!ability) {
        console.error('Способность не найдена:', currentAbility);
        return;
    }

    // Проверяем, разблокирована ли способность
    if (rebirthLevel < ability.rebirthRequired) {
        console.log(`❌ Способность разблокирована на уровне перерождения ${ability.rebirthRequired}`);
        return;
    }

    // Расчет урона
    const level = abilityLevels[currentAbility] || 0;
    const damage = (ability.baseDamage + level * ability.damagePerLevel) * rebirthMultiplier;
    
    // Нанесение урона
    gold += damage;
    totalGold += damage;
    
    // Показываем урон
    const btn = document.getElementById('ability-btn');
    if (btn) {
        const rect = btn.getBoundingClientRect();
        createFloatingText({
            clientX: rect.left + rect.width / 2,
            clientY: rect.top
        }, `${ability.icon} ${formatNumber(damage)}`);
    }

    // Кулдаун
    abilityReady = false;
    const cooldown = ability.baseCooldown - level * ability.cooldownReduction;
    const safeCooldown = Math.max(0.5, cooldown); // минимум 0.5 сек
    
    // Визуализация кулдауна
    const fillBar = document.getElementById('ability-fill');
    const totalMs = safeCooldown * 1000;
    const startTime = Date.now();
    
    const updateFill = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / totalMs, 1);
        if (fillBar) {
            fillBar.style.width = (progress * 100) + '%';
        }
        
        if (progress < 1) {
            abilityTimerId = requestAnimationFrame(updateFill);
        } else {
            if (fillBar) fillBar.style.width = '100%';
            abilityReady = true;
        }
    };
    
    updateFill();
    
    updateUI();
    saveGame();
}

function doRebirth() {
    const cost = getRebirthCost();
    if (totalGold < cost) {
        alert('❌ Недостаточно эссенций');
        return;
    }
    
    if (!confirm(`🔄 Переродиться?\nПолучишь +50% множителя урона\n\nСтоимость: ${formatNumber(cost)} эссенций`)) {
        return;
    }
    
    // Сброс ресурсов
    gold = 0;
    dpc = 1;
    dps = 0;
    energy = maxEnergy;
    materials = Object.keys(materials).reduce((acc, key) => ({ ...acc, [key]: 0 }), {});
    clickUpgrades.forEach(u => u.level = 0);
    passiveUpgrades.forEach(u => u.level = 0);
    // НЕ сбрасываем abilityLevels - они сохраняются между перерождениями!
    
    // Прогресс
    rebirthLevel++;
    rebirthPoints += 2;
    rebirthMultiplier = 1 + (rebirthLevel * 0.5);
    
    console.log('🔄 Rebirth! Level:', rebirthLevel, 'Multiplier:', rebirthMultiplier.toFixed(2));
    checkAchievements();
    updateUI();
    saveGame();
}

// === UI ===

function updateStatsUI() {
    const dpcEl = document.getElementById('dpc-display');
    if (dpcEl) dpcEl.textContent = formatNumber(dpc * rebirthMultiplier);
    
    const dpsEl = document.getElementById('dps-display');
    if (dpsEl) dpsEl.textContent = formatNumber(dps);
    
    const rpEl = document.getElementById('rebirth-points');
    if (rpEl) rpEl.textContent = rebirthPoints;
}

function updateUI() {
    updateGoldUI();
    updateEnergyUI();
    updateStatsUI();
    updateAbilityUI();
    renderClickTab();
    renderPassiveTab();
    renderCraftTab();
    renderAchievements();
}

function updateAbilityUI() {
    const abilityText = document.getElementById('ability-text');
    if (abilityText) {
        const ability = ABILITIES_CONFIG[currentAbility];
        if (ability) {
            abilityText.textContent = `${ability.icon} ${ability.name.split(' ')[0]}`;
        }
    }
}

// === ОСНОВНОЙ ЦИКЛ ИГРЫ ===

function startGameLoop() {
    if (gameLoopInterval) clearInterval(gameLoopInterval);
    
    gameLoopInterval = setInterval(() => {
        // DPS урон
        if (dps > 0) {
            const damage = dps * (rebirthMultiplier || 1);
            gold += damage;
            totalGold += damage;
            updateGoldUI();
        }
        
        // Проверяем достижения
        checkAchievements();
        
        // Сохраняем каждые 5 сек (уже в setInterval выше)
    }, 100); // 100ms = 10 раз в секунду для плавности
    
    console.log('🎮 Game loop started');
}

// === ИНИЦИАЛИЗАЦИЯ ===

function initGame() {
    console.log('🚀 Initializing game...');
    
    loadGame();
    
    // Если первый запуск, инициализируем апгрейды и достижения
    if (clickUpgrades.length === 0) {
        initializeUpgrades();
    }
    
    // Если достижения не инициализированы, инициализируем их
    if (achievements.length === 0) {
        initializeAchievements();
    }
    
    updateUI();
    startEnergyRegen();
    startGameLoop();
    
    // Показываем игровой экран
    const gameScreen = document.getElementById('game-screen');
    if (gameScreen) gameScreen.style.display = 'flex';
    
    console.log('✅ Game initialized');
}

// === СПОСОБНОСТИ И ПЕРЕРОЖДЕНИЯ ===

function renderRebirthTab() {
    const container = document.getElementById('ability-upgrades-section');
    if (!container) return;

    let html = `
        <div style="padding: 15px;">
            <div style="margin-bottom: 20px; padding: 15px; border: 2px solid var(--accent); border-radius: 8px; background: rgba(100, 50, 150, 0.15);">
                <div style="font-size: 12px; color: var(--text-dim); margin-bottom: 8px;">Выбранная способность:</div>
                <div style="font-size: 18px; font-weight: bold; color: var(--primary);">
                    ${ABILITIES_CONFIG[currentAbility] ? ABILITIES_CONFIG[currentAbility].icon + ' ' + ABILITIES_CONFIG[currentAbility].name : 'Неизвестно'}
                </div>
            </div>
            <div style="margin-bottom: 20px;">
                <div style="font-size: 12px; color: var(--text-dim); margin-bottom: 10px;">📋 Выберите способность:</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
    `;

    // Кнопки выбора способностей
    Object.entries(ABILITIES_CONFIG).forEach(([key, ability]) => {
        const isUnlocked = rebirthLevel >= ability.rebirthRequired;
        const isSelected = currentAbility === key;
        const bgColor = isSelected ? 'rgba(138, 43, 226, 0.4)' : isUnlocked ? 'rgba(100, 50, 150, 0.2)' : 'rgba(100, 100, 100, 0.2)';
        const borderColor = isSelected ? 'var(--primary)' : isUnlocked ? 'rgba(138, 43, 226, 0.5)' : '#555';
        
        html += `
            <button onclick="selectAbility('${key}')" 
                ${!isUnlocked ? 'disabled' : ''}
                style="padding: 10px; border: 2px solid ${borderColor}; border-radius: 6px; background: ${bgColor}; color: ${isUnlocked ? '#fff' : '#888'}; cursor: ${isUnlocked ? 'pointer' : 'not-allowed'}; font-size: 12px; font-weight: bold; transition: all 0.3s;">
                ${ability.icon} ${ability.name.split(' ')[0]}
                ${!isUnlocked ? `<br><span style="font-size: 10px;">Уровень ${ability.rebirthRequired}+</span>` : ''}
            </button>
        `;
    });

    html += `
                </div>
            </div>
            <div style="border-top: 1px solid rgba(255,0,255,0.2); padding-top: 15px;">
                <div style="font-size: 12px; color: var(--text-dim); margin-bottom: 10px;">⬆️ Улучшения способностей:</div>
                <div class="upgrades-container">
    `;

    // Показываем улучшения способностей
    Object.entries(ABILITIES_CONFIG).forEach(([key, ability]) => {
        const level = abilityLevels[key] || 0;
        const isUnlocked = rebirthLevel >= ability.rebirthRequired;
        const isMaxLevel = level >= ability.maxLevel;
        const cost = ability.upgradeCost;
        const canUpgrade = rebirthPoints >= cost && !isMaxLevel && isUnlocked;
        
        const currentDamage = ability.baseDamage + level * ability.damagePerLevel;
        const currentCooldown = Math.max(0.5, ability.baseCooldown - level * ability.cooldownReduction);
        const nextDamage = ability.baseDamage + (level + 1) * ability.damagePerLevel;
        const nextCooldown = Math.max(0.5, ability.baseCooldown - (level + 1) * ability.cooldownReduction);

        const selectedStyle = currentAbility === key ? 'border: 2px solid var(--primary); background: rgba(138, 43, 226, 0.2);' : 'border: 1px solid var(--accent); background: rgba(100, 50, 150, 0.1);';

        if (isUnlocked) {
            html += `
                <div class="upgrade-card" style="margin-bottom: 15px; padding: 12px; ${selectedStyle} border-radius: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <span class="stat-label">${ability.icon} ${ability.name}</span>
                        <span class="stat-value">Уровень: ${level}/${ability.maxLevel}</span>
                    </div>
                    
                    <div style="font-size: 12px; color: var(--text-dim); margin-bottom: 10px;">
                        <div>Урон: ${formatNumber(currentDamage)} ${!isMaxLevel ? `→ ${formatNumber(nextDamage)}` : ''}</div>
                        <div>Кулдаун: ${currentCooldown.toFixed(1)}s ${!isMaxLevel ? `→ ${nextCooldown.toFixed(1)}s` : ''}</div>
                    </div>
                    
                    ${isMaxLevel ? 
                        `<button class="upgrade-btn" disabled style="width: 100%; padding: 8px; background: #444; color: #888; cursor: not-allowed; border: none; border-radius: 4px;">
                            ✓ Максимальный уровень
                        </button>` :
                        `<button class="upgrade-btn" 
                            onclick="upgradeAbility('${key}')"
                            style="width: 100%; padding: 8px; background: ${canUpgrade ? '#8a2be2' : '#444'}; color: ${canUpgrade ? '#fff' : '#888'}; cursor: ${canUpgrade ? 'pointer' : 'not-allowed'}; border: none; border-radius: 4px; font-weight: bold; transition: all 0.3s;"
                            ${!canUpgrade ? 'disabled' : ''}>
                            Улучшить (${cost} точек)
                        </button>`
                    }
                </div>
            `;
        }
    });

    html += `
                </div>
            </div>
        </div>
    `;
    container.innerHTML = html;
}

function upgradeAbility(abilityKey) {
    const ability = ABILITIES_CONFIG[abilityKey];
    if (!ability) {
        console.error('Способность не найдена:', abilityKey);
        return;
    }

    const level = abilityLevels[abilityKey] || 0;

    // Проверяем максимальный уровень
    if (level >= ability.maxLevel) {
        alert('⚠️ Способность уже на максимальном уровне!');
        return;
    }

    // Проверяем достаточность очков
    if (rebirthPoints < ability.upgradeCost) {
        alert(`❌ Недостаточно очков перерождения!\nНужно: ${ability.upgradeCost}\nЕсть: ${rebirthPoints}`);
        return;
    }

    // Улучшаем
    abilityLevels[abilityKey] = level + 1;
    rebirthPoints -= ability.upgradeCost;

    const newLevel = abilityLevels[abilityKey];
    const newDamage = ability.baseDamage + newLevel * ability.damagePerLevel;
    const newCooldown = Math.max(0.5, ability.baseCooldown - newLevel * ability.cooldownReduction);

    alert(`✅ ${ability.name} улучшена до уровня ${newLevel}!\nУрон: ${formatNumber(newDamage)}\nКулдаун: ${newCooldown.toFixed(1)}s`);
    
    renderRebirthTab(); // Обновляем вкладку
    updateUI();
    saveGame();
}

function selectAbility(abilityKey) {
    const ability = ABILITIES_CONFIG[abilityKey];
    if (!ability) {
        console.error('Способность не найдена:', abilityKey);
        return;
    }

    // Проверяем, разблокирована ли способность
    if (rebirthLevel < ability.rebirthRequired) {
        alert(`❌ Способность разблокирована на уровне перерождения ${ability.rebirthRequired}\nТекущий уровень: ${rebirthLevel}`);
        return;
    }

    currentAbility = abilityKey;
    renderRebirthTab();
    updateUI();
    saveGame();
}

// Когда страница загрузилась
window.addEventListener('load', () => {
    console.log('📄 Page loaded');
});

// Сохраняем при закрытии страницы
window.addEventListener('beforeunload', saveGame);
