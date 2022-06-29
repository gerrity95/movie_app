const User = require('../models/user');
const crypto = require('crypto');
const logger = require('../middlewares/logger');
const Token = require('../models/token');
const helpers = require('../utils/generic_helpers');
const email = require('../middlewares/email');
const email_transporter = email.transporter;
const dotenv = require('dotenv');
dotenv.config();

async function passwordUpdate(req) {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return {status: 400, message: 'invalid link or expired'};

    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });
    if (!token) return {status: 400, message: 'invalid link or expired'};
  } catch (error) {
    logger.error(error);
    throw error;
  }

  return {status: 200, user_id: req.params.userId, token: req.params.token};
}

async function passwordResetBack(req) {
  try {
    const user = await User.findOne({email: req.body.email});
    if (!user) {
      logger.error('Email doesn\'t exist when attempting to reset password..');
      return {message: '?EmailDoesNotExist=True'};
    }
    logger.info('Successfully found user...');
    let token = await Token.findOne({userId: user._id});
    if (!token) {
      logger.info('Creating new token...');
      token = await new Token({
        userId: user._id,
        token: crypto.randomBytes(32).toString('hex'),
      }).save();
    }

    logger.info('Token Created...');
    const resetEmail = helpers.generateResetEmail(user, token);
    await email.send_email(user.email, 'What To Watch - Password reset', resetEmail);
    return {message: '?TokenSent=True'};
  } catch (error) {
    logger.error(error);
    throw error;
  }
}

async function passwordUpdateBack(req) {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return {status: 400, message: 'invalid link or expired'};

    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });
    if (!token) return {status: 400, message: 'invalid link or expired'};

    const isValidPword = helpers.is_valid_password(req.body.reset_password);
    if (isValidPword !== true) {
      logger.info('Password does not meet requirements.');
      return {status: 401, user_id: req.params.userId, token: req.params.token,
        fail_message: isValidPword};
    }

    await user.setPassword(req.body.reset_password, async function(err, user) {
      if (err) {
        logger.error('Error: ' + err.name + 'when attempting to update user password');
        logger.error(err);
        return {status: 500, message: err};
      }
      logger.info('Successfully updated password for: ' + user.email);
      await user.save();
      await token.delete();
    });

    return {status: 200};
  } catch (error) {
    logger.error(error);
    throw error;
  }
}


exports.modules = {
  passwordUpdate,
  passwordResetBack,
  passwordUpdateBack,
};
