import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import OCR from "./component/OCR";
import AzureChatbot from "./component/ChatBot";

function App() {
  const [initialtext, setInitialtext] = useState();

  return (
    <>
     <OCR setInitialtext={setInitialtext}   />
      {initialtext && <AzureChatbot initialtext={initialtext} />}
    </>
  );
}

export default App;
