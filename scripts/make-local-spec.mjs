// scripts/make-local-spec.mjs
import fs from "fs";
import yaml from "js-yaml";

const OPENAPI_IN  = process.env.OPENAPI_IN  || "openapi.yaml";
const OPENAPI_OUT = process.env.OPENAPI_OUT || ".tmp/openapi.local.yaml";
const HOST = process.env.API_HOST || "localhost";
const PORT = process.env.API_PORT || "4010";
const URL  = `http://${HOST}:${PORT}`;

const doc = yaml.load(fs.readFileSync(OPENAPI_IN, "utf8"));

// Overwrite servers for local dev (Prism base URL)
doc.servers = [{ url: URL }];

fs.mkdirSync(".tmp", { recursive: true });
fs.writeFileSync(OPENAPI_OUT, yaml.dump(doc), "utf8");
console.log(`Wrote ${OPENAPI_OUT} with servers[0].url=${URL}`);
