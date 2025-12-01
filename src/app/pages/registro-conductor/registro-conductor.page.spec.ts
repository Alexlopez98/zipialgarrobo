import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistroConductorPage } from './registro-conductor.page';

describe('RegistroConductorPage', () => {
  let component: RegistroConductorPage;
  let fixture: ComponentFixture<RegistroConductorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistroConductorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
