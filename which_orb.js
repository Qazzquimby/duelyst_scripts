//$.getScript('https://duelyststats.info/scripts/collectionEnhancement.js', function(){var collectionMod = new CollectionEnhancementModule();});

/*
WRITTEN BY T2K5
 Collection enhancements module
 */
var sort_by;
var CollectionEnhancementModule = function () {
    this.resetCollectionBaseStats();
    this.rarityCost = [0, 40, 100, 350, 900];
    this.rarityDustCost = [0, 10, 20, 100, 350];
    this.prismaticRarityCost = [0, 200, 350, 900, 1800];
    this.prismaticRarityDustCost = [0, 40, 100, 350, 900];
    this.setDroprates = [
        {},
        {
            normal: [0, 0.5746, 0.2401, 0.0924, 0.04336],
            prismatic: [0, 0.0247, 0.0129, 0.007, 0.0047]
        }, //Core
        {
            normal: [0, 0.573, 0.2663, 0.0871, 0.0362],
            prismatic: [0, 0.0177, 0.0115, 0.0054, 0.0029]
        }, //Shimzar
        {},
        {},
        {
            normal: [0, 0.5696, 0.2642, 0.0875, 0.0406],
            prismatic: [0, 0.0187, 0.0121, 0.0053, 0.0020]
        } //Prophecy
    ];
    this.workingDeck = false;
    this.failedCardAdditions = [];
    this.urls = {
        duelystDB: 'http://duelystdb.com/squad/build#',
        manaspring: 'http://manaspring.ru/deckbuilder/#',
        bagoum: 'http://www.bagoum.com/deckbuilder#',
        duelystcards: 'http://duelystcards.com/#',
        plaintext: 'https://duelyststats.info/scripts/decklist.php?deckList='
    };

    this.usingBrowser = (typeof process === 'undefined' || typeof process.versions.electron === 'undefined');
    this.resourcePath = this.usingBrowser ? 'https://assets-counterplaygames.netdna-ssl.com/production/resources' : 'resources';
    this.deckBuilderNames = {
        duelystDB: 'DuelystDB (dead)',
        manaspring: 'Manaspring',
        bagoum: 'Bagoum',
        duelystcards: 'DuelystCards',
        plaintext: "T2k5's plaintext list (always up-to-date)"
    };
    this.collectionStatInterval = false;
    this.cardCollectionZeroPoint = false;
    this.collectionStats = {};
    this.resetCollectionStats();

    this.activeDeckBuilder = this.deckBuilderNames.bagoum;
    this.ids = {
        CP: {
            appMain: 'app-main',
            contentRegion: 'app-content-region',
            collection: 'app-collection',
            crafting: 'app-crafting',
            craftStart: 'crafting-mode-start',
            modalRegion: 'app-modal-region',
            craftingRewards: 'crafting-rewards-dialog',
            deck: 'app-deck',
            cardsCollection: 'app-cards-collection',
            boosterCollection: 'booster_pack_collection'

        },
        modals: {
            extraCardsModal: 'mod-collection-enhancement-extra-cards-modal',
            collectionStatistics: 'mod-collection-enhancement-collection-statistics-modal'
        },
        controls: {
            selectDeckBuilder: 'mod-collection-enhancement-select-deck-builder',
            createCollectionZeroPoint: 'mod-collection-enhancement-create-collection-zero-point',
            openAllSpiritOrbs: 'mod-collection-enhancement-open-all-spirit-orbs'
        },
        containers: {
            extraCardsList: 'mod-collection-enhancement-extra-cards-list',
            extraCardsDustValue: 'mod-collection-enhancement-extra-cards-dust-value',
            packStats: 'mod-collection-enhancement-pack-statistics'
        }
    };

    this.classNames = {
        CP: {
            appMain: 'app-main',
            mainMenu: 'main-menu',
            codexButton: 'codex',
            modalRegion: 'app-modal-region',
            collectionControls: 'collection-controls-alt',
            craftingButton: 'crafting-mode-start',
            disenchant: 'crafting-disenchant',
            confirmButton: 'confirm-dialog',
            craftingContainer: 'crafting-card-container',
            craftingRewards: 'crafting-rewards-dialog',
            rewardConfirm: 'btn-clean-primary',
            deckPreview: 'deck-preview',
            deckName: 'deck-name',
            decksCollection: 'decks-collection',
            deckMetaData: 'deck-metadata-header',
            newDeckButton: 'deck-new',
            deckCardList: 'cards-list',
            cards: 'cards',
            card: 'card',
            choice: 'choice',
            name: 'name',
            cancelDeck: 'deck-cancel',
            nextButton: 'next-page',
            packControls: 'booster-packs-controls',
            packDropper: 'booster-pack-unlock',
            popover: 'popover-content'
        },
        modals: {
            generic: 'modal duelyst-modal'
        },
        controls: {
            closeModal: 'btn btn-clean btn-user-cancel btn-cancel-primary',
            collectionButton: 'btn btn-clean btn-clean-primary highlight',
            openExtraCardsMenu: 'mod-collection-enhancement-open-extra-cards-menu-button',
            dumpCollection: 'mod-collection-enhancement-dump-collection-button',
            exportToDuelystDB: 'mod-collection-enhancement-export-to-duelystdb',
            importFromDuelystDB: 'mod-collection-enhancement-import-from-duelystdb',
            collectionStatsButton: 'mod-collection-stats-button'
        },
        containers: {
            modalBody: 'modal-body clearfix',
            modalContentRegion: 'content-region',
            extraCardsList: 'mod-collection-enhancement-extra-cards-list',
            extraCard: 'mod-collection-enhancement-extra-card',
            extraCardName: 'mod-collection-enhancement-extra-card-name',
            extraCardDust: 'mod-collection-enhancement-extra-card-dust',
            extraCardCount: 'mod-collection-enhancement-extra-card-count',
            modalDialog: 'modal-dialog',
            packsOpened: 'mod-collection-enhancement-packs-opened',
            cardStatName: 'mod-collection-enhancement-card-stat-name',
            cardStatValue: 'mod-collection-enhancement-card-stat-value',
            cardStatExtraValue: 'mod-collection-enhancement-card-stat-extra-value'
        },
        inputs: {
            importFromDuelystDB: 'mod-collection-enhancement-import-from-duelystdb-input'
        }
    };

    this.styles = {
        modals: {
            generic: 'z-index: 100000;'
        },
        controls: {
            selectDeckBuilderLabel: 'position: relative;font-size: 1.2rem;text-transform: uppercase;color: #ddd;padding: 0 0.6rem;margin-top: .5rem;display: flex;flex-flow: row nowrap;-webkit-box-pack: center;justify-content: center;-webkit-box-align: center;align-items: center;align-content: center;',
            selectDeckBuilder: 'font-size: 1.2rem!important;width: 12rem;padding: .1rem 1rem;border-radius: 1rem;color: #323232;'
        },
        containers: {
            modalDialog: 'modal-dialog',
            modalContent: 'margin-top: -4.5rem',
            extraCardsList: 'background-color: rgba(0,0,60,.85); width: 94rem; height: 55rem; overflow-y: scroll; border-radius: 2rem; margin: 1rem 0 0 0; padding: 0;',
            extraCard: 'border-bottom: 1px solid rgba(0,0,255,.75); padding: 0.5rem;',
            collectionStatisticsRow: 'border-bottom: 1px solid rgba(0,0,255,.75); padding: 0.5rem; margin: 0 8rem 0 5rem',
            packStatsTable: 'position: absolute; left: 3rem; top: 6rem; color: #FFFFFF; background-color: rgba(0,0,60,.85); overflow-y: scroll; border-radius: 2rem; margin: 0 0 0 0; padding: 2rem;',
            packStatsCell: 'text-align: right; padding: 0 0.8rem;',
            prismaticBackground: 'rgba(198,31,131,0.35)',
            spacer: 'margin-bottom: 0.5rem',
            cardStat: 'width: 25rem; text-align: right;',
            extraCardStat: 'width: 10rem; text-align: right;'
        },
        rarity: {
            '0': '#FFFFFF',
            '1': '#FFFFFF',
            '2': '#00faff',
            '3': '#c78fe1',
            '4': '#ffd723'
        }
    };

    this.template = {
        modals: {
            extraCardsMenu: '<div id="' + this.ids.modals.extraCardsMenu + '" class="' + this.classNames.modals.generic + '" style="' + this.styles.modals.generic + '">\n\
                            <div class="' + this.classNames.containers.modalDialog + '"><button type="button" class="' + this.classNames.controls.closeModal + '"></button>\n\
                                <div class="modal-content" style="' + this.styles.containers.modalContent + '">\n\
                                    <div class="' + this.classNames.containers.modalBody + '">\n\
                                        <div class="' + this.classNames.containers.modalContentRegion + '"></div>\n\
                                    </div>\n\
                                </div>\n\
                            </div>\n\
                        </div>',
            collectionStatistics: '<div id="' + this.ids.modals.collectionStatistics + '" class="' + this.classNames.modals.generic + '" style="' + this.styles.modals.generic + '">\n\
                            <div class="' + this.classNames.containers.modalDialog + '"><button type="button" class="' + this.classNames.controls.closeModal + '"></button>\n\
                                <div class="modal-content" style="' + this.styles.containers.modalContent + '">\n\
                                    <div class="' + this.classNames.containers.modalBody + '">\n\
                                        <div class="' + this.classNames.containers.modalContentRegion + '"></div>\n\
                                    </div>\n\
                                </div>\n\
                            </div>\n\
                        </div>'
        },
        controls: {
            openExtraCardsMenu: '<button class="' + this.classNames.controls.collectionButton + ' ' + this.classNames.controls.openExtraCardsMenu + '" data-original-title="" title="">Extra Cards </button>',
            dumpCollection: '<button class="' + this.classNames.controls.collectionButton + ' ' + this.classNames.controls.dumpCollection + '" data-original-title="" title="">Not CSV :o <i class="fa fa-file-excel-o"></i></button>',
            exportToDuelystDB: '<button class="' + this.classNames.controls.exportToDuelystDB + ' fa fa-cloud-upload" style="font-size: 2rem; position: absolute; top: 0.4rem; right: 0.3rem; display:block; z-index:10000;"></button>',
            importFromDuelystDB: '<input class="' + this.classNames.inputs.importFromDuelystDB + '" type="url" placeholder="Paste deck URL" style="display:none; background-color: rgba(50,50,50,0.8);-webkit-box-flex: 1;-webkit-flex: 1;-ms-flex: 1;flex: 1;border: none;color: #fff;font-family: Lato, sans-serif;letter-spacing: 0;text-transform: uppercase;font-weight: 700;font-size: 2.3rem;line-height: 3.3rem;padding: .2rem 0;margin: .2rem 0;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;width: 85%;"><button class="' + this.classNames.controls.importFromDuelystDB + ' fa fa-cloud-download pull-right" style="font-size: 3rem; display:inline-block;"></button>',
            selectDeckBuilder: '<label for="' + this.ids.controls.selectDeckBuilder + '" style="' + this.styles.controls.selectDeckBuilderLabel + '">Export decks to:</label><select id="' + this.ids.controls.selectDeckBuilder + '" style="' + this.styles.controls.selectDeckBuilder + '"><option value="' + this.deckBuilderNames.manaspring + '">' + this.deckBuilderNames.manaspring + '</option><option value="' + this.deckBuilderNames.bagoum + '">' + this.deckBuilderNames.bagoum + '</option><option value="' + this.deckBuilderNames.duelystcards + '">' + this.deckBuilderNames.duelystcards + '</option><option value="' + this.deckBuilderNames.plaintext + '">' + this.deckBuilderNames.plaintext + '</option><option value="' + this.deckBuilderNames.duelystDB + '">' + this.deckBuilderNames.duelystDB + '</option></select>',
            createCollectionZeroPoint: '<button type="button" id="' + this.ids.controls.createCollectionZeroPoint + '" class="btn-panel btn btn-primary">Reset Orb Stats</button>',
            openAllSpiritOrbs: '<button type="button" id="' + this.ids.controls.openAllSpiritOrbs + '" class="btn btn-danger">OPEN ALL SPIRIT ORBS</button>',
            collectionStatsButton: '<button class="btn ' + this.classNames.controls.collectionStatsButton + '"  data-toggle="tooltip" data-placement="left" title="" data-original-title="Collection statistics" title="Collection statistics" style="opacity: 1;"><img src="' + this.resourcePath + '/ui/collection_card_rarity_rare.png" width="4.6rem" height="4.6rem" style="width: 4.6rem; height: 4.6rem; opacity: 0.8; margin: 0 1.5rem .5rem 0;"/>Collection stats<span class="badge"></span></button>'
        },
        containers: {
            extraCardsList: '<div style="' + this.styles.containers.extraCardsList + '"><h2>Extra cards: <span id="' + this.ids.containers.extraCardsDustValue + '"></span> <i class="fa fa-recycle"></i></h2><ul id="' + this.ids.containers.extraCardsList + '" class="' + this.classNames.containers.extraCardsList + '"></ul></div>',
            extraCard: '<li class="' + this.classNames.containers.extraCard + ' clearfix" style="' + this.styles.containers.extraCard + '"><span class="' + this.classNames.containers.extraCardName + ' pull-left"></span><span class="' + this.classNames.containers.extraCardCount + ' pull-right"></span></li>',
            packStatsTable: '<div id="' + this.ids.containers.packStats + '" class="" style="' + this.styles.containers.packStatsTable + '"><button type="button" id="' + this.ids.controls.createCollectionZeroPoint + '" class="btn-panel btn btn-primary">Reset Orb Stats</button>\n\
<h2>Normal</h2>\n\
<table data-type="base">\n\
<thead><tr><th>Rarity</th><th style="' + this.styles.containers.packStatsCell + '">#</th><th style="' + this.styles.containers.packStatsCell + '">%</th></tr></thead>\n\
<tbody>\n\
<tr data-rarity="1" style="color:' + this.styles.rarity['1'] + ';"><td>Common</td><td style="' + this.styles.containers.packStatsCell + '">0</td><td style="' + this.styles.containers.packStatsCell + '">0</td></tr>\n\
<tr data-rarity="2" style="color:' + this.styles.rarity['2'] + ';"><td>Rare</td><td style="' + this.styles.containers.packStatsCell + '">0</td><td style="' + this.styles.containers.packStatsCell + '">0</td></tr>\n\
<tr data-rarity="3" style="color:' + this.styles.rarity['3'] + ';"><td>Epic</td><td style="' + this.styles.containers.packStatsCell + '">0</td><td style="' + this.styles.containers.packStatsCell + '">0</td></tr>\n\
<tr data-rarity="4" style="color:' + this.styles.rarity['4'] + ';"><td>Legendary</td><td style="' + this.styles.containers.packStatsCell + '">0</td><td style="' + this.styles.containers.packStatsCell + '">0</td></tr>\n\
</tbody></table>\n\
<h2>Prismatic</h2>\n\
<table data-type="prismatic">\n\
<thead><tr><th>Rarity</th><th style="' + this.styles.containers.packStatsCell + '">#</th><th style="' + this.styles.containers.packStatsCell + '">%</th></tr></thead>\n\
<tbody>\n\
<tr data-rarity="1" style="color:' + this.styles.rarity['1'] + ';"><td>Common</td><td style="' + this.styles.containers.packStatsCell + '">0</td><td style="' + this.styles.containers.packStatsCell + '">0</td></tr>\n\
<tr data-rarity="2" style="color:' + this.styles.rarity['2'] + ';"><td>Rare</td><td style="' + this.styles.containers.packStatsCell + '">0</td><td style="' + this.styles.containers.packStatsCell + '">0</td></tr>\n\
<tr data-rarity="3" style="color:' + this.styles.rarity['3'] + ';"><td>Epic</td><td style="' + this.styles.containers.packStatsCell + '">0</td><td style="' + this.styles.containers.packStatsCell + '">0</td></tr>\n\
<tr data-rarity="4" style="color:' + this.styles.rarity['4'] + ';"><td>Legendary</td><td style="' + this.styles.containers.packStatsCell + '">0</td><td style="' + this.styles.containers.packStatsCell + '">0</td></tr>\n\
</tbody></table><p>Packs opened: <span class="' + this.classNames.containers.packsOpened + '">0</span></p></div>\n\
',
            collectionStatistics: '<div style="' + this.styles.containers.extraCardsList + '"><h2>Collection statistics</h2>\n\
<ul>\n\
</ul>\n\
</div>',
            collectionStatRow: '<li class="clearfix" style="' + this.styles.containers.collectionStatisticsRow + '"><span class="' + this.classNames.containers.cardStatName + ' pull-left"></span><span class="' + this.classNames.containers.cardStatValue + ' pull-right" style="' + this.styles.containers.cardStat + '"></span><span class="' + this.classNames.containers.cardStatExtraValue + ' pull-right"></span></li>'
        },
        inputs: {
        }
    };

    this.modals = {
        extraCardsMenu: false
    };


    this.sideBarObserver = false;
    this.startMainMenuObserver();
    this.actionMap();
    // Quick and dirty search enhancer.
    setTimeout(function () {
        //Debugging :3
        if (GameDataManager) {
            if (GameDataManager.instance) {
                if (GameDataManager.instance.cardsCollection) {
                    if (GameDataManager.instance.cardsCollection.models) {
                        $.each(GameDataManager.instance.cardsCollection.models, function (index, data) {
                            if (this.attributes.isUnit) {
                                this.attributes.searchableContent += ' attack' + this.attributes.atk + ' life' + this.attributes.hp + ' health' + this.attributes.hp;
                            }
                            if (this.attributes.inventoryCount > 3)
                                this.attributes.searchableContent += ' extracards';
                            else if (this.attributes.inventoryCount < 3 && !this.attributes.isGeneral)
                                this.attributes.searchableContent += ' missing';
                            this.attributes.searchableContent += ' mana' + this.attributes.manaCost;

                        });
                    }
                }
            }
        }
    }, 9000);

};

