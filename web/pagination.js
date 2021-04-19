/* eslint-disable no-restricted-globals */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable prefer-const */

async function initPagination(pageSize) {
    const response = await $.ajax({
        url: globals.metaData.urls.searchCount,
        method: 'GET',
        headers: {
            Accept: 'application/hal+json',
            'Content-Type': 'application/hal+json',
        },
    });
    $('#pagination-total').html(`<span id="one-off">1 bis </span><span id="visible-invoices">${globals.displayedInvoices.length}</span> 
    von ${response.totalNumberOfResults} Ergebnissen`);
    if (pageSize === response.totalNumberOfResults) {
        $('#pagination-right').prop('disabled', true);
        $('#pagination-last').prop('disabled', true);
    }
}

function reloadPaginationText() {
    if (globals.displayedInvoices.length > 0) {
        $('#one-off').show();
    } else {
        $('#one-off').hide();
    }
    $('#visible-invoices').text(globals.displayedInvoices.length);
}
