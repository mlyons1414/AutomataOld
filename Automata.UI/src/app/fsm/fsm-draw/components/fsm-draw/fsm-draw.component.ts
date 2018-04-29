import { StateTypes, FsmState } from './../../../fsm-core/classes/fsm-state';
import { Fsm } from './../../../fsm-core/classes/fsm';
import { FsmTransition } from './../../../fsm-core/classes/fsm-transition';
import { FsmObject } from './../../../fsm-core/classes/fsm-object';
import { File, FileIoComponent } from './../../../../reusable/file-io/file-io/file-io.component';
import { AlertModalComponent, AlertModalResult } from './../../../../reusable/alert-modal/alert-modal/alert-modal.component';
import { SurfaceMouseEvent, FsmDrawSurfaceComponent } from './../fsm-draw-surface/fsm-draw-surface.component';
import { Component, Input, ViewChild, AfterViewInit, ChangeDetectorRef, ElementRef } from '@angular/core';
import { FsmDataService } from '../../../fsm-core/services/fsm-data.service';
import { FsmDrawPropsComponent } from '../fsm-draw-props/fsm-draw-props.component';
import { Modes, FsmDrawControlbarComponent } from './../fsm-draw-controlbar/fsm-draw-controlbar.component';

@Component({
  selector: 'app-fsm-draw',
  templateUrl: './fsm-draw.component.html',
  styleUrls: ['./fsm-draw.component.css']
})
export class FsmDrawComponent implements AfterViewInit {
  // variables
  selected: FsmObject = null;
  scrollsize = 2000;
  stateContextOpen = null;
  transContextOpen = null;
  transitionSelectedState: FsmState = null;
  mouseX: number;
  mouseY: number;
  mouseHover: FsmObject;
  workingFsm: Fsm;
  userFsm: Fsm;

  // peivate variables
  private _zoomPercent = 100.0;
  private mode: Modes = Modes.POINTER;
  private dataBlob: Blob;

  // input variables
  @Input() readonly = false;

  // dom components
  @ViewChild(FsmDrawSurfaceComponent) surface: FsmDrawSurfaceComponent;
  @ViewChild(FsmDrawPropsComponent) props: FsmDrawPropsComponent;
  @ViewChild(FsmDrawControlbarComponent) ctrlBar: FsmDrawControlbarComponent;
  @ViewChild(AlertModalComponent) popup: AlertModalComponent;
  @ViewChild(FileIoComponent) fileIO: FileIoComponent;

  // properties
  get isDirty() { return this.userFsm.dirty; }
  get isValid() { return this.userFsm.valid; }
  get isDeterministic() { return this.userFsm.deterministic; }
    get status() {
    if (this.userFsm.empty) { return 'Empty FSM'; }
    if (!this.userFsm.valid) { return 'Invalid FSM'; }
    if (this.userFsm.deterministic) { return 'Deterministic FSM'; }
    return 'Non-Deterministic FSM';
  }

  get zoomPercent() { return this._zoomPercent; }
  set zoomPercent(val) {
    if (val >= 50 && val <= 200) {
      this.scrollsize = 2000 * val / 100.0;
      this._zoomPercent = val;

    }
  }
  get startTransition(): FsmTransition {
    let dest: FsmState = new FsmState({
      x: this.mouseX, y: this.mouseY, stateIndex: 99, name: 'temp', stateType: StateTypes.NORMAL
    });
    if (this.mouseHover && this.mouseHover.type === 'state' && this.mouseHover === this.transitionSelectedState) {
      dest = this.transitionSelectedState;
    }
    return new FsmTransition({
      sourceState: this.transitionSelectedState,
      destState: dest,
      charactersAccepted: '',
      rotation: 0,
      characterMap: []
    });
  }

  constructor(private fsmSvc: FsmDataService, private _detect: ChangeDetectorRef) {
    this.userFsm = this.fsmSvc.userFsm;
    this.workingFsm = this.fsmSvc.userFsm;
  }

  ngAfterViewInit() {
    this._detect.detectChanges();
  }
  // Local surface event handlers
  onSurfaceClick = (evt: SurfaceMouseEvent) => {
    this.closeAllContextMenus();
    if (this.readonly) { return false; }
    if (this.mode === Modes.STATE && evt.type === 'surface') {
      this.ctrlBar.setMode(Modes.POINTER);
      this.selectObject(this.fsmSvc.addDefaultState(evt.surfaceX, evt.surfaceY));
    } else {
      if (this.mode === Modes.TRANSITION && evt.type === 'state' && !this.transitionSelectedState) {
        // start a transition
        this.transitionSelectedState = evt.child as FsmState;
      } else {
        if (this.mode === Modes.TRANSITION && evt.type === 'state' && this.transitionSelectedState) {
          // end transition
          this.selectObject(this.userFsm.addTransition(this.transitionSelectedState, evt.child as FsmState));
          this.ctrlBar.setMode(Modes.POINTER);
          this.transitionSelectedState = null;
        } else { if (this.mode === 'transition' && evt.type !== 'state') { this.transitionSelectedState = null; } }
      }
    }
  }

  onSurfaceContextMenu = (evt: SurfaceMouseEvent) => {
    // popup an appropriate context menu
    if (evt.type === 'state' && this.mode === Modes.POINTER) {
      this.stateContextOpen = { x: evt.surfaceX, y: evt.surfaceY, obj: evt.child };
    }
    if (evt.type === 'transition' && this.mode === Modes.POINTER) {
      this.transContextOpen = { x: evt.surfaceX, y: evt.surfaceY, obj: evt.child };
    }
  }

