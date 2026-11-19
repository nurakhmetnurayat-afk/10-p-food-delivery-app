import { useState } from 'react';
import { router } from 'expo-router';
import AuthLayout from '@/components/AuthLayout';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { emailError, passwordError } from '@/constants/validation';

type Errors = Partial<Record<'name' | 'email' | 'password' | 'repeat', string>>;

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeat, setRepeat] = useState('');
  const [errors, setErrors] = useState<Errors>({});

  const submit = () => {
    const next: Errors = {
      name: name.trim() ? undefined : 'Введите имя',
      email: emailError(email),
      password: passwordError(password),
      repeat: repeat === password ? undefined : 'Пароли не совпадают',
    };
    setErrors(next);
    if (Object.values(next).every((e) => !e)) {
      router.push({ pathname: '/verification', params: { email: email.trim() } });
    }
  };

  return (
    <AuthLayout title="Регистрация" subtitle="Создайте аккаунт, чтобы начать">
      <Input label="Имя" placeholder="Иван Иванов" value={name} onChangeText={setName} error={errors.name} />
      <Input
        label="Email"
        placeholder="example@gmail.com"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        error={errors.email}
      />
      <Input label="Пароль" placeholder="••••••••" password value={password} onChangeText={setPassword} error={errors.password} />
      <Input
        label="Повторите пароль"
        placeholder="••••••••"
        password
        value={repeat}
        onChangeText={setRepeat}
        error={errors.repeat}
      />
      <Button title="Зарегистрироваться" onPress={submit} style={{ marginTop: 10 }} />
    </AuthLayout>
  );
}
