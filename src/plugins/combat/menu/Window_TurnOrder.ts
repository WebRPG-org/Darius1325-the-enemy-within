// $PluginCompiler TEW_Combat.js

import TEW from "../../_types/tew";
import { Bitmap } from "../../../rmmv/core/Bitmap";
import { Game_BattlerBase } from "../../base/stats/Game_BattlerBase";
import { Sprite } from "../../../rmmv/core/Sprite";

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
    Window_Base.prototype.initialize.call(this, 0, 0, 0, Graphics.boxHeight); // TODO constant
    this._aliveBattlerCount = -1;
    this._turnIndex = -1;

    this.contents.resize(296, Graphics.boxHeight);

    this.width = 96;
    this.background = new Sprite(new Bitmap(296, Graphics.boxHeight));
    this.background.setFrame(200, 0, 96, Graphics.boxHeight);
    this.addChild(this.background);
    this._state = Window_TurnOrder.STATE_COLLAPSED;

    this._imagesReady = false;

    this.infoDisplay = new Sprite(new Bitmap(296, Graphics.boxHeight));
    this.infoDisplay.setFrame(0, 0, 96, Graphics.boxHeight);
    this.infoDisplay.fontSize = 16;
    this.infoDisplay.textColor = '#f0f0f0';
    this.addChild(this.infoDisplay);
};

Window_TurnOrder.prototype.setTurnOrder = function() {
    if (BattleManager._turnOrder && BattleManager._turnOrder.length !== this._aliveBattlerCount) {
        this._imagesReady = false;
        this._aliveBattlerCount = BattleManager._turnOrder.length;
        for (let image of BattleManager._turnOrder.map(battler => battler.turnOrderSpriteName)) {
            this.reserveImage(image);
        }
        this.reserveImage("bg_actor_extended");
        this.reserveImage("bg_enemy_extended");
        const readyCheck = resolve => {
            if (ImageManager.isReady()) resolve();
            else setTimeout(() => readyCheck(resolve), 100);
        };
        new Promise(readyCheck).then(() => {
            this._imagesReady = true;
            this.refresh();
        });
    }
};

Window_TurnOrder.prototype.refresh = function() {
    if (this._imagesReady && this._aliveBattlerCount > 0) {
        this.infoDisplay.bitmap.clear();
        for (let iterator = 0; iterator < 9; iterator++) {
            const rolloverIndex = (iterator + this._turnIndex) % this._aliveBattlerCount;
            const battlerAccessor = BattleManager._turnOrder[rolloverIndex];

            this.drawBackground(battlerAccessor, iterator);
            this.drawCharacterInfo(battlerAccessor, iterator);
        }
    }
};

Window_TurnOrder.prototype.drawBackground = function(battlerAccessor: { isActor: boolean }, iterator: number) {
    const background: Bitmap = this.loadImage(battlerAccessor.isActor ? 'bg_actor_extended' : 'bg_enemy_extended');
    const bgYOffset = iterator * 80;
    this.background.bitmap.blt(background, 0, 0, background.rect.width, background.rect.height, 0, bgYOffset);
};

Window_TurnOrder.prototype.drawCharacterInfo = function(battlerAccessor: { battlerIndex: number, isActor: boolean, turnOrderSpriteName: string }, iterator: number) {
    const battler: Game_BattlerBase = this.battler(battlerAccessor.battlerIndex, battlerAccessor.isActor);
    
    const character: Bitmap = this.loadImage(battlerAccessor.turnOrderSpriteName);
    const spriteYOffset = iterator * 80 + Math.floor((80 - character.rect.height) / 2);
    this.infoDisplay.bitmap.blt(character, 0, 0, character.rect.width, character.rect.height, 16, spriteYOffset);

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
            this.drawText(stacks, textXOffset, textYOffset, 8);
        }
        conditionIterator++;
    }
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
    this.background.setFrame(200, 0, 96, Graphics.boxHeight);
    this.infoDisplay.setFrame(0, 0, 96, Graphics.boxHeight);
};

Window_TurnOrder.prototype.extend = function() {
    this._state = Window_TurnOrder.STATE_EXTENDED;
    this.width = 296;
    this.background.setFrame(0, 0, 296, Graphics.boxHeight);
    this.infoDisplay.setFrame(0, 0, 296, Graphics.boxHeight);
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
        this.setTurnOrder();
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

Window_TurnOrder.prototype.drawText = function(text: string, x: number, y: number, maxWidth: number, align = 'left') {
    this.infoDisplay.bitmap.drawText(text, x, y, maxWidth, this.lineHeight(), align);
};

Window_TurnOrder.prototype.drawIcon = function(iconIndex: number, x: number, y: number) {
    var bitmap = ImageManager.loadSystem('IconSet');
    var pw = Window_Base._iconWidth;
    var ph = Window_Base._iconHeight;
    var sx = iconIndex % 16 * pw;
    var sy = Math.floor(iconIndex / 16) * ph;
    this.infoDisplay.bitmap.blt(bitmap, sx, sy, pw, ph, x, y);
};
