const app = require("../../app");
const request = require("supertest")
const {User} = require("../models/User");

user1={name: "test31", email: "test1123@test.com", pass1: "test123456", pass2: "test123456"}
user2={name: "test31", email: "test1123@test.com", pass1: "test1156", pass2: "test123456"}
user3={name: "test31", email: "test1123@test.com", pass1: "te456", pass2: "te456"}
user4={name: "test31", email: "kosmostar9@gmail.com", pass1: "test123456", pass2: "test123456"}
user5={name: "yura", email: "test1123@test.com", pass1: "test123456", pass2: "test123456"}




describe('sign up with right data',()=>{
    afterEach(async ()=>{
        await User.deleteMany({email:"test1123@test.com"})
    })

    test("Should enter right data", async () => {
    const responce = await request(app).post('/register')
    .send(user1)
    expect(responce.status).toBe(205)
    })
})

describe('sign up with wrong data', ()=>{
    test("Password dont match", async () => {
        const responce = await request(app).post('/register')
        .send(user2)
        expect(responce.text).toContain("Passwords do not match")
    })

    test("Password less then 8", async () => {
        const responce = await request(app).post('/register')
        .send(user3)
        expect(responce.text).toContain("Password should be at least 8 characters")
    })    
    test("email exist", async () => {
        const responce = await request(app).post('/register')
        .send(user4)
        expect(responce.text).toContain("Email is already used")
    })
    test("username exist", async () => {
        const responce = await request(app).post('/register')
        .send(user5)
        expect(responce.text).toContain("Username is already used")
    })        

})