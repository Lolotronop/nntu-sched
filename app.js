// @ts-check
const IS_DEV = window.location.hostname === "localhost";

const BASE_PATH = IS_DEV ? "http://localhost:3000" : "https://my-api.nntu.ru";
const SCHEDULE_PATH = "/lesson-schedule/public/group-schedule";
const GROUPS_PATH = "/lesson-schedule/public/groups";
const GROUP_PARAMETER = "groupName";


const SCHEDULE_CACHE_VERSION = 2;

const DAY = 1000 * 60 * 60 * 24;
const MINUTE = 1000 * 60;

const SCHEDULE_CACHE_TIMEOUT = IS_DEV ? DAY : DAY;


const ICONS = {
    // return https://lucide.dev/icons/clock-fading
    time_slot: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clock-fading"><path d="M12 2a10 10 0 0 1 7.38 16.75"/><path d="M12 6v6l4 2"/><path d="M2.5 8.875a10 10 0 0 0-.5 3"/><path d="M2.83 16a10 10 0 0 0 2.43 3.4"/><path d="M4.636 5.235a10 10 0 0 1 .891-.857"/><path d="M8.644 21.42a10 10 0 0 0 7.631-.38"/></svg>`
    ,
    // https://lucide.dev/icons/star
    star: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-star preview-icon"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/></svg>`,


    // https://lucide.dev/icons/user-group
    group: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user-group preview-icon"><path d="M17 21v-1a2 2 0 00-2-2H9a2 2 0 00-2 2v1"/><path d="M19 10h1a2 2 0 012 2v1"/><path d="M5 10H4a2 2 0 00-2 2v1"/><circle cx="12" cy="11" r="3"/><circle cx="18" cy="4" r="2"/><circle cx="6" cy="4" r="2"/></svg>`,

    // https://lucide.dev/icons/circle-user
    teacher: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-user"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/></svg>`
    ,

    // https://lucide.dev/icons/school
    room: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-school"><path d="M14 21v-3a2 2 0 0 0-4 0v3"/><path d="M18 4.933V21"/><path d="m4 6 7.106-3.79a2 2 0 0 1 1.788 0L20 6"/><path d="m6 11-3.52 2.147a1 1 0 0 0-.48.854V19a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a1 1 0 0 0-.48-.853L18 11"/><path d="M6 4.933V21"/><circle cx="12" cy="9" r="2"/></svg>`
    ,

    // https://lucide.dev/icons/scroll-text
    lecture: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-scroll-text"><path d="M15 12h-5"/><path d="M15 8h-5"/><path d="M19 17V5a2 2 0 0 0-2-2H4"/><path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3"/></svg>`
    ,

    // https://lucide.dev/icons/hammer
    practice: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-hammer"><path d="m15 12-9.373 9.373a1 1 0 0 1-3.001-3L12 9"/><path d="m18 15 4-4"/><path d="m21.5 11.5-1.914-1.914A2 2 0 0 1 19 8.172v-.344a2 2 0 0 0-.586-1.414l-1.657-1.657A6 6 0 0 0 12.516 3H9l1.243 1.243A6 6 0 0 1 12 8.485V10l2 2h1.172a2 2 0 0 1 1.414.586L18.5 14.5"/></svg>`
    ,

    // https://lucide.dev/icons/flask-conical
    lab: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-flask-conical"><path d="M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2"/><path d="M6.453 15h11.094"/><path d="M8.5 2h7"/></svg>`
    ,

    // https://lucide.dev/icons/badge-question-mark
    unknown: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-badge-question-mark"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>`,

    // https://lucide.dev/icons/search
    search: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search preview-icon"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg>`,
};

/**
 * @template T
 * @typedef Result_Success<T>
 * @type {object}
 * @property {T} data
 * @property {true} ok
 */


/**
 * @template E
 * @typedef Result_Error<E>
 * @type {object}
 * @property {E} err
 * @property {false} ok
 */

/**
 * @template T,E
 * @typedef Result<T, E>
 * @type {Result_Success<T> | Result_Error<E>}
 */

/**
 * @template T
 * @param {T} data
 * @returns {Result_Success<T>}
 */
function ok(data) {
    return { data, ok: true }
}

/**
 * @template E
 * @param {E} err
 * @returns {Result_Error<E>}
 */
function err(err) {
    // console.error(err)
    return { err, ok: false }
}




/**
 * @template T
 * @param {string} uri
 * @returns {Promise<Result<T, string>>}
 */
async function fetch_json(uri) {
    let req;
    try {
        req = await fetch(uri)
    } catch (e) {
        console.error("Failed to fetch", uri, e)
        return err(`Failed to fetch json ${e}`)
    }
    if (!req.ok) return err("Failed to fetch json")
    /** @type {T} */
    let data;
    try {
        data = await req.json()
    } catch (e) {
        return err("Failed to parse json")
    }
    return ok(data)
}

/**
 * @typedef Schedule_Response
 * @type {object}
 * @property {string[]} times
 * @property {Day_Response[]} currentWeek
 * @property {Day_Response[]} nextWeek
 */

/**
 * @typedef Day_Response
 * @type {object}
 * @property {string} dayOfTheWeek
 * @property {Lesson_Element_Response[]} lessonElements
 */

/**
 * @typedef Lesson_Element_Response
 * @type {object}
 * @property {number} timeIndex
 * @property {string|null} description
 * @property {string|null} room
 * @property {string|null} studyType
 * @property {string|null} subject
 * @property {string|null} teacher
 * for some reason these are all null, always
 * @property {null} endTime always null
 * @property {null} startTime always null
 * @property {null} groupName always null
*/


/**
 * @param {string} group
 * @returns {Promise<Result<Schedule_Response, string>>}
 */
function get_schedule_raw(group) {
    const group_param = encodeURIComponent(group)
    return fetch_json(`${BASE_PATH}${SCHEDULE_PATH}?${GROUP_PARAMETER}=${group_param}`)
}

/**
 * @typedef Groups_Response
 * @type {string[]}
*/


/**
 * @returns {Promise<Result<Groups_Response, string>>}
 */
function get_groups_raw() {
    return fetch_json(`${BASE_PATH}${GROUPS_PATH}`)
}


/**
 * @param {string[]} groups
 * @param {(count: number) => void} onload called when a group is downloaded
 */
