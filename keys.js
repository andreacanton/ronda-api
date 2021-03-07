const fs = require('fs');
const config = require('./config');

const ENV = config.get('env');

let PRIVATE_KEY = `-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAwCiVEoiUZCtPr5AUM4U3w9Ty1c62Eg9iuDwSQOW/B6iVCmS/
iHnilYVZEVk0E9TR2X8nK1lN1HAbc4IA/7fKOmwISkyh6JrrtrTJZMdighoigUOk
lKR9ZnNYqTKRPK8w6z1euWTA6lmLUra0jMiy/OXPgZe970pxMOhojIqfddx9aGxM
axPBvjb4lAWeOC1mCuIjM/Arajo9u0Y7h90LRrXxpX6swt4+ttKHxfnsZi9OCHq9
0Y/YQytvf5x4iwTno27hwVX+uT6SagM/ttjUJ+stdpBRh9kTUURavj+WC1BBQWaq
amJBbUgZ9/aIqRT6//EEedU9gS7nn9H+BCt9iwIDAQABAoIBADtByIbIm4owWQh4
0+H3aPT5DFGmxzrWh8jsrWxZ7Qj9kch8vRvnClq1nnvdGFQtQvFhZsDVb0zdrXl3
U7uH/9L4Ua4n554FeD8FjT2IxvX7/TwDkhNMjmczltnGgEdIdztz12wwh9U8+9vr
/82Sbq/SZqU+GBJc0H8WjHcaoIYFiKNrSIy4by8ykk7dC6fEWEVlwKx446vbD2Um
bOAOhKqpu0QHfPOsaYgi5W9hYepkQYAGUSdH2x1Rowi1ZIwuBlHu6H/GfF315MC5
pKVjBm+DX5tMZmEvnQGGT5r33a2lxfSl4TdYy2WG9KGTRlIvtK9+1YP6NBMrycX5
JQdwlKECgYEA/QTw6yyG71H7Anra/HcNrGHZzrGuqvKJO+KWcGHb0bJNEdmnhd5f
Ty6QeBVpbUB48l5+SjhP0ul9fBZ/ATGgf+Xoa1neEKvqy2GXrgaQGJ3aiisDgwjd
zxzTirVSO4PI47r9YC55ZcCRs7UIEHGUmwGKMEXhysZ+ubGIS4YMB5MCgYEAwmwY
tFB/2ieBldyTaBv4vFlU3PrtXaYyBHQC/XSmMNMUtzBbLiYRekEW5ciljuHxFWjH
XKawjKtsOt+YxrNfDa2zhrXqVh5StFQc9zbWTRoD4XTLLtiwc+TzhY/jVqjTF/pX
e13ObOKRb2Z57z4jfVC3yJb1s8UAOQ4ydAl2/SkCgYArtgDRAB5HlgghQ4w1dXPd
RgJU3Qlp6wCeYeTPgXhyX7VE0i9Ix0P77/VxaXGPOEYsyPpUZCoWK9RL7a7/S82I
ivV+JkZg5vJnNHL505RtTEgG+qtepdd8AmThX7XXJks8XH+NcDn0xDHns+yyuoyL
wtZWxJvfZi9acTs0oPHPFQKBgE/PfgivLvzH0OtLA/vt15rB9RNNspkJ+2hWk0+m
Tf6m988He7ajC/OqupKTXlscJxJJ0+UVzE3CpQg594ZB5dhAoPzAurSld//ss4NM
MIawEj2/6xSNAUpiBxGh8ooFfbpPGxBafr21+EvJvm5WjM0JkJg4WB521VOWn2GA
7SaZAoGBAOJCtH3WvL51R3+zZBxIWUioL5yzWsPRJBRCLN+G5ZiRpGV0CtRDjLp8
sYvELS7fcnaTE9D2tYqQVB1hksHTzUTK6fKeXG47/BAWTvr39HEgwyp1C4cB5bMm
GNLZoQM1VLn8TlfRWl/iCgy4SsKeorb06trj7GgXBJU+fmw+F7eV
-----END RSA PRIVATE KEY-----
`;

let PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwCiVEoiUZCtPr5AUM4U3
w9Ty1c62Eg9iuDwSQOW/B6iVCmS/iHnilYVZEVk0E9TR2X8nK1lN1HAbc4IA/7fK
OmwISkyh6JrrtrTJZMdighoigUOklKR9ZnNYqTKRPK8w6z1euWTA6lmLUra0jMiy
/OXPgZe970pxMOhojIqfddx9aGxMaxPBvjb4lAWeOC1mCuIjM/Arajo9u0Y7h90L
RrXxpX6swt4+ttKHxfnsZi9OCHq90Y/YQytvf5x4iwTno27hwVX+uT6SagM/ttjU
J+stdpBRh9kTUURavj+WC1BBQWaqamJBbUgZ9/aIqRT6//EEedU9gS7nn9H+BCt9
iwIDAQAB
-----END PUBLIC KEY-----
`;

if (ENV !== 'test') {
  PRIVATE_KEY = fs.readFileSync(`${__dirname}private_key.pem`);
  PUBLIC_KEY = fs.readFileSync(`${__dirname}public_key.pem`);
}

module.exports = { PRIVATE_KEY, PUBLIC_KEY };