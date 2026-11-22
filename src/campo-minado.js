import { randomInt } from 'node:crypto';

export class CampoMinado {
  #bombas; #abertas = new Set(); #bandeiras = new Set(); #status = 'jogando';
  static LINHAS = 18;
  static COLUNAS = 14;
  static BOMBAS = 40;

  constructor(bombas) {
    const posicoes = bombas ?? this.#sortear();
    if (posicoes.length !== 40) throw new RangeError('Sao necessarias 40 bombas');
    this.#bombas = new Set(posicoes.map(([l, c]) => this.#chave(l, c)));
    if (this.#bombas.size !== 40) throw new RangeError('Bombas repetidas');
  }

  #chave(l, c) {
    if (!Number.isInteger(l) || !Number.isInteger(c) || l < 0 || l >= 18 || c < 0 || c >= 14)
      throw new RangeError('Coordenada invalida');
    return l * 14 + c;
  }

  #sortear() {
    const casas = new Set();
    while (casas.size < 40) casas.add(randomInt(252));
    return [...casas].map(n => [Math.floor(n / 14), n % 14]);
  }

  #vizinhos(chave) {
    const l = Math.floor(chave / 14), c = chave % 14, vizinhos = [];
    for (let dl = -1; dl <= 1; dl++) for (let dc = -1; dc <= 1; dc++) {
      if ((dl || dc) && l + dl >= 0 && l + dl < 18 && c + dc >= 0 && c + dc < 14)
        vizinhos.push((l + dl) * 14 + c + dc);
    }
    return vizinhos;
  }

  #contar(chave) { return this.#vizinhos(chave).filter(n => this.#bombas.has(n)).length; }
  #ativo() { if (this.#status !== 'jogando') throw new Error('Partida encerrada'); }

  alternarBandeira(l, c) {
    this.#ativo();
    const chave = this.#chave(l, c);
    if (this.#abertas.has(chave)) throw new Error('Casa ja revelada');
    if (this.#bandeiras.has(chave)) this.#bandeiras.delete(chave);
    else {
      if (this.#bandeiras.size === 40) throw new Error('Limite de bandeiras');
      this.#bandeiras.add(chave);
    }
  }

  revelar(l, c) {
    this.#ativo();
    const chave = this.#chave(l, c);
    if (this.#bandeiras.has(chave)) throw new Error('Remova a bandeira antes');
    if (this.#bombas.has(chave)) {
      this.#abertas.add(chave);
      this.#status = 'derrota';
      return this.estado;
    }
    const fila = [chave];
    while (fila.length) {
      const casa = fila.pop();
      if (this.#abertas.has(casa) || this.#bandeiras.has(casa) || this.#bombas.has(casa)) continue;
      this.#abertas.add(casa);
      if (this.#contar(casa) === 0) fila.push(...this.#vizinhos(casa));
    }
    if (this.#abertas.size === 212) this.#status = 'vitoria';
    return this.estado;
  }

  consultar(l, c) {
    const chave = this.#chave(l, c);
    return { aberta: this.#abertas.has(chave), bandeira: this.#bandeiras.has(chave),
      valor: this.#abertas.has(chave) ? (this.#bombas.has(chave) ? '*' : this.#contar(chave)) : null };
  }

  get estado() {
    return { linhas: 18, colunas: 14, bombas: 40, abertas: this.#abertas.size,
      bandeiras: this.#bandeiras.size, status: this.#status };
  }
}
