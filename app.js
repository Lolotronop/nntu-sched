const BASE_PATH = "https://my-api.nntu.ru"
const SCHEDULE_PATH = "/lesson-schedule/public/group-schedule"
const GROUPS_PATH = "/lesson-schedule/public/groups"
const GROUP_PARAMETER = "groupName"

/**
 * @template T
 * @typedef Result<T>
 * @type {object}
 * @property {T} data
 * @property {any} err
 * @property {bool} ok
 */


/**
 * @param {string} uri 
 * @returns {Promise<Result<unknown>>}
 */
async function fetch_json(uri) {
    const req = await fetch(uri)
    if (!req.ok) return { ok: false }
    let data;
    try {
        data = await req.json()
    } catch (e) {
        return { ok: false }
    }
    return { ok: true, data }
}

/**
 * @typedef Schedule_Response
 * @type {object}
 * @property {string[]} times
 * @property {Schedule_Week_Response[]} currentWeek
 * @property {Schedule_Week_Response[]} nextWeek
 */

/**
 * @typedef Schedule_Week_Response
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
 * @returns {Promise<Result<Schedule_Response>>}
 */
async function get_schedule_raw(group) {
    const group_param = encodeURIComponent(group)
    // https://lks-api.nntu.ru/lesson-schedule/schedule/lks?date=2026-09-03T00:00:00.000Z
    return await fetch_json(`${BASE_PATH}${SCHEDULE_PATH}?${GROUP_PARAMETER}=${group_param}&date=2026-09-13T00:00:00.000Z`)
}

/**
 * @typedef Groups_Response
 * @type {string[]}
*/


/**
 * @param {string} group
 * @returns {Promise<Result<Groups_Response>>}
 */
async function get_groups_raw() {
    return await fetch_json(`${BASE_PATH}${GROUPS_PATH}`)
}


/**
 * @typedef Lesson
 * @type {object}
 *
 * @property {string} subject
 * @property {string} teacher
 * @property {string} room
 * @property {string} type lecture/practice/lab/etc
 * @property {string} description
 * @property {string} group_name
 * @property {Time_Slot} time_slot
*/

/**
 * @typedef Time_Slot
 * @type {object}
 *
 * @property {number} start_minute
 * @property {number} end_minute
*/

/**
 * @param {string} slots expected to have only the actual times here
 * @returns {Result<Time_Slot>}
 */
function parse_time_slot(slots) {
    /**
     * @param {string} str
     * @returns {Result<number>}
     */
    const parse_hhmm_string_to_minutes = (str) => {
        const parts = str.split(":");
        if (parts.length != 2) return { ok: false };

        const hours = +(parts[0])
        const minutes = +(parts[1])

        /**
         * @param {number} time
         * @returns {boolean}
         */
        const is_valid_time = (time) => time >= 0 && time <= 60
        if (!is_valid_time(hours) || !is_valid_time(minutes)) {
            return { ok: false }
        }

        return { data: hours * 60 + minutes, ok: true }
    }

    const parts = slots.split("—")
    if (parts.length != 2) return { ok: false };

    const { data: start_minute, ok: start_ok } = parse_hhmm_string_to_minutes(parts[0])
    const { data: end_minute, ok: end_ok } = parse_hhmm_string_to_minutes(parts[1])

    if (!start_ok || !end_ok) return { ok: false }

    return {
        ok: true,
        data: {
            start_minute,
            end_minute,
        },
    }
}


/**
 * @param {string} type
 * @param {object} options
 * @param {HTMLElement[]} children
 * @returns HTMLElement
 */
function el(type, options, ...children) {
    const el = document.createElement(type)
    for (let [key, value] of Object.entries(options)) {
        if (key.startsWith("on")) {
            el.addEventListener(key, value)
        } else {
            el.setAttribute(key, value)
        }
    }
    el.append(...children)
    return el
}


const playground = async () => {
    const group = "М26-ИСТ-3"
    const schedule_raw = await get_schedule_raw(group)

    if (!schedule_raw.ok) {
        console.error("get_schedule_raw failed")
    }

    const time_slots_raw = schedule_raw.data.times
    // remove the first "title" element
    time_slots_raw.shift()
    console.assert(time_slots_raw.length === 7)

    const time_slots_results = time_slots_raw
        .map(parse_time_slot)

    const time_slots = time_slots_results
        .filter(el => el.ok)
        .map(el => el.data)

    if (time_slots_raw.length != time_slots_raw) {
        console.error("Not all time_slots were succesfully parsed", time_slots_results)
    }

    const groups = await get_groups_raw()
    console.log("groups", groups.data)

    const lesson = schedule_raw.data.currentWeek[2].lessonElements[2]

    console.log("lesson", lesson)


    const content = document.querySelector("#content")


    for (const { dayOfTheWeek, lessonElements } of schedule_raw.data.currentWeek) {
        const header = el("h1", { style: "height: 100px;" }, dayOfTheWeek)
        content.appendChild(header)
        for (const lesson of lessonElements) {
            const thing = el("div", { class: "lesson" },
                el("h1", {}, lesson.subject),
                el("h2", {}, lesson.teacher),
                el("p", {}, time_slots[lesson.timeIndex]),
                el("p", {}, lesson.studyType),
                el("p", {}, lesson.room),
            );
            content.appendChild(thing)
        }
    }

}

playground()
