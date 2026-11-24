import type { Mongoose } from 'mongoose';

declare global {
  // Cache da conexão do Mongoose entre recarregamentos (hot reload) em dev.
  var mongoose:
    | {
        conn: Mongoose | null;
        promise: Promise<Mongoose> | null;
      }
    | undefined;
}

export {};
