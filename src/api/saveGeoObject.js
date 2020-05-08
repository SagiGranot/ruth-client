import axios from 'axios';

export async function saveGeoObject(geoObject) {
  console.log('save geo object to db');
  const result = await axios.post('http://localhost:8080/geoObject', geoObject);
  return result;
}
