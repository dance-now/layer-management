import type { GetStaticPaths } from "next";

import { useState } from "react";
import { db } from "../../../src/lib/firebase";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  arrayRemove,
  updateDoc,
} from "firebase/firestore";

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
import { refundApi } from "../../../src/services/refundApi";

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

const LessonId = ({ lesson, purchases }: any) => {
  const [users, setUsers] = useState(lesson.users);

  const lessonDelete = (uid: string) => {
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
      // //purchasesからをstatusをcancelに
      purchases.map((value: any) => {
        if (value.uid === uid) {
          const purchasesDoc = doc(db, "purchases", value.id);
          const cancel = () => {
            updateDoc(purchasesDoc, {
              status: "cancel",
            });
          };

          if (value.status === "succeeded") {
            const stripe_payment_intent_id = value.stripe_payment_intent_id;
            cancel();
            // stripeで削除
            refundApi(stripe_payment_intent_id);
          } else {
            cancel();
          }
        }
      });
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
            {users.map((uid: string) => {
              return (
                <StyledTableRow key={uid}>
                  <StyledTableCell component="th" scope="row">
                    {uid}
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    <Button onClick={() => lessonDelete(uid)}>削除</Button>
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
  const lessonId = params.id as string;
  const lessonDoc = doc(db, "lessons", lessonId);
  const purchasesList: any = [];
  const lessonsSnapshot = await getDoc(lessonDoc);
  const lesson = JSON.parse(JSON.stringify(lessonsSnapshot.data()));
  const purchasesRef = getDocs(collection(db, "purchases"));
  (await purchasesRef).forEach((doc) => {
    const id = doc.id;
    doc.data().lesson_id == lessonId &&
      purchasesList.push(JSON.parse(JSON.stringify({ ...doc.data(), id })));
  });
  return {
    props: { lesson, purchases: purchasesList },
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
