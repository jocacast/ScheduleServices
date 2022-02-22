import * as AccUtils from "../accUtils";
import PagingDataProviderView = require("ojs/ojpagingdataproviderview");
import ArrayDataProvider = require("ojs/ojarraydataprovider");
import "ojs/ojknockout";
import "ojs/ojtable";
import "ojs/ojpagingcontrol";
import { JETUtilServiceCallBase } from "../JETUtilServiceCallBase";
import "ojs/ojbutton";
import { ojButtonEventMap } from "ojs/ojbutton";
import { ojDialog } from "ojs/ojdialog";
import "ojs/ojselectcombobox";
import "ojs/ojcheckboxset";
import "ojs/ojavatar";
import "ojs/ojmessages";
import { ojMessage } from "ojs/ojmessage";
import { KeySetImpl } from "ojs/ojkeyset";

import * as ko from "knockout";
class UsersViewModel {
  usersArray: ko.ObservableArray<string> = ko.observableArray();
  jetUtil: JETUtilServiceCallBase = new JETUtilServiceCallBase();
  getUrl: string = "getUsers";
  insertURL = "insertUser";
  deleteURL = "deleteUser";
  updateURL = "updateUser";

  username: ko.Observable<string> = ko.observable();
  userPassword: ko.Observable<string> = ko.observable();
  userDisplayName: ko.Observable<string> = ko.observable();
  userType: ko.Observable<string> = ko.observable("USER");
  userActive: ko.Observable<string> = ko.observable();

  usernameUpdate: ko.Observable<string> = ko.observable();
  userPassUpdate: ko.Observable<string> = ko.observable();
  userDisplayNameUpdate: ko.Observable<string> = ko.observable();
  userTypeUpdate: ko.Observable<string> = ko.observable("USER");
  userActiveUpdate: ko.Observable<string> = ko.observable();

  deletedUserName: ko.Observable<string> = ko.observable();

  messages: ko.ObservableArray<ojMessage.Message> = ko.observableArray();
  messagesDataprovider: ArrayDataProvider<null, ojMessage.Message> =
    new ArrayDataProvider(this.messages);

  /*Table selection*/
  readonly selectedSelectionMode = ko.observable({
    row: "single",
    column: "none",
  });

  constructor() {
    this.jetUtil
      .loadData(this.getUrl)
      .then((response) => {
        this.usersArray(response.userTableInputs);
      })
      .catch((error) => {
        console.log("Error while calling service");
      });
  }

  private readonly pagingDataProvider = new ArrayDataProvider(this.usersArray, {
    keyAttributes: "userName",
    implicitSort: [{ attribute: "userName", direction: "ascending" }],
  });

  public openAddNewUser = (event: ojButtonEventMap["ojAction"]) => {
    this.username("");
    this.userPassword("");
    this.userDisplayName("");
    this.userType("USER");

    (document.getElementById("createUserDialog") as ojDialog).open();
  };