CollectionEnhancementModule.prototype.resetCollectionBaseStats = function () {
    this.totalCards = 0;
    this.ownedCards = 0;
    this.totalNormals = 0;
    this.totalPrismatics = 0;
    this.ownedNormals = 0;
    this.ownedPrismatics = 0;
    this.totalSkins = 0;
    this.ownedSkins = 0;
    this.totalRarities = [0, 0, 0, 0, 0];
    this.ownedRarities = [0, 0, 0, 0, 0];
    this.totalPrismaticRarities = [0, 0, 0, 0, 0];
    this.ownedPrismaticRarities = [0, 0, 0, 0, 0];

    this.totalSetNormalRarities = [[], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]];
    this.ownedSetNormalRarities = [[], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]];
    this.totalSetPrismaticRarities = [[], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]];
    this.ownedSetPrismaticRarities = [[], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]];


    this.missingCards = [];
    this.missingValue = 0;
    this.missingNormalValue = 0;
    this.missingPrismaticValue = 0;
    this.collectionValue = 0;
    this.collectionDustValue = 0;
    this.extraCards = [];
    this.extraDustValue = 0;
    this.cosmetics = {
        card_skin: {
            owned: 0,
            total: 0
        },
        emote: {
            owned: 0,
            total: -7
        },
        profile_icon: {
            owned: 0,
            total: 0
        },
        battle_map: {
            owned: 0,
            total: 0
        },
        card_back: {
            owned: 0,
            total: 0
        },
        scene: {
            owned: 0,
            total: 0
        }
    }
};

CollectionEnhancementModule.prototype.getCosmeticsStats = function () {
    var self = this;
    $.each(SDK.CosmeticsFactory.getAllCosmetics(), function () {
        if (this.enabled && (this.unlockable || this.purchasable) && self.cosmetics[this.typeId]) {
            if (InventoryManager.instance.cosmeticsCollection._byId[this.id]) {
                self.cosmetics[this.typeId].owned++;
            }
            self.cosmetics[this.typeId].total++;
        }
    });
};

