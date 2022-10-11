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
import Chip from "@mui/material/Chip";
import Link from "next/link";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Layout from "../../../src/layouts/Layout";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";

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

const LessonId: NextPage = ({ lesson }: any) => {
  const [users, setUsers] = useState(lesson.users);

  useEffect(() => {
    lesson.users.map((id: string) => {});
  }, []);

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
    <Layout header={`レッスン一覧 / ${lesson.title}`}>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 700 }} aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell>ID</StyledTableCell>
              <StyledTableCell align="right">詳削除細</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((value: string) => {
              return (
                <StyledTableRow key={value}>
                  <StyledTableCell component="th" scope="row">
                    {value}
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    <Button onClick={() => lessonDelete(value)}>削除</Button>
                  </StyledTableCell>
                </StyledTableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Layout>
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
    return { paths: [], fallback: "blocking" };
  }
};
