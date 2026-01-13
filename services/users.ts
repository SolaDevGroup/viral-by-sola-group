import { get } from "@/services/ApiRequest";

export const fetchRecommendedUsers = async () => {
  const res = await get("relationships/recommended?page=1&limit=20");

  if (!res?.data?.success) {
    throw new Error("Failed to fetch users");
  }

  return res?.data?.data?.users;
};
