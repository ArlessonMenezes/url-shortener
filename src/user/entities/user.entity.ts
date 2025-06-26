import { BeforeInsert, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import * as bcrypt from 'bcrypt';
import { ShortUrl } from "src/short-url/entities/short-url.entity";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  email: string;

  @Column()
  password: string;

  @OneToMany(() => ShortUrl, shortUrl => shortUrl.user)
  urls: ShortUrl[];

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}