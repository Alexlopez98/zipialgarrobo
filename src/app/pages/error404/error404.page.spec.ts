import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Error404Page } from './error404.page';
import { IonicModule, NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { LottieComponent } from 'ngx-lottie'; 
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('Error404Page', () => {
  let component: Error404Page;
  let fixture: ComponentFixture<Error404Page>;
  let routerSpy: jasmine.SpyObj<Router>;
  let navControllerSpy: jasmine.SpyObj<NavController>;

  beforeEach(waitForAsync(() => {
    const spyRouter = jasmine.createSpyObj('Router', ['navigate']);
    const spyNav = jasmine.createSpyObj('NavController', ['navigateForward']);

    TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        Error404Page 
      ],
      providers: [
        { provide: Router, useValue: spyRouter },
        { provide: NavController, useValue: spyNav } 
      ]
    })
    .overrideComponent(Error404Page, {
      remove: { imports: [ LottieComponent ] },  
      add: { schemas: [CUSTOM_ELEMENTS_SCHEMA] } 
    })
    .compileComponents();

    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    navControllerSpy = TestBed.inject(NavController) as jasmine.SpyObj<NavController>;

    fixture = TestBed.createComponent(Error404Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debe navegar al login cuando se presiona volverInicio', () => {
    component.volverInicio();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });
});