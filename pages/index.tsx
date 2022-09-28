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

const Home: NextPage = () => {
  const japanStandardTime = new Date().toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
  });
  const now = new Date(japanStandardTime);
  const [month, setMonth] = useState<number>(now.getFullYear());
  const [yaer, setYaer] = useState<number>(now.getHours() + 1);
  const selectYear = [now.getFullYear(), now.getFullYear() + 1];
  useEffect(() => {
    // getLessons();
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
    return lessonList;
  };

  const getLessonPrice = async (lessons) => {
    let price = 0;
    await lessons.forEach(async (id) => {
      const lessonDoc = doc(db, "lessons", id);
      const lessonsSnapshot = await getDoc(lessonDoc);

      return (
        lessonsSnapshot.data()!.price * lessonsSnapshot.data()!.users.length
      );
    });

    console.log(price);
    return price;
  };

  const getInstructorBankData = async () => {
    const instructorList: DocumentData[] = [];
    const userRef = await getDocs(collection(db, "instructor"));
    userRef.forEach(async (doc) => {
      const price = await getLessonPrice(doc.data().host_lessons);
      console.log("getInstructorBankData", price);
      instructorList.push([
        "2",
        doc.data().bank.code,
        doc.data().bank.brunch,
        doc.data().bank.type,
        doc.data().bank.number,
        doc.data().bank.name,
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
      ["8", `${instructorList.length}`, "合計金額", "9"],
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
      </main>
    </div>
  );
};

export default Home;
