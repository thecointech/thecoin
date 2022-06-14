import { getUserCollection } from "./user.js";

//
// List all users.  This may not be 100% reliable on client apps
// due to the missing listDocuments function.
export async function getAllUsers() {
  const userCollection = getUserCollection();
  // listDocuments is preferable to collection.get because it contains
  // documents with no data (these are ignored in get implementation)
  if (userCollection.listDocuments) {
    const allUsers = await userCollection.listDocuments();
    return allUsers.map(user => user.id);
  }
  else {
    // Basic implementation will skip users with no data present
    const qs = await userCollection.get();
    return [...qs.docs].map(c => c.id);
  }
}
