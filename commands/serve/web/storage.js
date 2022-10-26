const storageFn = (app) => {
  const stored = window.localStorage.getItem('nebula-dev');
  const parsed = stored ? JSON.parse(stored) : {};
  const appid = app?.id;

  const s = {
    save(name, value) {
      parsed[name] = value;
      window.localStorage.setItem('nebula-dev', JSON.stringify(parsed));
    },
    get(name) {
      return parsed[name];
    },
    props(name, v) {
      if (v) {
        s.save(`props:${appid}:${name}`, JSON.stringify(v));
        return undefined;
      }
      const p = s.get(`props:${appid}:${name}`);
      return p ? JSON.parse(p) : {};
    },
  };

  return s;
};

export default storageFn;
