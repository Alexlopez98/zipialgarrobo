import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EliminarConductorPage } from './eliminar-conductor.page';

describe('EliminarConductorPage', () => {
  let component: EliminarConductorPage;
  let fixture: ComponentFixture<EliminarConductorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EliminarConductorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
