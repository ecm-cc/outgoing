<template>
  <v-layout row wrap>
    <v-flex xs12>
      <h1 class="text-h6">Rechungen an Crossinx versenden</h1>
    </v-flex>
    <v-flex xs6>
      <v-text-field
        append-icon="mdi-magnify"
        label="Suche"
        single-line
        hide-details
        @input="filterSearch"
      ></v-text-field>
    </v-flex>
    <v-flex xs6>
      <v-select
        :items="orgUnits"
        label="Organisationseinheiten"
        @change="filterOrgUnit"
      ></v-select>
    </v-flex>
    <v-flex xs12>
      <v-data-table
        v-model="selected"
        :headers="headers"
        :items="invoices"
        item-key="invoiceNumber"
        show-select
        :search="filters.search"
        :custom-filter="customFilter"
        :loading="isLoading"
        locale="de-DE">
      </v-data-table>
    </v-flex>
  </v-layout>
</template>

<script>
import Vue from 'vue';

const axios = require('axios');
const testData = require('../example/searchResults');

export default {
  name: 'Table',

  data: () => ({
    isLoading: true,
    filters: {
      search: '',
      orgUnit: '',
    },
    search: '',
    selected: [],
    orgUnits: ['1233 - NL Siegen', '1245 - NL Stuttgart Mobility', '1232 - NL Wuppertal'],
    headers: [
      {
        text: 'Rechnungsnummer',
        align: 'start',
        sortable: false,
        value: 'invoiceNumber',
      },
      { text: 'Buchungskreis ID', value: 'companyCode' },
      { text: 'Organisationseinheit', value: 'orgUnit' },
      { text: 'Debitorennummer (AG)', value: 'debitorNumberAG' },
      { text: 'Debitorennname (AG)', value: 'debitorNameAG' },
      { text: 'Debitorennummer (WE)', value: 'debitorNumberWE' },
      { text: 'Debitorennname (WE)', value: 'debitorNameWE' },
      { text: 'Rechnungsgesamtbetrag, brutto', value: 'invoiceSumBrutto' },
      { text: 'Währung', value: 'currency' },
      { text: 'Ersteller SAP', value: 'creatorSAP' },
      { text: 'Erstelldatum (SAP)', value: 'createDateSAP' },
      { text: '01', value: 'docs01' },
      { text: '02', value: 'docs02' },
      { text: '08', value: 'docs08' },
      { text: 'E-Invoice', value: 'eInvoice' },
      { text: 'Rechnungsanlage Kunde', value: 'attachmentCustomer' },
      { text: 'Verarbeitungsstatus', value: 'processingState' },
      { text: 'Versandzeitpunkt', value: 'transportTime' },
      { text: 'Versandrückmeldezeitpunkt', value: 'transportResponseTime' },
    ],
    invoices: [],
  }),
  async mounted() {
    let data;
    if (Vue.config.devtools) {
      data = testData;
    } else {
      const response = await axios({
        method: 'GET',
        // TODO
        url: 'https://able-group-dev.d-velop.cloud/dms/r/1a2cde3f-2913-3dc2-4a2e-e623459ac23a/sr/?objectdefinitionids=[%22AKUNR%22]&properties={%22262%22:[%22Offen%22,%20%22Fehler%22,%20%22Versandbereit%22],%22233%22:[%22%22],%22264%22:[%22%22],%22263%22:[%22%22]}&propertysort=property_last_modified_date&pagesize=2',
        headers: {
          Accept: 'application/hal+json',
          'Content-Type': 'application/hal+json',
        },
      });
      data = response.data;
    }
    this.renderTable(data);
    this.isLoading = false;
  },
  methods: {
    renderTable(searchData) {
      const sortedInvoices = searchData.items.map((item) => ({
        invoiceNumber: item.displayProperties.find((prop) => prop.name === 'Rechnungsnummer').value,
        companyCode: item.displayProperties.find((prop) => prop.name === 'Buchungskreis ID').value,
        orgUnit: item.displayProperties.find((prop) => prop.name === 'Organisationseinheit').value,
        debitorNumberAG: item.displayProperties.find((prop) => prop.name === 'Debitorennummer (AG)').value,
        debitorNameAG: item.displayProperties.find((prop) => prop.name === 'Debitorenname (AG)').value,
        debitorNumberWE: item.displayProperties.find((prop) => prop.name === 'Debitorennummer (WE)').value,
        debitorNameWE: item.displayProperties.find((prop) => prop.name === 'Debitorenname (WE)').value,
        invoiceSumBrutto: item.displayProperties.find((prop) => prop.name === 'Rechnungsgesamtbetrag, brutto').value,
        currency: item.displayProperties.find((prop) => prop.name === 'Währung').value,
        creatorSAP: item.displayProperties.find((prop) => prop.name === 'Ersteller (SAP)').value,
        createDateSAP: item.displayProperties.find((prop) => prop.name === 'Erstelldatum (SAP)').value,
        docs01: 'tbd',
        docs02: 'tbd',
        docs08: 'tbd',
        eInvoice: item.displayProperties.find((prop) => prop.name === 'E-Invoice').value,
        attachmentCustomer: item.displayProperties.find((prop) => prop.name === 'Rechnungsanlage Kunde').value,
        processingState: item.displayProperties.find((prop) => prop.name === 'Verarbeitungsstatus').value,
        transportTime: item.displayProperties.find((prop) => prop.name === 'Versandzeitpunkt').value,
        transportResponseTime: item.displayProperties.find((prop) => prop.name === 'Versandrückmeldezeitpunkt').value,
      }));
      this.invoices = sortedInvoices;
    },
    customFilter(items, filters, filter, headers) {
      const cf = new this.$MultiFilters(items, filters, filter, headers);

      cf.registerFilter('search', function (searchWord, items) {
        if (searchWord.trim() === '') return items;

        return items.filter((item) => {
          return item.invoiceNumber.toLowerCase().includes(searchWord.toLowerCase());
        }, searchWord);

      });

      cf.registerFilter('orgUnit', function (orgUnit, items) {
        if (orgUnit.trim() === '') return items;

        return items.filter((item) => {
          return item.orgUnit.toLowerCase() === orgUnit.toLowerCase();
        }, orgUnit);

      });

      return cf.runFilters();
    },

    filterSearch(val) {
      this.filters = this.$MultiFilters.updateFilters(this.filters, { search: val });
    },

    filterOrgUnit(val) {
      this.filters = this.$MultiFilters.updateFilters(this.filters, { orgUnit: val });
    },
  },
};
</script>
