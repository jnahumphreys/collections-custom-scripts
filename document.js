app.api.igdb.client_id = app.config.CLIENT_ID;
app.api.igdb.client_secret = app.config.CLIENT_SECRET;

app.api.igdb.gameClass = app.library.collections.game;

app.api.igdb.extraFields.push(
  "game_type.*",
  "themes.*",
  "collections.*",
  "url",
  "parent_game.*"
);

const queryID = app.currentDocument?.getValue("igdb-id") ?? app.params.id;

const game = app.api.igdb.getGame(queryID);

if (!game) {
  app.fail();
}

function buildGame(game) {

  const builder = app.document.builder();

  builder.setIdentifier("igdb-id");

  const timeToBeat = app.library.timeToBeat(game.id);

  builder.setString(game.name, "title");
  builder.setImage(game.requestCover(), "cover");
  builder.setDate(game.firstReleaseDate, "first-release-date");
  builder.setListItem(game.playedPlatform, "played-platform");
  builder.setListItems(game.platforms, "release-platforms");
  builder.setListItem(game.type, "game-type");
  builder.setListItems(game.genres, "genres");
  builder.setListItems(game.themes, "themes");
  builder.setListItems(game.collections, "series");
  builder.setInteger(timeToBeat, "time-to-beat");
  builder.setString(game.url, "igdb-url");
  builder.setListItem(app.listItem.suggest("backlog", "Backlog"), "status");
  builder.setInteger(game.id, "igdb-id");
  game.parentId && builder.setInteger(game.parentId, "igdb-parent-id");
  game.parentId ? builder.setEntity("DLC") : builder.setEntity("Main game");

  return builder;

}

  if(game.parentId) {

    const parentGame = app.api.igdb.getGame(game.parentId);

    if (!parentGame) {
      app.fail();
    }

    const parentBuilder = buildGame(parentGame);

    const childBuilder = buildGame(game);

    childBuilder.setParent(parentBuilder);

    app.result(childBuilder);

  } else {
    app.result(buildGame(game));
  }

