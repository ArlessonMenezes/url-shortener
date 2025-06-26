import { User } from "src/user/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ShortUrl {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 6 })
  shortCode: string;

  @Column('text')
  originalUrl: string;

  @Column({ default: 0 })
  clickCount: number;

  @ManyToOne(() => User, user => user.urls)
  user: User;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date | null;
}
