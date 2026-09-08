import fs from "node:fs/promises";

const BASE_PATH = "https://my-api.nntu.ru"
const SCHEDULE_PATH = "/lesson-schedule/public/group-schedule"
const GROUPS_PATH = "/lesson-schedule/public/groups"
const GROUP_PARAMETER = "groupName"


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
    return { err, ok: false }
}




/**
 * @param {string} uri
 * @returns {Promise<Result<unknown>>}
 */
async function fetch_json(uri) {
    const req = await fetch(uri)
    if (!req.ok) return err("Failed to fetch json")
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
async function get_schedule_raw(group) {
    const group_param = encodeURIComponent(group)
    return await fetch_json(`${BASE_PATH}${SCHEDULE_PATH}?${GROUP_PARAMETER}=${group_param}`)
}

/**
 * @typedef Groups_Response
 * @type {string[]}
*/


/**
 * @returns {Promise<Result<Groups_Response, string>>}
 */
async function get_groups_raw() {
    return await fetch_json(`${BASE_PATH}${GROUPS_PATH}`)
}

async function download_all_groups() {
    let groups = await get_groups_raw()
    groups = groups.data

    const promises = groups.map(async group => {
        const schedule_raw = await get_schedule_raw(group)
        const file = await fs.open(`./thing/${group}.json`, "w")
        await file.write(JSON.stringify(schedule_raw.data))
        return file.close()
    });

    await Promise.all(promises)
}


/**
 * @typedef Lesson
 * @type {object}
 *
 * @property {number} subject_id
 * @property {number} teacher_id
 * @property {number} room_id
 * @property {number} type_id lecture/practice/lab/etc
 * @property {number} time_slot_id
 * @property {number} date_id
 * @property {number} group_id
 *
 * @property {string|null} description
*/

/**
 * @typedef Full_Schedule
 * @type {object}
 * @property {Lesson[]} lessons
 * @property {string[]} subjects
 * @property {string[]} teachers
 * @property {string[]} rooms
 * @property {string[]} types
 * @property {string[]} groups
 * @property {Date[]} dates
 * @property {Time_Slot[]} time_slots
 */

/**
 * @template T
 * @param {T[]} arr
 * @param {T} item
 * @returns {number}
 */
function find_or_create(arr, item) {
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

async function playground() {
    /** @type {Full_Schedule} */
    let schedule = {
        lessons: [],
        subjects: [],
        teachers: [],
        rooms: [],
        types: [],
        groups: [],
        dates: [],
        time_slots: [],
    };

    console.time("parse")
    const files = await fs.readdir("./thing")
    for (const file of files) {
        const file_path = `./thing/${file}`
        const data = await fs.readFile(file_path, "utf-8")
        /** @type {Schedule_Response} */
        let json;
        try {
            json = JSON.parse(data)
        } catch (e) {
            console.error(`Failed to parse ${file_path}`)
            continue;
        }

        const is_sschedule_empty = (schedule) => {
            return schedule.times.length === 0 ||
                schedule.currentWeek.length === 0 ||
                schedule.nextWeek.length === 0
        }

        if (is_sschedule_empty(json)) {
            continue;
        }

        schedule.time_slots = json.times.map(parse_time_slot).filter(el => el.ok).map(el => el.data)

        const group_id = find_or_create(schedule.groups, file.split(".")[0]);

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


        const days = [...json.currentWeek, ...json.nextWeek];
        for (const { dayOfTheWeek, lessonElements } of days) {
            /** @type {Lesson} */
            const lesson = {};
            lesson.group_id = group_id;
            const date_id = find_or_create(schedule.dates, parse_ru_date(dayOfTheWeek).data);

            for (const lesson_element of lessonElements) {
                if (is_lesson_empty(lesson_element)) {
                    continue;
                }

                lesson.subject_id = find_or_create(schedule.subjects, lesson_element.subject);
                lesson.teacher_id = find_or_create(schedule.teachers, lesson_element.teacher);
                lesson.room_id = find_or_create(schedule.rooms, lesson_element.room);
                lesson.type_id = find_or_create(schedule.types, lesson_element.studyType);
                lesson.time_slot_id = lesson_element.timeIndex - 1;
                lesson.date_id = date_id;
                schedule.lessons.push(lesson);
            }
        }
    }
    console.timeEnd("parse")

    console.time("filter")
    const target_group = "23-СК"
    const target_group_id = schedule.groups.findIndex(el => el === target_group);
    if (target_group_id === -1) {
        console.error(`Failed to find group ${target_group}`)
    }
    const lessons = schedule.lessons.filter(el => el.group_id === target_group_id);
    console.log(lessons)
    console.timeEnd("filter")

    const file = await fs.open("./sched.json", "w")
    await file.write(JSON.stringify(schedule))
    await file.close()
}

playground();


/**
 * @param {string} slot expected to have only the actual times here, not the category title that is present in the Schedule_Response
 * @returns {Result<Time_Slot, string>}
 */
function parse_time_slot(slot) {
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

    const parts = slot.split("—")
    if (parts.length != 2) return err("String must be in HH:MM—HH:MM format, failed to split on —");

    const start_res = parse_hhmm_string_to_time_of_day(parts[0])
    const end_res = parse_hhmm_string_to_time_of_day(parts[1])

    if (!start_res.ok || !end_res.ok) return err(`Parse of start or end failed. start: ${start_res.err} or end: ${start_res.err}`)

    return ok({ start: start_res.data, end: end_res.data })
}


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
 * @returns {Result<Date, string}
 */
function parse_ru_date(str, year = new Date().getFullYear()) {
    const match = str
        .toLowerCase()
        .match(/^(?:[а-яё]+),\s*(\d{1,2})\s+([а-яё]+)$/);

    if (!match) {
        return err("Invalid date format");
    }

    const day = Number(match[1]);
    const month = RU_MONTH_NAMES[match[2]];

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
