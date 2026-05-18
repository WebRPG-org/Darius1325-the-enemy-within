// $PluginCompiler TEW_Combat.js

import TEW from "../../_types/tew";
import { Bitmap } from "../../../rmmv/core/Bitmap";
import { ConditionId } from "../../_types/enum";
import { Game_BattlerBase } from "../../base/stats/Game_BattlerBase";

// $StartCompilation

function Window_TurnOrder() {
    this.initialize.apply(this, arguments);
}

Window_TurnOrder.SOURCE_DIR = 'sv_turn_order';
Window_TurnOrder.IMAGE_CACHE_RID = 'Window_TurnOrder_RID';
Window_TurnOrder.STATE_COLLAPSED = 'collapsed';
Window_TurnOrder.STATE_EXTENDED = 'extended';

export default Window_TurnOrder.prototype = Object.create(Window_Base.prototype);
Window_TurnOrder.prototype.constructor = Window_TurnOrder;

Window_TurnOrder.prototype.initialize = function() {
    Window_Base.prototype.initialize.call(this, 0, 0, 96, Graphics.boxHeight); // TODO constant
    this._orderedImageNames = [];
    this._turnIndex = -1;
    this._state = Window_TurnOrder.STATE_COLLAPSED;
};

Window_TurnOrder.prototype.setTurnOrder = function() {
    if (BattleManager._turnOrder && BattleManager._turnOrder.length !== this._orderedImageNames.length) {
        this._orderedImageNames = BattleManager._turnOrder.map(battler => battler.turnOrderSpriteName);
        for (let image of this._orderedImageNames) {
            this.reserveImage(image);
        }
        this.reserveImage("bg_actor");
        this.reserveImage("bg_enemy");
        this.reserveImage("bg_actor_extended");
        this.reserveImage("bg_enemy_extended");
    }
};

Window_TurnOrder.prototype.refresh = function() {
    this.contents.clear();
    this.setTurnOrder();

    if (this._orderedImageNames.length > 0) {
        const readyCheck = resolve => {
            if (ImageManager.isReady()) resolve();
            else setTimeout(() => readyCheck(resolve), 100);
        };
        new Promise(readyCheck).then(() => {
            for (let iterator = 0; iterator < 9; iterator++) {
                const index = (iterator + this._turnIndex) % this._orderedImageNames.length;
                const character: Bitmap = this.loadImage(this._orderedImageNames[index]);

                const background: Bitmap = this.loadImage(
                    (BattleManager._turnOrder[index].isActor ? 'bg_actor' : 'bg_enemy')
                    + (this._state === Window_TurnOrder.STATE_EXTENDED ? '_extended' : ''));

                // 80px tall tabs --> 9 tabs in 720px box height
                // Add an offset to center the sprite in a 80px slot
                const bgYOffset = iterator * 80;
                const spriteYOffset = bgYOffset + Math.floor((80 - character.rect.height) / 2);

                this.contents.blt(background, 0, 0, background.rect.width, background.rect.height, 0, bgYOffset);
                this.contents.blt(character, 0, 0, character.rect.width, character.rect.height, 16, spriteYOffset);

                if (this._state === Window_TurnOrder.STATE_EXTENDED) { // TODO constants
                    this.drawExtendedTurnOrderInfo(index, iterator);
                }
            }
        });
    }
};

Window_TurnOrder.prototype.drawExtendedTurnOrderInfo = function(index: number, iterator: number) {
    const battlerAccessor = BattleManager._turnOrder[index];
    const battler: Game_BattlerBase = this.battler(battlerAccessor.battlerIndex, battlerAccessor.isActor);

    this.contents.fontSize = 16;
    this.changeTextColor('#f0f0f0');

    let conditionIterator = 0;
    for (let conditionId of Object.keys(battler._conditions).sort()) {
        const icon = TEW.DATABASE.CONDITIONS[conditionId].icon || 0;
        const iconXOffset = conditionIterator * 40 + 112; // TODO constants
        const iconYOffset = iterator * 80 + 40;
        const textXOffset = iconXOffset + 28;
        const textYOffset = iconYOffset - 16;
        this.drawIcon(icon, iconXOffset, iconYOffset);
        
        const stacks = battler._conditions[conditionId].stacks;
        if (stacks > 1) {
            this.drawText(stacks, textXOffset, textYOffset, 8, 'left');
        }
        conditionIterator++;
    }

    this.resetFontSettings();
};

Window_TurnOrder.prototype.battler = function(battlerIndex: number, isActor: boolean) {
    return isActor 
        ? $gamePartyTs.members()[battlerIndex]
        : $gameTroopTs.members()[battlerIndex]
};

Window_TurnOrder.prototype.windowWidth = function() {
    return this.width;
};

Window_TurnOrder.prototype.windowHeight = function() {
    return Graphics.boxHeight;
};

Window_TurnOrder.prototype.collapse = function() {
    this._state = Window_TurnOrder.STATE_COLLAPSED;
    this.width = 96;
    this.contents.resize(96, Graphics.boxHeight);
    this.refresh();
};

Window_TurnOrder.prototype.extend = function() {
    this._state = Window_TurnOrder.STATE_EXTENDED;
    this.width = 296;
    this.contents.resize(296, Graphics.boxHeight);
    this.refresh();
};

Window_TurnOrder.prototype.update = function() {
    Window_Base.prototype.update.call(this);

    if (Input.isTriggered('tab')) {
        if (this._state === Window_TurnOrder.STATE_COLLAPSED) {
            this.extend();
        } else if (this._state === Window_TurnOrder.STATE_EXTENDED) {
            this.collapse();
        }
    }

    const turnIndex = BattleManager.turnIndex();
    if (this._turnIndex !== turnIndex) {
        this._turnIndex = turnIndex;
        this.refresh();
    }
};

Window_TurnOrder.prototype.reserveImage = function(image: string) {
    return ImageManager.reserveImage(Window_TurnOrder.SOURCE_DIR, image, Window_TurnOrder.IMAGE_CACHE_RID);
};

Window_TurnOrder.prototype.loadImage = function(image: string) {
    return ImageManager.loadImage(Window_TurnOrder.SOURCE_DIR, image);
};

Window_TurnOrder.prototype.close = function() {
    ImageManager.releaseReservation(Window_TurnOrder.IMAGE_CACHE_RID);
    Window_Base.prototype.close.call(this);
};

Window_TurnOrder.prototype.horizontalBorderPadding = function() {
    return 0;
};

Window_TurnOrder.prototype.verticalBorderPadding = function() {
    return 0;
};