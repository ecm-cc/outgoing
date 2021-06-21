<template>
  <v-container>
    <v-row>
      <v-col cols="9">
        <v-data-table
          class="elevation-1"
          v-model="selected"
          :headers="headers"
          :items="invoices"
          item-key="invoiceNumber"
          show-select
          :search="search"
          :loading="isLoading"
          :footer-props="{
            itemsPerPageOptions: [20, 50, 100, -1],
            itemsPerPageAllText: 'Alle',
            itemsPerPageText: 'Elemente pro Seite:'
          }"
          locale="de-DE">
            <template v-slot:loading>
              Rechnungen werden geladen..
            </template>
            <template v-slot:no-data>
              Die Rechnungsakten konnten nicht geladen werden. Entweder es sind keine versandbereiten Rechnungen
              verfügbar oder ein Fehler liegt vor.
            </template>
            <template v-slot:no-results>
              Keine Ergebnisse gefunden.
            </template>
            <template v-slot:item.invoiceNumber="{ item }">
              <a :href="item.link" target="dapi_navigate"> {{ item.invoiceNumber }} </a>
            </template>
            <template v-slot:item.createTime="{ item }">
              {{ new Date(item.createTime).toLocaleDateString() }}, {{ new Date(item.createTime).toLocaleTimeString() }}
            </template>
            <template v-slot:footer.page-text="{ pageStart, pageStop, itemsLength }">
              {{pageStart}} bis {{pageStop}} von {{itemsLength}}
            </template>
            <template v-slot:top>
              <v-container>
                <v-row>
                  <v-col cols="4" class="pb-0">
                    <h1 class="text-h6 mt-4">Rechungen an Crossinx versenden</h1>
                  </v-col>
                  <v-col cols="4" class="pb-0">
                    <v-text-field
                      v-model="search"
                      append-icon="mdi-magnify"
                      label="Suche"
                      single-line
                      hide-details
                    ></v-text-field>
                  </v-col>
                  <v-col cols="4" class="pb-0">
                    <v-select :clearable="true" v-model="orgUnit" :items="orgUnits" label="Organisationseinheit"></v-select>
                  </v-col>
                  <v-col cols="3" class="pt-0">
                    <v-select :clearable="true" v-model="companyCode" :items="companyCodes" label="Buchungskreis ID"></v-select>
                  </v-col>
                  <v-col cols="3" class="pt-0">
                    <v-select :clearable="true" v-model="processingState" :items="processingStates" label="Verarbeitungsstatus"></v-select>
                  </v-col>
                  <v-col cols="2" class="pt-0">
                    <v-checkbox v-model="docs01" label="01 - Rechnung"></v-checkbox>
                  </v-col>
                  <v-col cols="2" class="pt-0">
                    <v-checkbox v-model="docs02" label="02 - Anlage"></v-checkbox>
                  </v-col>
                  <v-col cols="2" class="pt-0">
                    <v-checkbox v-model="docs08" label="08 - XML"></v-checkbox>
                  </v-col>
                </v-row>
              </v-container>
            </template>
          </v-data-table>
      </v-col>
      <v-col cols="3">
        <v-container>
          <h2 class="text-h6 mt-4">Ausgewählte Rechnungen</h2>
          <p class="text-body-2 mt-4">{{selected.length}} von {{invoices.length}} Rechnungen zum Versand ausgewählt.</p>
          <v-dialog v-model="dialog" persistent max-width="400" v-if="selected.length > 0">
            <template v-slot:activator="{ on, attrs }">
                <v-btn color="primary" @click="dialog = true" v-bind="attrs" v-on="on">Absenden</v-btn>
            </template>
            <v-card>
              <v-card-title class="headline">Rechnungen absenden?</v-card-title>
              <v-card-text>
                Möchten Sie wirklich {{selected.length}} Rechnung<span v-if="selected.length > 1">en</span> an Crossinx versenden?
                Sie werden nach Versandabschluss per E-Mail benachrichtigt.
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" text @click="dialog = false">Nein</v-btn>
                <v-btn color="primary" text @click="dialog = false; overlay = !overlay; sendInvoices();">Ja</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-container>
      </v-col>
    </v-row>
    <v-overlay absolute opacity="0.8" :value="overlay">
      <v-progress-linear
        indeterminate
        color="primary"
        class="mb-0"
      ></v-progress-linear>
      Rechnungen werden versendet, bitte warten..
    </v-overlay>
  </v-container>
