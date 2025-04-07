const { z } = require("zod"); 

const registerSchema = z.object({
    username: z
    .string({ required_error: "Name is required" })
    .trim()
    .min(3, { message: "Name must be of 3 characters" })
    .max(255, { message: "Name must be of less than 255 characters" }),
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .min(10, { message: "Write correct Email" }),
  password: z
    .string({ required_error: "Password is required" })
    .trim()
    .min(4, { message: "Password must be of 4 characters" })
    .max(20, { message: "Password must be of less than 20 characters" })
})

module.exports = registerSchema; 