CollectionEnhancementModule.prototype.addCardToSetStats = function (attrs) {
    var self = this;
    this.totalCards = this.totalCards + 3;
    if (attrs.isPrismatic) {
        this.totalPrismatics = this.totalPrismatics + 3;
        this.totalPrismaticRarities[attrs.rarityId] = this.totalPrismaticRarities[attrs.rarityId] + 3;
        this.totalSetPrismaticRarities[attrs.cardSetId][attrs.rarityId] = this.totalSetPrismaticRarities[attrs.cardSetId][attrs.rarityId] + 3;
    } else {
        this.totalNormals = this.totalNormals + 3;
        this.totalRarities[attrs.rarityId] = this.totalRarities[attrs.rarityId] + 3;
        this.totalSetNormalRarities[attrs.cardSetId][attrs.rarityId] = this.totalSetNormalRarities[attrs.cardSetId][attrs.rarityId] + 3;
    }

    if (attrs.inventoryCount > 0) {
        this.ownedCards = attrs.inventoryCount > 3 ? this.ownedCards + 3 : this.ownedCards + attrs.inventoryCount;

        if (attrs.isPrismatic) {
            this.ownedPrismatics = attrs.inventoryCount > 3 ? this.ownedPrismatics + 3 : this.ownedPrismatics + attrs.inventoryCount;
            this.ownedPrismaticRarities[attrs.rarityId] = attrs.inventoryCount > 3 ? this.ownedPrismaticRarities[attrs.rarityId] + 3 : this.ownedPrismaticRarities[attrs.rarityId] + attrs.inventoryCount;

            this.ownedSetPrismaticRarities[attrs.cardSetId][attrs.rarityId] = attrs.inventoryCount > 3 ? this.ownedSetPrismaticRarities[attrs.cardSetId][attrs.rarityId] + 3 : this.ownedSetPrismaticRarities[attrs.cardSetId][attrs.rarityId] + attrs.inventoryCount;

        } else {
            this.ownedNormals = attrs.inventoryCount > 3 ? this.ownedNormals + 3 : this.ownedNormals + attrs.inventoryCount;
            this.ownedRarities[attrs.rarityId] = attrs.inventoryCount > 3 ? this.ownedRarities[attrs.rarityId] + 3 : this.ownedRarities[attrs.rarityId] + attrs.inventoryCount;

            this.ownedSetNormalRarities[attrs.cardSetId][attrs.rarityId] = attrs.inventoryCount > 3 ? this.ownedSetNormalRarities[attrs.cardSetId][attrs.rarityId] + 3 : this.ownedSetNormalRarities[attrs.cardSetId][attrs.rarityId] + attrs.inventoryCount;
        }
    }
};

CollectionEnhancementModule.prototype.isValidCollectionCard = function (attrs) {
    return (attrs.isAvailable && !attrs.isGeneral && !attrs.isSkinned && !attrs.isHiddenInCollection && attrs.rarityId < 5 && attrs.showRarity && attrs.factionName.indexOf('Tutorial') < 0)
}
CollectionEnhancementModule.prototype.initCollectionDetails = function () {
    this.resetCollectionBaseStats()
    var self = this;
    e = $.each(GameDataManager.instance.cardsCollection.models, function (index, card) {
        attrs = card.attributes;
        if (attrs.isSkinned && !attrs.isPrismatic) {
            self.totalSkins++;

            if (attrs.canShowSkin) {
                self.ownedSkins++;
            } else {

            }
        }
        if (self.isValidCollectionCard(attrs)) {
            self.addCardToSetStats(attrs);

            var rarityCost = attrs.isPrismatic ? self.prismaticRarityCost : self.rarityCost;
            var rarityDust = attrs.isPrismatic ? self.prismaticRarityDustCost : self.rarityDustCost;


            self.collectionValue += (rarityCost[attrs.rarityId] * attrs.inventoryCount);
            self.collectionDustValue += (rarityDust[attrs.rarityId] * attrs.inventoryCount);
            if (attrs.inventoryCount < 3) {
                var missingCount = (3 - attrs.inventoryCount);
                if (missingCount > 0) {
                    self.missingValue += (rarityCost[attrs.rarityId] * missingCount);
                    if (attrs.isPrismatic) {
                        self.missingPrismaticValue += (rarityCost[attrs.rarityId] * missingCount);
                    } else {
                        self.missingNormalValue += (rarityCost[attrs.rarityId] * missingCount);
                    }
                    self.missingCards.push({ id: attrs.id, name: attrs.name, missingCount: missingCount, rarity: attrs.rarityId, prismatic: attrs.isPrismatic, faction: attrs.factionId });
                }
            } else if (attrs.inventoryCount > 3) {
                var dustValue = (rarityDust[attrs.rarityId] * (attrs.inventoryCount - 3));
                self.extraCards.push({ id: attrs.id, name: attrs.name, extraCount: (attrs.inventoryCount - 3), isPrismatic: attrs.isPrismatic, dustValue: dustValue, rarity: attrs.rarityId, faction: attrs.factionId, cardType: (attrs.isArtifact ? 'artifact' : attrs.isSpell ? 'spell' : attrs.isUnit ? 'minion' : '') });
                self.extraDustValue += dustValue;
            }
        }
    });
};

CollectionEnhancementModule.prototype.resetCollectionStats = function () {
    this.collectionStats = {
        base: {
            0: 0,
            1: 0,
            2: 0,
            3: 0,
            4: 0
        },
        prismatic: {
            0: 0,
            1: 0,
            2: 0,
            3: 0,
            4: 0
        },
        totalCards: 0
    }
}
CollectionEnhancementModule.prototype.getOrbStats = function () {
    var newCardsInCollection = this.getCardCollection(true);
    var baseTable = $('#' + this.ids.containers.packStats).find('table[data-type="base"]');
    var prismaticTable = $('#' + this.ids.containers.packStats).find('table[data-type="prismatic"]');

    $('#' + this.ids.containers.packStats).find('.' + this.classNames.containers.packsOpened).html(Math.floor(this.collectionStats.totalCards / 5));
    function updateStats(table, stats, totalCards) {
        $.each(stats, function (index, count) {
            var row = $(table).find('tr[data-rarity="' + index + '"]');
            $(row).find('td:eq(1)').html(count);
            $(row).find('td:eq(2)').html(totalCards > 0 ? ((count / totalCards) * 100).toFixed(2) : '0');
        });
    }

    updateStats(baseTable, this.collectionStats.base, this.collectionStats.totalCards);
    updateStats(prismaticTable, this.collectionStats.prismatic, this.collectionStats.totalCards);

};

CollectionEnhancementModule.prototype.createCollectionZeroPoint = function () {
    this.cardCollectionZeroPoint = this.getCardCollection(false);
};

CollectionEnhancementModule.prototype.getCardCollection = function (useZeroPoint) {
    var self = this;
    self.resetCollectionStats();
    var currentInventory = {
        base: {
        },
        prismatic: {
        },
        skin: {

        }
    };
    $.each(GameDataManager.instance.cardsCollection.models, function (index, card) {
        attrs = card.attributes;
        if (attrs.isSkinned && !attrs.isPrismatic) {
            currentInventory.skin[attrs.id] = attrs.inventoryCount;
        } else if (self.isValidCollectionCard(attrs)) {
            //&& self.cardCollectionZeroPoint[attrs.isPrismatic ? 'prismatic' : 'base'][attrs.id].length && self.cardCollectionZeroPoint[attrs.isPrismatic ? 'prismatic' : 'base'][attrs.id].inventoryCount < attrs.inventoryCount 
            var inventoryDelta = useZeroPoint ? attrs.inventoryCount - self.cardCollectionZeroPoint[attrs.isPrismatic ? 'prismatic' : 'base'][attrs.id].inventoryCount : attrs.inventoryCount;
            var actuallyInterestingCardData = {
                id: attrs.id,
                baseCardId: attrs.baseCardId,
                inventoryCount: inventoryDelta,
                name: attrs.name,
                rarityId: attrs.rarityId
            }
            if (useZeroPoint) {
                self.collectionStats[attrs.isPrismatic ? 'prismatic' : 'base'][attrs.rarityId] += inventoryDelta;
                self.collectionStats.totalCards += inventoryDelta;
            }
            currentInventory[attrs.isPrismatic ? 'prismatic' : 'base'][attrs.id] = actuallyInterestingCardData;
        }
    });
    return currentInventory;
};

CollectionEnhancementModule.prototype.setCollectionZeroPoint = function (zeroPoint) {
    this.cardCollectionZeroPoint = $.parseJSON(zeroPoint);
};

CollectionEnhancementModule.prototype.startMainMenuObserver = function () {
    var self = this;
    function showExtraCardsButton() {
        if ($('.' + self.classNames.CP.collectionControls).is(':visible') && !$('#' + self.ids.controls.selectDeckBuilder).length) {
            $('.' + self.classNames.CP.craftingButton).before(self.template.controls.openExtraCardsMenu);
            $('.' + self.classNames.CP.craftingButton).before(self.template.controls.dumpCollection);
            $('.' + self.classNames.CP.craftingButton).before(self.template.controls.selectDeckBuilder);
            $('#' + self.ids.controls.selectDeckBuilder).val(self.activeDeckBuilder);
            self.createDeckBuilderExportLinks();
            this.sideBarObserver = new MutationObserver(function (mutations) {
                if ($('.' + self.classNames.CP.decksCollection).is(':visible')) {
                    setTimeout(function () {
                        self.createDeckBuilderExportLinks()
                    }, 1500);
                } else if ($('#' + self.ids.CP.deck).is(':visible') && $('.' + self.classNames.CP.deckCardList).find('.' + self.classNames.CP.cards).html().length < 20) {
                    if (!$('.' + self.classNames.controls.importFromDuelystDB).length) {
                        $('input.' + self.classNames.CP.deckName).after($.parseHTML(self.template.controls.importFromDuelystDB));
                    }

                }
            });
            this.sideBarObserver.observe($('.collection-sidebar-region').get(0), { attributes: true, childList: true, characterData: false });
        } else {
            this.sideBarObserver = false;
        }
    }

    function showCollectionZeroPointButton() {
        if ($('#' + self.ids.CP.boosterCollection).is(':visible') && !$('#' + self.ids.controls.openAllSpiritOrbs).length) {

            $('.' + self.classNames.CP.packControls).append(self.template.controls.openAllSpiritOrbs);
            $('.' + self.classNames.CP.packDropper).append(self.template.containers.packStatsTable);

            if (!self.cardCollectionZeroPoint) {
                self.createCollectionZeroPoint(false);
            }
            self.collectionStatInterval = setInterval(function () {
                self.getOrbStats();
            }, 3000)
        } else if (self.collectionStatInterval !== false && !$('#' + self.ids.controls.createCollectionZeroPoint).length) {
            clearInterval(self.collectionStatInterval);
            self.collectionStatInterval = false;
        }
    }

    function showStatsButton() {
        if ($('.main-menu').is(':visible') && !$('.' + self.classNames.controls.collectionStatsButton).length) {
            $('.main-menu button').css('margin-bottom', '0rem');
            $('#app-utility-main-menu .booster-pack-collection').css('height', '10rem');
            $('.codex').after(self.template.controls.collectionStatsButton);
        }
    }

    this.mainMenuObserver = new MutationObserver(function (mutations) {
        showExtraCardsButton();
        showCollectionZeroPointButton();
        showStatsButton();
    });
    showExtraCardsButton();
    this.mainMenuObserver.observe(document.getElementById(this.ids.CP.appMain), { attributes: true, childList: false, characterData: false });

};

