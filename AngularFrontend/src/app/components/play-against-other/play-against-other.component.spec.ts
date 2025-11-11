import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayAgainstOtherComponent } from './play-against-other.component';

describe('PlayAgainstOtherComponent', () => {
  let component: PlayAgainstOtherComponent;
  let fixture: ComponentFixture<PlayAgainstOtherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayAgainstOtherComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayAgainstOtherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
