#!/usr/bin/env node

/**
 * Run Categories Seeder Script
 * This script will populate the database with comprehensive categories for the Liberian marketplace
 */

const { execSync } = require("child_process");
const path = require("path");

console.log("🌱 Starting Categories Seeder...");
console.log("📁 Working directory:", process.cwd());

try {
  // Change to the project root directory
  const projectRoot = path.resolve(__dirname, "..");
  process.chdir(projectRoot);

  console.log("📂 Changed to project root:", projectRoot);

  // Run the TypeScript seeder using ts-node
  console.log("⚡ Running categories seeder with ts-node...");
  execSync("npx ts-node seeders/categories-seeder.ts", {
    stdio: "inherit",
    env: {
      ...process.env,
      NODE_ENV: "development",
    },
  });

  console.log("✅ Categories seeder completed successfully!");
} catch (error) {
  console.error("❌ Error running categories seeder:");
  console.error(error.message);
  process.exit(1);
}
