import React from 'react';
import { Pagination } from 'reactstrap';
import PropTypes from 'prop-types';

const ReusablePagination = ({ currentPage, totalPages, onPageChange }) => {

    // Generate page numbers
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
    console.log('pageNumbers', pageNumbers, totalPages)

    return (
        <div className="d-flex justify-content-between align-items-center mt-3">
            <div>
                <span>
                    Showing {currentPage} of {totalPages} pages
                </span>
            </div>
            <Pagination className="pagination pagination-rounded justify-content-end my-2">
                <Pagination.Prev
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                />
                {pageNumbers?.map((number) => (
                    <Pagination.Item
                        key={number}
                        active={number === currentPage}
                        onClick={() => onPageChange(number)}
                    >
                        {number}
                    </Pagination.Item>
                ))}
                <Pagination.Next
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                />
            </Pagination>
        </div>
    );
};

// Define prop types
ReusablePagination.propTypes = {
    currentPage: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
};

export default ReusablePagination;
