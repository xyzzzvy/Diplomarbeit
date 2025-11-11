import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgottPasswordComponent } from './forgott-password.component';

describe('ForgottPasswordComponent', () => {
  let component: ForgottPasswordComponent;
  let fixture: ComponentFixture<ForgottPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForgottPasswordComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ForgottPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
