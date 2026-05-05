import { execSync } from "child_process";

const result = execSync("pnpm drizzle-kit generate", {
  encoding: "utf8",
  stdio: ["inherit", "pipe", "pipe"],
});
process.stdout.write(result);

const dirty = execSync("git status --porcelain src/db/migrations/", {
  encoding: "utf8",
}).trim();

if (dirty) {
  process.stderr.write(
    `Schema drift detected — commit the new migration files:\n${dirty}\n`,
  );
  process.exit(1);
}
