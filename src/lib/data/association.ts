import 'server-only';

import dbConnect from '@/lib/mongodb';
import Association from '@/lib/models/Association';
import Player from '@/lib/models/Player';

/**
 * Dados públicos da associação para a home.
 * Não é uma server action ('use server'): é só uma função de servidor,
 * então não fica exposta como endpoint.
 */
export async function getAssociationData() {
  try {
    await dbConnect();

    const [association, totalPlayers] = await Promise.all([
      Association.findOne().lean(),
      Player.countDocuments({ isActive: true }),
    ]);

    if (!association) {
      return null;
    }

    return {
      name: association.name,
      description: association.description,
      foundedDate: association.foundedDate,
      address: association.address,
      phone: association.phone,
      email: association.email,
      socialMedia: association.socialMedia ?? {},
      commission: association.commission ?? [],
      gameSchedule: association.gameSchedule,
      totalPlayers,
    };
  } catch (error) {
    console.error('Erro ao buscar associação:', error);
    return null;
  }
}