CollectionEnhancementModule.prototype.actionMap = function () {

    var self = this;

    $('#' + this.ids.CP.modalRegion).on("click", '.' + this.classNames.containers.extraCard + ' .fa-recycle', function () {
        var parent = $(this).parents('.' + self.classNames.containers.extraCard);
        var cardId = $(parent).find('.' + self.classNames.containers.extraCardName).data('card-id');
        var dustCost = $(parent).find('.' + self.classNames.containers.extraCardName).data('disenchant-value');
        var disenchantCount = parseInt($(parent).data('disenchant-count'));

        if (cardId && disenchantCount) {
            self.disenchantCard(cardId, disenchantCount, $(parent), dustCost);
        }
    });

    $('#' + this.ids.CP.modalRegion).on("mouseenter", '.' + this.classNames.containers.extraCard + ' .fa-recycle', function () {
        $(this).css('color', 'rgba(255, 255, 0, 1)');
    }).on("mouseleave", '.' + this.classNames.containers.extraCard + ' .fa-recycle', function () {
        $(this).css('color', 'inherit');
    });

    $('#' + this.ids.CP.modalRegion).on("mouseenter", '.' + this.classNames.containers.extraCard, function () {
        $(this).css('text-shadow', '1px 1px 3rem rgba(255, 255, 0, 1)');
    }).on("mouseleave", '.' + this.classNames.containers.extraCard, function () {
        $(this).css('text-shadow', '0 0 0 rgba(255, 255, 0, 0)');
    });

    $('#' + this.ids.CP.contentRegion).on("click", '.' + this.classNames.controls.openExtraCardsMenu, function (e) {
        e.preventDefault();
        e.stopPropagation();
        self.initCollectionDetails();
        self.showExtraCardsMenu();
    });

    $('#' + this.ids.CP.contentRegion).on("click", '.' + this.classNames.controls.exportToDuelystDB, function (e) {
        e.preventDefault();
        e.stopPropagation();

    });

    $('#' + this.ids.CP.contentRegion).on("click", '.' + this.classNames.controls.importFromDuelystDB, function (e) {
        if ($('input.' + self.classNames.CP.deckName).is(':visible')) {
            $('input.' + self.classNames.CP.deckName).hide();
            $('.' + self.classNames.inputs.importFromDuelystDB).show().focus();
        } else if ($('.' + self.classNames.inputs.importFromDuelystDB).is(':visible') && $('.' + self.classNames.inputs.importFromDuelystDB).val().length > 40) {
            var deck = self.parseDeckFromBase64($('.' + self.classNames.inputs.importFromDuelystDB).val());
            if (deck) {
                self.autoSelectCards(deck);
            }

        } else if ($('.' + self.classNames.inputs.importFromDuelystDB).is(':visible') && !$('.' + self.classNames.inputs.importFromDuelystDB).val().length) {
            $('input.' + self.classNames.CP.deckName).show().focus();
            $('.' + self.classNames.inputs.importFromDuelystDB).hide();
        }
    });


    $('#' + this.ids.CP.contentRegion).on("change", '#' + this.ids.controls.selectDeckBuilder, function (e) {
        self.activeDeckBuilder = $(this).val();
        $('.' + self.classNames.controls.exportToDuelystDB).remove();
        self.createDeckBuilderExportLinks();
    });


    $('#' + this.ids.CP.contentRegion).on("click", '#' + this.ids.controls.createCollectionZeroPoint, function (e) {
        e.preventDefault();
        e.stopPropagation();
        self.createCollectionZeroPoint();
    });


    $('#' + this.ids.CP.contentRegion).on("click", '#' + this.ids.controls.openAllSpiritOrbs, function (e) {
        e.preventDefault();
        e.stopPropagation();
        self.openAllOrbs();
    });

    $('#' + this.ids.CP.contentRegion).on("click", '.' + this.classNames.controls.dumpCollection, function (e) {
        e.preventDefault();
        e.stopPropagation();
        var clipboard = $('<textarea></textarea>');
        $('body').append($(clipboard));
        $(clipboard).html(self.createCollectionDump()).select();
        document.execCommand("copy");
        $(clipboard).remove();
        alert('Collection copied to your clipboard in CSV format, paste into Excel, Openoffice etc. Fields are separated by commas and enclosed in quotes.');
    });

    $('#' + this.ids.CP.contentRegion).on("click", '.' + self.classNames.controls.collectionStatsButton, function (e) {
        self.showCollectionStatistics();
    });
};

CollectionEnhancementModule.prototype.getFactionGenerals = function (factionId) {
    var generals = GameDataManager.instance.generalsFaction.attributes.cards;
    var factionGenerals = [];
    for (var i = 0; i < generals.length; i++) {
        var genAttrs = generals[i].attributes;
        if (genAttrs.factionId === factionId && genAttrs.isAvailable && genAttrs.inventoryCount >= 1) {

        }
    }
};



CollectionEnhancementModule.prototype.createCollectionModal = function () {
    var self = this;
    var collectionStatisticsModalTemplate = $.parseHTML('<div class="modal duelyst-modal"><div class="modal-dialog"><button type="button" class="btn btn-clean btn-user-cancel btn-cancel-primary"></button><div class="modal-content"><div class="modal-header"></div><div class="modal-body clearfix"><div class="content-region"></div></div></div></div></div>');
    var totalCardsTemplate = '<div class="stat"><h3 style="display:inline;">Total 3x+ cards: </h3><span class="value">' + (totalCards - missingCards.length) + '/' + totalCards + '</span></div><hr/>';
    var collectionValueTemplate = '<div class="stat"><h3 style="display:inline;">Collection crafted value: </h3><span class="value">' + self.collectionValue + '</span></div><div class="stat"><h3 style="display:inline;">Collection DE value: </h3><span class="value">' + collectionDustValue + '</span><div class="stat"><h3 style="display:inline;">Extra cards DE value: </h3><span class="value">' + extraDustValue + '</span></div><hr/>';
    var missingCardsCostTemplate = '<div class="stat"><h3 style="display:inline;">Missing cards (2x-): </h3><span class="value">' + missingCards.length + '</span></div><div class="stat"><h3 style="display:inline;">Total crafting cost: </h3><span class="value">' + missingValue + '</span></div><hr/>';
    var missingCardsTemplate = $.parseHTML('<div class="stat"></div>');
    $.each(self.missingCards, function (index, card) {
        $(missingCardsTemplate).append('<span class="mod-missing-card">' + card.name + '(' + card.missingCount + '), </span>');
    });
    var collectionTemplate = '<div id="mod-collection-enhancement" class="">' + totalCardsTemplate + collectionValueTemplate + missingCardsCostTemplate + $(missingCardsTemplate).html() + '</div>';
    $(collectionStatisticsModalTemplate).find('.content-region').html(collectionTemplate);
    $('#app-modal-region').append($(collectionStatisticsModalTemplate));
    $(collectionStatisticsModalTemplate).on("click", ".btn-user-cancel", function (event) {
        event.stopPropagation();
        $(collectionStatisticsModalTemplate).remove();
    });
};

