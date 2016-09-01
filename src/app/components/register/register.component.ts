import {Component, OnDestroy} from '@angular/core';
import {Router} from "@angular/router";
import { UserService } from "../../services";


@Component({
    selector: 'app-register',
    template: `
      <div class="panel panel-default text-center">
        <div class="panel-body">
          <h4>REGISTER</h4>
          <form style="margin-top:4em" (ngSubmit)="register()">
            <div class="form-group label-floating">
              <label class="control-label" for="registerNameInput">Name</label>
              <input class="form-control" id="registerNameInput" name="name" [(ngModel)]="nameInput">
            </div>
            <div class="form-group label-floating">
              <label class="control-label" for="registerPasswordInput">Password</label>
              <input class="form-control" id="registerPasswordInput" name="password" type="password" [(ngModel)]="passwordInput">
            </div>         
            <button class="btn btn-primary">Register</button>
          </form>
        </div><!-- panel-body -->
      </div><!-- panel -->
    `
  })

export class RegisterComponent {

  // Form fields
  nameInput: string;
  passwordInput: string;

  constructor(private userService: UserService) {}

  register() {
    this.userService.create(this.nameInput, this.passwordInput);
  }
}
