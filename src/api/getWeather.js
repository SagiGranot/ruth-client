import axios from 'axios';

export async function getWeather() {
  const forcast = await axios({
    method: 'post',
    url: 'https://fierce-everglades-47378.herokuapp.com/weather',
    headers: {}, 
    data: {
        lat: '31.021588290005162',
        long: '35.621010538376',
        product: 'forecast_astronomy'
    }
  })
  console.log(forcast)
  return forcast;
}
