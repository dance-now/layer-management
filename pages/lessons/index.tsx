import type { NextPage } from "next";

import { useEffect, useState } from "react";
import { db } from "../../src/lib/firebase";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  DocumentData,
} from "firebase/firestore";
import styles from "../../styles/Home.module.css";
import Link from "next/link";

const Lesson: NextPage = () => {
  const japanStandardTime = new Date().toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
  });
  const now = new Date(japanStandardTime);
  const [month, setMonth] = useState<number>(now.getFullYear());
  const [yaer, setYaer] = useState<number>(now.getHours() + 1);
  const [lessons, setLessons] = useState<any>([]);
  const selectYear = [now.getFullYear(), now.getFullYear() + 1];
  useEffect(() => {
    getLessons();
  }, []);

  const getPeriodLessons = () => {
    const lessons = getLessons();
  };

  const getLessons = async () => {
    const lessonList: DocumentData[] = [];
    const userRef = getDocs(collection(db, "lessons"));
    (await userRef).forEach((doc) => {
      lessonList.push(doc.data());
    });
    setLessons(lessonList);
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1>レッスン一覧</h1>

        <select
          value={yaer}
          onChange={(e) => {
            setYaer(Number(e.target.value));
          }}
        >
          <option>年を選択</option>
          {selectYear.map((year) => (
            <option value={year} key={year}>
              {year}
            </option>
          ))}
        </select>
        <select
          value={month}
          onChange={(e) => {
            setMonth(Number(e.target.value));
          }}
        >
          <option>月を選択</option>
          {[...Array(12)].map((_, index) => (
            <option value={index + 1} key={index}>
              {index + 1}
            </option>
          ))}
        </select>
        <ul>
          {lessons.map((value: { title: any; id: any }) => {
            const { title, id } = value;
            console.log(value);
            return (
              <li key={title}>
                <Link href={`/lessons/${id}`}>{title}</Link>
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
};

export default Lesson;
