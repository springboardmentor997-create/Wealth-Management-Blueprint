import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Save } from 'lucide-react';

import DashboardLayout from '@/components/layout/DashboardLayout';
import GlassButton from '@/components/ui/GlassButton';
import GlassInput from '@/components/ui/GlassInput';
import { useAuth } from '@/contexts/AuthContext';
import { usersApi } from '@/services/api';
import { staggerContainer, staggerItem } from '@/components/layout/PageTransition';

const Profile = () => {
  const { user } = useAuth();

  const [loadingProfile, setLoadingProfile] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  /* ================================
     LOAD PROFILE
  ================================ */
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await usersApi.getProfile();

        if (res.data) {
          setFormData({
            name: res.data.name || '',
            email: res.data.email || '',
            phone: '',
          });
        }
      } catch (error) {
        console.error('Failed to load profile', error);
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, []);

  /* ================================
     SAVE PROFILE
  ================================ */
  const handleSave = async () => {
    setLoadingProfile(true);

    try {
      await usersApi.updateProfile({
        name: formData.name,
        email: formData.email,
      });
    } catch (error) {
      console.error('Failed to save profile', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  /* ================================
     UI STATES
  ================================ */
  if (loadingProfile) {
    return (
      <DashboardLayout>
        <p className="text-center mt-10 text-muted-foreground">
          Loading profile...
        </p>
      </DashboardLayout>
    );
  }

  const nameParts = formData.name.split(' ');

  return (
    <DashboardLayout>
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="space-y-6"
      >
        {/* Header */}
        <motion.div variants={staggerItem}>
          <h1 className="text-2xl lg:text-3xl font-bold">
            Profile Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your account settings
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <motion.div className="glass-card p-4">
            <div className="flex flex-col items-center mb-6">
              <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-2xl text-white">
                {nameParts[0]?.[0] || ''}
                {nameParts[1]?.[0] || ''}
              </div>

              <h3 className="mt-3 font-semibold text-foreground">
                {formData.name}
              </h3>

              <p className="text-sm text-muted-foreground">
                {formData.email}
              </p>
            </div>

            <nav className="space-y-1">
              <div className="sidebar-link active justify-center">
                <span className="font-medium">PROFILE</span>
              </div>
            </nav>
          </motion.div>

          {/* Content */}
          <motion.div
            className="lg:col-span-3 glass-card p-6 space-y-6"
          >
            <GlassInput
              label="Full Name"
              value={formData.name}
              onChange={(e) =>
                setFormData((p) => ({
                  ...p,
                  name: e.target.value,
                }))
              }
              leftIcon={<User className="w-4 h-4" />}
            />

            <GlassInput
              label="Email"
              value={formData.email}
              onChange={(e) =>
                setFormData((p) => ({
                  ...p,
                  email: e.target.value,
                }))
              }
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <GlassButton
              onClick={handleSave}
              isLoading={loadingProfile}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Changes
            </GlassButton>
          </motion.div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Profile;
