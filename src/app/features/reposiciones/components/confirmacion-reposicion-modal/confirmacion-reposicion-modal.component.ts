import { Component, ElementRef, EventEmitter, Output, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, FormArray } from '@angular/forms';
import { ReposicionPayload } from '../../../../core/models/reposicion.model';
import { Proveedor } from '../../../../core/models/proveedor.model';
import { Producto } from '../../../../core/models/producto.model';

@Component({
  selector: 'app-confirmacion-reposicion-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './confirmacion-reposicion-modal.component.html',
  styleUrls: ['./confirmacion-reposicion-modal.component.scss']
})
export class ConfirmacionReposicionModalComponent {
  @ViewChild('dialog') dialog!: ElementRef<HTMLDialogElement>;
  @Output() save = new EventEmitter<ReposicionPayload>();

  form: FormGroup;
  isSubmitting = signal(false);
  proveedorActual = signal<Proveedor | null>(null);

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      codigo_reposicion: ['', Validators.required],
      observacion: [''],
      detalles: this.fb.array([])
    });
  }

  get detalles(): FormArray {
    return this.form.get('detalles') as FormArray;
  }

  open(proveedor: Proveedor, items: { producto: Producto, cantidad_sugerida: number }[]): void {
    this.proveedorActual.set(proveedor);
    
    // Generar un código sugerido
    const codigo = `REP-${proveedor.id_proveedor}-${Date.now().toString().slice(-6)}`;
    
    this.form.reset({
      codigo_reposicion: codigo,
      observacion: ''
    });

    this.detalles.clear();
    
    items.forEach(item => {
      this.detalles.push(this.fb.group({
        id_producto: [item.producto.id_producto],
        nombre_producto: [{ value: item.producto.nombre_producto, disabled: true }],
        cantidad_solicitada: [item.cantidad_sugerida, [Validators.required, Validators.min(1)]],
        costo_unitario: [item.producto.costo_unitario_actual ?? 0, [Validators.required, Validators.min(0)]]
      }));
    });

    this.isSubmitting.set(false);
    this.dialog.nativeElement.showModal();
  }

  close(): void {
    this.dialog.nativeElement.close();
    this.form.reset();
  }

  onSubmit(): void {
    if (this.form.valid && this.proveedorActual()) {
      this.isSubmitting.set(true);
      const raw = this.form.getRawValue();
      
      const payload: ReposicionPayload = {
        codigo_reposicion: raw.codigo_reposicion,
        id_proveedor: this.proveedorActual()!.id_proveedor,
        observacion: raw.observacion || null,
        detalles: raw.detalles.map((d: any) => ({
          id_producto: d.id_producto,
          cantidad_solicitada: Number(d.cantidad_solicitada),
          costo_unitario: Number(d.costo_unitario)
        }))
      };
      
      this.save.emit(payload);
    } else {
      this.form.markAllAsTouched();
    }
  }
}
