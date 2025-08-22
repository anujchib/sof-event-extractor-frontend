import { Routes,Route } from "react-router-dom";
import { BrowserRouter } from "react-router-dom";

import React from 'react'
import Download from "./components/Download";
import Upload from "./components/Upload";


const App = () => {
  return (

    


    <Routes>


        <Route path="/" element={<Upload/>} />

        
        <Route path="/Download" element={<Download/>} /> 
      


    </Routes>





  )
}

export default App;
