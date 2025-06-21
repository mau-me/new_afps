'use server';

import dbConnect from '@/lib/mongodb';
import Slug from '@/lib/models/Slug';
import Association from '@/lib/models/Association';
import Player from '@/lib/models/Player';

export async function getAssociationBySlug(slug: string) {
  await dbConnect();

  try {
    // Buscar o slug
    const slugDoc = await Slug.findOne({ slug, isActive: true }).lean();

    if (!slugDoc) {
      return null;
    }

    // Buscar a associação separadamente
    const association = await Association.findById(
      slugDoc.associationId
    ).lean();

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
