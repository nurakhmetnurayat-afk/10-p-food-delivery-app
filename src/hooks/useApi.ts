import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { api, errorText } from '@/api/client';

type Options = {
  refetchOnFocus?: boolean;
  pollMs?: number;
  skip?: boolean;
};

type State<T> = {
  key: string | null;
  data: T | null;
  error: string | null;
};

export function useApi<T>(path: string | null, { refetchOnFocus = false, pollMs, skip = false }: Options = {}) {
  const key = skip ? null : path;
  const [state, setState] = useState<State<T>>({ key: null, data: null, error: null });
  const [version, setVersion] = useState(0);
  const [reloading, setReloading] = useState(false);

  const fetchInto = useCallback(
    (target: string, silent: boolean) =>
      api
        .get<T>(target)
        .then((data) => setState({ key: target, data, error: null }))
        .catch((e) => {
          if (!silent) setState({ key: target, data: null, error: errorText(e) });
        })
        .finally(() => setReloading(false)),
    [],
  );

  useEffect(() => {
    if (!key) return;
    let active = true;
    api
      .get<T>(key)
      .then((data) => active && setState({ key, data, error: null }))
      .catch((e) => active && setState({ key, data: null, error: errorText(e) }));
    return () => {
      active = false;
    };
  }, [key, version]);

  const reload = useCallback(
    (silent = false) => {
      if (!key) return;
      if (silent) {
        fetchInto(key, true);
        return;
      }
      setReloading(true);
      setVersion((v) => v + 1);
    },
    [key, fetchInto],
  );

  useFocusEffect(
    useCallback(() => {
      if (refetchOnFocus && key) fetchInto(key, true);
    }, [refetchOnFocus, key, fetchInto]),
  );

  useEffect(() => {
    if (!pollMs || !key) return;
    const timer = setInterval(() => fetchInto(key, true), pollMs);
    return () => clearInterval(timer);
  }, [pollMs, key, fetchInto]);

  const current = state.key === key;
  const setData = useCallback((update: (prev: T | null) => T) => {
    setState((s) => ({ ...s, data: update(s.data) }));
  }, []);

  return {
    data: current ? state.data : null,
    setData,
    loading: !!key && (!current || reloading),
    error: current ? state.error : null,
    reload,
  };
}
