var GameSave = {

	STORAGE_KEY: 'candyBearProgress',
	VERSION: 4,

	load: function () {

		try {

			var raw = localStorage.getItem(this.STORAGE_KEY);

			if (!raw) {
				return null;
			}

			var data = JSON.parse(raw);

			if (!data || typeof data !== 'object') {
				return null;
			}

			var purchases = data.purchases || {};
			var flavorStocks = null;
			var i;

			if (Array.isArray(data.flavorStocks) && data.flavorStocks.length === 6) {
				flavorStocks = [];

				for (i = 0; i < 6; i++) {
					flavorStocks.push(Math.max(0, parseInt(data.flavorStocks[i], 10) || 0));
				}
			}

			return {
				coins: Math.max(0, parseInt(data.coins, 10) || 0),
				level: Math.max(1, parseInt(data.level, 10) || 1),
				hasKey: !!purchases.hasKey,
				hasPistol: !!purchases.hasPistol,
				hasBallMode: !!purchases.hasBallMode,
				myWeapons: Math.max(0, parseInt(purchases.myWeapons, 10) || 0),
				myCannons: Math.max(0, parseInt(purchases.myCannons, 10) || 0),
				myCannonsUpgrades: Array.isArray(purchases.myCannonsUpgrades) ?
					purchases.myCannonsUpgrades.slice() : [],
				placedCannons: GameSave.normalizarCannonsColocados(purchases.placedCannons),
				flavorStocks: flavorStocks
			};

		} catch (error) {
			return null;
		}

	},

	save: function (progress) {

		if (!progress || typeof progress !== 'object') {
			return;
		}

		try {

			localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
				version: this.VERSION,
				coins: Math.max(0, parseInt(progress.coins, 10) || 0),
				level: Math.max(1, parseInt(progress.level, 10) || 1),
				purchases: {
					hasKey: !!progress.hasKey,
					hasPistol: !!progress.hasPistol,
					hasBallMode: !!progress.hasBallMode,
					myWeapons: Math.max(0, parseInt(progress.myWeapons, 10) || 0),
					myCannons: Math.max(0, parseInt(progress.myCannons, 10) || 0),
					myCannonsUpgrades: Array.isArray(progress.myCannonsUpgrades) ?
						progress.myCannonsUpgrades.slice() : [],
					placedCannons: GameSave.normalizarCannonsColocados(progress.placedCannons)
				},
				flavorStocks: Array.isArray(progress.flavorStocks) ?
					progress.flavorStocks.map(function (stock) {
						return Math.max(0, parseInt(stock, 10) || 0);
					}) : [0, 0, 0, 0, 0, 0],
				savedAt: Date.now()
			}));

		} catch (error) {
			console.warn('No se pudo guardar el progreso', error);
		}

	},

	normalizarCannonsColocados: function (placedCannons) {

		if (!Array.isArray(placedCannons)) {
			return [];
		}

		return placedCannons.map(function (item) {

			if (typeof item === 'number') {
				return {
					level: Math.min(3, Math.max(1, parseInt(item, 10) || 1)),
					direction: 1
				};
			}

			if (!item || typeof item !== 'object') {
				return { level: 1, direction: 1 };
			}

			var cannon = {
				level: Math.min(3, Math.max(1, parseInt(item.level, 10) || 1)),
				direction: parseInt(item.direction, 10) === -1 ? -1 : 1
			};

			if (typeof item.x === 'number' && typeof item.y === 'number' &&
				!isNaN(item.x) && !isNaN(item.y)) {
				cannon.x = Math.round(item.x);
				cannon.y = Math.round(item.y);
			}

			return cannon;

		});

	},

	clear: function () {

		try {
			localStorage.removeItem(this.STORAGE_KEY);
		} catch (error) {
			console.warn('No se pudo borrar el progreso', error);
		}

	}

};

if (typeof window !== 'undefined') {

	window.addEventListener('beforeunload', function () {

		var state = window.game && window.game.state && window.game.state.getCurrentState();

		if (state && state.guardarProgreso) {
			state.guardarProgreso();
		}

	});

}