CollectionEnhancementModule.prototype.showCollectionStatistics = function () {
    this.modals.collectionStatistics = this.getCollectionStatisticsModal();
    var collectionStatistics = $.parseHTML(this.template.containers.collectionStatistics);
    var collectionStatisticsList = $(collectionStatistics).find('ul').first();
    this.initCollectionDetails();
    this.getCosmeticsStats();
    var collection = this.getCardCollection(false);
    var self = this;

    function getPercentage(owned, total) {
        return (owned / total * 100).toFixed(1) + '%';
    }

    function generateRarityTable(collectionStatisticsList, ownedArray, totalArray, bgColor) {
        var statBasicCompletion = $.parseHTML(self.template.containers.collectionStatRow);
        $(statBasicCompletion).find('.' + self.classNames.containers.cardStatName).html('Basics:');
        $(statBasicCompletion).find('.' + self.classNames.containers.cardStatExtraValue).html(getPercentage(ownedArray[0], totalArray[0]));
        $(statBasicCompletion).find('.' + self.classNames.containers.cardStatValue).html('' + ownedArray[0] + ' / ' + totalArray[0]);
        $(collectionStatisticsList).append(statBasicCompletion);

        var statCommonCompletion = $.parseHTML(self.template.containers.collectionStatRow);
        $(statCommonCompletion).find('.' + self.classNames.containers.cardStatName).html('Commons:');
        $(statCommonCompletion).find('.' + self.classNames.containers.cardStatExtraValue).html(getPercentage(ownedArray[1], totalArray[1]));
        $(statCommonCompletion).find('.' + self.classNames.containers.cardStatValue).html('' + ownedArray[1] + ' / ' + totalArray[1]);
        $(collectionStatisticsList).append(statCommonCompletion);

        var statRareCompletion = $.parseHTML(self.template.containers.collectionStatRow);
        $(statRareCompletion).find('.' + self.classNames.containers.cardStatName).html('Rares:').css('color', self.styles.rarity[2]);
        $(statRareCompletion).find('.' + self.classNames.containers.cardStatExtraValue).html(getPercentage(ownedArray[2], totalArray[2]));
        $(statRareCompletion).find('.' + self.classNames.containers.cardStatValue).html('' + ownedArray[2] + ' / ' + totalArray[2]);
        $(collectionStatisticsList).append(statRareCompletion);

        var statEpicCompletion = $.parseHTML(self.template.containers.collectionStatRow);
        $(statEpicCompletion).find('.' + self.classNames.containers.cardStatName).html('Epics:').css('color', self.styles.rarity[3]);
        $(statEpicCompletion).find('.' + self.classNames.containers.cardStatExtraValue).html(getPercentage(ownedArray[3], totalArray[3]));
        $(statEpicCompletion).find('.' + self.classNames.containers.cardStatValue).html('' + ownedArray[3] + ' / ' + totalArray[3]);
        $(collectionStatisticsList).append(statEpicCompletion);

        var statLegendaryCompletion = $.parseHTML(self.template.containers.collectionStatRow);
        $(statLegendaryCompletion).find('.' + self.classNames.containers.cardStatName).html('Legendaries:').css('color', self.styles.rarity[4]);
        $(statLegendaryCompletion).find('.' + self.classNames.containers.cardStatExtraValue).html(getPercentage(ownedArray[4], totalArray[4]));
        $(statLegendaryCompletion).find('.' + self.classNames.containers.cardStatValue).html('' + ownedArray[4] + ' / ' + totalArray[4]);
        $(collectionStatisticsList).append(statLegendaryCompletion);
        if (bgColor) {
            $(statBasicCompletion).add(statCommonCompletion).add(statRareCompletion).add(statEpicCompletion).add(statLegendaryCompletion).css('background-color', bgColor);
        }
    }

    function generateSetTable(collectionStatisticsList, cardSetId, ownedArray, totalArray, bgColor) {
        if (totalArray[cardSetId][0] > 0) {
            var statBasicCompletion = $.parseHTML(self.template.containers.collectionStatRow);
            $(statBasicCompletion).find('.' + self.classNames.containers.cardStatName).html('Basics:');
            $(statBasicCompletion).find('.' + self.classNames.containers.cardStatExtraValue).html(getPercentage(ownedArray[cardSetId][0], totalArray[cardSetId][0]));
            $(statBasicCompletion).find('.' + self.classNames.containers.cardStatValue).html('' + ownedArray[cardSetId][0] + ' / ' + totalArray[cardSetId][0]);
            $(collectionStatisticsList).append(statBasicCompletion);
        }

        var statCommonCompletion = $.parseHTML(self.template.containers.collectionStatRow);
        $(statCommonCompletion).find('.' + self.classNames.containers.cardStatName).html('Commons:');
        $(statCommonCompletion).find('.' + self.classNames.containers.cardStatExtraValue).html(getPercentage(ownedArray[cardSetId][1], totalArray[cardSetId][1]));
        $(statCommonCompletion).find('.' + self.classNames.containers.cardStatValue).html('' + ownedArray[cardSetId][1] + ' / ' + totalArray[cardSetId][1]);
        $(collectionStatisticsList).append(statCommonCompletion);

        var statRareCompletion = $.parseHTML(self.template.containers.collectionStatRow);
        $(statRareCompletion).find('.' + self.classNames.containers.cardStatName).html('Rares:').css('color', self.styles.rarity[2]);
        $(statRareCompletion).find('.' + self.classNames.containers.cardStatExtraValue).html(getPercentage(ownedArray[cardSetId][2], totalArray[cardSetId][2]));
        $(statRareCompletion).find('.' + self.classNames.containers.cardStatValue).html('' + ownedArray[cardSetId][2] + ' / ' + totalArray[cardSetId][2]);
        $(collectionStatisticsList).append(statRareCompletion);

        var statEpicCompletion = $.parseHTML(self.template.containers.collectionStatRow);
        $(statEpicCompletion).find('.' + self.classNames.containers.cardStatName).html('Epics:').css('color', self.styles.rarity[3]);
        $(statEpicCompletion).find('.' + self.classNames.containers.cardStatExtraValue).html(getPercentage(ownedArray[cardSetId][3], totalArray[cardSetId][3]));
        $(statEpicCompletion).find('.' + self.classNames.containers.cardStatValue).html('' + ownedArray[cardSetId][3] + ' / ' + totalArray[cardSetId][3]);
        $(collectionStatisticsList).append(statEpicCompletion);

        var statLegendaryCompletion = $.parseHTML(self.template.containers.collectionStatRow);
        $(statLegendaryCompletion).find('.' + self.classNames.containers.cardStatName).html('Legendaries:').css('color', self.styles.rarity[4]);
        $(statLegendaryCompletion).find('.' + self.classNames.containers.cardStatExtraValue).html(getPercentage(ownedArray[cardSetId][4], totalArray[cardSetId][4]));
        $(statLegendaryCompletion).find('.' + self.classNames.containers.cardStatValue).html('' + ownedArray[cardSetId][4] + ' / ' + totalArray[cardSetId][4]);
        $(collectionStatisticsList).append(statLegendaryCompletion);
        if (bgColor) {
            $(statBasicCompletion).add(statCommonCompletion).add(statRareCompletion).add(statEpicCompletion).add(statLegendaryCompletion).css('background-color', bgColor);
        }
    }

    function getSetTotals(cardSetId) {
        var ownedReturn = 0;
        var totalReturn = 0;
        var ownedPrismaticReturn = 0;
        var totalPrismaticReturn = 0;

        $.each(self.ownedSetNormalRarities[cardSetId], function () {
            ownedReturn += this;
        });

        $.each(self.totalSetNormalRarities[cardSetId], function () {
            totalReturn += this;
        });

        $.each(self.ownedSetPrismaticRarities[cardSetId], function () {
            ownedPrismaticReturn += this;
        });

        $.each(self.totalSetPrismaticRarities[cardSetId], function () {
            totalPrismaticReturn += this;
        });

        return { owned: ownedReturn, total: totalReturn, ownedPrismatic: ownedPrismaticReturn, totalPrismatic: totalPrismaticReturn };
    }


    function getNextOrbValue(cardSetId) {
        var value = 0;
        if (self.setDroprates[cardSetId]) {
            for (let i = 1; i < 5; i++) {
                let rarityCraftCost = self.rarityCost[i];
                let rarityPrismaticCraftCost = self.prismaticRarityCost[i];
                let rarityDisenchantCost = self.rarityDustCost[i];
                let rarityPrismaticDisenchantCost = self.prismaticRarityDustCost[i];
                let rarityDroprate = self.setDroprates[cardSetId].normal[i];
                let rarityPrismaticDroprate = self.setDroprates[cardSetId].prismatic[i];
                let ownedPercentage = self.ownedSetNormalRarities[cardSetId][i] / self.totalSetNormalRarities[cardSetId][i];
                let ownedPrismaticPercentage = self.ownedSetPrismaticRarities[cardSetId][i] / self.totalSetPrismaticRarities[cardSetId][i];

                let currentRarityAverageValue = ((rarityCraftCost * (1 - ownedPercentage) + rarityDisenchantCost * ownedPercentage) * rarityDroprate) + ((rarityPrismaticCraftCost * (1 - ownedPrismaticPercentage) + rarityPrismaticDisenchantCost * ownedPrismaticPercentage) * rarityPrismaticDroprate);

                value += currentRarityAverageValue;
            }
            return value * 5;
        }
        return 0;
    }

    function getSetStats(setIndex, setName, collectionStatisticsList, showValue) {
        var cardSetStats = getSetTotals(setIndex);
        var statCardSetHeader = $.parseHTML(self.template.containers.collectionStatRow);
        $(statCardSetHeader).find('.' + self.classNames.containers.cardStatName).html(setName + ':');
        $(statCardSetHeader).find('.' + self.classNames.containers.cardStatExtraValue).html(getPercentage(cardSetStats.owned, cardSetStats.total));
        $(statCardSetHeader).find('.' + self.classNames.containers.cardStatValue).html('' + cardSetStats.owned + ' / ' + cardSetStats.total);
        $(collectionStatisticsList).append(statCardSetHeader);
        $(statCardSetHeader).css('margin-top', '2rem');

        var statCardSetPrismaticHeader = $.parseHTML(self.template.containers.collectionStatRow);
        $(statCardSetPrismaticHeader).find('.' + self.classNames.containers.cardStatName).html('Prismatic:');
        $(statCardSetPrismaticHeader).find('.' + self.classNames.containers.cardStatExtraValue).html(getPercentage(cardSetStats.ownedPrismatic, cardSetStats.totalPrismatic));
        $(statCardSetPrismaticHeader).find('.' + self.classNames.containers.cardStatValue).html('' + cardSetStats.ownedPrismatic + ' / ' + cardSetStats.totalPrismatic);
        $(collectionStatisticsList).append(statCardSetPrismaticHeader);
        $(statCardSetPrismaticHeader).css('background-color', self.styles.containers.prismaticBackground);

        if (showValue) {
            var statCardSetValueHeader = $.parseHTML(self.template.containers.collectionStatRow);
            $(statCardSetValueHeader).find('.' + self.classNames.containers.cardStatName).html('Approximate spirit value of next orb:');
            $(statCardSetValueHeader).find('.' + self.classNames.containers.cardStatValue).html('' + getNextOrbValue(setIndex).toFixed());
            $(collectionStatisticsList).append(statCardSetValueHeader);
        }
        generateSetTable(collectionStatisticsList, setIndex, self.ownedSetNormalRarities, self.totalSetNormalRarities, false);
        generateSetTable(collectionStatisticsList, setIndex, self.ownedSetPrismaticRarities, self.totalSetPrismaticRarities, self.styles.containers.prismaticBackground);
    }
    //General stats
    var statGold = $.parseHTML(this.template.containers.collectionStatRow);
    $(statGold).find('.' + this.classNames.containers.cardStatName).html('Gold:');
    $(statGold).find('.' + this.classNames.containers.cardStatValue).html(InventoryManager.instance.walletModel.attributes.gold_amount);
    $(collectionStatisticsList).append(statGold);

    var statSpirit = $.parseHTML(this.template.containers.collectionStatRow);
    $(statSpirit).find('.' + this.classNames.containers.cardStatName).html('Spirit:');
    $(statSpirit).find('.' + this.classNames.containers.cardStatValue).html(InventoryManager.instance.walletModel.attributes.spirit_amount);
    $(collectionStatisticsList).append(statSpirit);

    var statExtraSpirit = $.parseHTML(this.template.containers.collectionStatRow);
    $(statExtraSpirit).find('.' + this.classNames.containers.cardStatName).html('Extra card spirit:');
    $(statExtraSpirit).find('.' + this.classNames.containers.cardStatValue).html(this.extraDustValue);
    $(collectionStatisticsList).append(statExtraSpirit);


    var statSpiritCompletion = $.parseHTML(this.template.containers.collectionStatRow);
    $(statSpiritCompletion).find('.' + this.classNames.containers.cardStatName).html('Spirit to FULL collection:');
    $(statSpiritCompletion).find('.' + this.classNames.containers.cardStatValue).html(this.missingValue);
    $(collectionStatisticsList).append(statSpiritCompletion);

    var statNormalSpiritCompletion = $.parseHTML(this.template.containers.collectionStatRow);
    $(statNormalSpiritCompletion).find('.' + this.classNames.containers.cardStatName).html('Spirit to full NORMAL collection:');
    $(statNormalSpiritCompletion).find('.' + this.classNames.containers.cardStatValue).html(this.missingNormalValue);
    $(collectionStatisticsList).append(statNormalSpiritCompletion);

    var statPrismaticSpiritCompletion = $.parseHTML(this.template.containers.collectionStatRow);
    $(statPrismaticSpiritCompletion).find('.' + this.classNames.containers.cardStatName).html('Spirit to full PRISMATIC collection:');
    $(statPrismaticSpiritCompletion).find('.' + this.classNames.containers.cardStatValue).html(this.missingPrismaticValue);
    $(statPrismaticSpiritCompletion).css('background-color', this.styles.containers.prismaticBackground);
    $(collectionStatisticsList).append(statPrismaticSpiritCompletion);

    var statSkinCompletion = $.parseHTML(this.template.containers.collectionStatRow);
    $(statSkinCompletion).find('.' + this.classNames.containers.cardStatName).html('Skins:');
    $(statSkinCompletion).find('.' + this.classNames.containers.cardStatExtraValue).html(getPercentage(this.cosmetics.card_skin.owned, this.cosmetics.card_skin.total));
    $(statSkinCompletion).find('.' + this.classNames.containers.cardStatValue).html('' + this.cosmetics.card_skin.owned + ' / ' + this.cosmetics.card_skin.total);
    $(collectionStatisticsList).append(statSkinCompletion);

    var statCardBackCompletion = $.parseHTML(this.template.containers.collectionStatRow);
    $(statCardBackCompletion).find('.' + this.classNames.containers.cardStatName).html('Card backs:');
    $(statCardBackCompletion).find('.' + this.classNames.containers.cardStatExtraValue).html(getPercentage(this.cosmetics.card_back.owned, this.cosmetics.card_back.total));
    $(statCardBackCompletion).find('.' + this.classNames.containers.cardStatValue).html('' + this.cosmetics.card_back.owned + ' / ' + this.cosmetics.card_back.total);
    $(collectionStatisticsList).append(statCardBackCompletion);

    var statEmoteCompletion = $.parseHTML(this.template.containers.collectionStatRow);
    $(statEmoteCompletion).find('.' + this.classNames.containers.cardStatName).html('Emotes:');
    $(statEmoteCompletion).find('.' + this.classNames.containers.cardStatExtraValue).html(getPercentage(this.cosmetics.emote.owned, this.cosmetics.emote.total));
    $(statEmoteCompletion).find('.' + this.classNames.containers.cardStatValue).html('' + this.cosmetics.emote.owned + ' / ' + this.cosmetics.emote.total);
    $(collectionStatisticsList).append(statEmoteCompletion);

    var statIconCompletion = $.parseHTML(this.template.containers.collectionStatRow);
    $(statIconCompletion).find('.' + this.classNames.containers.cardStatName).html('Profile icons:');
    $(statIconCompletion).find('.' + this.classNames.containers.cardStatExtraValue).html(getPercentage(this.cosmetics.profile_icon.owned, this.cosmetics.profile_icon.total));
    $(statIconCompletion).find('.' + this.classNames.containers.cardStatValue).html('' + this.cosmetics.profile_icon.owned + ' / ' + this.cosmetics.profile_icon.total);
    $(collectionStatisticsList).append(statIconCompletion);

    var statMapCompletion = $.parseHTML(this.template.containers.collectionStatRow);
    $(statMapCompletion).find('.' + this.classNames.containers.cardStatName).html('Maps:');
    $(statMapCompletion).find('.' + this.classNames.containers.cardStatExtraValue).html(getPercentage(this.cosmetics.battle_map.owned, this.cosmetics.battle_map.total));
    $(statMapCompletion).find('.' + this.classNames.containers.cardStatValue).html('' + this.cosmetics.battle_map.owned + ' / ' + this.cosmetics.battle_map.total);
    $(collectionStatisticsList).append(statMapCompletion);


    //Base collection stats
    var statCardCompletion = $.parseHTML(this.template.containers.collectionStatRow);
    $(statCardCompletion).find('.' + this.classNames.containers.cardStatName).html('Cards (3x counted per card):');
    $(statCardCompletion).find('.' + this.classNames.containers.cardStatExtraValue).html(getPercentage(this.ownedCards, this.totalCards));
    $(statCardCompletion).find('.' + this.classNames.containers.cardStatValue).html('' + this.ownedCards + ' / ' + this.totalCards);
    $(collectionStatisticsList).append(statCardCompletion);
    $(statCardCompletion).css('margin-top', '2rem');
    //$(collectionStatisticsList).append($.parseHTML(this.template.containers.collectionStatRow));

    var statNormalCompletion = $.parseHTML(this.template.containers.collectionStatRow);
    $(statNormalCompletion).find('.' + this.classNames.containers.cardStatName).html('Non-prismatic:');
    $(statNormalCompletion).find('.' + this.classNames.containers.cardStatExtraValue).html(getPercentage(this.ownedNormals, this.totalNormals));
    $(statNormalCompletion).find('.' + this.classNames.containers.cardStatValue).html('' + this.ownedNormals + ' / ' + this.totalNormals);
    $(collectionStatisticsList).append(statNormalCompletion);


    var statPrismaticCompletion = $.parseHTML(this.template.containers.collectionStatRow);
    $(statPrismaticCompletion).find('.' + this.classNames.containers.cardStatName).html('Prismatic:');
    $(statPrismaticCompletion).find('.' + this.classNames.containers.cardStatExtraValue).html(getPercentage(this.ownedPrismatics, this.totalPrismatics));
    $(statPrismaticCompletion).find('.' + this.classNames.containers.cardStatValue).html('' + this.ownedPrismatics + ' / ' + this.totalPrismatics);
    $(statPrismaticCompletion).css('background-color', this.styles.containers.prismaticBackground);
    $(collectionStatisticsList).append(statPrismaticCompletion);

    generateRarityTable(collectionStatisticsList, this.ownedRarities, this.totalRarities, false);
    generateRarityTable(collectionStatisticsList, this.ownedPrismaticRarities, this.totalPrismaticRarities, this.styles.containers.prismaticBackground);


    // Core set stats
    getSetStats(1, 'Core set', collectionStatisticsList, true);
    getSetStats(2, 'Shim\'zar', collectionStatisticsList, true);
    getSetStats(3, 'RotB:', collectionStatisticsList, false);
    getSetStats(4, 'Ancient Bonds', collectionStatisticsList, false);
    getSetStats(5, 'Unearthed Prophecy', collectionStatisticsList, true);
    /*
     var coreSetStats = getSetTotals(1);
     var statCoreSetHeader = $.parseHTML(this.template.containers.collectionStatRow);
     $(statCoreSetHeader).find('.' + this.classNames.containers.cardStatName).html('Core set:');
     $(statCoreSetHeader).find('.' + self.classNames.containers.cardStatExtraValue).html(getPercentage(coreSetStats.owned, coreSetStats.total));
     $(statCoreSetHeader).find('.' + this.classNames.containers.cardStatValue).html('' + coreSetStats.owned + ' / ' + coreSetStats.total);
     $(collectionStatisticsList).append(statCoreSetHeader);
     $(statCoreSetHeader).css('margin-top', '2rem');
     
     var statCoreSetPrismaticHeader = $.parseHTML(this.template.containers.collectionStatRow);
     $(statCoreSetPrismaticHeader).find('.' + this.classNames.containers.cardStatName).html('Prismatic:');
     $(statCoreSetPrismaticHeader).find('.' + self.classNames.containers.cardStatExtraValue).html(getPercentage(coreSetStats.ownedPrismatic, coreSetStats.totalPrismatic));
     $(statCoreSetPrismaticHeader).find('.' + this.classNames.containers.cardStatValue).html('' + coreSetStats.ownedPrismatic + ' / ' + coreSetStats.totalPrismatic);
     $(collectionStatisticsList).append(statCoreSetPrismaticHeader);
     $(statCoreSetPrismaticHeader).css('background-color', this.styles.containers.prismaticBackground);
     
     
     var statCoreSetValueHeader = $.parseHTML(this.template.containers.collectionStatRow);
     $(statCoreSetValueHeader).find('.' + this.classNames.containers.cardStatName).html('Approximate spirit value of next orb:');
     $(statCoreSetValueHeader).find('.' + this.classNames.containers.cardStatValue).html('' + getNextOrbValue(1).toFixed());
     $(collectionStatisticsList).append(statCoreSetValueHeader);
     
     generateSetTable(collectionStatisticsList, 1, this.ownedSetNormalRarities, this.totalSetNormalRarities, false);
     generateSetTable(collectionStatisticsList, 1, this.ownedSetPrismaticRarities, this.totalSetPrismaticRarities, this.styles.containers.prismaticBackground);
     
     
     // Shimzar stats
     var shimzarStats = getSetTotals(2);
     var statShimzarStatsHeader = $.parseHTML(this.template.containers.collectionStatRow);
     $(statShimzarStatsHeader).find('.' + this.classNames.containers.cardStatName).html('Shim\'zar:');
     $(statShimzarStatsHeader).find('.' + self.classNames.containers.cardStatExtraValue).html(getPercentage(shimzarStats.owned, shimzarStats.total));
     $(statShimzarStatsHeader).find('.' + this.classNames.containers.cardStatValue).html('' + shimzarStats.owned + ' / ' + shimzarStats.total);
     $(collectionStatisticsList).append(statShimzarStatsHeader);
     $(statShimzarStatsHeader).css('margin-top', '2rem');
     
     var statShimzarPrismaticHeader = $.parseHTML(this.template.containers.collectionStatRow);
     $(statShimzarPrismaticHeader).find('.' + this.classNames.containers.cardStatName).html('Prismatic:');
     $(statShimzarPrismaticHeader).find('.' + self.classNames.containers.cardStatExtraValue).html(getPercentage(shimzarStats.ownedPrismatic, shimzarStats.totalPrismatic));
     $(statShimzarPrismaticHeader).find('.' + this.classNames.containers.cardStatValue).html('' + shimzarStats.ownedPrismatic + ' / ' + shimzarStats.totalPrismatic);
     $(collectionStatisticsList).append(statShimzarPrismaticHeader);
     $(statShimzarPrismaticHeader).css('background-color', this.styles.containers.prismaticBackground);
     
     var statShimzarValueHeader = $.parseHTML(this.template.containers.collectionStatRow);
     $(statShimzarValueHeader).find('.' + this.classNames.containers.cardStatName).html('Approximate spirit value of next orb:');
     $(statShimzarValueHeader).find('.' + this.classNames.containers.cardStatValue).html('' + getNextOrbValue(2).toFixed());
     $(collectionStatisticsList).append(statShimzarValueHeader);
     
     generateSetTable(collectionStatisticsList, 2, this.ownedSetNormalRarities, this.totalSetNormalRarities, false);
     generateSetTable(collectionStatisticsList, 2, this.ownedSetPrismaticRarities, this.totalSetPrismaticRarities, this.styles.containers.prismaticBackground);
     
     
     // RotB stats
     var rotbStats = getSetTotals(3);
     var statRotbHeader = $.parseHTML(this.template.containers.collectionStatRow);
     $(statRotbHeader).find('.' + this.classNames.containers.cardStatName).html('RotB:');
     $(statRotbHeader).find('.' + self.classNames.containers.cardStatExtraValue).html(getPercentage(rotbStats.owned, rotbStats.total));
     $(statRotbHeader).find('.' + this.classNames.containers.cardStatValue).html('' + rotbStats.owned + ' / ' + rotbStats.total);
     $(collectionStatisticsList).append(statRotbHeader);
     $(statRotbHeader).css('margin-top', '2rem');
     
     var statRotbPrismaticHeader = $.parseHTML(this.template.containers.collectionStatRow);
     $(statRotbPrismaticHeader).find('.' + this.classNames.containers.cardStatName).html('Prismatic:');
     $(statRotbPrismaticHeader).find('.' + self.classNames.containers.cardStatExtraValue).html(getPercentage(rotbStats.ownedPrismatic, rotbStats.totalPrismatic));
     $(statRotbPrismaticHeader).find('.' + this.classNames.containers.cardStatValue).html('' + rotbStats.ownedPrismatic + ' / ' + rotbStats.totalPrismatic);
     $(collectionStatisticsList).append(statRotbPrismaticHeader);
     $(statRotbPrismaticHeader).css('background-color', this.styles.containers.prismaticBackground);
     
     generateSetTable(collectionStatisticsList, 3, this.ownedSetNormalRarities, this.totalSetNormalRarities, false);
     generateSetTable(collectionStatisticsList, 3, this.ownedSetPrismaticRarities, this.totalSetPrismaticRarities, this.styles.containers.prismaticBackground);
     
     
     // AB stats
     var bondsStats = getSetTotals(4);
     var statBondsHeader = $.parseHTML(this.template.containers.collectionStatRow);
     $(statBondsHeader).find('.' + this.classNames.containers.cardStatName).html('Ancient Bonds:');
     $(statBondsHeader).find('.' + self.classNames.containers.cardStatExtraValue).html(getPercentage(bondsStats.owned, bondsStats.total));
     $(statBondsHeader).find('.' + this.classNames.containers.cardStatValue).html('' + bondsStats.owned + ' / ' + bondsStats.total);
     $(collectionStatisticsList).append(statBondsHeader);
     $(statBondsHeader).css('margin-top', '2rem');
     
     var statBondsPrismaticHeader = $.parseHTML(this.template.containers.collectionStatRow);
     $(statBondsPrismaticHeader).find('.' + this.classNames.containers.cardStatName).html('Prismatic:');
     $(statBondsPrismaticHeader).find('.' + self.classNames.containers.cardStatExtraValue).html(getPercentage(bondsStats.ownedPrismatic, bondsStats.totalPrismatic));
     $(statBondsPrismaticHeader).find('.' + this.classNames.containers.cardStatValue).html('' + bondsStats.ownedPrismatic + ' / ' + bondsStats.totalPrismatic);
     $(collectionStatisticsList).append(statBondsPrismaticHeader);
     $(statBondsPrismaticHeader).css('background-color', this.styles.containers.prismaticBackground);
     
     generateSetTable(collectionStatisticsList, 4, this.ownedSetNormalRarities, this.totalSetNormalRarities, false);
     generateSetTable(collectionStatisticsList, 4, this.ownedSetPrismaticRarities, this.totalSetPrismaticRarities, this.styles.containers.prismaticBackground);
     */
    $(this.modals.collectionStatistics).find('.content-region').append($(collectionStatistics));
    $('#' + this.ids.CP.modalRegion).html($(this.modals.collectionStatistics));


    $(this.modals.collectionStatistics).on("click", ".btn-user-cancel", function (e) {
        e.stopPropagation();

        $(self.modals.collectionStatistics).remove();
        self.modals.collectionStatistics = false;
        $('#app-gamecanvas').focus();
    });
};

