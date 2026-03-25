import {Component, OnInit} from '@angular/core';

type PieceColor = 'white' | 'black';
type Piece = { type: string; color: PieceColor };

@Component({
  selector: 'app-play-against-bots',
  standalone: false,
  templateUrl: './play-against-bots.component.html',
  styleUrl: './play-against-bots.component.css'
})
export class PlayAgainstBotsComponent {
  toggledPanel :string = "bots";

  public switchToggle() {
    if(this.toggledPanel == "bots"){
      this.toggledPanel = "chat";
    } else {
      this.toggledPanel = "bots";
    }
  }

}
