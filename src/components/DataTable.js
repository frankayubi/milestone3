// src/components/DataTable.js
import React, { useState } from 'react';

function DataTable({ data, searchTerm, setSearchTerm }) {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Handler for table pagination
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const tableData = data.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const totalPages = Math.ceil(data.length / rowsPerPage);

  return (
    <div className="data-table-container">
      <h2>Passenger Data</h2>
      
      <div className="table-controls">
        <input 
          type="text" 
          placeholder="Search by name..." 
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Reset to first page when searching
          }}
        />
        
        <div className="pagination">
          <button 
            onClick={() => handlePageChange(currentPage - 1)} 
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button 
            onClick={() => handlePageChange(currentPage + 1)} 
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
      
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Age</th>
              <th>Sex</th>
              <th>Class</th>
              <th>Fare</th>
              <th>Cabin</th>
              <th>Embarked</th>
              <th>Survived</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((passenger, index) => (
              <tr key={index} className={passenger.Survived ? 'survived' : 'died'}>
                <td title={`Ticket: ${passenger.Ticket}`}>{passenger.Name}</td>
                <td>{passenger.Age}</td>
                <td>{passenger.Sex}</td>
                <td>{passenger.Pclass}</td>
                <td>${typeof passenger.Fare === "number" ? passenger.Fare.toFixed(2) : "0.00"}</td>
                <td>{passenger.Cabin || 'Unknown'}</td>
                <td>{passenger.Embarked || 'Unknown'}</td>
                <td>{passenger.Survived ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="table-footer">
        Showing {tableData.length} of {data.length} passengers
      </div>
    </div>
  );
}

export default DataTable;