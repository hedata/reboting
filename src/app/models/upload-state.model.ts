export class UploadState {
    started: boolean;
    success: boolean;
    constructor(started?: boolean, success?: boolean) {
        this.started = started || false;
        this.success = success || false;
    }
}