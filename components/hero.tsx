"use client";

import { motion } from "motion/react";
import { PasswordLoginForm } from "@/components/password-login-form";
import { HeroLogo } from "./logo";

type HeroProps = {
  loginErrorMessage?: string;
  nextPath?: string;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

export default function Hero({ loginErrorMessage, nextPath }: HeroProps) {
  return (
    <motion.div
      className="flex flex-col items-center text-center max-w-3xl mx-auto pt-8 gap-12 sm:pt-12 pb-8 px-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <HeroLogo />

      {/* Description */}
      <motion.div className="w-full min-w-96">
        <PasswordLoginForm
          errorMessage={loginErrorMessage}
          nextPath={nextPath}
        />
      </motion.div>
    </motion.div>
  );
}
