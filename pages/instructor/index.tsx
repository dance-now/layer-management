import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";

const Instructor: NextPage = () => {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div>インストラクター一覧</div>
      </main>
    </div>
  );
};

export default Instructor;