CollectionEnhancementModule.prototype.showExtraCardsMenu = function () {
    this.modals.extraCardsMenu = this.getExtraCardsMenuModal();
    var extraCardsList = $.parseHTML(this.template.containers.extraCardsList);

    var self = this;
    var tempContainer = $('<div></div>');
    $.each(this.extraCards, function () {
        var extraCard = $.parseHTML(self.template.containers.extraCard);
        $(extraCard).css('color', self.styles.rarity['' + this.rarity]);
        if (this.isPrismatic)
            $(extraCard).css('background-color', self.styles.containers.prismaticBackground);
        $(extraCard).find('.' + self.classNames.containers.extraCardName).html(this.name);
        $(extraCard).find('.' + self.classNames.containers.extraCardName).attr('data-sort', 'name');
        $(extraCard).find('.' + self.classNames.containers.extraCardName).data('card-type', this.cardType);
        $(extraCard).find('.' + self.classNames.containers.extraCardName).data('is-prismatic', this.isPrismatic);
        $(extraCard).find('.' + self.classNames.containers.extraCardName).data('card-id', this.id);
        $(extraCard).find('.' + self.classNames.containers.extraCardName).data('disenchant-value', this.dustValue);
        $(extraCard).find('.' + self.classNames.containers.extraCardCount).html('x' + this.extraCount + ' / <b>' + this.dustValue + '</b> <i class="fa fa-recycle" style="-webkit-transform: rotate(0deg);"></i>');
        $(extraCard).data('disenchant-count', this.extraCount);
        $(tempContainer).append($(extraCard));
    });

    var sortData1 = 'name';
    var sortDir = 'asc';

    var orderedDivs = $(tempContainer).children().sort(function (a, b) {
        var value1 = $(a).find('[data-sort="' + sortData1 + '"]').text();
        var value2 = $(b).find('[data-sort="' + sortData1 + '"]').text();
        var result = (value1 < value2 ? -1 : (value1 > value2 ? +1 : 0));
        return result * (sortDir === 'asc' ? +1 : -1);
    });
    $(extraCardsList).find('#' + self.ids.containers.extraCardsList).append(orderedDivs);
    $(this.modals.extraCardsMenu).find('.content-region').append($(extraCardsList));
    $('#' + this.ids.CP.modalRegion).html($(this.modals.extraCardsMenu));

    $(this.modals.extraCardsMenu).find('#' + this.ids.containers.extraCardsDustValue).html(this.extraDustValue);
    $(this.modals.extraCardsMenu).on("click", ".btn-user-cancel", function (e) {
        e.stopPropagation();

        $(self.modals.extraCardsMenu).remove();
        self.modals.extraCardsMenu = false;
        $('#app-gamecanvas').focus();
    });
};

