import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../../models/User.model';
import { registerSchema, loginSchema, updateUserSchema } from '../validators/user.validator';

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: '30d',
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/users/register
 * @access  Public
 */
export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { fullName, email, password, phone } = value;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }
    
    const user = new User({
      fullName,
      email,
      passwordHash: password, 
      phone
    });

    const savedUser = await user.save();

    res.status(201).json({
      _id: savedUser._id,
      fullName: savedUser.fullName,
      email: savedUser.email,
      token: generateToken(savedUser._id.toString()),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/users/login
 * @access  Public
 */
export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password } = value;
    const user = await User.findOne({ email });

    if (user && (await user.isPasswordMatch(password))) {
      res.json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        token: generateToken(user._id.toString()),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    next(error);
  }
};

export interface IAuthRequest extends Request {
  user?: IUser; // Add the user property
}

/**
 * @desc    Get user profile
 * @route   GET /api/users/me
 * @access  Private
 */
export const getUserProfile = async (req: IAuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    if (user) {
      res.json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    next(error);
  }
};


/**
 * @desc    Update user profile
 * @route   PUT /api/users/me
 * @access  Private
 */
export const updateUserProfile = async (req: IAuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { error, value } = updateUserSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    user.fullName = value.fullName || user.fullName;
    user.phone = value.phone !== undefined ? value.phone : user.phone;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      phone: updatedUser.phone,
    });
  } catch (error) {
    next(error);
  }
};