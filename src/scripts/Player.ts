/**
 * Information about the player.
 * All player variables need to be saved.
 */

class Player {

    private _money: KnockoutObservable<number>;
    private _dungeonTokens: KnockoutObservable<number>;
    private _caughtShinyList: KnockoutObservableArray<string>;
    private _route: KnockoutObservable<number>;
    private _caughtPokemonList: KnockoutObservableArray<CaughtPokemon>;
    private _routeKills: Array<KnockoutObservable<number>>;
    private _routeKillsNeeded: KnockoutObservable<number>;
    private _region: GameConstants.Region;
    private _gymBadges: KnockoutObservableArray<GameConstants.Badge>;
    private _pokeballs: Array<KnockoutObservable<number>>;
    private _notCaughtBallSelection: KnockoutObservable<GameConstants.Pokeball>;
    private _alreadyCaughtBallSelection: KnockoutObservable<GameConstants.Pokeball>;
    private _sortOption: KnockoutObservable<GameConstants.SortOptionsEnum>;
    private _sortDescending: KnockoutObservable<boolean>;
    private _town: KnockoutObservable<Town>;

    public clickAttackObservable: KnockoutComputed<number>;

    public pokemonAttackObservable: KnockoutComputed<number>;


    public routeKillsObservable(route: number): KnockoutComputed<number> {
        return ko.computed(function () {
            return Math.min(this.routeKillsNeeded, this.routeKills[route]());
        }, this);
    }

    public pokeballsObservable(ball: GameConstants.Pokeball): KnockoutComputed<number> {
        return ko.computed(function () {
            return this._pokeballs[ball]();
        }, this);
    }
    public setAlreadyCaughtBallSelection(ball : GameConstants.Pokeball){
        this._alreadyCaughtBallSelection(ball);
    }

    public setNotCaughtBallSelection(ball : GameConstants.Pokeball){
        this._notCaughtBallSelection(ball);
    }

    public gainPokeballs(ball : GameConstants.Pokeball, amount:number){
        this._pokeballs[ball](this._pokeballs[ball]() + amount)
    }

    public usePokeball(ball: GameConstants.Pokeball): void {
        this._pokeballs[ball](this._pokeballs[ball]() -1)
    }


    constructor(savedPlayer?) {
        savedPlayer = savedPlayer || {};
        let tmpCaughtList = [];
        this._money = ko.observable(savedPlayer._money || 0);
        this._dungeonTokens = ko.observable(savedPlayer._dungeonTokens || 0);
        this._caughtShinyList = ko.observableArray<string>(savedPlayer._caughtShinyList);
        this._route = ko.observable(savedPlayer._route || 1);
        if (savedPlayer._caughtPokemonList) {
            tmpCaughtList = savedPlayer._caughtPokemonList.map((pokemon) => {
                let tmp = new CaughtPokemon(PokemonHelper.getPokemonByName(pokemon.name), pokemon.evolved, pokemon.attackBonus, pokemon.exp);
                return tmp
            });
        }
        this._caughtPokemonList = ko.observableArray<CaughtPokemon>(tmpCaughtList);
        this._routeKills = Array.apply(null, Array(GameConstants.AMOUNT_OF_ROUTES + 1)).map(function (val, index) {
            return ko.observable(savedPlayer._routeKills ? (savedPlayer._routeKills[index] || 0) : 0)
        });
        this._routeKillsNeeded = ko.observable(savedPlayer._routeKillsNeeded || 10);
        this._region = savedPlayer._region || GameConstants.Region.kanto;
        this._gymBadges = ko.observableArray<GameConstants.Badge>(savedPlayer._gymBadges);
        this._pokeballs = Array.apply(null, Array(4)).map(function (val, index) {
            return ko.observable(savedPlayer._pokeballs ? (savedPlayer._pokeballs[index] || 1000) : 1000)
        });
        this._notCaughtBallSelection = typeof(savedPlayer._notCaughtBallSelection) != 'undefined' ? ko.observable(savedPlayer._notCaughtBallSelection) : ko.observable(GameConstants.Pokeball.Pokeball);
        this._alreadyCaughtBallSelection = typeof(savedPlayer._alreadyCaughtBallSelection) != 'undefined' ? ko.observable(savedPlayer._alreadyCaughtBallSelection) : ko.observable(GameConstants.Pokeball.Pokeball);
        if (this._gymBadges().length == 0) {
            this._gymBadges.push(GameConstants.Badge.None)
        }
        this._sortOption = ko.observable(savedPlayer._sortOption || GameConstants.SortOptionsEnum.id);
        this._sortDescending = ko.observable(typeof(savedPlayer._sortDescending) != 'undefined' ? savedPlayer._sortDescending : false)
        this.clickAttackObservable = ko.computed(function () {
            return this.calculateClickAttack()
        }, this);
        this.pokemonAttackObservable = ko.computed(function () {
            return this.calculatePokemonAttack(GameConstants.PokemonType.None, GameConstants.PokemonType.None);
        }, this);
        this._town = ko.observable(TownList["Pallet Town"])
    }

