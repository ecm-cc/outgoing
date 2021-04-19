/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const selects = {};
const checkboxes = {};
function fillDropdowns() {
    fillDropdown('Organisationseinheit', 'organisationunit');
    fillDropdown('Buchungskreis ID', 'companycode');
    fillDropdown('Verarbeitungsstatus', 'processingstatus');
}

function initCheckboxes() {
    initCheckbox('documents01', 'has01Text');
    initCheckbox('documents02', 'has02Text');
    initCheckbox('documents08', 'has08Text');
}

function fillDropdown(filterProperty, filterFieldName) {
    let properties = [];
    globals.invoices.forEach((invoice) => {
        const { value } = invoice.displayProperties.find((prop) => prop.name === filterProperty);
        if (!properties.includes(value)) {
            properties.push(value);
        }
    });
    properties.sort();
    properties = properties.map((prop) => `<li class="mdc-list-item" data-value="${prop}">
        <span class="mdc-list-item__ripple"></span>
        <span class="mdc-list-item__text">${prop}</span>
    </li>`);
    $(`#option-list-${filterFieldName}`).html(properties.join(''));
    selects[filterFieldName] = new mdc.select.MDCSelect(document.querySelector(`#${filterFieldName}`));
    const icon = new mdc.select.MDCSelectIcon(document.querySelector(`#${filterFieldName}-icon`));
    selects[filterFieldName].listen('MDCSelect:change', () => {
        if (selects[filterFieldName].root.dataset.active) {
            rebuild();
        } else {
            filter(selects[filterFieldName].label.root.innerText, selects[filterFieldName].value, filterFieldName);
        }
    });
}

function fillInitialFilter() {
    selects.processingstatus.value = 'Versandbereit';
}

function initCheckbox(id, field) {
    checkboxes[field] = $(`#${id}`);
    $(checkboxes[field]).on('click', () => {
        if (checkboxes[field].prop('checked')) {
            filter(field, 'X');
        } else {
            clearFilter(field);
        }
    });
}

function filter(name, searchedValue, id) {
    globals.displayedInvoices = globals.displayedInvoices.filter((invoice) => {
        const { value } = invoice.displayProperties.find((prop) => prop.name === name);
        return value === searchedValue;
    });
    if (selects[id]) {
        selects[id].root.dataset.active = true;
    }
    rerenderTable();
}

function clearFilter(id) {
    if (selects[id]) {
        selects[id].value = null;
        selects[id].root.dataset.active = false;
    }
    rebuild();
    rerenderTable();
}

function search() {
    const searchString = globals.searchTextfield.value.toLowerCase();
    if (searchString !== '') {
        globals.displayedInvoices = globals.displayedInvoices.filter((invoice) => {
            const properties = {};
            invoice.displayProperties.forEach((prop) => { properties[prop.name] = prop.displayValue; });
            return properties.Organisationseinheit.toLowerCase().includes(searchString)
            || properties['Buchungskreis ID'].toLowerCase().includes(searchString)
            || properties.Rechnungsnummer.toLowerCase().includes(searchString)
            || properties['Debitorenname (AG)'].toLowerCase().includes(searchString)
            || properties['Debitorenname (WE)'].toLowerCase().includes(searchString)
            || properties['Debitorenname (RE)'].toLowerCase().includes(searchString)
            || properties['Debitorennummer (AG)'].toLowerCase().includes(searchString)
            || properties['Debitorennummer (WE)'].toLowerCase().includes(searchString)
            || properties['Debitorennummer (RE)'].toLowerCase().includes(searchString);
        });
        rerenderTable();
    }
}

function clearSearch() {
    globals.searchTextfield.value = '';
    rebuild();
    rerenderTable();
}

function rerenderTable(resetCheckedInvoices = true) {
    $('.mdc-data-table__row').hide();
    if (resetCheckedInvoices) {
        resetCheckedInvoices();
    }
    globals.displayedInvoices.forEach((invoice) => $(`#table-row-${invoice.id}`).show());
    globals.dataTable.layout();
    reloadPaginationElements();
}

function rebuild() {
    globals.displayedInvoices = JSON.parse(JSON.stringify(globals.invoices));
    add010208Values();
    search();
    Object.keys(selects).forEach((key) => {
        if (selects[key].value) {
            filter(selects[key].label.root.innerText, selects[key].value);
        }
    });
    Object.keys(checkboxes).forEach((key) => {
        if (checkboxes[key].prop('checked')) {
            filter(key, 'X');
        }
    });
}

function add010208Values() {
    globals.displayedInvoices.forEach((invoice) => {
        add010208Value(invoice);
    });
}

function add010208Value(invoice) {
    invoice.displayProperties.push({
        name: 'has01Text',
        value: $(`#${invoice.id}-documents-01`).text(),
        displayValue: $(`#${invoice.id}-documents-01`).text(),
        dataType: 0,
    }, {
        name: 'has02Text',
        value: $(`#${invoice.id}-documents-02`).text(),
        displayValue: $(`#${invoice.id}-documents-02`).text(),
        dataType: 0,
    }, {
        name: 'has08Text',
        value: $(`#${invoice.id}-documents-08`).text(),
        displayValue: $(`#${invoice.id}-documents-08`).text(),
        dataType: 0,
    });
}