  public saveUserCreate = (event: ojButtonEventMap["ojAction"]) => {
    if (
      this.username() == "" ||
      this.userPassword() == "" ||
      this.userDisplayName() == ""
    ) {
      this.messages(
        this.getMessagesData(
          "error",
          "Error",
          "Please provide servie name and service description"
        )
      );
    } else {
      if (this.userActive() != "Y") {
        this.userActive("N");
      }
      let payload = {
        userName: this.username(),
        userPassword: this.userPassword(),
        userDisplayName: this.userDisplayName(),
        userActive: this.userActive(),
        userType: this.userType(),
      };
      this.jetUtil
        .callPost(payload, "text", this.insertURL)
        .then((response) => {
          if (response === "Y") {
            this.messages(
              this.getMessagesData(
                "confirmation",
                "Success",
                "Service correctly created"
              )
            );
            this.jetUtil
              .loadData(this.getUrl)
              .then((response) => {
                this.usersArray(response.userTableInputs);
              })
              .catch((error) => {
                console.log("Error while calling service");
              });
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
      (document.getElementById("createUserDialog") as ojDialog).close();
    }
    this.messagesDataprovider = new ArrayDataProvider(this.messages);
    (document.getElementById("createUserDialog") as ojDialog).close();
  };

  public cancelUserCreate = (event: ojButtonEventMap["ojAction"]) => {
    (document.getElementById("createUserDialog") as ojDialog).close();
  };

  public openUpdate = (event: ojButtonEventMap["ojAction"]) => {
    if (this.userActive() != "Y") {
      this.userActive("N");
    }
    (document.getElementById("updateUserDialogId") as ojDialog).open();
  };

  public openDelete = (event: ojButtonEventMap["ojAction"]) => {
    (document.getElementById("deleteUserDialogId") as ojDialog).open();
  };

  public saveUpdate = (event: ojButtonEventMap["ojAction"]) => {
    if(this.userPassUpdate() == '' || this.userDisplayNameUpdate() == ''){
      this.messages(this.getMessagesData('error', "Error" , "Please provide service description"));
    }else{
      if (this.userActive() != "Y") {
        this.userActive("N");
      }
      let payload = {
        userName: this.usernameUpdate(),
        userPassword: this.userPassUpdate(),
        userDisplayName: this.userDisplayNameUpdate(),
        userActive: this.userActive(),
        userType: this.userTypeUpdate(),
      }
      this.jetUtil.callPost(payload, "text", this.updateURL).then((response) => {
        if(response === 'Y'){
          this.messages(this.getMessagesData('confirmation', "Success" , "User correctly updated"));
          this.jetUtil.loadData(this.getUrl)
          .then((response) => {
            this.usersArray(response.userTableInputs);
          })
          .catch((error) => {
            console.log("Error while calling service");
          })
        }else{
          this.messages(this.getMessagesData('error', "Error" , "Error while updating service"));
        }
      })
      .catch((error) => {
        console.log("Error");
      });
      (document.getElementById("updateUserDialogId") as ojDialog).close();
    }
    this.messagesDataprovider = new ArrayDataProvider(this.messages);
  };

  public cancelUpdate = (event: ojButtonEventMap["ojAction"]) => {
    (document.getElementById("updateUserDialogId") as ojDialog).close();
  };

  public okDelete = (event: ojButtonEventMap["ojAction"]) => {
    let payload = {
      userName : this.deletedUserName(),
    }
    this.jetUtil.callPost(payload, "text", this.deleteURL).then((response) => {
      if(response === 'Y'){
        this.messages(this.getMessagesData('confirmation', "Success" , "User correctly deleted"));
        this.jetUtil.loadData(this.getUrl)
        .then((response) => {
          this.usersArray(response.userTableInputs);
        })
        .catch((error) => {
          console.log("Error while calling service");
        })
      }else{
        this.messages(this.getMessagesData('error', "Error" , "Error while deleting user"));
      }
    })
    .catch((error) => {
      console.log("Error");
    });
    (document.getElementById("deleteUserDialogId") as ojDialog).close();
  
  this.messagesDataprovider = new ArrayDataProvider(this.messages);
  };

  public cancelDelete = (event: ojButtonEventMap["ojAction"]) => {
    (document.getElementById("deleteUserDialogId") as ojDialog).close();
    
  };

  public selectedChangedListener = (event) => {
    const row = event.detail.value.row as KeySetImpl<number>;
    if (row.values().size > 0) {
      row.values().forEach(function (key) {
        console.log("Selected key " + key);
        console.log(this.usersArray());
        let selectedRow = this.usersArray().find(
          (s) => s.userName === key
        );
        console.log(
          "Selected row description " + selectedRow.username 
        );
        this.usernameUpdate(key);
        this.deletedUserName(key);
        this.userDisplayNameUpdate(selectedRow.userDisplayName);
        this.userTypeUpdate(selectedRow.userType);
        this.userPassUpdate(selectedRow.userPassword);
        this.userActive(selectedRow.userActive);
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
}

export = UsersViewModel;
