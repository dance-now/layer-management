import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";
import { db } from "../src/lib/firebase";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  DocumentData,
  getDoc,
} from "firebase/firestore";
import styles from "../styles/Home.module.css";
import Papa from "papaparse";
import Encoding from "encoding-japanese";

const Home: NextPage = ({ instructor }) => {
  const japanStandardTime = new Date().toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
  });
  const now = new Date(japanStandardTime);
  const [month, setMonth] = useState<number | null>(7);
  const [yaer, setYaer] = useState<number | null>(2022);
  const [sales, setSales] = useState<number | null>(null);
  const [lessonData, setLessonData] = useState<DocumentData[]>();
  const [instructorData, setInstructorData] = useState<any>();
  const selectYear = [now.getFullYear(), now.getFullYear() + 1];

  const getLessons = async () => {
    const lessonList: DocumentData[] = [];
    const lessonsRef = getDocs(collection(db, "lessons"));
    (await lessonsRef).forEach((doc) => {
      const sales = doc.data()!.price * doc.data()!.users.length;
      lessonList.push({ ...doc.data(), sales });
    });
    return lessonList;
  };

  // 指定した年月で開催されたあったレッスン
  const getPeriodLessons = async () => {
    if (!month || !yaer) return;
    const lessons = getLessons();
    const periodLessons = (await lessons).filter((value) => {
      const startDatetime = new Date(
        value.start_datetime
          .toDate()
          .toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })
      );

      const isPeriodLesson =
        startDatetime.getFullYear() === yaer &&
        startDatetime.getMonth() + 1 === month;

      isPeriodLesson && setSales(sales + value.sales);
      return isPeriodLesson;
    });

    setLessonData(periodLessons);
    formatHostLesson(periodLessons);
  };

  const formatHostLesson = (periodLessons) => {
    const newInstructorList: { id: any; sales: any }[] = [];
    instructor.forEach(async (value) => {
      value.host_lessons.forEach((id) => {
        periodLessons.map((lessonDoc) => {
          return (
            lessonDoc.id === id &&
            newInstructorList.push({ id, sales: lessonDoc.sales, ...value })
          );
        });
      });
    });

    setInstructorData(newInstructorList);
  };

  const getInstructorBankData = async () => {
    const instructorList: DocumentData[] = [];

    instructorData.forEach(async (value) => {
      instructorList.push([
        "2",
        value.bank.code,
        value.bank.brunch,
        value.bank.type,
        value.bank.number,
        value.bank.name,
        "送金金額",
        `00${instructorList.length + 1}`,
      ]);
    });

    return [
      [
        "1",
        "21",
        "0",
        "0100303570",
        "ｶﾌﾞｼｷｶﾞｲｼｬﾀﾞﾝｽﾅｳ",
        "0930",
        "0036",
        "251",
        "1",
        "7787950",
      ],
      ...instructorList,
      ["8", `${instructorList.length}`, String(sales), "9"],
    ];
  };

  const csvExport = async () => {
    const instructorList = await getInstructorBankData();
    const config = {
      delimiter: ",", // 区切り文字
      header: true, // キーをヘッダーとして扱う
      newline: "\r\n", // 改行
    };

    // 区切り文字へ変換
    const delimiterString = Papa.unparse(instructorList, config);

    // blodへの変換
    const strArray = Encoding.stringToCode(delimiterString);
    const convertedArray = Encoding.convert(strArray, "UTF8", "UNICODE");
    const UintArray = new Uint8Array(convertedArray);
    const blob = new Blob([UintArray], { type: "text/csv" });

    // download
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = `back.csv`;
    link.click();
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        ログイン
        <button onClick={csvExport}>全銀データエクスポート</button>
        <select
          value={yaer}
          onChange={(e) => {
            setYaer(Number(e.target.value));
            getPeriodLessons();
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
            getPeriodLessons();
          }}
        >
          <option>月を選択</option>
          {[...Array(12)].map((_, index) => (
            <option value={index + 1} key={index}>
              {index + 1}
            </option>
          ))}
        </select>
      </main>
    </div>
  );
};

export default Home;

export const getStaticProps = async () => {
  const instructor: DocumentData[] = [];
  const instructorRef = await getDocs(collection(db, "instructor"));
  instructorRef.forEach(async (doc) => {
    if (!doc.exists) return;
    instructor.push(doc.data());
  });
  return {
    props: { instructor },
    revalidate: 3,
  };
};
