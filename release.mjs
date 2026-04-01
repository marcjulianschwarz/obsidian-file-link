import { execSync } from "child_process";
import { readFileSync } from "fs";

const { version } = JSON.parse(readFileSync("./manifest.json", "utf8"));

execSync("yarn build", { stdio: "inherit" });
execSync("git add manifest.json versions.json", { stdio: "inherit" });
execSync(`git commit -m "Release ${version}"`, { stdio: "inherit" });
execSync("git push", { stdio: "inherit" });
execSync(`gh release create ${version} main.js manifest.json styles.css --title ${version} --generate-notes`, { stdio: "inherit" });
