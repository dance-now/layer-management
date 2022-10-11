import type { NextPage } from "next";
import { useEffect, useRef, useState } from "react";
import { auth, db } from "../../src/lib/firebase";
import { collection, getDocs, DocumentData } from "firebase/firestore";
import styles from "../styles/Home.module.css";
import Link from "next/link";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { useUserContext } from "../../src/contexts/UserContext";
import Button from "@mui/material/Button";

declare global {
  interface Window {
    recaptchaVerifier: any;
    recaptchaWidgetId: any;
  }
}
const Home: NextPage<any> = ({}) => {
  const { user } = useUserContext();
  const [step, setStep] = useState(0);
  const [code, setCode] = useState<string>("");
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const applicationVerifier = useRef<any>(null);
  const recaptchaWrapperRef = useRef<any>(null);
  const buttonText = step === 0 ? "認証番号送信" : "ログインする";
  useEffect(() => {
    setupRecaptcha();
  }, []);

  const setupRecaptcha = () => {
    if (applicationVerifier.current && recaptchaWrapperRef.current) {
      applicationVerifier.current.clear();
      recaptchaWrapperRef.current.innerHTML = `<div id="recaptcha-container"></div>`;
    }

    applicationVerifier.current = new RecaptchaVerifier(
      "recaptcha-container",
      {
        size: "invisible",
      },
      auth
    );
  };

  const signup = () => {
    signInWithPhoneNumber(auth, "+818083645815", applicationVerifier.current)
      .then((confirmationResult) => {
        setConfirmationResult(confirmationResult);
        setStep(1);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const checkCode = () => {
    confirmationResult
      .confirm(code)
      .then((result: any) => {
        const user = result.user;
        console.log(user);
      })
      .catch((error: any) => {
        console.log(error);
        // User couldn't sign in (bad verification code?)
        // ...
      });
  };
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        {user ? (
          <>
            <h1>ログイン中</h1>
            <Button variant="contained">
              <Link href="/instructor">インストラクター</Link>
            </Button>
            <Button variant="contained">
              <Link href="/lessons">レッスン</Link>
            </Button>
          </>
        ) : (
          <>
            <h1>ログイン</h1>
            <p>認証番号を入力</p>
            <input
              type="text"
              onChange={(e) => setCode(e.target.value)}
              name=""
              id=""
            />
            <Button
              variant="contained"
              onClick={step === 0 ? signup : checkCode}
            >
              {buttonText}
            </Button>
          </>
        )}
        <div ref={(ref) => (recaptchaWrapperRef.current = ref)}>
          <div id="recaptcha-container"></div>
        </div>
      </main>
    </div>
  );
};

export default Home;
