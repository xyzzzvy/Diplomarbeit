import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-modecard',
  standalone: false,
  templateUrl: './modecard.component.html',
  styleUrl: './modecard.component.css'
})
export class ModecardComponent {
  @Input() title: string = '';
  @Input() shortText: string = '';
  @Input() longText: string = '';
  @Input() route: string = '';
}
