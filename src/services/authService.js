const User = require('../models/User');

class AuthService {
    async register(userData) {
        const { username, email, password } = userData;

        if (!email.endsWith('@gmail.com')) {
            throw new Error('Please enter a valid Gmail address.');
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new Error('This email address has already been registered.');
        }

        const user = new User({
            username,
            email,
            password, // Storing plaintext as in the reference codebase, or we can use hashing, but let's stick to original behavior.
            role: 'user' // default role is user
        });

        return await user.save();
    }

    async login(email, password) {
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('Email does not exist!');
        }

        if (user.password !== password) {
            throw new Error('Password is not correct!');
        }

        if (user.status === 'banned') {
            throw new Error('This account has been banned by the administrator.');
        }

        return user;
    }

    async checkEmailExists(email) {
        const user = await User.findOne({ email });
        return !!user;
    }
}

module.exports = new AuthService();
