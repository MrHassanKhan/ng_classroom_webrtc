import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
// import { RtcConnectionService } from '../RtcConnection.service';
import { ActivatedRoute } from '@angular/router';
import { CanvasDesigner } from './canvas-designer-widget.js';
import { ClassRoomParams, CanvasElement, IStreamEvent } from '../models/classroom';
import * as RTCMultiConnection from 'rtcmulticonnection';

@Component({
  selector: 'app-classroom',
  templateUrl: './classroom.component.html',
  styleUrls: ['./classroom.component.scss']
})
export class ClassroomComponent implements OnInit {

  connection = new RTCMultiConnection();
  designer = new CanvasDesigner();
  TempStream: any = null;
  activeUserList: string[] = [];
  mainmuteVoice = false;
  params: ClassRoomParams = new ClassRoomParams() ;
  globaltempStreamCanvas: any = null;

  @ViewChild('screenViewer') screenViewer: ElementRef;
  @ViewChild('widgetContainer') widgetContainer: ElementRef;
  @ViewChild('mainVideo') mainDivVideo: ElementRef;
  @ViewChild('otherVideos') otherVideos: ElementRef;
  @ViewChild('conversationPanel') conversationPanel: ElementRef;
  @ViewChild('keyPress') keyPress: HTMLElement;
  @ViewChild('tempStreamCanvas') tempStreamCanvas: CanvasElement;
  @ViewChild('txtChatMessage') txtChatMessage: ElementRef;
//   @ViewChild('btnChatMessage') btnChatMessage: ElementRef;
//   @ViewChild('btnAttachFile') btnAttachFile: ElementRef;
//   @ViewChild('btnShareScreen') btnShareScreen: ElementRef;
  constructor(private router: ActivatedRoute, private cdtr: ChangeDetectorRef ) {}

