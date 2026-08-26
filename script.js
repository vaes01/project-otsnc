const API_URL =
  "https://script.google.com/macros/s/AKfycbxCWUIlsFmqVGfXeaTSVuWA9jUsDZuYcg8m91D_qrdVQtc7H_R_FrFU6oFddtp3por2/exec";


let allShows = [];

let filteredShows = [];

let availableMinPrice = 0;

let availableMaxPrice = 500;

let priceMin = null;

let priceMax = null;



// ==================================================
// DATE RANGE
// ==================================================

let dateStart = null;

let dateEnd = null;

let calendarDate = new Date();


// ==================================================
// LOAD DATA
// ==================================================

async function loadShows() {

  const loading =
    document.getElementById("loading");

  try {

    console.log("Loading shows...");

    const response =
      await fetch(API_URL);


    if (!response.ok) {

      throw new Error(
        `HTTP error: ${response.status}`
      );

    }


    const data =
      await response.json();


    console.log(
      "Shows loaded:",
      data
    );


    allShows =
      Array.isArray(data)
        ? data
        : [];


    filteredShows =
      [...allShows];


    /*
     * IMPORTANT:
     * Initialize price AFTER
     * the data has loaded.
     */

    initializePriceFilter();

    setupPriceFilter();


    updateAllFilters();


    renderShows(
      filteredShows
    );


  } catch (error) {

    console.error(
      "Error loading shows:",
      error
    );


    loading.textContent =
      "Erro ao carregar os shows. Veja o console para mais detalhes.";

  }

}




// ==================================================
// GET FILTERS
// ==================================================

function getFilters() {

  return {

    casa:
      document
        .getElementById("casaSelect")
        .value,

    cidade:
      document
        .getElementById("cidade")
        .value,

    regiao:
      document
        .getElementById("regiao")
        .value,

    bairro:
      document
        .getElementById("bairro")
        .value,

    endereco:
      document
        .getElementById("endereco")
        .value
        .toLowerCase()
        .trim(),

    horario:
      document
        .getElementById("horario")
        .value
        .toLowerCase()
        .trim(),

    bandas:
      document
        .getElementById("bandas")
        .value
        .toLowerCase()
        .trim()

  };

}




// ==================================================
// APPLY FILTERS
// ==================================================

function applyFilters() {

  const filters =
    getFilters();


  filteredShows =
    allShows.filter(
      show =>
        matchesFilters(
          show,
          filters
        )
    );


  updateAllFilters();


  renderShows(
    filteredShows
  );

}



// ==================================================
// MATCH FILTERS
// ==================================================

function matchesFilters(
  show,
  filters
) {

  const casa =
    String(
      show["Casa de Show"] || ""
    );


  const cidade =
    String(
      show["Cidade"] || ""
    );


  const regiao =
    String(
      show["Região"] || ""
    );


  const bairro =
    String(
      show["Bairro"] || ""
    );


  const endereco =
    String(
      show["Endereço"] || ""
    )
      .toLowerCase();


  const horario =
    String(
      show["Horário"] || ""
    )
      .toLowerCase();


  const bandas =
    String(
      show["Bandas"] || ""
    )
      .toLowerCase();



  // CASA

  if (
    filters.casa &&
    casa !== filters.casa
  ) {

    return false;

  }



  // CIDADE

  if (
    filters.cidade &&
    cidade !== filters.cidade
  ) {

    return false;

  }



  // REGIAO

  if (
    filters.regiao &&
    regiao !== filters.regiao
  ) {

    return false;

  }



  // BAIRRO

  if (
    filters.bairro &&
    bairro !== filters.bairro
  ) {

    return false;

  }



  // ENDERECO

  if (
    filters.endereco &&
    !endereco.includes(
      filters.endereco
    )
  ) {

    return false;

  }



  // HORARIO

  if (
    filters.horario &&
    !horario.includes(
      filters.horario
    )
  ) {

    return false;

  }



  // BANDAS

  if (
    filters.bandas &&
    !bandas.includes(
      filters.bandas
    )
  ) {

    return false;

  }



  // DATE RANGE

  const showDate =
    parseDate(
      show["Data"]
    );


  if (
    dateStart &&
    showDate < dateStart
  ) {

    return false;

  }


  if (
    dateEnd &&
    showDate > dateEnd
  ) {

    return false;

  }

  // PRICE

const showPrice =
  Number(
    show["Preço do ingresso"]
  );


if (
  priceMin !== null &&
  (
    !Number.isFinite(showPrice) ||
    showPrice < priceMin
  )
) {

  return false;

}


if (
  priceMax !== null &&
  (
    !Number.isFinite(showPrice) ||
    showPrice > priceMax
  )
) {

  return false;

}
  
  return true;

}



