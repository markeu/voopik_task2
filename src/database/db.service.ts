import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as lowdb from 'lowdb';
import * as FileAsync from 'lowdb/adapters/FileAsync';
import * as uuid from 'uuid';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../guard/payload.interface';
import { RegisterDto } from '../dto/register.dto';
import { UserDto } from '../dto/user.dto';

type DataStore = 'auths';

@Injectable()
export class DatabaseService {
    private db: lowdb.LowdbAsync<any>;

  constructor(private readonly jwtService: JwtService) {
    this.initDatabase('auths');
  }

  private async initDatabase(dataStore: DataStore) {
    const adapter = new FileAsync('db.json');
    this.db = await lowdb(adapter);
    const getUsers = await this.db.get(dataStore).value();
    if (!getUsers) {
      await this.db.set(dataStore, []).write();
    }
  }

  async findAll(dataStore: DataStore): Promise<any> {
    const getUsers = await this.db.get(dataStore).value();
    return getUsers;
  }

  async findOne(condition: object, dataStore: DataStore): Promise<any> {
    const values = await this.db.get(dataStore).find(condition).value();
    return values;
  }

  async find(condition: object, dataStore: DataStore): Promise<any> {
    const user = await this.db.get(dataStore).find(condition).value();
        // generate and sign token
        const token = this._createToken(user);
        return {
            user,
            ...token,
          };
  }

  async update(
    key: string,
    value: string | String,
    dataStore: string,
    dataUpdate: any,
  ): Promise<any> {
    const getUsers = await this.db.get(dataStore).value();
    let modify;
    const listData = getUsers.map(user => {
      if (user[key] !== value) return user;
      if (user[key] === value) {
        modify = Object.assign(user, dataUpdate);
        return modify;
      }
    });
    await this.db.set(dataStore, listData).write();
    return modify;
  }

  async add(record: any, dataStore: DataStore): Promise<any> {
    const getData = await this.db.get(dataStore).value();
    record.id = uuid.v1();
    getData.push(record);
    await this.db.set(dataStore, getData).write();
    return record;
  }

  async validateUser(payload: JwtPayload, dataStore: DataStore): Promise<UserDto> {
    const user = await this.findOne(payload, dataStore);
    if (!user) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return user;
  }

  private _createToken({ name }: RegisterDto): any {
    const expiresIn = process.env.EXPIRESIN;

    const user: JwtPayload = { name };
    const accessToken = this.jwtService.sign(user);
    return {
      expiresIn,
      accessToken,
    };
  }
}