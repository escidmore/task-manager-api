const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const { userOneId, userOne, setupDatabase } = require('./fixtures/db')

beforeEach(setupDatabase)

test('Should signup a new user', async () => {
    const response = await request(app).post('/users').send({
        name: 'Mei Lee',
        email: 'mei@psychicpi.com',
        password: 'MyPassIsBest!'
    }).expect(201)

    // Assert that the database was changed correctly
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    // Assertions about the response body
    expect(response.body).toMatchObject({
        user: {
            name: 'Mei Lee',
            email: 'mei@psychicpi.com',
        },
        token: user.tokens[0].token
    })
    expect(user.password).not.toBe('MyPassIsBest!')
})

test('Should not allow users to sign up with invalid data', async () => {
    // Test missing name
    await request(app)
        .post('/users')
        .send({
            name: '',
            email: 'lumi@winteriscoming.com',
            password: 'K33pItS3cret!'
        }).expect(400)
    
    // Test missing email
    await request(app)
        .post('/users')
        .send({
            name: 'Lumi Aaltonen',
            email: 'lumi',
            password: 'K33pItS3cret!'
        }).expect(400)

    // Test too-short password
    await request(app)
        .post('/users')
        .send({
            name: 'Lumi Aaltonen',
            email: 'lumi@winteriscoming.com',
            password: 'b'
        }).expect(400)

})

test('Should login existing user', async () => {
    const response = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)

    // Assert that the new token is added to the database
    const user = await User.findById(response.body.user._id)
    expect(response.body.token).toBe(user.tokens[1].token)
})

test('Should not login non-existing user', async () => {
    const response = await request(app).post('/users/login').send({
        email: 'fakeuser@fakedomain.com',
        password: 'fakepassword'
    }).expect(400)
})

test('Should get profile for user', async () => {
    const response = await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should not get profile for unauth user', async () => {
    const response = await request(app)
        .get('/users/me')
        .send()
        .expect(401)
})

test('Should delete account for user', async () => {
    const response = await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    const user = await User.findById(userOneId)
    expect(user).toBeNull()
})

test('Should not delete account for unauth user', async () => {
    const response = await request(app)
    .delete('/users/me')
    .send()
    .expect(401)
})

test('Should upload avatar image', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/osakajo.jpg')
        .expect(200)

    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Should update valid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: 'Annikah Zedlacher'
        })
        .expect(200)
    
    const user = await User.findById(userOneId)
    expect(user.name).toEqual('Annikah Zedlacher')
})

test('Should not update unauth user', async () => {
    await request(app)
        .patch('/users/me')
        .send({
            name: 'Yllka Qosja'
        })
        .expect(401)
})

test('Should not update user with invalid data', async () => {
    // Don't allow invalid user
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: ''
        })
        .expect(400)
    
    // Don't allow invalid email
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            email: 'yllka@'
        })
        .expect(400)

    // Don't allow invalid user
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            password: 'a'
        })
        .expect(400)
})

test('Should not update invalid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            location: 'Vienna'
        })
        .expect(400)
})