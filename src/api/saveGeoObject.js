import axios from 'axios';

export async function saveGeoObject(geoObject) {
  console.log('save geo object to db');
  const result = await axios.post('https://fierce-everglades-47378.herokuapp.com/geoObject', geoObject);
  return result;
}
