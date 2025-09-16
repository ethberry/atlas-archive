import React from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import { motion } from "framer-motion";

import Input from "../Form/Input";
import Button from "../Form/Button";

interface IProps {
  useFormInstance: UseFormReturn<IEmailSubscription>;
  submitEmailForm: (formData: IEmailSubscription) => void;
}

export interface IEmailSubscription {
  email: string;
}

const EmailForm: React.FC<IProps> = ({ useFormInstance, submitEmailForm }) => {
  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useFormInstance;

  return (
    <form
      className="font-mont space-y-[16px] text-center w-full"
      onSubmit={handleSubmit(submitEmailForm)}
    >
      <div className="relative group">
        <Controller
          name="email"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Input
              value={value}
              onChange={onChange}
              maxLength={40}
              placeholder="E-mail *"
              className="w-full bg-white/10 backdrop-blur-sm border-2 border-yellow-400/50 focus:border-yellow-400 transition-all duration-300 text-white placeholder-gray-300"
              wrapperClassName="text-center"
              error={Boolean(errors.email?.message)}
              helperText={errors.email?.message}
            />
          )}
        />
        {/* Animated border glow */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-yellow-400/20 via-pink-400/20 to-yellow-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm -z-10"></div>
      </div>

      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative"
      >
        <Button
          className="w-full text-white bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 border-2 border-yellow-400/50 shadow-lg hover:shadow-yellow-400/25 transition-all duration-300 font-bold text-lg py-3 px-8"
          type="submit"
        >
          <motion.span
            animate={{
              textShadow: [
                "0 0 5px rgba(255,255,255,0.5)",
                "0 0 15px rgba(255,255,255,0.8)",
                "0 0 5px rgba(255,255,255,0.5)",
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            Get early access and a gift
          </motion.span>
        </Button>
        {/* Button glow effect */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-yellow-400/30 via-pink-400/30 to-yellow-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md -z-10"></div>
      </motion.div>
    </form>
  );
};

export default EmailForm;