  ngOnInit() {
    this.connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';
    this.router.queryParams.subscribe(params => {
      this.params.open = params.open;
      this.params.publicRoomIdentifier = params.publicRoomIdentifier;
      this.params.sessionid = params.sessionid;
      this.params.userFullName = params.userFullName;
      if (params.password) {
        this.params.password = params.password;
      }
      // open: "false"
      // publicRoomIdentifier: "dashboard"
      // sessionid: "X2lFd92HHZ"
      // userFullName: "Muhammad Hassan"
        this.connection.extra.userFullName = this.params.userFullName;
          /// make this room public
          this.connection.publicRoomIdentifier = this.params.publicRoomIdentifier;
          this.connection.socketMessageEvent = this.params.sessionid;
          // keep room opened even if owner leaves
          this.connection.autoCloseEntireSession = true;
          // https://www.rtcmulticonnection.org/docs/maxParticipantsAllowed/
          this.connection.maxParticipantsAllowed = 10;
          // set value 2 for one-to-one connection
          // connection.maxParticipantsAllowed = 2;

          this.designer.addSyncListener((data) => {
            this.connection.send(data);
        });
        // here goes canvas designer
          // const designer = new CanvasDesigner();
          // you can place widget.html anywhere
          this.designer.widgetHtmlURL = 'https://cdn.webrtc-experiment.com/Canvas-Designer/widget.html';
        //   this.designer.widgetHtmlURL = widgethtml;
          // tslint:disable-next-line:max-line-length
        //   this.designer.widgetJsURL = widgetjs;
          this.designer.widgetJsURL = 'https://cdn.webrtc-experiment.com/Canvas-Designer/widget.min.js';
          this.designer.setSelected('pencil');
          this.designer.setTools({
              pencil: true,
              text: true,
              image: true,
              pdf: true,
              eraser: true,
              line: true,
              arrow: true,
              dragSingle: true,
              dragMultiple: true,
              arc: true,
              rectangle: true,
              quadratic: false,
              bezier: true,
              marker: true,
              zoom: false,
              lineWidth: false,
              colorsPicker: false,
              extraOptions: false,
              code: false,
              undo: true
          });
          // here goes RTCMultiConnection
          this.connection.chunkSize = 16000;
          this.connection.enableFileSharing = true;
          this.connection.socketOptions['max reconnection attempts'] = 100;
          this.connection.session = {
              audio: true,
              video: true,
              data: true
          };
          // tslint:disable-next-line:no-bitwise
          if (this.params.open === true) {
              this.connection.userid = 'user@demo.gmail.com';
          } else {
              this.connection.userid = this.params.userFullName;
          }
          this.connection.sdpConstraints.mandatory = {
              OfferToReceiveAudio: true,
              OfferToReceiveVideo: true
          };
          // When User Status Change
          this.connection.onUserStatusChanged = (event) => {
              let names: string[] = [];
              this.connection.getAllParticipants().forEach((pid) => {
                  names.push(this.getFullName(pid));
              });
              if (!names.length) {
                  names = ['Only You'];
              } else {
                  names = [this.connection.extra.userFullName || 'You'].concat(names);
              }
              this.activeUserList = names;
              // this.UserStatusChanged.nativeElement.appendChild('<b>Active users:</b> ' + names.join(', '));
          };
          this.connection.onerror = (e) => {
              alert(e);
          };
          this.connection.onopen = (event) => {
              this.connection.onUserStatusChanged(event);
              if (this.designer.pointsLength <= 0) {
                  // make sure that remote user gets all drawings synced.
                  setTimeout(() => {
                      this.connection.send('plz-sync-points');
                  }, 1000);
              }
            //   this.btnChatMessage.nativeElement.disabled = false;
            //   this.btnAttachFile.nativeElement.style.display = 'inline-block';
            //   this.btnShareScreen.nativeElement.style.display = 'inline-block';
              // document.getElementById('btn-chat-message').disabled = false;
              // document.getElementById('btn-attach-file').style.display = 'inline-block';
              // document.getElementById('btn-share-screen').style.display = 'inline-block';
          };
          this.connection.onclose = this.connection.onerror = this.connection.onleave = (event) => {
              this.connection.onUserStatusChanged(event);
          };
          this.connection.onmessage = (event) => {

              if (event.data.showMainVideo) {
                this.mainDivVideo.nativeElement.style.display = 'block';
                this.screenViewer.nativeElement.style.top = '20%';
                this.screenViewer.nativeElement.style.left = '65%';
                this.screenViewer.nativeElement.style.width = '400px';
                this.screenViewer.nativeElement.style.height = '35%';
                this.screenViewer.nativeElement.style.display = 'block';
                  // $('#main-video').show();
                  // $('#screen-viewer').css({
                  //     top: $('#widget-container').offset().top,
                  //     left: $('#widget-container').offset().left,
                  //     width: $('#widget-container').width(),
                  //     height: $('#widget-container').height()
                  // });
                  // $('#screen-viewer').show();
                  return;
              }
              if (event.data.hideMainVideo) {
                // this.mainVideo.nativeElement.style.display = 'none';
                this.screenViewer.nativeElement.style.display = 'none';
                  // $('#main-video').hide();
                  // $('#screen-viewer').hide();
                  return;
              }
              if (event.data.typing === true) {
                  this.keyPress.style.display = 'block';
                  this.keyPress.firstElementChild.innerHTML = event.extra.userFullName + ' is typing';
                  // $('#key-press').show().find('span').html(event.extra.userFullName + ' is typing');
                  return;
              }
              if (event.data.typing === false) {
                  this.keyPress.style.display = 'none';
                  this.keyPress.firstElementChild.innerHTML = '';
                  // $('#key-press').hide().find('span').html('');
                  return;
              }
              if (event.data.chatMessage) {
                  this.appendChatMessage(event);
                  return;
              }
              if (event.data.checkmark === 'received') {
                  const checkmarkElement = document.getElementById(event.data.checkmark_id);
                  if (checkmarkElement) {
                      checkmarkElement.style.display = 'inline';
                  }
                  return;
              }
              if (event.data === 'plz-sync-points') {
                  this.designer.sync();
                  return;
              }
              if (event.data.mainVideoStreamVoice === true) {
                this.mainDivVideo.nativeElement.captureStream().getAudioTracks()[0].enabled = true;
              }
              if (event.data.mainVideoStreamVoice === false) {
                this.mainDivVideo.nativeElement.captureStream().getAudioTracks()[0].enabled = false;
              }
              this.designer.syncData(event.data);
          };
          // extra code
          this.connection.onstream = (event) => {
              if (event.stream.isScreen && !event.stream.canvasStream) {
                  this.screenViewer.nativeElement.srcObject = event.stream;
                  this.screenViewer.nativeElement.style.display = 'none';
                  // $('#screen-viewer').get(0).srcObject = event.stream;
                  // $('#screen-viewer').hide();
              } else if (event.extra.roomOwner === true) {
                //   this.localUserVideo = {
                //       isAudio: true,
                //       streamId: event.streamid,
                //       src: event.stream,
                //       isVideo: true,
                //       userId: event.userid
                //   };
                  this.mainDivVideo.nativeElement.setAttribute('data-streamid', event.streamid);
                  this.mainDivVideo.nativeElement.setAttribute('id', event.userid);
                  this.mainDivVideo.nativeElement.style.display = 'none';
                  // var video = document.getElementById('main-video');
                  // video.setAttribute('data-streamid', event.streamid);
                  // // video.style.display = 'none';
                  if (event.type === 'local') {
                    //   this.mainDivVideo.nativeElement.muted = true;
                    //   this.mainDivVideo.nativeElement.volume = 0;
                  }
                  this.mainDivVideo.nativeElement.srcObject = event.stream;
                  this.mainDivVideo.nativeElement.style.height = '30%';
                  this.mainDivVideo.nativeElement.style.display = 'block';
                //   let capturestream = this.mainDivVideo.nativeElement.captureStream().getAudioTracks();
                //   debugger;
                  // $('#main-video').show();
              } else {
                // if (event.mediaElement) {
                //     event.mediaElement.muted = true;
                //     delete event.mediaElement;
                // }
                // const videoTag = document.createElement('video');
                // videoTag.srcObject = event.stream;
                // videoTag.controls = false;
                //   event.mediaElement.style.width = '40%';
                  // tslint:disable-next-line:max-line-length
                event.mediaElement.style.cssText = 'width:40% ; -moz-transform: scale(-1, 1); -webkit-transform: scale(-1, 1); -o-transform: scale(-1, 1); transform: scale(-1, 1); filter: FlipH;';
                event.mediaElement.setAttribute('id', event.userid);
                // videoTag.setAttribute('data-streamid', event.streamid);
                const createsection = document.createElement('section');
                const createicon = document.createElement('div');
                // tslint:disable-next-line:max-line-length
                const mdbicon = '<span (click)="muteOrUnmuteMainDivVoice()">' +
                                    '<mdb-icon fas icon="microphone"></mdb-icon>' +
                                '</span>' +
                                '<span (click)="muteOrUnmuteMainDivVoice()">' +
                                    '<mdb-icon fas icon="microphone-slash"></mdb-icon>' +
                                '</span>';
                createicon.innerHTML = mdbicon;
                createsection.appendChild(event.mediaElement);
                createsection.appendChild(createicon);
                this.otherVideos.nativeElement.appendChild(createsection);
            //   const otherVideos = document.querySelector('#other-videos');
            //   otherVideos.appendChild(event.mediaElement);
              }
              this.connection.onUserStatusChanged(event);
              this.cdtr.detectChanges();
          };
          this.connection.onstreamended = (event: IStreamEvent) => {
              let video = document.querySelector('video[data-streamid="' + event.streamid + '"]');
              if (!video) {
                  video = document.getElementById(event.streamid);
                  if (video) {
                      video.parentNode.removeChild(video);
                      return;
                  }
              } else if (video) {
                  // video.srcObject = null;
                  // video.style.display = 'none';
              }
          };
          this.connection.onmute = (e) => {
            if (!e.mediaElement) {
                return;
            }
            if (e.muteType === 'both' || e.muteType === 'video') {
                e.mediaElement.srcObject = null;
                e.mediaElement.pause();
                e.mediaElement.poster = e.snapshot || 'https://cdn.webrtc-experiment.com/images/muted.png';
            } else if (e.muteType === 'voice') {
                e.mediaElement.muted = true;
                const trgtdiv: any = document.getElementById(e.userid);
                trgtdiv.muted = true;
            }
        };
        this.connection.onunmute = (e) => {
            if (!e.mediaElement) {
                return;
            }
            if (e.unmuteType === 'both' || e.unmuteType === 'video') {
                e.mediaElement.poster = null;
                e.mediaElement.srcObject = e.stream;
                e.mediaElement.play();
            } else if (e.unmuteType === 'voice') {
                e.mediaElement.muted = false;
                const trgtdiv: any = document.getElementById(e.userid);
                trgtdiv.muted = false;
            }
        };

        //   let recentFile;
        // this.connection.onFileEnd = (file) => {
        //     const html = this.getFileHTML(file);
        //     const div = progressHelper[file.uuid].div;
        //     if (file.userid === this.connection.userid) {
        //         div.innerHTML = '<b>You:</b><br>' + html;
        //         div.style.background = '#cbffcb';
        //         if (recentFile) {
        //             recentFile.userIndex++;
        //             const nextUserId = this.connection.getAllParticipants()[recentFile.userIndex];
        //             if (nextUserId) {
        //                 this.connection.send(recentFile, nextUserId);
        //             } else {
        //                 recentFile = null;
        //             }
        //         } else {
        //             recentFile = null;
        //         }
        //     } else {
        //         div.innerHTML = '<b>' + this.getFullName(file.userid) + ':</b><br>' + html;
        //     }
        // };
        // // to make sure file-saver dialog is not invoked.
        // this.connection.autoSaveToDisk = false;
        // const progressHelper = {};
        // this.connection.onFileProgress = (chunk, uuid) => {
        //     const helper = progressHelper[chunk.uuid];
        //     helper.progress.value = chunk.currentPosition || chunk.maxChunks || helper.progress.max;
        //     this.updateLabel(helper.progress, helper.label);
        // };
        // this.connection.onFileStart = (file) => {
        //     const div = document.createElement('div');
        //     div.className = 'message';
        //     if (file.userid === this.connection.userid) {
        //         let userFullName = file.remoteUserId;
        //         if (this.connection.peersBackup[file.remoteUserId]) {
        //             userFullName = this.connection.peersBackup[file.remoteUserId].extra.userFullName;
        //         }
        //         div.innerHTML = '<b>You (to: ' + userFullName + '):</b><br><label>0%</label> <progress></progress>';
        //         div.style.background = '#cbffcb';
        //     } else {
        //         div.innerHTML = '<b>' + this.getFullName(file.userid) + ':</b><br><label>0%</label> <progress></progress>';
        //     }
        //     div.title = file.name;
        //     this.conversationPanel.nativeElement.appendChild(div);
        //     progressHelper[file.uuid] = {
        //         div: div,
        //         progress: div.querySelector('progress'),
        //         label: div.querySelector('label')
        //     };
        //     progressHelper[file.uuid].progress.max = file.maxChunks;
        //     this.conversationPanel.nativeElement.scrollTop = this.conversationPanel.nativeElement.clientHeight;
        //     this.conversationPanel.nativeElement.scrollTop = this.conversationPanel.nativeElement.scrollHeight
        //      - this.conversationPanel.nativeElement.scrollTop;
        // };
        if (!!this.params.password) {
          this.connection.password = this.params.password;
        }
        this.designer.appendTo(this.widgetContainer.nativeElement, () => {
          if (this.params.open === true || this.params.open === 'true') {
                    const tempStreamCanvas = this.tempStreamCanvas.nativeElement;
                    const tempStream = <any> tempStreamCanvas.captureStream();
                    tempStream.isScreen = true;
                    tempStream.streamid = tempStream.id;
                    tempStream.type = 'local';
                    this.connection.attachStreams.push(tempStream);
                    this.TempStream = tempStream;
                  this.connection.extra.roomOwner = true;
                  this.connection.open(this.params.sessionid, (isRoomOpened, roomid, error) => {
                      if (error) {
                          if (error === this.connection.errors.ROOM_NOT_AVAILABLE) {
                              alert('Someone already created this room. Please either join or create a separate room.');
                              return;
                          }
                          alert(error);
                      }
                      this.connection.socket.on('disconnect', () => {
                        //   location.reload();
                        console.log('Socket Disconnected');
                        this.connection.connectSocket(() => {
                            console.log('Socket Reconnected');
                        });
                      });
                  });
          } else {
              this.connection.join(this.params.sessionid, (isRoomJoined, roomid, error) => {
                  if (error) {
                      if (error === this.connection.errors.ROOM_NOT_AVAILABLE) {
                          alert('This room does not exist. Please either create it or wait for moderator to enter in the room.');
                          return;
                      }
                      if (error === this.connection.errors.ROOM_FULL) {
                          alert('Room is full.');
                          return;
                      }
                      if (error === this.connection.errors.INVALID_PASSWORD) {
                          this.connection.password = prompt('Please enter room password.') || '';
                          if (!this.connection.password.length) {
                              alert('Invalid password.');
                              return;
                          }
                          // tslint:disable-next-line:no-shadowed-variable
                          this.connection.join(this.params.sessionid, (isRoomJoined, roomid, error) => {
                              if (error) {
                                  alert(error);
                              }
                          });
                          return;
                      }
                      alert(error);
                  }
                  this.connection.socket.on('disconnect', () => {
                    //   location.reload();
                    console.log('Socket Disconnected');
                    this.connection.connectSocket(() => {
                        console.log('Socket Reconnected');
                    });
                    // alert('Socket Disconnected Please Refresh the Page');

                  });
              });
          }
        });
    });
  }

