const { spawn } = require("child_process");
require("dotenv").config();

const providers = {
    mongodb: "mongodb",
    mongo: "mongodb",
    postgresql: "postgresql",
    postgres: "postgresql",
    mysql: "mysql",
};

const source = (process.env.DB_SOURCE || "existing").toLowerCase();
const provider = providers[(process.env.DB_PROVIDER || "mongodb").toLowerCase()];

if (source !== "container" && source !== "existing") {
    console.error('DB_SOURCE must be "container" or "existing".');
    process.exit(1);
}

if (!provider) {
    console.error('DB_PROVIDER must be "mongodb", "postgresql", or "mysql".');
    process.exit(1);
}

const databaseUrl = process.env.DATABASE_URL || "";
const usesServiceHost = new RegExp(`(://|@)${provider}(:|/|$)`).test(databaseUrl);
if (source === "container" && /localhost|127\.0\.0\.1/.test(databaseUrl)) {
    console.warn(
        `DB_SOURCE=container: the app container cannot reach the database at localhost. Use host "${provider}" in DATABASE_URL.`
    );
}

if (source === "existing" && usesServiceHost) {
    console.warn(
        `DB_SOURCE=existing: DATABASE_URL points at the "${provider}" container, which will not be started.`
    );
}

const env = { ...process.env };
if (source === "container") {
    env.COMPOSE_PROFILES = provider;
    console.log(`Starting app with a ${provider} container.`);
} else {
    delete env.COMPOSE_PROFILES;
    console.log(`Starting app with an existing ${provider} database.`);
}

const args = process.argv.slice(2);
if (args.length === 0) {
    args.push("up");
}

const child = spawn("docker", ["compose", ...args], {
    stdio: "inherit",
    env,
});

child.on("error", (error) => {
    console.error(error.message);
    process.exit(1);
});

child.on("exit", (code) => {
    process.exit(code ?? 1);
});
