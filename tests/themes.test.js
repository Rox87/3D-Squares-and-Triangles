import test from 'node:test';
import assert from 'node:assert/strict';
import { THEMES, getTheme, getThemeList } from '../src/themes.js';

test('THEMES define as 4 atmosferas visuais com propriedades consistentes', () => {
  const themeKeys = getThemeList();
  assert.strictEqual(themeKeys.length, 4);
  assert.ok(themeKeys.includes('cosmic'));
  assert.ok(themeKeys.includes('solar'));
  assert.ok(themeKeys.includes('matrix'));
  assert.ok(themeKeys.includes('glacial'));

  themeKeys.forEach((key) => {
    const theme = getTheme(key);
    assert.ok(theme.name, `Tema ${key} deve ter um nome legivel`);
    assert.strictEqual(typeof theme.cubeCore, 'number');
    assert.strictEqual(typeof theme.cubeWire, 'number');
    assert.strictEqual(typeof theme.cubeLight, 'number');
    assert.ok(Array.isArray(theme.satellites) && theme.satellites.length >= 3);
  });
});

test('getTheme retorna cosmic como fallback para temas inexistentes', () => {
  const fallback = getTheme('tema_fantasma');
  assert.strictEqual(fallback.name, THEMES.cosmic.name);
});
