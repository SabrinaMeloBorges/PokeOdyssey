import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlocoCentralComponent } from './bloco-central.component';

describe('BlocoCentralComponent', () => {
  let component: BlocoCentralComponent;
  let fixture: ComponentFixture<BlocoCentralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BlocoCentralComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BlocoCentralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
