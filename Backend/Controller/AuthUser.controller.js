import UserModel from "../Model/User.model.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
 const CreateUser = async (req, res) => {
    try{
        const { name, email, password } = req.body;

        // Check if user already exists
        const userExists = await UserModel.findOne({ email });
        if(userExists){
            return res.status(400).json({ message: 'User already exists' });
        }
     
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("Hashed Password: " ,hashedPassword);
        const newUser =  new UserModel({
            name: name,
            email: email,
            password: hashedPassword
        });
        await newUser.save();

        console.log(newUser)
        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.session('token', token, { httpOnly: true, secure: true });
        res.status(201).json({
            data: newUser,
            token: token,
            message: "User created"
        })
    }
    catch(error){
        console.error(error);
        res.status(500).json({ message: 'Server error in createUser' });
    }
 }


 const LoginUser = async (req,res) => {
    try {
        const { email, password } = req.body;

        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const hashedPassword = user.password;
        const isValidPassword = await bcrypt.compare(password, hashedPassword);

        if (!isValidPassword) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(200).json({
            message: "User logged in",
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error in loginUser' });
    }
 }
 export  {CreateUser, LoginUser}