import * as AccUtils from "../accUtils";
import "ojs/ojtable";
import "ojs/ojinputtext";
import * as ko from "knockout";
import { ojInputText } from "ojs/ojinputtext";
import * as deptData from "text!../data/departmentData.json";
import * as custData from "text!../data/customersData.json";
import { FilterFactory } from "ojs/ojdataprovider";
import ArrayDataProvider = require("ojs/ojarraydataprovider");
import ListDataProviderView = require("ojs/ojlistdataproviderview");
import { ojTable } from "ojs/ojtable";
import { JETUtilServiceCallBase } from "../JETUtilServiceCallBase";
import "ojs/ojbutton";
import { ojButtonEventMap } from "ojs/ojbutton";
import { ojDialog } from "ojs/ojdialog";
import "ojs/ojmessages";
import { ojMessage } from "ojs/ojmessage";
import "ojs/ojavatar";
import "ojs/ojasyncvalidator-regexp";
import AsyncRegExpValidator = require("ojs/ojasyncvalidator-regexp");
import { KeySetImpl } from "ojs/ojkeyset";

interface CustomerData {
  customerAddress: string;
  customerDescription: string;
  customerEmail: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerWebsite: string;
}

class CustomersViewModel {
  baseCustArray = JSON.parse(custData);
  jetUtil: JETUtilServiceCallBase = new JETUtilServiceCallBase();
  readonly filter = ko.observable("");
  customerId: ko.Observable<string> = ko.observable();
  customerName: ko.Observable<string> = ko.observable();
  customerAddress: ko.Observable<string> = ko.observable();
  customerEmail: ko.Observable<string> = ko.observable();
  customerDescription: ko.Observable<string> = ko.observable();
  customerPhone: ko.Observable<string> = ko.observable();
  customerWebsite: ko.Observable<string> = ko.observable();
  customersArray: ko.ObservableArray<CustomerData> = ko.observableArray();

  getUrl: string = "getCustomers";
  insertURL: string = "insertCustomer";
  updateURL: string = "updateCustomer";
  deleteURL: string = "deleteCustomer";
  custArray: Array<CustomerData> = [];

  emailPatternValidator = ko.observableArray([
    new AsyncRegExpValidator({
      pattern:
        "[a-zA-Z0-9.!#$%&'*+\\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*",
      hint: "enter a valid email format",
      messageDetail: "Not a valid email format",
    }),
  ]);

  messages: ko.ObservableArray<ojMessage.Message> = ko.observableArray();
  messagesDataprovider: ArrayDataProvider<null, ojMessage.Message> =
    new ArrayDataProvider(this.messages);

  /*Table selection*/
  readonly selectedSelectionMode = ko.observable({
    row: "single",
    column: "none",
  });

  constructor() {
    this.loadDataFromWS();
    /*this.jetUtil
      .loadData(this.getUrl)
      .then((response) => {
        this.customersArray(response.customersTableInputs);
        console.log(this.customersArray());
        console.log(this.customersArray().length);
        for (let j = 0; j < this.customersArray().length; j++) {
          console.log(this.customersArray()[j]);
          this.custArray[j] = {
            customerId: this.customersArray()[j].customerId,
            customerName: this.customersArray()[j].customerName,
            customerAddress: this.customersArray()[j].customerAddress,
            customerEmail: this.customersArray()[j].customerEmail,
            customerDescription: this.customersArray()[j].customerDescription,
            customerPhone: this.customersArray()[j].customerPhone,
            customerWebsite: this.customersArray()[j].customerWebsite,
          };
        }
      })
      .catch((error) => {
        console.log(`Error while calling service >> ${error}`);
      });*/
  }

  readonly dataprovider = ko.computed(function () {
    let filterCriterion = null;
    if (this.filter() && this.filter() != "") {
      filterCriterion = FilterFactory.getFilter({
        filterDef: { text: this.filter() },
      });
    }
    const arrayDataProvider = new ArrayDataProvider<
      CustomerData["customerId"],
      CustomerData
    >(this.customersArray, { keyAttributes: "customerId" });
    return new ListDataProviderView<
      string,
      CustomerData,
      string,
      CustomerData
    >(arrayDataProvider, { filterCriterion: filterCriterion });
  }, this);

  readonly handleValueChanged = () => {
    this.filter((document.getElementById("filter") as ojInputText).rawValue);
  };

