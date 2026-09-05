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
 * @returns {Promise<Result<Groups_Response>>}
 */
async function get_groups_raw() {
    return await fetch_json(`${BASE_PATH}${GROUPS_PATH}`)
}


/**
 * @typedef Time_Slot
 * @type {object}
 *
 * @property {Time_Of_Day} start
 * @property {Time_Of_Day} end
*/

/**
 * @typedef Time_Of_Day
 * @type {object}
 *
 * @property {number} hour
 * @property {number} minute
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

    if (!start_res.ok || !end_res.ok) return err(`Parse of start or end failed. start: ${start_res.err} or end: ${start_res.err}`)

    return ok({ start: start_res.data, end: start_res.data })
}


/**
 * @typedef Lesson
 * @type {object}
 *
 * @property {string} subject
 * @property {string} teacher_full
 * @property {string|null} teacher_short
 * @property {string} room
 * @property {string} type lecture/practice/lab/etc
 * @property {string|null} description
 * @property {number} time_slot_index
*/

/**
 * @param {Lesson_Element_Response} lesson_response 
 * @returns {Result<Lesson, string>}
 */
function parse_lesson_from_response(lesson_response) {
    /** @type {Lesson} */
    const res = {}

    if (lesson_response.subject !== null && lesson_response.subject.length > 0) { res.subject = lesson_response.subject }
    else { return err("Failed to parse subject") }

    if (lesson_response.teacher !== null && lesson_response.teacher.length > 0) {
        res.teacher_full = lesson_response.teacher
        res.teacher_short = null
        const parts = lesson_response.teacher.split(" ")
        if (parts.length === 3) {
            const [last_name, first_name, third_name] = parts
            res.teacher_short = `${last_name} ${first_name[0]}. ${third_name[0]}.`
        }
    } else { return err("Failed to parse teacher") }

    if (lesson_response.room !== null && lesson_response.room.length > 0) { res.room = lesson_response.room.split(" ")[0] }
    else { return err("Failed to parse room") }

    if (lesson_response.studyType !== null && lesson_response.studyType.length > 0) { res.type = lesson_response.studyType }
    else { return err("Failed to parse type") }

    if (lesson_response.timeIndex) { res.time_slot_index = lesson_response.timeIndex - 1 }
    else { return err("Failed to parse time slot") }

    res.description = lesson_response.description

    return ok(res)
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

/**
 * @typedef Day
 * @type {object}
 *
 * @property {Date} date
 * @property {Lesson[]} lessons
*/

/**
 * @param {Day_Response} raw
 * @returns {Result<Day, string>}
 */
function parse_day_from_response(raw) {
    const lessons = raw.lessonElements.map(parse_lesson_from_response).filter(el => el.ok).map(el => el.data);
    const date_res = parse_ru_date(raw.dayOfTheWeek);
    if (!date_res.ok) return err(date_res.err);

    return ok({ date: date_res.data, lessons });
}


/**
 * 
 * @param {number} size
 * @param {string} str
 * @returns {SVGElement}
 */
function lucide_icon_from_string(size, str) {
    const container = document.createElement("div");
    container.setAttribute("class", "icon")
    container.setAttribute("style", `width: ${size}px; height: ${size}px`)
    container.innerHTML = str.trim()
        .replace(`width="24"`, `width="100%"`)
        .replace(`height="24"`, `height="100%"`);
    return container;
}

/**
 * @type {Record<string, (size: number) => SVGElement> as const}
 */
const ICONS = {
    time_slot(size) {
        // return https://lucide.dev/icons/clock-fading
        return lucide_icon_from_string(size, `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clock-fading"><path d="M12 2a10 10 0 0 1 7.38 16.75"/><path d="M12 6v6l4 2"/><path d="M2.5 8.875a10 10 0 0 0-.5 3"/><path d="M2.83 16a10 10 0 0 0 2.43 3.4"/><path d="M4.636 5.235a10 10 0 0 1 .891-.857"/><path d="M8.644 21.42a10 10 0 0 0 7.631-.38"/></svg>`)
    },

    teacher(size) {
        // https://lucide.dev/icons/circle-user
        return lucide_icon_from_string(size, `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-user"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/></svg>`)
    },

    room(size) {
        // https://lucide.dev/icons/school
        return lucide_icon_from_string(size, `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-school"><path d="M14 21v-3a2 2 0 0 0-4 0v3"/><path d="M18 4.933V21"/><path d="m4 6 7.106-3.79a2 2 0 0 1 1.788 0L20 6"/><path d="m6 11-3.52 2.147a1 1 0 0 0-.48.854V19a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a1 1 0 0 0-.48-.853L18 11"/><path d="M6 4.933V21"/><circle cx="12" cy="9" r="2"/></svg>`)
    },

    lecture(size) {
        // https://lucide.dev/icons/scroll-text
        return lucide_icon_from_string(size, `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-scroll-text"><path d="M15 12h-5"/><path d="M15 8h-5"/><path d="M19 17V5a2 2 0 0 0-2-2H4"/><path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3"/></svg>`)
    },

    practice(size) {
        // https://lucide.dev/icons/hammer
        return lucide_icon_from_string(size, `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-hammer"><path d="m15 12-9.373 9.373a1 1 0 0 1-3.001-3L12 9"/><path d="m18 15 4-4"/><path d="m21.5 11.5-1.914-1.914A2 2 0 0 1 19 8.172v-.344a2 2 0 0 0-.586-1.414l-1.657-1.657A6 6 0 0 0 12.516 3H9l1.243 1.243A6 6 0 0 1 12 8.485V10l2 2h1.172a2 2 0 0 1 1.414.586L18.5 14.5"/></svg>`)
    },

    lab(size) {
        // https://lucide.dev/icons/flask-conical
        return lucide_icon_from_string(size, `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-flask-conical"><path d="M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2"/><path d="M6.453 15h11.094"/><path d="M8.5 2h7"/></svg>`)
    },

    unknown(size) {
        // https://lucide.dev/icons/badge-question-mark
        return lucide_icon_from_string(size, `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-badge-question-mark"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>`)
    }
};

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

/**
 * @param {Time_Of_Day} time_of_day
 * @returns {string}
 */
function TimeOfDay(time_of_day) {
    /**
     * @param {number} n
     * @returns {string}
     */
    const pad = (n) => n < 10 ? `0${n}` : n
    return el("span", {},
        el("span", { class: "time-hour" }, pad(time_of_day.hour)),
        el("span", { class: "time-sep" }, ":"),
        el("span", { class: "time-minute" }, pad(time_of_day.minute)),
    )
}

/**
 * @param {Time_Slot} time_slot
 * @returns {string}
 */
function TimeSlot(time_slot) {
    const start_str = TimeOfDay(time_slot.start)
    const end_str = TimeOfDay(time_slot.end)
    return el("span", { class: "time-slot" },
        el("span", { class: "start" }, start_str),
        el("span", { class: "sep" }, "-"),
        el("span", { class: "end" }, end_str),
    )
}

/**
 * @param {Lesson} lesson
 * @param {Time_Slot[]} time_slots
 * @returns {HTMLElement}
 */
function LessonCard(lesson, time_slots) {
    /** @type {SVGElement} */
    let lesson_type_icon;
    let lesson_type_class = "unkonwn"

    // TODO: make this less string-dpeendant
    if (lesson.type === "практ.") {
        lesson_type_icon = ICONS.practice(14);
        lesson_type_class = "practice"
    } else if (lesson.type === "лек.") {
        lesson_type_icon = ICONS.lecture(14);
        lesson_type_class = "lecture";
    } else if (lesson.type === "лаб. раб.") {
        lesson_type_icon = ICONS.lab(14);
        lesson_type_class = "lab";
    } else {
        lesson_type_icon = ICONS.unkonwn(14);
        lesson_type_class = "unkonwn";
    }

    /**
     * 
     * @param {SVGElement} icon
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
                lesson.time_slot_index + 1
            ),
            el("span", {}, lesson.subject),
            lesson.description && el("span", { class: "muted" },
                `(${lesson.description})`
            )
        ),
        el("div", { class: "flex-row gap-4" },
            with_icon(
                ICONS.time_slot(14), {},
                TimeSlot(time_slots[lesson.time_slot_index])
            ),

            with_icon(
                lesson_type_icon, { class: `type ${lesson_type_class}` },
                el("span", {}, lesson.type),
            ),
        ),
        el("div", { class: "flex-row gap-4" },
            with_icon(
                ICONS.room(14), {},
                el("span", {}, lesson.room),
            ),

            with_icon(
                ICONS.teacher(14), {},
                el("span", { title: lesson.teacher_full }, lesson.teacher_short !== null ? lesson.teacher_short : lesson.teacher_full)
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
 * @param {Time_Slot[]} time_slots
 * @returns {HTMLElement}
 */
function DayCard(day, time_slots) {
    const header = DayHeader(day.date, day.lessons.length > 0)
    const lesson_cards = day.lessons.map(l => LessonCard(l, time_slots))
    return el("div", { class: "day" },
        header,
        ...lesson_cards
    )
}

/**
 * @param {Day[]} day
 * @param {Time_Slot[]} time_slots
 * @returns {HTMLElement}
 */
function Schedule(days, time_slots) {
    const day_cards = days.map(el => DayCard(el, time_slots))
    return el("div", { class: "schedule" }, ...day_cards)
}


const playground = async () => {
    const group = "М26-ИСТ-3"
    const schedule_raw = await get_schedule_raw(group)

    if (!schedule_raw.ok) {
        console.error("get_schedule_raw failed")
        return
    }

    const all_teachers = new Set(schedule_raw.data.currentWeek.flatMap(el => el.lessonElements).map(el => el.teacher))
    console.log(all_teachers)

    const time_slots_raw = schedule_raw.data.times
    // remove the first "title" element
    time_slots_raw.shift()
    console.assert(time_slots_raw.length === 7)

    const time_slots_results = time_slots_raw
        .map(parse_time_slot)

    if (time_slots_raw.length != time_slots_raw.length) {
        console.error("Not all time_slots were succesfully parsed", time_slots_results)
    }

    const time_slots = time_slots_results
        .filter(el => el.ok)
        .map(el => el.data)


    const content = document.querySelector("#content");

    const current_week = schedule_raw.data.currentWeek.map(parse_day_from_response).filter(el => el.ok).map(el => el.data);
    const next_week = schedule_raw.data.nextWeek.map(parse_day_from_response).filter(el => el.ok).map(el => el.data)

    content.replaceChildren(Schedule(next_week, time_slots));
}

playground()
