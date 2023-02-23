"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schema = void 0;
// this table records timer for user energy charger
exports.schema = `
  CREATE TABLE IF NOT EXISTS Timer (
    ID        INTEGER NOT NULL UNIQUE,
    DiscordID TEXT NOT NULL,
    Name      TEXT NOT NULL,
    Created   DEFAULT CURRENT_TIMESTAMP,
    Expires   TEXT NOT NULL,
    PRIMARY KEY(ID AUTOINCREMENT)
  );
`;
exports.schema += `
    CREATE TABLE IF NOT EXISTS Player (
      DiscordID	         TEXT NOT NULL UNIQUE,
      XP                 DEFAULT 0,
      Coin               DEFAULT 0,
      ArenaCoin          DEFAULT 0,
      Energy             DEFAULT 5,
      SquadBossEnergy    DEFAULT 1,
      ChallengerMaxLevel DEFAULT 0,
      GoldMedal          DEFAULT 0,
      SilveMedal         DEFAULT 0,
      BronzeMedal        DEFAULT 0,
      Buff               TEXT,
      FragmentReward     DEFAULT 500,
      MiningPickReward   DEFAULT 10,
      PRIMARY KEY("DiscordID")
    );
`;
exports.schema += `
  CREATE TABLE IF NOT EXISTS Challenger (
    ID         INTEGER PRIMARY KEY,
    Name       TEXT,
    Loot       INT,
    HP         INT,
    Strength   INT,
    Speed      INT,
    Armor      INT,
    CritChance REAL
  );
`;
exports.schema += `
  CREATE TABLE IF NOT EXISTS XPEntry (
    ID          INTEGER PRIMARY KEY,
    ChallengeID INTEGER,
    Day         INTEGER,
    XP          INTEGER,
    DiscordID   TEXT
  );
`;
exports.schema += `
  CREATE TABLE IF NOT EXISTS Profile (
    DiscordID   TEXT PRIMARY KEY,
    Checksum    TEXT NOT NULL,
    Data        BLOB NOT NULL
  );
`;
exports.schema += `
  CREATE TABLE IF NOT EXISTS Inventory (
    ID      INTEGER PRIMARY KEY,
    OwnerID TEXT NOT NULL,
    Created DEFAULT CURRENT_TIMESTAMP,
    ItemID  TEXT NOT NULL
  );
`;
exports.schema += `
  CREATE TABLE IF NOT EXISTS Pet (
    ID      INTEGER PRIMARY KEY,
    OwnerID TEXT NOT NULL,
    Created DEFAULT CURRENT_TIMESTAMP,
    PetID   TEXT NOT NULL,
    Star    DEFAULT 0,
    Active  DEFAULT FALSE
  );
`;
exports.schema += `
  CREATE TABLE IF NOT EXISTS Gear (
    ID          INTEGER PRIMARY KEY,
    InventoryID INTEGER UNIQUE NOT NULL,
    Equipped    DEFAULT FALSE,
    Level       DEFAULT 0
  );
`;
exports.schema += `
  CREATE TABLE IF NOT EXISTS TeamArena (
    ID        INTEGER PRIMARY KEY,
    Created   TEXT NOT NULL,
    Phase     DEFAULT "signup_1",
    MessageID TEXT
  );
`;
exports.schema += `
  CREATE TABLE IF NOT EXISTS TeamArenaMember (
    ID          INTEGER PRIMARY KEY,
    Created     TEXT NOT NULL,
    TeamArenaID INT NOT NULL,
    DiscordID   TEXT NOT NULL,
    Charge      DEFAULT 10,
    Team        TEXT,
    Score       DEFAULT 0
  );
`;
exports.schema += `
  CREATE TABLE IF NOT EXISTS Gem (
    ID          INTEGER PRIMARY KEY,
    Created     TEXT NOT NULL,
    InventoryID INTEGER NOT NULL,
    GearID      INTEGER
  );
`;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NoZW1hLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2RiL3NjaGVtYS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtREFBbUQ7QUFDeEMsUUFBQSxNQUFNLEdBQUc7Ozs7Ozs7OztDQVNuQixDQUFDO0FBRUYsY0FBTSxJQUFJOzs7Ozs7Ozs7Ozs7Ozs7OztDQWlCVCxDQUFDO0FBRUYsY0FBTSxJQUFJOzs7Ozs7Ozs7OztDQVdULENBQUM7QUFFRixjQUFNLElBQUk7Ozs7Ozs7O0NBUVQsQ0FBQztBQUVGLGNBQU0sSUFBSTs7Ozs7O0NBTVQsQ0FBQztBQUVGLGNBQU0sSUFBSTs7Ozs7OztDQU9ULENBQUM7QUFFRixjQUFNLElBQUk7Ozs7Ozs7OztDQVNULENBQUM7QUFFRixjQUFNLElBQUk7Ozs7Ozs7Q0FPVCxDQUFDO0FBRUYsY0FBTSxJQUFJOzs7Ozs7O0NBT1QsQ0FBQztBQUVGLGNBQU0sSUFBSTs7Ozs7Ozs7OztDQVVULENBQUM7QUFFRixjQUFNLElBQUk7Ozs7Ozs7Q0FPVCxDQUFDIn0=