async function get_all_groups_schedule_raw(groups, onload) {
    /** @type {{group: string, schedule_response: Schedule_Response}[]} */
    let all_schedules = [];

    let loaded = 0;

    const errored = [];
    for (const group of groups) {
        const result = await get_schedule_raw(group);
        if (!result.ok) {
            errored.push({ group, error: result.err });
            continue
        }
        all_schedules.push({ group, schedule_response: result.data })
        loaded++;
        onload(loaded);
    }

    if (errored.length > 0) {
        return err(errored)
    }

    return ok(all_schedules);
}

/**
 * @typedef Time_Of_Day
 * @type {object}
 *
 * @property {number} hour
 * @property {number} minute
 */

/**
 * @typedef Time_Slot
 * @type {object}
 *
 * @property {Time_Of_Day} start
 * @property {Time_Of_Day} end
*/

/**
 * @param {string} slots expected to have only the actual times here, not the category title that is present in the Schedule_Response
 * @returns {Result<Time_Slot, string>}
 */
function parse_time_slot(slots) {
    /**
     * @param {string} str
     * @returns {Result<Time_Of_Day, string>}
     */
    const parse_hhmm_string_to_time_of_day = (str) => {
        const parts = str.split(":");
        if (parts.length != 2) return err("String must be in HH:MM format, failed to split on :");

        const hour = +(parts[0])
        const minute = +(parts[1])

        if ((hour < 0 || hour > 23) || (minute < 0 || minute > 59)) {
            return err("String must be in HH:MM format, hour or minute is not in 0-24-60 range")
        }

        return ok({ hour, minute })
    }

    const parts = slots.split("—")
    if (parts.length != 2) return err("String must be in HH:MM—HH:MM format, failed to split on —");

    const start_res = parse_hhmm_string_to_time_of_day(parts[0])
    const end_res = parse_hhmm_string_to_time_of_day(parts[1])

    if (!start_res.ok) return err(`Failed to parse start time: ${start_res.err}`)
    if (!end_res.ok) return err(`Failed to parse end time: ${end_res.err}`)

    return ok({ start: start_res.data, end: end_res.data })
}


/**
 * @typedef Lesson
 * @type {object}
 *
 * @property {string} subject
 * @property {string} teacher_full
 * @property {string|null} teacher_short
 * @property {string} room
 * @property {string|null} room_short
 * @property {string} type lecture/practice/lab/etc
 * @property {string|null} description
 * @property {Time_Slot} time_slot
 * @property {number} time_slot_index
 * @property {string[]} groups
 * @property {Date} date
*/

/**
 * @typedef Day
 * @type {object}
 *
 * @property {Date} date
 * @property {Lesson[]} lessons
*/

const RU_MONTH_NAMES = {
    января: 0,
    февраля: 1,
    марта: 2,
    апреля: 3,
    мая: 4,
    июня: 5,
    июля: 6,
    августа: 7,
    сентября: 8,
    октября: 9,
    ноября: 10,
    декабря: 11,
};

/**
 * @param {string} str
 * @param {number} year
 * @returns {Result<Date, string>}
 */
function parse_ru_date(str, year = new Date().getFullYear()) {
    const match = str
        .toLowerCase()
        .match(/^(?:[а-яё]+),\s*(\d{1,2})\s+([а-яё]+)$/);

    if (!match) {
        return err("Invalid date format");
    }

    const day = Number(match[1]);
    const month_name = match[2];
    if (month_name in Object.keys(RU_MONTH_NAMES)) {
        return err("Invalid month");
    }
    // @ts-ignore
    const month = RU_MONTH_NAMES[month_name];

    if (month === undefined) {
        return err("Invalid month");
    }

    const date = new Date(year, month, day);

    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month ||
        date.getDate() !== day
    ) {
        return err("Invalid calendar date");
    }

    return ok(date);
}


// taken from https://weeknumber.net/how-to/javascript
/** @param {Date} d */
function week_number(d) {
    let date = new Date(d.getTime());
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    let week1 = new Date(date.getFullYear(), 0, 4);
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}


/**
 * @typedef Lesson_Compressed
 * @type {object}
 *
 * @property {number} subject_id
 * @property {number} teacher_id
 * @property {number} room_id
 * @property {number} type_id lecture/practice/lab/etc
 * @property {number} time_slot_id
 * @property {number} group_id
 * @property {number} day calculated as an offset from the even week monday
 *
 * @property {string|null} description
*/

/**
 * @typedef Schedule_Full
 * @type {object}
 * @property {Lesson_Compressed[]} lessons_compressed
 * @property {string[]} subjects
 * @property {string[]} teachers
 * @property {string[]} rooms
 * @property {string[]} types
 * @property {string[]} groups
 * @property {Time_Slot[]} time_slots
 */

/**
 * @param {{group: string, schedule_response: Schedule_Response}[]} groups
 * @returns {Schedule_Full}
 */
