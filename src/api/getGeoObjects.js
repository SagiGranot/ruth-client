import axios from 'axios';

export async function getGeoObjects() {
  const { data: objects } = await axios.get('http://localhost:8080/geobject');
  objects[0].objectType = 'Building';
  objects[1].objectType = 'Building';
  return objects;
}
