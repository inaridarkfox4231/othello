var boardimage = new Image();
boardimage.src = "./images/board.png"; //ゲーム盤
var black = new Image();
black.src = "./images/black.png"; // 黒
var white = new Image();
white.src = "./images/white.png"; // 白
var floor = new Image();
floor.src = "./images/floor.png"; // ブランク
var able = new Image();
able.src = "./images/able.png";  // 設置可能
var turnname = ["WHITE  TURN", "", "BLACK  TURN"];
var winner = ["WHITE  WIN!!", "DRAW.", "BLACK  WIN!!", "YOU  LOSE..", "DRAW.", "YOU  WIN!!"];

var dx = [1, 1, 0, -1, -1, -1, 0, 1];  //x軸方向の走査
var dy = [0, 1, 1, 1, 0, -1, -1, -1];  //y軸方向の走査
var board = [];  // 盤面の状態を記録
for(var i = 0; i < 8; i++){
    board.push([0, 0, 0, 0, 0, 0, 0, 0]);
}

// -1が白、+1が黒。
var count = [0, 0, 0] // 1 + flagで各々の個数にアクセス。count[1]はゲーム終了のフラグ。

//hitlistは常に、その時の置ける石（黒か白）と、その石を置いたときの
//色の変わり方を保持し、石を置くたびに再計算される。
var hitlist = [];
var flag_cur = 1;  // 先手は黒で固定。

var mode = 0; //1が1Pモード、2が2Pモード。最初は0で盤面クリックしても何も起きない。

function getImg(flag){
    if(flag == 1){ return black; }
    return white;
}

function get_ctx(){
    // メイン関数（コンテクストの取得）
    var canvas = document.getElementById("myCanvas");
    if(!canvas.getContext){ return; }
    var ctx = canvas.getContext("2d");
    return ctx;
}
// 空っぽかどうかの判定関数。
function is_empty(x, y){ return board[y][x] == 0; }
// flagが1なら黒かどうか、-1なら白かどうかの判定関数。
function is_bw(x, y, flag){ return board[y][x] == flag; }
// (x, y)からk(0~7)の方向に走査して色が変わりそうなら、
// 変える石の個数を返す。変わらない時は0を返す。
function hit_bw(x, y, k, flag){
    var count = 0;
    while(true){
        if(x + dx[k] < 0 || x + dx[k] > 7 || y + dy[k] < 0 || y + dy[k] > 7){ count = 0; break; }
        x += dx[k];
        y += dy[k];
        if(board[y][x] == 0){ count = 0; break; }
        if(board[y][x] == flag){ break; }
        if(board[y][x] == -flag){ count += 1; }
    }
    return count;
}
// (x, y)から各方向に走査して，変わる色の全リストを作る。
// 変わらないなら空っぽを返す。
function hitlist_bw(x, y, flag){
    var list = [[x, y]];
    for(var k = 0; k < 8; k++){
         var s = hit_bw(x, y, k, flag);
         if(s > 0){
             for(var j = 1; j <= s; j++){
                 list.push([x + j * dx[k], y + j * dy[k]]);
             }
         }
    }
    return list;
}
//flagの石を置ける場所と、それをキーとした値が
//色が変わる石のリストになっている配列を返す。
function hitlist_all_bw(flag){
    var listall = [];
    for(var x = 0; x < 8; x++){
        for(var y = 0; y < 8; y++){
            if(board[y][x] != 0){ continue; }
            else{
               list = hitlist_bw(x, y, flag);
               if(list.length > 1){ listall.push(hitlist_bw(x, y, flag)); }
            }
        }
    }
    return listall;
}
//これでlist[[x, y]]の中にある石が色の変わる石という形。

// canvas要素にクリックイベントのリスナーを付与。
document.getElementById("myCanvas").addEventListener("click", function(e){
    //モード0なら何も起きない。
    if(mode == 0){ return; }
    //クリック位置の計算
    var clickX = e.pageX;
    var clickY = e.pageY;
    var clientRect = this.getBoundingClientRect();
    var positionX = clientRect.left + window.pageXOffset;
    var positionY = clientRect.top + window.pageYOffset;
    var x = clickX - positionX;
    var y = clickY - positionY;
    x = Math.floor(x / 40);  // 0～7
    y = Math.floor(y / 40);  // 0～7

    //クリック位置がableかどうか調べる関数（見つかったらその場所を返す）
    var sublist = get_sublist(x, y);
    if(sublist.length == 0){ return; }  //無ければreturn.

    //石を置いて関連する石を変化させる
    set_stone(x, y, sublist);
    //ターン変更
    change_turn();
    if(mode == 1){ check_1P(); }
    if(mode == 2){ check_2P(); }
})

//クリック位置がableかどうか調べてableならsublistを返す、無ければ[]を返す。
function get_sublist(x, y){
  for(var i = 0; i < hitlist.length; i++){
      if(x == hitlist[i][0][0] && y == hitlist[i][0][1]){
          return hitlist[i];
      }
  }
  return [];
}

