import axios from 'axios';

export async function getGeoObjects() {
  const { data: objects } = await axios.get('https://fierce-everglades-47378.herokuapp.com/geobject');
  objects.forEach((obj) => (obj.tag = 'Building'));
  return objects;
}
