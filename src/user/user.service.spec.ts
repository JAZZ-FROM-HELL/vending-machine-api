import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { newUser, existingUser } from './user.mock';
import { User } from './user';
import { MethodNotAllowedException } from '@nestjs/common';


describe('User Service', () => {

  let service: UserService;

  beforeAll( async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  beforeEach(async () => {
    await service.clean();
    await service.create(existingUser);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new user', () => {
    expect(service.create(newUser))
      .resolves.toMatchObject(newUser); // could be different in an actual repo persistence
  });

  it('should reject creating an empty username', () => {
    expect(service.create({...newUser, username: ''}))
      .rejects.toThrow(UserService.BAD_USER_CREDENTIALS_ERROR);
  });

  it('should reject creating an empty password', () => {
    expect(service.create({...newUser, password: ''}))
      .rejects.toThrow(UserService.BAD_USER_CREDENTIALS_ERROR);
  });

  it('should reject creating an existing user', () => {
    expect(service.create(existingUser)).rejects
      .toThrow(UserService.ALREADY_EXISTS_ERROR);
  });

  it('should reject updating to an empty username', () => {
    expect(service.update({...existingUser, username: ''}))
      .rejects.toThrow(UserService.BAD_USER_CREDENTIALS_ERROR);
  });

  it('should reject updating to an empty password', () => {
    expect(service.update({...existingUser, password: ''}))
      .rejects.toThrow(UserService.BAD_USER_CREDENTIALS_ERROR);
  });

  it('should reject updating a non-existing user', () => {
    expect(service.update(newUser))
      .rejects.toThrow(UserService.NOT_EXIST_ERROR);
  });

  it('should update an existing user', async () => {
    const updatedUser:User = {...existingUser, password: 'changedyou'};
    await service.update(updatedUser);
    await expect(service.findOne(existingUser.username))
      .resolves.toMatchObject(updatedUser);
  });

  it('should reject deleting a non-existing user', () => {
    expect(service.delete(newUser.username))
      .rejects.toThrow(UserService.NOT_EXIST_ERROR);
  });

  it('should delete an existing user', async () => {
    await service.delete(existingUser.username);
    await expect(service.findOne(existingUser.username))
      .resolves.toBeUndefined();
  });

  it('should not support find all', async() => {
    await expect(service.findAll()).rejects.toThrow(MethodNotAllowedException);
  })

});
