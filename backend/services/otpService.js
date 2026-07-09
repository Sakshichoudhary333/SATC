export const sendOTP = async (email) => {
  const normalizedEmail = email.trim().toLowerCase();
  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    throw new Error("User not found");
  }

  const savedOtp = await OTP.findOneAndUpdate(
    { email: normalizedEmail },
    {
      email: normalizedEmail,
      otp,
      createdAt: new Date(),
    },
    {
      upsert: true,
      returnDocument: "after",
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );

  if (!savedOtp?._id) {
    throw new Error("Failed to persist OTP");
  }

  await User.findByIdAndUpdate(user._id, {
    $set: {
      otp,
      otpExpiry,
    },
  });

  await sendEmail(
    normalizedEmail,
    "OTP Verification",
    `Your OTP is ${otp}`
  );

  if (process.env.NODE_ENV !== "production") {
    console.log(`\n🔑 OTP for ${normalizedEmail}: ${otp}\n`);
  }

  return savedOtp;
};