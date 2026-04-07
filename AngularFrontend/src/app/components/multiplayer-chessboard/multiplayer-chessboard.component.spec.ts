import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiplayerChessboardComponent } from './multiplayer-chessboard.component';

describe('MultiplayerChessboardComponent', () => {
  let component: MultiplayerChessboardComponent;
  let fixture: ComponentFixture<MultiplayerChessboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultiplayerChessboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MultiplayerChessboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
