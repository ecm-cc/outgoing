/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
function search() {
    const searchString = $('#search-field').val().toLowerCase();
    displayedInvoices = displayedInvoices.filter((invoice) => {
        const properties = {};
        invoice.displayProperties.forEach((prop) => { properties[prop.name] = prop.displayValue; });
        return properties.Organisationseinheit.toLowerCase().includes(searchString)
        || properties['Buchungskreis ID'].toLowerCase().includes(searchString)
        || properties.Rechnungsnummer.toLowerCase().includes(searchString)
        || properties['Debitorenname (AG)'].toLowerCase().includes(searchString)
        || properties['Debitorenname (WE)'].toLowerCase().includes(searchString)
        || properties['Debitorenname (RE)'].toLowerCase().includes(searchString)
        || properties['Ersteller (SAP)'].toLowerCase().includes(searchString)
        || properties.Verarbeitungsstatus.toLowerCase().includes(searchString);
    });
    $('.mdc-text-field__icon').text('cancel');
    $('.mdc-text-field__icon').prop('onclick', null).off('click');
    $('.mdc-text-field__icon').on('click', clearSearch);
    rerenderTable();
}

function clearSearch() {
    displayedInvoices = JSON.parse(JSON.stringify(invoices));
    $('.mdc-text-field__icon').text('search');
    $('.mdc-text-field__icon').prop('onclick', null).off('click');
    $('.mdc-text-field__icon').on('click', search);
    $('#search-field').val('');
    rerenderTable();
}

function rerenderTable() {
    $('.mdc-data-table__row').hide();
    displayedInvoices.forEach((invoice) => $(`#table-row-${invoice.id}`).show());
}
