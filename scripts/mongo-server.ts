import { MongoMemoryReplSet } from "mongodb-memory-server";
import path from "node:path";
import fs from "node:fs";

async function main() {
  const port = Number(process.env.MONGO_PORT ?? 27017);
  const dbPath = path.join(process.cwd(), ".mongo-data");

  fs.mkdirSync(dbPath, { recursive: true });

  const replSet = await MongoMemoryReplSet.create({
    replSet: { count: 1, dbName: "kirayepe", name: "rs0" },
    instanceOpts: [
      {
        port,
        dbPath,
        storageEngine: "wiredTiger",
      },
    ],
  });

  console.log(`KirayePe local MongoDB replica set ready at ${replSet.getUri("kirayepe")}`);

  async function shutdown() {
    await replSet.stop({ doCleanup: false });
    process.exit(0);
  }

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  await new Promise(() => {});
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});