import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ){}

  async validateUser(email: string, password: string) {
    try {
      const user = await this.userService.findUserByEmail(email);
      const comparePass = await bcrypt.compare(password, user.password);
      
      if (user && comparePass) {
        const { password, ...result } = user;
        
        return result;
      };

      return null;
    } catch(err) {
      if (err instanceof NotFoundException) {
        return null;
      };
      
      throw err;
    };
  };

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    
    return { 
      access_token: this.jwtService.sign(payload),
    };
  };
}
