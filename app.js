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
    unknown: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-badge-question-mark"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>`
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
 * @property {string} group
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


// ======================
// ======== UI ==========
// ======================


/**
 * @template {keyof HTMLElementTagNameMap} K
 * @param {K} type
 * @param {Partial<Omit<HTMLElementTagNameMap[K], "style">> & { class?: string, style?: string }} options
 * @param {(Node|string)[]} children
 * @returns {HTMLElementTagNameMap[K]}
 */
function el(type, options, ...children) {
    const el = document.createElement(type)
    if (options.class) el.className = options.class;
    Object.assign(el, options);
    el.append(...children)
    return el
}

/**
 * @template {HTMLElement} T
 * @param {T} old_el
 * @param {T} new_el
 * @returns {T}
 */
function replace(old_el, new_el) {
    old_el.replaceWith(new_el);
    return new_el;
}

/**
 * @param {string} str
 * @param {number} size
 * @returns {HTMLDivElement}
 */
function Icon(str, size) {
    const container = el("div", {
        class: "icon",
        style: `width: ${size}px; height: ${size}px`
    });
    container.innerHTML = str.trim()
        .replace(`width="24"`, `width="100%"`)
        .replace(`height="24"`, `height="100%"`);
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
    );
}

/**
 * @param {Date} date
 * @param {boolean} has_lessons
 * @returns {HTMLElement}
 */
