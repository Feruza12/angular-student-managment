import { Routes } from '@angular/router';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { isAuthenticatedGuard } from './shared/guards/auth.guard';
import { SignInComponent } from './features/auth/pages/sign-in/sign-in.component';
import { SignUpComponent } from './features/auth/pages/sign-up/sign-up.component';
import { ForgotPasswordComponent } from './features/auth/pages/forgot-password/forgot-password.component';

export const routes: Routes = [
    { path: 'sign-in',  pathMatch: 'full', component: SignInComponent },
    { path: 'sign-up',  pathMatch: 'full', component: SignUpComponent },
    { path: 'forgot-password',  pathMatch: 'full', component: ForgotPasswordComponent },
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    // { path: 'auth', pathMatch: 'full', loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES) },
    { path: 'home', pathMatch: 'full', loadChildren: () => import('./shared/components/layout/layout.routes').then(m => m.LAYOUT_ROUTES), canLoad: [isAuthenticatedGuard()] },

    { path: '**', component: PageNotFoundComponent }
];
