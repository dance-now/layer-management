import type { NextPage } from "next";

import { useEffect, useRef, useState } from "react";
import { auth, db } from "../src/lib/firebase";
import { collection, getDocs, DocumentData } from "firebase/firestore";
import styles from "../styles/Home.module.css";
import Link from "next/link";
import { useUserContext } from "../src/contexts/UserContext";
import Button from "@mui/material/Button";
import { Label } from "@mui/icons-material";
import Layout from "../src/layouts/Layout";

const Home: NextPage<any> = ({}) => {
  const { user } = useUserContext();

  return (
    <Layout header="ログイン中">
      <div></div>
    </Layout>
  );
};

export default Home;
