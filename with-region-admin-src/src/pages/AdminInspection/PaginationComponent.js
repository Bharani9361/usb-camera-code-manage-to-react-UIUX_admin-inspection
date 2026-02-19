import React from "react";
import PropTypes from "prop-types";
import { Pagination } from 'react-bootstrap'

const PaginationComponent = ({ totalItems, itemsPerPage, currentPage, onPageChange }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const maxPageNumbersToShow = 3;

    if (totalPages <= 1) return null; // Hide pagination if not needed

    const generatePageNumbers = () => {
        const pages = [];
        const half = Math.floor(maxPageNumbersToShow / 2);

        let start = Math.max(1, currentPage - half);
        let end = Math.min(totalPages, currentPage + half);

        if (currentPage <= half + 1) {
            start = 1;
            end = Math.min(maxPageNumbersToShow, totalPages);
        } else if (currentPage >= totalPages - half) {
            start = Math.max(1, totalPages - maxPageNumbersToShow + 1);
            end = totalPages;
        }

        if (start > 1) pages.push(1);
        if (start > 2) pages.push("...");

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        if (end < totalPages - 1) pages.push("...");
        if (end < totalPages) pages.push(totalPages);

        return pages;
    };

    return (
        <div className="d-flex justify-content-between align-items-center mt-3">
            <span className="fw-bold">showing {currentPage} of {totalPages} pages</span>
            <Pagination className="pagination pagination-rounded justify-content-end my-2">
                <Pagination.First onClick={() => onPageChange(1)} disabled={currentPage === 1} />
                <Pagination.Prev onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} />

                {generatePageNumbers().map((number, index) => (
                    <Pagination.Item
                        key={index}
                        active={number === currentPage}
                        onClick={() => typeof number === "number" && onPageChange(number)}
                        disabled={number === "..."}
                        className="fw-bold"
                    >
                        {number}
                    </Pagination.Item>
                ))}

                <Pagination.Next onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} />
                <Pagination.Last onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} />
            </Pagination>
        </div>
    );
};

PaginationComponent.propTypes = {
    totalItems: PropTypes.any.isRequired,
    itemsPerPage: PropTypes.any.isRequired,
    currentPage: PropTypes.any.isRequired,
    onPageChange: PropTypes.any.isRequired
}

export default PaginationComponent;



// to import and use this component refer the following
// 1. change log_data value from the state
// 2. change as currentItems in table body)
// ## 1
// // pagination
// currentPage: 1,
// itemsPerPage: 10,

// ## 2
// handlePageChange = (pageNumber) => {
//     this.setState({ currentPage: pageNumber });
// };

// ## 3
// // pagination
// const { currentPage, itemsPerPage } = this.state;   // expandedRow, searchQuery,

// // Calculate indices for slicing the component list
// const indexOfLastItem = currentPage * itemsPerPage;
// const indexOfFirstItem = indexOfLastItem - itemsPerPage;
// const currentItems = log_data.slice(indexOfFirstItem, indexOfLastItem);

// ## 4
// <PaginationComponent
//     totalItems={log_data.length}
//     itemsPerPage={itemsPerPage}
//     currentPage={currentPage}
//     onPageChange={this.handlePageChange}
// />