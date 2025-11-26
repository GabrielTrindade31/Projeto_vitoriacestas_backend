jest.mock(
  'bcryptjs',
  () => ({
    hashSync: (value) => `hashed:${value}`,
    compare: async (value, hash) => hash === `hashed:${value}`,
    compareSync: (value, hash) => hash === `hashed:${value}`,
  }),
  { virtual: true }
);
