import http from "node:http";
import fs from "node:fs/promises";

const PORT = 3000;

const SCHEDULE_PATH = "/lesson-schedule/public/group-schedule"
const GROUPS_PATH = "/lesson-schedule/public/groups"
const GROUP_PARAMETER = "groupName"

const groups_list = await fs.readFile("./mock-data/groups.json", "utf-8");
const groups = {};
for (const group of JSON.parse(groups_list)) {
    groups[group] = JSON.parse(await fs.readFile(`./mock-data/groups/${group}.json`, "utf-8"));
}

const full = JSON.stringify(groups);

const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const path = url.pathname;

    const headers = {
        "Access-Control-Allow-Origin": "http://localhost:8080",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json",
    }

    if (req.method === "OPTIONS") {
        res.writeHead(204, headers);
        res.end();
        return;
    }

    if (req.method !== "GET") {
        console.log("Method not allowed", req.method);
        res.writeHead(200, headers);
        res.end(JSON.stringify({ error: "Method not allowed" }));
        return;
    }

    if (path === "/all") {
        res.writeHead(200, headers);
        res.end(full);
        return;
    }

    if (path === SCHEDULE_PATH) {
        const group = url.searchParams.get(GROUP_PARAMETER);
        if (!group) {
            res.writeHead(400, { "Content-Type": "text/plain" });
            res.end("groupName is required");
            return;
        }

        try {
            const schedule_raw = JSON.stringify(groups[group]);
            res.writeHead(200, headers);
            res.end(schedule_raw);
        } catch (e) {
            console.error("Failed to read file", e);
            res.writeHead(404, headers);
            res.end(JSON.stringify({ error: `Failed to find group "${group}"` }));
        }
        return;
    }

    if (path === GROUPS_PATH) {
        res.writeHead(200, headers);
        res.end(groups_list);
        return;
    }
});

server.listen(PORT, () => {
    console.log(`Mock server running at http://localhost:${PORT}/`);
});
