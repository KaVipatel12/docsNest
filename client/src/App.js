import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import FileMainPage from "./pages/FileMainPage.jsx";
import FolderMainPage from "./pages/FolderMainPage.jsx";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import Logout from "./pages/Logout.jsx";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <>
    <Router>
      <Routes>
        <Route path="/" element={<Home></Home>}></Route>
        <Route path="/file" element={<FileMainPage></FileMainPage>}></Route>
        <Route path="/file/:noteId" element={<FileMainPage></FileMainPage>}></Route>
        <Route path="/file/:folderName/:noteId" element={<FileMainPage></FileMainPage>}></Route>
        <Route path="/folder" element={<FolderMainPage></FolderMainPage>}></Route>
        <Route path="/register" element={<Register></Register>}></Route>
        <Route path="/login" element={<Login></Login>}></Route>
        <Route path="/folder/:folderName" element={<FolderMainPage></FolderMainPage>}></Route>
        <Route path="/logout" element={<Logout></Logout>}></Route>
      </Routes>
    </Router>
</>
);
}

export default App;