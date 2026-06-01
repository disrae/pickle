import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Redirect } from "expo-router";

export default function Index() {
  const user = useQuery(api.users.currentUser);

  if (user === undefined) {
    return null;
  }

  if (user === null) {
    return <Redirect href="/login" />;
  }

  return <Redirect href="/(authenticated)/(tabs)" />;
}
