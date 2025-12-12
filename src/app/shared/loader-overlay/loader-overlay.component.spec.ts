import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { LoaderOverlayComponent } from './loader-overlay.component';
import { IonicModule } from '@ionic/angular';
import { By } from '@angular/platform-browser'; 

describe('LoaderOverlayComponent', () => {
  let component: LoaderOverlayComponent;
  let fixture: ComponentFixture<LoaderOverlayComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        LoaderOverlayComponent 
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoaderOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); 
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // TEST 1: Visibilidad
  it('NO debe mostrar el overlay por defecto (visible = false)', () => {
    fixture.detectChanges();

    const overlayElement = fixture.debugElement.query(By.css('.overlay'));
    
    expect(overlayElement).toBeNull();
  });

  it('DEBE mostrar el overlay cuando visible es true', () => {
    component.visible = true;
    
    fixture.detectChanges();

    const overlayElement = fixture.debugElement.query(By.css('.overlay'));

    expect(overlayElement).not.toBeNull();
  });

  // TEST 2: Mensaje
  it('debe mostrar el mensaje correcto', () => {
    component.visible = true;
    component.message = 'Esperando servidor...';
    
    fixture.detectChanges();
    const pElement = fixture.debugElement.query(By.css('p'));

    expect(pElement.nativeElement.textContent).toContain('Esperando servidor...');
  });
});