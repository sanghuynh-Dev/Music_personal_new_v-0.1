const authService = require('../services/authService');

class AuthController {
    showLogin(req, res) {
        if (req.session.userID) {
            return res.redirect('/');
        }
        res.json({ title: 'Sign In' });
    }

    showRegister(req, res) {
        if (req.session.userID) {
            return res.redirect('/');
        }
        res.render('auth/register', { title: 'Register' });
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;
            const user = await authService.login(email, password);
            
            req.session.userID = user._id;
            req.session.user = {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            };
            res.json({ 
                success: true,
                user: user
            });
        } catch (error) {
            const errField = error.message.includes('Email') ? 'email' : 'password';
            res.json({
                success: false,
                error: { [errField]: error.message }
            });
        }
    }

    async register(req, res) {
        try {
            await authService.register(req.body);
            res.json({ success: true });
        } catch (error) {
            res.json({
                success: false,
                warning: { email: error.message }
            });
        }
    }

    async checkEmail(req, res) {
        try {
            const { email } = req.body;
            const exists = await authService.checkEmailExists(email);
            if (exists) {
                return res.json({
                    success: false,
                    warning: { email: 'This email address has already been registered.' }
                });
            }
            res.json({ success: true });
        } catch (error) {
            res.json({ success: false, error: error.message });
        }
    }

    logout(req, res) {
        req.session.destroy((err) => {
            if (err) {
                console.error('Logout session destroy error:', err);
            }
            // res.redirect('/login');
        });
    }
}

module.exports = new AuthController();
