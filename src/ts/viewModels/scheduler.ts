import * as AccUtils from "../accUtils";
import * as ko from "knockout";
import "ojs/ojknockout";
import "ojs/ojselectcombobox";
import { JETUtilServiceCallBase } from "../JETUtilServiceCallBase";
import ArrayDataProvider = require("ojs/ojarraydataprovider");
import { IntlConverterUtils } from "ojs/ojconverterutils-i18n";
import "ojs/ojdatetimepicker";
import "ojs/ojavatar";
import "ojs/ojbutton";
import { ojDialog } from "ojs/ojdialog";
import { ojButtonEventMap } from "ojs/ojbutton";
import { KeySetImpl} from "ojs/ojkeyset";
import "ojs/ojtable";
import { ojMessage } from "ojs/ojmessage";
import "ojs/ojmessages";

class SchedulerViewModel {
  statusValue : ko.Observable<string>;
  customers : ko.ObservableArray<string> = ko.observableArray();
  services : ko.ObservableArray<string> = ko.observableArray();
  scheduleArray : ko.ObservableArray<string> = ko.observableArray();
  notesArray : ko.ObservableArray<string> = ko.observableArray();
  selectedCustomer : ko.Observable<string> = ko.observable('ALL');
  selectedService : ko.Observable<string> =ko.observable('ALL');
  fromValue: ko.Observable<string>;
  toValue: ko.Observable<string>;
  scheduleCustomer : ko.Observable<string> = ko.observable();
  scheduleService : ko.Observable<string> = ko.observable();
  scheduleStatus : ko.Observable<string> = ko.observable();
  scheduleDate : ko.Observable<string> = ko.observable();
  scheduleDescription : ko.Observable<string> = ko.observable();
  scheduleAddedBy : ko.Observable<string> = ko.observable();
  scheduleAddedDate : ko.Observable<string> = ko.observable();
  scheduleChangeStatusNote : ko.Observable<string> = ko.observable();
  scheduleId : ko.Observable<string> = ko.observable();
  newNote : ko.Observable<string> = ko.observable();
  selectedNoteId : ko.Observable<string> = ko.observable();
  


  jetUtil: JETUtilServiceCallBase = new JETUtilServiceCallBase();
  getCustomersUrl: string = "getCustomers";
  getServicesUrl : string = "getServices";
  postScheduleUrl : string = "getSchedule";
  insertScheduleUrl : string = "insertSchedule"; 
  changeScheduleStatus : string = "changeScheduleStatus";
  updateScheduleUrl : string = "updateSchedule";
  getScheduleNotesUrl : string = "getScheduleNotes"; 
  insertScheduleNoteUrl : string = "insertScheduleNote";
  deleteScheduleNoteUrl: string = "deleteScheduleNote";

  //Table selection mode
  readonly selectedSelectionMode = ko.observable({
    row: "single",
    column: "none",
  });

  readonly customerDataProvider = new ArrayDataProvider(this.customers, {
    keyAttributes: "value",
  });

  readonly serviceDataProvider = new ArrayDataProvider(this.services, {
    keyAttributes: "value",
  });

  dataProvider = new ArrayDataProvider(this.scheduleArray, {
    keyAttributes : "scheduleId"
  });

  notesDataProvider = new ArrayDataProvider(this.notesArray, {
    keyAttributes : "noteId"
  });

   /*Messages*/
   messages: ko.ObservableArray<ojMessage.Message> = ko.observableArray();
   messagesDataprovider: ArrayDataProvider<null, ojMessage.Message> = new ArrayDataProvider(this.messages);

  constructor() {
    this.statusValue = ko.observable('ACTIVE');
    //Customers
    this.jetUtil
      .loadData(this.getCustomersUrl)
      .then((response) => {
        let customerArray = [];
        let responseArray = [];

        if(response.customersTableInputs){
          responseArray = response.customersTableInputs;
          customerArray.push(this.valueAndLabelFormat('ALL', 'ALL'));
          for(let i=0; i<responseArray.length; i++){
            customerArray.push(this.valueAndLabelFormat(responseArray[i].customerId, responseArray[i].customerName));
          }
          this.customers(customerArray);
        }
      })
      .catch((error) => {
        console.log(`Error while calling service: ${error}`);
      });

      //Services
      this.jetUtil.loadData(this.getServicesUrl)
      .then((response) => {
        let servicesArray = [];
        let responseArray = [];

        if(response.servciesTableInputs){
          responseArray = response.servciesTableInputs;
          servicesArray.push(this.valueAndLabelFormat('ALL', 'ALL'));
          for(let i=0; i<responseArray.length; i++){
            servicesArray.push(this.valueAndLabelFormat(responseArray[i].serviceName, responseArray[i].serviceDescription));
          }
          this.services(servicesArray);
        }
      })
      .catch((error) => {
        console.log(`Error while calling service: ${error}`);
      })

      //Dates
      this.fromValue = ko.observable(
        IntlConverterUtils.dateToLocalIso(new Date()));

      this.toValue = ko.observable(
        IntlConverterUtils.dateToLocalIso(new Date(new Date().getTime() + (90*24*60*60*1000))));

      this.callPostSchedule(this.postScheduleUrl);
  }