  readonly highlightingCellRenderer = (
    context: ojTable.ColumnsRendererContext<
      CustomerData["customerId"],
      CustomerData
    >
  ) => {
    let field = null;
    if (context.columnIndex === 1) {
      field = "customerId";
    } else if (context.columnIndex === 2) {
      field = "customerName";
    } else if (context.columnIndex === 3) {
      field = "customerAddress";
    } else if (context.columnIndex === 4) {
      field = "customerEmail";
    } else if (context.columnIndex === 5) {
      field = "customerDescription";
    } else if (context.columnIndex === 6) {
      field = "customerPhone";
    } else if (context.columnIndex === 7) {
      field = "customerWebsite";
    }

    let data = context.row[field].toString();
    const filterString = this.filter();
    let textNode: Text;
    let spanNode = document.createElement("span");
    if (filterString && filterString.length > 0) {
      const index = data.toLowerCase().indexOf(filterString.toLowerCase());
      if (index > -1) {
        const highlightedSegment = data.substr(index, filterString.length);
        if (index !== 0) {
          textNode = document.createTextNode(data.substr(0, index));
          spanNode.appendChild(textNode);
        }
        let bold = document.createElement("b");
        textNode = document.createTextNode(highlightedSegment);
        bold.appendChild(textNode);
        spanNode.appendChild(bold);
        if (index + filterString.length !== data.length) {
          textNode = document.createTextNode(
            data.substr(index + filterString.length, data.length - 1)
          );
          spanNode.appendChild(textNode);
        }
      } else {
        textNode = document.createTextNode(data);
        spanNode.appendChild(textNode);
      }
    } else {
      textNode = document.createTextNode(data);
      spanNode.appendChild(textNode);
    }
    context.parentElement.appendChild(spanNode);
  };

  readonly columnArray = [
    {
      headerText: "Action",
      headerClassName: "tableHeaderStyle",
      width: "150",
      template: "cellTemplate",
    },
    { headerText: "Customer Id", renderer: this.highlightingCellRenderer },
    { headerText: "Customer Name", renderer: this.highlightingCellRenderer },
    { headerText: "Customer Adress", renderer: this.highlightingCellRenderer },
    { headerText: "Customer Email", renderer: this.highlightingCellRenderer },
    {
      headerText: "Customer Description",
      renderer: this.highlightingCellRenderer,
    },
    { headerText: "Customer Phone", renderer: this.highlightingCellRenderer },
    {
      headerText: "Customer Web Site",
      renderer: this.highlightingCellRenderer,
    },
  ];

  public openCustomerCreate = (event: ojButtonEventMap["ojAction"]) => {
    this.customerId("");
    this.customerName("");
    this.customerAddress("");
    this.customerDescription("");
    this.customerPhone("");
    this.customerWebsite("");
    (document.getElementById("createCustomerDialog") as ojDialog).open();
  };

  public saveCustomerCreate = (event: ojButtonEventMap["ojAction"]) => {
    if (
      this.customerId() == "" ||
      this.customerName() == "" ||
      this.customerAddress() == ""
    ) {
      this.messages(
        this.getMessagesData(
          "error",
          "Error",
          "Please provide customer information"
        )
      );
    } else {
      let payload = {
        customerId: this.customerId(),
        customerName: this.customerName(),
        customerAddress: this.customerAddress(),
        customerEmail: this.customerEmail(),
        customerDescription: this.customerDescription(),
        customerPhone: this.customerPhone(),
        customerWebsite: this.customerWebsite(),
      };
      this.jetUtil
        .callPost(payload, "text", this.insertURL)
        .then((response) => {
          if (response === "Y") {
            this.messages(
              this.getMessagesData(
                "confirmation",
                "Success",
                "Customer correctly created"
              )
            );
            this.loadDataFromWS();
          } else {
            this.messages(
              this.getMessagesData(
                "error",
                "Error",
                "Error while creating user"
              )
            );
          }
        })
        .catch((error) => {
          console.log("Error");
        });
      (document.getElementById("createCustomerDialog") as ojDialog).close();
    }
    this.messagesDataprovider = new ArrayDataProvider(this.messages);
  };

  public cancelCustomerCreate = (event: ojButtonEventMap["ojAction"]) => {
    (document.getElementById("createCustomerDialog") as ojDialog).close();
  };

  public openCustomerUpdate = (event: ojButtonEventMap["ojAction"]) => {
    (document.getElementById("updateCustomerDialogId") as ojDialog).open();
  };

