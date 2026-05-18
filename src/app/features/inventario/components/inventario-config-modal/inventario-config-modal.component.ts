import { Component, ElementRef, EventEmitter, Output, ViewChild, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, AbstractControl, ValidationErrors } from '@angular/forms';
import { InventarioItem, InventarioConfigPayload } from '../../../../core/models/inventario.model';

@Component({
  selector: 'app-inventario-config-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './inventario-config-modal.component.html',
  styleUrls: ['./inventario-config-modal.component.scss']
})
export class InventarioConfigModalComponent implements OnInit {
  private readonly fb = inject(FormBuilder);

  @ViewChild('dialog') dialog!: ElementRef<HTMLDialogElement>;
  @Output() save = new EventEmitter<{ productId: number, data: InventarioConfigPayload }>();

  form!: FormGroup;
  isSubmitting = signal(false);
  
  productId!: number;
  productName = signal('');

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.form = this.fb.group({
      stock_minimo: [0, [Validators.required, Validators.min(0)]],
      stock_maximo: [0, [Validators.required, Validators.min(0)]]
    }, { validators: this.stockRangeValidator });
  }

  private stockRangeValidator(group: AbstractControl): ValidationErrors | null {
    const min = group.get('stock_minimo')?.value;
    const max = group.get('stock_maximo')?.value;
    
    if (min !== null && max !== null && Number(max) <= Number(min)) {
      return { maxLessThanMin: true };
    }
    return null;
  }

  open(item: { productId: number, nombre: string, stockMinimo: number, stockMaximo?: number }): void {
    this.productId = item.productId;
    this.productName.set(item.nombre);
    
    this.form.reset({
      stock_minimo: item.stockMinimo,
      stock_maximo: item.stockMaximo || (item.stockMinimo * 4 || 50)
    });
    
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
      const formValue = this.form.value;
      const data: InventarioConfigPayload = {
        stock_minimo: Number(formValue.stock_minimo),
        stock_maximo: Number(formValue.stock_maximo)
      };
      this.save.emit({ productId: this.productId, data });
    } else {
      this.form.markAllAsTouched();
    }
  }
}
