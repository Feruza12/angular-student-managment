import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NzGridModule } from 'ng-zorro-antd/grid';
@Component({
  selector: 'app-auth-wrapper',
  standalone: true,
  imports: [RouterOutlet, NzGridModule],
  templateUrl: './auth-wrapper.component.html',
  styleUrl: './auth-wrapper.component.sass'
})
export class AuthWrapperComponent {

}