// ==================================================
// CASCADING FILTERS
// ==================================================

function updateAllFilters() {

  const filters =
    getFilters();


  updateSelect(
    "casaSelect",
    "Casa de Show",
    filters,
    "casa"
  );


  updateSelect(
    "cidade",
    "Cidade",
    filters,
    "cidade"
  );


  updateSelect(
    "regiao",
    "Região",
    filters,
    "regiao"
  );


  updateSelect(
    "bairro",
    "Bairro",
    filters,
    "bairro"
  );

}



// ==================================================
// UPDATE SELECT
// ==================================================

function updateSelect(
  selectId,
  property,
  filters,
  ignoredFilter
) {

  const select =
    document.getElementById(
      selectId
    );


  const oldValue =
    select.value;


  const otherFilters = {
    ...filters,

    [ignoredFilter]: ""
  };


  const availableShows =
    allShows.filter(
      show =>
        matchesFilters(
          show,
          otherFilters
        )
    );


  const values = [
    ...new Set(
      availableShows
        .map(
          show =>
            String(
              show[property] || ""
            ).trim()
        )
        .filter(Boolean)
    )
  ];


  values.sort(
    (a, b) =>
      a.localeCompare(
        b,
        "pt-BR"
      )
  );


  const firstOption =
    select.options[0];


  select.innerHTML = "";


  select.appendChild(
    firstOption
  );


  values.forEach(
    value => {

      const option =
        document.createElement(
          "option"
        );


      option.value =
        value;


      option.textContent =
        value;


      select.appendChild(
        option
      );

    }
  );


  if (
    values.includes(
      oldValue
    )
  ) {

    select.value =
      oldValue;

  } else {

    select.value =
      "";

  }

}



// ==================================================
// AUTOCOMPLETE
// ==================================================

function setupAutocomplete(
  inputId,
  suggestionId,
  property
) {

  const input =
    document.getElementById(
      inputId
    );


  const suggestions =
    document.getElementById(
      suggestionId
    );


  input.addEventListener(
    "input",
    () => {

      const query =
        input.value
          .toLowerCase()
          .trim();


      suggestions.innerHTML =
        "";


      if (!query) {

        suggestions.style.display =
          "none";

        applyFilters();

        return;

      }


      const filters =
        getFilters();


      const availableShows =
        allShows.filter(
          show =>
            matchesFilters(
              show,
              {
                ...filters,

                [getFilterName(property)]:
                  ""
              }
            )
        );


      const values = [
        ...new Set(
          availableShows
            .map(
              show =>
                String(
                  show[property] || ""
                ).trim()
            )
            .filter(
              value =>
                value
                  .toLowerCase()
                  .includes(
                    query
                  )
            )
        )
      ];


      values.sort(
        (a, b) =>
          a.localeCompare(
            b,
            "pt-BR"
          )
      );


      values
        .slice(0, 10)
        .forEach(
          value => {

            const item =
              document.createElement(
                "div"
              );


            item.className =
              "suggestion-item";


            item.textContent =
              value;


            item.addEventListener(
              "click",
              () => {

                input.value =
                  value;


                suggestions.style.display =
                  "none";


                applyFilters();

              }
            );


            suggestions.appendChild(
              item
            );

          }
        );


      suggestions.style.display =
        suggestions.children.length
          ? "block"
          : "none";


      applyFilters();

    }
  );


  document.addEventListener(
    "click",
    event => {

      if (
        !input.contains(
          event.target
        ) &&
        !suggestions.contains(
          event.target
        )
      ) {

        suggestions.style.display =
          "none";

      }

    }
  );

}



