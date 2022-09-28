import type { GetStaticPaths, NextPage } from "next";

import { useEffect, useState } from "react";
import { db } from "../../../src/lib/firebase";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  DocumentData,
} from "firebase/firestore";
import styles from "../../../styles/Home.module.css";
import Link from "next/link";

const LessonId: NextPage = ({ id }) => {
  console.log(id);
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1>レッスン詳細</h1>
      </main>
    </div>
  );
};

export default LessonId;

export const getStaticProps = async ({ params }: any) => {
  const id = params.id as string;

  return {
    props: { id },
    revalidate: 3,
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const lessonsSnapshot = await getDocs(collection(db, "lessons"));
    const refs: string[] = [];
    lessonsSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data && data.ref) {
        console.log("Store: Firebase path data", data.ref);
        refs.push(data.ref);
      }
    });
    const paths = refs.map((ref: string) => {
      return {
        params: {
          ref,
        },
      };
    });
    return { paths, fallback: "blocking" };
  } catch (error) {
    console.log(error);
    return { paths: [], fallback: "blocking" };
  }
};
