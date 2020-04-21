import axios from 'axios';

export async function getGeoObjects() {
  const { data: objects } = await axios.get('http://localhost:8080/geobject');
  return objects;
}
