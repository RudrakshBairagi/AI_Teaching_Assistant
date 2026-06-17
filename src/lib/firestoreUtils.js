import { db } from "./firebase";
import { collection, doc, setDoc, getDocs, getDoc, deleteDoc, query, orderBy, serverTimestamp } from "firebase/firestore";

// Save a session
export async function saveSessionToFirestore(uid, sessionId, conversationHistory) {
  if (!uid || !sessionId) return;
  const sessionRef = doc(db, "users", uid, "sessions", sessionId);
  
  // Create a title based on the first user message, or default to 'New Chat'
  const firstUserMessage = conversationHistory.find(msg => msg.role === "user");
  let title = firstUserMessage ? firstUserMessage.content.slice(0, 40) : "New Chat";
  if (firstUserMessage && firstUserMessage.content.length > 40) title += "...";

  await setDoc(sessionRef, {
    sessionId,
    title,
    conversationHistory,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

// Fetch all sessions for a user
export async function getUserSessions(uid) {
  if (!uid) return [];
  const sessionsRef = collection(db, "users", uid, "sessions");
  const q = query(sessionsRef, orderBy("updatedAt", "desc"));
  
  const snapshot = await getDocs(q);
  const sessions = [];
  snapshot.forEach(doc => {
    sessions.push({ id: doc.id, ...doc.data() });
  });
  
  return sessions;
}

// Fetch a specific session
export async function getSessionById(uid, sessionId) {
  if (!uid || !sessionId) return null;
  const sessionRef = doc(db, "users", uid, "sessions", sessionId);
  const snapshot = await getDoc(sessionRef);
  if (snapshot.exists()) {
    return snapshot.data();
  }
  return null;
}

// Delete a session
export async function deleteSessionFromFirestore(uid, sessionId) {
  if (!uid || !sessionId) return;
  const sessionRef = doc(db, "users", uid, "sessions", sessionId);
  await deleteDoc(sessionRef);
}