  public saveUpdate = (event: ojButtonEventMap["ojAction"]) => {
    if (
      this.customerId() == "" ||
      this.customerName() == "" ||
      this.customerAddress() == ""
    ) {
      this.messages(
        this.getMessagesData(
          "error",
          "Error",
          "Please provide customer information"
        )
      );
    } else {
      let payload = {
        customerId: this.customerId(),
        customerName: this.customerName(),
        customerAddress: this.customerAddress(),
        customerEmail: this.customerEmail(),
        customerDescription: this.customerDescription(),
        customerPhone: this.customerPhone(),
        customerWebsite: this.customerWebsite(),
      };
      this.jetUtil
        .callPost(payload, "text", this.updateURL)
        .then((response) => {
          if (response === "Y") {
            this.messages(
              this.getMessagesData(
                "confirmation",
                "Success",
                "Customer correctly created"
              )
            );
            this.loadDataFromWS();
          } else {
            this.messages(
              this.getMessagesData(
                "error",
                "Error",
                "Error while creating user"
              )
            );
          }
        })
        .catch((error) => {
          console.log("Error");
        });
    }
    (document.getElementById("updateCustomerDialogId") as ojDialog).close();
    this.messagesDataprovider = new ArrayDataProvider(this.messages);
  };

  public cancelUpdate = (event: ojButtonEventMap["ojAction"]) => {
    (document.getElementById("updateCustomerDialogId") as ojDialog).close();
  };

  public openCustomerDelete = (event: ojButtonEventMap["ojAction"]) => {
    (document.getElementById("deleteCustomerDialogId") as ojDialog).open();
  };

  public okDelete = (event: ojButtonEventMap["ojAction"]) => {
    let payload = {
      customerId: this.customerId(),
    };
    this.jetUtil
      .callPost(payload, "text", this.deleteURL)
      .then((response) => {
        if (response === "Y") {
          this.messages(
            this.getMessagesData(
              "confirmation",
              "Success",
              "User correctly deleted"
            )
          );
          this.loadDataFromWS();
          /*this.jetUtil
            .loadData(this.getUrl)
            .then((response) => {
              this.customersArray(response.customersTableInputs);
            })
            .catch((error) => {
              console.log("Error while calling service");
            });*/
        } else {
          this.messages(
            this.getMessagesData("error", "Error", "Error while deleting user")
          );
        }
      })
      .catch((error) => {
        console.log("Error");
      });
    (document.getElementById("deleteCustomerDialogId") as ojDialog).close();

    this.messagesDataprovider = new ArrayDataProvider(this.messages);
  };

  public cancelDelete = (event: ojButtonEventMap["ojAction"]) => {
    (document.getElementById("deleteCustomerDialogId") as ojDialog).close();
  };

  public selectedChangedListener = (event) => {
    console.log(`One row was selected`);
    const row = event.detail.value.row as KeySetImpl<number>;
    if (row.values().size > 0) {
      row.values().forEach(function (key) {
        console.log("Selected key " + key);
        console.log(this.customersArray());
        let selectedRow = this.customersArray().find(
          (s) => s.customerId === key
        );
        console.log("Selected row description " + selectedRow.customerName);
        this.customerId(key);
        this.customerName(selectedRow.customerName);
        this.customerEmail(selectedRow.customerEmail);
        this.customerAddress(selectedRow.customerAddress);
        this.customerDescription(selectedRow.customerDescription);
        this.customerPhone(selectedRow.customerPhone);
        this.customerWebsite(selectedRow.customerWebsite);
      }, this);
    }
  };

  public getMessagesData = (
    messageType: string,
    summary: string,
    detail: string
  ): ojMessage.Message[] => {
    if (messageType === "error") {
      return [
        {
          severity: "error",
          summary: summary,
          detail: detail,
          autoTimeout: 4000,
        },
      ];
    } else if (messageType === "confirmation") {
      return [
        {
          severity: "confirmation",
          summary: summary,
          detail: detail,
          autoTimeout: 4000,
        },
      ];
    }
  };

  public loadDataFromWS = () =>{
    console.log(`Calling load data from ws method`);
    this.jetUtil
    .loadData(this.getUrl)
    .then((response) => {
      if(response){
        if(response.customersTableInputs && response.customersTableInputs.customerId){
          let responseArray = [];
          responseArray.push(response.customersTableInputs);
          this.customersArray (responseArray);
        }else{
          this.customersArray(response.customersTableInputs);
        } 
      }else{
        this.customersArray([]);
      }
    })
    .catch((error) => {
      console.log(`Error while calling service >> ${error}`);
    });
  }
}

export = CustomersViewModel;
