///<reference path="Item.ts"/>
class BattleItem extends Item {

    type: GameConstants.BattleItemType;

    constructor(type: GameConstants.BattleItemType, description: string, basePrice: number, currency: GameConstants.Currency = GameConstants.Currency.money, displayName?: string) {
        super(GameConstants.BattleItemType[type], basePrice, currency, undefined, displayName, description);
        this.type = type;
    }

    use() {
        EffectEngineRunner.addEffect(this.name(), ItemHandler.amountToUse);
    }
}

ItemList['xAttack']         = new BattleItem(GameConstants.BattleItemType.xAttack, '+50% Bonus to Pokémon attack', 600);
ItemList['xClick']          = new BattleItem(GameConstants.BattleItemType.xClick, '+50% Bonus to click attack', 400);
ItemList['Lucky_egg']       = new BattleItem(GameConstants.BattleItemType.Lucky_egg, '+50% Bonus to experience gained', 800, undefined, 'Lucky Egg');
ItemList['Token_collector'] = new BattleItem(GameConstants.BattleItemType.Token_collector, '+50% Bonus to dungeon tokens gained', 1000, undefined, 'Token Collector');
ItemList['Item_magnet']     = new BattleItem(GameConstants.BattleItemType.Item_magnet, '+50% Chance of gaining an extra item', 1500, undefined, 'Item Magnet');
ItemList['Lucky_incense']   = new BattleItem(GameConstants.BattleItemType.Lucky_incense, '+50% Bonus to money gained', 2000, undefined, 'Lucky Incense');
