import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiniChessPreviewComponent } from './mini-chess-preview.component';

describe('MiniChessPreviewComponent', () => {
  let component: MiniChessPreviewComponent;
  let fixture: ComponentFixture<MiniChessPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MiniChessPreviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MiniChessPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
