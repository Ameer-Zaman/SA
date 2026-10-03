import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Runs an async loader (that receives an AbortSignal) and tracks data/loading/error.
 * `deps` re-run the loader; `reload()` re-runs it on demand.
 */
export function useFetch(loader, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const tick = useRef(0);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const ctrl = new AbortController();
    const id = ++tick.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    loader(ctrl.signal)
      .then((data) => id === tick.current && setState({ data, loading: false, error: null }))
      .catch((error) => {
        if (error.name === 'AbortError') return;
        if (id === tick.current) setState({ data: null, loading: false, error });
      });
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, version]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);
  return { ...state, reload };
}
