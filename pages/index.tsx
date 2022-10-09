import type { NextPage } from "next";

import { useState } from "react";
import { db } from "../src/lib/firebase";
import { collection, getDocs, DocumentData } from "firebase/firestore";
import styles from "../styles/Home.module.css";
import Papa from "papaparse";
import Encoding from "encoding-japanese";

const Home: NextPage<any> = ({}) => {
  const japanStandardTime = new Date().toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
  });
  const now = new Date(japanStandardTime);
  const [month, setMonth] = useState<number>(7);
  const [yaer, setYaer] = useState<number>(2022);
  const [totalSales, setTotalSales] = useState<number | null>(null);
  const [lessonData, setLessonData] = useState<DocumentData[]>();
  const [instructorData, setInstructorData] = useState<any>();
  const selectYear = [now.getFullYear(), now.getFullYear() + 1];

  // レッスンの売上とレッスン情報を取得
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
        startDatetime.getMonth() === month;

      isPeriodLesson && setTotalSales(totalSales + value.sales);
      return isPeriodLesson;
    });

    setLessonData(periodLessons);
    formatHostLesson(periodLessons);
  };

  // その月でおこなれたレッスンを開催しているインストラクターのデータ
  const formatHostLesson = (periodLessons: any[]) => {
    const newInstructorList: { instructorId: any; sales: any }[] = [];
    // 仮
    const instructorDemo = [
      {
        id: "FwVMsDYQ5cY4bxG4LH7xt9N96Mr2",
        host_lessons: ["0pdbO7XwHG59T0kVFah6"],
      },
      {
        id: "8J9g5RK7ZJV9kavYxXtwg5lRCu33",
        host_lessons: [
          "3PZlX38Twz04QFEtZ5lE",
          "6eupDsFkJccvAJUASFYz",
          "7FaZqZzfDovePziLG1lE",
        ],
      },
    ];
    instructorDemo.forEach(
      async (value: { host_lessons?: string[]; id?: string }) => {
        if (value.host_lessons === undefined) return;
        value.host_lessons.map((id: string, index) => {
          let instructorSales = 0;
          periodLessons.map((lessonDoc: { id: string; sales: number }) => {
            instructorSales = instructorSales + lessonDoc.sales;
            if (index === value.host_lessons!.length - 1) {
              return (
                lessonDoc.id === id &&
                newInstructorList.push({
                  instructorId: id,
                  sales: instructorSales,
                  ...value,
                })
              );
            }
          });
        });
      }
    );

    setInstructorData(newInstructorList);
  };

  const getInstructorBankData = async () => {
    const instructorList: DocumentData[] = [];

    instructorData.forEach(
      async (value: {
        bank: { code: any; brunch: any; type: any; number: any; name: any };
      }) => {
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
      }
    );

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
      ["8", `${instructorList.length}`, String(totalSales), "9"],
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

// export const getStaticProps = async () => {
//   const instructor: DocumentData[] = [];
//   const instructorRef = await getDocs(collection(db, "instructors"));
//   instructorRef.forEach(async (doc) => {
//     if (!doc.exists) return;
//     instructor.push(doc.data());
//   });
//   return {
//     props: { instructor },
//     revalidate: 3,
//   };
// };
