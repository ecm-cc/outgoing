/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
function renderInvoices() {
    const promises = [];
    globals.displayedInvoices.forEach((invoice, i) => {
        const properties = {};
        invoice.displayProperties.forEach((prop) => { properties[prop.name] = prop.displayValue; });
        const isEnabled = properties.Verarbeitungsstatus === 'Versandbereit';
        $('.mdc-data-table__content').append(`
            <tr class="mdc-data-table__row" data-row-id="row-${invoice.id}" id="table-row-${invoice.id}">
                <td class="mdc-data-table__cell mdc-data-table__cell--checkbox">
                <div class="mdc-checkbox mdc-data-table__row-checkbox ${isEnabled ? '' : 'mdc-checkbox--disabled invisible'}" id="checkbox-row-${invoice.id}">
                <input type="checkbox" class="mdc-checkbox__native-control table-checkbox" 
                         aria-labelledby="row-${invoice.id}" ${isEnabled ? '' : 'disabled'}/>
                    <div class="mdc-checkbox__background">
                        <svg class="mdc-checkbox__checkmark" viewBox="0 0 24 24">
                            <path class="mdc-checkbox__checkmark-path" fill="none" d="M1.73,12.91 8.1,19.28 22.79,4.59" />
                        </svg>
                        <div class="mdc-checkbox__mixedmark"></div>
                    </div>
                    <div class="mdc-checkbox__ripple"></div>
                    </div>
                </td>
                <th class="mdc-data-table__cell" id="row-${i}" scope="row">
                    <a href="/dms/r/${globals.metaData.config.repositoryID}/o2/${invoice.id}" target="dapi_navigate">
                    ${properties.Rechnungsnummer}
                    </a>
                </th>
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
                <td class="mdc-data-table__cell">${properties['Rechnungsanlage Kunde']}</td>
                <td class="mdc-data-table__cell">${properties.Verarbeitungsstatus}</td>
                <td class="mdc-data-table__cell">${properties.Versandzeitpunkt}</td>
                <td class="mdc-data-table__cell">${properties.Versandrückmeldezeitpunkt}</td>
            </tr>`);
        promises.push(checkInvoiceDocuments(invoice));
    });
    globals.dataTable = new mdc.dataTable.MDCDataTable(document.querySelector('.mdc-data-table'));
    globals.dataTable.layout();
    $('.invoice-table').show();
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
    add010208Value(invoice);
}

function checkBoxListener() {
    setTimeout(() => {
        // uncheck disabled ones
        globals.checkedInvoices = [];
        const selectedRowsIDs = globals.dataTable.getSelectedRowIds();
        selectedRowsIDs.forEach((rowID) => {
            if ($(`#checkbox-${rowID}`).is(':visible')) {
                globals.checkedInvoices.push(rowID.substring(4));
            }
        });
        $('#checked-invoices').text(globals.checkedInvoices.length);
        if (globals.checkedInvoices.length > 0) {
            $('.mdc-button').show();
        } else {
            $('.mdc-button').hide();
        }
    }, 100);
}

function sortTable(event) {
    const sortProp = event.detail.columnId;
    const sortDirection = event.detail.sortValue;
    globals.displayedInvoices = globals.displayedInvoices.sort((a, b) => {
        const propA = a.displayProperties.find((prop) => prop.name === sortProp);
        const propB = b.displayProperties.find((prop) => prop.name === sortProp);
        let valueA;
        let valueB;
        switch (propA.dataType) {
        case 2: valueA = parseFloat(propA.value); valueB = parseFloat(propB.value); break;
        case 4: valueA = new Date(propA.value).getTime(); valueB = new Date(propB.value).getTime(); break;
        default: valueA = propA.value; valueB = propB.value;
            if (sortDirection === 'ascending') {
                return valueA.localeCompare(valueB);
            }
            return valueB.localeCompare(valueA);
        }

        if (sortDirection === 'ascending') {
            return valueA - valueB;
        }
        return valueB - valueA;
    });
    globals.displayedInvoices.forEach((inv) => {
        $('tbody').append($(`#table-row-${inv.id}`));
    });
}
