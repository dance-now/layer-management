import type { NextPage } from "next";

import { useEffect, useState } from "react";
import { db } from "../../src/lib/firebase";
import {
  collection,
  getDocs,
  DocumentData,
  doc,
  updateDoc,
} from "firebase/firestore";
import styles from "../../styles/Home.module.css";
import Papa from "papaparse";
import Encoding from "encoding-japanese";

const Instructor: NextPage<any> = ({ instructor }) => {
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
      // paypayなどで先に入金している
      const otherPaymentUsersLength =
        doc.data().other_payment_users === undefined
          ? 0
          : doc.data().other_payment_users.length;
      // 運営の人が入っている場合売上を引く
      const testID = "";
      const users = doc.data()!.users.includes(testID)
        ? doc.data()!.users.length - otherPaymentUsersLength - 1
        : doc.data()!.users.length - otherPaymentUsersLength;
      const sales = doc.data()!.price * users;
      lessonList.push({ ...doc.data(), sales });
    });
    return lessonList;
  };

  // 指定した年月で開催されたあったレッスン
  const getPeriodLessons = async () => {
    if (!month || !yaer) return;
    const lessons = getLessons();
    let periodLessonsSales = 0;
    const periodLessons = (await lessons).filter((value) => {
      const startDatetime = new Date(
        value.start_datetime
          .toDate()
          .toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })
      );

      const isPeriodLesson =
        startDatetime.getFullYear() === yaer &&
        startDatetime.getMonth() === month;
      if (isPeriodLesson) periodLessonsSales = periodLessonsSales + value.sales;
      return isPeriodLesson;
    });

    setTotalSales(periodLessonsSales);
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
        account_name: "ｲﾏﾑﾗｼｮｳﾀﾛｳ",
        account_number: "1234567",
        address: "三重県四日市市浮橋",
        approval_flg: false,
        bank_branch_code: "011",
        bank_code: "0001",
        deposit_type: "2",
        phone_number: "08069242688",
        potal_code: "1670032",
        user_name: "imamura",
      },
      {
        id: "8J9g5RK7ZJV9kavYxXtwg5lRCu33",
        host_lessons: [
          "3PZlX38Twz04QFEtZ5lE",
          "6eupDsFkJccvAJUASFYz",
          "7FaZqZzfDovePziLG1lE",
        ],
        account_name: "ｿﾗ ﾋﾛｾ",
        account_number: "1234567",
        address: "三重県四日市市浮橋",
        approval_flg: false,
        bank_branch_code: "012",
        bank_code: "0002",
        deposit_type: "1",
        phone_number: "08069242688",
        potal_code: "1670032",
        user_name: "imamura",
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
                  sales: String(instructorSales),
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
        account_name: any;
        account_number: any;
        bank_branch_code: any;
        bank_code: any;
        deposit_type: any;
        sales: any;
      }) => {
        instructorList.push([
          "2",
          value.bank_code,
          value.bank_branch_code,
          value.deposit_type,
          value.account_number,
          value.account_name,
          value.sales,
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

  const onChangeApprovalFlg = async (approval_flg: boolean, id: string) => {
    const instructorRef = doc(db, "instructors", id);
    await updateDoc(instructorRef, {
      approval_flg: !approval_flg,
    });
    location.reload();
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <button onClick={csvExport}>全銀データエクスポート</button>
        <select
          value={yaer}
          onChange={(e) => {
            setYaer(Number(e.target.value));
            getPeriodLessons();
          }}
        >
          <option key={"default"}>年を選択</option>
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

        <ol type="1">
          {instructor.map(
            (value: { user_name: any; approval_flg: any; id: any }) => {
              const { user_name, approval_flg, id } = value;
              const buttonContents = approval_flg
                ? {
                    text: "承認済み",
                    event: () => onChangeApprovalFlg(approval_flg, id),
                  }
                : {
                    text: "未承認",
                    event: () => onChangeApprovalFlg(approval_flg, id),
                  };
              return (
                <li key={id}>
                  {user_name}
                  <button onClick={buttonContents.event}>
                    {buttonContents.text}
                  </button>
                </li>
              );
            }
          )}
        </ol>
      </main>
    </div>
  );
};

export default Instructor;

export const getStaticProps = async () => {
  const instructorList: DocumentData[] = [];
  const instructorRef = await getDocs(collection(db, "instructors"));
  instructorRef.forEach(async (doc) => {
    console.log(doc.data());
    if (!doc.exists) return;
    const instructor = JSON.parse(JSON.stringify(doc.data()));
    instructorList.push(instructor);
  });
  return {
    props: { instructor: instructorList },
    revalidate: 3,
  };
};
