/* eslint-disable no-undef */
let metaData;
let invoices;

window.onload = async () => {
    initMDCElements();
    showOverlay();
    metaData = $('#data-container').data('id');
    invoices = await loadInvoices();
    renderInvoices();
    hideOverlay();
};

/**
 * Configures and initializes Material components
 */
function initMDCElements() {
    mdc.linearProgress.MDCLinearProgress.attachTo(document.querySelector('.mdc-linear-progress'));
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

function renderInvoices() {
    const promises = [];
    invoices.forEach((invoice) => {
        const properties = {};
        invoice.displayProperties.forEach((prop) => { properties[prop.name] = prop.displayValue; });
        const checkBox = getInvoiceCheckbox(properties);
        $('.mdc-data-table__content').append(`
            <tr class="mdc-data-table__row">
                ${checkBox}
                <th class="mdc-data-table__cell" scope="row">${properties.Rechnungsnummer}</th>
                <td class="mdc-data-table__cell">${properties['Buchungskreis ID']}</td>
                <td class="mdc-data-table__cell">${properties.Organisationseinheit}</td>
                <td class="mdc-data-table__cell">${properties['Debitorennummer (AG)']}</td>
                <td class="mdc-data-table__cell">${properties['Debitorenname (AG)']}</td>
                <td class="mdc-data-table__cell">${properties['Debitorennummer (WE)']}</td>
                <td class="mdc-data-table__cell">${properties['Debitorenname (WE)']}</td>
                <td class="mdc-data-table__cell">${properties['Debitorennummer (RE)']}</td>
                <td class="mdc-data-table__cell">${properties['Debitorenname (RE)']}</td>
                <td class="mdc-data-table__cell">${properties['Rechnungsgesamtbetrag, brutto']}</td>
                <td class="mdc-data-table__cell">${properties.Währung}</td>
                <td class="mdc-data-table__cell">${properties['Ersteller (SAP)']}</td>
                <td class="mdc-data-table__cell">${properties['Erstelldatum (SAP)']}</td>
                <td class="mdc-data-table__cell" id="${invoice.id}-documents-01"></td>
                <td class="mdc-data-table__cell" id="${invoice.id}-documents-02"></td>
                <td class="mdc-data-table__cell" id="${invoice.id}-documents-08"></td>
                <td class="mdc-data-table__cell">${properties['E-Invoice']}</td>
                <td class="mdc-data-table__cell">${properties['Interner Beleg']}</td>
                <td class="mdc-data-table__cell">${properties['Rechnungsanlage Kunde']}</td>
                <td class="mdc-data-table__cell">${properties.KuSoFa}</td>
                <td class="mdc-data-table__cell">${properties['GS-Verfahren']}</td>
                <td class="mdc-data-table__cell">${properties.Verarbeitungsstatus}</td>
                <td class="mdc-data-table__cell">${properties.Versandzeitpunkt}</td>
                <td class="mdc-data-table__cell">${properties.Versandrückmeldezeitpunkt}</td>
            </tr>`);
        promises.push(checkInvoiceDocuments(invoice));
    });
    $('.invoice-table').show();
}

function getInvoiceCheckbox(properties) {
    const hasCheckbox = properties.Verarbeitungsstatus === 'Versandbereit';
    if (hasCheckbox) {
        return `<td class="mdc-data-table__cell mdc-data-table__cell--checkbox">
                    <div class="mdc-checkbox mdc-data-table__row-checkbox mdc-checkbox--selected">
                        <input type="checkbox" class="mdc-checkbox__native-control" aria-labelledby="u0"/>
                    <div class="mdc-checkbox__background">
                        <svg class="mdc-checkbox__checkmark" viewBox="0 0 24 24">
                            <path class="mdc-checkbox__checkmark-path" fill="none" d="M1.73,12.91 8.1,19.28 22.79,4.59" />
                        </svg>
                        <div class="mdc-checkbox__mixedmark"></div>
                    </div>
                    <div class="mdc-checkbox__ripple"></div>
                    </div>
                </td>`;
    }
    return '<td class="mdc-data-table__cell"></td>';
}

async function checkInvoiceDocuments(invoice) {
    let has01Text = '';
    let has02Text = '';
    let has08Text = '';
    if (invoice.hasLinkedChildren) {
        const children = await $.ajax({
            // Reason: d.3 Syntax
            // eslint-disable-next-line no-underscore-dangle
            url: `${invoice._links.linkedChildren.href}/content`,
            method: 'GET',
            headers: {
                Accept: 'application/hal+json',
                'Content-Type': 'application/hal+json',
            },
        });
        children.items.forEach((child) => {
            if (child.category.displayName === 'Kunden - Rechnungsdokumente') {
                const documentType = child.displayProperties.find((prop) => prop.name === 'Dokumenttyp');
                switch (documentType.value) {
                case '01 - Kunde SAP Abrechnung': has01Text = 'X'; break;
                case '02 - Kunde Rechnungsanlage VERSAND':
                    has02Text = child.displayProperties.find((prop) => prop.name === 'Rechnungsanlage Kunde').value; break;
                case '08 - Kunde XML Rechnung': has08Text = 'X'; break;
                default: break;
                }
            }
        });
    }
    $(`#${invoice.id}-documents-01`).text(has01Text);
    $(`#${invoice.id}-documents-02`).text(has02Text);
    $(`#${invoice.id}-documents-08`).text(has08Text);
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
