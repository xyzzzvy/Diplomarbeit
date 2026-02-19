import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BotsPanelComponent } from './bots-panel.component';

describe('BotsPanelComponent', () => {
  let component: BotsPanelComponent;
  let fixture: ComponentFixture<BotsPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BotsPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BotsPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
