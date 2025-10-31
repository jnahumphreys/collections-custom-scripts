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

const timeToBeat = app.library.timeToBeat(queryID);

function buildGame() {

  const builder = app.document.builder();

  game.parentId ? builder.setEntity("DLC") : builder.setEntity("Main game");

  builder.setString(game.name, "title");
  builder.setImage(game.requestCover(), "cover");
  builder.setDate(game.firstReleaseDate, "first-release-date");
  builder.setListItems(game.platforms, "release-platforms");
  builder.setListItem(game.type, "game-type");
  builder.setListItems(game.genres, "genres");
  builder.setListItems(game.themes, "themes");
  builder.setListItems(game.collections, "series");
  builder.setInteger(timeToBeat, "time-to-beat");
  builder.setString(game.url, "igdb-url");
  
  if(!app.currentDocument) {
    builder.setListItem(app.listItem.suggest("backlog", "Backlog"), "status");
    builder.setInteger(game.id, "igdb-id");
    game.parentId && builder.setInteger(game.parentId, "igdb-parent-id");
  }

  return builder;

}

app.result(buildGame());