    public addRouteKill() {
        this.routeKills[this.route()](this.routeKills[this.route()]() + 1)
    }

    /**
     * Calculate the attack of all your Pokémon
     * @param type1
     * @param type2 types of the enemy we're calculating damage against.
     * @returns {number} damage to be done.
     */
    public calculatePokemonAttack(type1: GameConstants.PokemonType, type2: GameConstants.PokemonType): number {
        // TODO Calculate pokemon attack by checking the caught list, upgrades and multipliers.
        // TODO factor in types
        // TODO start at 0
        let attack = 5;
        for (let pokemon of this.caughtPokemonList) {
            attack += pokemon.attack();
        }

        // return attack;
        return 10;
    }

    public calculateClickAttack(): number {
        // TODO Calculate click attack by checking the caught list size, upgrades and multipliers.
        return 5000;
    }

    public calculateMoneyMultiplier(): number {
        // TODO Calculate money multiplier by checking upgrades and multipliers.
        return 1;
    }

    public calculateExpMultiplier(): number {
        // TODO Calculate exp multiplier by checking upgrades and multipliers.
        return 1;
    }

    public calculateDungeonTokenMultiplier(): number {
        // TODO Calculate dungeon token multiplier by checking upgrades and multipliers.
        return 1;
    }

    public calculateCatchTime(): number {
        // TODO Calculate catch time by checking upgrades and multipliers.
        return 20;
    }

    /**
     * Checks the players preferences to see what pokéball needs to be used on the next throw.
     * Checks from the players pref to the most basic ball to see if the player has any.
     * @param alreadyCaught if the pokémon is already caught.
     * @param shiny if the pokémon is shiny.
     * @returns {GameConstants.Pokeball} pokéball to use.
     */
    public calculatePokeballToUse(alreadyCaught: boolean, shiny:boolean): GameConstants.Pokeball {
        let pref: GameConstants.Pokeball;
        if (alreadyCaught) {
            pref = this._alreadyCaughtBallSelection();
        } else {
            pref = this._notCaughtBallSelection();
        }

        // Always throw the highest available Pokéball at shinies
        if(shiny){
            pref = GameConstants.Pokeball.Masterball;
        }

        let use: GameConstants.Pokeball = GameConstants.Pokeball.None;

        for (let i: number = pref; i >= 0; i--) {
            if (this._pokeballs[i]() > 0) {
                use = i;
                break;
            }
        }
        return use;
    }


    /**
     * Loops through the caughtPokemonList to check if the pokémon is already caight
     * @param pokemonName name to search for.
     * @returns {boolean}
     */
    public alreadyCaughtPokemon(pokemonName: string) {
        for (let i: number = 0; i < this.caughtPokemonList.length; i++) {
            if (this.caughtPokemonList[i].name == pokemonName) {
                return true;
            }
        }
        return false;
    }

