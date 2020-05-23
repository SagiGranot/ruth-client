import axios from 'axios';

export async function getDeployments() {
  const { data: deployments } = await axios.get('https://fierce-everglades-47378.herokuapp.com/deploy');
  return deployments;
}
