// cuon-matrix.js (c) 2012 kanda and matsuda
/**
 * 4x4の行列を実装したクラス。
 * OpenGLの行列スタックと同等の機能を備えている。
 * 変換後の行列は、変換行列を右からかけることで計算される。
 * 計算した結果で、行列の内容が置き換えられる。
 */

/**
 * Matrix4のコンストラクタ。
 * 新しく生成される行列は、opt_srcにMatrix4のインスタンスが渡された場合、その要素がコピーされて初期化される。
 * それ以外の場合、単位行列に初期化される。
 * @param opt_src 要素をコピーしてくる行列（オプション）
 */
var Matrix4 = function(opt_src) {
    var i, s, d;
    if (opt_src && typeof opt_src === 'object' && opt_src.hasOwnProperty('elements')) {
        s = opt_src.elements;
        d = new Float32Array(16);
        for (i = 0; i < 16; ++i) {
            d[i] = s[i];
        }
        this.elements = d;
    } else {
        this.elements = new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
    }
};

/**
 * 単位行列に設定する。
 * @return this
 */
Matrix4.prototype.setIdentity = function() {
    var e = this.elements;
    e[0] = 1;   e[4] = 0;   e[8]  = 0;   e[12] = 0;
    e[1] = 0;   e[5] = 1;   e[9]  = 0;   e[13] = 0;
    e[2] = 0;   e[6] = 0;   e[10] = 1;   e[14] = 0;
    e[3] = 0;   e[7] = 0;   e[11] = 0;   e[15] = 1;
    return this;
};

/**
 * 渡された行列の要素をコピーする。
 * @param src 要素をコピーしてくる行列
 * @return this
 */
Matrix4.prototype.set = function(src) {
    var i, s, d;

    s = src.elements;
    d = this.elements;

    if (s === d) {
        return;
    }

    for (i = 0; i < 16; ++i) {
        d[i] = s[i];
    }

    return this;
};

/**
 * 渡された行列を右からかける。
 * @param other かける行列
 * @return this
 */
Matrix4.prototype.concat = function(other) {
    var i, e, a, b, ai0, ai1, ai2, ai3;

    // e = a * b を計算する
    e = this.elements;
    a = this.elements;
    b = other.elements;

    // eとbが同じ場合、bの内容を一時的な配列にコピーする
    if (e === b) {
        b = new Float32Array(16);
        for (i = 0; i < 16; ++i) {
            b[i] = e[i];
        }
    }

    for (i = 0; i < 4; i++) {
        ai0=a[i];  ai1=a[i+4];  ai2=a[i+8];  ai3=a[i+12];
        e[i]    = ai0 * b[0]  + ai1 * b[1]  + ai2 * b[2]  + ai3 * b[3];
        e[i+4]  = ai0 * b[4]  + ai1 * b[5]  + ai2 * b[6]  + ai3 * b[7];
        e[i+8]  = ai0 * b[8]  + ai1 * b[9]  + ai2 * b[10] + ai3 * b[11];
        e[i+12] = ai0 * b[12] + ai1 * b[13] + ai2 * b[14] + ai3 * b[15];
    }

    return this;
};
Matrix4.prototype.multiply = Matrix4.prototype.concat;

/**
 * 渡されたベクトルをかける。
 * @param pos かける行列
 * @return この行列を掛けた結果(Float32Array)
 */
Matrix4.prototype.multiplyVector3 = function(pos) {
    var e = this.elements;
    var p = pos.elements;
    var v = new Vector3();
    var result = v.elements;

    result[0] = p[0] * e[0] + p[1] * e[4] + p[2] * e[ 8] + e[11];
    result[1] = p[0] * e[1] + p[1] * e[5] + p[2] * e[ 9] + e[12];
    result[2] = p[0] * e[2] + p[1] * e[6] + p[2] * e[10] + e[13];

    return v;
};

/**
 * 渡されたベクトルをかける。
 * @param pos かける行列
 * @return この行列を掛けた結果(Float32Array)
 */
