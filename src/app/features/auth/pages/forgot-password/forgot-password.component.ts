import { Component, effect, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../shared/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [NzFormModule, NzInputModule, NzButtonModule, FormsModule, ReactiveFormsModule, NzGridModule, NzTypographyModule, NzSpaceModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.sass'
})
export class ForgotPasswordComponent {
  private router = inject(Router);
  private authService = inject(AuthService)
  private fb = inject(NonNullableFormBuilder)

  validateForm: FormGroup<{
    email: FormControl<string>;
  }> = this.fb.group({
    email: ['', [Validators.email, Validators.required]],
  });

  submitForm(): void {
    if (this.validateForm.valid) {
      const email = this.validateForm.getRawValue().email
      this.authService.resetPassword(email).subscribe({
        next: ((res) => {
          this.router.navigate(['/sign-in']);
        })
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
        this.router.navigate(['home']);
      }
    });
  }
}
