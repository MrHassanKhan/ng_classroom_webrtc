import { Component, OnInit } from '@angular/core';
import { RtcConnectionService } from '../RtcConnection.service';
import { ClassRoom } from '../models/classroom';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  connection: any;
  roomList = new Array<ClassRoom>();
  activeRooms = 0;
  crtNewRoomForm: FormGroup;
  joinRoomForm: FormGroup;
  constructor(private RtcService: RtcConnectionService, private fb: FormBuilder) { }

  ngOnInit() {
    this.crtNewRoomForm = this.fb.group({
      roomid: ['', Validators.compose([Validators.required, Validators.minLength(3)])],
      fullName: ['', Validators.compose([Validators.required, Validators.minLength(3)])],
      roomPassword: '',
      checkRoomPassword: false
    });

    this.crtNewRoomForm.get('checkRoomPassword').valueChanges.subscribe(value => {
      if (value === true) {
        this.crtNewRoomForm.get('roomPassword').setValidators([Validators.required, Validators.minLength(3)]);
      } else {
        this.crtNewRoomForm.get('roomPassword').setValidators([]);
      }
      this.crtNewRoomForm.get('roomPassword').updateValueAndValidity();
    });

    this.joinRoomForm = this.fb.group({
      roomid: ['', Validators.compose([Validators.required, Validators.minLength(3)])],
      fullName: ['', Validators.compose([Validators.required, Validators.minLength(3)])],
      roomPassword: '',
      checkRoomPassword: false
    });

    this.joinRoomForm.get('checkRoomPassword').valueChanges.subscribe(value => {
      if (value === true) {
        this.joinRoomForm.get('roomPassword').setValidators([Validators.required, Validators.minLength(3)]);
      } else {
        this.joinRoomForm.get('roomPassword').setValidators([]);
      }
      this.joinRoomForm.get('roomPassword').updateValueAndValidity();
    });

    this.connection = this.RtcService.getConnectionObject();
    /// make this room public
    this.connection.publicRoomIdentifier = 'dashboard';
    this.connection.socketMessageEvent = 'dashboard';
    // keep room opened even if owner leaves
    this.connection.autoCloseEntireSession = true;
    this.connectSocket();
  }

  connectSocket() {
    this.connection.connectSocket((socket) => {
      console.log('Socket is Connected');
      this.looper();
      this.connection.socket.on('disconnect', () => {
          // location.reload();
          console.log('Sockect is Disconnected');
          // this.connectSocket();
          // this.connection.socket.connect();
          // alert('Sockect is Disconnected , Please Reload Page');
      });
    });
  }

  looper() {
    this.connection.socket.emit('get-public-rooms', 'dashboard', (listOfRooms) => {
      this.updateListOfRooms(listOfRooms);
      setTimeout( () => { this.looper(); }, 3000);
    });
  }

  updateListOfRooms(rooms: Array<ClassRoom>) {
    this.activeRooms = rooms.length;
    if (!rooms.length) {
      this.roomList.length = 0;
    } else {
      this.roomList = rooms;
    }
  }

  CreateNewRoom(newRoomModel) {
    this.connection.extra.userFullName = this.crtNewRoomForm.get('fullName').value;
    if (this.crtNewRoomForm.get('checkRoomPassword').value === true) {
      this.connection.password = this.crtNewRoomForm.get('roomPassword').value;
    }
    this.connection.checkPresence(this.crtNewRoomForm.get('roomid').value, (isRoomExist) => {
        if (isRoomExist === true) {
            alert('This room-id is already taken and room is active. Please join instead.');
            return;
        }
        // if ($('#chk-hidden-room').prop('checked') === true) {
        //     // either make it unique!
        //     // connection.publicRoomIdentifier = connection.token() + connection.token();
        //     // or set an empty value (recommended)
        //     connection.publicRoomIdentifier = '';
        // }
        this.connection.sessionid = this.crtNewRoomForm.get('roomid').value;
        this.connection.isInitiator = true;
        newRoomModel.hide();
        this.openCanvasDesigner();
    });
  }

  JoinRoomInList(room: ClassRoom) {
    this.joinRoomForm.patchValue({
      roomid: room.sessionid,
      fullName: '',
      roomPassword: '',
      checkRoomPassword: room.isPasswordProtected
    });
  }

  JoinSelectedRoom(joinroomModel) {
    this.connection.extra.userFullName = this.joinRoomForm.get('fullName').value;
    if (this.joinRoomForm.get('checkRoomPassword').value === true) {
      this.connection.password = this.joinRoomForm.get('roomPassword').value;
      this.connection.socket.emit('is-valid-password', this.connection.password,
            this.joinRoomForm.get('roomid').value , (isValidPassword, roomid, error) => {
                if (isValidPassword === true) {
                  this.joinAHiddenRoom(roomid, joinroomModel);
                } else {
                  alert(error + ' Password Issue');
                }
      });
      return 0;
    }
    this.joinAHiddenRoom(this.joinRoomForm.get('roomid').value, joinroomModel);
  }

  joinAHiddenRoom(roomid, joinroomModel) {
    this.connection.checkPresence(roomid, (isRoomExist) => {
      if (isRoomExist === false) {
          alert('No such room exist on this server. Room-id: ' + roomid);
          return;
      }
      this.connection.sessionid = roomid;
      this.connection.isInitiator = false;
      joinroomModel.hide();
      this.openCanvasDesigner();
    });
  }

  openCanvasDesigner() {
    let href = 'classroom?open=' +
    this.connection.isInitiator + '&sessionid=' + this.connection.sessionid
     + '&publicRoomIdentifier=' + this.connection.publicRoomIdentifier + '&userFullName=' +
      this.connection.extra.userFullName;
    if (!!this.connection.password) {
      href += '&password=' + this.connection.password;
    }
    const newWin = window.open(href);
    if (!newWin || newWin.closed || typeof newWin.closed === 'undefined') {
        let html = '';
        html += '<p>Please click following link:</p>';
        html += '<p><a href="' + href + '" target="_blank">';
        if (this.connection.isInitiator) {
          html += 'Click To Open The Room';
        } else {
          html += 'Click To Join The Room';
        }
        html += '</a></p>';
        alert(html);
    }
  }
}
