app.library.collections = {};

const slugify = app.shared.slugify;

app.library.collections.game = class extends app.classes.api.igdb.game {
	get themes() {
		if (!this.data.themes) return [];
		return this.data.themes.map(({ name, slug }) => app.listItem.suggest(slug, name));
	}

	get genres() {
		if (!this.data.genres) return [];
		return this.data.genres.map(({ name, slug }) => app.listItem.suggest(slug, name));
	}

	get collections() {
		if (!this.data.collections) return [];
		return this.data.collections.map(({ name, slug }) => app.listItem.suggest(slug, name));
	}

	get platforms() {
		if (!this.data.platforms) return [];
		return this.data.platforms.map(({ name, slug }) => app.listItem.suggest(slug, name));
	}

	get playedPlatform() {
		if (!this.data.platforms) return [];
		const {slug, name} = this.data.platforms[0];
		return app.listItem.suggest(slug, name);
	}

	get storyline() {
		if (!this.data.storyline) return;
		return this.data.storyline;
	}

	get url() {
		if (!this.data.url) return;
		return this.data.url;
	}

	get type() {
		const {type} = this.data.game_type
		if (!type) return [];
		return app.listItem.suggest(slugify(type),type);
	}

  get parentId() {
    if(!this.data.parent_game) return 
    return this.data.parent_game.id;
  }
}

app.library.timeToBeat = (id) => {
	app.api.igdb.refreshTokenIfNeeded();
	const access_token = app.storage.igdb_access_token;
	if (!access_token) return undefined;

	const request = app.api.igdb.request(
		"/game_time_to_beats/",
		`where game_id = ${id}; fields normally;`,
	);
	const response = request.send();
	const { statusCode } = response;

	if (statusCode === 200) {
		const data = response.json();
		const { normally } = data?.[0] || {};

		if (normally) {
			return normally;
		}

		return undefined;
	} else if (statusCode === 401) {
		app.api.igdb.clearToken();
	}

	return undefined;
};

app.library.search = (query) => {
	app.api.igdb.refreshTokenIfNeeded();

	const access_token = app.storage.igdb_access_token;

	if (!access_token) return undefined;

	const searchResults = [];

	let queryText = "";

	if (query.isText()) {
		queryText = query.value;
	}

	const request = app.api.igdb.request(
		"/games/",
		`search "${queryText.replace('"', '\"')}"; limit 25; fields name,cover.*,first_release_date,platforms.name;`);

	const response = request.send();

	const { statusCode } = response;

	if (statusCode === 200) {
		const data = response.json();

		if (data) {
			const mappedResults = data.map((gameData) => {
				const game = new app.classes.api.igdb.game(gameData);
				const searchResult = app.searchResult.new();

				searchResult.title = game.name;
				searchResult.imageURL = game.coverURL();
				searchResult.params = {
					id: game.id,
				};

				if (game.firstReleaseDate) {
					searchResult.subtitle = game.firstReleaseDate.toLocaleDateString(
						undefined, {
							year: "numeric",
							month: "long",
							day: "numeric",
						},
					);
				}

				return searchResult;
			});

			searchResults.push(...mappedResults);
		}
	} else if (statusCode === 401) {
		app.api.igdb.clearToken();
	}

	return searchResults;
};
