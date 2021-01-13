import { GetFirestore } from "@the-coin/utilities/firestore";
//
// Functions relating to users
//
// TODO: migrate fn's from utilities to here

// List all users.  This function will fail on client apps (ie - electron)
// See error message for details
export async function fetchAllUsers() {
  const userCollection = GetFirestore().collection("User");
  // TODO: This throws on the current implementation of FakeFirestore - should add this implementation
  if (!userCollection.listDocuments) {
    // If we want to do this we could provide an alternative implementation (?)
    throw new Error("Attempting to use server-side API from client library");
  }
  const allUsers = await userCollection.listDocuments();
  return allUsers.map(user => user.id);
}