  ShareScreenMethod() {
        if (!this.TempStream) {
            alert('Sharing is not Enable');
            return;
        }
        (navigator.mediaDevices as any).getDisplayMedia({video: true, audio: false}).then(stream => {
            this.replaceScreenTrack(stream);
        }).catch(err => {

        });

    //   if (!this.TempStream) {
    //     alert('Screen sharing is not enabled.');
    //     return;
    // }
    // this.connection.getScreenConstraints = (callback) => {
    //     if (DetectRTC.browser.name === 'Edge') {
    //         callback('Edge requires navigator.getDisplayMedia.');
    //         return;
    //     }
    //     getScreenConstraints((error, screen_constraints) => {
    //         if (!error) {
    //             screen_constraints = this.connection.modifyScreenConstraints(screen_constraints);
    //             callback(error, screen_constraints);
    //             return;
    //         }
    //         throw error;
    //     });
    // };
    // this.replaceScreenTrack();
    // this.getScreenId( (error, sourceId, screen_constraints) => {
    //     if (navigator.userAgent.indexOf('Edge') !== -1 && (!!navigator.msSaveOrOpenBlob || !!navigator.msSaveBlob)) {
    //         navigator.getDisplayMedia(screen_constraints).then(stream => {
    //             this.replaceScreenTrack(stream);
    //         // tslint:disable-next-line:no-shadowed-variable
    //         }, error => {
    //             alert('Please make sure to use Edge 17 or higher.');
    //         });
    //         return;
    //     }
    //     if (error === 'not-installed') {
    //       alert('Please install Chrome extension.');
    //       return;
    //     }
    //     navigator.mediaDevices.getUserMedia(screen_constraints).then(function (stream) {
    //         this.replaceScreenTrack(stream);
    //     // tslint:disable-next-line:no-shadowed-variable
    //     }).catch( (error) => {
    //       alert('Failed to capture your screen. Please check Chrome console logs for further information.');
    //     });
    // });

  }
  updateLabel(progress, label) {
    if (progress.position === -1)  { return; }
    const position = +progress.position.toFixed(2).split('.')[1] || 100;
    label.innerHTML = position + '%';
  }
  getFileHTML(file) {
    const url = file.url || URL.createObjectURL(file);
    let attachment = '<a href="' + url + '" target="_blank" download="' + file.name + '">Download: <b>' + file.name + '</b></a>';
    if (file.name.match(/\.jpg|\.png|\.jpeg|\.gif/gi)) {
        attachment += '<br><img crossOrigin="anonymous" src="' + url + '">';
    } else if (file.name.match(/\.wav|\.mp3/gi)) {
        attachment += '<br><audio src="' + url + '" controls></audio>';
    } else if (file.name.match(/\.pdf|\.js|\.txt|\.sh/gi)) {
        attachment += '<iframe class="inline-iframe" src="' + url + '"></iframe></a>';
    }
    return attachment;
  }
  getFullName(userid) {
    let _userFullName = userid;
    if (this.connection.peers[userid] && this.connection.peers[userid].extra.userFullName) {
        _userFullName = this.connection.peers[userid].extra.userFullName;
    }
    return _userFullName;
  }
  appendChatMessage(event, checkmark_id?) {
    const div = document.createElement('div');
    div.className = 'message';
    if (event.data) {
        div.innerHTML = '<b>' + (event.extra.userFullName || event.userid) + ':</b><br>' + event.data.chatMessage;
        if (event.data.checkmark_id) {
            this.connection.send({
                checkmark: 'received',
                checkmark_id: event.data.checkmark_id
            });
        }
    } else {
        div.innerHTML = '<b>You:</b> <mdb-icon fas icon="check"></mdb-icon><br>' + event;
        div.style.background = '#cbffcb';
    }
    this.conversationPanel.nativeElement.appendChild(div);
    this.conversationPanel.nativeElement.scrollTop = this.conversationPanel.nativeElement.clientHeight;
    this.conversationPanel.nativeElement.scrollTop =
    this.conversationPanel.nativeElement.scrollHeight - this.conversationPanel.nativeElement.scrollTop;
  }