    public alreadyCaughtPokemonShiny(pokemonName: string) {
        for (let i: number = 0; i < this.caughtShinyList().length; i++) {
            if (this.caughtShinyList()[i] == pokemonName) {
                return true;
            }
        }
        return false;
    }

    public capturePokemon(pokemonName: string, shiny: boolean = false) {
        if (!this.alreadyCaughtPokemon(pokemonName)) {
            let pokemonData = PokemonHelper.getPokemonByName(pokemonName);
            let caughtPokemon: CaughtPokemon = new CaughtPokemon(pokemonData, false, 0, 0);
            this._caughtPokemonList.push(caughtPokemon);
        }
        if (shiny && !this.alreadyCaughtPokemonShiny(pokemonName)) {
            this._caughtShinyList.push(pokemonName);
            Save.store(player);
        }
    }

    public hasBadge(badge: GameConstants.Badge) {
        if (badge == undefined || GameConstants.Badge.None) {
            return true;
        }
        for (let i = 0; i < this._gymBadges().length; i++) {
            if (this._gymBadges()[i] == badge) {
                return true;
            }
        }
        return false;
    }

    public gainMoney(money: number) {
        // TODO add money multipliers
        this._money(Math.floor(this._money() + money));
    }

    public gainExp(exp: number, level: number, trainer: boolean) {
        // TODO add exp multipliers
        let trainerBonus = trainer ? 1.5 : 1;
        let expTotal = Math.floor(exp * level * trainerBonus / 9);

        for (let pokemon of this._caughtPokemonList()) {
            if (pokemon.levelObservable() < (this.gymBadges.length + 2) * 10) {
                pokemon.exp(pokemon.exp() + expTotal);
            }
        }
    }

    public sortedPokemonList(): KnockoutComputed<Array<CaughtPokemon>> {
        return ko.computed(function () {
            return this._caughtPokemonList().sort(PokemonHelper.compareBy(GameConstants.SortOptionsEnum[player._sortOption()], player._sortDescending()))
        }, this);
    }

    public gainBadge(badge: GameConstants.Badge) {
        this._gymBadges().push(badge);
    }

    get routeKills(): Array<KnockoutObservable<number>> {
        return this._routeKills;
    }

    set routeKills(value: Array<KnockoutObservable<number>>) {
        this._routeKills = value;
    }

    get routeKillsNeeded(): number {
        return this._routeKillsNeeded();
    }

    set routeKillsNeeded(value: number) {
        this._routeKillsNeeded(value);
    }

    get route(): KnockoutObservable<number> {
        return this._route;
    }

    set route(value: KnockoutObservable<number>) {
        this._route = value;
    }

    get money(): number {
        return this._money();
    }

    get dungeonTokens(): KnockoutObservable<number> {
        return this._dungeonTokens;
    }

    get caughtPokemonList() {
        return this._caughtPokemonList();
    }

    get region(): GameConstants.Region {
        return this._region;
    }

    set region(value: GameConstants.Region) {
        this._region = value;
    }

    get gymBadges(): GameConstants.Badge[] {
        return this._gymBadges();
    }

    set gymBadges(value: GameConstants.Badge[]) {
        this._gymBadges(value);
    }

    get caughtShinyList(): KnockoutObservableArray<string> {
        return this._caughtShinyList;
    }

    set caughtShinyList(value: KnockoutObservableArray<string>) {
        this._caughtShinyList = value;
    }

    get town(): KnockoutObservable<Town> {
        return this._town;
    }

    set town(value: KnockoutObservable<Town>) {
        this._town = value;
    }

    public toJSON() {
        let keep = ["_money", "_dungeonTokens", "_caughtShinyList", "_route", "_caughtPokemonList", "_routeKills", "_routeKillsNeeded", "_region", "_gymBadges", "_pokeballs", "_notCaughtBallSelection", "_alreadyCaughtBallSelection", "_sortOption", "_sortDescending"];
        let plainJS = ko.toJS(this);
        return Save.filter(plainJS, keep)
    }

}

