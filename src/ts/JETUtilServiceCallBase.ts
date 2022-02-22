import * as JQuery from "jquery";
export class JETUtilServiceCallBase {
  private restUrl: string;
  dataT :any ={};

  constructor() {
    this.restUrl =  "http://127.0.0.1:7101/Schedule/jersey/ScheduleServices/";
  }


  protected callGetService = (url : string): Promise<any> => {
    let finalUrl = this.restUrl + url;
    return new Promise<any>((resolve, reject) => {
      let xhrCall = JQuery.ajax({
        type: 'GET',
        dataType: "json",
        url: finalUrl,
        cache: false
      })
      .done(data => {
        resolve(data);

      }).fail( (jqXHR: any, textStatus: string, error: string) => {
        if( textStatus !== "abort" ) {
          console.error('Call error', error);
        }
        reject(error);
      });
    });
  };

  protected callGetServiceOneParam = (url : string, paramName : string, paramValue:string): Promise<any> => {
    let finalUrl = this.restUrl + url + '?' + paramName + '=' + paramValue;
    console.log(finalUrl);
    return new Promise<any>((resolve, reject) => {
      let xhrCall = JQuery.ajax({
        type: 'GET',
        dataType: "json",
        url: finalUrl,
        cache: false
      })
      .done(data => {
        resolve(data);

      }).fail( (jqXHR: any, textStatus: string, error: string) => {
        if( textStatus !== "abort" ) {
          console.error('Call error', error);
        }
        reject(error);
      });
    });
  };

  
  protected callPOSTService = (payload = {}, dataType: string, url: string): Promise<any> => {
    let finalPayload = JQuery.extend({}, {}, payload);
    let finalUrl = this.restUrl + url;
    return new Promise<any>((resolve, reject) => {
      console.log(finalPayload);
      let xhrCall = JQuery.ajax({
        type: 'POST',
        contentType: "application/json",
        url: finalUrl,
        data: JSON.stringify(finalPayload),
        dataType: dataType,
        cache: false,
      })
      .done((data) => {
        console.log("Resolving for post method") 
        resolve(data);
      }).fail((jqXHR: any, textStatus: string, error: string) => {
        if (textStatus !== "abort") {
          console.error('Call error', error);
        }
        reject(error);
      });
    });
  };

  public loadData(url : string) : Promise<any> {
      return this.callGetService(url);
  }

  
  public loadDataOneParam(url : string, paramName : string, paramValue : string) : Promise<any> {
    return this.callGetServiceOneParam(url, paramName, paramValue);
}



  public callPost(payload = {}, dataType: string, url : string) : Promise<any> {
    return this.callPOSTService(payload, dataType, url);
  }



} 