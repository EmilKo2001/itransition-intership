import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, db } from "../firebase";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

const UserContext = createContext();

const getUser = async (id) => {
  const colRef = collection(db, "users");
  const queryRef = query(colRef, where("userid", "==", id));

  try {
    const docSnap = await getDocs(queryRef);
    if (docSnap.size > 0) {
      let user;
      docSnap.forEach((doc) => {
        user = doc.data();
      });
      return user;
    } else {
      console.log("No such document");
    }
  } catch (err) {
    console.error("Error getting document:", err.message);
  }
};

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState({});
  const [isUserLoaded, setIsUserLoaded] = useState(false);

  const createUser = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const signIn = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser({ ...currentUser, ...(await getUser(currentUser.uid)) });
      }
      setIsUserLoaded(true);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <UserContext.Provider
      value={{ createUser, user, logout, signIn, isUserLoaded }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const UserAuth = () => {
  return useContext(UserContext);
};
