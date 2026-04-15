import { parseTime } from './common';

describe('parseTime', () => {
  describe('valid inputs', () => {
    it('parses midnight', () => {
      expect(parseTime('00:00')).toEqual({ hour: 0, minute: 0 });
    });

    it('parses noon', () => {
      expect(parseTime('12:00')).toEqual({ hour: 12, minute: 0 });
    });

    it('parses end of day', () => {
      expect(parseTime('23:59')).toEqual({ hour: 23, minute: 59 });
    });

    it('parses single digit hour', () => {
      expect(parseTime('9:05')).toEqual({ hour: 9, minute: 5 });
    });

    it('parses double digit hours and minutes', () => {
      expect(parseTime('14:30')).toEqual({ hour: 14, minute: 30 });
    });

    it('parses times with leading zeros', () => {
      expect(parseTime('08:09')).toEqual({ hour: 8, minute: 9 });
    });
  });

  describe('invalid format', () => {
    it('throws on missing colon', () => {
      expect(() => parseTime('1234')).toThrow('Invalid time format: 1234');
    });

    it('throws on too many parts', () => {
      expect(() => parseTime('12:34:56')).toThrow('Invalid time format: 12:34:56');
    });

    it('throws on empty string', () => {
      expect(() => parseTime('')).toThrow('Invalid time format: ');
    });

    it('throws on single part', () => {
      expect(() => parseTime('12')).toThrow('Invalid time format: 12');
    });

    it('throws on single digit minute', () => {
      expect(() => parseTime('09:5')).toThrow('Invalid time format: 09:5');
    });

    it('throws on three digit hour', () => {
      expect(() => parseTime('123:30')).toThrow('Invalid time format: 123:30');
    });

    it('throws on three digit minute', () => {
      expect(() => parseTime('12:300')).toThrow('Invalid time format: 12:300');
    });
  });

  describe('invalid values', () => {
    it('throws on non-numeric hour', () => {
      expect(() => parseTime('ab:30')).toThrow('Invalid time format: ab:30');
    });

    it('throws on non-numeric minute', () => {
      expect(() => parseTime('12:xy')).toThrow('Invalid time format: 12:xy');
    });

    it('throws on hour too high', () => {
      expect(() => parseTime('24:00')).toThrow('Invalid time values: 24:00');
    });

    it('throws on minute too high', () => {
      expect(() => parseTime('12:60')).toThrow('Invalid time values: 12:60');
    });

    it('throws on negative hour', () => {
      expect(() => parseTime('-1:00')).toThrow('Invalid time format: -1:00');
    });

    it('throws on negative minute', () => {
      expect(() => parseTime('12:-1')).toThrow('Invalid time format: 12:-1');
    });

    it('throws on decimal values', () => {
      expect(() => parseTime('12.5:30')).toThrow('Invalid time format: 12.5:30');
    });
  });

  describe('edge cases', () => {
    it('should reject hour with trailing non-numeric characters', () => {
      expect(() => parseTime('1a:30')).toThrow('Invalid time format: 1a:30');
    });

    it('should reject minute with trailing non-numeric characters', () => {
      expect(() => parseTime('12:3x')).toThrow('Invalid time format: 12:3x');
    });

    it('should reject whitespace-padded values', () => {
      expect(() => parseTime(' 12:30 ')).toThrow('Invalid time format:  12:30 ');
    });

    it('should reject empty hour', () => {
      expect(() => parseTime(':30')).toThrow('Invalid time format: :30');
    });

    it('should reject empty minute', () => {
      expect(() => parseTime('12:')).toThrow('Invalid time format: 12:');
    });
  });
});
