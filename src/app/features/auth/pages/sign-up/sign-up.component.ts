import { Component, effect, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { AuthService } from '../../../../shared/services/auth.service';
import { Subject } from 'rxjs';
import { Credentials } from '../../../../shared/interfaces/credentials';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export type RegisterStatus = 'pending' | 'creating' | 'success' | 'error';

interface RegisterState {
  status: RegisterStatus;
}


@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [NzFormModule, NzInputModule, NzButtonModule, FormsModule, ReactiveFormsModule, NzGridModule, NzTypographyModule, NzSpaceModule, RouterModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.sass'
})
export class SignUpComponent {

  private router = inject(Router);
  private authService = inject(AuthService)
  private fb = inject(FormBuilder)

  validateForm: FormGroup<{
    email: FormControl<string>;
    password: FormControl<string>;
  }> = this.fb.nonNullable.group({
    email: ['', [Validators.email, Validators.required]],
    password: ['', [Validators.minLength(6), Validators.required]],
  });

  submitForm(): void {
    if (this.validateForm.valid) {
      const credentials = { ...this.validateForm.getRawValue() }
      this.authService.signUp(credentials).subscribe({
        next: (res) => {
          console.log(res)
        }
      })

    } else {
      Object.values(this.validateForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  constructor() {
    effect(() => {
      if (this.authService.user()) {
        this.router.navigate(['home'])
      }
    })
  }
}