// ==================================================
// FILTER NAME
// ==================================================

function getFilterName(
  property
) {

  const mapping = {

    "Endereço":
      "endereco",

    "Horário":
      "horario",

    "Bandas":
      "bandas"

  };


  return mapping[property] || "";

}




// ==================================================
// RENDER SHOWS
// ==================================================

function renderShows(
  shows
) {

  const container =
    document.getElementById(
      "shows"
    );


  const loading =
    document.getElementById(
      "loading"
    );


  const noResults =
    document.getElementById(
      "noResults"
    );


  const resultCount =
    document.getElementById(
      "resultCount"
    );


  loading.style.display =
    "none";


  container.innerHTML =
    "";


  resultCount.textContent =
    `${shows.length} show${
      shows.length !== 1
        ? "s"
        : ""
    }`;


  if (
    shows.length === 0
  ) {

    noResults.classList.remove(
      "hidden"
    );

    return;

  }


  noResults.classList.add(
    "hidden"
  );


  const sorted =
    [...shows].sort(
      (a, b) => {

        const dateA =
          parseDate(
            a["Data"]
          );


        const dateB =
          parseDate(
            b["Data"]
          );


        if (
          dateA - dateB !== 0
        ) {

          return (
            dateA - dateB
          );

        }


        return (
          convertTimeToMinutes(
            a["Horário"]
          ) -
          convertTimeToMinutes(
            b["Horário"]
          )
        );

      }
    );


  sorted.forEach(
    show => {   

      const card =
        document.createElement(
          "article"
        );


      card.className =
        "show-card";


      const instagram =
        formatInstagram(
          show["Instagram"]
        );


      card.innerHTML = `

        <div class="show-content">

          <div class="show-date">
            ${escapeHTML(
              show["Data"] || ""
            )}
          </div>


          <h2>
            ${escapeHTML(
              show["Casa de Show"] ||
              "Local não informado"
            )}
          </h2>


          <div class="show-info">

            📍
            ${escapeHTML(
              show["Cidade"] || ""
            )}

            ${
              show["Região"]
                ? " • " +
                  escapeHTML(
                    show["Região"]
                  )
                : ""
            }

          </div>


          ${
            show["Bairro"]
              ? `
                <div class="show-info">
                  🏘️
                  ${escapeHTML(
                    show["Bairro"]
                  )}
                </div>
              `
              : ""
          }


          ${
            show["Endereço"]
              ? `
                <div class="show-info">
                  📌
                  ${escapeHTML(
                    show["Endereço"]
                  )}
                </div>
              `
              : ""
          }


          ${
            show["Horário"]
              ? `
                <div class="show-info">
                  🕐
                  ${escapeHTML(
                    show["Horário"]
                  )}
                </div>
              `
              : ""
          }

          ${
            show["Preço do ingresso"] !== "" &&
            show["Preço do ingresso"] !== null &&
            show["Preço do ingresso"] !== undefined
                ? `
                <div class="show-price">
                    🎟️
                    R$
                    ${formatMoney(
                    show["Preço do ingresso"]
                    )}
                </div>
                `
                : ""
            }



          <div class="show-bands">

            <strong>
              🎸 Bandas
            </strong>

            <div>
              ${escapeHTML(
                show["Bandas"] ||
                "Não informado"
              )}
            </div>

          </div>


          ${
            instagram
              ? `
                <a
                  class="instagram"
                  href="${instagram}"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Instagram
                </a>
              `
              : ""
          }

        </div>

      `;


      container.appendChild(
        card
      );

    }
  );

}



// ==================================================
// DATE PARSING
// ==================================================

function parseDate(
  dateString
) {

  if (!dateString) {

    return new Date(
      0
    );

  }


  const parts =
    String(
      dateString
    ).split("/");


  if (
    parts.length !== 3
  ) {

    return new Date(
      0
    );

  }


  return new Date(
    Number(parts[2]),
    Number(parts[1]) - 1,
    Number(parts[0])
  );

}



// ==================================================
// TIME
// ==================================================

function convertTimeToMinutes(
  time
) {

  if (!time) {
    return 0;
  }


  const parts =
    String(time).split(":");


  if (
    parts.length < 2
  ) {

    return 0;

  }


  return (
    Number(parts[0]) * 60 +
    Number(parts[1])
  );

}



