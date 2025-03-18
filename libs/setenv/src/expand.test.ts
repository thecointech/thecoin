import { expand } from './expand';

describe('expand', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should not modify values without variables', () => {
    const input = {
      KEY1: 'value1',
      KEY2: 'value2'
    };
    expand(input);
    expect(input).toEqual({
      KEY1: 'value1',
      KEY2: 'value2'
    });
  });

  it('should expand variables from within the parsed object', () => {
    const input = {
      BASE_URL: 'https://api.example.com',
      API_ENDPOINT: '${BASE_URL}/v1'
    };
    expand(input);
    expect(input).toEqual({
      BASE_URL: 'https://api.example.com',
      API_ENDPOINT: 'https://api.example.com/v1'
    });
  });

  it('should expand variables from process.env', () => {
    process.env.TEST_VAR = 'test-value';
    const input = {
      CONFIG_VALUE: '${TEST_VAR}'
    };
    expand(input);
    expect(input).toEqual({
      CONFIG_VALUE: 'test-value'
    });
  });

  it('should prefer values from parsed object over process.env', () => {
    process.env.PRIORITY = 'env-value';
    const input = {
      PRIORITY: 'parsed-value',
      REFERENCE: '${PRIORITY}'
    };
    expand(input);
    expect(input).toEqual({
      PRIORITY: 'parsed-value',
      REFERENCE: 'parsed-value'
    });
  });

  it('should leave unexpanded variables unchanged', () => {
    const input = {
      UNDEFINED_VAR: '${DOES_NOT_EXIST}'
    };
    expand(input);
    expect(input).toEqual({
      UNDEFINED_VAR: '${DOES_NOT_EXIST}'
    });
  });

  it('should handle partial expansions', () => {
    const input = {
      PREFIX: 'pre-',
      FULL_VALUE: '${PREFIX}suffix'
    };
    expand(input);
    expect(input).toEqual({
      PREFIX: 'pre-',
      FULL_VALUE: 'pre-suffix'
    });
  });

  it('can expand directly onto process.env', () => {
    process.env.TEST_VAR = 'test-value';
    process.env.CONFIG_VALUE = '${TEST_VAR}';
    expand(process.env);
    expect(process.env.CONFIG_VALUE).toEqual('test-value');
  });
});