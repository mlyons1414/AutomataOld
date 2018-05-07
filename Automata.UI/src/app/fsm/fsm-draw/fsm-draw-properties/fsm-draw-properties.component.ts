import { FsmObject } from './../classes/Fsm';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-fsm-draw-properties',
  templateUrl: './fsm-draw-properties.component.html',
  styleUrls: ['./fsm-draw-properties.component.css']
})
export class FsmDrawPropertiesComponent implements OnInit {

  @Input() set mode(val) { this._mode = val; }
  @Input() activeobject: FsmObject;

  private _mode = 'pointer';

  constructor() { }

  ngOnInit() {
  }

}
