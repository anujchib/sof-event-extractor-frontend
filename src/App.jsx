import { Routes,Route } from "react-router-dom";
import { BrowserRouter } from "react-router-dom";

import React from 'react'
import Download from "./components/Download";
import Upload from "./components/Upload";
import Login from "./components/Login";


const App = () => {
  return (

    


    <Routes>


        <Route path="/" element={<Login/>} />
          <Route path="/Upload" element={<Upload/>} />

        
        <Route path="/Download" element={<Download/>} /> 
      


    </Routes>





  )
}

export default App;
