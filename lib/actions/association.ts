'use server';

import dbConnect from '@/lib/mongodb';
import Association from '@/lib/models/Association';
import Player from '@/lib/models/Player';

export async function getAssociationData() {
  await dbConnect();

  try {
    // Buscar a associação "Porto dos Santos" (única associação)
    const association = await Association.findOne({
      name: 'Associação de Porto dos Santos',
    }).lean();

    if (!association) {
      return null;
    }

    // Contar jogadores ativos
    const totalPlayers = await Player.countDocuments({ isActive: true });

    return {
      ...association,
      totalPlayers,
    };
  } catch (error) {
    console.error('Erro ao buscar associação:', error);
    return null;
  }
}
