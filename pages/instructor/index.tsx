import * as React from "react";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { db } from "../../src/lib/firebase";
import {
  collection,
  getDocs,
  DocumentData,
  doc,
  getDoc,
  updateDoc,
  DocumentSnapshot,
} from "firebase/firestore";
import Papa from "papaparse";
import Encoding from "encoding-japanese";
import Layout from "../../src/layouts/Layout";
import Modal from "@mui/material/Modal";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

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
const Instructor: NextPage<any> = ({ instructor }) => {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const japanStandardTime = new Date().toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
  });
  const now = new Date(japanStandardTime);
  const [month, setMonth] = useState<number>(7);
  const [yaer, setYaer] = useState<number>(2022);
  const [totalSales, setTotalSales] = useState<number | null>(null);
  const [instructorData, setInstructorData] = useState<any>();
  const [othercPaymentCount, setOthercPaymentCount] = useState<any>();
  const selectYear = [
    now.getFullYear() - 1,
    now.getFullYear(),
    now.getFullYear() + 1,
  ];

  useEffect(() => {
    getInstructorLesson();
    getOthercPaymentCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getOthercPaymentCount = async () => {
    const purchasesRef = getDocs(collection(db, "purchases"));
    let count: any = {};
    (await purchasesRef).forEach(function (doc) {
      if (doc.data().status === "otherPayment") {
        const id = doc.data().lesson_id;
        count[id] = (count[id] || 0) + 1;
      }
    });
    setOthercPaymentCount(count);
  };

  const getInstructorLesson = async () => {
    const instructorList: any[] = [];
    instructor.forEach(async (value: any) => {
      //???????????????????????????????????????????????????
      const userDoc = doc(db, "users", value.id);
      const userData: DocumentSnapshot<DocumentData> = await getDoc(userDoc);
      if (userData.data() !== undefined) {
        await instructorList.push({
          ...value,
          purchasedLessons: userData.data()!.purchased_lessons,
        });
      }
    });

    await setInstructorData(instructorList);
  };

  // ???????????????????????????????????????????????????
  const getLessons = async () => {
    const lessonList: DocumentData[] = [];
    const lessonsRef = getDocs(collection(db, "lessons"));
    (await lessonsRef).forEach((doc) => {
      // paypay?????????????????????????????????
      const otherPaymentUsersLength =
        othercPaymentCount[doc.id] === undefined
          ? 0
          : othercPaymentCount[doc.id];

      // ???????????????????????????????????????????????????
      const testID = "";
      const users = doc.data()!.users.includes(testID)
        ? doc.data()!.users.length - otherPaymentUsersLength - 1
        : doc.data()!.users.length - otherPaymentUsersLength;

      const sales = doc.data()!.price * users;
      lessonList.push({ ...doc.data(), sales });
    });
    return lessonList;
  };

  const getPeriodLessons = async (yaer: number, month: number) => {
    const lessons = await getLessons();
    let periodLessonsSales = 0;
    const periodLessons = (await lessons).filter((value) => {
      const startDatetime = new Date(
        value.start_datetime
          .toDate()
          .toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }, value.id)
      );

      const isPeriodLesson =
        startDatetime.getFullYear() === yaer &&
        startDatetime.getMonth() + 1 === month;

      if (isPeriodLesson) periodLessonsSales = periodLessonsSales + value.sales;
      return isPeriodLesson;
    });

    await setTotalSales(periodLessonsSales); // ????????????????????????????????????
    await formatHostLesson(periodLessons); // ????????????????????????????????????????????????????????????????????????????????????????????????????????????
  };

  const formatHostLesson = async (periodLessons: any[]) => {
    const newInstructorList: { sales: any }[] = [];

    await instructorData.forEach(
      async (value: { purchasedLessons?: string[]; id?: string }) => {
        const instructorId = value.id;
        let instructorSales = 0;
        periodLessons.map(
          (
            lessonDoc: {
              id: string;
              sales: number;
              instructor_uid: string;
            },
            index
          ) => {
            const hostLessonId = lessonDoc.instructor_uid === instructorId;
            if (hostLessonId) {
              instructorSales = instructorSales + lessonDoc.sales;
            }
            if (index === periodLessons.length - 1) {
              newInstructorList.push({
                sales: String(instructorSales),
                ...value,
              });
            }
          }
        );
      }
    );

    await setInstructorData(newInstructorList);
  };

  const getInstructorBankData = async () => {
    const instructorList: DocumentData[] = [];

    instructorData.forEach(
      async (value: {
        account_name: string;
        account_number: string;
        bank_branch_code: string;
        bank_code: string;
        deposit_type: string;
        sales: string;
      }) => {
        instructorList.push([
          "2",
          value.bank_code,
          " ",
          value.bank_branch_code,
          " ",
          " ",
          value.deposit_type,
          value.account_number,
          value.account_name,
          value.sales,
          "1",
          `00${instructorList.length + 1}`,
          " ",
          " ",
          " ",
          "",
        ]);
      }
    );

    return [
      [
        "1",
        "21",
        "0",
        "0100303570",
        "????????????????????????????????????????????????",
        "0930",
        "0036",
        " ",
        "251",
        " ",
        "1",
        "7787950",
        "",
      ],
      ...instructorList,
      ["8", `${instructorList.length}`, String(totalSales), ""],
      ["9", ""],
    ];
  };

  const csvExport = async () => {
    const instructorList = await getInstructorBankData();
    const config = {
      delimiter: ",", // ???????????????
      header: true, // ????????????????????????????????????
      newline: "\r\n", // ??????
    };

    // ????????????????????????
    const delimiterString = Papa.unparse(instructorList, config);

    // blod????????????
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
    if (window.confirm("??????????????????")) {
      const instructorRef = doc(db, "instructors", id);
      await updateDoc(instructorRef, {
        approval_flg: !approval_flg,
      });
      location.reload();
    }
  };

  return (
    <Layout
      header="??????????????????????????????"
      headerLeftContents={
        <Button variant="contained" onClick={handleOpen}>
          ???????????????Export
        </Button>
      }
    >
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 700 }} aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell>???????????????????????????</StyledTableCell>
              <StyledTableCell align="right">??????</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {instructor.map(
              (value: { user_name: any; approval_flg: any; id: any }) => {
                const { user_name, approval_flg, id } = value;
                const buttonContents = approval_flg
                  ? {
                      text: "????????????",
                      event: () => onChangeApprovalFlg(approval_flg, id),
                    }
                  : {
                      text: "?????????",
                      event: () => onChangeApprovalFlg(approval_flg, id),
                    };
                return (
                  <StyledTableRow key={user_name}>
                    <StyledTableCell component="th" scope="row">
                      {user_name}
                    </StyledTableCell>

                    <StyledTableCell align="right">
                      <Button onClick={buttonContents.event}>
                        {buttonContents.text}
                      </Button>
                    </StyledTableCell>
                  </StyledTableRow>
                );
              }
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <FormControl margin="normal" fullWidth>
            <InputLabel id="demo-simple-select-label">????????????</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={yaer}
              label="yaer"
              onChange={(e) => {
                setYaer(Number(e.target.value));
                getPeriodLessons(Number(e.target.value), month);
              }}
            >
              {selectYear.map((year) => (
                <MenuItem value={year} key={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl margin="normal" fullWidth>
            <InputLabel id="demo-simple-select-label">????????????</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={month}
              label="Age"
              onChange={(e) => {
                setMonth(Number(e.target.value));
                getPeriodLessons(yaer, Number(e.target.value));
              }}
            >
              {[...Array(12)].map((_, index) => (
                <MenuItem value={index + 1} key={index}>
                  {index + 1}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button fullWidth variant="contained" onClick={csvExport}>
            CSV Download
          </Button>
        </Box>
      </Modal>
    </Layout>
  );
};

export default Instructor;

export const getStaticProps = async () => {
  const instructorList: DocumentData[] = [];
  const instructorRef = await getDocs(collection(db, "instructors"));

  instructorRef.forEach(async (value) => {
    if (!value.exists) return;
    const instructor = JSON.parse(JSON.stringify(value.data()));
    instructorList.push(instructor);
  });
  return {
    props: { instructor: instructorList },
    revalidate: 3,
  };
};
