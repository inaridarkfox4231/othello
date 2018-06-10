var boardimage = new Image();
boardimage.src = "./images/board.png"; //ゲーム盤
var black = new Image();
black.src = "./images/black.png"; // 黒
var white = new Image();
white.src = "./images/black.png"; // 白
var board = [];  // 盤面の状態を記録
for(var i = 0; i < 8; i++){
    board.push([0, 0, 0, 0, 0, 0, 0, 0]);
}
// -1が白、+1が黒。
board[3][3] = -1; board[4][3] = 1; board[3][4] = 1; board[4][4] = -1;
var black_count = 2;
var white_count = 2;

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

// canvas要素にクリックイベントのリスナーを付与。
document.getElementById("myCanvas").addEventListener("click", function(e){
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
    // (x, y)が置けるマスなら黒のチップが置かれる（予定）
    // それによりコンピューターが白のチップを置く（予定）
    // 置けなくなったら勝敗が表示される（予定）
    var ctx = get_ctx();
    ctx.drawImage(black, x * 40, y * 40);
    console.log(board[x][y]);
})

function drawboard(){
  var ctx = get_ctx()
  ctx.drawImage(boardimage, 0, 0);
}
