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

var nameUF = ""
var nameCity = ""
var nameDistrict = ""

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
      loaderContainer.style.display = 'block'
      const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados');
      const data = await response.json()
      populateSelectTofetchGetWeatherData(formWeatherUFItemValue, data)
      formToWeatherContainer.style.display = 'block'
      formWeatherUFItem.style.display = 'block'
      loaderContainer.style.display = 'none'
  } catch (error) {
      console.error('Erro ao buscar estados:', error);
  }
}

const statesOfList = fetchStates()
formWeatherUFItemValue.addEventListener('change', (event) => {
  fetchCities(event.target.value)
  nameUF = event.target.selectedOptions[0].text;
});
formWeatherCityItemValue.addEventListener('change', (event) => {
  fetchDistricts(event.target.value)
  nameCity = event.target.selectedOptions[0].text;
});

formWeatherDistrictItemValue.addEventListener('change', (event) => {
  nameDistrict = event.target.selectedOptions[0].text;
});



async function fetchDistricts(cityId) {
  try {
      const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/municipios/${cityId}/distritos`);
      const data = await response.json();
      populateSelectTofetchGetWeatherData(formWeatherDistrictItemValue, data);
      formWeatherDistrictItem.style.display  = 'block'
  } catch (error) {
      console.error('Erro ao buscar distritos:', error);
  }
}

async function fetchCities(ufId) {
  try {
      const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${ufId}/municipios`);
      const data = await response.json();
      populateSelectTofetchGetWeatherData(formWeatherCityItemValue, data)
      formWeatherCityItem.style.display = 'block'
      formWeatherItemButtonClick.style.display = 'block'
  } catch (error) {
      console.error('Erro ao buscar municípios:', error);
  }
}

async function renderCurrentWeatherSelectedInfo() {
    loaderContainer.style.display = 'block'
    formToWeatherContainer.style.display = 'none'

    let localyValue = ""
      if (nameDistrict == "") {
        localyValue = `${nameCity}, ${nameUF}, Brasil`;
      } else {
        localyValue = `${nameDistrict}, ${nameCity}, ${nameUF}, Brasil`;
      }

    let getWeatherData = await fetchGetWeatherData(localyValue)
    renderInfoTodayWeatherInDashboard(getWeatherData);
    renderGraphWithMaxMinWeather(getWeatherData.days);
    loaderContainer.style.display = 'none'
    infoWeatherContainer.style.display = 'block'
    
}








