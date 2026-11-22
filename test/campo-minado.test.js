import test from 'node:test';
import assert from 'node:assert/strict';
import { CampoMinado } from '../src/campo-minado.js';

const bombas = Array.from({ length: 40 }, (_, n) => [Math.floor(n / 14), n % 14]);
const novo = () => new CampoMinado(bombas);

test('CT01 - tabuleiro 18x14, 40 bombas e nenhuma casa aberta', () => {
  assert.deepEqual(novo().estado, { linhas: 18, colunas: 14, bombas: 40, abertas: 0, bandeiras: 0, status: 'jogando' });
});
test('CT02 - revela bomba e encerra com derrota', () => {
  const jogo = novo();
  jogo.revelar(0, 0);
  assert.equal(jogo.consultar(0, 0).valor, '*');
  assert.equal(jogo.estado.status, 'derrota');
  assert.throws(() => jogo.revelar(17, 13));
  assert.throws(() => jogo.alternarBandeira(17, 13));
});
test('CT03 - conta bombas adjacentes inclusive na borda', () => {
  const jogo = novo();
  jogo.revelar(2, 13);
  // Nesta borda, somente (1,12) e (1,13) contem bombas adjacentes.
  assert.equal(jogo.consultar(2, 13).valor, 2);
});
test('CT04 - expansao de casa vazia revela area e alcanca vitoria', () => {
  const jogo = novo();
  jogo.revelar(17, 13);
  assert.equal(jogo.estado.status, 'vitoria');
  assert.equal(jogo.estado.abertas, 212);
  assert.equal(jogo.consultar(17, 13).valor, 0);
  assert.throws(() => jogo.revelar(0, 0));
});
test('CT05 - bandeira bloqueia revelacao e pode ser removida', () => {
  const jogo = novo();
  jogo.alternarBandeira(2, 13);
  assert.equal(jogo.consultar(2, 13).bandeira, true);
  assert.throws(() => jogo.revelar(2, 13));
  jogo.alternarBandeira(2, 13);
  jogo.revelar(2, 13);
  assert.equal(jogo.consultar(2, 13).aberta, true);
  assert.throws(() => jogo.alternarBandeira(2, 13));
});
test('CT06 - revelar a mesma casa nao duplica a contagem', () => {
  const jogo = novo();
  jogo.revelar(2, 13);
  jogo.revelar(2, 13);
  assert.equal(jogo.estado.abertas, 1);
});
test('CT07 - rejeita coordenadas fora dos limites e fracionarias', () => {
  for (const [l, c] of [[-1, 0], [18, 0], [0, 14], [0, -1], [1.5, 0]]) {
    assert.throws(() => novo().revelar(l, c), RangeError);
    assert.throws(() => novo().consultar(l, c), RangeError);
  }
});
test('CT08 - rejeita quantidade incorreta, duplicadas e posicoes invalidas', () => {
  assert.throws(() => new CampoMinado([]), RangeError);
  assert.throws(() => new CampoMinado(Array(40).fill([0, 0])), RangeError);
  assert.throws(() => new CampoMinado([...bombas.slice(1), [18, 0]]), RangeError);
});
test('CT09 - permite 40 bandeiras e impede a quadragesima primeira', () => {
  const jogo = novo();
  bombas.forEach(([l, c]) => jogo.alternarBandeira(l, c));
  assert.equal(jogo.estado.bandeiras, 40);
  assert.throws(() => jogo.alternarBandeira(17, 13));
  jogo.alternarBandeira(0, 0);
  jogo.alternarBandeira(17, 13);
  assert.equal(jogo.estado.bandeiras, 40);
});
test('CT10 - bandeira em casa segura impede vitoria ate sua remocao', () => {
  const jogo = novo();
  jogo.alternarBandeira(17, 13);
  jogo.revelar(16, 13);
  assert.equal(jogo.estado.status, 'jogando');
  assert.equal(jogo.estado.abertas, 211);
  jogo.alternarBandeira(17, 13);
  jogo.revelar(17, 13);
  assert.equal(jogo.estado.status, 'vitoria');
});
test('CT11 - sorteio padrao cria partida com a configuracao exigida', () => {
  const jogo = new CampoMinado();
  assert.equal(jogo.estado.bombas, 40);
  assert.equal(jogo.estado.status, 'jogando');
});
test('CT12 - casa numerica nao propaga: revela somente a si mesma', () => {
  const jogo = novo();
  jogo.revelar(2, 13);
  assert.equal(jogo.estado.abertas, 1);
  assert.equal(jogo.consultar(2, 13).valor, 2);
  assert.equal(jogo.consultar(2, 12).aberta, false);
});
test('CT13 - contagem de vizinhos distingue valores 1, 2 e 3', () => {
  const b = [[0,0],[0,2],[2,0]];
  while (b.length < 40) b.push([Math.floor((b.length + 10) / 14) + 5, (b.length + 10) % 14]);
  const jogo = new CampoMinado(b);
  jogo.revelar(1, 1);
  assert.equal(jogo.consultar(1, 1).valor, 3);
  jogo.revelar(0, 1);
  assert.equal(jogo.consultar(0, 1).valor, 2);
  jogo.revelar(1, 2);
  assert.equal(jogo.consultar(1, 2).valor, 1);
});
test('CT14 - consultar retorna shape completo para casa bandeirada', () => {
  const jogo = novo();
  jogo.alternarBandeira(17, 13);
  assert.deepEqual(jogo.consultar(17, 13), { aberta: false, bandeira: true, valor: null });
});
test('CT15 - bandeira nao pode ser colocada em casa ja revelada', () => {
  const jogo = novo();
  jogo.revelar(2, 13);
  assert.throws(() => jogo.alternarBandeira(2, 13));
});
