import axios from 'axios';

// const instance = axios.create({
//   baseURL: 'http://api.weatherapi.com/v1',
// });
// const langCode = navigator.language.split("-")[0];

export const fetchForecastWeather = async (q = '', days = 7) => {
  const { data } = await axios.get(
    'http://api.weatherapi.com/v1/forecast.json',
    {
      params: {
        // lang: langCode,
        days: days,
        q: q,
        key: '25f15b55d263487589983533240905',
      },
    }
  );
  return data;
};

const input = document.querySelector('.search__input');
const btn = document.querySelector('.search__button');
const temp = document.querySelector('.weather__temp');
const city = document.querySelector('.weather__city');
const imgMain = document.querySelector('.condition-img');
const textCurrently = document.querySelector('.condition-text');
const date = document.querySelector('.condition-date');
const feelsLike = document.querySelector('p[data-textCondition="feelslike"]');
const wind = document.querySelector('p[data-textCondition="wind_mph"]');
const humidity = document.querySelector('p[data-textCondition="humidity"]');
const uv = document.querySelector('p[data-textCondition="uv"]');
const tempRange = document.querySelector('.weather__text-range');

document.addEventListener('DOMContentLoaded', () => {
  // const userResponse = confirm("Дозволити доступ до місцезнаходження?");

  try {
    navigator.geolocation.getCurrentPosition(
      async position => {
        const { latitude, longitude } = position.coords;
        const currentLocation = `${latitude}, ${longitude}`;
        const dataAutocomplete = await fetchForecastWeather(currentLocation);
        updateWeatherInfo(dataAutocomplete);
        updateWeatherInfoDetails(dataAutocomplete);
        updateWeatherInfoFuture(dataAutocomplete);
      },
      error => {
        console.error('Помилка отримання геолокації:', error);
      }
    );
  } catch (error) {
    console.error('Помилка при спробі отримати геолокацію:', error);
  }
});
btn.addEventListener('click', async () => {
  const cityName = input.value;

  try {
    const dataForecast = await fetchForecastWeather(cityName);
    updateWeatherInfo(dataForecast);
    updateWeatherInfoDetails(dataForecast);
    updateWeatherInfoFuture(dataForecast);
  } catch (error) {
    console.error('Error fetching weather data:', error);
  }
});

input.addEventListener('keydown', async e => {
  if (e.key === 'Enter') {
    const cityName = input.value;

    try {
      const dataForecast = await fetchForecastWeather(cityName);
      updateWeatherInfo(dataForecast);
      updateWeatherInfoDetails(dataForecast);
      updateWeatherInfoFuture(dataForecast);
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  }
});
function updateWeatherInfo(data) {
  city.textContent = `${data.location.name}, ${data.location.country}`;
  imgMain.src = `${data.current.condition.icon}`;
  temp.textContent = `${data.current.temp_c}ºC`;
  textCurrently.textContent = data.current.condition.text;
  date.textContent = data.location.localtime;
  feelsLike.textContent = `${data.current.feelslike_c}º`;
  wind.textContent = `${data.current.wind_dir} ${data.current.wind_kph}kph`;
  humidity.textContent = `${data.current.humidity} %`;
  uv.textContent = `${data.current.uv}`;
  tempRange.textContent = `Min 🌡: ${data.forecast.forecastday[0].day.mintemp_c} | Max 🌡: ${data.forecast.forecastday[0].day.maxtemp_c}`;
}

function updateWeatherInfoDetails(data) {
  const arr = data.forecast.forecastday.flatMap(el => {
    return el.hour;
  });

  const detailsContainer = document.querySelector('.details');
  const futureContainer = document.querySelector('.future');
  const markup = `    
    <img class="details__img" src="" alt="">
      <p class="details__hour"></p>
      <p class="details__temp"></p>
      
      <p class="details__text"></p>
  
  `;
  const markupFuture = `    
    <img class="details__img" src="" alt="">
      <p class="details__hour"></p>
      <p class="details__temp"></p>
      
      <p class="details__text"></p>
  
  `;

  detailsContainer.innerHTML = '';
  futureContainer.innerHTML = '';

  let detailsCols = [];

  arr.forEach(hourData => {
    if (hourData.time > date.textContent) {
      const detailsCol = document.createElement('div');
      detailsCol.classList.add('details__col');
      detailsCol.innerHTML = markup;

      const hourElement = detailsCol.querySelector('.details__hour');
      const imgElement = detailsCol.querySelector('.details__img');
      const textElement = detailsCol.querySelector('.details__text');
      const tempElement = detailsCol.querySelector('.details__temp');

      hourElement.textContent = hourData.time.slice(11);
      tempElement.textContent = `🌡${hourData.temp_c}`;
      imgElement.src = hourData.condition.icon;
      textElement.textContent = `☔ ${hourData.chance_of_rain}%`;

      detailsCols.push(detailsCol);
    }
  });

  detailsCols = detailsCols.slice(0, 7);

  detailsCols.forEach(detailsCol => {
    detailsContainer.appendChild(detailsCol);
  });
}

function updateWeatherInfoFuture(data) {
  const futureContainer = document.querySelector('.future');
  const markupFuture = `    
    <img class="future__img" src="" alt="">
      <p class="future__day"></p>
      <p class="future__temp"></p>
      
      <p class="future__text"></p>
  
  `;

  futureContainer.innerHTML = '';
  let futureCols = [];

  data.forecast.forecastday.forEach(day => {
    const futureCol = document.createElement('div');
    futureCol.classList.add('future__col');
    futureCol.innerHTML = markupFuture;

    const dayElement = futureCol.querySelector('.future__day');
    const imgElement = futureCol.querySelector('.future__img');
    const textElement = futureCol.querySelector('.future__text');
    const tempElement = futureCol.querySelector('.future__temp');

    dayElement.textContent = new Date(day.date).toLocaleDateString('en-US', {
      weekday: 'short',
    });
    tempElement.textContent = `${day.day.maxtemp_c}º | ${day.day.mintemp_c}º`;
    imgElement.src = day.day.condition.icon;
    textElement.textContent = `☔ ${day.day.daily_chance_of_rain}%`;

    futureCols.push(futureCol);
  });

  futureCols.forEach(futureCol => {
    futureContainer.appendChild(futureCol);
  });
}