function parse_full_schedule(groups) {
    //=======local functions======

    /**
     * @param {Schedule_Response} schedule
     * @returns 
     */
    const is_schedule_response_empty = (schedule) => {
        return schedule.currentWeek.length === 0 &&
            schedule.nextWeek.length === 0
    }


    /**
     * While this function is not efficient at all
     * it is more that fast enough for ~1000 elements
     * that it is usually used on. And this step is
     * only done once for the whole schedule, then cached
     * so this is not a big deal
     * @template T
     * @param {T[]} arr
     * @param {T} item
     * @returns {number}
     */
    const find_or_create_element = (arr, item) => {
        if (item === null || item === undefined) return -1;

        if (typeof item === "string") {
            // @ts-ignore
            item = item.trim();
            if (item === "") return -1;
        }

        /** @param {any} a
         @param {any} b */
        let eq = (a, b) => a === b;
        if (item instanceof Date) {
            eq = (a, b) => a.getTime() === b.getTime();
        }
        const index = arr.findIndex(el => eq(el, item));
        if (index === -1) {
            arr.push(item);
            return arr.length - 1;
        } else {
            return index;
        }
    }


    /** @param {Lesson_Element_Response} lesson_element */
    const is_lesson_empty = (lesson_element) => {
        return lesson_element.startTime === null &&
            lesson_element.endTime === null &&
            lesson_element.subject === '' &&
            lesson_element.studyType === '' &&
            lesson_element.room === '' &&
            lesson_element.teacher === '' &&
            lesson_element.groupName === null &&
            lesson_element.description === null
    }

    // these 2 are useful during debug

    /** @param {Lesson_Element_Response} lesson_element */
    // const _lesson_has_empty_elements = (lesson_element) => {
    //     return lesson_element.startTime === null ||
    //         lesson_element.endTime === null ||
    //         lesson_element.subject === '' ||
    //         lesson_element.studyType === '' ||
    //         lesson_element.room === '' ||
    //         lesson_element.teacher === '' ||
    //         lesson_element.groupName === null
    // }

    /** @param {Lesson_Element_Response} lesson_element */
    // const _lesson_empty_elements = (lesson_element) => {
    //     const empty = [];
    //     if (lesson_element.startTime === null) empty.push("startTime");
    //     if (lesson_element.endTime === null) empty.push("endTime");
    //     if (lesson_element.subject === '') empty.push("subject");
    //     if (lesson_element.studyType === '') empty.push("studyType");
    //     if (lesson_element.room === '') empty.push("room");
    //     if (lesson_element.teacher === '') empty.push("teacher");
    //     if (lesson_element.groupName === null) empty.push("groupName");
    //     return empty;
    // }



    //=======main loop============

    /** @type {Schedule_Full} */
    let schedule = {
        lessons_compressed: [],
        subjects: [],
        teachers: [],
        rooms: [],
        types: [],
        groups: [],
        time_slots: [],
    };
    for (const { group, schedule_response } of groups) {
        if (is_schedule_response_empty(schedule_response)) {
            continue;
        }

        schedule.time_slots = schedule_response.times.map(parse_time_slot).filter(el => el.ok).map(el => el.data)
        if (schedule.time_slots.length !== 7) {
            console.error("Failed to parse time slots for group", group);
            continue;
        }

        const group_id = find_or_create_element(schedule.groups, group);

        const days = [...schedule_response.currentWeek, ...schedule_response.nextWeek];
        for (const { dayOfTheWeek, lessonElements } of days) {
            const parsed_date = parse_ru_date(dayOfTheWeek);
            if (!parsed_date.ok) {
                console.error("Failed to parse date", dayOfTheWeek, "for group", group);
                continue;
            }

            let day = (parsed_date.data.getDay() + 6) % 7;
            const week_even = week_number(parsed_date.data) % 2 === 0;
            if (!week_even) day += 7;

            for (const lesson_element of lessonElements) {
                if (is_lesson_empty(lesson_element)) {
                    continue;
                }

                schedule.lessons_compressed.push({
                    group_id,
                    time_slot_id: lesson_element.timeIndex - 1,
                    day,
                    subject_id: find_or_create_element(schedule.subjects, lesson_element.subject),
                    teacher_id: find_or_create_element(schedule.teachers, lesson_element.teacher),
                    room_id: find_or_create_element(schedule.rooms, lesson_element.room),
                    type_id: find_or_create_element(schedule.types, lesson_element.studyType),
                    description: lesson_element.description,
                });
            }
        }
    }

    return schedule;
}

// ======================
// === CACHE HANDLING ===
// ======================

/**
 * @typedef Cache_Entry
 * @type {object}
 * @property {string} key
 * @property {number} version
 * @property {Date} date
 */


const CACHE_SEPARATOR = "-";
/**
 * @param {Cache_Entry} entry
 * @returns {string}
 */
function cache_entry_to_string(entry) {
    return `${entry.key}${CACHE_SEPARATOR}${entry.version}${CACHE_SEPARATOR}${entry.date.getTime()}`;
}

/**
 * @param {string} str
 * @returns {Cache_Entry|null}
 */
function cache_entry_from_string(str) {
    const parts = str.split(CACHE_SEPARATOR);
    if (parts.length !== 3) return null;
    let [key, version_str, date_str] = parts;
    const version = +version_str;
    if (isNaN(version)) return null;
    const date = new Date(+date_str);
    if (isNaN(date.getTime())) return null;
    return { key, version, date };
}

/**
 * @param {string} key
 * @param {number} version
 * @returns {Cache_Entry[]} sorted by date, newest first
 */
function cache_find_entries(key, version) {
    /** @type {Cache_Entry[]} */
    const entries = [];
    for (let i = 0; i < localStorage.length; i++) {
        const entry_str = localStorage.key(i);
        if (!entry_str) continue;
        const entry = cache_entry_from_string(entry_str);
        if (!entry) continue;
        if (entry.key !== key) continue;
        if (entry.version !== version) {
            console.warn(`Cache key ${entry_str} version does not match current ${version}, deleting`);
            localStorage.removeItem(entry_str);
            continue;
        }
        entries.push(entry);
    }

    entries.sort((a, b) => {
        return a.date.getTime() - b.date.getTime();
    })
    return entries;
}


/**
 * @param {string} json
 * @returns {Schedule_Full|null}
 */
function schedule_from_json(json) {
    /** @type {Schedule_Full} */
    let schedule;
    try {
        schedule = JSON.parse(json)
    } catch (e) {
        console.error("Failed to parse schedule", e);
        return null;
    }

    return schedule;
}

/**
 * @returns {{schedule: Schedule_Full, entry: Cache_Entry}|null}
 */
function cache_load_schedule() {
    const cache_entries = cache_find_entries("schedule", SCHEDULE_CACHE_VERSION);
    if (cache_entries.length === 0) return null;
    let entry = cache_entries.shift();
    if (!entry) return null;

    // the cache entries are pretty big
    // so we can afford to store only the latest
    // in the lcoalStorage. Cache would peobably
    // hold more, but I don't know how to do that
    for (const entry of cache_entries) {
        localStorage.removeItem(cache_entry_to_string(entry));
    }

    const schedule_key = cache_entry_to_string(entry);
    const json = localStorage.getItem(schedule_key);
    if (!json) return null;

    const schedule = schedule_from_json(json);
    if (!schedule) return null;

    return { schedule, entry };
}

/** 
 * @param {Schedule_Full} schedule
 * @returns {Cache_Entry}
 */
function cache_save_schedule(schedule) {
    /** @type {Cache_Entry} */
    const entry = {
        key: "schedule",
        version: SCHEDULE_CACHE_VERSION,
        date: new Date(),
    };

    try {
        localStorage.setItem(cache_entry_to_string(entry), JSON.stringify(schedule));
    } catch (e) {
        console.error("Failed to save to localStorage", e)
    }

    return entry;
}

