import { Component, ElementRef, EventEmitter, Output, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Categoria, CategoriaPayload } from '../../../../core/models/categoria.model';

@Component({
  selector: 'app-categoria-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './categoria-form-modal.component.html',
  styleUrls: ['./categoria-form-modal.component.scss']
})
export class CategoriaFormModalComponent {
  @ViewChild('dialog') dialog!: ElementRef<HTMLDialogElement>;
  @Output() save = new EventEmitter<{ id?: number, data: CategoriaPayload }>();

  form: FormGroup;
  isEditMode = signal(false);
  isSubmitting = signal(false);
  currentId: number | undefined;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      nombre_categoria: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: [''],
      activo: [true]
    });
  }

  open(categoria?: Categoria): void {
    if (categoria) {
      this.isEditMode.set(true);
      this.currentId = categoria.id_categoria;
      this.form.patchValue({
        nombre_categoria: categoria.nombre_categoria,
        descripcion: categoria.descripcion,
        activo: categoria.activo ?? true
      });
    } else {
      this.isEditMode.set(false);
      this.currentId = undefined;
      this.form.reset({ activo: true });
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
      const data: CategoriaPayload = this.form.value;
      this.save.emit({ id: this.currentId, data });
    } else {
      this.form.markAllAsTouched();
    }
  }
}