// ==================================================
// INSTAGRAM
// ==================================================

function formatInstagram(
  value
) {

  if (!value) {
    return "";
  }


  let username =
    String(value).trim();


  if (
    username.startsWith(
      "http"
    )
  ) {

    return username;

  }


  username =
    username.replace(
      /^@/,
      ""
    );


  return (
    "https://instagram.com/" +
    username
  );

}



// ==================================================
// HTML ESCAPE
// ==================================================

function escapeHTML(
  value
) {

  return String(value)

    .replace(
      /&/g,
      "&amp;"
    )

    .replace(
      /</g,
      "&lt;"
    )

    .replace(
      />/g,
      "&gt;"
    )

    .replace(
      /"/g,
      "&quot;"
    )

    .replace(
      /'/g,
      "&#039;"
    );

}



// ==================================================
// DATE RANGE CALENDAR
// ==================================================

function initDatePicker() {

  const button =
    document.getElementById(
      "dateRangeButton"
    );

  const picker =
    document.getElementById(
      "datePicker"
    );


  // Open / close calendar
  button.addEventListener(
    "click",
    event => {

      event.stopPropagation();

      picker.classList.toggle(
        "hidden"
      );

      if (
        !picker.classList.contains(
          "hidden"
        )
      ) {

        renderCalendar();

      }

    }
  );


  // Close ONLY when clicking outside
  document.addEventListener(
    "click",
    event => {

      if (
        !picker.contains(
          event.target
        ) &&
        !button.contains(
          event.target
        )
      ) {

        picker.classList.add(
          "hidden"
        );

      }

    }
  );


  // Previous month
  document
    .getElementById(
      "previousMonth"
    )
    .addEventListener(
      "click",
      event => {

        event.stopPropagation();

        calendarDate.setMonth(
          calendarDate.getMonth() - 1
        );

        renderCalendar();

      }
    );


  // Next month
  document
    .getElementById(
      "nextMonth"
    )
    .addEventListener(
      "click",
      event => {

        event.stopPropagation();

        calendarDate.setMonth(
          calendarDate.getMonth() + 1
        );

        renderCalendar();

      }
    );


  // Clear date range
  document
    .getElementById(
      "clearDateRange"
    )
    .addEventListener(
      "click",
      event => {

        event.stopPropagation();

        dateStart = null;

        dateEnd = null;

        updateDateRangeText();

        renderCalendar();

        applyFilters();

      }
    );


  renderCalendar();

}



// ==================================================
// RENDER CALENDAR
// ==================================================

function renderCalendar() {

  const calendar =
    document.getElementById(
      "calendar"
    );


  const monthTitle =
    document.getElementById(
      "calendarMonth"
    );


  const year =
    calendarDate.getFullYear();


  const month =
    calendarDate.getMonth();


  const monthName =
    new Intl.DateTimeFormat(
      "pt-BR",
      {
        month: "long",
        year: "numeric"
      }
    ).format(
      calendarDate
    );


  monthTitle.textContent =
    capitalizeFirstLetter(
      monthName
    );


  calendar.innerHTML =
    "";


  const weekdays = [
    "Dom",
    "Seg",
    "Ter",
    "Qua",
    "Qui",
    "Sex",
    "Sáb"
  ];


  weekdays.forEach(
    day => {

      const element =
        document.createElement(
          "div"
        );


      element.className =
        "calendar-weekday";


      element.textContent =
        day;


      calendar.appendChild(
        element
      );

    }
  );


  const firstDay =
    new Date(
      year,
      month,
      1
    ).getDay();


  const daysInMonth =
    new Date(
      year,
      month + 1,
      0
    ).getDate();


  /*
   * Empty cells before
   * the first day.
   */

  for (
    let i = 0;
    i < firstDay;
    i++
  ) {

    const empty =
      document.createElement(
        "div"
      );


    empty.className =
      "calendar-empty";


    calendar.appendChild(
      empty
    );

  }


  /*
   * Days
   */

  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {

    const date =
      new Date(
        year,
        month,
        day
      );


    const element =
      document.createElement(
        "button"
      );


    element.type =
      "button";


    element.className =
      "calendar-day";


    element.textContent =
      day;


    /*
     * Selected start
     */

    if (
      dateStart &&
      sameDay(
        date,
        dateStart
      )
    ) {

      element.classList.add(
        "selected-start"
      );

    }


    /*
     * Selected end
     */

    if (
      dateEnd &&
      sameDay(
        date,
        dateEnd
      )
    ) {

      element.classList.add(
        "selected-end"
      );

    }


    /*
     * Date inside range
     */

    if (
      dateStart &&
      dateEnd &&
      date > dateStart &&
      date < dateEnd
    ) {

      element.classList.add(
        "in-range"
      );

    }


    /*
     * Today
     */

    if (
      sameDay(
        date,
        new Date()
      )
    ) {

      element.classList.add(
        "today"
      );

    }


    element.addEventListener(
  "click",
  event => {

    event.stopPropagation();

    selectDate(
      date
    );

  }
);



    calendar.appendChild(
      element
    );

  }


  updateDateSelectionStatus();

}



