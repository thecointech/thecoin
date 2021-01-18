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
    // Basic implementation may skip some early users.
    const qs = await userCollection.get();
    return qs.docs.map(c => c.id);
  }
  else {
    const allUsers = await userCollection.listDocuments();
    return allUsers.map(user => user.id);
  }
}
