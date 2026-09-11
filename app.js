const IS_DEV = window.location.hostname === "localhost";

const BASE_PATH = IS_DEV ? "http://localhost:3000" : "https://my-api.nntu.ru"
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
    // console.error(err)
    return { err, ok: false }
}




/**
 * @param {string} uri
 * @returns {Promise<Result<unknown>>}
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
 * @property {string} type lecture/practice/lab/etc
 * @property {string|null} description
 * @property {Time_Slot} time_slot
 * @property {number} time_slot_index
 * @property {string} group
 * @property {Date} date
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
            el.addEventListener(key.slice(2), value)
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
 * @returns {HTMLElement}
 */
function LessonCard(lesson) {
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
            el("span", {},
                lesson.subject,
                lesson.description ? el("span", { class: "muted" },
                    `  (${lesson.description})`
                ) : ""
            ),

        ),
        el("div", { class: "flex-row gap-4" },
            with_icon(
                ICONS.time_slot(14), {},
                TimeSlot(lesson.time_slot)
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
 * @param {Day[]} day
 * @returns {HTMLElement}
 */
function Schedule(days) {
    const day_cards = days.map(el => DayCard(el))
    return el("div", { class: "schedule" }, ...day_cards)
}


/**
 * @typedef App_State
 * @type {object}
 * @property {bool} show_next
 * @property {Day[]} current_week
 * @property {Day[]} next_week
*/


/**
 * @param {App_State} state
 * @param {() => void} onselect
 * @returns {HTMLElement}
 */
function SelectorButtons(state, onselect) {
    return el("div", { class: "week-selector" },
        el("button", {
            class: !state.show_next ? "selected" : "",
            onclick: () => {
                state.show_next = false;
                onselect();
            }
        }, "Эта неделя"),
        el("button", {
            class: state.show_next ? "selected" : "",
            onclick: () => {
                state.show_next = true;
                onselect();
            }
        }, "Следующая неделя"),
    )
}

/**
 * @param {App_State} state
 * @returns {HTMLElement}
 */
function App(state) {
    const current_week = Schedule(state.current_week, state.time_slots)
    const next_week = Schedule(state.next_week, state.time_slots)

    let selected_week = state.show_next ? next_week : current_week;

    const handle_change = () => {
        const new_week = state.show_next ? next_week : current_week;
        selected_week.replaceWith(new_week)
        selected_week = new_week;
        console.log("changed")

        const new_buttons = SelectorButtons(state, handle_change)
        buttons.replaceWith(new_buttons)
        buttons = new_buttons;
    }

    let buttons = SelectorButtons(state, handle_change);

    let self = el("div", { class: "flex-col gap-4", style: "width: 100%;" },
        buttons,
        selected_week
    );

    return self;
}

/**
 * @typedef Compressed_Lesson
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
 * @property {Compressed_Lesson[]} lessons
 * @property {string[]} subjects
 * @property {string[]} teachers
 * @property {string[]} rooms
 * @property {string[]} types
 * @property {string[]} groups
 * @property {Date[]} dates
 * @property {Time_Slot[]} time_slots
 */

/**
 * @param {{group: string, schedule_response: Schedule_Response}[]} groups
 * @returns {Full_Schedule}
 */
function parse_full_schedule(groups) {

    //============================
    //=======local functions======
    //============================

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
            item = item.trim();
            if (item === "") return -1;
        }

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
    const lesson_has_empty_elements = (lesson_element) => {
        return lesson_element.startTime === null ||
            lesson_element.endTime === null ||
            lesson_element.subject === '' ||
            lesson_element.studyType === '' ||
            lesson_element.room === '' ||
            lesson_element.teacher === '' ||
            lesson_element.groupName === null
    }

    const lesson_empty_elements = (lesson_element) => {
        const empty = [];
        if (lesson_element.startTime === null) empty.push("startTime");
        if (lesson_element.endTime === null) empty.push("endTime");
        if (lesson_element.subject === '') empty.push("subject");
        if (lesson_element.studyType === '') empty.push("studyType");
        if (lesson_element.room === '') empty.push("room");
        if (lesson_element.teacher === '') empty.push("teacher");
        if (lesson_element.groupName === null) empty.push("groupName");
        return empty;
    }



    //============================
    //=======main loop============
    //============================

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

            const date_id = find_or_create_element(schedule.dates, parsed_date.data);

            for (const lesson_element of lessonElements) {
                if (is_lesson_empty(lesson_element)) {
                    continue;
                }

                schedule.lessons.push({
                    group_id,
                    date_id,
                    time_slot_id: lesson_element.timeIndex - 1,
                    subject_id: find_or_create_element(schedule.subjects, lesson_element.subject),
                    teacher_id: find_or_create_element(schedule.teachers, lesson_element.teacher),
                    room_id: find_or_create_element(schedule.rooms, lesson_element.room),
                    type_id: find_or_create_element(schedule.types, lesson_element.studyType),
                });
            }
        }
    }

    return schedule;
}