// ==================================================
// SELECT DATE
// ==================================================

function selectDate(
  date
) {

  /*
   * FIRST CLICK
   *
   * Select the initial date
   * and KEEP the calendar open.
   */

  if (
    !dateStart ||
    (
      dateStart &&
      dateEnd
    )
  ) {

    dateStart =
      new Date(date);

    dateEnd =
      null;


    updateDateRangeText();

    renderCalendar();

    return;

  }


  /*
   * SECOND CLICK
   *
   * Select the final date.
   */

  if (
    date < dateStart
  ) {

    // If user clicks an earlier
    // date, automatically swap them.

    dateEnd =
      new Date(dateStart);

    dateStart =
      new Date(date);

  } else {

    dateEnd =
      new Date(date);

  }


  updateDateRangeText();

  renderCalendar();

  applyFilters();


  /*
   * Only close after the
   * complete range is selected.
   */

  setTimeout(
    () => {

      document
        .getElementById(
          "datePicker"
        )
        .classList.add(
          "hidden"
        );

    },
    250
  );

}




// ==================================================
// DATE TEXT
// ==================================================

function updateDateRangeText() {

  const element =
    document.getElementById(
      "dateRangeText"
    );


  if (
    !dateStart
  ) {

    element.textContent =
      "Selecionar período";

    return;

  }


  if (
    dateStart &&
    !dateEnd
  ) {

    element.textContent =
      formatDate(
        dateStart
      ) +
      " — selecione a data final";

    return;

  }


  element.textContent =
    formatDate(
      dateStart
    ) +
    " — " +
    formatDate(
      dateEnd
    );

}



// ==================================================
// SELECTION STATUS
// ==================================================

function updateDateSelectionStatus() {

  const element =
    document.getElementById(
      "dateSelectionStatus"
    );


  if (
    !dateStart
  ) {

    element.textContent =
      "Selecione a data inicial";

    return;

  }


  if (
    dateStart &&
    !dateEnd
  ) {

    element.textContent =
      "Agora selecione a data final";

    return;

  }


  element.textContent =
    `${formatDate(
      dateStart
    )} — ${formatDate(
      dateEnd
    )}`;

}



// ==================================================
// FORMAT DATE
// ==================================================

function formatDate(
  date
) {

  return String(
    date.getDate()
  ).padStart(2, "0")
    +
    "/"
    +
    String(
      date.getMonth() + 1
    ).padStart(2, "0")
    +
    "/"
    +
    date.getFullYear();

}



// ==================================================
// SAME DAY
// ==================================================

function sameDay(
  a,
  b
) {

  return (
    a.getFullYear() ===
      b.getFullYear() &&

    a.getMonth() ===
      b.getMonth() &&

    a.getDate() ===
      b.getDate()
  );

}



// ==================================================
// CAPITALIZE
// ==================================================

function capitalizeFirstLetter(
  value
) {

  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );

}



// ==================================================
// INPUT EVENTS
// ==================================================

