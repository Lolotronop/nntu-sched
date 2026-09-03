const BASE_PATH = "https://my-api.nntu.ru"
const SCHEDULE_PATH = "/lesson-schedule/public/group-schedule"
const GROUPS_PATH = "/lesson-schedule/public/groups"
const GROUP_PARAMETER = "groupName"

/**
 * @template T
 * @typedef Result<T>
 * @type {object}
 * @property {T} data
 * @property {bool} ok
 */

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
 * @type {string[]}
*/




/**
 * @param {string} group
 * @returns {Promise<Result<Schedule_Response>>}
 */
const get_schedule_raw = async (group) => {
    const group_param = encodeURIComponent(group)
    const req = await fetch(`${BASE_PATH}${SCHEDULE_PATH}?${GROUP_PARAMETER}=${group_param}`)
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
 * @typedef Groups_Response
 * @type {string[]}
*/


/**
 * @param {string} group
 * @returns {Promise<Result<Groups_Response>>}
 */
const get_groups = async () => {
    const req = await fetch(`${BASE_PATH}${GROUPS_PATH}`)
    if (!req.ok) return { ok: false }
    let data;
    try {
        data = await req.json()
    } catch (e) {
        return { ok: false }
    }
    return { ok: true, data }
}

const main = async () => {
    const group = "М26-ИСТ-3"
    const schedule = await get_schedule_raw(group)
    console.log("schedule", schedule)
    const groups = await get_groups()
    console.log("groups", groups.data)
}

main()
