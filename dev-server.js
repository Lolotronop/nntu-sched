// @ts-check

import "./mock-server.js";
import fs from "node:fs/promises";
import http from "node:http";

const PORT = 8080;

const ASSET_NAMES = [
    "index.html",
    "style.css",
    "modern-normalize.css",
    "app.js",
    "sw.js",
]

/** @type {Record<string, Buffer<ArrayBuffer>|string>} */
const ASSETS = {};

for (const name of ASSET_NAMES) {
    const path = `./${name}`;
    const content = await fs.readFile(path);
    ASSETS[name] = content;
}

const CLIENT_PROGRAM = `
let evt;
function connect() {
    if (evt) {
        evt.close();
    }
    evt = new EventSource("/reload");
    evt.onmessage = handle_message;
    evt.onerror = handle_error;
}

function handle_message(e) {
    if (e.data === "reload") {
        location.reload();
    }
}

function handle_error(e) {
    console.error("EventSource error", e.message);
    connect();
}

connect();
`;

ASSETS["index.html"] = `${ASSETS["index.html"]}\n<script>${CLIENT_PROGRAM}</script>`;


/** @type {(http.ServerResponse<http.IncomingMessage> & { req: http.IncomingMessage; }) | undefined}*/
let client;
/** @param {fs.FileChangeInfo<string>} e */
async function handle_file_change(e) {
    const name = e.filename;
    if (!name) return;
    ASSETS[name] = await fs.readFile(name);
    if (name === "index.html") {
        ASSETS["index.html"] = `${ASSETS["index.html"]}\n<script>${CLIENT_PROGRAM}</script>`;
    }
    if (!client) return;
    client.write(`data: reload\n\n`);
    client.end();
    client = undefined;
}

/** @param {string} path */
async function register_file_watcher(path) {
    for await (const update of fs.watch(path)) {
        handle_file_change(update);
    }
}

const server = http.createServer(async (req, res) => {
    if (!req.url) return;
    const path = req.url.slice(1);

    if (path === "reload") {
        if (client) {
            client.end();
            client = undefined;
        }
        res.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive"
        });
        client = res;
        return;
    }

    for (const name of ASSET_NAMES) {
        if (path !== name) continue;

        const extension = path.split(".").pop();
        /** @type {string} */
        let content_type;
        switch (extension) {
            case "js":
                content_type = "text/javascript";
                break;
            case "css":
                content_type = "text/css";
                break;
            case "html":
                content_type = "text/html";
                break;
            default:
                content_type = "text/plain";
                break;
        }

        res.writeHead(200, {
            "Content-Type": content_type,
        });
        res.end(ASSETS[name]);
        return;
    }

    res.writeHead(200, {
        "Content-Type": "text/html",
    });
    res.end(ASSETS["index.html"]);
})

for (const name of ASSET_NAMES) {
    const path = `./${name}`;
    register_file_watcher(path);
}

server.listen(PORT);

console.log(`Dev running at http://localhost:${PORT}/`);