  onSurfaceMouseMove = (evt: SurfaceMouseEvent) => {
    this.mouseX = evt.surfaceX;
    this.mouseY = evt.surfaceY;
    this.mouseHover = evt.child;
    if (this.readonly || evt.srcEvent.which !== 1) { return false; }
    if (this.mode === Modes.POINTER &&
      evt.srcEvent.buttons === 1 &&
      this.selected &&
      this.selected.type === 'state') {
      (this.selected as FsmState).updatePosition(evt.surfaceX, evt.surfaceY);
    }
    if (this.mode === Modes.POINTER &&
      evt.srcEvent.buttons === 1 &&
      this.selected &&
      this.selected.type === 'transition') {
      const s = this.selected as FsmTransition;
      if (s.sourceState === s.destState) {
        const deltaX = s.sourceState.x - this.mouseX;
        const deltaY = s.sourceState.y - this.mouseY;
        const theta = Math.atan2(deltaY, deltaX);
        const thetad = theta * (180.0 / Math.PI);
        s.setRotation(thetad + 180);
      } else {
        const d = ((s.destState.y - s.sourceState.y) * this.mouseX - (s.destState.x - s.sourceState.x) * this.mouseY +
          s.destState.x * s.sourceState.y - s.destState.y * s.sourceState.x) / Math.sqrt(Math.pow(s.destState.y - s.sourceState.y, 2) +
            Math.pow(s.destState.x - s.sourceState.x, 2));
        // this is a hack, since we are using control point, we need to scale back so the mouse is actually near the line.
        s.setRotation(d * -1 - d * .8);
      }
    }
  }

  onSurfaceMouseDown = (evt: SurfaceMouseEvent) => {
    if (this.readonly || evt.srcEvent.which !== 1) { return false; }
    if (this.mode === Modes.POINTER) {
      if (evt.type === 'surface') { this.props.cancel(); this.selected = null; } else { this.selectObject(evt.child); }
    }
  }

  // FsmDrawControlbar event handlers
  onCtrlbarMode = (mode: Modes) => { this.mode = mode; if (mode !== Modes.POINTER) { this.selected = null; } };
  onCtrlbarNew = () => this.popupFileDirty('clear');
  onCtrlbarLoad = () => this.popupFileDirty('loadFile');
  onCtrlbarSave = () => this.saveFile();
  onCtrlbarExport = () => this.exportImage();
  onCtrlbarZoom = (direction) => {
    const deltaPercent = 10 * direction * -1;
    this.zoomPercent -= deltaPercent;
    if (deltaPercent === 0) {
      this.zoomPercent = 100;
    }
  }

  // Context menus handlers
  onStateContextClickDelete = (evt) => {
    this.props.cancel();
    this.workingFsm.removeState(this.stateContextOpen.obj);
    this.stateContextOpen = null;
    this.selected = null;
    this.props.cancel();
    this.refreshProps();
  }
  onStateContextClickStart = (evt) => {
    this.stateContextOpen.obj.toggleStateValue(StateTypes.START);
    this.stateContextOpen = null;
    this.refreshProps();
  }
  onStateContextClickFinal = (evt) => {
    this.stateContextOpen.obj.toggleStateValue(StateTypes.FINAL);
    this.stateContextOpen = null;
    this.refreshProps();
  }

  onTransContextClickDelete = (evt) => {
    this.props.cancel();
    this.workingFsm.removeTransition(this.transContextOpen.obj);
    this.transContextOpen = null;
    this.selected = null;
    this.props.cancel();
    this.refreshProps();
  }

  // UI Action methods
  popupFileDirty(callback: string) {
    if (this.userFsm.dirty) {
      this.popup.open('The file has changed.  \r\nWould you like to save the FSM to a file?', 'Warning',
        ['Yes', 'No', 'Cancel'], callback);
      return;
    }
    this[callback]();
  }

  onmodalclose(result: AlertModalResult) {
    if (result.result === 'Yes') {
      this.saveFile();
      if (this.workingFsm.valid) {
        if (result.callback) { this[result.callback](); }
      }
      return;
    }
    if (result.result === 'No') {
      if (result.callback) { this[result.callback](); }
      return;
    }
  }

  // Helper Methods

  getStates = (): FsmState[] => this.workingFsm.fsmStates;
  getTransitions = (): FsmTransition[] => this.workingFsm.fsmTransitions;

  closeAllContextMenus() {
    this.stateContextOpen = null;
    this.transContextOpen = null;
  }
  selectObject(obj) {
    this.selected = obj;
  }
  refreshProps() {
    this.props.refresh();
  }

  exportImage() {
    if (!this.workingFsm.empty) {
      this.surface.exportAsPng(this.workingFsm.maxPos);
    }
  }
  saveFile() {
    if (this.workingFsm.valid) {
      const blob = new Blob([this.fsmSvc.toJson() + '\n'], { type: 'application/json' });
      this.fileIO.download(blob, 'save.fsm');
      this.userFsm.setClean();
    } else {
      this.popup.open(
        'The current FSM is invalid.  A finite state machine must have at least one start and at least one final state and one transition.',
        'Save Failed');
    }
  }

  loadFile() {
    this.props.cancel();
    this.fileIO.upload();
  }

  onIoFileUpload(file: File) {
    this.fsmSvc.clearFsms();
    this.fsmSvc.fromJson(file.contents);
  }

  clear() {
    this.fsmSvc.clearFsms();
  }
}
