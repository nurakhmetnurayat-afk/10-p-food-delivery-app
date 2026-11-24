import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import type { Category, Ingredient } from '@/api/types';
import { api, errorText } from '@/api/client';
import Button from '@/components/Button';
import ChefTabBar from '@/components/ChefTabBar';
import Input from '@/components/Input';
import { FoodImage, Screen } from '@/components/ui';
import { colors, radius } from '@/constants/theme';
import { useApi } from '@/hooks/useApi';
import { notify } from '@/utils/dialog';

const EMOJIS = ['🍔', '🍕', '🍣', '🍜', '🌯', '🍗', '🥗', '🍰', '🥞', '🥤', '☕', '🍚'];
const INGREDIENTS: Ingredient[] = [
  { emoji: '🧂', name: 'Соль' },
  { emoji: '🍗', name: 'Курица' },
  { emoji: '🥩', name: 'Говядина' },
  { emoji: '🧅', name: 'Лук' },
  { emoji: '🧄', name: 'Чеснок' },
  { emoji: '🌶️', name: 'Перец' },
  { emoji: '🧀', name: 'Сыр' },
  { emoji: '🍅', name: 'Томат' },
  { emoji: '🥬', name: 'Салат' },
  { emoji: '🍄', name: 'Грибы' },
  { emoji: '🍋', name: 'Лимон' },
  { emoji: '🍓', name: 'Ягоды' },
];

export default function AddDish() {
  const categories = useApi<Category[]>('/categories');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [emoji, setEmoji] = useState('🍔');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [picked, setPicked] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setName('');
    setPrice('');
    setCategory('');
    setImage('');
    setDescription('');
    setPicked([]);
  };

  const toggle = (n: string) => setPicked((p) => (p.includes(n) ? p.filter((x) => x !== n) : [...p, n]));

  const save = async () => {
    setError('');
    setLoading(true);
    try {
      await api.post('/chef/dishes', {
        name,
        price: Number(price.replace(/\D/g, '')),
        category,
        emoji,
        image,
        description,
        ingredients: INGREDIENTS.filter((i) => picked.includes(i.name)),
      });
      notify('Готово', `«${name}» уже в меню — клиенты видят его`);
      reset();
      router.replace('/chef/menu');
    } catch (e) {
      setError(errorText(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Новое блюдо</Text>
        <Pressable onPress={reset} hitSlop={8}>
          <Text style={styles.reset}>СБРОСИТЬ</Text>
        </Pressable>
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Input label="Название" value={name} onChangeText={setName} placeholder="Например, Бешбармак" />

          <Text style={styles.label}>ФОТО И ИКОНКА</Text>
          <View style={styles.photoRow}>
            <FoodImage uri={/^https?:\/\//.test(image) ? image : null} emoji={emoji} style={styles.preview} emojiSize={44} />
            <View style={styles.emojis}>
              {EMOJIS.map((e) => (
                <Pressable key={e} style={[styles.emoji, emoji === e && styles.emojiActive]} onPress={() => setEmoji(e)}>
                  <Text style={{ fontSize: 20 }}>{e}</Text>
                </Pressable>
              ))}
            </View>
          </View>
          <Input label="Ссылка на фото (необязательно)" value={image} onChangeText={setImage} placeholder="https://…" autoCapitalize="none" />

          <Input label="Цена, ₸" value={price} onChangeText={(v) => setPrice(v.replace(/\D/g, ''))} placeholder="2500" keyboardType="number-pad" />

          <Text style={styles.label}>КАТЕГОРИЯ</Text>
          <View style={styles.wrap}>
            {categories.data?.map((c) => (
              <Pressable key={c.id} style={[styles.chip, category === c.id && styles.chipActive]} onPress={() => setCategory(c.id)}>
                <Text style={[styles.chipText, category === c.id && { color: colors.white, fontWeight: '700' }]}>
                  {c.emoji} {c.name}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.label, { marginTop: 22 }]}>СОСТАВ</Text>
          <View style={styles.wrap}>
            {INGREDIENTS.map((i) => (
              <Pressable key={i.name} style={styles.ingredient} onPress={() => toggle(i.name)}>
                <View style={[styles.ingredientCircle, picked.includes(i.name) && styles.ingredientActive]}>
                  <Text style={{ fontSize: 20 }}>{i.emoji}</Text>
                </View>
                <Text style={styles.ingredientName}>{i.name}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.label, { marginTop: 22 }]}>ОПИСАНИЕ</Text>
          <TextInput
            style={styles.textarea}
            value={description}
            onChangeText={setDescription}
            placeholder="Пара слов о блюде"
            placeholderTextColor={colors.muted}
            multiline
          />
          {!!error && <Text style={styles.error}>{error}</Text>}
          <Button title={loading ? 'Сохраняем…' : 'Сохранить блюдо'} onPress={save} disabled={loading} style={{ marginTop: 22 }} />
        </ScrollView>
      </KeyboardAvoidingView>
      <ChefTabBar />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.dark,
  },
  reset: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 30,
  },
  label: {
    fontSize: 13,
    color: colors.text,
    marginBottom: 10,
  },
  photoRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 18,
  },
  preview: {
    width: 100,
    height: 100,
    borderRadius: 20,
  },
  emojis: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  emoji: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.field,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiActive: {
    backgroundColor: colors.primarySoft,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    borderRadius: 20,
    backgroundColor: colors.field,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  chipActive: {
    backgroundColor: colors.primary,
  },
  chipText: {
    fontSize: 13,
    color: colors.dark,
  },
  ingredient: {
    width: 56,
    alignItems: 'center',
  },
  ingredientCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F5FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ingredientActive: {
    backgroundColor: '#FFEBE4',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  ingredientName: {
    marginTop: 4,
    fontSize: 11,
    color: colors.muted,
  },
  textarea: {
    minHeight: 100,
    borderRadius: radius.sm,
    backgroundColor: colors.field,
    padding: 16,
    fontSize: 14,
    color: colors.dark,
    textAlignVertical: 'top',
  },
  error: {
    color: colors.error,
    textAlign: 'center',
    marginTop: 14,
  },
});
