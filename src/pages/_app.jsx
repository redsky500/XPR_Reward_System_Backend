import { useState } from "react";
import "../styles/style.scss";
import { motion } from "framer-motion";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { BreakpointProvider } from "react-use-breakpoint";


const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});


function StakingApp({ Component, pageProps }) {
  const [loading, setLoading] = useState(false);


  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ ease: "easeInOut", duration: 0.9, delay: 0.2 }}
    >
    
        <ThemeProvider theme={darkTheme}>
          <CssBaseline />
          <BreakpointProvider>
            <Component
              {...pageProps}
              startLoading={() => setLoading(true)}
              closeLoading={() => setLoading(false)}
            />
          </BreakpointProvider>
        </ThemeProvider>
        {/* <ToastContainer style={{ fontSize: 14 }} /> */}
        {/* <PageLoading loading={loading} /> */}
        {/* <Footer /> */}
    </motion.section>
  );
}

export default StakingApp;
