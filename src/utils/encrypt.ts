import * as bcrypt from 'bcrypt';
export const encryptPassword = (password: string): string => {
  try {
    return bcrypt.hashSync(password, 10);
  } catch {
    throw new Error('Error encrypting password');
  }
};

export const comparePassword = (
  plainPassword: string,
  hashedPassword: string,
): boolean => {
  try {
    return bcrypt.compareSync(plainPassword, hashedPassword);
  } catch (error) {
    console.log(error);
    throw new Error('Error comparing passwords');
  }
};
