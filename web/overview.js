/* eslint-disable no-underscore-dangle */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable prefer-const */
const globals = {
    fullyLoaded: false,
};

window.onload = async () => {
    globals.metaData = $('#data-container').data('id');
    await $.getScript(`${globals.metaData.assetBasePath}/table.js`);
    await $.getScript(`${globals.metaData.assetBasePath}/filter.js`);
    await $.getScript(`${globals.metaData.assetBasePath}/pagination.js`);
    initMDCElements();
    showOverlay();
    await loadInvoices();
    $('#all-invoices').text(globals.invoices.length);
    globals.displayedInvoices = JSON.parse(JSON.stringify(globals.invoices));
    renderInvoices(globals.invoices);
    initCheckboxes();
    fillDropdowns();
    $('.table-checkbox').change(checkBoxListener);
    fillInitialFilter();
    await initPagination(globals.metaData.config.pageSize);
    hideOverlay();
};

/**
 * Configures and initializes Material components
 */
function initMDCElements() {
    globals.searchTextfield = new mdc.textField.MDCTextField(document.querySelector('.mdc-text-field'));
    globals.dialog = new mdc.dialog.MDCDialog(document.querySelector('#send-confirmation-dialog'));
    globals.responseDialog = new mdc.dialog.MDCDialog(document.querySelector('#response-dialog'));
    mdc.linearProgress.MDCLinearProgress.attachTo(document.querySelector('.mdc-linear-progress'));
    document.addEventListener('MDCDataTable:sorted', sortTable);
}

async function loadInvoices() {
    const searchResults = await $.ajax({
        url: globals.metaData.urls.search,
        method: 'GET',
        headers: {
            Accept: 'application/hal+json',
            'Content-Type': 'application/hal+json',
        },
    });
    globals.invoices = searchResults.items;
    loadAllInvoices(searchResults._links.nextPage ? searchResults._links.nextPage.href : null);
}

async function loadAllInvoices(pageLink) {
    if (pageLink != null) {
        const searchResults = await $.ajax({
            url: globals.metaData.config.host + pageLink,
            method: 'GET',
            headers: {
                Accept: 'application/hal+json',
                'Content-Type': 'application/hal+json',
            },
        });
        renderInvoices(searchResults.items, false);
        globals.invoices = globals.invoices.concat(searchResults.items);
        await loadAllInvoices(searchResults._links.nextPage ? searchResults._links.nextPage.href : null);
    } else {
        $('#all-invoices').text(globals.invoices.length);
        globals.fullyLoaded = true;
    }
}

async function sendInvoices() {
    globals.dialog.open();
    globals.dialog.listen('MDCDialog:closed', async (reason) => {
        if (reason.detail.action === 'ok') {
            showOverlay();
            try {
                const data = await $.ajax({
                    timeout: 120000,
                    method: 'POST',
                    url: '/able-outgoing/invoices',
                    data: { invoices: JSON.stringify(globals.checkedInvoices) },
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
        Es wurde${globals.checkedInvoices.length > 1 ? 'n' : ''} 
        ${globals.checkedInvoices.length} Rechnung${globals.checkedInvoices.length > 1 ? 'en' : ''} 
        an Crossinx übermittelt, davon waren ${response.succeded.length} erfolgreich und ${response.failed.length} fehlgeschlagen.
    </span><br>`);
    $('#response-dialog-content').html(dialogHTML.join(''));
    globals.responseDialog.open();
    globals.responseDialog.listen('MDCDialog:closed', (reason) => {
        location.reload();
    });
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
