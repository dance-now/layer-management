import type { NextPage } from "next";

import { useRef, useState } from "react";
import { db } from "../src/lib/firebase";
import { collection, getDocs, DocumentData } from "firebase/firestore";
import styles from "../styles/Home.module.css";
import Link from "next/link";

declare global {
  interface Window {
    recaptchaVerifier: any;
    recaptchaWidgetId: any;
  }
}
const Home: NextPage<any> = ({}) => {
  const [step, setStep] = useState(0);
  const buttonText = step === 0 ? "認証番号送信" : "ログインする";
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1>ログイン</h1>
        {/* <p>電話番号を入力</p>
        <input type="text" name="" id="" />
        <button>{buttonText}</button> */}

        <ul>
          <li>
            <button>
              <Link href="/instructor">インストラクター一覧</Link>
            </button>
          </li>
          <li>
            <button>
              <Link href="/lessons">レッスン一覧</Link>
            </button>
          </li>
        </ul>
      </main>
    </div>
  );
};

export default Home;