function DayHeader(date, has_lessons) {
    let weekday = new Intl.DateTimeFormat("ru-RU", {
        weekday: "long",
    }).format(date);
    weekday = weekday[0].toUpperCase() + weekday.slice(1)

    let date_str = new Intl.DateTimeFormat("ru-RU", {
        day: "numeric",
        month: "long",
    }).format(date);
    date_str = `, ${date_str}`

    const now = new Date();
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
 * @returns {HTMLElement}
 */
function DayCard(day) {
    const header = DayHeader(day.date, day.lessons.length > 0)
    const lesson_cards = day.lessons.map(l => LessonCard(l))
    return el("div", { class: "day" },
        header,
        ...lesson_cards
    )
}

/**
 * @param {Day[]} days
 * @returns {HTMLElement}
 */
function Schedule(days) {
    const day_cards = days.map(el => DayCard(el))
    return el("div", { class: "schedule" }, ...day_cards)
}

/**
 * @typedef Schedule_Filter
 * @type {object}
 * @property {"group"} by
 * @property {string} value
 */

/**
 * @param {string} pathname
 * @returns {Schedule_Filter|null}
 */
function schedule_filter_from_pathname(pathname) {
    const parts = pathname.split("/");
    if (parts.length < 2) return null;
    while (parts[0] === "") { parts.shift(); }
    const [by, value_str] = parts;
    if (by !== "group") return null;
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

/**
 * @typedef App_State
 * @type {object}
 * @property {Schedule_Full|null} schedule
 * @property {Schedule_Filter|null} filter
 * @property {boolean} show_next
*/


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
 * @param {App_State} app_state 
 * @param {(filter: Schedule_Filter) => void} onselect
 */
function SearchBar(app_state, onselect) {
    /** @type {string[]} */
    const search_groups = [];
    for (const group of app_state.schedule?.groups || []) {
        search_groups.push(group.toLowerCase().replace(/-/g, ""));
    }

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
        for (let i = 0; i < search_groups.length; i++) {
            const group_search = search_groups[i];
            if (group_search.includes(search)) {
                if (!app_state.schedule) return;
                const group = app_state.schedule.groups[i];
                const group_el = el("button", { class: "result", onkeydown: handle_search_key }, group);

                group_el.onmouseenter = () => {
                    group_el.focus();
                }

                group_el.onclick = () => {
                    // this does not clear the search results,
                    // but I kinda like that behavior
                    input_el.value = group;
                    group_el.blur();

                    onselect({
                        by: "group",
                        value: group,
                    })
                }

                results_el.append(group_el);
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

            return;
        }

        if (target.tagName !== "INPUT") {
            input_el.focus();
        }
    }

    const input_el = el("input", { type: "text", placeholder: " ", oninput: handle_search_input, onfocus: handle_search_input, onkeydown: handle_search_key });
    const results_el = el("div", { class: "results" });
    const search_el = el("div", { class: "search", style: "margin-bottom: 1em;" },
        input_el,
        results_el
    );

    if (app_state.filter) {
        input_el.value = app_state.filter.value;
    }

    return {
        el: search_el,
        input_el,
        results_el,
    }
}

/**
 * @param {App_State} state
 */
function App(state) {
    const group = state.filter?.value;

    const schedule = state.schedule;
    if (!schedule) return el("div", {}, "Failed to load schedule");
    const group_id = schedule.groups.findIndex(el => el === group);
    if (group_id === -1) {
        console.error(`Failed to find group ${group}`)
        return el("div", {}, "Failed to find group");
    }

    /** @type Record<string, string> */
    const short_teachers = {};
    /**
     * @param {string} input
     * @returns {string|null}
     */
    function shorten_teacher(input) {
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
     * @param {string} input
     * @returns {string|null}
     */
    function shorten_room(input) {
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

    const now = new Date();
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

    /** @type {Day[]} */
    const even_week = [];
    for (let i = 0; i < 6; i++) {
        const date = new Date(even_monday);
        if (this_week_even) {
            date.setDate(date.getDate() + i);
        } else {
            date.setDate(date.getDate() + i + 14);
        }
        even_week.push({
            date,
            lessons: [],
        })
    }

    /** @type {Day[]} */
    const odd_week = [];
    for (let i = 0; i < 6; i++) {
        const date = new Date(even_monday);
        date.setDate(date.getDate() + i + 7);
        odd_week.push({
            date,
            lessons: [],
        })
    }

    for (const compressed_lesson of schedule.lessons_compressed) {
        if (compressed_lesson.group_id !== group_id) {
            continue;
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
            group: schedule.groups[compressed_lesson.group_id],
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

        const week = week_number(date) % 2 === 0 ? even_week : odd_week;
        for (const day of week) {
            if (day.date.getTime() === date.getTime()) {
                day.lessons.push(lesson);
                break;
            }
        }
    }

    /** @type {Day[]} */
    let current_week;
    /** @type {Day[]} */
    let next_week;

    if (week_number(now) % 2 === 0) {
        current_week = even_week;
        next_week = odd_week;
    } else {
        current_week = odd_week;
        next_week = even_week;
    }

    const current_week_el = Schedule(current_week)
    const next_week_el = Schedule(next_week)

    let selected_week_el = state.show_next ? next_week_el : current_week_el;

    /** @type {(show_next: boolean) => void} */
    const handle_change = (updated_show_next) => {
        state.show_next = updated_show_next;
        const new_week_el = state.show_next ? next_week_el : current_week_el;
        selected_week_el = replace(selected_week_el, new_week_el);

        const new_buttons_el = SelectorButtons(state.show_next, handle_change)
        buttons_el = replace(buttons_el, new_buttons_el);
    }

    let buttons_el = SelectorButtons(state.show_next, handle_change);

    let self = el("div", { class: "flex-col gap-4", style: "width: 100%;" },
        buttons_el,
        selected_week_el
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
    let app_state = { schedule: null, show_next: false, filter: null };
    let schedule_el = el("div", {});
    content.append(schedule_el);

    app_state.filter = schedule_filter_from_pathname(window.location.pathname);
    if (app_state.filter) {
        history_push_state(app_state.filter);
    }

    if (!app_state.filter) {
        app_state.filter = { by: "group", value: "М26-ИСТ-3" };
        history_push_state(app_state.filter);
    }


    let cache = cache_load_schedule();
    let should_update = true;

    if (cache) {
        app_state.schedule = cache.schedule;
        schedule_el = replace(schedule_el, App(app_state));

        const now = new Date();
        const time_since_update = now.getTime() - cache.entry.date.getTime();
        should_update = time_since_update > SCHEDULE_CACHE_TIMEOUT;
    }

    if (should_update) {
        const loading_bar_inner = el("div", { class: "loading-bar-inner" });
        const loading_bar = el("div", { class: "loading-bar" }, loading_bar_inner);
        loading_bar_inner.style.width = "0%";

        content.prepend(loading_bar);

        let groups = await get_groups_raw();
        if (!groups.ok) {
            console.error("Failed to get groups");
            return;
        }

        const all_schedules_result = await get_all_groups_schedule_raw(groups.data, (count) => {
            const percent = Math.round(count / groups.data.length * 100);
            loading_bar_inner.style.width = `${percent}%`;
        });

        if (!all_schedules_result.ok) {
            console.error("Failed to get all schedules", all_schedules_result.err)
            return;
        }

        app_state.schedule = parse_full_schedule(all_schedules_result.data);
        const entry = cache_save_schedule(app_state.schedule);
        if (cache) {
            localStorage.removeItem(cache_entry_to_string(cache.entry));
        }

        cache = {
            entry,
            schedule: app_state.schedule,
        }

        loading_bar.remove();
    }

    if (!app_state.schedule) {
        console.error("Failed to load schedule");
        return;
    }

    const search = SearchBar(app_state, (filter) => {
        history_push_state(filter);
        app_state.filter = filter;
        schedule_el = replace(schedule_el, App(app_state));
    });

    content.prepend(search.el);

    schedule_el = replace(schedule_el, App(app_state));

    window.addEventListener("popstate", (event) => {
        if (!event.state) return;
        /** @type {History_State} */
        const history_state = event.state;
        if (!history_state.filter) {
            console.error("No filter in history found");
            return;
        }
        app_state.filter = history_state.filter;
        schedule_el = replace(schedule_el, App(app_state));
        search.input_el.value = app_state.filter.value;
    });
}


document.onreadystatechange = () => {
    if (document.readyState === "complete") {
        main()
    }
}
