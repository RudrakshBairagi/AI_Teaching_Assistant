import { db } from "./firebase";
import { collection, doc, setDoc, getDocs, getDoc, deleteDoc, query, orderBy, serverTimestamp, onSnapshot } from "firebase/firestore";

// Save a session
export async function saveSessionToFirestore(sessionId, conversationHistory) {
  if (!sessionId) return;
  const sessionRef = doc(db, "global_sessions", sessionId);
  
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

// Fetch all sessions globally
export async function getUserSessions() {
  const sessionsRef = collection(db, "global_sessions");
  const q = query(sessionsRef, orderBy("updatedAt", "desc"));
  
  const snapshot = await getDocs(q);
  const sessions = [];
  snapshot.forEach(doc => {
    sessions.push({ id: doc.id, ...doc.data() });
  });
  
  return sessions;
}

// Subscribe to sessions in real-time
export function subscribeToUserSessions(callback) {
  const sessionsRef = collection(db, "global_sessions");
  const q = query(sessionsRef, orderBy("updatedAt", "desc"));
  
  return onSnapshot(q, (snapshot) => {
    const sessions = [];
    snapshot.forEach(doc => {
      sessions.push({ id: doc.id, ...doc.data() });
    });
    callback(sessions);
  });
}

// Fetch a specific session
export async function getSessionById(sessionId) {
  if (!sessionId) return null;
  const sessionRef = doc(db, "global_sessions", sessionId);
  const snapshot = await getDoc(sessionRef);
  if (snapshot.exists()) {
    return snapshot.data();
  }
  return null;
}

// Delete a session
export async function deleteSessionFromFirestore(sessionId) {
  if (!sessionId) return;
  const sessionRef = doc(db, "global_sessions", sessionId);
  await deleteDoc(sessionRef);
}
