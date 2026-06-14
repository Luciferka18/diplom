import HomeExperience from "@/components/home/HomeExperience";
import { apiGet } from "@/services/api";

async function getHomeData() {
  try {
    return await apiGet("/home");
  } catch {
    return {};
  }
}

export default async function HomePage() {
  const data = await getHomeData();
  return <HomeExperience data={data} />;
}