  valueAndLabelFormat = (value, label) =>{
    return{
      value: value,
      label : label
    };
  }

  public refresh = (event: ojButtonEventMap["ojAction"]) => {
    console.log(`Status: ${this.statusValue()}`);
    console.log(`Customer: ${this.selectedCustomer()}`);
    console.log(`Service: ${this.selectedService()}`);
    console.log(`From: ${this.fromValue().split('T')[0]}`);
    console.log(`To: ${this.toValue().split('T')[0]}`);
    let payload = {
      status : this.statusValue(),
      customer : this.selectedCustomer(),
      service : this.selectedService(),
      dateFrom : this.fromValue().split('T')[0],
      dateTo : this.toValue().split('T')[0],
    };
    this.callPostSchedule(this.postScheduleUrl);
  };

  public selectedChangedListener = (event) => {
    const row = event.detail.value.row as KeySetImpl<number>;
    if (row.values().size > 0) {
      row.values().forEach(function (key) {
        let selectedRow = this.scheduleArray().find(s => s.scheduleId === key);
        this.scheduleId(key);
        console.log("Selected row id " + this.scheduleId());
        this.scheduleCustomer(selectedRow.scheduleCustomer);
        this.scheduleService(selectedRow.scheduleService);
        this.scheduleStatus(selectedRow.scheduleStatus);
        this.scheduleDate(selectedRow.scheduleDate);
        this.scheduleDescription(selectedRow.scheduleDescription);
      }, this);
    }
  };

  public selectedNoteChangedListener = (event) => {
    const row = event.detail.value.row as KeySetImpl<number>;
    if (row.values().size > 0) {
      row.values().forEach(function (key) {
        console.log("Selected note key " + key);
        let selectedRow = this.notesArray().find(s => s.noteId === key);
        console.log("Selected row description " + selectedRow.noteDescription);
        this.selectedNoteId(key)
      }, this);
    }
  };

  public callPostSchedule = (url) => {
    let payload = {
      status : this.statusValue(),
      customer : this.selectedCustomer(),
      service : this.selectedService(),
      dateFrom : this.fromValue().split('T')[0],
      dateTo : this.toValue().split('T')[0],
    };
    this.jetUtil.callPost(payload, "json", url).then((response) => {
      if(response){
        let iterableArray = [];
        if(response.scheduleTableInputs && response.scheduleTableInputs.scheduleId){
          iterableArray.push(response.scheduleTableInputs);
        }else{
          iterableArray = response.scheduleTableInputs;
        }
        for(let scheduleObject of iterableArray){
          for (let i = 0; i < this.customers().length; i++){
            if(scheduleObject.scheduleCustomer == i){
              scheduleObject['scheduleCustomerName'] = this.customers()[i]['label'];
              break;
            }
          }
        }

        if(response.scheduleTableInputs && response.scheduleTableInputs.scheduleId){
          let responseArray = [];
          responseArray.push(response.scheduleTableInputs);
          this.scheduleArray (responseArray);
        }else{
          this.scheduleArray(response.scheduleTableInputs);
        }
        
      }else{
        this.scheduleArray([]);
      }
        
    })
    .catch((error) => {
      console.log(`Error while calling post schedule service ${error}`);
    });
  };

  public openCreate = () =>{
    this.scheduleCustomer('');
    this.scheduleService('');
    this.scheduleDate('');
    this.scheduleDescription(''); 
    this.openModal('scheduleModalDialog');
  }

  public closeCreate = () => {
    this.closeModal('scheduleModalDialog');
  }

  public saveCreate = () => {
    this.save('saveCreate');
  }

  public closeSchedule = () =>{
    this.scheduleChangeStatusNote('');
    this.openModal('closeScheduleDialog');
  }

  public cancelSchedule = () =>{
    this.scheduleChangeStatusNote('');
    this.openModal('cancelScheduleDialog');
  }

  public saveCloseSchedule = () =>{
    this.changeStatus('CLOSED');
    this.closeModal('closeScheduleDialog');
  }

  public saveCancelSchedule = () =>{
    this.changeStatus('CANCELLED');
    this.closeModal('cancelScheduleDialog');
  }

  public cancelCloseSchedule = () => {
    this.closeModal('closeScheduleDialog');
  }

  public cancelCancelSchedule = () =>{
    this.closeModal('cancelScheduleDialog');
  }

  public editSchedule = () => {
    this.openModal('editScheduleModalDialog');
  }

  public saveEdit = () => {
    this.save('saveEdit');
  }

  public cancelEdit  = () =>{
    this.closeModal('editScheduleModalDialog');
  }

  public okNotes = () => {
    this.closeModal("notesScheduleDialog");
    this.notesArray([]);
  }

  public openScheduleNotes = ()=>{
    this.openModal('notesScheduleDialog');
    setTimeout(() => {  this.callGetNotesWS(); }, 200);
    this.newNote('');
    
  }

