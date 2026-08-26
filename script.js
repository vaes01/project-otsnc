const API_URL =
  "https://script.google.com/macros/s/AKfycbxCWUIlsFmqVGfXeaTSVuWA9jUsDZuYcg8m91D_qrdVQtc7H_R_FrFU6oFddtp3por2/exec";

let allShows = [];

let filteredShows = [];


// ==================================================
// LOAD DATA
// ==================================================

async function loadShows() {

  try {

    const response =
      await fetch(API_URL);


    if (!response.ok) {
      throw new Error(
        "Erro ao carregar os dados."
      );
    }


    allShows =
      await response.json();


    filteredShows =
      [...allShows];


    updateAllFilters();


    renderShows(
      filteredShows
    );


  } catch (error) {

    console.error(error);


    document.getElementById(
      "loading"
    ).textContent =
      "Não foi possível carregar os shows.";

  }

}



// ==================================================
// GET CURRENT FILTERS
// ==================================================

function getFilters() {

  return {

    casa:
      document
        .getElementById("casaSelect")
        .value,

    casaSearch:
      document
        .getElementById("casaSearch")
        .value
        .toLowerCase()
        .trim(),

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

    instagram:
      document
        .getElementById("instagram")
        .value
        .toLowerCase()
        .trim(),

    dataInicio:
      document
        .getElementById("dataInicio")
        .value,

    dataFim:
      document
        .getElementById("dataFim")
        .value,

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


  const instagram =
    String(
      show["Instagram"] || ""
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



  // CASA DROPDOWN

  if (
    filters.casa &&
    casa !== filters.casa
  ) {

    return false;

  }



  // CASA SEARCH

  if (
    filters.casaSearch &&
    !casa
      .toLowerCase()
      .includes(filters.casaSearch)
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



  // INSTAGRAM

  if (
    filters.instagram &&
    !instagram.includes(
      filters.instagram
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
    filters.dataInicio
  ) {

    const startDate =
      parseInputDate(
        filters.dataInicio
      );


    if (
      showDate < startDate
    ) {

      return false;

    }

  }


  if (
    filters.dataFim
  ) {

    const endDate =
      parseInputDate(
        filters.dataFim
      );


    if (
      showDate > endDate
    ) {

      return false;

    }

  }



  return true;

}



// ==================================================
// FILTER DATA
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
// CASCADING FILTERS
// ==================================================

function updateAllFilters() {

  const filters =
    getFilters();


  /*
   * Each filter's available
   * options are calculated
   * using all OTHER filters.
   */


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


  /*
   * Create a copy of the filters
   * without the filter belonging
   * to this dropdown.
   */

  const otherFilters =
    {
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


  /*
   * Keep the selected value
   * if it is still available.
   */

  if (
    values.includes(
      oldValue
    )
  ) {

    select.value =
      oldValue;

  } else {

    select.value = "";

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


      /*
       * Suggestions are also
       * restricted by the
       * currently selected
       * filters.
       */

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
                  .includes(query)
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


      const limited =
        values.slice(0, 10);


      limited.forEach(
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
        limited.length
          ? "block"
          : "none";


      applyFilters();

    }
  );


  document.addEventListener(
    "click",
    event => {

      if (
        !input.contains(event.target) &&
        !suggestions.contains(event.target)
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

    "Casa de Show":
      "casaSearch",

    "Endereço":
      "endereco",

    "Instagram":
      "instagram",

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


  /*
   * Sort by date and time.
   */

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


          <div class="show-info">

            ${
              show["Bairro"]
                ? "🏘️ " +
                  escapeHTML(
                    show["Bairro"]
                  )
                : ""
            }

          </div>


          <div class="show-info">

            ${
              show["Endereço"]
                ? "📌 " +
                  escapeHTML(
                    show["Endereço"]
                  )
                : ""
            }

          </div>


          <div class="show-info">

            ${
              show["Horário"]
                ? "🕐 " +
                  escapeHTML(
                    show["Horário"]
                  )
                : ""
            }

          </div>


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
// DATE FUNCTIONS
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
    dateString.split("/");


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



function parseInputDate(
  value
) {

  const parts =
    value.split("-");


  return new Date(
    Number(parts[0]),
    Number(parts[1]) - 1,
    Number(parts[2])
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
// ESCAPE HTML
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
// EVENTS
// ==================================================

document
  .querySelectorAll(
    ".filter select"
  )
  .forEach(
    select => {

      select.addEventListener(
        "change",
        applyFilters
      );

    }
  );


document
  .querySelectorAll(
    ".filter input"
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
// CLEAR FILTERS
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


      filteredShows =
        [...allShows];


      updateAllFilters();


      renderShows(
        filteredShows
      );

    }
  );



// ==================================================
// AUTOCOMPLETE SETUP
// ==================================================

setupAutocomplete(
  "casaSearch",
  "casaSuggestions",
  "Casa de Show"
);


setupAutocomplete(
  "endereco",
  "enderecoSuggestions",
  "Endereço"
);


setupAutocomplete(
  "instagram",
  "instagramSuggestions",
  "Instagram"
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
// START
// ==================================================

loadShows();
