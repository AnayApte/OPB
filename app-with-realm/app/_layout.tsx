import { Stack } from "expo-router";
import { RealmProvider } from "@realm/react";

export default function AppLayout() {
    return(
      <RealmProvider schema = {}>
        <Stack />
      </RealmProvider>  
    );
}
