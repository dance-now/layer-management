import type { NextPage } from "next";
import { useEffect } from "react";
import { db } from "../../src/lib/firebase";
import { collection, doc, setDoc, getDocs } from "firebase/firestore";
import styles from "../styles/Home.module.css";

const LessonsPage: NextPage = () => {
  useEffect(() => {
    getUsers();
  }, []);

  const getUsers = async () => {
    const userRef = getDocs(collection(db, "lessons"));
    (await userRef).forEach((doc) => {
      console.log(doc.data());
    });
  };
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div>レッスン一覧</div>
      </main>
    </div>
  );
};

export default LessonsPage;
