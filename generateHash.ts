import bcrypt from 'bcryptjs'
function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

async function main() {
  const passwordToHash = 'admin123'
  try {
    const newHashedPassword = await hashPassword(passwordToHash)
    console.log(`Original password: "${passwordToHash}"`)
    console.log(`New Hashed Password: "${newHashedPassword}"`)
  } catch (error) {
    console.error('Error hashing password:', error)
  }
}

main()
