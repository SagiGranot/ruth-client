import axios from 'axios';

export async function getWeather() {
  let weatherInfo;
  const [forcast1, forcast2] = await Promise.all([getForcast1(), getForcast2()]);

  weatherInfo = setWeatherInfo(forcast1, forcast2);
  return weatherInfo;
}

async function getForcast1() {
  const { data: forcast1 } = await axios({
    method: 'post',
    url: 'https://fierce-everglades-47378.herokuapp.com/weather',
    headers: {},
    data: {
      lat: '31.021588290005162',
      long: '35.621010538376',
      product: 'forecast_astronomy',
    },
  });
  return forcast1;
}

async function getForcast2() {
  const { data: forcast2 } = await axios({
    method: 'post',
    url: 'http://localhost:8080/weather',
    headers: {},
    data: {
      lat: '31.021588290005162',
      long: '35.621010538376',
      product: 'forecast_7days_simple',
    },
  });
  return forcast2;
}

function setWeatherInfo(f1, f2) {
  let weatherInfo = {
    HighTemperature: '',
    LowTemperature: '',
    WindSpeed: '',
    Humidity: '',
    Sunrise: '',
    Sunset: '',
    Moonset: '',
    MoonPhase: '',
  };

  weatherInfo.HighTemperature = f2.dailyForecasts.forecastLocation.forecast[0].highTemperature;
  weatherInfo.LowTemperature = f2.dailyForecasts.forecastLocation.forecast[0].lowTemperature;
  weatherInfo.WindSpeed = f2.dailyForecasts.forecastLocation.forecast[0].windSpeed;
  weatherInfo.Humidity = f2.dailyForecasts.forecastLocation.forecast[0].humidity;
  weatherInfo.Sunrise = f1.astronomy.astronomy[0].sunrise;
  weatherInfo.Sunset = f1.astronomy.astronomy[0].sunset;
  weatherInfo.Moonset = f1.astronomy.astronomy[0].moonset;
  weatherInfo.MoonPhase = f1.astronomy.astronomy[0].moonrise;

  return weatherInfo;
}
