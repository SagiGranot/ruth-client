import axios from 'axios';

export async function getDeltas(userId) {
  const { data: deltas } = await axios.get(`https://fierce-everglades-47378.herokuapp.com/deltas/${userId}`);
  return deltas;
}
