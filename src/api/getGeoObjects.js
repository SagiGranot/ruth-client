import axios from 'axios';

export async function getGeoObjects() {
  const { data: objects } = await axios.get('https://fierce-everglades-47378.herokuapp.com/geobject');
  console.log(objects);
  objects.forEach((obj) => (obj.tag = 'Building'));
  objects.forEach((obj) => (obj.deploys = `${obj.deploys}`));
  return objects;
}
