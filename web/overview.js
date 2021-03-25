/* eslint-disable no-restricted-globals */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable prefer-const */
let metaData;
let dialog;
let dataTable;
let responseDialog;
let searchTextfield;
let invoices = [];
let displayedInvoices = [];
let checkedInvoices = [];

window.onload = async () => {
    metaData = $('#data-container').data('id');
    await $.getScript(`${metaData.assetBasePath}/table.js`);
    await $.getScript(`${metaData.assetBasePath}/filter.js`);
    initMDCElements();
    showOverlay();
    invoices = await loadInvoices();
    $('#all-invoices').text(invoices.length);
    displayedInvoices = JSON.parse(JSON.stringify(invoices));
    renderInvoices();
    dataTable = new mdc.dataTable.MDCDataTable(document.querySelector('.mdc-data-table'));
    dataTable.layout();
    initCheckboxes();
    fillDropdowns();
    hideOverlay();
};

/**
 * Configures and initializes Material components
 */
function initMDCElements() {
    searchTextfield = new mdc.textField.MDCTextField(document.querySelector('.mdc-text-field'));
    dialog = new mdc.dialog.MDCDialog(document.querySelector('#send-confirmation-dialog'));
    responseDialog = new mdc.dialog.MDCDialog(document.querySelector('#response-dialog'));
    mdc.linearProgress.MDCLinearProgress.attachTo(document.querySelector('.mdc-linear-progress'));
    document.addEventListener('MDCDataTable:sorted', sortTable);
}

async function loadInvoices() {
    const searchResults = await $.ajax({
        url: metaData.searchURL,
        method: 'GET',
        headers: {
            Accept: 'application/hal+json',
            'Content-Type': 'application/hal+json',
        },
    });
    return searchResults.items;
}

async function sendInvoices() {
    dialog.open();
    dialog.listen('MDCDialog:closed', async (reason) => {
        if (reason.detail.action === 'ok') {
            showOverlay();
            try {
                const data = await $.ajax({
                    timeout: 90000,
                    method: 'POST',
                    url: '/able-outgoing/invoices',
                });
                renderResponseOverlay(data);
            } catch (err) {
                console.error(err);
            }
            hideOverlay();
        }
    });
}

function renderResponseOverlay(response) {
    const dialogHTML = [];
    dialogHTML.push(`<span class="mdc-typography--body2">
        Es wurde${checkedInvoices.length > 1 ? 'n' : ''} 
        ${checkedInvoices.length} Rechnung${checkedInvoices.length > 1 ? 'en' : ''} 
        an Crossinx übermittelt.
    </span><br>`);
    if (response.failed.length > 0) {
        dialogHTML.push(renderList(response.failed, 'Fehlgeschlagene Dokumente'));
    }
    if (response.succeded.length > 0) {
        dialogHTML.push(renderList(response.succeded, 'Erfolgreiche Dokumente'));
    }
    $('#response-dialog-content').html(dialogHTML.join(''));
    responseDialog.open();
    responseDialog.listen('MDCDialog:closed', (reason) => {
        location.reload();
    });
}

function renderList(documents, listTitle) {
    const listHTML = [];
    documents.forEach((documentID) => {
        const document = invoices.find((inv) => inv.id === documentID);
        listHTML.push(`<li class="mdc-list-item" id="list-item-${documentID}">
            <span class="mdc-list-item__ripple"></span>
            <span class="mdc-list-item__text">${document.caption}</span>
        </li>`);
    });
    return `<br><span>${listTitle}</span>
    <ul class="mdc-list">
        ${listHTML.join('')}
    </ul>`;
}

/**
 * Shows a gray overlay for loading purposes
 */
function showOverlay() {
    $('#overlay').show();
}

/**
 * Hides a gray overlay when content is loaded
 */
function hideOverlay() {
    $('#overlay').hide();
}
