async function fetchWeatherData() {
  try {
    apiUrl =
      "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/ITAMBE%20BA?unitGroup=metric&include=days%2Chours&key=8XNTXJF3VUFF3A47D4GHAGP54&contentType=json";
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error("Erro ao buscar os dados da API");
    }
    const data = await response.json();
    renderAPIinInterface(data);
    renderGraphWithMaxMinTemp(data.days);
  } catch (error) {
    console.error("Erro:", error);
  }
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR');
}

function renderAPIinInterface(weatherData) {
  const today = new Date().toISOString().split("T")[0];
  const currentDay = weatherData.days.find((day) => day.datetime === today);
  document.getElementById("temp_value").innerHTML = `${currentDay.temp} Cº`
  document.getElementById("umid_value").innerHTML = `${currentDay.humidity} %`
  document.getElementById("condi_value").innerHTML = currentDay.conditions
  document.getElementById("txtTitlePrimary").innerHTML = `Previsão  do Tempo em ${weatherData.resolvedAddress}`

  const tableBody = document
    .getElementById("weather-table")
    .querySelector("tbody");
  weatherData.days.forEach((day) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${formatDate(day.datetime)}</td>
            <td>${day.tempmax}°C</td>
            <td>${day.tempmin}°C</td>
            <td>${day.temp}°C</td>
        `;
    tableBody.appendChild(row);
  });
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

fetchWeatherData();
