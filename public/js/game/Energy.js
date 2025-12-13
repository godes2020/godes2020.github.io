/**
 * Управление энергией игрока
 */

import { ENERGY_REGEN_RATE, ENERGY_REGEN_INTERVAL } from '../config/constants.js';

export class Energy {
    constructor(gameState) {
        this.state = gameState;
        this.regenInterval = null;
    }

    /**
     * Запускает регенерацию энергии
     */
    startRegen() {
        if (this.regenInterval) {
            clearInterval(this.regenInterval);
        }

        this.regenInterval = setInterval(() => {
            if (this.state.energy < this.state.maxEnergy) {
                this.state.energy += ENERGY_REGEN_RATE;
                if (this.state.energy > this.state.maxEnergy) {
                    this.state.energy = this.state.maxEnergy;
                }
                this.updateUI();
            }
        }, ENERGY_REGEN_INTERVAL);

        console.log('⚡ Energy regen started');
    }

    /**
     * Останавливает регенерацию энергии
     */
    stopRegen() {
        if (this.regenInterval) {
            clearInterval(this.regenInterval);
            this.regenInterval = null;
            console.log('⚡ Energy regen stopped');
        }
    }

    /**
     * Пытается потратить энергию
     * @param {number} amount - количество энергии
     * @returns {boolean} успешно ли потрачено
     */
    spend(amount) {
        if (this.state.energy < amount) {
            console.log('❌ Not enough energy:', this.state.energy, '<', amount);
            return false;
        }
        this.state.energy -= amount;
        this.updateUI();
        return true;
    }

    /**
     * Обновляет отображение энергии
     */
    updateUI() {
        const el = document.getElementById("energy-display");
        if (el) {
            el.textContent = `${Math.floor(this.state.energy)}/${Math.floor(this.state.maxEnergy)}`;
        }
    }
}
