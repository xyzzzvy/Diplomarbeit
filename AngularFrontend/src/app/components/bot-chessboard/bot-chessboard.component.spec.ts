import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BotChessboardComponent } from './bot-chessboard.component';

describe('BotChessboardComponent', () => {
  let component: BotChessboardComponent;
  let fixture: ComponentFixture<BotChessboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BotChessboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BotChessboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
