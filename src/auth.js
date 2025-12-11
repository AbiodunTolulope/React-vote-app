import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "./firebase";

export const doCreateWithEmailAndPassword = async (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const doSignInWithGoogle = async () => {
  const provider = GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);

  return result;
};

export const doSignOut = () => {
  return auth.signOut();
};