  addStreamStopListener(stream, callback) {
    stream.addEventListener('ended', () => {
        callback();
        callback = () => {};
    }, false);
    stream.addEventListener('inactive', () => {
        callback();
        callback = () => {};
    }, false);
    stream.getTracks().forEach((track) => {
        track.addEventListener('ended', () => {
            callback();
            callback = () => {};
        }, false);
        track.addEventListener('inactive', () => {
            callback();
            callback = () => {};
        }, false);
    });
  }
  replaceTrack(videoTrack, screenTrackId?) {
    if (!videoTrack) { return; }
    if (videoTrack.readyState === 'ended') {
        alert('Can not replace an "ended" track. track.readyState: ' + videoTrack.readyState);
        return;
    }
    this.connection.getAllParticipants().forEach((pid) => {
        const peer = this.connection.peers[pid].peer;
        if (!peer.getSenders) { return; }
        let trackToReplace = videoTrack;
        peer.getSenders().forEach((sender) => {
            if (!sender || !sender.track)  { return; }
            if (screenTrackId) {
                if (trackToReplace && sender.track.id === screenTrackId) {
                    sender.replaceTrack(trackToReplace);
                    trackToReplace = null;
                }
                return;
            }
            if (sender.track.id !== this.TempStream.getTracks()[0].id) { return; }
            if (sender.track.kind === 'video' && trackToReplace) {
                sender.replaceTrack(trackToReplace);
                trackToReplace = null;
            }
        });
    });
  }
  replaceScreenTrack(stream) {
    stream.isScreen = true;
    stream.streamid = stream.id;
    stream.type = 'local';
    // connection.attachStreams.push(stream);
    this.connection.onstream({
        stream: stream,
        type: 'local',
        streamid: stream.id,
        // mediaElement: video
    });
    const screenTrackId = stream.getTracks()[0].id;
    this.addStreamStopListener(stream, () => {
        this.connection.send({
            hideMainVideo: true
        });
        this.mainDivVideo.nativeElement.style.display = 'none';
        this.screenViewer.nativeElement.style.display = 'none';
        // this.btnShareScreen.nativeElement.style.display = 'block';
        // $('#main-video').hide();
        // $('#screen-viewer').hide();
        // $('#btn-share-screen').show();
        this.replaceTrack(this.TempStream.getTracks()[0], screenTrackId);
    });
    stream.getTracks().forEach((track) => {
        if (track.kind === 'video' && track.readyState === 'live') {
            this.replaceTrack(track);
        }
    });
    this.connection.send({
        showMainVideo: true
    });
    this.mainDivVideo.nativeElement.style.display = 'block';
    // display: block;
    // left: 65%;
    // /* right: -4%; */
    // height: 35%;
    // width: 400px;
    this.screenViewer.nativeElement.style.top = this.widgetContainer.nativeElement.style.top;
    this.screenViewer.nativeElement.style.left = '65%';
    this.screenViewer.nativeElement.style.width = '400px';
    this.screenViewer.nativeElement.style.height = '35%';
    this.screenViewer.nativeElement.style.display = 'block';
    // $('#main-video').show();
    // $('#screen-viewer').css({
    //         top: $('#widget-container').offset().top,
    //         left: $('#widget-container').offset().left,
    //         width: $('#widget-container').width(),
    //         height: $('#widget-container').height()
    //     });
    // $('#screen-viewer').show();
  }


