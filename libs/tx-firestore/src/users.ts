import { GetFirestore } from "../../utils-ts/build/firestore";
//
// Functions relating to users
//
// TODO: migrate fn's from utilities to here

export async function fetchAllUsers() {
  const allUsers = await GetFirestore().collection("User").get();
  return allUsers.docs.map(user => user.id);
}
