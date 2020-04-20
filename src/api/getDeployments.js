import axios from "axios";

export async function getDeployments() {
  const { data: deployments } = await axios.get("http://localhost:8080/deploy");
  deployments.forEach(
    (deploy) => (deploy.totalAmount = getTotalAmount(deploy))
  );
  return deployments;
}

function getTotalAmount(item) {
  return item.deployment.reduce((total, i) => total + i.amount, 0);
}