//(x, y)に石を置いてさらに他の石を変化させる処理。
function set_stone(x, y, sublist){
    var ctx = get_ctx();
    ctx.drawImage(getImg(flag_cur), x * 40, y * 40);  //(x, y)に石を置く。
    board[y][x] = flag_cur;
    count[1 + flag_cur] += 1;
    var s = sublist.length;
    for(var i = 1; i < s; i++){
        a = sublist[i][0]; b = sublist[i][1];
        ctx.drawImage(getImg(flag_cur), a * 40, b * 40);
        board[b][a] = flag_cur;
        count[1 + flag_cur] += 1;
        count[1 - flag_cur] -= 1;
    }
}

function show_able(){
    var ctx = get_ctx();
    //まずboard[y][x] == 0 のところにfloorを設置。
    for(var x = 0; x < 8; x++){
        for(var y = 0; y < 8; y++){
            if(board[y][x] == 0){ ctx.drawImage(floor, x * 40, y * 40); }
        }
    }
    //次にhitlistの各第1成分についてableを設置。
    for(var z = 0; z < hitlist.length; z++){
        ctx.drawImage(able, hitlist[z][0][0] * 40, hitlist[z][0][1] * 40);
    }
}
//ターン変更
function change_turn(){
    flag_cur = -flag_cur;
    hitlist = hitlist_all_bw(flag_cur);
    //ここで空欄にfloorを設置してさらにhitlistの各[0]のマスにableを配置。
    show_able();
    document.getElementById("turn").innerText = turnname[1 + flag_cur];
}

function show_winner(){
    var win = 1;
    if(count[2] > count[0]){ win = 2; }
    if(count[2] < count[0]){ win = 0; }
    if(mode == 1){ win += 3; } //1Pモードの時はメッセージを変える。
    document.getElementById("turn").innerText = winner[win];
    count[1] = 1; // ゲーム終了のサイン。
}

function mode_select(){
    document.getElementById("turn").innerText = "SELECT  MODE";
}
// 1P MODEをクリックする。
document.getElementById("1P").addEventListener("click", function(e){
    //return;  //後で外す。
    if(mode > 0){ return; }
    mode = 1; init();
    document.getElementById("2P").innerText = "";
})
// 2P MODEをクリックする。
document.getElementById("2P").addEventListener("click", function(e){
    if(mode > 0){ return; }
    mode = 2; init();
    document.getElementById("1P").innerText = "";
})
// ゲーム終了時にturn表示位置をクリックする。
document.getElementById("turn").addEventListener("click", function(e){
    if(count[1] == 0){ return; }  //flagが立ってない時は何も起きない。
    document.getElementById("turn").innerText = "SELECT  MODE";
    document.getElementById("1P").innerText = "1P MODE";
    document.getElementById("2P").innerText = "2P MODE";
    mode = 0;
})
function check_1P(){
    if(hitlist.length > 0){
        var ind = get_max();  // コンピュータ動ける
        var x = hitlist[ind][0][0];
        var y = hitlist[ind][0][1];
        set_stone(x, y, hitlist[ind]);
        change_turn();
        if(hitlist.length > 0){
            return; //こっちが動けるならこっちのターン
        }else{
            change_turn();  //こっちが動けないなら再びコンピュータ
            if(hitlist.length > 0){ check_1P(); }
        }  //コンピュータも動けないなら終了処理。
    }else{
        change_turn();  //コンピュータ動けないのでチェンジ
        if(hitlist.length > 0){ return; } //こっちは動けるならこっちのターン
    }  // こっちも動けないなら終了処理。
    console.log("over.");
    show_winner();
}

// hitlistは[]でないことが前提。コンピュータの手を決める。
function get_max(){
    var r = hitlist.length;
    var ind = 0;
    for(var i = 1; i < r; i++){
        if(hitlist[ind].length < hitlist[i].length){ ind = i; }
    }
    return ind;
}

function check_2P(){
    if(hitlist.length > 0){ return; }
    //置けなかった場合は再計算し}て同じターン
    change_turn();
    if(hitlist.length > 0){ return; }
    //再び置けなかった場合は終了
    console.log("over.");
    show_winner();
}

//ゲームの初期化。
function init(){
    var ctx = get_ctx()
    ctx.drawImage(boardimage, 0, 0);
    for(var i = 0; i < 8; i++){
        for(var j = 0; j < 8; j++){
            board[i][j] = 0;
        }
    } //↑↓ボードの初期化。
    board[3][3] = -1; board[4][3] = 1; board[3][4] = 1; board[4][4] = -1;
    count = [2, 0, 2]
    flag_cur = 1;  // 先手は黒で固定。
    hitlist = hitlist_all_bw(1);  //黒の置ける位置をサーチ。
    show_able(); //置ける位置を表示。
    document.getElementById("turn").innerText = turnname[1 + flag_cur];
}