document
  .querySelectorAll(
    ".filter input, .filter select"
  )
  .forEach(
    input => {

      input.addEventListener(
        "input",
        applyFilters
      );


      input.addEventListener(
        "change",
        applyFilters
      );

    }
  );



// ==================================================
// CLEAR EVERYTHING
// ==================================================

document
  .getElementById(
    "clearFilters"
  )
  .addEventListener(
    "click",
    () => {

      document
        .querySelectorAll(
          ".filter input"
        )
        .forEach(
          input => {
            input.value = "";
          }
        );


      document
        .querySelectorAll(
          ".filter select"
        )
        .forEach(
          select => {
            select.selectedIndex = 0;
          }
        );


      document
        .querySelectorAll(
          ".suggestions"
        )
        .forEach(
          suggestions => {

            suggestions.style.display =
              "none";

          }
        );


      dateStart =
        null;


      dateEnd =
        null;


      updateDateRangeText();


      renderCalendar();


      filteredShows =
        [...allShows];


      updateAllFilters();


      renderShows(
        filteredShows
      );

    }
  );



// ==================================================
// AUTOCOMPLETE
// ==================================================


setupAutocomplete(
  "endereco",
  "enderecoSuggestions",
  "Endereço"
);


setupAutocomplete(
  "horario",
  "horarioSuggestions",
  "Horário"
);


setupAutocomplete(
  "bandas",
  "bandasSuggestions",
  "Bandas"
);



// ==================================================
// DATE PICKER
// ==================================================

initDatePicker();



// ==================================================
// START
// ==================================================

loadShows();


// ==================================================
// PRICE FILTER
// ==================================================

function initializePriceFilter() {

  const minRange =
    document.getElementById(
      "priceMinRange"
    );


  const maxRange =
    document.getElementById(
      "priceMaxRange"
    );


  /*
   * If the HTML price elements
   * don't exist, simply stop.
   */

  if (
    !minRange ||
    !maxRange
  ) {

    console.warn(
      "Price filter elements not found."
    );

    return;

  }


  const prices =
    allShows

      .map(show =>
        Number(
          show["Preço do ingresso"]
        )
      )

      .filter(price =>
        Number.isFinite(price) &&
        price >= 0
      );


  /*
   * No prices in the spreadsheet.
   */

  if (
    prices.length === 0
  ) {

    availableMinPrice = 0;

    availableMaxPrice = 500;

  } else {

    availableMinPrice =
      Math.floor(
        Math.min(...prices)
      );


    availableMaxPrice =
      Math.ceil(
        Math.max(...prices)
      );


    /*
     * Give the slider some
     * room at the top.
     */

    availableMaxPrice =
      Math.max(
        100,
        Math.ceil(
          availableMaxPrice / 50
        ) * 50
      );

  }


  minRange.min =
    availableMinPrice;


  minRange.max =
    availableMaxPrice;


  minRange.value =
    availableMinPrice;


  maxRange.min =
    availableMinPrice;


  maxRange.max =
    availableMaxPrice;


  maxRange.value =
    availableMaxPrice;


  updatePriceUI();

}




// ==================================================
// PRICE UI
// ==================================================

function updatePriceUI() {

  const minRange =
    document.getElementById(
      "priceMinRange"
    );


  const maxRange =
    document.getElementById(
      "priceMaxRange"
    );


  const minInput =
    document.getElementById(
      "priceMinInput"
    );


  const maxInput =
    document.getElementById(
      "priceMaxInput"
    );


  const minLabel =
    document.getElementById(
      "priceMinLabel"
    );


  const maxLabel =
    document.getElementById(
      "priceMaxLabel"
    );


  const track =
    document.getElementById(
      "sliderTrack"
    );


  if (
    !minRange ||
    !maxRange
  ) {

    return;

  }


  let min =
    Number(
      minRange.value
    );


  let max =
    Number(
      maxRange.value
    );


  if (
    min > max
  ) {

    min =
      max;

    minRange.value =
      min;

  }


  priceMin =
    min > availableMinPrice
      ? min
      : null;


  priceMax =
    max < availableMaxPrice
      ? max
      : null;


  if (minInput) {

    minInput.value =
      priceMin === null
        ? ""
        : min;

  }


  if (maxInput) {

    maxInput.value =
      priceMax === null
        ? ""
        : max;

  }


  if (minLabel) {

    minLabel.textContent =
      `R$ ${formatMoney(min)}`;

  }


  if (maxLabel) {

    maxLabel.textContent =
      max === availableMaxPrice
        ? `R$ ${formatMoney(max)}+`
        : `R$ ${formatMoney(max)}`;

  }


  if (track) {

    const total =
      availableMaxPrice -
      availableMinPrice;


    if (
      total > 0
    ) {

      const left =
        (
          (min -
            availableMinPrice) /
          total
        ) * 100;


      const right =
        (
          (max -
            availableMinPrice) /
          total
        ) * 100;


      track.style.left =
        `${left}%`;


      track.style.width =
        `${right - left}%`;

    }

  }

}




