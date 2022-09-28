import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useEffect } from "react";
import { db } from "../src/lib/firebase";
import { collection, doc, setDoc, getDocs } from "firebase/firestore";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
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
      <main className={styles.main}>ログイン</main>
    </div>
  );
};

export default Home;
