const API_URL =
  "https://script.google.com/macros/s/AKfycbxCWUIlsFmqVGfXeaTSVuWA9jUsDZuYcg8m91D_qrdVQtc7H_R_FrFU6oFddtp3por2/exec";


let allShows = [];


// --------------------------------------------------
// LOAD DATA
// --------------------------------------------------

async function loadShows() {

  try {

    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Erro ao carregar os dados.");
    }

    allShows = await response.json();

    populateFilters();

    renderShows(allShows);

  } catch (error) {

    console.error(error);

    document.getElementById("loading").textContent =
      "Não foi possível carregar os shows.";

  }

}


// --------------------------------------------------
// POPULATE DROPDOWNS
// --------------------------------------------------

function populateFilters() {

  createSelectOptions(
    "cidade",
    "Cidade"
  );

  createSelectOptions(
    "regiao",
    "Região"
  );

  createSelectOptions(
    "bairro",
    "Bairro"
  );

}


function createSelectOptions(
  selectId,
  property
) {

  const select =
    document.getElementById(selectId);

  const values = [
    ...new Set(
      allShows
        .map(show => show[property])
        .filter(value =>
          value !== undefined &&
          value !== null &&
          String(value).trim() !== ""
        )
        .map(value => String(value).trim())
    )
  ];

  values.sort((a, b) =>
    a.localeCompare(b, "pt-BR")
  );

  values.forEach(value => {

    const option =
      document.createElement("option");

    option.value = value;

    option.textContent = value;

    select.appendChild(option);

  });

}


// --------------------------------------------------
// FILTER
// --------------------------------------------------

function filterShows() {

  const casa =
    document
      .getElementById("casa")
      .value
      .toLowerCase()
      .trim();


  const cidade =
    document
      .getElementById("cidade")
      .value;


  const regiao =
    document
      .getElementById("regiao")
      .value;


  const bairro =
    document
      .getElementById("bairro")
      .value;


  const endereco =
    document
      .getElementById("endereco")
      .value
      .toLowerCase()
      .trim();


  const instagram =
    document
      .getElementById("instagram")
      .value
      .toLowerCase()
      .trim();


  const data =
    document
      .getElementById("data")
      .value;


  const horario =
    document
      .getElementById("horario")
      .value
      .toLowerCase()
      .trim();


  const bandas =
    document
      .getElementById("bandas")
      .value
      .toLowerCase()
      .trim();


  const filtered =
    allShows.filter(show => {

      const showCasa =
        String(show["Casa de Show"] || "")
          .toLowerCase();


      const showCidade =
        String(show["Cidade"] || "");


      const showRegiao =
        String(show["Região"] || "");


      const showBairro =
        String(show["Bairro"] || "");


      const showEndereco =
        String(show["Endereço"] || "")
          .toLowerCase();


      const showInstagram =
        String(show["Instagram"] || "")
          .toLowerCase();


      const showData =
        String(show["Data"] || "");


      const showHorario =
        String(show["Horário"] || "")
          .toLowerCase();


      const showBandas =
        String(show["Bandas"] || "")
          .toLowerCase();


      return (

        showCasa.includes(casa) &&

        (!cidade ||
          showCidade === cidade) &&

        (!regiao ||
          showRegiao === regiao) &&

        (!bairro ||
          showBairro === bairro) &&

        showEndereco.includes(endereco) &&

        showInstagram.includes(instagram) &&

        (!data ||
          convertSheetDateToInput(showData) === data) &&

        showHorario.includes(horario) &&

        showBandas.includes(bandas)

      );

    });


  renderShows(filtered);

}


// --------------------------------------------------
// RENDER SHOWS
// --------------------------------------------------

function renderShows(shows) {

  const container =
    document.getElementById("shows");


  const loading =
    document.getElementById("loading");


  const noResults =
    document.getElementById("noResults");


  const resultCount =
    document.getElementById("resultCount");


  loading.style.display = "none";


  container.innerHTML = "";


  resultCount.textContent =
    `${shows.length} show${shows.length !== 1 ? "s" : ""}`;


  if (shows.length === 0) {

    noResults.classList.remove("hidden");

    return;

  }


  noResults.classList.add("hidden");


  shows.forEach(show => {

    const card =
      document.createElement("article");

    card.className = "show-card";


    const instagram =
      formatInstagram(show["Instagram"]);


    card.innerHTML = `

      <div class="show-content">

        <div class="show-date">
          ${escapeHTML(show["Data"] || "")}
        </div>


        <h2>
          ${escapeHTML(show["Casa de Show"] || "Local não informado")}
        </h2>


        <div class="show-info">
          📍 ${escapeHTML(show["Cidade"] || "")}
          ${show["Região"]
            ? " • " + escapeHTML(show["Região"])
            : ""}
        </div>


        <div class="show-info">
          ${show["Bairro"]
            ? "🏘️ " + escapeHTML(show["Bairro"])
            : ""}
        </div>


        <div class="show-info">
          ${show["Endereço"]
            ? "📌 " + escapeHTML(show["Endereço"])
            : ""}
        </div>


        <div class="show-info">
          ${show["Horário"]
            ? "🕐 " + escapeHTML(show["Horário"])
            : ""}
        </div>


        <div class="show-bands">

          <strong>🎸 Bandas</strong>

          <div>
            ${escapeHTML(show["Bandas"] || "Não informado")}
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


    container.appendChild(card);

  });

}


// --------------------------------------------------
// INSTAGRAM
// --------------------------------------------------

function formatInstagram(value) {

  if (!value) {
    return "";
  }


  let username =
    String(value).trim();


  if (username.startsWith("http")) {
    return username;
  }


  username =
    username.replace(/^@/, "");


  return `https://instagram.com/${username}`;

}


// --------------------------------------------------
// DATE CONVERSION
// --------------------------------------------------

function convertSheetDateToInput(dateString) {

  if (!dateString) {
    return "";
  }


  const parts =
    dateString.split("/");


  if (parts.length !== 3) {
    return "";
  }


  const day = parts[0];

  const month = parts[1];

  const year = parts[2];


  return `${year}-${month}-${day}`;

}


// --------------------------------------------------
// SECURITY
// --------------------------------------------------

function escapeHTML(value) {

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


// --------------------------------------------------
// EVENTS
// --------------------------------------------------

const filterInputs =
  document.querySelectorAll(
    ".filter input, .filter select"
  );


filterInputs.forEach(input => {

  input.addEventListener(
    "input",
    filterShows
  );


  input.addEventListener(
    "change",
    filterShows
  );

});


// --------------------------------------------------
// CLEAR FILTERS
// --------------------------------------------------

document
  .getElementById("clearFilters")
  .addEventListener("click", () => {

    filterInputs.forEach(input => {

      input.value = "";

    });


    renderShows(allShows);

  });


// --------------------------------------------------
// START
// --------------------------------------------------

loadShows();
