import { Component } from '@angular/core';
import { CircleModel } from './circle.model';
import { SquareModel } from './square.model';
import { FormModel } from './form.model';
import { FormService } from './form.service';
import { Utils } from './utils';

@Component({
  selector: 'my-app',
  template: `
    <h1>Let's play with forms!</h1>
    <svg attr.width="{{canvasWidth}}" attr.height="{{canvasHeight}}" style="background-color:gray">
      <g *ngFor="let form of forms">
        <g [ngSwitch]="form.getType()">
          <g *ngSwitchCase="'circle'" circleForm [circleData]="form" (onDivide)="divide($event)"></g>
          <g *ngSwitchCase="'square'" squareForm [squareData]="form" (onDivide)="divide($event)"></g>
          <g *ngSwitchDefault><!-- Form type unknow --></g>
        </g>
      </g>
    </svg>
    <br>
    <span>Score : {{score}}</span>
    <br>
    <input type="button" (click)="launchNewGame();" value="Launch a new game!" />
    <div>
      <select [(ngModel)]="currentFormType">
        <option *ngFor="let formType of formTypes" [value]="formType">{{formType}}</option>
      </select>
      <input type="button" (click)="add();" value="Add Form" />
    </div>
  `,
  providers: [FormService]
})
export class AppComponent {

  /**
   * all the form types handled by the application
   */
  private formTypes: Array<string> = ['circle', 'square', 'triangle'];
  /**
   * the current form type that will be added on the add button click
   * Not sure if this property will be kept in the future, when the forms will be added in a more automatic way
   */
  private currentFormType: string;
  /**
   * all the forms currently on the board
   */
  private forms: FormModel[] = [];

  /**
   * Can stop or start the animation (ie the forms movement)
   * Only used in debug mode, will be removed later.
   */
  private running: boolean = false;

  /**
   * The current score
   */
  private score: number = 0;

  static parameters = ['canvasWidth', 'canvasHeight', FormService];
  constructor(private canvasWidth: number, private canvasHeight: number, private formService: FormService){  }

  public ngOnInit() {
    this.running = true;
    this.moveForms();
  }

  /**
   * Add a new form to the board, based on the type selected in the select.
   * Only present during the dev, but will be removed/replaced later by some kind of automatic process
   */
  public add(): void{
    if(!this.currentFormType){
      console.warn("No form type selected..")
      return;
    }

    this.forms.push(this.formService.generateForm(this.currentFormType));
  }

  /**
   * Update the position of all the forms on the board.
   * This method will be called at each navigator refresh
   */
  public moveForms(){
    this.forms.forEach((form: FormModel) =>{
      form.move(this.canvasWidth, this.canvasHeight);
    });
    if(this.running){
      requestAnimationFrame(()=> this.moveForms());
    }
  }

  /**
   * Remove the given form from the board, and replace it with the result of it's division, if any
   * @param form The form to remove from the board and divide
   */
  public divide(form: FormModel): void{
    let newForms: FormModel[] = this.formService.divide(form);
    let index: number = this.forms.indexOf(form);
    this.forms.splice(index, 1);
    newForms.forEach((form: FormModel) =>{
      this.forms.push(form);
    });

    this.score += form.getScoreValue();
  }

  /**
   * Start a game by :
   * - resetting the score to 0
   * - resetting the timer
   * - clearing the board
   * - generating a new set of forms
   */
  public launchNewGame(){
    this.score = 0;
    // TODO Should also rest the timer, when there'll be one
    this.forms = [];
    // TODO The min and max nb of forms must be in variable, to be able to update it with the game difficulty
    let nbForms: number = Utils.randInt(1, 20);
    for(let i: number = 0; i < nbForms; i++){
      // TODO currently generate only one type of form, the one currently selected in the select box. Must randomize this
      this.forms.push(this.formService.generateForm(this.currentFormType));
    }
  }

  //************** Debug functions, not used *****************************
  private debugForms(){
    console.log("Forms :");
    this.forms.forEach((form: FormModel)=>{
      console.log(form);
    });
  }

  public toggleRunning(){
    this.running = !this.running;
    if(this.running){
      requestAnimationFrame(()=> this.moveForms());
    }
  }
  //**********************************************************************
}
