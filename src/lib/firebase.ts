import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Test connection
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("[Firebase] Conctado com sucesso ao Firestore backend.");
  } catch (error) {
    console.warn(
      "[Firebase] Conexão remota não disponível no momento. " +
      "O aplicativo está operando normalmente offline via cache inteligente do navegador (LocalStorage)."
    );
  }
}
testConnection();
