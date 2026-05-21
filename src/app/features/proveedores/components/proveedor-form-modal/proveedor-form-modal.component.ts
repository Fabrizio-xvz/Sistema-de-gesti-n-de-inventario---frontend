import { Component, ElementRef, EventEmitter, Output, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Proveedor, ProveedorPayload } from '../../../../core/models/proveedor.model';

@Component({
  selector: 'app-proveedor-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './proveedor-form-modal.component.html',
  styleUrls: ['./proveedor-form-modal.component.scss']
})
export class ProveedorFormModalComponent {
  @ViewChild('dialog') dialog!: ElementRef<HTMLDialogElement>;
  @Output() save = new EventEmitter<{ id?: number, data: ProveedorPayload }>();

  form: FormGroup;
  isEditMode = signal(false);
  isSubmitting = signal(false);
  currentId: number | undefined;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      razon_social: ['', [Validators.required, Validators.minLength(3)]],
      ruc: [''],
      telefono: [''],
      correo_electronico: ['', [Validators.email]]
    });
  }

  open(proveedor?: Proveedor): void {
    if (proveedor) {
      this.isEditMode.set(true);
      this.currentId = proveedor.id_proveedor;
      this.form.patchValue({
        razon_social: proveedor.razon_social,
        ruc: proveedor.ruc ?? '',
        telefono: proveedor.telefono ?? '',
        correo_electronico: proveedor.correo_electronico ?? ''
      });
    } else {
      this.isEditMode.set(false);
      this.currentId = undefined;
      this.form.reset();
    }
    this.isSubmitting.set(false);
    this.dialog.nativeElement.showModal();
  }

  close(): void {
    this.dialog.nativeElement.close();
    this.form.reset();
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.isSubmitting.set(true);
      const raw = this.form.value;
      const data: ProveedorPayload = {
        razon_social: raw.razon_social,
        ruc: raw.ruc || null,
        telefono: raw.telefono || null,
        correo_electronico: raw.correo_electronico || null
      };
      this.save.emit({ id: this.currentId, data });
    } else {
      this.form.markAllAsTouched();
    }
  }
}