/**
 * @param {string} key
 * @param {any} value
 */
function storage_save(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.error("Failed to save to localStorage", e)
    }
}

/**
 * @template T
 * @param {string} key
 * @returns {T|null}
 */
function storage_load(key) {
    const value = localStorage.getItem(key);
    if (!value) return null;
    try {
        return JSON.parse(value);
    } catch (e) {
        console.error("Failed to parse localStorage", e)
        return null;
    }
}

// ======================
// ======= HISTORY ======
// ======================

/**
 * @typedef History_State
 * @type {object}
 * @property {Schedule_Filter|null} filter
 */

/**
 * @param {Schedule_Filter} filter
 */
function history_push_state(filter) {
    /** @type {History_State|undefined} */
    const state = window.history.state;
    if (state?.filter === filter) return;
    window.history.pushState({ filter }, "", schedule_filter_to_pathname(filter));
}


/**
 * @typedef Schedule_Filter_By
 * @type {"group"|"teacher"}
 */

/**
 * @typedef Schedule_Filter
 * @type {object}
 * @property {Schedule_Filter_By} by
 * @property {string} value
 */

/**
 * @param {Schedule_Filter} a
 * @param {Schedule_Filter} b
 */
function filter_eq(a, b) {
    return a.by === b.by && a.value === b.value;
}

/**
 * @param {string} pathname
 * @returns {Schedule_Filter|null}
 */
function schedule_filter_from_pathname(pathname) {
    const parts = pathname.split("/");
    if (parts.length < 2) return null;
    while (parts[0] === "") { parts.shift(); }
    const [by, value_str] = parts;
    if (by !== "group" && by !== "teacher") return null;
    const value = decodeURIComponent(value_str);
    return { by, value };
}

/**
 * @param {Schedule_Filter} filter
 * @returns {string}
 */
function schedule_filter_to_pathname(filter) {
    return `/${filter.by}/${encodeURIComponent(filter.value)}`;
}


// ======================
// ======== UI ==========
// ======================


/**
 * @template {keyof HTMLElementTagNameMap} K
 * @param {K} type
 * @param {Partial<Omit<HTMLElementTagNameMap[K], "style">> & { class?: string, style?: string }} options
 * @param {(Node|string|boolean)[]} children
 * @returns {HTMLElementTagNameMap[K]}
 */
function el(type, options, ...children) {
    const el = document.createElement(type)
    if (options.class) el.className = options.class;
    Object.assign(el, options);
    el.append(...children.filter(el => el instanceof Node || typeof el === "string"));
    return el
}

/**
 * @template {HTMLElement|{el: HTMLElement}} T
 * @param {T} old
 * @param {T} next
 * @returns {T}
 */
function replace(old, next) {
    if (typeof old === "object" && "el" in old
        && typeof next === "object" && "el" in next) {
        old.el.replaceWith(next.el);
    } else if (old instanceof HTMLElement && next instanceof HTMLElement) {
        old.replaceWith(next);
    }

    return next;
}

/**
 * @param {string} str
 * @param {number} size
 * @param {string|undefined} color
 * @returns {HTMLDivElement}
 */
function Icon(str, size = 14, color = undefined) {
    const container = el("div", {
        class: "icon",
        style: `width: ${size}px; height: ${size}px`
    });
    let svg = str.trim()
        .replace(`width="24"`, `width="100%"`)
        .replace(`height="24"`, `height="100%"`);

    if (color) {
        svg = svg.replace(`fill="none"`, `fill="${color}"`)
            .replace(`stroke="currentColor"`, `stroke="${color}"`)
    }
    container.innerHTML = svg
    return container;
}

/**
 * @param {Time_Of_Day} time_of_day
 */
function TimeOfDay(time_of_day) {
    /**
     * @param {number} n
     * @returns {string}
     */
    const pad = (n) => n < 10 ? `0${n}` : `${n}`

    return el("span", {},
        el("span", { class: "time-hour" }, pad(time_of_day.hour)),
        el("span", { class: "time-sep" }, ":"),
        el("span", { class: "time-minute" }, pad(time_of_day.minute)),
    )
}

/**
 * @param {Time_Slot} time_slot
 */
function TimeSlot(time_slot) {
    return el("span", { class: "time-slot" },
        el("span", { class: "start" }, TimeOfDay(time_slot.start)),
        el("span", { class: "sep" }, "-"),
        el("span", { class: "end" }, TimeOfDay(time_slot.end)),
    )
}

/**
 * @param {Lesson} lesson
 * @returns {HTMLElement}
 */
function LessonCard(lesson) {
    /** @type {HTMLElement} */
    let lesson_type_icon;
    let lesson_type_class = "unknown"

    // TODO: make this less string-dpeendant
    if (lesson.type === "практ.") {
        lesson_type_icon = Icon(ICONS.practice, 14);
        lesson_type_class = "practice"
    } else if (lesson.type === "лек.") {
        lesson_type_icon = Icon(ICONS.lecture, 14);
        lesson_type_class = "lecture";
    } else if (lesson.type === "лаб. раб.") {
        lesson_type_icon = Icon(ICONS.lab, 14);
        lesson_type_class = "lab";
    } else {
        lesson_type_icon = Icon(ICONS.unknown, 14);
        lesson_type_class = "unkonwn";
    }

    /**
     * @param {HTMLElement} icon
     * @param {any} options
     * @param  {...HTMLElement} children
     * @returns 
     */
    function with_icon(icon, options, ...children) {
        options.class = `with-icon ${options.class}`
        return el("div", options,
            icon,
            el("div", {}, ...children)
        );
    };

    return el("div", { class: "lesson" },
        el("span", { class: "flex-row gap-1" },
            el("span", { class: "muted", style: "min-width: 14px; display: flex; justify-content: end;" },
                (lesson.time_slot_index + 1).toString()
            ),
            el("span", {},
                lesson.subject,
                lesson.description ? el("span", { class: "muted" },
                    `  (${lesson.description})`
                ) : ""
            ),

        ),
        el("div", { class: "flex-row gap-4" },
            with_icon(
                Icon(ICONS.time_slot, 14), {},
                TimeSlot(lesson.time_slot)
            ),

            with_icon(
                lesson_type_icon, { class: `type ${lesson_type_class}` },
                el("span", {}, lesson.type),
            ),
        ),
        el("div", { class: "flex-row gap-4" },
            with_icon(
                Icon(ICONS.room, 14), {},
                el("span", {}, lesson.room_short || lesson.room),
            ),

            with_icon(
                Icon(ICONS.teacher, 14), {},
                el("span", { title: lesson.teacher_full }, !!lesson.teacher_short && lesson.teacher_short.length > 0 ? lesson.teacher_short : lesson.teacher_full)
            ),
        ),

        lesson.groups.length > 0 &&
        el("div", { class: "flex-row gap-1" },
            el("div", { style: "padding-top: 0.25em;" }, Icon(ICONS.group, 14)),
            el("div", { class: "flex-col gap-2" },
                ...lesson.groups.map(group => el("span", {}, group))
            ),
        ),
    );
}

