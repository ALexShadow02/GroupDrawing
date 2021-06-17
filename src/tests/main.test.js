const app = require('../../app')
const request = require('supertest')
const {User} = require('../models/User')
user1 = {
    name: 'test31', 
    email: 'test1123@test.com', 
    pass1: 'test12456', 
    pass2: 'test123456'
}
user2 = {
    name: 'test31', 
    email: 'test1123@test.com', 
    pass1: 'test1156', 
    pass2: 'test123456'
}
user3 = {
    name: 'test31', 
    email: 'test1123@test.com', 
    pass1: 'te456', 
    pass2: 'te456'
}
user4 = {
    name: 'test31', 
    email: 'kosmostar9@gmail.com', 
    pass1: 'test123456', 
    pass2: 'test123456'
}
user5 = {
    name: 'yura', 
    email: 'test1123@test.com', 
    pass1: 'test123456', 
    pass2: 'test123456'
}
signUpData = {
    name: 'test31', 
    email: 'test1123@test.com', 
    pass1: 'test123456', 
    pass2: 'test123456'
}
logInData = {
    email: 'test1123@test.com', 
    pass: 'test123456'
}
describe('Sign up with right data', () => {
    afterEach(async () => {
        await User.deleteMany({email:'test1123@test.com'})
    })
    test('Should enter right data', async () => {
      setTimeout(async() => {
        const response = await request(app).post('/register').send(user1)
        expect(response.text).toContain('You are successfully registered and can login')
      }, 5000)
    })
})
describe('Sign up with wrong data', () => {
    test('Password dont match', async () => {
        const response = await request(app).post('/register').send(user2)
        expect(response.text).toContain('Passwords do not match')
    })
    test('Password less than 8', async () => {
        const response = await request(app).post('/register').send(user3)
        expect(response.text).toContain('Password should be at least 8 characters')
    })    
    test('email exists', async () => {
        const response = await request(app).post('/register').send(user4)
        expect(response.text).toContain('Email is already used')
    })
    test('username exists', async () => {
        const response = await request(app).post('/register').send(user5)
        expect(response.text).toContain('Username is already used')
    })   
})
describe('Integration testing', () => {
    afterEach(async () => {
        await User.deleteMany({email:'test1123@test.com'})
    })
    test('Sign up', async () => {
        setTimeout(async () => {
            const response = await request(app).post('/register').send(signUpData)
            expect(response.text).toMatch(/You are successfully registered and can login/)
        }, 5000)
    })
    test('Log in', async () => {
        const response = await request(app).post('/login').send(logInData)
        expect(response.status).toBe(302)
    })
    test('Creation of a new room', async () => {
        const response = await request(app).get('/d/c')
        expect(response.status).toBe(200)
    })
    test('Log out', async () => {
        const response = await request(app).get('/logout')
        expect(response.status).toBe(302)
    })
})


