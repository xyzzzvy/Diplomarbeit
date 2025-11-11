import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayAgainstFriendsComponent } from './play-against-friends.component';

describe('PlayAgainstFriendsComponent', () => {
  let component: PlayAgainstFriendsComponent;
  let fixture: ComponentFixture<PlayAgainstFriendsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlayAgainstFriendsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayAgainstFriendsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
