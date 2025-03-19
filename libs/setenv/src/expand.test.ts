import { expand } from './expand.js';

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

  it ('can handle multiple expansions', () => {
    const input = {
      REPLACE: 'with',
      FULL_VALUE: "some ${REPLACE} text replaced ${REPLACE} REPLACE"
    };
    expand(input);
    expect(input).toEqual({
      REPLACE: 'with',
      FULL_VALUE: 'some with text replaced with REPLACE'
    });
  });

  it('handles multiple replacements of varying lengths correctly', () => {
    const input = {
      SHORT: 'x',
      LONG: 'something_much_longer',
      TEST: '${SHORT} middle ${LONG} ${SHORT}'
    };
    expand(input);
    expect(input).toEqual({
      SHORT: 'x',
      LONG: 'something_much_longer',
      TEST: 'x middle something_much_longer x'
    });
  });

  it ('handles nested variables correctly', () => {
    const input = {
      BASE: 'base',
      OUTER: "${INNER} - ${BASE} - ${INNER}",
      INNER: '${BASE}',
    };
    expand(input);
    expect(input).toEqual({
      INNER: 'base',
      OUTER: 'base - base - base',
      BASE: 'base',
    });
  });

  it('can expand directly onto process.env', () => {
    process.env.TEST_VAR = 'test-value';
    process.env.CONFIG_VALUE = '${TEST_VAR}';
    expand(process.env);
    expect(process.env.CONFIG_VALUE).toEqual('test-value');
  });
});