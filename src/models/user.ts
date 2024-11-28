import mongoose, { Schema } from 'mongoose';

// Interfaz para el usuario
export interface IUsuario extends mongoose.Document {
  nombre?: string; // Opcional, ya que tiene un valor por defecto
  apellido?: string; // Opcional, ya que tiene un valor por defecto
  fecha_nacimiento?: Date; // Opcional, ya que tiene un valor por defecto
  email: string; // Requerido y único
  password: string; // Requerido
  telefono?: string; // Opcional, ya que tiene un valor por defecto
  tipoSuscripcion?: 'básica' | 'premium'; // Opcional, con valor por defecto
  rol?: 'admin' | 'ganadero'; // Opcional, con valor por defecto
  direccion?: string; // Opcional, ya que tiene un valor por defecto
  image?: string; // Opcional, ya que tiene un valor por defecto
  fincaId?: string; // Opcional, ya que tiene un valor por defecto
  pushToToken?: string; // Opcional, ya que tiene un valor por defecto
}

// Definimos el esquema de usuario
const userSchema = new Schema({
  nombre: { type: String, default: '' },
  apellido: { type: String, default: '' },
  fecha_nacimiento: { type: Date, default: '' },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  telefono: { type: String, default: '' },
  tipoSuscripcion: { type: String, enum: ['básica', 'premium'], default: 'básica' },
  rol: { type: String, enum: ['admin', 'ganadero'], default: 'ganadero' },
  direccion: { type: String, default: '' },
  image: { type: String, default: '' },
  fincaId: { type: String, default: '' },
  pushToToken: { type: String, default: '' }
}, { timestamps: true });

// Creamos el modelo de usuario
export const Usuario = mongoose.model<IUsuario>('Usuarios', userSchema);