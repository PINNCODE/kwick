import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthServiceAdapter } from '../../../infrastructure/adapters/auth-service.adapter';
import { CredentialDbAdapter } from '../../../infrastructure/storage/credential-db.adapter';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',
})
export class AuthComponent implements OnInit {
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly isAuthenticated = signal(false);

  authForm!: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly authService: AuthServiceAdapter,
    private readonly credentialStorage: CredentialDbAdapter
  ) {}

  ngOnInit(): void {
    this.authForm = this.fb.group({
      host: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
      username: ['', Validators.required],
      password: ['', Validators.required],
      rememberProvider: [false],
    });

    this.checkExistingSession();
  }

  private async checkExistingSession(): Promise<void> {
    const sessionExists = await this.credentialStorage.exists();
    if (sessionExists && this.authService.isAuthenticated()) {
      this.router.navigate(['/player']);
    } else if (sessionExists) {
      this.isLoading.set(true);
      this.authService.restoreSession().then((success) => {
        this.isLoading.set(false);
        if (success) {
          this.router.navigate(['/player']);
        }
      });
    }
  }

  protected onSubmit(): void {
    if (this.authForm.invalid) {
      this.authForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const { host, username, password, rememberProvider } = this.authForm.value;

    this.authService.login({ host, username, password }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.isAuthenticated.set(true);
        if (!rememberProvider) {
          this.credentialStorage.get().then(record => {
            if (record) {
              this.credentialStorage.delete();
            }
          });
        }
        this.router.navigate(['/player']);
      },
      error: (err) => {
        this.isLoading.set(false);
        const message = err?.message || 'Authentication failed';
        if (message.includes('Invalid credentials') || message.includes('auth')) {
          this.errorMessage.set('Invalid credentials');
        } else if (message.includes('Network') || message.includes('fetch')) {
          this.errorMessage.set('Network error');
        } else if (message.includes('timeout') || message.includes('unreachable')) {
          this.errorMessage.set('Server unreachable');
        } else {
          this.errorMessage.set(message);
        }
      },
    });
  }

  protected hasError(field: string): boolean {
    const control = this.authForm.get(field);
    return !!(control && control.invalid && control.touched);
  }
}
