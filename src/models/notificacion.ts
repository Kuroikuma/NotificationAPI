import mongoose, { Schema } from "mongoose";

import { ObjectId } from 'mongoose';
import { IUsuario } from "./user";
import { IFinca } from "./finca";

// Interfaz para los detalles de la alerta
interface IDetalles {
  idFinca?: ObjectId; // Referencia a la colección Fincas
  idBovino?: ObjectId; // Referencia a la colección Bovinos
  mensaje: string; // Mensaje de la alerta
  titulo: string; // Título de la alerta

  finca?: IFinca; // Este será el finca poblado después de hacer populate
}

// Interfaz para las notificaciones
export interface INotificacion extends mongoose.Document {
  idUsuario: ObjectId | IUsuario; // Referencia a la colección Usuario
  tipoAlerta: 'vacunación' | 'enfermedad' | 'producción baja' | 'clima'; // Tipo de alerta
  detalles: IDetalles; // Detalles de la alerta
  leido?: boolean; // Estado de lectura, opcional ya que tiene un valor por defecto
  run_time: string;

}

// Subdocumento para detalles de la alerta
const detallesSchema = new Schema({
  idFinca: { type: mongoose.Schema.Types.ObjectId, ref: 'Fincas' },
  idBovino: { type: mongoose.Schema.Types.ObjectId },
  mensaje: { type: String, required: true },
  titulo: { type: String, required: true }
}, { _id: false });

// Esquema de notificaciones
const notificacionesSchema = new Schema({
  idUsuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuarios', required: true },
  tipoAlerta: { 
    type: String, 
    enum: ['vacunación', 'enfermedad', 'producción baja', 'clima'], 
    required: true 
  },
  detalles: { type: detallesSchema, required: true },
  leido: { type: Boolean, default: false },
  run_time: {type: String, required: true},
}, { timestamps: true });

export const Notificacion = mongoose.model<INotificacion>('Notificaciones', notificacionesSchema);


