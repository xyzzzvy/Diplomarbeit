import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiCoachChatComponent } from './ai-coach-chat.component';

describe('AiCoachChatComponent', () => {
  let component: AiCoachChatComponent;
  let fixture: ComponentFixture<AiCoachChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiCoachChatComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AiCoachChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
