import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/components/AuthProvider';
import { login } from '@/api/auth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('错误', '请填写邮箱和密码');
      return;
    }

    setLoading(true);
    try {
      const { user, token } = await login(email, password);
      setUser(user);
      router.replace('/(tabs)/map');
    } catch (error: any) {
      Alert.alert('登录失败', error.message || '请检查邮箱和密码');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    // Google OAuth implementation
    Alert.alert('提示', 'Google 登录功能即将推出');
  };

  const handleAppleLogin = async () => {
    // Apple OAuth implementation
    Alert.alert('提示', 'Apple 登录功能即将推出');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>寻宝记</Text>
        <Text style={styles.subtitle}>探索世界，收集宝藏</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="邮箱"
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="密码"
            placeholderTextColor="#666"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#1a1a2e" />
          ) : (
            <Text style={styles.primaryButtonText}>登录</Text>
          )}
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>或</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={[styles.button, styles.socialButton]}
          onPress={handleGoogleLogin}
        >
          <Text style={styles.socialButtonText}>使用 Google 登录</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.socialButton]}
          onPress={handleAppleLogin}
        >
          <Text style={styles.socialButtonText}>使用 Apple 登录</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => router.push('/register')}
        >
          <Text style={styles.linkText}>
            还没有账号？<Text style={styles.linkTextHighlight}>立即注册</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffd700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
    marginBottom: 48,
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  button: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#ffd700',
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#333',
  },
  dividerText: {
    color: '#666',
    paddingHorizontal: 16,
  },
  socialButton: {
    backgroundColor: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#333',
  },
  socialButtonText: {
    fontSize: 16,
    color: '#fff',
  },
  linkButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  linkText: {
    color: '#888',
    fontSize: 14,
  },
  linkTextHighlight: {
    color: '#ffd700',
    fontWeight: 'bold',
  },
});