Matrix4.prototype.multiplyVector4 = function(pos) {
    var e = this.elements;
    var p = pos.elements;
    var v = new Vector4();
    var result = v.elements;

    result[0] = p[0] * e[0] + p[1] * e[4] + p[2] * e[ 8] + p[3] * e[12];
    result[1] = p[0] * e[1] + p[1] * e[5] + p[2] * e[ 9] + p[3] * e[13];
    result[2] = p[0] * e[2] + p[1] * e[6] + p[2] * e[10] + p[3] * e[14];
    result[3] = p[0] * e[3] + p[1] * e[7] + p[2] * e[11] + p[3] * e[15];

    return v;
};

/**
 * 行列を転置する。
 * @return this
 */
Matrix4.prototype.transpose = function() {
    var e, t;

    e = this.elements;

    t = e[ 1];  e[ 1] = e[ 4];  e[ 4] = t;
    t = e[ 2];  e[ 2] = e[ 8];  e[ 8] = t;
    t = e[ 3];  e[ 3] = e[12];  e[12] = t;
    t = e[ 6];  e[ 6] = e[ 9];  e[ 9] = t;
    t = e[ 7];  e[ 7] = e[13];  e[13] = t;
    t = e[11];  e[11] = e[14];  e[14] = t;

    return this;
};

/**
 * 渡された行列の逆行列を計算して、この行列に代入する。
 * @param other 逆行列を計算する行列
 * @return this
 */
Matrix4.prototype.setInverseOf = function(other) {
    var i, s, d, inv, det;

    s = other.elements;
    d = this.elements;
    inv = new Float32Array(16);

    inv[0]  =   s[5]*s[10]*s[15] - s[5] *s[11]*s[14] - s[9] *s[6]*s[15]
            + s[9]*s[7] *s[14] + s[13]*s[6] *s[11] - s[13]*s[7]*s[10];
    inv[4]  = - s[4]*s[10]*s[15] + s[4] *s[11]*s[14] + s[8] *s[6]*s[15]
            - s[8]*s[7] *s[14] - s[12]*s[6] *s[11] + s[12]*s[7]*s[10];
    inv[8]  =   s[4]*s[9] *s[15] - s[4] *s[11]*s[13] - s[8] *s[5]*s[15]
            + s[8]*s[7] *s[13] + s[12]*s[5] *s[11] - s[12]*s[7]*s[9];
    inv[12] = - s[4]*s[9] *s[14] + s[4] *s[10]*s[13] + s[8] *s[5]*s[14]
            - s[8]*s[6] *s[13] - s[12]*s[5] *s[10] + s[12]*s[6]*s[9];

    inv[1]  = - s[1]*s[10]*s[15] + s[1] *s[11]*s[14] + s[9] *s[2]*s[15]
            - s[9]*s[3] *s[14] - s[13]*s[2] *s[11] + s[13]*s[3]*s[10];
    inv[5]  =   s[0]*s[10]*s[15] - s[0] *s[11]*s[14] - s[8] *s[2]*s[15]
            + s[8]*s[3] *s[14] + s[12]*s[2] *s[11] - s[12]*s[3]*s[10];
    inv[9]  = - s[0]*s[9] *s[15] + s[0] *s[11]*s[13] + s[8] *s[1]*s[15]
            - s[8]*s[3] *s[13] - s[12]*s[1] *s[11] + s[12]*s[3]*s[9];
    inv[13] =   s[0]*s[9] *s[14] - s[0] *s[10]*s[13] - s[8] *s[1]*s[14]
            + s[8]*s[2] *s[13] + s[12]*s[1] *s[10] - s[12]*s[2]*s[9];

    inv[2]  =   s[1]*s[6]*s[15] - s[1] *s[7]*s[14] - s[5] *s[2]*s[15]
            + s[5]*s[3]*s[14] + s[13]*s[2]*s[7]  - s[13]*s[3]*s[6];
    inv[6]  = - s[0]*s[6]*s[15] + s[0] *s[7]*s[14] + s[4] *s[2]*s[15]
            - s[4]*s[3]*s[14] - s[12]*s[2]*s[7]  + s[12]*s[3]*s[6];
    inv[10] =   s[0]*s[5]*s[15] - s[0] *s[7]*s[13] - s[4] *s[1]*s[15]
            + s[4]*s[3]*s[13] + s[12]*s[1]*s[7]  - s[12]*s[3]*s[5];
    inv[14] = - s[0]*s[5]*s[14] + s[0] *s[6]*s[13] + s[4] *s[1]*s[14]
            - s[4]*s[2]*s[13] - s[12]*s[1]*s[6]  + s[12]*s[2]*s[5];

    inv[3]  = - s[1]*s[6]*s[11] + s[1]*s[7]*s[10] + s[5]*s[2]*s[11]
            - s[5]*s[3]*s[10] - s[9]*s[2]*s[7]  + s[9]*s[3]*s[6];
    inv[7]  =   s[0]*s[6]*s[11] - s[0]*s[7]*s[10] - s[4]*s[2]*s[11]
            + s[4]*s[3]*s[10] + s[8]*s[2]*s[7]  - s[8]*s[3]*s[6];
    inv[11] = - s[0]*s[5]*s[11] + s[0]*s[7]*s[9]  + s[4]*s[1]*s[11]
            - s[4]*s[3]*s[9]  - s[8]*s[1]*s[7]  + s[8]*s[3]*s[5];
    inv[15] =   s[0]*s[5]*s[10] - s[0]*s[6]*s[9]  - s[4]*s[1]*s[10]
            + s[4]*s[2]*s[9]  + s[8]*s[1]*s[6]  - s[8]*s[2]*s[5];

    det = s[0]*inv[0] + s[1]*inv[4] + s[2]*inv[8] + s[3]*inv[12];
    if (det === 0) {
        return this;
    }

    det = 1 / det;
    for (i = 0; i < 16; i++) {
        d[i] = inv[i] * det;
    }

    return this;
};

