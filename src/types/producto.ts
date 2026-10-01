//SRC/TYPES
export interface Producto {
  sku: string;
  nombre: string;
  fechaVencimiento: string; //no incluye la hora, solo YMD
  cantidad: number;
  ultimaRevision: string; //incluye la hora mas YMD
}
