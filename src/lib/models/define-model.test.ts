import mongoose from 'mongoose';
import { afterEach, describe, expect, it } from 'vitest';
import { defineModel } from './define-model';

const NAME = 'HotReloadProbe';

afterEach(() => {
  if (mongoose.models[NAME]) mongoose.deleteModel(NAME);
});

describe('defineModel', () => {
  it('recompila o modelo quando o schema muda (hot reload em dev)', () => {
    // Situação do bug: modelo antigo, sem o campo novo, preso no cache.
    mongoose.model(NAME, new mongoose.Schema({ name: String }));

    // Arquivo recarregado com o schema novo.
    const Model = defineModel(
      NAME,
      new mongoose.Schema({ name: String, monthlyFeeCents: Number })
    );

    expect(Model.schema.path('monthlyFeeCents')).toBeDefined();

    // Com o modelo antigo, o modo estrito descartaria o campo do update.
    const update = Model.castObject({ monthlyFeeCents: 3000 });
    expect(update).toMatchObject({ monthlyFeeCents: 3000 });
  });

  it('em produção reaproveita o modelo já registrado', () => {
    const previous = process.env.NODE_ENV;
    (process.env as Record<string, string>).NODE_ENV = 'production';
    try {
      const First = defineModel(NAME, new mongoose.Schema({ name: String }));
      const Second = defineModel(NAME, new mongoose.Schema({ name: String }));
      expect(Second).toBe(First);
    } finally {
      (process.env as Record<string, string | undefined>).NODE_ENV = previous;
    }
  });
});
