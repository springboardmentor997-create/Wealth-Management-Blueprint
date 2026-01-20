import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react';
import GlassButton from '@/components/ui/GlassButton';
import GlassInput from '@/components/ui/GlassInput';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

/* ---------------- SCHEMAS ---------------- */

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z
  .object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login, register: registerUser } = useAuth();

  /* ---------------- FORMS ---------------- */

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  /* ---------------- LOGIN ---------------- */

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    const success = await login(data.email, data.password);

    if (success) {
      toast({
        title: 'Login successful',
        description: 'Welcome back!',
      });
      navigate('/dashboard');
    } else {
      toast({
        title: 'Login failed',
        description: 'Invalid email or password',
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  };

  /* ---------------- REGISTER ---------------- */

  const handleRegister = async (data: RegisterFormData) => {
    setIsLoading(true);

    const success = await registerUser({
      email: data.email,
      password: data.password,
      first_name: data.firstName,
      last_name: data.lastName,
    });

    if (success) {
      toast({
        title: 'Account created',
        description: 'Please sign in to continue',
      });

      registerForm.reset();
      setIsLogin(true); // ✅ go to login tab
    } else {
      toast({
        title: 'Registration failed',
        description: 'Email already exists or invalid data',
        variant: 'destructive',
      });
    }

    setIsLoading(false);
  };

  /* ---------------- UI ---------------- */

  const formVariants = {
    hidden: { opacity: 0, x: isLogin ? -20 : 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: isLogin ? 20 : -20 },
  };

  return (
    <>
      <Helmet>
        <title>{isLogin ? 'Login' : 'Register'} | WealthTracker</title>
      </Helmet>

      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md">
          <Link to="/" className="flex justify-center mb-6">
            <Sparkles />
          </Link>

          <div className="glass-card p-8 rounded-2xl">
            <div className="flex mb-6">
              <button className="flex-1" onClick={() => setIsLogin(true)}>
                Sign In
              </button>
              <button className="flex-1" onClick={() => setIsLogin(false)}>
                Sign Up
              </button>
            </div>

            <AnimatePresence mode="wait">
              {isLogin ? (
                <motion.form
                  key="login"
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  onSubmit={loginForm.handleSubmit(handleLogin)}
                  className="space-y-4"
                >
                  <GlassInput
                    label="Email"
                    {...loginForm.register('email')}
                  />
                  <GlassInput
                    label="Password"
                    type="password"
                    {...loginForm.register('password')}
                  />

                  <GlassButton
                    type="submit"
                    isLoading={isLoading}
                    className="w-full"
                  >
                    Sign In
                  </GlassButton>
                </motion.form>
              ) : (
                <motion.form
                  key="register"
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  onSubmit={registerForm.handleSubmit(handleRegister)}
                  className="space-y-4"
                >
                  <GlassInput
                    label="First Name"
                    {...registerForm.register('firstName')}
                  />
                  <GlassInput
                    label="Last Name"
                    {...registerForm.register('lastName')}
                  />
                  <GlassInput
                    label="Email"
                    {...registerForm.register('email')}
                  />
                  <GlassInput
                    label="Password"
                    type="password"
                    {...registerForm.register('password')}
                  />
                  <GlassInput
                    label="Confirm Password"
                    type="password"
                    {...registerForm.register('confirmPassword')}
                  />

                  <GlassButton
                    type="submit"
                    isLoading={isLoading}
                    className="w-full"
                  >
                    Create Account
                  </GlassButton>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
};

export default Auth;
