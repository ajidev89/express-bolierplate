const { spawnSync } = require("child_process");
const path = require("path");
require("dotenv").config();

const schemas = {
    mongodb: "prisma/mongodb/schema.prisma",
    mongo: "prisma/mongodb/schema.prisma",
    postgresql: "prisma/postgresql/schema.prisma",
    postgres: "prisma/postgresql/schema.prisma",
    mysql: "prisma/mysql/schema.prisma",
};

const provider = (process.env.DB_PROVIDER || "mongodb").toLowerCase();
const schema = schemas[provider];

if (!schema) {
    console.error(
        `DB_PROVIDER must be "mongodb", "postgresql", or "mysql". Received "${provider}".`
    );
    process.exit(1);
}

const action = process.argv[2] || "generate";
const prismaArgs =
    action === "push"
        ? ["db", "push", "--schema", schema]
        : ["generate", "--schema", schema];

const prismaBin = path.join(__dirname, "..", "node_modules", ".bin", "prisma");
const result = spawnSync(prismaBin, prismaArgs, {
    stdio: "inherit",
    env: process.env,
});

if (result.error) {
    console.error(result.error.message);
    process.exit(1);
}

process.exit(result.status ?? 1);
