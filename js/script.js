const loaderContainer = document.querySelector(".box-loader");
const infoWeatherContainer = document.querySelector(".box-content-info-weather");
const formToWeatherContainer = document.querySelector('.box-form-info-weather')

const formWeatherUFItem = document.querySelector('.form-info-weather-item-uf');
const formWeatherCityItem = document.querySelector('.form-info-weather-item-city');
const formWeatherDistrictItem = document.querySelector('.form-info-weather-item-district');


const formWeatherUFItemValue = document.getElementById('form-info-weather-item-uf-value');
const formWeatherCityItemValue = document.getElementById('form-info-weather-item-city-value');
const formWeatherDistrictItemValue = document.getElementById('form-info-weather-item-district-value');
const formWeatherItemButtonClick = document.getElementById('form-info-weather-item-btn-get-info-weather')

var nameUF = null
var nameCity = null
var nameDistrict = null

async function fetchGetWeatherData(localy) {
  try {
    apiUrl =
      `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${localy}?unitGroup=metric&include=days%2Chours&key=${keyApi}&contentType=json`;
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error("Erro ao buscar os dados da API");
    }
    const data = await response.json();
    return data
  } catch (error) {
    console.error("Erro:", error);
  }
}

function renderInfoTodayWeatherInDashboard(weatherData) {
  const today = new Date().toISOString().split("T")[0];
  const currentDay = weatherData.days.find((day) => day.datetime === today);
  document.getElementById("box-content-info-weather-item-value-temp").appendChild(document.createTextNode(`${currentDay.temp} Cº`));
  document.getElementById("box-content-info-weather-item-value-umid").appendChild(document.createTextNode(`${currentDay.humidity} %`));
  document.getElementById("box-content-info-weather-item-value-cond").appendChild(document.createTextNode(`${currentDay.conditions} %`));
  document.getElementById("box-content-info-weather-title-primary-value").appendChild(document.createTextNode(`Previsão  do Tempo em ${weatherData.resolvedAddress}`));
}

function renderGraphWithMaxMinWeather(data) {
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
        city: "Max",
        data: listOfTempMax,
      },
      {
        city: "Min",
        data: listOfTempMin,
      },
    ],
  });
}

function populateSelectTofetchGetWeatherData(selectElement, items) {
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
      return await response.json()
  } catch (error) {
      console.error('Erro ao buscar estados:', error);
  }
}

async function fetchDistricts(cityId) {
  try {
      const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/municipios/${cityId}/distritos`);
      return await response.json();
  } catch (error) {
      console.error('Erro ao buscar distritos:', error);
  }
}

async function fetchCities(ufId) {
  try {
      const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${ufId}/municipios`);
      return await response.json();
  } catch (error) {
      console.error('Erro ao buscar municípios:', error);
  }
}

async function renderCurrentWeatherSelectedInfo() {
    showLoaderInTemplateHTML()
    let localyValue = definylocalyValueTofetchGetWeather()
    let getWeatherData = await fetchGetWeatherData(localyValue)
    renderInfoTodayWeatherInDashboard(getWeatherData);
    renderGraphWithMaxMinWeather(getWeatherData.days)
    showWeatherInfo()
}

function definylocalyValueTofetchGetWeather() {
  return nameDistrict == null ? `${nameDistrict}, ${nameCity}, ${nameUF}, Brasil` : `${nameCity}, ${nameUF}, Brasil`;
}

function renderInTemplateHTML(loaderContainerDisplayValue, formWeatherContainerDisplayValue, infoWeatherContainerDisplayValue) {
  if (loaderContainer) {
    loaderContainer.style.display = loaderContainerDisplayValue;
  }
  
  if (formToWeatherContainer) {
    formToWeatherContainer.style.display = formWeatherContainerDisplayValue;
  }
  
  if (infoWeatherContainer) {
    infoWeatherContainer.style.display = infoWeatherContainerDisplayValue;
  }
}

function showLoaderInTemplateHTML() {
  renderInTemplateHTML('block','none','none')
}


function showFormWeatherInfoInTemplateHTML() {
  renderInTemplateHTML('none','block','none')
}


function showWeatherInfo() {
  renderInTemplateHTML('none','none','block')
}

async function onLoadPag() {
  showLoaderInTemplateHTML()
  const dataFetchStates = await fetchStates()
  populateSelectTofetchGetWeatherData(formWeatherUFItemValue, dataFetchStates)
  nameUF = dataFetchStates[0].nome
  showFormWeatherInfoInTemplateHTML()
  formWeatherUFItem.style.display = 'block'
}

onLoadPag()

formWeatherUFItemValue.addEventListener('change', async (event) => {
  showLoaderInTemplateHTML()
  let dataFetchCities = await fetchCities(event.target.value)
  nameUF = event.target.selectedOptions[0].text;
  nameCity = dataFetchCities[0].nome
  populateSelectTofetchGetWeatherData(formWeatherCityItemValue, dataFetchCities)
  formWeatherCityItem.style.display = 'block'
  formWeatherItemButtonClick.style.display = 'block'
  showFormWeatherInfoInTemplateHTML()
});

formWeatherCityItemValue.addEventListener('change', async (event) => {
  showLoaderInTemplateHTML()
  let dataFectchDistricts = await fetchDistricts(event.target.value)
  nameCity = event.target.selectedOptions[0].text;
  populateSelectTofetchGetWeatherData(formWeatherDistrictItemValue, dataFectchDistricts);
  formWeatherDistrictItem.style.display  = 'block'
  showFormWeatherInfoInTemplateHTML()
});

formWeatherDistrictItemValue.addEventListener('change', async (event) => {
  nameDistrict = event.target.selectedOptions[0].text;
});