/**
 * @param {Date} date
 * @param {boolean} has_lessons
 * @param {Date} now
 * @returns {HTMLElement}
 */
function DayHeader(date, has_lessons, now) {
    let weekday = new Intl.DateTimeFormat("ru-RU", {
        weekday: "long",
    }).format(date);
    weekday = weekday[0].toUpperCase() + weekday.slice(1)

    let date_str = new Intl.DateTimeFormat("ru-RU", {
        day: "numeric",
        month: "long",
    }).format(date);
    date_str = `, ${date_str}`

    const is_today = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();

    const header_class = is_today ? "header today" : "header"


    if (!has_lessons) {
        return el("div", { class: header_class },
            el("span", { class: "week-day muted" }, weekday),
            el("span", { class: "muted" }, date_str),
            el("span", { class: "muted" }, " - пар нет")
        )
    } else {
        return el("div", { class: header_class },
            el("span", { class: "week-day" }, weekday),
            el("span", { class: "muted" }, date_str),
        )
    }
}

/**
 * @param {Day} day
 * @param {Date} now
 * @returns {HTMLElement}
 */
function DayCard(day, now) {
    const header = DayHeader(day.date, day.lessons.length > 0, now)
    const lesson_cards = day.lessons.map(l => LessonCard(l))
    return el("div", { class: "day" },
        header,
        ...lesson_cards
    )
}

/**
 * @param {Day[]} days
 * @param {Date} now
 * @returns {HTMLElement}
 */
function Schedule(days, now) {
    if (days.map(el => el.lessons.length).reduce((a, b) => a + b, 0) === 0) {
        return el("div", { class: "schedule" },
            el("div", { class: "empty" }, "Нет данных")
        )
    }
    const day_cards = days.map(el => DayCard(el, now))
    return el("div", { class: "schedule" }, ...day_cards)
}

/**
 * @typedef App_State
 * @type {object}
 * @property {Date} now
 * @property {Schedule_Full} schedule
 * @property {Schedule_Weeks} weeks
 * @property {Schedule_Filter} filter
 * @property {boolean} show_next
 * @property {Record<Schedule_Filter_By, string[]>} search_arrays used to speed up and make search less annoying
 *
 * @property {Schedule_Filter[]} bookmarks
 *
 * @property {Cache_Entry|null} cache_entry
 * @property {"downloading" | "cached" | "failed" } update_state
*/

/**
 * @param {App_State} app_state
 * @param {Schedule_Filter} filter
 */
function apply_filter(app_state, filter) {
    app_state.filter = filter;
    app_state.weeks = resolve_schedule_weeks(app_state.schedule, app_state.filter);
    history_push_state(app_state.filter);
    app_state.now = new Date();
}


const BOOKMARK_KEY = "bookmarks";

/**
 * @param {Schedule_Filter[]} bookmarks
 * @param {Schedule_Filter} filter
 */
function bookmarks_toggle(bookmarks, filter) {
    const index = bookmarks.findIndex(b => filter_eq(b, filter));
    if (index === -1) {
        bookmarks.push(filter);
    } else {
        bookmarks.splice(index, 1);
    }
    storage_save(BOOKMARK_KEY, bookmarks);
}

/**
 * @param {Schedule_Filter[]} bookmarks
 * @param {Schedule_Filter} filter
 */
function bookmarks_remove(bookmarks, filter) {
    const item = bookmarks.findIndex(b => filter_eq(b, filter))
    if (item === -1) return;
    bookmarks.splice(item, 1);
    storage_save(BOOKMARK_KEY, bookmarks);
}


/**
 * @param {boolean} show_next
 * @param {(show_next: boolean) => void} onselect
 * @returns {HTMLElement}
 */
function SelectorButtons(show_next, onselect) {
    return el("div", { class: "week-selector" },
        el("button", {
            class: !show_next ? "selected" : "",
            onclick: () => {
                onselect(false);
            }
        }, "Эта неделя"),
        el("button", {
            class: show_next ? "selected" : "",
            onclick: () => {
                onselect(true);
            }
        }, "Следующая неделя"),
    )
}



/**
 * @param {Schedule_Full} schedule
 * @returns 
 */
function resolve_search_arrays(schedule) {
    /** @type {Record<Schedule_Filter_By, string[]>} */
    const search_arrays = {
        group: [],
        teacher: [],
    }

    for (const group of schedule.groups || []) {
        search_arrays.group.push(group.toLowerCase().replace(/-/g, ""));
    }

    for (const teacher of schedule.teachers || []) {
        search_arrays.teacher.push(teacher.toLowerCase().replace(/ /g, "").replace(/\./g, ""));
    }

    return search_arrays;
}

/**
 * @param {App_State} app_state
 * @param {() => void} app_rerender
 */
