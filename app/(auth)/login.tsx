import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Platform, KeyboardAvoidingView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '@/stores/authStore';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const router = useRouter();
  const { login, error: authError, clearError } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    clearError();

    try {
      await login({ ...data, rememberMe: false });
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Login Failed', authError || 'Please check your credentials and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      {isSubmitting && <LoadingOverlay message="Signing in..." />}

      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 px-8 justify-center"
        >
          <Animated.View
            entering={FadeInUp.delay(200).duration(1000).springify()}
            className="items-center mb-12"
          >
            <View className="w-20 h-20 bg-blue-600 rounded-2xl items-center justify-center mb-6 shadow-lg shadow-blue-200">
              <Ionicons name="home" size={40} color="white" />
            </View>
            <Text className="text-4xl font-extrabold text-gray-900 tracking-tight">Knocker</Text>
            <Text className="text-gray-500 mt-2 text-lg">Door-to-Door Intelligence</Text>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(400).duration(1000).springify()}
            className="space-y-6"
          >
            {/* Username Input */}
            <View>
              <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">Username</Text>
              <Controller
                control={control}
                name="username"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View
                    className={`flex-row items-center border rounded-xl px-4 py-3.5 bg-gray-50 ${focusedInput === 'username' ? 'border-blue-500 bg-blue-50/10' : 'border-gray-200'
                      }`}
                  >
                    <Ionicons
                      name="person-outline"
                      size={20}
                      color={focusedInput === 'username' ? '#3B82F6' : '#9CA3AF'}
                      style={{ marginRight: 10 }}
                    />
                    <TextInput
                      className="flex-1 text-base text-gray-900"
                      placeholder="Enter your username"
                      placeholderTextColor="#9CA3AF"
                      value={value}
                      onChangeText={onChange}
                      onBlur={() => {
                        onBlur();
                        setFocusedInput(null);
                      }}
                      onFocus={() => setFocusedInput('username')}
                      autoCapitalize="none"
                      autoCorrect={false}
                      returnKeyType="next"
                    />
                  </View>
                )}
              />
              {errors.username && (
                <Text className="text-red-500 text-xs mt-1 ml-1">{errors.username.message}</Text>
              )}
            </View>

            {/* Password Input */}
            <View>
              <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">Password</Text>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View
                    className={`flex-row items-center border rounded-xl px-4 py-3.5 bg-gray-50 ${focusedInput === 'password' ? 'border-blue-500 bg-blue-50/10' : 'border-gray-200'
                      }`}
                  >
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color={focusedInput === 'password' ? '#3B82F6' : '#9CA3AF'}
                      style={{ marginRight: 10 }}
                    />
                    <TextInput
                      className="flex-1 text-base text-gray-900"
                      placeholder="Enter your password"
                      placeholderTextColor="#9CA3AF"
                      value={value}
                      onChangeText={onChange}
                      onBlur={() => {
                        onBlur();
                        setFocusedInput(null);
                      }}
                      onFocus={() => setFocusedInput('password')}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      returnKeyType="go"
                      onSubmitEditing={handleSubmit(onSubmit)}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                      <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color="#6B7280"
                      />
                    </TouchableOpacity>
                  </View>
                )}
              />
              {errors.password && (
                <Text className="text-red-500 text-xs mt-1 ml-1">{errors.password.message}</Text>
              )}
            </View>

            <TouchableOpacity className="self-end">
              <Text className="text-blue-600 font-medium text-sm">Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              className="bg-blue-600 rounded-xl py-4 items-center shadow-lg shadow-blue-200 mt-4 active:bg-blue-700"
              onPress={handleSubmit(onSubmit)}
              activeOpacity={0.9}
            >
              <Text className="text-white text-lg font-bold">Sign In</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Footer */}
          <Animated.View
            entering={FadeInDown.delay(600).duration(1000)}
            className="mt-12 flex-row justify-center"
          >
            <Text className="text-gray-500">Don't have an account? </Text>
            <TouchableOpacity>
              <Text className="text-blue-600 font-bold">Sign up</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Dev Info */}
          {__DEV__ && (
            <View className="absolute bottom-10 left-0 right-0 items-center opacity-30">
              <Text className="text-[10px] text-gray-400">DEV MODE</Text>
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
