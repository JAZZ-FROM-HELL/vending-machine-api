import * as request from 'supertest';
import {Test} from '@nestjs/testing';
import {HttpStatus, INestApplication} from '@nestjs/common';
import {AppModule} from './../src/app.module';
import {UserService} from '../src/user/user.service';
import {newUser, existingUser} from '../src/user/user.mock';
import {User} from '../src/user/user';


describe('Users', () => {
  let app: INestApplication;
  let userRepo: UserService;

  let getRequest;
  let postRequest;
  let putRequest;
  let deleteRequest;

  beforeAll(async () => {
     const moduleRef = await Test.createTestingModule({
         imports: [AppModule],
     }).compile();

     app = moduleRef.createNestApplication();
     userRepo = moduleRef.get<UserService>(UserService);

     await app.init();

     getRequest = (user:User) => {
       return request(app.getHttpServer())
         .get('/user/' + user.username)
     };

     postRequest = request(app.getHttpServer())
         .post('/user')
         .set('Content-Type', 'application/json')
         .set('Accept', 'application/json');

     putRequest = (user:User) => {
        return request(app.getHttpServer())
          .put('/user/' + user.username)
          .set('Content-Type', 'application/json');
     };

     deleteRequest = (user:User) => {
       return request(app.getHttpServer())
         .delete('/user/' + user.username);
     }

  });

  // init repository
  beforeEach(async () => {
      await userRepo.clean().then(() => userRepo.create(existingUser));
  });


  // GET

  it('GET /user', () => {
    return getRequest(existingUser)
      .expect(HttpStatus.OK)
      .expect(existingUser);
  });

  it('GET /user not exists', () => {
    return getRequest(newUser)
      .expect(HttpStatus.NOT_FOUND);
  });


  // POST - doesn't require authentication

  it('POST /user', () => {
    return postRequest
      .send(newUser)
      .expect(HttpStatus.CREATED)
      .expect(newUser);
  });

  it('POST /user already exists', () => {
    return postRequest
      .send(existingUser)
      .expect(HttpStatus.CONFLICT);
  });

  it('POST /user empty username', () => {
    return postRequest
      .send({...existingUser, username: '' })
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('POST /user empty password', () => {
    return postRequest
      .send({...existingUser, password: '' })
      .expect(HttpStatus.BAD_REQUEST);
  });


  // PUT

  it('PUT /user', () => {
    const updateUser:User = { ...existingUser,
      password: 'changeme',
      deposit: { ...existingUser.deposit, cent10: 20 } };
    return putRequest(existingUser)
      .send(updateUser)
      .expect(HttpStatus.OK);
  });

  it('PUT /user not authorized (wrong password)', () => {
    const updateUser:User = {...existingUser, password: 'wrong' };
    return putRequest(updateUser)
      .send(updateUser)
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('PUT /user not authorized (not owner)', async () => {
    const updateUser:User = {...existingUser, username: 'notOwner'};
    await userRepo.create(updateUser); // to make sure that it is found but unauthorized
    return putRequest(existingUser)
      .send(updateUser)
      .expect(HttpStatus.FORBIDDEN);
  });

  it('/DELETE user', () => {
    return deleteRequest(existingUser)
      .send(existingUser)
      .expect(HttpStatus.NO_CONTENT);
  });

  it('DELETE /user not authorized (wrong password)', () => {
    const deleteUser = {...existingUser, password: 'wrong'};
    return deleteRequest(deleteUser)
      .send(deleteUser)
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('DELETE /user not authorized (not owner)', async () => {
    await userRepo.create({...existingUser, username: 'notOwner'}); // to make sure that it is found but unauthorized
    return deleteRequest(existingUser, 'notOwner')
      .expect(HttpStatus.UNAUTHORIZED);
  });


  // after

  afterAll(async () => {
      await app.close();
  });

});
