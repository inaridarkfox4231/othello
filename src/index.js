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
var winner = ["WHITE  WIN!!", "DRAW.", "BLACK  WIN!!"];

function getImg(flag){
    if(flag == 1){ console.log("黒"); return black; }
    console.log("白");
    return white;
}

var dx = [1, 1, 0, -1, -1, -1, 0, 1];  //x軸方向の走査
var dy = [0, 1, 1, 1, 0, -1, -1, -1];  //y軸方向の走査
var board = [];  // 盤面の状態を記録
for(var i = 0; i < 8; i++){
    board.push([0, 0, 0, 0, 0, 0, 0, 0]);
}
// -1が白、+1が黒。
board[3][3] = -1; board[4][3] = 1; board[3][4] = 1; board[4][4] = -1;
var count = [2, 0, 2] // 1 + flagで各々の個数にアクセス。

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

//hitlistは常に、その時の置ける石（黒か白）と、その石を置いたときの
//色の変わり方を保持し、石を置くたびに再計算される。
var hitlist = hitlist_all_bw(1);
var flag_cur = 1;

// canvas要素にクリックイベントのリスナーを付与。
document.getElementById("myCanvas").addEventListener("click", function(e){
    //クリック位置の計算
    var clickX = e.pageX;
    var clickY = e.pageY;
    var clientRect = this.getBoundingClientRect();
    var positionX = clientRect.left + window.pageXOffset;
    var positionY = clientRect.top + window.pageYOffset;
    var x = clickX - positionX;
    var y = clickY - positionY;
    console.log(x);
    console.log(y);
    x = Math.floor(x / 40);  // 0～7
    y = Math.floor(y / 40); // 0～7

    // (x, y)が置けるマスなら黒の石が置かれる（予定）
    // それによりコンピューターが白の石を置く（予定）
    // 置けなくなったら勝敗が表示される（予定）
    var temp = 0;
    for(var i = 0; i < hitlist.length; i++){
        if(x == hitlist[i][0][0] && y == hitlist[i][0][1]){
            temp = i; break;
        }
        temp++;
    }
    if(temp == hitlist.length){ return; }
    var sublist = hitlist[temp];

    var ctx = get_ctx();
    ctx.drawImage(getImg(flag_cur), x * 40, y * 40);

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
    //ターン変更
    change_turn();

    //置けなかった場合は再計算して同じターン
    if(hitlist.length == 0){
        change_turn();
    }else{ return; }
    //再び置けなかった場合は終了
    if(hitlist.length == 0){
        console.log("over.");
        show_winner();
    }
})

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
    document.getElementById("turn").innerText = winner[win];
}

function drawboard(){
  var ctx = get_ctx()
  ctx.drawImage(boardimage, 0, 0);
  show_able();
  document.getElementById("turn").innerText = turnname[1 + flag_cur];
}
