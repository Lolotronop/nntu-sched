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
 * for some reason these are both null, always
 * @property {null} endTime
 * @property {null} startTime
 * @property {null} groupName
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






const playground = async () => {
    const group = "М26-ИСТ-3"
    const schedule = await get_schedule_raw(group)
    console.log("schedule", schedule.data)
    const groups = await get_groups_raw()
    console.log("groups", groups.data)

    const lesson = schedule.data.currentWeek[2].lessonElements[2]
    console.log("lesson", lesson)


    const content = document.querySelector("#content")

    const lesson_element = document.createElement("div")
    lesson_element.setAttribute("class", "lesson")

    lesson_element.innerHTML = `
        <h1>${lesson.subject}</h1>
        <h2>${lesson.teacher}</h2>
        <p>${lesson.description}</p>
    `;


    content.replaceChildren(lesson_element)
}

playground()