CollectionEnhancementModule.prototype.getExtraCardsMenuModal = function () {
    if (!this.modals.extraCardsMenu) {
        var extraCardsMenuModal = $.parseHTML(this.template.modals.extraCardsMenu);

        return $(extraCardsMenuModal);
    } else
        return this.modals.extraCardsMenu;
};

CollectionEnhancementModule.prototype.getCollectionStatisticsModal = function () {
    if (!this.modals.collectionStatistics) {
        var collectionStatistics = $.parseHTML(this.template.modals.collectionStatistics);

        return $(collectionStatistics);
    } else
        return this.modals.collectionStatistics;
};

CollectionEnhancementModule.prototype.createDeckBuilderExportLinks = function () {
    var self = this;

    function getFullPath(deckBase64) {
        if (self.activeDeckBuilder === self.deckBuilderNames.manaspring) {
            return self.urls.manaspring + deckBase64;
        } else if (self.activeDeckBuilder === self.deckBuilderNames.plaintext) {
            return self.urls.plaintext + deckBase64;
        } else if (self.activeDeckBuilder === self.deckBuilderNames.bagoum) {
            return self.urls.bagoum + deckBase64;
        } else if (self.activeDeckBuilder === self.deckBuilderNames.duelystcards) {
            return self.urls.duelystcards + deckBase64;
        } else {
            return self.urls.duelystDB + deckBase64;
        }

    }

    if (!$('.' + this.classNames.controls.exportToDuelystDB).length)
        $('.' + this.classNames.CP.deckPreview).each(function () {
            var factionId = parseInt($(this).attr('class').split(' ')[1][1]);
            var deckName = $(this).find('.' + self.classNames.CP.deckName);
            var deck = self.getDeck(deckName.html(), factionId);
            if (deck !== false) {

                var deckBase64 = self.parseDeckToBase64(deck);
                var exportLink = $.parseHTML(self.template.controls.exportToDuelystDB);
                var fullPath = getFullPath(deckBase64);
                if (self.usingBrowser) {
                    $(exportLink).attr('onclick', "window.open('" + fullPath + "');");
                } else {
                    $(exportLink).attr('onclick', "require('open')('" + fullPath + "');");
                }



                deckName.before(exportLink);
            }
        });
};

CollectionEnhancementModule.prototype.getDeck = function (deckName, factionId) {
    var deckList = InventoryManager.instance.decksCollection.models;
    var deck = false;
    $.each(deckList, function () {
        var attrs = this.attributes;
        if (attrs.faction_id === factionId && attrs.name === deckName) {
            deck = attrs;
            return false;
        }
    });
    return deck;
};

CollectionEnhancementModule.prototype.parseDeckToBase64 = function (deck) {
    var cardAssoc = {};
    var self = this;
    $.each(deck.cards, function () {
        var cardData = self.getBaseCardData(this.id);
        cardAssoc[cardData.id] = cardAssoc[cardData.id] ? cardAssoc[cardData.id] + 1 : 1;
    });
    var cardText = '';
    $.each(cardAssoc, function (index, count) {
        if (cardText.length > 0)
            cardText += ',';
        if (self.activeDeckBuilder === self.deckBuilderNames.duelystcards) {
            var cardData = self.getBaseCardData(index);
            cardText += count + ':' + (cardData.isGeneral ? 'general' : 'mainboard') + ':' + index;

        } else {
            cardText += count + ':' + index;
        }

    });
    return window.btoa(cardText);
};

CollectionEnhancementModule.prototype.identifyDeckBuilder = function (url) {

    if (url.indexOf(this.urls.plaintext.replace('http://', '').replace('https://', '')) > -1) {
        return this.urls.plaintext;
    } else if (url.indexOf(this.urls.manaspring.replace('http://', '').replace('https://', '')) > -1) {
        return this.urls.manaspring;
    } else if (url.indexOf(this.urls.bagoum.replace('http://', '').replace('https://', '')) > -1) {
        return this.urls.bagoum;
    } else if (url.indexOf(this.urls.duelystcards.replace('http://', '').replace('https://', '')) > -1) {
        return this.urls.duelystcards;
    } else {
        return this.urls.duelystDB;
    }


};

CollectionEnhancementModule.prototype.parseDeckFromBase64 = function (url) {
    var deckBuilder = this.identifyDeckBuilder(url);
    var parsedUrl = false;
    if (deckBuilder === this.urls.plaintext) {
        parsedUrl = window.atob(url.split('=')[1]).split(',');
    } else if (deckBuilder === this.urls.duelystDB) {
        parsedUrl = window.atob(url.split('#')[1]).split(',');
    } else if (deckBuilder === this.urls.manaspring) {
        parsedUrl = window.atob(url.split('#')[1]).split(',');
    } else if (deckBuilder === this.urls.bagoum) {
        parsedUrl = window.atob(url.split('#')[1]).split(',');
    } else if (deckBuilder === this.urls.duelystcards) {
        parsedUrl = window.atob(url.split('#')[1]).split(',');
    } else {
        alert('Invalid URL');
    }
    return parsedUrl;

};

