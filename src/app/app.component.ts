import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as RTCMultiConnection from 'rtcmulticonnection';
// import * as getHTMLMediaElement from '../assets/js/getHTMLMediaElement.js';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
//   title = 'app';
//   predefinedRoomId = '';
//   connection = new RTCMultiConnection();

//   @ViewChild('local') localContainer: ElementRef;
//   @ViewChild('remote') remoteContainer: ElementRef;

//   ngOnInit() {
//       // this line is VERY_important
//     this.connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';

//     // all below lines are optional; however recommended.
//     this.connection.autoCloseEntireSession = true;
//     this.connection.session = {
//         audio: true,
//         video: true
//     };

//     this.connection.sdpConstraints.mandatory = {
//         OfferToReceiveAudio: true,
//         OfferToReceiveVideo: true
//     };
//     // this.connection.mediaConstraints = {
//     //   video: true,
//     //   audio: true
//     // };

//     // const localContainer = document.getElementById('local-container');
//     // const remoteContainer = document.getElementById('remote-container');

//     // this.connection.videosContainer = document.getElementById('videos-container');
//     this.connection.onstream = (event) => {
//         // event.mediaElement.removeAttribute('src');
//         // event.mediaElement.removeAttribute('srcObject');
//         // event.mediaElement.muted = true;
//         // event.mediaElement.volume = 0;
//         const video = event.mediaElement;
//         // var video = document.createElement('video');
//         try {
//             video.setAttributeNode(document.createAttribute('autoplay'));
//             video.setAttributeNode(document.createAttribute('playsinline'));
//         } catch (e) {
//             video.setAttribute('autoplay', 'true');
//             video.setAttribute('playsinline', 'true');
//         }
//         // if(event.type === 'local') {
//         //   video.volume = 0;
//         //   try {
//               video.setAttributeNode(document.createAttribute('muted'));
//               video.removeAttribute('controls', 'false');
//         //   } catch (e) {
//         //       video.setAttribute('muted', 'true');
//         //   }
//           this.connection.dontCaptureUserMedia = true;
//         // }
//         // video.srcObject = event.stream;
//         // var width = parseInt(this.connection.videosContainer.clientWidth / 3) - 20;
//         // debugger;
//         // var mediaElement = getHTMLMediaElement(video, {
//         //     buttons: ['full-screen'],
//         //     width: width,
//         //     showOnMouseEnter: false
//         // });
//         // this.connection.videosContainer.appendChild(mediaElement);
//         // setTimeout(function() {
//         //     mediaElement.media.play();
//         // }, 5000);
//         // mediaElement.id = event.streamid;
//         debugger;
//         if (event.type === 'local') {
//           this.localContainer.nativeElement.appendChild(video);
//         } else if (event.type === 'remote') {
//           this.remoteContainer.nativeElement.appendChild(video);
//         }
//     };

//     this.predefinedRoomId = this.connection.token();
//     // document.getElementById('btn-open-room').onclick = () => {
//     //     this.connection.open( this.predefinedRoomId || 'uniqueName' );
//     // };

//     // document.getElementById('btn-join-room').onclick = () => {
//     //     this.connection.join( this.predefinedRoomId || 'uniqueName' );
//     // };
//   }
//   openRoom() {
//     this.connection.open( this.predefinedRoomId || 'uniqueName' , (isRoomOpened, roomid, error) => {
//         if (isRoomOpened === false) {
//             alert('Room Not Created');
//         } else {
//             alert('Successfully Created');
//         }

//         if (error) {
//             alert(error);
//         }
//     });
//   }
//   joinRoom() {
//     this.connection.join( this.predefinedRoomId || 'uniqueName', (isJoined, roomid, error) => {
//         if (isJoined === false) {
//             alert('Room Not Available');
//         } else {
//             alert('Successfully Joined' + roomid);
//         }
//     });
//   }
}
