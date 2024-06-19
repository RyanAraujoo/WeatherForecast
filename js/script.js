async function fetchWeatherData(name) {
  try {
    apiUrl =
      `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${name}?unitGroup=metric&include=days%2Chours&key=${keyApi}&contentType=json`;
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error("Erro ao buscar os dados da API");
    }
    const data = await response.json();
    renderAPIinInterface(data);
    renderGraphWithMaxMinTemp(data.days);
    desactiveLoader()
  } catch (error) {
    console.error("Erro:", error);
  }
}

function renderAPIinInterface(weatherData) {
  const today = new Date().toISOString().split("T")[0];
  const currentDay = weatherData.days.find((day) => day.datetime === today);
  document.getElementById("temp_value").appendChild(document.createTextNode(`${currentDay.temp} Cº`));
  document.getElementById("umid_value").appendChild(document.createTextNode(`${currentDay.humidity} %`));
  document.getElementById("condi_value").appendChild(document.createTextNode(`${currentDay.conditions} %`));
  document.getElementById("txtTitlePrimary").appendChild(document.createTextNode(`Previsão  do Tempo em ${weatherData.resolvedAddress}`));
}

function renderGraphWithMaxMinTemp(data) {
  // Data retrieved https://en.wikipedia.org/wiki/List_of_cities_by_average_temperature
  // Lista para armazenar os valores de "datetime"
  const dates = [];
  const listOfTempMin = [];
  const listOfTempMax = [];

  // Iterar sobre cada objeto da lista de dados
  data.forEach((obj) => {
    // Extrair o valor do dia
    const day = obj.datetime.slice(-2);
    // Adicionar o valor do dia à lista
    dates.push(day);
    listOfTempMin.push(obj.tempmin);
    listOfTempMax.push(obj.tempmax);
  });

  Highcharts.chart("container", {
    chart: {
      type: "line",
    },
    title: {
      text: "Mínima e Máxima dos Próximos 15 dias",
    },
    xAxis: {
      categories: dates,
    },
    yAxis: {
      title: {
        text: "Temperature (°C)",
      },
    },
    plotOptions: {
      line: {
        dataLabels: {
          enabled: true,
        },
        enableMouseTracking: false,
      },
    },
    series: [
      {
        name: "Max",
        data: listOfTempMax,
      },
      {
        name: "Min",
        data: listOfTempMin,
      },
    ],
  });
}


function desactiveLoader() {
  const loader = document.getElementById("loader");
  const content = document.getElementById("content");

  loader.style.display = "none";
  content.style.display = "block";
}

const uflist = document.getElementById('uflist');
const citylist = document.getElementById('citylist');
const districtlist = document.getElementById('districtlist');
const btnWeather = document.getElementById('btnWeather')

const uflistBox = document.querySelector('.uflist');
const citylistBox = document.querySelector('.citylist');
const districtlistBox = document.querySelector('.districtlist');

var nameUF = ""
var nameCity = ""
var nameDistrict = ""

function populateSelectTofetchWeatherData(selectElement, items) {
    selectElement.textContent = ''
    items.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.text = item.nome;
        selectElement.appendChild(option);
    });
}

async function fetchStates() {
  try {
      const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados');
      const data = await response.json()
      populateSelectTofetchWeatherData(uflist, data)
  } catch (error) {
      console.error('Erro ao buscar estados:', error);
  }
}

const statesOfList = fetchStates()
uflist.addEventListener('change', (event) => {
  fetchCities(event.target.value)
  nameUF = event.target.selectedOptions[0].text;
});
citylist.addEventListener('change', (event) => {
  fetchDistricts(event.target.value)
  nameCity = event.target.selectedOptions[0].text;
});

districtlist.addEventListener('change', (event) => {
  nameDistrict = event.target.selectedOptions[0].text;
});



async function fetchDistricts(cityId) {
  try {
      const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/municipios/${cityId}/distritos`);
      const data = await response.json();
      populateSelectTofetchWeatherData(districtlist, data);
      districtlistBox.style.display  = 'block'
  } catch (error) {
      console.error('Erro ao buscar distritos:', error);
  }
}

async function fetchCities(ufId) {
  try {
      const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${ufId}/municipios`);
      const data = await response.json();
      populateSelectTofetchWeatherData(citylist, data)
      citylistBox.style.display = 'block'
      btnWeather.style.display = 'block'
  } catch (error) {
      console.error('Erro ao buscar municípios:', error);
  }
}

function renderWeatherbtn() {
    if (nameDistrict == "") {
      name = `${nameCity}, ${nameUF}, Brasil`;
    } else {
      name = `${nameDistrict}, ${nameUF}, Brasil`;
    }
    console.log(name)
    fetchWeatherData(name)
    
    let formWeather = document.querySelector('.getCities');
    formWeather.style.display = "none"

    let content = document.getElementById("content");
    content.style.display = "block"


}






