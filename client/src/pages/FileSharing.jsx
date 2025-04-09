import { useState } from 'react';
import FileShare from '../components/FileShare';
import FileReceive from '../components/FileReceive';
// Import the external CSS file (assuming it's saved as fileSharing.css in the styles folder)

// The main App component
export default function FileSharing() {
  // State to track which page is currently active
  const [currentPage, setCurrentPage] = useState('fileshare');

  // Function to handle navigation
  const navigateTo = (page) => {
    setCurrentPage(page);
  };

  return (
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
        </nav>
      </header>

      {/* Content section that changes based on the current page */}
      <main className="file-sharing-main">
        {currentPage === 'fileshare' ? (
          <FileShare />
        ) : (
          <FileReceive />
        )}
      </main>
    </div>
  );
}