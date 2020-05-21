import axios from "axios";

export async function getDeltas(userId) {
  const { data: deltas } = await axios.get(
    `http://localhost:8080/deltas/${userId}`
  );
  return deltas;
}