/**
 * この行列の逆行列を計算して、内容を置き換える。
 * @return this
 */
Matrix4.prototype.invert = function() {
    return this.setInverseOf(this);
};

/**
 * 正射影行列に設定する。
 * @param left 左クリップ平面のX座標
 * @param right 右クリップ平面のX座標
 * @param bottom 下クリップ平面のY座標
 * @param top 上クリップ平面のY座標
 * @param near 近クリップ平面までの距離。平面が視点の後方にある場合は負数
 * @param far 遠クリップ平面までの距離。平面が視点の後方にある場合は負数
 * @return this
 */
Matrix4.prototype.setOrtho = function(left, right, bottom, top, near, far) {
    var e, rw, rh, rd;

    if (left === right || bottom === top || near === far) {
        throw 'null frustum';
    }

    rw = 1 / (right - left);
    rh = 1 / (top - bottom);
    rd = 1 / (far - near);

    e = this.elements;

    e[0]  = 2 * rw;
    e[1]  = 0;
    e[2]  = 0;
    e[3]  = 0;

    e[4]  = 0;
    e[5]  = 2 * rh;
    e[6]  = 0;
    e[7]  = 0;

    e[8]  = 0;
    e[9]  = 0;
    e[10] = -2 * rd;
    e[11] = 0;

    e[12] = -(right + left) * rw;
    e[13] = -(top + bottom) * rh;
    e[14] = -(far + near) * rd;
    e[15] = 1;

    return this;
};

/**
 * 正射影行列を右からかける。
 * @param left 左クリップ平面のX座標
 * @param right 右クリップ平面のX座標
 * @param bottom 下クリップ平面のY座標
 * @param top 上クリップ平面のY座標
 * @param near 近クリップ平面までの距離。平面が視点の後方にある場合は負数
 * @param far 遠クリップ平面までの距離。平面が視点の後方にある場合は負数
 * @return this
 */
Matrix4.prototype.ortho = function(left, right, bottom, top, near, far) {
    return this.concat(new Matrix4().setOrtho(left, right, bottom, top, near, far));
};

