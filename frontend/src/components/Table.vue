<template>
  <v-container>
    <v-row class="mt-2">
      <!-- v-container ?? -->
      <v-col col="9">
        <v-data-table
          dense
          class="elevation-1"
          v-model="selected"
          :headers="headers"
          :items="invoices"
          item-key="invoiceNumber"
          show-select
          :search="search"
          :loading="isLoading"
          locale="de-DE">
            <template v-slot:no-data>
              Die Rechnungsakten konnten nicht geladen werden. Entweder es sind keine versandbereiten Rechnungen
              verfügbar oder ein Fehler liegt vor.
            </template>
            <template v-slot:no-results>
              Zu dieser Anfrage konnten keine Suchergebnisse gefunden werden.
            </template>
            <template v-slot:top>
              <v-row>
                <v-col col="6">
                  <h1 class="text-h6 mt-4">Rechungen an Crossinx versenden</h1>
                </v-col>
                <v-col col="6">
                  <v-text-field
                    v-model="search"
                    append-icon="mdi-magnify"
                    label="Suche"
                    single-line
                    hide-details
                  ></v-text-field>
                </v-col>
                <v-col cols="2">
                  <v-select :clearable="true" v-model="orgUnit" :items="orgUnits" label="Organisationseinheit"></v-select>
                </v-col>
                <v-col cols="2">
                  <v-select :clearable="true" v-model="companyCode" :items="companyCodes" label="Buchungskreis ID"></v-select>
                </v-col>
                <v-col cols="2">
                  <v-select :clearable="true" v-model="processingState" :items="processingStates" label="Verarbeitungsstatus"></v-select>
                </v-col>
                <v-col cols="1">
                  <v-checkbox v-model="docs01" label="01 vorhanden"></v-checkbox>
                </v-col>
                <v-col cols="1">
                  <v-checkbox v-model="docs02" label="02 vorhanden"></v-checkbox>
                </v-col>
                <v-col cols="1">
                  <v-checkbox v-model="docs08" label="08 vorhanden"></v-checkbox>
                </v-col>
              </v-row>
            </template>
          </v-data-table>
      </v-col>
      <v-col col="3">
        <h2 class="text-h6">Ausgewählte Rechnungen</h2>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import Vue from 'vue';
const axios = require('axios');
const testData = require('../example/searchResults');
export default {
  name: 'Table',
  data: () => ({
    isLoading: true,
    search: '',
    orgUnit: '',
    orgUnits: [],
    companyCode: '',
    companyCodes: [],
    processingState: '',
    processingStates: [],
    docs01: false,
    docs02: false,
    docs08: false,
    selected: [],
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
    this.fillDropdowns();
    this.isLoading = false;
  },
  computed: {
    headers() {
      return [
        {
          text: 'Rechnungsnummer',
          align: 'start',
          sortable: false,
          value: 'invoiceNumber',
        },
        { 
            text: 'Buchungskreis ID', 
            value: 'companyCode', 
            filter: (value) => this.companyCode ? value.toLowerCase().includes(this.companyCode.toLowerCase()) : true, 
        },
        {
          text: 'Organisationseinheit',
          value: 'orgUnit',
          filter: (value) => this.orgUnit ? value.toLowerCase().includes(this.orgUnit.toLowerCase()) : true,
        },
        { text: 'Debitorennummer (AG)', value: 'debitorNumberAG' },
        { text: 'Debitorennname (AG)', value: 'debitorNameAG' },
        { text: 'Debitorennummer (WE)', value: 'debitorNumberWE' },
        { text: 'Debitorennname (WE)', value: 'debitorNameWE' },
        { text: 'Rechnungsgesamtbetrag, brutto', value: 'invoiceSumBrutto' },
        { text: 'Währung', value: 'currency' },
        { text: 'Ersteller SAP', value: 'creatorSAP' },
        { text: 'Erstelldatum (SAP)', value: 'createDateSAP' },
        { 
          text: '01', 
          value: 'docs01',  
          filter: (value) => this.docs01 ? value.includes('X') : true,
        },
        { 
          text: '02', 
          value: 'docs02',  
          filter: (value) => this.docs02 ? value.includes('X') : true,
        },
        { 
          text: '08', 
          value: 'docs08',  
          filter: (value) => this.docs08 ? value.includes('X') : true,
        },
        { text: 'E-Invoice', value: 'eInvoice' },
        { text: 'Rechnungsanlage Kunde', value: 'attachmentCustomer' },
        { 
            text: 'Verarbeitungsstatus', 
            value: 'processingState',
            filter: (value) => this.processingState ? value.toLowerCase().includes(this.processingState.toLowerCase()) : true,
        },
        { text: 'Versandzeitpunkt', value: 'transportTime' },
        { text: 'Versandrückmeldezeitpunkt', value: 'transportResponseTime' },
      ];
    },
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
        docs01: this.checkStatusflag(item.displayProperties.find((prop) => prop.name === 'Statusflag').value, 1),
        docs02: this.checkStatusflag(item.displayProperties.find((prop) => prop.name === 'Statusflag').value, 2),
        docs08: this.checkStatusflag(item.displayProperties.find((prop) => prop.name === 'Statusflag').value, 8),
        eInvoice: item.displayProperties.find((prop) => prop.name === 'E-Invoice').value,
        attachmentCustomer: item.displayProperties.find((prop) => prop.name === 'Rechnungsanlage Kunde').value,
        processingState: item.displayProperties.find((prop) => prop.name === 'Verarbeitungsstatus').value,
        transportTime: item.displayProperties.find((prop) => prop.name === 'Versandzeitpunkt').value,
        transportResponseTime: item.displayProperties.find((prop) => prop.name === 'Versandrückmeldezeitpunkt').value,
      }));
      this.invoices = sortedInvoices;
    },
    fillDropdowns() {
      this.orgUnits = this.invoices.map((element) => element.orgUnit);
      this.companyCodes = this.invoices.map((element) => element.companyCode);
      this.processingStates = this.invoices.map((element) => element.processingState);
    },
    checkStatusflag(fieldValue, documentCategory) {
      const index = documentCategory - 1;
      if(!fieldValue || fieldValue.length < 8) {
        return '';
      } else {
        const statusValue = fieldValue[index];
        return statusValue === '1' ? 'X' : '';
      }
    }
  },
};
</script>