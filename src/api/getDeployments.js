import axios from "axios";

export async function getDeployments() {
  const { data: deployments } = await axios.get("http://localhost:8080/deploy");
  return deployments;
}
