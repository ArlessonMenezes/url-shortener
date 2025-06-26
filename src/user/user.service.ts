import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dtos/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ){}

  async createUser(createUserDto: CreateUserDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('This user is already registered in the database.');
    }

    const user = this.userRepository.create(createUserDto);
    const safeUser = await this.userRepository.save(user);

    const { password, ...returnUser } = safeUser;

    return returnUser;
  }

  async findUserByEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) throw new NotFoundException('user not found.');

    return user;
  };
}
