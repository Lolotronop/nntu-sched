import fs from "node:fs/promises";

const BASE_PATH = "https://my-api.nntu.ru"
const SCHEDULE_PATH = "/lesson-schedule/public/group-schedule"
const GROUPS_PATH = "/lesson-schedule/public/groups"
const GROUP_PARAMETER = "groupName"


async function fetch_json(uri) {
    let req;
    try {
        req = await fetch(uri);
    } catch (e) {
        throw new Error(`Failed to fetch ${uri}`, { cause: e });
    }
    if (!req.ok) {
        throw new Error(`Failed to fetch ${uri}: ${req.status} ${req.statusText}`);
    }
    let data;
    try {
        data = await req.json();
    } catch (e) {
        throw new Error(`Failed to parse json from ${uri}`, { cause: e });
    }
    return data
}


async function get_schedule_raw(group) {
    const group_param = encodeURIComponent(group)
    return await fetch_json(`${BASE_PATH}${SCHEDULE_PATH}?${GROUP_PARAMETER}=${group_param}`)
}


async function get_groups_raw() {
    return await fetch_json(`${BASE_PATH}${GROUPS_PATH}`)
}

async function main() {
    const groups = await get_groups_raw();
    await fs.mkdir("./mock-data/groups", { recursive: true });
    await fs.writeFile("./mock-data/groups.json", JSON.stringify(groups));
    console.log(`Downloaded ${groups.length} groups...`)
    console.log("Downloading schedules...")
    let counter = 0;
    for (const group of groups) {
        const schedule = await get_schedule_raw(group);
        await fs.writeFile(`./mock-data/groups/${group}.json`, JSON.stringify(schedule));
        counter++;
        console.log(`Downloaded ${group}, progress: ${counter}/${groups.length}`);
    }
}

main()
