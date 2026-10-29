import { useRef, useState } from 'react';
import { FlatList, NativeScrollEvent, NativeSyntheticEvent, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '@/components/Button';
import Dots from '@/components/Dots';
import SlideArt from '@/components/SlideArt';
import { slides, Slide } from '@/constants/onboarding';
import { colors } from '@/constants/theme';

export default function Onboarding() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const list = useRef<FlatList<Slide>>(null);
  const [index, setIndex] = useState(0);
  const last = index === slides.length - 1;

  const goTo = (i: number) => {
    list.current?.scrollToIndex({ index: i, animated: true });
    setIndex(i);
  };

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  const finish = () => router.replace('/login');

  return (
    <View style={[styles.root, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 16 }]}>
      <StatusBar style="dark" />
      <FlatList
        ref={list}
        data={slides}
        keyExtractor={(s) => s.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <SlideArt hero={item.hero} items={item.items} />
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.text}>{item.text}</Text>
          </View>
        )}
      />
      <Dots count={slides.length} active={index} onSelect={goTo} />
      <View style={styles.actions}>
        <Button title={last ? 'Начать' : 'Далее'} onPress={() => (last ? finish() : goTo(index + 1))} />
        <Button title="Пропустить" variant="ghost" onPress={finish} style={last ? styles.hidden : undefined} disabled={last} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.white,
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  title: {
    marginTop: 44,
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    lineHeight: 24,
    color: '#646982',
    textAlign: 'center',
  },
  actions: {
    paddingHorizontal: 24,
    marginTop: 40,
    gap: 8,
  },
  hidden: {
    opacity: 0,
  },
});
