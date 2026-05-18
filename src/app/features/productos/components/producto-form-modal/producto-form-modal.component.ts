import { Component, ElementRef, EventEmitter, Output, ViewChild, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Producto, ProductoPayload } from '../../../../core/models/producto.model';
import { CategoriaService } from '../../../../core/services/categoria.service';
import { ProveedorService } from '../../../../core/services/proveedor.service';
import { Categoria } from '../../../../core/models/categoria.model';
import { Proveedor } from '../../../../core/models/proveedor.model';

@Component({
  selector: 'app-producto-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './producto-form-modal.component.html',
  styleUrls: ['./producto-form-modal.component.scss']
})
export class ProductoFormModalComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly categoriaService = inject(CategoriaService);
  private readonly proveedorService = inject(ProveedorService);

  @ViewChild('dialog') dialog!: ElementRef<HTMLDialogElement>;
  @Output() save = new EventEmitter<{ id?: number, data: ProductoPayload }>();

  form!: FormGroup;
  isEditMode = signal(false);
  isSubmitting = signal(false);
  currentId: number | undefined;

  categorias = signal<Categoria[]>([]);
  proveedores = signal<Proveedor[]>([]);

  ngOnInit(): void {
    this.initForm();
    this.cargarSelectores();
  }

  private initForm(): void {
    this.form = this.fb.group({
      nombre_producto: ['', [Validators.required, Validators.minLength(3)]],
      id_categoria: ['', Validators.required],
      presentacion: ['', Validators.required],
      precio_venta: ['', [Validators.required, Validators.min(0.01)]],
      id_proveedor: ['', Validators.required],
      notas: [''],
      activo: [true],
      stock_inicial: [0, [Validators.min(0)]],
      stock_minimo: [0, [Validators.min(0)]]
    });
  }

  cargarSelectores(): void {
    this.categoriaService.getAll().subscribe({
      next: (data) => {
        // Carga las categorías y permite incluir la seleccionada si estuviera inactiva
        this.categorias.set(data.filter(c => c.activo));
      },
      error: (err) => console.error('Error al cargar categorías en formulario de producto', err)
    });

    this.proveedorService.getAll().subscribe({
      next: (data) => {
        this.proveedores.set(data.filter(p => p.activo));
      },
      error: (err) => console.error('Error al cargar proveedores en formulario de producto', err)
    });
  }

  open(producto?: Producto): void {
    this.cargarSelectores();
    
    if (producto) {
      this.isEditMode.set(true);
      this.currentId = producto.id_producto;
      this.form.patchValue({
        nombre_producto: producto.nombre_producto,
        id_categoria: producto.id_categoria,
        presentacion: producto.presentacion,
        precio_venta: producto.precio_venta,
        id_proveedor: producto.id_proveedor,
        notas: producto.notas || '',
        activo: producto.activo,
        stock_inicial: 0,
        stock_minimo: 0
      });
      this.form.get('stock_inicial')?.disable();
      this.form.get('stock_minimo')?.disable();
    } else {
      this.isEditMode.set(false);
      this.currentId = undefined;
      this.form.reset({
        activo: true,
        precio_venta: '',
        stock_inicial: 0,
        stock_minimo: 0
      });
      this.form.get('stock_inicial')?.enable();
      this.form.get('stock_minimo')?.enable();
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
      const formValue = this.form.getRawValue();
      const data: ProductoPayload = {
        nombre_producto: formValue.nombre_producto,
        id_categoria: Number(formValue.id_categoria),
        presentacion: formValue.presentacion,
        precio_venta: Number(formValue.precio_venta),
        id_proveedor: Number(formValue.id_proveedor),
        notas: formValue.notas,
        activo: formValue.activo,
        stock_inicial: this.isEditMode() ? undefined : Number(formValue.stock_inicial || 0),
        stock_minimo: this.isEditMode() ? undefined : Number(formValue.stock_minimo || 0)
      };
      this.save.emit({ id: this.currentId, data });
    } else {
      this.form.markAllAsTouched();
    }
  }
}