  private changeStatus = (status)=>{
    let payload = {
      scheduleId : this.scheduleId(),
      scheduleStatus : status ,
      scheduleDescription : this.scheduleChangeStatusNote(),
      scheduleAddedBy: 'ADMIN',
    }
    this.jetUtil.callPost(payload, "text", this.changeScheduleStatus).then((response) => {
      if(response === 'Y'){
        this.messages(this.getMessagesData('confirmation', "Success" , "Schedule status correctly updated"));
        this.callPostSchedule(this.postScheduleUrl);
      }else{
        this.messages(this.getMessagesData('error', "Error" , "Error while updating status schedule"));
      }
    })
    .catch((error) => {
      console.log("Error");
    });
  }

  public saveNewNote = () =>{
    if(this.newNote() === '' || this.newNote().trim() === ''){
      this.messages(this.getMessagesData('error', "Error" , "Please provide schedue customer, date and description"));
    }else{
      this.addNote();
      this.newNote('');
    } 
  }

  public deleteNote = () => {
    setTimeout(() => {  this.deleteExistingNote(); }, 200);
  }

  public addNote = () => {
    const callType = 'saveNote';
    let payload = {
      noteSchedule : this.scheduleId(),
      noteDescription : this.newNote(),
      noteAddedBy : 'ADMIN',
    }
    let successMessage = 'Success adding note';
    let errorMessage = 'Error while adding note';
    this.callPostServiceReturnString(payload,this.insertScheduleNoteUrl, successMessage, errorMessage, callType);
  }

  public deleteExistingNote = () =>{
    console.log('Delete note' + this.selectedNoteId());
    const callType = 'deleteNote';
    let payload = {
      noteId : this.selectedNoteId(),
    };
    let successMessage = 'Success deleting note';
    let errorMessage = 'Error while deleting note';
    this.callPostServiceReturnString(payload,this.deleteScheduleNoteUrl, successMessage, errorMessage, callType);
  }

  public closeModal = (modalId) =>{
    (document.getElementById(modalId) as ojDialog).close();
  }

  public openModal = (modalId) =>{
    (document.getElementById(modalId) as ojDialog).open();
  }


  public save = (action) => {
    let callType = 'saveOrUpdateSchedule';
    let parentPayload = {
      scheduleCustomer : this.scheduleCustomer(),
      scheduleService : this.scheduleService(),
      scheduleStatus : this.scheduleStatus(),
      scheduleDate : this.scheduleDate().split('T')[0],
      scheduleDescription : this.scheduleDescription(),
    }

    let savePayload = Object.assign({}, parentPayload);
    savePayload.scheduleStatus= 'ACTIVE';
    savePayload['scheduleAddedBy'] = 'ADMIN';
    savePayload['scheduleAddedDate'] = new Date();

    let editPaylod = Object.assign({}, parentPayload);
    editPaylod['scheduleId'] = this.scheduleId();

    let payload = action === 'saveCreate' ? savePayload : editPaylod;
    let modalDialog = action === 'saveCreate' ? 'scheduleModalDialog' : 'editScheduleModalDialog';

    
    if(this.scheduleCustomer() == '' || this.scheduleService() =='' || this.scheduleDate()==''){
      this.messages(this.getMessagesData('error', "Error" , "Please provide schedue customer, date and description"));
    }else{
      let url = action === 'saveCreate' ? this.insertScheduleUrl: this.updateScheduleUrl;
      let successMessage = action === 'saveCreate' ? 'Schedule correctly created' : 'Shcedule correctly updated';
      let errorMessage = action === 'saveCreate' ? 'Error while creating schedule' : 'Error while updating schedule';
      this.callPostServiceReturnString(payload, url, successMessage, errorMessage, callType);
    }
    (document.getElementById(modalDialog) as ojDialog).close();
  }


  private callPostServiceReturnString = (payload, url, successMessage, errorMessage, callType) =>{
    this.jetUtil.callPost(payload, "text", url).then((response) => {
      if(response === 'Y'){
        this.messages(this.getMessagesData('confirmation', "Success" , successMessage));
        console.log(response);
        if(callType === 'saveOrUpdateSchedule'){
          this.callPostSchedule(this.postScheduleUrl);
        }else{
          this.callGetNotesWS();
        }
        
      }else{
        this.messages(this.getMessagesData('error', "Error" , errorMessage));
      }
    })
    .catch((error) => {
      console.log("Error" + error);
    });
  }

  public callGetNotesWS = () => {
    this.jetUtil.loadDataOneParam(this.getScheduleNotesUrl, 'scheduleId', this.scheduleId())
    .then((response) => {
      if(response && response.scheduleNotesInputs && response.scheduleNotesInputs.length){
        this.notesArray(response.scheduleNotesInputs);
      }else{
        if(response && response.scheduleNotesInputs){
          let responseArray = [];
          responseArray.push(response.scheduleNotesInputs); 
          this.notesArray(responseArray);
        }else{
          this.notesArray([]);
        }
      }

    })
    .catch((error) => {
      console.log(`Error while calling service: ${error}`);
    })
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

export = SchedulerViewModel;