function SearchBar(app_state, app_rerender) {
    /** @param {InputEvent|FocusEvent} e  */
    const handle_search_input = (e) => {
        /** @type {HTMLInputElement} */
        //@ts-ignore
        const target = e.target;

        const search = target.value.toLowerCase().replace(/-/g, "");
        results_el.innerHTML = "";

        if (search.length < 1) {
            results_el.classList.add("hidden");
            return;
        }
        let matches = 0;
        const search_array = app_state.search_arrays[app_state.filter.by];
        for (let i = 0; i < search_array.length; i++) {
            const search_element = search_array[i];
            if (search_element.includes(search)) {
                if (!app_state.schedule) return;

                /** @type {string} */
                let value;
                if (app_state.filter.by === "group") {
                    value = app_state.schedule.groups[i];
                } else if (app_state.filter.by === "teacher") {
                    value = app_state.schedule.teachers[i];
                } else {
                    throw new Error(`Unknown search by ${app_state.filter.by}`);
                }
                const result_el = el("button", { class: "result", onkeydown: handle_search_key }, value);

                result_el.onmouseenter = () => {
                    result_el.focus();
                }

                result_el.onclick = () => {
                    // this does not clear the search results,
                    // but I kinda like that behavior
                    result_el.blur();
                    set_filter({ by: app_state.filter.by, value });
                    app_rerender();
                }

                results_el.append(result_el);
                matches++;
            }
        }
        if (matches === 0) {
            results_el.classList.add("hidden");
        } else {
            results_el.classList.remove("hidden");
        }
    }

    /** @param {KeyboardEvent} e  */
    const handle_search_key = (e) => {
        if (!(e.target instanceof HTMLElement)) return;

        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
            e.preventDefault();
            const children = results_el.children;

            if (children.length === 0) return;
            const focused = results_el.querySelector(":focus");

            /** @type {HTMLElement} */
            let element = search_el;
            if (focused && focused instanceof HTMLElement) {
                const next = e.key === "ArrowDown" ? focused.nextElementSibling : focused.previousElementSibling;
                if (next && next instanceof HTMLElement) {
                    element = next;
                }
            } else if (children.length > 0 && children[0] instanceof HTMLElement) {
                element = children[0];
            }

            element.focus();

            return;
        }

        const target = e.target;

        if (e.key === "Enter") {
            e.preventDefault();
            /** @type {HTMLElement|null} */
            const focused = results_el.querySelector(":focus");
            if (focused) {
                focused.click();
            } else {
                const first = results_el.children[0];
                if (!first || !(first instanceof HTMLElement)) return;
                first.click();
            }

            input_el.blur();

            return;
        }

        if (target.tagName !== "INPUT") {
            input_el.focus();
        }
    }

    /** @type {Record<Schedule_Filter["by"], HTMLElement>} */
    const filter_types = {
        group: el("button", { class: "type", onclick: () => set_filter({ by: "teacher", value: "" }) },
            Icon(ICONS.group, 14),
            el("span", {}, "Группа")
        ),
        teacher: el("button", { class: "type", onclick: () => set_filter({ by: "group", value: "" }) },
            Icon(ICONS.teacher, 14),
            el("span", {}, "Препод")
        )
    }

    /** @param {Schedule_Filter} filter */
    function set_filter(filter) {
        input_el.value = app_state.filter.value;
        apply_filter(app_state, filter);
        app_rerender();
    }

    const input_el = el("input", { type: "text", placeholder: " ", oninput: handle_search_input, onfocus: handle_search_input, onkeydown: handle_search_key });

    input_el.value = app_state.filter.value;

    const results_el = el("div", { class: "results" });
    let filter_el = filter_types[app_state.filter?.by || "group"];

    let star_icon = Icon(ICONS.star, 18);
    if (app_state.bookmarks.find(f => filter_eq(f, app_state.filter))) {
        star_icon = Icon(ICONS.star, 18, "yellow");
    }


    const search_el = el("div", { class: "search" },
        el("div", {
            class: "textbox",
            onclick: (e) => {
                if (e.target instanceof HTMLButtonElement) {
                    return;
                }
                input_el.focus()
            }
        },
            Icon(ICONS.search, 18),
            input_el,

            el("button", {
                class: "save",
                onclick: () => {
                    bookmarks_toggle(app_state.bookmarks, app_state.filter);
                    app_rerender();
                }
            },
                star_icon
            ),
            filter_el,
        ),

        results_el
    );

    if (app_state.filter) {
        input_el.value = app_state.filter.value;
    }

    return search_el;
}

/**
 * @typedef Schedule_Weeks
 * @type {object}
 * @property {Day[]} even
 * @property {Day[]} odd
 */

/**
 * 
 * @param {Schedule_Full} schedule
 * @param {Schedule_Filter} filter
 * @param {Date} now
 * @returns {Schedule_Weeks}
 */