/**
 * 透視射影行列に設定する
 * @param left 近クリップ平面上における左クリップ平面のX座標
 * @param right 近クリップ平面上における右クリップ平面のX座標
 * @param bottom 近クリップ平面上における下クリップ平面のY座標
 * @param top 近クリップ平面上における上クリップ平面のY座標
 * @param near 近クリップ平面までの距離。正数でなくてはならない
 * @param far 遠クリップ平面までの距離。正数でなくてはならない
 * @return this
 */
Matrix4.prototype.setFrustum = function(left, right, bottom, top, near, far) {
    var e, rw, rh, rd;

    if (left === right || top === bottom || near === far) {
        throw 'null frustum';
    }
    if (near <= 0) {
        throw 'near <= 0';
    }
    if (far <= 0) {
        throw 'far <= 0';
    }

    rw = 1 / (right - left);
    rh = 1 / (top - bottom);
    rd = 1 / (far - near);

    e = this.elements;

    e[ 0] = 2 * near * rw;
    e[ 1] = 0;
    e[ 2] = 0;
    e[ 3] = 0;

    e[ 4] = 0;
    e[ 5] = 2 * near * rh;
    e[ 6] = 0;
    e[ 7] = 0;

    e[ 8] = (right + left) * rw;
    e[ 9] = (top + bottom) * rh;
    e[10] = -(far + near) * rd;
    e[11] = -1;

    e[12] = 0;
    e[13] = 0;
    e[14] = -2 * near * far * rd;
    e[15] = 0;

    return this;
};

/**
 * 透視射影行列を右からかける。
 * @param left 近クリップ平面上における左クリップ平面のX座標
 * @param right 近クリップ平面上における右クリップ平面のX座標
 * @param bottom 近クリップ平面上における下クリップ平面のY座標
 * @param top 近クリップ平面上における上クリップ平面のY座標
 * @param near 近クリップ平面までの距離。正数でなくてはならない
 * @param far 遠クリップ平面までの距離。正数でなくてはならない
 * @return this
 */
Matrix4.prototype.frustum = function(left, right, bottom, top, near, far) {
    return this.concat(new Matrix4().setFrustum(left, right, bottom, top, near, far));
};

/**
 * 視野角、アスペクト比を指定して透視射影行列に設定する。
 * @param fovy 垂直視野角 [度]
 * @param aspect 視野のアスペクト比（幅 / 高さ）
 * @param near 近クリップ平面までの距離。正数でなくてはならない
 * @param far 遠クリップ平面までの距離。正数でなくてはならない
 * @return this
 */
Matrix4.prototype.setPerspective = function(fovy, aspect, near, far) {
    var e, rd, s, ct;

    if (near === far || aspect === 0) {
        throw 'null frustum';
    }
    if (near <= 0) {
        throw 'near <= 0';
    }
    if (far <= 0) {
        throw 'far <= 0';
    }

    fovy = Math.PI * fovy / 180 / 2;
    s = Math.sin(fovy);
    if (s === 0) {
        throw 'null frustum';
    }

    rd = 1 / (far - near);
    ct = Math.cos(fovy) / s;

    e = this.elements;

    e[0]  = ct / aspect;
    e[1]  = 0;
    e[2]  = 0;
    e[3]  = 0;

    e[4]  = 0;
    e[5]  = ct;
    e[6]  = 0;
    e[7]  = 0;

    e[8]  = 0;
    e[9]  = 0;
    e[10] = -(far + near) * rd;
    e[11] = -1;

    e[12] = 0;
    e[13] = 0;
    e[14] = -2 * near * far * rd;
    e[15] = 0;

    return this;
};

/**
 * 透視射影行列を右からかける。
 * @param fovy 垂直視野角 [度]
 * @param aspect 視野のアスペクト比（幅 / 高さ）
 * @param near 近クリップ平面までの距離。正数でなくてはならない
 * @param far 遠クリップ平面までの距離。正数でなくてはならない
 * @return this
 */
