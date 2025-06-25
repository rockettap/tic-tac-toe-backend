import { Game } from './game.entity';

export interface GameRepository {
  findById(id: string): Promise<Game | null>;
  findRecentByUserId(userId: string, limit: number): Promise<Game[]>;
  findAll(): Promise<Game[]>;
  create(game: Game): Promise<Game>;
  update(game: Game): Promise<Game | null>;
}
