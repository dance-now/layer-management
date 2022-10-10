import type { GetStaticPaths, NextPage } from "next";

import { useEffect, useState } from "react";
import { db } from "../../../src/lib/firebase";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  arrayRemove,
  updateDoc,
} from "firebase/firestore";
import styles from "../../../styles/Home.module.css";

const LessonId: NextPage = ({ lesson }: any) => {
  const [users, setUsers] = useState(lesson.users);
  const lessonDelete = (uid: any) => {
    if (window.confirm("本当に削除しますか？")) {
      updateDoc(doc(db, "lessons", lesson.id), {
        users: arrayRemove(uid),
      });
      updateDoc(doc(db, "users", uid), {
        purchased_lessons: arrayRemove(lesson.id),
      });
      const deleteUsers = users.filter((id: string) => {
        return uid !== id;
      });
      setUsers(deleteUsers);

      //purchasesからをstatusをcancelに

      // stripeで削除
    } else {
      return;
    }
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1>レッスン詳細</h1>
        <ul>
          {users.map((value: any) => {
            return (
              <li
                key={value}
                style={{
                  display: "flex",
                  margin: 16,
                  padding: 4,
                  border: "1px solid black",
                }}
              >
                <div>{value}</div>
                <button onClick={() => lessonDelete(value)}>削除</button>
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
};

export default LessonId;

export const getStaticProps = async ({ params }: any) => {
  const id = params.id as string;
  const lessonDoc = doc(db, "lessons", id);
  const lessonsSnapshot = await getDoc(lessonDoc);
  const lesson = JSON.parse(JSON.stringify(lessonsSnapshot.data()));

  return {
    props: { lesson },
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
