/* eslint-disable no-restricted-globals */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable prefer-const */

let currentPage = 1;
let pageCount;

async function initPagination(pageSize) {
    const response = await $.ajax({
        url: globals.metaData.urls.searchCount,
        method: 'GET',
        headers: {
            Accept: 'application/hal+json',
            'Content-Type': 'application/hal+json',
        },
    });
    $('#pagination-total').html(`<span id="one-off"><span id="first-index">1</span>
     bis </span><span id="visible-invoices">${globals.displayedInvoices.length}</span> 
    von ${response.totalNumberOfResults} Ergebnissen`);
    pageCount = Math.floor(response.totalNumberOfResults / pageSize) + 1;
    reloadPaginationElements();
}

function reloadPaginationElements() {
    if (globals.displayedInvoices.length > 1) {
        $('#one-off').show();
    } else {
        $('#one-off').hide();
    }

    const lastShownIndex = globals.metaData.config.pageSize * currentPage < globals.invoices.length
        ? globals.metaData.config.pageSize * currentPage : globals.invoices.length;

    $('#first-index').text((currentPage - 1) * globals.metaData.config.pageSize + 1);
    $('#visible-invoices').text(lastShownIndex);

    if (currentPage === pageCount) {
        $('#pagination-right').prop('disabled', true);
        $('#pagination-last').prop('disabled', true);
    } else {
        $('#pagination-right').prop('disabled', false);
        $('#pagination-last').prop('disabled', false);
    }
    if (currentPage === 1) {
        $('#pagination-left').prop('disabled', true);
        $('#pagination-first').prop('disabled', true);
    } else {
        $('#pagination-left').prop('disabled', false);
        $('#pagination-first').prop('disabled', false);
    }
}

function nextPage() {
    switchPage(currentPage + 1);
}

function previousPage() {
    switchPage(currentPage - 1);
}

function firstPage() {
    switchPage(1);
}

function lastPage() {
    switchPage(pageCount);
}

function switchPage(pageNumber) {
    currentPage = pageNumber;
    const { pageSize } = globals.metaData.config;
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize > globals.invoices.length - 1 ? globals.invoices.length : startIndex + pageSize;
    globals.displayedInvoices = globals.invoices.slice(startIndex, endIndex);
    rerenderTable(false);
}
