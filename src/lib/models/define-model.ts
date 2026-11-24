import mongoose from 'mongoose';

/**
 * Registra um modelo do Mongoose.
 *
 * Em desenvolvimento, o hot reload recarrega o arquivo do modelo, mas o
 * Mongoose mantém o modelo antigo em cache (`mongoose.models`). Se o schema
 * ganhou campos novos, o modo estrito os descarta em silêncio e nada é
 * gravado. Por isso, fora de produção, o modelo é sempre recompilado.
 */
export function defineModel<T>(
  name: string,
  schema: mongoose.Schema<T>
): mongoose.Model<T> {
  if (process.env.NODE_ENV !== 'production' && mongoose.models[name]) {
    mongoose.deleteModel(name);
  }
  return (mongoose.models[name] as mongoose.Model<T> | undefined) ??
    mongoose.model<T>(name, schema);
}