Matrix4.prototype.perspective = function(fovy, aspect, near, far) {
    return this.concat(new Matrix4().setPerspective(fovy, aspect, near, far));
};

/**
 * スケーリング行列に設定する。
 * @param x X方向の倍率
 * @param y Y方向の倍率
 * @param z Z方向の倍率
 * @return this
 */
Matrix4.prototype.setScale = function(x, y, z) {
    var e = this.elements;
    e[0] = x;  e[4] = 0;  e[8]  = 0;  e[12] = 0;
    e[1] = 0;  e[5] = y;  e[9]  = 0;  e[13] = 0;
    e[2] = 0;  e[6] = 0;  e[10] = z;  e[14] = 0;
    e[3] = 0;  e[7] = 0;  e[11] = 0;  e[15] = 1;
    return this;
};

/**
 * スケーリング行列を右からかける。
 * @param x X方向の倍率
 * @param y Y方向の倍率
 * @param z Z方向の倍率
 * @return this
 */
Matrix4.prototype.scale = function(x, y, z) {
    var e = this.elements;
    e[0] *= x;  e[4] *= y;  e[8]  *= z;
    e[1] *= x;  e[5] *= y;  e[9]  *= z;
    e[2] *= x;  e[6] *= y;  e[10] *= z;
    e[3] *= x;  e[7] *= y;  e[11] *= z;
    return this;
};

/**
 * 平行移動行列に設定する。
 * @param x X方向の移動量
 * @param y Y方向の移動量
 * @param z Z方向の移動量
 * @return this
 */
Matrix4.prototype.setTranslate = function(x, y, z) {
    var e = this.elements;
    e[0] = 1;  e[4] = 0;  e[8]  = 0;  e[12] = x;
    e[1] = 0;  e[5] = 1;  e[9]  = 0;  e[13] = y;
    e[2] = 0;  e[6] = 0;  e[10] = 1;  e[14] = z;
    e[3] = 0;  e[7] = 0;  e[11] = 0;  e[15] = 1;
    return this;
};

/**
 * 平行移動行列を右からかける。
 * @param x X方向の移動量
 * @param y Y方向の移動量
 * @param z Z方向の移動量
 * @return this
 */
Matrix4.prototype.translate = function(x, y, z) {
    var e = this.elements;
    e[12] += e[0] * x + e[4] * y + e[8]  * z;
    e[13] += e[1] * x + e[5] * y + e[9]  * z;
    e[14] += e[2] * x + e[6] * y + e[10] * z;
    e[15] += e[3] * x + e[7] * y + e[11] * z;
    return this;
};

/**
 * 回転行列に設定する。
 * 回転軸の方向ベクトルは正規化されていなくても構わない。
 * @param angle 回転角 [度]
 * @param x 回転軸の方向ベクトルのX成分
 * @param y 回転軸の方向ベクトルのY成分
 * @param z 回転軸の方向ベクトルのZ成分
 * @return this
 */
