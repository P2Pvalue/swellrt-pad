import { Component, ViewChild, OnInit, ViewContainerRef,
  Injector, Compiler, ComponentRef, ReflectiveInjector, Injectable, HostListener,trigger,
  state,
  style,
  transition,
  animate } from '@angular/core';
import { Observable, ReplaySubject } from "rxjs/Rx"

@Injectable()
export class JetpadModalService {
  private parentElement: any;
  // here we hold our placeholder
  private vcRef: ViewContainerRef;
  private vmRef: ViewContainerRef;
  // here we hold our injector
  private injector: Injector;
  // we can use this to determine z-index of multiple modals
  public activeInstances: number = 0;

  constructor(private compiler: Compiler) {
  }

  registerViewContainerRef(vcRef: ViewContainerRef): void {
    this.vcRef = vcRef;
  }

  registerInjector(injector: Injector): void {
    this.injector = injector;
  }

  registerParentElement(componentElement: any): void {
    this.parentElement = componentElement;
  }

  registerModalElement(vmRef: ViewContainerRef): void {
    this.vmRef = vmRef;
  }

  create<T>(module: any, component: any, parameters?: Object): Observable<ComponentRef<T>> {
    let componentRef$ = new ReplaySubject();
    this.compiler.compileModuleAndAllComponentsAsync(module)
      .then(factory => {
        let componentFactory = factory.componentFactories.filter(item => item.componentType === component)[0];
        const childInjector = ReflectiveInjector.resolveAndCreate([], this.injector);
        let componentRef = this.vmRef.createComponent(componentFactory, 0, childInjector);
        Object.assign(componentRef.instance, parameters); // pass the @Input parameters to the instance
        this.activeInstances ++;
        this.parentElement.activated = true;
        this.parentElement.currentState = 'active';
        document.body.className += " jetpad-modal-open";
        componentRef.instance["componentIndex"] = this.activeInstances;
        componentRef.instance["parentHeight"] = this.parentElement.viewContainerRef._element.nativeElement.offsetTop;
        componentRef.instance["destroy"] = () => {
          this.activeInstances --;
          if (this.activeInstances <= 1) {
            this.parentElement.activated = false;
            this.parentElement.currentState = 'inactive';
            document.body.className = document.body.className.replace(/jetpad-modal-open\b/, "");
          }
          componentRef.destroy();
        };
        componentRef$.next(componentRef);
        componentRef$.complete();
      });
    return <Observable<ComponentRef<T>>> componentRef$.asObservable();
  }
}


// These 2 items will make sure that you can annotate a modalcomponent with @Modal()
export class ModalContainer {
  destroy: Function;
  componentIndex: number;
  closeModal(): void {
    this.destroy();
  }
}
export function Modal() {
  return function (target) {
    Object.assign(target.prototype,  ModalContainer.prototype);
  };
}

//Placeholder which allows render modals
@Component({
  selector: "jetpad-modal-placeholder",
  template: `
    <div #modalplaceholder 
         class="jetpad-modal-placeholder" 
         [ngClass]="{'jetpad-modal-backdrop-activate':activated}">         
    </div>
    <div class="jetpad-modal" [@modalState]="currentState"><template #modal></template></div>`,
  styles:[`
    .jetpad-modal-placeholder{
      height: 100%;
    }
    .jetpad-modal-backdrop-activate{
      height: 100%;
      width: 100%;
      z-index: 1000;
      top: 0;
      position: absolute;
      background: rgba(0, 0, 0, 0.4);
    }
    .jetpad-modal-open{
      overflow: hidden;
    }
    @media only screen and (min-width: 320px) {
      .jetpad-modal{
        width: 100%;
        left: 0;
        height: 100%;
        top: 200%
      }
    }
    @media only screen and (min-width: 768px) {
      .jetpad-modal{
        width: 80%;
        left: 10%;
        top: 120%;
        height: 50%;
      }
    }
    @media only screen and (min-width : 1200px) {
      .jetpad-modal{
        width: 70%;
        left: 15%;
        top: 120%;
        height: 50%;
      }
    }
    .jetpad-modal{
      position: absolute;
      background-color: #F3F3F3;
      opacity: 1;
      z-index: 1001;
    }
  `],
  animations: [
    trigger('modalState',[
      state('inactive', style({
        transform: 'translateY(0)'
      })),
      state('active',   style({
        transform: 'translateY(-200%)'
      })),
      transition('* => *', animate('.2s'))
    ])]
})
export class ModalPlaceholderComponent implements OnInit {
  @ViewChild("modalplaceholder", {read: ViewContainerRef}) viewContainerRef;
  @ViewChild("modal", {read: ViewContainerRef}) viewModalRef;
  viewHeight: number;
  viewWidth: number;
  activated: boolean = false;
  currentState: string = 'inactive';

  @HostListener('window:resize', ['$event'])
  sizeWindow(event) {
    this.viewHeight = event.target.innerHeight;
    this.viewWidth = event.target.innerWidth;
    //this.sizeMenu(this.wt);
    console.log('height =>', this.viewHeight);
    console.log('width =>', this.viewWidth);
  }

  constructor(
    private modalService: JetpadModalService,
    private injector: Injector) {
  }

  ngOnInit(): void {
    this.modalService.registerViewContainerRef(this.viewContainerRef);
    this.modalService.registerModalElement(this.viewModalRef);
    this.modalService.registerInjector(this.injector);
    this.modalService.registerParentElement(this);
  }

}

