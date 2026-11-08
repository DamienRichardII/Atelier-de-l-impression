// Archive ZIP minimale (méthode « stockée », sans compression : les logos PNG/JPG/WEBP sont déjà compressés).
// Écrite à la main pour ne pas ajouter de dépendance. Générée en flux : la mémoire reste faible.
const TABLE = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc32 = (b: Uint8Array) => { let c = 0xffffffff; for (let i = 0; i < b.length; i++) c = TABLE[(c ^ b[i]) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };

export interface ZipEntry { name: string; data: Uint8Array }

export function zipStream(entries: AsyncIterable<ZipEntry>): ReadableStream<Uint8Array> {
  const enc = new TextEncoder();
  const central: Uint8Array[] = []; let offset = 0; let count = 0;
  const now = new Date();
  const time = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
  const date = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
  const it = entries[Symbol.asyncIterator]();
  return new ReadableStream<Uint8Array>({
    async pull(ctrl) {
      const { value, done } = await it.next();
      if (done) {
        const size = central.reduce((s, c) => s + c.length, 0);
        const end = new DataView(new ArrayBuffer(22));
        end.setUint32(0, 0x06054b50, true); end.setUint16(8, count, true); end.setUint16(10, count, true); end.setUint32(12, size, true); end.setUint32(16, offset, true);
        for (const c of central) ctrl.enqueue(c);
        ctrl.enqueue(new Uint8Array(end.buffer)); ctrl.close(); return;
      }
      const name = enc.encode(value.name); const crc = crc32(value.data);
      const lh = new DataView(new ArrayBuffer(30));
      lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true); lh.setUint16(10, time, true); lh.setUint16(12, date, true);
      lh.setUint32(14, crc, true); lh.setUint32(18, value.data.length, true); lh.setUint32(22, value.data.length, true); lh.setUint16(26, name.length, true);
      const ch = new DataView(new ArrayBuffer(46));
      ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true); ch.setUint16(8, 0x0800, true); ch.setUint16(12, time, true); ch.setUint16(14, date, true);
      ch.setUint32(16, crc, true); ch.setUint32(20, value.data.length, true); ch.setUint32(24, value.data.length, true); ch.setUint16(28, name.length, true); ch.setUint32(42, offset, true);
      const cEntry = new Uint8Array(46 + name.length); cEntry.set(new Uint8Array(ch.buffer)); cEntry.set(name, 46); central.push(cEntry);
      ctrl.enqueue(new Uint8Array(lh.buffer)); ctrl.enqueue(name); ctrl.enqueue(value.data);
      offset += 30 + name.length + value.data.length; count++;
    },
  });
}