Matrix4.prototype.setRotate = function(angle, x, y, z) {
    var e, s, c, len, rlen, nc, xy, yz, zx, xs, ys, zs;

    angle = Math.PI * angle / 180;
    e = this.elements;

    s = Math.sin(angle);
    c = Math.cos(angle);

    if (0 !== x && 0 === y && 0 === z) {
        // X軸まわりの回転
        if (x < 0) {
            s = -s;
        }
        e[0] = 1;  e[4] = 0;  e[ 8] = 0;  e[12] = 0;
        e[1] = 0;  e[5] = c;  e[ 9] =-s;  e[13] = 0;
        e[2] = 0;  e[6] = s;  e[10] = c;  e[14] = 0;
        e[3] = 0;  e[7] = 0;  e[11] = 0;  e[15] = 1;
    } else if (0 === x && 0 !== y && 0 === z) {
        // Y軸まわりの回転
        if (y < 0) {
            s = -s;
        }
        e[0] = c;  e[4] = 0;  e[ 8] = s;  e[12] = 0;
        e[1] = 0;  e[5] = 1;  e[ 9] = 0;  e[13] = 0;
        e[2] =-s;  e[6] = 0;  e[10] = c;  e[14] = 0;
        e[3] = 0;  e[7] = 0;  e[11] = 0;  e[15] = 1;
    } else if (0 === x && 0 === y && 0 !== z) {
        // Z軸まわりの回転
        if (z < 0) {
            s = -s;
        }
        e[0] = c;  e[4] =-s;  e[ 8] = 0;  e[12] = 0;
        e[1] = s;  e[5] = c;  e[ 9] = 0;  e[13] = 0;
        e[2] = 0;  e[6] = 0;  e[10] = 1;  e[14] = 0;
        e[3] = 0;  e[7] = 0;  e[11] = 0;  e[15] = 1;
    } else {
        // その他の任意軸まわりの回転
        len = Math.sqrt(x*x + y*y + z*z);
        if (len !== 1) {
            rlen = 1 / len;
            x *= rlen;
            y *= rlen;
            z *= rlen;
        }
        nc = 1 - c;
        xy = x * y;
        yz = y * z;
        zx = z * x;
        xs = x * s;
        ys = y * s;
        zs = z * s;

        e[ 0] = x*x*nc +  c;
        e[ 1] = xy *nc + zs;
        e[ 2] = zx *nc - ys;
        e[ 3] = 0;

        e[ 4] = xy *nc - zs;
        e[ 5] = y*y*nc +  c;
        e[ 6] = yz *nc + xs;
        e[ 7] = 0;

        e[ 8] = zx *nc + ys;
        e[ 9] = yz *nc - xs;
        e[10] = z*z*nc +  c;
        e[11] = 0;

        e[12] = 0;
        e[13] = 0;
        e[14] = 0;
        e[15] = 1;
    }

    return this;
};

/**
 * 回転行列を右からかける。
 * 回転軸の方向ベクトルは正規化されていなくても構わない。
 * @param angle 回転角 [度]
 * @param x 回転軸の方向ベクトルのX成分
 * @param y 回転軸の方向ベクトルのY成分
 * @param z 回転軸の方向ベクトルのZ成分
 * @return this
 */
Matrix4.prototype.rotate = function(angle, x, y, z) {
    return this.concat(new Matrix4().setRotate(angle, x, y, z));
};

/**
 * 視野変換行列を設定する。
 * @param eyeX, eyeY, eyeZ 視点の位置
 * @param centerX, centerY, centerZ 標点の位置
 * @param upX, upY, upZ カメラの上方向を表す方向ベクトル
 * @return this
 */
Matrix4.prototype.setLookAt = function(eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ) {
    var e, fx, fy, fz, rlf, sx, sy, sz, rls, ux, uy, uz;

    fx = centerX - eyeX;
    fy = centerY - eyeY;
    fz = centerZ - eyeZ;

    // fを正規化する
    rlf = 1 / Math.sqrt(fx*fx + fy*fy + fz*fz);
    fx *= rlf;
    fy *= rlf;
    fz *= rlf;

    // fとupの外積を求める
    sx = fy * upZ - fz * upY;
    sy = fz * upX - fx * upZ;
    sz = fx * upY - fy * upX;

    // sを正規化する
    rls = 1 / Math.sqrt(sx*sx + sy*sy + sz*sz);
    sx *= rls;
    sy *= rls;
    sz *= rls;

    // sとfの外積を求める
    ux = sy * fz - sz * fy;
    uy = sz * fx - sx * fz;
    uz = sx * fy - sy * fx;

    // 代入する
    e = this.elements;
    e[0] = sx;
    e[1] = ux;
    e[2] = -fx;
    e[3] = 0;

    e[4] = sy;
    e[5] = uy;
    e[6] = -fy;
    e[7] = 0;

    e[8] = sz;
    e[9] = uz;
    e[10] = -fz;
    e[11] = 0;

    e[12] = 0;
    e[13] = 0;
    e[14] = 0;
    e[15] = 1;

    // 平行移動する
    return this.translate(-eyeX, -eyeY, -eyeZ);
};

