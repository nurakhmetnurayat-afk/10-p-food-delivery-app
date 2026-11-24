import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { errorText } from '@/api/client';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { Header, Screen } from '@/components/ui';
import { useAuth } from '@/constants/authcontext';
import { colors, radius } from '@/constants/theme';

export default function EditProfile() {
  const insets = useSafeAreaInsets();
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const save = async () => {
    setError('');
    setLoading(true);
    try {
      await updateProfile({ name, phone, bio });
      router.back();
    } catch (e) {
      setError(errorText(e));
    } finally {
      setLoading(false);
    }
  };

  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Screen>
      <Header title="Личные данные" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials || '🙂'}</Text>
          </View>
          <Input label="Полное имя" value={name} onChangeText={setName} placeholder="Иван Иванов" />
          <Input label="Email" value={user?.email ?? ''} editable={false} style={{ color: colors.muted }} />
          <Input label="Телефон" value={phone} onChangeText={setPhone} placeholder="+7 700 000 00 00" keyboardType="phone-pad" />
          <Text style={styles.label}>О СЕБЕ</Text>
          <TextInput
            style={styles.bio}
            value={bio}
            onChangeText={setBio}
            placeholder="Например: люблю фастфуд"
            placeholderTextColor={colors.muted}
            multiline
          />
          {!!error && <Text style={styles.error}>{error}</Text>}
        </ScrollView>
        <View style={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 20 }}>
          <Button title={loading ? 'Сохраняем…' : 'Сохранить'} onPress={save} disabled={loading} />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  avatar: {
    alignSelf: 'center',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#FFC6AE',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 18,
  },
  avatarText: {
    fontSize: 42,
    fontWeight: '800',
    color: colors.primary,
  },
  label: {
    fontSize: 13,
    color: colors.text,
    marginBottom: 8,
  },
  bio: {
    minHeight: 100,
    borderRadius: radius.sm,
    backgroundColor: colors.field,
    padding: 18,
    fontSize: 15,
    color: colors.text,
    textAlignVertical: 'top',
  },
  error: {
    color: colors.error,
    textAlign: 'center',
    marginTop: 12,
  },
});
