import { Injectable } from '@angular/core';
import * as RTCMultiConnection from 'rtcmulticonnection';
@Injectable({
  providedIn: 'root'
})
export class RtcConnectionService {
  connection = new RTCMultiConnection();
  constructor() {
    this.connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';
    // this.connection.socketURL = 'https://webrtcweb.com:9002/';
  }

  getConnectionObject() {
    return this.connection;
  }

  getNewConnectionObject() {
    const newConnection = new RTCMultiConnection();
    newConnection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';
    return newConnection;
  }
}
