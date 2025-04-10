import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { File, Folder } from 'lucide-react';
import "../filereceive.css";
import { toast } from 'react-toastify';

// Helper function to format date
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Function to display the status of shared files/folders
const getStatusLabel = (status) => {
  switch (status) {
    case "0":
      return <span className="status success">Accepted</span>;
    case "1":
      return <span className="status pending">Pending</span>;
    case "2":
      return <span className="status rejected">Rejected</span>;
    default:
      return <span className="status unknown">Unknown</span>;
  }
};

function History() {
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const APP_URI = process.env.REACT_APP_URL;

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${APP_URI}/filesharing/sharinghistory`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      // Debugging: Log the response data to check if it's correct

      const { msg } = response.data; // Directly accessing the 'msg' array

      if (!msg || msg.length === 0) {
        toast.error("No shared files or folders found.");
        setLoading(false);
        return;
      }

      setHistoryItems(msg); // Store the data in the state
    } catch (error) {
      console.error("No sharing has done")
    } finally {
      setLoading(false);
    }
  }, [APP_URI, token]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <div className="file-receive-container">
      <h1 className="file-receive-heading">Sharing History</h1>

      {loading ? (
        <div className="loading-state">Loading...</div>
      ) : historyItems.length === 0 ? (
        <div className="empty-state">No sharing has been done yet</div>
      ) : (
        historyItems.map(item => (
          <div key={item._id} className="file-item">
            <div className="file-icon-container">
              {item.type === "file" ? (
                <File size={40} color="white" />
              ) : (
                <Folder size={40} color="white" />
              )}
              <div className="file-details">
                <div className="file-name">{item.fileName || item.folderName}</div>
                <div className="file-info">
                  {item.direction === 'received' ? (
                    <>
                      Shared by <span className="highlight">{item.uploadedBy?.email || ""}</span>
                    </>
                  ) : (
                    <>
                      Shared with <span className="highlight">{item.sharedWith}</span>
                    </>
                  )}
                  • <span className="highlight">{formatDate(item.uploadedAt)}</span> • {getStatusLabel(item.status)}
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default History;
