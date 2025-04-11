import { useContext, useState } from 'react';
import FileShare from '../components/FileShare';
import FileReceive from '../components/FileReceive';
import History from '../components/History';
import Nav from '../components/Nav';
import { Auth } from '../context/Auth';
import LoadingSpinner from '../components/LoadingSpinner';
import LoggedInErrorPage from '../components/LoggedInErrorPage';

// The main App component
export default function FileSharing() {
  // State to track which page is currently active
  const [currentPage, setCurrentPage] = useState('fileshare');
  const {userData , userLoading} = useContext(Auth)
  // Function to handle navigation
  const navigateTo = (page) => {
    setCurrentPage(page);
  };

  if(userLoading){
    return (
    <>
    <Nav></Nav>
    <LoadingSpinner></LoadingSpinner>
    </>
    )
  }
  if(!userData && !userLoading){
    return (
    <>
    <LoggedInErrorPage></LoggedInErrorPage>
    </>
    )
  }
  return (
    <>
    <Nav></Nav>
    <div className="file-sharing-container">
      <header className="file-sharing-header">
        <nav className="file-sharing-nav">
          <button 
            className={`nav-button ${currentPage === 'fileshare' ? 'nav-button-active' : 'nav-button-inactive'}`}
            onClick={() => navigateTo('fileshare')}
          >
            Share Files 
          </button>
          <button 
            className={`nav-button ${currentPage === 'receivefile' ? 'nav-button-active' : 'nav-button-inactive'}`}
            onClick={() => navigateTo('receivefile')}
          >
            Receive Files 
          </button>
          <button 
            className={`nav-button ${currentPage === 'history' ? 'nav-button-active' : 'nav-button-inactive'}`}
            onClick={() => navigateTo('history')}
          >
            History
          </button>
        </nav>
      </header>

      {/* Content section that changes based on the current page */}
      <main className="file-sharing-main">
        {currentPage === 'fileshare' ? (
          <FileShare />
        ) : currentPage === 'receivefile' ? (
          <FileReceive />
        ) : (
          <History/>
        )}
      </main>
    </div>
    </>
  );
}