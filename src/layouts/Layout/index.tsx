import React from "react";
import Head from "next/head";
import styles from "../../../styles/Home.module.css";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import CssBaseline from "@mui/material/CssBaseline";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import router from "next/router";

interface LayoutProps {
  title?: string;
  header?: string;
  children: React.ReactNode;
  headerLeftContents?: React.ReactNode;
}
const drawerWidth = 240;

const Layout: React.FunctionComponent<LayoutProps> = ({
  title = "layer 管理画面",
  header = "タイトル",
  children,
  headerLeftContents,
}) => {
  const navigationList = [
    { text: "Instructor", icon: <AccountBoxIcon />, path: "/instructor" },
    { text: "Lesson", icon: <VideoLibraryIcon />, path: "/lessons" },
  ];

  return (
    <div>
      <Head>
        <title>{title}</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>

      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <AppBar
          position="fixed"
          sx={{
            width: `calc(100% - ${drawerWidth}px)`,
            ml: `${drawerWidth}px`,
          }}
        >
          <Toolbar>
            <Typography variant="h6" noWrap component="div">
              {title}
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
            },
          }}
          variant="permanent"
          anchor="left"
        >
          <Toolbar />
          <Divider />
          <List>
            {navigationList.map(({ text, icon, path }, index) => (
              <ListItem key={text} disablePadding>
                <ListItemButton onClick={() => router.push(path)}>
                  <ListItemIcon>{icon}</ListItemIcon>
                  <ListItemText primary={text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider />
          <List>
            {["Logout"].map((text, index) => (
              <ListItem key={text} disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    <ExitToAppIcon />
                  </ListItemIcon>
                  <ListItemText primary={text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Drawer>
        <Box
          component="main"
          sx={{ flexGrow: 1, bgcolor: "background.default", p: 3 }}
        >
          <Toolbar />
          <Box
            component="div"
            sx={{
              display: "flex",
              justifyContent: "space-between",
              bgcolor: "background.default",
              mb: 4,
            }}
          >
            <Typography variant="h5" fontWeight={700} component="h1">
              {header}
            </Typography>

            {headerLeftContents}
          </Box>
          <main>{children}</main>
        </Box>
      </Box>
    </div>
  );
};

export default Layout;