/**
 * 視野変換行列を右からかける。
 * @param eyeX, eyeY, eyeZ 視点の位置
 * @param centerX, centerY, centerZ 標点の位置
 * @param upX, upY, upZ カメラの上方向を表す方向ベクトル
 * @return this
 */
Matrix4.prototype.lookAt = function(eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ) {
    return this.concat(new Matrix4().setLookAt(eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ));
};

/**
 * 頂点を平面上に射影するような行列を右からかける。
 * @param plane 平面方程式 Ax + By + Cz + D = 0 の係数[A, B, C, D]を格納した配列
 * @param light 光源の同次座標を格納した配列。light[3]=0の場合、平行光源を表す
 * @return this
 */
Matrix4.prototype.dropShadow = function(plane, light) {
    var mat = new Matrix4();
    var e = mat.elements;

    var dot = plane[0] * light[0] + plane[1] * light[1] + plane[2] * light[2] + plane[3] * light[3];

    e[ 0] = dot - light[0] * plane[0];
    e[ 1] =     - light[1] * plane[0];
    e[ 2] =     - light[2] * plane[0];
    e[ 3] =     - light[3] * plane[0];

    e[ 4] =     - light[0] * plane[1];
    e[ 5] = dot - light[1] * plane[1];
    e[ 6] =     - light[2] * plane[1];
    e[ 7] =     - light[3] * plane[1];

    e[ 8] =     - light[0] * plane[2];
    e[ 9] =     - light[1] * plane[2];
    e[10] = dot - light[2] * plane[2];
    e[11] =     - light[3] * plane[2];

    e[12] =     - light[0] * plane[3];
    e[13] =     - light[1] * plane[3];
    e[14] =     - light[2] * plane[3];
    e[15] = dot - light[3] * plane[3];

    return this.concat(mat);
}

/**
 * 平行光源により頂点を平面上に射影するような行列を右からかける。
 * @param normX, normY, normZ 平面の法線ベクトル（正規化されている必要はない）
 * @param planeX, planeY, planeZ 平面上の点
 * @param lightX, lightY, lightZ ライトの方向（正規化されている必要はない）
 * @return this
 */
Matrix4.prototype.dropShadowDirectionally = function(normX, normY, normZ, planeX, planeY, planeZ, lightX, lightY, lightZ) {
    var a = planeX * normX + planeY * normY + planeZ * normZ;
    return this.dropShadow([normX, normY, normZ, -a], [lightX, lightY, lightZ, 0]);
};

/**
 * Vector3のコンストラクタ
 * 引数を指定するとその内容がコピーされる
 * @param opt_src 要素をコピーしてくるベクトル（オプション）
 */
var Vector3 = function(opt_src) {
    var v = new Float32Array(3);
    if (opt_src && typeof opt_src === 'object') {
        v[0] = opt_src[0]; v[1] = opt_src[1]; v[2] = opt_src[2];
    }
    this.elements = v;
}

/**
 * 正規化する。
 * @return this
 */
Vector3.prototype.normalize = function() {
    var v = this.elements;
    var c = v[0], d = v[1], e = v[2], g = Math.sqrt(c*c+d*d+e*e);
    if(g){
        if(g == 1)
            return this;
    } else {
        v[0] = 0; v[1] = 0; v[2] = 0;
        return this;
    }
    g = 1/g;
    v[0] = c*g; v[1] = d*g; v[2] = e*g;
    return this;
};

/**
 * Vector4のコンストラクタ
 * 引数を指定するとその内容がコピーされる
 * @param opt_src 要素をコピーしてくるベクトル（オプション）
 */
var Vector4 = function(opt_src) {
    var v = new Float32Array(4);
    if (opt_src && typeof opt_src === 'object') {
        v[0] = opt_src[0]; v[1] = opt_src[1]; v[2] = opt_src[2]; v[3] = opt_src[3];
    }
    this.elements = v;
}
