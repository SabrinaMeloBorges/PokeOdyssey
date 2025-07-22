import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TelaUsuariosComponent } from './tela-usuarios.component';

describe('TelaUsuariosComponent', () => {
  let component: TelaUsuariosComponent;
  let fixture: ComponentFixture<TelaUsuariosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TelaUsuariosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TelaUsuariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
