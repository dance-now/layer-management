import type { NextPage } from "next";

import { useEffect, useState } from "react";
import { db } from "../../src/lib/firebase";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  DocumentData,
} from "firebase/firestore";
import Chip from "@mui/material/Chip";
import Link from "next/link";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Layout from "../../src/layouts/Layout";
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 8,
};

const Lesson: NextPage = () => {
  const japanStandardTime = new Date().toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
  });
  const now = new Date(japanStandardTime);
  const [month, setMonth] = useState<number>(now.getFullYear());
  const [yaer, setYaer] = useState<number>(now.getHours() + 1);
  const [lessons, setLessons] = useState<any>([]);
  const selectYear = [now.getFullYear(), now.getFullYear() + 1];
  useEffect(() => {
    getLessons();
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
    setLessons(lessonList);
  };

  return (
    <Layout header="レッスン一覧">
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 700 }} aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell>レッスン名</StyledTableCell>
              <StyledTableCell>ステータス</StyledTableCell>
              <StyledTableCell align="right">詳細</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lessons.map(
              (value: { title: any; id: any; start_datetime: any }) => {
                const startDatetime = new Date(
                  value.start_datetime
                    .toDate()
                    .toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })
                );
                const statusText =
                  now.getTime() >= startDatetime.getTime() ? (
                    <Chip label="開催前" />
                  ) : (
                    <Chip label="開催後" color="primary" />
                  );

                const { title, id } = value;
                return (
                  <StyledTableRow key={title}>
                    <StyledTableCell component="th" scope="row">
                      {title}
                    </StyledTableCell>
                    <StyledTableCell component="th" scope="row">
                      {statusText}
                    </StyledTableCell>
                    <StyledTableCell align="right">
                      <Button>
                        <Link href={`/lessons/${id}`}>詳細</Link>
                      </Button>
                    </StyledTableCell>
                  </StyledTableRow>
                );
              }
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Layout>
  );
};

export default Lesson;
