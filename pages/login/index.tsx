import type { NextPage } from "next";
import { useEffect, useRef, useState } from "react";
import { auth } from "../../src/lib/firebase";
import styles from "../../styles/Home.module.css";
import Link from "next/link";
import {
  ConfirmationResult,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import { useUserContext } from "../../src/contexts/UserContext";
import Button from "@mui/material/Button";
import { useForm } from "react-hook-form";
import Box from "@mui/material/Box";
import { TextField, Typography } from "@mui/material";
import router from "next/router";

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
  const buttonText = step === 0 ? "認証番号を携帯に送信" : "ログインする";
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
        router.push("/");
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
        <Box
          sx={{
            width: 500,
            px: 15,
            py: 8,
            border: "1px solid grey",
            margin: "auto",
          }}
        >
          <Typography
            variant="h1"
            align="left"
            sx={{ fontSize: 32, fontWeight: "bold" }}
          >
            ログイン
          </Typography>
          <Typography variant="subtitle1" mt={3}>
            {step === 0 ? "電話番号" : "認証番号"}入力
          </Typography>
          <form>
            {step === 0 ? (
              <TextField
                type="tel"
                fullWidth
                {...register("phone", {
                  required: "Required",
                })}
              />
            ) : (
              <TextField
                type="tel"
                fullWidth
                {...register("code", {
                  required: "Required",
                })}
              />
            )}
            <Box margin={3}>
              <Button
                onClick={handleSubmit(step === 0 ? signup : checkCode)}
                fullWidth
                variant="contained"
              >
                {buttonText}
              </Button>
            </Box>
          </form>
        </Box>

        <div ref={(ref) => (recaptchaWrapperRef.current = ref)}>
          <div id="recaptcha-container"></div>
        </div>
      </main>
    </div>
  );
};

export default Home;
