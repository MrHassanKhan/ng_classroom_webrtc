import { ElementRef } from '@angular/core';

export interface ClassRoom {
    extra: Extra;
    isPasswordProtected: boolean;
    isRoomFull: boolean;
    maxParticipantsAllowed: number;
    owner: string;
    participants: Array<string>;
    session: {audio: boolean, video: boolean, data: boolean };
    sessionid: string;
}

export interface Extra {
    isPasswordProtected: boolean;
    roomOwner: boolean;
    broadcastId: string;
    userFullName: string;
    _room: { isFull: boolean };
}
export interface IStreamEvent {
    extra: Extra;
    isAudioMuted: boolean;
    mediaElement: any;
    stream: MediaStream;
    streamid: string;
    type: string;
    userid: string;
}
export class ClassRoomParams {
    open: boolean|string;
    userFullName: string;
    publicRoomIdentifier: string;
    sessionid: string;
    password: string;
}

export interface CanvasElement extends ElementRef {
    // isScreen: boolean;
    // streamid: string;
    // type: string;
    captureStream(): void;
}

interface IMyNavigator extends MediaDevices {
    getDisplayMedia(constraints: MediaStreamConstraints): Promise<MediaStream>;
}

