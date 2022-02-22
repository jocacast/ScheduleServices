import * as AccUtils from "../accUtils";
import ArrayDataProvider = require("ojs/ojarraydataprovider");
import * as dummyInsert from "text!../data/insertDummy.json";
import "ojs/ojtable";
import {JETUtilServiceCallBase} from "../JETUtilServiceCallBase";
import * as ko from "knockout";
import { ojDialog } from "ojs/ojdialog";
import "ojs/ojbutton";
import { ojButtonEventMap } from "ojs/ojbutton";
import "ojs/ojmessages";
import { ojMessage } from "ojs/ojmessage";
import "ojs/ojinputtext";
import { KeySetImpl} from "ojs/ojkeyset";
import KnockoutRouterAdapter = require("@oracle/oraclejet/dist/types/ojknockoutrouteradapter");
import "ojs/ojavatar";


class ServicesViewModel {
  serviceArray : ko.ObservableArray<string> = ko.observableArray();
  getUrl : string = "getServices";
  jetUtil : JETUtilServiceCallBase = new JETUtilServiceCallBase();
  result : string;
  dummyInsertData = JSON.stringify(dummyInsert);

  serviceName : ko.Observable<string> = ko.observable();
  serviceDesc : ko.Observable<string> = ko.observable();

  serviceNameUpdate : ko.Observable<string> = ko.observable();
  serviceDescUpdate : ko.Observable<string> = ko.observable();

  deletedServiceName : ko.Observable<string> = ko.observable();


  insertURL = "insertService";
  updateURL = "updateService";
  deleteURL = "deleteService";

  /*Messages*/
  messages: ko.ObservableArray<ojMessage.Message> = ko.observableArray();
  messagesDataprovider: ArrayDataProvider<null, ojMessage.Message> = new ArrayDataProvider(this.messages);

  /*Table selection*/
  readonly selectedSelectionMode = ko.observable({
    row: "single",
    column: "none",
  }); 

  constructor() {
    this.jetUtil.loadData(this.getUrl)
    .then((response) => {
      this.serviceArray(response.servciesTableInputs);
    })
    .catch((error) => {
      console.log("Error while calling service");
    })
    
  } 
  
  public selectedChangedListener = (event) => {
    const row = event.detail.value.row as KeySetImpl<number>;
    if (row.values().size > 0) {
      row.values().forEach(function (key) {
        console.log("Selected key " + key);
        console.log(this.serviceArray()); 
        let selectedRow = this.serviceArray().find(s => s.serviceName === key);
        console.log("Selected row description " + selectedRow.serviceDescription);
        this.serviceNameUpdate(key);
        this.deletedServiceName(key);
        this.serviceDescUpdate(selectedRow.serviceDescription);
      }, this);
    }
  };

  private readonly dataprovider = new ArrayDataProvider(this.serviceArray, {
    keyAttributes : "serviceName",
    implicitSort : [{attribute: "serviceName", direction: "ascending" }],
  });

  public save = (event: ojButtonEventMap["ojAction"]) =>{
    if(this.serviceName() == '' || this.serviceDesc() == ''){
      this.messages(this.getMessagesData('error', "Error" , "Please provide servie name and service description"));
    }else{
      let payload = {
        serviceName : this.serviceName(),
        serviceDescription : this.serviceDesc()
      }
      this.jetUtil.callPost(payload, "text", this.insertURL).then((response) => {
        if(response === 'Y'){
          this.messages(this.getMessagesData('confirmation', "Success" , "Service correctly created"));
          this.jetUtil.loadData(this.getUrl)
          .then((response) => {
            this.serviceArray(response.servciesTableInputs);
          })
          .catch((error) => {
            console.log("Error while calling service");
          })
        }else{
          this.messages(this.getMessagesData('error', "Error" , "Error while creating service"));
        }
      })
      .catch((error) => {
        console.log("Error");
      });
      (document.getElementById("modalDialog1") as ojDialog).close();
    }
    this.messagesDataprovider = new ArrayDataProvider(this.messages);
  }

  public saveUpdate = (event: ojButtonEventMap["ojAction"]) =>{
    if(this.serviceNameUpdate() == '' || this.serviceDescUpdate() == ''){
      this.messages(this.getMessagesData('error', "Error" , "Please provide service description"));
    }else{
      let payload = {
        serviceName : this.serviceNameUpdate(),
        serviceDescription : this.serviceDescUpdate()
      }
      this.jetUtil.callPost(payload, "text", this.updateURL).then((response) => {
        if(response === 'Y'){
          this.messages(this.getMessagesData('confirmation', "Success" , "Service correctly updated"));
          this.jetUtil.loadData(this.getUrl)
          .then((response) => {
            this.serviceArray(response.servciesTableInputs);
          })
          .catch((error) => {
            console.log("Error while calling service");
          })
        }else{
          this.messages(this.getMessagesData('error', "Error" , "Error while creating service"));
        }
      })
      .catch((error) => {
        console.log("Error");
      });
      (document.getElementById("updateServiceDialogId") as ojDialog).close();
    }
    this.messagesDataprovider = new ArrayDataProvider(this.messages);
  }

  public okDelete = (event: ojButtonEventMap["ojAction"]) =>{
      let payload = {
        serviceName : this.deletedServiceName(),
      }
      this.jetUtil.callPost(payload, "text", this.deleteURL).then((response) => {
        if(response === 'Y'){
          this.messages(this.getMessagesData('confirmation', "Success" , "Service correctly deleted"));
          this.jetUtil.loadData(this.getUrl)
          .then((response) => {
            this.serviceArray(response.servciesTableInputs);
          })
          .catch((error) => {
            console.log("Error while calling service");
          })
        }else{
          this.messages(this.getMessagesData('error', "Error" , "Error while deleting service"));
        }
      })
      .catch((error) => {
        console.log("Error");
      });
      (document.getElementById("deleteServiceDialogId") as ojDialog).close();
    
    this.messagesDataprovider = new ArrayDataProvider(this.messages);
  }

  public close(event: ojButtonEventMap["ojAction"]) {
    (document.getElementById("modalDialog1") as ojDialog).close();
  }

  public cancelUpdate(event: ojButtonEventMap["ojAction"]) {
    (document.getElementById("updateServiceDialogId") as ojDialog).close();
  }

  public cancelDelete(event: ojButtonEventMap["ojAction"]) {
    (document.getElementById("deleteServiceDialogId") as ojDialog).close();
  }

  public open = (event: ojButtonEventMap["ojAction"]) => {
    this.serviceName('');
    this.serviceDesc('');
    (document.getElementById("modalDialog1") as ojDialog).open();
  }

  public openUpdate = (event: ojButtonEventMap["ojAction"]) => {
    (document.getElementById("updateServiceDialogId") as ojDialog).open();
  }

  public openDelete = (event: ojButtonEventMap["ojAction"]) => {
    (document.getElementById("deleteServiceDialogId") as ojDialog).open();
  }

  connected(): void {
    AccUtils.announce("About page loaded.");
    document.title = "About";
    // implement further logic if needed
  }

  disconnected(): void {
    // implement if needed
  }

  transitionCompleted(): void {
    // implement if needed
  }

  public getMessagesData = (messageType : string, summary : string, detail:string): ojMessage.Message[] => {
    if(messageType === 'error'){
      return [
        {
          severity: 'error',
          summary: summary,
          detail: detail,
          autoTimeout: 4000
        },
      ];
    }else if(messageType === 'confirmation'){
      return [
        {
          severity: 'confirmation',
          summary: summary,
          detail: detail,
          autoTimeout: 4000
        },
      ];
    } 

  };
}

export = ServicesViewModel;

