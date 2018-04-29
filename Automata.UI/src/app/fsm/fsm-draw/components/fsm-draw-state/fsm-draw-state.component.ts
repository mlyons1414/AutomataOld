import { FsmState, StateTypes } from './../../../fsm-core/classes/fsm-state';
import { Component, Input, EventEmitter, Output, Renderer } from '@angular/core';
import { ChildMouseEvent } from '../fsm-draw-surface/fsm-draw-surface.component';


@Component({
  // tslint:disable-next-line:component-selector
  selector: '[app-fsm-draw-state]',
  templateUrl: './fsm-draw-state.component.html',
  styleUrls: ['./fsm-draw-state.component.css']
})
export class FsmDrawStateComponent {
  // public variables
  public static stateRadius = 30;

  // Input variables
  @Input() state: FsmState;
  @Input() selected: boolean;
  // Output events
  @Output() stateclick: EventEmitter<ChildMouseEvent> = new EventEmitter<ChildMouseEvent>();
  @Output() statedblclick: EventEmitter<ChildMouseEvent> = new EventEmitter<ChildMouseEvent>();
  @Output() statecontextmenu: EventEmitter<ChildMouseEvent> = new EventEmitter<ChildMouseEvent>();
  @Output() statemousedown: EventEmitter<ChildMouseEvent> = new EventEmitter<ChildMouseEvent>();
  @Output() statemouseenter: EventEmitter<ChildMouseEvent> = new EventEmitter<ChildMouseEvent>();
  @Output() statemouseleave: EventEmitter<ChildMouseEvent> = new EventEmitter<ChildMouseEvent>();
  @Output() statemousemove: EventEmitter<ChildMouseEvent> = new EventEmitter<ChildMouseEvent>();
  @Output() statemouseout: EventEmitter<ChildMouseEvent> = new EventEmitter<ChildMouseEvent>();
  @Output() statemouseover: EventEmitter<ChildMouseEvent> = new EventEmitter<ChildMouseEvent>();
  @Output() statemouseup: EventEmitter<ChildMouseEvent> = new EventEmitter<ChildMouseEvent>();

  // Properties
  get radius() { return FsmDrawStateComponent.stateRadius; }

  constructor() { }

  // State type methods
  isStart = () => this.state.stateType === StateTypes.START || this.state.stateType === StateTypes.STARTFINAL;
  isFinal = () => this.state.stateType === StateTypes.FINAL || this.state.stateType === StateTypes.STARTFINAL;
  isNormal = () => this.state.stateType === StateTypes.NORMAL;

  // get default fill based on type, overridden in css
  getFill = () => (this.isStart() ? 'yellow' : 'white');

  // State event handlers
  onClick = (evt: MouseEvent) => {
    this.stateclick.emit({ srcEvent: evt, child: this.state, type: 'state' }); evt.stopPropagation(); return false;
  }
  onDblClick = (evt: MouseEvent) => {
    this.statedblclick.emit({ srcEvent: evt, child: this.state, type: 'state' }); evt.stopPropagation(); return false;
  }
  onContextMenu = (evt: MouseEvent) => {
    this.statecontextmenu.emit({ srcEvent: evt, child: this.state, type: 'state' }); evt.stopPropagation(); return false;
  }
  onMouseDown = (evt: MouseEvent) => {
    this.statemousedown.emit({ srcEvent: evt, child: this.state, type: 'state' }); evt.stopPropagation(); return false;
  }
  onMouseEnter = (evt: MouseEvent) => {
    this.statemouseenter.emit({ srcEvent: evt, child: this.state, type: 'state' }); evt.stopPropagation(); return false;
  }
  onMouseLeave = (evt: MouseEvent) => {
    this.statemouseleave.emit({ srcEvent: evt, child: this.state, type: 'state' }); evt.stopPropagation(); return false;
  }
  onMouseMove = (evt: MouseEvent) => {
    this.statemousemove.emit({ srcEvent: evt, child: this.state, type: 'state' }); evt.stopPropagation(); return false;
  }
  onMouseOut = (evt: MouseEvent) => {
    this.statemouseout.emit({ srcEvent: evt, child: this.state, type: 'state' }); evt.stopPropagation(); return false;
  }
  onMouseOver = (evt: MouseEvent) => {
    this.statemouseover.emit({ srcEvent: evt, child: this.state, type: 'state' }); evt.stopPropagation(); return false;
  }
  onMouseUp = (evt: MouseEvent) => {
    this.statemouseup.emit({ srcEvent: evt, child: this.state, type: 'state' }); evt.stopPropagation(); return false;
  }

}
