// Ledger Lane, the Carter Family Budget: the make.fun entrypoint.
//
// The site itself is this directory's app/ folder: plain static files,
// ES modules and CSS with no build step, and nothing it serves is loaded
// over the network. This program hands the site in: it copies app/ and
// screenshots/ from beside this file into the output directory, then
// writes dossier.json, the summary the judge reads, using the vendored
// make.fun library. The caps handed to buildDossier are the scorer's own,
// so the program fails exactly where the scorer would refuse the entry.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for
// /output.

import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { buildDossier } from "./vendor/makefun-frontend.ts";

const here = fileURLToPath(new URL(".", import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

mkdirSync(out, { recursive: true });
cpSync(join(here, "app"), join(out, "app"), { recursive: true });

mkdirSync(join(out, "screenshots"), { recursive: true });
const shots = join(here, "screenshots");
if (existsSync(shots)) {
  cpSync(shots, join(out, "screenshots"), { recursive: true });
}

writeFileSync(
  join(out, "dossier.json"),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 16777216,
  }),
);