</template>

<script>
import Vue from 'vue';
import axios from 'axios';
import { getConfig } from '../plugins/config';
import testData from '../example/searchResults';

export default {
  name: 'Table',
  data: () => ({
    overlay: false,
    dialog: false,
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
    config: {}
  }),
  async mounted() {
    try {
      const data = await this.loadData();
      this.renderTable(data);
      this.fillDropdowns();
    } catch (err) {
      this.isLoading = false;
      this.invoices = [];
      console.log(err);
    }
    
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
        { text: 'Rechnungsgesamtbetrag, brutto', value: 'invoiceSumBrutto', align:'right' },
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
        { text: 'Erstelldatum', value: 'createTime', sort: (a, b) =>  {
            console.log(new Date(a).valueOf());
            if(new Date(a).valueOf() < new Date(b).valueOf()) {
              return -1;
            } else if(new Date(a).valueOf() > new Date(b).valueOf()) {
              return 1;
            } else {
              return 0;
            }
          }
        },
      ];
    },
  },
  methods: {
    async loadData() {
      let data;
      if (Vue.config.devtools) {
        data = testData;
        this.isLoading = false;
      } else {
        this.config = await getConfig(window.location.host);
        const response = await axios({
          method: 'GET',
          url: this.config.searchURL,
          headers: {
            Accept: 'application/hal+json',
            'Content-Type': 'application/hal+json',
          },
        });
        data = response.data;
        this.loadBackgroundData(data._links.nextPage ? data._links.nextPage.href : null);
      }
      return data;
    },
    renderTable(searchData) {
      const sortedInvoices = searchData.items.map((item) => ({
        id: item.id,
        link: `${this.config.host}/dms/r/${this.config.repositoryID}/o2/${item.id}`,
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
        createTime: new Date(item.displayProperties.find((prop) => prop.name === 'Erstellt am').value),
      }));
      this.invoices = this.invoices.concat(sortedInvoices);
    },
    fillDropdowns() {
      this.orgUnits = this.invoices.map((element) => element.orgUnit);
      this.orgUnits.sort();
      this.companyCodes = this.invoices.map((element) => element.companyCode);
      this.companyCodes.sort();
      this.processingStates = this.invoices.map((element) => element.processingState);
      this.processingStates.sort();
    },
    checkStatusflag(fieldValue, documentCategory) {
      const index = documentCategory - 1;
      if(!fieldValue || fieldValue.length < 8) {
        return '';
      } else {
        const statusValue = fieldValue[index];
        return statusValue === '1' ? 'X' : '';
      }
    },
    async loadBackgroundData(pageLink) {
      if (pageLink != null) {
        const response = await axios({
          method: 'GET',
          url: this.config.host + pageLink,
          headers: {
            Accept: 'application/hal+json',
            'Content-Type': 'application/hal+json',
          },
        });
        const data = response.data;
        this.renderTable(data);
        this.fillDropdowns();
        await this.loadBackgroundData(data._links.nextPage ? data._links.nextPage.href : null);
      } else {
        this.isLoading = false;
      }
    },
    sendInvoices() {
      this.overlay = true;
      if(Vue.config.devtools) {
        this.overlay = false;
        location.reload();
      } else {
        this.sendInvoiceRequests()
          .then(() => { 
            this.overlay = false;
            location.reload();
          })
          .catch((err) => {
            console.error(err);
            this.overlay = false;
          }
        );
      }
    },
    async sendInvoiceRequests() {
      const promises = [];
      this.selected.forEach((item) => {
        promises.push(axios({
          method: 'put',
          url: `/dms/r/${this.config.repositoryID}/o2m/${item.id}`,
          data: {
            sourceCategory: this.config.invoiceCategory,
            sourceId: `/dms/r/${this.config.repositoryID}/source`,
            sourceProperties: {
                properties: [
                    {
                        key: this.config.invoiceStatusPropertyID,
                        values: ['In Bearbeitung'],
                    },
                ],
            }
          }
        }));
      })
      await Promise.all(promises);
      await axios({
          method: 'post',
          url: '/able-outgoing/invoices',
          data: { invoices: JSON.stringify(this.selected.map((item) => item.id)) },
          timeout: 120000,
      });
    }
  },
};
</script>