function resolve_schedule_weeks(schedule, filter, now = new Date()) {
    /** @type Record<string, string> */
    const short_teachers = {};
    /**
     * @param {string|undefined} input
     * @returns {string|null}
     */
    function shorten_teacher(input) {
        if (input === undefined) return null;
        if (input.length === 0) return null;
        const parts = input.split(" ")
        if (parts.length !== 3) return null;
        const [surname, name, grandname] = parts;
        if (surname.length === 0 || name.length === 0 || grandname.length === 0) {
            return null;
        }
        if (surname.includes(".") || name.includes(".") || grandname.includes(".")) {
            return null;
        }
        return `${surname} ${name[0]}. ${grandname[0]}.`
    }

    /** @type Record<string, string> */
    const short_rooms = {};
    /**
     * TODO: maybe store rooms as an object
     * with parsed fields like campus, remote, etc
     * this way I will be able to show different icons
     * for this more reliably for example
     * @param {string|undefined} input
     * @returns {string|null}
     */
    function shorten_room(input) {
        if (input === undefined) return null;
        if (input.length === 0) return null;
        const common_regex = /\d\d\d\d \(Уч\. корп\. .\d/;
        if (common_regex.test(input)) {
            return input.slice(0, 4);
        }

        const less_common_regex = /\d\d\d\d-\d \(Уч\. корп\. .\d/;
        if (less_common_regex.test(input)) {
            return input.slice(0, 6);
        }

        if (input === "Дистанционный формат") {
            return "Дистант";
        }

        return null;
    }

    now.setHours(0, 0, 0, 0);
    let this_week_no = week_number(now);
    const this_week_even = this_week_no % 2 === 0;
    const even_monday = new Date(now.getTime());
    even_monday.setHours(0, 0, 0, 0);

    // for WTF is a kilometer reasons .getDay returns 0 for sunday.
    // this means that monday is 1, so I need to subtract 1 from the result
    // but a negative number is not a valid day of the week, so I need to
    // add 7 to the result, then modulo 7 it to get the correct day of the week
    let actual_day_of_the_week = (even_monday.getDay() - 1 + 7) % 7;
    let even_monday_offset = -actual_day_of_the_week;
    if (!this_week_even) {
        even_monday_offset -= 7;
    }
    even_monday.setDate(even_monday.getDate() + even_monday_offset);

    /** @type {Schedule_Weeks} */
    const weeks = {
        even: [],
        odd: [],
    }

    for (let i = 0; i < 6; i++) {
        const date = new Date(even_monday);
        if (this_week_even) {
            date.setDate(date.getDate() + i);
        } else {
            date.setDate(date.getDate() + i + 14);
        }
        weeks.even.push({
            date,
            lessons: [],
        })
    }

    for (let i = 0; i < 6; i++) {
        const date = new Date(even_monday);
        date.setDate(date.getDate() + i + 7);
        weeks.odd.push({
            date,
            lessons: [],
        })
    }

    let search_id = -1;
    if (filter.by === "group") {
        search_id = schedule.groups.findIndex(el => el === filter.value);
        if (search_id === -1) {
            console.error(`Failed to find group ${filter.value}`)
            return weeks;
        }
    } else if (filter.by === "teacher") {
        search_id = schedule.teachers.findIndex(el => el === filter.value);
        if (search_id === -1) {
            console.error(`Failed to find teacher ${filter.value}`)
            return weeks;
        }
    }

    if (search_id === -1) {
        console.error(`Failed to find search id for ${filter.by} ${filter.value}`)
        return weeks;
    }

    for (const compressed_lesson of schedule.lessons_compressed) {
        if (filter.by === "group") {
            if (compressed_lesson.group_id !== search_id) {
                continue;
            }
        } else if (filter.by === "teacher") {
            if (compressed_lesson.teacher_id !== search_id) {
                continue;
            }
        }

        /** @type {string|null} */
        let room_short;
        room_short = short_rooms[compressed_lesson.room_id];
        if (!room_short) {
            room_short = shorten_room(schedule.rooms[compressed_lesson.room_id]);
            if (room_short) {
                short_rooms[compressed_lesson.room_id] = room_short;
            }
        }

        /** @type {string|null} */
        let teacher_short;
        teacher_short = short_teachers[compressed_lesson.teacher_id];
        if (!teacher_short) {
            teacher_short = shorten_teacher(schedule.teachers[compressed_lesson.teacher_id]);
            if (teacher_short) {
                short_teachers[compressed_lesson.teacher_id] = teacher_short;
            }
        }

        const date = new Date(even_monday);
        date.setDate(date.getDate() + compressed_lesson.day);
        if (week_number(date) % 2 === 0 && !this_week_even) {
            date.setDate(date.getDate() + 14);
        }

        /** @type {Lesson} */
        const lesson = {
            groups: [],
            time_slot: schedule.time_slots[compressed_lesson.time_slot_id],
            time_slot_index: compressed_lesson.time_slot_id,
            subject: schedule.subjects[compressed_lesson.subject_id],
            teacher_full: schedule.teachers[compressed_lesson.teacher_id],
            teacher_short,
            date,
            room: schedule.rooms[compressed_lesson.room_id],
            room_short,
            type: schedule.types[compressed_lesson.type_id],
            description: compressed_lesson.description,
        }

        if (filter.by !== "group") {
            lesson.groups = [schedule.groups[compressed_lesson.group_id]];
        }

        const week = week_number(date) % 2 === 0 ? weeks.even : weeks.odd;
        for (const day of week) {
            if (day.date.getTime() === date.getTime()) {
                day.lessons.push(lesson);
                break;
            }
        }
    }

    /** @param {Day[]} week */
    function sort_week(week) {
        week.forEach(day => day.lessons.sort((a, b) => {
            return a.time_slot_index - b.time_slot_index;
        }))
        week.sort((a, b) => {
            return a.date.getTime() - b.date.getTime();
        })
    }
    sort_week(weeks.odd);
    sort_week(weeks.even);

    /** @param {Day[]} week */
    function merge_teacher_lessons(week) {
        for (const day of week) {
            const new_lessons = [];
            for (const lesson of day.lessons) {
                if (new_lessons.length === 0) {
                    new_lessons.push(lesson);
                    continue;
                }

                const same_lesson = new_lessons.find(el => {
                    return el.time_slot_index === lesson.time_slot_index
                        && el.room === lesson.room
                })

                if (!same_lesson) {
                    new_lessons.push(lesson);
                    continue;
                }

                same_lesson.groups.push(...lesson.groups);
            }
            day.lessons = new_lessons;
        }
    }

    if (filter.by === "teacher") {
        merge_teacher_lessons(weeks.odd);
        merge_teacher_lessons(weeks.even);
    }

    return weeks;
}

/**
 * @param {Schedule_Filter} filter
 * @param {App_State} app_state
 * @param {() => void} rerender
 */
function Bookmark(filter, app_state, rerender) {
    /** @type {ReturnType<typeof Icon>} */
    let icon;
    if (filter.by === "group") {
        icon = Icon(ICONS.group, 18);
    } else if (filter.by === "teacher") {
        icon = Icon(ICONS.teacher, 18);
    } else {
        icon = Icon(ICONS.unknown, 18)
    }

    const star = Icon(ICONS.star, 18, "yellow");

    return el("div", {
        class: "item",
    },
        el("button", {
            class: "name",
            onclick: () => {
                apply_filter(app_state, filter);
                rerender();
            }
        },
            icon,
            el("span", {}, filter.value),
        ),
        el("button", {
            class: "remove", onclick: () => {
                bookmarks_remove(app_state.bookmarks, filter);
                rerender();
            }
        },
            star,
        ),
    )
}

/** 
 * @param {App_State} app_state
 * @param {() => void} rerender
 */
function BookmarksList(app_state, rerender) {
    if (app_state.bookmarks.length === 0) {
        return el("div", { class: "hidden" });
    }
    return el("div", { class: "saved" },
        ...app_state.bookmarks.map(s => Bookmark(s, app_state, rerender))
    );
}

/**
 * @param {Date} past
 * @param {Date} now
 */
function time_diff_text(past, now) {
    const diff = now.getTime() - past.getTime();

    /** @type number */
    let diff_value;
    /** @type Intl.RelativeTimeFormatUnit */
    let diff_unit;

    if (diff < 1000 * 60) {
        diff_value = Math.round(diff / 1000);
        diff_unit = "seconds";
    } else if (diff < 1000 * 60 * 60) {
        diff_value = Math.round(diff / 1000 / 60);
        diff_unit = "minutes";
    } else if (diff < 1000 * 60 * 60 * 24) {
        diff_value = Math.round(diff / 1000 / 60 / 60);
        diff_unit = "hours";
    } else if (diff < 1000 * 60 * 60 * 24 * 7) {
        diff_value = Math.round(diff / 1000 / 60 / 60 / 24);
        diff_unit = "days";
    } else {
        diff_value = Math.round(diff / 1000 / 60 / 60 / 24 / 7);
        diff_unit = "weeks";
    }

    const relative_formatter = new Intl.RelativeTimeFormat("ru", { style: "long" });
    const ago = relative_formatter.format(-diff_value, diff_unit);

    return ago;
}



/**
 * @param {App_State} app_state
 */
function Updater(app_state) {
    const { update_state, now } = app_state;

    const visual_cache_update = async () => {
        app_state.update_state = "downloading";
        self = replace(self, Updater(app_state));

        let groups = await get_groups_raw();
        if (!groups.ok) {
            app_state.update_state = "failed";
            self = replace(self, Updater(app_state));
            console.error("Failed to get groups");
            return;
        }

        const all_schedules_result = await get_all_groups_schedule_raw(groups.data, (count) => {
            const percent = Math.round(count / groups.data.length * 100);
            self.progress_el.style.width = `${percent}%`;
        });

        if (!all_schedules_result.ok) {
            app_state.update_state = "failed";
            self = replace(self, Updater(app_state));
            return;
        }

        app_state.schedule = parse_full_schedule(all_schedules_result.data);
        app_state.weeks = resolve_schedule_weeks(app_state.schedule, app_state.filter);
        app_state.search_arrays = resolve_search_arrays(app_state.schedule);
        app_state.now = new Date();
        const entry = cache_save_schedule(app_state.schedule);
        if (app_state.cache_entry) {
            localStorage.removeItem(cache_entry_to_string(app_state.cache_entry));
        }
        app_state.cache_entry = entry;

        app_state.update_state = "cached";
        self = replace(self, Updater(app_state));
    }

    let time_diff;
    if (app_state.cache_entry?.date) {
        time_diff = time_diff_text(app_state.cache_entry.date, now);
    }
    const progress_el = el("div", { class: "progress", style: "width: 0%;" });

    let text;
    if (update_state === "downloading") {
        text = "Загрузка расписания...";
    } else if (update_state === "cached") {
        text = "Расписание загружено";
        if (time_diff) {
            text += ` ${time_diff}`;
        }
    } else if (update_state === "failed") {
        text = "Ошибка загрузки";
    } else {
        text = "Неизвестное состояние";
    }

    const self_el = el("div", { class: `updater ${update_state}` },
        progress_el,
        el("span", {}, text),
        update_state !== "downloading" && el("button", { onclick: visual_cache_update }, "Обновить"),
    );

    let self = {
        el: self_el,
        progress_el,
        update: visual_cache_update,
    }

    return self;
}

/**
 * @param {App_State} state
 */
function App(state) {
    /** @type {Day[]} */
    let current_week;
    /** @type {Day[]} */
    let next_week;

    if (week_number(state.now) % 2 === 0) {
        current_week = state.weeks.even;
        next_week = state.weeks.odd;
    } else {
        current_week = state.weeks.even;
        next_week = state.weeks.odd;
    }

    const current_week_el = Schedule(current_week, state.now);
    const next_week_el = Schedule(next_week, state.now);

    let selected_week_el = state.show_next ? next_week_el : current_week_el;

    /** @type {(show_next: boolean) => void} */
    const handle_week_select = (updated_show_next) => {
        state.show_next = updated_show_next;
        const new_week_el = state.show_next ? next_week_el : current_week_el;
        selected_week_el = replace(selected_week_el, new_week_el);

        const new_buttons_el = SelectorButtons(state.show_next, handle_week_select)
        buttons_el = replace(buttons_el, new_buttons_el);
    }

    let buttons_el = SelectorButtons(state.show_next, handle_week_select);

    const rerender = () => {
        self = replace(self, App(state));
    }

    let self = el("div", { class: "flex-col gap-4", style: "width: 100%;" },
        SearchBar(state, rerender),
        BookmarksList(state, rerender),
        selected_week_el,
        buttons_el,
    );

    return self;
}


async function main() {
    const content = document.querySelector("#content");
    if (!content) {
        const body = document.querySelector("body");
        if (!body) return;
        body.innerHTML = "Failed to find content element. The princess is in another castle, mate";
        return;
    }

    /** @type {App_State} */
    let app_state = {
        schedule: {
            lessons_compressed: [],
            subjects: [],
            teachers: [],
            rooms: [],
            types: [],
            groups: [],
            time_slots: [],
        },
        filter: { by: "group", value: "" },
        show_next: false,
        weeks: {
            even: [],
            odd: [],
        },
        search_arrays: {
            group: [],
            teacher: [],
        },
        bookmarks: [],
        cache_entry: null,
        update_state: "downloading",
        now: new Date(),
    };

    app_state.filter = schedule_filter_from_pathname(window.location.pathname) ?? { by: "group", value: "" };
    app_state.bookmarks = storage_load(BOOKMARK_KEY) ?? [];

    let updater = Updater(app_state);
    content.append(updater.el);

    let app_el = App(app_state);
    content.append(app_el);


    let cache = cache_load_schedule();
    let should_update = true;

    if (cache) {
        app_state.schedule = cache.schedule;
        app_state.cache_entry = cache.entry;
        app_state.update_state = "cached";

        app_state.search_arrays = resolve_search_arrays(cache.schedule);
        app_state.weeks = resolve_schedule_weeks(cache.schedule, app_state.filter);

        app_el = replace(app_el, App(app_state));
        updater = replace(updater, Updater(app_state));

        const now = new Date();
        const time_since_update = now.getTime() - cache.entry.date.getTime();
        should_update = time_since_update > SCHEDULE_CACHE_TIMEOUT;
    }

    if (should_update) {
        await updater.update();
        app_el = replace(app_el, App(app_state));
    }

    window.addEventListener("popstate", (event) => {
        if (!event.state) return;
        /** @type {History_State} */
        const history_state = event.state;
        if (!history_state.filter) {
            console.error("No filter in history found");
            return;
        }
        app_state.filter = history_state.filter;
        app_state.weeks = resolve_schedule_weeks(app_state.schedule, app_state.filter);
        app_state.now = new Date();
        app_el = replace(app_el, App(app_state));
    });
}


document.onreadystatechange = () => {
    if (document.readyState === "complete") {
        main()
    }
}