  txtChatMessageKeyUP() {
      const chattext = this.txtChatMessage.nativeElement.value;
      if (chattext.length % 3 === 0) {
          this.connection.send(JSON.stringify({typing: true}));
          setTimeout(() => {
            this.connection.send(JSON.stringify({typing: false}));
        }, 1200);
      }
  }

  SendMessage() {
    const chattext = this.txtChatMessage.nativeElement.value;
    if (chattext.length < 1 ) {
        return ;
    }
    const checkmark_id = this.connection.userid + this.connection.token();
    this.appendChatMessage(chattext, checkmark_id);
    this.connection.send({
        chatMessage: chattext,
        checkmark_id: checkmark_id
    }, );
    this.connection.send({
        typing: false
    });
    this.txtChatMessage.nativeElement.value = '';
  }

  muteOrUnmuteMainDivVoice() {
    this.mainmuteVoice = !this.mainmuteVoice;
    const mainuserid = this.connection.streamEvents.selectFirst({ userid: this.connection.userid }).stream;
    if (this.mainmuteVoice) {
        mainuserid.mute('voice');
    } else {
        mainuserid.unmute('voice');
    }
    // this.mainDivVideo.nativeElement.captureStream().getAudioTracks()[0].enabled = this.mainDivVoice;
    // this.connection.send({
    //     mainVideoStreamVoice: this.mainDivVoice
    // });
  }
}
