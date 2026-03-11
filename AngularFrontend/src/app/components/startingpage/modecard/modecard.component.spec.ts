import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModecardComponent } from './modecard.component';

describe('ModecardComponent', () => {
  let component: ModecardComponent;
  let fixture: ComponentFixture<ModecardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModecardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModecardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