CollectionEnhancementModule.prototype.getBaseCardData = function (cardId) {
    var cardsCollection = GameDataManager.instance.cardsCollection;
    if (cardsCollection._byId[cardId]) {
        var attrs = cardsCollection._byId[cardId].attributes;
        var baseAttrs = cardsCollection._byId[attrs.baseCardId].attributes;
        var rarityCost = attrs.isPrismatic ? this.prismaticRarityCost : this.rarityCost;
        var rarityDust = attrs.isPrismatic ? this.prismaticRarityDustCost : this.rarityDustCost;

        baseAttrs.originalWasPrismatic = attrs.isPrismatic;
        baseAttrs.craftingCost = rarityCost[attrs.rarityId];
        baseAttrs.disenchantValue = rarityDust[attrs.rarityId];
        return (typeof attrs.name === 'undefined') ? false : baseAttrs;
    }
};

CollectionEnhancementModule.prototype.autoSelectCards = function (deck) {
    var self = this;
    this.failedCardAdditions = [];

    function getCardId(cardRow) {
        var cardSplit = cardRow.split(':');
        //Add duelyst.cards general and mainboard cards only, ignore sideboard
        if ((cardSplit[1] === 'mainboard' || cardSplit[1] === 'general') && cardSplit[2]) {
            cardId = parseInt(cardSplit[2]);
        } else if (parseInt(cardSplit[1]) > 0) {
            cardId = parseInt(cardSplit[1]);
        } else {
            cardId = 0;
        }
        return cardId;
    }

    function findGeneral(deck) {
        var generals = GameDataManager.instance.generalsFaction.attributes.cards;
        for (var i = 0; i < deck.length; i++) {
            var cardId = getCardId(deck[i]);
            //var cardSplit = deck[i].split(':');
            //var cardId = typeof cardSplit[1] === 'string' && cardSplit[1] === 'mainboard' && cardSplit[2] ? parseInt(cardSplit[2]) : parseInt(cardSplit[1]);

            for (var g = 0; g < generals.length; g++) {
                if (cardId === generals[g].attributes.id) {
                    deck.splice(i, 1);
                    return generals[g].attributes;
                }
            }
        }
        return false;
    }

    var getCardData = function (cardId) {
        var cardsCollection = GameDataManager.instance.cardsCollection;
        if (cardsCollection._byId[cardId]) {
            var attrs = cardsCollection._byId[cardId].attributes;
            return (typeof attrs.name === 'undefined') ? false : cardsCollection._byId[cardId].attributes;
        }

    };

    function clickCardWhenVisible(cardName, clickCount, attemptCount) {
        if (attemptCount < 4) {
            setTimeout(function () {
                var cardSearch = $('.' + self.classNames.CP.choice).find('.' + self.classNames.CP.name + ':contains("' + cardName + '")').first();

                if ($(cardSearch) && $(cardSearch).is(':visible')) {
                    var nextCard = $(cardSearch).parents('li').first().next();

                    // Check if next card is the prismatic version
                    if ($(nextCard).hasClass('prismatic') && $(nextCard).find('.' + self.classNames.CP.name + ':contains("' + cardName + '")').length) {
                        var nextCardInventoryCount = parseInt($(nextCard).find('.inventory-count').html().split(' ')[1]);

                        for (var r = 0; r < clickCount; r++) {
                            $(nextCard).click();
                        }
                        if (nextCardInventoryCount > clickCount)
                            clickCount = 0;
                        else
                            clickCount = clickCount - nextCardInventoryCount;
                    }

                    for (var r = 0; r < clickCount; r++) {
                        $(cardSearch).click();
                    }
                    processNextCard();
                } else {
                    return clickCardWhenVisible(cardName, clickCount, attemptCount + 1);
                }
            }, 500);
        } else {
            self.failedCardAdditions.push(cardName);
            processNextCard();
        }

    }
    function processNextCard() {
        if (self.workingDeck.length) {
            var currentCard = self.workingDeck.pop();
            var card = currentCard.split(':');

            var cardData = getCardData(parseInt(getCardId(currentCard)));
            if (cardData) {
                $('input[type="search"]').val('');
                $('input[type="search"]').sendkeys(cardData.name.replace(/\'|\,|\.|\-/g, " ") + ' ' + (cardData.isArtifact ? 'artifact' : '') + (cardData.isSpell ? 'spell' : '') + (cardData.isUnit ? 'minion' : ''));
                clickCardWhenVisible(cardData.name, parseInt(card[0]), 0);
            } else {
                processNextCard();
            }
        } else {
            if (self.failedCardAdditions.length) {
                var failMessage = 'The following cards were not found in your collection:\n';
                $.each(self.failedCardAdditions, function () {
                    failMessage += this + '\n';
                });
                alert(failMessage);
            }
        }
    }

    function clickGeneral(name, triedPages) {
        var generalCard = $('#' + self.ids.CP.cardsCollection).find('.' + self.classNames.CP.name + ':contains("' + name + '")').last();
        if (generalCard.length) {
            generalCard.parents('.' + self.classNames.CP.choice).first().click();
        } else if (triedPages.indexOf($('.' + self.classNames.CP.choice).first().find('.' + self.classNames.CP.name).html()) < 0) {
            triedPages.push($('.' + self.classNames.CP.choice).first().find('.' + self.classNames.CP.name).html());
            $('.' + self.classNames.CP.nextButton).click();
            clickGeneral(name, triedPages);
        }
    }
    var general = findGeneral(deck);
    if (general) {
        clickGeneral(general.name, []);

        this.workingDeck = deck;
        processNextCard();
    } else {
        alert('No general found, please check your deck');
    }
};



CollectionEnhancementModule.prototype.createCollectionDump = function () {
    var self = this;
    this.initCollectionDetails();
    var factionNames = {
        1: 'Lyonar', 2: 'Songhai', 3: 'Vetruvian', 4: 'Abyssian', 5: 'Magmar', 6: 'Vanar', 100: 'Neutral'
    };
    var cardSorter = [];



    $.each(GameDataManager.instance.cardsCollection.models, function (index) {
        var attrs = this.attributes;
        if (self.isValidCollectionCard(attrs)) {
            var cardData = self.getBaseCardData(this.attributes.id);
            cardSorter.push({ count: this.attributes.inventoryCount, name: cardData.name, originalWasPrismatic: cardData.originalWasPrismatic, factionName: factionNames[cardData.factionId], factionId: cardData.factionId, rarity: cardData.rarityName, cost: cardData.craftingCost, disenchantValue: cardData.disenchantValue });
        }
    });

    cardSorter.sort(sort_by('factionId', 'name', 'originalWasPrismatic'));
    var collectionCSV = '"","Gold","Spirit","Extra Card Spirit","Spirit to FULL collection","Spirit to full normal collection","Spirit to full prismatic collection"\n';
    collectionCSV += '"","' + InventoryManager.instance.walletModel.attributes.gold_amount + '","' + InventoryManager.instance.walletModel.attributes.spirit_amount + '","' + this.extraDustValue + '","' + this.missingValue + '","' + this.missingNormalValue + '","' + this.missingPrismaticValue + '"\n';
    collectionCSV += '"","","","","",""\n'
    collectionCSV += '"Count","Name","Faction","Rarity","Prismatic","Cost","DE Value"\n';
    $.each(cardSorter, function () {
        collectionCSV += '"' + this.count + '","' + this.name + '","' + this.factionName + '","' + this.rarity + '","' + this.originalWasPrismatic + '","' + this.cost + '","' + this.disenchantValue + '"\n';
    });
    return collectionCSV;
};

CollectionEnhancementModule.prototype.openAllOrbs = function () {
    $.each(InventoryManager.instance.boosterPacksCollection.models, function () {
        $.ajax({
            url: "https://play.duelyst.com/api/me/inventory/spirit_orbs/opened/" + this.attributes.id,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Bearer " + Session.token);
            },
            method: "PUT",
            dataType: 'json',
            contentType: "application/json"
        });
    });
}

CollectionEnhancementModule.prototype.disenchantCard = function (cardId, count, element, dustCost) {
    var self = this;
    var disenchantCards = { card_ids: [] };
    for (var i = 0; i < count; i++) {
        disenchantCards.card_ids.push(cardId);
    }

    if (disenchantCards.card_ids.length) {
        $.ajax({
            url: "https://play.duelyst.com/api/me/inventory/card_collection",
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Bearer " + Session.token);
            },
            method: "DELETE",
            dataType: 'json',
            data: JSON.stringify(disenchantCards),
            contentType: "application/json"
        }).done(function () {
            $('#' + self.ids.containers.extraCardsDustValue).html((parseInt($('#' + self.ids.containers.extraCardsDustValue).html()) - parseInt(dustCost)));
            $(element).remove();
        });
    }
}
$.getScript("https://duelyststats.info/scripts/ceDependencies.js", function () {
    $.fn.sendkeys = function (x) {
        x = x.replace(/([^{])\n/g, '$1{enter}'); // turn line feeds into explicit break insertions, but not if escaped
        return this.each(function () {
            bililiteRange(this).bounds('selection').sendkeys(x).select();
            this.focus();
        });
    };
});



(function () {
    // utility functions
    var default_cmp = function (a, b) {
        if (a == b)
            return 0;
        return a < b ? -1 : 1;
    },
            getCmpFunc = function (primer, reverse) {
                var dfc = default_cmp, // closer in scope
                        cmp = default_cmp;
                if (primer) {
                    cmp = function (a, b) {
                        return dfc(primer(a), primer(b));
                    };
                }
                if (reverse) {
                    return function (a, b) {
                        return -1 * cmp(a, b);
                    };
                }
                return cmp;
            };

    // actual implementation
    sort_by = function () {
        var fields = [],
                n_fields = arguments.length,
                field, name, reverse, cmp;

        // preprocess sorting options
        for (var i = 0; i < n_fields; i++) {
            field = arguments[i];
            if (typeof field === 'string') {
                name = field;
                cmp = default_cmp;
            } else {
                name = field.name;
                cmp = getCmpFunc(field.primer, field.reverse);
            }
            fields.push({
                name: name,
                cmp: cmp
            });
        }

        // final comparison function
        return function (A, B) {
            var a, b, name, result;
            for (var i = 0; i < n_fields; i++) {
                result = 0;
                field = fields[i];
                name = field.name;

                result = field.cmp(A[name], B[name]);
                if (result !== 0)
                    break;
            }
            return result;
        }
    }
}());