// ==================================================
// SLIDER TRACK
// ==================================================

function updateSliderTrack(
  min,
  max
) {

  const track =
    document.getElementById(
      "sliderTrack"
    );


  const total =
    availableMaxPrice -
    availableMinPrice;


  if (
    total <= 0
  ) {

    return;

  }


  const left =
    (
      (min -
        availableMinPrice) /
      total
    ) * 100;


  const right =
    (
      (max -
        availableMinPrice) /
      total
    ) * 100;


  track.style.left =
    `${left}%`;


  track.style.width =
    `${right - left}%`;

}



// ==================================================
// PRICE INPUTS
// ==================================================

function setupPriceFilter() {

  const minRange =
    document.getElementById(
      "priceMinRange"
    );


  const maxRange =
    document.getElementById(
      "priceMaxRange"
    );


  const minInput =
    document.getElementById(
      "priceMinInput"
    );


  const maxInput =
    document.getElementById(
      "priceMaxInput"
    );


  /*
   * Don't crash the whole page
   * if the price HTML isn't present.
   */

  if (
    !minRange ||
    !maxRange ||
    !minInput ||
    !maxInput
  ) {

    console.warn(
      "Price filter could not be initialized."
    );

    return;

  }


  minRange.addEventListener(
    "input",
    () => {

      let min =
        Number(
          minRange.value
        );


      let max =
        Number(
          maxRange.value
        );


      if (
        min > max
      ) {

        min =
          max;

        minRange.value =
          min;

      }


      updatePriceUI();

      applyFilters();

    }
  );


  maxRange.addEventListener(
    "input",
    () => {

      let min =
        Number(
          minRange.value
        );


      let max =
        Number(
          maxRange.value
        );


      if (
        max < min
      ) {

        max =
          min;

        maxRange.value =
          max;

      }


      updatePriceUI();

      applyFilters();

    }
  );


  minInput.addEventListener(
    "input",
    () => {

      if (
        minInput.value === ""
      ) {

        minRange.value =
          availableMinPrice;

        updatePriceUI();

        applyFilters();

        return;

      }


      let value =
        Number(
          minInput.value
        );


      if (
        !Number.isFinite(value)
      ) {

        return;

      }


      value =
        Math.max(
          availableMinPrice,
          Math.min(
            value,
            availableMaxPrice
          )
        );


      const max =
        Number(
          maxRange.value
        );


      if (
        value > max
      ) {

        value =
          max;

      }


      minRange.value =
        value;


      updatePriceUI();

      applyFilters();

    }
  );


  maxInput.addEventListener(
    "input",
    () => {

      if (
        maxInput.value === ""
      ) {

        maxRange.value =
          availableMaxPrice;

        updatePriceUI();

        applyFilters();

        return;

      }


      let value =
        Number(
          maxInput.value
        );


      if (
        !Number.isFinite(value)
      ) {

        return;

      }


      value =
        Math.max(
          availableMinPrice,
          Math.min(
            value,
            availableMaxPrice
          )
        );


      const min =
        Number(
          minRange.value
        );


      if (
        value < min
      ) {

        value =
          min;

      }


      maxRange.value =
        value;


      updatePriceUI();

      applyFilters();

    }
  );

}




// ==================================================
// MONEY FORMAT
// ==================================================

function formatMoney(
  value
) {

  return Number(
    value
  ).toLocaleString(
    "pt-BR",
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }
  );

}