async function get_all_groups_schedule_raw() {
    /** @type {{group: string, schedule_response: Schedule_Response}[]} */
    let all_schedules = [];

    const groups = await get_groups_raw();
    if (!groups.ok) {
        console.error("Failed to get groups")
        return err("Failed to get groups")
    }

    // TODO: throttle this
    const promises = [];
    for (const group of groups.data) {
        promises.push(get_schedule_raw(group).then(result => ({ result, group })))
    }
    const results = await Promise.all(promises)
    for (const { result, group } of results) {
        if (!result.ok) {
            console.error("Failed to get schedule for group", result.err)
            continue;
        }
        all_schedules.push({ group, schedule_response: result.data })
    }

    return ok(all_schedules);
}


const playground = async () => {
    /** @type {Full_Schedule} */
    let schedule = JSON.parse(localStorage.getItem("schedule"));
    if (schedule) {
        for (let i = 0; i < schedule.dates.length; i++) {
            const date_str = schedule.dates[i];
            schedule.dates[i] = new Date(date_str);
        }
    }
    if (!schedule) {
        const all_schedules_result = await get_all_groups_schedule_raw();
        if (!all_schedules_result.ok) {
            console.error("Failed to get all schedules", all_schedules_result.err)
            return;
        }
        schedule = parse_full_schedule(all_schedules_result.data);
        try {
            localStorage.setItem("schedule", JSON.stringify(schedule));
        } catch (e) {
            console.error("Failed to save to localStorage", e)
            return;
        }
    }

    // const group = "М26-ИСТ-3"
    const group = "23-АМ";

    const group_id = schedule.groups.findIndex(el => el === group);
    if (group_id === -1) {
        console.error(`Failed to find group ${group}`)
        return;
    }

    /** @type {Lesson[]} */
    let lessons = [];

    for (const compressed_lesson of schedule.lessons) {
        if (compressed_lesson.group_id !== group_id) {
            continue;
        }

        /** @type {Lesson} */
        const lesson = {
            group: schedule.groups[compressed_lesson.group_id],
            date: schedule.dates[compressed_lesson.date_id],
            time_slot: schedule.time_slots[compressed_lesson.time_slot_id],
            time_slot_index: compressed_lesson.time_slot_id,
            subject: schedule.subjects[compressed_lesson.subject_id],
            teacher_full: schedule.teachers[compressed_lesson.teacher_id],
            room: schedule.rooms[compressed_lesson.room_id],
            type: schedule.types[compressed_lesson.type_id],
            description: compressed_lesson.description,
        }
        lessons.push(lesson);
    }

    const this_week_dates = schedule.dates.slice(0, 6);
    const next_week_dates = schedule.dates.slice(6, 12);

    /** @type {Day[]} */
    const current_week = this_week_dates.map(date => ({ date, lessons: [] }));
    /** @type {Day[]} */
    const next_week = next_week_dates.map(date => ({ date, lessons: [] }));

    for (const lesson of lessons) {
        let date_index;
        date_index = this_week_dates.findIndex(el => el.getTime() === lesson.date.getTime());
        if (date_index !== -1) {
            current_week[date_index].lessons.push(lesson);
            continue;
        }

        date_index = next_week_dates.findIndex(el => el.getTime() === lesson.date.getTime());
        if (date_index !== -1) {
            next_week[date_index].lessons.push(lesson);
            continue;
        }

        console.error("Failed to find date", lesson.date);
    }

    document.onreadystatechange = () => {
        if (document.readyState === "complete") {
            const content = document.querySelector("#content");
            console.log(content);

            /** @type {App_State} */
            const state = {
                current_week,
                next_week,
                show_next: false,
            };

            content.replaceChildren(App(state));
        }
    }

}

playground()
