import { functions } from "@/src/services/firebase";
import { httpsCallable } from "firebase/functions";

type DeleteMyAccountResponse = {
  ok: boolean;
};

export async function deleteMyAccount(): Promise<void> {
  const callable = httpsCallable<void, DeleteMyAccountResponse>(
    functions,
    "deleteMyAccount",
  );

  try {
    const response = await callable();

    console.log("DELETE MY ACCOUNT RESPONSE:", response.data);
  } catch (error) {
    console.log("DELETE MY ACCOUNT CALLABLE ERROR:", error);
    throw error;
  }
}
