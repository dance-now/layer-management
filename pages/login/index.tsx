import type { NextPage } from "next";
import { useEffect, useRef, useState } from "react";
import { auth } from "../../src/lib/firebase";
import styles from "../styles/Home.module.css";
import Link from "next/link";
import {
  ConfirmationResult,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import { useUserContext } from "../../src/contexts/UserContext";
import Button from "@mui/material/Button";
import { useForm } from "react-hook-form";

declare global {
  interface Window {
    recaptchaVerifier: any;
    recaptchaWidgetId: any;
  }
}

const Home: NextPage<any> = ({}) => {
  const { user } = useUserContext();
  const [step, setStep] = useState<number>(0);
  const [code, setCode] = useState<string>("");
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const applicationVerifier = useRef<any>(null);
  const recaptchaWrapperRef = useRef<any>(null);
  const buttonText = step === 0 ? "認証番号送信" : "ログインする";
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({
    defaultValues: {
      code: "",
      phone: "",
    },
  });

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

  const signup = (data: { phone: string }) => {
    const phone = `+81${data.phone.slice(1)}`;
    signInWithPhoneNumber(auth, phone, applicationVerifier.current)
      .then((confirmationResult: ConfirmationResult) => {
        setConfirmationResult(confirmationResult);
        setStep(1);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const checkCode = (data: { code: string }) => {
    confirmationResult
      .confirm(data.code)
      .then((result: any) => {
        const user = result.user;
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
            <form onSubmit={handleSubmit(step === 0 ? signup : checkCode)}>
              {step === 0 ? (
                <input
                  type="tel"
                  {...register("phone", {
                    required: "Required",
                  })}
                />
              ) : (
                <input
                  type="tel"
                  {...register("code", {
                    required: "Required",
                  })}
                />
              )}
              <Button variant="contained">{buttonText}</Button>
            </form>
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
