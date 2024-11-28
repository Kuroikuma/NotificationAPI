import mongoose, { ObjectId, Schema } from "mongoose";

export interface ICoordenadas {
  latitud: number;
  longitud: number;
}

export interface IFinca extends mongoose.Document {
  nombre: string;
  image?: string; // Opcional, ya que tiene un valor por defecto
  direccion?: string; // Opcional, ya que tiene un valor por defecto
  coordenadas: ICoordenadas;
  tamano?: string; // Opcional, ya que tiene un valor por defecto
  recursosN?: string[]; // Opcional, ya que tiene un valor por defecto
  descripcion?: string; // Opcional, ya que tiene un valor por defecto
  idUsuario: ObjectId;
}

const fincaSchema = new Schema({
  nombre: { type: String, required: true },
  image: { type: String, default: '' },
  direccion: { type: String, default: '' },
  coordenadas: {
    latitud: { type: Number, required: true },
    longitud: { type: Number, required: true }
  },
  tamano: { type: String, default: '' },
  recursosN: { type: [String], default: [] }, // Lista de recursos naturales
  descripcion: { type: String, default: '' },
  idUsuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuarios', required: true }, // Relación con el usuario
}, { timestamps: true });

// Creamos el modelo de Finca
export const Finca = mongoose.model<IFinca>('Fincas', fincaSchema);